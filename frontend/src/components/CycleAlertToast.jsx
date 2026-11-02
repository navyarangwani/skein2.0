import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { ShieldAlert, X, Eye, ArrowRight, AlertOctagon } from 'lucide-react';

export function CycleAlertToast() {
  const { toasts, dismissToast, selectEntity } = useAnalysis();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#171717] border border-[#FF5722]/60 rounded-2xl p-4 shadow-[0_12px_40px_rgba(255,87,34,0.18)] backdrop-blur-xl text-zinc-100 animate-slide-in-right transform transition-all hover:scale-[1.01]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FF5722]/15 text-[#FF5722] rounded-xl border border-[#FF5722]/30 animate-pulse">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A35]">
                    Real-Time Speed Layer
                  </span>
                  <span className="text-[10px] bg-[#221714] text-[#FF8A35] border border-[#FF5722]/30 px-1.5 py-0.5 rounded font-mono">
                    {toast.cycle_id}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Circular Layering Loop Detected!
                </h4>
              </div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-[#202020] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 bg-[#0e0e0e] border border-white/6 rounded-xl p-3 text-xs text-zinc-300 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Total Loop Volume:</span>
              <span className="font-mono font-bold text-[#FF8A35]">
                ₹{Number(toast.volume).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Ring Size:</span>
              <span className="font-semibold text-white">
                {toast.length} Shell Entities
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 pt-1.5 border-t border-white/5 truncate">
              Loop:{' '}
              <span className="font-mono text-[#FF8A35]">
                {toast.entities.slice(0, 3).join(' → ')}
                {toast.entities.length > 3 ? ` → +${toast.entities.length - 3} more` : ''}
              </span>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-mono">{toast.timestamp}</span>
            <button
              onClick={() => {
                if (toast.entities && toast.entities.length > 0) {
                  selectEntity(toast.entities[0]);
                }
                dismissToast(toast.id);
              }}
              className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#FF5722] to-[#FF8A35] hover:opacity-90 text-white font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Ring</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
export default CycleAlertToast;
