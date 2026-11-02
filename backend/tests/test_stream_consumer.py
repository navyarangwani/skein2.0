import pytest
from backend.app.services.stream_pipeline import stream_pipeline

def test_stream_consumer_processing():
    txn = {
        "transaction_id": "TEST_TX_001",
        "source_entity_id": "ALICE",
        "destination_entity_id": "BOB",
        "amount": 25000.0,
        "currency": "INR",
        "timestamp": "2026-03-01T12:00:00"
    }

    initial_count = stream_pipeline.transactions_processed
    stream_pipeline.process_transaction(txn)
    assert stream_pipeline.transactions_processed == initial_count + 1

    status = stream_pipeline.get_status()
    assert "transactions_processed" in status
    assert "queue_lag" in status
    assert "connected_clients" in status
