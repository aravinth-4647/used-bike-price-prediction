from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.models import PredictionLog
from app.schemas import PredictionHistoryItem

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[PredictionHistoryItem])
def get_prediction_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    brand: Optional[str] = None,
    db: Optional[Session] = Depends(get_db)
):
    """
    Retrieves logged prediction queries, sorted by newest first.
    """
    if db is None:
        return []
        
    try:
        query = db.query(PredictionLog)
        if brand:
            query = query.filter(PredictionLog.brand.ilike(f"%{brand}%"))
        
        records = query.order_by(PredictionLog.created_at.desc()).offset(offset).limit(limit).all()
        return records
    except Exception:
        return []

@router.get("/stats")
def get_history_stats(db: Optional[Session] = Depends(get_db)):
    """
    Returns aggregate statistics of past predictions.
    """
    if db is None:
        return {"total_predictions": 0, "average_predicted_price": 0.0, "top_queried_brands": []}
        
    try:
        total_count = db.query(func.count(PredictionLog.id)).scalar() or 0
        avg_price = db.query(func.avg(PredictionLog.predicted_price)).scalar() or 0
        
        top_brands = (
            db.query(PredictionLog.brand, func.count(PredictionLog.id).label("count"))
            .filter(PredictionLog.brand != None)
            .group_by(PredictionLog.brand)
            .order_by(func.count(PredictionLog.id).desc())
            .limit(5)
            .all()
        )
        
        return {
            "total_predictions": total_count,
            "average_predicted_price": round(float(avg_price), 2),
            "top_queried_brands": [{"brand": b[0], "count": b[1]} for b in top_brands]
        }
    except Exception:
        return {"total_predictions": 0, "average_predicted_price": 0.0, "top_queried_brands": []}

@router.delete("/{log_id}")
def delete_history_item(log_id: int, db: Optional[Session] = Depends(get_db)):
    """
    Deletes a specific prediction log record.
    """
    if db is None:
        raise HTTPException(status_code=404, detail="Database not configured")
        
    record = db.query(PredictionLog).filter(PredictionLog.id == log_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found")
    
    db.delete(record)
    db.commit()
    return {"message": f"Prediction log #{log_id} deleted successfully"}

@router.delete("")
def clear_all_history(db: Optional[Session] = Depends(get_db)):
    """
    Clears all prediction history.
    """
    if db is None:
        return {"message": "Database not configured"}
        
    deleted_count = db.query(PredictionLog).delete()
    db.commit()
    return {"message": f"Cleared {deleted_count} prediction records"}
