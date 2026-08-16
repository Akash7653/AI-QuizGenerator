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
    user = await user_repo.get_by_id(user_id)
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


async def get_current_admin_user(
    current_user = Depends(get_current_user)
):
    """Dependency to get current admin user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have admin privileges"
        )
    
    return current_user


async def get_current_teacher_user(
    current_user = Depends(get_current_user)
):
    """Dependency to get current teacher user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    if current_user.role.value not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have teacher privileges"
        )
    
    return current_user


class RoleChecker:
    """Role checker dependency for custom role validation."""
    
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles
    
    def __call__(self, current_user = Depends(get_current_user)):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role}' is not allowed"
            )
        return current_user
