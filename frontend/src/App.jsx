import React, { useState, useEffect } from 'react';
import { AnalysisProvider } from './context/AnalysisContext';
import { LandingPage } from './pages/LandingPage';
import { AppShell } from './components/AppShell';

// Dedicated Application Pages
import { OverviewPage } from './pages/OverviewPage';
import { GraphExplorerPage } from './pages/GraphExplorerPage';
import { CyclesPage } from './pages/CyclesPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { AlertsPage } from './pages/AlertsPage';
import { GNNPredictionsPage } from './pages/GNNPredictionsPage';
import { CaseNotesPage } from './pages/CaseNotesPage';
import { StreamingPage } from './pages/StreamingPage';
import { SystemHealthPage } from './pages/SystemHealthPage';

export function App() {
  const [isLandingPage, setIsLandingPage] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.location.hash.includes('app');
    }
    return true;
  });
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.includes('app')) {
        setIsLandingPage(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLaunchApp = (targetSection = 'overview') => {
    if (typeof targetSection === 'string') {
      setActiveSection(targetSection);
    }
    setIsLandingPage(false);
    if (typeof window !== 'undefined') {
      window.location.hash = 'app';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExitToLanding = () => {
    setIsLandingPage(true);
    if (typeof window !== 'undefined') {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnalysisProvider>
      {isLandingPage ? (
        <LandingPage onLaunchApp={(sec) => handleLaunchApp(sec || 'overview')} />
      ) : (
        <AppShell
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          onExitToLanding={handleExitToLanding}
        >
          {activeSection === 'overview' && (
            <OverviewPage onNavigate={(section) => setActiveSection(section)} />
          )}

          {activeSection === 'graph' && (
            <GraphExplorerPage />
          )}

          {activeSection === 'cycles' && (
            <CyclesPage onNavigateToEntity={() => setActiveSection('graph')} />
          )}

          {activeSection === 'communities' && (
            <CommunitiesPage onNavigateToEntity={() => setActiveSection('graph')} />
          )}

          {activeSection === 'alerts' && (
            <AlertsPage onNavigateToEntity={() => setActiveSection('graph')} />
          )}

          {activeSection === 'predictions' && (
            <GNNPredictionsPage onNavigateToEntity={() => setActiveSection('graph')} />
          )}

          {activeSection === 'narratives' && (
            <CaseNotesPage onNavigateToEntity={() => setActiveSection('graph')} />
          )}

          {activeSection === 'streaming' && (
            <StreamingPage />
          )}

          {activeSection === 'system' && (
            <SystemHealthPage />
          )}
        </AppShell>
      )}
    </AnalysisProvider>
  );
}

export default App;
