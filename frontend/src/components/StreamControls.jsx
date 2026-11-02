import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { api } from '../api/client';
import { Play, Square, Sliders, Activity, Radio, RefreshCw, Zap } from 'lucide-react';

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
    <div className="bg-[#171717] border border-white/8 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Redis Streams Ingestion Engine</h3>
            <p className="text-xs text-zinc-400">
              Simulates live financial transactions arrival via Redis Streams consumer groups
            </p>
          </div>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
            isRunning
              ? 'bg-[#FF5722]/20 text-[#FF8A35] border-[#FF5722]/40 animate-pulse'
              : 'bg-[#202020] text-zinc-400 border-white/5'
          }`}
        >
          {isRunning ? 'Emitting Live' : 'Engine Idle'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111111] border border-white/6 p-4 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Processed</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {streamStatus.transactions_processed?.toLocaleString() || 0}
          </div>
          <span className="text-[10px] text-zinc-500">Transactions</span>
        </div>

        <div className="bg-[#111111] border border-white/6 p-4 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Queue Pending</span>
          <div className="text-2xl font-bold font-mono text-[#FF8A35] mt-1">
            {streamStatus.queue_lag || 0}
          </div>
          <span className="text-[10px] text-zinc-500">Events in PEL</span>
        </div>

        <div className="bg-[#111111] border border-white/6 p-4 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Active Backend</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 capitalize">
            {streamStatus.mode || 'local'}
          </div>
          <span className="text-[10px] text-zinc-500">At-least-once (XACK)</span>
        </div>
      </div>

      {/* Speed Slider */}
      <div className="bg-[#111111] border border-white/6 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-zinc-300 font-medium flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FF5722]" /> Ingestion Rate
          </span>
          <span className="font-mono text-[#FF8A35] font-bold text-sm">{rate} txns/sec</span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          disabled={isRunning}
          className="w-full accent-[#FF5722] cursor-pointer disabled:opacity-40"
        />
        <div className="flex justify-between text-[10px] text-zinc-500 mt-1.5">
          <span>1 tx/s (Slow observation)</span>
          <span>10 tx/s (Default Demo)</span>
          <span>50 tx/s (High Throughput)</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF5722] to-[#FF8A35] hover:opacity-95 text-white flex items-center justify-center gap-2 shadow-lg shadow-[#FF5722]/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Real-Time Streaming</span>
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop Streaming Pipeline</span>
          </button>
        )}
      </div>
    </div>
  );
}
export default StreamControls;
