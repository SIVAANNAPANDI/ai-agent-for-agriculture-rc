from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session
from app.models.cultivation import CultivationCycle, CultivationTask
from app.models.crop import Crop
from app.models.farm import Farm


class CultivationRepository:
    @staticmethod
    def get_cycle_by_id(db: Session, cycle_id: int) -> Optional[CultivationCycle]:
        return db.query(CultivationCycle).filter(CultivationCycle.id == cycle_id).first()

    @staticmethod
    def get_cycles_by_farm(db: Session, farm_id: int) -> List[CultivationCycle]:
        return db.query(CultivationCycle).filter(
            CultivationCycle.farm_id == farm_id
        ).order_by(CultivationCycle.created_at.desc()).all()

    @staticmethod
    def get_cycles_by_user(db: Session, user_id: int) -> List[CultivationCycle]:
        return db.query(CultivationCycle).join(Farm).filter(
            Farm.user_id == user_id
        ).order_by(CultivationCycle.created_at.desc()).all()

    @staticmethod
    def create_cycle(
        db: Session,
        farm_id: int,
        crop_id: int,
        start_date: date,
        expected_harvest_date: date,
        estimated_yield: Optional[str] = None,
        notes: Optional[str] = None
    ) -> CultivationCycle:
        cycle = CultivationCycle(
            farm_id=farm_id,
            crop_id=crop_id,
            start_date=start_date,
            expected_harvest_date=expected_harvest_date,
            status="IN_PROGRESS",
            estimated_yield=estimated_yield,
            notes=notes
        )
        db.add(cycle)
        db.commit()
        db.refresh(cycle)
        return cycle

    @staticmethod
    def update_cycle(
        db: Session,
        cycle: CultivationCycle,
        status: Optional[str] = None,
        actual_harvest_date: Optional[date] = None,
        estimated_yield: Optional[str] = None,
        notes: Optional[str] = None
    ) -> CultivationCycle:
        if status is not None:
            cycle.status = status
        if actual_harvest_date is not None:
            cycle.actual_harvest_date = actual_harvest_date
        if estimated_yield is not None:
            cycle.estimated_yield = estimated_yield
        if notes is not None:
            cycle.notes = notes

        db.commit()
        db.refresh(cycle)
        return cycle

    @staticmethod
    def delete_cycle(db: Session, cycle: CultivationCycle) -> None:
        db.delete(cycle)
        db.commit()

    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Optional[CultivationTask]:
        return db.query(CultivationTask).filter(CultivationTask.id == task_id).first()

    @staticmethod
    def get_tasks_by_cycle(db: Session, cycle_id: int) -> List[CultivationTask]:
        return db.query(CultivationTask).filter(
            CultivationTask.cycle_id == cycle_id
        ).order_by(CultivationTask.due_date.asc()).all()

    @staticmethod
    def create_task(
        db: Session,
        cycle_id: int,
        stage_name: str,
        title: str,
        due_date: date,
        description: Optional[str] = None,
        status: str = "PLANNED",
        weather_note: Optional[str] = None
    ) -> CultivationTask:
        task = CultivationTask(
            cycle_id=cycle_id,
            stage_name=stage_name,
            title=title,
            due_date=due_date,
            description=description,
            status=status,
            weather_note=weather_note
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def update_task(
        db: Session,
        task: CultivationTask,
        title: Optional[str] = None,
        description: Optional[str] = None,
        due_date: Optional[date] = None,
        status: Optional[str] = None,
        weather_note: Optional[str] = None
    ) -> CultivationTask:
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if due_date is not None:
            task.due_date = due_date
        if status is not None:
            task.status = status
            if status == "COMPLETED" and not task.completed_at:
                task.completed_at = datetime.utcnow()
            elif status != "COMPLETED":
                task.completed_at = None
        if weather_note is not None:
            task.weather_note = weather_note

        db.commit()
        db.refresh(task)
        return task
