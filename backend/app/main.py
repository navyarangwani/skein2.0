import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import DATA_DIR
from .database import init_db
from .services.stream_pipeline import stream_pipeline
from .routers import (
    dataset,
    stream,
    graph,
    entities,
    communities,
    cycles,
    alerts,
    batch,
    health,
    websocket
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("skein.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Skein Financial Crime Network Detector...")
    init_db()

    loop = asyncio.get_running_loop()
    stream_pipeline.start_consumer(loop)

    # Check if dataset exists; if not, generate default so system is demo-ready immediately
    transactions_csv = DATA_DIR / "transactions.csv"
    if not transactions_csv.exists():
        logger.info("No synthetic dataset found. Generating initial dataset for immediate real-time usage...")
        from ..data_generator.generate_synthetic_data import generate_dataset
        generate_dataset(num_entities=400, num_transactions=1500)

    yield

    # Shutdown
    logger.info("Shutting down Skein services...")
    stream_pipeline.stop_producer()
    stream_pipeline.is_consumer_running = False

app = FastAPI(
    title="SKEIN — Real-Time Financial Crime Network Detector",
    description="Full Lambda Architecture AML & Fraud Detection System with Speed Layer, Neo4j Graph DB, Isolation Forest Anomaly Scoring, Inductive GraphSAGE Link Prediction, and AI Case-File Narrator.",
    version="3.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(dataset.router, prefix="/api")
app.include_router(stream.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(entities.router, prefix="/api")
app.include_router(communities.router, prefix="/api")
app.include_router(cycles.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(batch.router, prefix="/api")
app.include_router(health.router, prefix="/api")

# Include WebSocket router directly
app.include_router(websocket.router)

@app.get("/")
def root():
    return {
        "system": "SKEIN Financial Crime Network Detector",
        "version": "3.0",
        "docs_url": "/docs",
        "api_prefix": "/api",
        "ws_endpoint": "/ws/live"
    }
