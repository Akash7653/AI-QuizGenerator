import os
from fastapi import APIRouter, Depends
from app.database.mongodb_models import UserModel
from app.middleware.auth import get_current_user
from pydantic import BaseModel
from app.config.settings import settings, get_gemini_api_key
from loguru import logger
from typing import Optional, List

try:
    import google.generativeai as genai
except Exception:  # pragma: no cover - optional dependency
    genai = None

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


def _is_gemini_configured() -> bool:
    """Check whether a real Gemini API key is configured."""
    if genai is None:
        return False
    return bool(get_gemini_api_key())


class ChatMessage(BaseModel):
    """Chat message request model."""
    message: str
    conversation_id: str | None = None
    user_selection: Optional[str] = None  # For question-answer flow


class ChatResponse(BaseModel):
    """Chat response model."""
    response: str
    conversation_id: str | None = None
    is_question: bool = False
    question_options: Optional[List[str]] = None


# Dummy responses for when Gemini is not configured
WEBSITE_INFO = {
    "about": "QuizGen is an AI-powered quiz generator that helps you create custom quizzes from various sources like PDFs, text, articles, and topics. It uses advanced AI to generate relevant questions and provides detailed analytics to track your progress.",
    "features": "QuizGen offers features like: AI-powered quiz generation, multiple question types (MCQ, True/False, Short Answer), topic-based quizzes, detailed analytics and performance tracking, personalized learning recommendations, and mobile-responsive design.",
    "how_it_works": "Simply choose your input source (PDF, text, URL, or topic), configure your quiz settings (difficulty, question count, type), and let our AI generate a personalized quiz for you. Track your progress and improve over time!",
    "pricing": "QuizGen is currently in beta and free to use. We're working on premium features that will include advanced analytics, custom question banks, and collaborative learning tools.",
    "support": "For support, you can contact us through the help section in the app or email us at support@quizgen.ai. We're constantly improving the platform based on user feedback.",
    "study_tips": "Great study tips include: spacing out your learning sessions, practicing active recall, teaching concepts to others, using the Pomodoro technique, and getting enough sleep to consolidate memory.",
}

# Interactive questions for the chatbot
CHATBOT_QUESTIONS = [
    {
        "question": "What would you like to know about QuizGen?",
        "options": ["About QuizGen", "Features", "How it works", "Pricing", "Study tips", "Support"]
    },
    {
        "question": "Which quiz type are you interested in?",
        "options": ["Technical topics", "General knowledge", "Placement preparation", "Language learning", "Science subjects"]
    },
    {
        "question": "What's your primary learning goal?",
        "options": ["Exam preparation", "Skill improvement", "Knowledge expansion", "Interview prep", "Teaching others"]
    }
]


def get_dummy_response(message: str, user_selection: Optional[str] = None) -> dict:
    """Generate dummy responses when Gemini is not configured."""
    message_lower = message.lower()
    
    # Check if user is responding to a question
    if user_selection:
        if user_selection in ["about quizgen", "about"]:
            return {
                "response": WEBSITE_INFO["about"],
                "is_question": False,
                "question_options": None
            }
        elif user_selection in ["features"]:
            return {
                "response": WEBSITE_INFO["features"],
                "is_question": False,
                "question_options": None
            }
        elif user_selection in ["how it works", "how_it_works"]:
            return {
                "response": WEBSITE_INFO["how_it_works"],
                "is_question": False,
                "question_options": None
            }
        elif user_selection in ["pricing"]:
            return {
                "response": WEBSITE_INFO["pricing"],
                "is_question": False,
                "question_options": None
            }
        elif user_selection in ["support"]:
            return {
                "response": WEBSITE_INFO["support"],
                "is_question": False,
                "question_options": None
            }
        elif user_selection in ["study tips", "study_tips"]:
            return {
                "response": WEBSITE_INFO["study_tips"],
                "is_question": False,
                "question_options": None
            }
        else:
            return {
                "response": f"Great choice! {user_selection} is an excellent area to focus on. Would you like me to help you create a quiz on this topic?",
                "is_question": True,
                "question_options": ["Yes, create a quiz", "Tell me more about it", "Suggest study resources"]
            }
    
    # Check for general questions
    if "about" in message_lower:
        return {
            "response": WEBSITE_INFO["about"],
            "is_question": True,
            "question_options": CHATBOT_QUESTIONS[0]["options"]
        }
    elif "feature" in message_lower:
        return {
            "response": WEBSITE_INFO["features"],
            "is_question": True,
            "question_options": CHATBOT_QUESTIONS[1]["options"]
        }
    elif "how" in message_lower and "work" in message_lower:
        return {
            "response": WEBSITE_INFO["how_it_works"],
            "is_question": True,
            "question_options": CHATBOT_QUESTIONS[2]["options"]
        }
    elif "price" in message_lower or "cost" in message_lower:
        return {
            "response": WEBSITE_INFO["pricing"],
            "is_question": False,
            "question_options": None
        }
    elif "help" in message_lower or "support" in message_lower:
        return {
            "response": WEBSITE_INFO["support"],
            "is_question": False,
            "question_options": None
        }
    elif "study" in message_lower or "tip" in message_lower:
        return {
            "response": WEBSITE_INFO["study_tips"],
            "is_question": False,
            "question_options": None
        }
    elif "hello" in message_lower or "hi" in message_lower:
        return {
            "response": "Hello! I'm QuizBot, your AI learning assistant. I can help you with quiz preparation, study tips, and information about QuizGen. What would you like to know?",
            "is_question": True,
            "question_options": CHATBOT_QUESTIONS[0]["options"]
        }
    else:
        # Default response with a question
        return {
            "response": "I'd be happy to help you with that! To give you the best assistance, could you tell me more about what you're looking for?",
            "is_question": True,
            "question_options": CHATBOT_QUESTIONS[0]["options"]
        }


