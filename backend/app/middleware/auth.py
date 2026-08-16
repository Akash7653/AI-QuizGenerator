from fastapi import Depends, HTTPException, status, Request
from typing import Optional
from app.database.mongodb_models import UserModel
from app.database.repository.user_repository import UserRepository
from app.database.services.auth_service import AuthService


async def get_current_user(
    request: Request
) -> UserModel:
    """Dependency to get current authenticated user via JWT token only."""
    
    # JWT token authentication only (more reliable for cross-origin)
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated - missing authorization header",
        )
    
    token = auth_header.replace("Bearer ", "")
    
    # Skip obviously invalid tokens
    if token in ["null", "undefined", ""]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    try:
        auth_service = AuthService()
        user_id = auth_service.verify_token(token)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token - no user ID",
            )
        
        user_repo = UserRepository()
        user = await user_repo.get_by_id(str(user_id))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )


async def get_current_active_user(
    current_user = Depends(get_current_user)
):
    """Dependency to get current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    return current_user


async def get_current_verified_user(
    current_user = Depends(get_current_user)
):
    """Dependency to get current verified user."""
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User email is not verified"
        )
    return current_user


# Role-based dependencies - removed since role field is deprecated
# All users now have the same permissions without role-based access control
