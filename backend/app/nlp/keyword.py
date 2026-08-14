from typing import List, Optional, Dict
import re
from collections import Counter
from loguru import logger


class KeywordExtractor:
    """Extract keywords and key phrases from text."""
    
    @staticmethod
    def extract_words(text: str, min_length: int = 3) -> List[str]:
        """Extract individual words from text."""
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        return [word for word in words if len(word) >= min_length]
    
    @staticmethod
    def extract_ngrams(text: str, n: int = 2) -> List[str]:
        """Extract n-grams from text."""
        words = text.lower().split()
        ngrams = []
        
        for i in range(len(words) - n + 1):
            ngram = ' '.join(words[i:i + n])
            ngrams.append(ngram)
        
        return ngrams
    
    @staticmethod
    def get_word_frequency(text: str, top_n: int = 20) -> List[tuple]:
        """Get most frequent words."""
        words = KeywordExtractor.extract_words(text)
        word_freq = Counter(words)
        return word_freq.most_common(top_n)
    
    @staticmethod
    def extract_keywords_tfidf(text: str, top_n: int = 10) -> List[str]:
        """Extract keywords using TF-IDF-like approach (simplified)."""
        words = KeywordExtractor.extract_words(text)
        word_freq = Counter(words)
        
        # Calculate TF (term frequency)
        total_words = len(words)
        tf_scores = {word: freq / total_words for word, freq in word_freq.items()}
        
        # Sort by TF score
        sorted_keywords = sorted(tf_scores.items(), key=lambda x: x[1], reverse=True)
        
        return [word for word, score in sorted_keywords[:top_n]]
    
    @staticmethod
    def extract_key_phrases(text: str, min_phrase_length: int = 2, max_phrase_length: int = 4) -> List[str]:
        """Extract key phrases of varying lengths."""
        phrases = []
        
        for n in range(min_phrase_length, max_phrase_length + 1):
            ngrams = KeywordExtractor.extract_ngrams(text, n)
            phrases.extend(ngrams)
        
        # Filter and count phrases
        phrase_freq = Counter(phrases)
        
        # Get top phrases
        top_phrases = phrase_freq.most_common(20)
        
        return [phrase for phrase, freq in top_phrases]
    
    @staticmethod
    def extract_topic_words(text: str, top_n: int = 15) -> List[str]:
        """Extract topic-related words (simplified topic modeling)."""
        # Remove common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this',
            'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'what',
            'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each',
            'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
            'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
        }
        
        words = KeywordExtractor.extract_words(text)
        filtered_words = [word for word in words if word not in stop_words]
        
        word_freq = Counter(filtered_words)
        top_words = word_freq.most_common(top_n)
        
        return [word for word, freq in top_words]
    
    @staticmethod
    def extract_technical_terms(text: str) -> List[str]:
        """Extract technical terms (capitalized words, acronyms, etc.)."""
        # Find capitalized words (potential technical terms)
        capitalized = re.findall(r'\b[A-Z][a-zA-Z]+\b', text)
        
        # Find acronyms (all caps)
        acronyms = re.findall(r'\b[A-Z]{2,}\b', text)
        
        # Find technical patterns (words with numbers, underscores, etc.)
        technical = re.findall(r'\b[a-zA-Z0-9_]+\b', text)
        
        all_terms = set(capitalized + acronyms + technical)
        
        # Filter common words
        common_words = {'The', 'This', 'That', 'These', 'Those', 'A', 'An'}
        filtered_terms = [term for term in all_terms if term not in common_words]
        
        return list(filtered_terms)
    
    @staticmethod
    def get_keyword_analysis(text: str) -> Dict[str, any]:
        """Comprehensive keyword analysis."""
        logger.info("Performing keyword analysis")
        
        return {
            "top_words": KeywordExtractor.get_word_frequency(text, 20),
            "keywords": KeywordExtractor.extract_keywords_tfidf(text, 15),
            "key_phrases": KeywordExtractor.extract_key_phrases(text),
            "topic_words": KeywordExtractor.extract_topic_words(text, 15),
            "technical_terms": KeywordExtractor.extract_technical_terms(text),
            "word_count": len(text.split()),
            "unique_words": len(set(text.lower().split()))
        }
