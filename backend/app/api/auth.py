from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Annotated

from app.models.user import User as DBUser
from app.db.base import get_db
from app.core.config import settings
from app.schemas.auth import Token, User, UserCreate
from app.services.AuthService import AuthService

router = APIRouter(tags=["Authentication"])

# Routes d'authentification
@router.post("/login", response_model=Token)
async def login_for_access_token(
  request: Request,
  form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
  db: Session = Depends(get_db)
):
  user = db.query(DBUser).filter(DBUser.username == form_data.username).first()
  
  if not user or not AuthService.verify_password(form_data.password, user.hashed_password):
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Incorrect username or password",
      headers={"WWW-Authenticate": "Bearer"},
    )
  
  access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
  access_token = AuthService.create_access_token(
    data={"sub": user.username, "role": user.role}
  )
  
  return {
    "access_token": access_token,
    "token_type": "bearer",
    "expires_in": access_token_expires.total_seconds()
  }

@router.post("/register", response_model=User)
async def register_user(
  user_data: UserCreate,
  db: Session = Depends(get_db)
):
  # Vérifier si l'utilisateur existe déjà
  existing_user = db.query(DBUser).filter(DBUser.username == user_data.username).first()
  if existing_user:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Username already registered"
    )
  
  # Créer le nouvel utilisateur
  new_user = DBUser(
    username=user_data.username,
    email=user_data.email,
    hashed_password=AuthService.get_password_hash(user_data.password),
    full_name=user_data.full_name,
    is_active=True,
    role="user"  # Par défaut, tous les nouveaux utilisateurs sont 'user'
  )
  
  db.add(new_user)
  db.commit()
  db.refresh(new_user)
  
  return new_user

@router.get("/me", response_model=User)
async def read_users_me(
  current_user: Annotated[DBUser, Depends(AuthService.get_current_active_user)]
):
  return current_user