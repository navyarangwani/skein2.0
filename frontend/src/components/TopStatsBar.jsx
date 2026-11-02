import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { api } from '../api/client';
import {
  Users,
  Repeat,
  AlertTriangle,
  Play,
  Square,
  Sparkles,
  Layers,
  RefreshCw,
} from 'lucide-react';

export function TopStatsBar() {
  const { stats, streamStatus, fetchStreamStatus, triggerManualBatch, batchEvaluating } = useAnalysis();

  const isStreaming = streamStatus.is_running;

  const toggleStream = async () => {
    try {
      if (isStreaming) {
        await api.stopStream();
      } else {
        await api.startStream(5.0);
      }
      await fetchStreamStatus();
    } catch (err) {
      console.error('Failed to toggle stream:', err);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {/* 1. Entities */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Active Entities</span>
          <Users className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-bold font-mono text-white">
          {stats.total_entities?.toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Neo4j Property Graph</div>
      </div>

      {/* 2. Transactions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Transactions Ingested</span>
          <Repeat className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-xl font-bold font-mono text-white">
          {stats.total_transactions?.toLocaleString()}
        </div>
        <div className="text-[10px] text-indigo-400/80 mt-0.5 flex items-center gap-1">
          <span>Speed: {streamStatus.transactions_processed} live</span>
        </div>
      </div>

      {/* 3. Layering Cycles */}
      <div className="bg-slate-900/80 border border-rose-900/50 rounded-xl p-3 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between text-rose-300 text-xs mb-1">
          <span>Layering Cycles</span>
          <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
        </div>
        <div className="text-xl font-bold font-mono text-rose-400">
          {stats.cycles_detected}
        </div>
        <div className="text-[10px] text-rose-400/80 mt-0.5">Real-Time Speed Detection</div>
      </div>

      {/* 4. High / Critical Risk */}
      <div className="bg-slate-900/80 border border-amber-900/50 rounded-xl p-3 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
          <span>High/Critical Entities</span>
          <ShieldAlertIcon className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xl font-bold font-mono text-amber-300">
          {(stats.critical_count || 0) + (stats.high_count || 0)}
        </div>
        <div className="text-[10px] text-amber-400/80 mt-0.5">
          {stats.critical_count || 0} Critical, {stats.high_count || 0} High
        </div>
      </div>

      {/* 5. GNN Predicted Links */}
      <div className="bg-slate-900/80 border border-purple-900/50 rounded-xl p-3 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between text-purple-300 text-xs mb-1">
          <span>Predicted Links</span>
          <Sparkles className="w-4 h-4 text-fuchsia-400" />
        </div>
        <div className="text-xl font-bold font-mono text-fuchsia-300">
          {stats.predicted_links_count || 0}
        </div>
        <div className="text-[10px] text-fuchsia-400/80 mt-0.5">Inductive GraphSAGE</div>
      </div>

      {/* 6. Quick Action Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between shadow-md">
        <button
          onClick={toggleStream}
          className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            isStreaming
              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
          }`}
        >
          {isStreaming ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              Pause Stream
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Live Stream
            </>
          )}
        </button>

        <button
          onClick={triggerManualBatch}
          disabled={batchEvaluating}
          className="w-full mt-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-cyan-400 ${batchEvaluating ? 'animate-spin' : ''}`}
          />
          {batchEvaluating ? 'Analyzing...' : 'Run Batch Pass'}
        </button>
      </div>
    </div>
  );
}

function ShieldAlertIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
