from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class Labour(Base):
    __tablename__ = "labours"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    worker_name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=False)
    skills = Column(JSON, nullable=False)  # Array of strings: Planting, Harvesting, Weeding, Irrigation, Spraying, Ploughing, Machinery
    experience_years = Column(Integer, default=1, nullable=False)
    daily_wage = Column(Numeric(8, 2), nullable=False)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    availability_status = Column(String(20), default="AVAILABLE", index=True, nullable=False)  # AVAILABLE, BUSY, INACTIVE
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="labour_listings")
