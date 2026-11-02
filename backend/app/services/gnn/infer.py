import logging
from datetime import datetime
from typing import List, Dict, Any
import numpy as np
import torch
import networkx as nx

from ...neo4j_client import graph_client

logger = logging.getLogger("skein.gnn.infer")

def infer_predicted_links(model_result: Dict[str, Any], top_k: int = 15) -> List[Dict[str, Any]]:
    """
    Runs periodic inference on 2-hop neighborhood of high/critical risk entities (Section 17.8).
    Scores non-existent pairs and surfaces top-K emerging connections.
    """
    if "model" not in model_result or not model_result["model"]:
        return []

    model = model_result["model"]
    entity_ids = model_result["entity_ids"]
    node_to_idx = model_result["node_to_idx"]

    g = graph_client.memory_store.graph
    simple_g = graph_client.memory_store.simple_graph

    # Identify high/critical risk entities
    flagged = [
        n for n in g.nodes
        if g.nodes[n].get("risk_tier") in ["high", "critical"] or g.nodes[n].get("in_cycle")
    ]

    if not flagged:
        # Fallback to top degree nodes if no high risk nodes yet
        degrees = sorted(g.degree, key=lambda x: x[1], reverse=True)
        flagged = [n for n, d in degrees[:5]]

    # Collect candidate pairs within 2 hops
    candidate_pairs = set()
    for root in flagged:
        if not simple_g.has_node(root):
            continue
        try:
            # 2-hop ego network
            two_hop_nodes = nx.single_source_shortest_path_length(simple_g, root, cutoff=2).keys()
            for neighbor in two_hop_nodes:
                if neighbor != root and not simple_g.has_edge(root, neighbor):
                    candidate_pairs.add((root, neighbor))
        except Exception:
            pass

    if not candidate_pairs:
        # Random non-edges from flagged
        for f in flagged:
            for other in entity_ids[:20]:
                if f != other and not simple_g.has_edge(f, other):
                    candidate_pairs.add((f, other))

    if not candidate_pairs:
        return []

    candidate_list = list(candidate_pairs)[:200]
    src_indices = [node_to_idx[u] for u, v in candidate_list if u in node_to_idx and v in node_to_idx]
    dst_indices = [node_to_idx[v] for u, v in candidate_list if u in node_to_idx and v in node_to_idx]

    if not src_indices:
        return []

    edge_label_index = torch.tensor([src_indices, dst_indices], dtype=torch.long)

    # Encode with GNN
    model.eval()
    with torch.no_grad():
        from .train import prepare_pyg_data
        train_data, _, _, _ = prepare_pyg_data()
        if train_data is None:
            return []

        h = model.encode(train_data.x, train_data.edge_index)
        scores = model.decode(h, edge_label_index).sigmoid().cpu().numpy()

    predictions = []
    for idx, (u, v) in enumerate(candidate_list[:len(scores)]):
        prob = float(scores[idx])
        # Format predicted link
        predictions.append({
            "source": u,
            "target": v,
            "probability": round(prob * 100.0, 1),
            "predicted_at": datetime.utcnow().isoformat()
        })

    # Sort descending by probability
    predictions.sort(key=lambda x: x["probability"], reverse=True)
    top_predictions = predictions[:top_k]

    # Save to graph store
    graph_client.write_predicted_links(top_predictions)
    return top_predictions
