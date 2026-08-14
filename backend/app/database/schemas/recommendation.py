from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class RecommendationBase(BaseModel):
    """Base recommendation schema."""
    recommendation_type: str = Field(..., description="Type of recommendation")
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    priority: int = Field(default=0, ge=0, le=100)
    difficulty: Optional[str] = None


class RecommendationCreate(RecommendationBase):
    """Recommendation creation schema."""
    topic_id: Optional[int] = None
    quiz_id: Optional[int] = None
    recommendation_metadata: Optional[Dict[str, Any]] = None


class RecommendationUpdate(BaseModel):
    """Recommendation update schema."""
    is_completed: Optional[bool] = None
    is_dismissed: Optional[bool] = None


class RecommendationResponse(BaseModel):
    """Recommendation response schema."""
    id: int
    user_id: int
    recommendation_type: str
    title: str
    description: Optional[str]
    topic_id: Optional[int]
    quiz_id: Optional[int]
    priority: int
    difficulty: Optional[str]
    recommendation_metadata: Optional[Dict[str, Any]]
    is_completed: bool
    is_dismissed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PersonalizedLearningPath(BaseModel):
    """Personalized learning path schema."""
    current_level: str
    recommended_topics: List[Dict[str, Any]]
    recommended_quizzes: List[Dict[str, Any]]
    revision_schedule: List[Dict[str, Any]]
    weak_topic_focus: List[Dict[str, Any]]
    estimated_completion_time: int
    learning_objectives: List[str]


class NextStepRecommendation(BaseModel):
    """Next step recommendation schema."""
    action_type: str
    title: str
    description: str
    estimated_time: int
    difficulty: str
    confidence: float
    reason: str
