from sqlalchemy import Column, Text, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship
from .base import BaseModel


class DocumentChunk(BaseModel):
    """Document chunk model for text segmentation."""
    __tablename__ = "document_chunks"
    
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    start_position = Column(Integer, nullable=True)
    end_position = Column(Integer, nullable=True)
    word_count = Column(Integer, default=0)
    token_count = Column(Integer, default=0)
    
    # Relationships
    document = relationship("Document", back_populates="chunks")
