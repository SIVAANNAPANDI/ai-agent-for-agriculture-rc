from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.database.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    type = Column(String(30), index=True, nullable=False)  # weather, cultivation, harvest, marketplace, ai
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    action_url = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    # Relationship
    user = relationship("User", back_populates="notifications")
