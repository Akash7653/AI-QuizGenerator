from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from loguru import logger
from app.database.mongodb_models import AnalyticsModel, QuizAttemptModel, AttemptStatus
from app.database.repository.analytics_repository import AnalyticsRepository
from app.database.repository.quiz_repository import QuizAttemptRepository
from app.database.repository.question_repository import QuestionRepository
from app.database.schemas.analytics import AnalyticsUpdate


class AnalyticsService:
    """Service for analytics and performance tracking."""
    
    def __init__(self):
        """Initialize analytics service."""
        self.analytics_repository = AnalyticsRepository()
        self.quiz_attempt_repository = QuizAttemptRepository()
        self.question_repository = QuestionRepository()
    
    async def get_user_analytics(self, user_id: str) -> AnalyticsModel:
        """Get or create analytics for user."""
        print(f"[Analytics] Getting analytics for user_id: {user_id} (type: {type(user_id)})")
        analytics = await self.analytics_repository.get_by_user_id(user_id)

        if not analytics:
            # Create initial analytics
            print(f"[Analytics] Creating new analytics for user_id: {user_id}")
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
            analytics = await self.analytics_repository.create(analytics_data)

        # Backfill analytics from real historical attempts so already-existing users
        # with prior quiz data are not stuck at zero values after login.
        await self._sync_analytics_from_attempts(user_id, analytics)
        print(f"[Analytics] Returning analytics for user_id: {user_id} - total_quizzes: {analytics.total_quizzes_attempted}")
        return analytics

    async def _sync_analytics_from_attempts(self, user_id: str, analytics: AnalyticsModel) -> None:
        """Recalculate analytics from the user's completed quiz attempts."""
        attempts = await self.quiz_attempt_repository.get_by_user_id(user_id, 0, 500)
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
                    from app.database.repository.quiz_repository import QuizRepository
                    quiz_repo = QuizRepository()
                    quiz_question_ids = await quiz_repo.get_quiz_questions(attempt.quiz_id)
                    for question_id in quiz_question_ids:
                        question = await self.question_repository.get_by_id(question_id)
                        if not question:
                            continue
                        topic = question.subtopic or "general"
                        if topic not in topic_performance:
                            topic_performance[topic] = {"total_questions": 0, "correct_answers": 0, "accuracy": 0.0}

                        topic_performance[topic]["total_questions"] += 1
                        user_answer = attempt.answers.get(str(question_id)) if attempt.answers else None
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
            await analytics.save()
    
    async def update_analytics_after_quiz(self, attempt: QuizAttemptModel) -> AnalyticsModel:
        """Update analytics after quiz completion."""
        logger.info(f"Updating analytics for user {attempt.user_id} after quiz {attempt.quiz_id}")

        # Recalculate from the actual attempt history so existing users are not
        # double-counted while still keeping newly-finished attempts in sync.
        analytics = await self.get_user_analytics(attempt.user_id)

        # Add the latest performance point without duplicating the finished quiz.
        if not analytics.learning_curve or analytics.learning_curve[-1].get("quiz_id") != attempt.quiz_id:
            self._update_learning_curve(analytics, attempt)

        if analytics.topic_performance:
            self._update_weak_strong_areas(analytics)

        await analytics.save()

        return analytics
    
    def _update_learning_curve(self, analytics: AnalyticsModel, attempt: QuizAttemptModel):
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
    
    async def _update_topic_performance(self, analytics: AnalyticsModel, attempt: QuizAttemptModel):
        """Update topic-wise performance."""
        if not analytics.topic_performance:
            analytics.topic_performance = {}
        
        # Get quiz questions with topics
        from app.database.repository.quiz_repository import QuizRepository
        quiz_repo = QuizRepository()
        quiz_question_ids = await quiz_repo.get_quiz_questions(attempt.quiz_id)
        
        # Aggregate performance by topic
        topic_stats = {}
        for question_id in quiz_question_ids:
            question = await self.question_repository.get_by_id(question_id)
            if not question:
                continue
            topic = question.subtopic or "general"
            
            if topic not in topic_stats:
                topic_stats[topic] = {
                    "total": 0,
                    "correct": 0,
                    "attempts": 0
                }
            
            topic_stats[topic]["total"] += 1
            topic_stats[topic]["attempts"] += 1
            
            # Check if user answered correctly (simplified)
            user_answer = attempt.answers.get(str(question_id)) if attempt.answers else None
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
    
    async def _update_difficulty_performance(self, analytics: AnalyticsModel, attempt: QuizAttemptModel):
        """Update difficulty-wise performance."""
        if not analytics.difficulty_performance:
            analytics.difficulty_performance = {}
        
        # Get quiz questions with difficulty
        from app.database.repository.quiz_repository import QuizRepository
        quiz_repo = QuizRepository()
        quiz_question_ids = await quiz_repo.get_quiz_questions(attempt.quiz_id)
        
        # Aggregate performance by difficulty
        difficulty_stats = {}
        for question_id in quiz_question_ids:
            question = await self.question_repository.get_by_id(question_id)
            if not question:
                continue
            difficulty = question.difficulty.value if question.difficulty else "medium"
            
            if difficulty not in difficulty_stats:
                difficulty_stats[difficulty] = {
                    "total": 0,
                    "correct": 0
                }
            
            difficulty_stats[difficulty]["total"] += 1
            
            # Check if user answered correctly
            user_answer = attempt.answers.get(str(question_id)) if attempt.answers else None
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
    
    def _update_weak_strong_areas(self, analytics: AnalyticsModel):
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
    
    async def get_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive dashboard data."""
        try:
            print(f"[Analytics] Getting dashboard data for user_id: {user_id} (type: {type(user_id)})")
            logger.info(f"Getting dashboard data for user {user_id}")
            analytics = await self.get_user_analytics(user_id)

            # Get recent attempts
            recent_attempts = await self.quiz_attempt_repository.get_by_user_id(user_id, 0, 10)
            print(f"[Analytics] Found {len(recent_attempts)} recent attempts for user_id: {user_id}")
            logger.info(f"Found {len(recent_attempts)} recent attempts for user {user_id}")
            
            # Calculate progress data with error handling
            try:
                daily_progress = await self._calculate_progress(user_id, days=7)
            except Exception as e:
                logger.warning(f"Error calculating daily progress: {str(e)}")
                daily_progress = []
                
            try:
                weekly_progress = await self._calculate_progress(user_id, days=30)
            except Exception as e:
                logger.warning(f"Error calculating weekly progress: {str(e)}")
                weekly_progress = []
                
            try:
                monthly_progress = await self._calculate_progress(user_id, days=90)
            except Exception as e:
                logger.warning(f"Error calculating monthly progress: {str(e)}")
                monthly_progress = []
            
            try:
                completion_rate = await self._calculate_completion_rate(user_id)
            except Exception as e:
                logger.warning(f"Error calculating completion rate: {str(e)}")
                completion_rate = 0.0
            
            # Calculate average score safely
            average_score = 0.0
            if recent_attempts:
                try:
                    average_score = sum(a.percentage for a in recent_attempts) / len(recent_attempts)
                except Exception as e:
                    logger.warning(f"Error calculating average score: {str(e)}")
            
            return {
                "overall_accuracy": analytics.overall_accuracy if analytics else 0.0,
                "total_quizzes_attempted": analytics.total_quizzes_attempted if analytics else 0,
                "total_questions_attempted": analytics.total_questions_attempted if analytics else 0,
                "average_score": average_score,
                "completion_rate": completion_rate,
                "daily_progress": daily_progress,
                "weekly_progress": weekly_progress,
                "monthly_progress": monthly_progress,
                "topic_performance": analytics.topic_performance if analytics else {},
                "difficulty_performance": analytics.difficulty_performance if analytics else {},
                "recent_quizzes": [
                    {
                        "quiz_id": str(a.quiz_id),
                        "percentage": a.percentage,
                        "completed_at": a.completed_at,
                        "time_taken": a.time_taken
                    }
                    for a in recent_attempts
                ],
                "weak_areas": analytics.weak_areas if analytics else [],
                "strong_areas": analytics.strong_areas if analytics else []
            }
        except Exception as e:
            logger.error(f"Error getting dashboard data for user {user_id}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            # Return empty dashboard for new users or on error
            return {
                "overall_accuracy": 0.0,
                "total_quizzes_attempted": 0,
                "total_questions_attempted": 0,
                "average_score": 0.0,
                "completion_rate": 0.0,
                "daily_progress": [],
                "weekly_progress": [],
                "monthly_progress": [],
                "topic_performance": {},
                "difficulty_performance": {},
                "recent_quizzes": [],
                "weak_areas": [],
                "strong_areas": []
            }
    
    async def _calculate_progress(self, user_id: str, days: int) -> List[Dict[str, Any]]:
        """Calculate progress over specified days."""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        attempts = await self.quiz_attempt_repository.get_by_user_id(user_id, 0, 1000)
        
        # Filter by date range and status
        filtered_attempts = [
            a for a in attempts 
            if a.status == AttemptStatus.COMPLETED 
            and a.completed_at 
            and int(start_date.timestamp()) <= a.completed_at <= int(end_date.timestamp())
        ]
        
        # Group by date
        progress_data = {}
        for attempt in filtered_attempts:
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
    
    async def _calculate_completion_rate(self, user_id: str) -> float:
        """Calculate quiz completion rate."""
        try:
            total_attempts = await self.quiz_attempt_repository.get_by_user_id(user_id)
            completed_attempts = [a for a in total_attempts if a.status == AttemptStatus.COMPLETED]
            
            if not total_attempts:
                return 0.0
            
            return (len(completed_attempts) / len(total_attempts)) * 100
        except Exception as e:
            logger.warning(f"Error calculating completion rate for user {user_id}: {str(e)}")
            return 0.0
    
    async def get_performance_analysis(self, user_id: str) -> Dict[str, Any]:
        """Get detailed performance analysis."""
        analytics = await self.get_user_analytics(user_id)
        
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
        attempts = await self.quiz_attempt_repository.get_by_user_id(user_id, 0, 50)
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
            "retention_rate": await self._calculate_retention_rate(user_id),
            "improvement_areas": analytics.weak_areas or []
        }
    
    def _calculate_learning_velocity(self, analytics: AnalyticsModel) -> float:
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
    
    async def _calculate_retention_rate(self, user_id: str) -> float:
        """Calculate retention rate (simplified)."""
        # This would normally track performance on repeated topics
        # For now, return a placeholder
        return 75.0
