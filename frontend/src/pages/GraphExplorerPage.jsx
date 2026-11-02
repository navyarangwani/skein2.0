import React from 'react';
import { FilterBar } from '../components/FilterBar';
import { GraphView } from '../components/GraphView';
import { Network, Maximize2, Sparkles, AlertOctagon } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

export function GraphExplorerPage() {
  const { stats } = useAnalysis();

  return (
    <div className="space-y-4">
      {/* Top Filter and Controls Bar */}
      <FilterBar />

      {/* Main Force-Directed Graph Canvas Container */}
      <div className="relative">
        <GraphView />
      </div>

      {/* Quick Canvas Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#A1A1AA] bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-white font-medium">
            <Network className="w-3.5 h-3.5 text-[#FF5722]" />
            Canvas Engine: 2D Force-Directed (D3 Velocity Decay 0.3)
          </span>
          <span>•</span>
          <span>Click any node to open the Forensic Intelligence Profile</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-[#FF5722]">
            {stats.cycles_detected} Active Layering Rings
          </span>
          <span>•</span>
          <span className="text-purple-400">
            {stats.predicted_links_count || 0} Inductive Forecasts
          </span>
        </div>
      </div>
    </div>
  );
}
