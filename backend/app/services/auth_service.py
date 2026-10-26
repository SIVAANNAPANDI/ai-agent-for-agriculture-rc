from datetime import timedelta
from sqlalchemy.orm import Session
from app.repositories.user_repo import UserRepository
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserBasicResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exceptions import AgriAssistException, UnauthorizedException, NotFoundException


class AuthService:
    @staticmethod
    def register_farmer(db: Session, req: SignupRequest) -> TokenResponse:
        # Check duplicate email
        if UserRepository.get_by_email(db, req.email):
            raise AgriAssistException(
                message="An account with this email address already exists. Please sign in.",
                code="EMAIL_ALREADY_EXISTS",
                status_code=400
            )

        # Check duplicate phone
        if UserRepository.get_by_phone(db, req.phone):
            raise AgriAssistException(
                message="An account with this mobile phone number already exists.",
                code="PHONE_ALREADY_EXISTS",
                status_code=400
            )

        # Hash password securely with bcrypt
        pwd_hash = get_password_hash(req.password)

        # Create user + profile + settings atomically
        user = UserRepository.create_farmer_user(
            db=db,
            name=req.name,
            email=req.email,
            phone=req.phone,
            password_hash=pwd_hash,
            location_name=req.location,
            preferred_language=req.preferred_language or "en"
        )

        # Generate JWT
        token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "name": user.name}
        )

        user_basic = UserBasicResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            preferred_language=user.profile.preferred_language if user.profile else "en",
            location=user.profile.location_name if user.profile else None,
            created_at=user.created_at.isoformat()
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_basic
        )

    @staticmethod
    def authenticate_farmer(db: Session, req: LoginRequest) -> TokenResponse:
        user = UserRepository.get_by_email_or_phone(db, req.email_or_username)
        if not user or not verify_password(req.password, user.password_hash):
            raise UnauthorizedException("Invalid email/phone number or password.")

        if not user.is_active:
            raise UnauthorizedException("This farmer account is currently deactivated.")

        # Longer expiry if remember_me
        delta = timedelta(days=30) if req.remember_me else timedelta(hours=24)
        token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "name": user.name},
            expires_delta=delta
        )

        user_basic = UserBasicResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            preferred_language=user.profile.preferred_language if user.profile else "en",
            location=user.profile.location_name if user.profile else None,
            created_at=user.created_at.isoformat()
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_basic
        )
