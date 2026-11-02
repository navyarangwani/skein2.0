import torch
from torch_geometric.nn import SAGEConv

class LinkPredictorGNN(torch.nn.Module):
    """
    Inductive 2-Layer GraphSAGE Link Predictor (Section 17.2).
    - 2 SAGEConv layers prevent oversmoothing while capturing 2-hop ring structures.
    - Encodes node features into entity embeddings.
    - Decodes edge existence probability via dot-product score.
    """
    def __init__(self, in_channels: int, hidden_channels: int = 64, out_channels: int = 32):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def encode(self, x: torch.Tensor, edge_index: torch.Tensor) -> torch.Tensor:
        h = self.conv1(x, edge_index).relu()
        h = self.conv2(h, edge_index)
        return h

    def decode(self, h: torch.Tensor, edge_label_index: torch.Tensor) -> torch.Tensor:
        src, dst = edge_label_index
        return (h[src] * h[dst]).sum(dim=-1)
