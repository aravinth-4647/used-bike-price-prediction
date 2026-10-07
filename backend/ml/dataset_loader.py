import os
import glob
from pathlib import Path
from typing import Tuple, Optional, List, Dict, Any
import pandas as pd

# Default dataset directory
DATASET_DIR = Path(__file__).resolve().parent.parent.parent / "dataset"

def get_available_datasets(dataset_dir: Optional[Path] = None) -> List[Dict[str, Any]]:
    """
    Scans the dataset directory for available CSV and Excel files.
    """
    target_dir = Path(dataset_dir) if dataset_dir else DATASET_DIR
    if not target_dir.exists():
        return []

    supported_extensions = [".csv", ".xlsx", ".xls"]
    files = []
    
    for ext in supported_extensions:
        for file_path in target_dir.glob(f"*{ext}"):
            if not file_path.name.startswith("~$"): # Skip Excel temp lock files
                stat = file_path.stat()
                files.append({
                    "filename": file_path.name,
                    "filepath": str(file_path),
                    "extension": file_path.suffix.lower(),
                    "size_kb": round(stat.st_size / 1024, 2),
                    "modified_time": stat.st_mtime
                })
                
    # Sort by modification time (most recent first)
    files.sort(key=lambda x: x["modified_time"], reverse=True)
    return files

def load_dataset(file_path: Optional[str] = None, dataset_dir: Optional[Path] = None) -> Tuple[pd.DataFrame, str]:
    """
    Loads dataset from CSV or Excel file.
    If no file_path is given, automatically picks the primary/newest dataset in dataset/.
    """
    target_dir = Path(dataset_dir) if dataset_dir else DATASET_DIR
    
    if file_path and os.path.exists(file_path):
        chosen_path = Path(file_path)
    else:
        available = get_available_datasets(target_dir)
        if not available:
            raise FileNotFoundError(
                f"No dataset (.csv, .xlsx, .xls) found in '{target_dir}'. "
                f"Please place your dataset file inside the dataset folder."
            )
        chosen_path = Path(available[0]["filepath"])

    ext = chosen_path.suffix.lower()
    
    if ext == ".csv":
        # Handle various encodings if needed
        try:
            df = pd.read_csv(chosen_path)
        except UnicodeDecodeError:
            df = pd.read_csv(chosen_path, encoding="latin1")
    elif ext in [".xlsx", ".xls"]:
        try:
            df = pd.read_excel(chosen_path)
        except ImportError:
            raise ImportError("openpyxl is required to read Excel files. Please install openpyxl.")
    else:
        raise ValueError(f"Unsupported dataset format: {ext}. Use .csv, .xlsx, or .xls.")

    # Strip column name whitespaces
    df.columns = [str(col).strip() for col in df.columns]
    
    return df, str(chosen_path)
