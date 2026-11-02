from fastapi import APIRouter
from ..neo4j_client import graph_client
from ..services.stream_pipeline import stream_pipeline

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check():
    snapshot = graph_client.get_graph_snapshot()
    stream_status = stream_pipeline.get_status()
    return {
        "status": "healthy",
        "system": "SKEIN Real-Time Financial Crime Network Detector",
        "version": "3.0",
        "components": {
            "neo4j": "connected" if graph_client.is_connected else "in_memory_high_fidelity_fallback",
            "redis": "connected" if stream_pipeline.is_redis_active else "in_memory_queue",
            "graph_entities": snapshot["stats"]["total_entities"],
            "graph_transactions": snapshot["stats"]["total_transactions"],
            "stream_active": stream_status["is_running"],
            "consumer_mode": stream_status["mode"]
        }
    }
