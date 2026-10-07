import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Used Bike Price Prediction API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Database configuration - Neon PostgreSQL compatible
    # Fallback to local SQLite when DATABASE_URL is not set
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'bike_prediction.db'}"
    )
    
    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "*",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ]
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
