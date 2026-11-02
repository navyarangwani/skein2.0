import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
DATA_DIR = PROJECT_ROOT / "data" / "sample_output"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Load .env file
load_dotenv(BASE_DIR / ".env")

# Database / Neo4j
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "skein_dev_password")

# Redis
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
STREAM_KEY = "transactions:incoming"
CONSUMER_GROUP = "skein-consumers"
CONSUMER_NAME = "consumer-1"

# Alerting
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
ALERT_THRESHOLD = float(os.getenv("ALERT_THRESHOLD", "85.0"))

# Thresholds
BATCH_TXN_THRESHOLD = int(os.getenv("BATCH_TXN_THRESHOLD", "50"))
BATCH_TIME_THRESHOLD_SEC = int(os.getenv("BATCH_TIME_THRESHOLD_SEC", "30"))
MODEL_RETRAIN_TXN_THRESHOLD = int(os.getenv("MODEL_RETRAIN_TXN_THRESHOLD", "200"))
MODEL_RETRAIN_TIME_THRESHOLD_SEC = int(os.getenv("MODEL_RETRAIN_TIME_THRESHOLD_SEC", "300"))

# AI Narrator
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# SQLite Metadata Store
SQLITE_DB_PATH = BASE_DIR / "skein_metadata.db"
DATABASE_URL = f"sqlite:///{SQLITE_DB_PATH}"
