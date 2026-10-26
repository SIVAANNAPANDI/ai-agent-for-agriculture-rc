from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.market import MarketProduct, ProductLocation, ProductImage
from app.schemas.market import MarketProductCreate, MarketProductUpdate


class MarketRepository:
    def get_products(
        self,
        db: Session,
        category: Optional[str] = None,
        search: Optional[str] = None,
        status: Optional[str] = "AVAILABLE",
        skip: int = 0,
        limit: int = 50
    ) -> List[MarketProduct]:
        query = db.query(MarketProduct)
        if status:
            query = query.filter(MarketProduct.status == status)

        if category and category.lower() != "all":
            query = query.filter(MarketProduct.category.ilike(f"%{category}%"))

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    MarketProduct.name.ilike(term),
                    MarketProduct.description.ilike(term),
                    MarketProduct.category.ilike(term)
                )
            )

        return query.order_by(MarketProduct.created_at.desc()).offset(skip).limit(limit).all()

    def get_my_products(
        self,
        db: Session,
        seller_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> List[MarketProduct]:
        return (
            db.query(MarketProduct)
            .filter(MarketProduct.seller_id == seller_id)
            .order_by(MarketProduct.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, db: Session, product_id: int) -> Optional[MarketProduct]:
        return db.query(MarketProduct).filter(MarketProduct.id == product_id).first()

    def create(self, db: Session, seller_id: int, product_in: MarketProductCreate) -> MarketProduct:
        product = MarketProduct(
            seller_id=seller_id,
            name=product_in.name,
            category=product_in.category,
            quantity=product_in.quantity,
            unit=product_in.unit,
            price_per_unit=product_in.price_per_unit,
            description=product_in.description,
            seller_phone=product_in.seller_phone,
            status="AVAILABLE",
        )
        db.add(product)
        db.flush()

        # Add Location
        location = ProductLocation(
            product_id=product.id,
            location_name=product_in.location_name or "Farm Location",
            latitude=product_in.latitude or 11.1085,
            longitude=product_in.longitude or 77.3411,
        )
        db.add(location)

        # Add image if provided
        if product_in.image_url:
            image = ProductImage(
                product_id=product.id,
                image_url=product_in.image_url,
                is_primary=True,
            )
            db.add(image)

        db.commit()
        db.refresh(product)
        return product

    def update(
        self, db: Session, product: MarketProduct, product_in: MarketProductUpdate
    ) -> MarketProduct:
        update_data = product_in.model_dump(exclude_unset=True)

        # Fields to update on MarketProduct
        for field in [
            "name", "category", "quantity", "unit", "price_per_unit",
            "description", "seller_phone", "status"
        ]:
            if field in update_data and update_data[field] is not None:
                setattr(product, field, update_data[field])

        # Location update
        if "location_name" in update_data or "latitude" in update_data or "longitude" in update_data:
            if not product.location:
                product.location = ProductLocation(
                    product_id=product.id,
                    location_name=update_data.get("location_name", "Farm Location"),
                    latitude=update_data.get("latitude", 11.1085),
                    longitude=update_data.get("longitude", 77.3411),
                )
                db.add(product.location)
            else:
                if "location_name" in update_data and update_data["location_name"] is not None:
                    product.location.location_name = update_data["location_name"]
                if "latitude" in update_data and update_data["latitude"] is not None:
                    product.location.latitude = update_data["latitude"]
                if "longitude" in update_data and update_data["longitude"] is not None:
                    product.location.longitude = update_data["longitude"]

        # Image update
        if "image_url" in update_data and update_data["image_url"] is not None:
            if product.images and len(product.images) > 0:
                product.images[0].image_url = update_data["image_url"]
            else:
                new_img = ProductImage(
                    product_id=product.id,
                    image_url=update_data["image_url"],
                    is_primary=True,
                )
                db.add(new_img)

        db.commit()
        db.refresh(product)
        return product

    def delete(self, db: Session, product: MarketProduct):
        db.delete(product)
        db.commit()


market_repo = MarketRepository()
