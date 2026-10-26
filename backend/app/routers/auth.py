from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    """Register a new farmer account and generate initial farmer profile and JWT token."""
    return AuthService.register_farmer(db, req)


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate farmer with email or phone number and return signed JWT token."""
    return AuthService.authenticate_farmer(db, req)
