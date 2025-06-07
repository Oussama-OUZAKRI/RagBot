from typing import Optional
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
  access_token: str
  token_type: str
  expires_in: int

class User(BaseModel):
  username: str
  email: EmailStr = None
  role: Optional[str] = "user"
  is_active: Optional[bool] = True

class UserCreate(BaseModel):
  username: str
  email: EmailStr
  password: str
  role: Optional[str] = "user" # 'admin' or 'user'
