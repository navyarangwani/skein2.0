import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "components" in data

def test_graph_endpoint():
    response = client.get("/api/graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "links" in data
    assert "stats" in data

def test_stream_status_endpoint():
    response = client.get("/api/stream/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_running" in data
    assert "rate_per_second" in data

def test_communities_endpoint():
    response = client.get("/api/communities")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_cycles_endpoint():
    response = client.get("/api/cycles")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
