import time
import argparse
from ..app.services.stream_pipeline import stream_pipeline

def run_producer(rate_per_second: float = 5.0, dataset_path: str = None):
    """
    Producer entrypoint as specified in Section 11.3.
    """
    stream_pipeline.start_producer(rate_per_second=rate_per_second, dataset_path=dataset_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Skein Stream Producer")
    parser.add_argument("--rate", type=float, default=5.0, help="Transactions per second")
    parser.add_argument("--dataset", type=str, default=None, help="Path to transactions.csv")
    args = parser.parse_args()

    print(f"Starting Skein Stream Producer at {args.rate} txns/sec...")
    run_producer(args.rate, args.dataset)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping producer...")
        stream_pipeline.stop_producer()
