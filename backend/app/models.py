from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from .database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    dataset_id = Column(String, primary_key=True, index=True)
    source_file = Column(String, nullable=False)
    entity_count = Column(Integer, default=0)
    transaction_count = Column(Integer, default=0)
    loaded_at = Column(DateTime, default=datetime.utcnow)

class BatchRun(Base):
    __tablename__ = "batch_runs"

    run_id = Column(String, primary_key=True, index=True)
    triggered_by = Column(String, nullable=False)  # 'txn_threshold' | 'time_threshold' | 'manual'
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, default=0)
    entities_scored = Column(Integer, default=0)
    high_risk_count = Column(Integer, default=0)

class Alert(Base):
    __tablename__ = "alerts"

    alert_id = Column(String, primary_key=True, index=True)
    alert_source = Column(String, nullable=False)  # 'speed_layer' | 'batch_layer'
    entity_id = Column(String, nullable=True)
    cycle_entities = Column(Text, nullable=True)   # JSON array of entity IDs
    risk_score = Column(Float, nullable=True)
    message = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)
    slack_status = Column(String, default="pending")  # 'sent' | 'skipped' | 'failed'

class StreamOffset(Base):
    __tablename__ = "stream_offsets"

    consumer_group = Column(String, primary_key=True)
    last_processed_id = Column(String, default="0-0")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
