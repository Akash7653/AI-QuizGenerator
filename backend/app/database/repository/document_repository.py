from typing import Optional, List, Dict, Any
from app.database.mongodb_models import DocumentModel, DocumentType, DocumentStatus
from app.database.repository.base import BaseRepository


class DocumentRepository(BaseRepository[DocumentModel]):
    """Repository for Document model."""
    
    def __init__(self):
        super().__init__(DocumentModel)
    
    async def get_by_user_id(self, user_id: int, skip: int = 0, limit: int = 100) -> List[DocumentModel]:
        """Get documents by user ID."""
        return await self.model.find(self.model.user_id == user_id).skip(skip).limit(limit).to_list()
    
    async def get_by_type(self, document_type: DocumentType, skip: int = 0, limit: int = 100) -> List[DocumentModel]:
        """Get documents by type."""
        return await self.model.find(self.model.document_type == document_type).skip(skip).limit(limit).to_list()
    
    async def get_by_status(self, status: DocumentStatus, skip: int = 0, limit: int = 100) -> List[DocumentModel]:
        """Get documents by status."""
        return await self.model.find(self.model.status == status).skip(skip).limit(limit).to_list()
    
    async def get_by_user_and_type(
        self, 
        user_id: int, 
        document_type: DocumentType,
        skip: int = 0, 
        limit: int = 100
    ) -> List[DocumentModel]:
        """Get documents by user and type."""
        return await self.model.find({
            "user_id": user_id,
            "document_type": document_type
        }).skip(skip).limit(limit).to_list()
    
    async def search_documents(self, query: str, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[DocumentModel]:
        """Search documents by title or description."""
        import re
        pattern = re.compile(query, re.IGNORECASE)
        
        if user_id:
            return await self.model.find({
                "user_id": user_id,
                "$or": [
                    {"title": pattern},
                    {"description": pattern}
                ]
            }).skip(skip).limit(limit).to_list()
        else:
            return await self.model.find({
                "$or": [
                    {"title": pattern},
                    {"description": pattern}
                ]
            }).skip(skip).limit(limit).to_list()
    
    async def update_status(self, document_id: int, status: DocumentStatus) -> Optional[DocumentModel]:
        """Update document status."""
        document = await self.get_by_id(document_id)
        if document:
            document.status = status
            await document.save()
        return document
    
    async def update_processing_error(self, document_id: int, error: str) -> Optional[DocumentModel]:
        """Update document processing error."""
        document = await self.get_by_id(document_id)
        if document:
            document.processing_error = error
            document.status = DocumentStatus.FAILED
            await document.save()
        return document
    
    async def update_cleaned_text(self, document_id: int, cleaned_text: str, word_count: int) -> Optional[DocumentModel]:
        """Update document cleaned text."""
        document = await self.get_by_id(document_id)
        if document:
            document.cleaned_text = cleaned_text
            document.word_count = word_count
            document.status = DocumentStatus.COMPLETED
            await document.save()
        return document
    
    async def get_user_document_stats(self, user_id: int) -> Dict[str, Any]:
        """Get document statistics for a user."""
        total_documents = await self.model.find(self.model.user_id == user_id).count()
        
        type_stats = {}
        for doc_type in DocumentType:
            type_stats[doc_type.value] = await self.model.find({
                "user_id": user_id,
                "document_type": doc_type
            }).count()
        
        status_stats = {}
        for status in DocumentStatus:
            status_stats[status.value] = await self.model.find({
                "user_id": user_id,
                "status": status
            }).count()
        
        return {
            "total_documents": total_documents,
            "type_distribution": type_stats,
            "status_distribution": status_stats
        }
