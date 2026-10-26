from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Date
from sqlalchemy.orm import relationship
from app.database.base import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String(150), nullable=False)
    land_area = Column(Numeric(8, 2), nullable=False)
    area_unit = Column(String(20), default="acres", nullable=False)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Numeric(10, 7), nullable=False)
    longitude = Column(Numeric(10, 7), nullable=False)
    water_source = Column(String(100), nullable=True)  # Borewell, Canal, Rainfed, Well, River
    irrigation_method = Column(String(100), nullable=True)  # Drip, Sprinkler, Flood, Furrow
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="farms")
    soil = relationship("FarmSoil", back_populates="farm", uselist=False, cascade="all, delete-orphan")
    cultivation_cycles = relationship("CultivationCycle", back_populates="farm", cascade="all, delete-orphan")
    weather_records = relationship("WeatherRecord", back_populates="farm", cascade="all, delete-orphan")
    recommendations = relationship("CropRecommendation", back_populates="farm", cascade="all, delete-orphan")


class FarmSoil(Base):
    __tablename__ = "farm_soils"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    soil_type = Column(String(50), default="unknown", nullable=False)  # clay, sandy, loamy, silty, red, black, laterite, unknown
    ph = Column(Numeric(4, 2), nullable=True)
    organic_matter_pct = Column(Numeric(4, 2), nullable=True)
    nitrogen_n = Column(Numeric(6, 2), nullable=True)  # kg/ha
    phosphorus_p = Column(Numeric(6, 2), nullable=True)
    potassium_k = Column(Numeric(6, 2), nullable=True)
    ec = Column(Numeric(6, 2), nullable=True)  # Electrical conductivity dS/m
    tested_at = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    farm = relationship("Farm", back_populates="soil")
