from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SystemHealthResponse(BaseModel):
    """System health response schema."""
    status: str
    database_connected: bool
    redis_connected: bool
    celery_running: bool
    total_users: int
    total_quizzes: int
    total_questions: int
    server_uptime: str
    memory_usage: Dict[str, Any]
    cpu_usage: float
    disk_usage: Dict[str, Any]


class UserManagementResponse(BaseModel):
    """User management response schema."""
    id: str  # Changed from int to str for MongoDB ObjectId
    username: str
    email: str
    is_active: bool
    is_verified: bool
    total_quizzes: int
    last_active: Optional[datetime]
    created_at: datetime


class QuizManagementResponse(BaseModel):
    """Quiz management response schema."""
    id: str  # Changed from int to str for MongoDB ObjectId
    user_id: str  # Changed from int to str for MongoDB ObjectId
    user_name: str
    title: str
    mode: str
    total_questions: int
    total_attempts: int
    created_at: datetime


class AdminDashboardResponse(BaseModel):
    """Admin dashboard response schema."""
    total_users: int
    active_users: int
    total_quizzes: int
    total_questions: int
    total_attempts: int
    average_accuracy: float
    user_growth: List[Dict[str, Any]]
    quiz_activity: List[Dict[str, Any]]
    top_performers: List[Dict[str, Any]]
    recent_activities: List[Dict[str, Any]]


class SystemLogsResponse(BaseModel):
    """System logs response schema."""
    logs: List[Dict[str, Any]]
    total_count: int
    page: int
    page_size: int


class BulkActionRequest(BaseModel):
    """Bulk action request schema."""
    action: str = Field(..., description="Action to perform: delete, activate, deactivate")
    entity_type: str = Field(..., description="Type of entity: user, quiz, question")
    entity_ids: List[str] = Field(..., min_items=1)  # Changed from List[int] to List[str] for MongoDB ObjectId
    reason: Optional[str] = None


class BulkActionResponse(BaseModel):
    """Bulk action response schema."""
    success_count: int
    failed_count: int
    failed_ids: List[int]
    errors: List[str]
