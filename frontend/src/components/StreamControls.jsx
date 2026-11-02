import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { api } from '../api/client';
import { Play, Square, Sliders, Activity, Radio, RefreshCw } from 'lucide-react';

export function StreamControls() {
  const { streamStatus, fetchStreamStatus } = useAnalysis();
  const [rate, setRate] = useState(streamStatus.rate_per_second || 5.0);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.startStream(Number(rate));
      await fetchStreamStatus();
    } catch (err) {
      console.error('Failed to start stream:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await api.stopStream();
      await fetchStreamStatus();
    } catch (err) {
      console.error('Failed to stop stream:', err);
    } finally {
      setLoading(false);
    }
  };

  const isRunning = streamStatus.is_running;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Radio className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Redis Streams Ingestion Engine</h3>
            <p className="text-xs text-slate-400">
              Simulates live financial transactions arrival via Redis Streams consumer groups
            </p>
          </div>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
            isRunning
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {isRunning ? 'Emitting Live' : 'Engine Idle'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Processed</span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
            {streamStatus.transactions_processed?.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">Transactions</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Queue Pending</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
            {streamStatus.queue_lag || 0}
          </div>
          <span className="text-[10px] text-slate-500">Events in PEL</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Active Backend</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 capitalize">
            {streamStatus.mode}
          </div>
          <span className="text-[10px] text-slate-500">At-least-once (XACK)</span>
        </div>
      </div>

      {/* Speed Slider */}
      <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-slate-400" /> Ingestion Speed (Transactions / sec)
          </span>
          <span className="font-mono text-cyan-400 font-bold">{rate} txns/sec</span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          disabled={isRunning}
          className="w-full accent-cyan-500 cursor-pointer disabled:opacity-50"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>1 tx/s (Slow observation)</span>
          <span>10 tx/s (Default Demo)</span>
          <span>50 tx/s (Stress Test)</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Real-Time Streaming
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop Streaming Pipeline
          </button>
        )}
      </div>
    </div>
  );
}
