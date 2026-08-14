from typing import List, Dict, Any, Optional, Tuple
import pickle
import os
from loguru import logger

try:
    import numpy as np
except Exception:  # pragma: no cover - optional dependency
    np = None

try:
    import faiss
except Exception:  # pragma: no cover - optional dependency
    faiss = None

from app.nlp.embedding import EmbeddingGenerator


class VectorDatabase:
    """FAISS-based vector database for similarity search."""
    
    def __init__(self, dimension: int = 384, index_type: str = "flat"):
        """Initialize vector database."""
        self.dimension = dimension
        self.index_type = index_type
        self.index = None
        self.embedding_generator = None
        self.documents = []  # Store document metadata

        if np is None or faiss is None:
            logger.warning("Vector database is unavailable because NumPy/FAISS is not installed. Install requirements-ai.txt to enable AI search.")
            return

        self.embedding_generator = EmbeddingGenerator()
        self._initialize_index()
    
    def _initialize_index(self):
        """Initialize FAISS index."""
        if np is None or faiss is None:
            logger.warning("FAISS index not initialized because required AI libraries are missing.")
            self.index = None
            return

        try:
            if self.index_type == "flat":
                # Flat L2 index
                self.index = faiss.IndexFlatL2(self.dimension)
            elif self.index_type == "ivf":
                # IVF index for faster search with large datasets
                quantizer = faiss.IndexFlatL2(self.dimension)
                self.index = faiss.IndexIVFFlat(quantizer, self.dimension, 100)
            elif self.index_type == "hnsw":
                # HNSW index for better accuracy/speed tradeoff
                self.index = faiss.IndexHNSWFlat(self.dimension, 32)
            else:
                logger.warning(f"Unknown index type: {self.index_type}, using flat")
                self.index = faiss.IndexFlatL2(self.dimension)
            
            logger.info(f"Initialized FAISS index with type: {self.index_type}")
            
        except Exception as e:
            logger.error(f"Failed to initialize FAISS index: {str(e)}")
            raise
    
    def add_embeddings(
        self,
        embeddings: Any,
        document_ids: List[int],
        chunk_indices: List[int],
        chunk_texts: List[str]
    ) -> bool:
        """Add embeddings to the index."""
        if np is None or faiss is None or self.index is None:
            logger.warning("Embedding add skipped because vector search is unavailable.")
            return False

        try:
            # Ensure embeddings are in the right format
            if isinstance(embeddings, list):
                embeddings = np.array(embeddings, dtype=np.float32)
            
            if embeddings.ndim == 1:
                embeddings = embeddings.reshape(1, -1)
            
            # Add to index
            self.index.add(embeddings)
            
            # Store metadata
            for doc_id, chunk_idx, chunk_text in zip(document_ids, chunk_indices, chunk_texts):
                self.documents.append({
                    "document_id": doc_id,
                    "chunk_index": chunk_idx,
                    "chunk_text": chunk_text
                })
            
            logger.info(f"Added {len(embeddings)} embeddings to index. Total: {self.index.ntotal}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add embeddings: {str(e)}")
            return False
    
    def search(
        self,
        query: str,
        top_k: int = 5,
        document_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar chunks."""
        if self.index is None or self.embedding_generator is None:
            logger.warning("Vector search skipped because the vector store is unavailable.")
            return []

        try:
            # Generate query embedding
            query_embedding = self.embedding_generator.generate_embedding(query)
            query_embedding = query_embedding.reshape(1, -1).astype(np.float32)
            
            # Search
            distances, indices = self.index.search(query_embedding, top_k)
            
            # Prepare results
            results = []
            for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
                if idx < len(self.documents):
                    doc = self.documents[idx]
                    
                    # Filter by document_id if specified
                    if document_id is not None and doc["document_id"] != document_id:
                        continue
                    
                    results.append({
                        "rank": i + 1,
                        "document_id": doc["document_id"],
                        "chunk_index": doc["chunk_index"],
                        "chunk_text": doc["chunk_text"],
                        "similarity_score": float(1 / (1 + distance)),  # Convert distance to similarity
                        "distance": float(distance)
                    })
            
            logger.info(f"Search returned {len(results)} results")
            return results
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return []
    
    def search_by_embedding(
        self,
        embedding: Any,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Search using pre-computed embedding."""
        if self.index is None:
            return []

        try:
            if isinstance(embedding, list):
                embedding = np.array(embedding, dtype=np.float32)
            
            if embedding.ndim == 1:
                embedding = embedding.reshape(1, -1)
            
            distances, indices = self.index.search(embedding, top_k)
            
            results = []
            for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
                if idx < len(self.documents):
                    doc = self.documents[idx]
                    results.append({
                        "rank": i + 1,
                        "document_id": doc["document_id"],
                        "chunk_index": doc["chunk_index"],
                        "chunk_text": doc["chunk_text"],
                        "similarity_score": float(1 / (1 + distance)),
                        "distance": float(distance)
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Embedding search failed: {str(e)}")
            return []
    
    def get_document_chunks(
        self,
        document_id: int,
        top_k: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get all chunks for a specific document."""
        chunks = [
            doc for doc in self.documents
            if doc["document_id"] == document_id
        ]
        
        if top_k:
            chunks = chunks[:top_k]
        
        return chunks
    
    def delete_document(self, document_id: int) -> bool:
        """Delete all chunks for a document (requires index rebuild)."""
        try:
            # Note: FAISS doesn't support direct deletion, so we need to rebuild
            original_count = len(self.documents)
            
            # Filter out document chunks
            self.documents = [
                doc for doc in self.documents
                if doc["document_id"] != document_id
            ]
            
            # Rebuild index with remaining documents
            if self.documents:
                self._rebuild_index()
            else:
                # Reset index if no documents left
                self._initialize_index()
            
            deleted_count = original_count - len(self.documents)
            logger.info(f"Deleted {deleted_count} chunks for document {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document: {str(e)}")
            return False
    
    def _rebuild_index(self):
        """Rebuild index from current documents."""
        try:
            # Create new index
            self._initialize_index()
            
            # Re-add all embeddings (would need to store original embeddings)
            # For now, this is a simplified version
            logger.warning("Index rebuild requires storing original embeddings")
            
        except Exception as e:
            logger.error(f"Failed to rebuild index: {str(e)}")
    
    def save_index(self, file_path: str):
        """Save index to disk."""
        try:
            # Save FAISS index
            faiss.write_index(self.index, f"{file_path}.index")
            
            # Save metadata
            with open(f"{file_path}.metadata", 'wb') as f:
                pickle.dump(self.documents, f)
            
            logger.info(f"Saved index to {file_path}")
            
        except Exception as e:
            logger.error(f"Failed to save index: {str(e)}")
    
    def load_index(self, file_path: str) -> bool:
        """Load index from disk."""
        try:
            # Load FAISS index
            self.index = faiss.read_index(f"{file_path}.index")
            
            # Load metadata
            with open(f"{file_path}.metadata", 'rb') as f:
                self.documents = pickle.load(f)
            
            logger.info(f"Loaded index from {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load index: {str(e)}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        return {
            "total_embeddings": self.index.ntotal if self.index else 0,
            "total_documents": len(set(doc["document_id"] for doc in self.documents)),
            "total_chunks": len(self.documents),
            "dimension": self.dimension,
            "index_type": self.index_type
        }


class VectorStore:
    """High-level vector store management."""
    
    def __init__(self, storage_path: str = "./storage/vector_db"):
        """Initialize vector store."""
        self.storage_path = storage_path
        self.vector_dbs = {}  # Multiple indexes for different purposes
        os.makedirs(storage_path, exist_ok=True)
    
    def get_or_create_index(
        self,
        name: str = "default",
        dimension: int = 384,
        index_type: str = "flat"
    ) -> VectorDatabase:
        """Get or create a vector database index."""
        if name not in self.vector_dbs:
            # Try to load from disk
            file_path = os.path.join(self.storage_path, name)
            if os.path.exists(f"{file_path}.index"):
                vector_db = VectorDatabase(dimension, index_type)
                if vector_db.load_index(file_path):
                    self.vector_dbs[name] = vector_db
                    return vector_db
            
            # Create new index
            vector_db = VectorDatabase(dimension, index_type)
            self.vector_dbs[name] = vector_db
        
        return self.vector_dbs[name]
    
    def save_all_indexes(self):
        """Save all indexes to disk."""
        for name, vector_db in self.vector_dbs.items():
            file_path = os.path.join(self.storage_path, name)
            vector_db.save_index(file_path)
    
    def get_all_stats(self) -> Dict[str, Any]:
        """Get statistics for all indexes."""
        stats = {}
        for name, vector_db in self.vector_dbs.items():
            stats[name] = vector_db.get_stats()
        return stats
