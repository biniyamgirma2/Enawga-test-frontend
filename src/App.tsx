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
import { AdminDesk } from './components/AdminDesk';
import { Menu, Shield } from 'lucide-react';

function MainAppContent() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Scoped project selection cross-tab navigator
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  if (!currentUser) {
    return <Auth />;
  }

  // Admin validation checks
  const isAdmin = currentUser.email.toLowerCase() === 'admin@enawga.com';

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false); // Close responsive drawer on link tap!
  };

  // Securely fallback if non-admin attempts to view administrative desk module
  if (activeTab === 'admin' && !isAdmin) {
    setActiveTab('overview');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans antialiased flex-col md:flex-row">
      
      {/* Mobile Top App Bar Navigation Header */}
      <header className="md:hidden bg-slate-950 border-b border-slate-850 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 active:translate-y-[1px] transition-transform cursor-pointer"
            title="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-1.5 ml-1">
            <Shield className={`w-5 h-5 ${isAdmin ? 'text-rose-400' : 'text-indigo-400'}`} />
            <span className="text-xs font-bold text-white tracking-widest uppercase font-mono">
              {isAdmin ? 'ADMIN CONTROL' : 'RAG SUPPORT'}
            </span>
          </div>
        </div>

        {/* Small Avatar icon */}
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-mono uppercase tracking-wider border px-2 py-0.5 rounded font-bold ${
            isAdmin ? 'bg-rose-500/15 border-rose-500/25 text-rose-300' : 'bg-indigo-500/15 border border-indigo-500/25 text-[10px] text-indigo-300'
          }`}>
            {isAdmin ? 'ADMIN' : currentUser.plan}
          </span>
          <img 
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
            alt="avatar" 
            className={`w-7 h-7 rounded-full object-cover border ${isAdmin ? 'border-rose-500/40' : 'border-slate-800'}`}
          />
        </div>
      </header>

      {/* Slide-out Overlay drawer panel for mobile screen dimensions */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Frame panel scrollable */}
      <main className="flex-1 overflow-y-auto h-screen bg-slate-900/60 p-4 sm:p-6 md:p-8 lg:p-10 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'overview' && (
            <DashboardOverview 
              onNavigateTab={handleTabChange} 
              onSetSelectedProjectId={setSelectedProjectId} 
            />
          )}
          {activeTab === 'admin' && isAdmin && (
            <AdminDesk />
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
