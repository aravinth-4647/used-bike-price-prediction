from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from app.config import settings
from app.database import init_db
from app.api.predict import router as predict_router
from app.api.history import router as history_router
from app.api.train import router as train_router
from ml.predict import get_model_and_metadata

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables are created
    try:
        init_db()
    except Exception as e:
        print(f"Warning: Database initialization skipped: {e}")
        
    # Ensure ML model is loaded or trained
    try:
        get_model_and_metadata()
    except Exception as e:
        print(f"Warning: Model pre-load note: {e}")
        
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-ready Machine Learning API for Used Bike Price Prediction",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(predict_router, prefix=settings.API_V1_PREFIX)
app.include_router(history_router, prefix=settings.API_V1_PREFIX)
app.include_router(train_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root_endpoint():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_PREFIX
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Used Bike Price Prediction API",
        "environment": "production"
    }

# Export for Vercel serverless function
handler = app
