from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.config.settings import settings


class CORSMiddlewareOverride(BaseHTTPMiddleware):
    """Custom CORS middleware to ensure headers are added to all responses including preflight."""
    
    async def dispatch(self, request: Request, call_next):
        # Handle preflight OPTIONS requests before they reach the main app
        if request.method == "OPTIONS":
            origin = request.headers.get("origin")
            request_method = request.headers.get("access-control-request-method")
            request_headers = request.headers.get("access-control-request-headers")
            
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
                    response = Response()
                    response.headers["Access-Control-Allow-Origin"] = origin
                    response.headers["Access-Control-Allow-Credentials"] = "true"
                    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                    response.headers["Access-Control-Allow-Headers"] = "authorization, content-type, x-requested-with, accept, origin"
                    if request_method:
                        response.headers["Access-Control-Allow-Methods"] = request_method
                    if request_headers:
                        response.headers["Access-Control-Allow-Headers"] = request_headers
                    response.headers["Access-Control-Max-Age"] = "600"
                    return response
            return Response(status_code=403)
        
        response = await call_next(request)
        
        # Add CORS headers to all responses
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
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                response.headers["Access-Control-Allow-Headers"] = "authorization, content-type, x-requested-with, accept, origin"
        
        return response


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
        "https://ai-quizgenerator.onrender.com",
    ]

    print(f"[CORS] Configuring CORS with origins: {origins}")

    # Allow any localhost origin with any port during local development
    lan_origin_regex = (
        r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:[0-9]+)?$|"
        r"^https?://(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)([0-9]{1,3}\.){0,2}[0-9]{1,3}(:[0-9]+)?$|"
        r"^https://.*\\.(vercel\\.app|onrender\\.com)$"
    )

    # Add custom middleware FIRST (will be last in the middleware chain)
    # This ensures it handles preflight requests before they reach other middleware
    app.add_middleware(CORSMiddlewareOverride)
    
    # Then add FastAPI's CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=lan_origin_regex,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
    )
