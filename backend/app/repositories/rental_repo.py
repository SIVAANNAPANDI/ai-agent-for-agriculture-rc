from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.rental import RentalProperty
from app.schemas.rental import RentalPropertyCreate, RentalPropertyUpdate


class RentalRepository:
    def get_rentals(
        self,
        db: Session,
        search: Optional[str] = None,
        water_source: Optional[str] = None,
        soil_type: Optional[str] = None,
        status: Optional[str] = "AVAILABLE",
        min_area: Optional[float] = None,
        max_rent: Optional[float] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[RentalProperty]:
        query = db.query(RentalProperty)

        if status:
            query = query.filter(RentalProperty.status == status)

        if water_source and water_source.lower() != "all":
            query = query.filter(RentalProperty.water_source.ilike(f"%{water_source}%"))

        if soil_type and soil_type.lower() != "all":
            query = query.filter(RentalProperty.soil_type.ilike(f"%{soil_type}%"))

        if min_area is not None and min_area > 0:
            query = query.filter(RentalProperty.land_area >= min_area)

        if max_rent is not None and max_rent > 0:
            query = query.filter(RentalProperty.monthly_rent <= max_rent)

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    RentalProperty.title.ilike(term),
                    RentalProperty.location_name.ilike(term),
                    RentalProperty.owner_name.ilike(term),
                    RentalProperty.description.ilike(term),
                    RentalProperty.water_source.ilike(term),
                    RentalProperty.soil_type.ilike(term),
                )
            )

        return query.order_by(RentalProperty.created_at.desc()).offset(skip).limit(limit).all()

    def get_my_rentals(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 50
    ) -> List[RentalProperty]:
        return (
            db.query(RentalProperty)
            .filter(RentalProperty.user_id == user_id)
            .order_by(RentalProperty.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, db: Session, rental_id: int) -> Optional[RentalProperty]:
        return db.query(RentalProperty).filter(RentalProperty.id == rental_id).first()

    def create(
        self, db: Session, user_id: int, rental_in: RentalPropertyCreate
    ) -> RentalProperty:
        rental = RentalProperty(
            user_id=user_id,
            title=rental_in.title,
            owner_name=rental_in.owner_name,
            phone=rental_in.phone,
            land_area=rental_in.land_area,
            area_unit=rental_in.area_unit,
            monthly_rent=rental_in.monthly_rent,
            location_name=rental_in.location_name,
            latitude=rental_in.latitude or 11.1085,
            longitude=rental_in.longitude or 77.3411,
            available_from=rental_in.available_from,
            available_until=rental_in.available_until,
            water_source=rental_in.water_source,
            soil_type=rental_in.soil_type,
            description=rental_in.description,
            images=rental_in.images or [],
            status="AVAILABLE",
        )
        db.add(rental)
        db.commit()
        db.refresh(rental)
        return rental

    def update(
        self, db: Session, rental: RentalProperty, rental_in: RentalPropertyUpdate
    ) -> RentalProperty:
        update_data = rental_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(rental, field, value)

        db.commit()
        db.refresh(rental)
        return rental

    def delete(self, db: Session, rental: RentalProperty):
        db.delete(rental)
        db.commit()


rental_repo = RentalRepository()
