import pytest
from backend.app.neo4j_client import graph_client
from backend.app.services.gds_runner import execute_batch_analytics

def test_gds_runner_metrics():
    # Insert nodes and transactions into graph_client
    graph_client.upsert_transaction({"source_entity_id": "HUB_1", "destination_entity_id": "MEMBER_1", "amount": 50000})
    graph_client.upsert_transaction({"source_entity_id": "HUB_1", "destination_entity_id": "MEMBER_2", "amount": 50000})
    graph_client.upsert_transaction({"source_entity_id": "MEMBER_1", "destination_entity_id": "HUB_1", "amount": 45000})

    res = execute_batch_analytics()
    assert "graph_metrics" in res
    assert "amount_anomalies_computed" in res

    snapshot = graph_client.get_graph_snapshot()
    assert snapshot["stats"]["total_entities"] >= 3
    node_hub = next((n for n in snapshot["nodes"] if n["id"] == "HUB_1"), None)
    assert node_hub is not None
    assert "pagerank" in node_hub
    assert "betweenness" in node_hub
