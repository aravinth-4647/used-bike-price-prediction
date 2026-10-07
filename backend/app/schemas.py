from typing import Dict, Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    # Dynamic dictionary allowing any custom columns from different datasets
    features: Dict[str, Any] = Field(
        default_factory=dict, 
        description="Key-value pairs of bike attributes"
    )

class PriceRange(BaseModel):
    low: float
    high: float
    formatted: str

class Insights(BaseModel):
    bike_age_years: int
    estimated_depreciation_percentage: float
    resale_health_score: int
    market_demand: str

class PredictionResponse(BaseModel):
    predicted_price: float
    price_formatted: str
    price_range: PriceRange
    model_used: str
    model_r2_score: Optional[float] = None
    confidence_score: float
    insights: Insights
    input_features_used: Dict[str, Any]
    log_id: Optional[int] = None

class PredictionHistoryItem(BaseModel):
    id: int
    bike_name: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    model_year: Optional[int] = None
    kms_driven: Optional[float] = None
    predicted_price: float
    price_range_low: Optional[float] = None
    price_range_high: Optional[float] = None
    confidence_score: Optional[float] = None
    model_used: Optional[str] = None
    input_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ModelMetadataResponse(BaseModel):
    dataset_file: str
    trained_at: str
    total_records: int
    train_records: int
    test_records: int
    target_column: str
    target_stats: Dict[str, Any]
    features: Dict[str, Any]
    feature_metadata: Dict[str, Any]
    brand_model_mapping: Dict[str, List[str]]
    best_model: str
    metrics: Dict[str, Any]
    all_model_results: Dict[str, Any]
    feature_importances: List[Dict[str, Any]]
