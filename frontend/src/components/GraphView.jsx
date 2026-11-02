import React, { useRef, useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useAnalysis } from '../context/AnalysisContext';

export function GraphView() {
  const fgRef = useRef();
  const { graphData, filters, selectEntity, selectedEntityId } = useAnalysis();

  // Filter nodes & links based on current filter state
  const filteredData = useMemo(() => {
    const rawNodes = graphData.nodes || [];
    const rawLinks = graphData.links || [];
    const rawPredicted = graphData.predicted_links || [];

    // Filter nodes
    const validNodeMap = new Map();
    rawNodes.forEach((node) => {
      const matchesSearch =
        !filters.search ||
        node.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        node.name.toLowerCase().includes(filters.search.toLowerCase());

      const matchesTier =
        filters.tier === 'ALL' ||
        node.risk_tier.toLowerCase() === filters.tier.toLowerCase();

      const matchesRisk = node.risk_score >= filters.minRisk;
      const matchesCycle = !filters.cycleOnly || node.in_cycle;

      if (matchesSearch && matchesTier && matchesRisk && matchesCycle) {
        validNodeMap.set(node.id, node);
      }
    });

    // Filter real links
    const filteredLinks = rawLinks
      .filter((l) => {
        const srcId = typeof l.source === 'object' ? l.source.id : l.source;
        const dstId = typeof l.target === 'object' ? l.target.id : l.target;
        return validNodeMap.has(srcId) && validNodeMap.has(dstId);
      })
      .map((l) => ({
        ...l,
        is_predicted: false,
      }));

    // Add predicted links (dashed lines)
    const predictedLinks = rawPredicted
      .filter((p) => validNodeMap.has(p.source) && validNodeMap.has(p.target))
      .map((p) => ({
        source: p.source,
        target: p.target,
        is_predicted: true,
        probability: p.probability,
      }));

    return {
      nodes: Array.from(validNodeMap.values()),
      links: [...filteredLinks, ...predictedLinks],
    };
  }, [graphData, filters]);

  // Node color helper
  const getNodeColor = useCallback((node) => {
    switch (node.risk_tier) {
      case 'critical':
        return '#ef4444'; // Red
      case 'high':
        return '#f97316'; // Orange
      case 'medium':
        return '#eab308'; // Amber
      default:
        return '#10b981'; // Green
    }
  }, []);

  // Custom node drawing on canvas
  const drawNode = useCallback(
    (node, ctx, globalScale) => {
      const isSelected = node.id === selectedEntityId;
      const isCycle = node.in_cycle;
      const baseColor = getNodeColor(node);
      const radius = isSelected ? 7 : isCycle ? 6 : node.type === 'shell_company' ? 5.5 : 4;

      // Outer glowing ring for cycle members (Layering Loop)
      if (isCycle) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 3.5, 0, 2 * Math.PI, false);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Outer selection ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI, false);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      // Main node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = baseColor;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = isCycle ? 12 : isSelected ? 10 : 3;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Label on hover or if high scale
      if (globalScale > 2.0 || isSelected || isCycle) {
        const label = node.name || node.id;
        const fontSize = Math.max(10 / globalScale, 2.5);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(label, node.x, node.y + radius + fontSize + 1);
      }
    },
    [selectedEntityId, getNodeColor]
  );

  return (
    <div className="relative w-full h-[650px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <ForceGraph2D
        ref={fgRef}
        graphData={filteredData}
        nodeId="id"
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={(node) => selectEntity(node.id)}
        linkDirectionalArrowLength={(link) => (link.is_predicted ? 0 : 3.5)}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.12}
        linkColor={(link) => (link.is_predicted ? '#d946ef' : '#334155')}
        linkWidth={(link) => (link.is_predicted ? 1.6 : 0.8)}
        linkLineDash={(link) => (link.is_predicted ? [4, 3] : null)}
        linkHoverPrecision={6}
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={(link, ctx, globalScale) => {
          if (link.is_predicted && globalScale > 1.4) {
            // Label predicted link
            const src = link.source;
            const dst = link.target;
            if (typeof src.x === 'number' && typeof dst.x === 'number') {
              const midX = (src.x + dst.x) / 2;
              const midY = (src.y + dst.y) / 2;
              const text = `Predicted (${link.probability}%)`;
              ctx.font = `${8 / globalScale}px sans-serif`;
              ctx.fillStyle = '#f0abfc';
              ctx.textAlign = 'center';
              ctx.fillText(text, midX, midY - 2);
            }
          }
        }}
        cooldownTicks={120}
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.3}
      />

      {/* Legend Overlay */}
      <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-[11px] space-y-2 pointer-events-none">
        <div className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] mb-1">
          Topology Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-300">Critical Risk (99th+)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-slate-300">High Risk (95th–98th)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-300">Medium Risk (85th–94th)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-300">Low Risk (&lt;85th)</span>
        </div>
        <div className="pt-1.5 border-t border-slate-800 flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-rose-500" />
          <span className="text-rose-400 font-medium">Layering Cycle Member</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0 border-t-2 border-dashed border-fuchsia-500" />
          <span className="text-fuchsia-400 font-medium">GNN Predicted Link</span>
        </div>
      </div>
    </div>
  );
}
