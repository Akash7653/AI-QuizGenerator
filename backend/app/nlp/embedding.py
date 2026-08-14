from typing import List
import hashlib
import pickle
from typing import Optional

import numpy as np
from loguru import logger

try:
    import google.generativeai as genai
    from app.config.settings import settings
except Exception as exc:  # pragma: no cover - runtime fallback
    genai = None
    settings = None
    logger.warning(f"Gemini SDK unavailable during embedding init: {exc}")


class EmbeddingGenerator:
    """Lightweight embedding generator.

    Uses Gemini embeddings when configured, otherwise falls back to a deterministic,
    memory-safe NumPy vector derived from the input text. This avoids loading large
    sentence-transformer models during startup and keeps Render Free memory usage low.
    """

    def __init__(self, model_name: str = "text-embedding-004"):
        self.model_name = model_name
        self.model = genai
        self.dimension = 768

    def _configure_gemini(self):
        if not genai or not settings or not getattr(settings, "GEMINI_API_KEY", None):
            return False

        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            return True
        except Exception as exc:
            logger.warning(f"Gemini embedding configuration failed: {exc}")
            return False

    def _fallback_embedding(self, text: str) -> np.ndarray:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        vector = np.frombuffer(digest, dtype=np.uint8).astype(np.float32)
        padded = np.zeros(self.dimension, dtype=np.float32)
        padded[: min(len(vector), self.dimension)] = vector[: min(len(vector), self.dimension)]
        norm = np.linalg.norm(padded)
        if norm > 0:
            padded = padded / norm
        return padded

    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a single text."""
        if not text:
            return np.zeros(self.dimension, dtype=np.float32)

        if self._configure_gemini():
            try:
                result = genai.embed_content(
                    model=self.model_name,
                    content=text,
                    task_type="retrieval_document",
                    title="quiz-content"
                )
                embedding = result.get("embedding") if isinstance(result, dict) else result.embedding
                if embedding:
                    arr = np.asarray(embedding, dtype=np.float32)
                    self.dimension = max(self.dimension, arr.size)
                    return arr.astype(np.float32)
            except Exception as exc:
                logger.warning(f"Gemini embedding failed; using fallback embedding: {exc}")

        return self._fallback_embedding(text)

    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for multiple texts."""
        if not texts:
            return np.empty((0, self.dimension), dtype=np.float32)
        return np.array([self.generate_embedding(text) for text in texts], dtype=np.float32)

    def embedding_to_bytes(self, embedding: np.ndarray) -> bytes:
        """Convert embedding to bytes for storage."""
        return pickle.dumps(embedding)

    def bytes_to_embedding(self, data: bytes) -> np.ndarray:
        """Convert bytes back to embedding."""
        return pickle.loads(data)

    def get_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings."""
        try:
            dot = float(np.dot(embedding1, embedding2))
            norm1 = float(np.linalg.norm(embedding1))
            norm2 = float(np.linalg.norm(embedding2))
            if norm1 == 0 or norm2 == 0:
                return 0.0
            return dot / (norm1 * norm2)
        except Exception as exc:
            logger.error(f"Failed to calculate similarity: {exc}")
            return 0.0

    def get_similarities(self, query_embedding: np.ndarray, document_embeddings: List[np.ndarray]) -> List[float]:
        """Calculate similarities between query and multiple documents."""
        return [self.get_similarity(query_embedding, doc_embedding) for doc_embedding in document_embeddings]

    def find_most_similar(self, query_embedding: np.ndarray, document_embeddings: List[np.ndarray], top_k: int = 5) -> List[tuple]:
        """Find most similar documents."""
        similarities = self.get_similarities(query_embedding, document_embeddings)
        top_indices = np.argsort(similarities)[::-1][:top_k]
        return [(idx, similarities[idx]) for idx in top_indices]


class EmbeddingManager:
    """Manage embeddings for documents."""

    def __init__(self, model_name: str = "text-embedding-004"):
        self.generator = EmbeddingGenerator(model_name)

    def process_document_chunks(self, chunks: List[str], document_id: int) -> List[dict]:
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

    def search_similar_chunks(self, query: str, document_embeddings: List[tuple], top_k: int = 5) -> List[dict]:
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

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]
