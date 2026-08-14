from typing import List, Optional
from loguru import logger


class TextSummarizer:
    """Generate summaries from text."""
    
    @staticmethod
    def extractive_summary(text: str, num_sentences: int = 3) -> str:
        """Generate extractive summary by selecting important sentences."""
        sentences = text.split('.')
        
        if len(sentences) <= num_sentences:
            return text
        
        # Simple sentence ranking by length and position
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            if len(sentence.strip()) > 10:  # Filter very short sentences
                score = len(sentence.split())  # Word count as simple score
                # Give preference to first and last sentences
                if i == 0 or i == len(sentences) - 1:
                    score *= 1.5
                scored_sentences.append((sentence, score))
        
        # Sort by score and select top sentences
        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        top_sentences = [s[0] for s in scored_sentences[:num_sentences]]
        
        # Maintain original order
        summary_sentences = []
        for sentence in sentences:
            if sentence.strip() in top_sentences:
                summary_sentences.append(sentence.strip())
        
        summary = '. '.join(summary_sentences) + '.'
        logger.info(f"Generated extractive summary with {len(summary_sentences)} sentences")
        return summary
    
    @staticmethod
    def bullet_point_summary(text: str, num_points: int = 5) -> List[str]:
        """Generate bullet point summary."""
        sentences = text.split('.')
        
        # Filter and score sentences
        scored_sentences = []
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 20:  # Minimum length
                score = len(sentence.split())
                scored_sentences.append((sentence, score))
        
        # Sort and select top
        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        top_points = [s[0] for s in scored_sentences[:num_points]]
        
        logger.info(f"Generated bullet point summary with {len(top_points)} points")
        return top_points
    
    @staticmethod
    def get_key_points(text: str) -> List[str]:
        """Extract key points from text."""
        # Look for sentences with indicators of importance
        importance_indicators = [
            'important', 'key', 'main', 'crucial', 'essential', 'significant',
            'therefore', 'thus', 'consequently', 'as a result', 'in conclusion',
            'first', 'second', 'third', 'finally', 'moreover', 'furthermore'
        ]
        
        sentences = text.split('.')
        key_points = []
        
        for sentence in sentences:
            sentence = sentence.strip().lower()
            if any(indicator in sentence for indicator in importance_indicators):
                if len(sentence) > 20:
                    key_points.append(sentence.capitalize())
        
        logger.info(f"Extracted {len(key_points)} key points")
        return key_points
    
    @staticmethod
    def get_tldr(text: str, max_length: int = 200) -> str:
        """Generate TL;DR summary."""
        if len(text) <= max_length:
            return text
        
        # Get first few sentences that fit within max_length
        sentences = text.split('.')
        tldr = ""
        
        for sentence in sentences:
            if len(tldr) + len(sentence) <= max_length:
                tldr += sentence.strip() + ". "
            else:
                break
        
        if not tldr:
            tldr = text[:max_length] + "..."
        
        logger.info(f"Generated TL;DR of length {len(tldr)}")
        return tldr.strip()
    
    @staticmethod
    def generate_summary(text: str, method: str = "extractive", **kwargs) -> str:
        """Main summary generation method."""
        summarizers = {
            "extractive": TextSummarizer.extractive_summary,
            "tldr": TextSummarizer.get_tldr
        }
        
        summarizer = summarizers.get(method.lower())
        if not summarizer:
            logger.warning(f"Unknown summary method: {method}, using extractive")
            summarizer = TextSummarizer.extractive_summary
        
        return summarizer(text, **kwargs)
