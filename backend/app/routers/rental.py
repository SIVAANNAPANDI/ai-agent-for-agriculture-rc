from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.rental import (
    RentalPropertyCreate,
    RentalPropertyUpdate,
    RentalPropertyStatusUpdate,
    RentalPropertyResponse,
)
from app.services.rental_service import rental_service

router = APIRouter(prefix="/api/rentals", tags=["Farmland & Property Rental Marketplace"])


@router.get("", response_model=List[RentalPropertyResponse])
def list_rentals(
    search: Optional[str] = Query(None, description="Search by title, location, or description"),
    water_source: Optional[str] = Query(None, description="Filter by water source (Borewell, Canal, River, etc.)"),
    soil_type: Optional[str] = Query(None, description="Filter by soil type (Red Soil, Black Soil, etc.)"),
    status: Optional[str] = Query("AVAILABLE", description="Filter by status ('AVAILABLE', 'RENTED', or 'all')"),
    min_area: Optional[float] = Query(None, ge=0, description="Minimum land area"),
    max_rent: Optional[float] = Query(None, ge=0, description="Maximum monthly rent"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves available farmland and agricultural property rental listings.
    """
    effective_status = None if status == "all" else status
    return rental_service.list_rentals(
        db=db,
        current_user_id=current_user.id,
        search=search,
        water_source=water_source,
        soil_type=soil_type,
        status=effective_status,
        min_area=min_area,
        max_rent=max_rent,
        skip=skip,
        limit=limit,
    )


@router.get("/my-rentals", response_model=List[RentalPropertyResponse])
def list_my_rentals(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves property listings created by the authenticated landowner.
    """
    return rental_service.list_my_rentals(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/{rental_id}", response_model=RentalPropertyResponse)
def get_rental_detail(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves complete details of a specific farmland rental property.
    """
    return rental_service.get_rental(
        db=db, rental_id=rental_id, current_user_id=current_user.id
    )


@router.post("", response_model=RentalPropertyResponse, status_code=status.HTTP_201_CREATED)
def create_rental(
    rental_in: RentalPropertyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new farmland or agricultural property listing for lease.
    """
    return rental_service.create_rental(
        db=db, user_id=current_user.id, rental_in=rental_in
    )


@router.put("/{rental_id}", response_model=RentalPropertyResponse)
def update_rental(
    rental_id: int,
    rental_in: RentalPropertyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates an existing rental listing. Enforces strict ownership.
    """
    return rental_service.update_rental(
        db=db, rental_id=rental_id, user_id=current_user.id, rental_in=rental_in
    )


@router.patch("/{rental_id}/status", response_model=RentalPropertyResponse)
def update_rental_status(
    rental_id: int,
    status_in: RentalPropertyStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Quickly toggles property status (AVAILABLE, RENTED). Enforces strict ownership.
    """
    return rental_service.set_status(
        db=db,
        rental_id=rental_id,
        user_id=current_user.id,
        status=status_in.status,
    )


@router.delete("/{rental_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rental(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a farmland rental listing. Enforces strict ownership.
    """
    rental_service.delete_rental(
        db=db, rental_id=rental_id, user_id=current_user.id
    )
    return None
