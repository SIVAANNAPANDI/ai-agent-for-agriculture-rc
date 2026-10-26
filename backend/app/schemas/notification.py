from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class NotificationCreate(BaseModel):
    user_id: int
    type: str = Field(..., description="Type of alert: weather, cultivation, harvest, marketplace, ai, system")
    title: str = Field(..., min_length=2, max_length=200)
    message: str = Field(..., min_length=2)
    action_url: Optional[str] = Field(None, max_length=255)


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: str
    action_url: Optional[str] = None
    is_read: bool
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class UnreadCountResponse(BaseModel):
    unread_count: int


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    unread_count: int
    total: int
