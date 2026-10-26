import os
import json
import argparse

import numpy as np
import tensorflow as tf
from PIL import Image


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    PROJECT_ROOT,
    "models",
    "best_leaf_disease_model.keras"
)

CLASS_NAMES_PATH = os.path.join(
    PROJECT_ROOT,
    "models",
    "class_names.json"
)

IMAGE_SIZE = (224, 224)


# ============================================================
# LOAD MODEL
# ============================================================

def load_model_and_classes():

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"\nModel not found:\n{MODEL_PATH}\n\n"
            "Train the model first using:\n"
            "python training\\train.py"
        )

    if not os.path.exists(CLASS_NAMES_PATH):
        raise FileNotFoundError(
            f"\nClass names file not found:\n{CLASS_NAMES_PATH}"
        )

    print("Loading model...")

    model = tf.keras.models.load_model(MODEL_PATH)

    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
        class_names = json.load(file)

    print("Model loaded successfully.")
    print(f"Number of classes: {len(class_names)}")

    return model, class_names


# ============================================================
# LOAD IMAGE
# ============================================================

def prepare_image(image_path):

    if not os.path.exists(image_path):
        raise FileNotFoundError(
            f"\nImage not found:\n{image_path}"
        )

    try:
        image = Image.open(image_path).convert("RGB")
    except Exception as e:
        raise ValueError(
            f"Could not read image: {e}"
        )

    # Resize to model input size
    image = image.resize(IMAGE_SIZE)

    # Convert PIL image → NumPy
    image_array = np.array(image)

    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)

    # Convert to float32
    image_array = image_array.astype(np.float32)

    return image_array


# ============================================================
# PREDICTION
# ============================================================

def predict_disease(model, class_names, image_path):

    image = prepare_image(image_path)

    print("\nAnalyzing leaf image...")
    print("--------------------------------")

    predictions = model.predict(image, verbose=0)

    probabilities = predictions[0]

    # Highest probability class
    predicted_index = np.argmax(probabilities)

    predicted_class = class_names[predicted_index]

    confidence = float(probabilities[predicted_index])

    # Top 3 predictions
    top_indices = np.argsort(probabilities)[::-1][:3]

    print("\n🌿 LEAF DISEASE ANALYSIS")
    print("================================")

    print(f"Image       : {image_path}")
    print(f"Prediction  : {predicted_class}")
    print(f"Confidence  : {confidence * 100:.2f}%")

    print("\nTop 3 Predictions:")
    print("--------------------------------")

    for rank, index in enumerate(top_indices, start=1):

        disease = class_names[index]
        probability = probabilities[index]

        print(
            f"{rank}. {disease:<45} "
            f"{probability * 100:.2f}%"
        )

    print("================================")

    # Confidence warning
    if confidence < 0.60:

        print("\n⚠️ LOW CONFIDENCE")

        print(
            "The model is not confident about this prediction."
        )

        print(
            "Please upload a clearer image of the leaf."
        )

    elif confidence < 0.80:

        print("\n⚠️ MODERATE CONFIDENCE")

        print(
            "Consider taking another clear photo "
            "for confirmation."
        )

    else:

        print("\n✅ HIGH MODEL CONFIDENCE")

    return {
        "prediction": predicted_class,
        "confidence": confidence,
        "top_predictions": [
            {
                "class": class_names[index],
                "confidence": float(probabilities[index])
            }
            for index in top_indices
        ]
    }


# ============================================================
# MAIN
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description="Plant Leaf Disease Prediction"
    )

    parser.add_argument(
        "image",
        type=str,
        help="Path to leaf image"
    )

    args = parser.parse_args()

    try:

        model, class_names = load_model_and_classes()

        result = predict_disease(
            model,
            class_names,
            args.image
        )

        print("\nJSON RESULT")
        print("--------------------------------")

        print(
            json.dumps(
                result,
                indent=4,
                ensure_ascii=False
            )
        )

    except Exception as e:

        print("\n❌ ERROR")
        print("--------------------------------")
        print(str(e))


if __name__ == "__main__":
    main()