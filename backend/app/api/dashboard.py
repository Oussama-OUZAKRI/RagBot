from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.db.base import get_db
from app.dependencies import get_current_active_user
from app.models.document import Document
from app.models.user import User
from app.schemas.chat import ChatMessage

router = APIRouter()

@router.get("/stats", response_model=Dict)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get dashboard statistics including:
    - Total number of documents
    - Total number of queries/messages
    - Average response time
    - Number of active users
    - Documents by type
    - Queries by day (last 7 days)
    - Storage usage
    """
    try:
        # Get total documents
        total_documents = db.query(Document).count()

        # Get total queries (messages)
        total_queries = db.query(ChatMessage).count()

        # Calculate average response time (assuming we have a response_time field)
        avg_response = db.query(func.avg(ChatMessage.response_time)).scalar() or 0

        # Get active users in last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_users = db.query(User).filter(
            User.last_login >= thirty_days_ago
        ).count()

        # Get documents by type
        docs_by_type = (
            db.query(
                Document.type,
                func.count(Document.id).label('count')
            )
            .group_by(Document.type)
            .all()
        )
        documents_by_type = {t: c for t, c in docs_by_type}

        # Get queries for the last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        daily_queries = (
            db.query(
                func.date(ChatMessage.created_at),
                func.count(ChatMessage.id)
            )
            .filter(ChatMessage.created_at >= seven_days_ago)
            .group_by(func.date(ChatMessage.created_at))
            .all()
        )
        queries_by_day = {
            date.strftime('%Y-%m-%d'): count 
            for date, count in daily_queries
        }

        # Calculate total storage used (in MB)
        total_storage = (
            db.query(func.sum(Document.file_size))
            .scalar() or 0
        ) / (1024 * 1024)  # Convert to MB

        return {
            "totalDocuments": total_documents,
            "totalQueries": total_queries,
            "averageResponseTime": round(float(avg_response), 2),
            "activeUsers": active_users,
            "documentsByType": documents_by_type,
            "queriesByDay": queries_by_day,
            "storageUsed": round(total_storage, 2),
            "lastUpdated": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching dashboard statistics: {str(e)}"
        )
