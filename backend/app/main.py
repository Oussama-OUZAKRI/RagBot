from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.documents import router as documents_router
from app.api.chat import router as chat_router
from app.api.dashboard import router as dashboard_router
from app.api.health import router as health_router
from app.db.init_db import init_db
from app.db.create_db import create_database_if_not_exists

@asynccontextmanager
async def lifespan(app: FastAPI):
  # Code à exécuter au démarrage
  create_database_if_not_exists()  # Crée la base si elle n'existe pas
  init_db()  # Initialise les tables
  yield

app = FastAPI(
  title="RAG-Automate",
  lifespan=lifespan
)

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
app.include_router(chat_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api/dashboard")
app.include_router(health_router, prefix="/api/health")
