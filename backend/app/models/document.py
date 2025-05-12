from sqlalchemy import Column, String, Integer, Text

from app.db.base import Base

class Document(Base):
  __tablename__ = "documents"
  
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"))
  original_filename = Column(String(255))
  gcs_uri = Column(String(500))
  content_preview = Column(Text)
  vector_id = Column(String(255))
  file_size = Column(Integer)
  file_type = Column(String(100))
  file_extension = Column(String(10))