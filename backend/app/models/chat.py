from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.base import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    role = Column(String, nullable=False)
    response_time = Column(Float)  # temps de réponse en secondes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    references = Column(JSON)
    
    # Foreign keys
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relations
    conversation = relationship("Conversation", back_populates="messages")
    user = relationship("User", back_populates="messages")
