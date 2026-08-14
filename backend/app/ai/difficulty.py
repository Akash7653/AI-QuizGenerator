from typing import Dict, Any, Optional
from loguru import logger
from app.ai.gemini import GeminiClient, GeminiPromptBuilder


class DifficultyPredictor:
    """Predict difficulty level of questions."""
    
    def __init__(self):
        """Initialize difficulty predictor."""
        self.gemini_client = GeminiClient()
        self.prompt_builder = GeminiPromptBuilder()
    
    def predict_difficulty(self, question: str) -> Dict[str, Any]:
        """Predict difficulty of a question using AI."""
        logger.info(f"Predicting difficulty for question: {question[:50]}...")
        
        try:
            prompt = self.prompt_builder.build_difficulty_prediction_prompt(question)
            response = self.gemini_client.generate_json_response(
                prompt,
                {
                    "difficulty": "string (easy/medium/hard)",
                    "confidence": "float (0.0 to 1.0)",
                    "reasoning": "string"
                }
            )
            
            logger.info(f"Predicted difficulty: {response.get('difficulty')} with confidence {response.get('confidence')}")
            return response
            
        except Exception as e:
            logger.error(f"Difficulty prediction failed: {str(e)}")
            # Fallback to rule-based prediction
            return self._rule_based_difficulty_prediction(question)
    
    def _rule_based_difficulty_prediction(self, question: str) -> Dict[str, Any]:
        """Rule-based difficulty prediction."""
        question_lower = question.lower()
        
        # Count complexity indicators
        complexity_score = 0
        
        # Length-based complexity
        if len(question) > 100:
            complexity_score += 1
        if len(question) > 200:
            complexity_score += 1
        
        # Vocabulary complexity
        complex_words = ['analyze', 'evaluate', 'synthesize', 'compare', 'contrast',
                        'derive', 'formulate', 'hypothesize', 'integrate', 'justify']
        if any(word in question_lower for word in complex_words):
            complexity_score += 2
        
        # Multi-part questions
        if '?' in question[:-1]:  # Question mark not at the end
            complexity_score += 1
        
        # Technical terms
        technical_indicators = ['calculate', 'determine', 'solve', 'prove', 'demonstrate']
        if any(word in question_lower for word in technical_indicators):
            complexity_score += 1
        
        # Determine difficulty based on score
        if complexity_score >= 4:
            difficulty = "hard"
            confidence = 0.6
        elif complexity_score >= 2:
            difficulty = "medium"
            confidence = 0.7
        else:
            difficulty = "easy"
            confidence = 0.8
        
        return {
            "difficulty": difficulty,
            "confidence": confidence,
            "reasoning": f"Rule-based prediction with complexity score: {complexity_score}"
        }
    
    def predict_batch_difficulty(self, questions: list) -> list:
        """Predict difficulty for multiple questions."""
        logger.info(f"Predicting difficulty for {len(questions)} questions")
        
        results = []
        for question in questions:
            if isinstance(question, str):
                result = self.predict_difficulty(question)
            elif isinstance(question, dict):
                question_text = question.get('question_text', '')
                result = self.predict_difficulty(question_text)
            else:
                result = {
                    "difficulty": "medium",
                    "confidence": 0.5,
                    "reasoning": "Unable to process question format"
                }
            results.append(result)
        
        return results
    
    def adjust_difficulty(
        self,
        question: Dict[str, Any],
        target_difficulty: str
    ) -> Dict[str, Any]:
        """Suggest adjustments to change question difficulty."""
        current_difficulty = question.get('difficulty', 'medium')
        
        if current_difficulty == target_difficulty:
            return {
                "needs_adjustment": False,
                "suggestions": []
            }
        
        suggestions = []
        
        if target_difficulty == "easy" and current_difficulty in ["medium", "hard"]:
            suggestions = [
                "Simplify the question language",
                "Remove complex technical terms",
                "Break down multi-part questions",
                "Add more context or hints",
                "Reduce cognitive load"
            ]
        elif target_difficulty == "medium" and current_difficulty == "hard":
            suggestions = [
                "Moderate the complexity",
                "Simplify calculations if present",
                "Reduce the number of steps required"
            ]
        elif target_difficulty == "medium" and current_difficulty == "easy":
            suggestions = [
                "Add some complexity to the question",
                "Include problem-solving elements",
                "Remove excessive hints"
            ]
        elif target_difficulty == "hard" and current_difficulty in ["easy", "medium"]:
            suggestions = [
                "Add complexity to the question",
                "Include multi-step problem solving",
                "Add technical terms or concepts",
                "Remove or reduce hints",
                "Increase cognitive requirements"
            ]
        
        return {
            "needs_adjustment": True,
            "current_difficulty": current_difficulty,
            "target_difficulty": target_difficulty,
            "suggestions": suggestions
        }
