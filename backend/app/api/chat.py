from datetime import datetime, timezone
from typing import Annotated, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
import time

from app.dependencies import get_current_active_user
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage
from app.models.user import User
from app.models.document import Document
from app.models.chat import ChatMessage as ChatMessageModel
from app.schemas.conversation import Conversation
from app.models.conversation import Conversation as ConversationModel
from app.db.base import get_db
from app.services.RagService import rag_service
from app.services.LLMService import get_llm_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])

# Dependencies
DatabaseSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_active_user)]

@router.post("/message", response_model=ChatResponse)
async def chat_with_documents(
    request: ChatRequest,
    current_user: CurrentUser,
    db: DatabaseSession
):
    try:
        start_time = time.time()
        llm_service = get_llm_service()
        
        # Validation de conversation_id
        conversation_id = request.conversation_id
        if conversation_id:
            try:
                conversation_id = UUID(conversation_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid conversation ID")
                
        # 1. Gérer la conversation
        conversation = None
        if request.conversation_id:
            conversation = db.query(ConversationModel).filter(
                ConversationModel.id == request.conversation_id,
                ConversationModel.user_id == current_user.id
            ).first()
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
        else:
            conversation = ConversationModel(
                user_id=current_user.id,
                title=request.message[:50]
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        # 2. Sauvegarder le message utilisateur
        user_message = ChatMessageModel(
            content=request.message,
            role="user",
            user_id=current_user.id,
            conversation_id=conversation.id,
            response_time=0,  # temps de réponse = 0 pour les messages utilisateur
            created_at=datetime.now(timezone.utc)
        )
        db.add(user_message)
        db.commit()

        # 3. Obtenir le contexte pertinent via RAG
        document_ids = []
        if request.document_ids:
            documents = db.query(Document).filter(
                Document.id.in_(request.document_ids)
            ).all()
            document_ids = [doc.vector_id for doc in documents]

        relevant_context = rag_service.get_relevant_context(
            query=request.message,
            document_ids=document_ids,
            num_chunks=request.model_settings.get('num_chunks', 3),
            similarity_threshold=request.model_settings.get('similarity_threshold', 0.7)
        )
        print(f"Relevant context: {relevant_context}")

        # 4. Formater le contexte
        formatted_context = rag_service._format_context(relevant_context)

        # 5. Générer la réponse avec le LLM
        system_message = """Tu es un assistant IA expert qui aide à répondre aux questions.
        Base tes réponses uniquement sur le contexte fourni.
        Si tu ne trouves pas l'information dans le contexte, dis-le clairement."""

        llm_response = llm_service.generate_response(
            prompt=request.message,
            context=formatted_context,
            system_message=system_message
        )

        # 6. Sauvegarder la réponse
        response_time = time.time() - start_time
        references = [{
            "document_title": chunk.get("metadata", {}).get("doc_title", "Unknown"),
            "page_content": chunk.get("text", ""),
            "page_number": chunk.get("metadata", {}).get("doc_page_number")
        } for chunk in relevant_context] if relevant_context else []

        assistant_message = ChatMessageModel(
            content=llm_response,
            role="assistant",
            user_id=current_user.id,
            conversation_id=conversation.id,
            response_time=response_time,
            references=references,
            created_at=datetime.now(timezone.utc)
        )
        db.add(assistant_message)
        db.commit()

        # 7. Retourner la réponse
        return ChatResponse(
            message=llm_response,
            conversation_id=str(conversation.id),
            references=assistant_message.references,
            created_at=datetime.now(timezone.utc)
        )

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/conversations", response_model=Conversation)
async def create_conversation(
    current_user: CurrentUser,
    db: DatabaseSession
):
    """Create a new conversation"""
    try:
        conversation = ConversationModel(
            user_id=current_user.id,
            title="Nouvelle conversation"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating conversation"
        )

@router.get(
    "/history/{conversation_id}",
    response_model=List[ChatMessage],
    status_code=status.HTTP_200_OK
)
async def get_chat_history(
    conversation_id: UUID,
    current_user: CurrentUser,
    db: DatabaseSession
):
    """Get the chat history for a specific conversation"""
    try:
        # Vérifier si la conversation existe et appartient à l'utilisateur
        conversation = db.query(ConversationModel).filter(
            ConversationModel.id == conversation_id,
            ConversationModel.user_id == current_user.id
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Récupérer tous les messages de la conversation
        messages = db.query(ChatMessageModel).filter(
            ChatMessageModel.conversation_id == conversation_id
        ).order_by(ChatMessageModel.created_at.asc()).all()
        
        # Convertir les messages en schéma de réponse
        return [
            ChatMessage(
                id=msg.id,
                content=msg.content,
                role=msg.role,
                response_time=msg.response_time or 0,
                created_at=msg.created_at,
                references=msg.references or []
            ) for msg in messages
        ]
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Error fetching chat history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching chat history"
        )

@router.get("/conversations", response_model=List[Conversation])
async def get_conversations(
    current_user: CurrentUser,
    db: DatabaseSession
):
    """Get all conversations for the current user"""
    try:
        conversations = (
            db.query(ConversationModel)
            .filter(ConversationModel.user_id == current_user.id)
            .order_by(ConversationModel.created_at.desc())
            .all()
        )
        return conversations
    except Exception as e:
        logger.error(f"Error fetching conversations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching conversations"
        )
