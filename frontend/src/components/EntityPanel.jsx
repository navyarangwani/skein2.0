import React, { useState, useEffect } from 'react';
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
  Copy,
  Check,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';

export function EntityPanel() {
  const { selectedEntityId, selectedEntityDetail, isDetailLoading, selectEntity } = useAnalysis();
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedEntityId) {
        selectEntity(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntityId, selectEntity]);

  if (!selectedEntityId) return null;

  const handleCopyId = () => {
    navigator.clipboard?.writeText(selectedEntityId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
  const inTxns = selectedEntityDetail?.in_transactions || [];
  const outTxns = selectedEntityDetail?.out_transactions || [];
  const cycles = selectedEntityDetail?.cycle_memberships || [];

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          border: 'border-red-500/30',
          bar: 'bg-red-500',
        };
      case 'high':
        return {
          bg: 'bg-[#FF5722]/15',
          text: 'text-[#FF8A35]',
          border: 'border-[#FF5722]/40',
          bar: 'bg-[#FF5722]',
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          bar: 'bg-amber-500',
        };
      default:
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          bar: 'bg-emerald-500',
        };
    }
  };

  const tierStyle = getTierColor(entity?.risk_tier);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => selectEntity(null)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
      />

      {/* Slide-out Drawer */}
      <aside className="fixed inset-y-0 right-0 w-full sm:w-[440px] md:w-[480px] bg-[#111111] border-l border-white/10 shadow-2xl z-50 flex flex-col animate-slide-in-right overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/8 bg-[#141414] flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <button
                onClick={handleCopyId}
                className="font-mono text-xs text-[#FF8A35] font-semibold bg-[#1c1c1c] hover:bg-[#252525] px-2 py-0.5 rounded border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Click to copy Entity ID"
              >
                <span>{entity?.id || selectedEntityId}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
              </button>

              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                {entity?.risk_tier || 'Low'} Risk
              </span>

              {entity?.in_cycle && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <AlertOctagon className="w-2.5 h-2.5" />
                  Cycle Member
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-white truncate">
              {entity?.name || 'Entity Forensic Profile'}
            </h3>

            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
              {entity?.type === 'shell_company' ? (
                <span className="text-red-400 font-medium flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5" /> Shell Company
                </span>
              ) : entity?.type === 'company' ? (
                <span className="text-zinc-300 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> Corporate Entity
                </span>
              ) : (
                <span className="text-zinc-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Retail Account
                </span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                {entity?.kyc_flag ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> KYC Pass
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> KYC Flagged
                  </span>
                )}
              </span>
            </div>
          </div>

          <button
            onClick={() => selectEntity(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {isDetailLoading ? (
          <div className="p-12 text-center text-zinc-400 flex flex-col items-center justify-center gap-3 flex-1">
            <RefreshCw className="w-7 h-7 animate-spin text-[#FF5722]" />
            <p className="text-sm font-medium text-zinc-300">Assembling Forensic Profile...</p>
            <span className="text-xs text-zinc-500">Querying Neo4j GDS metrics & AI synthesis</span>
          </div>
        ) : (
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            {/* AI Compliance Case Note */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1311] to-[#171717] border border-[#FF5722]/30 p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FF8A35]">
                  <Sparkles className="w-4 h-4 text-[#FF5722]" />
                  <span>AI Grounded Forensic Case Note</span>
                </div>
                <button
                  onClick={handleRegenerateNote}
                  disabled={regenerating}
                  className="text-[11px] text-[#FF8A35] hover:text-[#FF5722] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer font-medium"
                >
                  <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              <div className="bg-[#0b0b0b]/80 border border-white/5 rounded-lg p-3 text-xs text-zinc-200 leading-relaxed font-sans italic">
                "{selectedEntityDetail?.case_note || 'No forensic narrative generated yet. Click Regenerate to invoke LLM synthesis.'}"
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#FF5722]" /> Hallucination-Constrained
                </span>
                <span>Section 16 Specification</span>
              </div>
            </div>

            {/* Composite Risk Score Meter */}
            <div className="bg-[#171717] border border-white/8 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-400 font-medium">Composite Risk Score</span>
                <span className="text-base font-bold font-mono text-white">
                  {entity?.risk_score ?? 0} <span className="text-xs text-zinc-500">/ 100</span>
                </span>
              </div>
              <div className="w-full bg-[#202020] rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${tierStyle.bar}`}
                  style={{ width: `${Math.min(100, entity?.risk_score || 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1.5">
                <span>0 (Clean)</span>
                <span>85 (Medium)</span>
                <span>95 (High)</span>
                <span>99 (Critical)</span>
              </div>
            </div>

            {/* Explainable Graph Feature Percentiles */}
            <div className="bg-[#171717] border border-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Topological Feature Breakdown</span>
                </h4>
                <span className="text-[10px] text-zinc-500 font-mono">GDS Percentiles</span>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* PageRank */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-300">Capital Centrality (PageRank)</span>
                    <span className="font-mono text-[#FF8A35] font-semibold">
                      {entity?.pagerank_percentile ?? 0}th percentile
                    </span>
                  </div>
                  <div className="w-full bg-[#202020] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#FF5722] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${entity?.pagerank_percentile || 0}%` }}
                    />
                  </div>
                </div>

                {/* Betweenness */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-300">Bridge Hub Flow (Betweenness)</span>
                    <span className="font-mono text-amber-400 font-semibold">
                      {entity?.betweenness_percentile ?? 0}th percentile
                    </span>
                  </div>
                  <div className="w-full bg-[#202020] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${entity?.betweenness_percentile || 0}%` }}
                    />
                  </div>
                </div>

                {/* Shell Density */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-300">Cluster Shell Density</span>
                    <span className="font-mono text-yellow-400 font-semibold">
                      {entity?.community_shell_density_percentile ?? 0}th percentile
                    </span>
                  </div>
                  <div className="w-full bg-[#202020] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${entity?.community_shell_density_percentile || 0}%` }}
                    />
                  </div>
                </div>

                {/* Amount Anomaly */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-300">Structuring / Smurfing Anomaly</span>
                    <span className="font-mono text-red-400 font-semibold">
                      {entity?.amount_anomaly_percentile ?? 0}th percentile
                    </span>
                  </div>
                  <div className="w-full bg-[#202020] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${entity?.amount_anomaly_percentile || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Circular Layering Loops */}
            {cycles.length > 0 && (
              <div className="bg-[#1b1414] border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 mb-2.5">
                  <AlertOctagon className="w-4 h-4 text-red-500" />
                  <span>Circular Layering Involvement ({cycles.length})</span>
                </div>
                <div className="space-y-2">
                  {cycles.map((cycleEntities, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] font-mono bg-[#0e0a0a] p-2.5 rounded-lg border border-red-500/20 text-zinc-200 break-all"
                    >
                      {cycleEntities.join(' → ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions History */}
            <div className="bg-[#171717] border border-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Recent Transactions ({inTxns.length + outTxns.length})</span>
                </h4>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 text-xs pr-1">
                {inTxns.length === 0 && outTxns.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs">
                    No recorded transactions for this entity.
                  </div>
                ) : (
                  <>
                    {inTxns.slice(0, 5).map((t, idx) => (
                      <div
                        key={`in_${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#202020] border border-white/5"
                      >
                        <div className="flex items-center gap-2 text-emerald-400">
                          <ArrowDownLeft className="w-4 h-4" />
                          <span className="font-mono text-[11px] text-zinc-300 truncate max-w-[150px]">
                            from {t.from}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white">
                          ₹{Number(t.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    {outTxns.slice(0, 5).map((t, idx) => (
                      <div
                        key={`out_${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#202020] border border-white/5"
                      >
                        <div className="flex items-center gap-2 text-[#FF8A35]">
                          <ArrowUpRight className="w-4 h-4" />
                          <span className="font-mono text-[11px] text-zinc-300 truncate max-w-[150px]">
                            to {t.to}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white">
                          ₹{Number(t.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/8 bg-[#141414] flex items-center justify-between text-xs text-zinc-400">
          <span className="font-mono text-[11px]">Skein Forensic Engine</span>
          <button
            onClick={() => selectEntity(null)}
            className="px-3 py-1.5 rounded-lg bg-[#202020] hover:bg-[#282828] text-white font-medium transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </aside>
    </>
  );
}
export default EntityPanel;
