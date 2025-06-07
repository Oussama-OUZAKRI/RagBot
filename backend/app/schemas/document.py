from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

class DocumentBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    visibility: str = "private"

class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    original_filename: str
    storage_url: Optional[str] = None
    vector_id: str
    file_size: int
    file_type: str
    file_extension: str
    status: str
    type: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        
class DocumentUploadResponse(BaseModel):
    success: bool
    message: str
    document: Optional[DocumentResponse] = None
    error: Optional[str] = None
    status_code: Optional[int] = None
    filename: Optional[str] = None  # Ajout du champ filename manquant

    class Config:
        from_attributes = True
