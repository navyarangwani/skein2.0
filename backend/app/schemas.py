from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class NodeData(BaseModel):
    id: str
    name: str
    type: str = "individual"  # individual | company | shell_company
    country: str = "IN"
    kyc_flag: int = 1
    risk_score: float = 0.0
    risk_tier: str = "low"    # low | medium | high | critical
    community_id: Optional[int] = 0
    pagerank: float = 0.0
    pagerank_percentile: float = 0.0
    betweenness: float = 0.0
    betweenness_percentile: float = 0.0
    community_shell_density_percentile: float = 0.0
    amount_anomaly_percentile: float = 0.0
    in_cycle: bool = False
    cycle_count: int = 0
    case_note: Optional[str] = None
    last_scored_at: Optional[str] = None

class LinkData(BaseModel):
    source: str
    target: str
    amount: float
    currency: str = "INR"
    timestamp: str
    transaction_id: str
    transaction_type: str = "transfer"
    is_predicted: bool = False
    probability: Optional[float] = None

class PredictedLinkData(BaseModel):
    source: str
    target: str
    probability: float
    predicted_at: str

class GraphSnapshotResponse(BaseModel):
    nodes: List[NodeData]
    links: List[LinkData]
    predicted_links: List[PredictedLinkData]
    stats: Dict[str, Any]

class EntityDetailResponse(BaseModel):
    entity: NodeData
    in_transactions: List[Dict[str, Any]]
    out_transactions: List[Dict[str, Any]]
    cycle_memberships: List[List[str]]
    case_note: Optional[str] = None
    feature_breakdown: Dict[str, Any]

class CommunitySummary(BaseModel):
    community_id: int
    member_count: int
    shell_company_count: int
    shell_density: float
    avg_risk_score: float
    max_risk_score: float
    risk_tier: str
    total_volume: float
    sample_members: List[str]

class CycleSummary(BaseModel):
    cycle_id: str
    entities: List[str]
    length: int
    total_volume: float
    source: str  # 'speed_layer' | 'batch_layer'
    detected_at: str

class AlertSummary(BaseModel):
    alert_id: str
    alert_source: str
    entity_id: Optional[str]
    cycle_entities: Optional[List[str]]
    risk_score: Optional[float]
    message: str
    sent_at: str
    slack_status: str

class StreamStatusResponse(BaseModel):
    is_running: bool
    rate_per_second: float
    transactions_processed: int
    queue_lag: int
    last_processed_timestamp: Optional[str]
    last_batch_run_time: Optional[str]
    connected_clients: int
    mode: str  # 'redis' | 'memory'

class StreamControlRequest(BaseModel):
    rate_per_second: Optional[float] = 5.0
    dataset_path: Optional[str] = None

class DatasetGenerateRequest(BaseModel):
    num_entities: int = 500
    num_transactions: int = 2500
    num_rings: int = 3
    num_smurfing: int = 2
    random_seed: int = 42

class BatchRunResponse(BaseModel):
    run_id: str
    duration_ms: int
    entities_scored: int
    high_risk_count: int
    auc_score: Optional[float] = None
