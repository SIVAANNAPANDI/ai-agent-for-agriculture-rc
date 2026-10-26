from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base


class MarketProduct(Base):
    __tablename__ = "market_products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(50), index=True, nullable=False)  # Vegetables, Fruits, Grains, Seeds, Equipment, Organic, Other
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20), default="kg", nullable=False)  # kg, quintal, bag, bunch, ton
    price_per_unit = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=True)
    seller_phone = Column(String(20), nullable=False)
    status = Column(String(20), default="AVAILABLE", index=True, nullable=False)  # AVAILABLE, SOLD, DELISTED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    seller = relationship("User", back_populates="market_products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    location = relationship("ProductLocation", back_populates="product", uselist=False, cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("market_products.id", ondelete="CASCADE"), index=True, nullable=False)
    image_url = Column(String(255), nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    product = relationship("MarketProduct", back_populates="images")


class ProductLocation(Base):
    __tablename__ = "product_locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("market_products.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Numeric(10, 7), nullable=False)
    longitude = Column(Numeric(10, 7), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    product = relationship("MarketProduct", back_populates="location")
