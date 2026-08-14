from sqlalchemy import Column, String, Text, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel


class DocumentType(str, enum.Enum):
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


class DocumentStatus(str, enum.Enum):
    """Document processing status."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Document(BaseModel):
    """Document model for storing uploaded content."""
    __tablename__ = "documents"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    file_path = Column(String(500), nullable=True)
    original_text = Column(Text, nullable=True)
    cleaned_text = Column(Text, nullable=True)
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.UPLOADED)
    processing_error = Column(Text, nullable=True)
    language = Column(String(10), nullable=True)
    word_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    embeddings = relationship("Embedding", back_populates="document", cascade="all, delete-orphan")
