from datetime import datetime, timezone
from typing import Annotated, List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import uuid
from pathlib import Path
import logging

from app.dependencies import get_current_active_user
from app.services.RagService import rag_service
from app.services.EmbeddingService import get_embedding_service
from app.services.SupabaseStorage import SupabaseStorageService
from app.utils.file_parser import parse_pdf, parse_docx, parse_txt
from app.utils.text_processing import create_semantic_chunks
from app.models.document import Document
from app.models.user import User
from app.db.base import get_db
from app.schemas.document import DocumentUploadResponse, DocumentResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])

# Dependencies
DatabaseSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_active_user)]

# Mappage des types MIME aux parseurs
FILE_PARSERS = {
  'application/pdf': parse_pdf,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': parse_docx,
  'text/plain': parse_txt
}

# Types MIME autorisés
ALLOWED_MIME_TYPES = list(FILE_PARSERS.keys())

@router.post(
  "/",
  response_model=List[DocumentUploadResponse],
  status_code=status.HTTP_207_MULTI_STATUS
)
async def upload_files(
  current_user: CurrentUser,
  db: DatabaseSession,
  files: List[UploadFile] = File(...)
):
  """Upload and process documents (PDF, DOCX, TXT) for RAG pipeline"""
  results = []
  max_size = 10 * 1024 * 1024  # 10MB

  for file in files :
    try:
      # Validate file type
      if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
          status_code=400,
          detail=f"Unsupported file type: {file.content_type}"
        )

      # Validate file size
      if file.size > max_size:
        raise HTTPException(
          status_code=413,
          detail=f"File too large. Max size: {max_size} bytes"
        )
      
      file_content = await file.read()
      
      # Generate unique filename with original extension
      file_ext = Path(file.filename).suffix.lower()
      if file_ext : unique_filename = f"documents/{current_user.id}/{uuid.uuid4()}{file_ext}"
      
      # 1. Upload vers Supabase Storage
      file_url = "None"
      """ file_url = SupabaseStorageService.upload_file(
        file_content=file_content,
        file_path=f"documents/{current_user.id}/{uuid.uuid4()}{file_ext}",
        content_type=file.content_type
      ) """
      
      # 2. Parse content based on file type
      parse_func = FILE_PARSERS[file.content_type]
      parsed_document = parse_func(file_content)
      
      # 3. Process text
      chunks = create_semantic_chunks(parsed_document.get('text'))
      embeddings = get_embedding_service().get_embeddings(chunks)
      
      # 4. Store in vector database
      doc_id = rag_service.process_document(parsed_document, embeddings)
      
      # 5. Save metadata in database
      db_doc = Document(
        user_id=current_user.id,
        original_filename=file.filename,
        storage_url=file_url,
        vector_id=doc_id,
        file_size=len(file_content),
        file_type=file.content_type,
        file_extension=file_ext,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
      )
      
      db.add(db_doc)
      db.commit()
      db.refresh(db_doc)

      results.append(DocumentUploadResponse(
        success=True,
        message=f"Document {file.filename} processed successfully",
        document=DocumentResponse(
          id=db_doc.id,
          user_id=current_user.id,
          original_filename=file.filename,
          storage_url=file_url,
          vector_id=doc_id,
          file_size=len(file_content),
          file_type=file.content_type,
          file_extension=file_ext,
          created_at=db_doc.created_at,
          updated_at=db_doc.updated_at
        )
      ))

    except HTTPException as http_exc:
      db.rollback()
      results.append(DocumentUploadResponse(
        success=False,
        message="Processing failed",
        error=http_exc.detail,
        status_code=http_exc.status_code,
        filename=file.filename
      ))
      logger.warning(f"File processing failed: {file.filename} - {http_exc.detail}")

    except SQLAlchemyError as db_exc:
      db.rollback()
      logger.error(f"Database error: {str(db_exc)}")
      results.append(DocumentUploadResponse(
        success=False,
        message="Database operation failed",
        error=db_exc.detail,
        status_code=db_exc.status_code,
        filename=file.filename
      ))

    except Exception as e:
      db.rollback()
      logger.error(f"Unexpected error: {str(e)}", exc_info=True)
      results.append(DocumentUploadResponse(
        success=False,
        message="Internal server error",
        error=str(e),
        status_code=500,
        filename=file.filename
      ))

  return results

@router.get(
  "/",
  response_model=List[DocumentResponse],
  status_code=status.HTTP_200_OK
)
async def get_documents(
  current_user: CurrentUser,
  db: DatabaseSession
):
  """Retrieve all processed documents for the current user"""
  documents = db.query(Document).filter(Document.user_id == current_user.id).all()
  return documents