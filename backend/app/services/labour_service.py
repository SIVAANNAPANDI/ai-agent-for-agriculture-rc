from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.labour import Labour
from app.models.user import User
from app.repositories.labour_repo import labour_repo
from app.schemas.labour import LabourCreate, LabourUpdate, LabourResponse


class LabourService:
    def _to_response(
        self, labour: Labour, current_user_id: Optional[int] = None
    ) -> LabourResponse:
        skills_list = labour.skills if isinstance(labour.skills, list) else []
        poster_name = labour.user.name if labour.user else "Farmer"

        return LabourResponse(
            id=labour.id,
            user_id=labour.user_id,
            poster_name=poster_name,
            worker_name=labour.worker_name,
            phone=labour.phone,
            skills=skills_list,
            experience_years=labour.experience_years,
            daily_wage=float(labour.daily_wage),
            location_name=labour.location_name,
            latitude=float(labour.latitude) if labour.latitude else None,
            longitude=float(labour.longitude) if labour.longitude else None,
            availability_status=labour.availability_status,
            description=labour.description,
            created_at=labour.created_at.isoformat() if labour.created_at else "",
            updated_at=labour.updated_at.isoformat() if labour.updated_at else "",
            is_owner=(labour.user_id == current_user_id) if current_user_id else False,
        )

    def list_labours(
        self,
        db: Session,
        current_user_id: Optional[int] = None,
        skill: Optional[str] = None,
        search: Optional[str] = None,
        status: Optional[str] = "AVAILABLE",
        skip: int = 0,
        limit: int = 50,
    ) -> List[LabourResponse]:
        labours = labour_repo.get_labours(
            db=db,
            skill=skill,
            search=search,
            status=status,
            skip=skip,
            limit=limit,
        )
        return [self._to_response(l, current_user_id) for l in labours]

    def list_my_labours(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 50
    ) -> List[LabourResponse]:
        labours = labour_repo.get_my_labours(db=db, user_id=user_id, skip=skip, limit=limit)
        return [self._to_response(l, user_id) for l in labours]

    def get_labour(
        self, db: Session, labour_id: int, current_user_id: Optional[int] = None
    ) -> LabourResponse:
        labour = labour_repo.get_by_id(db, labour_id)
        if not labour:
            raise NotFoundException("Farm worker profile not found.")
        return self._to_response(labour, current_user_id)

    def create_labour(
        self, db: Session, user_id: int, labour_in: LabourCreate
    ) -> LabourResponse:
        labour = labour_repo.create(db=db, user_id=user_id, labour_in=labour_in)
        return self._to_response(labour, user_id)

    def update_labour(
        self, db: Session, labour_id: int, user_id: int, labour_in: LabourUpdate
    ) -> LabourResponse:
        labour = labour_repo.get_by_id(db, labour_id)
        if not labour:
            raise NotFoundException("Farm worker profile not found.")

        # Strict Ownership Isolation
        if labour.user_id != user_id:
            raise ForbiddenException("You do not have permission to modify this worker listing.")

        updated = labour_repo.update(db=db, labour=labour, labour_in=labour_in)
        return self._to_response(updated, user_id)

    def set_availability(
        self, db: Session, labour_id: int, user_id: int, status: str
    ) -> LabourResponse:
        if status not in ["AVAILABLE", "BUSY", "INACTIVE"]:
            raise BadRequestException("Invalid status. Supported statuses are AVAILABLE, BUSY, INACTIVE.")

        labour = labour_repo.get_by_id(db, labour_id)
        if not labour:
            raise NotFoundException("Farm worker profile not found.")

        # Strict Ownership Isolation
        if labour.user_id != user_id:
            raise ForbiddenException("You do not have permission to update this worker status.")

        labour.availability_status = status
        db.commit()
        db.refresh(labour)
        return self._to_response(labour, user_id)

    def delete_labour(self, db: Session, labour_id: int, user_id: int):
        labour = labour_repo.get_by_id(db, labour_id)
        if not labour:
            raise NotFoundException("Farm worker profile not found.")

        # Strict Ownership Isolation
        if labour.user_id != user_id:
            raise ForbiddenException("You do not have permission to delete this worker profile.")

        labour_repo.delete(db, labour)


labour_service = LabourService()
