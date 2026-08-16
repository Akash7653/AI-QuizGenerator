from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config.settings import settings
from loguru import logger
import sys

# MongoDB client
mongo_client: AsyncIOMotorClient = None

async def get_mongodb():
    """Get MongoDB client."""
    global mongo_client
    if mongo_client is None:
        mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
    return mongo_client

async def init_mongodb():
    """Initialize MongoDB connection and Beanie ODM."""
    try:
        logger.info(f"Attempting to connect to MongoDB...")
        logger.info(f"MongoDB URL: {settings.MONGODB_URL[:20]}...{settings.MONGODB_URL[-10:]}")
        
        client = await get_mongodb()
        
        # Test connection with timeout
        import asyncio
        try:
            await asyncio.wait_for(client.admin.command('ping'), timeout=10.0)
            logger.info("✅ MongoDB connection established successfully")
        except asyncio.TimeoutError:
            logger.error("❌ MongoDB connection timeout")
            raise
        except Exception as e:
            logger.error(f"❌ MongoDB connection failed: {str(e)}")
            raise
        
        # Initialize Beanie
        from app.database.mongodb_models import (
            DocumentModel, DocumentChunkModel, EmbeddingModel,
            UserModel, TopicModel, QuestionModel, QuizModel,
            QuizAttemptModel, AttemptAnswerModel, AnalyticsModel,
            RecommendationModel, NotificationModel, UserActivityModel
        )
        
        # Parse database name from URL or use default
        from urllib.parse import urlparse
        parsed = urlparse(settings.MONGODB_URL)
        db_name = parsed.path.lstrip('/') if parsed.path else settings.MONGODB_DATABASE
        
        logger.info(f"Initializing Beanie ODM with database: {db_name}")
        
        database = client[db_name]
        await init_beanie(
            database=database,
            document_models=[
                DocumentModel,
                DocumentChunkModel,
                EmbeddingModel,
                UserModel,
                TopicModel,
                QuestionModel,
                QuizModel,
                QuizAttemptModel,
                AttemptAnswerModel,
                AnalyticsModel,
                RecommendationModel,
                NotificationModel,
                UserActivityModel
            ]
        )
        
        logger.info(f"✅ MongoDB Beanie ODM initialized successfully with database: {db_name}")
        
    except Exception as e:
        logger.error(f"❌ MongoDB initialization failed: {str(e)}")
        logger.warning("⚠️  Application will continue without MongoDB features")
        # Don't raise - allow app to start even if Beanie fails

async def close_mongodb():
    """Close MongoDB connection."""
    global mongo_client
    if mongo_client:
        mongo_client.close()
        mongo_client = None
        logger.info("MongoDB connection closed")
