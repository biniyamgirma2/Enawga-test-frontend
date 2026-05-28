import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { InstantRAG } from './components/InstantRAG';
import { HostedBots } from './components/HostedBots';
import { DeveloperConsole } from './components/DeveloperConsole';
import { GitHubIngestion } from './components/GitHubIngestion';
import { BillingTelebirr } from './components/BillingTelebirr';

function MainAppContent() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Scoped project selection cross-tab navigator
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  if (!currentUser) {
    return <Auth />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Reset selection in tab hop to force clean selector views if changing core category, except when managing a specific resource from table
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Workspace Frame panel scrollable */}
      <main className="flex-1 overflow-y-auto h-screen bg-slate-900/60 p-8 lg:p-10 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'overview' && (
            <DashboardOverview 
              onNavigateTab={handleTabChange} 
              onSetSelectedProjectId={setSelectedProjectId} 
            />
          )}
          {activeTab === 'instant' && (
            <InstantRAG 
              selectedProjectId={selectedProjectId} 
              onSetSelectedProjectId={setSelectedProjectId} 
            />
          )}
          {activeTab === 'hosted' && (
            <HostedBots 
              onNavigateTab={handleTabChange}
              selectedProjectId={selectedProjectId}
              onSetSelectedProjectId={setSelectedProjectId}
            />
          )}
          {activeTab === 'developer' && (
            <DeveloperConsole 
              onNavigateTab={handleTabChange}
              selectedProjectId={selectedProjectId}
              onSetSelectedProjectId={setSelectedProjectId}
            />
          )}
          {activeTab === 'github' && (
            <GitHubIngestion 
              onNavigateTab={handleTabChange}
              selectedProjectId={selectedProjectId}
              onSetSelectedProjectId={setSelectedProjectId}
            />
          )}
          {activeTab === 'billing' && <BillingTelebirr />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
