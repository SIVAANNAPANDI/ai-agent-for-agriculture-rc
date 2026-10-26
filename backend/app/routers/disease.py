from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.disease import DiseaseDiagnosisResponse, DiseaseHistoryItem
from app.services.disease_service import disease_service

router = APIRouter(prefix="/api/disease", tags=["Plant Disease Detection"])


@router.post("/predict", response_model=DiseaseDiagnosisResponse, status_code=status.HTTP_200_OK)
async def predict_leaf_disease(
    file: UploadFile = File(..., description="Leaf photograph (JPG, PNG, or WebP)"),
    language: Optional[str] = Query("en", description="Advisory language ('en' or 'ta')"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a leaf photo to the EfficientNetB0 neural diagnostic engine.
    Returns confidence score, top candidate diseases, and actionable agronomic treatments.
    """
    return await disease_service.predict_leaf_disease(
        db=db,
        user_id=current_user.id,
        file=file,
        language=language or "en"
    )


@router.get("/history", response_model=List[DiseaseHistoryItem])
def get_scan_history(
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves previous disease diagnostic scans for the authenticated farmer.
    Enforces strict ownership isolation.
    """
    return disease_service.get_history(db=db, user_id=current_user.id, limit=limit)


@router.get("/{prediction_id}", response_model=DiseaseDiagnosisResponse)
def get_scan_detail(
    prediction_id: int,
    language: Optional[str] = Query("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves complete diagnostic report for a specific prior scan.
    """
    return disease_service.get_prediction_detail(
        db=db,
        prediction_id=prediction_id,
        user_id=current_user.id,
        language=language or "en"
    )
