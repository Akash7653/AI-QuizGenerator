from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from app.database.schemas.document import (
    DocumentCreate, DocumentResponse, DocumentUploadResponse,
    TextPasteRequest, URLFetchRequest, TopicRequest, YouTubeTranscriptRequest
)
from app.database.mongodb_models import UserModel, DocumentType, DocumentStatus
from app.middleware.auth import get_current_user
from app.nlp.extractor import TextExtractor
from app.nlp.cleaner import TextCleaner
from app.nlp.chunker import TextChunker
from app.nlp.embedding import EmbeddingGenerator
import os
import uuid
from loguru import logger

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = None,
    description: str = None,
    current_user: UserModel = Depends(get_current_user)
):
    """Upload and process a document file."""
    try:
        # Validate file type
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in ['pdf', 'docx', 'txt', 'pptx']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type"
            )

        # Create upload directory if it doesn't exist
        upload_dir = "./storage/uploads"
        os.makedirs(upload_dir, exist_ok=True)

        # Generate unique filename
        file_path = os.path.join(upload_dir, f"{uuid.uuid4()}_{file.filename}")

        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Create document record
        document_data = {
            "user_id": current_user.id,
            "title": title or file.filename,
            "description": description,
            "document_type": DocumentType[file_extension.upper()],
            "file_path": file_path,
            "status": DocumentStatus.PROCESSING
        }

        from app.database.repository.document_repository import DocumentRepository
        doc_repo = DocumentRepository()
        document = await doc_repo.create(document_data)

        # Process document asynchronously (simplified for now)
        # In production, this would be a Celery task
        try:
            # Extract text
            text = await TextExtractor.extract_from_file(file_path, file_extension)

            # Clean text
            cleaned_text = TextCleaner.clean_text(text)

            # Get statistics
            word_count = TextCleaner.get_word_count(cleaned_text)

            # Update document
            await doc_repo.update_cleaned_text(document.id, cleaned_text, word_count)

            logger.info(f"Document {document.id} processed successfully")

        except Exception as e:
            logger.error(f"Document processing failed: {str(e)}")
            await doc_repo.update_status(document.id, DocumentStatus.FAILED)
            await doc_repo.update_processing_error(document.id, str(e))

        return DocumentUploadResponse(
            document_id=str(document.id),
            status=document.status,
            message="Document uploaded and processed successfully"
        )

    except Exception as e:
        logger.error(f"Document upload failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document upload failed: {str(e)}"
        )


