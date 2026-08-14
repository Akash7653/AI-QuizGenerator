from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel


class UserActivity(BaseModel):
    """User activity model for tracking user actions."""
    __tablename__ = "user_activities"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    activity_type = Column(String(50), nullable=False)  # login, quiz_start, quiz_complete, etc.
    description = Column(Text, nullable=True)
    
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    activity_metadata = Column(JSON, nullable=True)  # Additional activity data
    
    # Relationships
    user = relationship("User", back_populates="user_activities")
