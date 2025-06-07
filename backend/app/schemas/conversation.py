from uuid import UUID
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from app.schemas.chat import Message

class Conversation(BaseModel):
    id: UUID
    user_id: int
    title: str
    messages: List[Message] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None 

    class Config:
        from_attributes = True
