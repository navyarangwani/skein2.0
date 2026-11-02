from .stream_pipeline import stream_pipeline

def trigger_batch(loop=None):
    """
    Manually triggers batch pass.
    """
    stream_pipeline.trigger_batch_run(loop=loop, triggered_by="manual")
