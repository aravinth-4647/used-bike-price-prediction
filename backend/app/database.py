import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
from app.config import settings

logger = logging.getLogger("uvicorn.error")

def get_database_url() -> str:
    url = settings.DATABASE_URL
    if not url:
        return ""
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url

db_url = get_database_url()

engine = None
SessionLocal = None
Base = declarative_base()

if db_url:
    if db_url.startswith("sqlite"):
        engine = create_engine(
            db_url,
            connect_args={"check_same_thread": False}
        )
    else:
        # Serverless PostgreSQL connection handling
        engine = create_engine(
            db_url,
            poolclass=NullPool,
            pool_pre_ping=True
        )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """FastAPI dependency for yielding database session."""
    if SessionLocal is None:
        yield None
        return
        
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables in database if engine exists."""
    if engine is not None:
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as e:
            logger.warning(f"Database table initialization warning: {e}")
