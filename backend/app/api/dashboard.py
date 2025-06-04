from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.db.base import get_db
from app.dependencies import get_current_active_user
from app.models.document import Document
from app.models.user import User
from app.models.chat import ChatMessage
from app.models.conversation import Conversation

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
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
        total_documents = db.query(Document).filter(Document.status == 'indexed').count()

        # Get total queries (messages from users)
        total_queries = db.query(ChatMessage).filter(ChatMessage.role == 'user').count()

        # Calculate average response time for bot messages
        avg_response = db.query(func.avg(ChatMessage.response_time))\
            .filter(ChatMessage.role == 'assistant')\
            .scalar() or 0        # Get active users (users with conversations in last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_users = db.query(User.id)\
            .join(Conversation)\
            .filter(Conversation.created_at >= thirty_days_ago)\
            .distinct()\
            .count()

        # Get documents by type
        docs_by_type = (
            db.query(
                Document.type,
                func.count(Document.id).label('count')
            )
            .filter(Document.status == 'indexed')
            .group_by(Document.type)
            .all()
        )
        documents_by_type = {str(t): c for t, c in docs_by_type}

        # Get queries by day for the last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        daily_queries = (
            db.query(
                func.date(ChatMessage.created_at).label('date'),
                func.count(ChatMessage.id).label('count')
            )
            .filter(
                ChatMessage.created_at >= seven_days_ago,
                ChatMessage.role == 'user'
            )
            .group_by(func.date(ChatMessage.created_at))
            .order_by('date')
            .all()
        )

        # Create a dict with all days (including days with 0 queries)
        queries_by_day = {}
        for i in range(7):
            day = (datetime.utcnow() - timedelta(days=i)).date()
            queries_by_day[day.isoformat()] = 0

        # Fill in the actual query counts
        for date, count in daily_queries:
            queries_by_day[date.isoformat()] = count

        # Calculate total storage used (in MB)
        total_storage = (
            db.query(func.sum(Document.file_size))
            .filter(Document.status == 'indexed')
            .scalar() or 0
        ) / (1024 * 1024)  # Convert to MB
        
        docs_by_type = (
            db.query(
                Document.type,
                func.count(Document.id).label('count')
            )
            .filter(Document.status == 'indexed')
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
        print(f"Error in dashboard stats: {str(e)}")  # For debugging
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching dashboard statistics: {str(e)}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching dashboard statistics: {str(e)}"
        )

@router.get("/popular-queries")
async def get_popular_queries(
    limit: int = 3,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the most frequently asked queries"""
    try:
        # Get queries from last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        popular_queries = (
            db.query(
                ChatMessage.content,
                func.count(ChatMessage.id).label('count')
            )
            .filter(
                ChatMessage.created_at >= thirty_days_ago,
                ChatMessage.role == 'user'
            )
            .group_by(ChatMessage.content)
            .order_by(func.count(ChatMessage.id).desc())
            .limit(limit)
            .all()
        )
        
        return [
            {
                "query": content,
                "count": count
            }
            for content, count in popular_queries
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching popular queries: {str(e)}"
        )
