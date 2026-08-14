from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.config.settings import settings


def setup_cors(app: FastAPI):
    """Setup CORS middleware with proper credential support for session-based auth."""
    # Use specific origins instead of "*" when using credentials (session cookies)
    origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    print(f"[CORS] Configuring CORS with origins: {origins}")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,  # Required for session-based auth with cookies
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
    )
