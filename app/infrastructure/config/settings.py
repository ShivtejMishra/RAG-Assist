import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Configurations
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    # Security & JWT Token Configurations
    JWT_SECRET_KEY: str = "9a7c36a4ebdfd2a02b1f868c2cfb37b60e9d6d34e2abcb2df721867c4df60e2a"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Databases (MongoDB Atlas & Qdrant)
    MONGODB_URI: str = "mongodb://localhost:27017/"
    MONGODB_DB_NAME: str = "ragassist_enterprise"
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None

    # Google Gemini API Key
    GEMINI_API_KEY: str = ""

    # Task Queue Celery & Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    USE_CELERY: bool = False

    # AWS configuration (for document uploads)
    # If left blank, files are stored on local workspace disk in 'uploads/' directory
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET_NAME: Optional[str] = None
    AWS_REGION: str = "us-east-1"

    # General configuration
    UPLOAD_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), 
        "uploads"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

# Singleton configuration instance
settings = Settings()

# Ensure local upload dir exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
