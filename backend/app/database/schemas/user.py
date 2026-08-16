from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema."""
    username: Optional[str] = Field(None, min_length=2, max_length=100)
    email: EmailStr

    @model_validator(mode='before')
    @classmethod
    def coerce_legacy_name(cls, values):
        if isinstance(values, dict):
            # Handle legacy 'name' field mapping to 'username'
            if values.get('username') is None and values.get('name') is not None:
                values['username'] = values['name']
            # Ensure username is not None
            if values.get('username') is None and values.get('email') is not None:
                # Fall back to email prefix if no username provided
                values['username'] = values['email'].split('@')[0]
        return values


class UserCreate(UserBase):
    """User registration schema."""
    password: str = Field(..., min_length=8, max_length=72)

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot be longer than 72 bytes; bcrypt truncates longer values and fails')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserLogin(BaseModel):
    """User login schema."""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: str

    @model_validator(mode='before')
    @classmethod
    def normalize_login_fields(cls, values):
        if isinstance(values, dict):
            if values.get('username') is None and values.get('email') is None and values.get('name') is not None:
                values['username'] = values['name']
            if values.get('email') is None and values.get('username') is not None and '@' in values['username']:
                values['email'] = values['username']
        return values


class UserUpdate(BaseModel):
    """User update schema."""
    username: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    profile_image: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def coerce_legacy_name(cls, values):
        if isinstance(values, dict):
            if 'username' not in values and 'name' in values:
                values['username'] = values['name']
        return values


class EmailUpdate(BaseModel):
    """Email change request schema."""
    new_email: EmailStr


class UserResponse(BaseModel):
    """User response schema."""
    id: str  # Changed from int to str to support MongoDB ObjectId
    username: str
    name: Optional[str] = None
    email: str
    profile_image: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    @model_validator(mode='before')
    @classmethod
    def coerce_legacy_name(cls, values):
        if isinstance(values, dict):
            if 'username' not in values and 'name' in values:
                values['username'] = values['name']
            if 'name' not in values and 'username' in values:
                values['name'] = values['username']
            # Convert ObjectId to string
            if 'id' in values and hasattr(values['id'], '__str__'):
                values['id'] = str(values['id'])
        return values

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Token payload schema."""
    sub: Optional[int] = None
    exp: Optional[int] = None


class ForgotPassword(BaseModel):
    """Forgot password schema."""
    email: EmailStr


class ResetPassword(BaseModel):
    """Reset password schema."""
    token: str
    new_password: str = Field(..., min_length=8, max_length=72)

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot be longer than 72 bytes; bcrypt truncates longer values and fails')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        return v


class VerifyEmail(BaseModel):
    """Email verification schema."""
    token: str
