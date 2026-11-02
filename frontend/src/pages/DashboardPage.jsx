import React from 'react';
import { TopStatsBar } from '../components/TopStatsBar';
import { FilterBar } from '../components/FilterBar';
import { GraphView } from '../components/GraphView';
import { EntityPanel } from '../components/EntityPanel';
import { CycleAlertToast } from '../components/CycleAlertToast';

export function DashboardPage() {
  return (
    <div className="relative">
      <TopStatsBar />
      <FilterBar />
      <GraphView />
      <EntityPanel />
      <CycleAlertToast />
    </div>
  );
}
