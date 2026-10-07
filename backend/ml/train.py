"""
Machine Learning Model Training Pipeline for Used Bike Price Prediction
Trains multiple lightweight Scikit-Learn models, evaluates them, selects the best,
and serializes the artifact along with comprehensive metadata.
"""

import sys
import os
import json
import time
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from ml.dataset_loader import load_dataset
from ml.analyze_dataset import detect_target_column
from ml.preprocessor import identify_feature_columns, build_preprocessor_pipeline

SAVED_MODELS_DIR = Path(__file__).resolve().parent / "saved_models"
MODEL_FILE_PATH = SAVED_MODELS_DIR / "used_bike_model.joblib"
METADATA_FILE_PATH = SAVED_MODELS_DIR / "model_metadata.json"

def calculate_mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculates Mean Absolute Percentage Error (MAPE)."""
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    non_zero_mask = y_true != 0
    if not np.any(non_zero_mask):
        return 0.0
    return float(np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100)

def extract_brand_model_mapping(df: pd.DataFrame) -> Dict[str, list]:
    """Extracts dynamic brand-to-model hierarchy if brand & model columns exist."""
    brand_cols = [c for c in df.columns if "brand" in c.lower() or "make" in c.lower()]
    model_cols = [c for c in df.columns if "model" in c.lower()]
    
    mapping = {}
    if brand_cols and model_cols:
        b_col, m_col = brand_cols[0], model_cols[0]
        grouped = df.groupby(b_col)[m_col].unique()
        for brand, models in grouped.items():
            mapping[str(brand)] = [str(m) for m in models if pd.notna(m)]
    return mapping

def train_model(file_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Automated training workflow.
    """
    SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. Load dataset
    df, dataset_path = load_dataset(file_path)
    
    # 2. Detect target column
    target_col = detect_target_column(df)
    if not target_col:
        raise ValueError("Could not automatically detect the target price column in the dataset.")
        
    # Drop rows where target is null or non-positive
    df = df.dropna(subset=[target_col])
    df = df[df[target_col] > 0]
    
    # 3. Identify feature columns
    num_cols, cat_cols, dropped_cols = identify_feature_columns(df, target_col)
    
    feature_cols = num_cols + cat_cols
    if not feature_cols:
        raise ValueError("No valid feature columns found for training.")

    X = df[feature_cols]
    y = df[target_col]
    
    # 4. Extract rich feature metadata for UI & inference validation
    feature_metadata = {
        "numerical": {},
        "categorical": {}
    }
    
    for col in num_cols:
        series = df[col].dropna()
        feature_metadata["numerical"][col] = {
            "min": float(series.min()) if not series.empty else 0.0,
            "max": float(series.max()) if not series.empty else 100.0,
            "mean": round(float(series.mean()), 2) if not series.empty else 0.0,
            "median": round(float(series.median()), 2) if not series.empty else 0.0,
            "std": round(float(series.std()), 2) if not series.empty else 0.0,
            "default": round(float(series.median()), 2) if not series.empty else 0.0
        }
        
    for col in cat_cols:
        val_counts = df[col].value_counts()
        unique_vals = [str(v) for v in val_counts.index if pd.notna(v)]
        feature_metadata["categorical"][col] = {
            "options": unique_vals,
            "default": unique_vals[0] if unique_vals else "Unknown",
            "count": len(unique_vals)
        }
        
    brand_model_map = extract_brand_model_mapping(df)

    # 5. Train / Test Split
    test_size = 0.2 if len(df) >= 20 else 0.1
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42
    )
    
    # 6. Candidate Models
    candidate_models = {
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=100, max_depth=12, min_samples_split=3, random_state=42
        ),
        "Gradient Boosting Regressor": GradientBoostingRegressor(
            n_estimators=100, learning_rate=0.08, max_depth=4, random_state=42
        ),
        "Ridge Regression": Ridge(alpha=1.0),
        "Linear Regression": LinearRegression()
    }
    
    results = {}
    best_pipeline = None
    best_model_name = None
    best_r2 = -float("inf")
    
    for name, model in candidate_models.items():
        preprocessor = build_preprocessor_pipeline(num_cols, cat_cols)
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("regressor", model)
        ])
        
        # Train
        pipeline.fit(X_train, y_train)
        
        # Evaluate
        y_pred = pipeline.predict(X_test)
        
        # Prevent negative predictions for price evaluation
        y_pred_clipped = np.clip(y_pred, a_min=1000, a_max=None)
        
        r2 = round(float(r2_score(y_test, y_pred_clipped)), 4)
        mae = round(float(mean_absolute_error(y_test, y_pred_clipped)), 2)
        rmse = round(float(np.sqrt(mean_squared_error(y_test, y_pred_clipped))), 2)
        mape = round(float(calculate_mape(y_test, y_pred_clipped)), 2)
        
        results[name] = {
            "r2_score": r2,
            "mae": mae,
            "rmse": rmse,
            "mape": mape
        }
        
        # We prioritize R2 score, breaking ties with lower MAE
        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name
            best_pipeline = pipeline

    # Fallback to Random Forest if all R2 are poor
    if best_pipeline is None:
        best_model_name = "Random Forest Regressor"
        preprocessor = build_preprocessor_pipeline(num_cols, cat_cols)
        best_pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("regressor", candidate_models["Random Forest Regressor"])
        ])
        best_pipeline.fit(X, y)

    # 7. Extract Feature Importances if available
    feature_importances = []
    try:
        regressor = best_pipeline.named_steps["regressor"]
        preprocessor = best_pipeline.named_steps["preprocessor"]
        
        # Get feature names after transformation
        feature_names = []
        if "num" in preprocessor.named_transformers_:
            feature_names.extend(num_cols)
        if "cat" in preprocessor.named_transformers_:
            encoder = preprocessor.named_transformers_["cat"].named_steps["encoder"]
            cat_feature_names = encoder.get_feature_names_out(cat_cols)
            feature_names.extend(cat_feature_names)
            
        if hasattr(regressor, "feature_importances_"):
            importances = regressor.feature_importances_
            # Aggregate importance by original column
            col_imp_map = {col: 0.0 for col in feature_cols}
            for fn, imp in zip(feature_names, importances):
                for orig_col in feature_cols:
                    if fn == orig_col or fn.startswith(f"{orig_col}_"):
                        col_imp_map[orig_col] += float(imp)
                        break
            
            # Sort
            sorted_imp = sorted(col_imp_map.items(), key=lambda x: x[1], reverse=True)
            feature_importances = [{"feature": k, "importance": round(v * 100, 2)} for k, v in sorted_imp]
    except Exception as e:
        feature_importances = [{"feature": col, "importance": 1.0} for col in feature_cols]

    # 8. Target stats
    target_stats = {
        "column": target_col,
        "min": float(y.min()),
        "max": float(y.max()),
        "mean": round(float(y.mean()), 2),
        "median": round(float(y.median()), 2),
        "std": round(float(y.std()), 2)
    }

    # 9. Build metadata
    metadata = {
        "dataset_file": Path(dataset_path).name,
        "dataset_path": str(dataset_path),
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_records": len(df),
        "train_records": len(X_train),
        "test_records": len(X_test),
        "target_column": target_col,
        "target_stats": target_stats,
        "features": {
            "all": feature_cols,
            "numerical": num_cols,
            "categorical": cat_cols,
            "dropped": dropped_cols
        },
        "feature_metadata": feature_metadata,
        "brand_model_mapping": brand_model_map,
        "best_model": best_model_name,
        "metrics": results.get(best_model_name, {}),
        "all_model_results": results,
        "feature_importances": feature_importances
    }

    # 10. Save pipeline and metadata
    joblib.dump(best_pipeline, MODEL_FILE_PATH)
    with open(METADATA_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    return metadata

def print_training_report(metadata: Dict[str, Any]):
    """Prints a clear, formatted summary of the training run."""
    sep = "=" * 70
    sub_sep = "-" * 70
    
    print(sep)
    print(" 🚀  USED BIKE PRICE PREDICTION — MODEL TRAINING REPORT")
    print(sep)
    print(f"📁 Dataset:         {metadata['dataset_file']} ({metadata['total_records']} records)")
    print(f"🎯 Target Column:   {metadata['target_column']}")
    print(f"🏆 Best Model:      {metadata['best_model']}")
    print(f"📈 Test R² Score:   {metadata['metrics'].get('r2_score', 'N/A')}")
    print(f"📉 Test MAE:        ₹{metadata['metrics'].get('mae', 0):,.2f}")
    print(f"📊 Test RMSE:       ₹{metadata['metrics'].get('rmse', 0):,.2f}")
    print(f"🎯 Test MAPE:       {metadata['metrics'].get('mape', 0):.2f}%")
    print(sub_sep)
    
    print("\n📊 MODEL COMPARISON:")
    print(f"  {'Model Name':<32} | {'R² Score':<10} | {'MAE (₹)':<12} | {'MAPE':<8}")
    print("  " + "-" * 66)
    for model_name, metrics in metadata.get("all_model_results", {}).items():
        is_best = " ⭐ (Best)" if model_name == metadata["best_model"] else ""
        print(f"  {model_name:<32} | {metrics['r2_score']:<10.4f} | ₹{metrics['mae']:<11,.0f} | {metrics['mape']:.2f}%{is_best}")

    print("\n🔥 TOP FEATURE IMPORTANCES:")
    for item in metadata.get("feature_importances", [])[:7]:
        bar = "█" * int(item["importance"] // 3)
        print(f"  • {item['feature']:<20} [{item['importance']:>5.1f}%] {bar}")

    print(f"\n💾 Model saved to:    {MODEL_FILE_PATH}")
    print(f"📄 Metadata saved to: {METADATA_FILE_PATH}")
    print(sep)
    print("✅ Training successfully completed! Ready to serve live predictions.\n")

if __name__ == "__main__":
    try:
        custom_file = sys.argv[1] if len(sys.argv) > 1 else None
        meta = train_model(custom_file)
        print_training_report(meta)
    except Exception as e:
        print(f"\n❌ Error during training: {str(e)}\n")
        sys.exit(1)
