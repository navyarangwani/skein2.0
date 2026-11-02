from fastapi import APIRouter, HTTPException
from ..schemas import EntityDetailResponse, NodeData
from ..neo4j_client import graph_client
from ..services.case_narrator import generate_case_note_for_entity

router = APIRouter(prefix="/entities", tags=["Entities"])

@router.get("/{entity_id}", response_model=EntityDetailResponse)
def get_entity_detail(entity_id: str):
    g = graph_client.memory_store.graph
    if not g.has_node(entity_id):
        raise HTTPException(status_code=404, detail=f"Entity {entity_id} not found in graph.")

    node_data = dict(g.nodes[entity_id])
    node_obj = NodeData(
        id=entity_id,
        name=node_data.get("name", entity_id),
        type=node_data.get("entity_type", "individual"),
        country=node_data.get("country", "IN"),
        kyc_flag=node_data.get("kyc_flag", 1),
        risk_score=round(float(node_data.get("risk_score", 0.0)), 1),
        risk_tier=node_data.get("risk_tier", "low"),
        community_id=node_data.get("community_id", 0),
        pagerank=round(float(node_data.get("pagerank", 0.0)), 6),
        pagerank_percentile=round(float(node_data.get("pagerank_percentile", 0.0)), 1),
        betweenness=round(float(node_data.get("betweenness", 0.0)), 6),
        betweenness_percentile=round(float(node_data.get("betweenness_percentile", 0.0)), 1),
        community_shell_density_percentile=round(float(node_data.get("community_shell_density_percentile", 0.0)), 1),
        amount_anomaly_percentile=round(float(node_data.get("amount_anomaly_percentile", 0.0)), 1),
        in_cycle=bool(node_data.get("in_cycle", False)),
        cycle_count=int(node_data.get("cycle_count", 0)),
        case_note=node_data.get("case_note"),
        last_scored_at=node_data.get("last_scored_at")
    )

    in_txns = []
    for u, v, k, d in g.in_edges(entity_id, keys=True, data=True):
        in_txns.append({
            "from": u,
            "amount": d.get("amount", 0.0),
            "timestamp": d.get("timestamp"),
            "transaction_id": d.get("transaction_id", str(k)),
            "type": d.get("transaction_type", "transfer")
        })

    out_txns = []
    for u, v, k, d in g.out_edges(entity_id, keys=True, data=True):
        out_txns.append({
            "to": v,
            "amount": d.get("amount", 0.0),
            "timestamp": d.get("timestamp"),
            "transaction_id": d.get("transaction_id", str(k)),
            "type": d.get("transaction_type", "transfer")
        })

    cycle_memberships = []
    for c in graph_client.memory_store.cycles:
        if entity_id in c["entities"]:
            cycle_memberships.append(c["entities"])

    feature_breakdown = {
        "pagerank": {
            "value": round(float(node_data.get("pagerank", 0.0)), 6),
            "percentile": round(float(node_data.get("pagerank_percentile", 0.0)), 1),
            "description": "Measures capital aggregation from high-value sources."
        },
        "betweenness": {
            "value": round(float(node_data.get("betweenness", 0.0)), 6),
            "percentile": round(float(node_data.get("betweenness_percentile", 0.0)), 1),
            "description": "Measures pass-through bridge activity between disconnected components."
        },
        "community_shell_density": {
            "value": round(float(node_data.get("community_shell_density", 0.0)), 4),
            "percentile": round(float(node_data.get("community_shell_density_percentile", 0.0)), 1),
            "description": "Fraction of shell companies in local Louvain community partition."
        },
        "amount_anomaly_score": {
            "value": round(float(node_data.get("amount_anomaly_score", 0.0)), 4),
            "percentile": round(float(node_data.get("amount_anomaly_percentile", 0.0)), 1),
            "description": "Structuring index: outgoing frequency & proximity to INR 50k reporting threshold."
        },
        "degree_total": {
            "value": g.degree(entity_id),
            "description": "Total active incoming and outgoing transaction counterparties."
        }
    }

    # Generate case note if absent
    case_note = node_data.get("case_note")
    if not case_note:
        case_note = generate_case_note_for_entity(entity_id)

    return EntityDetailResponse(
        entity=node_obj,
        in_transactions=in_txns[:50],
        out_transactions=out_txns[:50],
        cycle_memberships=cycle_memberships,
        case_note=case_note,
        feature_breakdown=feature_breakdown
    )

@router.post("/{entity_id}/narrative")
def trigger_narrative(entity_id: str):
    note = generate_case_note_for_entity(entity_id, force=True)
    if not note:
        raise HTTPException(status_code=404, detail="Entity not found or narrative could not be generated.")
    return {"entity_id": entity_id, "case_note": note}
