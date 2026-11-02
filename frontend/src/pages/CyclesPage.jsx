import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import {
  Repeat,
  ShieldAlert,
  Zap,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  Layers,
} from 'lucide-react';

export function CyclesPage() {
  const { cycles, selectEntity } = useAnalysis();
  const [filterSource, setFilterSource] = useState('ALL');

  const filtered = cycles.filter((c) => {
    if (filterSource === 'ALL') return true;
    return c.source === filterSource;
  });

  return (
    <div className="space-y-6">
      {/* Forensic Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5722]/15 border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722]">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Circular Layering Scheme Intelligence
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF5722]/20 text-[#FF8A35] border border-[#FF5722]/40">
                  {cycles.length} Total Rings
                </span>
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Multi-hop circular transaction chains designed to disguise capital origin through shell company loops
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            {['ALL', 'speed_layer', 'batch_layer'].map((source) => (
              <button
                key={source}
                onClick={() => setFilterSource(source)}
                className={`px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer ${
                  filterSource === source
                    ? 'bg-[#FF5722]/20 text-[#FF8A35] border-[#FF5722]/50 shadow-sm'
                    : 'bg-[#111111] text-[#A1A1AA] border-white/[0.06] hover:text-white'
                }`}
              >
                {source === 'ALL'
                  ? 'All Schemes'
                  : source === 'speed_layer'
                  ? 'Speed Layer (<2ms)'
                  : 'Batch Layer Scan'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Forensic Cycles List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-xs text-[#71717A]">
            No circular layering schemes detected for this filter. Start the ingestion stream to observe real-time detection.
          </div>
        ) : (
          filtered.map((cycle, idx) => {
            const isSpeed = cycle.source === 'speed_layer';
            return (
              <div
                key={cycle.cycle_id || idx}
                className="glass-card rounded-2xl p-5 border-l-4 border-l-[#FF5722]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-white">
                      {cycle.cycle_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        isSpeed
                          ? 'bg-[#FF5722]/20 text-[#FF8A35] border-[#FF5722]/40'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      }`}
                    >
                      {isSpeed ? 'Real-Time Speed Layer' : 'Batch Graph Scan'}
                    </span>
                    <span className="text-xs text-[#A1A1AA]">
                      {cycle.length} Ring Members
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-[#FF5722]">
                        ₹{Number(cycle.total_volume).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-[#71717A]">Total Ring Volume</div>
                    </div>
                  </div>
                </div>

                {/* Ring Path Visualizer */}
                <div className="mt-4">
                  <div className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-2">
                    Circular Money Flow Sequence
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    {cycle.entities?.map((ent, eIdx) => (
                      <React.Fragment key={ent}>
                        <button
                          onClick={() => selectEntity(ent)}
                          className="px-3 py-1.5 rounded-lg bg-[#111111] hover:bg-[#FF5722]/20 border border-white/[0.08] hover:border-[#FF5722]/50 text-white hover:text-[#FF8A35] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{ent}</span>
                        </button>
                        <span className="text-[#FF5722] font-bold">→</span>
                      </React.Fragment>
                    ))}
                    <button
                      onClick={() => selectEntity(cycle.entities?.[0])}
                      className="px-3 py-1.5 rounded-lg bg-[#FF5722]/15 border border-[#FF5722]/40 text-[#FF8A35] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{cycle.entities?.[0]} (Closed)</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#71717A]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Detected at: {new Date(cycle.detected_at).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => selectEntity(cycle.entities?.[0])}
                    className="text-[#FF8A35] hover:text-[#ff9c50] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Inspect Target Entity Profile</span>
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
