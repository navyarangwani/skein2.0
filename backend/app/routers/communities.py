from typing import List, Dict, Any
from fastapi import APIRouter
from ..schemas import CommunitySummary
from ..neo4j_client import graph_client

router = APIRouter(prefix="/communities", tags=["Communities"])

@router.get("", response_model=List[CommunitySummary])
def get_communities():
    g = graph_client.memory_store.graph
    comm_map: Dict[int, List[str]] = {}

    for n in g.nodes:
        c_id = g.nodes[n].get("community_id", 0)
        comm_map.setdefault(c_id, []).append(n)

    summaries = []
    for c_id, members in comm_map.items():
        if not members:
            continue
        scores = [float(g.nodes[m].get("risk_score", 0.0)) for m in members]
        shells = [m for m in members if g.nodes[m].get("entity_type") == "shell_company"]
        avg_score = float(sum(scores) / len(scores))
        max_score = float(max(scores))

        vol = 0.0
        for m in members:
            for _, _, d in g.out_edges(m, data=True):
                vol += d.get("amount", 0.0)

        # Risk tier
        if avg_score >= 80.0 or max_score >= 95.0:
            tier = "critical" if max_score >= 99.0 else "high"
        elif avg_score >= 50.0:
            tier = "medium"
        else:
            tier = "low"

        summaries.append(CommunitySummary(
            community_id=int(c_id),
            member_count=len(members),
            shell_company_count=len(shells),
            shell_density=round(len(shells) / len(members), 3),
            avg_risk_score=round(avg_score, 1),
            max_risk_score=round(max_score, 1),
            risk_tier=tier,
            total_volume=round(vol, 2),
            sample_members=members[:8]
        ))

    # Sort descending by max risk score
    summaries.sort(key=lambda x: x.max_risk_score, reverse=True)
    return summaries
