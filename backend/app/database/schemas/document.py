from pydantic import BaseModel, Field, validator, model_validator
from typing import Optional
from datetime import datetime
from app.database.mongodb_models import DocumentType, DocumentStatus


class DocumentBase(BaseModel):
    """Base document schema."""
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    document_type: DocumentType


class DocumentCreate(DocumentBase):
    """Document creation schema."""
    file_path: Optional[str] = None
    original_text: Optional[str] = None
    url: Optional[str] = None
    topic: Optional[str] = None


class DocumentUpdate(BaseModel):
    """Document update schema."""
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None


class DocumentResponse(BaseModel):
    """Document response schema."""
    id: str  # Changed from int to str for MongoDB ObjectId
    user_id: str  # Changed from int to str for MongoDB ObjectId
    title: str
    description: Optional[str]
    document_type: DocumentType
    file_path: Optional[str]
    status: DocumentStatus
    processing_error: Optional[str]
    language: Optional[str]
    word_count: int
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


class DocumentUploadResponse(BaseModel):
    """Document upload response schema."""
    document_id: str  # Changed from int to str for MongoDB ObjectId
    status: DocumentStatus
    message: str


class TextPasteRequest(BaseModel):
    """Text paste request schema."""
    title: str = Field(..., min_length=2, max_length=255)
    content: str = Field(..., min_length=10)
    description: Optional[str] = None


class URLFetchRequest(BaseModel):
    """URL fetch request schema."""
    url: str = Field(..., min_length=10)
    title: Optional[str] = None
    description: Optional[str] = None


class TopicRequest(BaseModel):
    """Topic-based document request schema."""
    topic: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None


class YouTubeTranscriptRequest(BaseModel):
    """YouTube transcript request schema."""
    video_url: str = Field(..., min_length=10)
    title: Optional[str] = None
    description: Optional[str] = None
