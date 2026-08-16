from celery import shared_task
from loguru import logger
from app.database.services.analytics_service import AnalyticsService
from app.database.mongodb_models import QuizAttemptModel, AttemptStatus
from app.database.repository.quiz_repository import QuizAttemptRepository


@shared_task
def update_user_analytics(user_id: int):
    """Update analytics for a specific user."""
    logger.info(f"Updating analytics for user {user_id}")
    
    try:
        analytics_service = AnalyticsService()
        attempt_repo = QuizAttemptRepository()
        
        # Get recent completed attempts
        recent_attempts = attempt_repo.get_by_user_id(user_id, 0, 10)
        completed_attempts = [
            a for a in recent_attempts
            if a.status == AttemptStatus.COMPLETED
        ]
        
        # Update analytics for each completed attempt
        for attempt in completed_attempts:
            analytics_service.update_analytics_after_quiz(attempt)
        
        logger.info(f"Analytics updated for user {user_id}")
        return {
            "status": "success",
            "user_id": user_id,
            "attempts_processed": len(completed_attempts)
        }
        
    except Exception as e:
        logger.error(f"Analytics update failed: {str(e)}")
        return {"status": "error", "message": str(e)}


@shared_task
def update_all_analytics():
    """Update analytics for all users."""
    logger.info("Updating analytics for all users")
    
    try:
        from app.database.repository.user_repository import UserRepository
        user_repo = UserRepository()
        
        users = user_repo.get_all(limit=1000)  # Process in batches
        results = []
        
        for user in users:
            result = update_user_analytics(user.id)
            results.append(result)
        
        success_count = sum(1 for r in results if r.get('status') == 'success')
        
        logger.info(f"Analytics update complete: {success_count}/{len(users)} successful")
        return {
            "status": "success",
            "total_users": len(users),
            "successful": success_count,
            "failed": len(users) - success_count
        }
        
    except Exception as e:
        logger.error(f"Bulk analytics update failed: {str(e)}")
        return {"status": "error", "message": str(e)}


@shared_task
def generate_analytics_report(user_id: int, report_type: str = "weekly"):
    """Generate analytics report for user."""
    logger.info(f"Generating {report_type} report for user {user_id}")
    
    try:
        analytics_service = AnalyticsService()
        
        if report_type == "dashboard":
            report = analytics_service.get_dashboard_data(user_id)
        elif report_type == "performance":
            report = analytics_service.get_performance_analysis(user_id)
        else:
            report = analytics_service.get_dashboard_data(user_id)
        
        logger.info(f"Report generated for user {user_id}")
        return {
            "status": "success",
            "user_id": user_id,
            "report_type": report_type,
            "report": report
        }
        
    except Exception as e:
        logger.error(f"Report generation failed: {str(e)}")
        return {"status": "error", "message": str(e)}
