from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.connection import get_db
from app.database.schemas.user import (
    UserCreate, UserLogin, UserResponse, UserUpdate, EmailUpdate, Token,
    TokenPayload, ForgotPassword, ResetPassword, VerifyEmail
)
from app.database.services.auth_service import AuthService
from app.middleware.auth import get_current_user


class RefreshTokenRequest(BaseModel):
    refresh_token: str
from app.database.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Register a new user."""
    auth_service = AuthService(db)
    
    try:
        user = auth_service.register_user(user_data)
        # Set session after registration
        request.session["user_id"] = user.id
        print(f"[Auth] User registered and session set: {user.email}")
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=UserResponse)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user and return user data (session-based auth)."""
    auth_service = AuthService(db)

    identifier = form_data.username.strip()
    user = auth_service.authenticate_user(identifier, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Set session instead of returning tokens
    print(f"[Auth] Setting session for user: {user.id}")
    request.session["user_id"] = user.id
    
    print(f"[Auth] User logged in: {user.email}")
    return user


@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """Logout user by clearing session."""
    request.session.pop("user_id", None)
    print(f"[Auth] User logged out: {current_user.email}")
    return {"message": "Successfully logged out"}



# Refresh endpoint is no longer needed with session-based auth
# Sessions are automatically maintained by the browser


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile."""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    auth_service = AuthService(db)
    
    try:
        updated_user = auth_service.update_user(current_user.id, user_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user


@router.put("/profile/email", response_model=UserResponse)
async def update_email(
    email_data: EmailUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change the authenticated user's email address."""
    auth_service = AuthService(db)

    try:
        updated_user = auth_service.change_email(current_user.id, email_data.new_email)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return updated_user


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPassword,
    db: Session = Depends(get_db)
):
    """Initiate password reset (would send email)."""
    auth_service = AuthService(db)
    
    user = auth_service.user_repository.get_by_email(request.email)
    if not user:
        # Don't reveal if user exists for security
        return {"message": "If user exists, password reset email will be sent"}
    
    # In a real implementation, generate reset token and send email
    # For now, return placeholder
    return {"message": "Password reset email sent (placeholder)"}


@router.post("/reset-password")
async def reset_password(
    request: ResetPassword,
    db: Session = Depends(get_db)
):
    """Reset password using token."""
    auth_service = AuthService(db)
    
    # Validate token (simplified - would need proper token validation)
    payload = auth_service.decode_token(request.token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token"
        )
    
    # Update password
    hashed_password = auth_service.get_password_hash(request.new_password)
    success = auth_service.user_repository.update_password(user_id, hashed_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Password reset successfully"}


@router.post("/verify-email")
async def verify_email(
    request: VerifyEmail,
    db: Session = Depends(get_db)
):
    """Verify user email using token."""
    auth_service = AuthService(db)
    
    # Validate token (simplified)
    payload = auth_service.decode_token(request.token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token"
        )
    
    # Verify user
    user = auth_service.verify_email(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Email verified successfully"}
