from typing import Optional, List, Dict, Any
from app.database.mongodb_models import QuizModel, QuizMode, QuizAttemptModel, AttemptStatus
from app.database.repository.base import BaseRepository


class QuizRepository(BaseRepository[QuizModel]):
    """Repository for Quiz model."""
    
    def __init__(self):
        super().__init__(QuizModel)
    
    async def get_by_user_id(self, user_id: str, skip: int = 0, limit: int = 100) -> List[QuizModel]:
        """Get quizzes by user ID."""
        return await self.model.find(self.model.user_id == user_id).skip(skip).limit(limit).to_list()
    
    async def get_by_mode(self, mode: QuizMode, skip: int = 0, limit: int = 100) -> List[QuizModel]:
        """Get quizzes by mode."""
        return await self.model.find(self.model.mode == mode).skip(skip).limit(limit).to_list()
    
    async def get_by_document_id(self, document_id: str, skip: int = 0, limit: int = 100) -> List[QuizModel]:
        """Get quizzes by document ID."""
        return await self.model.find(self.model.document_id == document_id).skip(skip).limit(limit).to_list()
    
    async def get_by_topic_id(self, topic_id: str, skip: int = 0, limit: int = 100) -> List[QuizModel]:
        """Get quizzes by topic ID."""
        return await self.model.find(self.model.topic_id == topic_id).skip(skip).limit(limit).to_list()
    
    async def add_questions_to_quiz(self, quiz_id: str, question_ids: List[str]) -> Optional[QuizModel]:
        """Add questions to quiz."""
        quiz = await self.get_by_id(quiz_id)
        if quiz:
            quiz.question_ids = question_ids
            quiz.total_questions = len(question_ids)
            await quiz.save()
        return quiz
    
    async def get_quiz_questions(self, quiz_id: str) -> List[str]:
        """Get all question IDs in a quiz."""
        quiz = await self.get_by_id(quiz_id)
        if quiz:
            return quiz.question_ids
        return []
    
    async def remove_question_from_quiz(self, quiz_id: str, question_id: str) -> bool:
        """Remove question from quiz."""
        quiz = await self.get_by_id(quiz_id)
        if quiz and question_id in quiz.question_ids:
            quiz.question_ids.remove(question_id)
            quiz.total_questions = len(quiz.question_ids)
            await quiz.save()
            return True
        return False
    
    async def get_quiz_stats(self, user_id: Optional[int] = None) -> Dict[str, Any]:
        """Get quiz statistics."""
        if user_id:
            total_quizzes = await self.model.find(self.model.user_id == user_id).count()
        else:
            total_quizzes = await self.model.count()
        
        mode_stats = {}
        for mode in QuizMode:
            if user_id:
                mode_stats[mode.value] = await self.model.find({
                    "user_id": user_id,
                    "mode": mode
                }).count()
            else:
                mode_stats[mode.value] = await self.model.find(self.model.mode == mode).count()
        
        return {
            "total_quizzes": total_quizzes,
            "mode_distribution": mode_stats
        }


class QuizAttemptRepository(BaseRepository[QuizAttemptModel]):
    """Repository for QuizAttempt model."""
    
    def __init__(self):
        super().__init__(QuizAttemptModel)
    
    async def get_by_user_id(self, user_id: str, skip: int = 0, limit: int = 100) -> List[QuizAttemptModel]:
        """Get quiz attempts by user ID."""
        return await self.model.find(self.model.user_id == user_id).sort(-self.model.created_at).skip(skip).limit(limit).to_list()
    
    async def get_by_quiz_id(self, quiz_id: str, skip: int = 0, limit: int = 100) -> List[QuizAttemptModel]:
        """Get quiz attempts by quiz ID."""
        return await self.model.find(self.model.quiz_id == quiz_id).sort(-self.model.created_at).skip(skip).limit(limit).to_list()
    
    async def get_by_user_and_quiz(self, user_id: str, quiz_id: str) -> List[QuizAttemptModel]:
        """Get quiz attempts by user and quiz."""
        return await self.model.find({
            "user_id": user_id,
            "quiz_id": quiz_id
        }).sort(-self.model.created_at).to_list()
    
    async def get_by_status(self, status: AttemptStatus, skip: int = 0, limit: int = 100) -> List[QuizAttemptModel]:
        """Get quiz attempts by status."""
        return await self.model.find(self.model.status == status).skip(skip).limit(limit).to_list()
    
    async def get_in_progress_attempts(self, user_id: str) -> List[QuizAttemptModel]:
        """Get in-progress attempts for a user."""
        return await self.model.find({
            "user_id": str(user_id),
            "status": AttemptStatus.IN_PROGRESS
        }).to_list()
    
    async def update_attempt_progress(
        self,
        attempt_id: str,
        current_question_index: int,
        answers: Dict[str, Any],
        time_taken: int
    ) -> Optional[QuizAttemptModel]:
        """Update attempt progress."""
        attempt = await self.get_by_id(attempt_id)
        if attempt:
            attempt.current_question_index = current_question_index
            attempt.answers = answers
            attempt.time_taken = time_taken
            await attempt.save()
        return attempt
    
    async def complete_attempt(
        self,
        attempt_id: str,
        total_score: float,
        max_score: float,
        percentage: float,
        correct_count: int,
        wrong_count: int,
        skipped_count: int,
        completed_at: int
    ) -> Optional[QuizAttemptModel]:
        """Complete quiz attempt."""
        attempt = await self.get_by_id(attempt_id)
        if attempt:
            attempt.status = AttemptStatus.COMPLETED
            attempt.total_score = total_score
            attempt.max_score = max_score
            attempt.percentage = percentage
            attempt.correct_count = correct_count
            attempt.wrong_count = wrong_count
            attempt.skipped_count = skipped_count
            attempt.completed_at = completed_at
            await attempt.save()
        return attempt
    
    async def get_user_attempt_stats(self, user_id: str) -> Dict[str, Any]:
        """Get attempt statistics for a user."""
        total_attempts = await self.model.find(self.model.user_id == str(user_id)).count()
        
        completed_attempts = await self.model.find({
            "user_id": str(user_id),
            "status": AttemptStatus.COMPLETED
        }).count()
        
        # Calculate average score
        completed_attempts_list = await self.model.find({
            "user_id": str(user_id),
            "status": AttemptStatus.COMPLETED
        }).to_list()
        
        avg_score = 0.0
        avg_time = 0
        if completed_attempts_list:
            avg_score = sum(attempt.percentage for attempt in completed_attempts_list) / len(completed_attempts_list)
            avg_time = sum(attempt.time_taken for attempt in completed_attempts_list) // len(completed_attempts_list)
        
        return {
            "total_attempts": total_attempts,
            "completed_attempts": completed_attempts,
            "completion_rate": (completed_attempts / total_attempts * 100) if total_attempts > 0 else 0,
            "average_score": avg_score,
            "average_time": avg_time
        }
