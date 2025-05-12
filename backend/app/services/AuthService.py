from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import get_db
from app.models.user import User as DBUser

class AuthService:
  @staticmethod
  def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe correspond au hash"""
    return settings.PWD_CONTEXT.verify(plain_password, hashed_password)

  @staticmethod
  def get_password_hash(password: str) -> str:
    """Génère un hash sécurisé du mot de passe"""
    return settings.PWD_CONTEXT.hash(password)

  @staticmethod
  def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crée un JWT token avec une date d'expiration"""
    to_encode = data.copy()
    if expires_delta:
      expire = datetime.now(timezone.utc) + expires_delta
    else:
      expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(
      to_encode,
      settings.SECRET_KEY,
      algorithm=settings.ALGORITHM
    )

  @classmethod
  async def get_current_user(
    cls,
    request: Request,
    token: Annotated[str, Depends(settings.OAUTH2_SCHEME)],
    db: Session = Depends(get_db)
  ) -> DBUser:
    """Récupère l'utilisateur courant à partir du token JWT"""
    credentials_exception = HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Could not validate credentials",
      headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
      payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM]
      )
      username: str = payload.get("sub")
      if username is None:
        raise credentials_exception
      
      # Vérification supplémentaire du rôle si nécessaire
      role = payload.get("role")
      if role not in ["admin", "user"]:  # Adaptez selon vos besoins
        raise credentials_exception
            
    except JWTError as e:
      raise credentials_exception from e

    user = db.query(DBUser).filter(DBUser.username == username).first()
    if user is None:
      raise credentials_exception
        
    request.state.user = user
    return user

  @classmethod
  async def get_current_active_user(
    cls,
    current_user: Annotated[DBUser, Depends(get_current_user)]
  ) -> DBUser:
    """Vérifie que l'utilisateur est actif"""
    if not current_user.is_active:
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Inactive user"
      )
    return current_user
  