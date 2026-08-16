from beanie import Document, Indexed
from datetime import datetime
from typing import Optional, List
from pydantic import Field
from enum import Enum


# Document related models
class DocumentType(str, Enum):
    """Document type enumeration."""
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"
    PPTX = "pptx"
    PASTED_TEXT = "pasted_text"
    WEBSITE_URL = "website_url"
    WIKIPEDIA = "wikipedia"
    TOPIC = "topic"
    YOUTUBE_TRANSCRIPT = "youtube_transcript"


class DocumentStatus(str, Enum):
    """Document processing status."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentModel(Document):
    """MongoDB model for document storage."""
    
    user_id: int = Indexed()
    title: str = Indexed()
    description: Optional[str] = None
    document_type: DocumentType
    file_path: Optional[str] = None
    original_text: Optional[str] = None
    cleaned_text: Optional[str] = None
    status: DocumentStatus = DocumentStatus.UPLOADED
    processing_error: Optional[str] = None
    language: Optional[str] = None
    word_count: int = 0
    file_size: Optional[int] = None
    metadata: dict = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "documents"
        indexes = [
            "user_id",
            "title",
            "status",
            "document_type",
            "created_at"
        ]


class DocumentChunkModel(Document):
    """MongoDB model for document chunks."""
    
    document_id: int = Indexed()
    chunk_index: int = Indexed()
    chunk_text: str
    word_count: int = 0
    metadata: dict = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "document_chunks"
        indexes = [
            "document_id",
            "chunk_index"
        ]


class EmbeddingModel(Document):
    """MongoDB model for vector embeddings."""
    
    document_id: int = Indexed()
    chunk_id: Optional[int] = Indexed()
    embedding_vector: List[float]  # Store as list, Beanie handles serialization
    model_name: str = Indexed()
    dimension: int
    metadata: dict = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "embeddings"
        indexes = [
            "document_id",
            "chunk_id",
            "model_name"
        ]


# User related models
class UserRole(str, Enum):
    """User role enumeration."""
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class UserModel(Document):
    """MongoDB model for user authentication and authorization."""
    
    username: str = Indexed(unique=True)
    email: str = Indexed(unique=True)
    password: str  # Hashed password
    role: UserRole = UserRole.STUDENT
    profile_image: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        indexes = [
            "username",
            "email",
            "role",
            "is_active"
        ]


# Topic related models
class TopicModel(Document):
    """MongoDB model for categorizing questions."""
    
    name: str = Indexed(unique=True)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "topics"
        indexes = [
            "name",
            "parent_id"
        ]


# Question related models
class QuestionType(str, Enum):
    """Question type enumeration."""
    MCQ = "mcq"
    TRUE_FALSE = "true_false"
    FILL_IN_BLANK = "fill_in_blank"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    CODING = "coding"
    ASSERTION_REASON = "assertion_reason"
    CASE_STUDY = "case_study"
    SCENARIO_BASED = "scenario_based"


class Difficulty(str, Enum):
    """Difficulty level enumeration."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    ADAPTIVE = "adaptive"


class BloomTaxonomy(str, Enum):
    """Bloom's taxonomy levels."""
    REMEMBER = "remember"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"
    CREATE = "create"


class QuestionModel(Document):
    """MongoDB model for storing generated questions."""
    
    topic_id: Optional[int] = Indexed()
    document_id: Optional[int] = Indexed()
    
    question_text: str
    question_type: QuestionType
    options: Optional[List[str]] = None  # For MCQ, True/False
    correct_answer: str
    explanation: Optional[str] = None
    
    difficulty: Difficulty = Difficulty.MEDIUM
    subtopic: Optional[str] = None
    bloom_taxonomy_level: Optional[BloomTaxonomy] = None
    
    estimated_time: int = 60  # in seconds
    marks: float = 1.0
    hint: Optional[str] = None
    confidence_score: float = 0.0
    tags: Optional[List[str]] = None
    
    is_validated: bool = False
    validation_errors: Optional[List[str]] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "questions"
        indexes = [
            "topic_id",
            "document_id",
            "question_type",
            "difficulty",
            "created_at"
        ]


# Quiz related models
class QuizMode(str, Enum):
    """Quiz mode enumeration."""
    PRACTICE = "practice"
    EXAM = "exam"
    TIMED = "timed"
    UNTIMED = "untimed"
    ADAPTIVE = "adaptive"
    CHALLENGE = "challenge"
    WEAK_TOPIC = "weak_topic"
    PREVIOUS_MISTAKES = "previous_mistakes"
    RANDOM = "random"
    REVISION = "revision"
    TOPIC_WISE = "topic_wise"
    MOCK_TEST = "mock_test"


