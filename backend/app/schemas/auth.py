from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120, description="Farmer Full Name")
    email: EmailStr = Field(..., description="Valid Email Address")
    phone: str = Field(..., min_length=10, max_length=15, description="Mobile Phone Number")
    password: str = Field(..., min_length=6, max_length=100, description="Password (at least 6 characters)")
    confirm_password: str = Field(..., description="Confirmation Password")
    location: Optional[str] = Field("Erode, Tamil Nadu", max_length=255, description="Primary Farm Location")
    preferred_language: Optional[str] = Field("en", description="Preferred language ('en' or 'ta')")

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v

    @field_validator("preferred_language")
    @classmethod
    def validate_language(cls, v: str):
        if v not in ["en", "ta"]:
            return "en"
        return v


class LoginRequest(BaseModel):
    email_or_username: str = Field(..., description="Email or registered mobile phone number")
    password: str = Field(..., description="Account password")
    remember_me: Optional[bool] = Field(True, description="Remember login session")


class UserBasicResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    preferred_language: str
    location: Optional[str] = None
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserBasicResponse
