from celery import Celery
from app.config.settings import settings

# Create Celery app
celery_app = Celery(
    "ai_quiz_generator",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.document_tasks", "app.tasks.quiz_tasks", "app.tasks.analytics_tasks", "app.tasks.recommendation_tasks", "app.tasks.maintenance_tasks"]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Schedule periodic tasks
celery_app.conf.beat_schedule = {
    "update-analytics-every-hour": {
        "task": "app.tasks.analytics_tasks.update_all_analytics",
        "schedule": 3600.0,  # Every hour
    },
    "generate-recommendations-daily": {
        "task": "app.tasks.recommendation_tasks.generate_daily_recommendations",
        "schedule": 86400.0,  # Every day
    },
    "cleanup-old-data-weekly": {
        "task": "app.tasks.maintenance_tasks.cleanup_old_data",
        "schedule": 604800.0,  # Every week
    },
    "check-system-health-daily": {
        "task": "app.tasks.maintenance_tasks.check_system_health",
        "schedule": 86400.0,  # Every day
    },
}
