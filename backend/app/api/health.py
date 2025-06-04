from fastapi import APIRouter, Depends
from typing import Dict
from sqlalchemy.orm import Session
from chromadb import PersistentClient

from app.db.base import get_db
from app.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=Dict)
async def check_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Check the health status of the API and ChromaDB
    """
    health_status = {
        "api": True,
        "chromadb": False
    }
    
    try:
        # Test ChromaDB connection
        chroma_client = PersistentClient(path="chroma_test_db")
        collections = chroma_client.list_collections()
        health_status["chromadb"] = True
    except Exception as e:
        health_status["chromadb"] = False
    
    return health_status
