from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.schemas.admin import (
    SystemHealthResponse, UserManagementResponse, QuizManagementResponse,
    AdminDashboardResponse, SystemLogsResponse, BulkActionRequest, BulkActionResponse
)
from app.database.models.user import User
from app.middleware.auth import get_current_admin_user
from app.database.repository import UserRepository, QuizRepository, QuestionRepository
from app.database.models.quiz import Quiz
from app.database.models.question import Question
import psutil
import os
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=AdminDashboardResponse)
async def get_admin_dashboard(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard data."""
    user_repo = UserRepository(db)
    quiz_repo = QuizRepository(db)
    
    # Get user statistics
    user_stats = user_repo.get_user_stats()
    
    # Get quiz statistics
    quiz_stats = quiz_repo.get_quiz_stats()
    
    # Get recent activities (simplified)
    recent_activities = []
    
    # Get top performers
    from app.database.repository import AnalyticsRepository
    analytics_repo = AnalyticsRepository(db)
    top_performers = analytics_repo.get_top_performers(10)
    
    return AdminDashboardResponse(
        total_users=user_stats["total_users"],
        active_users=user_stats["active_users"],
        total_quizzes=quiz_stats["total_quizzes"],
        total_questions=0,  # Would need question repo
        total_attempts=0,  # Would need attempt repo
        average_accuracy=0.0,  # Would calculate from analytics
        user_growth=[],  # Would implement time-series data
        quiz_activity=[],  # Would implement time-series data
        top_performers=[],
        recent_activities=recent_activities
    )


@router.get("/users", response_model=List[UserManagementResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)."""
    user_repo = UserRepository(db)
    users = user_repo.get_all(skip=skip, limit=limit)
    
    return [
        UserManagementResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role.value,
            is_active=user.is_active,
            is_verified=user.is_verified,
            total_quizzes=0,  # Would need to calculate
            last_active=None,  # Would need to track
            created_at=user.created_at
        )
        for user in users
    ]


@router.get("/quizzes", response_model=List[QuizManagementResponse])
async def get_all_quizzes(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all quizzes (admin only)."""
    quiz_repo = QuizRepository(db)
    quizzes = quiz_repo.get_all(skip=skip, limit=limit)
    
    return [
        QuizManagementResponse(
            id=quiz.id,
            user_id=quiz.user_id,
            user_name="",  # Would need to join with users
            title=quiz.title,
            mode=quiz.mode.value,
            total_questions=quiz.total_questions,
            total_attempts=0,  # Would need to calculate
            created_at=quiz.created_at
        )
        for quiz in quizzes
    ]


@router.get("/system", response_model=SystemHealthResponse)
async def get_system_health(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get system health status."""
    # Check database connection
    db_connected = True
    try:
        db.execute("SELECT 1")
    except:
        db_connected = False
    
    # Check Redis connection
    from app.utils.cache import cache
    redis_connected = cache.is_available()
    
    # Check Celery (simplified)
    celery_running = True  # Would need proper check
    
    # Get counts
    user_repo = UserRepository(db)
    quiz_repo = QuizRepository(db)
    question_repo = QuestionRepository(db)
    
    total_users = user_repo.count()
    total_quizzes = quiz_repo.count()
    total_questions = question_repo.count()
    
    # System stats
    cpu_usage = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return SystemHealthResponse(
        status="healthy" if db_connected and redis_connected else "degraded",
        database_connected=db_connected,
        redis_connected=redis_connected,
        celery_running=celery_running,
        total_users=total_users,
        total_quizzes=total_quizzes,
        total_questions=total_questions,
        server_uptime=str(datetime.now()),  # Would need proper uptime tracking
        memory_usage={
            "total": memory.total,
            "available": memory.available,
            "percent": memory.percent
        },
        cpu_usage=cpu_usage,
        disk_usage={
            "total": disk.total,
            "used": disk.used,
            "free": disk.free,
            "percent": disk.percent
        }
    )


@router.delete("/user/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)."""
    user_repo = UserRepository(db)
    
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting admin users
    if user.role.value == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete admin users"
        )
    
    success = user_repo.delete(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )
    
    return {"message": "User deleted successfully"}


@router.delete("/quiz/{quiz_id}")
async def delete_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a quiz (admin only)."""
    quiz_repo = QuizRepository(db)
    
    quiz = quiz_repo.get_by_id(quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    success = quiz_repo.delete(quiz_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete quiz"
        )
    
    return {"message": "Quiz deleted successfully"}


@router.post("/bulk-action", response_model=BulkActionResponse)
async def bulk_action(
    request: BulkActionRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Perform bulk actions on entities."""
    failed_ids = []
    errors = []
    success_count = 0
    
    try:
        if request.entity_type == "user":
            user_repo = UserRepository(db)
            if request.action == "delete":
                for user_id in request.entity_ids:
                    user = user_repo.get_by_id(user_id)
                    if user and user.role.value != "admin":
                        if user_repo.delete(user_id):
                            success_count += 1
                        else:
                            failed_ids.append(user_id)
                            errors.append(f"Failed to delete user {user_id}")
                    else:
                        failed_ids.append(user_id)
                        errors.append(f"Cannot delete admin user {user_id}")
            elif request.action == "activate":
                for user_id in request.entity_ids:
                    user = user_repo.activate_user(user_id)
                    if user:
                        success_count += 1
                    else:
                        failed_ids.append(user_id)
                        errors.append(f"Failed to activate user {user_id}")
            elif request.action == "deactivate":
                for user_id in request.entity_ids:
                    user = user_repo.deactivate_user(user_id)
                    if user:
                        success_count += 1
                    else:
                        failed_ids.append(user_id)
                        errors.append(f"Failed to deactivate user {user_id}")
        
        elif request.entity_type == "quiz":
            quiz_repo = QuizRepository(db)
            if request.action == "delete":
                for quiz_id in request.entity_ids:
                    if quiz_repo.delete(quiz_id):
                        success_count += 1
                    else:
                        failed_ids.append(quiz_id)
                        errors.append(f"Failed to delete quiz {quiz_id}")
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported entity type: {request.entity_type}"
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk action failed: {str(e)}"
        )
    
    return BulkActionResponse(
        success_count=success_count,
        failed_count=len(failed_ids),
        failed_ids=failed_ids,
        errors=errors
    )


@router.get("/logs", response_model=SystemLogsResponse)
async def get_system_logs(
    page: int = 1,
    page_size: int = 50,
    current_user: User = Depends(get_current_admin_user)
):
    """Get system logs (admin only)."""
    # This would read from log files
    # For now, return placeholder
    log_file = "./logs/app.log"
    logs = []
    
    if os.path.exists(log_file):
        try:
            with open(log_file, 'r') as f:
                lines = f.readlines()
                for i, line in enumerate(lines):
                    if i >= (page - 1) * page_size and i < page * page_size:
                        logs.append({
                            "timestamp": datetime.now().isoformat(),
                            "level": "INFO",
                            "message": line.strip()
                        })
        except Exception as e:
            logs = [{"error": str(e)}]
    
    return SystemLogsResponse(
        logs=logs,
        total_count=len(logs),
        page=page,
        page_size=page_size
    )


@router.get("/stats")
async def get_admin_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get administrative statistics."""
    user_repo = UserRepository(db)
    quiz_repo = QuizRepository(db)
    question_repo = QuestionRepository(db)
    
    return {
        "users": user_repo.get_user_stats(),
        "quizzes": quiz_repo.get_quiz_stats(),
        "questions": question_repo.get_question_stats(),
        "system": {
            "cpu_usage": psutil.cpu_percent(),
            "memory_usage": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent
        }
    }
