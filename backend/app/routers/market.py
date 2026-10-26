from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.market import (
    MarketProductCreate,
    MarketProductUpdate,
    MarketProductStatusUpdate,
    MarketProductResponse,
)
from app.services.market_service import market_service

router = APIRouter(prefix="/api/market", tags=["Farmer Marketplace"])


@router.get("/products", response_model=List[MarketProductResponse])
def list_market_products(
    category: Optional[str] = Query(None, description="Category filter (Vegetables, Fruits, Grains, etc.)"),
    search: Optional[str] = Query(None, description="Keyword search across title, description, category"),
    status: Optional[str] = Query("AVAILABLE", description="Filter by status ('AVAILABLE', 'SOLD', or 'all')"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves public marketplace product listings across all registered farmers.
    """
    effective_status = None if status == "all" else status
    return market_service.list_products(
        db=db,
        current_user_id=current_user.id,
        category=category,
        search=search,
        status=effective_status,
        skip=skip,
        limit=limit,
    )


@router.get("/my-products", response_model=List[MarketProductResponse])
def list_my_market_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves all product listings posted by the authenticated farmer.
    """
    return market_service.list_my_products(
        db=db, seller_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/products/{product_id}", response_model=MarketProductResponse)
def get_market_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves complete details of a specific produce listing.
    """
    return market_service.get_product(
        db=db, product_id=product_id, current_user_id=current_user.id
    )


@router.post("/products", response_model=MarketProductResponse, status_code=status.HTTP_201_CREATED)
def create_market_product(
    product_in: MarketProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new commodity listing for sale in the community marketplace.
    """
    return market_service.create_product(
        db=db, seller_id=current_user.id, product_in=product_in
    )


@router.put("/products/{product_id}", response_model=MarketProductResponse)
def update_market_product(
    product_id: int,
    product_in: MarketProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates an existing produce listing. Enforces strict seller ownership.
    """
    return market_service.update_product(
        db=db, product_id=product_id, seller_id=current_user.id, product_in=product_in
    )


@router.patch("/products/{product_id}/status", response_model=MarketProductResponse)
def update_product_status(
    product_id: int,
    status_in: MarketProductStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Quick status toggle (e.g. mark as 'SOLD' or 'AVAILABLE'). Enforces strict seller ownership.
    """
    return market_service.mark_status(
        db=db, product_id=product_id, seller_id=current_user.id, status=status_in.status
    )


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_market_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a produce listing. Enforces strict seller ownership.
    """
    market_service.delete_product(
        db=db, product_id=product_id, seller_id=current_user.id
    )
    return None
