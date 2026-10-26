from typing import List, Optional
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.crop import Crop
from app.models.cultivation import CultivationCycle, CultivationTask
from app.repositories.farm_repo import FarmRepository
from app.repositories.cultivation_repo import CultivationRepository
from app.schemas.cultivation import (
    CultivationCycleCreate,
    CultivationCycleUpdate,
    CultivationCycleResponse,
    CultivationTaskCreate,
    CultivationTaskUpdate,
    CultivationTaskResponse,
)
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException


class CultivationService:
    @staticmethod
    def _compute_phenology(cycle: CultivationCycle) -> dict:
        today = date.today()
        start = cycle.start_date
        end = cycle.expected_harvest_date

        days_total = max(1, (end - start).days)
        days_elapsed = max(0, (today - start).days)
        days_remaining = max(0, (end - today).days)
        progress_pct = min(100, int((days_elapsed / days_total) * 100))

        if progress_pct <= 15:
            current_stage = "Nursery & Land Preparation"
        elif progress_pct <= 35:
            current_stage = "Vegetative Establishment"
        elif progress_pct <= 60:
            current_stage = "Flowering & Fruit Setting"
        elif progress_pct <= 85:
            current_stage = "Fruit / Grain Development"
        else:
            current_stage = "Harvesting & Maturation"

        return {
            "days_total": days_total,
            "days_elapsed": days_elapsed,
            "days_remaining": days_remaining,
            "progress_pct": progress_pct,
            "current_stage": current_stage
        }

    @classmethod
    def _to_task_response(cls, task: CultivationTask) -> CultivationTaskResponse:
        is_overdue = task.status != "COMPLETED" and task.due_date < date.today()
        return CultivationTaskResponse(
            id=task.id,
            cycle_id=task.cycle_id,
            stage_name=task.stage_name,
            title=task.title,
            description=task.description,
            due_date=task.due_date,
            status="OVERDUE" if is_overdue and task.status == "PLANNED" else task.status,
            weather_note=task.weather_note,
            completed_at=task.completed_at,
            is_overdue=is_overdue,
            created_at=task.created_at,
            updated_at=task.updated_at
        )

    @classmethod
    def _to_cycle_response(cls, cycle: CultivationCycle) -> CultivationCycleResponse:
        pheno = cls._compute_phenology(cycle)
        tasks = [cls._to_task_response(t) for t in cycle.tasks] if cycle.tasks else []
        completed = sum(1 for t in tasks if t.status == "COMPLETED")

        return CultivationCycleResponse(
            id=cycle.id,
            farm_id=cycle.farm_id,
            farm_name=cycle.farm.name if cycle.farm else "Unknown Farm",
            crop_id=cycle.crop_id,
            crop_name=cycle.crop.name if cycle.crop else "Unknown Crop",
            crop_tamil_name=cycle.crop.tamil_name if cycle.crop else "",
            start_date=cycle.start_date,
            expected_harvest_date=cycle.expected_harvest_date,
            actual_harvest_date=cycle.actual_harvest_date,
            status=cycle.status,
            days_total=pheno["days_total"],
            days_elapsed=pheno["days_elapsed"],
            days_remaining=pheno["days_remaining"],
            progress_pct=pheno["progress_pct"],
            current_stage=pheno["current_stage"],
            estimated_yield=cycle.estimated_yield,
            notes=cycle.notes,
            tasks_count=len(tasks),
            tasks_completed_count=completed,
            tasks=tasks,
            created_at=cycle.created_at,
            updated_at=cycle.updated_at
        )

    @classmethod
    def generate_agronomic_tasks(cls, db: Session, cycle: CultivationCycle, crop: Crop) -> None:
        """Auto-generate structured agronomic lifecycle tasks for the crop."""
        start = cycle.start_date
        duration = crop.typical_duration_days or 90

        crop_name = crop.name.lower()

        if "tomato" in crop_name:
            tasks_blueprint = [
                (1, "Land Preparation", "Deep ploughing & basal FYM (5 tonnes/acre) application", "Incorporate compost and trichoderma-enriched farmyard manure."),
                (7, "Nursery / Bedding", "Raised bed formation & drip lateral installation", "Check drip emission uniformity and test emitter discharge."),
                (21, "Transplanting", "Transplanting healthy 21-day seedlings", "Transplant during late evening hours to reduce transplant shock."),
                (28, "Vegetative", "Gap filling and seedling establishment check", "Replace missing or wilted seedlings with reserve nursery stock."),
                (35, "Weeding", "Intercultural manual weeding & light earthing up", "Loosen topsoil around root zone and clear emerging weed canopy."),
                (45, "Fertilization", "First vegetative fertigation (NPK 19-19-19)", "Deliver water-soluble 19:19:19 @ 3 kg/acre via drip fertigation."),
                (55, "Support & Trellising", "Staking indeterminate plants with bamboo & twine", "Keep foliage and developing fruit clusters elevated off wet soil."),
                (65, "Flowering", "Boron + Micronutrient foliar spray", "Apply Solubor (1g/L) during 50% flowering to enhance fruit set."),
                (75, "Fruit Setting", "Calcium Nitrate fertigation (prevents Blossom End Rot)", "Deliver 2.5 kg/acre Calcium Nitrate via drip line."),
                (85, "Pre-Harvest", "Inspect fruit maturity & observe pre-harvest interval", "Withhold systemic pesticide sprays 7-10 days before first picking."),
                (90, "Harvesting", "First harvest pick at breaker/pink maturity stage", "Harvest carefully with calyx attached for longer market shelf life.")
            ]
        elif "paddy" in crop_name or "rice" in crop_name:
            tasks_blueprint = [
                (1, "Land Preparation", "Dry ploughing and bund reinforcement", "Deep summer ploughing to eradicate perennial weeds and insect pupae."),
                (12, "Puddling", "Wet puddling and leveling with standing water", "Level puddle with wooden leveling board to maintain uniform water depth."),
                (25, "Transplanting", "Transplanting 22-day seedlings (2-3 per hill)", "Maintain 20cm x 15cm spacing and shallow 2-3 cm planting depth."),
                (35, "Weeding & Nitrogen", "Cono-weeding and first split Urea application", "Incorporate weeds into mud as green manure and apply Urea @ 30 kg/acre."),
                (55, "Tillering", "Alternate Wetting and Drying (AWD) water management", "Allow water level to drop 5 cm below surface before re-flooding."),
                (75, "Panicle Initiation", "Second split Potash (MOP) top-dressing", "Apply Muriate of Potash @ 25 kg/acre to support robust panicle formation."),
                (95, "Flowering / Heading", "Scout for stem borer and false smut symptoms", "Inspect flag leaves for blast lesions or egg masses."),
                (110, "Grain Filling", "Field water drainage 10 days before harvest", "Drain field completely to harden soil and accelerate uniform grain ripening."),
                (120, "Harvesting", "Harvest when 85% panicles turn golden yellow", "Reap with sickle or combine harvester, thresh and dry to 14% moisture.")
            ]
        else:
            # Proportionately scaled agronomic blueprint
            tasks_blueprint = [
                (1, "Land Preparation", "Primary ploughing and organic manure application", "Prepare fine tilth and apply decomposed compost."),
                (int(duration * 0.12), "Sowing", f"Sowing / planting {crop.name} seeds with spacing", "Treat seeds with bio-fertilizers before planting."),
                (int(duration * 0.25), "Weeding", "First manual weeding and soil aerating", "Keep field weed-free during early critical competition window."),
                (int(duration * 0.45), "Vegetative", "Vegetative top-dressing and drip fertigation", "Provide balanced macronutrients to stimulate vegetative growth."),
                (int(duration * 0.65), "Flowering", "Flowering inspection & pest monitoring", "Scout for sucking pests and apply neem-based organic repellents."),
                (int(duration * 0.85), "Maturity", "Pre-harvest soil moisture regulation", "Reduce irrigation to allow natural fruit/grain dry down."),
                (duration, "Harvesting", f"Final harvest of {crop.name}", "Harvest at peak market maturity during dry morning conditions.")
            ]

        for day_offset, stage, title, desc in tasks_blueprint:
            due = start + timedelta(days=day_offset)
            CultivationRepository.create_task(
                db=db,
                cycle_id=cycle.id,
                stage_name=stage,
                title=title,
                due_date=due,
                description=desc,
                status="PLANNED"
            )

    @classmethod
    def list_cycles(cls, db: Session, user: User) -> List[CultivationCycleResponse]:
        cycles = CultivationRepository.get_cycles_by_user(db, user.id)
        return [cls._to_cycle_response(c) for c in cycles]

    @classmethod
    def get_cycle(cls, db: Session, cycle_id: int, user: User) -> CultivationCycleResponse:
        cycle = CultivationRepository.get_cycle_by_id(db, cycle_id)
        if not cycle:
            raise NotFoundException(f"Cultivation cycle with id {cycle_id} not found.")

        if cycle.farm.user_id != user.id:
            raise ForbiddenException("You do not have permission to view this cultivation cycle.")

        return cls._to_cycle_response(cycle)

    @classmethod
    def create_cycle(cls, db: Session, user: User, payload: CultivationCycleCreate) -> CultivationCycleResponse:
        farm = FarmRepository.get_by_id(db, payload.farm_id)
        if not farm:
            raise NotFoundException(f"Farm with id {payload.farm_id} does not exist.")

        if farm.user_id != user.id:
            raise ForbiddenException("You do not own this farm parcel.")

        crop = db.query(Crop).filter(Crop.id == payload.crop_id).first()
        if not crop:
            raise NotFoundException(f"Crop with id {payload.crop_id} does not exist in master crop directory.")

        expected_date = payload.expected_harvest_date
        if not expected_date:
            duration = crop.typical_duration_days or 90
            expected_date = payload.start_date + timedelta(days=duration)

        cycle = CultivationRepository.create_cycle(
            db=db,
            farm_id=payload.farm_id,
            crop_id=payload.crop_id,
            start_date=payload.start_date,
            expected_harvest_date=expected_date,
            estimated_yield=payload.estimated_yield,
            notes=payload.notes
        )

        # Generate agronomic lifecycle tasks automatically
        cls.generate_agronomic_tasks(db, cycle, crop)
        db.refresh(cycle)
        return cls._to_cycle_response(cycle)

    @classmethod
    def update_cycle(
        cls,
        db: Session,
        cycle_id: int,
        user: User,
        payload: CultivationCycleUpdate
    ) -> CultivationCycleResponse:
        cycle = CultivationRepository.get_cycle_by_id(db, cycle_id)
        if not cycle:
            raise NotFoundException(f"Cultivation cycle with id {cycle_id} not found.")

        if cycle.farm.user_id != user.id:
            raise ForbiddenException("You do not have permission to modify this cycle.")

        updated = CultivationRepository.update_cycle(
            db=db,
            cycle=cycle,
            status=payload.status,
            actual_harvest_date=payload.actual_harvest_date,
            estimated_yield=payload.estimated_yield,
            notes=payload.notes
        )
        return cls._to_cycle_response(updated)

    @classmethod
    def delete_cycle(cls, db: Session, cycle_id: int, user: User) -> None:
        cycle = CultivationRepository.get_cycle_by_id(db, cycle_id)
        if not cycle:
            raise NotFoundException(f"Cultivation cycle with id {cycle_id} not found.")

        if cycle.farm.user_id != user.id:
            raise ForbiddenException("You do not have permission to delete this cycle.")

        CultivationRepository.delete_cycle(db, cycle)

    @classmethod
    def update_task(
        cls,
        db: Session,
        task_id: int,
        user: User,
        payload: CultivationTaskUpdate
    ) -> CultivationTaskResponse:
        task = CultivationRepository.get_task_by_id(db, task_id)
        if not task:
            raise NotFoundException(f"Task with id {task_id} not found.")

        if task.cycle.farm.user_id != user.id:
            raise ForbiddenException("You do not have permission to modify this task.")

        updated = CultivationRepository.update_task(
            db=db,
            task=task,
            title=payload.title,
            description=payload.description,
            due_date=payload.due_date,
            status=payload.status,
            weather_note=payload.weather_note
        )
        return CultivationService._to_task_response(updated)

    @classmethod
    def add_custom_task(
        cls,
        db: Session,
        cycle_id: int,
        user: User,
        payload: CultivationTaskCreate
    ) -> CultivationTaskResponse:
        cycle = CultivationRepository.get_cycle_by_id(db, cycle_id)
        if not cycle:
            raise NotFoundException(f"Cultivation cycle with id {cycle_id} not found.")

        if cycle.farm.user_id != user.id:
            raise ForbiddenException("You do not have permission to add tasks to this cycle.")

        task = CultivationRepository.create_task(
            db=db,
            cycle_id=cycle.id,
            stage_name=payload.stage_name,
            title=payload.title,
            due_date=payload.due_date,
            description=payload.description,
            status=payload.status,
            weather_note=payload.weather_note
        )
        return cls._to_task_response(task)
