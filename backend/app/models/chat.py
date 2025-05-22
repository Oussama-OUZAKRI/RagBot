from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from ..db.base import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    role = Column(String, nullable=False)
    response_time = Column(Float)  # temps de réponse en secondes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    references = Column(JSON)
