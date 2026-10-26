from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class CropRecommendationItem(BaseModel):
    crop_id: int
    crop_name: str
    crop_tamil_name: str
    category: str
    suitability_score: int = Field(..., ge=0, le=100, description="Overall suitability percentage")
    duration_days: int
    water_need: str
    input_cost_per_acre: Optional[float] = None
    yield_potential: Optional[str] = None
    risk_level: str
    icon_url: Optional[str] = None

    # 4 Pillars of Explainable Agronomic Reasoning
    what_summary: str
    why_reason: str
    when_window: str
    next_steps: str

    # Compatibility breakdown
    soil_compatible: bool
    ph_compatible: bool
    water_compatible: bool

    model_config = ConfigDict(from_attributes=True)


class CropRecommendationResponse(BaseModel):
    farm_id: int
    farm_name: str
    soil_type: str
    ph: Optional[float] = None
    water_source: Optional[str] = None
    irrigation_method: Optional[str] = None
    generated_at: datetime
    recommendations: List[CropRecommendationItem]

    model_config = ConfigDict(from_attributes=True)
