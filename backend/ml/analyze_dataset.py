"""
Dataset Analysis Tool for Used Bike Price Prediction
Fulfills all requirements:
1. Load dataset (CSV or Excel)
2. Display dataset shape
3. Display columns
4. Display data types
5. Detect missing values
6. Detect duplicate rows
7. Identify numerical columns
8. Identify categorical columns
9. Detect possible target/price column
"""

import sys
import os
from pathlib import Path
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure backend package can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from ml.dataset_loader import load_dataset, get_available_datasets

# Common target column candidates for bike price datasets
TARGET_CANDIDATES = [
    "price", "selling_price", "selling", "resale_price", "bike_price", 
    "cost", "amount", "value", "present_price", "ex_showroom_price",
    "target", "y"
]

def detect_target_column(df: pd.DataFrame) -> Optional[str]:
    """
    Detects the price/target column based on common naming patterns and data types.
    """
    cols_lower = {col.lower().replace(" ", "_"): col for col in df.columns}
    
    # 1. Exact or substring match in candidates
    for cand in TARGET_CANDIDATES:
        if cand in cols_lower:
            return cols_lower[cand]
            
    # 2. Check for columns containing 'price' or 'cost'
    for col_clean, original in cols_lower.items():
        if "price" in col_clean or "cost" in col_clean or "selling" in col_clean:
            return original

    # 3. Fallback: Check numerical column with highest variance or typical price range
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in numeric_cols:
        col_mean = df[col].mean()
        # Prices in used bikes are typically > 10,000 or have large mean
        if col_mean > 5000:
            return col

    return numeric_cols[-1] if numeric_cols else None

def analyze_dataset(file_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyzes the dataset and returns a comprehensive structured dictionary.
    """
    df, loaded_path = load_dataset(file_path)
    
    total_rows, total_cols = df.shape
    columns = list(df.columns)
    
    # Data types
    dtypes_dict = {col: str(df[col].dtype) for col in columns}
    
    # Missing values
    missing_counts = df.isnull().sum().to_dict()
    missing_percentages = ((df.isnull().sum() / total_rows) * 100).round(2).to_dict()
    total_missing_cells = int(df.isnull().sum().sum())
    
    # Duplicate rows
    duplicate_count = int(df.duplicated().sum())
    
    # Column types separation
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category", "string", "bool"]).columns.tolist()
    
    # Detect target column
    target_column = detect_target_column(df)
    
    # Target stats if found
    target_stats = {}
    if target_column and target_column in numerical_cols:
        target_series = df[target_column].dropna()
        target_stats = {
            "min": float(target_series.min()),
            "max": float(target_series.max()),
            "mean": round(float(target_series.mean()), 2),
            "median": round(float(target_series.median()), 2),
            "std": round(float(target_series.std()), 2)
        }
        
    # Categorical summary (unique counts and top categories)
    cat_summary = {}
    for col in categorical_cols:
        unique_vals = df[col].dropna().unique()
        cat_summary[col] = {
            "unique_count": int(len(unique_vals)),
            "sample_values": [str(x) for x in unique_vals[:8]]
        }
        
    # Numerical summary
    num_summary = {}
    for col in numerical_cols:
        num_summary[col] = {
            "min": float(df[col].min()) if not df[col].empty else 0,
            "max": float(df[col].max()) if not df[col].empty else 0,
            "mean": round(float(df[col].mean()), 2) if not df[col].empty else 0,
            "median": round(float(df[col].median()), 2) if not df[col].empty else 0
        }

    preview_rows = df.head(5).to_dict(orient="records")
    
    return {
        "filepath": loaded_path,
        "filename": Path(loaded_path).name,
        "shape": {"rows": total_rows, "columns": total_cols},
        "columns": columns,
        "data_types": dtypes_dict,
        "missing_values": {
            "counts": missing_counts,
            "percentages": missing_percentages,
            "total_missing_cells": total_missing_cells
        },
        "duplicate_rows": duplicate_count,
        "numerical_columns": numerical_cols,
        "categorical_columns": categorical_cols,
        "target_column": target_column,
        "target_stats": target_stats,
        "numerical_summary": num_summary,
        "categorical_summary": cat_summary,
        "preview": preview_rows
    }

def print_analysis(results: Dict[str, Any]):
    """
    Prints a formatted, modern CLI report of the dataset analysis.
    """
    sep = "=" * 70
    sub_sep = "-" * 70
    
    print(sep)
    print(" 🏍️  USED BIKE PRICE PREDICTION — DATASET ANALYSIS REPORT")
    print(sep)
    print(f"📁 Loaded File:       {results['filepath']}")
    print(f"📊 Dataset Shape:     {results['shape']['rows']} Rows × {results['shape']['columns']} Columns")
    print(f"⚠️ Duplicate Rows:    {results['duplicate_rows']}")
    print(f"❓ Missing Cells:     {results['missing_values']['total_missing_cells']}")
    print(f"🎯 Detected Target:   {results['target_column'] or 'NOT FOUND'}")
    
    if results["target_stats"]:
        ts = results["target_stats"]
        print(f"   ↳ Price Range:     ₹{ts['min']:,.0f} to ₹{ts['max']:,.0f} (Avg: ₹{ts['mean']:,.0f}, Median: ₹{ts['median']:,.0f})")
    print(sub_sep)
    
    print("\n📋 1. COLUMNS & DATA TYPES:")
    for col, dtype in results["data_types"].items():
        missing = results["missing_values"]["counts"].get(col, 0)
        miss_pct = results["missing_values"]["percentages"].get(col, 0)
        marker = "🎯 [TARGET]" if col == results["target_column"] else ("🔢 [NUM]" if col in results["numerical_columns"] else "🔤 [CAT]")
        print(f"  • {col:<22} | Type: {dtype:<8} | Missing: {missing:>3} ({miss_pct:.1f}%) | {marker}")
        
    print(f"\n🔢 2. NUMERICAL COLUMNS ({len(results['numerical_columns'])}):")
    for col in results["numerical_columns"]:
        ns = results["numerical_summary"].get(col, {})
        print(f"  • {col:<22} -> Min: {ns.get('min', 0):>8.1f} | Max: {ns.get('max', 0):>10.1f} | Avg: {ns.get('mean', 0):>8.1f}")

    print(f"\n🔤 3. CATEGORICAL COLUMNS ({len(results['categorical_columns'])}):")
    for col in results["categorical_columns"]:
        cs = results["categorical_summary"].get(col, {})
        samples = ", ".join(cs.get("sample_values", []))
        print(f"  • {col:<22} -> ({cs.get('unique_count', 0)} unique): {samples}...")

    print(f"\n🔍 4. SAMPLE PREVIEW (First 2 Rows):")
    for idx, row in enumerate(results["preview"][:2], 1):
        print(f"  Row {idx}: {row}")

    print(f"\n{sep}")
    print("✅ Analysis Complete! Dataset is ready for automated model training.")
    print(f"{sep}\n")

if __name__ == "__main__":
    try:
        custom_path = sys.argv[1] if len(sys.argv) > 1 else None
        analysis = analyze_dataset(custom_path)
        print_analysis(analysis)
    except Exception as e:
        print(f"\n❌ Error during dataset analysis: {str(e)}\n")
        sys.exit(1)
