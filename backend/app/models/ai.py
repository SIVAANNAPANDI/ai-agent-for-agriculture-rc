from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(200), default="Farm Consultation", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="ai_conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.created_at")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id", ondelete="CASCADE"), index=True, nullable=False)
    sender = Column(String(20), nullable=False)  # 'farmer' or 'ai'
    content = Column(Text, nullable=False)
    tool_calls = Column(JSON, nullable=True)  # Structured function calls invoked
    tool_results = Column(JSON, nullable=True)  # Real API/DB execution payloads
    audio_url = Column(String(255), nullable=True)  # Voice response URL if synthesized
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    conversation = relationship("AIConversation", back_populates="messages")
