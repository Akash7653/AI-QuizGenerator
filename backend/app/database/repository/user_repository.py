from typing import Optional, List, Dict, Any
from app.database.mongodb_models import UserModel
from app.database.repository.base import BaseRepository


class UserRepository(BaseRepository[UserModel]):
    """Repository for User model."""
    
    def __init__(self):
        super().__init__(UserModel)
    
    async def get_by_email(self, email: str) -> Optional[UserModel]:
        """Get user by email."""
        return await self.model.find_one(self.model.email == email)
    
    async def get_by_username(self, username: str) -> Optional[UserModel]:
        """Get user by username."""
        return await self.model.find_one(self.model.username == username)

    async def get_by_name(self, name: str) -> Optional[UserModel]:
        """Backward-compatible alias for older callers."""
        return await self.get_by_username(name)
    
    async def get_active_users(self, skip: int = 0, limit: int = 100) -> List[UserModel]:
        """Get all active users."""
        return await self.model.find(self.model.is_active == True).skip(skip).limit(limit).to_list()
    
    # Role-based methods removed since role field is deprecated
    # async def get_users_by_role(self, skip: int = 0, limit: int = 100) -> List[UserModel]:
    #     """Get users by role - deprecated."""
    #     return []
    
    async def get_verified_users(self, skip: int = 0, limit: int = 100) -> List[UserModel]:
        """Get all verified users."""
        return await self.model.find(self.model.is_verified == True).skip(skip).limit(limit).to_list()
    
    async def search_users(self, query: str, skip: int = 0, limit: int = 100) -> List[UserModel]:
        """Search users by username or email."""
        # MongoDB case-insensitive search using regex
        import re
        pattern = re.compile(query, re.IGNORECASE)
        return await self.model.find({
            "$or": [
                {"username": pattern},
                {"email": pattern}
            ]
        }).skip(skip).limit(limit).to_list()
    
    async def activate_user(self, user_id: int) -> Optional[UserModel]:
        """Activate user account."""
        user = await self.get_by_id(user_id)
        if user:
            user.is_active = True
            await user.save()
        return user
    
    async def deactivate_user(self, user_id: int) -> Optional[UserModel]:
        """Deactivate user account."""
        user = await self.get_by_id(user_id)
        if user:
            user.is_active = False
            await user.save()
        return user
    
    async def verify_user(self, user_id: int) -> Optional[UserModel]:
        """Verify user email."""
        user = await self.get_by_id(user_id)
        if user:
            user.is_verified = True
            await user.save()
        return user
    
    async def update_password(self, user_id: int, hashed_password: str) -> Optional[UserModel]:
        """Update user password."""
        user = await self.get_by_id(user_id)
        if user:
            user.password = hashed_password
            await user.save()
        return user
    
    async def update_profile_image(self, user_id: int, profile_image: str) -> Optional[UserModel]:
        """Update user profile image."""
        user = await self.get_by_id(user_id)
        if user:
            user.profile_image = profile_image
            await user.save()
        return user

    async def update_email(self, user_id: int, new_email: str) -> Optional[UserModel]:
        """Update a user's email address."""
        user = await self.get_by_id(user_id)
        if user:
            user.email = new_email
            user.is_verified = False
            await user.save()
        return user
    
    async def get_user_stats(self) -> Dict[str, Any]:
        """Get user statistics."""
        total_users = await self.model.count()
        active_users = await self.model.find(self.model.is_active == True).count()
        verified_users = await self.model.find(self.model.is_verified == True).count()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "verified_users": verified_users
        }
