from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    farms = relationship("Farm", back_populates="user", cascade="all, delete-orphan")
    ai_conversations = relationship("AIConversation", back_populates="user", cascade="all, delete-orphan")
    disease_predictions = relationship("DiseasePrediction", back_populates="user", cascade="all, delete-orphan")
    market_products = relationship("MarketProduct", back_populates="seller", cascade="all, delete-orphan")
    labour_listings = relationship("Labour", back_populates="user", cascade="all, delete-orphan")
    rental_properties = relationship("RentalProperty", back_populates="owner", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preferred_language = Column(String(10), default="en", nullable=False)  # 'en' or 'ta'
    location_name = Column(String(255), nullable=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    experience_years = Column(Integer, default=0, nullable=False)
    primary_crop_type = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="profile")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    weather_alerts_enabled = Column(Boolean, default=True, nullable=False)
    task_reminders_enabled = Column(Boolean, default=True, nullable=False)
    market_alerts_enabled = Column(Boolean, default=True, nullable=False)
    theme_mode = Column(String(20), default="light", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="settings")
