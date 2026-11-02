from .stream_pipeline import stream_pipeline

def run_consumer(loop=None):
    """
    Consumer entrypoint as specified in Section 11.4.
    """
    stream_pipeline.start_consumer(loop)
