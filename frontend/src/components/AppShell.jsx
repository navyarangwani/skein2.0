import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { api } from '../api/client';
import {
  Network,
  LayoutDashboard,
  Repeat,
  Layers,
  Bell,
  GitBranch,
  Sparkles,
  Radio,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Play,
  Square,
  RefreshCw,
  Home,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { EntityPanel } from './EntityPanel';
import { CycleAlertToast } from './CycleAlertToast';

export function AppShell({ activeSection, onSelectSection, onExitToLanding, children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const {
    streamStatus,
    fetchStreamStatus,
    triggerManualBatch,
    batchEvaluating,
    isConnected,
    lastMessageTime,
  } = useAnalysis();

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

  const navGroups = [
    {
      group: 'INTELLIGENCE',
      items: [
        { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'graph', label: 'Network Graph Explorer', icon: Network },
      ],
    },
    {
      group: 'FORENSIC DETECTION',
      items: [
        { id: 'cycles', label: 'Circular Layering', icon: Repeat },
        { id: 'communities', label: 'Louvain Communities', icon: Layers },
        { id: 'alerts', label: 'Forensic Alerts Feed', icon: Bell },
      ],
    },
    {
      group: 'PREDICTIVE AI',
      items: [
        { id: 'predictions', label: 'GNN Link Predictions', icon: GitBranch },
        { id: 'narratives', label: 'AI Case-File Notes', icon: Sparkles },
      ],
    },
    {
      group: 'PIPELINE & SYSTEM',
      items: [
        { id: 'streaming', label: 'Ingestion & Generator', icon: Radio },
        { id: 'system', label: 'System Defensibility', icon: Cpu },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white flex overflow-hidden font-sans">
      {/* 1. Left Sidebar Navigation */}
      <aside
        className={`bg-[#0e0e0e] border-r border-white/[0.08] flex flex-col z-30 transition-all duration-300 select-none ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-white/[0.08] px-4 flex items-center justify-between">
          <div
            onClick={onExitToLanding}
            className="flex items-center gap-3 cursor-pointer group"
            title="Return to Landing Page"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5722] via-[#FF8A35] to-[#f59e0b] p-0.5 flex items-center justify-center shadow-md shadow-[#FF5722]/20">
              <div className="w-full h-full bg-[#080808] rounded-[10px] flex items-center justify-center">
                <Network className="w-4 h-4 text-[#FF5722]" />
              </div>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-wider text-sm text-white group-hover:text-[#FF8A35] transition-colors">
                    SKEIN
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-[#FF5722]/15 text-[#FF8A35] rounded font-bold">
                    v3.0
                  </span>
                </div>
                <span className="text-[10px] text-[#71717A]">AML Network Forensics</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-[#71717A] hover:text-white p-1 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((g) => (
            <div key={g.group}>
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-bold tracking-widest text-[#71717A] px-3 mb-2 uppercase">
                  {g.group}
                </div>
              )}
              <div className="space-y-1">
                {g.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FF5722]/15 text-[#FF8A35] border border-[#FF5722]/30 shadow-sm'
                          : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                      }`}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#FF5722]' : 'text-[#71717A]'
                        }`}
                      />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/[0.08] space-y-2">
          {/* Quick Exit to Landing */}
          <button
            onClick={onExitToLanding}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#71717A] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Back to Landing Page"
          >
            <Home className="w-4 h-4 shrink-0 text-[#71717A]" />
            {!isSidebarCollapsed && <span>Back to Landing</span>}
          </button>

          {/* Persona Card */}
          {!isSidebarCollapsed && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FF5722]/20 border border-[#FF5722]/40 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-[#FF5722]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">Compliance Lead</div>
                <div className="text-[10px] text-[#71717A] truncate">Deloitte Advisory Persona</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Content Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Header */}
        <header className="h-16 border-b border-white/[0.08] bg-[#0c0c0c]/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-20">
          {/* Breadcrumb & Title */}
          <div>
            <div className="flex items-center gap-2 text-[11px] text-[#71717A]">
              <span>Skein Platform</span>
              <span>/</span>
              <span className="text-[#FF8A35] font-medium capitalize">{activeSection}</span>
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide capitalize mt-0.5">
              {activeSection === 'overview'
                ? 'Executive Investigation Dashboard'
                : activeSection === 'graph'
                ? 'Interactive Network Graph Explorer'
                : activeSection === 'cycles'
                ? 'Circular Layering Intelligence'
                : activeSection === 'communities'
                ? 'Louvain Community Clusters'
                : activeSection === 'alerts'
                ? 'Real-Time Forensic Alerts Feed'
                : activeSection === 'predictions'
                ? 'Inductive GraphSAGE Link Predictions'
                : activeSection === 'narratives'
                ? 'Grounded AI Case-File Notes'
                : activeSection === 'streaming'
                ? 'Ingestion Pipeline & Synthetic Generator'
                : 'System Architecture & Defensibility'}
            </h2>
          </div>

          {/* Global Quick Action Controls */}
          <div className="flex items-center gap-3">
            {/* Live Indicator Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141414] border border-white/[0.06] text-xs">
              <span className="relative flex h-2 w-2">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className="text-xs text-[#A1A1AA] font-mono">
                {isConnected ? 'WS Online' : 'WS Offline'}
              </span>
              <span className="h-2.5 w-px bg-white/[0.1]" />
              <span className="text-[11px] text-[#71717A] capitalize">
                {streamStatus.mode} stream
              </span>
            </div>

            {/* Stream Toggle Button */}
            <button
              onClick={toggleStream}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isStreaming
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-[#FF5722]/15 text-[#FF8A35] border border-[#FF5722]/40 hover:bg-[#FF5722]/25'
              }`}
            >
              {isStreaming ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Ingestion</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Stream</span>
                </>
              )}
            </button>

            {/* Run Batch Pass Button */}
            <button
              onClick={triggerManualBatch}
              disabled={batchEvaluating}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#171717] hover:bg-[#202020] text-white border border-white/[0.08] flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#FF5722] ${batchEvaluating ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">
                {batchEvaluating ? 'Running GDS...' : 'Run Batch Pass'}
              </span>
            </button>
          </div>
        </header>

        {/* Dynamic Section Content Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#080808] relative">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Centralized Entity Inspector Drawer */}
      <EntityPanel />

      {/* Centralized Cycle Alert Toast */}
      <CycleAlertToast />
    </div>
  );
}
