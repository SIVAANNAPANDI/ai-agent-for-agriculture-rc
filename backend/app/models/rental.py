from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text, Date, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class RentalProperty(Base):
    __tablename__ = "rental_properties"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(200), nullable=False)
    owner_name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=False)
    land_area = Column(Numeric(8, 2), nullable=False)
    area_unit = Column(String(20), default="acres", nullable=False)
    monthly_rent = Column(Numeric(10, 2), nullable=False)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Numeric(10, 7), nullable=False)
    longitude = Column(Numeric(10, 7), nullable=False)
    available_from = Column(Date, nullable=False)
    available_until = Column(Date, nullable=True)
    water_source = Column(String(100), nullable=True)  # Borewell, Canal, River, Rainfed
    soil_type = Column(String(100), nullable=True)  # Red soil, Black soil, Loamy, etc.
    description = Column(Text, nullable=True)
    images = Column(JSON, nullable=True)  # Array of image URLs
    status = Column(String(20), default="AVAILABLE", index=True, nullable=False)  # AVAILABLE, RENTED, INACTIVE
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    owner = relationship("User", back_populates="rental_properties")
