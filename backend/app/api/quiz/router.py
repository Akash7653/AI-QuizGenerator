from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from app.database.schemas.quiz import (
    QuizCreate, QuizResponse, QuizUpdate, QuizGenerationRequest,
    QuizAttemptCreate, QuizAttemptResponse, QuizSubmissionRequest,
    QuizResultResponse, QuickSaveQuizRequest
)
from app.database.mongodb_models import UserModel, QuizMode
from app.middleware.auth import get_current_user
from app.database.services.quiz_service import QuizService
from app.ai.question_generator import QuestionGenerator

router = APIRouter(prefix="/quiz", tags=["Quiz"])


class TopicQuizRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=120)
    difficulty: str = "Medium"
    total_questions: int = Field(default=10, ge=1, le=20)
    question_type: str = "Mixed"
    time_limit: int = Field(default=10, ge=0, le=60)
    source_type: str = "topic"


@router.post("/generate-topic")
async def generate_topic_quiz(
    request: TopicQuizRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """Generate a quiz from a custom topic using Gemini-powered content generation."""
    topic = request.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required")

    try:
        generator = QuestionGenerator()
        prompt_context = (
            f"Create a high-quality study brief for the topic '{topic}'. "
            "Include 6-8 core concepts, a few important definitions, and application examples. "
            "Keep it brief but educational so it can support quiz generation."
        )
        
        # Try to generate content with Gemini, with fallback
        try:
            context = generator.gemini_client.generate_text(prompt_context, max_tokens=1200)
        except Exception as gemini_error:
            print(f"[Quiz] Gemini generation failed: {str(gemini_error)}")
            # Fallback to basic context
            context = f"Topic: {topic}. This is a general educational topic covering key concepts, definitions, and applications."
        
        difficulty = request.difficulty.lower().replace(' ', '')
        difficulty = 'medium' if difficulty not in {'beginner', 'easy', 'medium', 'hard'} else difficulty
        question_type = request.question_type.lower()

        if question_type == 'mcq':
            raw_questions = generator.generate_mcq(context=context, difficulty=difficulty, count=request.total_questions, topic=topic)
        elif question_type == 'true/false' or question_type == 'true_false':
            raw_questions = generator.generate_true_false(context=context, difficulty=difficulty, count=request.total_questions, topic=topic)
        elif question_type == 'short answer' or question_type == 'short_answer':
            raw_questions = generator.generate_short_answer(context=context, difficulty=difficulty, count=request.total_questions, topic=topic)
        else:
            raw_questions = generator.generate_mixed_questions(context=context, difficulty=difficulty, total_count=request.total_questions, topic=topic)

        normalized_questions = []
        # Ensure we generate exactly the requested number of questions
        questions_to_generate = request.total_questions
        available_questions = len(raw_questions)

        # If we have fewer questions than requested, cycle through them
        for index in range(questions_to_generate):
            item = raw_questions[index % available_questions]
            q_type = str(item.get('question_type', 'mcq')).lower()
            if 'true' in q_type:
                normalized_type = 'truefalse'
            elif 'short' in q_type:
                normalized_type = 'short'
            else:
                normalized_type = 'mcq'

            # Convert options array to expected frontend format
            raw_options = item.get('options') or (['True', 'False'] if normalized_type == 'truefalse' else [])
            formatted_options = []
            for opt_index, opt_value in enumerate(raw_options):
                formatted_options.append({
                    'id': f'opt-{index}-{opt_index}',
                    'label': chr(65 + opt_index),  # A, B, C, D...
                    'text': str(opt_value)
                })

            # Find correct option ID based on correct answer text
            correct_answer_text = str(item.get('correct_answer') or item.get('answer') or 'True')
            correct_option_id = None
            for opt in formatted_options:
                if opt['text'] == correct_answer_text:
                    correct_option_id = opt['id']
                    break
            # Fallback to first option if no match found
            if not correct_option_id and formatted_options:
                correct_option_id = formatted_options[0]['id']

            normalized_questions.append({
                'id': f'gemini-{index}-{abs(hash(topic + str(index)))}',
                'type': normalized_type,
                'question': item.get('question_text') or item.get('question') or f'Explain the key idea behind {topic}.',
                'options': formatted_options,
                'correctOptionId': correct_option_id,
                'explanation': item.get('explanation') or 'This is a core concept within the topic.',
                'source': f'AI-generated through {topic}',
                'topic': topic,
                'difficulty': request.difficulty or 'Medium',
            })

        return {
            'topic': topic,
            'title': f'Quiz - {topic}',
            'difficulty': request.difficulty or 'Medium',
            'mode': 'practice',
            'sourceType': request.source_type,
            'questionType': request.question_type,
            'questions': normalized_questions,
        }
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate a quiz for '{topic}': {str(exc)}"
        )


@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(
    request: QuizGenerationRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """Generate a quiz using AI from document."""
    quiz_service = QuizService()

    try:
        quiz = await quiz_service.generate_ai_quiz(
            document_id=request.document_id,
            user_id=str(current_user.id),
            mode=request.mode,
            total_questions=request.total_questions,
            difficulty=request.difficulty or "medium",
            question_types=request.question_types
        )
        return quiz
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quiz generation failed: {str(e)}"
        )


