from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.models.user import User, UserRole
from app.database.repository.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User model."""
    
    def __init__(self, db: Session):
        super().__init__(User, db)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        return self.db.query(User).filter(User.username == username).first()

    def get_by_name(self, name: str) -> Optional[User]:
        """Backward-compatible alias for older callers."""
        return self.get_by_username(name)
    
    def get_active_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all active users."""
        return self.db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()
    
    def get_users_by_role(self, role: UserRole, skip: int = 0, limit: int = 100) -> List[User]:
        """Get users by role."""
        return self.db.query(User).filter(User.role == role).offset(skip).limit(limit).all()
    
    def get_verified_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all verified users."""
        return self.db.query(User).filter(User.is_verified == True).offset(skip).limit(limit).all()
    
    def search_users(self, query: str, skip: int = 0, limit: int = 100) -> List[User]:
        """Search users by username or email."""
        search_pattern = f"%{query}%"
        return self.db.query(User).filter(
            or_(
                User.username.ilike(search_pattern),
                User.email.ilike(search_pattern)
            )
        ).offset(skip).limit(limit).all()
    
    def activate_user(self, user_id: int) -> Optional[User]:
        """Activate user account."""
        user = self.get_by_id(user_id)
        if user:
            user.is_active = True
            self.db.commit()
            self.db.refresh(user)
        return user
    
    def deactivate_user(self, user_id: int) -> Optional[User]:
        """Deactivate user account."""
        user = self.get_by_id(user_id)
        if user:
            user.is_active = False
            self.db.commit()
            self.db.refresh(user)
        return user
    
    def verify_user(self, user_id: int) -> Optional[User]:
        """Verify user email."""
        user = self.get_by_id(user_id)
        if user:
            user.is_verified = True
            self.db.commit()
            self.db.refresh(user)
        return user
    
    def update_password(self, user_id: int, hashed_password: str) -> Optional[User]:
        """Update user password."""
        user = self.get_by_id(user_id)
        if user:
            user.password = hashed_password
            self.db.commit()
            self.db.refresh(user)
        return user
    
    def update_profile_image(self, user_id: int, profile_image: str) -> Optional[User]:
        """Update user profile image."""
        user = self.get_by_id(user_id)
        if user:
            user.profile_image = profile_image
            self.db.commit()
            self.db.refresh(user)
        return user

    def update_email(self, user_id: int, new_email: str) -> Optional[User]:
        """Update a user's email address."""
        user = self.get_by_id(user_id)
        if user:
            user.email = new_email
            user.is_verified = False
            self.db.commit()
            self.db.refresh(user)
        return user
    
    def get_user_stats(self) -> Dict[str, Any]:
        """Get user statistics."""
        total_users = self.db.query(User).count()
        active_users = self.db.query(User).filter(User.is_active == True).count()
        verified_users = self.db.query(User).filter(User.is_verified == True).count()
        
        role_stats = {}
        for role in UserRole:
            role_stats[role.value] = self.db.query(User).filter(User.role == role).count()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "verified_users": verified_users,
            "role_distribution": role_stats
        }
