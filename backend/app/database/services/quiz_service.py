from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import random
from loguru import logger
from app.database.models.quiz import Quiz, QuizMode, QuizQuestion
from app.database.models.question import Question, Difficulty
from app.database.models.quiz_attempt import QuizAttempt, AttemptStatus, AttemptAnswer
from app.database.repository import QuizRepository, QuizAttemptRepository, QuestionRepository
from app.database.schemas.quiz import QuizCreate, QuizAttemptCreate
from app.ai.question_generator import QuestionGenerator
from app.ai.validator import QuestionValidator


class QuizService:
    """Service for quiz management and operations."""
    
    def __init__(self, db: Session):
        """Initialize quiz service."""
        self.db = db
        self.quiz_repository = QuizRepository(db)
        self.quiz_attempt_repository = QuizAttemptRepository(db)
        self.question_repository = QuestionRepository(db)
        self.question_generator = QuestionGenerator()
        self.question_validator = QuestionValidator()
    
    def create_quiz(self, quiz_data: QuizCreate, user_id: int) -> Quiz:
        """Create a new quiz."""
        logger.info(f"Creating quiz for user {user_id}")
        
        # Create quiz
        quiz_dict = quiz_data.dict()
        quiz_dict['user_id'] = user_id
        
        quiz = self.quiz_repository.create(quiz_dict)
        
        # Add questions if provided
        if quiz_data.question_ids:
            self.quiz_repository.add_questions_to_quiz(quiz.id, quiz_data.question_ids)
        
        logger.info(f"Quiz created with ID {quiz.id}")
        return quiz
    
    def generate_ai_quiz(
        self,
        document_id: int,
        user_id: int,
        mode: QuizMode = QuizMode.PRACTICE,
        total_questions: int = 10,
        difficulty: str = "medium",
        question_types: Optional[List[str]] = None
    ) -> Quiz:
        """Generate quiz using AI from document."""
        logger.info(f"Generating AI quiz for document {document_id}")
        
        # Get document context (simplified - would normally fetch from DB)
        context = "Sample document content for quiz generation"
        
        # Generate questions
        if question_types:
            questions = []
            for q_type in question_types:
                count = total_questions // len(question_types)
                generated = self.question_generator.generate_questions(
                    context=context,
                    question_type=q_type,
                    difficulty=difficulty,
                    count=count
                )
                questions.extend(generated)
        else:
            questions = self.question_generator.generate_mixed_questions(
                context=context,
                difficulty=difficulty,
                total_count=total_questions
            )
        
        # Validate questions
        validation_results = self.question_validator.validate_batch(questions)
        
        # Filter valid questions
        valid_questions = [
            q for q, v in zip(questions, validation_results)
            if v['is_valid']
        ]
        
        # Save questions to database (simplified)
        saved_question_ids = []
        for question_data in valid_questions:
            question = self.question_repository.create(question_data)
            saved_question_ids.append(question.id)
        
        # Create quiz
        quiz_data = {
            "user_id": user_id,
            "document_id": document_id,
            "title": f"AI Generated Quiz - {datetime.now().strftime('%Y-%m-%d')}",
            "description": f"Auto-generated quiz with {len(saved_question_ids)} questions",
            "mode": mode,
            "total_questions": len(saved_question_ids),
            "total_marks": sum(q.get('marks', 1.0) for q in valid_questions)
        }
        
        quiz = self.quiz_repository.create(quiz_data)
        self.quiz_repository.add_questions_to_quiz(quiz.id, saved_question_ids)
        
        logger.info(f"AI quiz generated with ID {quiz.id}")
        return quiz
    
    def start_quiz(self, quiz_id: int, user_id: int) -> QuizAttempt:
        """Start a quiz attempt."""
        logger.info(f"User {user_id} starting quiz {quiz_id}")
        
        # Check if quiz exists
        quiz = self.quiz_repository.get_by_id(quiz_id)
        if not quiz:
            raise ValueError("Quiz not found")
        
        # Check if user has permission
        if quiz.user_id != user_id:
            raise ValueError("User does not have permission to access this quiz")
        
        # Check for existing in-progress attempts
        existing_attempts = self.quiz_attempt_repository.get_in_progress_attempts(user_id)
        quiz_attempts = [a for a in existing_attempts if a.quiz_id == quiz_id]
        
        if quiz_attempts:
            logger.info(f"Resuming existing attempt {quiz_attempts[0].id}")
            return quiz_attempts[0]
        
        # Create new attempt
        attempt_data = {
            "user_id": user_id,
            "quiz_id": quiz_id,
            "status": AttemptStatus.IN_PROGRESS,
            "started_at": int(datetime.now().timestamp()),
            "max_score": quiz.total_marks
        }
        
        attempt = self.quiz_attempt_repository.create(attempt_data)
        
        logger.info(f"Quiz attempt created with ID {attempt.id}")
        return attempt
    
    def pause_quiz(self, attempt_id: int, user_id: int) -> QuizAttempt:
        """Pause a quiz attempt."""
        logger.info(f"Pausing attempt {attempt_id}")
        
        attempt = self.quiz_attempt_repository.get_by_id(attempt_id)
        if not attempt:
            raise ValueError("Attempt not found")
        
        if attempt.user_id != user_id:
            raise ValueError("User does not have permission to pause this attempt")
        
        attempt.status = AttemptStatus.PAUSED
        self.db.commit()
        self.db.refresh(attempt)
        
        return attempt
    
    def resume_quiz(self, attempt_id: int, user_id: int) -> QuizAttempt:
        """Resume a paused quiz attempt."""
        logger.info(f"Resuming attempt {attempt_id}")
        
        attempt = self.quiz_attempt_repository.get_by_id(attempt_id)
        if not attempt:
            raise ValueError("Attempt not found")
        
        if attempt.user_id != user_id:
            raise ValueError("User does not have permission to resume this attempt")
        
        attempt.status = AttemptStatus.IN_PROGRESS
        self.db.commit()
        self.db.refresh(attempt)
        
        return attempt
    
    def submit_quiz(
        self,
        attempt_id: int,
        answers: Dict[str, Any],
        user_id: int
    ) -> QuizAttempt:
        """Submit a quiz attempt for evaluation."""
        logger.info(f"Submitting attempt {attempt_id}")
        
        attempt = self.quiz_attempt_repository.get_by_id(attempt_id)
        if not attempt:
            raise ValueError("Attempt not found")
        
        if attempt.user_id != user_id:
            raise ValueError("User does not have permission to submit this attempt")
        
        # Update attempt with answers
        attempt.answers = answers
        attempt.completed_at = int(datetime.now().timestamp())
        attempt.time_taken = attempt.completed_at - attempt.started_at
        
        # Evaluate answers
        evaluation = self._evaluate_attempt(attempt)
        
        # Update attempt with results
        attempt.total_score = evaluation['total_score']
        attempt.correct_count = evaluation['correct_count']
        attempt.wrong_count = evaluation['wrong_count']
        attempt.skipped_count = evaluation['skipped_count']
        attempt.percentage = evaluation['percentage']
        attempt.status = AttemptStatus.COMPLETED
        
        self.db.commit()
        self.db.refresh(attempt)
        
        logger.info(f"Attempt {attempt_id} submitted with score {attempt.percentage}%")
        return attempt
    
    def _evaluate_attempt(self, attempt: QuizAttempt) -> Dict[str, Any]:
        """Evaluate quiz attempt and calculate score."""
        quiz = self.quiz_repository.get_by_id(attempt.quiz_id)
        quiz_questions = self.quiz_repository.get_quiz_questions(attempt.quiz_id)
        
        total_score = 0.0
        correct_count = 0
        wrong_count = 0
        skipped_count = 0
        
        user_answers = attempt.answers or {}
        
        for quiz_question in quiz_questions:
            question = quiz_question.question
            user_answer = user_answers.get(str(quiz_question.question_id))
            
            if user_answer is None or user_answer == "":
                skipped_count += 1
                continue
            
            # Compare answers
            is_correct = self._compare_answers(
                user_answer,
                question.correct_answer
            )
            
            if is_correct:
                correct_count += 1
                total_score += quiz_question.marks
            else:
                wrong_count += 1
                # Apply negative marking if configured
                if quiz.negative_marking > 0:
                    total_score -= quiz_question.marks * quiz.negative_marking
        
        percentage = (total_score / quiz.total_marks * 100) if quiz.total_marks > 0 else 0
        
        return {
            "total_score": max(0, total_score),  # Ensure non-negative
            "correct_count": correct_count,
            "wrong_count": wrong_count,
            "skipped_count": skipped_count,
            "percentage": percentage
        }
    
    def _compare_answers(self, user_answer: str, correct_answer: str) -> bool:
        """Compare user answer with correct answer."""
        # Normalize answers for comparison
        user_answer = str(user_answer).strip().lower()
        correct_answer = str(correct_answer).strip().lower()
        
        # Exact match
        if user_answer == correct_answer:
            return True
        
        # For MCQ, check if option matches
        if user_answer in correct_answer or correct_answer in user_answer:
            return True
        
        return False
    
    def get_quiz_result(self, attempt_id: int, user_id: int) -> Dict[str, Any]:
        """Get detailed quiz result."""
        logger.info(f"Getting result for attempt {attempt_id}")
        
        attempt = self.quiz_attempt_repository.get_by_id(attempt_id)
        if not attempt:
            raise ValueError("Attempt not found")
        
        if attempt.user_id != user_id:
            raise ValueError("User does not have permission to view this result")
        
        quiz = self.quiz_repository.get_by_id(attempt.quiz_id)
        quiz_questions = self.quiz_repository.get_quiz_questions(attempt.quiz_id)
        
        # Get detailed question results
        question_results = []
        for quiz_question in quiz_questions:
            question = quiz_question.question
            user_answer = attempt.answers.get(str(quiz_question.question_id)) if attempt.answers else None
            
            is_correct = self._compare_answers(
                user_answer or "",
                question.correct_answer
            )
            
            question_results.append({
                "question_id": question.id,
                "question_text": question.question_text,
                "user_answer": user_answer,
                "correct_answer": question.correct_answer,
                "is_correct": is_correct,
                "marks": quiz_question.marks,
                "explanation": question.explanation
            })
        
        return {
            "attempt": {
                "id": attempt.id,
                "quiz_id": attempt.quiz_id,
                "quiz_title": quiz.title,
                "status": attempt.status.value,
                "started_at": attempt.started_at,
                "completed_at": attempt.completed_at,
                "time_taken": attempt.time_taken,
                "total_score": attempt.total_score,
                "max_score": attempt.max_score,
                "percentage": attempt.percentage,
                "correct_count": attempt.correct_count,
                "wrong_count": attempt.wrong_count,
                "skipped_count": attempt.skipped_count
            },
            "question_results": question_results
        }
    
    def get_user_quizzes(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Quiz]:
        """Get all quizzes for a user."""
        return self.quiz_repository.get_by_user_id(user_id, skip, limit)
    
    def get_user_attempts(self, user_id: int, skip: int = 0, limit: int = 100) -> List[QuizAttempt]:
        """Get all quiz attempts for a user."""
        return self.quiz_attempt_repository.get_by_user_id(user_id, skip, limit)
    
    def get_user_attempts_with_quiz_details(self, user_id: int, skip: int = 0, limit: int = 100) -> list:
        """Get quiz attempt history with quiz details for dashboard."""
        attempts = self.quiz_attempt_repository.get_by_user_id(user_id, skip, limit)
        history = []
        for attempt in attempts:
            quiz = self.quiz_repository.get_by_id(attempt.quiz_id)
            if quiz:
                history.append({
                    'id': attempt.id,
                    'quiz_id': attempt.quiz_id,
                    'topic': quiz.title,
                    'total_score': attempt.total_score,
                    'percentage': attempt.percentage,
                    'total_questions': quiz.total_questions,
                    'time_taken': attempt.time_taken,
                    'completed_at': attempt.completed_at,
                    'difficulty': 'Medium',  # Default, could be stored in quiz model
                    'question_type': 'Mixed',  # Default
                    'source_type': 'topic',  # Could be determined from quiz source
                })
        return history
    
    def delete_quiz(self, quiz_id: int, user_id: int) -> bool:
        """Delete a quiz."""
        quiz = self.quiz_repository.get_by_id(quiz_id)
        if not quiz:
            return False
        
        if quiz.user_id != user_id:
            raise ValueError("User does not have permission to delete this quiz")
        
        return self.quiz_repository.delete(quiz_id)
