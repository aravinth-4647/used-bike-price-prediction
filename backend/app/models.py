from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, Text
from backend.app.database import Base

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bike_name = Column(String(255), nullable=True)
    brand = Column(String(100), nullable=True, index=True)
    model = Column(String(100), nullable=True)
    model_year = Column(Integer, nullable=True)
    kms_driven = Column(Float, nullable=True)
    predicted_price = Column(Float, nullable=False)
    price_range_low = Column(Float, nullable=True)
    price_range_high = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    model_used = Column(String(100), nullable=True)
    input_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class SavedBike(Base):
    __tablename__ = "saved_bikes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    brand = Column(String(100), nullable=True)
    predicted_price = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
