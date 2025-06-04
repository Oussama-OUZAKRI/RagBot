from sqlalchemy import Column, DateTime, String, Integer, Text, ForeignKey

from app.db.base import Base

class Document(Base):
  __tablename__ = "documents"
  
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"))
  original_filename = Column(String(255))
  storage_url = Column(String(500))
  vector_id = Column(String(255))
  file_size = Column(Integer)
  file_type = Column(String(100))
  file_extension = Column(String(10))
  status = Column(String(20), default="processing", nullable=True)  # processing, indexed, error
  type = Column(String(20))  # pdf, docx, txt, etc.
  created_at = Column(DateTime, nullable=False)
  updated_at = Column(DateTime, nullable=False)