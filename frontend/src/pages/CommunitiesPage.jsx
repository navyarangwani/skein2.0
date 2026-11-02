import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Layers, ShieldAlert, ArrowRight, Building, Users } from 'lucide-react';

export function CommunitiesPage({ onNavigateToEntity }) {
  const { communities, selectEntity } = useAnalysis();
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Louvain Community Partitions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Densely connected transactional clusters computed via Louvain Community Detection algorithm
          </p>
        </div>
        <div className="text-xs bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          Total Communities:{' '}
          <span className="font-mono font-bold text-cyan-400">{communities.length}</span>
        </div>
      </div>

      {/* Communities Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {communities.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No community data available. Trigger a batch pass to execute Louvain partitioning.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Community ID</th>
                  <th className="p-3.5">Members</th>
                  <th className="p-3.5">Shell Company Density</th>
                  <th className="p-3.5">Cluster Risk Tier</th>
                  <th className="p-3.5">Max Entity Risk</th>
                  <th className="p-3.5">Total In-Cluster Volume</th>
                  <th className="p-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {communities.map((comm) => {
                  const isExpanded = expandedId === comm.community_id;
                  const isHigh = comm.risk_tier === 'critical' || comm.risk_tier === 'high';

                  return (
                    <React.Fragment key={comm.community_id}>
                      <tr
                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-slate-800/30' : ''
                        }`}
                        onClick={() => setExpandedId(isExpanded ? null : comm.community_id)}
                      >
                        <td className="p-3.5 font-mono font-bold text-cyan-300">
                          COMMUNITY_{comm.community_id}
                        </td>

                        <td className="p-3.5 text-slate-200">
                          <span className="font-mono font-bold">{comm.member_count}</span> entities
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold ${
                                comm.shell_density > 0.2 ? 'text-rose-400' : 'text-slate-300'
                              }`}
                            >
                              {(comm.shell_density * 100).toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-slate-500">
                              ({comm.shell_company_count} shells)
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              comm.risk_tier === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : comm.risk_tier === 'high'
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                : comm.risk_tier === 'medium'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {comm.risk_tier}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-amber-400">
                          {comm.max_risk_score} / 100
                        </td>

                        <td className="p-3.5 font-mono font-bold text-slate-200">
                          ₹{Number(comm.total_volume).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>

                        <td className="p-3.5 text-right">
                          <button className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800">
                            {isExpanded ? 'Hide' : 'Expand'}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Member Row */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90">
                          <td colSpan={7} className="p-4 border-t border-slate-800">
                            <div className="text-xs font-semibold text-slate-400 mb-2">
                              Cluster Members (Click to view forensic profile):
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {comm.sample_members.map((memberId) => (
                                <button
                                  key={memberId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectEntity(memberId);
                                    if (onNavigateToEntity) onNavigateToEntity();
                                  }}
                                  className="font-mono text-[11px] bg-slate-900 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/60 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span>{memberId}</span>
                                  <ArrowRight className="w-3 h-3 text-slate-500" />
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
