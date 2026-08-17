from typing import Dict, Any, List, Optional
from app.ai.gemini import GeminiPromptBuilder
from loguru import logger


class PromptEngine:
    """Engine for managing and building prompts for AI generation."""
    
    def __init__(self):
        """Initialize prompt engine."""
        self.prompt_builder = GeminiPromptBuilder()
        self.prompt_templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, str]:
        """Load prompt templates."""
        return {
            "mcq": self._get_mcq_template(),
            "true_false": self._get_true_false_template(),
            "fill_in_blank": self._get_fill_in_blank_template(),
            "short_answer": self._get_short_answer_template(),
            "long_answer": self._get_long_answer_template(),
            "coding": self._get_coding_template(),
            "assertion_reason": self._get_assertion_reason_template(),
            "case_study": self._get_case_study_template(),
            "scenario_based": self._get_scenario_based_template(),
        }
    
    def _get_mcq_template(self) -> str:
        """Get MCQ question template."""
        return """
        Generate multiple choice questions with the following format:
        
        Question: [question text]
        Options: ["option 1", "option 2", "option 3", "option 4"]
        Correct Answer: [exact text of correct option]
        Explanation: [detailed explanation]
        Difficulty: [easy/medium/hard]
        Topic: [topic]
        Subtopic: [subtopic]
        Bloom's Level: [remember/understand/apply/analyze/evaluate/create]
        Estimated Time: [seconds]
        Marks: [numeric value]
        Hint: [optional hint]
        Tags: [tag1, tag2, tag3]
        """
    
    def _get_true_false_template(self) -> str:
        """Get True/False question template."""
        return """
        Generate true/false questions with the following format:
        
        Question: [statement]
        Options: ["True", "False"]
        Correct Answer: [True/False]
        Explanation: [detailed explanation]
        Difficulty: [easy/medium/hard]
        Topic: [topic]
        Subtopic: [subtopic]
        Bloom's Level: [remember/understand/apply/analyze/evaluate/create]
        Estimated Time: [seconds]
        Marks: [numeric value]
        Hint: [optional hint]
        Tags: [tag1, tag2, tag3]
        """
    
    def _get_fill_in_blank_template(self) -> str:
        """Get Fill in the Blank question template."""
        return """
        Generate fill in the blank questions with the following format:
        
        Question: [sentence with _____ for blank]
        Correct Answer: [word/phrase to fill in blank]
        Options: [alternative acceptable answers]
        Explanation: [detailed explanation]
        Difficulty: [easy/medium/hard]
        Topic: [topic]
        Subtopic: [subtopic]
        Bloom's Level: [remember/understand/apply/analyze/evaluate/create]
        Estimated Time: [seconds]
        Marks: [numeric value]
        Hint: [optional hint]
        Tags: [tag1, tag2, tag3]
        """
    
    def _get_short_answer_template(self) -> str:
        """Get Short Answer question template."""
        return """
        Generate short answer questions with the following format:
        
        Question: [question text]
        Correct Answer: [expected answer]
        Explanation: [detailed explanation]
        Difficulty: [easy/medium/hard]
        Topic: [topic]
        Subtopic: [subtopic]
        Bloom's Level: [remember/understand/apply/analyze/evaluate/create]
        Estimated Time: [seconds]
        Marks: [numeric value]
        Hint: [optional hint]
        Tags: [tag1, tag2, tag3]
        """
    
    def _get_long_answer_template(self) -> str:
        """Get Long Answer question template."""
        return """
        Generate long answer/essay questions with the following format:
        
        Question: [question text]
        Correct Answer: [detailed answer with key points]
        Explanation: [detailed explanation]
        Difficulty: [easy/medium/hard]
        Topic: [topic]
        Subtopic: [subtopic]
        Bloom's Level: [remember/understand/apply/analyze/evaluate/create]
        Estimated Time: [seconds]
        Marks: [numeric value]
        Hint: [optional hint]
        Tags: [tag1, tag2, tag3]
        """
    
    def _get_coding_template(self) -> str:
        """Get Coding question template."""
        return """
        Generate coding questions with the following format:
        
        Question: [problem description]
        Code Template: [optional starting code]
        Correct Answer: [solution code/explanation]
        Test Cases: [sample test cases]
        Explanation: [detailed explanation]
        Difficulty: [easy/medium/hard]
        Topic: [programming topic]
        Subtopic: [specific topic]
        Bloom's Level: [apply/analyze/evaluate/create]
        Estimated Time: [seconds]
        Marks: [numeric value]
        Hint: [optional hint]
        Tags: [tag1, tag2, tag3]
        """
    
    def _get_assertion_reason_template(self) -> str:
        """Get Assertion-Reason question template."""
        return """
        Generate assertion-reason questions with the following format:
        
        Assertion (A): [statement]
        Reason (R): [explanation]
        Correct Answer: [A/B/C/D]
        Options:
        A) Both A and R are true, and R is the correct explanation of A
        B) Both A and R are true, but R is not the correct explanation of A
        C) A is true, but R is false
        D) A is false, but R is true
        Explanation: [detailed explanation]
        Difficulty: [easy/medium/hard]
        Topic: [topic]
        Subtopic: [subtopic]
        Bloom's Level: [analyze/evaluate]
        Estimated Time: [seconds]
        Marks: [numeric value]
        Hint: [optional hint]
        Tags: [tag1, tag2, tag3]
        """
    
    def _get_case_study_template(self) -> str:
        """Get Case Study question template."""
        return """
        Generate case study questions with the following format:
        
        Case/Scenario: [detailed case description]
        Question: [question based on case]
        Correct Answer: [answer]
        Explanation: [detailed explanation]
        Difficulty: [easy/medium/hard]
        Topic: [topic]
        Subtopic: [subtopic]
        Bloom's Level: [apply/analyze/evaluate]
        Estimated Time: [seconds]
        Marks: [numeric value]
        Hint: [optional hint]
        Tags: [tag1, tag2, tag3]
        """
    
    def _get_scenario_based_template(self) -> str:
        """Get Scenario-based question template."""
        return """
        Generate scenario-based questions with the following format:
        
        Scenario: [brief scenario description]
        Question: [question based on scenario]
        Correct Answer: [answer]
        Explanation: [detailed explanation]
        Difficulty: [easy/medium/hard]
        Topic: [topic]
        Subtopic: [subtopic]
        Bloom's Level: [apply/analyze/evaluate]
        Estimated Time: [seconds]
        Marks: [numeric value]
        Hint: [optional hint]
        Tags: [tag1, tag2, tag3]
        """
    
    def build_question_generation_prompt(
        self,
        context: str,
        question_type: str,
        difficulty: str,
        count: int,
        topic: Optional[str] = None,
        additional_instructions: Optional[str] = None
    ) -> str:
        """Build complete prompt for question generation."""
        template = self.prompt_templates.get(question_type.lower())
        
        if not template:
            logger.warning(f"No template found for {question_type}, using default")
            template = self._get_mcq_template()
        
        prompt = f"""
        You are an expert educator and question writer with deep knowledge in various subjects.
        
        Task: Generate {count} {difficulty} {question_type} questions based on the provided context.
        
        Context:
        {context}
        """
        
        if topic:
            prompt += f"\nTopic Focus: {topic}\n"
        
        if additional_instructions:
            prompt += f"\nAdditional Instructions: {additional_instructions}\n"
        
        prompt += f"""
        Question Format:
        {template}
        
        Quality Requirements:
        1. Questions must be clear and unambiguous
        2. Answers must be accurate and well-explained
        3. Difficulty should match the specified level
        4. Include relevant topics and subtopics
        5. Assign appropriate Bloom's taxonomy levels
        6. Estimate realistic time for completion
        7. Assign appropriate marks based on complexity
        8. Include helpful hints where appropriate
        9. Add relevant tags for categorization
        
        Output Format:
        Return the response as a valid JSON array of question objects.
        Each object should contain all the fields specified in the format above.
        """
        
        return prompt
    
    def build_contextual_prompt(
        self,
        base_prompt: str,
        context_chunks: List[str],
        max_context_length: int = 2000
    ) -> str:
        """Build prompt with relevant context chunks."""
        # Combine context chunks, limiting total length
        combined_context = " ".join(context_chunks)
        
        if len(combined_context) > max_context_length:
            combined_context = combined_context[:max_context_length] + "..."
        
        prompt = f"""
        {base_prompt}
        
        Relevant Context:
        {combined_context}
        """
        
        return prompt
    
    def build_refinement_prompt(
        self,
        original_question: Dict[str, Any],
        feedback: str
    ) -> str:
        """Build prompt for question refinement."""
        prompt = f"""
        Refine the following question based on the provided feedback.
        
        Original Question:
        {original_question}
        
        Feedback:
        {feedback}
        
        Refine the question to address the feedback while maintaining quality and accuracy.
        Return the refined question in the same JSON format.
        """
        
        return prompt
    
    def build_batch_generation_prompt(
        self,
        contexts: List[str],
        question_types: List[str],
        total_count: int,
        difficulty: str
    ) -> str:
        """Build prompt for batch question generation."""
        prompt = f"""
        Generate {total_count} questions of various types from the following contexts.
        
        Difficulty Level: {difficulty}
        Question Types: {', '.join(question_types)}
        
        Contexts:
        """
        
        for i, context in enumerate(contexts, 1):
            prompt += f"\nContext {i}:\n{context}\n"
        
        prompt += f"""
        Distribute the questions across the contexts and types evenly.
        Ensure variety and appropriate difficulty for each question.
        
        Return the response as a valid JSON array of question objects.
        """
        
        return prompt
