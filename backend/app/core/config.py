from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

class Settings:
  # Configuration JWT
  SECRET_KEY: str = "986c16692d38abb0ca5627188756dbdcc628f695fbbc2beda5bb86e8884cebd06ef3f5290a42271285f2da7e6430dc29063ac04eff77b03c3d0ea2c8212836fd51823932f25c159cb8abcea5e926b96e39c969993dba8e75b6e516aaac935c8a1541d8ac2138366ea57605ea306b65a844261c0fbd7e5aa9aaeed2a9991a58eb061f99828a31592ab862c05679c27161ff039abe59919672a5a7f477397b2b5e5d2105c4dc878a2f72031f0f55bf75ad6c47976e31ea507a5b70b4475965e4c1de7dcc10fa4248180284daa2ed2c2a8565f432bef7cc33dca9f785b705b0d292852c668ef0559f17733b9fe5f520360e12c01dcb2875fb86caca179e99d6d8da"
  ALGORITHM: str = "HS256"
  ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

  # Configuration Auth
  PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
  OAUTH2_SCHEME = OAuth2PasswordBearer(
    tokenUrl="api/auth/token",
    scheme_name="JWT"
  )

  # Configuration Google Cloud Storage
  GCP_SERVICE_ACCOUNT_PATH: str = "path/to/your/service-account.json"
  GCP_STORAGE_BUCKET_NAME: str = "your-bucket-name"

  # Configuration de la base de données
  DATABASE_URL: str = "postgresql+psycopg2://postgres:toor@localhost/auth_db"
  
  # Rôles autorisés
  ALLOWED_ROLES: list[str] = ["admin", "user"]

settings = Settings()