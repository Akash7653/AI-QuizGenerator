from celery import shared_task
from loguru import logger
from app.nlp.extractor import TextExtractor
from app.nlp.cleaner import TextCleaner
from app.nlp.chunker import TextChunker
from app.nlp.embedding import EmbeddingManager
from app.database.mongodb_models import DocumentModel, DocumentStatus
from app.database.repository.document_repository import DocumentRepository


@shared_task(bind=True, max_retries=3)
def process_document(self, document_id: int):
    """Process document asynchronously."""
    logger.info(f"Processing document {document_id}")
    
    try:
        doc_repo = DocumentRepository()
        document = doc_repo.get_by_id(document_id)
        
        if not document:
            logger.error(f"Document {document_id} not found")
            return {"status": "error", "message": "Document not found"}
        
        # Extract text if file exists
        if document.file_path:
            try:
                text = TextExtractor.extract_from_file(
                    document.file_path,
                    document.document_type.value
                )
            except Exception as e:
                logger.error(f"Text extraction failed: {str(e)})
                doc_repo.update_status(document_id, DocumentStatus.FAILED)
                doc_repo.update_processing_error(document_id, str(e))
                return {"status": "error", "message": str(e)}
        else:
            text = document.original_text
        
        if not text:
            logger.error(f"No text found for document {document_id}")
            doc_repo.update_status(document_id, DocumentStatus.FAILED)
            doc_repo.update_processing_error(document_id, "No text content")
            return {"status": "error", "message": "No text content"}
        
        # Clean text
        cleaned_text = TextCleaner.clean_text(text)
        word_count = TextCleaner.get_word_count(cleaned_text)
        
        # Chunk text
        chunks = TextChunker.chunk_text(cleaned_text, method="intelligent")
        
        # Generate embeddings
        embedding_manager = EmbeddingManager()
        embeddings_data = embedding_manager.process_document_chunks(chunks, document_id)
        
        # Store embeddings in MongoDB (simplified)
        # In production, this would use the repository pattern
        
        # Update document
        doc_repo.update_cleaned_text(document_id, cleaned_text, word_count)
        
        logger.info(f"Document {document_id} processed successfully")
        return {
            "status": "success",
            "document_id": document_id,
            "word_count": word_count,
            "chunks_count": len(chunks),
            "embeddings_count": len(embeddings_data)
        }
        
    except Exception as e:
        logger.error(f"Document processing failed: {str(e)}")
        doc_repo.update_status(document_id, DocumentStatus.FAILED)
        doc_repo.update_processing_error(document_id, str(e))
        raise self.retry(exc=e, countdown=60)


@shared_task
def generate_document_embeddings(document_id: int):
    """Generate embeddings for document chunks."""
    logger.info(f"Generating embeddings for document {document_id}")
    
    try:
        doc_repo = DocumentRepository()
        document = doc_repo.get_by_id(document_id)
        
        if not document or not document.cleaned_text:
            logger.error(f"Document {document_id} not found or not processed")
            return {"status": "error", "message": "Document not ready"}
        
        # Chunk text
        chunks = TextChunker.chunk_text(document.cleaned_text, method="intelligent")
        
        # Generate embeddings
        embedding_manager = EmbeddingManager()
        embeddings_data = embedding_manager.process_document_chunks(chunks, document_id)
        
        # Store embeddings in MongoDB using the repository pattern
        from app.database.mongodb_models import EmbeddingModel
        from app.database.mongodb_connection import get_mongodb
        import asyncio
        
        async def store_embeddings():
            client = await get_mongodb()
            db = client["quiz_generator"]
            
            for embedding_data in embeddings_data:
                embedding = EmbeddingModel(
                    document_id=document_id,
                    chunk_id=embedding_data.get("chunk_index"),
                    embedding_vector=embedding_data["embedding_vector"],
                    model_name=embedding_data.get("model_name", "default"),
                    dimension=len(embedding_data["embedding_vector"]),
                    metadata=embedding_data.get("metadata", {})
                )
                await embedding.insert()
        
        # Run async task
        asyncio.run(store_embeddings())
        
        logger.info(f"Embeddings generated for document {document_id}")
        return {
            "status": "success",
            "document_id": document_id,
            "embeddings_count": len(embeddings_data)
        }
        
    except Exception as e:
        logger.error(f"Embedding generation failed: {str(e)}")
        return {"status": "error", "message": str(e)}
