from typing import Optional, List, Dict, Any
from app.database.mongodb_models import QuestionModel, QuestionType, Difficulty, BloomTaxonomy
from app.database.repository.base import BaseRepository


class QuestionRepository(BaseRepository[QuestionModel]):
    """Repository for Question model."""
    
    def __init__(self):
        super().__init__(QuestionModel)
    
    async def get_by_document_id(self, document_id: int, skip: int = 0, limit: int = 100) -> List[QuestionModel]:
        """Get questions by document ID."""
        return await self.model.find(self.model.document_id == document_id).skip(skip).limit(limit).to_list()
    
    async def get_by_topic_id(self, topic_id: int, skip: int = 0, limit: int = 100) -> List[QuestionModel]:
        """Get questions by topic ID."""
        return await self.model.find(self.model.topic_id == topic_id).skip(skip).limit(limit).to_list()
    
    async def get_by_type(self, question_type: QuestionType, skip: int = 0, limit: int = 100) -> List[QuestionModel]:
        """Get questions by type."""
        return await self.model.find(self.model.question_type == question_type).skip(skip).limit(limit).to_list()
    
    async def get_by_difficulty(self, difficulty: Difficulty, skip: int = 0, limit: int = 100) -> List[QuestionModel]:
        """Get questions by difficulty."""
        return await self.model.find(self.model.difficulty == difficulty).skip(skip).limit(limit).to_list()
    
    async def get_validated_questions(self, skip: int = 0, limit: int = 100) -> List[QuestionModel]:
        """Get all validated questions."""
        return await self.model.find(self.model.is_validated == True).skip(skip).limit(limit).to_list()
    
    async def get_unvalidated_questions(self, skip: int = 0, limit: int = 100) -> List[QuestionModel]:
        """Get all unvalidated questions."""
        return await self.model.find(self.model.is_validated == False).skip(skip).limit(limit).to_list()
    
    async def search_questions(self, query: str, skip: int = 0, limit: int = 100) -> List[QuestionModel]:
        """Search questions by text."""
        import re
        pattern = re.compile(query, re.IGNORECASE)
        return await self.model.find({
            "$or": [
                {"question_text": pattern},
                {"subtopic": pattern}
            ]
        }).skip(skip).limit(limit).to_list()
    
    async def get_by_filters(
        self,
        question_type: Optional[QuestionType] = None,
        difficulty: Optional[Difficulty] = None,
        topic_id: Optional[int] = None,
        document_id: Optional[int] = None,
        bloom_taxonomy: Optional[BloomTaxonomy] = None,
        is_validated: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[QuestionModel]:
        """Get questions by multiple filters."""
        filters = {}
        
        if question_type:
            filters["question_type"] = question_type
        if difficulty:
            filters["difficulty"] = difficulty
        if topic_id:
            filters["topic_id"] = topic_id
        if document_id:
            filters["document_id"] = document_id
        if bloom_taxonomy:
            filters["bloom_taxonomy_level"] = bloom_taxonomy
        if is_validated is not None:
            filters["is_validated"] = is_validated
        
        return await self.model.find(filters).skip(skip).limit(limit).to_list()
    
    async def get_random_questions(self, count: int = 10, filters: Optional[Dict[str, Any]] = None) -> List[QuestionModel]:
        """Get random questions."""
        query_filters = {}
        
        if filters:
            if 'question_type' in filters:
                query_filters["question_type"] = filters['question_type']
            if 'difficulty' in filters:
                query_filters["difficulty"] = filters['difficulty']
            if 'topic_id' in filters:
                query_filters["topic_id"] = filters['topic_id']
            if 'is_validated' in filters:
                query_filters["is_validated"] = filters['is_validated']
        
        # MongoDB random sampling using $sample
        pipeline = [{"$match": query_filters}, {"$sample": {"size": count}}]
        return await self.model.aggregate(pipeline).to_list()
    
    async def update_validation_status(
        self, 
        question_id: int, 
        is_validated: bool, 
        validation_errors: Optional[List[str]] = None
    ) -> Optional[QuestionModel]:
        """Update question validation status."""
        question = await self.get_by_id(question_id)
        if question:
            question.is_validated = is_validated
            question.validation_errors = validation_errors
            await question.save()
        return question
    
    async def update_confidence_score(self, question_id: int, confidence_score: float) -> Optional[QuestionModel]:
        """Update question confidence score."""
        question = await self.get_by_id(question_id)
        if question:
            question.confidence_score = confidence_score
            await question.save()
        return question
    
    async def get_question_stats(self) -> Dict[str, Any]:
        """Get question statistics."""
        total_questions = await self.model.count()
        validated_questions = await self.model.find(self.model.is_validated == True).count()
        
        type_stats = {}
        for q_type in QuestionType:
            type_stats[q_type.value] = await self.model.find(self.model.question_type == q_type).count()
        
        difficulty_stats = {}
        for diff in Difficulty:
            difficulty_stats[diff.value] = await self.model.find(self.model.difficulty == diff).count()
        
        # Calculate average confidence score
        all_questions = await self.model.find_all().to_list()
        avg_confidence = sum(q.confidence_score for q in all_questions) / len(all_questions) if all_questions else 0.0
        
        return {
            "total_questions": total_questions,
            "validated_questions": validated_questions,
            "validation_rate": (validated_questions / total_questions * 100) if total_questions > 0 else 0,
            "type_distribution": type_stats,
            "difficulty_distribution": difficulty_stats,
            "average_confidence_score": avg_confidence
        }
