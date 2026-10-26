from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse, SoilCreateOrUpdate, SoilResponse
from app.services.farm_service import FarmService

router = APIRouter(prefix="/api/farms", tags=["Farms"])


@router.get("", response_model=List[FarmResponse])
def get_user_farms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all farms owned by the authenticated farmer."""
    return FarmService.list_farms(db, current_user)


@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(
    payload: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register a new farm parcel with coordinates, irrigation, and optional soil data."""
    return FarmService.create_farm(db, current_user, payload)


@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details and soil profile of a specific farm parcel."""
    return FarmService.get_farm(db, farm_id, current_user)


@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(
    farm_id: int,
    payload: FarmUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update farm parcel properties (area, irrigation, coordinates, etc.)."""
    return FarmService.update_farm(db, farm_id, current_user, payload)


@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a farm parcel and associated soil profile."""
    FarmService.delete_farm(db, farm_id, current_user)
    return None


@router.put("/{farm_id}/soil", response_model=SoilResponse)
def update_farm_soil(
    farm_id: int,
    payload: SoilCreateOrUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update or log soil health test parameters (pH, N, P, K, organic matter)."""
    return FarmService.update_soil(db, farm_id, current_user, payload)
