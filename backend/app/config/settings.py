import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    APP_NAME: str = "AI Quiz Generator"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    SECRET_KEY: str = Field(..., description="Secret key for application")
    API_V1_PREFIX: str = "/api/v1"
    
    # MongoDB (Primary Database)
    MONGODB_URL: str = Field(default="", description="MongoDB connection URL")
    MONGODB_DATABASE: str = "quiz_generator"
    
    # JWT
    JWT_SECRET_KEY: str = Field(..., description="JWT secret key")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Google Gemini
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API key")
    GOOGLE_API_KEY: str = Field(default="", description="Alias for Google AI API key")
    GEMINI_MODEL: str = "gemini-flash-latest"
    GEMINI_TEMPERATURE: float = 0.7
    GEMINI_MAX_TOKENS: int = 1024
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = Field(..., description="SMTP username")
    SMTP_PASSWORD: str = Field(..., description="SMTP password")
    EMAIL_FROM: str = "noreply@quizgenerator.com"
    EMAIL_FROM_NAME: str = "AI Quiz Generator"
    
    # Celery
    CELERY_BROKER_URL: str = Field(..., description="Celery broker URL")
    CELERY_RESULT_BACKEND: str = Field(..., description="Celery result backend")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:4174",
        "http://localhost:5173",
        "http://localhost:8000",
        "https://ai-quiz-generator-orcin.vercel.app",
        "https://ai-quiz-generator.vercel.app",
        "https://ai-quizgenerator.onrender.com",
        "https://ai-quizgenerator.onrender.com",
    ]
    
    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                import json
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v
    
    # File Upload
    MAX_FILE_SIZE: int = 10485760  # 10MB
    ALLOWED_FILE_TYPES: List[str] = ["pdf", "docx", "txt", "pptx"]
    UPLOAD_DIR: str = "./storage/uploads"
    
    @validator("ALLOWED_FILE_TYPES", pre=True)
    def parse_allowed_file_types(cls, v):
        if isinstance(v, str):
            return [file_type.strip() for file_type in v.split(",")]
        return v
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Features
    ENABLE_EMAIL_VERIFICATION: bool = True
    ENABLE_OCR: bool = True
    
    # Deprecated fields (kept for compatibility with old .env files)
    DATABASE_URL: str = Field(default="", description="Deprecated - MongoDB is now used")
    DATABASE_POOL_SIZE: str = Field(default="20", description="Deprecated")
    DATABASE_MAX_OVERFLOW: str = Field(default="10", description="Deprecated")
    REDIS_URL: str = Field(default="", description="Deprecated")
    REDIS_CACHE_TTL: str = Field(default="0", description="Deprecated")
    ENABLE_VECTOR_SEARCH: str = Field(default="False", description="Deprecated")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


def get_gemini_api_key() -> str:
    """Resolve a valid Gemini API key from either the app or Google alias names."""
    candidates = [
        getattr(settings, "GEMINI_API_KEY", ""),
        getattr(settings, "GOOGLE_API_KEY", ""),
        os.getenv("GEMINI_API_KEY", ""),
        os.getenv("GOOGLE_API_KEY", ""),
    ]

    placeholder_values = {
        "",
        "your-gemini-api-key-here",
        "your_api_key_here",
        "placeholder",
        "changeme",
        "test",
        "demo",
    }

    for value in candidates:
        if not value:
            continue
        normalized = str(value).strip()
        if normalized.lower() in placeholder_values:
            continue
        return normalized

    return ""


# Global settings instance
settings = Settings()
