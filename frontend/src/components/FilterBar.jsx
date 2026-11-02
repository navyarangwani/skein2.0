import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Search, Filter, AlertOctagon, CheckCircle2 } from 'lucide-react';

export function FilterBar() {
  const { filters, setFilters, communities } = useAnalysis();

  const tiers = [
    { label: 'All Tiers', value: 'ALL' },
    { label: 'Critical', value: 'CRITICAL', color: 'text-rose-400 border-rose-500/50' },
    { label: 'High', value: 'HIGH', color: 'text-orange-400 border-orange-500/50' },
    { label: 'Medium', value: 'MEDIUM', color: 'text-amber-400 border-amber-500/50' },
    { label: 'Low', value: 'LOW', color: 'text-emerald-400 border-emerald-500/50' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by Entity ID or Name..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
        />
      </div>

      {/* Tier Filter Buttons */}
      <div className="flex items-center gap-1.5">
        <span className="text-slate-500 mr-1">Risk Tier:</span>
        {tiers.map((t) => {
          const isActive = filters.tier === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setFilters({ ...filters, tier: t.value })}
              className={`px-2.5 py-1 rounded-md font-medium border transition-all ${
                isActive
                  ? 'bg-slate-800 text-white border-cyan-500 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
              } ${t.color || ''}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Cycle Members Only Toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 cursor-pointer bg-slate-950/60 border border-slate-800 hover:border-slate-700 px-3 py-1 rounded-md">
          <input
            type="checkbox"
            checked={filters.cycleOnly}
            onChange={(e) => setFilters({ ...filters, cycleOnly: e.target.checked })}
            className="rounded border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
          />
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-slate-300 font-medium">Cycle Members Only</span>
        </label>
      </div>

      {/* Min Risk Slider */}
      <div className="flex items-center gap-2 text-slate-400">
        <span>Min Score:</span>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.minRisk}
          onChange={(e) => setFilters({ ...filters, minRisk: Number(e.target.value) })}
          className="w-24 accent-cyan-500 cursor-pointer"
        />
        <span className="font-mono text-cyan-400 w-6">{filters.minRisk}</span>
      </div>
    </div>
  );
}
