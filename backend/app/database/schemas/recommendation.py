from pydantic import BaseModel, Field, model_validator
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
    topic_id: Optional[str] = None  # Changed from int to str for MongoDB ObjectId
    quiz_id: Optional[str] = None  # Changed from int to str for MongoDB ObjectId
    recommendation_metadata: Optional[Dict[str, Any]] = None


class RecommendationUpdate(BaseModel):
    """Recommendation update schema."""
    is_completed: Optional[bool] = None
    is_dismissed: Optional[bool] = None


class RecommendationResponse(BaseModel):
    """Recommendation response schema."""
    id: str  # Changed from int to str for MongoDB ObjectId
    user_id: str  # Changed from int to str for MongoDB ObjectId
    recommendation_type: str
    title: str
    description: Optional[str]
    topic_id: Optional[str]  # Changed from int to str for MongoDB ObjectId
    quiz_id: Optional[str]  # Changed from int to str for MongoDB ObjectId
    priority: int
    difficulty: Optional[str]
    recommendation_metadata: Optional[Dict[str, Any]]
    is_completed: bool
    is_dismissed: bool
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
            if 'topic_id' in values and values['topic_id'] and hasattr(values['topic_id'], '__str__'):
                values['topic_id'] = str(values['topic_id'])
            if 'quiz_id' in values and values['quiz_id'] and hasattr(values['quiz_id'], '__str__'):
                values['quiz_id'] = str(values['quiz_id'])
        return values
    
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
