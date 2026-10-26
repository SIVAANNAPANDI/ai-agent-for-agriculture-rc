from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class LabourCreate(BaseModel):
    worker_name: str = Field(..., min_length=2, max_length=150, description="Worker or crew leader name")
    phone: str = Field(..., min_length=10, max_length=20, description="Mobile contact number")
    skills: List[str] = Field(..., min_length=1, description="List of agricultural skills")
    experience_years: int = Field(1, ge=0, le=50, description="Years of agricultural labor experience")
    daily_wage: float = Field(..., gt=0, description="Standard daily wage rate in INR")
    location_name: str = Field(..., min_length=2, max_length=255, description="Village, town, or district location")
    latitude: Optional[float] = Field(11.1085, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(77.3411, ge=-180.0, le=180.0)
    description: Optional[str] = Field(None, max_length=1000, description="Specialized equipment, team size, availability hours")


class LabourUpdate(BaseModel):
    worker_name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    skills: Optional[List[str]] = Field(None, min_length=1)
    experience_years: Optional[int] = Field(None, ge=0, le=50)
    daily_wage: Optional[float] = Field(None, gt=0)
    location_name: Optional[str] = Field(None, min_length=2, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    availability_status: Optional[str] = Field(None, max_length=20)  # AVAILABLE, BUSY, INACTIVE
    description: Optional[str] = Field(None, max_length=1000)


class LabourAvailabilityUpdate(BaseModel):
    availability_status: str = Field(..., description="AVAILABLE, BUSY, or INACTIVE")


class LabourResponse(BaseModel):
    id: int
    user_id: int
    poster_name: str
    worker_name: str
    phone: str
    skills: List[str]
    experience_years: int
    daily_wage: float
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    availability_status: str
    description: Optional[str] = None
    created_at: str
    updated_at: str
    is_owner: bool = False

    model_config = ConfigDict(from_attributes=True)
