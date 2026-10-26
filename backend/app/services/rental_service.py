from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.rental import RentalProperty
from app.repositories.rental_repo import rental_repo
from app.schemas.rental import (
    RentalPropertyCreate,
    RentalPropertyUpdate,
    RentalPropertyResponse,
)


class RentalService:
    def _to_response(
        self, rental: RentalProperty, current_user_id: Optional[int] = None
    ) -> RentalPropertyResponse:
        poster_name = rental.owner.name if rental.owner else "Landowner"
        images_list = rental.images if isinstance(rental.images, list) else []

        return RentalPropertyResponse(
            id=rental.id,
            user_id=rental.user_id,
            poster_name=poster_name,
            owner_name=rental.owner_name,
            phone=rental.phone,
            title=rental.title,
            land_area=float(rental.land_area),
            area_unit=rental.area_unit,
            monthly_rent=float(rental.monthly_rent),
            location_name=rental.location_name,
            latitude=float(rental.latitude) if rental.latitude is not None else None,
            longitude=float(rental.longitude) if rental.longitude is not None else None,
            available_from=rental.available_from.isoformat() if rental.available_from else "",
            available_until=rental.available_until.isoformat() if rental.available_until else None,
            water_source=rental.water_source,
            soil_type=rental.soil_type,
            description=rental.description,
            images=images_list,
            status=rental.status,
            created_at=rental.created_at.isoformat() if rental.created_at else "",
            updated_at=rental.updated_at.isoformat() if rental.updated_at else "",
            is_owner=(rental.user_id == current_user_id) if current_user_id else False,
        )

    def list_rentals(
        self,
        db: Session,
        current_user_id: Optional[int] = None,
        search: Optional[str] = None,
        water_source: Optional[str] = None,
        soil_type: Optional[str] = None,
        status: Optional[str] = "AVAILABLE",
        min_area: Optional[float] = None,
        max_rent: Optional[float] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[RentalPropertyResponse]:
        rentals = rental_repo.get_rentals(
            db=db,
            search=search,
            water_source=water_source,
            soil_type=soil_type,
            status=status,
            min_area=min_area,
            max_rent=max_rent,
            skip=skip,
            limit=limit,
        )
        return [self._to_response(r, current_user_id) for r in rentals]

    def list_my_rentals(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 50
    ) -> List[RentalPropertyResponse]:
        rentals = rental_repo.get_my_rentals(db=db, user_id=user_id, skip=skip, limit=limit)
        return [self._to_response(r, user_id) for r in rentals]

    def get_rental(
        self, db: Session, rental_id: int, current_user_id: Optional[int] = None
    ) -> RentalPropertyResponse:
        rental = rental_repo.get_by_id(db, rental_id)
        if not rental:
            raise NotFoundException("Rental property not found.")
        return self._to_response(rental, current_user_id)

    def create_rental(
        self, db: Session, user_id: int, rental_in: RentalPropertyCreate
    ) -> RentalPropertyResponse:
        rental = rental_repo.create(db=db, user_id=user_id, rental_in=rental_in)
        return self._to_response(rental, user_id)

    def update_rental(
        self,
        db: Session,
        rental_id: int,
        user_id: int,
        rental_in: RentalPropertyUpdate,
    ) -> RentalPropertyResponse:
        rental = rental_repo.get_by_id(db, rental_id)
        if not rental:
            raise NotFoundException("Rental property not found.")

        # Strict Ownership Isolation
        if rental.user_id != user_id:
            raise ForbiddenException("You do not have permission to modify this rental property.")

        updated = rental_repo.update(db=db, rental=rental, rental_in=rental_in)
        return self._to_response(updated, user_id)

    def set_status(
        self, db: Session, rental_id: int, user_id: int, status: str
    ) -> RentalPropertyResponse:
        if status not in ["AVAILABLE", "RENTED", "INACTIVE"]:
            raise BadRequestException(
                "Invalid status. Supported statuses are AVAILABLE, RENTED, INACTIVE."
            )

        rental = rental_repo.get_by_id(db, rental_id)
        if not rental:
            raise NotFoundException("Rental property not found.")

        # Strict Ownership Isolation
        if rental.user_id != user_id:
            raise ForbiddenException(
                "You do not have permission to update this rental property status."
            )

        rental.status = status
        db.commit()
        db.refresh(rental)
        return self._to_response(rental, user_id)

    def delete_rental(self, db: Session, rental_id: int, user_id: int):
        rental = rental_repo.get_by_id(db, rental_id)
        if not rental:
            raise NotFoundException("Rental property not found.")

        # Strict Ownership Isolation
        if rental.user_id != user_id:
            raise ForbiddenException("You do not have permission to delete this rental property.")

        rental_repo.delete(db, rental)


rental_service = RentalService()
