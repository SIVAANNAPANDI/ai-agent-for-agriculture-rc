from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, cast, String

from app.models.labour import Labour
from app.schemas.labour import LabourCreate, LabourUpdate


class LabourRepository:
    def get_labours(
        self,
        db: Session,
        skill: Optional[str] = None,
        search: Optional[str] = None,
        status: Optional[str] = "AVAILABLE",
        skip: int = 0,
        limit: int = 50,
    ) -> List[Labour]:
        query = db.query(Labour)

        if status:
            query = query.filter(Labour.availability_status == status)

        if skill and skill.lower() != "all":
            # Search within JSON skills array
            query = query.filter(cast(Labour.skills, String).ilike(f"%{skill}%"))

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Labour.worker_name.ilike(term),
                    Labour.location_name.ilike(term),
                    Labour.description.ilike(term),
                    cast(Labour.skills, String).ilike(term),
                )
            )

        return query.order_by(Labour.created_at.desc()).offset(skip).limit(limit).all()

    def get_my_labours(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 50
    ) -> List[Labour]:
        return (
            db.query(Labour)
            .filter(Labour.user_id == user_id)
            .order_by(Labour.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, db: Session, labour_id: int) -> Optional[Labour]:
        return db.query(Labour).filter(Labour.id == labour_id).first()

    def create(self, db: Session, user_id: int, labour_in: LabourCreate) -> Labour:
        labour = Labour(
            user_id=user_id,
            worker_name=labour_in.worker_name,
            phone=labour_in.phone,
            skills=labour_in.skills,
            experience_years=labour_in.experience_years,
            daily_wage=labour_in.daily_wage,
            location_name=labour_in.location_name,
            latitude=labour_in.latitude or 11.1085,
            longitude=labour_in.longitude or 77.3411,
            availability_status="AVAILABLE",
            description=labour_in.description,
        )
        db.add(labour)
        db.commit()
        db.refresh(labour)
        return labour

    def update(self, db: Session, labour: Labour, labour_in: LabourUpdate) -> Labour:
        update_data = labour_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(labour, field, value)

        db.commit()
        db.refresh(labour)
        return labour

    def delete(self, db: Session, labour: Labour):
        db.delete(labour)
        db.commit()


labour_repo = LabourRepository()
