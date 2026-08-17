from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.config.settings import settings


class CORSMiddlewareOverride(BaseHTTPMiddleware):
    """Custom CORS middleware to ensure headers are added to ALL responses including errors for JWT auth."""
    
    async def dispatch(self, request: Request, call_next):
        # Handle preflight OPTIONS requests
        if request.method == "OPTIONS":
            origin = request.headers.get("origin")
            if origin:
                allowed_origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else [
                    "http://localhost:3000",
                    "http://localhost:4174",
                    "http://localhost:5173",
                    "http://localhost:8000",
                    "https://ai-quiz-generator-orcin.vercel.app",
                    "https://ai-quiz-generator.vercel.app",
                    "https://ai-quizgenerator.onrender.com",
                    "https://ai-quizgenerator.onrender.com",
                ]
                
                if origin in allowed_origins:
                    response = Response()
                    response.headers["Access-Control-Allow-Origin"] = origin
                    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                    response.headers["Access-Control-Allow-Headers"] = "authorization, content-type, x-requested-with, accept, origin"
                    response.headers["Access-Control-Max-Age"] = "600"
                    return response
            return Response(status_code=403)
        
        # Process the request
        try:
            response = await call_next(request)
        except Exception as e:
            # If an exception occurs, create a response with CORS headers
            origin = request.headers.get("origin")
            if origin:
                allowed_origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else [
                    "http://localhost:3000",
                    "http://localhost:4174",
                    "http://localhost:5173",
                    "http://localhost:8000",
                    "https://ai-quiz-generator-orcin.vercel.app",
                    "https://ai-quiz-generator.vercel.app",
                    "https://ai-quizgenerator.onrender.com",
                    "https://ai-quizgenerator.onrender.com",
                ]
                
                if origin in allowed_origins:
                    response = Response(content=f"Internal Server Error: {str(e)}", status_code=500)
                    response.headers["Access-Control-Allow-Origin"] = origin
                    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                    response.headers["Access-Control-Allow-Headers"] = "authorization, content-type, x-requested-with, accept, origin"
                    return response
            raise
        
        # Add CORS headers to all successful responses
        origin = request.headers.get("origin")
        if origin:
            allowed_origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else [
                "http://localhost:3000",
                "http://localhost:4174",
                "http://localhost:5173",
                "http://localhost:8000",
                "https://ai-quiz-generator-orcin.vercel.app",
                "https://ai-quiz-generator.vercel.app",
                "https://ai-quizgenerator.onrender.com",
            ]
            
            if origin in allowed_origins:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                response.headers["Access-Control-Allow-Headers"] = "authorization, content-type, x-requested-with, accept, origin"
        
        return response


def setup_cors(app: FastAPI):
    """Setup CORS middleware with proper credential support for JWT authentication."""
    # Use specific origins instead of "*" when using credentials
    origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else [
        "http://localhost:3000",
        "http://localhost:4174",
        "http://localhost:5173",
        "http://localhost:8000",
        "https://ai-quiz-generator-orcin.vercel.app",
        "https://ai-quiz-generator.vercel.app",
        "https://ai-quizgenerator.onrender.com",
        "https://ai-quizgenerator.onrender.com",
    ]

    print(f"[CORS] Configuring CORS with origins: {origins}")

    # Allow any localhost origin with any port during local development
    lan_origin_regex = (
        r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:[0-9]+)?$|"
        r"^https?://(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)([0-9]{1,3}\.){0,2}[0-9]{1,3}(:[0-9]+)?$|"
        r"^https?://.*\\.(vercel\\.app|onrender\\.com)$"
        r"^https?://ai-quizgenerator\.onrender\.com$"
    )

    # Add FastAPI's CORS middleware first
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=lan_origin_regex,
        allow_credentials=False,  # JWT doesn't need credentials
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
    
    # Add custom middleware to ensure CORS headers on error responses
    app.add_middleware(CORSMiddlewareOverride)
