from pydantic import BaseModel, Field
from typing import Optional, List, Generic, TypeVar, Any


T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response schema."""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool


class MessageResponse(BaseModel):
    """Simple message response schema."""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response schema."""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


class ValidationErrorResponse(BaseModel):
    """Validation error response schema."""
    error: str = "Validation Error"
    details: List[dict]


class HealthCheckResponse(BaseModel):
    """Health check response schema."""
    status: str
    version: str
    timestamp: str


class SearchQuery(BaseModel):
    """Search query schema."""
    query: str = Field(..., min_length=2, max_length=100)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)
    filters: Optional[dict] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = Field(default="asc", regex="^(asc|desc)$")
