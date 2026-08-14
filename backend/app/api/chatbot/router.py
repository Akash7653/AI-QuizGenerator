from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models.user import User
from app.middleware.auth import get_current_user
from pydantic import BaseModel
import google.generativeai as genai
from app.config.settings import settings
from loguru import logger

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


def _is_gemini_configured() -> bool:
    """Check whether a real Gemini API key is configured."""
    key = (settings.GEMINI_API_KEY or "").strip()
    placeholder_values = {
        "",
        "your-gemini-api-key-here",
        "your_api_key_here",
        "placeholder",
        "changeme",
        "test",
        "demo",
    }
    return bool(key) and key.lower() not in {value for value in placeholder_values}


class ChatMessage(BaseModel):
    """Chat message request model."""
    message: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    """Chat response model."""
    response: str
    conversation_id: str | None = None


@router.post("/message", response_model=ChatResponse)
async def chat_message(
    request: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message to the Gemini-powered chatbot.
    
    The chatbot provides:
    - Quiz preparation tips
    - Study advice
    - Topic explanations
    - Learning strategies
    """
    if not _is_gemini_configured():
        logger.warning("Gemini chatbot requested but no valid API key is configured")
        return ChatResponse(
            response="Gemini is not configured yet. Add your real API key in backend/.env and restart the backend to enable AI chat.",
            conversation_id=request.conversation_id,
        )

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL or 'gemini-flash-latest')

        system_prompt = """You are QuizBot, an AI learning assistant for QuizGen, an AI quiz generator platform.
You help users with:
- Quiz preparation and study tips
- Explaining topics and concepts
- Recommending learning strategies
- Motivating users to learn
- Answering questions about various subjects

Be concise, friendly, and encouraging. Keep responses to 2-3 sentences unless asked for more detail.
If asked about non-educational topics, politely redirect to learning-related discussions.
Always provide helpful, accurate information."""

        full_message = f"{system_prompt}\n\nUser: {request.message}\n\nAssistant:"
        response = model.generate_content(full_message)

        if response and getattr(response, "text", None):
            return ChatResponse(
                response=response.text.strip(),
                conversation_id=request.conversation_id,
            )

        return ChatResponse(
            response="I couldn't generate a response. Please try again.",
            conversation_id=request.conversation_id,
        )

    except Exception as e:
        logger.exception("Chatbot generation failed")
        error_message = str(e).lower()
        if "api key" in error_message or "401" in error_message or "forbidden" in error_message:
            user_message = "Gemini API key is invalid or missing. Please add a valid API key in backend/.env and restart the backend."
        else:
            user_message = "Sorry, I encountered an AI service error. Please try again in a moment."

        return ChatResponse(
            response=user_message,
            conversation_id=request.conversation_id,
        )


@router.get("/health")
async def chatbot_health():
    """Health check endpoint for chatbot service."""
    if not _is_gemini_configured():
        return {
            "status": "unhealthy",
            "configured": False,
            "message": "Gemini API key is missing or still set to the placeholder value."
        }

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL or 'gemini-flash-latest')
        response = model.generate_content("Say 'OK'")
        return {
            "status": "healthy" if response else "unhealthy",
            "configured": True,
            "gemini_api": "connected" if response else "error"
        }
    except Exception as e:
        logger.error(f"Chatbot health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "configured": True,
            "error": str(e)
        }
