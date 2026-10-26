from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class CultivationTaskBase(BaseModel):
    stage_name: str = Field(..., description="Nursery, Land Prep, Sowing, Vegetative, Flowering, Harvesting")
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    due_date: date
    status: str = Field("PLANNED", description="PLANNED, IN_PROGRESS, COMPLETED, OVERDUE")
    weather_note: Optional[str] = None


class CultivationTaskCreate(CultivationTaskBase):
    pass


class CultivationTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = Field(None, description="PLANNED, IN_PROGRESS, COMPLETED, OVERDUE")
    weather_note: Optional[str] = None


class CultivationTaskResponse(BaseModel):
    id: int
    cycle_id: int
    stage_name: str
    title: str
    description: Optional[str] = None
    due_date: date
    status: str
    weather_note: Optional[str] = None
    completed_at: Optional[datetime] = None
    is_overdue: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CultivationCycleCreate(BaseModel):
    farm_id: int
    crop_id: int
    start_date: date
    expected_harvest_date: Optional[date] = None
    estimated_yield: Optional[str] = None
    notes: Optional[str] = None


class CultivationCycleUpdate(BaseModel):
    status: Optional[str] = Field(None, description="PLANNED, IN_PROGRESS, HARVESTED, CANCELLED")
    actual_harvest_date: Optional[date] = None
    estimated_yield: Optional[str] = None
    notes: Optional[str] = None


class CultivationCycleResponse(BaseModel):
    id: int
    farm_id: int
    farm_name: str
    crop_id: int
    crop_name: str
    crop_tamil_name: str
    start_date: date
    expected_harvest_date: date
    actual_harvest_date: Optional[date] = None
    status: str
    days_total: int
    days_elapsed: int
    days_remaining: int
    progress_pct: int
    current_stage: str
    estimated_yield: Optional[str] = None
    notes: Optional[str] = None
    tasks_count: int = 0
    tasks_completed_count: int = 0
    tasks: List[CultivationTaskResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