@router.post("/text", response_model=DocumentUploadResponse)
async def paste_text(
    request: TextPasteRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """Process pasted text as a document."""
    try:
        # Clean text
        cleaned_text = TextCleaner.clean_text(request.content)
        word_count = TextCleaner.get_word_count(cleaned_text)

        # Create document record
        document_data = {
            "user_id": current_user.id,
            "title": request.title,
            "description": request.description,
            "document_type": DocumentType.PASTED_TEXT,
            "original_text": request.content,
            "cleaned_text": cleaned_text,
            "word_count": word_count,
            "status": DocumentStatus.COMPLETED
        }

        from app.database.repository.document_repository import DocumentRepository
        doc_repo = DocumentRepository()
        document = await doc_repo.create(document_data)

        logger.info(f"Text document {document.id} created successfully")

        return DocumentUploadResponse(
            document_id=str(document.id),
            status=document.status,
            message="Text document created successfully"
        )

    except Exception as e:
        logger.error(f"Text document creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text document creation failed: {str(e)}"
        )


@router.post("/url", response_model=DocumentUploadResponse)
async def fetch_url(
    request: URLFetchRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """Fetch and process content from URL."""
    try:
        # Extract text from URL (placeholder)
        text = TextExtractor.extract_from_url(request.url)

        if not text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to extract content from URL"
            )

        # Clean text
        cleaned_text = TextCleaner.clean_text(text)
        word_count = TextCleaner.get_word_count(cleaned_text)

        # Create document record
        document_data = {
            "user_id": current_user.id,
            "title": request.title or request.url,
            "description": request.description,
            "document_type": DocumentType.WEBSITE_URL,
            "original_text": text,
            "cleaned_text": cleaned_text,
            "word_count": word_count,
            "status": DocumentStatus.COMPLETED
        }

        from app.database.repository.document_repository import DocumentRepository
        doc_repo = DocumentRepository()
        document = await doc_repo.create(document_data)

        logger.info(f"URL document {document.id} created successfully")

        return DocumentUploadResponse(
            document_id=str(document.id),
            status=document.status,
            message="URL content fetched successfully"
        )

    except Exception as e:
        logger.error(f"URL document creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"URL document creation failed: {str(e)}"
        )


@router.post("/topic", response_model=DocumentUploadResponse)
async def create_topic_document(
    request: TopicRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """Create document from topic (placeholder for AI content generation)."""
    try:
        # In a real implementation, this would generate content using AI
        # For now, create a placeholder document
        document_data = {
            "user_id": current_user.id,
            "title": request.topic,
            "description": request.description,
            "document_type": DocumentType.TOPIC,
            "original_text": f"Content about {request.topic} will be generated by AI.",
            "cleaned_text": f"Content about {request.topic} will be generated by AI.",
            "word_count": 10,
            "status": DocumentStatus.COMPLETED
        }

        from app.database.repository.document_repository import DocumentRepository
        doc_repo = DocumentRepository()
        document = await doc_repo.create(document_data)

        logger.info(f"Topic document {document.id} created successfully")

        return DocumentUploadResponse(
            document_id=str(document.id),
            status=document.status,
            message="Topic document created successfully"
        )

    except Exception as e:
        logger.error(f"Topic document creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Topic document creation failed: {str(e)}"
        )


@router.post("/youtube", response_model=DocumentUploadResponse)
async def fetch_youtube_transcript(
    request: YouTubeTranscriptRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """Fetch and process YouTube transcript."""
    try:
        # Extract transcript (placeholder)
        text = TextExtractor.extract_from_youtube(request.video_url)

        if not text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to extract YouTube transcript"
            )

        # Clean text
        cleaned_text = TextCleaner.clean_text(text)
        word_count = TextCleaner.get_word_count(cleaned_text)

        # Create document record
        document_data = {
            "user_id": current_user.id,
            "title": request.title or "YouTube Transcript",
            "description": request.description,
            "document_type": DocumentType.YOUTUBE_TRANSCRIPT,
            "original_text": text,
            "cleaned_text": cleaned_text,
            "word_count": word_count,
            "status": DocumentStatus.COMPLETED
        }

        from app.database.repository.document_repository import DocumentRepository
        doc_repo = DocumentRepository()
        document = await doc_repo.create(document_data)

        logger.info(f"YouTube transcript document {document.id} created successfully")

        return DocumentUploadResponse(
            document_id=str(document.id),
            status=document.status,
            message="YouTube transcript fetched successfully"
        )

    except Exception as e:
        logger.error(f"YouTube transcript creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube transcript creation failed: {str(e)}"
        )


@router.get("/", response_model=List[DocumentResponse])
async def get_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_user)
):
    """Get all documents for current user."""
    from app.database.repository.document_repository import DocumentRepository
    doc_repo = DocumentRepository()

    documents = await doc_repo.get_by_user_id(current_user.id, skip, limit)
    return documents


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Get specific document by ID."""
    from app.database.repository.document_repository import DocumentRepository
    doc_repo = DocumentRepository()

    document = await doc_repo.get_by_id(document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return document


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a document."""
    from app.database.repository.document_repository import DocumentRepository
    doc_repo = DocumentRepository()

    document = await doc_repo.get_by_id(document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Delete file if exists
    if document.file_path and os.path.exists(document.file_path):
        os.remove(document.file_path)

    success = await doc_repo.delete(document_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )

    return {"message": "Document deleted successfully"}
