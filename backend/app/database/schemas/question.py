from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.database.models.question import QuestionType, Difficulty, BloomTaxonomy


class QuestionBase(BaseModel):
    """Base question schema."""
    question_text: str = Field(..., min_length=10)
    question_type: QuestionType
    correct_answer: str
    explanation: Optional[str] = None
    difficulty: Difficulty = Difficulty.MEDIUM
    subtopic: Optional[str] = None
    bloom_taxonomy_level: Optional[BloomTaxonomy] = None
    estimated_time: int = Field(default=60, ge=10, le=600)
    marks: float = Field(default=1.0, ge=0.1, le=10.0)
    hint: Optional[str] = None
    tags: Optional[List[str]] = None


class QuestionCreate(QuestionBase):
    """Question creation schema."""
    options: Optional[List[str]] = None
    topic_id: Optional[int] = None
    document_id: Optional[int] = None


class QuestionUpdate(BaseModel):
    """Question update schema."""
    question_text: Optional[str] = Field(None, min_length=10)
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    subtopic: Optional[str] = None
    bloom_taxonomy_level: Optional[BloomTaxonomy] = None
    estimated_time: Optional[int] = Field(None, ge=10, le=600)
    marks: Optional[float] = Field(None, ge=0.1, le=10.0)
    hint: Optional[str] = None
    tags: Optional[List[str]] = None
    is_validated: Optional[bool] = None


class QuestionResponse(BaseModel):
    """Question response schema."""
    id: int
    question_text: str
    question_type: QuestionType
    options: Optional[List[str]]
    correct_answer: str
    explanation: Optional[str]
    difficulty: Difficulty
    subtopic: Optional[str]
    bloom_taxonomy_level: Optional[BloomTaxonomy]
    estimated_time: int
    marks: float
    hint: Optional[str]
    confidence_score: float
    tags: Optional[List[str]]
    is_validated: bool
    validation_errors: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QuestionGenerationRequest(BaseModel):
    """Question generation request schema."""
    document_id: int
    question_type: QuestionType
    difficulty: Difficulty = Difficulty.MEDIUM
    count: int = Field(default=5, ge=1, le=50)
    topic_id: Optional[int] = None
    subtopic: Optional[str] = None
    bloom_taxonomy_level: Optional[BloomTaxonomy] = None


class QuestionGenerationResponse(BaseModel):
    """Question generation response schema."""
    questions: List[QuestionResponse]
    total_generated: int
    failed: int
    processing_time: float


class QuestionValidationResult(BaseModel):
    """Question validation result schema."""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    confidence_score: float
