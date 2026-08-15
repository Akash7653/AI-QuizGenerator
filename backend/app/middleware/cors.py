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
        "https://ai-quiz-generator-api.onrender.com",
        "https://ai-quizgenerator.onrender.com",
    ]

    print(f"[CORS] Configuring CORS with origins: {origins}")

    # Allow any localhost origin with any port during local development
    lan_origin_regex = (
        r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:[0-9]+)?$|"
        r"^https?://(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)([0-9]{1,3}\.){0,2}[0-9]{1,3}(:[0-9]+)?$|"
        r"^https://.*\\.(vercel\\.app|onrender\\.com)$"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=lan_origin_regex,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
    )
