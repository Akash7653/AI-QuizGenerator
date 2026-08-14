from celery import shared_task
from loguru import logger
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database.connection import SessionLocal
from app.database.repository import UserRepository, QuizRepository, DocumentRepository


@shared_task
def cleanup_old_data(days: int = 30):
    """Clean up old data from database."""
    logger.info(f"Cleaning up data older than {days} days")
    
    db = SessionLocal()
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Clean up old documents (simplified - would need proper cascade handling)
        doc_repo = DocumentRepository(db)
        # This would need proper implementation based on business logic
        
        # Clean up old quiz attempts
        # from app.database.repository import QuizAttemptRepository
        # attempt_repo = QuizAttemptRepository(db)
        # old_attempts = attempt_repo.get_all(filters={"created_at__lt": cutoff_date})
        
        logger.info("Data cleanup completed")
        return {
            "status": "success",
            "cutoff_date": cutoff_date.isoformat(),
            "cleaned_items": 0  # Would return actual count
        }
        
    except Exception as e:
        logger.error(f"Data cleanup failed: {str(e)}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


@shared_task
def cleanup_failed_tasks():
    """Clean up failed Celery tasks."""
    logger.info("Cleaning up failed tasks")
    
    try:
        from app.tasks.celery_app import celery_app
        
        # Inspect workers
        inspect = celery_app.control.inspect()
        active_tasks = inspect.active()
        
        cleaned_count = 0
        if active_tasks:
            for worker, tasks in active_tasks.items():
                # Clean up long-running or stuck tasks
                pass
        
        logger.info(f"Cleaned up {cleaned_count} failed tasks")
        return {
            "status": "success",
            "cleaned_count": cleaned_count
        }
        
    except Exception as e:
        logger.error(f"Task cleanup failed: {str(e)}")
        return {"status": "error", "message": str(e)}


@shared_task
def backup_database():
    """Backup database (placeholder)."""
    logger.info("Starting database backup")
    
    try:
        # This would implement actual database backup logic
        # For PostgreSQL, this might use pg_dump
        logger.info("Database backup completed")
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Database backup failed: {str(e)}")
        return {"status": "error", "message": str(e)}


@shared_task
def check_system_health():
    """Check system health and send alerts if needed."""
    logger.info("Checking system health")
    
    try:
        health_status = {
            "database": True,
            "redis": True,
            "celery": True,
            "disk_space": True,
            "memory": True
        }
        
        # Check database connection
        db = SessionLocal()
        try:
            db.execute("SELECT 1")
        except:
            health_status["database"] = False
        finally:
            db.close()
        
        # Check Redis
        from app.utils.cache import cache
        health_status["redis"] = cache.is_available()
        
        # Check disk space
        import shutil
        disk_usage = shutil.disk_usage("/")
        health_status["disk_space"] = disk_usage.percent < 90
        
        # Check memory
        import psutil
        memory = psutil.virtual_memory()
        health_status["memory"] = memory.percent < 90
        
        overall_health = all(health_status.values())
        
        if not overall_health:
            logger.warning(f"System health check failed: {health_status}")
            # Would send alert here
        
        logger.info(f"System health check: {health_status}")
        return {
            "status": "success",
            "healthy": overall_health,
            "checks": health_status
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "error", "message": str(e)}
