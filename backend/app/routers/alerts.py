import json
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..schemas import AlertSummary
from ..database import get_db
from ..models import Alert

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertSummary])
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.sent_at.desc()).limit(100).all()
    res = []
    for a in alerts:
        cycle_entities = None
        if a.cycle_entities:
            try:
                cycle_entities = json.loads(a.cycle_entities)
            except Exception:
                cycle_entities = [a.cycle_entities]

        res.append(AlertSummary(
            alert_id=a.alert_id,
            alert_source=a.alert_source,
            entity_id=a.entity_id,
            cycle_entities=cycle_entities,
            risk_score=a.risk_score,
            message=a.message,
            sent_at=a.sent_at.isoformat() if a.sent_at else "",
            slack_status=a.slack_status or "skipped"
        ))
    return res
