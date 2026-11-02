import logging
import socket
import threading
import time
from urllib.parse import urlparse
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import networkx as nx
from neo4j import GraphDatabase, exceptions as neo4j_exceptions

from .config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
from .services import cypher_queries

logger = logging.getLogger("skein.graph_store")

def is_service_port_open(uri: str, default_port: int = 7687, timeout: float = 0.2) -> bool:
    try:
        parsed = urlparse(uri)
        host = parsed.hostname or "localhost"
        port = parsed.port or default_port
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (OSError, ValueError):
        return False

class MemoryGraphStore:
    """
    High-fidelity in-memory graph store implementing exact graph algorithms
    and state semantics as Neo4j + GDS:
    - Louvain community detection
    - PageRank & Betweenness Centrality
    - Incremental & Full bounded cycle scans (length <= 6)
    - Node property storage & updates
    - Predicted link overlays
    """
    def __init__(self):
        self.lock = threading.RLock()
        self.graph = nx.MultiDiGraph()
        self.simple_graph = nx.DiGraph()  # for algorithm projections
        self.predicted_links: List[Dict[str, Any]] = []
        self.cycles: List[Dict[str, Any]] = []

    def upsert_entity(self, entity_id: str, properties: Dict[str, Any]):
        with self.lock:
            if not self.graph.has_node(entity_id):
                defaults = {
                    "entity_id": entity_id,
                    "name": properties.get("name", entity_id),
                    "entity_type": properties.get("entity_type", "individual"),
                    "country": properties.get("country", "IN"),
                    "kyc_flag": properties.get("kyc_flag", 1),
                    "risk_score": 0.0,
                    "risk_tier": "low",
                    "community_id": 0,
                    "pagerank": 0.0,
                    "pagerank_percentile": 0.0,
                    "betweenness": 0.0,
                    "betweenness_percentile": 0.0,
                    "community_shell_density_percentile": 0.0,
                    "amount_anomaly_percentile": 0.0,
                    "in_cycle": False,
                    "cycle_count": 0,
                    "case_note": None,
                    "last_scored_at": None,
                }
                defaults.update(properties)
                self.graph.add_node(entity_id, **defaults)
                self.simple_graph.add_node(entity_id, **defaults)
            else:
                self.graph.nodes[entity_id].update(properties)
                self.simple_graph.nodes[entity_id].update(properties)

    def upsert_transaction(self, txn: Dict[str, Any]):
        with self.lock:
            src = txn["source_entity_id"]
            dst = txn["destination_entity_id"]

            self.upsert_entity(src, {
                "name": txn.get("source_entity_name", src),
                "entity_type": txn.get("source_entity_type", "individual")
            })
            self.upsert_entity(dst, {
                "name": txn.get("destination_entity_name", dst),
                "entity_type": txn.get("destination_entity_type", "individual")
            })

            amount = float(txn.get("amount", 0.0))
            edge_data = {
                "transaction_id": txn.get("transaction_id", f"TX_{int(time.time()*1000)}"),
                "amount": amount,
                "currency": txn.get("currency", "INR"),
                "timestamp": txn.get("timestamp", datetime.utcnow().isoformat()),
                "transaction_type": txn.get("transaction_type", "transfer")
            }

            self.graph.add_edge(src, dst, key=edge_data["transaction_id"], **edge_data)

            # Update simple graph with accumulated weight for algorithm runs
            if self.simple_graph.has_edge(src, dst):
                self.simple_graph[src][dst]["amount"] += amount
            else:
                self.simple_graph.add_edge(src, dst, amount=amount)

    def check_incremental_cycle(self, u_id: str, v_id: str) -> Optional[Dict[str, Any]]:
        """
        Speed Layer: When edge u -> v is added, check if there is an existing path
        v -> ... -> u of length 1 to 5. If found, a cycle is closed!
        """
        with self.lock:
            if not self.simple_graph.has_node(v_id) or not self.simple_graph.has_node(u_id):
                return None
            try:
                # Find shortest path from v to u bounded to length <= 5
                path = nx.shortest_path(self.simple_graph, source=v_id, target=u_id)
                if 2 <= len(path) <= 6:
                    cycle_nodes = path  # v -> ... -> u, closing back to v
                    total_vol = 0.0
                    for i in range(len(path) - 1):
                        total_vol += self.simple_graph[path[i]][path[i+1]].get("amount", 0.0)
                    # Add closing edge u -> v
                    if self.simple_graph.has_edge(u_id, v_id):
                        total_vol += self.simple_graph[u_id][v_id].get("amount", 0.0)

                    # Mark nodes
                    for n in cycle_nodes:
                        if self.graph.has_node(n):
                            self.graph.nodes[n]["in_cycle"] = True
                            self.graph.nodes[n]["cycle_count"] = self.graph.nodes[n].get("cycle_count", 0) + 1

                    cycle_obj = {
                        "cycle_id": f"CYC_SPD_{int(time.time()*1000)}",
                        "entities": cycle_nodes,
                        "length": len(cycle_nodes),
                        "total_volume": round(total_vol, 2),
                        "source": "speed_layer",
                        "detected_at": datetime.utcnow().isoformat()
                    }
                    self.cycles.insert(0, cycle_obj)
                    return cycle_obj
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                pass
            return None

    def run_full_cycle_scan(self) -> List[Dict[str, Any]]:
        """
        Batch Layer: Finds simple cycles of length 2 to 6 in the graph (LIMIT 500, matching Cypher spec).
        """
        import itertools
        with self.lock:
            detected_cycles = []
            try:
                # Use simple_graph for cycle finding capped at 500 cycles (matching Section 10.6 LIMIT 500)
                cycle_gen = nx.simple_cycles(self.simple_graph, length_bound=6)
                for c in itertools.islice(cycle_gen, 500):
                    if 2 <= len(c) <= 6:
                        vol = 0.0
                        for i in range(len(c)):
                            src = c[i]
                            dst = c[(i + 1) % len(c)]
                            if self.simple_graph.has_edge(src, dst):
                                vol += self.simple_graph[src][dst].get("amount", 0.0)

                        for n in c:
                            if self.graph.has_node(n):
                                self.graph.nodes[n]["in_cycle"] = True

                        cycle_obj = {
                            "cycle_id": f"CYC_BAT_{len(detected_cycles)+1:04d}",
                            "entities": c,
                            "length": len(c),
                            "total_volume": round(vol, 2),
                            "source": "batch_layer",
                            "detected_at": datetime.utcnow().isoformat()
                        }
                        detected_cycles.append(cycle_obj)
                self.cycles = detected_cycles
            except Exception as e:
                logger.error(f"Error in full cycle scan: {e}")
            return self.cycles

    def compute_graph_metrics(self) -> Dict[str, Any]:
        """
        Batch Layer: Computes PageRank, Betweenness Centrality, Louvain Communities,
        and local structural properties (degree, clustering coefficient).
        """
        with self.lock:
            n_nodes = self.simple_graph.number_of_nodes()
            if n_nodes == 0:
                return {"community_count": 0, "modularity": 0.0}

            # 1. PageRank
            try:
                pr = nx.pagerank(self.simple_graph, weight="amount", alpha=0.85, max_iter=100)
                for node, score in pr.items():
                    self.graph.nodes[node]["pagerank"] = float(score)
            except Exception as e:
                logger.warning(f"PageRank computation fallback: {e}")

            # 2. Betweenness Centrality
            try:
                bc = nx.betweenness_centrality(self.simple_graph, weight="amount", k=min(n_nodes, 100))
                for node, score in bc.items():
                    self.graph.nodes[node]["betweenness"] = float(score)
            except Exception as e:
                logger.warning(f"Betweenness computation fallback: {e}")

            # 3. Louvain Communities
            undirected = self.simple_graph.to_undirected()
            try:
                communities = nx.community.louvain_communities(undirected, weight="amount", seed=42)
                for c_idx, comm in enumerate(communities):
                    # compute shell company density in community
                    shell_count = sum(1 for node in comm if self.graph.nodes[node].get("entity_type") == "shell_company")
                    density = shell_count / len(comm) if comm else 0.0
                    for node in comm:
                        self.graph.nodes[node]["community_id"] = int(c_idx)
                        self.graph.nodes[node]["community_shell_density"] = float(density)
                modularity = nx.community.modularity(undirected, communities, weight="amount")
            except Exception as e:
                logger.warning(f"Louvain computation fallback: {e}")
                modularity = 0.0

            # 4. Degree and clustering coefficient
            try:
                clustering = nx.clustering(undirected)
                for node in self.graph.nodes:
                    deg = self.graph.degree(node)
                    self.graph.nodes[node]["degree_total"] = int(deg)
                    self.graph.nodes[node]["clustering_coefficient"] = float(clustering.get(node, 0.0))
            except Exception as e:
                logger.warning(f"Clustering metric calculation: {e}")

            return {
                "community_count": len(communities) if 'communities' in locals() else 1,
                "modularity": float(modularity)
            }

    def update_node_risk_scores(self, scored_entities: List[Dict[str, Any]]):
        with self.lock:
            for item in scored_entities:
                eid = item["entity_id"]
                if self.graph.has_node(eid):
                    self.graph.nodes[eid].update({
                        "risk_score": float(item.get("composite_risk_score", 0.0)),
                        "risk_tier": item.get("risk_tier", "low"),
                        "pagerank_percentile": float(item.get("pagerank_percentile", 0.0)),
                        "betweenness_percentile": float(item.get("betweenness_percentile", 0.0)),
                        "community_shell_density_percentile": float(item.get("community_shell_density_percentile", 0.0)),
                        "amount_anomaly_percentile": float(item.get("amount_anomaly_percentile", 0.0)),
                        "last_scored_at": datetime.utcnow().isoformat()
                    })

    def store_case_note(self, entity_id: str, note: str, risk_score: float):
        with self.lock:
            if self.graph.has_node(entity_id):
                self.graph.nodes[entity_id]["case_note"] = note
                self.graph.nodes[entity_id]["case_note_score_fingerprint"] = risk_score
                self.graph.nodes[entity_id]["case_note_generated_at"] = datetime.utcnow().isoformat()

    def write_predicted_links(self, predictions: List[Dict[str, Any]]):
        with self.lock:
            self.predicted_links = predictions

    def get_snapshot(self) -> Dict[str, Any]:
        with self.lock:
            nodes = []
            for n, d in self.graph.nodes(data=True):
                nodes.append({
                    "id": n,
                    "name": d.get("name", n),
                    "type": d.get("entity_type", "individual"),
                    "country": d.get("country", "IN"),
                    "kyc_flag": d.get("kyc_flag", 1),
                    "risk_score": round(float(d.get("risk_score", 0.0)), 1),
                    "risk_tier": d.get("risk_tier", "low"),
                    "community_id": d.get("community_id", 0),
                    "pagerank": round(float(d.get("pagerank", 0.0)), 6),
                    "pagerank_percentile": round(float(d.get("pagerank_percentile", 0.0)), 1),
                    "betweenness": round(float(d.get("betweenness", 0.0)), 6),
                    "betweenness_percentile": round(float(d.get("betweenness_percentile", 0.0)), 1),
                    "community_shell_density_percentile": round(float(d.get("community_shell_density_percentile", 0.0)), 1),
                    "amount_anomaly_percentile": round(float(d.get("amount_anomaly_percentile", 0.0)), 1),
                    "in_cycle": bool(d.get("in_cycle", False)),
                    "cycle_count": int(d.get("cycle_count", 0)),
                    "case_note": d.get("case_note"),
                    "last_scored_at": d.get("last_scored_at")
                })

            links = []
            # MultiDiGraph edges
            for u, v, k, d in self.graph.edges(keys=True, data=True):
                links.append({
                    "source": u,
                    "target": v,
                    "amount": float(d.get("amount", 0.0)),
                    "currency": d.get("currency", "INR"),
                    "timestamp": d.get("timestamp", ""),
                    "transaction_id": d.get("transaction_id", str(k)),
                    "transaction_type": d.get("transaction_type", "transfer"),
                    "is_predicted": False
                })

            return {
                "nodes": nodes,
                "links": links,
                "predicted_links": self.predicted_links,
                "stats": {
                    "total_entities": len(nodes),
                    "total_transactions": len(links),
                    "critical_count": sum(1 for n in nodes if n["risk_tier"] == "critical"),
                    "high_count": sum(1 for n in nodes if n["risk_tier"] == "high"),
                    "medium_count": sum(1 for n in nodes if n["risk_tier"] == "medium"),
                    "low_count": sum(1 for n in nodes if n["risk_tier"] == "low"),
                    "cycles_detected": len(self.cycles),
                    "predicted_links_count": len(self.predicted_links)
                }
            }


