from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User, FarmerProfile, UserSettings


class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.strip().lower()).first()

    @staticmethod
    def get_by_phone(db: Session, phone: str) -> Optional[User]:
        return db.query(User).filter(User.phone == phone.strip()).first()

    @staticmethod
    def get_by_email_or_phone(db: Session, identifier: str) -> Optional[User]:
        val = identifier.strip().lower()
        user = db.query(User).filter(User.email == val).first()
        if not user:
            user = db.query(User).filter(User.phone == identifier.strip()).first()
        return user

    @staticmethod
    def create_farmer_user(
        db: Session,
        name: str,
        email: str,
        phone: str,
        password_hash: str,
        location_name: Optional[str] = None,
        preferred_language: str = "en"
    ) -> User:
        user = User(
            name=name.strip(),
            email=email.strip().lower(),
            phone=phone.strip(),
            password_hash=password_hash,
            is_active=True
        )
        db.add(user)
        db.flush()

        profile = FarmerProfile(
            user_id=user.id,
            preferred_language=preferred_language,
            location_name=location_name or "Erode, Tamil Nadu",
            experience_years=0
        )
        db.add(profile)

        settings = UserSettings(
            user_id=user.id,
            language=preferred_language,
            weather_alerts_enabled=True,
            task_reminders_enabled=True,
            market_alerts_enabled=True,
            theme_mode="light"
        )
        db.add(settings)

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_profile(
        db: Session,
        user: User,
        name: Optional[str] = None,
        phone: Optional[str] = None,
        location_name: Optional[str] = None,
        preferred_language: Optional[str] = None,
        experience_years: Optional[int] = None,
        primary_crop_type: Optional[str] = None
    ) -> User:
        if name:
            user.name = name.strip()
        if phone:
            user.phone = phone.strip()

        if user.profile:
            if location_name:
                user.profile.location_name = location_name
            if preferred_language:
                user.profile.preferred_language = preferred_language
            if experience_years is not None:
                user.profile.experience_years = experience_years
            if primary_crop_type:
                user.profile.primary_crop_type = primary_crop_type

        if preferred_language and user.settings:
            user.settings.language = preferred_language

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_password(db: Session, user: User, new_password_hash: str) -> None:
        user.password_hash = new_password_hash
        db.commit()

    @staticmethod
    def update_settings(
        db: Session,
        user: User,
        language: Optional[str] = None,
        weather_alerts_enabled: Optional[bool] = None,
        task_reminders_enabled: Optional[bool] = None,
        market_alerts_enabled: Optional[bool] = None,
        theme_mode: Optional[str] = None,
    ) -> UserSettings:
        if not user.settings:
            settings = UserSettings(
                user_id=user.id,
                language=language or "en",
                weather_alerts_enabled=True,
                task_reminders_enabled=True,
                market_alerts_enabled=True,
                theme_mode="light",
            )
            db.add(settings)
            db.flush()
            user.settings = settings

        if language is not None:
            user.settings.language = language
            if user.profile:
                user.profile.preferred_language = language
        if weather_alerts_enabled is not None:
            user.settings.weather_alerts_enabled = weather_alerts_enabled
        if task_reminders_enabled is not None:
            user.settings.task_reminders_enabled = task_reminders_enabled
        if market_alerts_enabled is not None:
            user.settings.market_alerts_enabled = market_alerts_enabled
        if theme_mode is not None:
            user.settings.theme_mode = theme_mode

        db.commit()
        db.refresh(user.settings)
        return user.settings

