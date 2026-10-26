"""
AgriAssist Plant Disease Inference Engine
Loads the EfficientNetB0 Keras model and classifies plant leaf diseases with
confidence scoring, top candidate distributions, and agronomic advisory mapping.
"""

import io
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
from PIL import Image

from ml.inference.advisory import get_disease_advisory

logger = logging.getLogger("agriassist.ml.inference")

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "best_leaf_disease_model.keras"
CLASS_NAMES_PATH = BASE_DIR / "models" / "class_names.json"

CONFIDENCE_THRESHOLD = 0.60  # 60% confidence gate


class DiseaseInferenceEngine:
    _instance: Optional["DiseaseInferenceEngine"] = None
    _model = None
    _class_names: List[str] = []

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DiseaseInferenceEngine, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Loads class labels and TensorFlow Keras model."""
        try:
            # 1. Load class names
            if CLASS_NAMES_PATH.exists():
                with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
                    self._class_names = json.load(f)
                logger.info(f"Loaded {len(self._class_names)} disease classes.")
            else:
                logger.error(f"Class names file not found at {CLASS_NAMES_PATH}")

            # 2. Load Keras model
            if MODEL_PATH.exists():
                logger.info(f"Loading EfficientNetB0 leaf disease model from {MODEL_PATH}...")
                import keras
                self._model = keras.models.load_model(str(MODEL_PATH))
                logger.info("Leaf disease model loaded successfully into memory.")
            else:
                logger.error(f"Model file not found at {MODEL_PATH}")
        except Exception as e:
            logger.error(f"Failed to initialize leaf disease model: {e}")
            self._model = None

    @property
    def is_ready(self) -> bool:
        return self._model is not None and len(self._class_names) > 0

    def preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Validates, opens, converts to RGB, and resizes leaf image to (224, 224, 3).
        EfficientNet model expects raw RGB float array of shape (1, 224, 224, 3).
        """
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Resize to standard model input dimensions
        img = img.resize((224, 224), Image.Resampling.LANCZOS)
        img_arr = np.array(img, dtype=np.float32)
        # Add batch dimension: (1, 224, 224, 3)
        return np.expand_dims(img_arr, axis=0)

    def predict(self, image_bytes: bytes, language: str = "en") -> Dict[str, Any]:
        """
        Executes model inference on image bytes and synthesizes agronomic advisory.
        """
        if not self.is_ready:
            raise RuntimeError("Disease detection ML model is not loaded.")

        # Preprocess image
        input_tensor = self.preprocess_image(image_bytes)

        # Run inference
        raw_preds = self._model.predict(input_tensor, verbose=0)[0]

        # Top predicted class
        top_idx = int(np.argmax(raw_preds))
        top_class = self._class_names[top_idx]
        top_confidence = float(raw_preds[top_idx])

        # Top 3 candidate classes
        top_3_indices = np.argsort(raw_preds)[::-1][:3]
        top_candidates = []
        for idx in top_3_indices:
            c_name = self._class_names[idx]
            adv = get_disease_advisory(c_name, language)
            top_candidates.append({
                "class_name": c_name,
                "crop": adv["crop"],
                "disease_name": adv["disease_name"],
                "display_name": adv["display_name"],
                "confidence": round(float(raw_preds[idx]), 4),
                "confidence_pct": round(float(raw_preds[idx]) * 100, 1),
            })

        # Advisory for top diagnosis
        advisory = get_disease_advisory(top_class, language)

        # Confidence gate check (<60% prompts retake)
        is_low_confidence = (top_confidence < CONFIDENCE_THRESHOLD)

        return {
            "predicted_class": top_class,
            "crop_name": advisory["crop"],
            "disease_name": advisory["disease_name"],
            "display_name": advisory["display_name"],
            "pathogen": advisory["pathogen"],
            "confidence": round(top_confidence, 4),
            "confidence_pct": round(top_confidence * 100, 1),
            "is_healthy": advisory["is_healthy"],
            "severity": advisory["severity"],
            "is_low_confidence": is_low_confidence,
            "symptoms": advisory["symptoms"],
            "organic_treatment": advisory["organic_treatment"],
            "chemical_treatment": advisory["chemical_treatment"],
            "preventive_measures": advisory["preventive_measures"],
            "top_candidates": top_candidates,
            "warning": (
                "Diagnosis confidence is below 60%. Please ensure the photo is taken in bright daylight, focused on a single leaf with clearly visible spots."
                if (is_low_confidence and language != "ta") else
                "கண்டறிதல் துல்லியம் 60%-க்கும் குறைவாக உள்ளது. தயவுசெய்து நல்ல பகல் வெளிச்சத்தில், நோய் தாக்கிய இலையை தெளிவாக புகைப்படம் எடுத்து மீண்டும் சமர்ப்பிக்கவும்."
                if (is_low_confidence and language == "ta") else None
            )
        }


def get_inference_engine() -> DiseaseInferenceEngine:
    """Returns the singleton instance of DiseaseInferenceEngine."""
    return DiseaseInferenceEngine()
