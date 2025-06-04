from datetime import datetime, timezone
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
import uuid
import time

from app.dependencies import get_current_active_user
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage
from app.schemas.conversation import ConversationCreate, Conversation
from app.models.user import User
from app.models.document import Document
from app.models.chat import ChatMessage as ChatMessageModel
from app.models.conversation import Conversation as ConversationModel
from app.db.base import get_db
from app.services.RagService import rag_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])

# Dependencies
DatabaseSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_active_user)]

@router.post(
    "/message",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK
)
async def chat_with_documents(
    request: ChatRequest,
    current_user: CurrentUser,
    db: DatabaseSession
):
    try:
        start_time = time.time()
        
        # Get or create conversation
        conversation = None
        if request.conversation_id:
            conversation = db.query(ConversationModel).filter(
                ConversationModel.id == request.conversation_id,
                ConversationModel.user_id == current_user.id
            ).first()
            if not conversation:
                raise HTTPException(
                    status_code=404,
                    detail="Conversation not found"
                )
        else:
            conversation = ConversationModel(
                user_id=current_user.id,
                title=request.message[:50]  # Use first 50 chars as title
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
        
        # Save user message
        user_message = ChatMessageModel(
            content=request.message,
            role="user",
            user_id=current_user.id,
            conversation_id=conversation.id,
            response_time=0  # User messages don't have response time
        )
        db.add(user_message)
        
        # Get selected documents if any
        documents = []
        if request.document_ids:
            documents = db.query(Document).filter(
                Document.id.in_(request.document_ids)
            ).all()
        
        # Get response from RAG service
        rag_response = await rag_service.get_response(
            request.message,
            documents,
            request.model_settings
        )
        
        # Calculate response time
        response_time = time.time() - start_time
        
        # Save assistant message
        assistant_message = ChatMessageModel(
            content=rag_response.message,
            role="assistant",
            user_id=current_user.id,
            conversation_id=conversation.id,
            response_time=response_time,
            references=rag_response.references
        )
        db.add(assistant_message)
        db.commit()
        
        return ChatResponse(
            message=rag_response.message,
            conversation_id=str(conversation.id),
            references=rag_response.references,
            created_at=datetime.now(timezone.utc)
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get(
    "/history/{conversation_id}",
    response_model=List[ChatMessage],
    status_code=status.HTTP_200_OK
)
async def get_chat_history(
    conversation_id: int,
    current_user: CurrentUser,
    db: DatabaseSession
):
    """Get the chat history for a specific conversation"""
    try:
        # Check if conversation exists and belongs to user
        conversation = db.query(ConversationModel).filter(
            ConversationModel.id == conversation_id,
            ConversationModel.user_id == current_user.id
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )
        
        # Get all messages for this conversation
        messages = db.query(ChatMessageModel).filter(
            ChatMessageModel.conversation_id == conversation_id
        ).order_by(ChatMessageModel.created_at.asc()).all()
        
        return messages
        
    except Exception as e:
        logger.error(f"Error fetching chat history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
