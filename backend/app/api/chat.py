from datetime import datetime, timezone
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
import uuid

from app.dependencies import get_current_active_user
from app.schemas.chat import ChatRequest, ChatResponse
from app.models.user import User
from app.models.document import Document
from app.db.base import get_db
from app.services.RagService import rag_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])

# Dependencies
DatabaseSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_active_user)]

@router.post(
  "/",
  response_model=ChatResponse,
  status_code=status.HTTP_200_OK
)
async def chat_with_documents(
  request: ChatRequest,
  current_user: CurrentUser,
  db: DatabaseSession
):
  """Process a chat message with optional document context"""
  try:
    # Récupérer les documents si des IDs sont fournis
    documents = []
    if request.document_ids:
      documents = db.query(Document).filter(
        Document.id.in_(request.document_ids),
        Document.user_id == current_user.id
      ).all()
      
      if len(documents) != len(request.document_ids):
        raise HTTPException(
          status_code=404,
          detail="Some documents were not found or are not accessible"
        )

    # Générer la réponse avec le contexte des documents
    response = await rag_service.generate_response(
      query=request.message,
      documents=documents,
      conversation_id=request.conversation_id or str(uuid.uuid4()),
      model_settings=request.model_settings
    )
    
    return ChatResponse(
      message=response["answer"],
      conversation_id=response["conversation_id"],
      references=response.get("references", []),
      created_at=datetime.now(timezone.utc)
    )

  except Exception as e:
    logger.error(f"Chat error: {str(e)}", exc_info=True)
    raise HTTPException(
      status_code=500,
      detail=f"Error processing chat request: {str(e)}"
    )
