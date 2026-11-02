# Centralized Cypher Query Definitions (Sections 10.3 - 10.7, 15.1, 15.4, 16.5, 17.8)

CREATE_CONSTRAINTS = [
    """
    CREATE CONSTRAINT entity_id_unique IF NOT EXISTS
    FOR (e:Entity) REQUIRE e.entity_id IS UNIQUE;
    """,
    """
    CREATE INDEX entity_risk_score IF NOT EXISTS
    FOR (e:Entity) ON (e.risk_score);
    """,
    """
    CREATE INDEX transaction_timestamp IF NOT EXISTS
    FOR ()-[t:TRANSACTION]-() ON (t.timestamp);
    """
]

UPSERT_ENTITY_AND_TRANSACTION = """
MERGE (src:Entity {entity_id: $source_entity_id})
ON CREATE SET
    src.name = $source_entity_name,
    src.entity_type = $source_entity_type,
    src.country = $country,
    src.kyc_flag = $kyc_flag,
    src.risk_score = 0.0,
    src.risk_tier = 'low',
    src.pagerank = 0.0,
    src.betweenness = 0.0,
    src.in_cycle = false,
    src.cycle_count = 0

MERGE (dst:Entity {entity_id: $destination_entity_id})
ON CREATE SET
    dst.name = $destination_entity_name,
    dst.entity_type = $destination_entity_type,
    dst.country = $country,
    dst.kyc_flag = $kyc_flag,
    dst.risk_score = 0.0,
    dst.risk_tier = 'low',
    dst.pagerank = 0.0,
    dst.betweenness = 0.0,
    dst.in_cycle = false,
    dst.cycle_count = 0

CREATE (src)-[r:TRANSACTION {
    transaction_id: $transaction_id,
    amount: toFloat($amount),
    currency: $currency,
    timestamp: $timestamp,
    transaction_type: $transaction_type
}]->(dst)
RETURN r.transaction_id AS txn_id
"""

# Section 10.7: Incremental Cycle Check (Speed Layer)
CHECK_INCREMENTAL_CYCLE = """
MATCH path = (v:Entity {entity_id: $v_id})-[:TRANSACTION*1..5]->(u:Entity {entity_id: $u_id})
RETURN [n IN nodes(path) | n.entity_id] AS cycle_entities,
       reduce(total = 0.0, r IN relationships(path) | total + r.amount) AS total_volume,
       length(path) AS cycle_length
LIMIT 1;
"""

# Section 10.6: Full Cycle Scan (Batch Layer)
FULL_CYCLE_SCAN = """
MATCH path = (a:Entity)-[:TRANSACTION*2..6]->(a)
RETURN [n IN nodes(path) | n.entity_id] AS cycle_entities,
       reduce(total = 0.0, r IN relationships(path) | total + r.amount) AS total_volume,
       length(path) AS cycle_length
LIMIT 500;
"""

# Section 10.4 - 10.5: GDS Algorithms
GDS_PROJECT_GRAPH = """
CALL gds.graph.project(
    'skeinGraph',
    'Entity',
    'TRANSACTION',
    { relationshipProperties: 'amount' }
);
"""

GDS_LOUVAIN = """
CALL gds.louvain.write('skeinGraph', {
    writeProperty: 'community_id',
    relationshipWeightProperty: 'amount'
})
YIELD communityCount, modularity;
"""

GDS_PAGERANK = """
CALL gds.pageRank.write('skeinGraph', {
    writeProperty: 'pagerank',
    relationshipWeightProperty: 'amount'
})
YIELD nodePropertiesWritten;
"""

GDS_BETWEENNESS = """
CALL gds.betweenness.write('skeinGraph', {
    writeProperty: 'betweenness'
})
YIELD nodePropertiesWritten;
"""

GDS_DROP_GRAPH = """
CALL gds.graph.drop('skeinGraph', false);
"""

# Section 15.1: Feature Vector Fetch
FETCH_FEATURE_MATRIX = """
MATCH (e:Entity)
RETURN e.entity_id AS entity_id,
       coalesce(e.pagerank, 0.0) AS pagerank,
       coalesce(e.betweenness, 0.0) AS betweenness,
       coalesce(e.in_cycle, false) AS in_cycle,
       coalesce(e.community_shell_density, 0.0) AS community_shell_density,
       coalesce(e.amount_anomaly_score, 0.0) AS amount_anomaly_score,
       coalesce(e.degree_total, 0) AS degree_total,
       coalesce(e.clustering_coefficient, 0.0) AS clustering_coefficient;
"""

# Section 15.4: Writing Scores Back
WRITE_RISK_SCORES = """
UNWIND $scored_entities AS row
MATCH (e:Entity {entity_id: row.entity_id})
SET e.risk_score = toFloat(row.composite_risk_score),
    e.risk_tier = row.risk_tier,
    e.pagerank_percentile = toFloat(row.pagerank_percentile),
    e.betweenness_percentile = toFloat(row.betweenness_percentile),
    e.community_shell_density_percentile = toFloat(row.community_shell_density_percentile),
    e.amount_anomaly_percentile = toFloat(row.amount_anomaly_percentile),
    e.last_scored_at = datetime();
"""

# Section 16.5: Case Note Storage
STORE_CASE_NOTE = """
MATCH (e:Entity {entity_id: $entity_id})
SET e.case_note = $note,
    e.case_note_score_fingerprint = $risk_score,
    e.case_note_generated_at = datetime();
"""

# Section 17.8: Predicted Links
WRITE_PREDICTED_LINKS = """
UNWIND $predictions AS p
MATCH (a:Entity {entity_id: p.source}), (b:Entity {entity_id: p.target})
MERGE (a)-[r:PREDICTED_LINK]->(b)
SET r.probability = toFloat(p.probability),
    r.predicted_at = datetime();
"""

FETCH_GRAPH_SNAPSHOT = """
MATCH (n:Entity)
OPTIONAL MATCH (n)-[r:TRANSACTION]->(m:Entity)
RETURN collect(DISTINCT {
    id: n.entity_id,
    name: n.name,
    type: n.entity_type,
    country: coalesce(n.country, 'IN'),
    kyc_flag: coalesce(n.kyc_flag, 1),
    risk_score: coalesce(n.risk_score, 0.0),
    risk_tier: coalesce(n.risk_tier, 'low'),
    community_id: coalesce(n.community_id, 0),
    pagerank: coalesce(n.pagerank, 0.0),
    pagerank_percentile: coalesce(n.pagerank_percentile, 0.0),
    betweenness: coalesce(n.betweenness, 0.0),
    betweenness_percentile: coalesce(n.betweenness_percentile, 0.0),
    community_shell_density_percentile: coalesce(n.community_shell_density_percentile, 0.0),
    amount_anomaly_percentile: coalesce(n.amount_anomaly_percentile, 0.0),
    in_cycle: coalesce(n.in_cycle, false),
    case_note: n.case_note,
    last_scored_at: toString(n.last_scored_at)
}) AS nodes,
collect(DISTINCT {
    source: startNode(r).entity_id,
    target: endNode(r).entity_id,
    amount: r.amount,
    currency: r.currency,
    timestamp: r.timestamp,
    transaction_id: r.transaction_id,
    transaction_type: r.transaction_type,
    is_predicted: false
}) AS links;
"""
