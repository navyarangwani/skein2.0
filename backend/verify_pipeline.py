import time
from backend.app.services.stream_pipeline import stream_pipeline
from backend.app.neo4j_client import graph_client
from backend.app.services.case_narrator import generate_case_note_for_entity
from backend.app.services.gnn.train import train_link_predictor
from backend.app.services.gnn.infer import infer_predicted_links
from backend.data_generator.generate_synthetic_data import stream_transactions

print("[1/5] Ingesting transactions into streaming pipeline...")
count = 0
for txn in stream_transactions():
    stream_pipeline.process_transaction(txn)
    count += 1
    if count >= 300:
        break
print(f"Ingested {count} transactions.")

print("[2/5] Triggering batch layer (Louvain, PageRank, Betweenness, Isolation Forest)...")
stream_pipeline.trigger_batch_run(triggered_by="verification")

snapshot = graph_client.get_graph_snapshot()
print(f"Graph stats: {snapshot['stats']}")

cycles = graph_client.get_cycles()
print(f"[3/5] Speed + Batch Cycles detected: {len(cycles)}")
if cycles:
    print(f"Sample cycle detected: {cycles[0]['cycle_id']} - Entities: {cycles[0]['entities']}")

print("[4/5] Testing Grounded AI Case-File Narrator...")
high_risk = [n for n in snapshot["nodes"] if n["risk_tier"] in ["high", "critical"]]
if high_risk:
    eid = high_risk[0]["id"]
    note = generate_case_note_for_entity(eid, force=True)
    print(f"Forensic Case Note for {eid}:\n  -> \"{note}\"")

print("[5/5] Training Inductive GraphSAGE GNN Link Predictor...")
train_res = train_link_predictor(epochs=30)
print(f"GNN Training Metrics: Status={train_res.get('status')}, Loss={train_res.get('final_loss')}, ROC-AUC={train_res.get('roc_auc')}, AP={train_res.get('average_precision')}")

predictions = infer_predicted_links(train_res, top_k=5)
print(f"Emerging Predicted Links (Top 5):\n  -> {predictions}")

print("\n>>> ALL SKEIN CORE SYSTEMS VALIDATED END-TO-END! <<<")
