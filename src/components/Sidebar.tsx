import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, MessageSquareText, Bot, KeyRound, 
  Github, Wallet, LogOut, Shield, Database, Sparkles, RefreshCcw
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, resetAllData } = useApp();

  const menuItems = [
    { id: 'overview', label: 'Monitor & Insights', icon: LayoutDashboard },
    { id: 'instant', label: 'Instant Chat (RAG)', icon: MessageSquareText },
    { id: 'hosted', label: 'Automated Chatbots', icon: Bot },
    { id: 'developer', label: 'Plug & Play APIs', icon: KeyRound },
    { id: 'github', label: 'GitHub Docs Ingest', icon: Github },
    { id: 'billing', label: 'Telebirr Paywall', icon: Wallet },
  ];

  return (
    <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen text-slate-300">
      {/* Top Brand Block */}
      <div className="p-6">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-md font-bold text-white tracking-wide">RAG SUPPORT</h1>
            <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Monolith Console</p>
          </div>
        </div>

        {/* User Badge Profile Card */}
        {currentUser && (
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl mb-6 flex items-center gap-3">
            <div className="relative">
              <img 
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                alt="usr" 
                className="w-10 h-10 rounded-full border border-slate-700/80 object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xs font-semibold text-white truncate">{currentUser.name}</h2>
              <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{currentUser.email}</p>
              <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/25 text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-300">
                <Sparkles className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                {currentUser.plan} Plan
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Navigation Menu links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border-l-[3px] border-indigo-500 pl-3.5 bg-gradient-to-r from-indigo-500/5 to-transparent' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer operations (Reset workspace & Logout) */}
      <div className="p-6 border-t border-slate-900 space-y-3">
        <button
          onClick={resetAllData}
          className="w-full py-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 rounded-xl text-[10px] font-mono hover:text-white flex items-center justify-center gap-1.5 text-slate-500 transition-colors cursor-pointer"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Reset Developer Seeds
        </button>

        {currentUser && (
          <button
            onClick={logout}
            className="w-full py-1.5 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 text-slate-500 hover:border-dashed rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};
