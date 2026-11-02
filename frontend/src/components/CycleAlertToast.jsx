import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { ShieldAlert, X, Eye, ArrowRight } from 'lucide-react';

export function CycleAlertToast() {
  const { toasts, dismissToast, selectEntity } = useAnalysis();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900/95 border-2 border-rose-500/80 rounded-xl p-4 shadow-2xl backdrop-blur-md text-slate-100 animate-slide-in-right transform transition-all hover:scale-[1.01]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg animate-pulse">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Real-Time Speed Layer
                  </span>
                  <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded font-mono">
                    {toast.cycle_id}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">
                  Circular Layering Cycle Closed!
                </h4>
              </div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Loop Volume:</span>
              <span className="font-mono font-bold text-amber-400">
                ₹{Number(toast.volume).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ring Size:</span>
              <span className="font-semibold text-slate-200">
                {toast.length} Shell Entities
              </span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 truncate">
              Path:{' '}
              <span className="font-mono text-cyan-300">
                {toast.entities.slice(0, 3).join(' → ')}
                {toast.entities.length > 3 ? ` → +${toast.entities.length - 3} more` : ''}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">{toast.timestamp}</span>
            <button
              onClick={() => {
                if (toast.entities && toast.entities.length > 0) {
                  selectEntity(toast.entities[0]);
                }
                dismissToast(toast.id);
              }}
              className="inline-flex items-center gap-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium px-3 py-1.5 rounded-lg shadow-md transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Inspect Ring Member
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
