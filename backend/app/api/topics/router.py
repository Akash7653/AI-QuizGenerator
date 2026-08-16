from fastapi import APIRouter
from typing import Dict, Any, List
from app.seeds.topics_data import TOPIC_CATEGORIES, ALL_TOPICS

router = APIRouter(prefix="/topics", tags=["Topics"])


@router.get("/")
async def get_all_topics() -> Dict[str, Any]:
    """Get all topics organized by categories."""
    categories = []
    
    for category_name, category_data in TOPIC_CATEGORIES.items():
        topics_list = []
        
        for topic_data in category_data["topics"]:
            topics_list.append({
                "name": topic_data["name"],
                "description": topic_data["description"],
                "subtopics": topic_data["subtopics"]
            })
        
        categories.append({
            "name": category_name,
            "description": category_data["description"],
            "icon": category_data.get("icon", "📚"),
            "topics": topics_list
        })
    
    return {"categories": categories}


@router.get("/flat")
async def get_topics_flat() -> List[Dict[str, Any]]:
    """Get all topics in a flat list format."""
    return ALL_TOPICS


@router.get("/categories")
async def get_categories() -> List[Dict[str, Any]]:
    """Get only the categories without topics."""
    categories = []
    
    for category_name, category_data in TOPIC_CATEGORIES.items():
        categories.append({
            "name": category_name,
            "description": category_data["description"],
            "icon": category_data.get("icon", "📚"),
            "topic_count": len(category_data["topics"])
        })
    
    return categories


@router.get("/search/{query}")
async def search_topics(query: str) -> List[Dict[str, Any]]:
    """Search topics by name or description."""
    query = query.lower()
    results = []
    
    for topic in ALL_TOPICS:
        if (query in topic["name"].lower() or 
            query in topic["description"].lower() or
            any(query in subtopic.lower() for subtopic in topic["subtopics"])):
            results.append(topic)
    
    return results