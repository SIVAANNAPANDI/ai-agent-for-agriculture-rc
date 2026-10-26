from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    tamil_name = Column(String(100), nullable=False)
    scientific_name = Column(String(150), nullable=True)
    category = Column(String(50), nullable=False)  # cereal, pulse, vegetable, fruit, oilseed, cash_crop, spice
    typical_duration_days = Column(Integer, nullable=False)
    water_requirement_level = Column(String(20), default="moderate", nullable=False)  # low, moderate, high
    icon_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    requirement = relationship("CropRequirement", back_populates="crop", uselist=False, cascade="all, delete-orphan")
    cultivation_cycles = relationship("CultivationCycle", back_populates="crop")
    recommendations = relationship("CropRecommendation", back_populates="crop")


class CropRequirement(Base):
    __tablename__ = "crop_requirements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    suitable_soil_types = Column(JSON, nullable=False)  # List of soil strings e.g. ["loamy", "red", "black"]
    min_ph = Column(Numeric(4, 2), nullable=True)
    max_ph = Column(Numeric(4, 2), nullable=True)
    min_temp_c = Column(Numeric(4, 1), nullable=True)
    max_temp_c = Column(Numeric(4, 1), nullable=True)
    ideal_season = Column(String(100), nullable=True)  # Kharif, Rabi, Zaid, Year-round
    estimated_input_cost_per_acre = Column(Numeric(10, 2), nullable=True)
    risk_level = Column(String(20), default="low", nullable=False)  # low, medium, high
    yield_potential_per_acre = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    crop = relationship("Crop", back_populates="requirement")
