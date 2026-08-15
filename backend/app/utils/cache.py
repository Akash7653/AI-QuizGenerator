from typing import Optional, Any
from loguru import logger


class CacheManager:
    """No-op cache manager used when runtime caching is disabled."""

    def __init__(self):
        self.redis_client = None

    def is_available(self) -> bool:
        return False

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        return False

    def get(self, key: str) -> Optional[Any]:
        return None

    def delete(self, key: str) -> bool:
        return False

    def delete_pattern(self, pattern: str) -> int:
        return 0

    def exists(self, key: str) -> bool:
        return False

    def get_or_set(self, key: str, callback, ttl: Optional[int] = None) -> Any:
        try:
            return callback()
        except Exception as exc:
            logger.warning(f"Cache fallback callback failed: {exc}")
            return None

    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        return None

    def decrement(self, key: str, amount: int = 1) -> Optional[int]:
        return None

    def flush_db(self) -> bool:
        return False

    def get_stats(self) -> dict:
        return {"status": "unavailable"}


cache = CacheManager()
