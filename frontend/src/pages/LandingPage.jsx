import React, { useState } from 'react';
import {
  Network,
  ShieldAlert,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Database,
  Radio,
  CheckCircle2,
  Lock,
  GitBranch,
  BarChart3,
  Search,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

export function LandingPage({ onLaunchApp }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#FF5722] selection:text-white relative overflow-hidden font-sans">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] ambient-radial-glow pointer-events-none -z-0 opacity-70" />

      {/* Floating Orange Spotlight */}
      <div className="absolute -top-40 right-10 w-96 h-96 bg-[#FF5722]/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[800px] -left-20 w-80 h-80 bg-[#FF8A35]/8 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* 1. Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#080808]/80 backdrop-blur-xl border-b border-white/[0.08] px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5722] via-[#FF8A35] to-[#f59e0b] p-0.5 shadow-lg shadow-[#FF5722]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#080808] rounded-[10px] flex items-center justify-center">
                <Network className="w-5 h-5 text-[#FF5722]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white">
                  SKEIN
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FF5722]/15 text-[#FF8A35] border border-[#FF5722]/30">
                  v3.0
                </span>
              </div>
              <span className="text-[11px] text-[#A1A1AA] hidden sm:block">
                Real-Time Financial Crime Network Detector
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-[#A1A1AA]">
            <a href="#features" className="hover:text-white transition-colors">
              Core Capabilities
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Lambda Architecture
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              Graph Engine
            </a>
            <a href="#defensibility" className="hover:text-white transition-colors">
              Forensic Methodology
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          {/* CTA Button */}
          <button
            onClick={onLaunchApp}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#FF5722] to-[#FF8A35] hover:from-[#ff6434] hover:to-[#ff974b] text-white shadow-lg shadow-[#FF5722]/25 flex items-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto text-center z-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171717] border border-white/[0.08] text-xs mb-8 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5722] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5722]"></span>
          </span>
          <span className="text-[#A1A1AA] font-medium text-[11px] uppercase tracking-wider">
            Real-Time AML Graph Intelligence • Lambda Speed Layer
          </span>
          <ChevronRight className="w-3 h-3 text-[#A1A1AA]" />
        </div>

        {/* Big Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
          Untangle Financial Crime Networks.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#FF8A35] to-[#f59e0b]">
            In Real Time.
          </span>
        </h1>

        {/* Supporting description */}
        <p className="mt-6 text-base sm:text-lg text-[#A1A1AA] max-w-3xl mx-auto leading-relaxed">
          Traditional AML transaction monitoring catches laundering hours after funds have already dispersed.
          <strong className="text-white font-medium"> Skein</strong> evaluates transactions as a continuous property graph in
          Neo4j—flagging circular layering loops in <span className="text-[#FF8A35] font-semibold">&lt;2ms</span>, scoring pass-through shell hubs with unsupervised Isolation Forests, and predicting emerging criminal ties via inductive GraphSAGE GNNs.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onLaunchApp}
            className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#FF5722] to-[#FF8A35] hover:from-[#ff6434] hover:to-[#ff974b] text-white shadow-xl shadow-[#FF5722]/30 flex items-center gap-2.5 transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            <span>Launch Forensic Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#architecture"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-[#171717] hover:bg-[#202020] text-[#A1A1AA] hover:text-white border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-[#FF5722]" />
            <span>Explore Lambda Architecture</span>
          </a>
        </div>

        {/* Key Metrics Strip */}
        <div className="mt-14 pt-8 border-t border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="bg-[#111111]/80 border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-extrabold font-mono text-[#FF5722]">&lt; 2ms</div>
            <div className="text-xs text-[#A1A1AA] mt-1 font-medium">Speed Layer Latency</div>
            <div className="text-[10px] text-[#71717A]">Bounded incremental cycle queries</div>
          </div>
          <div className="bg-[#111111]/80 border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-extrabold font-mono text-white">0.85+</div>
            <div className="text-xs text-[#A1A1AA] mt-1 font-medium">Unsupervised ROC-AUC</div>
            <div className="text-[10px] text-[#71717A]">Validated on ground truth rings</div>
          </div>
          <div className="bg-[#111111]/80 border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-extrabold font-mono text-[#FF8A35]">GraphSAGE</div>
            <div className="text-xs text-[#A1A1AA] mt-1 font-medium">Inductive Link GNN</div>
            <div className="text-[10px] text-[#71717A]">Predicts emerging laundering ties</div>
          </div>
          <div className="bg-[#111111]/80 border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-extrabold font-mono text-white">100%</div>
            <div className="text-xs text-[#A1A1AA] mt-1 font-medium">Grounded AI Notes</div>
            <div className="text-[10px] text-[#71717A]">Strictly zero-hallucination compliance</div>
          </div>
        </div>

        {/* 3. Product Showcase / Interactive Dashboard Preview */}
        <div id="preview" className="mt-16 relative mx-auto max-w-6xl">
          <div className="rounded-2xl p-1 bg-gradient-to-b from-white/10 via-[#FF5722]/20 to-transparent shadow-2xl">
            <div className="bg-[#0e0e0e] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl text-left">
              {/* Fake Chrome Bar */}
              <div className="bg-[#141414] px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <span className="ml-3 font-mono text-[11px] text-[#71717A]">
                    skein-forensic-studio // live-stream: active (Redis PEL: 0)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    WS LIVE
                  </span>
                </div>
              </div>

              {/* Showcase Body */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Mini Mockup Graph View */}
                <div className="lg:col-span-2 bg-[#111111] border border-white/[0.06] rounded-xl p-5 relative overflow-hidden min-h-[320px] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#FF5722]">
                        Topology Canvas Preview
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        Circular Layering Ring Detection
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-[#A1A1AA] bg-[#1a1a1a] px-2.5 py-1 rounded border border-white/[0.06]">
                      RING_01 // 5 Entities
                    </div>
                  </div>

                  {/* Visual Node Diagram */}
                  <div className="my-6 flex items-center justify-center relative">
                    <div className="relative w-72 h-44 border border-dashed border-[#FF5722]/30 rounded-full flex items-center justify-center animate-pulse-slow">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF5722] text-white px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-lg shadow-[#FF5722]/50">
                        ENT_00223 (Shell)
                      </div>
                      <div className="absolute top-1/2 -right-4 -translate-y-1/2 bg-rose-600 text-white px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                        ENT_00051
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                        ENT_00052
                      </div>
                      <div className="absolute top-1/2 -left-4 -translate-y-1/2 bg-orange-600 text-white px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                        ENT_00228
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-white">Closed Loop</div>
                        <div className="font-mono text-sm text-[#FF8A35] font-extrabold">
                          ₹8,000,712.82
                        </div>
                        <div className="text-[9px] text-[#A1A1AA]">Decaying 85-95% per hop</div>
                      </div>
                    </div>
                  </div>

                  {/* Speed Layer Alert Bar */}
                  <div className="bg-[#171717] border border-[#FF5722]/30 rounded-lg p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#FF5722]" />
                      <span className="text-slate-200">
                        Incremental Cycle closed by transaction <code className="text-[#FF8A35]">TXN_0000412</code>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#FF5722] font-bold">
                      FLAGGED IN 1.4ms
                    </span>
                  </div>
                </div>

                {/* Right Col: Forensic Case Note Preview */}
                <div className="space-y-4">
                  <div className="bg-[#111111] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between text-xs mb-2 text-[#A1A1AA]">
                      <span className="flex items-center gap-1.5 font-semibold text-white">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                        AI Compliance Note
                      </span>
                      <span className="text-[10px] text-[#FF8A35] font-mono">Grounded</span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] italic leading-relaxed bg-[#171717] p-3 rounded-lg border border-white/[0.04]">
                      "Entity Udant Dewan (ENT_00002) is classified as an individual operating at CRITICAL risk (99.1/100). Forensic graph analysis identified direct involvement in a closed circular layering transaction loop. Immediate compliance review and source-of-funds verification are recommended."
                    </p>
                  </div>

                  <div className="bg-[#111111] border border-white/[0.06] rounded-xl p-4">
                    <div className="text-xs text-[#A1A1AA] mb-2 font-semibold text-white">
                      Topological Risk Signals
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-[#A1A1AA]">PageRank Centrality</span>
                          <span className="text-[#FF5722] font-mono font-bold">96.0%</span>
                        </div>
                        <div className="w-full bg-[#1c1c1c] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#FF5722] h-full rounded-full" style={{ width: '96%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-[#A1A1AA]">Structuring (Smurfing)</span>
                          <span className="text-[#FF8A35] font-mono font-bold">99.3%</span>
                        </div>
                        <div className="w-full bg-[#1c1c1c] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#FF8A35] h-full rounded-full" style={{ width: '99%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Showcase (Bento Grid) */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/[0.08] relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-[#FF5722] mb-2">
            Forensic Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Designed for Deloitte & Big 4 Financial Crime Forensics
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A1AA]">
            Every architectural decision solves a known shortcoming of legacy transaction monitoring systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Sub-5ms Speed Layer */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FF5722]/15 border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722] mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Sub-5ms Speed Layer</h3>
              <p className="mt-2 text-xs text-[#A1A1AA] leading-relaxed">
                Evaluates each arriving transaction incrementally. A bounded path query checks whether the new edge closes an elementary circuit up to length 6, flagging layering loops instantly before the capital moves on.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-[#FF8A35] flex items-center gap-1.5">
              <span>Cypher: MATCH (v)-[:TXN*1..5]-&gt;(u)</span>
            </div>
          </div>

          {/* Card 2: Neo4j Graph Data Science */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FF8A35]/15 border border-[#FF8A35]/30 flex items-center justify-center text-[#FF8A35] mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Neo4j Graph Data Science (GDS)</h3>
              <p className="mt-2 text-xs text-[#A1A1AA] leading-relaxed">
                Native database-level execution of Louvain Community Detection (identifying isolated shell clusters) and PageRank + Betweenness Centrality (uncovering bridge mules and capital sinks) without moving data out of the graph.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-[#A1A1AA] flex items-center gap-1.5">
              <span>Native Louvain, PageRank, Betweenness</span>
            </div>
          </div>

          {/* Card 3: Inductive GraphSAGE GNN */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Predictive GraphSAGE GNN</h3>
              <p className="mt-2 text-xs text-[#A1A1AA] leading-relaxed">
                2-layer inductive GraphSAGE neural network trained with a strict temporal train/test split (preventing future structure leakage). Predicts emerging future transaction links near flagged high-risk entities.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-purple-400 flex items-center gap-1.5">
              <span>Inductive edge decoder • 0.80+ ROC-AUC</span>
            </div>
          </div>

          {/* Card 4: Unsupervised Isolation Forest */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Unsupervised Anomaly Scoring</h3>
              <p className="mt-2 text-xs text-[#A1A1AA] leading-relaxed">
                Synthesizes 7 topological and behavioral features into a composite anomaly ranking via 200 isolation trees. Ground truth labels are used only post-hoc to measure real 0.85+ ROC-AUC, avoiding label-bias overfitting.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span>Percentile conversions (0–100)</span>
            </div>
          </div>

          {/* Card 5: Grounded AI Case-File Narrator */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FF5722]/15 border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722] mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Grounded AI Case Narrator</h3>
              <p className="mt-2 text-xs text-[#A1A1AA] leading-relaxed">
                Transforms mathematical graph metrics into 3-4 sentence forensic notes readable by compliance officers in &lt;15 seconds. Built with hard prompt grounding to structurally prevent LLM hallucinations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-[#FF8A35] flex items-center gap-1.5">
              <span>Groq LLaMA-3.3 / Mistral / Rule-based</span>
            </div>
          </div>

          {/* Card 6: Redis Streams Pipeline */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Redis Streams Ingestion</h3>
              <p className="mt-2 text-xs text-[#A1A1AA] leading-relaxed">
                Append-only log architecture using Redis consumer groups. Provides at-least-once processing guarantees (`XACK`) and pending-entry-list replay, ensuring zero transaction loss during consumer restarts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
              <span>XADD / XREADGROUP / XACK semantics</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Lambda Architecture Deep Dive */}
      <section id="architecture" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/[0.08] relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-[#FF5722] mb-2">
            System Design
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Three Computational Cadences
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A1AA]">
            Why splitting speed, batch, and model retraining is the only computationally sound architecture for real-time graphs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111111] border-t-2 border-t-[#FF5722] border-x border-b border-white/[0.08] rounded-2xl p-6">
            <div className="text-xs font-mono font-bold text-[#FF5722] uppercase tracking-wider mb-1">
              Cadence 1 • Every Event
            </div>
            <h3 className="text-lg font-bold text-white">Speed Layer</h3>
            <p className="mt-3 text-xs text-[#A1A1AA] leading-relaxed">
              Runs on every individual transaction. Executes schema validation, MERGE upsert into Neo4j, and bounded path checking for newly closed cycles.
            </p>
            <div className="mt-6 bg-[#171717] p-3 rounded-xl border border-white/[0.04] text-xs font-mono text-white">
              <span className="text-[#A1A1AA]">Latency:</span> &lt; 2 milliseconds
              <br />
              <span className="text-[#A1A1AA]">Scope:</span> Closed cycle detection
            </div>
          </div>

          <div className="bg-[#111111] border-t-2 border-t-[#FF8A35] border-x border-b border-white/[0.08] rounded-2xl p-6">
            <div className="text-xs font-mono font-bold text-[#FF8A35] uppercase tracking-wider mb-1">
              Cadence 2 • Every 50 Txns / 30s
            </div>
            <h3 className="text-lg font-bold text-white">Batch Layer</h3>
            <p className="mt-3 text-xs text-[#A1A1AA] leading-relaxed">
              Global graph operations that cannot be computed incrementally: Louvain community partitioning, Betweenness shortest paths, PageRank, and Isolation Forest refitting.
            </p>
            <div className="mt-6 bg-[#171717] p-3 rounded-xl border border-white/[0.04] text-xs font-mono text-white">
              <span className="text-[#A1A1AA]">Throughput:</span> ~150ms for 2,000 txns
              <br />
              <span className="text-[#A1A1AA]">Scope:</span> Global risk percentile scoring
            </div>
          </div>

          <div className="bg-[#111111] border-t-2 border-t-purple-500 border-x border-b border-white/[0.08] rounded-2xl p-6">
            <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">
              Cadence 3 • Coarser Cadence
            </div>
            <h3 className="text-lg font-bold text-white">Model Layer</h3>
            <p className="mt-3 text-xs text-[#A1A1AA] leading-relaxed">
              Inductive GraphSAGE GNN retraining and link probability scoring across the 2-hop neighborhood of high-risk entities. Decoupled from the speed layer to avoid blocking.
            </p>
            <div className="mt-6 bg-[#171717] p-3 rounded-xl border border-white/[0.04] text-xs font-mono text-white">
              <span className="text-[#A1A1AA]">Execution:</span> Background asynchronous
              <br />
              <span className="text-[#A1A1AA]">Scope:</span> Inductive edge forecasting
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ & Interview Defensibility */}
      <section id="faq" className="py-24 px-6 max-w-5xl mx-auto border-t border-white/[0.08] relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-[#FF5722] mb-2">
            Deloitte & Big 4 Defensibility
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Technical Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Why split into a Speed Layer and a Batch Layer instead of doing everything live?',
              a: 'True incremental versions of Louvain community detection and betweenness centrality are unsolved research problems; mathematically recomputing them requires the global graph topology. However, checking whether a newly added edge closes a circular cycle is computationally cheap—it is just a single bounded path query from destination back to source. The Lambda architecture split is not a compromise; it matches each algorithm to its natural computational complexity.',
            },
            {
              q: 'Why Neo4j with GDS instead of just staying with NetworkX in Python?',
              a: 'NetworkX is purely in-memory and single-process. Every analysis run requires reloading the entire graph from disk, and nothing persists across service restarts. Neo4j is an enterprise property graph database where algorithms run natively where the data lives. GDS runs optimized C++/Java graph projections with sub-second execution.',
            },
            {
              q: 'Why Redis Streams instead of Apache Kafka?',
              a: 'Kafka is standard at massive multi-broker production scale, but requires heavier infrastructure (ZooKeeper/KRaft, multi-broker nodes). Redis Streams provides the identical fundamental primitives needed here—an append-only log, consumer groups, pending entry lists (PEL), and at-least-once delivery through XACK—in a lightweight, zero-maintenance process.',
            },
            {
              q: 'How did you prevent data leakage during GNN link prediction evaluation?',
              a: 'A random split of edges is invalid for transaction networks because it allows the model to implicitly peek at future graph topologies during training. Skein enforces a strict temporal split: transactions are ordered chronologically, the model is trained strictly up to cutoff time T (first 80%), and evaluated only on predicting transactions that occur strictly after T.',
            },
            {
              q: 'How does the AI Narrator avoid hallucinations in compliance reporting?',
              a: 'The narrator uses structured-data-to-text generation with hard factual grounding. It is never asked an open-ended question; it is only provided with pre-computed numbers (risk score, percentiles, cycle involvement, shell company cluster density) and asked to phrase them into a concise compliance note. If a metric is absent, it cannot invent it.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl overflow-hidden cursor-pointer"
              onClick={() => toggleFaq(idx)}
            >
              <div className="p-4 sm:p-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#FF5722] transition-transform ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 text-xs text-[#A1A1AA] leading-relaxed border-t border-white/[0.04] pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Bottom Call To Action */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center border-t border-white/[0.08] relative z-10">
        <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#FF5722]/30 rounded-3xl p-10 sm:p-14 relative overflow-hidden orange-glow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5722]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Untangle the Network?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A1AA] max-w-2xl mx-auto">
            Experience real-time transaction streaming, instantaneous circular layering detection, and grounded forensic intelligence live in your browser.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={onLaunchApp}
              className="px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-[#FF5722] to-[#FF8A35] hover:from-[#ff6434] hover:to-[#ff974b] text-white shadow-xl shadow-[#FF5722]/30 flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer"
            >
              <span>Launch Skein Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-white/[0.08] bg-[#060606] py-10 px-6 text-xs text-[#71717A] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#FF5722]/20 border border-[#FF5722]/40 flex items-center justify-center">
              <Network className="w-3.5 h-3.5 text-[#FF5722]" />
            </div>
            <span className="font-bold text-white text-sm">SKEIN</span>
            <span>•</span>
            <span>Author: Navya Rangwani</span>
            <span>•</span>
            <span className="text-[#A1A1AA]">Deloitte Forensic Advisory Placement Target</span>
          </div>

          <div className="flex items-center gap-4 text-[#A1A1AA]">
            <span>PMLA 2002</span>
            <span>•</span>
            <span>FATF AML/CFT</span>
            <span>•</span>
            <span>Neo4j GDS</span>
            <span>•</span>
            <span>PyG GraphSAGE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
