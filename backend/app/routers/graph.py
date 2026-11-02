from fastapi import APIRouter
from ..schemas import GraphSnapshotResponse
from ..neo4j_client import graph_client

router = APIRouter(prefix="/graph", tags=["Graph"])

@router.get("", response_model=GraphSnapshotResponse)
def get_graph():
    """
    Returns current full graph snapshot:
    - Nodes with all structural and anomaly risk properties
    - Transaction links
    - Inductive GNN predicted future links (dashed overlays)
    - Summary topology stats
    """
    snapshot = graph_client.get_graph_snapshot()
    return snapshot

@router.get("/stats")
def get_graph_stats():
    snapshot = graph_client.get_graph_snapshot()
    return snapshot["stats"]
