from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.disease import DiseasePrediction


class DiseaseRepository:
    def create_prediction(
        self,
        db: Session,
        user_id: int,
        image_path: str,
        predicted_class: str,
        crop_name: str,
        disease_name: str,
        confidence: float,
        ai_explanation: Optional[str] = None,
        recommended_action: Optional[str] = None,
    ) -> DiseasePrediction:
        prediction = DiseasePrediction(
            user_id=user_id,
            image_path=image_path,
            model_name="EfficientNetB0",
            model_version="plantvillage-15class-v1",
            predicted_class=predicted_class,
            crop_name=crop_name,
            disease_name=disease_name,
            confidence=confidence,
            ai_explanation=ai_explanation,
            recommended_action=recommended_action,
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        return prediction

    def get_history(self, db: Session, user_id: int, limit: int = 30) -> List[DiseasePrediction]:
        return (
            db.query(DiseasePrediction)
            .filter(DiseasePrediction.user_id == user_id)
            .order_by(DiseasePrediction.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_by_id(self, db: Session, prediction_id: int, user_id: Optional[int] = None) -> Optional[DiseasePrediction]:
        query = db.query(DiseasePrediction).filter(DiseasePrediction.id == prediction_id)
        if user_id is not None:
            query = query.filter(DiseasePrediction.user_id == user_id)
        return query.first()

    def delete_prediction(self, db: Session, prediction_id: int, user_id: int) -> bool:
        record = self.get_by_id(db, prediction_id, user_id)
        if record:
            db.delete(record)
            db.commit()
            return True
        return False


disease_repo = DiseaseRepository()
