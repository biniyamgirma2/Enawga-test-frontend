import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, UploadCloud, Play, HelpCircle, ArrowRight, CornerDownLeft, 
  RefreshCw, CheckCircle2, ChevronRight, MessageSquare, AlertCircle, Trash2, ShieldAlert
} from 'lucide-react';
import { Project, Document } from '../types/rag';

interface InstantRAGProps {
  selectedProjectId: string;
  onSetSelectedProjectId: (id: string) => void;
}

export const InstantRAG: React.FC<InstantRAGProps> = ({ selectedProjectId, onSetSelectedProjectId }) => {
  const { 
    projects, documents, chatHistory, createProject, uploadDocument, 
    simulateDocumentPipeline, sendRAGMessage, clearChatHistory, deleteProject 
  } = useApp();

  const [sessionName, setSessionName] = useState('New Ephemeral Document Session');
  const [chatMessage, setChatMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'chat'>('upload');
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  // Active Instant Project
  const activeProj = projects.find(p => p.id === selectedProjectId && p.type === 'instant');
  const projectDocs = activeProj ? documents.filter(d => d.project_id === activeProj.id) : [];
  const projectChats = activeProj ? chatHistory[activeProj.namespace_id] || [] : [];

  // Pipeline execution tracking states
  const [pipelineState, setPipelineState] = useState<{
    stage: number;
    pct: number;
    title: string;
    logs: string[];
  } | null>(null);

  const pipelineStages = [
    { title: "Initialize Job queue", log: "BullMQ worker enqueues job 'ingest_documents' with doc_id..." },
    { title: "Download from R2", log: "Retrieved raw file from Cloudflare R2 object store bucket..." },
    { title: "Regex / PDF fitz Parsing", log: "Extracted structural layout. Discovered pages..." },
    { title: "Recursive Tokenizer Chunking", log: "Built paragraph overlaps. Chunks calculated with 512-token cl100k boundaries..." },
    { title: "fastText Language identifier", log: "Running lid.176 model. Determined dialect language codes..." },
    { title: "BAAI/bge-m3 Embedding Engine", log: "L2 Normalization. Batch vectors dispatched to RunPod GPU instance (32 count)..." },
    { title: "Qdrant Namespace Ingestion", log: "Upserting vectors into cosmic collection collection name..." },
    { title: "BM25 sparse index compilation", log: "Building NLTK word tokens and storing JSON list in Redis key..." },
  ];

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) return;
    try {
      const proj = await createProject(sessionName, 'instant');
      onSetSelectedProjectId(proj.id);
      setActiveTab('upload');
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  };

  const executePipelineSteps = async (docId: string) => {
    setUploadingDocId(docId);
    let logsArray: string[] = [];
    
    for (let i = 0; i < pipelineStages.length; i++) {
      const stage = pipelineStages[i];
      logsArray = [...logsArray, `[Pipeline Run] Stage ${i + 1}/8: ${stage.title}...`, `>> ${stage.log}`];
      
      setPipelineState({
        stage: i + 1,
        pct: Math.round(((i + 1) / pipelineStages.length) * 100),
        title: stage.title,
        logs: logsArray
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Complete pipeline on backend
    await simulateDocumentPipeline(docId);
    setPipelineState(null);
    setUploadingDocId(null);
    setActiveTab('chat');
  };

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || !activeProj) return;
    const file = fileList[0];
    if (!file) return;

    try {
      const doc = await uploadDocument(activeProj.id, {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Run visual stages integration
      await executePipelineSteps(doc.id);
    } catch (err: any) {
      setError(err?.message || String(err));
      setTimeout(() => setError(null), 5000);
    }
  };

  // Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeProj) return;
    
    // Save query
    const msg = chatMessage;
    setChatMessage('');
    
    try {
      await sendRAGMessage(activeProj.namespace_id, msg);
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  };

  const otherInstantSessions = projects.filter(p => p.type === 'instant');

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Title block */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Instant Chat Service</h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Ephemeral RAG sessions. No authentication required. Files and vector collections are scrubbed automatically after 2hr inactivity.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3.5 text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!activeProj ? (
        /* Workspace generator page */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create new session form */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div>
              <h3 className="text-md font-semibold text-white">Initialize Instant Session</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload files anonymously. Create an instant testing namespace without creating a standard profile.
              </p>
            </div>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5">Session Reference Name</label>
                <input 
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g. Telebirr API Manual Review"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 active:translate-y-[1px] transition-transform cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <Play className="w-3.5 h-3.5" />
                Initialize Ephemeral Qdrant Collection
              </button>
            </form>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">Features Checklist</h4>
              <ul className="text-[11px] text-slate-400 space-y-1.5 font-sans">
                <li className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Max file size limit support: 5MB per upload.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  RAG Hybrid search with dense similarity + BM25 sparse indices.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  Full telemetry details showing Confidence rerank score, tokens, and dialect lang detection.
                </li>
              </ul>
            </div>
          </div>

          {/* List previous active anonymous sessions if any */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">Active Anonymous Sessions</h3>
            
            {otherInstantSessions.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No previous active sessions found.</p>
            ) : (
              <div className="space-y-3">
                {otherInstantSessions.map((old) => (
                  <div 
                    key={old.id} 
                    className="p-3 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 rounded-xl flex justify-between items-center group transition-colors"
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="text-[11px] font-semibold text-slate-200 truncate">{old.name}</p>
                      <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase">NS: {old.namespace_id.substr(-6)}</p>
                    </div>
                    <button
                      onClick={() => onSetSelectedProjectId(old.id)}
                      className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] rounded-lg transition-transform cursor-pointer"
                    >
                      Enter
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Workspace controls (document parser & active chat terminal) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left panel: connected documents & state monitors */}
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-white">Workspace Files</h3>
                  <p className="text-[11px] text-slate-500">Namespace: {activeProj.namespace_id}</p>
                </div>
                <button
                  onClick={() => onSetSelectedProjectId('')}
                  className="text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  Change Session
                </button>
              </div>

              {/* Upload interface */}
              {pipelineState ? (
                /* Animated pipeline stages indicators */
                <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Ingesting Document ({pipelineState.stage}/8)
                    </span>
                    <span className="font-mono">{pipelineState.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden p-[1px]">
                    <div style={{ width: `${pipelineState.pct}%` }} className="h-full bg-indigo-500 rounded-full transition-all" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Stage:</span>
                    <p className="text-xs font-semibold text-slate-200 mt-0.5">{pipelineState.title}</p>
                  </div>
                  
                  {/* Miniature Console logs */}
                  <div className="h-28 overflow-y-auto bg-slate-900 border border-slate-800 p-2 rounded-lg font-mono text-[9px] text-slate-400 space-y-1">
                    {pipelineState.logs.map((log, idx) => (
                      <p key={idx} className={log.startsWith('>>') ? 'text-indigo-300' : 'text-slate-500'}>{log}</p>
                    ))}
                  </div>
                </div>
              ) : (
                /* Standard upload trigger area */
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                    dragActive 
                      ? 'border-indigo-500 bg-indigo-500/5' 
                      : 'border-slate-800 bg-slate-900/30 hover:bg-slate-900/50'
                  }`}
                >
                  <label className="cursor-pointer block">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.md,.mdx,.txt,.docx"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs">Drag & drop files or <span className="text-indigo-400 font-semibold underline">browse</span></p>
                    <p className="text-[9px] text-slate-500 mt-1 font-mono">PDF, DOCX, TXT, MD up to 5MB</p>
                  </label>
                </div>
              )}

              {/* Configured Files list inside session */}
              <div className="space-y-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Indexed Files</span>
                
                {projectDocs.length === 0 ? (
                  <p className="text-xs text-slate-600 italic">No files parsed for this session yet.</p>
                ) : (
                  <div className="space-y-2">
                    {projectDocs.map((doc) => (
                      <div 
                        key={doc.id}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            <p className="text-xs font-semibold text-slate-200 truncate hover:text-indigo-400" title={doc.filename}>
                              {doc.filename}
                            </p>
                          </div>
                          {doc.status === 'done' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                          <span>{(doc.file_size / (1024 * 1024)).toFixed(2)} MB / {doc.chunk_count || 0} chunks</span>
                          <span className="capitalize">{doc.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Quick ephemeral actions */}
            <button
              onClick={() => deleteProject(activeProj.id)}
              className="w-full py-2 bg-red-950/20 hover:bg-red-900/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Scrub Ephemeral Session Collection
            </button>
          </div>

          {/* Right panel: Active chat rooms querying core */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl h-[620px] flex flex-col overflow-hidden relative">
            
            {/* Thread top banner */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1 px-2.5 bg-emerald-500/15 border border-emerald-500/20 rounded-md text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Active Pipe
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{activeProj.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Qdrant Namespace: {activeProj.namespace_id}</p>
                </div>
              </div>
              <button
                onClick={() => clearChatHistory(activeProj.namespace_id)}
                className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
              >
                Clear History
              </button>
            </div>

            {/* Chats viewport content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {projectChats.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center max-w-sm mx-auto space-y-4">
                  <div className="p-4 bg-slate-900 rounded-full border border-slate-800/80">
                    <MessageSquare className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Ask your manual document</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Our streaming RAG query pipeline operates on the combined Dense Vector collection and Redis BM25 Sparse Index.
                    </p>
                  </div>
                  
                  {/* Seed suggestions quick bubbles */}
                  {projectDocs.length > 0 && (
                    <div className="space-y-1.5 w-full pt-4">
                      <p className="text-[9px] uppercase tracking-wider text-slate-600 font-mono">Sample Queries</p>
                      <button 
                        onClick={() => { setChatMessage('How does the Telebirr payment integration work?'); }}
                        className="w-full text-left p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white text-[10px] truncate block"
                      >
                        "How does the Telebirr payment integration work?"
                      </button>
                      <button 
                        onClick={() => { setChatMessage('What chunk size and overlap values are used?'); }}
                        className="w-full text-left p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white text-[10px] truncate block"
                      >
                        "What chunk size and overlap values are used?"
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {projectChats.map((chat) => {
                    const isUser = chat.role === 'user';
                    return (
                      <div 
                        key={chat.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-xs leading-relaxed ${
                          isUser 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                        }`}>
                          <p className="whitespace-pre-line">{chat.content}</p>
                          
                          {/* Rich metadata metadata logs for AI query updates */}
                          {!isUser && (
                            <div className="flex flex-wrap items-center gap-3 pt-2 mt-2 border-t border-slate-800/60 font-mono text-[9px] text-slate-500">
                              <span className="flex items-center gap-1">
                                Match Score: <strong className="text-emerald-400">{chat.retrieval_score}</strong>
                              </span>
                              <span>•</span>
                              <span className="uppercase">Lang: {chat.detected_language}</span>
                              <span>•</span>
                              <span>Tokens: {chat.tokens_used} logs</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input send message toolbar */}
            <form onSubmit={handleQuery} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2 flex-shrink-0">
              <input 
                type="text"
                disabled={projectDocs.filter(d => d.status === 'done').length === 0}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={projectDocs.filter(d => d.status === 'done').length === 0 ? "Upload and parse a document to start chatting..." : "Query your RAG collection index..."}
                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={projectDocs.filter(d => d.status === 'done').length === 0}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
};
