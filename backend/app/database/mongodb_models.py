from beanie import Document, Indexed
from datetime import datetime
from typing import Optional, List
from pydantic import Field
from enum import Enum


class DocumentType(str, Enum):
    """Document type enumeration."""
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"
    PPTX = "pptx"
    PASTED_TEXT = "pasted_text"
    WEBSITE_URL = "website_url"
    WIKIPEDIA = "wikipedia"
    TOPIC = "topic"
    YOUTUBE_TRANSCRIPT = "youtube_transcript"


class DocumentStatus(str, Enum):
    """Document processing status."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentModel(Document):
    """MongoDB model for document storage."""
    
    user_id: int = Indexed()
    title: str = Indexed()
    description: Optional[str] = None
    document_type: DocumentType
    file_path: Optional[str] = None
    original_text: Optional[str] = None
    cleaned_text: Optional[str] = None
    status: DocumentStatus = DocumentStatus.UPLOADED
    processing_error: Optional[str] = None
    language: Optional[str] = None
    word_count: int = 0
    file_size: Optional[int] = None
    metadata: dict = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "documents"
        indexes = [
            "user_id",
            "title",
            "status",
            "document_type",
            "created_at"
        ]


class DocumentChunkModel(Document):
    """MongoDB model for document chunks."""
    
    document_id: int = Indexed()
    chunk_index: int = Indexed()
    chunk_text: str
    word_count: int = 0
    metadata: dict = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "document_chunks"
        indexes = [
            "document_id",
            "chunk_index"
        ]


class EmbeddingModel(Document):
    """MongoDB model for vector embeddings."""
    
    document_id: int = Indexed()
    chunk_id: Optional[int] = Indexed()
    embedding_vector: List[float]  # Store as list, Beanie handles serialization
    model_name: str = Indexed()
    dimension: int
    metadata: dict = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "embeddings"
        indexes = [
            "document_id",
            "chunk_id",
            "model_name"
        ]
