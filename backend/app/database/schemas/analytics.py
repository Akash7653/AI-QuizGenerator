from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class AnalyticsBase(BaseModel):
    """Base analytics schema."""
    overall_accuracy: float = Field(default=0.0, ge=0.0, le=100.0)
    total_quizzes_attempted: int = Field(default=0, ge=0)
    total_questions_attempted: int = Field(default=0, ge=0)
    total_correct: int = Field(default=0, ge=0)
    total_wrong: int = Field(default=0, ge=0)


class AnalyticsUpdate(BaseModel):
    """Analytics update schema."""
    overall_accuracy: Optional[float] = Field(None, ge=0.0, le=100.0)
    total_quizzes_attempted: Optional[int] = Field(None, ge=0)
    total_questions_attempted: Optional[int] = Field(None, ge=0)
    total_correct: Optional[int] = Field(None, ge=0)
    total_wrong: Optional[int] = Field(None, ge=0)
    topic_performance: Optional[Dict[str, Any]] = None
    difficulty_performance: Optional[Dict[str, Any]] = None
    learning_curve: Optional[Dict[str, Any]] = None
    weak_areas: Optional[List[str]] = None
    strong_areas: Optional[List[str]] = None


class AnalyticsResponse(BaseModel):
    """Analytics response schema."""
    id: int
    user_id: int
    overall_accuracy: float
    total_quizzes_attempted: int
    total_questions_attempted: int
    total_correct: int
    total_wrong: int
    topic_performance: Optional[Dict[str, Any]]
    difficulty_performance: Optional[Dict[str, Any]]
    learning_curve: Optional[Dict[str, Any]]
    weak_areas: Optional[List[str]]
    strong_areas: Optional[List[str]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    """Dashboard analytics response schema."""
    overall_accuracy: float
    total_quizzes_attempted: int
    total_questions_attempted: int
    average_score: float
    completion_rate: float
    daily_progress: List[Dict[str, Any]]
    weekly_progress: List[Dict[str, Any]]
    monthly_progress: List[Dict[str, Any]]
    topic_performance: List[Dict[str, Any]]
    difficulty_performance: List[Dict[str, Any]]
    recent_quizzes: List[Dict[str, Any]]
    weak_areas: List[str]
    strong_areas: List[str]


class PerformanceAnalysis(BaseModel):
    """Performance analysis schema."""
    accuracy_trend: List[Dict[str, Any]]
    speed_analysis: Dict[str, Any]
    difficulty_progression: List[Dict[str, Any]]
    topic_mastery: Dict[str, Any]
    learning_velocity: float
    retention_rate: float
    improvement_areas: List[str]
