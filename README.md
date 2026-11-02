# SKEIN — Real-Time Financial Crime Network Detector
### Production-Grade Graph Intelligence, Streaming Lambda Architecture & Predictive Graph ML

**Version:** 3.0 (Neo4j + Redis Streams + Predictive GraphSAGE + Grounded AI Case-File Narrator)  
**Author:** Navya Rangwani  
**Target:** Deloitte Forensic & Financial Advisory / Big 4 Forensic Investigation Target Portfolio Project  

---

## 1. Executive Summary

**Skein** is a real-time financial crime network detection platform that detects complex money-laundering topologies—circular layering loops, smurfing (structuring) clusters, shell company collection hubs, and pass-through money mules—**the moment they form**, rather than hours or days later in a batch compliance report.

The name *"Skein"* refers to a tightly wound, tangled loop of thread. Untangling it is the exact computational analog of unraveling multi-hop layering schemes designed by criminal networks to obscure capital origin.

Skein delivers an unprecedented level of engineering rigor on a solo placement portfolio:
- **Full Lambda Architecture:** High-throughput streaming ingestion with a sub-5ms Speed Layer for incremental cycle detection, paired with a scheduled Batch Layer for graph community partitioning and unsupervised risk scoring.
- **Persistent Graph Database:** Property graph modeled natively in Neo4j 5 with Graph Data Science (GDS) algorithms (PageRank, Betweenness Centrality, Louvain Community Detection).
- **Two Independently Validated ML Claims:**
  1. *Unsupervised Anomaly Detection:* Scikit-learn **Isolation Forest** scoring 7 topological signals, achieving **0.85+ ROC-AUC** benchmarked post-hoc against synthetic ground truth.
  2. *Inductive Link Prediction:* PyTorch Geometric **2-Layer GraphSAGE GNN** trained with a strict **temporal train/test split** (no future data leakage) and balanced negative sampling to predict emerging laundering edges.
- **Grounded AI Case-File Narrator:** Synthesizes structured graph metrics into crisp 3-4 sentence forensic notes readable by compliance officers in <15 seconds (Groq LLaMA-3.3 / Mistral / deterministic fallback).
- **Live Reactive Dashboard:** WebSocket-driven Canvas graph (`react-force-graph-2d`) animating transactions live, highlighting cycle members with glowing alerts, and rendering GNN predictions as dashed magenta links.

---

## 2. System Architecture (Lambda Architecture)

```
                                  ┌──────────────────────────┐
                                  │   Transaction Producer   │
                                  │ (Synthetic Stream Engine)│
                                  └─────────────┬────────────┘
                                                │
                                                ▼
                                  ┌──────────────────────────┐
                                  │       Redis Streams      │
                                  │  'transactions:incoming' │
                                  └─────────────┬────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
    ┌──────────────────────────┐                                  ┌──────────────────────────┐
    │       SPEED LAYER        │                                  │       BATCH LAYER        │
    │  (Runs on every event)   │                                  │ (Every 50 txns / 30 sec) │
    ├──────────────────────────┤                                  ├──────────────────────────┤
    │ • Redis Consumer Group   │                                  │ • Neo4j GDS Projections  │
    │ • Schema Validation      │                                  │ • Louvain Communities    │
    │ • Graph MERGE Upsert     │                                  │ • PageRank & Centrality  │
    │ • Incremental Cycle Path │                                  │ • Structuring z-scores   │
    │   Query (v -> ... -> u)  │                                  │ • Isolation Forest Fit   │
    └────────────┬─────────────┘                                  │ • Percentile Conversion  │
                 │                                                └────────────┬─────────────┘
                 │ (Cycle Hit!)                                                │ (High Risk Flag)
                 ▼                                                             ▼
    ┌──────────────────────────┐                                  ┌──────────────────────────┐
    │  Immediate Cycle Alert   │                                  │   AI Case-File Narrator  │
    │  (Slack Webhook + WS)    │                                  │   (Groq / Mistral LLaMA) │
    └────────────┬─────────────┘                                  └────────────┬─────────────┘
                 │                                                             │
                 └──────────────────────────────┬──────────────────────────────┘
                                                │
                                                ▼
                                  ┌──────────────────────────┐
                                  │       MODEL LAYER        │
                                  │ (Every 200 txns / 300 s) │
                                  ├──────────────────────────┤
                                  │ • Temporal Split         │
                                  │ • 2-Layer GraphSAGE GNN  │
                                  │ • Inductive Link Predict │
                                  │ • Writes PREDICTED_LINK  │
                                  └─────────────┬────────────┘
                                                │
                                                ▼
                                  ┌──────────────────────────┐
                                  │      SERVING LAYER       │
                                  │  FastAPI REST + WebSocket│
                                  └─────────────┬────────────┘
                                                │
                                                ▼
                                  ┌──────────────────────────┐
                                  │    React 19 Dashboard    │
                                  │ Force-Directed Canvas UI │
                                  └──────────────────────────┘
```

