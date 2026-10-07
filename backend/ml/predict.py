"""
Inference & Prediction Service for Used Bike Price Prediction
Loads pre-trained pipeline artifact and generates price estimates and market insights.
Designed specifically for serverless execution (loads pre-trained model only, never retrains on request).
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib

ML_DIR = Path(__file__).resolve().parent

# Check primary model path first, then fallback
PRIMARY_MODEL_PATH = ML_DIR / "model" / "bike_price_pipeline.joblib"
PRIMARY_META_PATH = ML_DIR / "model" / "model_metadata.json"

FALLBACK_MODEL_PATH = ML_DIR / "saved_models" / "used_bike_model.joblib"
FALLBACK_META_PATH = ML_DIR / "saved_models" / "model_metadata.json"

_cached_model = None
_cached_metadata = None

def get_model_and_metadata():
    """
    Lazy loader and in-memory cacher for the trained model pipeline and metadata.
    Never runs training in production/serverless environment.
    """
    global _cached_model, _cached_metadata
    
    if _cached_model is None or _cached_metadata is None:
        if PRIMARY_MODEL_PATH.exists() and PRIMARY_META_PATH.exists():
            model_file = PRIMARY_MODEL_PATH
            meta_file = PRIMARY_META_PATH
        elif FALLBACK_MODEL_PATH.exists() and FALLBACK_META_PATH.exists():
            model_file = FALLBACK_MODEL_PATH
            meta_file = FALLBACK_META_PATH
        else:
            raise FileNotFoundError(
                f"Trained model artifact not found at '{PRIMARY_MODEL_PATH}'. "
                f"Please run 'python backend/ml/train_model.py' locally before deploying."
            )
            
        _cached_model = joblib.load(model_file)
        with open(meta_file, "r", encoding="utf-8") as f:
            _cached_metadata = json.load(f)
            
    return _cached_model, _cached_metadata

def reload_model():
    """Forces reloading model from disk (useful after retraining)."""
    global _cached_model, _cached_metadata
    _cached_model = None
    _cached_metadata = None
    return get_model_and_metadata()

def calculate_depreciation_and_insights(
    predicted_price: float, 
    input_data: Dict[str, Any], 
    metadata: Dict[str, Any]
) -> Dict[str, Any]:
    """Computes depreciation rate, market demand, and valuation factors."""
    current_year = 2026
    year_val = None
    for y_col in ["model_year", "year", "manufacturing_year", "reg_year"]:
        if y_col in input_data and input_data[y_col]:
            try:
                year_val = int(input_data[y_col])
                break
            except (ValueError, TypeError):
                pass
                
    age = max(0, current_year - (year_val if year_val else 2020))
    estimated_depreciation_pct = min(75, age * 8.5)
    
    brand = str(input_data.get("brand", "")).lower()
    condition = str(input_data.get("condition", "Good")).lower()
    
    base_score = 70
    if condition == "excellent":
        base_score += 15
    elif condition == "fair":
        base_score -= 15
        
    if brand in ["royal enfield", "yamaha", "honda", "ktm", "bmw", "kawasaki"]:
        base_score += 10
    elif brand in ["hero", "bajaj", "tvs"]:
        base_score += 8
        
    if age <= 3:
        base_score += 10
    elif age >= 8:
        base_score -= 15
        
    resale_score = max(30, min(98, base_score))
    
    if resale_score >= 85:
        demand_rating = "High Demand 🔥"
    elif resale_score >= 65:
        demand_rating = "Moderate Demand 👍"
    else:
        demand_rating = "Selective Market ⏳"

    return {
        "bike_age_years": age,
        "estimated_depreciation_percentage": round(estimated_depreciation_pct, 1),
        "resale_health_score": resale_score,
        "market_demand": demand_rating
    }

def predict_bike_price(raw_input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predicts bike price from arbitrary input fields by adapting to model metadata.
    """
    model, metadata = get_model_and_metadata()
    feature_cols = metadata["features"]["all"]
    num_meta = metadata.get("feature_metadata", {}).get("numerical", {})
    cat_meta = metadata.get("feature_metadata", {}).get("categorical", {})
    
    row = {}
    for col in feature_cols:
        if col in raw_input and raw_input[col] is not None and str(raw_input[col]).strip() != "":
            val = raw_input[col]
            if col in num_meta:
                try:
                    row[col] = float(val)
                except (ValueError, TypeError):
                    row[col] = num_meta[col].get("default", 0.0)
            else:
                row[col] = str(val).strip()
        else:
            if col in num_meta:
                row[col] = num_meta[col].get("default", 0.0)
            elif col in cat_meta:
                row[col] = cat_meta[col].get("default", "Unknown")
            else:
                row[col] = 0

    df_input = pd.DataFrame([row])
    
    raw_pred = float(model.predict(df_input)[0])
    
    target_min = metadata.get("target_stats", {}).get("min", 10000)
    cleaned_price = max(target_min * 0.5, raw_pred)
    
    mape = metadata.get("metrics", {}).get("mape", 15.0)
    margin = cleaned_price * (mape / 100.0)
    
    price_low = max(target_min * 0.5, cleaned_price - margin)
    price_high = cleaned_price + margin
    
    insights = calculate_depreciation_and_insights(cleaned_price, raw_input, metadata)
    
    return {
        "predicted_price": round(cleaned_price, -2),
        "price_formatted": f"₹{round(cleaned_price, -2):,.0f}",
        "price_range": {
            "low": round(price_low, -2),
            "high": round(price_high, -2),
            "formatted": f"₹{round(price_low, -2):,.0f} – ₹{round(price_high, -2):,.0f}"
        },
        "model_used": metadata.get("best_model", "Random Forest Regressor"),
        "model_r2_score": metadata.get("metrics", {}).get("r2_score"),
        "confidence_score": round(max(50, 100 - mape), 1),
        "insights": insights,
        "input_features_used": row
    }
