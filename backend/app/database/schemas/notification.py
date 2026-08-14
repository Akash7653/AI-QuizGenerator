from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.database.models.notification import NotificationType


class NotificationBase(BaseModel):
    """Base notification schema."""
    notification_type: NotificationType
    title: str = Field(..., min_length=2, max_length=255)
    message: str = Field(..., min_length=2)
    action_url: Optional[str] = None


class NotificationCreate(NotificationBase):
    """Notification creation schema."""
    user_id: int


class NotificationUpdate(BaseModel):
    """Notification update schema."""
    is_read: Optional[bool] = None


class NotificationResponse(BaseModel):
    """Notification response schema."""
    id: int
    user_id: int
    notification_type: NotificationType
    title: str
    message: str
    is_read: bool
    action_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
