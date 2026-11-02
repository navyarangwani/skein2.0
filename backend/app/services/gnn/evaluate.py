import logging
from typing import Dict, Any
import numpy as np
import torch
from sklearn.metrics import roc_auc_score, average_precision_score
from torch_geometric.data import Data
from torch_geometric.utils import negative_sampling

logger = logging.getLogger("skein.gnn.evaluate")

def evaluate_model(model: torch.nn.Module, test_data: Data) -> Dict[str, float]:
    """
    Evaluates inductive GNN link predictor on strictly future test edges (Section 17.7).
    """
    if test_data is None or not hasattr(test_data, "test_pos_edge_index"):
        return {"roc_auc": 0.0, "average_precision": 0.0}

    test_pos_edge_index = test_data.test_pos_edge_index
    num_pos = test_pos_edge_index.size(1)
    if num_pos == 0:
        return {"roc_auc": 0.0, "average_precision": 0.0}

    model.eval()
    with torch.no_grad():
        # Embeddings from train-time graph structure (prevent data leakage)
        h = model.encode(test_data.x, test_data.edge_index)

        # Sample test negative edges
        neg_edge_index = negative_sampling(
            edge_index=test_data.edge_index,
            num_nodes=test_data.num_nodes,
            num_neg_samples=num_pos
        )

        test_edge_label_index = torch.cat([test_pos_edge_index, neg_edge_index], dim=1)
        test_edge_label = torch.cat([
            torch.ones(num_pos),
            torch.zeros(neg_edge_index.size(1))
        ]).numpy()

        logits = model.decode(h, test_edge_label_index)
        scores = logits.sigmoid().detach().cpu().numpy()

        if len(set(test_edge_label)) > 1:
            auc = float(roc_auc_score(test_edge_label, scores))
            ap = float(average_precision_score(test_edge_label, scores))
        else:
            auc, ap = 0.5, 0.5

        return {
            "roc_auc": round(auc, 4),
            "average_precision": round(ap, 4)
        }
