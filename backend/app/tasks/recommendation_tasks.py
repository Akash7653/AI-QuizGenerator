from celery import shared_task
from loguru import logger
from app.database.services.recommendation_service import RecommendationService
from app.database.repository.user_repository import UserRepository


@shared_task
def generate_daily_recommendations(user_id: int = None):
    """Generate daily recommendations for user or all users."""
    logger.info(f"Generating daily recommendations for user {user_id or 'all users'}")
    
    try:
        recommendation_service = RecommendationService()
        
        if user_id:
            # Generate for specific user
            recommendations = recommendation_service.generate_recommendations(user_id)
            return {
                "status": "success",
                "user_id": user_id,
                "recommendations_count": len(recommendations)
            }
        else:
            # Generate for all users
            user_repo = UserRepository()
            users = user_repo.get_all(limit=1000)
            
            total_recommendations = 0
            for user in users:
                recommendations = recommendation_service.generate_recommendations(user.id)
                total_recommendations += len(recommendations)
            
            logger.info(f"Generated {total_recommendations} recommendations for {len(users)} users")
            return {
                "status": "success",
                "total_users": len(users),
                "total_recommendations": total_recommendations
            }
        
    except Exception as e:
        logger.error(f"Recommendation generation failed: {str(e)}")
        return {"status": "error", "message": str(e)}


@shared_task
def update_learning_paths():
    """Update learning paths for all users."""
    logger.info("Updating learning paths for all users")
    
    try:
        recommendation_service = RecommendationService()
        user_repo = UserRepository()
        
        users = user_repo.get_all(limit=1000)
        results = []
        
        for user in users:
            try:
                learning_path = recommendation_service.get_personalized_learning_path(user.id)
                results.append({
                    "user_id": user.id,
                    "status": "success",
                    "learning_path": learning_path
                })
            except Exception as e:
                results.append({
                    "user_id": user.id,
                    "status": "error",
                    "error": str(e)
                })
        
        success_count = sum(1 for r in results if r.get('status') == 'success')
        
        logger.info(f"Learning paths updated: {success_count}/{len(users)} successful")
        return {
            "status": "success",
            "total_users": len(users),
            "successful": success_count,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Learning path update failed: {str(e)}")
        return {"status": "error", "message": str(e)}
