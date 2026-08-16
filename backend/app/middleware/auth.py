from fastapi import Depends, HTTPException, status, Request
from typing import Optional
from app.database.mongodb_models import UserModel
from app.database.repository.user_repository import UserRepository


async def get_current_user(
    request: Request
) -> UserModel:
    """Dependency to get current authenticated user from session."""
    print(f"[Auth Middleware] get_current_user called")
    
    # Check if user_id is in session
    user_id = request.session.get("user_id")
    print(f"[Auth Middleware] Session user_id: {user_id}")
    
    if not user_id:
        print(f"[Auth Middleware] No user_id in session")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    # Get user from database
    user_repo = UserRepository()
    # Convert user_id to string if it's not already
    user_id_str = str(user_id) if not isinstance(user_id, str) else user_id
    user = await user_repo.get_by_id(user_id_str)
    print(f"[Auth Middleware] User from DB: {user}")
    
    if user is None:
        print(f"[Auth Middleware] User not found with id: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    if not user.is_active:
        print(f"[Auth Middleware] User is inactive: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    print(f"[Auth Middleware] User authenticated successfully: {user.email}")
    return user


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
