import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { X, Eye, ArrowRight, AlertOctagon, CheckCircle2 } from 'lucide-react';

export function CycleAlertToast() {
  const { toasts, dismissToast, clearAllToasts, selectEntity } = useAnalysis();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 md:left-72 z-30 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none animate-slide-in-up">
      {/* Header if multiple alerts */}
      {toasts.length > 1 && (
        <div className="pointer-events-auto flex items-center justify-between px-3 py-1 bg-[#141414]/90 border border-white/10 rounded-lg text-[10px] text-zinc-400 backdrop-blur-md">
          <span>{toasts.length} active detection alerts</span>
          <button
            onClick={clearAllToasts}
            className="text-[#FF8A35] hover:text-[#FF5722] font-semibold cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#171717]/95 border border-[#FF5722]/60 rounded-xl p-3.5 shadow-[0_8px_32px_rgba(255,87,34,0.18)] backdrop-blur-xl text-zinc-100 transform transition-all hover:scale-[1.01] relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-[#FF5722]/15 text-[#FF5722] rounded-lg border border-[#FF5722]/30 shrink-0 animate-pulse">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A35]">
                    Speed Layer Closed Loop
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate">
                  Circular Ring ({toast.length} Shells)
                </h4>
              </div>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-zinc-500 hover:text-white p-1 rounded-md hover:bg-[#222222] transition-colors cursor-pointer shrink-0"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Details */}
          <div className="mt-2.5 bg-[#0d0d0d] border border-white/6 rounded-lg p-2.5 text-xs text-zinc-300 space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-400">Loop Volume:</span>
              <span className="font-mono font-bold text-[#FF8A35]">
                ₹{Number(toast.volume).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 pt-1 border-t border-white/5 truncate font-mono">
              <span className="text-zinc-500 font-sans">Path: </span>
              <span className="text-white">
                {toast.entities.slice(0, 3).join(' → ')}
                {toast.entities.length > 3 ? ` → +${toast.entities.length - 3}` : ''}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-mono">{toast.timestamp}</span>
            <button
              onClick={() => {
                if (toast.entities && toast.entities.length > 0) {
                  selectEntity(toast.entities[0]);
                }
                clearAllToasts();
              }}
              className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#FF5722] to-[#FF8A35] hover:opacity-90 text-white font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Ring</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 6-second animated countdown bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#202020] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF8A35] animate-[shrink_6s_linear_forwards]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CycleAlertToast;
