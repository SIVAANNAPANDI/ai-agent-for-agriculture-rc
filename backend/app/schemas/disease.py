from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class CandidateClassItem(BaseModel):
    class_name: str
    crop: str
    disease_name: str
    display_name: str
    confidence: float
    confidence_pct: float


class DiseaseDiagnosisResponse(BaseModel):
    id: Optional[int] = None
    predicted_class: str
    crop_name: str
    disease_name: str
    display_name: str
    pathogen: str
    confidence: float
    confidence_pct: float
    is_healthy: bool
    severity: str
    is_low_confidence: bool
    warning: Optional[str] = None
    symptoms: List[str] = []
    organic_treatment: List[str] = []
    chemical_treatment: List[str] = []
    preventive_measures: List[str] = []
    top_candidates: List[CandidateClassItem] = []
    image_url: Optional[str] = None
    created_at: Optional[str] = None


class DiseaseHistoryItem(BaseModel):
    id: int
    crop_name: str
    disease_name: str
    predicted_class: str
    confidence: float
    confidence_pct: float
    severity: str
    is_healthy: bool
    image_url: str
    created_at: str