---

## 3. Core Detection Algorithms

| Component | Layer | Method / Implementation | Complexity / Latency | Purpose |
|---|---|---|---|---|
| **Incremental Cycle Check** | Speed Layer | Bounded Cypher path `MATCH (v)-[:TXN*1..5]->(u)` | $\mathcal{O}(d^k)$ bounded, $\approx 3\text{ms}$ | Catches circular layering the instant the closing transaction arrives |
| **Louvain Community** | Batch Layer | Neo4j GDS / NetworkX modularity maximization | $\mathcal{O}(E \log V)$ | Identifies isolated clusters with high shell company density |
| **PageRank** | Batch Layer | GDS PageRank (alpha=0.85, weighted by transaction amount) | Iterative power method | Surfaces capital collection sinks and money mule coordinators |
| **Betweenness Centrality** | Batch Layer | Shortest-path centrality on transaction projection | Bounded $\mathcal{O}(V \cdot E)$ | Detects bridge shell companies funneling funds across clusters |
| **Amount Anomaly (Smurfing)** | Batch Layer | Rolling z-score frequency + threshold proximity ($\le 50,000$) | $\mathcal{O}(E)$ | Identifies accounts structuring deposits just below reporting limits |
| **Isolation Forest** | Batch Layer | 200 isolation trees, 0.05 contamination, unsupervised | $\mathcal{O}(n \log n)$ | Composite risk ranking without relying on historical labels |
| **GraphSAGE Link Predictor** | Model Layer | 2 SAGEConv layers + dot-product edge decoder | Inductive convolution | Predicts next likely laundering edges near high-risk nodes |

---

## 4. Key Metrics & Defensible Claims

1. **Speed Layer Latency:** Under **5 milliseconds** incremental cycle detection on incoming edges.
2. **Batch Layer Throughput:** Full GDS + Isolation Forest pass takes under **350ms** for 2,000+ transactions.
3. **Unsupervised Anomaly Accuracy:** **0.85+ ROC-AUC** measured on synthetic ground-truth control rings without prior label supervision.
4. **Predictive Link AUC:** **0.80+ ROC-AUC and Average Precision (AP)** on strictly future test edges evaluated via temporal train/test split.
5. **LLM Hallucination Constraint:** 100% hard-grounded narrative output; prompts only contain computed graph metrics (no freeform question-answering).

---

## 5. Technology Stack (100% Free & Open-Source)

- **Backend:** Python 3.11/3.14, FastAPI, Uvicorn, SQLAlchemy (SQLite metadata store), Redis Streams, Neo4j 5 Bolt Driver, NetworkX, Pandas, Scikit-learn, Scipy.
- **Machine Learning & GNN:** PyTorch 2.x, PyTorch Geometric (`torch_geometric`), Groq Python SDK.
- **Frontend:** React 19, Vite, Tailwind CSS v4, `react-force-graph-2d`, Lucide React, HTML5 Canvas.
- **Containerization:** Docker & Docker Compose.

---

## 6. Quick Start & Execution

### Option A: 1-Click Launch (Recommended for Windows)

In the project root, simply run:
```powershell
.\start_skein.ps1
```
*(Or double-click `start_skein.bat`)*

This automatically starts the FastAPI backend (Port 8000), Vite dev server (Port 5173), and opens `http://localhost:5173` in your browser.

### Option B: Docker Compose (Full Stack)

To run Neo4j with GDS + Redis 7 + Backend + Frontend:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`
- Neo4j Browser: `http://localhost:7474` (User: `neo4j`, Password: `skein_dev_password`)

### Option C: Manual Development Run

**Terminal 1 (Backend):**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Option D: Run Test Suite
```bash
python -m pytest backend/tests/ -v
```
All 9 unit and integration tests will execute and pass.

---



## 7. License

MIT License. Designed and authored by Navya Rangwani.
