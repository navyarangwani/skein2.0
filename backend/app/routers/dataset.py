from fastapi import APIRouter, HTTPException
from ..schemas import DatasetGenerateRequest
from ...data_generator.generate_synthetic_data import generate_dataset
from ..config import DATA_DIR

router = APIRouter(prefix="/dataset", tags=["Dataset"])

@router.post("/generate")
def create_dataset(req: DatasetGenerateRequest):
    try:
        res = generate_dataset(
            num_entities=req.num_entities,
            num_transactions=req.num_transactions,
            num_rings=req.num_rings,
            num_smurfing=req.num_smurfing,
            random_seed=req.random_seed
        )
        return {
            "status": "success",
            "message": "Synthetic dataset generated successfully.",
            "data": res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def dataset_status():
    files = {
        "entities": (DATA_DIR / "entities.csv").exists(),
        "transactions": (DATA_DIR / "transactions.csv").exists(),
        "ownership": (DATA_DIR / "ownership.csv").exists(),
        "ground_truth": (DATA_DIR / "ground_truth.csv").exists(),
    }
    return {
        "exists": all(files.values()),
        "files": files,
        "path": str(DATA_DIR)
    }
