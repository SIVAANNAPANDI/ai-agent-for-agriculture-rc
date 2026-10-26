from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base


class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), index=True, nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), index=True, nullable=False)
    suitability_score = Column(Integer, nullable=False)  # 0 to 100
    soil_match_reason = Column(Text, nullable=False)
    weather_match_reason = Column(Text, nullable=False)
    water_match_reason = Column(Text, nullable=False)
    risk_assessment = Column(String(100), nullable=False)
    input_cost_estimate = Column(String(100), nullable=False)
    ai_summary = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="recommendations")
    crop = relationship("Crop", back_populates="recommendations")
