import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  Bot, Layers, ArrowUpRight, Copy, Check, Settings2, BarChart3, 
  Sparkles, ShieldAlert, FileText, Send, Lock, Eye, AlertCircle, RefreshCw
} from 'lucide-react';
import { HostedBot } from '../types/rag';

interface HostedBotsProps {
  onNavigateTab: (tab: string) => void;
  selectedProjectId: string;
  onSetSelectedProjectId: (id: string) => void;
}

export const HostedBots: React.FC<HostedBotsProps> = ({ onNavigateTab, selectedProjectId, onSetSelectedProjectId }) => {
  const { 
    currentUser, projects, documents, hostedBots, createHostedBot, 
    updateHostedBot, deleteProject, sendRAGMessage, chatHistory, usageStats 
  } = useApp();

  const [botName, setBotName] = useState('');
  const [welcomeMsg, setWelcomeMsg] = useState('Hi! How can I assist you with our customer services today?');
  const [themeColor, setThemeColor] = useState('#4F46E5');
  const [password, setPassword] = useState('');
  
  const [copiedBotId, setCopiedBotId] = useState<string | null>(null);
  const [activeBotTab, setActiveBotTab] = useState<'preview' | 'settings' | 'analytics'>('preview');
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const colors = [
    { value: '#4F46E5', name: 'Indigo' },
    { value: '#10B981', name: 'Emerald' },
    { value: '#EF4444', name: 'Ruby Red' },
    { value: '#8B5CF6', name: 'Violet' },
    { value: '#06B6D4', name: 'Aqua' },
    { value: '#F59E0B', name: 'Amber' },
  ];

  // Plan level check: Free plan cannot access Hosted Bots
  const isFreePlan = currentUser?.plan === 'free';

  // Active Bot
  const activeBot = hostedBots.find(b => b.id === selectedProjectId || b.project_id === selectedProjectId);
  const activeProject = activeBot ? projects.find(p => p.id === activeBot.project_id) : null;
  const botChats = activeBot ? chatHistory[activeBot.slug] || [] : [];
  const currentDocs = activeProject ? documents.filter(d => d.project_id === activeProject.id) : [];

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName.trim()) return;
    try {
      const resp = await createHostedBot(botName, welcomeMsg, themeColor);
      // If password has code, hashing
      if (password) {
        await updateHostedBot(resp.id, { password_hash: 'bcrypt_mock_250ms_' + password });
      }
      onSetSelectedProjectId(resp.id);
      setBotName('');
      setPassword('');
      setActiveBotTab('preview');
    } catch (err: any) {
      setError(err?.message || String(err));
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleCopyLink = (bot: HostedBot) => {
    navigator.clipboard.writeText(bot.public_url);
    setCopiedBotId(bot.id);
    setTimeout(() => setCopiedBotId(null), 2000);
  };

  const handleBotChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeBot) return;
    const msg = chatInput;
    setChatInput('');
    try {
      await sendRAGMessage(activeBot.slug, msg);
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  };

  if (isFreePlan) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-10 max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex justify-center p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
          <Bot className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white">Unlock Live Customer Chatbots</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Deployment of permanent customer-facing chatbot widgets, visual color customizations, password-protected layers, and automated query evaluations are reserved for **Pro and Enterprise tiers**.
          </p>
        </div>

        {/* Feature grid limit table for billing redirects */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-left space-y-2 max-w-sm mx-auto font-mono text-[10px] text-slate-300">
          <div className="flex justify-between">
            <span>Free Tier Support:</span>
            <span className="text-red-400 font-semibold uppercase">0 Active Bots</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800/40">
            <span>Pro Tier (1,100 ETB/mo):</span>
            <span className="text-emerald-400 font-semibold uppercase">Up to 3 Bots</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800/40">
            <span>Enterprise (4,500 ETB/mo):</span>
            <span className="text-indigo-400 font-semibold uppercase">Unlimited Bots</span>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('billing')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs active:translate-y-[1px] transition-transform cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          Upgrade Account via Telebirr
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Bot View Manager split */}
      {!activeBot ? (
        /* Creator list overview */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create bot form panel */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Deploy Automated Chatbot</h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure beautiful standalone AI assistance embeds loaded with RAG embeddings.
              </p>
            </div>

            <form onSubmit={handleCreateBot} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">Bot Name</label>
                  <input 
                    type="text"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    placeholder="e.g. Bole Airport Assistant"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">Private Lock Passcode (Optional)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Blank for open public URL"
                      className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">Bot Custom Greeting message</label>
                <textarea 
                  value={welcomeMsg}
                  onChange={(e) => setWelcomeMsg(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                />
              </div>

              {/* Color selections widget */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Primary Custom Theme Color</label>
                <div className="flex gap-3 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setThemeColor(c.value)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border flex items-center gap-1 text-white cursor-pointer transition-all ${
                        themeColor === c.value 
                          ? 'border-white scale-105 shadow-md shadow-slate-150/10' 
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                      style={{ backgroundColor: c.value }}
                    >
                      {themeColor === c.value && <Check className="w-3 h-3" />}
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs active:translate-y-[1px] transition-transform shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Provision Hosted Qdrant Bot & Generate Slug URL
              </button>
            </form>
          </div>

          {/* Connected Bots Index list */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">Your Active Bots</h3>
            
            {hostedBots.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No chatbots created under your organization.</p>
            ) : (
              <div className="space-y-3">
                {hostedBots.map((bot) => (
                  <div 
                    key={bot.id}
                    className="p-4 bg-slate-900 border border-slate-850/65 rounded-xl space-y-4 group hover:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bot.theme_color }} />
                        <h4 className="text-xs font-semibold text-white">{bot.name}</h4>
                      </div>
                      {bot.password_hash && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                    </div>

                    <p className="text-[11px] text-slate-400 truncate leading-relaxed">
                      {bot.welcome_message}
                    </p>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/50 justify-between">
                      <button
                        onClick={() => handleCopyLink(bot)}
                        className="p-1 px-2.5 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] rounded-lg hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedBotId === bot.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy URL
                      </button>
                      <button
                        onClick={() => {
                          onSetSelectedProjectId(bot.id);
                          setActiveBotTab('preview');
                        }}
                        className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] rounded-lg transition-transform cursor-pointer"
                      >
                        Enter Console
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Workspace Detail Console chat preview / edit settings / analytics review */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left info column */}
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeBot.theme_color }} />
                  <h3 className="text-sm font-semibold text-white">{activeBot.name}</h3>
                </div>
                <button 
                  onClick={() => onSetSelectedProjectId('')}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Bots list
                </button>
              </div>

              {/* Console internal tabs buttons links */}
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl">
                {[
                  { id: 'preview', label: 'Preview UI', icon: Eye },
                  { id: 'settings', label: 'Bot Config', icon: Settings2 },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveBotTab(item.id as any)}
                      className={`py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        activeBotTab === item.id 
                          ? 'bg-slate-950 text-white' 
                          : 'text-slate-500 hover:text-white hover:bg-slate-950/40'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Bot documents check list */}
              <div className="space-y-2 border-t border-slate-900 pt-4">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Linked Docs</span>
                
                {currentDocs.length === 0 ? (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-[10px] text-amber-400 flex items-start gap-1.5 leading-relaxed">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <p>No documents uploaded to this bot pipeline workspace yet. Ingest a document in the Monitor page under this project ID.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {currentDocs.map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                        <span className="truncate max-w-[150px] font-semibold text-slate-300">{doc.filename}</span>
                        <span className="text-[9px] font-mono text-slate-500">{doc.chunk_count || 0} chunks</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Public Endpoint sharing portal info */}
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl text-xs space-y-4">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Public Shareable Link</span>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-400 truncate select-all">
                {activeBot.public_url}
              </div>
              <button 
                onClick={() => handleCopyLink(activeBot)}
                className="w-full py-2 bg-slate-900 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-400 font-semibold rounded-xl text-xs flex justify-center items-center gap-1.5 transition-all cursor-pointer"
              >
                Copy Public URL Endpoint
              </button>
            </div>
          </div>

          {/* Right tab contents viewport */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeBotTab === 'preview' && (
              /* High fidelity chat bubble mock reflecting theme color */
              <div className="bg-slate-950 border border-slate-800 rounded-2xl h-[560px] flex flex-col overflow-hidden relative">
                <div 
                  className="p-4 flex items-center justify-between text-white flex-shrink-0"
                  style={{ backgroundColor: activeBot.theme_color }}
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-white" />
                    <div>
                      <h4 className="text-xs font-bold">{activeBot.name}</h4>
                      <p className="text-[9px] text-white/70 font-mono tracking-wider">Live Embed Preview Mode</p>
                    </div>
                  </div>
                  {activeBot.password_hash && (
                    <span className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono tracking-wider flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Blocked
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Default server greeting bubble */}
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 rounded-bl-none max-w-[85%]">
                      {activeBot.welcome_message}
                    </div>
                  </div>

                  {botChats.map((chat) => {
                    const isUser = chat.role === 'user';
                    return (
                      <div key={chat.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                            isUser 
                              ? 'text-white rounded-br-none font-medium' 
                              : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                          }`}
                          style={isUser ? { backgroundColor: activeBot.theme_color } : {}}
                        >
                          <p>{chat.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sender toolbar */}
                <form onSubmit={handleBotChat} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2 flex-shrink-0">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Enter query to chat anonymously as client user..."
                    className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="p-2 text-white rounded-xl active:translate-y-[1px] transition-transform cursor-pointer"
                    style={{ backgroundColor: activeBot.theme_color }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {activeBotTab === 'settings' && (
              /* Settings Edit Panel */
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-white">Bot Interface configurations</h4>
                  <p className="text-xs text-slate-500 mt-1">Saves layout details instantly to Redis settings mappings.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">Bot Display name</label>
                    <input 
                      type="text"
                      value={activeBot.name}
                      onChange={(e) => updateHostedBot(activeBot.id, { name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1 text-slate-400">Welcome Message</label>
                    <textarea 
                      value={activeBot.welcome_message}
                      onChange={(e) => updateHostedBot(activeBot.id, { welcome_message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Adjust Custom Theme Color</label>
                    <div className="flex gap-3">
                      {colors.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => updateHostedBot(activeBot.id, { theme_color: c.value })}
                          className={`w-8 h-8 rounded-full border border-slate-850 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center`}
                          style={{ backgroundColor: c.value }}
                        >
                          {activeBot.theme_color === c.value && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeBotTab === 'analytics' && (
              /* Bot-level Analytics logs & low-confidence diagnostics as specified in doc page 31 */
              <div className="space-y-6">
                
                {/* Visual metrics cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Messages Served</p>
                    <p className="text-xl font-bold mt-1 text-white">356 logs</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Avg Retrieval Conf.</p>
                    <p className="text-xl font-bold mt-1 text-emerald-400">89.4%</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Unique Sessions</p>
                    <p className="text-xl font-bold mt-1 text-indigo-400">42 distinct</p>
                  </div>
                </div>

                {/* Section 8 Low confidence alerts: flagged for doc improvement */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">Low Confidence Flagged Queries (&lt;0.35 Score)</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Discovered questions with missing reference knowledge. Ingest matched files to resolve.</p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { query: "How do I upgrade the Telebirr limit if payment states pending for 10 minutes?", score: 0.18, suggestion: "Missing details about Ethio Telecom payment timeout status resolutions." },
                      { query: "Can I connect GitLab repositories to push RAG updates automatically?", score: 0.22, suggestion: "GitHub connector exists, GitLab API webhook manual is unindexed." }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center font-mono">
                          <span className="font-semibold text-rose-400">Score match: {item.score}</span>
                          <span className="text-[10px] text-slate-500">Flagged: Auto-sync alerts</span>
                        </div>
                        <p className="text-slate-200">"{item.query}"</p>
                        <p className="text-[11px] text-slate-400 italic font-serif leading-relaxed pl-3 border-l-2 border-indigo-500/60 pt-1">
                          Improvement recommendation: {item.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
