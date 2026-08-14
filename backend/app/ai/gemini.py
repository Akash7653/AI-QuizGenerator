from typing import Optional, Dict, Any, List
from loguru import logger
from app.config.settings import settings

try:
    import google.generativeai as genai
except Exception:  # pragma: no cover - optional dependency
    genai = None


class GeminiClient:
    """Google Gemini API client."""
    
    def __init__(self):
        """Initialize Gemini client."""
        if genai is None:
            raise RuntimeError("Google Gemini SDK is not installed. Install requirements-ai.txt or the google-generativeai package.")
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
            logger.info(f"Initialized Gemini model: {settings.GEMINI_MODEL}")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {str(e)}")
            raise
    
    def generate_text(
        self,
        prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> str:
        """Generate text using Gemini API."""
        try:
            generation_config = genai.types.GenerationConfig(
                temperature=temperature or settings.GEMINI_TEMPERATURE,
                max_output_tokens=max_tokens or settings.GEMINI_MAX_TOKENS,
            )
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            return response.text
        except Exception as e:
            logger.error(f"Gemini text generation failed: {str(e)}")
            raise
    
    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None
    ) -> str:
        """Generate chat response."""
        try:
            chat = self.model.start_chat(history=[])
            
            for message in messages:
                role = message.get("role", "user")
                content = message.get("content", "")
                
                if role == "user":
                    response = chat.send_message(content)
                else:
                    # For system messages, we might need to handle differently
                    pass
            
            return response.text if response else ""
        except Exception as e:
            logger.error(f"Gemini chat generation failed: {str(e)}")
            raise
    
    def generate_json_response(
        self,
        prompt: str,
        schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate structured JSON response."""
        try:
            # Add JSON formatting instructions to prompt
            json_prompt = f"""
            {prompt}
            
            Please respond in valid JSON format following this schema:
            {schema}
            
            Return ONLY the JSON, no additional text.
            """
            
            response = self.generate_text(json_prompt)
            
            # Parse JSON response
            import json
            return json.loads(response)
        except Exception as e:
            logger.error(f"Gemini JSON generation failed: {str(e)}")
            raise
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text."""
        try:
            return self.model.count_tokens(text).total_tokens
        except Exception as e:
            logger.error(f"Token counting failed: {str(e)}")
            return len(text.split())  # Fallback to word count
    
    def is_available(self) -> bool:
        """Check if Gemini API is available."""
        try:
            response = self.generate_text("Hello", max_tokens=5)
            return bool(response)
        except Exception:
            return False


class GeminiPromptBuilder:
    """Build prompts for Gemini API."""
    
    @staticmethod
    def build_question_generation_prompt(
        context: str,
        question_type: str,
        difficulty: str,
        count: int,
        topic: Optional[str] = None
    ) -> str:
        """Build prompt for question generation."""
        prompt = f"""
        You are an expert educator and question writer. Generate {count} {difficulty} {question_type} questions based on the following context.
        
        Context:
        {context}
        
        """
        
        if topic:
            prompt += f"Topic: {topic}\n\n"
        
        prompt += f"""
        Requirements:
        1. Generate exactly {count} questions
        2. Difficulty level: {difficulty}
        3. Question type: {question_type}
        4. Each question must include:
           - Question text
           - Options (for MCQ)
           - Correct answer
           - Explanation
           - Difficulty level
           - Estimated time (in seconds)
           - Marks
           - Hint (optional)
        
        Format the response as a JSON array of question objects.
        """
        
        return prompt
    
    @staticmethod
    def build_validation_prompt(question: Dict[str, Any]) -> str:
        """Build prompt for question validation."""
        prompt = f"""
        You are an expert question validator. Evaluate the following question for quality and accuracy.
        
        Question: {question.get('question_text', '')}
        Type: {question.get('question_type', '')}
        Options: {question.get('options', [])}
        Correct Answer: {question.get('correct_answer', '')}
        Explanation: {question.get('explanation', '')}
        
        Evaluate the question based on:
        1. Clarity and ambiguity
        2. Correctness of the answer
        3. Quality of options (if applicable)
        4. Appropriateness of difficulty level
        5. Quality of explanation
        6. Grammar and language
        
        Return a JSON object with:
        {{
            "is_valid": boolean,
            "errors": ["error1", "error2"],
            "warnings": ["warning1", "warning2"],
            "confidence_score": float (0.0 to 1.0),
            "suggestions": ["suggestion1", "suggestion2"]
        }}
        """
        
        return prompt
    
    @staticmethod
    def build_summary_prompt(text: str, max_length: int = 200) -> str:
        """Build prompt for text summarization."""
        prompt = f"""
        Summarize the following text in approximately {max_length} words or less.
        
        Text:
        {text}
        
        Provide a concise summary that captures the main points.
        """
        
        return prompt
    
    @staticmethod
    def build_difficulty_prediction_prompt(question: str) -> str:
        """Build prompt for difficulty prediction."""
        prompt = f"""
        Analyze the following question and predict its difficulty level.
        
        Question: {question}
        
        Rate the difficulty as one of: easy, medium, hard
        
        Return a JSON object with:
        {{
            "difficulty": "easy|medium|hard",
            "confidence": float (0.0 to 1.0),
            "reasoning": "explanation for the difficulty rating"
        }}
        """
        
        return prompt
