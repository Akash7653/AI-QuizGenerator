from celery import shared_task
from loguru import logger
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.nlp.extractor import TextExtractor
from app.nlp.cleaner import TextCleaner
from app.nlp.chunker import TextChunker
from app.nlp.embedding import EmbeddingManager
from app.database.models.document import Document, DocumentStatus
from app.database.repository import DocumentRepository


@shared_task(bind=True, max_retries=3)
def process_document(self, document_id: int):
    """Process document asynchronously."""
    logger.info(f"Processing document {document_id}")
    
    db = SessionLocal()
    try:
        doc_repo = DocumentRepository(db)
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
                logger.error(f"Text extraction failed: {str(e)}")
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
        
        # Store embeddings in database (simplified)
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
    finally:
        db.close()


@shared_task
def generate_document_embeddings(document_id: int):
    """Generate embeddings for document chunks."""
    logger.info(f"Generating embeddings for document {document_id}")
    
    db = SessionLocal()
    try:
        doc_repo = DocumentRepository(db)
        document = doc_repo.get_by_id(document_id)
        
        if not document or not document.cleaned_text:
            logger.error(f"Document {document_id} not found or not processed")
            return {"status": "error", "message": "Document not ready"}
        
        # Chunk text
        chunks = TextChunker.chunk_text(document.cleaned_text, method="intelligent")
        
        # Generate embeddings
        embedding_manager = EmbeddingManager()
        embeddings_data = embedding_manager.process_document_chunks(chunks, document_id)
        
        # Store in vector database
        from app.utils.vector_db import VectorStore
        vector_store = VectorStore()
        vector_db = vector_store.get_or_create_index("documents")
        
        # Add embeddings to vector database
        import numpy as np
        embeddings = np.array([
            embedding_manager.generator.bytes_to_embedding(data["embedding_vector"])
            for data in embeddings_data
        ])
        
        document_ids = [document_id] * len(embeddings)
        chunk_indices = [data["chunk_index"] for data in embeddings_data]
        chunk_texts = [chunks[i] for i in chunk_indices]
        
        vector_db.add_embeddings(embeddings, document_ids, chunk_indices, chunk_texts)
        
        logger.info(f"Embeddings generated for document {document_id}")
        return {
            "status": "success",
            "document_id": document_id,
            "embeddings_count": len(embeddings_data)
        }
        
    except Exception as e:
        logger.error(f"Embedding generation failed: {str(e)}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
