from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from loguru import logger
from app.database.models.analytics import Analytics
from app.database.models.quiz_attempt import QuizAttempt, AttemptStatus
from app.database.repository import AnalyticsRepository, QuizAttemptRepository, QuestionRepository
from app.database.schemas.analytics import AnalyticsUpdate


class AnalyticsService:
    """Service for analytics and performance tracking."""
    
    def __init__(self, db: Session):
        """Initialize analytics service."""
        self.db = db
        self.analytics_repository = AnalyticsRepository(db)
        self.quiz_attempt_repository = QuizAttemptRepository(db)
        self.question_repository = QuestionRepository(db)
    
    def get_user_analytics(self, user_id: int) -> Analytics:
        """Get or create analytics for user."""
        analytics = self.analytics_repository.get_by_user_id(user_id)
        
        if not analytics:
            # Create initial analytics
            analytics_data = {
                "user_id": user_id,
                "overall_accuracy": 0.0,
                "total_quizzes_attempted": 0,
                "total_questions_attempted": 0,
                "total_correct": 0,
                "total_wrong": 0,
                "topic_performance": {},
                "difficulty_performance": {},
                "learning_curve": [],
                "weak_areas": [],
                "strong_areas": []
            }
            analytics = self.analytics_repository.create(analytics_data)

        # Backfill analytics from real historical attempts so already-existing users
        # with prior quiz data are not stuck at zero values after login.
        self._sync_analytics_from_attempts(user_id, analytics)
        return analytics

    def _sync_analytics_from_attempts(self, user_id: int, analytics: Analytics) -> None:
        """Recalculate analytics from the user's completed quiz attempts."""
        attempts = self.quiz_attempt_repository.get_by_user_id(user_id, 0, 500)
        if not attempts:
            return

        total_quizzes = len(attempts)
        total_questions = sum(max(int(attempt.max_score or attempt.total_score or 0), 0) for attempt in attempts)
        total_correct = sum(int(attempt.correct_count or 0) for attempt in attempts)
        total_wrong = sum(int(attempt.wrong_count or 0) for attempt in attempts)

        topic_performance: Dict[str, Dict[str, Any]] = {}
        for attempt in attempts:
            if not attempt.answers:
                continue
            if attempt.quiz_id:
                try:
                    from app.database.repository import QuizRepository
                    quiz_repo = QuizRepository(self.db)
                    quiz_questions = quiz_repo.get_quiz_questions(attempt.quiz_id)
                    for quiz_question in quiz_questions:
                        question = quiz_question.question
                        topic = question.topic or "general"
                        if topic not in topic_performance:
                            topic_performance[topic] = {"total_questions": 0, "correct_answers": 0, "accuracy": 0.0}

                        topic_performance[topic]["total_questions"] += 1
                        user_answer = attempt.answers.get(str(question.id)) if attempt.answers else None
                        if user_answer and user_answer == question.correct_answer:
                            topic_performance[topic]["correct_answers"] += 1
                except Exception:
                    continue

        if topic_performance:
            for topic, stats in topic_performance.items():
                total = stats["total_questions"]
                correct = stats["correct_answers"]
                stats["accuracy"] = (correct / total * 100) if total > 0 else 0.0
            analytics.topic_performance = topic_performance
        else:
            analytics.topic_performance = analytics.topic_performance or {}

        if total_questions > 0:
            analytics.total_questions_attempted = total_questions
            analytics.total_correct = total_correct
            analytics.total_wrong = total_wrong
            analytics.total_quizzes_attempted = total_quizzes
            analytics.overall_accuracy = (total_correct / (total_correct + total_wrong) * 100) if (total_correct + total_wrong) > 0 else 0.0
            analytics.weak_areas = [
                topic for topic, data in (analytics.topic_performance or {}).items()
                if data.get("accuracy", 0) < 60 and data.get("total_questions", 0) >= 3
            ]
            analytics.strong_areas = [
                topic for topic, data in (analytics.topic_performance or {}).items()
                if data.get("accuracy", 0) > 80 and data.get("total_questions", 0) >= 3
            ]
            self.db.commit()
            self.db.refresh(analytics)
    
    def update_analytics_after_quiz(self, attempt: QuizAttempt) -> Analytics:
        """Update analytics after quiz completion."""
        logger.info(f"Updating analytics for user {attempt.user_id} after quiz {attempt.quiz_id}")

        # Recalculate from the actual attempt history so existing users are not
        # double-counted while still keeping newly-finished attempts in sync.
        analytics = self.get_user_analytics(attempt.user_id)

        # Add the latest performance point without duplicating the finished quiz.
        if not analytics.learning_curve or analytics.learning_curve[-1].get("quiz_id") != attempt.quiz_id:
            self._update_learning_curve(analytics, attempt)

        if analytics.topic_performance:
            self._update_weak_strong_areas(analytics)

        self.db.commit()
        self.db.refresh(analytics)

        return analytics
    
    def _update_learning_curve(self, analytics: Analytics, attempt: QuizAttempt):
        """Update learning curve with latest performance."""
        if not analytics.learning_curve:
            analytics.learning_curve = []
        
        # Add new data point
        analytics.learning_curve.append({
            "date": datetime.now().isoformat(),
            "quiz_id": attempt.quiz_id,
            "percentage": attempt.percentage,
            "accuracy": attempt.percentage,  # Same as percentage for quizzes
            "time_taken": attempt.time_taken
        })
        
        # Keep only last 100 data points
        if len(analytics.learning_curve) > 100:
            analytics.learning_curve = analytics.learning_curve[-100:]
    
    def _update_topic_performance(self, analytics: Analytics, attempt: QuizAttempt):
        """Update topic-wise performance."""
        if not analytics.topic_performance:
            analytics.topic_performance = {}
        
        # Get quiz questions with topics
        from app.database.repository import QuizRepository
        quiz_repo = QuizRepository(self.db)
        quiz_questions = quiz_repo.get_quiz_questions(attempt.quiz_id)
        
        # Aggregate performance by topic
        topic_stats = {}
        for quiz_question in quiz_questions:
            question = quiz_question.question
            topic = question.topic or "general"
            
            if topic not in topic_stats:
                topic_stats[topic] = {
                    "total": 0,
                    "correct": 0,
                    "attempts": 0
                }
            
            topic_stats[topic]["total"] += 1
            topic_stats[topic]["attempts"] += 1
            
            # Check if user answered correctly (simplified)
            user_answer = attempt.answers.get(str(question.id)) if attempt.answers else None
            if user_answer and user_answer == question.correct_answer:
                topic_stats[topic]["correct"] += 1
        
        # Update analytics with new topic data
        for topic, stats in topic_stats.items():
            if topic not in analytics.topic_performance:
                analytics.topic_performance[topic] = {
                    "total_questions": 0,
                    "correct_answers": 0,
                    "accuracy": 0.0
                }
            
            analytics.topic_performance[topic]["total_questions"] += stats["total"]
            analytics.topic_performance[topic]["correct_answers"] += stats["correct"]
            
            total = analytics.topic_performance[topic]["total_questions"]
            correct = analytics.topic_performance[topic]["correct_answers"]
            analytics.topic_performance[topic]["accuracy"] = (correct / total * 100) if total > 0 else 0
    
    def _update_difficulty_performance(self, analytics: Analytics, attempt: QuizAttempt):
        """Update difficulty-wise performance."""
        if not analytics.difficulty_performance:
            analytics.difficulty_performance = {}
        
        # Get quiz questions with difficulty
        from app.database.repository import QuizRepository
        quiz_repo = QuizRepository(self.db)
        quiz_questions = quiz_repo.get_quiz_questions(attempt.quiz_id)
        
        # Aggregate performance by difficulty
        difficulty_stats = {}
        for quiz_question in quiz_questions:
            question = quiz_question.question
            difficulty = question.difficulty.value if question.difficulty else "medium"
            
            if difficulty not in difficulty_stats:
                difficulty_stats[difficulty] = {
                    "total": 0,
                    "correct": 0
                }
            
            difficulty_stats[difficulty]["total"] += 1
            
            # Check if user answered correctly
            user_answer = attempt.answers.get(str(question.id)) if attempt.answers else None
            if user_answer and user_answer == question.correct_answer:
                difficulty_stats[difficulty]["correct"] += 1
        
        # Update analytics
        for difficulty, stats in difficulty_stats.items():
            if difficulty not in analytics.difficulty_performance:
                analytics.difficulty_performance[difficulty] = {
                    "total_questions": 0,
                    "correct_answers": 0,
                    "accuracy": 0.0
                }
            
            analytics.difficulty_performance[difficulty]["total_questions"] += stats["total"]
            analytics.difficulty_performance[difficulty]["correct_answers"] += stats["correct"]
            
            total = analytics.difficulty_performance[difficulty]["total_questions"]
            correct = analytics.difficulty_performance[difficulty]["correct_answers"]
            analytics.difficulty_performance[difficulty]["accuracy"] = (correct / total * 100) if total > 0 else 0
    
    def _update_weak_strong_areas(self, analytics: Analytics):
        """Update weak and strong areas based on performance."""
        if not analytics.topic_performance:
            return
        
        # Identify weak areas (accuracy < 60%)
        weak_areas = [
            topic for topic, data in analytics.topic_performance.items()
            if data["accuracy"] < 60 and data["total_questions"] >= 3
        ]
        
        # Identify strong areas (accuracy > 80%)
        strong_areas = [
            topic for topic, data in analytics.topic_performance.items()
            if data["accuracy"] > 80 and data["total_questions"] >= 3
        ]
        
        analytics.weak_areas = weak_areas
        analytics.strong_areas = strong_areas
    
    def get_dashboard_data(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive dashboard data."""
        analytics = self.get_user_analytics(user_id)
        
        # Get recent attempts
        recent_attempts = self.quiz_attempt_repository.get_by_user_id(user_id, 0, 10)
        
        # Calculate progress data
        daily_progress = self._calculate_progress(user_id, days=7)
        weekly_progress = self._calculate_progress(user_id, days=30)
        monthly_progress = self._calculate_progress(user_id, days=90)
        
        return {
            "overall_accuracy": analytics.overall_accuracy,
            "total_quizzes_attempted": analytics.total_quizzes_attempted,
            "total_questions_attempted": analytics.total_questions_attempted,
            "average_score": sum(a.percentage for a in recent_attempts) / len(recent_attempts) if recent_attempts else 0,
            "completion_rate": self._calculate_completion_rate(user_id),
            "daily_progress": daily_progress,
            "weekly_progress": weekly_progress,
            "monthly_progress": monthly_progress,
            "topic_performance": analytics.topic_performance or {},
            "difficulty_performance": analytics.difficulty_performance or {},
            "recent_quizzes": [
                {
                    "quiz_id": a.quiz_id,
                    "percentage": a.percentage,
                    "completed_at": a.completed_at,
                    "time_taken": a.time_taken
                }
                for a in recent_attempts
            ],
            "weak_areas": analytics.weak_areas or [],
            "strong_areas": analytics.strong_areas or []
        }
    
    def _calculate_progress(self, user_id: int, days: int) -> List[Dict[str, Any]]:
        """Calculate progress over specified days."""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        attempts = self.db.query(QuizAttempt).filter(
            QuizAttempt.user_id == user_id,
            QuizAttempt.status == AttemptStatus.COMPLETED,
            QuizAttempt.completed_at >= int(start_date.timestamp()),
            QuizAttempt.completed_at <= int(end_date.timestamp())
        ).all()
        
        # Group by date
        progress_data = {}
        for attempt in attempts:
            date = datetime.fromtimestamp(attempt.completed_at).strftime('%Y-%m-%d')
            if date not in progress_data:
                progress_data[date] = {
                    "quizzes_completed": 0,
                    "total_score": 0,
                    "total_questions": 0
                }
            
            progress_data[date]["quizzes_completed"] += 1
            progress_data[date]["total_score"] += attempt.percentage
            progress_data[date]["total_questions"] += (
                attempt.correct_count + attempt.wrong_count + attempt.skipped_count
            )
        
        # Convert to list and sort by date
        progress = [
            {
                "date": date,
                "quizzes_completed": data["quizzes_completed"],
                "average_score": data["total_score"] / data["quizzes_completed"] if data["quizzes_completed"] > 0 else 0,
                "questions_attempted": data["total_questions"]
            }
            for date, data in sorted(progress_data.items())
        ]
        
        return progress
    
    def _calculate_completion_rate(self, user_id: int) -> float:
        """Calculate quiz completion rate."""
        total_attempts = self.quiz_attempt_repository.get_by_user_id(user_id)
        completed_attempts = [a for a in total_attempts if a.status == AttemptStatus.COMPLETED]
        
        if not total_attempts:
            return 0.0
        
        return (len(completed_attempts) / len(total_attempts)) * 100
    
    def get_performance_analysis(self, user_id: int) -> Dict[str, Any]:
        """Get detailed performance analysis."""
        analytics = self.get_user_analytics(user_id)
        
        # Calculate trends
        accuracy_trend = []
        if analytics.learning_curve:
            for i in range(0, len(analytics.learning_curve), 5):
                chunk = analytics.learning_curve[i:i+5]
                if chunk:
                    avg_accuracy = sum(d["accuracy"] for d in chunk) / len(chunk)
                    accuracy_trend.append({
                        "period": i // 5 + 1,
                        "average_accuracy": avg_accuracy
                    })
        
        # Speed analysis
        attempts = self.quiz_attempt_repository.get_by_user_id(user_id, 0, 50)
        completed_attempts = [a for a in attempts if a.status == AttemptStatus.COMPLETED]
        
        speed_analysis = {}
        if completed_attempts:
            avg_time = sum(a.time_taken for a in completed_attempts) / len(completed_attempts)
            speed_analysis = {
                "average_time_per_quiz": avg_time,
                "average_time_per_question": avg_time / 10,  # Assuming 10 questions per quiz
                "fastest_quiz": min(a.time_taken for a in completed_attempts),
                "slowest_quiz": max(a.time_taken for a in completed_attempts)
            }
        
        return {
            "accuracy_trend": accuracy_trend,
            "speed_analysis": speed_analysis,
            "difficulty_progression": analytics.difficulty_performance or {},
            "topic_mastery": analytics.topic_performance or {},
            "learning_velocity": self._calculate_learning_velocity(analytics),
            "retention_rate": self._calculate_retention_rate(user_id),
            "improvement_areas": analytics.weak_areas or []
        }
    
    def _calculate_learning_velocity(self, analytics: Analytics) -> float:
        """Calculate learning velocity (improvement rate)."""
        if not analytics.learning_curve or len(analytics.learning_curve) < 2:
            return 0.0
        
        recent = analytics.learning_curve[-5:]
        older = analytics.learning_curve[-10:-5] if len(analytics.learning_curve) >= 10 else analytics.learning_curve[:-5]
        
        if not older:
            return 0.0
        
        recent_avg = sum(d["accuracy"] for d in recent) / len(recent)
        older_avg = sum(d["accuracy"] for d in older) / len(older)
        
        return recent_avg - older_avg
    
    def _calculate_retention_rate(self, user_id: int) -> float:
        """Calculate retention rate (simplified)."""
        # This would normally track performance on repeated topics
        # For now, return a placeholder
        return 75.0
