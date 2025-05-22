from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MessageBase(BaseModel):
  content: str
  role: str = "user"

class MessageCreate(MessageBase):
  pass

class Message(MessageBase):
  id: int
  timestamp: datetime
  references: Optional[List[dict]] = None
  
class Config:
    from_attributes = True

class ChatRequest(BaseModel):
  message: str
  document_ids: Optional[List[int]] = None
  conversation_id: Optional[str] = None
  model_settings: Optional[dict] = None

class ChatResponse(BaseModel):
  message: str
  conversation_id: str
  references: Optional[List[dict]] = None
  created_at: datetime

class ChatMessage(BaseModel):
    id: int
    content: str
    role: str
    response_time: float  # temps de réponse en secondes
    created_at: datetime
    references: Optional[List[dict]] = None
    
    class Config:
        from_attributes = True
