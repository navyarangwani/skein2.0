import logging
import random
from typing import Dict, Any, Tuple, List, Optional
import numpy as np
import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.utils import negative_sampling

from .model import LinkPredictorGNN
from ...neo4j_client import graph_client

logger = logging.getLogger("skein.gnn.train")

def prepare_pyg_data() -> Tuple[Optional[Data], Optional[Data], List[str], Dict[str, int]]:
    """
    Constructs PyTorch Geometric Data object with temporal split (Section 17.4):
    - Train graph: first 80% of transactions by timestamp.
    - Test edges: remaining 20% of transactions.
    Features:
    [type_ind, type_comp, type_shell, pagerank, betweenness, degree_total, community_norm, kyc_flag] (8-dim)
    """
    g = graph_client.memory_store.graph
    entity_ids = sorted(list(g.nodes))
    if len(entity_ids) < 5:
        return None, None, [], {}

    node_to_idx = {eid: idx for idx, eid in enumerate(entity_ids)}

    # Build node features
    x_list = []
    for eid in entity_ids:
        d = g.nodes[eid]
        etype = d.get("entity_type", "individual")
        onehot = [
            1.0 if etype == "individual" else 0.0,
            1.0 if etype == "company" else 0.0,
            1.0 if etype == "shell_company" else 0.0
        ]
        pr = float(d.get("pagerank", 0.0))
        bc = float(d.get("betweenness", 0.0))
        deg = float(d.get("degree_total", g.degree(eid))) / 100.0  # normalize
        comm = float(d.get("community_id", 0)) / 50.0             # normalize
        kyc = float(d.get("kyc_flag", 1))

        x_list.append(onehot + [pr, bc, deg, comm, kyc])

    x = torch.tensor(x_list, dtype=torch.float)

    # Collect and sort all edges by timestamp
    edge_records = []
    for u, v, k, d in g.edges(keys=True, data=True):
        if u in node_to_idx and v in node_to_idx:
            edge_records.append((
                node_to_idx[u],
                node_to_idx[v],
                d.get("timestamp", "")
            ))

    if len(edge_records) < 10:
        return None, None, entity_ids, node_to_idx

    # Temporal split
    edge_records.sort(key=lambda item: item[2])
    split_idx = int(0.80 * len(edge_records))
    train_edges = edge_records[:split_idx]
    test_edges = edge_records[split_idx:]

    train_edge_index = torch.tensor(
        [[e[0] for e in train_edges], [e[1] for e in train_edges]],
        dtype=torch.long
    )

    test_pos_edge_index = torch.tensor(
        [[e[0] for e in test_edges], [e[1] for e in test_edges]],
        dtype=torch.long
    )

    train_data = Data(x=x, edge_index=train_edge_index, num_nodes=len(entity_ids))
    test_data = Data(x=x, edge_index=train_edge_index, test_pos_edge_index=test_pos_edge_index, num_nodes=len(entity_ids))

    return train_data, test_data, entity_ids, node_to_idx

def train_link_predictor(epochs: int = 50) -> Dict[str, Any]:
    """
    Executes GNN link prediction training with negative sampling.
    """
    train_data, test_data, entity_ids, node_to_idx = prepare_pyg_data()
    if train_data is None or train_data.edge_index.size(1) == 0:
        return {"status": "insufficient_data", "auc": 0.0, "ap": 0.0}

    device = torch.device("cpu")
    model = LinkPredictorGNN(in_channels=train_data.x.size(1), hidden_channels=32, out_channels=16).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

    train_data = train_data.to(device)
    num_nodes = train_data.num_nodes
    pos_edge_count = train_data.edge_index.size(1)

    model.train()
    final_loss = 0.0

    for epoch in range(epochs):
        optimizer.zero_grad()
        h = model.encode(train_data.x, train_data.edge_index)

        # Negative sampling (Section 17.5)
        neg_edge_index = negative_sampling(
            edge_index=train_data.edge_index,
            num_nodes=num_nodes,
            num_neg_samples=pos_edge_count
        )

        edge_label_index = torch.cat([train_data.edge_index, neg_edge_index], dim=1)
        edge_label = torch.cat([
            torch.ones(pos_edge_count),
            torch.zeros(neg_edge_index.size(1))
        ]).to(device)

        out = model.decode(h, edge_label_index)
        loss = F.binary_cross_entropy_with_logits(out, edge_label)
        loss.backward()
        optimizer.step()
        final_loss = float(loss.item())

    # Evaluation (Section 17.7)
    from .evaluate import evaluate_model
    eval_metrics = evaluate_model(model, test_data)

    return {
        "status": "trained",
        "epochs": epochs,
        "final_loss": round(final_loss, 4),
        "roc_auc": eval_metrics.get("roc_auc", 0.0),
        "average_precision": eval_metrics.get("average_precision", 0.0),
        "model": model,
        "entity_ids": entity_ids,
        "node_to_idx": node_to_idx
    }
