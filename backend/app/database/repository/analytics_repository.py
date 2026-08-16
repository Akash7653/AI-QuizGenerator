from typing import Optional, List, Dict, Any
from app.database.mongodb_models import AnalyticsModel, UserModel
from app.database.repository.base import BaseRepository


class AnalyticsRepository(BaseRepository[AnalyticsModel]):
    """Repository for Analytics model."""
    
    def __init__(self):
        super().__init__(AnalyticsModel)
    
    async def get_by_user_id(self, user_id: str) -> Optional[AnalyticsModel]:
        """Get analytics by user ID."""
        return await self.model.find_one(self.model.user_id == user_id)
    
    async def create_or_update(self, user_id: str, analytics_data: Dict[str, Any]) -> AnalyticsModel:
        """Create or update analytics for user."""
        analytics = await self.get_by_user_id(user_id)
        
        if analytics:
            return await self.update(analytics, analytics_data)
        else:
            analytics_data['user_id'] = user_id
            return await self.create(analytics_data)
    
    async def update_topic_performance(self, user_id: str, topic_performance: Dict[str, Any]) -> Optional[AnalyticsModel]:
        """Update topic performance for user."""
        analytics = await self.get_by_user_id(user_id)
        if analytics:
            analytics.topic_performance = topic_performance
            await analytics.save()
        return analytics
    
    async def update_difficulty_performance(self, user_id: str, difficulty_performance: Dict[str, Any]) -> Optional[AnalyticsModel]:
        """Update difficulty performance for user."""
        analytics = await self.get_by_user_id(user_id)
        if analytics:
            analytics.difficulty_performance = difficulty_performance
            await analytics.save()
        return analytics
    
    async def update_learning_curve(self, user_id: str, learning_curve: List[Dict[str, Any]]) -> Optional[AnalyticsModel]:
        """Update learning curve for user."""
        analytics = await self.get_by_user_id(user_id)
        if analytics:
            analytics.learning_curve = learning_curve
            await analytics.save()
        return analytics
    
    async def update_weak_areas(self, user_id: str, weak_areas: List[str]) -> Optional[AnalyticsModel]:
        """Update weak areas for user."""
        analytics = await self.get_by_user_id(user_id)
        if analytics:
            analytics.weak_areas = weak_areas
            await analytics.save()
        return analytics
    
    async def update_strong_areas(self, user_id: str, strong_areas: List[str]) -> Optional[AnalyticsModel]:
        """Update strong areas for user."""
        analytics = await self.get_by_user_id(user_id)
        if analytics:
            analytics.strong_areas = strong_areas
            await analytics.save()
        return analytics
    
    async def increment_quiz_attempted(self, user_id: str) -> Optional[AnalyticsModel]:
        """Increment total quizzes attempted."""
        analytics = await self.get_by_user_id(user_id)
        if analytics:
            analytics.total_quizzes_attempted += 1
            await analytics.save()
        return analytics
    
    async def increment_questions_attempted(self, user_id: str, count: int = 1) -> Optional[AnalyticsModel]:
        """Increment total questions attempted."""
        analytics = await self.get_by_user_id(user_id)
        if analytics:
            analytics.total_questions_attempted += count
            await analytics.save()
        return analytics
    
    async def increment_correct_answers(self, user_id: str, count: int = 1) -> Optional[AnalyticsModel]:
        """Increment correct answers count."""
        analytics = await self.get_by_user_id(user_id)
        if analytics:
            analytics.total_correct += count
            self._recalculate_accuracy(analytics)
            await analytics.save()
        return analytics
    
    async def increment_wrong_answers(self, user_id: str, count: int = 1) -> Optional[AnalyticsModel]:
        """Increment wrong answers count."""
        analytics = await self.get_by_user_id(user_id)
        if analytics:
            analytics.total_wrong += count
            self._recalculate_accuracy(analytics)
            await analytics.save()
        return analytics
    
    def _recalculate_accuracy(self, analytics: AnalyticsModel) -> None:
        """Recalculate overall accuracy."""
        total_answered = analytics.total_correct + analytics.total_wrong
        if total_answered > 0:
            analytics.overall_accuracy = (analytics.total_correct / total_answered) * 100
        else:
            analytics.overall_accuracy = 0.0
    
    async def get_top_performers(self, limit: int = 10) -> List[AnalyticsModel]:
        """Get top performers by accuracy."""
        return await self.model.find().sort(-self.model.overall_accuracy).limit(limit).to_list()
    
    async def get_leaderboard(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get leaderboard with user details."""
        analytics_list = await self.model.find().sort(-self.model.overall_accuracy).skip(skip).limit(limit).to_list()
        
        result = []
        for analytics in analytics_list:
            user = await UserModel.find_one(UserModel.id == analytics.user_id)
            if user:
                result.append({
                    "user_id": str(analytics.user_id),
                    "username": user.username,
                    "email": user.email,
                    "overall_accuracy": analytics.overall_accuracy,
                    "total_quizzes_attempted": analytics.total_quizzes_attempted,
                    "total_questions_attempted": analytics.total_questions_attempted
                })
        
        return result
