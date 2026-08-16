from typing import Optional, List, Dict, Any
from app.database.mongodb_models import RecommendationModel
from app.database.repository.base import BaseRepository


class RecommendationRepository(BaseRepository[RecommendationModel]):
    """Repository for Recommendation model."""
    
    def __init__(self):
        super().__init__(RecommendationModel)
    
    async def get_by_user_id(self, user_id: int, skip: int = 0, limit: int = 100) -> List[RecommendationModel]:
        """Get recommendations by user ID."""
        return await self.model.find(self.model.user_id == user_id).sort(-self.model.priority).skip(skip).limit(limit).to_list()
    
    async def get_by_type(self, user_id: int, recommendation_type: str, skip: int = 0, limit: int = 100) -> List[RecommendationModel]:
        """Get recommendations by type for user."""
        return await self.model.find({
            "user_id": user_id,
            "recommendation_type": recommendation_type
        }).sort(-self.model.priority).skip(skip).limit(limit).to_list()
    
    async def get_active_recommendations(self, user_id: int, skip: int = 0, limit: int = 100) -> List[RecommendationModel]:
        """Get active (not completed/dismissed) recommendations for user."""
        return await self.model.find({
            "user_id": user_id,
            "is_completed": False,
            "is_dismissed": False
        }).sort(-self.model.priority).skip(skip).limit(limit).to_list()
    
    async def get_completed_recommendations(self, user_id: int, skip: int = 0, limit: int = 100) -> List[RecommendationModel]:
        """Get completed recommendations for user."""
        return await self.model.find({
            "user_id": user_id,
            "is_completed": True
        }).sort(-self.model.updated_at).skip(skip).limit(limit).to_list()
    
    async def get_by_topic_id(self, topic_id: int, skip: int = 0, limit: int = 100) -> List[RecommendationModel]:
        """Get recommendations by topic ID."""
        return await self.model.find(self.model.topic_id == topic_id).skip(skip).limit(limit).to_list()
    
    async def get_by_quiz_id(self, quiz_id: int, skip: int = 0, limit: int = 100) -> List[RecommendationModel]:
        """Get recommendations by quiz ID."""
        return await self.model.find(self.model.quiz_id == quiz_id).skip(skip).limit(limit).to_list()
    
    async def mark_as_completed(self, recommendation_id: int) -> Optional[RecommendationModel]:
        """Mark recommendation as completed."""
        recommendation = await self.get_by_id(recommendation_id)
        if recommendation:
            recommendation.is_completed = True
            await recommendation.save()
        return recommendation
    
    async def mark_as_dismissed(self, recommendation_id: int) -> Optional[RecommendationModel]:
        """Mark recommendation as dismissed."""
        recommendation = await self.get_by_id(recommendation_id)
        if recommendation:
            recommendation.is_dismissed = True
            await recommendation.save()
        return recommendation
    
    async def update_priority(self, recommendation_id: int, priority: int) -> Optional[RecommendationModel]:
        """Update recommendation priority."""
        recommendation = await self.get_by_id(recommendation_id)
        if recommendation:
            recommendation.priority = priority
            await recommendation.save()
        return recommendation
    
    async def bulk_create_recommendations(self, recommendations: List[Dict[str, Any]]) -> List[RecommendationModel]:
        """Bulk create recommendations."""
        return await self.bulk_create(recommendations)
    
    async def clear_user_recommendations(self, user_id: int) -> int:
        """Clear all recommendations for user."""
        result = await self.model.find(self.model.user_id == user_id).delete()
        return result.deleted_count
    
    async def get_pending_count(self, user_id: int) -> int:
        """Get count of pending recommendations for user."""
        return await self.model.find({
            "user_id": user_id,
            "is_completed": False,
            "is_dismissed": False
        }).count()
