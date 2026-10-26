from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate


class NotificationRepository:
    def get_user_notifications(
        self,
        db: Session,
        user_id: int,
        unread_only: bool = False,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Notification]:
        query = db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    def get_unread_count(self, db: Session, user_id: int) -> int:
        return (
            db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .count()
        )

    def get_total_count(self, db: Session, user_id: int) -> int:
        return db.query(Notification).filter(Notification.user_id == user_id).count()

    def get_by_id(self, db: Session, notification_id: int) -> Optional[Notification]:
        return db.query(Notification).filter(Notification.id == notification_id).first()

    def create(self, db: Session, notif_in: NotificationCreate) -> Notification:
        notification = Notification(
            user_id=notif_in.user_id,
            type=notif_in.type,
            title=notif_in.title,
            message=notif_in.message,
            action_url=notif_in.action_url,
            is_read=False,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    def mark_as_read(self, db: Session, notification: Notification) -> Notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
        return notification

    def mark_all_as_read(self, db: Session, user_id: int) -> int:
        count = (
            db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .update({Notification.is_read: True})
        )
        db.commit()
        return count

    def delete(self, db: Session, notification: Notification):
        db.delete(notification)
        db.commit()


notification_repo = NotificationRepository()
