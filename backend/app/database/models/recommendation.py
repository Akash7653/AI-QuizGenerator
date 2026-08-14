from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel


class Recommendation(BaseModel):
    """Recommendation model for personalized learning paths."""
    __tablename__ = "recommendations"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    recommendation_type = Column(String(50), nullable=False)  # next_topic, next_quiz, revision, weak_topic
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=True)
    
    priority = Column(Integer, default=0)
    difficulty = Column(String(20), nullable=True)
    
    recommendation_metadata = Column(JSON, nullable=True)  # Additional recommendation data
    is_completed = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="recommendations")
