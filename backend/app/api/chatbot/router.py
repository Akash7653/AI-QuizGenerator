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

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)


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
    try:
        # Create a model instance for this conversation
        model = genai.GenerativeModel('gemini-pro')
        
        # System prompt to guide the chatbot behavior
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

        # Combine system prompt with user message
        full_message = f"{system_prompt}\n\nUser: {request.message}\n\nAssistant:"
        
        # Generate response using Gemini
        response = model.generate_content(full_message)
        
        if response and response.text:
            return ChatResponse(
                response=response.text.strip(),
                conversation_id=request.conversation_id
            )
        else:
            return ChatResponse(
                response="I couldn't generate a response. Please try again.",
                conversation_id=request.conversation_id
            )
            
    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        return ChatResponse(
            response=f"Sorry, I encountered an error: {str(e)}. Please try again later.",
            conversation_id=request.conversation_id
        )


@router.get("/health")
async def chatbot_health():
    """Health check endpoint for chatbot service."""
    try:
        # Test if Gemini API is accessible
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Say 'OK'")
        return {
            "status": "healthy",
            "gemini_api": "connected" if response else "error"
        }
    except Exception as e:
        logger.error(f"Chatbot health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }
