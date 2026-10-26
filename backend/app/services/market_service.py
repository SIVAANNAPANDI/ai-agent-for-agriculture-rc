from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.market import MarketProduct
from app.models.user import User
from app.repositories.market_repo import market_repo
from app.schemas.market import (
    MarketProductCreate,
    MarketProductUpdate,
    MarketProductResponse,
)


class MarketService:
    def _to_response(
        self, product: MarketProduct, current_user_id: Optional[int] = None
    ) -> MarketProductResponse:
        qty = float(product.quantity)
        price = float(product.price_per_unit)
        total_val = round(qty * price, 2)

        loc_name = product.location.location_name if product.location else None
        lat = float(product.location.latitude) if product.location else None
        lon = float(product.location.longitude) if product.location else None

        img_url = None
        if product.images and len(product.images) > 0:
            img_url = product.images[0].image_url

        seller_name = product.seller.name if product.seller else "Farmer"

        return MarketProductResponse(
            id=product.id,
            seller_id=product.seller_id,
            seller_name=seller_name,
            name=product.name,
            category=product.category,
            quantity=qty,
            unit=product.unit,
            price_per_unit=price,
            total_value=total_val,
            description=product.description,
            seller_phone=product.seller_phone,
            status=product.status,
            created_at=product.created_at.isoformat() if product.created_at else "",
            updated_at=product.updated_at.isoformat() if product.updated_at else "",
            location_name=loc_name,
            latitude=lat,
            longitude=lon,
            image_url=img_url,
            is_owner=(product.seller_id == current_user_id) if current_user_id else False,
        )

    def list_products(
        self,
        db: Session,
        current_user_id: Optional[int] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        status: Optional[str] = "AVAILABLE",
        skip: int = 0,
        limit: int = 50,
    ) -> List[MarketProductResponse]:
        products = market_repo.get_products(
            db=db,
            category=category,
            search=search,
            status=status,
            skip=skip,
            limit=limit,
        )
        return [self._to_response(p, current_user_id) for p in products]

    def list_my_products(
        self, db: Session, seller_id: int, skip: int = 0, limit: int = 50
    ) -> List[MarketProductResponse]:
        products = market_repo.get_my_products(db=db, seller_id=seller_id, skip=skip, limit=limit)
        return [self._to_response(p, seller_id) for p in products]

    def get_product(
        self, db: Session, product_id: int, current_user_id: Optional[int] = None
    ) -> MarketProductResponse:
        product = market_repo.get_by_id(db, product_id)
        if not product:
            raise NotFoundException("Marketplace product listing not found.")
        return self._to_response(product, current_user_id)

    def create_product(
        self, db: Session, seller_id: int, product_in: MarketProductCreate
    ) -> MarketProductResponse:
        product = market_repo.create(db=db, seller_id=seller_id, product_in=product_in)
        return self._to_response(product, seller_id)

    def update_product(
        self, db: Session, product_id: int, seller_id: int, product_in: MarketProductUpdate
    ) -> MarketProductResponse:
        product = market_repo.get_by_id(db, product_id)
        if not product:
            raise NotFoundException("Marketplace product listing not found.")

        # Strict Ownership Isolation
        if product.seller_id != seller_id:
            raise ForbiddenException("You do not have permission to modify this listing.")

        updated = market_repo.update(db=db, product=product, product_in=product_in)
        return self._to_response(updated, seller_id)

    def mark_status(
        self, db: Session, product_id: int, seller_id: int, status: str
    ) -> MarketProductResponse:
        if status not in ["AVAILABLE", "SOLD", "DELISTED"]:
            raise BadRequestException("Invalid status. Supported statuses are AVAILABLE, SOLD, DELISTED.")

        product = market_repo.get_by_id(db, product_id)
        if not product:
            raise NotFoundException("Marketplace product listing not found.")

        # Strict Ownership Isolation
        if product.seller_id != seller_id:
            raise ForbiddenException("You do not have permission to change this listing status.")

        product.status = status
        db.commit()
        db.refresh(product)
        return self._to_response(product, seller_id)

    def delete_product(self, db: Session, product_id: int, seller_id: int):
        product = market_repo.get_by_id(db, product_id)
        if not product:
            raise NotFoundException("Marketplace product listing not found.")

        # Strict Ownership Isolation
        if product.seller_id != seller_id:
            raise ForbiddenException("You do not have permission to delete this listing.")

        market_repo.delete(db, product)


market_service = MarketService()
