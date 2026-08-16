from typing import Generic, TypeVar, Type, List, Optional, Dict, Any
from beanie import Document
from beanie.operators import In

T = TypeVar('T', bound=Document)


class BaseRepository(Generic[T]):
    """Base repository with common CRUD operations for MongoDB."""
    
    def __init__(self, model: Type[T]):
        self.model = model
    
    async def get_by_id(self, id: int) -> Optional[T]:
        """Get entity by ID."""
        return await self.model.find_one(self.model.id == id)
    
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        order_desc: bool = False
    ) -> List[T]:
        """Get all entities with optional filtering and pagination."""
        query = self.model.find()
        
        if filters:
            query = query.find(filters)
        
        if order_by:
            sort_field = getattr(self.model, order_by)
            query = query.sort((sort_field, -1 if order_desc else 1))
        
        return await query.skip(skip).limit(limit).to_list()
    
    async def create(self, obj_in: Dict[str, Any]) -> T:
        """Create new entity."""
        db_obj = self.model(**obj_in)
        await db_obj.insert()
        return db_obj
    
    async def update(self, db_obj: T, obj_in: Dict[str, Any]) -> T:
        """Update existing entity."""
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        await db_obj.save()
        return db_obj
    
    async def delete(self, id: int) -> bool:
        """Delete entity by ID."""
        obj = await self.get_by_id(id)
        if obj:
            await obj.delete()
            return True
        return False
    
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count entities with optional filters."""
        if filters:
            return await self.model.find(filters).count()
        return await self.model.count()
    
    async def exists(self, id: int) -> bool:
        """Check if entity exists."""
        return await self.get_by_id(id) is not None
    
    async def bulk_create(self, objects: List[Dict[str, Any]]) -> List[T]:
        """Bulk create entities."""
        db_objects = [self.model(**obj) for obj in objects]
        await self.model.insert_many(db_objects)
        return db_objects
    
    async def bulk_update(self, ids: List[int], obj_in: Dict[str, Any]) -> int:
        """Bulk update entities."""
        result = await self.model.find(In(self.model.id, ids)).update({"$set": obj_in})
        return result.modified_count
    
    async def bulk_delete(self, ids: List[int]) -> int:
        """Bulk delete entities."""
        result = await self.model.find(In(self.model.id, ids)).delete()
        return result.deleted_count
