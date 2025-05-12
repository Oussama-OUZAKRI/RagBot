from typing import Annotated
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from google.cloud import storage
from sqlalchemy.orm import Session
import uuid
from pathlib import Path

from app.services.AuthService import get_current_active_user
from backend.app.services.VectorStore import VectorStoreService
from app.services.embedding import get_embeddings
from app.utils.file_parser import parse_pdf, parse_docx, parse_txt
from app.utils.text_processing import chunk_text
from app.models.document import Document
from app.models.user import User
from app.db.base import get_db
from app.schemas.document import DocumentResponse
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])

# Configuration GCS
storage_client = storage.Client.from_service_account_json(settings.GCP_SERVICE_ACCOUNT_PATH)
bucket_name = settings.GCP_STORAGE_BUCKET_NAME

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

def upload_to_gcs(file_content: bytes, destination_blob_name: str, content_type: str) -> str:
  """Upload file to Google Cloud Storage"""
  bucket = storage_client.bucket(bucket_name)
  blob = bucket.blob(destination_blob_name)
  
  blob.upload_from_string(
    file_content,
    content_type=content_type
  )
  
  return f"gs://{bucket_name}/{destination_blob_name}"

@router.post(
  "/upload",
  response_model=DocumentResponse,
  status_code=status.HTTP_201_CREATED,
  responses={
    400: {"description": "Unsupported file type"},
    413: {"description": "File too large"},
    500: {"description": "Internal server error"}
  }
)
async def upload_file(
  current_user: CurrentUser,
  db: DatabaseSession,
  file: UploadFile = File(...)
):
  """Upload and process documents (PDF, DOCX, TXT) for RAG pipeline"""
  # Validate file type
  if file.content_type not in ALLOWED_MIME_TYPES:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail=f"Unsupported file type. Supported types: {', '.join(ALLOWED_MIME_TYPES)}"
    )

  try:
    file_content = await file.read()
    
    # Generate unique filename with original extension
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"documents/{current_user.id}/{uuid.uuid4()}{file_ext}"
    
    # 1. Upload original file to GCS
    gcs_uri = upload_to_gcs(file_content, unique_filename, file.content_type)
    
    # 2. Parse content based on file type
    parse_func = FILE_PARSERS[file.content_type]
    text = parse_func(file_content)
    
    # 3. Process text
    chunks = chunk_text(text, chunk_size=512, overlap=64)
    embeddings = get_embeddings().encode_documents(chunks)
    
    # 4. Store in vector database
    vector_store = VectorStoreService()
    doc_id = vector_store.add_documents(chunks, embeddings)
    
    # 5. Save metadata in database
    db_doc = Document(
      user_id=current_user.id,
      original_filename=file.filename,
      gcs_uri=gcs_uri,
      content_preview=text[:5000],
      vector_id=doc_id,
      file_size=len(file_content),
      file_type=file.content_type,
      file_extension=file_ext
    )
    
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    return {
      "message": "Document processed and stored successfully",
      "document_id": db_doc.id,
      "gcs_uri": gcs_uri,
      "vector_id": doc_id,
      "file_type": file.content_type
    }
      
  except Exception as e:
    db.rollback()
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Error processing document: {str(e)}"
    )