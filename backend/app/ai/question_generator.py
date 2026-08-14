from typing import List, Dict, Any, Optional
import json
import time
from loguru import logger
from app.ai.gemini import GeminiClient
from app.ai.prompt_engine import PromptEngine
from app.database.models.question import QuestionType, Difficulty, BloomTaxonomy


class QuestionGenerator:
    """Generate questions using AI."""
    
    def __init__(self):
        """Initialize question generator."""
        self.gemini_client = GeminiClient()
        self.prompt_engine = PromptEngine()
    
    def generate_questions(
        self,
        context: str,
        question_type: str,
        difficulty: str,
        count: int,
        topic: Optional[str] = None,
        additional_instructions: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate questions based on context."""
        logger.info(f"Generating {count} {difficulty} {question_type} questions")
        
        start_time = time.time()
        
        try:
            # Build prompt
            prompt = self.prompt_engine.build_question_generation_prompt(
                context=context,
                question_type=question_type,
                difficulty=difficulty,
                count=count,
                topic=topic,
                additional_instructions=additional_instructions
            )
            
            # Generate response
            response = self.gemini_client.generate_text(prompt)
            
            # Parse response
            questions = self._parse_questions_response(response, question_type)
            
            processing_time = time.time() - start_time
            logger.info(f"Generated {len(questions)} questions in {processing_time:.2f}s")
            
            return questions
            
        except Exception as e:
            logger.error(f"Question generation failed: {str(e)}")
            raise
    
    def _parse_questions_response(
        self,
        response: str,
        question_type: str
    ) -> List[Dict[str, Any]]:
        """Parse AI response into question objects."""
        try:
            # Try to parse as JSON array
            questions = json.loads(response)
            
            if not isinstance(questions, list):
                logger.warning("Response is not a list, wrapping in array")
                questions = [questions]
            
            # Validate and normalize questions
            validated_questions = []
            for i, question in enumerate(questions):
                normalized = self._normalize_question(question, question_type)
                if normalized:
                    validated_questions.append(normalized)
                else:
                    logger.warning(f"Failed to normalize question {i+1}")
            
            return validated_questions
            
        except json.JSONDecodeError:
            logger.error("Failed to parse JSON response")
            # Try to extract JSON from response
            return self._extract_json_from_response(response, question_type)
    
    def _extract_json_from_response(
        self,
        response: str,
        question_type: str
    ) -> List[Dict[str, Any]]:
        """Extract JSON from malformed response."""
        try:
            # Find JSON array in response
            start_idx = response.find('[')
            end_idx = response.rfind(']') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response[start_idx:end_idx]
                questions = json.loads(json_str)
                
                validated_questions = []
                for question in questions:
                    normalized = self._normalize_question(question, question_type)
                    if normalized:
                        validated_questions.append(normalized)
                
                return validated_questions
            
            logger.error("Could not extract JSON from response")
            return []
            
        except Exception as e:
            logger.error(f"JSON extraction failed: {str(e)}")
            return []
    
    def _normalize_question(
        self,
        question: Dict[str, Any],
        question_type: str
    ) -> Optional[Dict[str, Any]]:
        """Normalize question to standard format."""
        try:
            # Ensure required fields exist
            required_fields = ['question_text', 'correct_answer']
            for field in required_fields:
                if field not in question:
                    logger.warning(f"Missing required field: {field}")
                    return None
            
            # Set default values for optional fields
            normalized = {
                'question_text': question.get('question_text', ''),
                'question_type': question_type,
                'options': question.get('options'),
                'correct_answer': question.get('correct_answer', ''),
                'explanation': question.get('explanation', ''),
                'difficulty': self._normalize_difficulty(question.get('difficulty', 'medium')),
                'topic': question.get('topic'),
                'subtopic': question.get('subtopic'),
                'bloom_taxonomy_level': self._normalize_bloom_level(question.get('bloom_taxonomy_level')),
                'estimated_time': self._normalize_time(question.get('estimated_time', 60)),
                'marks': self._normalize_marks(question.get('marks', 1.0)),
                'hint': question.get('hint'),
                'tags': question.get('tags', []),
                'confidence_score': 0.0,  # Will be set by validation
                'is_validated': False,
                'validation_errors': None
            }
            
            return normalized
            
        except Exception as e:
            logger.error(f"Question normalization failed: {str(e)}")
            return None
    
    def _normalize_difficulty(self, difficulty: str) -> str:
        """Normalize difficulty to valid enum value."""
        difficulty = difficulty.lower()
        valid_difficulties = ['easy', 'medium', 'hard']
        return difficulty if difficulty in valid_difficulties else 'medium'
    
    def _normalize_bloom_level(self, level: Optional[str]) -> Optional[str]:
        """Normalize Bloom's taxonomy level."""
        if not level:
            return None
        
        level = level.lower()
        valid_levels = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']
        return level if level in valid_levels else None
    
    def _normalize_time(self, time_value: Any) -> int:
        """Normalize time to seconds."""
        try:
            return int(time_value)
        except (ValueError, TypeError):
            return 60  # Default to 1 minute
    
    def _normalize_marks(self, marks: Any) -> float:
        """Normalize marks to float."""
        try:
            return float(marks)
        except (ValueError, TypeError):
            return 1.0  # Default to 1 mark
    
    def generate_mcq(
        self,
        context: str,
        difficulty: str = "medium",
        count: int = 5,
        topic: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate MCQ questions."""
        return self.generate_questions(
            context=context,
            question_type="mcq",
            difficulty=difficulty,
            count=count,
            topic=topic
        )
    
    def generate_true_false(
        self,
        context: str,
        difficulty: str = "medium",
        count: int = 5,
        topic: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate True/False questions."""
        return self.generate_questions(
            context=context,
            question_type="true_false",
            difficulty=difficulty,
            count=count,
            topic=topic
        )
    
    def generate_fill_in_blank(
        self,
        context: str,
        difficulty: str = "medium",
        count: int = 5,
        topic: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate Fill in the Blank questions."""
        return self.generate_questions(
            context=context,
            question_type="fill_in_blank",
            difficulty=difficulty,
            count=count,
            topic=topic
        )
    
    def generate_short_answer(
        self,
        context: str,
        difficulty: str = "medium",
        count: int = 5,
        topic: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate Short Answer questions."""
        return self.generate_questions(
            context=context,
            question_type="short_answer",
            difficulty=difficulty,
            count=count,
            topic=topic
        )
    
    def generate_mixed_questions(
        self,
        context: str,
        difficulty: str = "medium",
        total_count: int = 10,
        topic: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate mixed type questions."""
        question_types = ['mcq', 'true_false', 'short_answer']
        questions_per_type = total_count // len(question_types)
        
        all_questions = []
        for q_type in question_types:
            questions = self.generate_questions(
                context=context,
                question_type=q_type,
                difficulty=difficulty,
                count=questions_per_type,
                topic=topic
            )
            all_questions.extend(questions)
        
        return all_questions
