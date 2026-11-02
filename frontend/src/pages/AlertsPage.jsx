import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { ShieldAlert, BarChart3, Clock, CheckCircle2, AlertOctagon, ArrowRight } from 'lucide-react';

export function AlertsPage({ onNavigateToEntity }) {
  const { alerts, selectEntity } = useAnalysis();
  const [filterSource, setFilterSource] = useState('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSource === 'ALL') return true;
    return a.alert_source === filterSource;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Financial Crime Alerts Feed
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time speed layer detections and periodic batch anomaly alerts
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filter Source:</span>
          {['ALL', 'speed_layer', 'batch_layer'].map((source) => (
            <button
              key={source}
              onClick={() => setFilterSource(source)}
              className={`px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                filterSource === source
                  ? 'bg-slate-800 text-white border-cyan-500'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {source === 'ALL'
                ? 'All Alerts'
                : source === 'speed_layer'
                ? 'Speed Layer (Cycles)'
                : 'Batch Layer (High Risk)'}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No alerts recorded yet. Stream incoming transactions to trigger real-time detections.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Source & Alert ID</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Entities Involved</th>
                  <th className="p-3.5">Risk Score / Volume</th>
                  <th className="p-3.5">Slack Delivery</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAlerts.map((alert) => {
                  const isSpeed = alert.alert_source === 'speed_layer';
                  return (
                    <tr key={alert.alert_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-lg ${
                              isSpeed
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {isSpeed ? (
                              <AlertOctagon className="w-3.5 h-3.5" />
                            ) : (
                              <BarChart3 className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <div>
                            <span className="font-mono font-bold text-white">
                              {alert.alert_id}
                            </span>
                            <div className="text-[10px] uppercase font-semibold text-slate-400">
                              {isSpeed ? 'Speed Layer' : 'Batch Layer'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(alert.sent_at).toLocaleTimeString()}</span>
                        </div>
                      </td>

                      <td className="p-3.5 max-w-xs truncate">
                        {isSpeed && alert.cycle_entities ? (
                          <div className="font-mono text-cyan-300">
                            {alert.cycle_entities.slice(0, 4).join(' → ')}
                            {alert.cycle_entities.length > 4 ? ' ...' : ''}
                          </div>
                        ) : (
                          <span className="font-mono font-semibold text-amber-300">
                            {alert.entity_id || 'Network Cluster'}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono font-bold">
                        {isSpeed ? (
                          <span className="text-cyan-400">Circular Layering Loop</span>
                        ) : (
                          <span className="text-amber-400">{alert.risk_score} / 100</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                            alert.slack_status === 'sent'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {alert.slack_status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            const target = isSpeed
                              ? alert.cycle_entities?.[0]
                              : alert.entity_id;
                            if (target) {
                              selectEntity(target);
                              if (onNavigateToEntity) onNavigateToEntity();
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors inline-flex items-center gap-1 font-medium"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
