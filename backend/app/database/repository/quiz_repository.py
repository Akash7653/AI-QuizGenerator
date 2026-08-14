from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from app.database.models.quiz import Quiz, QuizMode, QuizQuestion
from app.database.models.quiz_attempt import QuizAttempt, AttemptStatus
from app.database.repository.base import BaseRepository


class QuizRepository(BaseRepository[Quiz]):
    """Repository for Quiz model."""
    
    def __init__(self, db: Session):
        super().__init__(Quiz, db)
    
    def get_by_user_id(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Quiz]:
        """Get quizzes by user ID."""
        return self.db.query(Quiz).filter(
            Quiz.user_id == user_id
        ).offset(skip).limit(limit).all()
    
    def get_by_mode(self, mode: QuizMode, skip: int = 0, limit: int = 100) -> List[Quiz]:
        """Get quizzes by mode."""
        return self.db.query(Quiz).filter(
            Quiz.mode == mode
        ).offset(skip).limit(limit).all()
    
    def get_by_document_id(self, document_id: int, skip: int = 0, limit: int = 100) -> List[Quiz]:
        """Get quizzes by document ID."""
        return self.db.query(Quiz).filter(
            Quiz.document_id == document_id
        ).offset(skip).limit(limit).all()
    
    def get_by_topic_id(self, topic_id: int, skip: int = 0, limit: int = 100) -> List[Quiz]:
        """Get quizzes by topic ID."""
        return self.db.query(Quiz).filter(
            Quiz.topic_id == topic_id
        ).offset(skip).limit(limit).all()
    
    def add_questions_to_quiz(self, quiz_id: int, question_ids: List[int]) -> Optional[Quiz]:
        """Add questions to quiz."""
        quiz = self.get_by_id(quiz_id)
        if quiz:
            for index, question_id in enumerate(question_ids):
                quiz_question = QuizQuestion(
                    quiz_id=quiz_id,
                    question_id=question_id,
                    question_order=index + 1
                )
                self.db.add(quiz_question)
            
            quiz.total_questions = len(question_ids)
            self.db.commit()
            self.db.refresh(quiz)
        return quiz
    
    def get_quiz_questions(self, quiz_id: int) -> List[QuizQuestion]:
        """Get all questions in a quiz."""
        return self.db.query(QuizQuestion).filter(
            QuizQuestion.quiz_id == quiz_id
        ).order_by(QuizQuestion.question_order).all()
    
    def remove_question_from_quiz(self, quiz_id: int, question_id: int) -> bool:
        """Remove question from quiz."""
        quiz_question = self.db.query(QuizQuestion).filter(
            and_(
                QuizQuestion.quiz_id == quiz_id,
                QuizQuestion.question_id == question_id
            )
        ).first()
        
        if quiz_question:
            self.db.delete(quiz_question)
            
            # Update question orders
            quiz_questions = self.get_quiz_questions(quiz_id)
            for index, qq in enumerate(quiz_questions):
                qq.question_order = index + 1
            
            quiz = self.get_by_id(quiz_id)
            if quiz:
                quiz.total_questions = len(quiz_questions)
            
            self.db.commit()
            return True
        return False
    
    def get_quiz_stats(self, user_id: Optional[int] = None) -> Dict[str, Any]:
        """Get quiz statistics."""
        query = self.db.query(Quiz)
        if user_id:
            query = query.filter(Quiz.user_id == user_id)
        
        total_quizzes = query.count()
        
        mode_stats = {}
        for mode in QuizMode:
            mode_query = self.db.query(Quiz)
            if user_id:
                mode_query = mode_query.filter(Quiz.user_id == user_id)
            mode_stats[mode.value] = mode_query.filter(Quiz.mode == mode).count()
        
        return {
            "total_quizzes": total_quizzes,
            "mode_distribution": mode_stats
        }


