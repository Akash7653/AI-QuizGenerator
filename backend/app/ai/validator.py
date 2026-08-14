from typing import List, Dict, Any, Optional
import re
from loguru import logger
from app.ai.gemini import GeminiClient, GeminiPromptBuilder


class QuestionValidator:
    """Validate generated questions for quality and accuracy."""
    
    def __init__(self):
        """Initialize question validator."""
        self.gemini_client = GeminiClient()
        self.prompt_builder = GeminiPromptBuilder()
    
    def validate_question(self, question: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a single question."""
        logger.info(f"Validating question: {question.get('question_text', '')[:50]}...")
        
        try:
            # Perform rule-based validation
            rule_based_result = self._rule_based_validation(question)
            
            # Perform AI-based validation
            ai_result = self._ai_based_validation(question)
            
            # Combine results
            combined_result = self._combine_validation_results(
                rule_based_result,
                ai_result
            )
            
            return combined_result
            
        except Exception as e:
            logger.error(f"Question validation failed: {str(e)}")
            return {
                "is_valid": False,
                "errors": [f"Validation error: {str(e)}"],
                "warnings": [],
                "confidence_score": 0.0
            }
    
    def _rule_based_validation(self, question: Dict[str, Any]) -> Dict[str, Any]:
        """Perform rule-based validation."""
        errors = []
        warnings = []
        
        # Check required fields
        required_fields = ['question_text', 'correct_answer']
        for field in required_fields:
            if not question.get(field):
                errors.append(f"Missing required field: {field}")
        
        # Check question text
        question_text = question.get('question_text', '')
        if len(question_text) < 10:
            errors.append("Question text is too short")
        elif len(question_text) > 500:
            warnings.append("Question text is very long")
        
        # Check for common issues
        if '?' not in question_text and question.get('question_type') not in ['fill_in_blank', 'coding']:
            warnings.append("Question may not be phrased as a question")
        
        # Check options for MCQ
        if question.get('question_type') == 'mcq':
            options = question.get('options', [])
            if not options or len(options) < 2:
                errors.append("MCQ must have at least 2 options")
            elif len(options) < 4:
                warnings.append("MCQ typically has 4 options")
            
            # Check if correct answer is in options
            correct_answer = question.get('correct_answer', '')
            if options and correct_answer not in options:
                errors.append("Correct answer not found in options")
        
        # Check True/False
        if question.get('question_type') == 'true_false':
            correct_answer = question.get('correct_answer', '').lower()
            if correct_answer not in ['true', 'false']:
                errors.append("True/False question must have True or False as answer")
        
        # Check explanation
        if not question.get('explanation'):
            warnings.append("Question lacks explanation")
        
        # Check difficulty
        difficulty = question.get('difficulty', '').lower()
        if difficulty not in ['easy', 'medium', 'hard']:
            warnings.append(f"Unusual difficulty level: {difficulty}")
        
        # Check estimated time
        estimated_time = question.get('estimated_time', 0)
        if estimated_time <= 0:
            errors.append("Estimated time must be positive")
        elif estimated_time > 600:  # More than 10 minutes
            warnings.append("Estimated time is very long")
        
        # Check marks
        marks = question.get('marks', 0)
        if marks <= 0:
            errors.append("Marks must be positive")
        
        # Check for grammar issues (basic)
        if self._has_grammar_issues(question_text):
            warnings.append("Question may have grammar issues")
        
        # Calculate confidence score
        confidence_score = 1.0 - (len(errors) * 0.3) - (len(warnings) * 0.1)
        confidence_score = max(0.0, min(1.0, confidence_score))
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "confidence_score": confidence_score
        }
    
    def _ai_based_validation(self, question: Dict[str, Any]) -> Dict[str, Any]:
        """Perform AI-based validation."""
        try:
            prompt = self.prompt_builder.build_validation_prompt(question)
            response = self.gemini_client.generate_json_response(
                prompt,
                {
                    "is_valid": "boolean",
                    "errors": "array of strings",
                    "warnings": "array of strings",
                    "confidence_score": "float (0.0 to 1.0)",
                    "suggestions": "array of strings"
                }
            )
            
            return response
            
        except Exception as e:
            logger.warning(f"AI validation failed, using rule-based only: {str(e)}")
            return {
                "is_valid": True,
                "errors": [],
                "warnings": ["AI validation unavailable"],
                "confidence_score": 0.7
            }
    
    def _combine_validation_results(
        self,
        rule_based: Dict[str, Any],
        ai_based: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Combine rule-based and AI validation results."""
        combined_errors = list(set(rule_based.get('errors', []) + ai_based.get('errors', [])))
        combined_warnings = list(set(rule_based.get('warnings', []) + ai_based.get('warnings', [])))
        
        # Average confidence scores
        rule_confidence = rule_based.get('confidence_score', 0.0)
        ai_confidence = ai_based.get('confidence_score', 0.0)
        combined_confidence = (rule_confidence + ai_confidence) / 2
        
        # Question is valid if no errors
        is_valid = len(combined_errors) == 0
        
        return {
            "is_valid": is_valid,
            "errors": combined_errors,
            "warnings": combined_warnings,
            "confidence_score": combined_confidence
        }
    
    def _has_grammar_issues(self, text: str) -> bool:
        """Basic grammar check."""
        # Check for common grammar issues
        issues = [
            r'\s{2,}',  # Multiple spaces
            r'[.!?]{2,}',  # Multiple punctuation
            r'\b[a-z]\.\s+[a-z]\.',  # Lowercase abbreviations
        ]
        
        for pattern in issues:
            if re.search(pattern, text):
                return True
        
        return False
    
    def validate_batch(self, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate multiple questions."""
        logger.info(f"Validating batch of {len(questions)} questions")
        
        results = []
        for question in questions:
            result = self.validate_question(question)
            results.append(result)
        
        valid_count = sum(1 for r in results if r['is_valid'])
        logger.info(f"Validation complete: {valid_count}/{len(questions)} valid")
        
        return results
    
    def check_duplicates(
        self,
        questions: List[Dict[str, Any]],
        similarity_threshold: float = 0.9
    ) -> List[Dict[str, Any]]:
        """Check for duplicate questions."""
        logger.info("Checking for duplicate questions")
        
        duplicates = []
        question_texts = [q.get('question_text', '') for q in questions]
        
        for i, text1 in enumerate(question_texts):
            for j, text2 in enumerate(question_texts):
                if i >= j:
                    continue
                
                similarity = self._calculate_text_similarity(text1, text2)
                if similarity >= similarity_threshold:
                    duplicates.append({
                        "question_index_1": i,
                        "question_index_2": j,
                        "similarity": similarity,
                        "question_text_1": text1,
                        "question_text_2": text2
                    })
        
        logger.info(f"Found {len(duplicates)} potential duplicates")
        return duplicates
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate simple text similarity."""
        # Simple word overlap similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def suggest_improvements(self, question: Dict[str, Any]) -> List[str]:
        """Suggest improvements for a question."""
        suggestions = []
        
        # Check question clarity
        question_text = question.get('question_text', '')
        if len(question_text) < 20:
            suggestions.append("Consider adding more context to the question")
        
        # Check explanation quality
        explanation = question.get('explanation', '')
        if not explanation or len(explanation) < 20:
            suggestions.append("Add a detailed explanation for the answer")
        
        # Check hint usefulness
        hint = question.get('hint', '')
        if not hint:
            suggestions.append("Consider adding a hint to help students")
        
        # Check options quality for MCQ
        if question.get('question_type') == 'mcq':
            options = question.get('options', [])
            if options:
                # Check if options are distinct
                if len(set(options)) < len(options):
                    suggestions.append("Ensure all options are distinct")
        
        return suggestions
