import time
import uuid
import asyncio
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from ..schemas import BatchRunResponse
from ..database import get_db
from ..models import BatchRun
from ..services.stream_pipeline import stream_pipeline

router = APIRouter(prefix="/batch", tags=["Batch Analytics"])

@router.post("/run", response_model=BatchRunResponse)
async def trigger_manual_batch(request: Request, db: Session = Depends(get_db)):
    start_time = time.time()
    run_id = f"RUN_{uuid.uuid4().hex[:8].upper()}"

    # Get asyncio event loop
    loop = asyncio.get_event_loop()

    # Trigger batch run
    stream_pipeline.trigger_batch_run(loop=loop, triggered_by="manual")

    from ..services.risk_scorer import run_risk_scoring
    score_res = run_risk_scoring()

    duration_ms = int((time.time() - start_time) * 1000)
    entities_scored = score_res.get("entities_scored", 0)
    high_risk_count = score_res.get("high_risk_count", 0)
    auc = score_res.get("evaluation", {}).get("roc_auc")

    # Record in database
    run_record = BatchRun(
        run_id=run_id,
        triggered_by="manual",
        duration_ms=duration_ms,
        entities_scored=entities_scored,
        high_risk_count=high_risk_count
    )
    db.add(run_record)
    db.commit()

    return BatchRunResponse(
        run_id=run_id,
        duration_ms=duration_ms,
        entities_scored=entities_scored,
        high_risk_count=high_risk_count,
        auc_score=auc
    )