class QuizModel(Document):
    """MongoDB model for quiz configurations."""
    
    user_id: int = Indexed()
    document_id: Optional[int] = Indexed()
    topic_id: Optional[int] = Indexed()
    
    title: str
    description: Optional[str] = None
    mode: QuizMode = QuizMode.PRACTICE
    
    total_questions: int = 10
    total_marks: float = 10.0
    duration: Optional[int] = None  # in seconds, null for untimed
    negative_marking: float = 0.0
    pass_percentage: float = 60.0
    
    shuffle_questions: bool = False
    shuffle_options: bool = False
    auto_save: bool = True
    
    question_ids: List[int] = Field(default_factory=list)  # List of question IDs
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "quizzes"
        indexes = [
            "user_id",
            "document_id",
            "topic_id",
            "mode",
            "created_at"
        ]


# Quiz attempt related models
class AttemptStatus(str, Enum):
    """Quiz attempt status."""
    IN_PROGRESS = "in_progress"
    PAUSED = "paused"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class QuizAttemptModel(Document):
    """MongoDB model for tracking user attempts."""
    
    user_id: int = Indexed()
    quiz_id: int = Indexed()
    
    status: AttemptStatus = AttemptStatus.IN_PROGRESS
    started_at: Optional[int] = None  # Unix timestamp
    completed_at: Optional[int] = None  # Unix timestamp
    time_taken: int = 0  # in seconds
    
    total_score: float = 0.0
    max_score: float = 0.0
    percentage: float = 0.0
    
    correct_count: int = 0
    wrong_count: int = 0
    skipped_count: int = 0
    
    current_question_index: int = 0
    answers: dict = Field(default_factory=dict)  # Store answers as dict
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "quiz_attempts"
        indexes = [
            "user_id",
            "quiz_id",
            "status",
            "started_at"
        ]


class AttemptAnswerModel(Document):
    """MongoDB model for individual answers in quiz attempts."""
    
    attempt_id: int = Indexed()
    question_id: int = Indexed()
    
    user_answer: Optional[str] = None
    is_correct: Optional[bool] = None
    time_taken: int = 0  # in seconds
    marks_obtained: float = 0.0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "attempt_answers"
        indexes = [
            "attempt_id",
            "question_id"
        ]


# Analytics related models
class AnalyticsModel(Document):
    """MongoDB model for tracking user performance."""
    
    user_id: int = Indexed(unique=True)
    
    overall_accuracy: float = 0.0
    total_quizzes_attempted: int = 0
    total_questions_attempted: int = 0
    total_correct: int = 0
    total_wrong: int = 0
    
    topic_performance: dict = Field(default_factory=dict)  # Topic-wise performance
    difficulty_performance: dict = Field(default_factory=dict)  # Difficulty-wise performance
    learning_curve: dict = Field(default_factory=dict)  # Progress over time
    
    weak_areas: Optional[List[str]] = None  # List of weak topics
    strong_areas: Optional[List[str]] = None  # List of strong topics
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "analytics"
        indexes = [
            "user_id"
        ]


# Recommendation related models
class RecommendationModel(Document):
    """MongoDB model for personalized learning paths."""
    
    user_id: int = Indexed()
    
    recommendation_type: str  # next_topic, next_quiz, revision, weak_topic
    title: str
    description: Optional[str] = None
    
    topic_id: Optional[int] = None
    quiz_id: Optional[int] = None
    
    priority: int = 0
    difficulty: Optional[str] = None
    
    recommendation_metadata: dict = Field(default_factory=dict)  # Additional recommendation data
    is_completed: bool = False
    is_dismissed: bool = False
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "recommendations"
        indexes = [
            "user_id",
            "recommendation_type",
            "is_completed",
            "priority"
        ]


# Notification related models
class NotificationType(str, Enum):
    """Notification type enumeration."""
    QUIZ_COMPLETED = "quiz_completed"
    QUIZ_REMINDER = "quiz_reminder"
    RECOMMENDATION = "recommendation"
    ACHIEVEMENT = "achievement"
    SYSTEM = "system"


class NotificationModel(Document):
    """MongoDB model for user notifications."""
    
    user_id: int = Indexed()
    
    notification_type: NotificationType
    title: str
    message: str
    
    is_read: bool = False
    action_url: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "notifications"
        indexes = [
            "user_id",
            "notification_type",
            "is_read",
            "created_at"
        ]


# User activity related models
class UserActivityModel(Document):
    """MongoDB model for tracking user actions."""
    
    user_id: int = Indexed()
    
    activity_type: str  # login, quiz_start, quiz_complete, etc.
    description: Optional[str] = None
    
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    activity_metadata: dict = Field(default_factory=dict)  # Additional activity data
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "user_activities"
        indexes = [
            "user_id",
            "activity_type",
            "created_at"
        ]
