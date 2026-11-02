import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Activity, Radio, AlertCircle } from 'lucide-react';

export function LiveIndicator() {
  const { isConnected, streamStatus, lastMessageTime } = useAnalysis();

  const isStreaming = streamStatus.is_running;

  return (
    <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 shadow-lg backdrop-blur-md text-xs">
      {/* WebSocket Status */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isConnected ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          ></span>
        </span>
        <span className="font-medium text-slate-300">
          {isConnected ? 'WS Live' : 'Disconnected'}
        </span>
      </div>

      <div className="h-3 w-px bg-slate-700" />

      {/* Stream Engine Status */}
      <div className="flex items-center gap-2">
        <Radio
          className={`w-3.5 h-3.5 ${
            isStreaming ? 'text-cyan-400 animate-pulse' : 'text-slate-500'
          }`}
        />
        <span className="text-slate-400">
          Stream:{' '}
          <span
            className={`font-semibold ${
              isStreaming ? 'text-cyan-300' : 'text-slate-400'
            }`}
          >
            {isStreaming ? `${streamStatus.rate_per_second} tx/s` : 'Paused'}
          </span>
        </span>
        <span className="text-slate-500 text-[10px] uppercase tracking-wider bg-slate-800 px-1.5 py-0.5 rounded">
          {streamStatus.mode}
        </span>
      </div>

      {lastMessageTime && (
        <>
          <div className="h-3 w-px bg-slate-700" />
          <span className="text-[11px] text-slate-400">
            Last event: {lastMessageTime.toLocaleTimeString()}
          </span>
        </>
      )}
    </div>
  );
}
