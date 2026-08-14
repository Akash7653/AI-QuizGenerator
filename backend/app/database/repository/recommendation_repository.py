from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.database.models.recommendation import Recommendation
from app.database.repository.base import BaseRepository


class RecommendationRepository(BaseRepository[Recommendation]):
    """Repository for Recommendation model."""
    
    def __init__(self, db: Session):
        super().__init__(Recommendation, db)
    
    def get_by_user_id(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Recommendation]:
        """Get recommendations by user ID."""
        return self.db.query(Recommendation).filter(
            Recommendation.user_id == user_id
        ).order_by(Recommendation.priority.desc()).offset(skip).limit(limit).all()
    
    def get_by_type(self, user_id: int, recommendation_type: str, skip: int = 0, limit: int = 100) -> List[Recommendation]:
        """Get recommendations by type for user."""
        return self.db.query(Recommendation).filter(
            and_(
                Recommendation.user_id == user_id,
                Recommendation.recommendation_type == recommendation_type
            )
        ).order_by(Recommendation.priority.desc()).offset(skip).limit(limit).all()
    
    def get_active_recommendations(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Recommendation]:
        """Get active (not completed/dismissed) recommendations for user."""
        return self.db.query(Recommendation).filter(
            and_(
                Recommendation.user_id == user_id,
                Recommendation.is_completed == False,
                Recommendation.is_dismissed == False
            )
        ).order_by(Recommendation.priority.desc()).offset(skip).limit(limit).all()
    
    def get_completed_recommendations(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Recommendation]:
        """Get completed recommendations for user."""
        return self.db.query(Recommendation).filter(
            and_(
                Recommendation.user_id == user_id,
                Recommendation.is_completed == True
            )
        ).order_by(Recommendation.updated_at.desc()).offset(skip).limit(limit).all()
    
    def get_by_topic_id(self, topic_id: int, skip: int = 0, limit: int = 100) -> List[Recommendation]:
        """Get recommendations by topic ID."""
        return self.db.query(Recommendation).filter(
            Recommendation.topic_id == topic_id
        ).offset(skip).limit(limit).all()
    
    def get_by_quiz_id(self, quiz_id: int, skip: int = 0, limit: int = 100) -> List[Recommendation]:
        """Get recommendations by quiz ID."""
        return self.db.query(Recommendation).filter(
            Recommendation.quiz_id == quiz_id
        ).offset(skip).limit(limit).all()
    
    def mark_as_completed(self, recommendation_id: int) -> Optional[Recommendation]:
        """Mark recommendation as completed."""
        recommendation = self.get_by_id(recommendation_id)
        if recommendation:
            recommendation.is_completed = True
            self.db.commit()
            self.db.refresh(recommendation)
        return recommendation
    
    def mark_as_dismissed(self, recommendation_id: int) -> Optional[Recommendation]:
        """Mark recommendation as dismissed."""
        recommendation = self.get_by_id(recommendation_id)
        if recommendation:
            recommendation.is_dismissed = True
            self.db.commit()
            self.db.refresh(recommendation)
        return recommendation
    
    def update_priority(self, recommendation_id: int, priority: int) -> Optional[Recommendation]:
        """Update recommendation priority."""
        recommendation = self.get_by_id(recommendation_id)
        if recommendation:
            recommendation.priority = priority
            self.db.commit()
            self.db.refresh(recommendation)
        return recommendation
    
    def bulk_create_recommendations(self, recommendations: List[Dict[str, Any]]) -> List[Recommendation]:
        """Bulk create recommendations."""
        return self.bulk_create(recommendations)
    
    def clear_user_recommendations(self, user_id: int) -> int:
        """Clear all recommendations for user."""
        deleted = self.db.query(Recommendation).filter(
            Recommendation.user_id == user_id
        ).delete()
        self.db.commit()
        return deleted
    
    def get_pending_count(self, user_id: int) -> int:
        """Get count of pending recommendations for user."""
        return self.db.query(Recommendation).filter(
            and_(
                Recommendation.user_id == user_id,
                Recommendation.is_completed == False,
                Recommendation.is_dismissed == False
            )
        ).count()
