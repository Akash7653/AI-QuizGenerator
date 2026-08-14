from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from loguru import logger
from app.database.models.recommendation import Recommendation
from app.database.models.analytics import Analytics
from app.database.models.quiz import Quiz
from app.database.repository import RecommendationRepository, AnalyticsRepository, QuizRepository, QuestionRepository
from app.database.schemas.recommendation import RecommendationCreate


class RecommendationService:
    """Service for personalized learning recommendations."""
    
    def __init__(self, db: Session):
        """Initialize recommendation service."""
        self.db = db
        self.recommendation_repository = RecommendationRepository(db)
        self.analytics_repository = AnalyticsRepository(db)
        self.quiz_repository = QuizRepository(db)
        self.question_repository = QuestionRepository(db)
    
    def generate_recommendations(self, user_id: int) -> List[Recommendation]:
        """Generate personalized recommendations for user."""
        logger.info(f"Generating recommendations for user {user_id}")
        
        # Get user analytics
        analytics = self.analytics_repository.get_by_user_id(user_id)
        if not analytics:
            logger.warning(f"No analytics found for user {user_id}")
            return []
        
        recommendations = []
        
        # Generate weak topic recommendations
        weak_topic_recs = self._generate_weak_topic_recommendations(user_id, analytics)
        recommendations.extend(weak_topic_recs)
        
        # Generate next quiz recommendations
        next_quiz_recs = self._generate_next_quiz_recommendations(user_id, analytics)
        recommendations.extend(next_quiz_recs)
        
        # Generate revision recommendations
        revision_recs = self._generate_revision_recommendations(user_id, analytics)
        recommendations.extend(revision_recs)
        
        # Generate next topic recommendations
        next_topic_recs = self._generate_next_topic_recommendations(user_id, analytics)
        recommendations.extend(next_topic_recs)
        
        # Clear old recommendations and save new ones
        self.recommendation_repository.clear_user_recommendations(user_id)
        
        saved_recommendations = []
        for rec_data in recommendations:
            rec_data['user_id'] = user_id
            recommendation = self.recommendation_repository.create(rec_data)
            saved_recommendations.append(recommendation)
        
        logger.info(f"Generated {len(saved_recommendations)} recommendations for user {user_id}")
        return saved_recommendations
    
    def _generate_weak_topic_recommendations(
        self,
        user_id: int,
        analytics: Analytics
    ) -> List[Dict[str, Any]]:
        """Generate recommendations for weak topics."""
        recommendations = []
        
        weak_areas = analytics.weak_areas or []
        
        for i, topic in enumerate(weak_areas[:3]):  # Top 3 weak areas
            recommendations.append({
                "recommendation_type": "weak_topic",
                "title": f"Practice {topic}",
                "description": f"Your performance in {topic} needs improvement. Focus on this topic to strengthen your understanding.",
                "topic": topic,
                "priority": 100 - i * 10,  # Higher priority for weaker areas
                "difficulty": self._get_recommended_difficulty(topic, analytics),
                "metadata": {
                    "current_accuracy": analytics.topic_performance.get(topic, {}).get("accuracy", 0),
                    "reason": "weak_performance"
                }
            })
        
        return recommendations
    
    def _generate_next_quiz_recommendations(
        self,
        user_id: int,
        analytics: Analytics
    ) -> List[Dict[str, Any]]:
        """Generate recommendations for next quiz to take."""
        recommendations = []
        
        # Get user's recent quizzes
        recent_quizzes = self.quiz_repository.get_by_user_id(user_id, 0, 5)
        
        if not recent_quizzes:
            # Recommend starting with easy quizzes
            recommendations.append({
                "recommendation_type": "next_quiz",
                "title": "Start with a Practice Quiz",
                "description": "Begin your learning journey with a practice quiz to assess your current level.",
                "priority": 90,
                "difficulty": "easy",
                "metadata": {
                    "reason": "first_quiz"
                }
            })
        else:
            # Recommend quiz based on last performance
            last_quiz = recent_quizzes[0]
            if last_quiz.mode.value == "practice":
                recommendations.append({
                    "recommendation_type": "next_quiz",
                    "title": "Try a Timed Quiz",
                    "description": "You've completed practice quizzes. Challenge yourself with a timed quiz.",
                    "priority": 80,
                    "difficulty": "medium",
                    "metadata": {
                        "reason": "progression"
                    }
                })
            else:
                recommendations.append({
                    "recommendation_type": "next_quiz",
                    "title": "Continue Practice",
                    "description": "Keep practicing to reinforce your learning.",
                    "priority": 75,
                    "difficulty": "medium",
                    "metadata": {
                        "reason": "continued_practice"
                    }
                })
        
        return recommendations
    
    def _generate_revision_recommendations(
        self,
        user_id: int,
        analytics: Analytics
    ) -> List[Dict[str, Any]]:
        """Generate revision recommendations."""
        recommendations = []
        
        # Identify topics that haven't been practiced recently
        if analytics.topic_performance:
            # Sort topics by last practice time (simplified - would need timestamp data)
            topics = list(analytics.topic_performance.keys())
            
            # Recommend revision for topics with moderate performance
            moderate_topics = [
                topic for topic, data in analytics.topic_performance.items()
                if 60 <= data.get("accuracy", 0) <= 80
            ]
            
            for topic in moderate_topics[:2]:
                recommendations.append({
                    "recommendation_type": "revision",
                    "title": f"Revise {topic}",
                    "description": f"Review {topic} to consolidate your understanding and move to mastery level.",
                    "topic": topic,
                    "priority": 70,
                    "difficulty": "medium",
                    "metadata": {
                        "current_accuracy": analytics.topic_performance.get(topic, {}).get("accuracy", 0),
                        "reason": "consolidation"
                    }
                })
        
        return recommendations
    
    def _generate_next_topic_recommendations(
        self,
        user_id: int,
        analytics: Analytics
    ) -> List[Dict[str, Any]]:
        """Generate recommendations for next topics to learn."""
        recommendations = []
        
        # Recommend topics based on strong areas (build on strengths)
        strong_areas = analytics.strong_areas or []
        
        if strong_areas:
            # Suggest advanced topics related to strong areas
            for topic in strong_areas[:2]:
                recommendations.append({
                    "recommendation_type": "next_topic",
                    "title": f"Advanced {topic}",
                    "description": f"You've shown strength in {topic}. Consider exploring advanced concepts in this area.",
                    "topic": topic,
                    "priority": 60,
                    "difficulty": "hard",
                    "metadata": {
                        "current_accuracy": analytics.topic_performance.get(topic, {}).get("accuracy", 0),
                        "reason": "advanced_learning"
                    }
                })
        
        return recommendations
    
    def _get_recommended_difficulty(self, topic: str, analytics: Analytics) -> str:
        """Get recommended difficulty level for a topic."""
        topic_performance = analytics.topic_performance.get(topic, {})
        accuracy = topic_performance.get("accuracy", 0)
        
        if accuracy < 50:
            return "easy"
        elif accuracy < 75:
            return "medium"
        else:
            return "hard"
    
    def get_user_recommendations(
        self,
        user_id: int,
        recommendation_type: Optional[str] = None
    ) -> List[Recommendation]:
        """Get recommendations for user."""
        if recommendation_type:
            return self.recommendation_repository.get_by_type(user_id, recommendation_type)
        else:
            return self.recommendation_repository.get_active_recommendations(user_id)
    
    def get_personalized_learning_path(self, user_id: int) -> Dict[str, Any]:
        """Get personalized learning path for user."""
        analytics = self.analytics_repository.get_by_user_id(user_id)
        recommendations = self.get_user_recommendations(user_id)
        
        if not analytics:
            return {
                "current_level": "beginner",
                "recommended_topics": [],
                "recommended_quizzes": [],
                "revision_schedule": [],
                "weak_topic_focus": [],
                "estimated_completion_time": 0,
                "learning_objectives": []
            }
        
        # Determine current level
        overall_accuracy = analytics.overall_accuracy
        if overall_accuracy < 50:
            current_level = "beginner"
        elif overall_accuracy < 75:
            current_level = "intermediate"
        else:
            current_level = "advanced"
        
        # Organize recommendations
        recommended_topics = [
            {
                "topic": rec.title,
                "priority": rec.priority,
                "difficulty": rec.difficulty,
                "reason": rec.description
            }
            for rec in recommendations
            if rec.recommendation_type in ["weak_topic", "next_topic"]
        ]
        
        recommended_quizzes = [
            {
                "quiz_id": rec.quiz_id,
                "title": rec.title,
                "priority": rec.priority,
                "reason": rec.description
            }
            for rec in recommendations
            if rec.recommendation_type == "next_quiz" and rec.quiz_id
        ]
        
        revision_schedule = [
            {
                "topic": rec.title,
                "suggested_date": (datetime.now() + timedelta(days=rec.priority // 10)).isoformat(),
                "reason": rec.description
            }
            for rec in recommendations
            if rec.recommendation_type == "revision"
        ]
        
        weak_topic_focus = [
            {
                "topic": rec.title,
                "current_accuracy": rec.recommendation_metadata.get("current_accuracy", 0) if rec.recommendation_metadata else 0,
                "target_accuracy": 80,
                "priority": rec.priority
            }
            for rec in recommendations
            if rec.recommendation_type == "weak_topic"
        ]
        
        # Estimate completion time (simplified)
        estimated_time = len(recommendations) * 30  # 30 minutes per recommendation
        
        # Generate learning objectives
        learning_objectives = [
            f"Improve accuracy in weak areas to 80%+",
            f"Complete {len(recommended_quizzes)} recommended quizzes",
            f"Master {len(weak_topic_focus)} weak topics",
            f"Review and consolidate {len(revision_schedule)} topics"
        ]
        
        return {
            "current_level": current_level,
            "recommended_topics": recommended_topics,
            "recommended_quizzes": recommended_quizzes,
            "revision_schedule": revision_schedule,
            "weak_topic_focus": weak_topic_focus,
            "estimated_completion_time": estimated_time,
            "learning_objectives": learning_objectives
        }
    
    def mark_recommendation_completed(self, recommendation_id: int, user_id: int) -> Optional[Recommendation]:
        """Mark recommendation as completed."""
        recommendation = self.recommendation_repository.get_by_id(recommendation_id)
        
        if not recommendation or recommendation.user_id != user_id:
            return None
        
        return self.recommendation_repository.mark_as_completed(recommendation_id)
    
    def dismiss_recommendation(self, recommendation_id: int, user_id: int) -> Optional[Recommendation]:
        """Dismiss recommendation."""
        recommendation = self.recommendation_repository.get_by_id(recommendation_id)
        
        if not recommendation or recommendation.user_id != user_id:
            return None
        
        return self.recommendation_repository.mark_as_dismissed(recommendation_id)
    
    def update_recommendation_priority(self, recommendation_id: int, priority: int, user_id: int) -> Optional[Recommendation]:
        """Update recommendation priority."""
        recommendation = self.recommendation_repository.get_by_id(recommendation_id)
        
        if not recommendation or recommendation.user_id != user_id:
            return None
        
        return self.recommendation_repository.update_priority(recommendation_id, priority)
