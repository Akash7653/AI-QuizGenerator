from typing import List, Optional
import numpy as np
from loguru import logger
import pickle

# Optional import for sentence transformers
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except (ImportError, MemoryError) as e:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    logger.warning(f"sentence-transformers not available: {str(e)}. Embedding generation will be limited.")


class EmbeddingGenerator:
    """Generate text embeddings using sentence transformers."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize embedding model."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            logger.warning("Sentence transformers not available. Using mock embeddings.")
            self.model_name = model_name
            self.model = None
            self.dimension = 384  # Default dimension for MiniLM
            return
            
        self.model_name = model_name
        self.model = None
        self.dimension = None
        self._load_model()
    
    def _load_model(self):
        """Load the embedding model."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            logger.warning("Sentence transformers not available. Skipping model load.")
            return
            
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            self.dimension = self.model.get_embedding_dimension()
            logger.info(f"Model loaded successfully. Dimension: {self.dimension}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {str(e)}")
            raise
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a single text."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            logger.warning("Using mock embedding for text.")
            # Generate a simple hash-based mock embedding
            import hashlib
            hash_val = int(hashlib.md5(text.encode()).hexdigest(), 16)
            mock_embedding = np.array([hash_val % 1000 / 1000.0] * self.dimension, dtype=np.float32)
            return mock_embedding
            
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding
        except Exception as e:
            logger.error(f"Failed to generate embedding: {str(e)}")
            raise
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for multiple texts."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            logger.warning(f"Using mock embeddings for {len(texts)} texts.")
            return np.array([self.generate_embedding(text) for text in texts])
            
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {str(e)}")
            raise
    
    def embedding_to_bytes(self, embedding: np.ndarray) -> bytes:
        """Convert embedding to bytes for storage."""
        return pickle.dumps(embedding)
    
    def bytes_to_embedding(self, data: bytes) -> np.ndarray:
        """Convert bytes back to embedding."""
        return pickle.loads(data)
    
    def get_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings."""
        try:
            similarity = np.dot(embedding1, embedding2) / (
                np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
            )
            return float(similarity)
        except Exception as e:
            logger.error(f"Failed to calculate similarity: {str(e)}")
            return 0.0
    
    def get_similarities(
        self,
        query_embedding: np.ndarray,
        document_embeddings: List[np.ndarray]
    ) -> List[float]:
        """Calculate similarities between query and multiple documents."""
        similarities = []
        for doc_embedding in document_embeddings:
            similarity = self.get_similarity(query_embedding, doc_embedding)
            similarities.append(similarity)
        return similarities
    
    def find_most_similar(
        self,
        query_embedding: np.ndarray,
        document_embeddings: List[np.ndarray],
        top_k: int = 5
    ) -> List[tuple]:
        """Find most similar documents."""
        similarities = self.get_similarities(query_embedding, document_embeddings)
        
        # Get top-k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = [
            (idx, similarities[idx])
            for idx in top_indices
        ]
        
        return results


class EmbeddingManager:
    """Manage embeddings for documents."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize embedding manager."""
        self.generator = EmbeddingGenerator(model_name)
    
    def process_document_chunks(
        self,
        chunks: List[str],
        document_id: int
    ) -> List[dict]:
        """Process document chunks and generate embeddings."""
        logger.info(f"Processing {len(chunks)} chunks for document {document_id}")
        
        embeddings_data = []
        embeddings = self.generator.generate_embeddings(chunks)
        
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            embedding_bytes = self.generator.embedding_to_bytes(embedding)
            
            embeddings_data.append({
                "document_id": document_id,
                "chunk_index": i,
                "embedding_vector": embedding_bytes,
                "model_name": self.generator.model_name,
                "dimension": self.generator.dimension
            })
        
        logger.info(f"Generated {len(embeddings_data)} embeddings")
        return embeddings_data
    
    def search_similar_chunks(
        self,
        query: str,
        document_embeddings: List[tuple],
        top_k: int = 5
    ) -> List[dict]:
        """Search for similar chunks given a query."""
        query_embedding = self.generator.generate_embedding(query)
        
        results = []
        for chunk_id, embedding_bytes, chunk_text in document_embeddings:
            embedding = self.generator.bytes_to_embedding(embedding_bytes)
            similarity = self.generator.get_similarity(query_embedding, embedding)
            
            results.append({
                "chunk_id": chunk_id,
                "chunk_text": chunk_text,
                "similarity": similarity
            })
        
        # Sort by similarity and return top-k
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]
