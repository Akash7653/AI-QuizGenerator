from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON
from .base import BaseModel


class AuditLog(BaseModel):
    """Audit log model for tracking system changes."""
    __tablename__ = "audit_logs"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    action = Column(String(100), nullable=False)  # create, update, delete, etc.
    entity_type = Column(String(50), nullable=False)  # user, quiz, question, etc.
    entity_id = Column(Integer, nullable=True)
    
    changes = Column(JSON, nullable=True)  # Before/after values
    reason = Column(Text, nullable=True)
    
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
