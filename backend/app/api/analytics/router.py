from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.schemas.analytics import DashboardResponse, PerformanceAnalysis
from app.database.models.user import User
from app.middleware.auth import get_current_user
from app.database.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard analytics."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_dashboard_data(current_user.id)


@router.get("/performance", response_model=PerformanceAnalysis)
async def get_performance_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed performance analysis."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_performance_analysis(current_user.id)


@router.get("/topics")
async def get_topic_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get topic-wise performance data."""
    analytics_service = AnalyticsService(db)
    analytics = analytics_service.get_user_analytics(current_user.id)
    return analytics.topic_performance or {}


@router.get("/difficulty")
async def get_difficulty_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get difficulty-wise performance data."""
    analytics_service = AnalyticsService(db)
    analytics = analytics_service.get_user_analytics(current_user.id)
    return analytics.difficulty_performance or {}


@router.get("/learning-curve")
async def get_learning_curve(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get learning curve data."""
    analytics_service = AnalyticsService(db)
    analytics = analytics_service.get_user_analytics(current_user.id)
    return analytics.learning_curve or []


@router.get("/stats")
async def get_analytics_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get basic analytics statistics."""
    analytics_service = AnalyticsService(db)
    analytics = analytics_service.get_user_analytics(current_user.id)
    
    return {
        "overall_accuracy": analytics.overall_accuracy,
        "total_quizzes_attempted": analytics.total_quizzes_attempted,
        "total_questions_attempted": analytics.total_questions_attempted,
        "total_correct": analytics.total_correct,
        "total_wrong": analytics.total_wrong,
        "weak_areas": analytics.weak_areas or [],
        "strong_areas": analytics.strong_areas or []
    }
