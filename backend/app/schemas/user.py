from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class FarmerProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=120)
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    location_name: Optional[str] = Field(None, max_length=255)
    preferred_language: Optional[str] = Field(None)
    experience_years: Optional[int] = Field(None, ge=0, le=70)
    primary_crop_type: Optional[str] = Field(None, max_length=100)


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., description="Current account password")
    new_password: str = Field(..., min_length=6, max_length=100, description="New password")
    confirm_new_password: str = Field(..., description="Confirm new password")


class UserSettingsUpdate(BaseModel):
    language: Optional[str] = Field(None, description="'en' or 'ta'")
    weather_alerts_enabled: Optional[bool] = Field(None)
    task_reminders_enabled: Optional[bool] = Field(None)
    market_alerts_enabled: Optional[bool] = Field(None)
    theme_mode: Optional[str] = Field(None, description="'light' or 'dark'")


class FarmerProfileResponse(BaseModel):
    id: int
    preferred_language: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    experience_years: int
    primary_crop_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserSettingsResponse(BaseModel):
    language: str
    weather_alerts_enabled: bool
    task_reminders_enabled: bool
    market_alerts_enabled: bool
    theme_mode: str

    model_config = ConfigDict(from_attributes=True)


class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    is_active: bool
    created_at: str
    profile: Optional[FarmerProfileResponse] = None
    settings: Optional[UserSettingsResponse] = None
    farms_count: int = 0

    model_config = ConfigDict(from_attributes=True)
