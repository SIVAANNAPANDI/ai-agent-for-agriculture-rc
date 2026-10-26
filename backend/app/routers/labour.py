from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.labour import (
    LabourCreate,
    LabourUpdate,
    LabourAvailabilityUpdate,
    LabourResponse,
)
from app.services.labour_service import labour_service

router = APIRouter(prefix="/api/labours", tags=["Farm Labour Marketplace"])


@router.get("", response_model=List[LabourResponse])
def list_labours(
    skill: Optional[str] = Query(None, description="Filter by skill (e.g. Harvesting, Planting, Spraying)"),
    search: Optional[str] = Query(None, description="Search by worker name, location, or description"),
    status: Optional[str] = Query("AVAILABLE", description="Filter by availability ('AVAILABLE', 'BUSY', or 'all')"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves public farm worker listings with skill and keyword filtering.
    """
    effective_status = None if status == "all" else status
    return labour_service.list_labours(
        db=db,
        current_user_id=current_user.id,
        skill=skill,
        search=search,
        status=effective_status,
        skip=skip,
        limit=limit,
    )


@router.get("/my-listings", response_model=List[LabourResponse])
def list_my_labours(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves worker profiles created by the authenticated farmer.
    """
    return labour_service.list_my_labours(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/{labour_id}", response_model=LabourResponse)
def get_labour_detail(
    labour_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves complete details of a specific farm worker profile.
    """
    return labour_service.get_labour(
        db=db, labour_id=labour_id, current_user_id=current_user.id
    )


@router.post("", response_model=LabourResponse, status_code=status.HTTP_201_CREATED)
def create_labour(
    labour_in: LabourCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new farm worker or labor crew profile for hire.
    """
    return labour_service.create_labour(
        db=db, user_id=current_user.id, labour_in=labour_in
    )


@router.put("/{labour_id}", response_model=LabourResponse)
def update_labour(
    labour_id: int,
    labour_in: LabourUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates an existing worker profile. Enforces strict ownership.
    """
    return labour_service.update_labour(
        db=db, labour_id=labour_id, user_id=current_user.id, labour_in=labour_in
    )


@router.patch("/{labour_id}/availability", response_model=LabourResponse)
def update_labour_availability(
    labour_id: int,
    status_in: LabourAvailabilityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Quickly toggles worker availability (e.g. 'AVAILABLE' or 'BUSY'). Enforces strict ownership.
    """
    return labour_service.set_availability(
        db=db,
        labour_id=labour_id,
        user_id=current_user.id,
        status=status_in.availability_status,
    )


@router.delete("/{labour_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_labour(
    labour_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a worker profile. Enforces strict ownership.
    """
    labour_service.delete_labour(
        db=db, labour_id=labour_id, user_id=current_user.id
    )
    return None
