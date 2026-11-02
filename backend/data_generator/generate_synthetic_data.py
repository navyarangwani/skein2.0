import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Generator, Dict, Any, List
import pandas as pd
import networkx as nx
from faker import Faker

from .config import (
    DEFAULT_NUM_ENTITIES,
    DEFAULT_NUM_TRANSACTIONS,
    DEFAULT_NUM_RINGS,
    DEFAULT_NUM_SMURFING,
    DEFAULT_NUM_HUBS,
    AML_REPORTING_THRESHOLD,
    CURRENCY
)
from ..app.config import DATA_DIR

fake = Faker('en_IN')
Faker.seed(42)
random.seed(42)

def generate_dataset(
    num_entities: int = DEFAULT_NUM_ENTITIES,
    num_transactions: int = DEFAULT_NUM_TRANSACTIONS,
    num_rings: int = DEFAULT_NUM_RINGS,
    num_smurfing: int = DEFAULT_NUM_SMURFING,
    num_hubs: int = DEFAULT_NUM_HUBS,
    output_dir: Path = DATA_DIR,
    random_seed: int = 42
) -> Dict[str, Any]:
    """
    Generates a realistic synthetic transaction graph with ground-truth fraud patterns:
    - Background: Barabási-Albert scale-free transaction network
    - Injected Pattern 1: Circular Layering Rings (decaying amount per hop)
    - Injected Pattern 2: Smurfing / Structuring Clusters (amounts just below reporting threshold)
    - Injected Pattern 3: Shell Company Pass-Through Hubs
    """
    random.seed(random_seed)
    fake.seed_instance(random_seed)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    start_date = datetime(2026, 1, 1, 9, 0, 0)
    current_time = start_date

    # 1. Generate Entities
    entities = []
    entity_map = {}
    ground_truth = {}  # entity_id -> {is_fraud: 1/0, pattern: str, ring_id: str}

    # Shell company names often look like "Zenith Apex Holdings", "Silverline Global FZE"
    shell_suffixes = ["Enterprises", "Ventures", "Holdings", "Global Trade", "Solutions Ltd", "Consultancy", "Imports"]
    company_suffixes = ["Technologies", "Industries", "Logistics", "Retail Pvt Ltd", "Manufacturing", "Pharma", "Infra"]

    for i in range(num_entities):
        eid = f"ENT_{i+1:05d}"
        # Determine type
        rand_val = random.random()
        if rand_val < 0.70:
            etype = "individual"
            ename = fake.name()
            kyc = 1 if random.random() > 0.05 else 0
        elif rand_val < 0.95:
            etype = "company"
            ename = f"{fake.company()} {random.choice(company_suffixes)}"
            kyc = 1 if random.random() > 0.08 else 0
        else:
            etype = "shell_company"
            ename = f"{fake.city()} {random.choice(shell_suffixes)}"
            kyc = 0 if random.random() > 0.30 else 1  # shell companies often have poor KYC

        reg_days = random.randint(100, 3000)
        reg_date = (start_date - timedelta(days=reg_days)).strftime("%Y-%m-%d")

        entity_record = {
            "entity_id": eid,
            "name": ename,
            "entity_type": etype,
            "country": "IN",
            "registration_date": reg_date,
            "kyc_flag": kyc
        }
        entities.append(entity_record)
        entity_map[eid] = entity_record
        ground_truth[eid] = {
            "entity_id": eid,
            "is_fraud_ring_member": 0,
            "pattern_type": "legitimate",
            "ring_id": "NONE"
        }

    # 2. Injected Pattern 1: Circular Layering Rings
    transactions = []
    ownership = []
    txn_counter = 1

    # Select candidates for rings (prefer shell companies or create/override them)
    all_entity_ids = [e["entity_id"] for e in entities]
    available_entities = list(all_entity_ids)

    for ring_idx in range(num_rings):
        ring_size = random.randint(5, 8)
        if len(available_entities) < ring_size:
            break
        ring_members = random.sample(available_entities, ring_size)
        for m in ring_members:
            available_entities.remove(m)
            # Mark entity as shell company for layering realism
            entity_map[m]["entity_type"] = "shell_company"
            ground_truth[m] = {
                "entity_id": m,
                "is_fraud_ring_member": 1,
                "pattern_type": "circular_layering",
                "ring_id": f"RING_{ring_idx+1:02d}"
            }

        # Build cycle: e0 -> e1 -> e2 -> ... -> en-1 -> e0
        base_amount = random.uniform(500000, 2500000)
        cycle_time = start_date + timedelta(days=random.randint(10, 60), hours=random.randint(1, 12))

        for hop in range(ring_size):
            src = ring_members[hop]
            dst = ring_members[(hop + 1) % ring_size]
            # Amount decays 85-95% per hop
            decay = random.uniform(0.88, 0.96)
            amount = round(base_amount * (decay ** hop), 2)
            hop_time = cycle_time + timedelta(hours=hop * random.randint(2, 6), minutes=random.randint(5, 45))

            transactions.append({
                "transaction_id": f"TXN_{txn_counter:07d}",
                "source_entity_id": src,
                "destination_entity_id": dst,
                "amount": amount,
                "currency": CURRENCY,
                "timestamp": hop_time.isoformat(),
                "transaction_type": "wire_transfer",
                "source_entity_name": entity_map[src]["name"],
                "source_entity_type": entity_map[src]["entity_type"],
                "destination_entity_name": entity_map[dst]["name"],
                "destination_entity_type": entity_map[dst]["entity_type"]
            })
            txn_counter += 1

            # Shell ownership link
            if hop < ring_size - 1 and random.random() > 0.4:
                ownership.append({
                    "parent_entity_id": src,
                    "child_entity_id": dst,
                    "ownership_percentage": round(random.uniform(51.0, 100.0), 1)
                })

    # 3. Injected Pattern 2: Smurfing / Structuring Clusters
    for smurf_idx in range(num_smurfing):
        if len(available_entities) < 18:
            break
        origin = random.choice(available_entities)
        available_entities.remove(origin)
        collector = random.choice(available_entities)
        available_entities.remove(collector)

        mule_count = random.randint(10, 18)
        mules = random.sample(available_entities, mule_count)
        for m in mules:
            available_entities.remove(m)

        ground_truth[origin] = {
            "entity_id": origin,
            "is_fraud_ring_member": 1,
            "pattern_type": "smurfing_source",
            "ring_id": f"SMURF_{smurf_idx+1:02d}"
        }
        ground_truth[collector] = {
            "entity_id": collector,
            "is_fraud_ring_member": 1,
            "pattern_type": "smurfing_collector",
            "ring_id": f"SMURF_{smurf_idx+1:02d}"
        }
        for m in mules:
            ground_truth[m] = {
                "entity_id": m,
                "is_fraud_ring_member": 1,
                "pattern_type": "smurfing_mule",
                "ring_id": f"SMURF_{smurf_idx+1:02d}"
            }

        # Source splits into mules with amounts just below reporting threshold
        smurf_time = start_date + timedelta(days=random.randint(5, 50))
        for m in mules:
            # Structuring: amounts 44,000 - 49,500 (threshold is 50,000)
            split_amount = round(random.uniform(AML_REPORTING_THRESHOLD * 0.88, AML_REPORTING_THRESHOLD * 0.99), 2)
            t1 = smurf_time + timedelta(minutes=random.randint(5, 120))
            transactions.append({
                "transaction_id": f"TXN_{txn_counter:07d}",
                "source_entity_id": origin,
                "destination_entity_id": m,
                "amount": split_amount,
                "currency": CURRENCY,
                "timestamp": t1.isoformat(),
                "transaction_type": "split_deposit",
                "source_entity_name": entity_map[origin]["name"],
                "source_entity_type": entity_map[origin]["entity_type"],
                "destination_entity_name": entity_map[m]["name"],
                "destination_entity_type": entity_map[m]["entity_type"]
            })
            txn_counter += 1

            # Mule funnels to collector
            t2 = t1 + timedelta(minutes=random.randint(15, 180))
            funnel_amount = round(split_amount * random.uniform(0.92, 0.98), 2)
            transactions.append({
                "transaction_id": f"TXN_{txn_counter:07d}",
                "source_entity_id": m,
                "destination_entity_id": collector,
                "amount": funnel_amount,
                "currency": CURRENCY,
                "timestamp": t2.isoformat(),
                "transaction_type": "consolidation_wire",
                "source_entity_name": entity_map[m]["name"],
                "source_entity_type": entity_map[m]["entity_type"],
                "destination_entity_name": entity_map[collector]["name"],
                "destination_entity_type": entity_map[collector]["entity_type"]
            })
            txn_counter += 1

    # 4. Injected Pattern 3: Artificial Hub / Pass-Through Shell Entities
    for hub_idx in range(num_hubs):
        if len(available_entities) < 20:
            break
        hub_id = random.choice(available_entities)
        available_entities.remove(hub_id)
        entity_map[hub_id]["entity_type"] = "shell_company"
        ground_truth[hub_id] = {
            "entity_id": hub_id,
            "is_fraud_ring_member": 1,
            "pattern_type": "shell_hub",
            "ring_id": f"HUB_{hub_idx+1:02d}"
        }

        # Hub interacts with many entities rapidly
        hub_time = start_date + timedelta(days=random.randint(15, 45))
        partners = random.sample(all_entity_ids, 25)
        for p in partners:
            if p == hub_id:
                continue
            amt = round(random.uniform(100000, 1500000), 2)
            t_in = hub_time + timedelta(hours=random.randint(1, 48))
            transactions.append({
                "transaction_id": f"TXN_{txn_counter:07d}",
                "source_entity_id": p,
                "destination_entity_id": hub_id,
                "amount": amt,
                "currency": CURRENCY,
                "timestamp": t_in.isoformat(),
                "transaction_type": "hub_intake",
                "source_entity_name": entity_map[p]["name"],
                "source_entity_type": entity_map[p]["entity_type"],
                "destination_entity_name": entity_map[hub_id]["name"],
                "destination_entity_type": entity_map[hub_id]["entity_type"]
            })
            txn_counter += 1

    # 5. Background Graph (Barabási-Albert Scale-Free Graph)
    # Generate background connections to fill remaining transactions
    ba_graph = nx.barabasi_albert_graph(num_entities, 2, seed=random_seed)
    remaining_txns = num_transactions - len(transactions)

    # Edge list from BA graph
    ba_edges = list(ba_graph.edges())
    random.shuffle(ba_edges)

    for i in range(max(remaining_txns, 100)):
        u_idx, v_idx = random.choice(ba_edges)
        u_id = f"ENT_{u_idx+1:05d}"
        v_id = f"ENT_{v_idx+1:05d}"

        # Direction
        if random.random() > 0.5:
            src_id, dst_id = u_id, v_id
        else:
            src_id, dst_id = v_id, u_id

        # Amount distribution: lognormal (typical financial transaction size)
        amt = round(random.lognormvariate(8.5, 1.2), 2)
        amt = max(100.0, min(amt, 1000000.0))
        t_rand = start_date + timedelta(days=random.randint(0, 90), hours=random.randint(0, 23), minutes=random.randint(0, 59))

        transactions.append({
            "transaction_id": f"TXN_{txn_counter:07d}",
            "source_entity_id": src_id,
            "destination_entity_id": dst_id,
            "amount": amt,
            "currency": CURRENCY,
            "timestamp": t_rand.isoformat(),
            "transaction_type": "standard_payment",
            "source_entity_name": entity_map[src_id]["name"],
            "source_entity_type": entity_map[src_id]["entity_type"],
            "destination_entity_name": entity_map[dst_id]["name"],
            "destination_entity_type": entity_map[dst_id]["entity_type"]
        })
        txn_counter += 1

    # Sort transactions chronologically
    transactions.sort(key=lambda x: x["timestamp"])

    # 6. Write CSV files
    df_entities = pd.DataFrame(list(entity_map.values()))
    df_transactions = pd.DataFrame(transactions)
    df_ownership = pd.DataFrame(ownership if ownership else [{"parent_entity_id": "NONE", "child_entity_id": "NONE", "ownership_percentage": 0.0}])
    df_ground_truth = pd.DataFrame(list(ground_truth.values()))

    entities_csv = output_dir / "entities.csv"
    transactions_csv = output_dir / "transactions.csv"
    ownership_csv = output_dir / "ownership.csv"
    ground_truth_csv = output_dir / "ground_truth.csv"

    df_entities.to_csv(entities_csv, index=False)
    df_transactions.to_csv(transactions_csv, index=False)
    df_ownership.to_csv(ownership_csv, index=False)
    df_ground_truth.to_csv(ground_truth_csv, index=False)

    return {
        "entity_count": len(df_entities),
        "transaction_count": len(df_transactions),
        "fraud_entity_count": int(df_ground_truth["is_fraud_ring_member"].sum()),
        "output_files": {
            "entities": str(entities_csv),
            "transactions": str(transactions_csv),
            "ownership": str(ownership_csv),
            "ground_truth": str(ground_truth_csv)
        }
    }

def stream_transactions(dataset_path: Path = None) -> Generator[Dict[str, Any], None, None]:
    """
    Yields transactions one at a time, sorted by timestamp, formatted
    for direct XADD onto the Redis stream or in-memory stream queue.
    """
    if dataset_path is None:
        dataset_path = DATA_DIR / "transactions.csv"
    else:
        dataset_path = Path(dataset_path)

    if not dataset_path.exists():
        generate_dataset(output_dir=dataset_path.parent)

    df = pd.read_csv(dataset_path).sort_values("timestamp")
    for _, row in df.iterrows():
        yield row.to_dict()

if __name__ == "__main__":
    res = generate_dataset()
    print("Dataset generated:", res)
