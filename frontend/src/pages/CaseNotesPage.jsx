import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import {
  Sparkles,
  Search,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Building,
  User,
  AlertOctagon,
} from 'lucide-react';
import { api } from '../api/client';

export function CaseNotesPage() {
  const { graphData, selectEntity } = useAnalysis();
  const [search, setSearch] = useState('');
  const [refreshingId, setRefreshingId] = useState(null);

  const nodes = graphData.nodes || [];

  // Filter nodes that have case notes or are high risk
  const relevantNodes = nodes.filter((n) => {
    const hasNote = Boolean(n.case_note);
    const isHigh = n.risk_tier === 'critical' || n.risk_tier === 'high' || n.in_cycle;
    const matchesSearch =
      !search ||
      n.id.toLowerCase().includes(search.toLowerCase()) ||
      n.name.toLowerCase().includes(search.toLowerCase());

    return (hasNote || isHigh) && matchesSearch;
  });

  const handleRefresh = async (entityId) => {
    setRefreshingId(entityId);
    try {
      await api.triggerNarrative(entityId);
      await selectEntity(entityId);
    } catch (err) {
      console.error('Failed to refresh case note:', err);
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5722]/15 border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Grounded AI Compliance Case Notes
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF5722]/20 text-[#FF8A35] border border-[#FF5722]/40">
                  {relevantNodes.length} Case Files
                </span>
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Structured graph signals synthesized into concise 3-4 sentence summaries readable in &lt;15 seconds
              </p>
            </div>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF5722]"
            />
          </div>
        </div>
      </div>

      {/* Case Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relevantNodes.length === 0 ? (
          <div className="col-span-2 glass-card rounded-2xl p-12 text-center text-xs text-[#71717A]">
            No case files available. Entities flagged high/critical or participating in circular layering loops automatically receive AI compliance case notes.
          </div>
        ) : (
          relevantNodes.map((node) => {
            const isRefreshing = refreshingId === node.id;
            return (
              <div
                key={node.id}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between border-t-2 border-t-[#FF5722]"
              >
                <div>
                  {/* Entity Header */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{node.id}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded-full border ${
                          node.risk_tier === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-[#FF5722]/20 text-[#FF8A35] border-[#FF5722]/40'
                        }`}
                      >
                        {node.risk_tier} Risk ({node.risk_score}/100)
                      </span>
                    </div>

                    <button
                      onClick={() => handleRefresh(node.id)}
                      disabled={isRefreshing}
                      className="text-[11px] text-[#A1A1AA] hover:text-[#FF8A35] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Regenerate Grounded Case Note"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? 'Synthesizing...' : 'Refresh'}</span>
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {node.name}
                    {node.in_cycle && (
                      <span className="text-[10px] text-[#FF5722] bg-[#FF5722]/15 px-1.5 py-0.2 rounded border border-[#FF5722]/30">
                        In Layering Loop
                      </span>
                    )}
                  </h3>

                  {/* AI Note Text */}
                  <div className="mt-3 bg-[#111111] p-3 rounded-xl border border-white/[0.04] text-xs text-[#A1A1AA] leading-relaxed italic">
                    "{node.case_note || 'Generating audit-grade compliance summary...'}"
                  </div>

                  {/* Topological Signals */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
                    <div className="bg-[#141414] p-1.5 rounded border border-white/[0.04]">
                      <span className="text-[#71717A] block">PageRank</span>
                      <span className="text-white font-bold">{node.pagerank_percentile || 0}th%</span>
                    </div>
                    <div className="bg-[#141414] p-1.5 rounded border border-white/[0.04]">
                      <span className="text-[#71717A] block">Structuring</span>
                      <span className="text-[#FF5722] font-bold">{node.amount_anomaly_percentile || 0}th%</span>
                    </div>
                    <div className="bg-[#141414] p-1.5 rounded border border-white/[0.04]">
                      <span className="text-[#71717A] block">Shell Density</span>
                      <span className="text-amber-400 font-bold">{node.community_shell_density_percentile || 0}th%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#71717A]">
                    Drift Protection: Regenerates only on &gt;10pt change
                  </span>
                  <button
                    onClick={() => selectEntity(node.id)}
                    className="text-xs font-semibold text-[#FF8A35] hover:text-[#ff9c50] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
