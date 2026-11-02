import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { StreamControls } from '../components/StreamControls';
import { api } from '../api/client';
import {
  Radio,
  Sliders,
  Database,
  RefreshCw,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

export function StreamingPage() {
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
        text: `Synthetic dataset generated: ${res.data.entity_count} entities, ${res.data.transaction_count} transactions with ${res.data.fraud_entity_count} ground truth fraud nodes.`,
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
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <Database className="w-5 h-5 text-[#FF5722]" />
          <h3 className="text-sm font-bold text-white">
            Synthetic Financial Crime Dataset Generator
          </h3>
        </div>
        <p className="text-xs text-[#A1A1AA] mb-6">
          Generates a scale-free Barabási-Albert background transaction network with mathematically injected circular layering loops and structured smurfing clusters.
        </p>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-white/[0.06] p-4 rounded-xl">
            <label className="text-xs text-white font-semibold block mb-1">
              Total Entities (Nodes)
            </label>
            <input
              type="number"
              value={form.num_entities}
              onChange={(e) => setForm({ ...form, num_entities: Number(e.target.value) })}
              min="100"
              max="5000"
              className="w-full bg-[#171717] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF5722] font-mono"
            />
            <span className="text-[10px] text-[#71717A] mt-1 block">
              70% Individuals, 25% Companies, 5% Shell Companies
            </span>
          </div>

          <div className="bg-[#111111] border border-white/[0.06] p-4 rounded-xl">
            <label className="text-xs text-white font-semibold block mb-1">
              Total Transactions (Edges)
            </label>
            <input
              type="number"
              value={form.num_transactions}
              onChange={(e) => setForm({ ...form, num_transactions: Number(e.target.value) })}
              min="500"
              max="20000"
              className="w-full bg-[#171717] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF5722] font-mono"
            />
            <span className="text-[10px] text-[#71717A] mt-1 block">
              Lognormal transaction size distribution
            </span>
          </div>

          <div className="bg-[#111111] border border-white/[0.06] p-4 rounded-xl">
            <label className="text-xs text-white font-semibold block mb-1">
              Circular Layering Rings
            </label>
            <input
              type="number"
              value={form.num_rings}
              onChange={(e) => setForm({ ...form, num_rings: Number(e.target.value) })}
              min="1"
              max="15"
              className="w-full bg-[#171717] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF5722] font-mono"
            />
            <span className="text-[10px] text-[#71717A] mt-1 block">
              5–8 Shell entities per ring, decaying 85–95% amount per hop
            </span>
          </div>

          <div className="bg-[#111111] border border-white/[0.06] p-4 rounded-xl">
            <label className="text-xs text-white font-semibold block mb-1">
              Smurfing / Structuring Clusters
            </label>
            <input
              type="number"
              value={form.num_smurfing}
              onChange={(e) => setForm({ ...form, num_smurfing: Number(e.target.value) })}
              min="1"
              max="10"
              className="w-full bg-[#171717] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF5722] font-mono"
            />
            <span className="text-[10px] text-[#71717A] mt-1 block">
              Split deposits within 10% below ₹50,000 reporting threshold
            </span>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF5722] to-[#FF8A35] hover:from-[#ff6434] hover:to-[#ff974b] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#FF5722]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Synthesizing Network...' : 'Generate New Dataset & Reset Pipeline'}
            </button>
          </div>
        </form>

        {generateMsg && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              generateMsg.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
                : 'bg-rose-950/60 border border-rose-800 text-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{generateMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
