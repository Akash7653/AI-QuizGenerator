from typing import Optional, Any, List
import json
import redis
from loguru import logger
from app.config.settings import settings


class CacheManager:
    """Redis-based cache manager."""
    
    def __init__(self):
        """Initialize cache manager."""
        self.redis_client = None
        self._connect()
    
    def _connect(self):
        """Connect to Redis."""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True
            )
            # Test connection
            self.redis_client.ping()
            logger.info("Connected to Redis cache")
        except Exception as e:
            logger.warning(f"Redis unavailable at startup: {str(e)}")
            self.redis_client = None
    
    def is_available(self) -> bool:
        """Check if cache is available."""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except:
            return False
    
    def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> bool:
        """Set value in cache."""
        if not self.is_available():
            return False
        
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            
            if ttl:
                self.redis_client.setex(key, ttl, value)
            else:
                self.redis_client.set(key, value)
            
            return True
        except Exception as e:
            logger.error(f"Cache set failed: {str(e)}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self.is_available():
            return None
        
        try:
            value = self.redis_client.get(key)
            if value is None:
                return None
            
            # Try to parse as JSON
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
                
        except Exception as e:
            logger.error(f"Cache get failed: {str(e)}")
            return None
    
    def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if not self.is_available():
            return False
        
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete failed: {str(e)}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern."""
        if not self.is_available():
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache pattern delete failed: {str(e)}")
            return 0
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        if not self.is_available():
            return False
        
        try:
            return self.redis_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Cache exists check failed: {str(e)}")
            return False
    
    def get_or_set(
        self,
        key: str,
        callback,
        ttl: Optional[int] = None
    ) -> Any:
        """Get value from cache or set using callback."""
        value = self.get(key)
        if value is not None:
            return value
        
        # Generate value using callback
        value = callback()
        self.set(key, value, ttl)
        return value
    
    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment value in cache."""
        if not self.is_available():
            return None
        
        try:
            return self.redis_client.incr(key, amount)
        except Exception as e:
            logger.error(f"Cache increment failed: {str(e)}")
            return None
    
    def decrement(self, key: str, amount: int = 1) -> Optional[int]:
        """Decrement value in cache."""
        if not self.is_available():
            return None
        
        try:
            return self.redis_client.decr(key, amount)
        except Exception as e:
            logger.error(f"Cache decrement failed: {str(e)}")
            return None
    
    def flush_db(self) -> bool:
        """Flush current database."""
        if not self.is_available():
            return False
        
        try:
            self.redis_client.flushdb()
            logger.info("Cache database flushed")
            return True
        except Exception as e:
            logger.error(f"Cache flush failed: {str(e)}")
            return False
    
    def get_stats(self) -> dict:
        """Get cache statistics."""
        if not self.is_available():
            return {"status": "unavailable"}
        
        try:
            info = self.redis_client.info()
            return {
                "status": "available",
                "connected_clients": info.get('connected_clients', 0),
                "used_memory": info.get('used_memory_human', '0B'),
                "total_keys": info.get('db0', {}).get('keys', 0),
                "hits": info.get('keyspace_hits', 0),
                "misses": info.get('keyspace_misses', 0)
            }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {str(e)}")
            return {"status": "error"}


# Global cache instance
cache = CacheManager()
