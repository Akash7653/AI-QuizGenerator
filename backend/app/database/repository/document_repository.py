from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.database.models.document import Document, DocumentType, DocumentStatus
from app.database.repository.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    """Repository for Document model."""
    
    def __init__(self, db: Session):
        super().__init__(Document, db)
    
    def get_by_user_id(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Document]:
        """Get documents by user ID."""
        return self.db.query(Document).filter(
            Document.user_id == user_id
        ).offset(skip).limit(limit).all()
    
    def get_by_type(self, document_type: DocumentType, skip: int = 0, limit: int = 100) -> List[Document]:
        """Get documents by type."""
        return self.db.query(Document).filter(
            Document.document_type == document_type
        ).offset(skip).limit(limit).all()
    
    def get_by_status(self, status: DocumentStatus, skip: int = 0, limit: int = 100) -> List[Document]:
        """Get documents by status."""
        return self.db.query(Document).filter(
            Document.status == status
        ).offset(skip).limit(limit).all()
    
    def get_by_user_and_type(
        self, 
        user_id: int, 
        document_type: DocumentType,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Document]:
        """Get documents by user and type."""
        return self.db.query(Document).filter(
            and_(
                Document.user_id == user_id,
                Document.document_type == document_type
            )
        ).offset(skip).limit(limit).all()
    
    def search_documents(self, query: str, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[Document]:
        """Search documents by title or description."""
        search_pattern = f"%{query}%"
        query_filter = or_(
            Document.title.ilike(search_pattern),
            Document.description.ilike(search_pattern)
        )
        
        if user_id:
            query_filter = and_(query_filter, Document.user_id == user_id)
        
        return self.db.query(Document).filter(query_filter).offset(skip).limit(limit).all()
    
    def update_status(self, document_id: int, status: DocumentStatus) -> Optional[Document]:
        """Update document status."""
        document = self.get_by_id(document_id)
        if document:
            document.status = status
            self.db.commit()
            self.db.refresh(document)
        return document
    
    def update_processing_error(self, document_id: int, error: str) -> Optional[Document]:
        """Update document processing error."""
        document = self.get_by_id(document_id)
        if document:
            document.processing_error = error
            document.status = DocumentStatus.FAILED
            self.db.commit()
            self.db.refresh(document)
        return document
    
    def update_cleaned_text(self, document_id: int, cleaned_text: str, word_count: int) -> Optional[Document]:
        """Update document cleaned text."""
        document = self.get_by_id(document_id)
        if document:
            document.cleaned_text = cleaned_text
            document.word_count = word_count
            document.status = DocumentStatus.COMPLETED
            self.db.commit()
            self.db.refresh(document)
        return document
    
    def get_user_document_stats(self, user_id: int) -> Dict[str, Any]:
        """Get document statistics for a user."""
        total_documents = self.db.query(Document).filter(Document.user_id == user_id).count()
        
        type_stats = {}
        for doc_type in DocumentType:
            type_stats[doc_type.value] = self.db.query(Document).filter(
                and_(
                    Document.user_id == user_id,
                    Document.document_type == doc_type
                )
            ).count()
        
        status_stats = {}
        for status in DocumentStatus:
            status_stats[status.value] = self.db.query(Document).filter(
                and_(
                    Document.user_id == user_id,
                    Document.status == status
                )
            ).count()
        
        return {
            "total_documents": total_documents,
            "type_distribution": type_stats,
            "status_distribution": status_stats
        }