@router.post("/create", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    quiz_data: QuizCreate,
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new quiz manually."""
    quiz_service = QuizService()

    try:
        quiz = await quiz_service.create_quiz(quiz_data, str(current_user.id))
        return quiz
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/start", response_model=QuizAttemptResponse)
async def start_quiz(
    request: QuizAttemptCreate,
    current_user: UserModel = Depends(get_current_user)
):
    """Start a quiz attempt."""
    quiz_service = QuizService()

    try:
        attempt = await quiz_service.start_quiz(str(request.quiz_id), str(current_user.id))
        return attempt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/pause/{attempt_id}", response_model=QuizAttemptResponse)
async def pause_quiz(
    attempt_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Pause a quiz attempt."""
    quiz_service = QuizService()

    try:
        attempt = await quiz_service.pause_quiz(str(attempt_id), str(current_user.id))
        return attempt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/resume/{attempt_id}", response_model=QuizAttemptResponse)
async def resume_quiz(
    attempt_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Resume a paused quiz attempt."""
    quiz_service = QuizService()

    try:
        attempt = await quiz_service.resume_quiz(str(attempt_id), str(current_user.id))
        return attempt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/submit", response_model=QuizAttemptResponse)
async def submit_quiz(
    request: QuizSubmissionRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """Submit a quiz attempt for evaluation."""
    quiz_service = QuizService()

    try:
        attempt = await quiz_service.submit_quiz(
            str(request.attempt_id),
            request.answers,
            str(current_user.id)
        )
        return attempt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/result/{attempt_id}", response_model=QuizResultResponse)
async def get_quiz_result(
    attempt_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Get detailed quiz result."""
    quiz_service = QuizService()

    try:
        result = await quiz_service.get_quiz_result(str(attempt_id), str(current_user.id))
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/quick-save", response_model=dict)
async def quick_save_quiz(
    request: QuickSaveQuizRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """Quick save quiz results for locally generated quizzes."""
    from app.database.repository.quiz_repository import QuizAttemptRepository
    from app.database.services.analytics_service import AnalyticsService

    try:
        # Create a quick temporary quiz record (or use existing generic quiz)
        quiz_service = QuizService()

        # Create a temporary quiz if it doesn't exist
        quiz_data = {
            "user_id": str(current_user.id),
            "title": f"Quiz - {request.topic}",
            "topic": request.topic,
            "mode": "practice",
            "difficulty": request.difficulty or "medium",
            "total_questions": request.total_questions,
            "total_marks": request.total_questions  # 1 mark per question
        }

        quiz = await quiz_service.quiz_repository.create(quiz_data)

        # Create attempt
        from datetime import datetime
        attempt_data = {
            "user_id": str(current_user.id),
            "quiz_id": str(quiz.id),
            "status": "completed",
            "started_at": int(datetime.now().timestamp()) - request.time_taken,
            "completed_at": int(datetime.now().timestamp()),
            "time_taken": request.time_taken,
            "total_score": float(request.score),
            "max_score": float(request.total_questions),
            "percentage": (request.score / request.total_questions * 100) if request.total_questions > 0 else 0,
            "correct_count": request.score,
            "wrong_count": request.total_questions - request.score,
            "skipped_count": 0,
            "current_question_index": request.total_questions,
        }

        attempt = await quiz_service.quiz_attempt_repository.create(attempt_data)

        analytics_service = AnalyticsService()
        await analytics_service.update_analytics_after_quiz(attempt)

        return {
            "id": str(attempt.id),
            "topic": request.topic,
            "score": request.score,
            "total_questions": request.total_questions,
            "percentage": attempt.percentage,
            "time_taken": request.time_taken,
            "difficulty": request.difficulty,
            "completed_at": attempt.completed_at
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save quiz: {str(e)}"
        )


@router.get("/", response_model=List[QuizResponse])
async def get_quizzes(
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_user)
):
    """Get all quizzes for current user."""
    quiz_service = QuizService()
    return await quiz_service.get_user_quizzes(str(current_user.id), skip, limit)


@router.get("/history", response_model=List[dict])
async def get_quiz_history(
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_user)
):
    """Get quiz attempt history for current user with quiz details."""
    quiz_service = QuizService()
    return await quiz_service.get_user_attempts_with_quiz_details(str(current_user.id), skip, limit)


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Get specific quiz by ID."""
    from app.database.repository.quiz_repository import QuizRepository
    quiz_repo = QuizRepository()

    quiz = await quiz_repo.get_by_id(quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )

    if str(quiz.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return quiz


@router.put("/{quiz_id}", response_model=QuizResponse)
async def update_quiz(
    quiz_id: str,
    quiz_data: QuizUpdate,
    current_user: UserModel = Depends(get_current_user)
):
    """Update quiz details."""
    from app.database.repository.quiz_repository import QuizRepository
    quiz_repo = QuizRepository()

    quiz = await quiz_repo.get_by_id(quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )

    if str(quiz.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    update_data = quiz_data.model_dump(exclude_unset=True)
    updated_quiz = await quiz_repo.update(quiz_id, update_data)
    return updated_quiz


@router.delete("/{quiz_id}")
async def delete_quiz(
    quiz_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a quiz."""
    quiz_service = QuizService()

    try:
        success = await quiz_service.delete_quiz(str(quiz_id), str(current_user.id))
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found"
            )
        return {"message": "Quiz deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
