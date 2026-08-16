from fastapi import Depends, HTTPException, status, Request
from typing import Optional
from app.database.mongodb_models import UserModel
from app.database.repository.user_repository import UserRepository
from app.database.services.auth_service import AuthService


async def get_current_user(
    request: Request
) -> UserModel:
    """Dependency to get current authenticated user from session or JWT token."""
    
    # First try session-based auth
    user_id = request.session.get("user_id")
    
    if user_id:
        user_repo = UserRepository()
        user_id_str = str(user_id) if not isinstance(user_id, str) else user_id
        user = await user_repo.get_by_id(user_id_str)
        
        if user and user.is_active:
            return user
    
    # Fallback to JWT token auth (for compatibility during transition)
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")
        auth_service = AuthService()
        user_id = auth_service.verify_token(token)
        
        if user_id:
            user_repo = UserRepository()
            user = await user_repo.get_by_id(str(user_id))
            
            if user and user.is_active:
                # Set session for future requests
                request.session["user_id"] = str(user.id)
                return user
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
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
