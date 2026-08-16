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
# across origins in production. Local development and TestClient must stay non-secure
# so the cookie is preserved during normal http-based testing and local debugging.
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    same_site="none",  # Required for cross-origin between Vercel and Render
    https_only=False,  # Allow HTTP for development/testing
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
    import sys
    logger.info("🚀 Starting AI Quiz Generator Backend...")
    logger.info(f"📦 Python version: {sys.version}")
    logger.info(f"🔧 Environment: {settings.ENVIRONMENT}")
    
    # Initialize MongoDB
    try:
        from app.database.mongodb_connection import init_mongodb
        await init_mongodb()
        logger.info("✅ MongoDB initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize MongoDB: {str(e)}")
        logger.warning("⚠️  Application will continue but MongoDB features may be limited")
    
    logger.info("✅ AI Quiz Generator Backend started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down AI Quiz Generator Backend...")
    
    # Close MongoDB connection
    try:
        from app.database.mongodb_connection import close_mongodb
        await close_mongodb()
        logger.info("MongoDB connection closed")
    except Exception as e:
        logger.warning(f"Failed to close MongoDB connection: {str(e)}")
    
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
    # Check MongoDB connection
    mongodb_status = "disconnected"
    try:
        from app.database.mongodb_connection import get_mongodb
        client = await get_mongodb()
        await client.admin.command('ping')
        mongodb_status = "connected"
    except Exception as e:
        mongodb_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "MongoDB",
        "mongodb_status": mongodb_status
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
    import os

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
