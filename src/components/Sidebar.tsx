import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, MessageSquareText, Bot, KeyRound, 
  Github, Wallet, LogOut, Shield, Database, Sparkles, RefreshCcw, X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  isOpenOnMobile = false,
  onCloseMobile
}) => {
  const { currentUser, logout, resetAllData } = useApp();

  const isAdmin = currentUser?.email.toLowerCase() === 'admin@enawga.com';

  const menuItems = [
    { id: 'overview', label: 'Monitor & Insights', icon: LayoutDashboard },
    { id: 'instant', label: 'Instant Chat (RAG)', icon: MessageSquareText },
    { id: 'hosted', label: 'Automated Chatbots', icon: Bot },
    { id: 'developer', label: 'Plug & Play APIs', icon: KeyRound },
    { id: 'github', label: 'GitHub Docs Ingest', icon: Github },
    { id: 'billing', label: 'Telebirr Paywall', icon: Wallet },
  ];

  // Push administrative portal to the beginning if authenticated as super admin
  if (isAdmin) {
    menuItems.unshift({ id: 'admin', label: 'Admin Control Desk', icon: Shield });
  }

  const handleLinkClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      <div 
        className={`
          w-80 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen text-slate-300
          fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
          ${isOpenOnMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top Brand Block */}
        <div className="p-6 relative">
          
          {/* Close button inside mobile menu drawer view */}
          <button 
            onClick={onCloseMobile}
            className="md:hidden absolute top-5 right-5 p-1 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-8">
            <div className={`p-1.5 rounded-lg border ${isAdmin ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-md font-bold text-white tracking-wide">
                {isAdmin ? 'ADMIN CONSOLE' : 'RAG SUPPORT'}
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                {isAdmin ? 'Sovereign Control' : 'Monolith Console'}
              </p>
            </div>
          </div>

          {/* User Badge Profile Card */}
          {currentUser && (
            <div className={`p-4 border rounded-xl mb-6 flex items-center gap-3 ${isAdmin ? 'bg-rose-500/5 border-rose-500/15' : 'bg-slate-900/60 border-slate-800/80'}`}>
              <div className="relative flex-shrink-0">
                <img 
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                  alt="usr" 
                  className={`w-10 h-10 rounded-full object-cover border ${isAdmin ? 'border-rose-500/50' : 'border-slate-700/80'}`}
                  referrerPolicy="no-referrer"
                />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${isAdmin ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              </div>
              <div className="overflow-hidden">
                <h2 className="text-xs font-semibold text-white truncate">{currentUser.name}</h2>
                <p className="text-[10px] text-slate-400 truncate max-w-[140px] font-mono">{currentUser.email}</p>
                
                <div className={`mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                  isAdmin 
                    ? 'bg-rose-500/15 border border-rose-500/25 text-rose-300' 
                    : 'bg-indigo-500/15 border border-indigo-500/25 text-indigo-300'
                }`}>
                  <Sparkles className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  {isAdmin ? 'Root Super' : `${currentUser.plan} Plan`}
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Navigation Menu links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              let activeClass = 'bg-indigo-600/10 text-indigo-400 border-l-[3px] border-indigo-500 pl-3.5 bg-gradient-to-r from-indigo-500/5 to-transparent';
              let hoverClass = 'text-slate-400 hover:text-white hover:bg-slate-900/40';
              let iconColor = isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300';

              if (item.id === 'admin') {
                activeClass = 'bg-rose-600/10 text-rose-400 border-l-[3px] border-rose-500 pl-3.5 bg-gradient-to-r from-rose-500/5 to-transparent';
                iconColor = isActive ? 'text-rose-400' : 'text-slate-500';
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                    isActive ? activeClass : hoverClass
                  }`}
                >
                  <Icon className={`w-4 h-4 ${iconColor}`} />
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
    </>
  );
};
