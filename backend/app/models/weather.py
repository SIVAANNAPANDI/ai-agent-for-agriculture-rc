from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.database.base import Base


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), index=True, nullable=False)
    latitude = Column(Numeric(10, 7), nullable=False)
    longitude = Column(Numeric(10, 7), nullable=False)
    temperature_c = Column(Numeric(4, 1), nullable=False)
    feels_like_c = Column(Numeric(4, 1), nullable=True)
    humidity_pct = Column(Integer, nullable=False)
    wind_speed_ms = Column(Numeric(4, 1), nullable=True)
    rain_probability_pct = Column(Integer, default=0, nullable=False)
    condition_code = Column(String(50), nullable=True)
    condition_text = Column(String(100), nullable=False)
    fetched_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    # Relationship
    farm = relationship("Farm", back_populates="weather_records")
