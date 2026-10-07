import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from backend.app.database import get_db
from backend.app.models import PredictionLog
from backend.app.schemas import PredictionRequest, PredictionResponse, ModelMetadataResponse
from backend.ml.predict import predict_bike_price, get_model_and_metadata

logger = logging.getLogger("uvicorn.error")

router = APIRouter(tags=["Prediction"])

@router.get("/model-info", response_model=ModelMetadataResponse)
@router.get("/metadata", response_model=ModelMetadataResponse)
def get_model_info_endpoint():
    """
    Returns the current trained model metadata, available features, categories, and metrics.
    Works for both /api/model-info and /api/metadata.
    """
    try:
        _, metadata = get_model_and_metadata()
        return metadata
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model metadata: {str(e)}")

@router.post("/predict", response_model=PredictionResponse)
def predict_price_endpoint(request: PredictionRequest, db: Optional[Session] = Depends(get_db)):
    """
    Receives bike features, predicts estimated selling price, and records log to database.
    If database logging fails or is unreachable, the prediction still succeeds safely.
    """
    try:
        raw_features = request.features or {}
        result = predict_bike_price(raw_features)
        
        # Save to database log safely without blocking prediction if DB fails
        if db is not None:
            try:
                brand_val = str(raw_features.get("brand", "")) if raw_features.get("brand") else None
                model_val = str(raw_features.get("model", "")) if raw_features.get("model") else None
                name_val = str(raw_features.get("bike_name", f"{brand_val or ''} {model_val or ''}".strip()))
                
                year_val = None
                for yk in ["model_year", "year", "manufacturing_year"]:
                    if yk in raw_features and raw_features[yk]:
                        try:
                            year_val = int(raw_features[yk])
                            break
                        except (ValueError, TypeError):
                            pass

                km_val = None
                for kk in ["kms_driven", "km_driven", "kilometers", "mileage"]:
                    if kk in raw_features and raw_features[kk]:
                        try:
                            km_val = float(raw_features[kk])
                            break
                        except (ValueError, TypeError):
                            pass

                log_entry = PredictionLog(
                    bike_name=name_val if name_val else "Used Bike",
                    brand=brand_val,
                    model=model_val,
                    model_year=year_val,
                    kms_driven=km_val,
                    predicted_price=result["predicted_price"],
                    price_range_low=result["price_range"]["low"],
                    price_range_high=result["price_range"]["high"],
                    confidence_score=result["confidence_score"],
                    model_used=result["model_used"],
                    input_data=raw_features
                )
                
                db.add(log_entry)
                db.commit()
                db.refresh(log_entry)
                result["log_id"] = log_entry.id
            except Exception as db_err:
                logger.warning(f"Database logging skipped due to connection error: {db_err}")
                try:
                    db.rollback()
                except Exception:
                    pass
                result["log_id"] = None
        else:
            result["log_id"] = None

        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")
