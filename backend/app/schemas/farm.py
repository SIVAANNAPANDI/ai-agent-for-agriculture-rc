from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class SoilCreateOrUpdate(BaseModel):
    soil_type: Optional[str] = Field("unknown", description="Clay, Sandy, Loamy, Silty, Red soil, Black soil, Laterite, unknown")
    ph: Optional[float] = Field(None, ge=3.0, le=11.0, description="Soil pH value (3.0 - 11.0)")
    organic_matter_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Organic matter percentage")
    nitrogen_n: Optional[float] = Field(None, ge=0.0, description="Available Nitrogen (kg/ha)")
    phosphorus_p: Optional[float] = Field(None, ge=0.0, description="Available Phosphorus (kg/ha)")
    potassium_k: Optional[float] = Field(None, ge=0.0, description="Available Potassium (kg/ha)")
    ec: Optional[float] = Field(None, ge=0.0, description="Electrical Conductivity (dS/m)")
    tested_at: Optional[date] = None


class SoilResponse(BaseModel):
    id: int
    soil_type: str
    ph: Optional[float] = None
    organic_matter_pct: Optional[float] = None
    nitrogen_n: Optional[float] = None
    phosphorus_p: Optional[float] = None
    potassium_k: Optional[float] = None
    ec: Optional[float] = None
    tested_at: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)


class FarmCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Farm parcel name")
    land_area: float = Field(..., gt=0.0, description="Total cultivable area")
    area_unit: str = Field("acres", description="acres, hectares, cents, bigha")
    location_name: str = Field(..., min_length=2, max_length=255, description="Village, District, State")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinate")
    water_source: Optional[str] = Field("Borewell", description="Borewell, Canal, Rainfed, Well, River")
    irrigation_method: Optional[str] = Field("Drip", description="Drip, Sprinkler, Flood, Furrow")
    
    # Optional Soil Initial Data
    soil: Optional[SoilCreateOrUpdate] = None
    current_crop_name: Optional[str] = None


class FarmUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    land_area: Optional[float] = Field(None, gt=0.0)
    area_unit: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    water_source: Optional[str] = None
    irrigation_method: Optional[str] = None


class FarmResponse(BaseModel):
    id: int
    user_id: int
    name: str
    land_area: float
    area_unit: str
    location_name: str
    latitude: float
    longitude: float
    water_source: Optional[str] = None
    irrigation_method: Optional[str] = None
    soil: Optional[SoilResponse] = None
    current_crop: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
