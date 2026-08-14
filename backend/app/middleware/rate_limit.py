from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from typing import Dict, Optional
import time
from collections import defaultdict
from app.config.settings import settings


class RateLimiter:
    """Simple in-memory rate limiter."""
    
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, key: str, limit: int, window: int) -> bool:
        """Check if request is allowed within rate limit."""
        now = time.time()
        
        # Clean old requests
        self.requests[key] = [
            timestamp for timestamp in self.requests[key]
            if timestamp > now - window
        ]
        
        # Check if under limit
        if len(self.requests[key]) >= limit:
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True


rate_limiter = RateLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware."""
    
    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting."""
        # Get client identifier
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        key = f"{client_ip}:{user_agent}"
        
        # Check per-minute limit
        if not rate_limiter.is_allowed(key, settings.RATE_LIMIT_PER_MINUTE, 60):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded. Too many requests."}
            )
        
        # Check per-hour limit
        hour_key = f"{key}:hour"
        if not rate_limiter.is_allowed(hour_key, settings.RATE_LIMIT_PER_HOUR, 3600):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Hourly rate limit exceeded. Please try again later."}
            )
        
        # Process request
        response = await call_next(request)
        return response
