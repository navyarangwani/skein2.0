import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Search, Filter, AlertOctagon, SlidersHorizontal, RotateCcw } from 'lucide-react';

export function FilterBar() {
  const { filters, setFilters } = useAnalysis();

  const tiers = [
    { label: 'All Tiers', value: 'ALL' },
    { label: 'Critical', value: 'CRITICAL', color: 'text-red-400 border-red-500/30' },
    { label: 'High', value: 'HIGH', color: 'text-[#FF8A35] border-[#FF5722]/40' },
    { label: 'Medium', value: 'MEDIUM', color: 'text-amber-400 border-amber-500/30' },
    { label: 'Low', value: 'LOW', color: 'text-emerald-400 border-emerald-500/30' },
  ];

  const handleReset = () => {
    setFilters({
      search: '',
      tier: 'ALL',
      cycleOnly: false,
      minRisk: 0,
    });
  };

  return (
    <div className="bg-[#171717] border border-white/8 rounded-2xl p-4 shadow-xl mb-4 flex flex-wrap items-center justify-between gap-4 text-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by Entity ID, Corporate Name..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full bg-[#111111] border border-white/8 rounded-xl pl-10 pr-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5722] transition-colors"
        />
      </div>

      {/* Tier Filter Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-zinc-500 mr-1 font-medium">Risk Tier:</span>
        {tiers.map((t) => {
          const isActive = filters.tier === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setFilters({ ...filters, tier: t.value })}
              className={`px-3 py-1.5 rounded-lg font-medium border transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF5722] to-[#FF8A35] text-white border-transparent shadow-md font-semibold'
                  : 'bg-[#202020] text-zinc-400 border-white/5 hover:text-white hover:bg-[#252525]'
              } ${!isActive && t.color ? t.color : ''}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Cycle Members Only Toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer bg-[#202020] border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg transition-colors">
          <input
            type="checkbox"
            checked={filters.cycleOnly}
            onChange={(e) => setFilters({ ...filters, cycleOnly: e.target.checked })}
            className="rounded accent-[#FF5722] cursor-pointer"
          />
          <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
          <span className="text-zinc-300 font-medium">Cycle Members Only</span>
        </label>
      </div>

      {/* Min Risk Slider */}
      <div className="flex items-center gap-2.5 text-zinc-400 bg-[#202020] border border-white/5 px-3 py-1.5 rounded-lg">
        <span className="text-[11px] font-medium">Min Score:</span>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.minRisk}
          onChange={(e) => setFilters({ ...filters, minRisk: Number(e.target.value) })}
          className="w-20 accent-[#FF5722] cursor-pointer"
        />
        <span className="font-mono font-bold text-[#FF8A35] w-6 text-right">{filters.minRisk}</span>
      </div>

      {/* Reset Button */}
      {(filters.search || filters.tier !== 'ALL' || filters.cycleOnly || filters.minRisk > 0) && (
        <button
          onClick={handleReset}
          className="p-2 rounded-lg bg-[#202020] text-zinc-400 hover:text-white hover:bg-[#252525] transition-colors cursor-pointer"
          title="Reset filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
export default FilterBar;
