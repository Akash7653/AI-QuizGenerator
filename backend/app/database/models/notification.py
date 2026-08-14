from sqlalchemy import Column, String, Text, Integer, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel


class NotificationType(str, enum.Enum):
    """Notification type enumeration."""
    QUIZ_COMPLETED = "quiz_completed"
    QUIZ_REMINDER = "quiz_reminder"
    RECOMMENDATION = "recommendation"
    ACHIEVEMENT = "achievement"
    SYSTEM = "system"


class Notification(BaseModel):
    """Notification model for user notifications."""
    __tablename__ = "notifications"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    is_read = Column(Boolean, default=False)
    action_url = Column(String(500), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
