import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Layers, Wallet, Cpu, Search, UserMinus, ShieldAlert, CheckCircle2, 
  XCircle, Filter, Sparkles, Database, FileText, Bot, ArrowRight, TrendingUp, RefreshCw, 
  ArrowUpRight, BarChart3, Bell, Eye, LogIn, HardDrive, Trash2, Mail, Phone, Calendar, Play
} from 'lucide-react';
import { PlanType, User, Project } from '../types/rag';

export const AdminDesk: React.FC = () => {
  const { 
    currentUser, users, projects, documents, billingTransactions, hostedBots,
    deleteUser, updateUserPlan, login, deleteProject, simulateTelebirrCallback
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'workspaces' | 'billing' | 'system'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  
  // Custom states for simulated admin logs
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([
    "[System] Admin Console mounted. Synced with local storage.",
    "[Qdrant] CPU cores: 4/4 operational. Thread pool: 12.",
    "[FastAPI] Middleware authenticated sliding windower - OK",
    "[Redis] Queue lengths: document_ingest=0, suggested_email_queue=0",
    "[Resend] API status: Active (Rate limit: 100/min)"
  ]);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('0912000000');
  const [newUserPlan, setNewUserPlan] = useState<PlanType>('free');
  const [userFeedback, setUserFeedback] = useState<string | null>(null);

  // Stats Counters
  const totalUsers = users.length;
  const totalWorkspaces = projects.length;
  const totalBots = hostedBots.length;
  
  // Sum of successful transactions
  const totalRevenue = billingTransactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filter users based on search
  const filteredUsers = users.filter(usr => {
    const matchesSearch = usr.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          usr.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesFilter = selectedPlanFilter === 'all' || usr.plan === selectedPlanFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter workspaces
  const filteredWorkspaces = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(workspaceSearch.toLowerCase()) ||
                          p.namespace_id.toLowerCase().includes(workspaceSearch.toLowerCase());
    return matchesSearch;
  });

  const triggerLog = (msg: string) => {
    setPipelineLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 14)]);
  };

  const handleCreateMockUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    // Check pre-existing email
    const duplicate = users.find(u => u.email.toLowerCase() === newUserEmail.toLowerCase());
    if (duplicate) {
      setUserFeedback("Error: Email is already registered in the system.");
      return;
    }

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: newUserName,
      email: newUserEmail,
      plan: newUserPlan,
      telebirr_phone: newUserPhone,
      is_verified: true,
      avatar_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=150`,
      created_at: new Date().toISOString()
    };

    // Force add user to list by triggering a login side-effect or updating inside existing state.
    // Since AppContext manages the lists of users, we can invoke a simulated login sequence, or simple state updates.
    // We already have updateUserPlan which is supported. Let's do a trick: we simulate updating a plan on this user after registering them.
    // In our context structure, users are added automatically upon register or login.
    // To cleanly add a user directly: we can trigger a login call context-internally, or just update using login for simulation,
    // let's alert that users are seeded from registration or we can trigger user creation by using standard registrations.
    // Let's make an intuitive action. We'll add them to our localStorage array directly and log a message.
    const currentUsersList: User[] = JSON.parse(localStorage.getItem('rag_all_users') || '[]');
    currentUsersList.push(newUser);
    localStorage.setItem('rag_all_users', JSON.stringify(currentUsersList));
    
    // Quick reload
    triggerLog(`Created mock user "${newUserName}" (${newUserPlan}) successfully.`);
    setUserFeedback(`Success: Mock user "${newUserName}" created!`);
    
    setNewUserName('');
    setNewUserEmail('');
    
    // Simulate refreshing page content by simply reloading location or we can reload context. Since context reads from localStorage,
    // we can trigger is_verified updates. Let's register them cleanly.
    // Actually, to make it react immediately, we can just edit the plan of any existing user in the UI, or the user list will update next reload.
    // Wait, let's allow updating state on the fly. Let's trigger changing plan of an existing user or let them manage seed users immediately!
    setTimeout(() => {
      setUserFeedback(null);
      window.location.reload(); // Quick refresh to update Context state
    }, 1500);
  };

  const handleImpersonate = async (targetUser: User) => {
    try {
      // Direct login simulation
      await login(targetUser.email, 'developer_secret_pass'); // fallback passwords are >= 6
      triggerLog(`Impersonating User: Swapped identity to ${targetUser.name}`);
      window.location.reload();
    } catch (err: any) {
      triggerLog(`Error impersonating: ${err?.message}`);
    }
  };

  const handleApproveTransaction = (token: string) => {
    simulateTelebirrCallback(token, 'success');
    triggerLog(`Telebirr Transaction Approved manually for token: ${token.substring(0, 8)}...`);
  };

  const handleDeclineTransaction = (token: string) => {
    simulateTelebirrCallback(token, 'error');
    triggerLog(`Telebirr Transaction Terminated manually for token: ${token.substring(0, 8)}...`);
  };

  return (
    <div className="space-y-8 p-1 text-slate-100 pb-16">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[9px] font-mono tracking-widest font-bold uppercase">
              ROOT AUTHORIZED
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">Administrator Hub</h1>
          <p className="text-slate-400 text-xs mt-0.5">Global resource analysis, transaction approvals, and user governance.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <Database className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="font-mono text-[10px] text-slate-300">Admin Mode Active: System Administrator</span>
        </div>
      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Users card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-24 h-24" />
          </div>
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Total Users Scoped</p>
          <div className="flex justify-between items-end mt-2">
            <div>
              <h3 className="text-3xl font-bold text-white tracking-tight">{totalUsers}</h3>
              <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +24% vs last cycle
              </p>
            </div>
            <div className="p-2.5 bg-rose-500/5 text-rose-400 border border-rose-500/10 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Global Workspaces card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Layers className="w-24 h-24" />
          </div>
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Global RAG Workspaces</p>
          <div className="flex justify-between items-end mt-2">
            <div>
              <h3 className="text-3xl font-bold text-white tracking-tight">{totalWorkspaces}</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                {documents.length} physical indexed files
              </p>
            </div>
            <div className="p-2.5 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Telebirr cashier card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-24 h-24" />
          </div>
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Telebirr Net Collections</p>
          <div className="flex justify-between items-end mt-2">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {totalRevenue.toLocaleString()} <span className="text-xs font-semibold text-slate-400">ETB</span>
              </h3>
              <p className="text-[10px] text-indigo-300 font-mono mt-1">
                {billingTransactions.filter(t => t.status === 'success').length} paid paywall logs
              </p>
            </div>
            <div className="p-2.5 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Active chat models card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Cpu className="w-24 h-24" />
          </div>
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Custom Active AI Bots</p>
          <div className="flex justify-between items-end mt-2">
            <div>
              <h3 className="text-3xl font-bold text-white tracking-tight">{totalBots}</h3>
              <p className="text-[10px] text-purple-400 font-mono mt-1">
                Qdrant vectors namespaces
              </p>
            </div>
            <div className="p-2.5 bg-purple-500/5 text-purple-400 border border-purple-500/10 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>

      {/* Mid navigation links and panel body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column sidebar for quick metrics, queues & charts */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Admin Navigation list links */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-900/60 border-b border-slate-800/80">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">Governance</span>
            </div>
            <div className="p-2 space-y-1">
              {[
                { id: 'users', label: 'Registered Clients', count: users.length, icon: Users, color: 'text-indigo-400' },
                { id: 'workspaces', label: 'Vector Workspaces', count: projects.length, icon: Layers, color: 'text-rose-400' },
                { id: 'billing', label: 'Telebirr Paywall Logs', count: billingTransactions.length, icon: Wallet, color: 'text-emerald-400' },
                { id: 'system', label: 'Queue Observability', icon: HardDrive, color: 'text-amber-400' },
              ].map((lnk) => {
                const Icon = lnk.icon;
                const isSel = activeTab === lnk.id;
                return (
                  <button
                    key={lnk.id}
                    onClick={() => setActiveTab(lnk.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium cursor-pointer transition-all ${
                      isSel 
                        ? 'bg-slate-900 border-l-4 border-rose-500 text-white pl-4' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${lnk.color}`} />
                      <span>{lnk.label}</span>
                    </div>
                    {lnk.count !== undefined && (
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        {lnk.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Mock User generator pane */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-semibold text-slate-300">Fast Inbound User Seeding</h4>
            
            {userFeedback && (
              <div className={`p-2.5 text-xs rounded-xl ${userFeedback.startsWith('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {userFeedback}
              </div>
            )}

            <form onSubmit={handleCreateMockUser} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Client Full Name</label>
                <input 
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Samuel Ayele"
                  required
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs focus:outline-none focus:border-rose-500 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Email Address</label>
                <input 
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="samuel@gmail.com"
                  required
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs focus:outline-none focus:border-rose-500 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Default Plan</label>
                <select 
                  value={newUserPlan}
                  onChange={(e) => setNewUserPlan(e.target.value as PlanType)}
                  className="w-full mt-1 px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs focus:outline-none focus:border-rose-500 text-slate-200 font-mono"
                >
                  <option value="free">Free Option (100K Cap)</option>
                  <option value="pro">Pro Option (5M Cap)</option>
                  <option value="enterprise">Enterprise (∞ Cap)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1 active:translate-y-[1px] cursor-pointer shadow-lg shadow-rose-600/10"
              >
                Seed Mock Account
              </button>
            </form>
          </div>

          {/* Observer diagnostics */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-[10px]">
            <h4 className="text-xs font-semibold text-slate-300 font-sans">Queue Observability logs</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {pipelineLogs.map((log, idx) => (
                <p key={idx} className="text-slate-400 border-b border-slate-900/40 pb-1.5 leading-relaxed">
                  {log}
                </p>
              ))}
            </div>
          </div>

        </div>

        {/* Right 3 columns for details tables and control blocks */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tab Content: Users */}
          {activeTab === 'users' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-md font-semibold text-white">Client Identity Directory</h3>
                  <p className="text-xs text-slate-500">Track registration lists, plans, and enforce instant upgrades.</p>
                </div>
                
                {/* Search & filters bar */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Search accounts..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-full md:w-48"
                    />
                  </div>
                  
                  <select
                    value={selectedPlanFilter}
                    onChange={(e) => setSelectedPlanFilter(e.target.value)}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="all">All Plan Tiers</option>
                    <option value="free">Free Tiers Only</option>
                    <option value="pro">Pro Tiers Only</option>
                    <option value="enterprise">Enterprise Tiers Only</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-semibold tracking-wider">
                      <th className="py-3 px-4">Client Detail / ID</th>
                      <th className="py-3 px-4">Verified Plan Quota</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Enrolled Timestamp</th>
                      <th className="py-3 px-4 text-center">Governance Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredUsers.map((usr) => {
                      const userProjs = projects.filter(p => p.user_id === usr.id).length;
                      const isAdminAccount = usr.email.toLowerCase() === 'admin@enawga.com';

                      return (
                        <tr key={usr.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={usr.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                                alt="avatar" 
                                className="w-9 h-9 rounded-full object-cover border border-slate-800"
                                referrerPolicy="no-referrer"
                              />
                              <div className="overflow-hidden max-w-[150px]">
                                <h4 className="font-semibold text-slate-200 truncate">{usr.name} {isAdminAccount && '👑'}</h4>
                                <p className="text-[10px] text-slate-500 truncate">{usr.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {isAdminAccount ? (
                              <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/25 text-[9px] font-bold text-rose-300 uppercase">
                                Root System
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <select 
                                  value={usr.plan}
                                  onChange={(e) => {
                                    updateUserPlan(usr.id, e.target.value as PlanType);
                                    triggerLog(`Updated plan of ${usr.name} to ${e.target.value}`);
                                  }}
                                  className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] text-indigo-400 font-bold focus:outline-none"
                                >
                                  <option value="free">FREE</option>
                                  <option value="pro">PRO</option>
                                  <option value="enterprise">ENTERPRISE</option>
                                </select>
                                <span className="text-[9px] text-slate-500 font-sans">
                                  {userProjs} space{userProjs === 1 ? '' : 's'}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">
                            {usr.telebirr_phone || <span className="text-slate-600 italic">Unbound</span>}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                            {new Date(usr.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isAdminAccount ? (
                              <span className="text-[10px] text-slate-600 italic">Locked</span>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleImpersonate(usr)}
                                  className="p-1 px-2.5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono rounded-md hover:text-white hover:border-slate-700 flex items-center gap-1 cursor-pointer"
                                  title="Change local auth session to this user"
                                >
                                  <LogIn className="w-3 h-3 text-indigo-400" />
                                  Impersonate
                                </button>
                                <button
                                  onClick={() => {
                                    deleteUser(usr.id);
                                    triggerLog(`Enforced deletion of account ID ${usr.id}`);
                                  }}
                                  className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded-md transition-all cursor-pointer"
                                  title="Permanently remove account and purge associated workspaces"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content: Workspaces */}
          {activeTab === 'workspaces' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-md font-semibold text-white">Central Vector Workspaces</h3>
                  <p className="text-xs text-slate-500">View and scrub active RAG namespaces currently hosted on Qdrant cluster.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search workspaces/namespaces..."
                    value={workspaceSearch}
                    onChange={(e) => setWorkspaceSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-full md:w-56"
                  />
                </div>
              </div>

              {filteredWorkspaces.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No projects or namespaces matching searches.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-semibold tracking-wider">
                        <th className="py-3 px-4">Workspace Info / Namespace ID</th>
                        <th className="py-3 px-4">Client email</th>
                        <th className="py-3 px-4">Namespace Status</th>
                        <th className="py-3 px-4">Index metrics</th>
                        <th className="py-3 px-4 text-center">Sovereign Purge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {filteredWorkspaces.map((proj) => {
                        const fileCount = documents.filter(d => d.project_id === proj.id).length;
                        const chunkCount = documents
                          .filter(d => d.project_id === proj.id)
                          .reduce((sum, d) => sum + (d.chunk_count || 0), 0);
                        
                        // Find workspace owner
                        const owner = users.find(u => u.id === proj.user_id);

                        return (
                          <tr key={proj.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-3.5 px-4">
                              <h4 className="font-semibold text-slate-200">{proj.name}</h4>
                              <p className="text-[10px] font-mono text-slate-500">{proj.namespace_id}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {owner ? (
                                <span className="underline hover:text-indigo-400 cursor-pointer text-[11px]" title={owner.name}>
                                  {owner.email}
                                </span>
                              ) : (
                                <span className="text-slate-600 italic">Unknown tenant</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 capitalize">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                proj.status === 'ready' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}>
                                {proj.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300 font-mono text-[10px]">
                              {fileCount} physical documents / {chunkCount} vectors chunked
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => {
                                  deleteProject(proj.id);
                                  triggerLog(`Enforced deletion of workspace namespace ${proj.namespace_id}`);
                                }}
                                className="p-1 px-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 text-[10px] rounded-md border border-red-500/20 flex items-center gap-1 mx-auto cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                Force Purge
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Telebirr Billing logger */}
          {activeTab === 'billing' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-md font-semibold text-white">Telebirr Merchant Collections</h3>
                <p className="text-xs text-slate-500">Review outstanding checkout flows and issue direct manual simulation callbacks.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-semibold tracking-wider">
                      <th className="py-3 px-4">Invoice / Token Reference</th>
                      <th className="py-3 px-4">Client Profile</th>
                      <th className="py-3 px-4">Paywall Amount</th>
                      <th className="py-3 px-4">Ingress status</th>
                      <th className="py-3 px-4 text-center">Manual Sandbox Simulation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-1000">
                    {billingTransactions.map((tx) => {
                      // Find target user
                      const client = users.find(u => u.id === tx.user_id);
                      
                      return (
                        <tr key={tx.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <h4 className="font-semibold text-slate-200 uppercase font-mono tracking-wider">{tx.id.substring(0, 12)}</h4>
                            <p className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]" title={tx.telebirr_token}>
                              H5 Token: {tx.telebirr_token}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {client ? (
                              <div className="text-[11px]">
                                <p className="font-semibold text-slate-300">{client.name}</p>
                                <p className="text-[9px] text-slate-500">{client.email}</p>
                              </div>
                            ) : (
                              <span className="text-slate-600 italic">User purged</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                            {tx.amount} ETB
                          </td>
                          <td className="py-3.5 px-4">
                            {tx.status === 'success' && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold uppercase">
                                PAID & CAP UNLOCKED
                              </span>
                            )}
                            {tx.status === 'pending' && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-bold uppercase animate-pulse">
                                IN TRANSIT CALLBACK
                              </span>
                            )}
                            {tx.status === 'error' && (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-mono font-bold uppercase">
                                TRANSIT FAILED
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {tx.status === 'pending' ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleApproveTransaction(tx.telebirr_token)}
                                  className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] rounded cursor-pointer"
                                >
                                  Approve Payment
                                </button>
                                <button
                                  onClick={() => handleDeclineTransaction(tx.telebirr_token)}
                                  className="p-1 px-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-[10px] rounded cursor-pointer"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-600 italic font-mono text-[10px]">Lifecycle Completed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content: System Observability */}
          {activeTab === 'system' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-md font-semibold text-white">System Node Health Observability</h3>
                <p className="text-xs text-slate-500">Internal vector databases status monitor, Redis worker telemetry, and sliding ingestion windows.</p>
              </div>

              {/* Hardware diagnostics metrics grids */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Qdrant Vectors */}
                <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl relative">
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Qrdant Node Namespace</p>
                  <p className="text-xl font-bold text-white mt-1">Operational</p>
                  <div className="space-y-1.5 mt-4 text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-800/40">
                    <div className="flex justify-between"><span>CPU load:</span><span className="text-white">14.2%</span></div>
                    <div className="flex justify-between"><span>Vector dimensions:</span><span className="text-white">1024 (Cosine)</span></div>
                    <div className="flex justify-between"><span>Memory Usage:</span><span className="text-white">182MB</span></div>
                  </div>
                </div>

                {/* Redis queue */}
                <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl relative">
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Redis Job queues</p>
                  <p className="text-xl font-bold text-white mt-1">Normal (0 queued)</p>
                  <div className="space-y-1.5 mt-4 text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-800/40">
                    <div className="flex justify-between"><span>Queue 'document_ingest':</span><span className="text-white">0 jobs</span></div>
                    <div className="flex justify-between"><span>Queue 'email_delivery':</span><span className="text-white">0 jobs</span></div>
                    <div className="flex justify-between"><span>Redis memory status:</span><span className="text-white">12.8MB active</span></div>
                  </div>
                </div>

                {/* Resend server */}
                <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl relative">
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase">SMTP Mail server</p>
                  <p className="text-xl font-bold text-white mt-1">SMTP Relayer Connect</p>
                  <div className="space-y-1.5 mt-4 text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-800/40">
                    <div className="flex justify-between"><span>Server:</span><span className="text-indigo-400 font-mono">resend.enawga.com</span></div>
                    <div className="flex justify-between"><span>Daily sent metrics:</span><span className="text-white">12 messages</span></div>
                    <div className="flex justify-between"><span>SSL Handshake status:</span><span className="text-white">TLS_v1.3 Active</span></div>
                  </div>
                </div>

              </div>

              {/* Vector dimension plot logs */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-xs font-semibold text-slate-300 mb-4">Pipeline latency over sliding 24h window</h4>
                <div className="h-44 flex items-end justify-between gap-1.5 pt-4 border-b border-l border-slate-800/65 pl-2">
                  {[
                    { label: '00:00', latency: 45 },
                    { label: '04:00', latency: 50 },
                    { label: '08:00', latency: 120 },
                    { label: '12:00', latency: 135 },
                    { label: '16:00', latency: 85 },
                    { label: '20:00', latency: 55 },
                    { label: '24:00', latency: 40 },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                      <div 
                        style={{ height: `${(bar.latency / 200) * 100}%` }} 
                        className="w-full max-w-[45px] bg-rose-500/30 group-hover:bg-rose-500/50 rounded-t border-t border-rose-500/50 transition-all cursor-pointer relative"
                        title={`Stage Processing Latency: ${bar.latency}ms`}
                      />
                      <span className="text-[9px] font-mono text-slate-500">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
