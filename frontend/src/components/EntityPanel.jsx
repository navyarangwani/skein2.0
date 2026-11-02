import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { api } from '../api/client';
import {
  X,
  Sparkles,
  ShieldAlert,
  Building,
  User,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export function EntityPanel() {
  const { selectedEntityId, selectedEntityDetail, isDetailLoading, selectEntity } = useAnalysis();
  const [regenerating, setRegenerating] = useState(false);

  if (!selectedEntityId) return null;

  const handleRegenerateNote = async () => {
    setRegenerating(true);
    try {
      await api.triggerNarrative(selectedEntityId);
      await selectEntity(selectedEntityId);
    } catch (err) {
      console.error('Failed to regenerate narrative:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const entity = selectedEntityDetail?.entity;
  const breakdown = selectedEntityDetail?.feature_breakdown || {};
  const inTxns = selectedEntityDetail?.in_transactions || [];
  const outTxns = selectedEntityDetail?.out_transactions || [];
  const cycles = selectedEntityDetail?.cycle_memberships || [];

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 md:w-[420px] bg-slate-900/98 border-l border-slate-800 shadow-2xl z-40 overflow-y-auto backdrop-blur-xl flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cyan-400 font-bold">
              {entity?.id || selectedEntityId}
            </span>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getTierBadge(
                entity?.risk_tier
              )}`}
            >
              {entity?.risk_tier || 'Low'} Risk
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            {entity?.name || 'Entity Intelligence'}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
            {entity?.type === 'shell_company' ? (
              <span className="text-rose-400 font-medium flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5" /> Shell Company
              </span>
            ) : entity?.type === 'company' ? (
              <span className="text-slate-300 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Corporate Entity
              </span>
            ) : (
              <span className="text-slate-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Individual Account
              </span>
            )}
            <span>•</span>
            <span>KYC: {entity?.kyc_flag ? 'Verified' : 'Flagged/Missing'}</span>
          </div>
        </div>
        <button
          onClick={() => selectEntity(null)}
          className="text-slate-400 hover:text-white p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isDetailLoading ? (
        <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3 flex-1">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
          <span>Assembling Forensic Profile...</span>
        </div>
      ) : (
        <div className="p-4 space-y-5 flex-1">
          {/* Section 16: AI Case-File Narrative (Placed prominently at top) */}
          <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-700/50 rounded-xl p-3.5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-fuchsia-300">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span>AI Compliance Case Note</span>
              </div>
              <button
                onClick={handleRegenerateNote}
                disabled={regenerating}
                className="text-[11px] text-fuchsia-400 hover:text-fuchsia-200 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                <span>Refresh Note</span>
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans italic bg-slate-950/50 p-2.5 rounded-lg border border-purple-900/40">
              "{selectedEntityDetail?.case_note || 'No case note generated yet. Click refresh to produce an AI narrative.'}"
            </p>
            <div className="text-[10px] text-indigo-400/80 mt-2 flex justify-between">
              <span>Grounded Model Synthesis</span>
              <span>Hallucination-Constrained</span>
            </div>
          </div>

          {/* Composite Risk Score Meter */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-400 font-medium">Composite Risk Score</span>
              <span className="text-sm font-bold font-mono text-cyan-400">
                {entity?.risk_score} / 100
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  entity?.risk_tier === 'critical'
                    ? 'bg-rose-500'
                    : entity?.risk_tier === 'high'
                    ? 'bg-orange-500'
                    : entity?.risk_tier === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, entity?.risk_score || 0)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0 (Legitimate)</span>
              <span>85 (Medium)</span>
              <span>95 (High)</span>
              <span>99 (Critical)</span>
            </div>
          </div>

          {/* Topological Feature Percentiles (Section 15.1 & NFR6 Explainability) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Explainable Feature Breakdown
            </h4>
            <div className="space-y-3">
              {/* PageRank */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Capital Centrality (PageRank)</span>
                  <span className="font-mono text-cyan-400">
                    {entity?.pagerank_percentile || 0}th percentile
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-1.5 rounded-full"
                    style={{ width: `${entity?.pagerank_percentile || 0}%` }}
                  />
                </div>
              </div>

              {/* Betweenness */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Bridge Flow (Betweenness)</span>
                  <span className="font-mono text-indigo-400">
                    {entity?.betweenness_percentile || 0}th percentile
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${entity?.betweenness_percentile || 0}%` }}
                  />
                </div>
              </div>

              {/* Shell Density */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Shell Density in Cluster</span>
                  <span className="font-mono text-amber-400">
                    {entity?.community_shell_density_percentile || 0}th percentile
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{ width: `${entity?.community_shell_density_percentile || 0}%` }}
                  />
                </div>
              </div>

              {/* Amount Anomaly */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Structuring / Smurfing Anomaly</span>
                  <span className="font-mono text-rose-400">
                    {entity?.amount_anomaly_percentile || 0}th percentile
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full"
                    style={{ width: `${entity?.amount_anomaly_percentile || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cycle Memberships */}
          {cycles.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-900/60 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300 mb-2">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                <span>Circular Layering Involvement ({cycles.length})</span>
              </div>
              <div className="space-y-2">
                {cycles.map((cycleEntities, idx) => (
                  <div
                    key={idx}
                    className="text-[11px] font-mono bg-slate-950/80 p-2 rounded-lg border border-rose-900/40 text-slate-300 truncate"
                  >
                    {cycleEntities.join(' → ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Recent Transactions ({inTxns.length + outTxns.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs pr-1">
              {inTxns.slice(0, 5).map((t, idx) => (
                <div
                  key={`in_${idx}`}
                  className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80"
                >
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px]">from {t.from}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-200">
                    ₹{Number(t.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
              {outTxns.slice(0, 5).map((t, idx) => (
                <div
                  key={`out_${idx}`}
                  className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80"
                >
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px]">to {t.to}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-200">
                    ₹{Number(t.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
