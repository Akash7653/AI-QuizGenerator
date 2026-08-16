from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime
from app.database.mongodb_models import NotificationType


class NotificationBase(BaseModel):
    """Base notification schema."""
    notification_type: NotificationType
    title: str = Field(..., min_length=2, max_length=255)
    message: str = Field(..., min_length=2)
    action_url: Optional[str] = None


class NotificationCreate(NotificationBase):
    """Notification creation schema."""
    user_id: str  # Changed from int to str for MongoDB ObjectId


class NotificationUpdate(BaseModel):
    """Notification update schema."""
    is_read: Optional[bool] = None


class NotificationResponse(BaseModel):
    """Notification response schema."""
    id: str  # Changed from int to str for MongoDB ObjectId
    user_id: str  # Changed from int to str for MongoDB ObjectId
    notification_type: NotificationType
    title: str
    message: str
    is_read: bool
    action_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    @model_validator(mode='before')
    @classmethod
    def convert_objectid(cls, values):
        if isinstance(values, dict):
            if 'id' in values and hasattr(values['id'], '__str__'):
                values['id'] = str(values['id'])
            if 'user_id' in values and hasattr(values['user_id'], '__str__'):
                values['user_id'] = str(values['user_id'])
        return values
    
    class Config:
        from_attributes = True
