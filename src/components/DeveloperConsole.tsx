import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  KeyRound, Layers, Copy, Check, Code, CornerDownLeft, 
  Trash2, AlertTriangle, Play, HelpCircle, Terminal, RefreshCw, Sparkles, Smartphone
} from 'lucide-react';
import { Project, APIKey } from '../types/rag';

interface DeveloperConsoleProps {
  onNavigateTab: (tab: string) => void;
  selectedProjectId: string;
  onSetSelectedProjectId: (id: string) => void;
}

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({ onNavigateTab, selectedProjectId, onSetSelectedProjectId }) => {
  const { 
    currentUser, projects, apiKeys, createProject, createAPIKey, 
    revokeAPIKey, deleteProject, sendRAGMessage, chatHistory 
  } = useApp();

  const [projName, setProjName] = useState('');
  const [keyLabel, setKeyLabel] = useState('');
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);
  
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [apiConsoleMessage, setApiConsoleMessage] = useState('How do I reset my password?');
  const [activeConsoleKey, setActiveConsoleKey] = useState('');
  const [apiConsoleResponse, setApiConsoleResponse] = useState<any | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFreePlan = currentUser?.plan === 'free';

  // Active developer project
  const activeProj = projects.find(p => p.id === selectedProjectId && p.type === 'api');
  const projectKeys = activeProj ? apiKeys.filter(k => k.project_id === activeProj.id) : [];

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    try {
      const resp = await createProject(projName, 'api');
      onSetSelectedProjectId(resp.id);
      setProjName('');
      setCreatedRawKey(null);
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  };

  const handleCreateAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyLabel.trim() || !activeProj) return;
    try {
      const resp = await createAPIKey(activeProj.id, keyLabel);
      setCreatedRawKey((resp as any).temporary_raw_secret);
      setKeyLabel('');
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  };

  const handleCopySecret = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKeyId('secret_banner');
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handleCopySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Section 9 Embed Script calculation snippet pre-filled matching Section 33
  const getEmbedSnippet = (proj: Project, pubKey: string) => {
    return `<!-- RAG Support Chat Widget -->
<script>
(function() {
  var s = document.createElement("script");
  s.src = "https://cdn.yourdomain.com/widget/v1/embed.js";
  s.setAttribute("data-project-id", "${proj.id}");
  s.setAttribute("data-api-key", "${pubKey || 'pk_live_xxxx'}");
  s.setAttribute("data-position", "bottom-right");
  s.setAttribute("data-theme", "indigo");
  document.head.appendChild(s);
})();
</script>`;
  };

  // REST mock call terminal simulation
  const handleTestRESTEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProj || !apiConsoleMessage.trim()) return;
    if (!activeConsoleKey) {
      setError("Authorization Header: Missing X-API-Key value.");
      setTimeout(() => setError(null), 4000);
      return;
    }

    setApiLoading(true);
    setApiConsoleResponse(null);

    // Latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate key lookup matching Section 32
    const keyMatch = projectKeys.find(k => k.key_prefix === activeConsoleKey.substr(0, 10));
    if (!keyMatch) {
      setApiConsoleResponse({
        error: "401 Unauthorized",
        message: "Invalid API Key token signature.",
        timestamp: new Date().toISOString()
      });
      setApiLoading(false);
      return;
    }

    // Success response
    setApiConsoleResponse({
      status: "200 OK",
      headers: {
        "content-type": "application/json",
        "x-rate-limit-remaining": "59/60",
        "x-powered-by": "FastAPI + Qdrant Node"
      },
      duration_ms: "240ms",
      body: {
        query: apiConsoleMessage,
        namespace_id: activeProj.namespace_id,
        context: [
          { file: "Backend_Architecture.md", score: 0.94, snippet: "[...] All API routes are prefixed under /api-service or /v1. Authorized keys contain the SHA-256 hash in database." }
        ],
        message: {
          role: "assistant",
          content: "The API keys utilize cryptographic standard SHA-256 validation. Your query matched with 'Backend_Architecture.md' successfully!"
        }
      }
    });

    setApiLoading(false);
  };

  if (isFreePlan) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-10 max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex justify-center p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
          <KeyRound className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white">Activate Developer Webhooks & REST Console</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            API key generation, self-contained javascript widget scripts, multi-key rotation and private server-to-server endpoints are restricted to **Pro and Enterprise accounts**.
          </p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-left space-y-2 max-w-sm mx-auto font-mono text-[10px] text-slate-300">
          <div className="flex justify-between">
            <span>Free Tier APIs:</span>
            <span className="text-red-400 font-semibold uppercase">Locked</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800/40">
            <span>Pro Tier (Up to 5 Projects):</span>
            <span className="text-emerald-400 font-semibold uppercase">60 req / min limits</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800/40">
            <span>Enterprise (Unlimited Projects):</span>
            <span className="text-indigo-400 font-semibold uppercase">600 req / min limits</span>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('billing')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs active:translate-y-[1px] transition-transform inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer animate-pulse"
        >
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          Unlock Developer Access of Telebirr
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Detail selection split */}
      {!activeProj ? (
        /* Project creator */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create developer project form */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Generate Developer REST Endpoint</h3>
              <p className="text-xs text-slate-500 mt-1">
                Deploy callable API projects to inject headless RAG search tools into external microservices or websites.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5">Project Identification Name</label>
                <input 
                  type="text"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="e.g. Core App Headless Search"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-xs text-sans"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs active:translate-y-[1px] transition-transform shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Provision headless namespace
              </button>
            </form>
          </div>

          {/* Current developer projects list */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 font-semibold">API Root Pipelines</h3>
            
            {projects.filter(p => p.type === 'api').length === 0 ? (
              <p className="text-xs text-slate-600 italic">No HEADLESS api projects found.</p>
            ) : (
              <div className="space-y-3">
                {projects.filter(p => p.type === 'api').map((old) => {
                  const keyCount = apiKeys.filter(k => k.project_id === old.id).length;
                  return (
                    <div 
                      key={old.id}
                      className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-3 group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-200">{old.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{keyCount} cryptographic keys</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800/40">
                        <span className="text-[9px] text-slate-400 font-mono truncate max-w-[140px]">{old.namespace_id}</span>
                        <button
                          onClick={() => {
                            onSetSelectedProjectId(old.id);
                            setCreatedRawKey(null);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-[10px] rounded-lg cursor-pointer"
                        >
                          Configure Keys
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Workspace Detail Panel for Keys & embeds */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Key list and creation column */}
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white">Project API Keys</h3>
                <button 
                  onClick={() => onSetSelectedProjectId('')}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Change Project
                </button>
              </div>

              {/* Show raw secret strictly once warning card */}
              <AnimatePresence>
                {createdRawKey && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3"
                  >
                    <div className="flex items-start gap-1.5 text-amber-400">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-relaxed font-semibold uppercase">API key generated: Displayed strictly ONCE</p>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Our REST architecture never persists raw keys in plaintext (storing SHA-256 digests instead). Make sure to copy this key immediately:
                    </p>
                    <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg flex justify-between items-center font-mono text-[10px] text-white">
                      <span className="select-all break-all">{createdRawKey}</span>
                      <button 
                        onClick={() => handleCopySecret(createdRawKey)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {copiedKeyId === 'secret_banner' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      onClick={() => setCreatedRawKey(null)}
                      className="w-full text-center text-[10px] text-amber-400 hover:underline font-mono"
                    >
                      I have copied. Close warning banner.
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Create API Key form */}
              <form onSubmit={handleCreateAPIKey} className="space-y-3">
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1 font-semibold">Generate new key pair</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={keyLabel}
                    onChange={(e) => setKeyLabel(e.target.value)}
                    placeholder="e.g. production servers"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs placeholder-slate-600 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded-xl text-xs cursor-pointer"
                  >
                    Generate
                  </button>
                </div>
              </form>

              {/* List of keys currently registered */}
              <div className="space-y-2 border-t border-slate-900 pt-4">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-semibold mb-2">Registered Keys & Prefixes</span>
                
                {projectKeys.length === 0 ? (
                  <p className="text-xs text-slate-600 italic">No keys created yet for this project.</p>
                ) : (
                  <div className="space-y-2">
                    {projectKeys.map((key) => (
                      <div key={key.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-200">{key.label}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase">Prefix: {key.key_prefix}...</p>
                        </div>
                        <button
                          onClick={() => revokeAPIKey(key.id)}
                          className="p-2 text-slate-600 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-colors cursor-pointer"
                          title="Revoke Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Embed scripts snippet & playground clients columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Embedded Javascript widget scripts generator section */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white leading-tight">Universal Chatbot HTML Script</h4>
                <p className="text-xs text-slate-500 mt-0.5">Assemble floating widgets of your documentation database into web pages.</p>
              </div>

              {/* Section 33 HTML script tags box */}
              <div className="relative">
                <pre className="p-4 bg-slate-900 border border-slate-850 rounded-xl font-mono text-[10px] text-indigo-400 overflow-x-auto leading-relaxed select-all">
                  {getEmbedSnippet(activeProj, projectKeys[0]?.key_prefix ? `${projectKeys[0].key_prefix}xxxxxxxx` : 'pk_live_xxxx')}
                </pre>
                <button
                  onClick={() => handleCopySnippet(getEmbedSnippet(activeProj, projectKeys[0]?.key_prefix ? `${projectKeys[0].key_prefix}xxxxxxxx` : 'pk_live_xxxx'))}
                  className="absolute top-3 right-3 p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-sans"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Code
                </button>
              </div>
            </div>

            {/* Test Console Playground API tool */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-semibold text-white">API REST Client Playground</h4>
              </div>
              <p className="text-xs text-slate-500">Query the stateless ingestion endpoint using your custom API Key.</p>

              {/* Endpoint form */}
              <form onSubmit={handleTestRESTEndpoint} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Select Key to trigger authorized simulation */}
                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Authorization X-API-Key</label>
                    <select
                      value={activeConsoleKey}
                      onChange={(e) => {
                        setActiveConsoleKey(e.target.value);
                        setError(null);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none"
                    >
                      <option value="">-- Choose generated Key prefix --</option>
                      {projectKeys.map(k => (
                        <option key={k.id} value={`${k.key_prefix}xxxxxxxxxxxxx`}>{k.label} ({k.key_prefix}...)</option>
                      ))}
                    </select>
                  </div>

                  {/* REST post endpoint syntax layout */}
                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Stateless REST Method</label>
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300">
                      <span className="text-emerald-400 font-bold">POST</span> /v1/chat/{activeProj.id}
                    </div>
                  </div>

                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">JSON message payload</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={apiConsoleMessage}
                      onChange={(e) => setApiConsoleMessage(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none pr-10"
                    />
                    <button
                      type="submit"
                      disabled={apiLoading}
                      className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"
                    >
                      {apiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </form>

              {/* REST return header payloads diagnostics */}
              {apiConsoleResponse && (
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between items-center text-slate-500 border-b border-slate-800 pb-2">
                    <span>Response Stream: {apiConsoleResponse.status}</span>
                    <span>Timing: {apiConsoleResponse.duration_ms}</span>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] uppercase tracking-wider mb-1">HTTP Session Headers</p>
                    <pre className="text-indigo-400">{JSON.stringify(apiConsoleResponse.headers, null, 2)}</pre>
                  </div>
                  <div className="border-t border-slate-800 pt-2">
                    <p className="text-slate-500 text-[9px] uppercase tracking-wider mb-1">JSON response body</p>
                    <pre className="text-slate-200 overflow-x-auto">{JSON.stringify(apiConsoleResponse.body, null, 2)}</pre>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
