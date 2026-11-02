import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import DATA_DIR
from .database import init_db
from .services.stream_pipeline import stream_pipeline
from .neo4j_client import graph_client
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

    # Auto-seed the graph snapshot if currently empty so it is demo-ready immediately on launch
    snapshot = graph_client.get_graph_snapshot()
    if len(snapshot.get("nodes", [])) == 0:
        logger.info("Auto-seeding initial graph snapshot for immediate demo readiness...")
        try:
            from ..data_generator.generate_synthetic_data import stream_transactions
            from .services.gnn.train import train_link_predictor
            from .services.gnn.infer import infer_predicted_links

            count = 0
            for txn in stream_transactions():
                stream_pipeline.process_transaction(txn)
                count += 1
                if count >= 300:
                    break
            logger.info(f"Seeded {count} transactions into graph.")

            # Trigger batch run for Louvain, PageRank, Betweenness, Isolation Forest
            stream_pipeline.trigger_batch_run(triggered_by="startup_auto_seed")

            # Pre-seed Inductive GraphSAGE GNN Predictions
            try:
                train_res = train_link_predictor(epochs=15)
                preds = infer_predicted_links(train_res, top_k=6)
                graph_client.write_predicted_links(preds)
                logger.info(f"Generated {len(preds)} initial GNN link predictions.")
            except Exception as gnn_err:
                logger.warning(f"Initial GNN pre-train skipped: {gnn_err}")

        except Exception as seed_err:
            logger.error(f"Failed to auto-seed initial graph: {seed_err}")

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
