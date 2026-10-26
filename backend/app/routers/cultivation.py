from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.crop import Crop
from app.schemas.cultivation import (
    CultivationCycleCreate,
    CultivationCycleUpdate,
    CultivationCycleResponse,
    CultivationTaskCreate,
    CultivationTaskUpdate,
    CultivationTaskResponse,
)
from app.services.cultivation_service import CultivationService

router = APIRouter(prefix="/api/cultivation", tags=["Cultivation Calendar"])


@router.get("/crops", response_model=List[dict])
def get_cultivation_crops(db: Session = Depends(get_db)):
    """List all crops available for starting a cultivation cycle."""
    crops = db.query(Crop).order_by(Crop.name.asc()).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "tamil_name": c.tamil_name,
            "category": c.category,
            "typical_duration_days": c.typical_duration_days,
            "water_requirement_level": c.water_requirement_level
        }
        for c in crops
    ]


@router.get("/cycles", response_model=List[CultivationCycleResponse])
def get_user_cycles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all cultivation cycles owned by the authenticated farmer."""
    return CultivationService.list_cycles(db, current_user)


@router.post("/cycles", response_model=CultivationCycleResponse, status_code=status.HTTP_201_CREATED)
def create_cultivation_cycle(
    payload: CultivationCycleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new crop cultivation cycle and automatically generate agronomic phenology tasks."""
    return CultivationService.create_cycle(db, current_user, payload)


@router.get("/cycles/{cycle_id}", response_model=CultivationCycleResponse)
def get_cultivation_cycle(
    cycle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details, phenology timeline, and task checklist for a cultivation cycle."""
    return CultivationService.get_cycle(db, cycle_id, current_user)


@router.put("/cycles/{cycle_id}", response_model=CultivationCycleResponse)
def update_cultivation_cycle(
    cycle_id: int,
    payload: CultivationCycleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update cycle status (e.g. mark HARVESTED) or notes."""
    return CultivationService.update_cycle(db, cycle_id, current_user, payload)


@router.delete("/cycles/{cycle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cultivation_cycle(
    cycle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a cultivation cycle and its associated tasks."""
    CultivationService.delete_cycle(db, cycle_id, current_user)
    return None


@router.post("/cycles/{cycle_id}/tasks", response_model=CultivationTaskResponse, status_code=status.HTTP_201_CREATED)
def add_task_to_cycle(
    cycle_id: int,
    payload: CultivationTaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a custom farm task to a cultivation cycle."""
    return CultivationService.add_custom_task(db, cycle_id, current_user, payload)


@router.put("/tasks/{task_id}", response_model=CultivationTaskResponse)
def update_task_status(
    task_id: int,
    payload: CultivationTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update task status (e.g. toggle COMPLETED) or update due date."""
    return CultivationService.update_task(db, task_id, current_user, payload)
