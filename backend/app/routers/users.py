from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.middleware.auth import get_current_user
from app.schemas.user import (
    UserProfileResponse,
    FarmerProfileUpdate,
    PasswordChangeRequest,
    FarmerProfileResponse,
    UserSettingsResponse,
    UserSettingsUpdate,
)
from app.repositories.user_repo import UserRepository
from app.core.security import verify_password, get_password_hash
from app.core.exceptions import AgriAssistException, UnauthorizedException

router = APIRouter(prefix="/api/users", tags=["Users & Farmer Profile"])


@router.get("/me", response_model=UserProfileResponse)
def get_current_farmer_profile(current_user: User = Depends(get_current_user)):
    """Retrieve full account information and farm brief for the authenticated farmer."""
    profile_data = None
    if current_user.profile:
        profile_data = FarmerProfileResponse(
            id=current_user.profile.id,
            preferred_language=current_user.profile.preferred_language,
            location_name=current_user.profile.location_name,
            latitude=float(current_user.profile.latitude) if current_user.profile.latitude else None,
            longitude=float(current_user.profile.longitude) if current_user.profile.longitude else None,
            experience_years=current_user.profile.experience_years,
            primary_crop_type=current_user.profile.primary_crop_type
        )

    settings_data = None
    if current_user.settings:
        settings_data = UserSettingsResponse(
            language=current_user.settings.language,
            weather_alerts_enabled=current_user.settings.weather_alerts_enabled,
            task_reminders_enabled=current_user.settings.task_reminders_enabled,
            market_alerts_enabled=current_user.settings.market_alerts_enabled,
            theme_mode=current_user.settings.theme_mode
        )

    return UserProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat(),
        profile=profile_data,
        settings=settings_data,
        farms_count=len(current_user.farms) if current_user.farms else 0
    )


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    update_data: FarmerProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update farmer personal details, location, and preferred language."""
    updated_user = UserRepository.update_profile(
        db=db,
        user=current_user,
        name=update_data.name,
        phone=update_data.phone,
        location_name=update_data.location_name,
        preferred_language=update_data.preferred_language,
        experience_years=update_data.experience_years,
        primary_crop_type=update_data.primary_crop_type
    )
    return get_current_farmer_profile(updated_user)


@router.put("/password", status_code=status.HTTP_200_OK)
def change_password(
    pwd_data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Securely change account password after verifying current credentials."""
    if not verify_password(pwd_data.current_password, current_user.password_hash):
        raise UnauthorizedException("Current password is incorrect.")

    if pwd_data.new_password != pwd_data.confirm_new_password:
        raise AgriAssistException("New passwords do not match.", code="PASSWORD_MISMATCH")

    new_hash = get_password_hash(pwd_data.new_password)
    UserRepository.update_password(db, current_user, new_hash)
    return {"success": True, "message": "Password changed successfully."}


@router.get("/settings", response_model=UserSettingsResponse)
def get_user_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve personal notification and display settings for authenticated user."""
    settings = current_user.settings
    if not settings:
        settings = UserRepository.update_settings(db, current_user)
    return UserSettingsResponse(
        language=settings.language,
        weather_alerts_enabled=settings.weather_alerts_enabled,
        task_reminders_enabled=settings.task_reminders_enabled,
        market_alerts_enabled=settings.market_alerts_enabled,
        theme_mode=settings.theme_mode,
    )


@router.put("/settings", response_model=UserSettingsResponse)
def update_user_settings(
    settings_in: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update notification preferences, language switch, and theme."""
    updated_settings = UserRepository.update_settings(
        db=db,
        user=current_user,
        language=settings_in.language,
        weather_alerts_enabled=settings_in.weather_alerts_enabled,
        task_reminders_enabled=settings_in.task_reminders_enabled,
        market_alerts_enabled=settings_in.market_alerts_enabled,
        theme_mode=settings_in.theme_mode,
    )
    return UserSettingsResponse(
        language=updated_settings.language,
        weather_alerts_enabled=updated_settings.weather_alerts_enabled,
        task_reminders_enabled=updated_settings.task_reminders_enabled,
        market_alerts_enabled=updated_settings.market_alerts_enabled,
        theme_mode=updated_settings.theme_mode,
    )

