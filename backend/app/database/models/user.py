from sqlalchemy import Column, String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel


class UserRole(str, enum.Enum):
    """User role enumeration."""
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class User(BaseModel):
    """User model for authentication and authorization."""
    __tablename__ = "users"

    username = Column(String(100), nullable=False, unique=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)  # Hashed password
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    profile_image = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    @property
    def name(self):
        return self.username

    @name.setter
    def name(self, value):
        self.username = value
    
    # Relationships
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    analytics = relationship("Analytics", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    user_activities = relationship("UserActivity", back_populates="user", cascade="all, delete-orphan")
