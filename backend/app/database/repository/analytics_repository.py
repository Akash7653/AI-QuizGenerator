from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.database.models.analytics import Analytics
from app.database.repository.base import BaseRepository


class AnalyticsRepository(BaseRepository[Analytics]):
    """Repository for Analytics model."""
    
    def __init__(self, db: Session):
        super().__init__(Analytics, db)
    
    def get_by_user_id(self, user_id: int) -> Optional[Analytics]:
        """Get analytics by user ID."""
        return self.db.query(Analytics).filter(Analytics.user_id == user_id).first()
    
    def create_or_update(self, user_id: int, analytics_data: Dict[str, Any]) -> Analytics:
        """Create or update analytics for user."""
        analytics = self.get_by_user_id(user_id)
        
        if analytics:
            return self.update(analytics, analytics_data)
        else:
            analytics_data['user_id'] = user_id
            return self.create(analytics_data)
    
    def update_topic_performance(self, user_id: int, topic_performance: Dict[str, Any]) -> Optional[Analytics]:
        """Update topic performance for user."""
        analytics = self.get_by_user_id(user_id)
        if analytics:
            analytics.topic_performance = topic_performance
            self.db.commit()
            self.db.refresh(analytics)
        return analytics
    
    def update_difficulty_performance(self, user_id: int, difficulty_performance: Dict[str, Any]) -> Optional[Analytics]:
        """Update difficulty performance for user."""
        analytics = self.get_by_user_id(user_id)
        if analytics:
            analytics.difficulty_performance = difficulty_performance
            self.db.commit()
            self.db.refresh(analytics)
        return analytics
    
    def update_learning_curve(self, user_id: int, learning_curve: List[Dict[str, Any]]) -> Optional[Analytics]:
        """Update learning curve for user."""
        analytics = self.get_by_user_id(user_id)
        if analytics:
            analytics.learning_curve = learning_curve
            self.db.commit()
            self.db.refresh(analytics)
        return analytics
    
    def update_weak_areas(self, user_id: int, weak_areas: List[str]) -> Optional[Analytics]:
        """Update weak areas for user."""
        analytics = self.get_by_user_id(user_id)
        if analytics:
            analytics.weak_areas = weak_areas
            self.db.commit()
            self.db.refresh(analytics)
        return analytics
    
    def update_strong_areas(self, user_id: int, strong_areas: List[str]) -> Optional[Analytics]:
        """Update strong areas for user."""
        analytics = self.get_by_user_id(user_id)
        if analytics:
            analytics.strong_areas = strong_areas
            self.db.commit()
            self.db.refresh(analytics)
        return analytics
    
    def increment_quiz_attempted(self, user_id: int) -> Optional[Analytics]:
        """Increment total quizzes attempted."""
        analytics = self.get_by_user_id(user_id)
        if analytics:
            analytics.total_quizzes_attempted += 1
            self.db.commit()
            self.db.refresh(analytics)
        return analytics
    
    def increment_questions_attempted(self, user_id: int, count: int = 1) -> Optional[Analytics]:
        """Increment total questions attempted."""
        analytics = self.get_by_user_id(user_id)
        if analytics:
            analytics.total_questions_attempted += count
            self.db.commit()
            self.db.refresh(analytics)
        return analytics
    
    def increment_correct_answers(self, user_id: int, count: int = 1) -> Optional[Analytics]:
        """Increment correct answers count."""
        analytics = self.get_by_user_id(user_id)
        if analytics:
            analytics.total_correct += count
            self._recalculate_accuracy(analytics)
            self.db.commit()
            self.db.refresh(analytics)
        return analytics
    
    def increment_wrong_answers(self, user_id: int, count: int = 1) -> Optional[Analytics]:
        """Increment wrong answers count."""
        analytics = self.get_by_user_id(user_id)
        if analytics:
            analytics.total_wrong += count
            self._recalculate_accuracy(analytics)
            self.db.commit()
            self.db.refresh(analytics)
        return analytics
    
    def _recalculate_accuracy(self, analytics: Analytics) -> None:
        """Recalculate overall accuracy."""
        total_answered = analytics.total_correct + analytics.total_wrong
        if total_answered > 0:
            analytics.overall_accuracy = (analytics.total_correct / total_answered) * 100
        else:
            analytics.overall_accuracy = 0.0
    
    def get_top_performers(self, limit: int = 10) -> List[Analytics]:
        """Get top performers by accuracy."""
        return self.db.query(Analytics).order_by(
            Analytics.overall_accuracy.desc()
        ).limit(limit).all()
    
    def get_leaderboard(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get leaderboard with user details."""
        from app.database.models.user import User
        
        results = self.db.query(
            Analytics,
            User.name,
            User.email
        ).join(
            User,
            Analytics.user_id == User.id
        ).order_by(
            Analytics.overall_accuracy.desc()
        ).offset(skip).limit(limit).all()
        
        return [
            {
                "user_id": analytics.user_id,
                "name": name,
                "email": email,
                "overall_accuracy": analytics.overall_accuracy,
                "total_quizzes_attempted": analytics.total_quizzes_attempted,
                "total_questions_attempted": analytics.total_questions_attempted
            }
            for analytics, name, email in results
        ]
