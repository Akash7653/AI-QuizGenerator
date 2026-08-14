from sqlalchemy import Column, String, Text, Integer, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel


class Analytics(BaseModel):
    """Analytics model for tracking user performance."""
    __tablename__ = "analytics"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    overall_accuracy = Column(Float, default=0.0)
    total_quizzes_attempted = Column(Integer, default=0)
    total_questions_attempted = Column(Integer, default=0)
    total_correct = Column(Integer, default=0)
    total_wrong = Column(Integer, default=0)
    
    topic_performance = Column(JSON, nullable=True)  # Topic-wise performance
    difficulty_performance = Column(JSON, nullable=True)  # Difficulty-wise performance
    learning_curve = Column(JSON, nullable=True)  # Progress over time
    
    weak_areas = Column(JSON, nullable=True)  # List of weak topics
    strong_areas = Column(JSON, nullable=True)  # List of strong topics
    
    # Relationships
    user = relationship("User", back_populates="analytics")
