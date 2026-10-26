from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException
from app.models.user import User
from app.repositories.user_repo import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency that authenticates JWT Bearer tokens and returns the active User object."""
    if not token:
        raise UnauthorizedException("Authentication token missing")

    payload = decode_access_token(token)
    user_id: str = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token payload")

    user = UserRepository.get_by_id(db, int(user_id))
    if not user:
        raise UnauthorizedException("User associated with this token does not exist")

    if not user.is_active:
        raise UnauthorizedException("User account is inactive")

    return user
