from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
from datetime import datetime
from app.database.mongodb_models import QuizMode, AttemptStatus


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
    document_id: Optional[str] = None  # Changed from int to str for MongoDB ObjectId
    topic_id: Optional[str] = None  # Changed from int to str for MongoDB ObjectId
    question_ids: Optional[List[str]] = None  # Changed from List[int] to List[str]


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
    id: str  # Changed from int to str for MongoDB ObjectId
    user_id: str  # Changed from int to str for MongoDB ObjectId
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
    
    @model_validator(mode='before')
    @classmethod
    def convert_objectid(cls, values):
        if isinstance(values, dict):
            if 'id' in values and hasattr(values['id'], '__str__'):
                values['id'] = str(values['id'])
            if 'user_id' in values and hasattr(values['user_id'], '__str__'):
                values['user_id'] = str(values['user_id'])
        return values
    
    class Config:
        from_attributes = True


class QuizGenerationRequest(BaseModel):
    """Quiz generation request schema."""
    document_id: str  # Changed from int to str for MongoDB ObjectId
    mode: QuizMode = QuizMode.PRACTICE
    total_questions: int = Field(default=10, ge=1, le=100)
    difficulty: Optional[str] = None
    topic_id: Optional[str] = None  # Changed from int to str for MongoDB ObjectId
    subtopic: Optional[str] = None
    question_types: Optional[List[str]] = None


class QuizAttemptCreate(BaseModel):
    """Quiz attempt creation schema."""
    quiz_id: str  # Changed from int to str for MongoDB ObjectId


class QuizAttemptUpdate(BaseModel):
    """Quiz attempt update schema."""
    answers: dict
    status: Optional[AttemptStatus] = None


class QuizAttemptResponse(BaseModel):
    """Quiz attempt response schema."""
    id: str  # Changed from int to str for MongoDB ObjectId
    user_id: str  # Changed from int to str for MongoDB ObjectId
    quiz_id: str  # Changed from int to str for MongoDB ObjectId
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
    
    @model_validator(mode='before')
    @classmethod
    def convert_objectid(cls, values):
        if isinstance(values, dict):
            if 'id' in values and hasattr(values['id'], '__str__'):
                values['id'] = str(values['id'])
            if 'user_id' in values and hasattr(values['user_id'], '__str__'):
                values['user_id'] = str(values['user_id'])
            if 'quiz_id' in values and hasattr(values['quiz_id'], '__str__'):
                values['quiz_id'] = str(values['quiz_id'])
        return values
    
    class Config:
        from_attributes = True


class QuizHistoryResponse(BaseModel):
    """Quiz history response with quiz details."""
    id: str  # Changed from int to str for MongoDB ObjectId
    quiz_id: str  # Changed from int to str for MongoDB ObjectId
    topic: str
    total_score: float
    percentage: float
    total_questions: int
    time_taken: int
    completed_at: Optional[int]
    difficulty: Optional[str] = "Medium"
    question_type: str = "Mixed"
    source_type: str = "topic"
    
    @model_validator(mode='before')
    @classmethod
    def convert_objectid(cls, values):
        if isinstance(values, dict):
            if 'id' in values and hasattr(values['id'], '__str__'):
                values['id'] = str(values['id'])
            if 'quiz_id' in values and hasattr(values['quiz_id'], '__str__'):
                values['quiz_id'] = str(values['quiz_id'])
        return values
    
    class Config:
        from_attributes = True


class QuizSubmissionRequest(BaseModel):
    """Quiz submission request schema."""
    attempt_id: str  # Changed from int to str for MongoDB ObjectId
    answers: dict


class QuizResultResponse(BaseModel):
    """Quiz result response schema."""
    attempt: QuizAttemptResponse
    question_results: List[dict]
    performance_analysis: dict
    recommendations: List[str]


class QuickSaveQuizRequest(BaseModel):
    """Quick save quiz results (for locally generated quizzes)."""
    topic: str
    source_type: str = "topic"  # 'topic', 'pdf', 'text', 'url'
    score: int  # number of correct answers
    total_questions: int
    difficulty: str = "Medium"
    question_type: str = "Mixed"
    time_taken: int  # in seconds


class QuickSaveQuizResponse(BaseModel):
    """Quick save quiz response."""
    id: str  # Changed from int to str for MongoDB ObjectId
    topic: str
    score: int
    total_questions: int
    percentage: float
    time_taken: int
    difficulty: str
    completed_at: str
    
    @model_validator(mode='before')
    @classmethod
    def convert_objectid(cls, values):
        if isinstance(values, dict):
            if 'id' in values and hasattr(values['id'], '__str__'):
                values['id'] = str(values['id'])
        return values
    
    class Config:
        from_attributes = True
