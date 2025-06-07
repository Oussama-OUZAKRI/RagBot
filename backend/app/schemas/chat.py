from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class MessageBase(BaseModel):
  content: str
  role: str = "user"

class Message(MessageBase):
  id: int
  created_at: datetime
  references: Optional[List[dict]] = None
    
  class Config:
    from_attributes = True

class ChatRequest(BaseModel):
  message: str
  document_ids: Optional[List[int]] = None
  conversation_id: Optional[str] = None
  model_settings: Optional[Dict[str, Any]] = {
    "num_chunks": 3,
    "similarity_threshold": 0.7,
    "model": "gpt-4",
    "temperature": 0.7
  }

class ChatResponse(BaseModel):
  message: str
  conversation_id: str
  references: Optional[List[dict]] = None
  created_at: datetime

class ChatMessage(BaseModel):
  id: int
  content: str
  role: str
  response_time: float
  created_at: datetime
  references: Optional[List[dict]] = None

  class Config:
    from_attributes = True
