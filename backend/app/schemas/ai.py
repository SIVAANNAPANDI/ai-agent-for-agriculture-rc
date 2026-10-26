from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class MessageSchema(BaseModel):
    id: Optional[int] = None
    sender: str = Field(..., description="'farmer' or 'ai'")
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_results: Optional[List[Dict[str, Any]]] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="Farmer question or voice transcription")
    conversation_id: Optional[int] = None
    farm_id: Optional[int] = None
    language: Optional[str] = Field("en", description="'en' for English, 'ta' for Tamil")


class ChatResponse(BaseModel):
    conversation_id: int
    message: MessageSchema
    is_guardrail_triggered: bool = False
    tools_executed: List[str] = []


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageSchema] = []

    model_config = ConfigDict(from_attributes=True)


class ConversationSummary(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    model_config = ConfigDict(from_attributes=True)
