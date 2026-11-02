from typing import Optional, Dict, Any, List
from ..neo4j_client import graph_client

def check_new_edge_cycle(source_id: str, dest_id: str) -> Optional[Dict[str, Any]]:
    """
    Speed Layer: Incremental cycle detection on each newly arrived transaction edge.
    If adding u -> v closes a cycle, flags immediately within milliseconds.
    """
    return graph_client.memory_store.check_incremental_cycle(source_id, dest_id)

def run_full_scan() -> List[Dict[str, Any]]:
    """
    Batch Layer: Comprehensive cycle scan returning all cycles <= length 6.
    """
    return graph_client.memory_store.run_full_cycle_scan()
