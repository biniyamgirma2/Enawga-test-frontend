import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  Sparkles, CheckCircle2, TrendingUp, AlertCircle, Cpu, HardDrive, 
  FileCode, Layers, ArrowUpRight, HelpCircle, Activity, Hourglass, Trash2
} from 'lucide-react';
import { ProjectType } from '../types/rag';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
  onSetSelectedProjectId: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab, onSetSelectedProjectId }) => {
  const { currentUser, projects, documents, usageStats, deleteProject } = useApp();

  const currentPlan = currentUser?.plan || 'free';

  // Backends Mock Endpoints Metrics
  const healthChecks = [
    { name: 'Gateway', path: '/health', status: 'optimal', lag: '4ms', details: 'Unauthenticated sliding window' },
    { name: 'PostgreSQL DB', path: '/health/db', status: 'optimal', lag: '9ms', details: 'pg_stat_statements active' },
    { name: 'Vector DB (Qdrant)', path: '/health/qdrant', status: 'optimal', lag: '15ms', details: 'Distance: COSINE, dimension: 1024' },
    { name: 'Cache & Queue (Redis)', path: '/health/redis', status: 'optimal', lag: '1ms', details: 'BM25 Sparse index replication' },
  ];

  // Helper for Project Badge
  const getBadgeClass = (type: ProjectType) => {
    switch (type) {
      case 'instant': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'hosted': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'api': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  const percentTokenBurn = Math.min(100, (usageStats.monthly_tokens_used / usageStats.limit_tokens) * 100);

  const getPercentageColor = (pct: number) => {
    if (pct < 50) return 'bg-indigo-500';
    if (pct < 85) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleQuickAction = (proj: any) => {
    onSetSelectedProjectId(proj.id);
    if (proj.type === 'instant') onNavigateTab('instant');
    else if (proj.type === 'hosted') onNavigateTab('hosted');
    else if (proj.type === 'api') onNavigateTab('developer');
  };

  return (
    <div className="space-y-8 p-1 text-slate-100 pb-16">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Console Monitor</h1>
          <p className="text-slate-400 text-xs">Real-time resource enforcement and backend status</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] text-slate-400">Node Ingress: Active</span>
        </div>
      </div>

      {/* Usage card indicators grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Token burn limit widget */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xxs font-semibold uppercase tracking-wider">Plan Token Quota</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {usageStats.monthly_tokens_used.toLocaleString()}
                <span className="text-xs text-slate-500 font-normal"> / {usageStats.limit_tokens >= 1000000 ? `${usageStats.limit_tokens / 1000000}M` : `${usageStats.limit_tokens / 1000}K`}</span>
              </h3>
            </div>
            <div className="p-2 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2 mt-6">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-500">Resource Burn Rate</span>
              <span className="text-slate-300 font-semibold">{percentTokenBurn.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-[1px]">
              <div 
                style={{ width: `${percentTokenBurn}%` }} 
                className={`h-full rounded-full transition-all duration-500 ${getPercentageColor(percentTokenBurn)}`} 
              />
            </div>
            <p className="text-[10px] text-indigo-300/80 font-mono mt-2">
              {currentUser?.plan === 'free' ? 'Upgrade Telebirr Pro for 5M cap' : 'Metered overage warning disabled'}
            </p>
          </div>
        </div>

        {/* Hosted bots limit widget */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xxs font-semibold uppercase tracking-wider">Active Hosted Chatbots</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {projects.filter(p => p.type === 'hosted').length}
                <span className="text-xs text-slate-500 font-normal"> / {usageStats.limit_bots === 999 ? '∞' : usageStats.limit_bots}</span>
              </h3>
            </div>
            <div className="p-2 bg-purple-500/5 text-purple-400 border border-purple-500/10 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-6 leading-relaxed">
            Permanent, shareable customer bots scoped by Qdrant namespaces. Complete checkout to provision more.
          </p>
          <button 
            onClick={() => onNavigateTab('hosted')} 
            className="mt-4 inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 gap-1 hover:underline cursor-pointer"
          >
            Provision Helper Bot
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Total Documents Limit */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xxs font-semibold uppercase tracking-wider">Document storage chunk logs</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {documents.length}
                <span className="text-xs text-slate-500 font-normal"> Indexed (MD, PDF)</span>
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-xl">
              <FileCode className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1 bg-slate-900/40 p-3 rounded-xl mt-4 font-mono text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>Ingested total files:</span>
              <span className="text-white">{documents.filter(d => d.status === 'done').length}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/40">
              <span>Max allowed size:</span>
              <span className="text-white">{usageStats.limit_doc_size_mb} MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main core content area split into Health list & Project listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 column of project lists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-md font-semibold text-white">Your RAG Workspaces</h3>
                <p className="text-xs text-slate-500">Select any workspace to enter parsing console</p>
              </div>
              <button 
                onClick={() => onNavigateTab('instant')} 
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg active:translate-y-[1px] transition-transform cursor-pointer"
              >
                + New Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No projects generated yet. Launch an instant session.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-semibold tracking-wider">
                      <th className="py-3 px-4">Workspace Name</th>
                      <th className="py-3 px-4">Namespace ID</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Platform Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {projects.map((proj) => {
                      const fileCount = documents.filter(d => d.project_id === proj.id).length;
                      return (
                        <tr 
                          key={proj.id} 
                          className="hover:bg-slate-900/30 transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-semibold text-slate-200">
                            <button
                              onClick={() => handleQuickAction(proj)}
                              className="hover:text-indigo-400 hover:underline text-left font-semibold cursor-pointer block"
                            >
                              {proj.name}
                            </button>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {fileCount} physical document{fileCount === 1 ? '' : 's'} linked
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                            {proj.namespace_id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-mono font-bold ${getBadgeClass(proj.type)}`}>
                              {proj.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <span className={`w-1.5 h-1.5 rounded-full ${proj.status === 'ready' ? 'bg-emerald-500' : proj.status === 'processing' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                              <span className="text-[11px] capitalize">{proj.status}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleQuickAction(proj)}
                                className="p-1 px-2.5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] rounded-md hover:text-white hover:border-slate-700 cursor-pointer"
                              >
                                Manage
                              </button>
                              <button
                                onClick={() => deleteProject(proj.id)}
                                className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded-md transition-colors cursor-pointer"
                                title="Delete Project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick RAG statistics overview visualizer block */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-md font-semibold text-white">Daily API Request Load</h3>
                <p className="text-xs text-slate-500">Inbound hybrid retrieval logs over latest periods</p>
              </div>
              <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Dense retrieve</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Sparse index</span>
                </div>
              </div>
            </div>

            {/* Micro handcrafted bar chart representing logs */}
            <div className="h-40 flex items-end justify-between gap-2.5 pt-4 border-b border-l border-slate-800/60 pb-1 pl-2">
              {[
                { label: 'May 22', dense: 24, sparse: 12 },
                { label: 'May 23', dense: 36, sparse: 18 },
                { label: 'May 24', dense: 84, sparse: 42 },
                { label: 'May 25', dense: 61, sparse: 31 },
                { label: 'May 26', dense: 92, sparse: 52 },
                { label: 'May 27', dense: 110, sparse: 64 },
                { label: 'May 28', dense: 142, sparse: 89 },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full flex justify-center gap-1 h-full items-end max-w-[40px]">
                    {/* Dense bar */}
                    <div 
                      style={{ height: `${(bar.dense / 150) * 100}%` }} 
                      className="w-1.5 bg-indigo-500 rounded-t-sm group-hover:bg-indigo-400 transition-all cursor-crosshair relative"
                      title={`Dense matches: ${bar.dense}`}
                    />
                    {/* Sparse bar */}
                    <div 
                      style={{ height: `${(bar.sparse / 150) * 100}%` }} 
                      className="w-1.5 bg-emerald-500 rounded-t-sm group-hover:bg-emerald-400 transition-all cursor-crosshair relative"
                      title={`BM25 Sparse matches: ${bar.sparse}`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 column of health status diagnostics */}
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="text-md font-semibold text-white">Observability Checks</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">Internal FastAPI dependencies monitoring</p>

            <div className="space-y-4">
              {healthChecks.map((srv, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{srv.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold uppercase">
                      ONLINE
                    </span>
                  </div>
                  <div className="flex gap-3 text-[10px] font-mono text-slate-400 pt-1">
                    <span>Latency: <strong className="text-slate-200">{srv.lag}</strong></span>
                    <span>Endpoint: <strong className="text-indigo-400">{srv.path}</strong></span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-serif leading-relaxed italic border-t border-slate-800/50 pt-1.5">
                    {srv.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick RAG parameters check card */}
          <div className="bg-slate-950/80 border border-indigo-500/15 rounded-2xl p-6 text-slate-300 space-y-4">
            <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-semibold">RAG Pipeline Config</h4>
            <div className="space-y-3.5 text-xs font-mono">
              <div>
                <p className="text-slate-500 text-[10px]">EMBEDDING ENGINE</p>
                <p className="text-white font-semibold mt-0.5">BAAI/bge-m3 (Cosine, 1024d)</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px]">RERANKER CROSS-ENCODER</p>
                <p className="text-white font-semibold mt-0.5">mxbai-rerank-large-v1</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px]">CONTEXT CHUNKING</p>
                <p className="text-white font-semibold mt-0.5">512 Tokens size / 64 overlap</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px]">GENERATION CORE</p>
                <p className="text-white font-semibold mt-0.5">OpenAI GPT-4o Streaming</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
