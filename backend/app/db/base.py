from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.core.config import settings

# Déclaration de la base pour les modèles
Base = declarative_base()

# Configuration de la session SQLAlchemy
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
  """Générateur de sessions de base de données"""
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()