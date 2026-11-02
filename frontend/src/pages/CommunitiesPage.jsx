import React, { useState, useMemo } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Layers, ShieldAlert, ArrowRight, Building, Users, Search, ChevronDown, ChevronUp, AlertOctagon } from 'lucide-react';

export function CommunitiesPage({ onNavigateToEntity }) {
  const { communities, selectEntity } = useAnalysis();
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const filteredCommunities = useMemo(() => {
    return communities.filter((comm) => {
      const matchesSearch =
        !search ||
        comm.community_id.toString().includes(search) ||
        comm.sample_members?.some((m) => m.toLowerCase().includes(search.toLowerCase()));

      const matchesTier =
        tierFilter === 'ALL' ||
        comm.risk_tier?.toLowerCase() === tierFilter.toLowerCase();

      return matchesSearch && matchesTier;
    });
  }, [communities, search, tierFilter]);

  const stats = useMemo(() => {
    const total = communities.length;
    const critical = communities.filter((c) => c.risk_tier === 'critical' || c.risk_tier === 'high').length;
    const totalMembers = communities.reduce((acc, c) => acc + (c.member_count || 0), 0);
    const avgShellDensity = total > 0
      ? (communities.reduce((acc, c) => acc + (c.shell_density || 0), 0) / total) * 100
      : 0;
    return { total, critical, totalMembers, avgShellDensity };
  }, [communities]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#171717] border border-white/8 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Louvain Community Partitions</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Densely connected transactional clusters computed via GDS Louvain modularity algorithm
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Total Clusters:</span>
          <span className="font-mono text-base font-bold text-[#FF8A35] bg-[#202020] px-3 py-1 rounded-xl border border-white/8">
            {communities.length}
          </span>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#171717] border border-white/8 rounded-2xl p-4">
          <div className="text-xs text-zinc-400 font-medium">Total Partitions</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.total}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Louvain graph modularity</div>
        </div>

        <div className="bg-[#171717] border border-white/8 rounded-2xl p-4">
          <div className="text-xs text-zinc-400 font-medium">High / Critical Clusters</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">{stats.critical}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Requires forensic audit</div>
        </div>

        <div className="bg-[#171717] border border-white/8 rounded-2xl p-4">
          <div className="text-xs text-zinc-400 font-medium">Entities Clustered</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.totalMembers}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Across all partitions</div>
        </div>

        <div className="bg-[#171717] border border-white/8 rounded-2xl p-4">
          <div className="text-xs text-zinc-400 font-medium">Avg Shell Density</div>
          <div className="text-2xl font-bold font-mono text-[#FF8A35] mt-1">{stats.avgShellDensity.toFixed(1)}%</div>
          <div className="text-[11px] text-zinc-500 mt-1">Shell company infiltration</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#171717] border border-white/8 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Community ID or Member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-white/8 rounded-xl pl-10 pr-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5722]"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-zinc-500 mr-1">Risk Filter:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
                tierFilter === tier
                  ? 'bg-gradient-to-r from-[#FF5722] to-[#FF8A35] text-white border-transparent shadow-md'
                  : 'bg-[#202020] text-zinc-400 border-white/5 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Communities Table */}
      <div className="bg-[#171717] border border-white/8 rounded-2xl shadow-xl overflow-hidden">
        {filteredCommunities.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-sm">
            No communities matching current criteria. Run batch analysis to re-partition graph.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#141414] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-white/8">
                <tr>
                  <th className="p-4">Partition ID</th>
                  <th className="p-4">Members</th>
                  <th className="p-4">Shell Density</th>
                  <th className="p-4">Cluster Tier</th>
                  <th className="p-4">Max Risk</th>
                  <th className="p-4">Total In-Cluster Volume</th>
                  <th className="p-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCommunities.map((comm) => {
                  const isExpanded = expandedId === comm.community_id;
                  const isCritical = comm.risk_tier === 'critical';
                  const isHigh = comm.risk_tier === 'high';

                  return (
                    <React.Fragment key={comm.community_id}>
                      <tr
                        className={`hover:bg-[#202020]/60 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-[#202020]/40' : ''
                        }`}
                        onClick={() => setExpandedId(isExpanded ? null : comm.community_id)}
                      >
                        <td className="p-4 font-mono font-bold text-white flex items-center gap-2">
                          <span className="text-[#FF8A35]">COMM_{comm.community_id}</span>
                        </td>

                        <td className="p-4 text-white">
                          <span className="font-mono font-semibold">{comm.member_count}</span> entities
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold ${
                                comm.shell_density > 0.2 ? 'text-red-400' : 'text-zinc-300'
                              }`}
                            >
                              {(comm.shell_density * 100).toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              ({comm.shell_company_count} shells)
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                              isCritical
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : isHigh
                                ? 'bg-[#FF5722]/15 text-[#FF8A35] border-[#FF5722]/30'
                                : comm.risk_tier === 'medium'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {comm.risk_tier}
                          </span>
                        </td>

                        <td className="p-4 font-mono font-bold text-white">
                          {comm.max_risk_score} <span className="text-zinc-500 text-[10px]">/ 100</span>
                        </td>

                        <td className="p-4 font-mono font-bold text-zinc-200">
                          ₹{Number(comm.total_volume).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>

                        <td className="p-4 text-right">
                          <button className="text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-[#222222] hover:bg-[#282828] transition-colors inline-flex items-center gap-1">
                            <span>{isExpanded ? 'Hide' : 'Expand'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Member Row */}
                      {isExpanded && (
                        <tr className="bg-[#121212]">
                          <td colSpan={7} className="p-5 border-t border-white/5">
                            <div className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center justify-between">
                              <span>Cluster Member Entities ({comm.sample_members?.length || 0} shown):</span>
                              <span className="text-[11px] text-zinc-500">Click any entity to open Forensic Dossier</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {comm.sample_members?.map((memberId) => (
                                <button
                                  key={memberId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectEntity(memberId);
                                    if (onNavigateToEntity) onNavigateToEntity();
                                  }}
                                  className="font-mono text-[11px] bg-[#1c1c1c] hover:bg-[#FF5722]/20 hover:text-[#FF8A35] hover:border-[#FF5722]/50 border border-white/10 px-3 py-1.5 rounded-lg text-zinc-200 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                                >
                                  <span>{memberId}</span>
                                  <ArrowRight className="w-3 h-3 text-zinc-500" />
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
export default CommunitiesPage;
