from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel


class Topic(BaseModel):
    """Topic model for categorizing questions."""
    __tablename__ = "topics"
    
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    
    # Relationships
    subtopics = relationship("Topic", remote_side="Topic.id", backref="parent")
    questions = relationship("Question", back_populates="topic")
