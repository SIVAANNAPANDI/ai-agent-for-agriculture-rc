from datetime import date
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class RentalPropertyCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200, description="Title of rental listing")
    owner_name: str = Field(..., min_length=2, max_length=150, description="Landowner or manager name")
    phone: str = Field(..., min_length=10, max_length=20, description="Contact phone number")
    land_area: float = Field(..., gt=0, description="Land area number")
    area_unit: str = Field("acres", max_length=20, description="Unit e.g. acres, cents, hectares")
    monthly_rent: float = Field(..., gt=0, description="Monthly rental amount in INR")
    location_name: str = Field(..., min_length=2, max_length=255, description="Village, taluk, or district")
    latitude: Optional[float] = Field(11.1085, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(77.3411, ge=-180.0, le=180.0)
    available_from: date = Field(..., description="Date available from (YYYY-MM-DD)")
    available_until: Optional[date] = Field(None, description="Date available until (YYYY-MM-DD)")
    water_source: Optional[str] = Field(None, max_length=100, description="Water source e.g. Borewell, Canal, River, Rainfed, Open Well")
    soil_type: Optional[str] = Field(None, max_length=100, description="Soil type e.g. Red Soil, Black Soil, Clay Loam, Alluvial")
    description: Optional[str] = Field(None, max_length=2000, description="Details on fencing, road access, electricity, pump HP")
    images: Optional[List[str]] = Field(default=[], description="List of image URLs or paths")


class RentalPropertyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    owner_name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    land_area: Optional[float] = Field(None, gt=0)
    area_unit: Optional[str] = Field(None, max_length=20)
    monthly_rent: Optional[float] = Field(None, gt=0)
    location_name: Optional[str] = Field(None, min_length=2, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    available_from: Optional[date] = None
    available_until: Optional[date] = None
    water_source: Optional[str] = Field(None, max_length=100)
    soil_type: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
    images: Optional[List[str]] = None
    status: Optional[str] = Field(None, max_length=20)  # AVAILABLE, RENTED, INACTIVE


class RentalPropertyStatusUpdate(BaseModel):
    status: str = Field(..., description="AVAILABLE, RENTED, or INACTIVE")


class RentalPropertyResponse(BaseModel):
    id: int
    user_id: int
    poster_name: str
    owner_name: str
    phone: str
    title: str
    land_area: float
    area_unit: str
    monthly_rent: float
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    available_from: str
    available_until: Optional[str] = None
    water_source: Optional[str] = None
    soil_type: Optional[str] = None
    description: Optional[str] = None
    images: List[str] = []
    status: str
    created_at: str
    updated_at: str
    is_owner: bool = False

    model_config = ConfigDict(from_attributes=True)
