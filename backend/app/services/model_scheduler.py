from .stream_pipeline import stream_pipeline

def trigger_model_retrain(loop=None):
    """
    Manually triggers GNN model retrain and inference.
    """
    stream_pipeline.trigger_model_run(loop=loop)
