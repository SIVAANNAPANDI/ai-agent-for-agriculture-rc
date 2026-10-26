from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
    UnreadCountResponse,
)
from app.services.notification_service import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Farmer Notifications"])


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    unread_only: bool = Query(False, description="Filter to only unread notifications"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve in-app agricultural notifications for the authenticated farmer."""
    return notification_service.list_notifications(
        db=db,
        user_id=current_user.id,
        unread_only=unread_only,
        skip=skip,
        limit=limit,
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve quick unread notifications count for header bell badge."""
    count = notification_service.get_unread_count(db=db, user_id=current_user.id)
    return UnreadCountResponse(unread_count=count)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a specific notification as read. Enforces strict ownership."""
    return notification_service.mark_as_read(
        db=db, notification_id=notification_id, user_id=current_user.id
    )


@router.post("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark all unread notifications as read for current farmer."""
    count = notification_service.mark_all_as_read(db=db, user_id=current_user.id)
    return {"success": True, "marked_count": count}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a specific notification. Enforces strict ownership."""
    notification_service.delete_notification(
        db=db, notification_id=notification_id, user_id=current_user.id
    )
    return None
