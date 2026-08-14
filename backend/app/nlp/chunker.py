from typing import List, Optional
import re
from loguru import logger


class TextChunker:
    """Text chunking for processing large documents."""
    
    @staticmethod
    def chunk_by_sentences(text: str, chunk_size: int = 5) -> List[str]:
        """Chunk text by sentences."""
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        
        for i in range(0, len(sentences), chunk_size):
            chunk = ' '.join(sentences[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk.strip())
        
        logger.info(f"Chunked text into {len(chunks)} sentence-based chunks")
        return chunks
    
    @staticmethod
    def chunk_by_paragraphs(text: str) -> List[str]:
        """Chunk text by paragraphs."""
        paragraphs = text.split('\n\n')
        chunks = [p.strip() for p in paragraphs if p.strip()]
        
        logger.info(f"Chunked text into {len(chunks)} paragraph-based chunks")
        return chunks
    
    @staticmethod
    def chunk_by_tokens(text: str, max_tokens: int = 500) -> List[str]:
        """Chunk text by approximate token count."""
        words = text.split()
        chunks = []
        current_chunk = []
        current_tokens = 0
        
        for word in words:
            # Approximate token count (1 token ≈ 0.75 words)
            word_tokens = len(word.split()) / 0.75
            
            if current_tokens + word_tokens > max_tokens and current_chunk:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_tokens = 0
            
            current_chunk.append(word)
            current_tokens += word_tokens
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        logger.info(f"Chunked text into {len(chunks)} token-based chunks")
        return chunks
    
    @staticmethod
    def chunk_by_characters(text: str, max_chars: int = 1000) -> List[str]:
        """Chunk text by character count."""
        chunks = []
        for i in range(0, len(text), max_chars):
            chunk = text[i:i + max_chars]
            if chunk.strip():
                chunks.append(chunk.strip())
        
        logger.info(f"Chunked text into {len(chunks)} character-based chunks")
        return chunks
    
    @staticmethod
    def intelligent_chunking(text: str, max_chunk_size: int = 1000, overlap: int = 100) -> List[str]:
        """Intelligent chunking with overlap and sentence boundaries."""
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = ""
        current_length = 0
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            # If adding this sentence would exceed the limit
            if current_length + len(sentence) > max_chunk_size and current_chunk:
                chunks.append(current_chunk.strip())
                
                # Start new chunk with overlap
                if overlap > 0 and current_chunk:
                    words = current_chunk.split()
                    overlap_words = words[-(overlap // 5):]  # Approximate word-based overlap
                    current_chunk = ' '.join(overlap_words) + " " + sentence
                    current_length = len(current_chunk)
                else:
                    current_chunk = sentence
                    current_length = len(sentence)
            else:
                current_chunk += " " + sentence if current_chunk else sentence
                current_length += len(sentence) + 1
        
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        
        logger.info(f"Intelligent chunking produced {len(chunks)} chunks with {overlap} char overlap")
        return chunks
    
    @staticmethod
    def semantic_chunking(text: str, similarity_threshold: float = 0.3) -> List[str]:
        """Semantic chunking based on topic changes (placeholder)."""
        # This would require embedding similarity calculation
        # For now, use intelligent chunking as fallback
        logger.warning("Semantic chunking not fully implemented, using intelligent chunking")
        return TextChunker.intelligent_chunking(text)
    
    @staticmethod
    def chunk_text(
        text: str,
        method: str = "intelligent",
        chunk_size: int = 1000,
        overlap: int = 100
    ) -> List[str]:
        """Main chunking method with multiple strategies."""
        chunkers = {
            "sentences": TextChunker.chunk_by_sentences,
            "paragraphs": TextChunker.chunk_by_paragraphs,
            "tokens": TextChunker.chunk_by_tokens,
            "characters": TextChunker.chunk_by_characters,
            "intelligent": TextChunker.intelligent_chunking,
            "semantic": TextChunker.semantic_chunking
        }
        
        chunker = chunkers.get(method.lower())
        if not chunker:
            logger.warning(f"Unknown chunking method: {method}, using intelligent")
            chunker = TextChunker.intelligent_chunking
        
        if method == "tokens":
            return chunker(text, chunk_size)
        elif method == "intelligent":
            return chunker(text, chunk_size, overlap)
        elif method == "sentences":
            return chunker(text, chunk_size)
        else:
            return chunker(text)
    
    @staticmethod
    def get_chunk_metadata(chunks: List[str], original_text: str) -> List[dict]:
        """Get metadata for each chunk."""
        metadata = []
        position = 0
        
        for i, chunk in enumerate(chunks):
            start_pos = original_text.find(chunk, position)
            end_pos = start_pos + len(chunk)
            
            metadata.append({
                "chunk_index": i,
                "start_position": start_pos,
                "end_position": end_pos,
                "word_count": len(chunk.split()),
                "character_count": len(chunk)
            })
            
            position = end_pos
        
        return metadata
