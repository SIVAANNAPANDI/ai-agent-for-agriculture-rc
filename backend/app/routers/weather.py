from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.repositories.farm_repo import FarmRepository
from app.core.exceptions import NotFoundException, ForbiddenException
from app.schemas.weather import WeatherCurrentResponse, WeatherForecastResponse
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/api/weather", tags=["Weather Intelligence"])


@router.get("/current", response_model=WeatherCurrentResponse)
async def get_current_weather(
    lat: Optional[float] = Query(None, ge=-90.0, le=90.0, description="Latitude coordinate"),
    lon: Optional[float] = Query(None, ge=-180.0, le=180.0, description="Longitude coordinate"),
    location_name: Optional[str] = Query(None, description="Optional city or village name")
):
    """Retrieve current microclimate weather and agricultural decision advisories for GPS coordinates or city."""
    return await WeatherService.get_current_weather(lat, lon, location_name)


@router.get("/forecast", response_model=WeatherForecastResponse)
async def get_weather_forecast(
    lat: Optional[float] = Query(None, ge=-90.0, le=90.0, description="Latitude coordinate"),
    lon: Optional[float] = Query(None, ge=-180.0, le=180.0, description="Longitude coordinate"),
    location_name: Optional[str] = Query(None, description="Optional city or village name")
):
    """Retrieve 5-day / 3-hour microclimate forecast and day-by-day agronomic advisories."""
    return await WeatherService.get_forecast(lat, lon, location_name)


@router.get("/farm/{farm_id}", response_model=WeatherForecastResponse)
async def get_farm_weather(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve microclimate weather and advisories calibrated specifically to a registered farm parcel."""
    farm = FarmRepository.get_by_id(db, farm_id)
    if not farm:
        raise NotFoundException(f"Farm with id {farm_id} does not exist.")

    if farm.user_id != current_user.id:
        raise ForbiddenException("You do not have permission to access weather for this farm.")

    return await WeatherService.get_forecast(
        lat=float(farm.latitude),
        lon=float(farm.longitude),
        location_name=farm.location_name
    )
