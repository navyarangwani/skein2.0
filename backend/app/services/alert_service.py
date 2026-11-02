import json
import logging
import uuid
from datetime import datetime
from typing import List, Optional
import requests

from ..config import SLACK_WEBHOOK_URL
from ..database import SessionLocal
from ..models import Alert

logger = logging.getLogger("skein.alert_service")

def send_slack_webhook(payload: dict) -> str:
    """
    Sends payload to Slack incoming webhook if configured.
    """
    if not SLACK_WEBHOOK_URL or not SLACK_WEBHOOK_URL.startswith("http") or "xxx/yyy/zzz" in SLACK_WEBHOOK_URL:
        return "skipped"
    try:
        resp = requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=2.0)
        return "sent" if resp.status_code == 200 else f"error_{resp.status_code}"
    except Exception as e:
        logger.warning(f"Slack webhook dispatch failed: {e}")
        return "failed"

def record_alert(
    source: str,
    message: str,
    entity_id: Optional[str] = None,
    cycle_entities: Optional[List[str]] = None,
    risk_score: Optional[float] = None,
    slack_status: str = "skipped"
):
    db = SessionLocal()
    try:
        alert_obj = Alert(
            alert_id=f"ALT_{uuid.uuid4().hex[:8].upper()}",
            alert_source=source,
            entity_id=entity_id,
            cycle_entities=json.dumps(cycle_entities) if cycle_entities else None,
            risk_score=risk_score,
            message=message,
            sent_at=datetime.utcnow(),
            slack_status=slack_status
        )
        db.add(alert_obj)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to record alert to DB: {e}")
    finally:
        db.close()

def send_speed_layer_alert(cycle_entities: List[str], total_volume: float):
    """
    Speed Layer Alert: Triggered immediately when an incremental cycle is closed.
    """
    text = (
        f":rotating_light: *Cycle Detected (Real-Time Speed Layer)*\n"
        f"Entities ({len(cycle_entities)}): {', '.join(cycle_entities)}\n"
        f"Total Flow Volume: ₹{total_volume:,.2f}\n"
        f"Pattern: Circular Layering Loop detected upon edge arrival."
    )
    status = send_slack_webhook({"text": text})
    record_alert(
        source="speed_layer",
        message=text,
        cycle_entities=cycle_entities,
        risk_score=None,
        slack_status=status
    )

def send_batch_layer_alert(entity_name: str, risk_score: float, entity_id: str, case_note: Optional[str] = None):
    """
    Batch Layer Alert: Triggered when entity batch risk score crosses alert threshold.
    """
    note_line = f"\n*Case Note:* {case_note}" if case_note else ""
    text = (
        f":bar_chart: *High-Risk Entity Flagged (Batch Scan)*\n"
        f"Entity: *{entity_name}* (`{entity_id}`) — Composite Risk Score: *{risk_score}/100*{note_line}"
    )
    status = send_slack_webhook({"text": text})
    record_alert(
        source="batch_layer",
        message=text,
        entity_id=entity_id,
        risk_score=risk_score,
        slack_status=status
    )
