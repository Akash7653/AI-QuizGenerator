import os
from fastapi import APIRouter, Depends
from app.database.mongodb_models import UserModel
from app.middleware.auth import get_current_user
from pydantic import BaseModel
from app.config.settings import settings, get_gemini_api_key
from loguru import logger

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


class ChatResponse(BaseModel):
    """Chat response model."""
    response: str
    conversation_id: str | None = None


@router.post("/message")
async def chat_message(
    request: ChatMessage,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Send a message to the Gemini-powered chatbot.
    
    The chatbot provides:
    - Quiz preparation tips
    - Study advice
    - Topic explanations
    - Learning strategies
    """
    api_key = get_gemini_api_key()
    if not _is_gemini_configured() or not api_key:
        logger.warning("Gemini chatbot requested but no valid API key is configured")
        return {
            "success": False,
            "message": "AI chatbot is unavailable because the Gemini API key is missing or still set to a sample value.",
            "response": "Gemini is not configured yet. Add your real API key in backend/.env or in the Render/Vercel environment, then restart the backend to enable AI chat.",
            "conversation_id": request.conversation_id,
        }

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

Be concise, friendly, and encouraging. Keep responses to 2-3 sentences unless asked for more detail.
If asked about non-educational topics, politely redirect to learning-related discussions.
Always provide helpful, accurate information."""

        full_message = f"{system_prompt}\n\nUser: {request.message}\n\nAssistant:"
        response = model.generate_content(full_message)

        if response and getattr(response, "text", None):
            return {
                "success": True,
                "response": response.text.strip(),
                "conversation_id": request.conversation_id,
            }

        return {
            "success": False,
            "message": "AI generation failed while creating the chatbot response.",
            "response": "I couldn't generate a response. Please try again.",
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
            "conversation_id": request.conversation_id,
        }


@router.get("/health")
async def chatbot_health():
    """Health check endpoint for chatbot service."""
    api_key = get_gemini_api_key()
    if not api_key:
        return {
            "success": False,
            "status": "unhealthy",
            "configured": False,
            "message": "Gemini API key is missing or still set to the placeholder value."
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
            "gemini_api": "connected" if response and getattr(response, "text", None) else "error"
        }
    except Exception as e:
        logger.error(f"Chatbot health check failed: {str(e)}")
        return {
            "success": False,
            "status": "unhealthy",
            "configured": True,
            "message": str(e),
            "error": str(e)
        }
