import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client';
import { useWebSocket } from '../hooks/useWebSocket';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  // Graph Data
  const [graphData, setGraphData] = useState({ nodes: [], links: [], predicted_links: [] });
  const [stats, setStats] = useState({
    total_entities: 0,
    total_transactions: 0,
    critical_count: 0,
    high_count: 0,
    medium_count: 0,
    low_count: 0,
    cycles_detected: 0,
    predicted_links_count: 0,
  });

  // Auxiliary data
  const [cycles, setCycles] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [streamStatus, setStreamStatus] = useState({
    is_running: false,
    rate_per_second: 5.0,
    transactions_processed: 0,
    queue_lag: 0,
    mode: 'memory',
    connected_clients: 1,
  });

  // Selected Entity details
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedEntityDetail, setSelectedEntityDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    minRisk: 0,
    tier: 'ALL', // 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    cycleOnly: false,
    communityId: 'ALL',
    search: '',
  });

  // Animated Cycle Alerts (Toasts)
  const [toasts, setToasts] = useState([]);
  const [batchEvaluating, setBatchEvaluating] = useState(false);

  // Load Graph Snapshot
  const fetchGraph = useCallback(async () => {
    try {
      const data = await api.getGraph();
      setGraphData({
        nodes: data.nodes || [],
        links: data.links || [],
        predicted_links: data.predicted_links || [],
      });
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error('Failed to load graph snapshot:', err);
    }
  }, []);

  // Load stream status
  const fetchStreamStatus = useCallback(async () => {
    try {
      const status = await api.getStreamStatus();
      setStreamStatus(status);
    } catch (err) {
      console.error('Failed to load stream status:', err);
    }
  }, []);

  // Load cycles
  const fetchCycles = useCallback(async () => {
    try {
      const data = await api.getCycles();
      setCycles(data);
    } catch (err) {
      console.error('Failed to load cycles:', err);
    }
  }, []);

  // Load communities
  const fetchCommunities = useCallback(async () => {
    try {
      const data = await api.getCommunities();
      setCommunities(data);
    } catch (err) {
      console.error('Failed to load communities:', err);
    }
  }, []);

  // Load alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  }, []);

  // Load entity detail
  const selectEntity = useCallback(async (id) => {
    if (!id) {
      setSelectedEntityId(null);
      setSelectedEntityDetail(null);
      return;
    }
    setSelectedEntityId(id);
    setIsDetailLoading(true);
    try {
      const detail = await api.getEntity(id);
      setSelectedEntityDetail(detail);
    } catch (err) {
      console.error('Failed to load entity detail:', err);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  // Handle incoming live WebSocket events
  const handleWebSocketEvent = useCallback((event) => {
    if (!event || !event.type) return;

    if (event.type === 'new_transaction') {
      setGraphData((prev) => {
        // Incremental edge append
        const newLink = {
          source: event.source,
          target: event.target,
          amount: event.amount,
          currency: 'INR',
          timestamp: event.timestamp,
          transaction_id: event.transaction_id || `TX_${Date.now()}`,
          is_predicted: false,
        };
        return {
          ...prev,
          links: [...prev.links, newLink],
        };
      });
      setStats((prev) => ({
        ...prev,
        total_transactions: prev.total_transactions + 1,
      }));
      setStreamStatus((prev) => ({
        ...prev,
        transactions_processed: prev.transactions_processed + 1,
      }));
    } else if (event.type === 'cycle_detected') {
      // SPEED LAYER HIT!
      const newToastId = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast = {
        id: newToastId,
        cycle_id: event.cycle_id,
        entities: event.entities,
        volume: event.total_volume,
        length: event.length,
        timestamp: new Date().toLocaleTimeString(),
      };
      // Keep at most 2 toasts active simultaneously to prevent screen overcrowding
      setToasts((prev) => [newToast, ...prev.slice(0, 1)]);

      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToastId));
      }, 6000);

      // Mark cycle members in nodes
      const cycleSet = new Set(event.entities);
      setGraphData((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          cycleSet.has(n.id) ? { ...n, in_cycle: true, cycle_count: (n.cycle_count || 0) + 1 } : n
        ),
      }));

      // Add to cycles list
      setCycles((prev) => [
        {
          cycle_id: event.cycle_id,
          entities: event.entities,
          length: event.length,
          total_volume: event.total_volume,
          source: 'speed_layer',
          detected_at: event.detected_at || new Date().toISOString(),
        },
        ...prev,
      ]);

      setStats((prev) => ({
        ...prev,
        cycles_detected: prev.cycles_detected + 1,
      }));
    } else if (event.type === 'risk_update') {
      // Update nodes with newly computed risk scores
      const scoreMap = new Map();
      (event.entities || []).forEach((e) => scoreMap.set(e.entity_id, e));

      setGraphData((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => {
          if (scoreMap.has(n.id)) {
            const updated = scoreMap.get(n.id);
            return {
              ...n,
              risk_score: updated.composite_risk_score,
              risk_tier: updated.risk_tier,
              pagerank_percentile: updated.pagerank_percentile,
              betweenness_percentile: updated.betweenness_percentile,
              community_shell_density_percentile: updated.community_shell_density_percentile,
              amount_anomaly_percentile: updated.amount_anomaly_percentile,
            };
          }
          return n;
        }),
      }));
    } else if (event.type === 'batch_complete') {
      if (event.stats) setStats(event.stats);
      fetchCommunities();
      fetchCycles();
      fetchAlerts();
    } else if (event.type === 'model_complete') {
      if (event.predicted_links) {
        setGraphData((prev) => ({
          ...prev,
          predicted_links: event.predicted_links,
        }));
        setStats((prev) => ({
          ...prev,
          predicted_links_count: event.predicted_links.length,
        }));
      }
    }
  }, [fetchCommunities, fetchCycles, fetchAlerts]);

  // Connect WebSocket
  const { isConnected, lastMessageTime } = useWebSocket(handleWebSocketEvent);

  // Trigger manual batch run
  const triggerManualBatch = async () => {
    setBatchEvaluating(true);
    try {
      await api.triggerBatch();
      await fetchGraph();
      await fetchCycles();
      await fetchCommunities();
      await fetchAlerts();
    } catch (err) {
      console.error('Batch run error:', err);
    } finally {
      setBatchEvaluating(false);
    }
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Initial load
  useEffect(() => {
    fetchGraph();
    fetchStreamStatus();
    fetchCycles();
    fetchCommunities();
    fetchAlerts();

    const interval = setInterval(() => {
      fetchStreamStatus();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchGraph, fetchStreamStatus, fetchCycles, fetchCommunities, fetchAlerts]);

  return (
    <AnalysisContext.Provider
      value={{
        graphData,
        stats,
        cycles,
        communities,
        alerts,
        streamStatus,
        selectedEntityId,
        selectedEntityDetail,
        isDetailLoading,
        filters,
        setFilters,
        toasts,
        dismissToast,
        clearAllToasts,
        batchEvaluating,
        triggerManualBatch,
        selectEntity,
        fetchGraph,
        fetchStreamStatus,
        fetchAlerts,
        isConnected,
        lastMessageTime,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error('useAnalysis must be used within an AnalysisProvider');
  return context;
}