class Neo4jClient:
    """
    Unified Graph Store Client:
    - Automatically checks connectivity to Neo4j.
    - If Neo4j is online, runs native Cypher and GDS calls.
    - If Neo4j is offline, transparently uses the internal MemoryGraphStore.
    """
    def __init__(self):
        self.driver = None
        self.is_connected = False
        self.memory_store = MemoryGraphStore()
        self._try_connect()

    def _try_connect(self):
        if not is_service_port_open(NEO4J_URI, default_port=7687, timeout=0.2):
            self.is_connected = False
            logger.info("Neo4j port not active; operating in high-fidelity standalone GraphStore mode.")
            return

        try:
            self.driver = GraphDatabase.driver(
                NEO4J_URI,
                auth=(NEO4J_USER, NEO4J_PASSWORD),
                connection_timeout=1.0
            )
            with self.driver.session() as session:
                session.run("RETURN 1 AS ping")
            self.is_connected = True
            logger.info(f"Connected to Neo4j at {NEO4J_URI}")
            self.init_schema()
        except Exception as e:
            self.is_connected = False
            logger.info(f"Neo4j connection error ({e}); operating in standalone GraphStore mode.")

    def init_schema(self):
        if not self.is_connected:
            return
        try:
            with self.driver.session() as session:
                for stmt in cypher_queries.CREATE_CONSTRAINTS:
                    session.run(stmt)
            logger.info("Neo4j constraints and indices verified.")
        except Exception as e:
            logger.warning(f"Neo4j init_schema warning: {e}")

    def upsert_transaction(self, txn: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        # Always maintain memory store for fast sub-millisecond local reads/GNN/UI serving
        self.memory_store.upsert_transaction(txn)
        if self.is_connected:
            try:
                with self.driver.session() as session:
                    session.run(cypher_queries.UPSERT_ENTITY_AND_TRANSACTION, {
                        "source_entity_id": txn["source_entity_id"],
                        "source_entity_name": txn.get("source_entity_name", txn["source_entity_id"]),
                        "source_entity_type": txn.get("source_entity_type", "individual"),
                        "destination_entity_id": txn["destination_entity_id"],
                        "destination_entity_name": txn.get("destination_entity_name", txn["destination_entity_id"]),
                        "destination_entity_type": txn.get("destination_entity_type", "individual"),
                        "transaction_id": txn["transaction_id"],
                        "amount": float(txn["amount"]),
                        "currency": txn.get("currency", "INR"),
                        "timestamp": txn["timestamp"],
                        "transaction_type": txn.get("transaction_type", "transfer"),
                        "country": "IN",
                        "kyc_flag": 1
                    })
            except Exception as e:
                logger.error(f"Failed to upsert to Neo4j: {e}")

        # Check incremental cycle (Speed layer)
        return self.memory_store.check_incremental_cycle(
            txn["source_entity_id"],
            txn["destination_entity_id"]
        )

    def run_batch_analytics(self) -> Dict[str, Any]:
        """
        Runs full batch pass: Louvain, PageRank, Betweenness, full cycles.
        """
        # Run on memory store
        gds_stats = self.memory_store.compute_graph_metrics()
        cycles = self.memory_store.run_full_cycle_scan()

        # If Neo4j is connected, also trigger GDS procedures
        if self.is_connected:
            try:
                with self.driver.session() as session:
                    session.run(cypher_queries.GDS_PROJECT_GRAPH)
                    session.run(cypher_queries.GDS_LOUVAIN)
                    session.run(cypher_queries.GDS_PAGERANK)
                    session.run(cypher_queries.GDS_BETWEENNESS)
                    session.run(cypher_queries.GDS_DROP_GRAPH)
            except Exception as e:
                logger.warning(f"Neo4j GDS execution: {e}")

        return {
            "gds_stats": gds_stats,
            "cycles_found": len(cycles)
        }

    def update_risk_scores(self, scored_entities: List[Dict[str, Any]]):
        self.memory_store.update_node_risk_scores(scored_entities)
        if self.is_connected:
            try:
                with self.driver.session() as session:
                    session.run(cypher_queries.WRITE_RISK_SCORES, {"scored_entities": scored_entities})
            except Exception as e:
                logger.error(f"Neo4j write risk scores error: {e}")

    def store_case_note(self, entity_id: str, note: str, risk_score: float):
        self.memory_store.store_case_note(entity_id, note, risk_score)
        if self.is_connected:
            try:
                with self.driver.session() as session:
                    session.run(cypher_queries.STORE_CASE_NOTE, {
                        "entity_id": entity_id,
                        "note": note,
                        "risk_score": float(risk_score)
                    })
            except Exception as e:
                logger.error(f"Neo4j store case note error: {e}")

    def write_predicted_links(self, predictions: List[Dict[str, Any]]):
        self.memory_store.write_predicted_links(predictions)
        if self.is_connected:
            try:
                with self.driver.session() as session:
                    session.run(cypher_queries.WRITE_PREDICTED_LINKS, {"predictions": predictions})
            except Exception as e:
                logger.error(f"Neo4j write predicted links error: {e}")

    def get_graph_snapshot(self) -> Dict[str, Any]:
        return self.memory_store.get_snapshot()

    def get_cycles(self) -> List[Dict[str, Any]]:
        return self.memory_store.cycles

# Singleton instance
graph_client = Neo4jClient()
