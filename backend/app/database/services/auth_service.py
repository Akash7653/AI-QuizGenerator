from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.config.settings import settings
from app.database.mongodb_models import UserModel
from app.database.repository.user_repository import UserRepository
from app.database.schemas.user import UserCreate, UserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Authentication service for user management and JWT operations."""
    
    def __init__(self):
        self.user_repository = UserRepository()
    
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
    
    async def register_user(self, user_data: UserCreate) -> UserModel:
        """Register a new user."""
        username = getattr(user_data, 'username', None) or getattr(user_data, 'name', None)
        if not username:
            raise ValueError("Username is required")

        existing_user = await self.user_repository.get_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")

        existing_username = await self.user_repository.get_by_username(username)
        if existing_username:
            raise ValueError("Username is already taken")

        hashed_password = self.get_password_hash(user_data.password)

        user_dict = user_data.model_dump()
        user_dict['username'] = username
        user_dict['password'] = hashed_password

        user = await self.user_repository.create(user_dict)
        # Store the string ID in session
        return user
    
    async def authenticate_user(self, identifier: str, password: str) -> Optional[UserModel]:
        """Authenticate a user by either email or username."""
        user = None
        if identifier and '@' in identifier:
            user = await self.user_repository.get_by_email(identifier)
        if user is None:
            user = await self.user_repository.get_by_username(identifier)
        if user is None:
            user = await self.user_repository.get_by_email(identifier)
        if not user:
            return None
        if not self.verify_password(password, user.password):
            return None
        if not user.is_active:
            return None
        return user
    
    async def get_current_user(self, token: str) -> Optional[UserModel]:
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
        
        user = await self.user_repository.get_by_id(user_id)
        print(f"[AuthService] User lookup result: {user}")
        
        if user is None:
            print(f"[AuthService] No user found with id: {user_id}")
            return None
        
        print(f"[AuthService] Returning user: {user.email}")
        return user
    
    async def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[UserModel]:
        """Update user information."""
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            return None

        update_data = user_data.model_dump(exclude_unset=True)
        if 'username' in update_data and update_data['username']:
            existing_username = await self.user_repository.get_by_username(update_data['username'])
            if existing_username and existing_username.id != user_id:
                raise ValueError("Username is already taken")

        if 'email' in update_data and update_data['email']:
            return await self.user_repository.update_email(user_id, str(update_data['email']))
        return await self.user_repository.update(user, update_data)

    async def change_email(self, user_id: int, new_email: str) -> Optional[UserModel]:
        """Change the current user's email address."""
        if await self.user_repository.get_by_email(new_email):
            raise ValueError("User with this email already exists")
        return await self.user_repository.update_email(user_id, new_email)
    
    async def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        """Change user password."""
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            return False
        
        if not self.verify_password(old_password, user.password):
            return False
        
        hashed_password = self.get_password_hash(new_password)
        await self.user_repository.update_password(user_id, hashed_password)
        return True
    
    async def verify_email(self, user_id: int) -> Optional[UserModel]:
        """Verify user email."""
        return await self.user_repository.verify_user(user_id)
    
    # Role-based methods - removed since role field is deprecated
    # def is_admin(self, user: UserModel) -> bool:
    #     """Check if user is admin."""
    #     return False
    
    # def is_teacher(self, user: UserModel) -> bool:
    #     """Check if user is teacher."""
    #     return False
    
    # def is_student(self, user: UserModel) -> bool:
    #     """Check if user is student."""
    #     return True
