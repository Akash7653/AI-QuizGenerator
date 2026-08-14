from sqlalchemy import Column, String, Text, Integer, ForeignKey, Float, Boolean, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel


class AttemptStatus(str, enum.Enum):
    """Quiz attempt status."""
    IN_PROGRESS = "in_progress"
    PAUSED = "paused"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class QuizAttempt(BaseModel):
    """Quiz attempt model for tracking user attempts."""
    __tablename__ = "quiz_attempts"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    
    status = Column(SQLEnum(AttemptStatus), default=AttemptStatus.IN_PROGRESS)
    started_at = Column(Integer, nullable=True)  # Unix timestamp
    completed_at = Column(Integer, nullable=True)  # Unix timestamp
    time_taken = Column(Integer, default=0)  # in seconds
    
    total_score = Column(Float, default=0.0)
    max_score = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    
    correct_count = Column(Integer, default=0)
    wrong_count = Column(Integer, default=0)
    skipped_count = Column(Integer, default=0)
    
    current_question_index = Column(Integer, default=0)
    answers = Column(JSON, nullable=True)  # Store answers as JSON
    
    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    attempt_answers = relationship("AttemptAnswer", back_populates="attempt", cascade="all, delete-orphan")


class AttemptAnswer(BaseModel):
    """Individual answer model for quiz attempts."""
    __tablename__ = "attempt_answers"
    
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    
    user_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    time_taken = Column(Integer, default=0)  # in seconds
    marks_obtained = Column(Float, default=0.0)
    
    # Relationships
    attempt = relationship("QuizAttempt", back_populates="attempt_answers")
