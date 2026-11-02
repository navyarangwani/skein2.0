import logging
from pathlib import Path
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from scipy.stats import rankdata
from sklearn.ensemble import IsolationForest
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score

from ..neo4j_client import graph_client
from ..config import DATA_DIR

logger = logging.getLogger("skein.risk_scorer")

def assign_risk_tier(score: float) -> str:
    """
    Tier assignment according to Section 15.3:
    0th–84th: Low
    85th–94th: Medium
    95th–98th: High
    99th–100th: Critical
    """
    if score >= 99.0:
        return "critical"
    elif score >= 95.0:
        return "high"
    elif score >= 85.0:
        return "medium"
    return "low"

def assemble_features() -> Tuple[List[str], np.ndarray, Dict[str, Dict[str, float]]]:
    """
    Assembles the 7-feature matrix for all active entities in the graph:
    [pagerank, betweenness, in_cycle, community_shell_density, amount_anomaly_score, degree_total, clustering_coefficient]
    """
    g = graph_client.memory_store.graph
    entity_ids = list(g.nodes)

    if not entity_ids:
        return [], np.empty((0, 7)), {}

    feature_matrix = []
    feature_dict = {}

    for eid in entity_ids:
        data = g.nodes[eid]
        pr = float(data.get("pagerank", 0.0))
        bc = float(data.get("betweenness", 0.0))
        inc = 1.0 if data.get("in_cycle", False) else 0.0
        csd = float(data.get("community_shell_density", 0.0))
        aas = float(data.get("amount_anomaly_score", 0.0))
        deg = float(data.get("degree_total", g.degree(eid)))
        cc = float(data.get("clustering_coefficient", 0.0))

        vec = [pr, bc, inc, csd, aas, deg, cc]
        feature_matrix.append(vec)
        feature_dict[eid] = {
            "pagerank": pr,
            "betweenness": bc,
            "in_cycle": inc,
            "community_shell_density": csd,
            "amount_anomaly_score": aas,
            "degree_total": deg,
            "clustering_coefficient": cc
        }

    return entity_ids, np.array(feature_matrix, dtype=float), feature_dict

def run_risk_scoring() -> Dict[str, Any]:
    """
    Fits unsupervised IsolationForest, computes percentile ranks, writes scores back to graph,
    and calculates evaluation metrics against ground truth if available.
    """
    entity_ids, X, feature_dict = assemble_features()
    if len(entity_ids) == 0:
        return {"entities_scored": 0, "high_risk_count": 0, "auc": None}

    # If very small graph, provide heuristic/deterministic scoring fallback
    if len(entity_ids) < 10:
        raw_scores = np.sum(X, axis=1)
    else:
        # Section 15.2: Isolation Forest
        model = IsolationForest(n_estimators=200, contamination=0.05, random_state=42)
        model.fit(X)
        raw_scores = -model.score_samples(X)

    # Section 15.3: Percentile conversion
    composite_scores = 100.0 * rankdata(raw_scores) / len(raw_scores)

    # Calculate per-feature percentiles for explainability (NFR6)
    pr_percentiles = 100.0 * rankdata(X[:, 0]) / len(X)
    bc_percentiles = 100.0 * rankdata(X[:, 1]) / len(X)
    csd_percentiles = 100.0 * rankdata(X[:, 3]) / len(X)
    aas_percentiles = 100.0 * rankdata(X[:, 4]) / len(X)

    scored_entities = []
    high_risk_entities = []

    for i, eid in enumerate(entity_ids):
        c_score = float(composite_scores[i])
        tier = assign_risk_tier(c_score)
        scored_info = {
            "entity_id": eid,
            "composite_risk_score": round(c_score, 1),
            "risk_tier": tier,
            "pagerank_percentile": round(float(pr_percentiles[i]), 1),
            "betweenness_percentile": round(float(bc_percentiles[i]), 1),
            "community_shell_density_percentile": round(float(csd_percentiles[i]), 1),
            "amount_anomaly_percentile": round(float(aas_percentiles[i]), 1),
            "raw_anomaly_score": float(raw_scores[i])
        }
        scored_entities.append(scored_info)
        if tier in ["high", "critical"]:
            high_risk_entities.append(scored_info)

    # Write back to graph
    graph_client.update_risk_scores(scored_entities)

    # Ground truth validation (Section 15.5)
    evaluation = evaluate_against_ground_truth(entity_ids, raw_scores, composite_scores)

    return {
        "entities_scored": len(scored_entities),
        "high_risk_count": len(high_risk_entities),
        "high_risk_entities": high_risk_entities,
        "evaluation": evaluation
    }

def evaluate_against_ground_truth(
    entity_ids: List[str],
    raw_scores: np.ndarray,
    composite_scores: np.ndarray
) -> Dict[str, Any]:
    """
    Validates unsupervised model against ground_truth.csv.
    Reports real measured ROC-AUC, Precision, Recall, and F1.
    """
    gt_file = DATA_DIR / "ground_truth.csv"
    if not gt_file.exists():
        return {"has_ground_truth": False}

    try:
        gt_df = pd.read_csv(gt_file).set_index("entity_id")
        y_true = []
        valid_indices = []

        for idx, eid in enumerate(entity_ids):
            if eid in gt_df.index:
                y_true.append(int(gt_df.loc[eid, "is_fraud_ring_member"]))
                valid_indices.append(idx)

        if not y_true or sum(y_true) == 0 or len(set(y_true)) < 2:
            return {"has_ground_truth": True, "auc": None, "note": "Insufficient positive class distribution"}

        y_true = np.array(y_true)
        sub_raw = raw_scores[valid_indices]
        sub_comp = composite_scores[valid_indices]

        auc = float(roc_auc_score(y_true, sub_raw))
        flagged = sub_comp >= 85.0  # Medium/High/Critical threshold
        precision = float(precision_score(y_true, flagged, zero_division=0))
        recall = float(recall_score(y_true, flagged, zero_division=0))
        f1 = float(f1_score(y_true, flagged, zero_division=0))

        return {
            "has_ground_truth": True,
            "roc_auc": round(auc, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "total_evaluated": len(y_true),
            "total_fraud_entities": int(sum(y_true))
        }
    except Exception as e:
        logger.warning(f"Ground truth evaluation error: {e}")
        return {"has_ground_truth": False, "error": str(e)}
