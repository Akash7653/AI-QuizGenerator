from .base import BaseRepository
from .user_repository import UserRepository
from .document_repository import DocumentRepository
from .question_repository import QuestionRepository
from .quiz_repository import QuizRepository, QuizAttemptRepository
from .analytics_repository import AnalyticsRepository
from .recommendation_repository import RecommendationRepository

__all__ = [
    "BaseRepository",
    "UserRepository",
    "DocumentRepository",
    "QuestionRepository",
    "QuizRepository",
    "QuizAttemptRepository",
    "AnalyticsRepository",
    "RecommendationRepository",
]
