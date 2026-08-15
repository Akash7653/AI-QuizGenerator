import os
import sqlite3

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

def ensure_sqlite_user_schema() -> None:
    """Backfill required columns on older SQLite databases created before schema changes."""
    if not settings.DATABASE_URL.startswith("sqlite"):
        return

    db_path = settings.DATABASE_URL.replace("sqlite:///", "", 1)
    if not db_path or db_path == ":memory:":
        return

    absolute_db_path = os.path.abspath(db_path)
    if not os.path.exists(absolute_db_path):
        logger.info(f"No SQLite database file found at {absolute_db_path}; skipping schema migration")
        return

    try:
        conn = sqlite3.connect(absolute_db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if cursor.fetchone() is None:
            conn.close()
            return

        cursor.execute("PRAGMA table_info(users)")
        rows = cursor.fetchall()
        columns = {row[1] for row in rows}
        legacy_name_in_schema = "name" in columns
        username_missing = "username" not in columns

        if legacy_name_in_schema or username_missing:
            try:
                cursor.execute("ALTER TABLE users RENAME TO users_legacy")
                logger.warning("Renamed legacy SQLite users table to users_legacy to rebuild the schema")
            except sqlite3.DatabaseError as exc:
                logger.warning(f"Could not rename legacy SQLite users table for rebuild: {exc}")
                conn.close()
                return

            legacy_columns = {row[1]: row for row in conn.execute("PRAGMA table_info(users_legacy)").fetchall()}
            username_select = "name AS username" if "name" in legacy_columns and "username" not in legacy_columns else "COALESCE(username, email) AS username"
            if "username" in legacy_columns and "name" in legacy_columns:
                username_select = "COALESCE(username, name, email) AS username"

            select_columns = [
                "id",
                username_select,
                "email",
                "password",
                "role",
                "profile_image" if "profile_image" in legacy_columns else "NULL AS profile_image",
                "is_active" if "is_active" in legacy_columns else "1 AS is_active",
                "is_verified" if "is_verified" in legacy_columns else "0 AS is_verified",
                "created_at" if "created_at" in legacy_columns else "CURRENT_TIMESTAMP AS created_at",
                "updated_at" if "updated_at" in legacy_columns else "CURRENT_TIMESTAMP AS updated_at",
            ]

            if "email" not in legacy_columns or "password" not in legacy_columns or "role" not in legacy_columns:
                raise ValueError("Legacy SQLite users table is missing required columns for migration")

            cursor.execute(
                """
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY,
                    username VARCHAR(100) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    profile_image VARCHAR(500),
                    is_active BOOLEAN NOT NULL DEFAULT 1,
                    is_verified BOOLEAN NOT NULL DEFAULT 0,
                    created_at DATETIME NOT NULL,
                    updated_at DATETIME NOT NULL
                )
                """
            )
            cursor.execute(
                "INSERT INTO users (id, username, email, password, role, profile_image, is_active, is_verified, created_at, updated_at) "
                f"SELECT {', '.join(select_columns)} FROM users_legacy"
            )
            cursor.execute("DROP TABLE users_legacy")
            logger.warning("Rebuilt SQLite users table without legacy name column and with username-based schema")

        cursor.execute("UPDATE users SET username = email WHERE username IS NULL OR TRIM(COALESCE(username, '')) = ''")
        logger.warning("Filled missing SQLite usernames from email values")

        cursor.execute("PRAGMA table_info(users)")
        updated_columns = {row[1] for row in cursor.fetchall()}

        for column_name, column_type, default_value in [
            ("profile_image", "VARCHAR(500)", "NULL"),
            ("is_active", "BOOLEAN", "1"),
            ("is_verified", "BOOLEAN", "0"),
        ]:
            if column_name in updated_columns:
                continue
            default_sql = " DEFAULT NULL" if default_value == "NULL" else f" DEFAULT {default_value}"
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}{default_sql}")
                logger.warning(f"Added missing SQLite column: {column_name}")
            except sqlite3.DatabaseError as exc:
                logger.warning(f"Could not add SQLite column {column_name}: {exc}")

        conn.commit()
        conn.close()
    except Exception as exc:
        logger.warning(f"SQLite schema migration failed: {exc}")


# Setup logging
setup_logging()

# Repair legacy SQLite schema before app startup work
ensure_sqlite_user_schema()

# Ensure the database schema exists before any DB session or startup logic touches it.
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema ensured for SQLite/PostgreSQL startup")
except Exception as exc:
    logger.warning(f"Schema creation at import time failed: {exc}")

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
    same_site="lax" if settings.DEBUG else "none",
    https_only=False if settings.DEBUG else True,
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
            logger.info("Redis cache is disabled for this runtime; continuing without cache")
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
