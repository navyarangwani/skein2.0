import pytest
from backend.app.services.risk_scorer import run_risk_scoring, assign_risk_tier
from backend.app.neo4j_client import graph_client

def test_risk_scorer():
    # Insert multiple entities
    for i in range(15):
        src = f"USER_{i}"
        dst = f"USER_{(i+1)%15}"
        graph_client.upsert_transaction({"source_entity_id": src, "destination_entity_id": dst, "amount": 1000.0 * (i+1)})

    res = run_risk_scoring()
    assert res["entities_scored"] >= 15
    assert "evaluation" in res

    # Verify risk tier boundaries
    assert assign_risk_tier(99.5) == "critical"
    assert assign_risk_tier(96.0) == "high"
    assert assign_risk_tier(88.0) == "medium"
    assert assign_risk_tier(70.0) == "low"