class QuizAttemptRepository(BaseRepository[QuizAttempt]):
    """Repository for QuizAttempt model."""
    
    def __init__(self, db: Session):
        super().__init__(QuizAttempt, db)
    
    def get_by_user_id(self, user_id: int, skip: int = 0, limit: int = 100) -> List[QuizAttempt]:
        """Get quiz attempts by user ID."""
        return self.db.query(QuizAttempt).filter(
            QuizAttempt.user_id == user_id
        ).order_by(QuizAttempt.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_by_quiz_id(self, quiz_id: int, skip: int = 0, limit: int = 100) -> List[QuizAttempt]:
        """Get quiz attempts by quiz ID."""
        return self.db.query(QuizAttempt).filter(
            QuizAttempt.quiz_id == quiz_id
        ).order_by(QuizAttempt.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_by_user_and_quiz(self, user_id: int, quiz_id: int) -> List[QuizAttempt]:
        """Get quiz attempts by user and quiz."""
        return self.db.query(QuizAttempt).filter(
            and_(
                QuizAttempt.user_id == user_id,
                QuizAttempt.quiz_id == quiz_id
            )
        ).order_by(QuizAttempt.created_at.desc()).all()
    
    def get_by_status(self, status: AttemptStatus, skip: int = 0, limit: int = 100) -> List[QuizAttempt]:
        """Get quiz attempts by status."""
        return self.db.query(QuizAttempt).filter(
            QuizAttempt.status == status
        ).offset(skip).limit(limit).all()
    
    def get_in_progress_attempts(self, user_id: int) -> List[QuizAttempt]:
        """Get in-progress attempts for a user."""
        return self.db.query(QuizAttempt).filter(
            and_(
                QuizAttempt.user_id == user_id,
                QuizAttempt.status == AttemptStatus.IN_PROGRESS
            )
        ).all()
    
    def update_attempt_progress(
        self,
        attempt_id: int,
        current_question_index: int,
        answers: Dict[str, Any],
        time_taken: int
    ) -> Optional[QuizAttempt]:
        """Update attempt progress."""
        attempt = self.get_by_id(attempt_id)
        if attempt:
            attempt.current_question_index = current_question_index
            attempt.answers = answers
            attempt.time_taken = time_taken
            self.db.commit()
            self.db.refresh(attempt)
        return attempt
    
    def complete_attempt(
        self,
        attempt_id: int,
        total_score: float,
        max_score: float,
        percentage: float,
        correct_count: int,
        wrong_count: int,
        skipped_count: int,
        completed_at: int
    ) -> Optional[QuizAttempt]:
        """Complete quiz attempt."""
        attempt = self.get_by_id(attempt_id)
        if attempt:
            attempt.status = AttemptStatus.COMPLETED
            attempt.total_score = total_score
            attempt.max_score = max_score
            attempt.percentage = percentage
            attempt.correct_count = correct_count
            attempt.wrong_count = wrong_count
            attempt.skipped_count = skipped_count
            attempt.completed_at = completed_at
            self.db.commit()
            self.db.refresh(attempt)
        return attempt
    
    def get_user_attempt_stats(self, user_id: int) -> Dict[str, Any]:
        """Get attempt statistics for a user."""
        total_attempts = self.db.query(QuizAttempt).filter(
            QuizAttempt.user_id == user_id
        ).count()
        
        completed_attempts = self.db.query(QuizAttempt).filter(
            and_(
                QuizAttempt.user_id == user_id,
                QuizAttempt.status == AttemptStatus.COMPLETED
            )
        ).count()
        
        avg_score = self.db.query(func.avg(QuizAttempt.percentage)).filter(
            and_(
                QuizAttempt.user_id == user_id,
                QuizAttempt.status == AttemptStatus.COMPLETED
            )
        ).scalar() or 0.0
        
        avg_time = self.db.query(func.avg(QuizAttempt.time_taken)).filter(
            and_(
                QuizAttempt.user_id == user_id,
                QuizAttempt.status == AttemptStatus.COMPLETED
            )
        ).scalar() or 0
        
        return {
            "total_attempts": total_attempts,
            "completed_attempts": completed_attempts,
            "completion_rate": (completed_attempts / total_attempts * 100) if total_attempts > 0 else 0,
            "average_score": avg_score,
            "average_time": avg_time
        }
