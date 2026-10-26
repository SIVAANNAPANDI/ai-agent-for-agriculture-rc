from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ProductLocationBase(BaseModel):
    location_name: str = Field(..., max_length=255)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)


class MarketProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Produce or commodity name")
    category: str = Field(..., max_length=50, description="Vegetables, Fruits, Grains & Cereals, Pulses & Oilseeds, Dairy & Poultry, Organic Inputs / Seeds, Other")
    quantity: float = Field(..., gt=0, description="Quantity available for sale")
    unit: str = Field("kg", max_length=20, description="Unit (kg, quintal, ton, bag, crate, bunch)")
    price_per_unit: float = Field(..., gt=0, description="Price in INR per unit")
    description: Optional[str] = Field(None, max_length=2000, description="Crop variety, quality grade, harvesting date")
    seller_phone: str = Field(..., min_length=10, max_length=20, description="Contact phone for buyer inquiries")
    location_name: Optional[str] = Field("Farm Location", max_length=255)
    latitude: Optional[float] = Field(11.1085, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(77.3411, ge=-180.0, le=180.0)
    image_url: Optional[str] = Field(None, max_length=255)


class MarketProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    category: Optional[str] = Field(None, max_length=50)
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = Field(None, max_length=20)
    price_per_unit: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, max_length=2000)
    seller_phone: Optional[str] = Field(None, min_length=10, max_length=20)
    status: Optional[str] = Field(None, max_length=20)  # AVAILABLE, SOLD, DELISTED
    location_name: Optional[str] = Field(None, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    image_url: Optional[str] = Field(None, max_length=255)


class MarketProductStatusUpdate(BaseModel):
    status: str = Field(..., description="AVAILABLE or SOLD")


class MarketProductResponse(BaseModel):
    id: int
    seller_id: int
    seller_name: str
    name: str
    category: str
    quantity: float
    unit: str
    price_per_unit: float
    total_value: float
    description: Optional[str] = None
    seller_phone: str
    status: str
    created_at: str
    updated_at: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    is_owner: bool = False

    model_config = ConfigDict(from_attributes=True)
