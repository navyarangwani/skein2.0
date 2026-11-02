from fastapi import APIRouter
from ..schemas import StreamStatusResponse, StreamControlRequest
from ..services.stream_pipeline import stream_pipeline

router = APIRouter(prefix="/stream", tags=["Streaming"])

@router.post("/start", response_model=StreamStatusResponse)
def start_stream(req: StreamControlRequest):
    rate = req.rate_per_second if req.rate_per_second else 5.0
    stream_pipeline.start_producer(rate_per_second=rate, dataset_path=req.dataset_path)
    return stream_pipeline.get_status()

@router.post("/stop", response_model=StreamStatusResponse)
def stop_stream():
    stream_pipeline.stop_producer()
    return stream_pipeline.get_status()

@router.get("/status", response_model=StreamStatusResponse)
def get_stream_status():
    return stream_pipeline.get_status()
