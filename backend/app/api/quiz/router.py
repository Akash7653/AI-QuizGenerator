from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.schemas.quiz import (
    QuizCreate, QuizResponse, QuizUpdate, QuizGenerationRequest,
    QuizAttemptCreate, QuizAttemptResponse, QuizSubmissionRequest,
    QuizResultResponse
)
from app.database.models.quiz import Quiz, QuizMode
from app.database.models.user import User
from app.middleware.auth import get_current_user
from app.database.services.quiz_service import QuizService

router = APIRouter(prefix="/quiz", tags=["Quiz"])


@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(
    request: QuizGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a quiz using AI from document."""
    quiz_service = QuizService(db)
    
    try:
        quiz = quiz_service.generate_ai_quiz(
            document_id=request.document_id,
            user_id=current_user.id,
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quiz generation failed: {str(e)}"
        )


@router.post("/create", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    quiz_data: QuizCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new quiz manually."""
    quiz_service = QuizService(db)
    
    try:
        quiz = quiz_service.create_quiz(quiz_data, current_user.id)
        return quiz
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/start", response_model=QuizAttemptResponse)
async def start_quiz(
    request: QuizAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a quiz attempt."""
    quiz_service = QuizService(db)
    
    try:
        attempt = quiz_service.start_quiz(request.quiz_id, current_user.id)
        return attempt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/pause/{attempt_id}", response_model=QuizAttemptResponse)
async def pause_quiz(
    attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Pause a quiz attempt."""
    quiz_service = QuizService(db)
    
    try:
        attempt = quiz_service.pause_quiz(attempt_id, current_user.id)
        return attempt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/resume/{attempt_id}", response_model=QuizAttemptResponse)
async def resume_quiz(
    attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Resume a paused quiz attempt."""
    quiz_service = QuizService(db)
    
    try:
        attempt = quiz_service.resume_quiz(attempt_id, current_user.id)
        return attempt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/submit", response_model=QuizAttemptResponse)
async def submit_quiz(
    request: QuizSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a quiz attempt for evaluation."""
    quiz_service = QuizService(db)
    
    try:
        attempt = quiz_service.submit_quiz(
            request.attempt_id,
            request.answers,
            current_user.id
        )
        return attempt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/result/{attempt_id}", response_model=QuizResultResponse)
async def get_quiz_result(
    attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed quiz result."""
    quiz_service = QuizService(db)
    
    try:
        result = quiz_service.get_quiz_result(attempt_id, current_user.id)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[QuizResponse])
async def get_quizzes(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all quizzes for current user."""
    quiz_service = QuizService(db)
    return quiz_service.get_user_quizzes(current_user.id, skip, limit)


@router.get("/history", response_model=List[QuizAttemptResponse])
async def get_quiz_history(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get quiz attempt history for current user."""
    quiz_service = QuizService(db)
    return quiz_service.get_user_attempts(current_user.id, skip, limit)


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific quiz by ID."""
    from app.database.repository import QuizRepository
    quiz_repo = QuizRepository(db)
    
    quiz = quiz_repo.get_by_id(quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    if quiz.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return quiz


@router.put("/{quiz_id}", response_model=QuizResponse)
async def update_quiz(
    quiz_id: int,
    quiz_data: QuizUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update quiz details."""
    from app.database.repository import QuizRepository
    quiz_repo = QuizRepository(db)
    
    quiz = quiz_repo.get_by_id(quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    if quiz.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    update_data = quiz_data.dict(exclude_unset=True)
    updated_quiz = quiz_repo.update(quiz, update_data)
    return updated_quiz


@router.delete("/{quiz_id}")
async def delete_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a quiz."""
    quiz_service = QuizService(db)
    
    try:
        success = quiz_service.delete_quiz(quiz_id, current_user.id)
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
