from sqlalchemy import Column, String, Text, Integer, ForeignKey, Float, Boolean, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel


class QuizMode(str, enum.Enum):
    """Quiz mode enumeration."""
    PRACTICE = "practice"
    EXAM = "exam"
    TIMED = "timed"
    UNTIMED = "untimed"
    ADAPTIVE = "adaptive"
    CHALLENGE = "challenge"
    WEAK_TOPIC = "weak_topic"
    PREVIOUS_MISTAKES = "previous_mistakes"
    RANDOM = "random"
    REVISION = "revision"
    TOPIC_WISE = "topic_wise"
    MOCK_TEST = "mock_test"


class Quiz(BaseModel):
    """Quiz model for quiz configurations."""
    __tablename__ = "quizzes"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    mode = Column(SQLEnum(QuizMode), default=QuizMode.PRACTICE)
    
    total_questions = Column(Integer, default=10)
    total_marks = Column(Float, default=10.0)
    duration = Column(Integer, nullable=True)  # in seconds, null for untimed
    negative_marking = Column(Float, default=0.0)
    pass_percentage = Column(Float, default=60.0)
    
    shuffle_questions = Column(Boolean, default=False)
    shuffle_options = Column(Boolean, default=False)
    auto_save = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User")
    document = relationship("Document")
    topic = relationship("Topic")
    quiz_questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(BaseModel):
    """Quiz question mapping model."""
    __tablename__ = "quiz_questions"
    
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    question_order = Column(Integer, nullable=False)
    marks = Column(Float, default=1.0)
    
    # Relationships
    quiz = relationship("Quiz", back_populates="quiz_questions")
    question = relationship("Question", back_populates="quiz_questions")
