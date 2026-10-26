from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.recommendation import CropRecommendationResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/api/recommendations", tags=["Crop Recommendation Engine"])


@router.get("/farm/{farm_id}", response_model=CropRecommendationResponse)
def get_farm_recommendations(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate explainable multi-factor crop recommendations for a registered farm parcel."""
    return RecommendationService.get_recommendations_for_farm(db, farm_id, current_user)
