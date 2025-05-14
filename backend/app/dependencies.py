from fastapi import Depends, Request
from sqlalchemy.orm import Session
from typing import Annotated

from app.db.base import get_db
from app.models.user import User as DBUser
from app.services.AuthService import AuthService
from app.core.security import oauth2_scheme

async def get_current_user(
    request: Request,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
) -> DBUser:
    return await AuthService.get_current_user(request, token, db)

async def get_current_active_user(
    current_user: Annotated[DBUser, Depends(get_current_user)]
) -> DBUser:
    return await AuthService.get_current_active_user(current_user)