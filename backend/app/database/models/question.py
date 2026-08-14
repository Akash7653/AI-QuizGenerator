from sqlalchemy import Column, String, Text, Integer, ForeignKey, Float, Boolean, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel


class QuestionType(str, enum.Enum):
    """Question type enumeration."""
    MCQ = "mcq"
    TRUE_FALSE = "true_false"
    FILL_IN_BLANK = "fill_in_blank"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    CODING = "coding"
    ASSERTION_REASON = "assertion_reason"
    CASE_STUDY = "case_study"
    SCENARIO_BASED = "scenario_based"


class Difficulty(str, enum.Enum):
    """Difficulty level enumeration."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    ADAPTIVE = "adaptive"


class BloomTaxonomy(str, enum.Enum):
    """Bloom's taxonomy levels."""
    REMEMBER = "remember"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"
    CREATE = "create"


class Question(BaseModel):
    """Question model for storing generated questions."""
    __tablename__ = "questions"
    
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    
    question_text = Column(Text, nullable=False)
    question_type = Column(SQLEnum(QuestionType), nullable=False)
    options = Column(JSON, nullable=True)  # For MCQ, True/False
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    
    difficulty = Column(SQLEnum(Difficulty), default=Difficulty.MEDIUM)
    subtopic = Column(String(100), nullable=True)
    bloom_taxonomy_level = Column(SQLEnum(BloomTaxonomy), nullable=True)
    
    estimated_time = Column(Integer, default=60)  # in seconds
    marks = Column(Float, default=1.0)
    hint = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.0)
    tags = Column(JSON, nullable=True)  # List of tags
    
    is_validated = Column(Boolean, default=False)
    validation_errors = Column(JSON, nullable=True)
    
    # Relationships
    topic = relationship("Topic", back_populates="questions")
    document = relationship("Document")
    quiz_questions = relationship("QuizQuestion", back_populates="question", cascade="all, delete-orphan")
