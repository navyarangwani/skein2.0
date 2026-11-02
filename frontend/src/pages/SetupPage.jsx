import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { StreamControls } from '../components/StreamControls';
import { api } from '../api/client';
import {
  Database,
  Sliders,
  Sparkles,
  Server,
  CheckCircle2,
  Cpu,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

export function SetupPage() {
  const { fetchGraph, fetchCycles, fetchCommunities, fetchAlerts, fetchStreamStatus } = useAnalysis();

  const [form, setForm] = useState({
    num_entities: 400,
    num_transactions: 2000,
    num_rings: 4,
    num_smurfing: 3,
  });

  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGenerateMsg(null);
    try {
      const res = await api.generateDataset(form);
      setGenerateMsg({
        type: 'success',
        text: `Generated ${res.data.entity_count} entities and ${res.data.transaction_count} transactions with ${res.data.fraud_entity_count} fraud targets.`,
      });
      await fetchGraph();
      await fetchCycles();
      await fetchCommunities();
      await fetchAlerts();
      await fetchStreamStatus();
    } catch (err) {
      setGenerateMsg({
        type: 'error',
        text: `Generation error: ${err.message}`,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Stream Controls */}
      <StreamControls />

      {/* Dataset Generator Configuration */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">
            Synthetic Financial Crime Dataset Generator
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Configures scale-free Barabási-Albert background network with mathematically injected circular layering rings and smurfing clusters.
        </p>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Total Entities (Nodes)
            </label>
            <input
              type="number"
              value={form.num_entities}
              onChange={(e) => setForm({ ...form, num_entities: Number(e.target.value) })}
              min="100"
              max="5000"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              70% Individuals, 25% Companies, 5% Shell Companies
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Total Transactions (Edges)
            </label>
            <input
              type="number"
              value={form.num_transactions}
              onChange={(e) => setForm({ ...form, num_transactions: Number(e.target.value) })}
              min="500"
              max="20000"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Lognormal amount distributions with decay per layering hop
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Circular Layering Rings (Injected Fraud)
            </label>
            <input
              type="number"
              value={form.num_rings}
              onChange={(e) => setForm({ ...form, num_rings: Number(e.target.value) })}
              min="1"
              max="15"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              5–8 Shell entities per ring, decaying 85–95% amount per hop
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Smurfing / Structuring Clusters
            </label>
            <input
              type="number"
              value={form.num_smurfing}
              onChange={(e) => setForm({ ...form, num_smurfing: Number(e.target.value) })}
              min="1"
              max="10"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Split into deposits within 10% below ₹50,000 threshold
            </span>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Synthesizing Network...' : 'Generate New Dataset & Reset Pipeline'}
            </button>
          </div>
        </form>

        {generateMsg && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              generateMsg.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
                : 'bg-rose-950/60 border border-rose-800 text-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{generateMsg.text}</span>
          </div>
        )}
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1.5">
            <Cpu className="w-4 h-4" />
            Speed Layer
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bounded Cypher path queries inspect each arriving edge in sub-5ms to flag circular layering cycles immediately.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1.5">
            <Server className="w-4 h-4" />
            Batch Layer
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Executes native Louvain, PageRank, and Betweenness Centrality, followed by unsupervised Isolation Forest risk scoring.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-xs mb-1.5">
            <Sparkles className="w-4 h-4" />
            Predictive AI & GNN
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inductive GraphSAGE GNN link-prediction surfaces emerging connections; Grounded LLM generates human-readable case files.
          </p>
        </div>
      </div>
    </div>
  );
}
