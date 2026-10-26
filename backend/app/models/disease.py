from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from app.database.base import Base


class DiseasePrediction(Base):
    __tablename__ = "disease_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    image_path = Column(String(255), nullable=False)
    model_name = Column(String(100), default="EfficientNetB0", nullable=False)
    model_version = Column(String(50), default="leaf-disease-v1", nullable=False)
    predicted_class = Column(String(120), nullable=False)
    crop_name = Column(String(100), nullable=False)
    disease_name = Column(String(120), nullable=False)
    confidence = Column(Numeric(5, 4), nullable=False)  # e.g. 0.9421
    ai_explanation = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    # Relationship
    user = relationship("User", back_populates="disease_predictions")