@router.post("/message")
async def chat_message(
    request: ChatMessage,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Send a message to the chatbot (Gemini-powered or dummy responses).
    
    The chatbot provides:
    - Quiz preparation tips
    - Study advice
    - Topic explanations
    - Learning strategies
    - Information about QuizGen
    - Interactive question-answer flow
    """
    # Use dummy responses if Gemini is not configured
    if not _is_gemini_configured():
        logger.info("Using dummy chatbot responses (Gemini not configured)")
        dummy_response = get_dummy_response(request.message, request.user_selection)
        return {
            "success": True,
            "response": dummy_response["response"],
            "is_question": dummy_response["is_question"],
            "question_options": dummy_response["question_options"],
            "conversation_id": request.conversation_id,
        }

    # Use Gemini if configured
    api_key = get_gemini_api_key()
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(settings.GEMINI_MODEL or 'gemini-flash-latest')

        system_prompt = """You are QuizBot, an AI learning assistant for QuizGen, an AI quiz generator platform.
You help users with:
- Quiz preparation and study tips
- Explaining topics and concepts
- Recommending learning strategies
- Motivating users to learn
- Answering questions about various subjects
- Information about QuizGen features and usage

Be concise, friendly, and encouraging. Keep responses to 2-3 sentences unless asked for more detail.
If asked about non-educational topics, politely redirect to learning-related discussions.
Always provide helpful, accurate information."""

        full_message = f"{system_prompt}\n\nUser: {request.message}\n\nAssistant:"
        response = model.generate_content(full_message)

        if response and getattr(response, "text", None):
            return {
                "success": True,
                "response": response.text.strip(),
                "is_question": False,
                "question_options": None,
                "conversation_id": request.conversation_id,
            }

        return {
            "success": False,
            "message": "AI generation failed while creating the chatbot response.",
            "response": "I couldn't generate a response. Please try again.",
            "is_question": False,
            "question_options": None,
            "conversation_id": request.conversation_id,
        }

    except Exception as e:
        logger.exception("Chatbot generation failed")
        error_message = str(e).lower()
        if "api key" in error_message or "401" in error_message or "forbidden" in error_message:
            user_message = "Gemini API key is invalid or missing. Please add a valid API key in backend/.env and restart the backend."
        else:
            user_message = "Sorry, I encountered an AI service error. Please try again in a moment."

        return {
            "success": False,
            "message": user_message,
            "response": user_message,
            "is_question": False,
            "question_options": None,
            "conversation_id": request.conversation_id,
        }


@router.get("/health")
async def chatbot_health():
    """Health check endpoint for chatbot service."""
    api_key = get_gemini_api_key()
    gemini_configured = _is_gemini_configured()
    
    if not gemini_configured:
        return {
            "success": True,
            "status": "dummy_mode",
            "configured": False,
            "message": "Gemini API key is not configured. Chatbot is running in dummy mode with pre-built responses.",
            "mode": "dummy"
        }

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(settings.GEMINI_MODEL or 'gemini-flash-latest')
        response = model.generate_content("Say 'OK'")
        return {
            "success": True,
            "status": "healthy" if response and getattr(response, "text", None) else "unhealthy",
            "configured": True,
            "message": "Gemini API is configured and responding.",
            "gemini_api": "connected" if response and getattr(response, "text", None) else "error",
            "mode": "gemini"
        }
    except Exception as e:
        logger.error(f"Chatbot health check failed: {str(e)}")
        return {
            "success": True,
            "status": "dummy_mode",
            "configured": True,
            "message": f"Gemini connection failed: {str(e)}. Falling back to dummy mode.",
            "error": str(e),
            "mode": "dummy"
        }