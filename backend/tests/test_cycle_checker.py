import pytest
from backend.app.neo4j_client import MemoryGraphStore

def test_incremental_cycle_detection():
    store = MemoryGraphStore()

    # Create path: A -> B -> C -> D
    store.upsert_transaction({"source_entity_id": "A", "destination_entity_id": "B", "amount": 10000})
    store.upsert_transaction({"source_entity_id": "B", "destination_entity_id": "C", "amount": 9000})
    store.upsert_transaction({"source_entity_id": "C", "destination_entity_id": "D", "amount": 8000})

    # A non-closing transaction: D -> E
    res_non_cycle = store.upsert_transaction({"source_entity_id": "D", "destination_entity_id": "E", "amount": 7000})
    cycle_res1 = store.check_incremental_cycle("D", "E")
    assert cycle_res1 is None

    # Now add closing edge: D -> A (closes A -> B -> C -> D -> A)
    store.upsert_transaction({"source_entity_id": "D", "destination_entity_id": "A", "amount": 6500})
    cycle_res2 = store.check_incremental_cycle("D", "A")

    assert cycle_res2 is not None
    assert set(cycle_res2["entities"]) == {"A", "B", "C", "D"}
    assert cycle_res2["length"] == 4
    assert cycle_res2["total_volume"] > 0
