"""
Dynamic Preprocessor for Used Bike Datasets
Builds adaptable ColumnTransformer pipelines based on detected column types.
"""

from typing import List, Tuple, Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

def identify_feature_columns(
    df: pd.DataFrame, 
    target_column: str,
    max_cat_cardinality: int = 300
) -> Tuple[List[str], List[str], List[str]]:
    """
    Identifies numerical features, categorical features, and columns to drop.
    """
    candidate_features = [c for c in df.columns if c != target_column]
    
    numerical_cols = []
    categorical_cols = []
    dropped_cols = []
    
    for col in candidate_features:
        # Check if ID-like or useless (e.g. index, id, url)
        col_lower = col.lower()
        if col_lower in ["id", "index", "unnamed: 0", "url", "image", "link"]:
            dropped_cols.append(col)
            continue
            
        if pd.api.types.is_numeric_dtype(df[col]):
            numerical_cols.append(col)
        else:
            # Check cardinality
            unique_count = df[col].nunique()
            if unique_count > max_cat_cardinality and unique_count > len(df) * 0.9:
                # Almost all unique strings (likely raw free text or unique title)
                dropped_cols.append(col)
            else:
                categorical_cols.append(col)
                
    return numerical_cols, categorical_cols, dropped_cols

def build_preprocessor_pipeline(
    numerical_cols: List[str], 
    categorical_cols: List[str]
) -> ColumnTransformer:
    """
    Constructs a robust scikit-learn ColumnTransformer.
    """
    transformers = []
    
    if numerical_cols:
        num_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ])
        transformers.append(("num", num_pipeline, numerical_cols))
        
    if categorical_cols:
        cat_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
        ])
        transformers.append(("cat", cat_pipeline, categorical_cols))
        
    preprocessor = ColumnTransformer(
        transformers=transformers,
        remainder="drop"
    )
    
    return preprocessor
