from typing import List
from fastapi import APIRouter
from ..schemas import CycleSummary
from ..neo4j_client import graph_client

router = APIRouter(prefix="/cycles", tags=["Cycles"])

@router.get("", response_model=List[CycleSummary])
def get_cycles():
    cycles = graph_client.get_cycles()
    res = []
    for c in cycles:
        res.append(CycleSummary(
            cycle_id=c.get("cycle_id", "CYC_001"),
            entities=c.get("entities", []),
            length=c.get("length", len(c.get("entities", []))),
            total_volume=float(c.get("total_volume", 0.0)),
            source=c.get("source", "speed_layer"),
            detected_at=c.get("detected_at", "")
        ))
    return res
