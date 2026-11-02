import numpy as np
from typing import Dict, Any, List
from ..neo4j_client import graph_client
from ...data_generator.config import AML_REPORTING_THRESHOLD

def compute_amount_anomalies() -> Dict[str, float]:
    """
    Computes smurfing / structuring anomaly signals per entity:
    - z_count: outlier outgoing transaction frequency
    - threshold_proximity: fraction of outgoing transactions in [0.90 * threshold, threshold]
    - amount_anomaly_score = normalized combination
    """
    g = graph_client.memory_store.graph
    entity_out_counts = {}
    entity_near_threshold_counts = {}

    lower_bound = 0.88 * AML_REPORTING_THRESHOLD
    upper_bound = 1.00 * AML_REPORTING_THRESHOLD

    for node in g.nodes:
        out_edges = g.out_edges(node, data=True)
        count = len(out_edges)
        entity_out_counts[node] = count

        near_threshold = 0
        for _, _, data in out_edges:
            amt = data.get("amount", 0.0)
            if lower_bound <= amt <= upper_bound:
                near_threshold += 1
        entity_near_threshold_counts[node] = near_threshold

    counts = list(entity_out_counts.values())
    if not counts or sum(counts) == 0:
        return {node: 0.0 for node in g.nodes}

    mean_count = np.mean(counts)
    std_count = np.std(counts) if np.std(counts) > 1e-6 else 1.0

    scores = {}
    for node, count in entity_out_counts.items():
        z_score = max(0.0, (count - mean_count) / std_count)
        prox_ratio = entity_near_threshold_counts[node] / count if count > 0 else 0.0
        # Combined anomaly indicator
        raw_score = 0.5 * min(z_score / 3.0, 1.0) + 0.5 * prox_ratio
        scores[node] = float(np.clip(raw_score, 0.0, 1.0))
        g.nodes[node]["amount_anomaly_score"] = scores[node]

    return scores

def execute_batch_analytics() -> Dict[str, Any]:
    """
    Executes all graph algorithms:
    - PageRank
    - Betweenness Centrality
    - Louvain community detection & shell density
    - Amount anomaly (smurfing signal)
    - Full cycle scan
    """
    analytics_result = graph_client.run_batch_analytics()
    amount_anomalies = compute_amount_anomalies()
    return {
        "graph_metrics": analytics_result,
        "amount_anomalies_computed": len(amount_anomalies)
    }
