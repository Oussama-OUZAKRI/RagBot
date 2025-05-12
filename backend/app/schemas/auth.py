from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
  access_token: str
  token_type: str
  expires_in: int

class User(BaseModel):
  username: str
  email: Optional[str] = None
  full_name: Optional[str] = None
  role: Optional[str] = "user"
  is_active: Optional[bool] = True

class UserCreate(BaseModel):
  username: str
  email: str
  password: str
  full_name: Optional[str] = None
