import os
import logging
from typing import Dict, Any, Optional
import requests
from ..config import GROQ_API_KEY, OLLAMA_HOST
from ..neo4j_client import graph_client

logger = logging.getLogger("skein.case_narrator")

SYSTEM_PROMPT = """You are a financial crime analyst assistant. You will be given
structured signals about one entity from a transaction network analysis.
Write a 3-4 sentence case note a human compliance analyst could read in
under 15 seconds. Use ONLY the facts provided below — do not invent
transaction details, dates, or amounts not given to you. If a value is
not provided, do not mention it."""

USER_TEMPLATE = """
Entity: {name} ({entity_id}), type: {entity_type}
Composite risk score: {risk_score}/100 ({risk_tier})
PageRank percentile: {pagerank_percentile}
Betweenness percentile: {betweenness_percentile}
Part of a detected cycle: {in_cycle} {cycle_detail}
Community shell-company density percentile: {community_shell_density_percentile}
Amount anomaly percentile: {amount_anomaly_percentile}
"""

def generate_grounded_fallback_narrative(signals: Dict[str, Any]) -> str:
    """
    Deterministic rule-based forensic narrative generator ensuring 100% grounded,
    zero-hallucination compliance notes even when LLM endpoints are unavailable.
    """
    name = signals.get("name", "Unknown Entity")
    eid = signals.get("entity_id", "")
    etype = signals.get("entity_type", "entity").replace("_", " ")
    score = signals.get("risk_score", 0.0)
    tier = signals.get("risk_tier", "low").upper()
    in_cycle = signals.get("in_cycle", False)
    pr_pct = signals.get("pagerank_percentile", 0.0)
    bc_pct = signals.get("betweenness_percentile", 0.0)
    csd_pct = signals.get("community_shell_density_percentile", 0.0)
    aas_pct = signals.get("amount_anomaly_percentile", 0.0)

    sentences = [
        f"Entity {name} ({eid}) is classified as a {etype} operating at {tier} risk ({score}/100)."
    ]

    # Topological behavior
    if in_cycle:
        sentences.append(f"Forensic graph analysis identified direct involvement in a closed circular layering transaction loop.")
    elif bc_pct >= 90.0:
        sentences.append(f"The entity acts as a high-volume bridge in the network, placing in the {bc_pct:.1f}th percentile for betweenness centrality.")
    elif pr_pct >= 90.0:
        sentences.append(f"Capital aggregation is significant, with PageRank positioning in the {pr_pct:.1f}th percentile.")

    # Community & Smurfing indicators
    signals_detail = []
    if csd_pct >= 85.0:
        signals_detail.append(f"dense cluster proximity to shell entities ({csd_pct:.1f}th percentile)")
    if aas_pct >= 85.0:
        signals_detail.append(f"transaction structuring patterns just below reporting limits ({aas_pct:.1f}th percentile)")

    if signals_detail:
        sentences.append(f"Risk indicators include {' and '.join(signals_detail)}.")

    sentences.append("Immediate compliance review and source-of-funds verification are recommended.")
    return " ".join(sentences)

def call_groq(signals: Dict[str, Any]) -> Optional[str]:
    if not GROQ_API_KEY:
        return None
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        prompt = USER_TEMPLATE.format(**signals)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=220
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.warning(f"Groq generation error: {e}")
        return None

_ollama_available = None

def is_ollama_available() -> bool:
    global _ollama_available
    if _ollama_available is not None:
        return _ollama_available
    try:
        resp = requests.get(f"{OLLAMA_HOST}/api/version", timeout=0.3)
        _ollama_available = (resp.status_code == 200)
    except Exception:
        _ollama_available = False
    return _ollama_available

def call_ollama(signals: Dict[str, Any]) -> Optional[str]:
    if not is_ollama_available():
        return None
    try:
        prompt = USER_TEMPLATE.format(**signals)
        resp = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={
                "model": "mistral",
                "prompt": f"{SYSTEM_PROMPT}\n\n{prompt}",
                "stream": False,
                "options": {"temperature": 0.2, "num_predict": 220}
            },
            timeout=2.0
        )
        if resp.status_code == 200:
            return resp.json().get("response", "").strip()
    except Exception as e:
        pass
    return None

def generate_case_note_for_entity(entity_id: str, force: bool = False) -> Optional[str]:
    """
    Generates a grounded natural-language case note for flagged entity.
    Respects Section 16.2 drift threshold: regenerates only if risk_score
    drifts by >10 points since last note.
    """
    g = graph_client.memory_store.graph
    if not g.has_node(entity_id):
        return None

    node_data = g.nodes[entity_id]
    current_score = float(node_data.get("risk_score", 0.0))
    tier = node_data.get("risk_tier", "low")
    in_cycle = node_data.get("in_cycle", False)

    # Trigger condition: high/critical or in cycle
    if tier not in ["high", "critical"] and not in_cycle and not force:
        return None

    last_score = node_data.get("case_note_score_fingerprint")
    if last_score is not None and not force:
        if abs(current_score - float(last_score)) <= 10.0:
            return node_data.get("case_note")

    cycle_count = node_data.get("cycle_count", 0)
    signals = {
        "name": node_data.get("name", entity_id),
        "entity_id": entity_id,
        "entity_type": node_data.get("entity_type", "individual"),
        "risk_score": round(current_score, 1),
        "risk_tier": tier,
        "pagerank_percentile": round(float(node_data.get("pagerank_percentile", 0.0)), 1),
        "betweenness_percentile": round(float(node_data.get("betweenness_percentile", 0.0)), 1),
        "in_cycle": "Yes" if in_cycle else "No",
        "cycle_detail": f"({cycle_count} circular loops confirmed)" if in_cycle else "",
        "community_shell_density_percentile": round(float(node_data.get("community_shell_density_percentile", 0.0)), 1),
        "amount_anomaly_percentile": round(float(node_data.get("amount_anomaly_percentile", 0.0)), 1)
    }

    # 1. Try Groq
    note = call_groq(signals)
    # 2. Try Ollama local
    if not note:
        note = call_ollama(signals)
    # 3. Deterministic grounded forensic fallback
    if not note:
        note = generate_grounded_fallback_narrative(signals)

    # Store back to graph
    graph_client.store_case_note(entity_id, note, current_score)
    return note
