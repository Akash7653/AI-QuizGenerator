from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from app.database.models.question import Question, QuestionType, Difficulty, BloomTaxonomy
from app.database.repository.base import BaseRepository


class QuestionRepository(BaseRepository[Question]):
    """Repository for Question model."""
    
    def __init__(self, db: Session):
        super().__init__(Question, db)
    
    def get_by_document_id(self, document_id: int, skip: int = 0, limit: int = 100) -> List[Question]:
        """Get questions by document ID."""
        return self.db.query(Question).filter(
            Question.document_id == document_id
        ).offset(skip).limit(limit).all()
    
    def get_by_topic_id(self, topic_id: int, skip: int = 0, limit: int = 100) -> List[Question]:
        """Get questions by topic ID."""
        return self.db.query(Question).filter(
            Question.topic_id == topic_id
        ).offset(skip).limit(limit).all()
    
    def get_by_type(self, question_type: QuestionType, skip: int = 0, limit: int = 100) -> List[Question]:
        """Get questions by type."""
        return self.db.query(Question).filter(
            Question.question_type == question_type
        ).offset(skip).limit(limit).all()
    
    def get_by_difficulty(self, difficulty: Difficulty, skip: int = 0, limit: int = 100) -> List[Question]:
        """Get questions by difficulty."""
        return self.db.query(Question).filter(
            Question.difficulty == difficulty
        ).offset(skip).limit(limit).all()
    
    def get_validated_questions(self, skip: int = 0, limit: int = 100) -> List[Question]:
        """Get all validated questions."""
        return self.db.query(Question).filter(
            Question.is_validated == True
        ).offset(skip).limit(limit).all()
    
    def get_unvalidated_questions(self, skip: int = 0, limit: int = 100) -> List[Question]:
        """Get all unvalidated questions."""
        return self.db.query(Question).filter(
            Question.is_validated == False
        ).offset(skip).limit(limit).all()
    
    def search_questions(self, query: str, skip: int = 0, limit: int = 100) -> List[Question]:
        """Search questions by text."""
        search_pattern = f"%{query}%"
        return self.db.query(Question).filter(
            or_(
                Question.question_text.ilike(search_pattern),
                Question.subtopic.ilike(search_pattern)
            )
        ).offset(skip).limit(limit).all()
    
    def get_by_filters(
        self,
        question_type: Optional[QuestionType] = None,
        difficulty: Optional[Difficulty] = None,
        topic_id: Optional[int] = None,
        document_id: Optional[int] = None,
        bloom_taxonomy: Optional[BloomTaxonomy] = None,
        is_validated: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Question]:
        """Get questions by multiple filters."""
        query = self.db.query(Question)
        
        if question_type:
            query = query.filter(Question.question_type == question_type)
        if difficulty:
            query = query.filter(Question.difficulty == difficulty)
        if topic_id:
            query = query.filter(Question.topic_id == topic_id)
        if document_id:
            query = query.filter(Question.document_id == document_id)
        if bloom_taxonomy:
            query = query.filter(Question.bloom_taxonomy_level == bloom_taxonomy)
        if is_validated is not None:
            query = query.filter(Question.is_validated == is_validated)
        
        return query.offset(skip).limit(limit).all()
    
    def get_random_questions(self, count: int = 10, filters: Optional[Dict[str, Any]] = None) -> List[Question]:
        """Get random questions."""
        query = self.db.query(Question)
        
        if filters:
            if 'question_type' in filters:
                query = query.filter(Question.question_type == filters['question_type'])
            if 'difficulty' in filters:
                query = query.filter(Question.difficulty == filters['difficulty'])
            if 'topic_id' in filters:
                query = query.filter(Question.topic_id == filters['topic_id'])
            if 'is_validated' in filters:
                query = query.filter(Question.is_validated == filters['is_validated'])
        
        return query.order_by(func.random()).limit(count).all()
    
    def update_validation_status(
        self, 
        question_id: int, 
        is_validated: bool, 
        validation_errors: Optional[List[str]] = None
    ) -> Optional[Question]:
        """Update question validation status."""
        question = self.get_by_id(question_id)
        if question:
            question.is_validated = is_validated
            question.validation_errors = validation_errors
            self.db.commit()
            self.db.refresh(question)
        return question
    
    def update_confidence_score(self, question_id: int, confidence_score: float) -> Optional[Question]:
        """Update question confidence score."""
        question = self.get_by_id(question_id)
        if question:
            question.confidence_score = confidence_score
            self.db.commit()
            self.db.refresh(question)
        return question
    
    def get_question_stats(self) -> Dict[str, Any]:
        """Get question statistics."""
        total_questions = self.db.query(Question).count()
        validated_questions = self.db.query(Question).filter(Question.is_validated == True).count()
        
        type_stats = {}
        for q_type in QuestionType:
            type_stats[q_type.value] = self.db.query(Question).filter(
                Question.question_type == q_type
            ).count()
        
        difficulty_stats = {}
        for diff in Difficulty:
            difficulty_stats[diff.value] = self.db.query(Question).filter(
                Question.difficulty == diff
            ).count()
        
        avg_confidence = self.db.query(func.avg(Question.confidence_score)).scalar() or 0.0
        
        return {
            "total_questions": total_questions,
            "validated_questions": validated_questions,
            "validation_rate": (validated_questions / total_questions * 100) if total_questions > 0 else 0,
            "type_distribution": type_stats,
            "difficulty_distribution": difficulty_stats,
            "average_confidence_score": avg_confidence
        }
