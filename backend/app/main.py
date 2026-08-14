import os

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.config.settings import settings
from app.middleware.cors import setup_cors
from app.middleware.logging import setup_logging, LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.api.auth.router import router as auth_router
from app.api.documents.router import router as documents_router
from app.api.quiz.router import router as quiz_router
from app.api.analytics.router import router as analytics_router
from app.api.recommendation.router import router as recommendation_router
from app.api.admin.router import router as admin_router
from app.api.chatbot.router import router as chatbot_router
from app.database.connection import engine
from app.database.models.base import Base
# Import all models to ensure they're registered with SQLAlchemy
from app.database.models import (
    User, Document, DocumentChunk, Embedding, Topic, Question,
    Quiz, QuizQuestion, QuizAttempt, AttemptAnswer, Analytics,
    Recommendation, Notification, UserActivity, AuditLog
)
from loguru import logger

# Setup logging
setup_logging()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Quiz Generator Backend",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# Setup CORS first (must be before SessionMiddleware when using credentials)
setup_cors(app)

# Add session middleware (for session-based authentication)
# Cross-site auth between Vercel and Render requires the session cookie to persist
# across different origins. We only force Secure in production so localhost remains usable.
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    same_site="none",
    https_only=settings.ENVIRONMENT.lower() != "development",
    max_age=86400,
)

# Add custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

# Include API routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(documents_router, prefix=settings.API_V1_PREFIX)
app.include_router(quiz_router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)
app.include_router(recommendation_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
app.include_router(chatbot_router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
async def startup_event():
    """Initialize database and other services on startup."""
    logger.info("Starting AI Quiz Generator Backend...")
    
    # Create database tables (PostgreSQL)
    try:
        from app.database.models.base import Base
        Base.metadata.create_all(bind=engine)
        logger.info("PostgreSQL database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create PostgreSQL tables: {str(e)}")
        logger.warning("Application will continue but PostgreSQL features may be limited")
    
    # Initialize MongoDB (disabled for now - causing startup issues)
    # Can be enabled later for hybrid PostgreSQL + MongoDB approach
    
    # Initialize vector database lazily when needed to keep startup memory usage low
    # on Render Free.
    logger.info("Vector database is lazy-loaded on demand to reduce memory usage at startup")
    
    # Test cache connection
    try:
        from app.utils.cache import cache
        if cache.is_available():
            logger.info("Redis cache connected")
        else:
            logger.warning("Redis cache not available")
    except Exception as e:
        logger.warning(f"Cache initialization failed: {str(e)}")
    
    logger.info("AI Quiz Generator Backend started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down AI Quiz Generator Backend...")
    
    # Save vector database indexes
    try:
        from app.utils.vector_db import VectorStore
        vector_store = VectorStore()
        vector_store.save_all_indexes()
        logger.info("Vector database indexes saved")
    except Exception as e:
        logger.warning(f"Failed to save vector database: {str(e)}")
    
    logger.info("AI Quiz Generator Backend shut down successfully")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI Quiz Generator Backend",
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Return empty favicon response to avoid noisy 404 logs."""
    return Response(status_code=204)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    from app.utils.cache import cache
    
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "cache_available": cache.is_available(),
        "environment": settings.ENVIRONMENT
    }


@app.get(f"{settings.API_V1_PREFIX}/")
async def api_root():
    """API root endpoint."""
    return {
        "message": "AI Quiz Generator API",
        "version": settings.APP_VERSION,
        "endpoints": {
            "auth": f"{settings.API_V1_PREFIX}/auth",
            "documents": f"{settings.API_V1_PREFIX}/documents",
            "quiz": f"{settings.API_V1_PREFIX}/quiz",
            "analytics": f"{settings.API_V1_PREFIX}/analytics",
            "recommendations": f"{settings.API_V1_PREFIX}/recommendation",
            "admin": f"{settings.API_V1_PREFIX}/admin"
        }
    }


if __name__ == "__main__":
    import uvicorn

    # Uvicorn's watchdog reloader is unreliable on Windows in some setups,
    # causing the "WatchFiles detected changes... KeyboardInterrupt" loop even
    # when the app itself is healthy. Keep reload enabled only when explicitly
    # supported and disable it by default on Windows.
    reload_enabled = settings.DEBUG and os.name != "nt"
    if settings.DEBUG and os.name == "nt":
        logger.warning(
            "Auto-reload is disabled on Windows to avoid the Uvicorn WatchFiles crash loop. "
            "Run the server without --reload or set DEBUG=False."
        )

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=reload_enabled,
        log_level="info"
    )
