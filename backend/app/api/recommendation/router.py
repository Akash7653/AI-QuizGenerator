from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.database.schemas.recommendation import (
    RecommendationResponse, PersonalizedLearningPath, NextStepRecommendation
)
from app.database.models.user import User
from app.middleware.auth import get_current_user
from app.database.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendation", tags=["Recommendations"])


@router.get("/", response_model=List[RecommendationResponse])
async def get_recommendations(
    recommendation_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized recommendations for current user."""
    recommendation_service = RecommendationService(db)
    return recommendation_service.get_user_recommendations(current_user.id, recommendation_type)


@router.post("/generate", response_model=List[RecommendationResponse])
async def generate_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate new personalized recommendations."""
    recommendation_service = RecommendationService(db)
    return recommendation_service.generate_recommendations(current_user.id)


@router.get("/learning-path", response_model=PersonalizedLearningPath)
async def get_learning_path(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized learning path."""
    recommendation_service = RecommendationService(db)
    return recommendation_service.get_personalized_learning_path(current_user.id)


@router.get("/next-step", response_model=NextStepRecommendation)
async def get_next_step(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get next recommended learning step."""
    recommendation_service = RecommendationService(db)
    recommendations = recommendation_service.get_user_recommendations(current_user.id)
    
    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recommendations available"
        )
    
    # Get highest priority recommendation
    top_recommendation = max(recommendations, key=lambda r: r.priority)
    
    return NextStepRecommendation(
        action_type=top_recommendation.recommendation_type,
        title=top_recommendation.title,
        description=top_recommendation.description,
        estimated_time=30,  # Default 30 minutes
        difficulty=top_recommendation.difficulty or "medium",
        confidence=0.8,
        reason=top_recommendation.description
    )


@router.post("/{recommendation_id}/complete")
async def complete_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark recommendation as completed."""
    recommendation_service = RecommendationService(db)
    
    recommendation = recommendation_service.mark_recommendation_completed(
        recommendation_id, current_user.id
    )
    
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )
    
    return {"message": "Recommendation marked as completed"}


@router.post("/{recommendation_id}/dismiss")
async def dismiss_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dismiss a recommendation."""
    recommendation_service = RecommendationService(db)
    
    recommendation = recommendation_service.dismiss_recommendation(
        recommendation_id, current_user.id
    )
    
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )
    
    return {"message": "Recommendation dismissed"}


@router.put("/{recommendation_id}/priority")
async def update_recommendation_priority(
    recommendation_id: int,
    priority: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update recommendation priority."""
    recommendation_service = RecommendationService(db)
    
    recommendation = recommendation_service.update_recommendation_priority(
        recommendation_id, priority, current_user.id
    )
    
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )
    
    return {"message": "Recommendation priority updated", "priority": priority}


@router.get("/topic/{topic}")
async def get_topic_recommendations(
    topic: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recommendations for specific topic."""
    recommendation_service = RecommendationService(db)
    recommendations = recommendation_service.get_user_recommendations(current_user.id)
    
    # Filter by topic
    topic_recommendations = [
        rec for rec in recommendations
        if rec.topic and topic.lower() in rec.title.lower()
    ]
    
    return topic_recommendations


@router.get("/revision/suggestions")
async def get_revision_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get revision-focused recommendations."""
    recommendation_service = RecommendationService(db)
    return recommendation_service.get_user_recommendations(current_user.id, "revision")
