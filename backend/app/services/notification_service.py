from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.notification import Notification
from app.models.user import User
from app.repositories.notification_repo import notification_repo
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    NotificationListResponse,
)


class NotificationService:
    def _to_response(self, notif: Notification) -> NotificationResponse:
        return NotificationResponse(
            id=notif.id,
            user_id=notif.user_id,
            type=notif.type,
            title=notif.title,
            message=notif.message,
            action_url=notif.action_url,
            is_read=notif.is_read,
            created_at=notif.created_at.isoformat() if notif.created_at else "",
        )

    def seed_initial_farmer_notifications(self, db: Session, user_id: int):
        """Seed realistic agricultural decision alerts if user has no notifications."""
        initial_alerts = [
            NotificationCreate(
                user_id=user_id,
                type="weather",
                title="Rainfall Forecast Warning 🌧️",
                message="Moderate precipitation expected in your district over the next 48 hours. Postpone open pesticide spray and ensure proper field drainage.",
                action_url="/weather",
            ),
            NotificationCreate(
                user_id=user_id,
                type="cultivation",
                title="Stage Task Due: Vegetative Top Dressing 🌿",
                message="Your active cultivation cycle has entered the active vegetative phase. Apply recommended organic bio-fertilizer mix or nitrogenous booster.",
                action_url="/calendar",
            ),
            NotificationCreate(
                user_id=user_id,
                type="marketplace",
                title="Produce Price Advisory: Wholesale Demand High 📈",
                message="High demand reported for Grade-A farm produce in Coimbatore and Erode APMC markets. Consider listing available harvest.",
                action_url="/marketplace",
            ),
            NotificationCreate(
                user_id=user_id,
                type="ai",
                title="AI Agronomist Ready 🤖",
                message="Your farm soil profile and current weather conditions are synced. Ask AgriAssist AI any pest, disease, or fertilizer question in Tamil or English.",
                action_url="/ai-agent",
            ),
        ]
        for alert in initial_alerts:
            notification_repo.create(db, alert)

    def list_notifications(
        self,
        db: Session,
        user_id: int,
        unread_only: bool = False,
        skip: int = 0,
        limit: int = 50,
    ) -> NotificationListResponse:
        # Check if user has any notifications; if 0, seed realistic initial alerts
        total = notification_repo.get_total_count(db, user_id)
        if total == 0:
            self.seed_initial_farmer_notifications(db, user_id)
            total = notification_repo.get_total_count(db, user_id)

        notifs = notification_repo.get_user_notifications(
            db=db,
            user_id=user_id,
            unread_only=unread_only,
            skip=skip,
            limit=limit,
        )
        unread_count = notification_repo.get_unread_count(db, user_id)

        return NotificationListResponse(
            items=[self._to_response(n) for n in notifs],
            unread_count=unread_count,
            total=total,
        )

    def get_unread_count(self, db: Session, user_id: int) -> int:
        return notification_repo.get_unread_count(db, user_id)

    def mark_as_read(
        self, db: Session, notification_id: int, user_id: int
    ) -> NotificationResponse:
        notification = notification_repo.get_by_id(db, notification_id)
        if not notification:
            raise NotFoundException("Notification not found.")

        # Strict Ownership Isolation
        if notification.user_id != user_id:
            raise ForbiddenException("You do not have permission to modify this notification.")

        updated = notification_repo.mark_as_read(db, notification)
        return self._to_response(updated)

    def mark_all_as_read(self, db: Session, user_id: int) -> int:
        return notification_repo.mark_all_as_read(db, user_id)

    def delete_notification(self, db: Session, notification_id: int, user_id: int):
        notification = notification_repo.get_by_id(db, notification_id)
        if not notification:
            raise NotFoundException("Notification not found.")

        # Strict Ownership Isolation
        if notification.user_id != user_id:
            raise ForbiddenException("You do not have permission to delete this notification.")

        notification_repo.delete(db, notification)


notification_service = NotificationService()
