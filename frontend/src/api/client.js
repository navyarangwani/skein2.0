const API_BASE = '/api';

export async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }
  return response.json();
}

export const api = {
  getHealth: () => fetchJson('/health'),
  getGraph: () => fetchJson('/graph'),
  getGraphStats: () => fetchJson('/graph/stats'),
  getEntity: (id) => fetchJson(`/entities/${encodeURIComponent(id)}`),
  triggerNarrative: (id) => fetchJson(`/entities/${encodeURIComponent(id)}/narrative`, { method: 'POST' }),
  getCommunities: () => fetchJson('/communities'),
  getCycles: () => fetchJson('/cycles'),
  getAlerts: () => fetchJson('/alerts'),
  getStreamStatus: () => fetchJson('/stream/status'),
  startStream: (ratePerSecond = 5.0, datasetPath = null) =>
    fetchJson('/stream/start', {
      method: 'POST',
      body: JSON.stringify({ rate_per_second: ratePerSecond, dataset_path: datasetPath }),
    }),
  stopStream: () => fetchJson('/stream/stop', { method: 'POST' }),
  triggerBatch: () => fetchJson('/batch/run', { method: 'POST' }),
  generateDataset: (params = {}) =>
    fetchJson('/dataset/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  getDatasetStatus: () => fetchJson('/dataset/status'),
};
