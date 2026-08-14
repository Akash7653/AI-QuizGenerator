from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.config.settings import settings
from app.database.models.user import User, UserRole
from app.database.repository import UserRepository
from app.database.schemas.user import UserCreate, UserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Authentication service for user management and JWT operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password."""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, Any]) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt
    
    def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Decode and validate JWT token."""
        try:
            print(f"[AuthService] Attempting to decode token: {token[:20]}...")
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            print(f"[AuthService] Token decoded successfully: {payload}")
            return payload
        except JWTError as e:
            print(f"[AuthService] JWT decode error: {str(e)}")
            return None
    
    def register_user(self, user_data: UserCreate) -> User:
        """Register a new user."""
        # Check if user already exists
        existing_user = self.user_repository.get_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash password
        hashed_password = self.get_password_hash(user_data.password)
        
        # Create user
        user_dict = user_data.dict()
        user_dict['password'] = hashed_password
        
        user = self.user_repository.create(user_dict)
        return user
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = self.user_repository.get_by_email(email)
        if not user:
            return None
        if not self.verify_password(password, user.password):
            return None
        if not user.is_active:
            return None
        return user
    
    def get_current_user(self, token: str) -> Optional[User]:
        """Get current user from JWT token."""
        print(f"[AuthService] get_current_user called with token: {token[:20] if token else 'None'}...")
        
        payload = self.decode_token(token)
        print(f"[AuthService] Decoded payload: {payload}")
        
        if payload is None:
            print(f"[AuthService] Payload is None - token decode failed")
            return None
        
        user_id = payload.get("sub")
        print(f"[AuthService] Extracted user_id from token: {user_id}")
        
        if user_id is None:
            print(f"[AuthService] user_id is None in payload")
            return None
        
        user = self.user_repository.get_by_id(user_id)
        print(f"[AuthService] User lookup result: {user}")
        
        if user is None:
            print(f"[AuthService] No user found with id: {user_id}")
            return None
        
        print(f"[AuthService] Returning user: {user.email}")
        return user
    
    def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """Update user information."""
        user = self.user_repository.get_by_id(user_id)
        if not user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        return self.user_repository.update(user, update_data)
    
    def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        """Change user password."""
        user = self.user_repository.get_by_id(user_id)
        if not user:
            return False
        
        if not self.verify_password(old_password, user.password):
            return False
        
        hashed_password = self.get_password_hash(new_password)
        self.user_repository.update_password(user_id, hashed_password)
        return True
    
    def verify_email(self, user_id: int) -> Optional[User]:
        """Verify user email."""
        return self.user_repository.verify_user(user_id)
    
    def is_admin(self, user: User) -> bool:
        """Check if user is admin."""
        return user.role == UserRole.ADMIN
    
    def is_teacher(self, user: User) -> bool:
        """Check if user is teacher."""
        return user.role == UserRole.TEACHER
    
    def is_student(self, user: User) -> bool:
        """Check if user is student."""
        return user.role == UserRole.STUDENT
