import pytest
from app.nlp.cleaner import TextCleaner
from app.nlp.chunker import TextChunker
from app.nlp.keyword import KeywordExtractor
from app.nlp.summary import TextSummarizer


def test_text_cleaner():
    """Test text cleaning functionality."""
    cleaner = TextCleaner()
    
    dirty_text = """
    This is a TEST text with   multiple   spaces.
    Page 1 of 10
    Some SPECIAL symbols!@#$%
    http://example.com
    test@email.com
    """
    
    cleaned = cleaner.clean_text(dirty_text)
    
    assert "   multiple   spaces" not in cleaned
    assert "Page 1 of 10" not in cleaned
    assert "!@#$%" not in cleaned
    assert "http://example.com" not in cleaned


def test_text_chunker():
    """Test text chunking functionality."""
    chunker = TextChunker()
    
    text = "This is sentence one. This is sentence two. This is sentence three. This is sentence four. This is sentence five."
    
    # Test sentence chunking
    chunks = chunker.chunk_by_sentences(text, chunk_size=2)
    assert len(chunks) == 3
    assert all(len(chunk) > 0 for chunk in chunks)
    
    # Test intelligent chunking
    chunks = chunker.intelligent_chunking(text, max_chunk_size=50, overlap=10)
    assert len(chunks) > 0


def test_keyword_extractor():
    """Test keyword extraction."""
    extractor = KeywordExtractor()
    
    text = """
    Machine learning is a subset of artificial intelligence that focuses on building systems that can learn from data.
    Deep learning is a specialized branch of machine learning that uses neural networks with multiple layers.
    """
    
    # Test word frequency
    word_freq = extractor.get_word_frequency(text, top_n=5)
    assert len(word_freq) == 5
    assert all(isinstance(word, str) for word, count in word_freq)
    
    # Test keyword extraction
    keywords = extractor.extract_keywords_tfidf(text, top_n=5)
    assert len(keywords) == 5
    assert all(isinstance(keyword, str) for keyword in keywords)


def test_text_summarizer():
    """Test text summarization."""
    summarizer = TextSummarizer()
    
    text = """
    Machine learning is a field of artificial intelligence that uses statistical techniques to give computer systems the ability to learn from data.
    It is seen as a subset of artificial intelligence. Machine learning algorithms build a mathematical model based on sample data, known as training data, in order to make predictions or decisions without being explicitly programmed.
    The primary aim is to allow the computers to learn automatically without human intervention or assistance and adjust actions accordingly.
    """
    
    # Test extractive summary
    summary = summarizer.extractive_summary(text, num_sentences=2)
    assert len(summary) > 0
    assert len(summary) < len(text)
    
    # Test TL;DR
    tldr = summarizer.get_tldr(text, max_length=100)
    assert len(tldr) <= 100 + 20  # Allow some margin


def test_get_text_statistics():
    """Test text statistics."""
    cleaner = TextCleaner()
    
    text = "This is a test text. It has multiple sentences. And some words!"
    
    stats = cleaner.get_text_statistics(text)
    
    assert "word_count" in stats
    assert "sentence_count" in stats
    assert "character_count" in stats
    assert stats["word_count"] > 0
    assert stats["sentence_count"] > 0
