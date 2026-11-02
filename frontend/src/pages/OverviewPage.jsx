import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import {
  Network,
  Users,
  Repeat,
  ShieldAlert,
  AlertTriangle,
  GitBranch,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Clock,
  Radio,
} from 'lucide-react';

export function OverviewPage({ onNavigate }) {
  const { stats, streamStatus, cycles, alerts, selectEntity } = useAnalysis();

  return (
    <div className="space-y-6">
      {/* 1. Executive Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Entities */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
            <span>Active Entities</span>
            <Users className="w-4 h-4 text-[#FF8A35]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              {stats.total_entities?.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#71717A] mt-0.5">Neo4j Property Graph</div>
          </div>
        </div>

        {/* Transactions */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
            <span>Transactions Ingested</span>
            <Repeat className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              {stats.total_transactions?.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#71717A] mt-0.5">
              {streamStatus.transactions_processed} processed
            </div>
          </div>
        </div>

        {/* Layering Cycles */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border-l-2 border-l-[#FF5722]">
          <div className="flex items-center justify-between text-xs text-[#FF8A35]">
            <span>Layering Loops</span>
            <ShieldAlert className="w-4 h-4 text-[#FF5722] animate-pulse" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[#FF5722]">
              {stats.cycles_detected}
            </div>
            <div className="text-[10px] text-[#A1A1AA] mt-0.5">&lt; 2ms Speed Layer Hit</div>
          </div>
        </div>

        {/* High / Critical Risk */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border-l-2 border-l-rose-500">
          <div className="flex items-center justify-between text-xs text-rose-300">
            <span>High/Critical Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-rose-400">
              {(stats.critical_count || 0) + (stats.high_count || 0)}
            </div>
            <div className="text-[10px] text-[#71717A] mt-0.5">
              {stats.critical_count || 0} Critical • {stats.high_count || 0} High
            </div>
          </div>
        </div>

        {/* GNN Predicted Links */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span>Predicted Links</span>
            <GitBranch className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-purple-300">
              {stats.predicted_links_count || 0}
            </div>
            <div className="text-[10px] text-[#71717A] mt-0.5">Inductive GraphSAGE</div>
          </div>
        </div>

        {/* Ingestion Stream Velocity */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span>Stream Velocity</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-amber-400">
              {streamStatus.is_running ? `${streamStatus.rate_per_second}` : '0'}
              <span className="text-xs font-normal text-[#A1A1AA] ml-1">tx/s</span>
            </div>
            <div className="text-[10px] text-[#71717A] mt-0.5 uppercase">
              {streamStatus.mode} queue
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Forensic Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Real-time Circular Layering & Live Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Circular Layering Card */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FF5722]/15 text-[#FF5722] rounded-xl border border-[#FF5722]/30">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Confirmed Circular Layering Loops
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Closed shell entity rings flagged in real-time by the Speed Layer
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('cycles')}
                className="text-xs text-[#FF8A35] hover:text-[#ff9c50] flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <span>View All ({cycles.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {cycles.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#71717A] bg-[#111111] rounded-xl border border-white/[0.04]">
                No circular layering loops detected yet. Ingest transactions to begin real-time cycle detection.
              </div>
            ) : (
              <div className="space-y-3">
                {cycles.slice(0, 3).map((cycle, idx) => (
                  <div
                    key={cycle.cycle_id || idx}
                    className="bg-[#111111] hover:bg-[#141414] border border-white/[0.06] hover:border-[#FF5722]/40 rounded-xl p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#FF5722]">
                          {cycle.cycle_id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-[#FF5722]/15 text-[#FF8A35] border border-[#FF5722]/30">
                          {cycle.source?.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-[#A1A1AA]">
                          {cycle.length} shell entities
                        </span>
                      </div>
                      <div className="font-mono text-xs text-white mt-1.5 flex items-center gap-1.5 flex-wrap">
                        {cycle.entities?.slice(0, 4).map((ent, eIdx) => (
                          <React.Fragment key={ent}>
                            <button
                              onClick={() => selectEntity(ent)}
                              className="hover:text-[#FF8A35] transition-colors underline decoration-dotted"
                            >
                              {ent}
                            </button>
                            {eIdx < Math.min(3, cycle.entities.length - 1) && (
                              <span className="text-[#71717A]">→</span>
                            )}
                          </React.Fragment>
                        ))}
                        {cycle.entities?.length > 4 && (
                          <span className="text-[#71717A]">+{cycle.entities.length - 4} more</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-white">
                          ₹{Number(cycle.total_volume).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-[10px] text-[#71717A]">Loop Volume</div>
                      </div>
                      <button
                        onClick={() => selectEntity(cycle.entities?.[0])}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#202020] hover:bg-[#282828] text-white border border-white/[0.08] transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Alerts Feed Card */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/30">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Forensic Alert Stream</h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Direct feed from low-latency speed layer and periodic batch anomaly scans
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs text-[#FF8A35] hover:text-[#ff9c50] flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <span>View Full Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {alerts.slice(0, 4).map((a) => (
                <div
                  key={a.alert_id}
                  className="bg-[#111111] p-3 rounded-xl border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        a.alert_source === 'speed_layer' ? 'bg-[#FF5722]' : 'bg-amber-400'
                      }`}
                    />
                    <div className="truncate">
                      <span className="font-mono font-bold text-white mr-2">{a.alert_id}</span>
                      <span className="text-[#A1A1AA]">{a.message ? a.message.split('\n')[0] : (a.alert_source || 'Alert')}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#71717A] shrink-0 font-mono">
                    {a.sent_at ? new Date(a.sent_at).toLocaleTimeString() : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Risk Topology & Quick Actions */}
        <div className="space-y-6">
          {/* Risk Distribution Card */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-1">Entity Risk Distribution</h3>
            <p className="text-xs text-[#A1A1AA] mb-4">
              Percentile-ranked via Isolation Forest (200 trees, 0.05 contamination)
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-400 font-medium">Critical Risk (99th+)</span>
                  <span className="font-mono font-bold text-white">{stats.critical_count || 0}</span>
                </div>
                <div className="w-full bg-[#1c1c1c] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{
                      width: `${
                        stats.total_entities
                          ? ((stats.critical_count || 0) / stats.total_entities) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#FF5722] font-medium">High Risk (95th–98th)</span>
                  <span className="font-mono font-bold text-white">{stats.high_count || 0}</span>
                </div>
                <div className="w-full bg-[#1c1c1c] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FF5722] h-full rounded-full"
                    style={{
                      width: `${
                        stats.total_entities
                          ? ((stats.high_count || 0) / stats.total_entities) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-400 font-medium">Medium Risk (85th–94th)</span>
                  <span className="font-mono font-bold text-white">{stats.medium_count || 0}</span>
                </div>
                <div className="w-full bg-[#1c1c1c] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{
                      width: `${
                        stats.total_entities
                          ? ((stats.medium_count || 0) / stats.total_entities) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-medium">Low Risk (&lt;85th)</span>
                  <span className="font-mono font-bold text-white">{stats.low_count || 0}</span>
                </div>
                <div className="w-full bg-[#1c1c1c] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${
                        stats.total_entities
                          ? ((stats.low_count || 0) / stats.total_entities) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Studio Navigation Links */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">Forensic Exploration</h3>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                onClick={() => onNavigate('graph')}
                className="w-full p-3 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-white/[0.06] hover:border-[#FF5722]/40 transition-all flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Network className="w-4 h-4 text-[#FF5722]" />
                  <div>
                    <div className="font-semibold text-white">Interactive Graph Studio</div>
                    <div className="text-[10px] text-[#71717A]">Force-directed live canvas</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />
              </button>

              <button
                onClick={() => onNavigate('predictions')}
                className="w-full p-3 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-white/[0.06] hover:border-purple-500/40 transition-all flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white">GNN Emerging Links</div>
                    <div className="text-[10px] text-[#71717A]">Inductive GraphSAGE forecast</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />
              </button>

              <button
                onClick={() => onNavigate('communities')}
                className="w-full p-3 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-white/[0.06] hover:border-indigo-500/40 transition-all flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-semibold text-white">Louvain Community Clusters</div>
                    <div className="text-[10px] text-[#71717A]">Shell company density scan</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
