import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Cpu,
  Database,
  Radio,
  Server,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

export function SystemHealthPage() {
  const [healthData, setHealthData] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    api
      .getHealth()
      .then((data) => setHealthData(data))
      .catch((err) => console.error('Health fetch error:', err));
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const defenseQA = [
    {
      q: '1. Why did you split the architecture into a Speed Layer and a Batch Layer?',
      a: 'True incremental community detection (Louvain) and global betweenness centrality are unsolved research problems; mathematically recomputing them requires the entire graph topology. However, checking whether a single newly arriving transaction edge closes a circular cycle is computationally cheap—it is simply a bounded shortest-path lookup from destination back to source. The Lambda architecture split is not a compromise; it matches each algorithm to its natural computational complexity.',
    },
    {
      q: '2. Why Neo4j with GDS instead of just staying with NetworkX in Python?',
      a: 'NetworkX is purely in-memory and single-process. Every analysis run requires reloading the entire graph from disk, and nothing persists across service restarts. Neo4j is an enterprise property graph database where algorithms run natively where the data lives. GDS projects in-memory subgraphs for sub-second Louvain and PageRank runs.',
    },
    {
      q: '3. Why Redis Streams instead of Apache Kafka?',
      a: 'Kafka is standard at massive multi-broker production scale, but requires heavier infrastructure (ZooKeeper/KRaft, multi-broker nodes). Redis Streams provides the identical fundamental primitives needed here—an append-only log, consumer groups, pending entry lists (PEL), and at-least-once delivery through XACK—in a lightweight, zero-maintenance process.',
    },
    {
      q: '4. How did you validate accuracy without training on fraud labels?',
      a: 'The Isolation Forest is completely unsupervised. It never sees ground_truth.csv during fitting; it isolates anomalous topological combinations (e.g. high betweenness combined with low clustering and reporting-threshold proximity). Ground-truth labels are only used post-hoc in evaluation to measure real ROC-AUC, Precision, Recall, and F1 scores.',
    },
    {
      q: '5. Why GraphSAGE instead of a standard GCN or GAT?',
      a: 'GraphSAGE is inductive—it learns a neighbor-aggregation function that generalizes to nodes never seen during training. Because Skein\'s graph grows continuously in real-time as transactions stream in, a transductive model like a standard GCN would require retraining the entire network from scratch every time a new entity transacts.',
    },
    {
      q: '6. How did you prevent data leakage during GNN link prediction evaluation?',
      a: 'A random split of edges is invalid for transaction networks because it allows the model to implicitly peek at future graph topologies during training. Skein enforces a strict temporal split: transactions are ordered chronologically, the model is trained strictly up to cutoff time T (first 80%), and evaluated only on predicting transactions that occur strictly after T.',
    },
    {
      q: '7. What is oversmoothing, and why did you limit the GNN to 2 layers?',
      a: 'Each additional graph-convolution layer expands how many hops of neighbors influence a node\'s embedding. Stacking too many layers causes embeddings for distinct nodes to converge toward the global graph average, losing the ability to distinguish individual nodes. 2 layers gives a 2-hop receptive field—enough to capture local ring structure without smoothing it away.',
    },
    {
      q: '8. How does the AI Narrator avoid hallucinations in compliance reporting?',
      a: 'The narrator uses structured-data-to-text generation with hard factual grounding. It is never asked an open-ended question; it is only provided with pre-computed numbers (risk score, percentiles, cycle involvement, shell company cluster density) and asked to phrase them into a concise compliance note. If a metric is absent, it cannot invent it.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Component Status Diagnostics */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Server className="w-5 h-5 text-[#FF5722]" />
          <div>
            <h3 className="text-sm font-bold text-white">System Component Health & Runtime</h3>
            <p className="text-xs text-[#A1A1AA]">
              Real-time connectivity diagnostics across graph storage, streaming, and metadata stores
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#111111] p-4 rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#A1A1AA]">Neo4j Engine</span>
              <Database className="w-4 h-4 text-[#FF8A35]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold text-white capitalize">
                {healthData?.components?.neo4j || 'Active Engine'}
              </span>
            </div>
            <div className="text-[10px] text-[#71717A] mt-1">Property Graph & GDS</div>
          </div>

          <div className="bg-[#111111] p-4 rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#A1A1AA]">Streaming Layer</span>
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold text-white capitalize">
                {healthData?.components?.consumer_mode || 'Memory Queue'}
              </span>
            </div>
            <div className="text-[10px] text-[#71717A] mt-1">Consumer Group XACK</div>
          </div>

          <div className="bg-[#111111] p-4 rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#A1A1AA]">Metadata Store</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold text-white">SQLite + SQLAlchemy</span>
            </div>
            <div className="text-[10px] text-[#71717A] mt-1">Alerts & Runs Tracking</div>
          </div>

          <div className="bg-[#111111] p-4 rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#A1A1AA]">WebSocket Gateway</span>
              <Server className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold text-white">FastAPI Native</span>
            </div>
            <div className="text-[10px] text-[#71717A] mt-1">Full Duplex Broadcast</div>
          </div>
        </div>
      </div>

      {/* Deloitte / Big 4 Defensibility Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <BookOpen className="w-5 h-5 text-[#FF5722]" />
          <div>
            <h3 className="text-sm font-bold text-white">
              Deloitte & Big 4 Technical Defensibility Reference
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Architectural decisions, machine learning validation, and algorithmic rationales
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {defenseQA.map((qa, idx) => (
            <div
              key={idx}
              className="bg-[#111111] border border-white/[0.06] rounded-xl overflow-hidden cursor-pointer"
              onClick={() => toggleFaq(idx)}
            >
              <div className="p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-white">{qa.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#FF5722] transition-transform ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-[#A1A1AA] leading-relaxed border-t border-white/[0.04] pt-3">
                  {qa.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
