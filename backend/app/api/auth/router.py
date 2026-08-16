from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from app.database.schemas.user import (
    UserCreate, UserLogin, UserResponse, UserUpdate, EmailUpdate, Token,
    TokenPayload, ForgotPassword, ResetPassword, VerifyEmail
)
from app.database.services.auth_service import AuthService
from app.middleware.auth import get_current_user
from app.database.mongodb_models import UserModel


class RefreshTokenRequest(BaseModel):
    refresh_token: str

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    request: Request
):
    """Register a new user."""
    auth_service = AuthService()
    
    try:
        print(f"[Auth] Registration attempt - Email: {user_data.email}, Username: {user_data.username}")
        
        # Validate password requirements
        password = user_data.password
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(char.isupper() for char in password):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(char.islower() for char in password):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(char.isdigit() for char in password):
            raise ValueError("Password must contain at least one digit")
        
        user = await auth_service.register_user(user_data)
        print(f"[Auth] User created successfully: {user.id}")
        
        # Set session after registration - store string ID
        request.session["user_id"] = str(user.id)
        print(f"[Auth] Session set: {user.id}")
        
        # Return simple dict to avoid serialization issues
        print(f"[Auth] Returning user response")
        return {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
    except ValueError as e:
        print(f"[Auth] Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"[Auth] Registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/test-register")
async def test_register(
    user_data: UserCreate
):
    """Test registration without session."""
    auth_service = AuthService()
    
    try:
        print(f"[Auth] Test registration - Email: {user_data.email}, Username: {user_data.username}")
        user = await auth_service.register_user(user_data)
        print(f"[Auth] Test user created: {user.id}")
        return {"message": "Test registration successful", "user_id": str(user.id)}
    except Exception as e:
        print(f"[Auth] Test registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Test registration failed: {str(e)}"
        )


@router.post("/login")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """Login user and return user data (session-based auth)."""
    auth_service = AuthService()

    identifier = form_data.username.strip()
    print(f"[Auth] Login attempt - Identifier: {identifier}")
    
    user = await auth_service.authenticate_user(identifier, form_data.password)
    if not user:
        print(f"[Auth] Authentication failed for: {identifier}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Set session instead of returning tokens - store string ID
    print(f"[Auth] Setting session for user: {user.id}")
    request.session["user_id"] = str(user.id)
    
    print(f"[Auth] User logged in: {user.email}")
    
    # Return simple dict to avoid serialization issues
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }


@router.post("/logout")
async def logout(
    request: Request,
    current_user: UserModel = Depends(get_current_user),
):
    """Logout user by clearing session."""
    request.session.pop("user_id", None)
    print(f"[Auth] User logged out: {current_user.email}")
    return {"message": "Successfully logged out"}



# Refresh endpoint is no longer needed with session-based auth
# Sessions are automatically maintained by the browser


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: UserModel = Depends(get_current_user)
):
    """Get current user profile."""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_data: UserUpdate,
    current_user: UserModel = Depends(get_current_user)
):
    """Update current user profile."""
    auth_service = AuthService()
    
    try:
        updated_user = await auth_service.update_user(current_user.id, user_data)
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
    current_user: UserModel = Depends(get_current_user)
):
    """Change the authenticated user's email address."""
    auth_service = AuthService()

    try:
        updated_user = await auth_service.change_email(current_user.id, email_data.new_email)
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
    request: ForgotPassword
):
    """Initiate password reset (would send email)."""
    auth_service = AuthService()
    
    user = await auth_service.user_repository.get_by_email(request.email)
    if not user:
        # Don't reveal if user exists for security
        return {"message": "If user exists, password reset email will be sent"}
    
    # In a real implementation, generate reset token and send email
    # For now, return placeholder
    return {"message": "Password reset email sent (placeholder)"}


@router.post("/reset-password")
async def reset_password(
    request: ResetPassword
):
    """Reset password using token."""
    auth_service = AuthService()
    
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
    success = await auth_service.user_repository.update_password(user_id, hashed_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Password reset successfully"}


@router.post("/verify-email")
async def verify_email(
    request: VerifyEmail
):
    """Verify user email using token."""
    auth_service = AuthService()
    
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
    user = await auth_service.verify_email(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Email verified successfully"}
