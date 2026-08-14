from typing import Optional, List
import re
from loguru import logger


class TextCleaner:
    """Text cleaning and preprocessing."""
    
    @staticmethod
    def remove_headers_footers(text: str) -> str:
        """Remove common headers and footers."""
        # Remove page numbers
        text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
        
        # Remove common header/footer patterns
        text = re.sub(r'Page \d+ of \d+', '', text)
        text = re.sub(r'Confidential|Draft|Internal', '', text, flags=re.IGNORECASE)
        
        return text
    
    @staticmethod
    def remove_special_characters(text: str) -> str:
        """Remove special characters but keep basic punctuation."""
        # Keep letters, numbers, and basic punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)\[\]\{\}\"\'\/]', ' ', text)
        return text
    
    @staticmethod
    def normalize_whitespace(text: str) -> str:
        """Normalize whitespace."""
        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)
        # Replace multiple newlines with single newline
        text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
        return text.strip()
    
    @staticmethod
    def remove_urls(text: str) -> str:
        """Remove URLs from text."""
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        return text
    
    @staticmethod
    def remove_emails(text: str) -> str:
        """Remove email addresses from text."""
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '', text)
        return text
    
    @staticmethod
    def remove_phone_numbers(text: str) -> str:
        """Remove phone numbers from text."""
        text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '', text)
        text = re.sub(r'\b\+\d{1,3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{4}\b', '', text)
        return text
    
    @staticmethod
    def remove_extra_newlines(text: str) -> str:
        """Remove excessive newlines."""
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text
    
    @staticmethod
    def clean_text(text: str, aggressive: bool = False) -> str:
        """Comprehensive text cleaning."""
        logger.info("Starting text cleaning")
        
        # Basic cleaning
        text = TextCleaner.remove_headers_footers(text)
        text = TextCleaner.remove_urls(text)
        text = TextCleaner.remove_emails(text)
        
        if aggressive:
            text = TextCleaner.remove_phone_numbers(text)
            text = TextCleaner.remove_special_characters(text)
        
        text = TextCleaner.normalize_whitespace(text)
        text = TextCleaner.remove_extra_newlines(text)
        
        logger.info(f"Text cleaning completed. Original length: {len(text)}")
        return text
    
    @staticmethod
    def detect_language(text: str) -> str:
        """Detect language of text (simplified version)."""
        # This is a simplified version. For production, use langdetect or similar
        # For now, default to English
        logger.info("Language detection - defaulting to English")
        return "en"
    
    @staticmethod
    def truncate_text(text: str, max_length: int = 10000) -> str:
        """Truncate text to maximum length."""
        if len(text) <= max_length:
            return text
        return text[:max_length] + "..."
    
    @staticmethod
    def get_word_count(text: str) -> int:
        """Get word count of text."""
        words = text.split()
        return len(words)
    
    @staticmethod
    def get_sentence_count(text: str) -> int:
        """Get sentence count of text."""
        sentences = re.split(r'[.!?]+', text)
        return len([s for s in sentences if s.strip()])
    
    @staticmethod
    def get_text_statistics(text: str) -> dict:
        """Get comprehensive text statistics."""
        return {
            "word_count": TextCleaner.get_word_count(text),
            "sentence_count": TextCleaner.get_sentence_count(text),
            "character_count": len(text),
            "paragraph_count": len([p for p in text.split('\n\n') if p.strip()]),
            "avg_word_length": sum(len(word) for word in text.split()) / len(text.split()) if text.split() else 0
        }
