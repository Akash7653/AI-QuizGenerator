from typing import Generic, TypeVar, Type, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.database.models.base import BaseModel

T = TypeVar('T', bound=BaseModel)


class BaseRepository(Generic[T]):
    """Base repository with common CRUD operations."""
    
    def __init__(self, model: Type[T], db: Session):
        self.model = model
        self.db = db
    
    def get_by_id(self, id: int) -> Optional[T]:
        """Get entity by ID."""
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        order_desc: bool = False
    ) -> List[T]:
        """Get all entities with optional filtering and pagination."""
        query = self.db.query(self.model)
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.filter(getattr(self.model, key) == value)
        
        if order_by and hasattr(self.model, order_by):
            column = getattr(self.model, order_by)
            query = query.order_by(column.desc() if order_desc else column.asc())
        
        return query.offset(skip).limit(limit).all()
    
    def create(self, obj_in: Dict[str, Any]) -> T:
        """Create new entity."""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def update(self, db_obj: T, obj_in: Dict[str, Any]) -> T:
        """Update existing entity."""
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def delete(self, id: int) -> bool:
        """Delete entity by ID."""
        obj = self.get_by_id(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
            return True
        return False
    
    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count entities with optional filters."""
        query = self.db.query(self.model)
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.filter(getattr(self.model, key) == value)
        
        return query.count()
    
    def exists(self, id: int) -> bool:
        """Check if entity exists."""
        return self.db.query(self.model).filter(self.model.id == id).first() is not None
    
    def bulk_create(self, objects: List[Dict[str, Any]]) -> List[T]:
        """Bulk create entities."""
        db_objects = [self.model(**obj) for obj in objects]
        self.db.add_all(db_objects)
        self.db.commit()
        for obj in db_objects:
            self.db.refresh(obj)
        return db_objects
    
    def bulk_update(self, ids: List[int], obj_in: Dict[str, Any]) -> int:
        """Bulk update entities."""
        updated = self.db.query(self.model).filter(self.model.id.in_(ids)).update(obj_in)
        self.db.commit()
        return updated
    
    def bulk_delete(self, ids: List[int]) -> int:
        """Bulk delete entities."""
        deleted = self.db.query(self.model).filter(self.model.id.in_(ids)).delete()
        self.db.commit()
        return deleted
