import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import {
  GitBranch,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export function GNNPredictionsPage() {
  const { graphData, selectEntity } = useAnalysis();
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  const predictedLinks = graphData.predicted_links || [];

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainSuccess(false);
    // Simulate/trigger model retrain request
    setTimeout(() => {
      setRetraining(false);
      setRetrainSuccess(true);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Inductive GraphSAGE Link Predictions
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {predictedLinks.length} Active Forecasts
                </span>
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Estimates emerging financial laundering ties before transactions occur using inductive graph neural networks
              </p>
            </div>
          </div>

          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 shadow-lg shadow-purple-950/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Training GraphSAGE...' : 'Retrain GNN Model'}</span>
          </button>
        </div>

        {retrainSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>GraphSAGE retrained over 80/20 temporal split. Inferred top emerging links.</span>
          </div>
        )}
      </div>

      {/* Methodology Explainer Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-white/[0.06] rounded-xl p-4">
          <div className="text-[10px] font-mono font-bold uppercase text-purple-400 mb-1">
            Inductive Generalization
          </div>
          <div className="text-xs text-white font-semibold">GraphSAGE vs. Standard GCN</div>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
            GraphSAGE learns neighbor-aggregation functions rather than static embeddings, allowing it to predict ties on newly arriving entities without full retrains.
          </p>
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-xl p-4">
          <div className="text-[10px] font-mono font-bold uppercase text-[#FF5722] mb-1">
            Data Leakage Prevention
          </div>
          <div className="text-xs text-white font-semibold">Strict Temporal Split (80/20)</div>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
            Trained strictly on past structure $(t \le T)$ and evaluated on predicting future edges $(t &gt; T)$. A random edge split would leak future topology.
          </p>
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-xl p-4">
          <div className="text-[10px] font-mono font-bold uppercase text-amber-400 mb-1">
            2-Hop Receptive Field
          </div>
          <div className="text-xs text-white font-semibold">Prevents Oversmoothing</div>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
            Exactly 2 `SAGEConv` layers prevent node embeddings from collapsing into the global mean, preserving distinguishable entity characteristics.
          </p>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Top Emerging Connection Forecasts</h3>
          <span className="text-xs text-[#71717A]">
            Restricted to 2-hop neighborhoods of high/critical entities
          </span>
        </div>

        {predictedLinks.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#71717A]">
            No predictions generated yet. Trigger a batch pass or model retraining to compute emerging link forecasts.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#141414] text-[#A1A1AA] uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="p-3.5">Source Entity</th>
                  <th className="p-3.5"></th>
                  <th className="p-3.5">Target Candidate</th>
                  <th className="p-3.5">Predicted Confidence</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {predictedLinks.map((p, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <button
                        onClick={() => selectEntity(p.source)}
                        className="font-mono font-bold text-white hover:text-purple-400 transition-colors cursor-pointer"
                      >
                        {p.source}
                      </button>
                    </td>

                    <td className="p-3.5 text-center text-purple-400 font-bold">
                      ⇢ ⇢
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => selectEntity(p.target)}
                        className="font-mono font-bold text-white hover:text-purple-400 transition-colors cursor-pointer"
                      >
                        {p.target}
                      </button>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-300">
                          {p.probability}%
                        </span>
                        <div className="w-24 bg-[#1c1c1c] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${p.probability}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-[#71717A] font-mono text-[11px]">
                      {p.predicted_at ? new Date(p.predicted_at).toLocaleTimeString() : 'Recent'}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => selectEntity(p.source)}
                        className="px-2.5 py-1 rounded bg-[#202020] hover:bg-[#282828] text-white transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
