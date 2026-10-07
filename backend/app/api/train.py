import shutil
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, Dict, Any

from ml.dataset_loader import get_available_datasets, DATASET_DIR
from ml.analyze_dataset import analyze_dataset
from ml.train import train_model
from ml.predict import reload_model

router = APIRouter(prefix="/training", tags=["Model Training & Datasets"])

@router.get("/datasets")
def list_datasets_endpoint():
    """
    Lists all available datasets in the dataset/ directory.
    """
    try:
        datasets = get_available_datasets()
        return {
            "datasets_directory": str(DATASET_DIR),
            "total_files": len(datasets),
            "files": datasets
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan datasets: {str(e)}")

@router.get("/analyze")
def analyze_dataset_endpoint(filename: Optional[str] = None):
    """
    Performs full exploratory dataset analysis on the active or specified dataset.
    """
    try:
        target_path = None
        if filename:
            file_path = DATASET_DIR / filename
            if file_path.exists():
                target_path = str(file_path)
            else:
                raise HTTPException(status_code=404, detail=f"Dataset file '{filename}' not found.")
                
        analysis = analyze_dataset(target_path)
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze dataset: {str(e)}")

@router.post("/train")
def train_model_endpoint(filename: Optional[str] = None):
    """
    Triggers automated training pipeline on the selected dataset file, benchmarks models,
    and hot-reloads the active prediction engine.
    """
    try:
        target_path = None
        if filename:
            file_path = DATASET_DIR / filename
            if file_path.exists():
                target_path = str(file_path)
            else:
                raise HTTPException(status_code=404, detail=f"Dataset file '{filename}' not found.")
                
        # Run training
        metadata = train_model(target_path)
        
        # Hot-reload in-memory predictor
        reload_model()
        
        return {
            "success": True,
            "message": "Model trained and reloaded successfully!",
            "best_model": metadata.get("best_model"),
            "metrics": metadata.get("metrics"),
            "dataset_file": metadata.get("dataset_file"),
            "records_count": metadata.get("total_records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.post("/upload")
async def upload_dataset_endpoint(file: UploadFile = File(...)):
    """
    Uploads a new CSV or Excel dataset to the dataset/ directory.
    """
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(status_code=400, detail="Only .csv, .xlsx, and .xls files are supported.")
        
    save_path = DATASET_DIR / file.filename
    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "success": True,
            "filename": file.filename,
            "filepath": str(save_path),
            "size_kb": round(save_path.stat().st_size / 1024, 2),
            "message": f"Successfully uploaded {file.filename}. You can now analyze and train on this dataset."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")
