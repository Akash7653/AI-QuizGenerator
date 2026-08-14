from sqlalchemy import Column, Text, Integer, ForeignKey, LargeBinary, String
from sqlalchemy.orm import relationship
from .base import BaseModel


class Embedding(BaseModel):
    """Embedding model for vector storage."""
    __tablename__ = "embeddings"
    
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_id = Column(Integer, ForeignKey("document_chunks.id"), nullable=True)
    embedding_vector = Column(LargeBinary, nullable=False)  # Stored as binary
    model_name = Column(String(100), nullable=False)
    dimension = Column(Integer, nullable=False)
    
    # Relationships
    document = relationship("Document", back_populates="embeddings")
