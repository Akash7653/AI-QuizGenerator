"""
Database seeding script for topics and questions.
Run this script to populate the database with initial data.
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from loguru import logger
from app.database.mongodb_models import TopicModel, QuestionModel, Difficulty, QuestionType
from app.database.mongodb_connection import MongoDBConnection
from app.seeds.topics_data import TOPIC_CATEGORIES, ALL_TOPICS
from app.seeds.questions_data import SAMPLE_QUESTIONS


async def seed_topics():
    """Seed topics into the database."""
    logger.info("Starting to seed topics...")
    
    for category_name, category_data in TOPIC_CATEGORIES.items():
        for topic_data in category_data["topics"]:
            # Check if topic already exists
            existing_topic = await TopicModel.find_one(TopicModel.name == topic_data["name"])
            
            if existing_topic:
                logger.info(f"Topic '{topic_data['name']}' already exists, skipping...")
                continue
            
            # Create new topic
            topic = TopicModel(
                name=topic_data["name"],
                description=topic_data["description"],
                metadata={
                    "category": category_name,
                    "subtopics": topic_data["subtopics"],
                    "icon": category_data.get("icon", "📚")
                }
            )
            
            await topic.save()
            logger.info(f"Created topic: {topic_data['name']}")
    
    logger.info("Topics seeding completed!")


async def seed_questions():
    """Seed sample questions into the database."""
    logger.info("Starting to seed questions...")
    
    for topic_name, questions in SAMPLE_QUESTIONS.items():
        # Find the corresponding topic
        topic = await TopicModel.find_one(TopicModel.name == topic_name)
        
        if not topic:
            logger.warning(f"Topic '{topic_name}' not found, skipping questions for this topic...")
            continue
        
        for question_data in questions:
            # Convert question type to enum
            question_type_str = question_data["question_type"].lower()
            if question_type_str == "mcq":
                question_type = QuestionType.MCQ
            elif question_type_str == "true_false":
                question_type = QuestionType.TRUE_FALSE
            elif question_type_str == "fill_in_blank":
                question_type = QuestionType.FILL_IN_BLANK
            elif question_type_str == "short_answer":
                question_type = QuestionType.SHORT_ANSWER
            else:
                question_type = QuestionType.MCQ
            
            # Convert difficulty to enum
            difficulty_str = question_data.get("difficulty", "medium").lower()
            if difficulty_str == "easy":
                difficulty = Difficulty.EASY
            elif difficulty_str == "hard":
                difficulty = Difficulty.HARD
            else:
                difficulty = Difficulty.MEDIUM
            
            # Create question
            question = QuestionModel(
                topic_id=str(topic.id),
                question_text=question_data["question_text"],
                question_type=question_type,
                options=question_data.get("options"),
                correct_answer=question_data["correct_answer"],
                explanation=question_data.get("explanation"),
                difficulty=difficulty,
                subtopic=question_data.get("subtopic"),
                topic=topic_name,
                marks=1.0,
                estimated_time=60,
                is_validated=True,
                validation_errors=None
            )
            
            await question.save()
            logger.info(f"Created question for topic: {topic_name}")
    
    logger.info("Questions seeding completed!")


async def get_topics_api():
    """Get topics in API format for frontend consumption."""
    logger.info("Generating topics API response...")
    
    categories = []
    
    for category_name, category_data in TOPIC_CATEGORIES.items():
        topics_list = []
        
        for topic_data in category_data["topics"]:
            topics_list.append({
                "name": topic_data["name"],
                "description": topic_data["description"],
                "subtopics": topic_data["subtopics"]
            })
        
        categories.append({
            "name": category_name,
            "description": category_data["description"],
            "icon": category_data.get("icon", "📚"),
            "topics": topics_list
        })
    
    return {"categories": categories}


async def main():
    """Main seeding function."""
    try:
        # Initialize MongoDB connection
        logger.info("Connecting to MongoDB...")
        await MongoDBConnection.connect_to_mongodb()
        logger.info("Connected to MongoDB successfully!")
        
        # Seed topics
        await seed_topics()
        
        # Seed questions
        await seed_questions()
        
        # Get topics API format
        topics_api = await get_topics_api()
        logger.info(f"Topics API format: {len(topics_api['categories'])} categories")
        
        logger.info("Database seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Error during database seeding: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        # Close MongoDB connection
        await MongoDBConnection.close_mongodb()
        logger.info("MongoDB connection closed.")


if __name__ == "__main__":
    asyncio.run(main())