from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.config.settings import settings


def setup_cors(app: FastAPI):
    """Setup CORS middleware with proper credential support for session-based auth."""
    # Use specific origins instead of "*" when using credentials (session cookies)
    origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else [
        "http://localhost:3000",
        "http://localhost:4174",
        "http://localhost:5173",
        "http://localhost:8000",
        "https://ai-quiz-generator-orcin.vercel.app",
        "https://ai-quiz-generator.vercel.app",
    ]

    print(f"[CORS] Configuring CORS with origins: {origins}")

    # Allow any localhost origin with any port during local development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r"^https?://localhost(:[0-9]+)?$|https://.*\\.(vercel\\.app|onrender\\.com)$",
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
    )
