import json
import os
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException, NotFoundException, ForbiddenException
from app.middleware.security import validate_image_magic_bytes
from app.repositories.disease_repo import disease_repo
from app.schemas.disease import DiseaseDiagnosisResponse, DiseaseHistoryItem, CandidateClassItem
from ml.inference.engine import get_inference_engine
from ml.inference.advisory import get_disease_advisory

# Static uploads directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BACKEND_DIR / "uploads" / "leaves"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


class DiseaseService:
    def __init__(self):
        self.engine = get_inference_engine()

    async def predict_leaf_disease(
        self,
        db: Session,
        user_id: int,
        file: UploadFile,
        language: str = "en"
    ) -> DiseaseDiagnosisResponse:
        # 1. Validate file extension and MIME type
        filename = file.filename or "upload.jpg"
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS or file.content_type not in ALLOWED_MIME_TYPES:
            raise BadRequestException(
                "Invalid image format. Supported formats are JPG, JPEG, PNG, and WebP."
                if language != "ta" else
                "தவறான பட வடிவம். JPG, JPEG, PNG, மற்றும் WebP வடிவங்களை மட்டுமே பதிவேற்றவும்."
            )

        # 2. Read bytes and validate size
        content = await file.read()
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise BadRequestException(
                "Image file size exceeds the 10MB limit."
                if language != "ta" else
                "படத்தின் அளவு 10MB வரம்பை தாண்டியுள்ளது."
            )

        if len(content) < 500:
            raise BadRequestException(
                "Image file is empty or corrupted."
                if language != "ta" else
                "படக் கோப்பு காலியாக அல்லது சேதமடைந்துள்ளது."
            )

        # 3. Validate image magic bytes to prevent masquerading files
        if not validate_image_magic_bytes(content):
            raise BadRequestException(
                "Corrupted or invalid image binary header. Please upload an authentic JPG, PNG, or WebP photo."
                if language != "ta" else
                "தவறான அல்லது சேதமடைந்த படக் கோப்பு. உண்மையான JPG, PNG அல்லது WebP புகைப்படத்தை பதிவேற்றவும்."
            )

        # 4. Save file locally with secure random UUID filename
        saved_filename = f"{uuid.uuid4().hex}{ext}"
        saved_path = UPLOADS_DIR / saved_filename
        with open(saved_path, "wb") as f:
            f.write(content)

        relative_url = f"/uploads/leaves/{saved_filename}"

        # 4. Execute ML Inference
        prediction_result = self.engine.predict(content, language=language)

        # 5. Build explanation & recommended actions for database record
        ai_explanation = json.dumps({
            "pathogen": prediction_result["pathogen"],
            "symptoms": prediction_result["symptoms"],
            "warning": prediction_result.get("warning")
        })

        recommended_action = json.dumps({
            "organic_treatment": prediction_result["organic_treatment"],
            "chemical_treatment": prediction_result["chemical_treatment"],
            "preventive_measures": prediction_result["preventive_measures"],
        })

        # 6. Save prediction in database
        record = disease_repo.create_prediction(
            db=db,
            user_id=user_id,
            image_path=relative_url,
            predicted_class=prediction_result["predicted_class"],
            crop_name=prediction_result["crop_name"],
            disease_name=prediction_result["disease_name"],
            confidence=prediction_result["confidence"],
            ai_explanation=ai_explanation,
            recommended_action=recommended_action,
        )

        return DiseaseDiagnosisResponse(
            id=record.id,
            predicted_class=prediction_result["predicted_class"],
            crop_name=prediction_result["crop_name"],
            disease_name=prediction_result["disease_name"],
            display_name=prediction_result["display_name"],
            pathogen=prediction_result["pathogen"],
            confidence=prediction_result["confidence"],
            confidence_pct=prediction_result["confidence_pct"],
            is_healthy=prediction_result["is_healthy"],
            severity=prediction_result["severity"],
            is_low_confidence=prediction_result["is_low_confidence"],
            warning=prediction_result.get("warning"),
            symptoms=prediction_result["symptoms"],
            organic_treatment=prediction_result["organic_treatment"],
            chemical_treatment=prediction_result["chemical_treatment"],
            preventive_measures=prediction_result["preventive_measures"],
            top_candidates=[
                CandidateClassItem(**tc) for tc in prediction_result["top_candidates"]
            ],
            image_url=relative_url,
            created_at=record.created_at.isoformat() if record.created_at else None,
        )

    def get_history(self, db: Session, user_id: int, limit: int = 30) -> List[DiseaseHistoryItem]:
        records = disease_repo.get_history(db, user_id, limit)
        history = []
        for r in records:
            adv = get_disease_advisory(r.predicted_class, language="en")
            conf_val = float(r.confidence)
            history.append(
                DiseaseHistoryItem(
                    id=r.id,
                    crop_name=r.crop_name,
                    disease_name=r.disease_name,
                    predicted_class=r.predicted_class,
                    confidence=round(conf_val, 4),
                    confidence_pct=round(conf_val * 100, 1),
                    severity=adv["severity"],
                    is_healthy=adv["is_healthy"],
                    image_url=r.image_path,
                    created_at=r.created_at.isoformat() if r.created_at else "",
                )
            )
        return history

    def get_prediction_detail(
        self, db: Session, prediction_id: int, user_id: int, language: str = "en"
    ) -> DiseaseDiagnosisResponse:
        record = disease_repo.get_by_id(db, prediction_id)
        if not record:
            raise NotFoundException("Diagnostic scan record not found.")

        # Strict Ownership Isolation
        if record.user_id != user_id:
            raise ForbiddenException("You do not have permission to access this diagnostic report.")

        adv = get_disease_advisory(record.predicted_class, language=language)
        conf_val = float(record.confidence)
        is_low_conf = (conf_val < 0.60)

        # Unpack stored explanation/actions if available
        symptoms = adv["symptoms"]
        organic_treatment = adv["organic_treatment"]
        chemical_treatment = adv["chemical_treatment"]
        preventive_measures = adv["preventive_measures"]

        return DiseaseDiagnosisResponse(
            id=record.id,
            predicted_class=record.predicted_class,
            crop_name=adv["crop"],
            disease_name=adv["disease_name"],
            display_name=adv["display_name"],
            pathogen=adv["pathogen"],
            confidence=round(conf_val, 4),
            confidence_pct=round(conf_val * 100, 1),
            is_healthy=adv["is_healthy"],
            severity=adv["severity"],
            is_low_confidence=is_low_conf,
            warning=(
                "Diagnosis confidence is below 60%. Please recapture a clear close-up leaf photo."
                if is_low_conf else None
            ),
            symptoms=symptoms,
            organic_treatment=organic_treatment,
            chemical_treatment=chemical_treatment,
            preventive_measures=preventive_measures,
            top_candidates=[
                CandidateClassItem(
                    class_name=record.predicted_class,
                    crop=adv["crop"],
                    disease_name=adv["disease_name"],
                    display_name=adv["display_name"],
                    confidence=round(conf_val, 4),
                    confidence_pct=round(conf_val * 100, 1),
                )
            ],
            image_url=record.image_path,
            created_at=record.created_at.isoformat() if record.created_at else None,
        )


disease_service = DiseaseService()
