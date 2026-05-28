import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, GitCommit, GitPullRequest, ArrowUpRight, Copy, Check, Info,
  Sparkles, Trash2, Smartphone, AlertTriangle, Play, RefreshCw, Layers, CheckCircle2
} from 'lucide-react';
import { GitHubRepo, CommitEvent } from '../types/rag';

interface GitHubIngestionProps {
  onNavigateTab: (tab: string) => void;
  selectedProjectId: string;
  onSetSelectedProjectId: (id: string) => void;
}

export const GitHubIngestion: React.FC<GitHubIngestionProps> = ({ onNavigateTab, selectedProjectId, onSetSelectedProjectId }) => {
  const { 
    currentUser, projects, githubRepos, commitEvents, 
    connectGitHub, disconnectGitHub, simulateGitHubPushCommit, triggerManualResync, usageStats 
  } = useApp();

  const [repoUrl, setRepoUrl] = useState('');
  const [gitToken, setGitToken] = useState('ghp_mocktoken62_xxxxxxxxxxxxxxxxxxxxxx');
  const [trackMode, setTrackMode] = useState<'webhook' | 'polling'>('webhook');
  
  // Simulated Commit attributes
  const [simMessage, setSimMessage] = useState('doc: Update Telebirr parameters layout details in getting-started.md');
  const [selectedDocFile, setSelectedDocFile] = useState(true);
  const [selectedSourceFile, setSelectedSourceFile] = useState(false);
  const [selectedTestFile, setSelectedTestFile] = useState(false);
  const [selectedAssetFile, setSelectedAssetFile] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFreePlan = currentUser?.plan === 'free';

  // Active connected repo
  const activeRepo = githubRepos.find(r => r.id === selectedProjectId || r.project_id === selectedProjectId);
  const activeProject = activeRepo ? projects.find(p => p.id === activeRepo.project_id) : null;
  const projectEvents = activeRepo ? commitEvents.filter(e => e.repo_id === activeRepo.id) : [];

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    // Check project selection
    const apiProjs = projects.filter(p => p.type === 'api');
    if (apiProjs.length === 0) {
      setError("Please create a Developer API project workspace first under 'Plug & Play APIs' to wire the GitHub collection namespace.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    setLoading(true);
    try {
      // Connect first Developer API project in priority as namespace target
      const coreProj = apiProjs[0];
      const resp = await connectGitHub(coreProj.id, repoUrl, gitToken, trackMode);
      onSetSelectedProjectId(resp.id);
      setRepoUrl('');
    } catch (err: any) {
      setError(err?.message || String(err));
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRepo || !simMessage.trim()) return;

    const changed: string[] = [];
    if (selectedDocFile) changed.push('docs/getting-started.md');
    if (selectedSourceFile) changed.push('app/core/rag/bm25.py');
    if (selectedTestFile) changed.push('tests/test_pipelines.py');
    if (selectedAssetFile) changed.push('assets/banner.png');

    if (changed.length === 0) {
      setError("Please check at least one file to include in this simulated GitHub push payload.");
      setTimeout(() => setError(null), 4000);
      return;
    }

    setLoading(true);
    await simulateGitHubPushCommit(activeRepo.id, simMessage, changed);
    setLoading(false);
    
    // Clear selections helper
    setSimMessage('chore: Optimize embeddings L2 Normalization in embedder');
    setSelectedDocFile(false);
    setSelectedSourceFile(true);
    setSelectedTestFile(false);
    setSelectedAssetFile(false);
  };

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case 'doc_updated': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'code_changed': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'mixed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'doc_updated': return 'Doc Update (Triggered Incremental Re-embed)';
      case 'code_changed': return 'Code Only (Triggered Developer Suggested Docs Action)';
      case 'mixed': return 'Mixed (Re-embed Docs + Notify Code Change)';
      default: return 'Ignored (Silently Synced)';
    }
  };

  if (isFreePlan) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-10 max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex justify-center p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
          <Github className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white">Unlock Automated GitHub Doc Ingestion</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Synchronize your repository documentation dynamically with every single `git push` commit hook. Let our pipeline surgically re-embed changed lines using Git line diff vectors automatically!
          </p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-left space-y-2 max-w-sm mx-auto font-mono text-[10px] text-slate-300">
          <div className="flex justify-between">
            <span>Free Tier:</span>
            <span className="text-red-400 font-semibold uppercase">0 repos</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800/40">
            <span>Pro Tier (Up to 3 Repos):</span>
            <span className="text-emerald-400 font-semibold uppercase">30 mins Polling & Webhooks</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800/40">
            <span>Enterprise:</span>
            <span className="text-indigo-400 font-semibold uppercase">Real-time instant Webhooks</span>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('billing')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs active:translate-y-[1px] transition-transform inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          Activate Ingestion of Telebirr
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Detail selection split */}
      {!activeRepo ? (
        /* Repo Connector panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create repo connection form */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Connect Developer Repository</h3>
              <p className="text-xs text-slate-500 mt-1">
                Point to a GitHub repository branch to trigger RAG indexing on Markdown, RST, or Plain text files in `/docs`.
              </p>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5">Repository URL</label>
                  <input 
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/biniyam/docs"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-xs text-sans"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5">Auth Token (read:repo scope)</label>
                  <input 
                    type="password"
                    value={gitToken}
                    onChange={(e) => setGitToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 font-semibold">Synchronization Protocol Tracking Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input 
                      type="radio" 
                      name="track" 
                      checked={trackMode === 'webhook'}
                      onChange={() => setTrackMode('webhook')}
                      className="accent-indigo-500" 
                    />
                    Asynchronous Webhook HMAC registers
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input 
                      type="radio" 
                      name="track" 
                      checked={trackMode === 'polling'}
                      onChange={() => setTrackMode('polling')}
                      className="accent-indigo-500" 
                    />
                    30-min Periodic Polling scheduler (Section 10.6)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs active:translate-y-[1px] transition-transform shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : 'Register Repo Webhook'}
              </button>
            </form>
          </div>

          {/* Connected repos index */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">Active Repositories</h3>
            
            {githubRepos.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No connected GitHub repositories.</p>
            ) : (
              <div className="space-y-3">
                {githubRepos.map((repo) => (
                  <div 
                    key={repo.id}
                    className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-3 group hover:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-slate-400" />
                        <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{repo.repo_name}</h4>
                      </div>
                      <span className="text-[9px] font-mono uppercase bg-slate-950 px-2 py-0.5 border border-slate-800 text-indigo-400 rounded">
                        {repo.tracking_mode}
                      </span>
                    </div>

                    <p className="text-[10px] font-mono text-slate-500 truncate mt-1">Branch: {repo.default_branch}</p>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/40 justify-between">
                      <button
                        onClick={() => disconnectGitHub(repo.id)}
                        className="p-1 px-2.5 bg-slate-950 border border-slate-800 text-red-400 text-[10px] rounded-lg hover:bg-red-500/5 cursor-pointer"
                      >
                        Disconnect
                      </button>
                      <button
                        onClick={() => onSetSelectedProjectId(repo.id)}
                        className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] rounded-lg transition-transform cursor-pointer"
                      >
                        Commit Log Console
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Connection Detail Console and Simulation matrix */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left panel repository status and commit triggers */}
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">{activeRepo.repo_name}</h3>
                </div>
                <button
                  onClick={() => onSetSelectedProjectId('')}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Repos list
                </button>
              </div>

              {/* Repos features stats checklist */}
              <div className="space-y-2.5 text-xs font-mono border-t border-slate-900 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tracking Owner:</span>
                  <span className="text-white">{activeRepo.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Synced Hash:</span>
                  <span className="text-white font-mono">{activeRepo.last_commit_sha?.substr(0, 8)}</span>
                </div>
              </div>

              {/* Force synchronizations controls */}
              <button 
                onClick={() => triggerManualResync(activeRepo.id)}
                className="w-full py-2 bg-slate-905 border border-slate-800 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 hover:text-white flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Force Full Re-Ingestion (Sync)
              </button>
            </div>

            {/* Simulated Commit Push hook panel (Section 10.3 / 53) */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">Simulate Git Push Event Hook</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Mock checking in changes to evaluate our surgical line-range overlapping classifier.</p>
              </div>

              <form onSubmit={handleSimulateCommit} className="space-y-4">
                <div>
                  <label className="block text-xxs font-mono text-slate-500 uppercase tracking-wider mb-1">Simulated Commit Message</label>
                  <input
                    type="text"
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Checklist options representing file pattern classifications in 10.3 */}
                <div className="space-y-2.5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <p className="text-xxs font-mono text-slate-400 uppercase tracking-wider mb-1">Select Changed Files payload</p>
                  
                  <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedDocFile} 
                      onChange={() => setSelectedDocFile(!selectedDocFile)} 
                      className="accent-indigo-500"
                    />
                    docs/getting-started.md (Doc check)
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedSourceFile} 
                      onChange={() => setSelectedSourceFile(!selectedSourceFile)} 
                      className="accent-indigo-500"
                    />
                    app/core/rag/bm25.py (Source code)
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedTestFile} 
                      onChange={() => setSelectedTestFile(!selectedTestFile)} 
                      className="accent-indigo-500"
                    />
                    tests/test_pipelines.py (Test files)
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedAssetFile} 
                      onChange={() => setSelectedAssetFile(!selectedAssetFile)} 
                      className="accent-indigo-500"
                    />
                    assets/banner.png (Static Assets)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs active:translate-y-[1px] transition-transform cursor-pointer flex justify-center items-center gap-1.5"
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  POST /webhooks/github Payload
                </button>
              </form>
            </div>
          </div>

          {/* Right panel commit events synced list logs */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <GitPullRequest className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-semibold text-white">Commit Synchronization Ledger</h4>
            </div>

            {projectEvents.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-12 text-center border border-dashed border-slate-800 rounded-xl">No git sync operations enqueued yet. Run simulated push triggers on the left panel!</p>
            ) : (
              <div className="space-y-4">
                {projectEvents.map((evt) => (
                  <div key={evt.id} className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold border ${getEventBadgeClass(evt.event_type)}`}>
                          {getEventLabel(evt.event_type)}
                        </span>
                        <p className="text-xs font-semibold text-slate-200 pt-1">"{evt.commit_message}"</p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">SHA Code: {evt.commit_sha}</span>
                    </div>

                    {/* Files changed indicators */}
                    <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px] text-slate-400">
                      <strong>Files:</strong>
                      {evt.files_changed.map((file, idx) => (
                        <span key={idx} className="bg-slate-950 px-1.5 py-0.5 border border-slate-800 rounded text-slate-300">
                          {file}
                        </span>
                      ))}
                    </div>

                    {/* Warnings trigger logs */}
                    {evt.notification_sent && (
                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[10px] text-amber-400 space-y-1 leading-relaxed">
                        <div className="flex items-center gap-1 font-bold">
                          <Info className="w-3.5 h-3.5" /> ACTION NEEDED: Developers Suggested Docs update
                        </div>
                        <p>Code changed without docs updates! We have auto-fired suggestions warning email via Resend to reconcile definitions.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
