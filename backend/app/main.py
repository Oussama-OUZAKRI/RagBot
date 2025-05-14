# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.documents import router as documents_router
from app.db.init_db import init_db

app = FastAPI(title="RAG-Automate")

init_db()

# CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
