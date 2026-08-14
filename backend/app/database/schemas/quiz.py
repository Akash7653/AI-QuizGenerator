from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.database.models.quiz import QuizMode
from app.database.models.quiz_attempt import AttemptStatus


class QuizBase(BaseModel):
    """Base quiz schema."""
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    mode: QuizMode = QuizMode.PRACTICE
    total_questions: int = Field(default=10, ge=1, le=100)
    total_marks: float = Field(default=10.0, ge=0.1)
    duration: Optional[int] = Field(None, ge=60)  # in seconds
    negative_marking: float = Field(default=0.0, ge=0.0, le=1.0)
    pass_percentage: float = Field(default=60.0, ge=0.0, le=100.0)
    shuffle_questions: bool = False
    shuffle_options: bool = False
    auto_save: bool = True


class QuizCreate(QuizBase):
    """Quiz creation schema."""
    document_id: Optional[int] = None
    topic_id: Optional[int] = None
    question_ids: Optional[List[int]] = None


class QuizUpdate(BaseModel):
    """Quiz update schema."""
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    mode: Optional[QuizMode] = None
    duration: Optional[int] = Field(None, ge=60)
    negative_marking: Optional[float] = Field(None, ge=0.0, le=1.0)
    pass_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    shuffle_questions: Optional[bool] = None
    shuffle_options: Optional[bool] = None
    auto_save: Optional[bool] = None


class QuizResponse(BaseModel):
    """Quiz response schema."""
    id: int
    user_id: int
    title: str
    description: Optional[str]
    mode: QuizMode
    total_questions: int
    total_marks: float
    duration: Optional[int]
    negative_marking: float
    pass_percentage: float
    shuffle_questions: bool
    shuffle_options: bool
    auto_save: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QuizGenerationRequest(BaseModel):
    """Quiz generation request schema."""
    document_id: int
    mode: QuizMode = QuizMode.PRACTICE
    total_questions: int = Field(default=10, ge=1, le=100)
    difficulty: Optional[str] = None
    topic_id: Optional[int] = None
    subtopic: Optional[str] = None
    question_types: Optional[List[str]] = None


class QuizAttemptCreate(BaseModel):
    """Quiz attempt creation schema."""
    quiz_id: int


class QuizAttemptUpdate(BaseModel):
    """Quiz attempt update schema."""
    answers: dict
    status: Optional[AttemptStatus] = None


class QuizAttemptResponse(BaseModel):
    """Quiz attempt response schema."""
    id: int
    user_id: int
    quiz_id: int
    status: AttemptStatus
    started_at: Optional[int]
    completed_at: Optional[int]
    time_taken: int
    total_score: float
    max_score: float
    percentage: float
    correct_count: int
    wrong_count: int
    skipped_count: int
    current_question_index: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QuizSubmissionRequest(BaseModel):
    """Quiz submission request schema."""
    attempt_id: int
    answers: dict


class QuizResultResponse(BaseModel):
    """Quiz result response schema."""
    attempt: QuizAttemptResponse
    question_results: List[dict]
    performance_analysis: dict
    recommendations: List[str]
