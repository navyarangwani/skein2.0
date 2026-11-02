import React, { useState } from 'react';
import { AnalysisProvider } from './context/AnalysisContext';
import { DashboardPage } from './pages/DashboardPage';
import { AlertsPage } from './pages/AlertsPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { SetupPage } from './pages/SetupPage';
import { LiveIndicator } from './components/LiveIndicator';
import {
  ShieldAlert,
  Network,
  Layers,
  Bell,
  Settings,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Navigation Header */}
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-cyan-950/50">
                <Network className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold tracking-wider text-white">
                    SKEIN
                  </h1>
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-1.5 py-0.2 rounded font-mono font-semibold">
                    v3.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Real-Time Financial Crime Network Detector
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner text-xs">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Live Graph</span>
              </button>

              <button
                onClick={() => setActiveTab('communities')}
                className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'communities'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Communities</span>
              </button>

              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'alerts'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Alerts Feed</span>
              </button>

              <button
                onClick={() => setActiveTab('setup')}
                className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'setup'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Setup & Stream</span>
              </button>
            </nav>

            {/* Live Indicator */}
            <div className="flex items-center gap-3">
              <LiveIndicator />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'communities' && (
            <CommunitiesPage onNavigateToEntity={() => setActiveTab('dashboard')} />
          )}
          {activeTab === 'alerts' && (
            <AlertsPage onNavigateToEntity={() => setActiveTab('dashboard')} />
          )}
          {activeTab === 'setup' && <SetupPage />}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span>Skein AML Network Engine</span>
              <span>•</span>
              <span>Author: Navya Rangwani</span>
              <span>•</span>
              <span className="text-slate-400">Target: Deloitte / Big 4 Forensic Advisory</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Neo4j GDS
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Redis Streams
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Isolation Forest
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                GraphSAGE GNN
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                AI Narrator
              </span>
            </div>
          </div>
        </footer>
      </div>
    </AnalysisProvider>
  );
}

export default App;
