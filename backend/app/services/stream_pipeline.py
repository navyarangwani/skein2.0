import asyncio
import json
import logging
import queue
import socket
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

import redis

from ..config import (
    REDIS_HOST,
    REDIS_PORT,
    STREAM_KEY,
    CONSUMER_GROUP,
    CONSUMER_NAME,
    BATCH_TXN_THRESHOLD,
    BATCH_TIME_THRESHOLD_SEC,
    MODEL_RETRAIN_TXN_THRESHOLD,
    MODEL_RETRAIN_TIME_THRESHOLD_SEC,
    DATA_DIR
)
from ..neo4j_client import graph_client
from .connection_manager import ws_manager
from .alert_service import send_speed_layer_alert, send_batch_layer_alert
from .case_narrator import generate_case_note_for_entity
from .gds_runner import execute_batch_analytics
from .risk_scorer import run_risk_scoring

logger = logging.getLogger("skein.streaming")

class StreamPipeline:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.is_redis_active = False
        self.memory_queue = queue.Queue()
        self.is_producer_running = False
        self.is_consumer_running = False
        self.producer_thread: Optional[threading.Thread] = None
        self.consumer_thread: Optional[threading.Thread] = None

        self.rate_per_second: float = 5.0
        self.transactions_processed = 0
        self.last_processed_timestamp: Optional[str] = None
        self.last_batch_run_time = time.time()
        self.txn_count_since_last_batch = 0
        self.txn_count_since_last_gnn = 0
        self.last_gnn_run_time = time.time()

        self._check_redis()

    def _check_redis(self):
        try:
            with socket.create_connection((REDIS_HOST, REDIS_PORT), timeout=0.2):
                pass
        except OSError:
            self.is_redis_active = False
            self.redis_client = None
            logger.info("Redis port not active; operating with in-memory streaming queue.")
            return

        try:
            r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True, socket_timeout=1.0)
            r.ping()
            self.redis_client = r
            self.is_redis_active = True
            logger.info(f"Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
            try:
                self.redis_client.xgroup_create(STREAM_KEY, CONSUMER_GROUP, id="0", mkstream=True)
            except redis.exceptions.ResponseError as e:
                if "BUSYGROUP" not in str(e):
                    logger.warning(f"Redis consumer group creation: {e}")
        except Exception as e:
            self.is_redis_active = False
            self.redis_client = None
            logger.info(f"Redis connection error ({e}); operating with in-memory streaming queue.")

    def emit_transaction(self, txn: Dict[str, Any]):
        """
        Emits transaction to Redis stream or in-memory queue.
        """
        # Ensure all fields are strings or native types
        payload = {k: str(v) for k, v in txn.items()}
        if self.is_redis_active and self.redis_client:
            try:
                self.redis_client.xadd(STREAM_KEY, payload)
                return
            except Exception as e:
                logger.warning(f"Redis XADD failed, falling back to memory queue: {e}")
        self.memory_queue.put(txn)

    def start_producer(self, rate_per_second: float = 5.0, dataset_path: Optional[str] = None):
        if self.is_producer_running:
            self.rate_per_second = rate_per_second
            return

        self.rate_per_second = rate_per_second
        self.is_producer_running = True

        def producer_worker():
            from ...data_generator.generate_synthetic_data import stream_transactions
            path = Path(dataset_path) if dataset_path else (DATA_DIR / "transactions.csv")
            logger.info(f"Stream producer started from {path} at {self.rate_per_second} txns/sec")

            while self.is_producer_running:
                for txn in stream_transactions(path):
                    if not self.is_producer_running:
                        break
                    self.emit_transaction(txn)
                    sleep_time = max(0.001, 1.0 / self.rate_per_second)
                    time.sleep(sleep_time)

                # If finished entire dataset, loop or wait
                time.sleep(1.0)
            logger.info("Stream producer stopped.")

        self.producer_thread = threading.Thread(target=producer_worker, daemon=True)
        self.producer_thread.start()

    def stop_producer(self):
        self.is_producer_running = False

    def process_transaction(self, txn: Dict[str, Any], loop: Optional[asyncio.AbstractEventLoop] = None):
        """
        Speed Layer: Ingest event, MERGE into graph, check cycle, trigger alerts/broadcasts.
        """
        self.transactions_processed += 1
        self.txn_count_since_last_batch += 1
        self.txn_count_since_last_gnn += 1
        self.last_processed_timestamp = txn.get("timestamp", datetime.utcnow().isoformat())

        # 1. Upsert into Graph Store + Incremental Cycle Check (Speed Layer)
        cycle_hit = graph_client.upsert_transaction(txn)

        # 2. If cycle detected in real-time speed layer
        if cycle_hit:
            cycle_entities = cycle_hit["entities"]
            vol = cycle_hit["total_volume"]
            logger.warning(f"SPEED LAYER CYCLE DETECTED: {cycle_entities} (Vol: {vol})")
            send_speed_layer_alert(cycle_entities, vol)

            if loop and loop.is_running():
                asyncio.run_coroutine_threadsafe(
                    ws_manager.broadcast({
                        "type": "cycle_detected",
                        "cycle_id": cycle_hit["cycle_id"],
                        "entities": cycle_entities,
                        "total_volume": vol,
                        "length": cycle_hit["length"],
                        "detected_at": cycle_hit["detected_at"],
                        "source": "speed_layer"
                    }),
                    loop
                )

        # 3. Broadcast new transaction
        if loop and loop.is_running():
            asyncio.run_coroutine_threadsafe(
                ws_manager.broadcast({
                    "type": "new_transaction",
                    "transaction_id": txn.get("transaction_id"),
                    "source": txn.get("source_entity_id"),
                    "target": txn.get("destination_entity_id"),
                    "amount": float(txn.get("amount", 0.0)),
                    "timestamp": txn.get("timestamp")
                }),
                loop
            )

        # 4. Check Batch Layer trigger conditions
        elapsed_batch = time.time() - self.last_batch_run_time
        if self.txn_count_since_last_batch >= BATCH_TXN_THRESHOLD or elapsed_batch >= BATCH_TIME_THRESHOLD_SEC:
            self.trigger_batch_run(loop)

        # 5. Check Model Layer trigger conditions (GNN retrain)
        elapsed_gnn = time.time() - self.last_gnn_run_time
        if self.txn_count_since_last_gnn >= MODEL_RETRAIN_TXN_THRESHOLD or elapsed_gnn >= MODEL_RETRAIN_TIME_THRESHOLD_SEC:
            self.trigger_model_run(loop)

    def trigger_batch_run(self, loop: Optional[asyncio.AbstractEventLoop] = None, triggered_by: str = "schedule"):
        """
        Batch Layer execution:
        - GDS Louvain, PageRank, Betweenness
        - Isolation Forest Risk Scoring
        - Ground truth ROC-AUC validation
        - Batch alerts + AI Case-file Narrator
        - WebSocket broadcast
        """
        start_time = time.time()
        self.txn_count_since_last_batch = 0
        self.last_batch_run_time = time.time()

        try:
            logger.info("Executing Batch Layer analytics pass...")
            execute_batch_analytics()
            score_res = run_risk_scoring()

            duration_ms = int((time.time() - start_time) * 1000)
            high_risk_entities = score_res.get("high_risk_entities", [])

            # Generate AI Case Notes and Send Batch Alerts for high-risk entities
            for item in high_risk_entities[:5]:  # limit top items per batch to control alerts
                eid = item["entity_id"]
                score = item["composite_risk_score"]
                name = graph_client.memory_store.graph.nodes[eid].get("name", eid)
                note = generate_case_note_for_entity(eid)
                send_batch_layer_alert(name, score, eid, note)

            logger.info(f"Batch Layer complete in {duration_ms}ms. Scored {score_res.get('entities_scored')} entities.")

            if loop and loop.is_running():
                snapshot = graph_client.get_graph_snapshot()
                asyncio.run_coroutine_threadsafe(
                    ws_manager.broadcast({
                        "type": "batch_complete",
                        "duration_ms": duration_ms,
                        "entities_scored": score_res.get("entities_scored"),
                        "high_risk_count": score_res.get("high_risk_count"),
                        "evaluation": score_res.get("evaluation", {}),
                        "stats": snapshot["stats"]
                    }),
                    loop
                )
                asyncio.run_coroutine_threadsafe(
                    ws_manager.broadcast({
                        "type": "risk_update",
                        "entities": high_risk_entities
                    }),
                    loop
                )
        except Exception as e:
            logger.error(f"Error in batch run: {e}", exc_info=True)

    def trigger_model_run(self, loop: Optional[asyncio.AbstractEventLoop] = None):
        """
        Model Layer execution:
        - Retrain inductive GraphSAGE link predictor
        - Score emerging 2-hop edges near high-risk entities
        - Store PREDICTED_LINK relationships
        """
        self.txn_count_since_last_gnn = 0
        self.last_gnn_run_time = time.time()

        def model_worker():
            try:
                logger.info("Running Model Layer (GraphSAGE link prediction retrain)...")
                from .gnn.train import train_link_predictor
                from .gnn.infer import infer_predicted_links

                train_res = train_link_predictor(epochs=40)
                if train_res.get("status") == "trained":
                    predictions = infer_predicted_links(train_res, top_k=12)
                    logger.info(f"GNN Retrained (AUC: {train_res.get('roc_auc')}, AP: {train_res.get('average_precision')}). Inferred {len(predictions)} predicted links.")
                    if loop and loop.is_running():
                        asyncio.run_coroutine_threadsafe(
                            ws_manager.broadcast({
                                "type": "model_complete",
                                "roc_auc": train_res.get("roc_auc"),
                                "average_precision": train_res.get("average_precision"),
                                "predicted_links": predictions
                            }),
                            loop
                        )
            except Exception as e:
                logger.warning(f"Model layer execution error: {e}")

        threading.Thread(target=model_worker, daemon=True).start()

    def start_consumer(self, loop: asyncio.AbstractEventLoop):
        if self.is_consumer_running:
            return
        self.is_consumer_running = True

        def consumer_worker():
            logger.info("Stream consumer loop started.")
            while self.is_consumer_running:
                # 1. Try Redis
                if self.is_redis_active and self.redis_client:
                    try:
                        events = self.redis_client.xreadgroup(
                            CONSUMER_GROUP,
                            CONSUMER_NAME,
                            {STREAM_KEY: ">"},
                            count=10,
                            block=2000
                        )
                        if events:
                            for stream_key, messages in events:
                                for message_id, data in messages:
                                    self.process_transaction(data, loop)
                                    self.redis_client.xack(STREAM_KEY, CONSUMER_GROUP, message_id)
                        continue
                    except Exception as e:
                        logger.warning(f"Redis consumer error, checking memory queue: {e}")

                # 2. In-memory queue
                try:
                    txn = self.memory_queue.get(timeout=1.0)
                    self.process_transaction(txn, loop)
                    self.memory_queue.task_done()
                except queue.Empty:
                    pass

        self.consumer_thread = threading.Thread(target=consumer_worker, daemon=True)
        self.consumer_thread.start()

    def get_status(self) -> Dict[str, Any]:
        lag = 0
        if self.is_redis_active and self.redis_client:
            try:
                info = self.redis_client.xinfo_groups(STREAM_KEY)
                for g in info:
                    if g.get("name") == CONSUMER_GROUP:
                        lag = g.get("lag", 0)
            except Exception:
                lag = 0
        else:
            lag = self.memory_queue.qsize()

        return {
            "is_running": self.is_producer_running,
            "rate_per_second": self.rate_per_second,
            "transactions_processed": self.transactions_processed,
            "queue_lag": lag,
            "last_processed_timestamp": self.last_processed_timestamp,
            "last_batch_run_time": datetime.fromtimestamp(self.last_batch_run_time).isoformat(),
            "connected_clients": ws_manager.client_count,
            "mode": "redis" if self.is_redis_active else "memory"
        }

stream_pipeline = StreamPipeline()
