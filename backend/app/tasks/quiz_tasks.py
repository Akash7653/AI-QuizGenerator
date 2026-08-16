from celery import shared_task
from loguru import logger
from app.ai.question_generator import QuestionGenerator
from app.ai.validator import QuestionValidator
from app.database.mongodb_models import QuizModel, QuizMode, QuestionModel
from app.database.repository.quiz_repository import QuizRepository
from app.database.repository.question_repository import QuestionRepository


@shared_task(bind=True, max_retries=3)
def generate_quiz_questions(self, quiz_id: int):
    """Generate questions for a quiz asynchronously."""
    logger.info(f"Generating questions for quiz {quiz_id}")
    
    try:
        quiz_repo = QuizRepository()
        question_repo = QuestionRepository()
        
        quiz = quiz_repo.get_by_id(quiz_id)
        if not quiz:
            logger.error(f"Quiz {quiz_id} not found")
            return {"status": "error", "message": "Quiz not found"}
        
        # Get document context (simplified)
        context = "Sample context for question generation"
        
        # Generate questions
        question_generator = QuestionGenerator()
        questions = question_generator.generate_mixed_questions(
            context=context,
            difficulty="medium",
            total_count=quiz.total_questions
        )
        
        # Validate questions
        question_validator = QuestionValidator()
        validation_results = question_validator.validate_batch(questions)
        
        # Save valid questions
        valid_question_ids = []
        for question_data, validation in zip(questions, validation_results):
            if validation['is_valid']:
                question_data['confidence_score'] = validation['confidence_score']
                question_data['is_validated'] = True
                question = question_repo.create(question_data)
                valid_question_ids.append(question.id)
        
        # Add questions to quiz
        if valid_question_ids:
            quiz_repo.add_questions_to_quiz(quiz_id, valid_question_ids)
        
        logger.info(f"Generated {len(valid_question_ids)} questions for quiz {quiz_id}")
        return {
            "status": "success",
            "quiz_id": quiz_id,
            "questions_generated": len(valid_question_ids),
            "questions_requested": quiz.total_questions
        }
        
    except Exception as e:
        logger.error(f"Quiz question generation failed: {str(e)}")
        raise self.retry(exc=e, countdown=60)


@shared_task
def validate_question(question_id: int):
    """Validate a specific question."""
    logger.info(f"Validating question {question_id}")
    
    try:
        question_repo = QuestionRepository()
        question = question_repo.get_by_id(question_id)
        
        if not question:
            logger.error(f"Question {question_id} not found")
            return {"status": "error", "message": "Question not found"}
        
        question_validator = QuestionValidator()
        question_data = {
            "question_text": question.question_text,
            "question_type": question.question_type.value,
            "options": question.options,
            "correct_answer": question.correct_answer,
            "explanation": question.explanation,
            "difficulty": question.difficulty.value
        }
        
        validation_result = question_validator.validate_question(question_data)
        
        # Update question with validation results
        question_repo.update_validation_status(
            question_id,
            validation_result['is_valid'],
            validation_result.get('errors')
        )
        question_repo.update_confidence_score(question_id, validation_result['confidence_score'])
        
        logger.info(f"Question {question_id} validated")
        return {
            "status": "success",
            "question_id": question_id,
            "is_valid": validation_result['is_valid'],
            "confidence_score": validation_result['confidence_score']
        }
        
    except Exception as e:
        logger.error(f"Question validation failed: {str(e)}")
        return {"status": "error", "message": str(e)}


@shared_task
def batch_validate_questions(question_ids: list):
    """Validate multiple questions in batch."""
    logger.info(f"Batch validating {len(question_ids)} questions")
    
    results = []
    for question_id in question_ids:
        result = validate_question(question_id)
        results.append(result)
    
    success_count = sum(1 for r in results if r.get('status') == 'success')
    
    logger.info(f"Batch validation complete: {success_count}/{len(question_ids)} successful")
    return {
        "status": "success",
        "total": len(question_ids),
        "successful": success_count,
        "failed": len(question_ids) - success_count,
        "results": results
    }
