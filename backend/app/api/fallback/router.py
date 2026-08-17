from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.seeds.questions_data import get_questions_for_topic, get_available_topics
from app.seeds.topics_data import TOPIC_CATEGORIES

router = APIRouter(prefix="/fallback", tags=["Fallback"])


class FallbackQuizRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=120)
    difficulty: str = "Medium"
    total_questions: int = Field(default=10, ge=1, le=20)
    question_type: str = "Mixed"


@router.post("/generate-quiz")
async def generate_fallback_quiz(request: FallbackQuizRequest):
    """Generate quiz from local question bank (fallback when Gemini is unavailable)."""
    topic = request.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required")
    
    # Try to find exact topic match
    available_topics = get_available_topics()
    fallback_topic = None
    
    # Case-insensitive search for topic
    for available_topic in available_topics:
        if available_topic.lower() == topic.lower():
            fallback_topic = available_topic
            break
    
    # If no exact match, try to find a partial match or use General Knowledge
    if not fallback_topic:
        for available_topic in available_topics:
            if topic.lower() in available_topic.lower() or available_topic.lower() in topic.lower():
                fallback_topic = available_topic
                break
    
    if not fallback_topic:
        fallback_topic = "General Knowledge"
    
    # Get questions from local bank
    questions = get_questions_for_topic(fallback_topic, request.total_questions)
    
    if not questions:
        # If still no questions, return a generic response
        questions = get_questions_for_topic("General Knowledge", request.total_questions)
    
    # Format questions for frontend
    formatted_questions = []
    # Ensure we generate exactly the requested number of questions
    questions_to_generate = request.total_questions
    available_questions = len(questions)

    # If we have fewer questions than requested, cycle through them
    for i in range(questions_to_generate):
        q = questions[i % available_questions]
        q_type = str(q.get('question_type', 'mcq')).lower()
        if 'true' in q_type:
            normalized_type = 'truefalse'
        elif 'short' in q_type:
            normalized_type = 'short'
        else:
            normalized_type = 'mcq'

        # Convert options array to expected frontend format
        raw_options = q.get('options') or (['True', 'False'] if normalized_type == 'truefalse' else [])
        formatted_options = []
        for opt_index, opt_value in enumerate(raw_options):
            formatted_options.append({
                'id': f'opt-{i}-{opt_index}',
                'label': chr(65 + opt_index),  # A, B, C, D...
                'text': str(opt_value)
            })

        # Find correct option ID based on correct answer text
        correct_answer_text = str(q.get('correct_answer'))
        correct_option_id = None
        for opt in formatted_options:
            if opt['text'] == correct_answer_text:
                correct_option_id = opt['id']
                break
        # Fallback to first option if no match found
        if not correct_option_id and formatted_options:
            correct_option_id = formatted_options[0]['id']

        formatted_questions.append({
            'id': f'fallback-{i}-{abs(hash(topic + str(i)))}',
            'type': normalized_type,
            'question': q.get('question_text'),
            'options': formatted_options,
            'correctOptionId': correct_option_id,
            'explanation': q.get('explanation', 'This is a core concept within the topic.'),
            'source': f'Local question bank - {fallback_topic}',
            'topic': topic,
            'difficulty': request.difficulty or 'Medium',
        })
    
    return {
        'topic': topic,
        'difficulty': request.difficulty or 'Medium',
        'sourceType': 'local',
        'questionType': request.question_type,
        'questions': formatted_questions,
        'using_fallback': True,
        'fallback_topic': fallback_topic
    }


@router.get("/welcome-prompts")
async def get_welcome_prompts():
    """Get clickable starter prompts for the welcome experience."""
    prompts = [
        {
            "id": "cognizant-tech",
            "text": "🎯 Prepare me for a Cognizant technical test",
            "topic": "Cognizant Technical MCQs",
            "category": "Cognizant Placement"
        },
        {
            "id": "java-oop",
            "text": "💻 Test my Java and OOP knowledge",
            "topic": "Java",
            "category": "Technology"
        },
        {
            "id": "dbms-sql",
            "text": "🗄️ Give me a DBMS + SQL mixed quiz",
            "topic": "DBMS",
            "category": "Technology"
        },
        {
            "id": "dsa",
            "text": "🧠 Challenge me with DSA questions",
            "topic": "Data Structures",
            "category": "Technology"
        },
        {
            "id": "aptitude",
            "text": "📊 Give me a placement aptitude quiz",
            "topic": "Quantitative Aptitude",
            "category": "Placement"
        }
    ]
    
    return {"prompts": prompts}


@router.get("/status")
async def get_fallback_status():
    """Get the status of the fallback system."""
    return {
        "fallback_available": True,
        "available_topics": len(get_available_topics()),
        "total_categories": len(TOPIC_CATEGORIES),
        "message": "Local question bank is available as fallback when Gemini is unavailable"
    }