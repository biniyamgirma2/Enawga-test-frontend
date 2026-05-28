import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Project, Document, APIKey, HostedBot, GitHubRepo, 
  CommitEvent, ChatMessage, UsageStats, BillingTransaction, PlanType, ProjectType 
} from '../types/rag';

interface AppContextType {
  currentUser: User | null;
  projects: Project[];
  documents: Document[];
  apiKeys: APIKey[];
  hostedBots: HostedBot[];
  githubRepos: GitHubRepo[];
  commitEvents: CommitEvent[];
  chatHistory: Record<string, ChatMessage[]>; // keyed by namespace_id or session_id
  usageStats: UsageStats;
  billingTransactions: BillingTransaction[];
  users: User[];
  deleteUser: (userId: string) => void;
  updateUserPlan: (userId: string, plan: PlanType) => void;
  
  // Auth Functions
  register: (name: string, email: string, psw: string) => Promise<{ status: 'verify_needed'; userId: string; email: string }>;
  verifyEmail: (otp: string) => Promise<User>;
  resendOTP: () => Promise<void>;
  login: (email: string, psw: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone: string | null, avatarUrl: string | null) => Promise<void>;
  simulateOAuth: () => Promise<User>;
  
  // Project / Document Functions
  createProject: (name: string, type: ProjectType) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  uploadDocument: (projectId: string, file: { name: string; size: number; type: string }) => Promise<Document>;
  simulateDocumentPipeline: (docId: string) => Promise<void>;
  
  // Chatbot Settings
  createHostedBot: (name: string, welcome: string, color: string) => Promise<HostedBot>;
  updateHostedBot: (botId: string, updates: Partial<HostedBot>) => Promise<HostedBot>;
  
  // Developer Keys
  createAPIKey: (projectId: string, label: string) => Promise<APIKey>;
  revokeAPIKey: (keyId: string) => Promise<void>;
  
  // GitHub Functions
  connectGitHub: (projectId: string, repoUrl: string, token: string, mode: 'webhook' | 'polling') => Promise<GitHubRepo>;
  disconnectGitHub: (repoId: string) => Promise<void>;
  simulateGitHubPushCommit: (repoId: string, message: string, changedFiles: string[]) => Promise<CommitEvent>;
  triggerManualResync: (repoId: string) => Promise<void>;
  
  // Telebirr Billing Flow
  initiateTelebirrPayment: (plan: 'pro' | 'enterprise') => Promise<{ to_pay_url: string; out_trade_no: string }>;
  simulateTelebirrCallback: (outTradeNo: string, success: boolean) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  
  // RAG Chat Core
  sendRAGMessage: (namespaceId: string, userMessage: string, customApiKey?: string) => Promise<void>;
  clearChatHistory: (namespaceId: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Seeding values
const DEFAULT_USER: User = {
  id: 'usr_biniyam',
  email: 'biniyamgirmamengesha2@gmail.com',
  name: 'Biniyam Girmay',
  plan: 'free',
  telebirr_phone: '0912345678',
  is_verified: true,
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  created_at: new Date('2026-05-10T12:00:00Z').toISOString(),
};

const SEED_PROJECTS: Project[] = [
  {
    id: 'proj_instant_0',
    user_id: 'usr_biniyam',
    name: 'Quick Docs Evaluation',
    type: 'instant',
    namespace_id: 'instant-eval_9a2f',
    status: 'ready',
    expires_at: new Date('2026-05-28T22:00:00Z').toISOString(),
    created_at: new Date('2026-05-28T10:00:00Z').toISOString(),
  },
  {
    id: 'proj_hosted_1',
    user_id: 'usr_biniyam',
    name: 'Addis Travel Bot',
    type: 'hosted',
    namespace_id: 'hosted-travel_be42',
    status: 'ready',
    expires_at: null,
    created_at: new Date('2026-05-20T08:30:00Z').toISOString(),
  },
  {
    id: 'proj_api_2',
    user_id: 'usr_biniyam',
    name: 'Developer Core Docs',
    type: 'api',
    namespace_id: 'api-core_98c1',
    status: 'ready',
    expires_at: null,
    created_at: new Date('2026-05-18T14:15:00Z').toISOString(),
  }
];

const SEED_DOCUMENTS: Document[] = [
  {
    id: 'doc_1',
    project_id: 'proj_instant_0',
    filename: 'Telebirr_API_Manual.pdf',
    storage_path: 'usr_biniyam/proj_instant_0/doc1_telebirr.pdf',
    file_size: 4210500, // ~4.0MB
    mime_type: 'application/pdf',
    chunk_count: 32,
    status: 'done',
    error_message: null,
    created_at: new Date('2026-05-28T10:05:00Z').toISOString(),
  },
  {
    id: 'doc_2',
    project_id: 'proj_hosted_1',
    filename: 'Addis_Ababa_Official_Guide_2026.md',
    storage_path: 'usr_biniyam/proj_hosted_1/doc2_guide.md',
    file_size: 154200, // ~150KB
    mime_type: 'text/markdown',
    chunk_count: 14,
    status: 'done',
    error_message: null,
    created_at: new Date('2026-05-20T08:45:00Z').toISOString(),
  },
  {
    id: 'doc_3',
    project_id: 'proj_api_2',
    filename: 'Backend_Architecture.md',
    storage_path: 'usr_biniyam/proj_api_2/doc3_backend.md',
    file_size: 89000, 
    mime_type: 'text/markdown',
    chunk_count: 8,
    status: 'done',
    error_message: null,
    created_at: new Date('2026-05-18T14:20:00Z').toISOString(),
  }
];

const SEED_BOTS: HostedBot[] = [
  {
    id: 'bot_addis_travel',
    project_id: 'proj_hosted_1',
    slug: 'addis-travel-bot-a5b6',
    public_url: 'https://ais-dev-hbm7zlxmnjleyv3fpntw62.run.app/bot/addis-travel-bot-a5b6',
    name: 'Addis Ababa Travel Hub',
    welcome_message: 'Selam! Welcome to the Addis Ababa travel support bot. Ask me anything about hotels, food, cultural centers, or Telebirr charges in the city!',
    theme_color: '#4F46E5', // Indigo
    logo_url: null,
    password_hash: null, // Open publicly
    is_active: true,
    created_at: new Date('2026-05-20T08:35:00Z').toISOString(),
  }
];

const SEED_KEYS: APIKey[] = [
  {
    id: 'key_1',
    project_id: 'proj_api_2',
    key_hash: '2aa4b...88c',
    key_prefix: 'sk_live_de',
    label: 'production',
    is_public: false,
    last_used_at: new Date('2026-05-28T09:40:00Z').toISOString(),
    created_at: new Date('2026-05-18T14:30:00Z').toISOString(),
  },
  {
    id: 'key_2',
    project_id: 'proj_api_2',
    key_hash: '90cf1...fd3',
    key_prefix: 'pk_live_eb',
    label: 'Public JS Embed Widget',
    is_public: true,
    last_used_at: new Date('2026-05-28T11:02:00Z').toISOString(),
    created_at: new Date('2026-05-18T14:35:00Z').toISOString(),
  }
];

const SEED_REPOS: GitHubRepo[] = [
  {
    id: 'repo_1',
    project_id: 'proj_api_2',
    repo_url: 'https://github.com/biniyamgm/rag-support-platform',
    owner: 'biniyamgm',
    repo_name: 'rag-support-platform',
    default_branch: 'main',
    tracking_mode: 'webhook',
    poll_interval: 1800,
    last_commit_sha: 'd6b7e8ff902a781b0f1cedf63665bc7f47496cce',
    notification_webhook_url: 'https://myservice.com/api/git-notify',
    created_at: new Date('2026-05-19T10:00:00Z').toISOString(),
  }
];

const SEED_EVENTS: CommitEvent[] = [
  {
    id: 'evt_1',
    repo_id: 'repo_1',
    commit_sha: 'd6b7e8ff',
    commit_message: 'doc: Update Telebirr notification payload layout and limits info',
    event_type: 'doc_updated',
    files_changed: ['docs/telebirr-guide.md', 'README.md'],
    doc_files_updated: ['docs/telebirr-guide.md'],
    notification_sent: false,
    processed_at: new Date('2026-05-25T14:00:00Z').toISOString(),
  },
  {
    id: 'evt_2',
    repo_id: 'repo_1',
    commit_sha: '9f8e7d6c',
    commit_message: 'feat: Optimize Redis cache storage for BM25 tokenize step',
    event_type: 'code_changed',
    files_changed: ['app/core/rag/bm25.py', 'app/config.py'],
    doc_files_updated: [],
    notification_sent: true, // Developers received email warning to update documentation since codebase logic shifted
    processed_at: new Date('2026-05-27T16:45:00Z').toISOString(),
  }
];

const SEED_CHATS: Record<string, ChatMessage[]> = {
  'instant-eval_9a2f': [
    {
      id: 'msg_i1',
      sessionId: 'sess_eval_1',
      role: 'user',
      content: 'What the hell are the 12 required parameters for Telebirr payment integration?',
      created_at: new Date('2026-05-28T10:45:00Z').toISOString(),
    },
    {
      id: 'msg_i2',
      sessionId: 'sess_eval_1',
      role: 'assistant',
      content: 'The Telebirr payment request requires exactly **12 parameters** which must be calculated on your backend to secure the paywall:\n\n1. **appId**: Unique merchant identifier provided by Ethio Telecom.\n2. **appKey**: Backend secret key (used for SHA-256 signatures, kept private).\n3. **shortCode**: Merchant short code (assigned at registration).\n4. **nonce**: Unique random 32-character string per transaction (`uuid4().hex`).\n5. **timestamp**: Unix epoch timestamp in milliseconds (must match Telebirr clock within +/- 60s).\n6. **outTradeNo**: Your unique order/transaction ID (UUID4 recommended).\n7. **totalAmount**: Amount to charge in ETB (Ethiopian Birr), passed as a string with 2 decimal places (e.g., `"1100.00"`).\n8. **subject**: Payment description (e.g., `"RAG Platform Pro Plan - Monthly"`, no special symbols).\n9. **timeoutExpress**: Lifespan of checkout page in minutes. Typically `"30"` (order cancels if unpaid after 30 mins).\n10. **notifyUrl**: Your secure, asynchronous backend endpoint that Telebirr POSTs completion results to.\n11. **returnUrl**: Client redirection landing page once H5 transaction is completed.\n12. **receiveName**: The exact registered business name with Ethio Telecom.',
      detected_language: 'en',
      retrieval_score: 0.94,
      tokens_used: 312,
      created_at: new Date('2026-05-28T10:45:05Z').toISOString(),
    }
  ],
  'hosted-travel_be42': [
    {
      id: 'msg_h1',
      sessionId: 'sess_bot_1',
      role: 'user',
      content: 'Hello, is Addis Ababa expensive for digital nomads?',
      created_at: new Date('2026-05-25T11:00:00Z').toISOString(),
    },
    {
      id: 'msg_h2',
      sessionId: 'sess_bot_1',
      role: 'assistant',
      content: 'Selam! Addis Ababa is generally very affordable for digital nomads. Main accommodation in hubs like Bole can range from 800 to 2,000 ETB per night. Meals are extremely inexpensive—local dishes like Injera run between 150 to 300 ETB. The most convenient payment mechanism is **Telebirr**, which acts as the default digital money across almost all supermarkets, cafes, and taxis.',
      detected_language: 'en',
      retrieval_score: 0.88,
      tokens_used: 195,
      created_at: new Date('2026-05-25T11:00:03Z').toISOString(),
    }
  ]
};

const SEED_TRANSACTIONS: BillingTransaction[] = [
  {
    id: 'tx_seed_1',
    plan: 'pro',
    amount_etb: 1100.00,
    out_trade_no: '87ef8d6cc8f94d938f323719b487d60a',
    telebirr_trade_no: 'FT260520-8356-9921',
    status: 'active',
    created_at: new Date('2026-05-20T08:35:00Z').toISOString(),
    expires_at: new Date('2026-06-19T08:35:00Z').toISOString(), // Active subscription
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rag_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER; // Default seed user first
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('rag_all_users');
    if (saved) return JSON.parse(saved);
    return [
      DEFAULT_USER,
      {
        id: 'usr_abel',
        email: 'abel@enawga.com',
        name: 'Abel Kebede',
        plan: 'pro',
        telebirr_phone: '0911223344',
        is_verified: true,
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        created_at: new Date('2026-05-18T10:00:00Z').toISOString(),
      },
      {
        id: 'usr_tigist',
        email: 'tigist@cyberethiopia.com',
        name: 'Tigist Shiferaw',
        plan: 'enterprise',
        telebirr_phone: '0922889900',
        is_verified: true,
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        created_at: new Date('2026-04-12T09:15:00Z').toISOString(),
      }
    ];
  });
  
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('rag_projects');
    return saved ? JSON.parse(saved) : SEED_PROJECTS;
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('rag_documents');
    return saved ? JSON.parse(saved) : SEED_DOCUMENTS;
  });

  const [apiKeys, setApiKeys] = useState<APIKey[]>(() => {
    const saved = localStorage.getItem('rag_keys');
    return saved ? JSON.parse(saved) : SEED_KEYS;
  });

  const [hostedBots, setHostedBots] = useState<HostedBot[]>(() => {
    const saved = localStorage.getItem('rag_bots');
    return saved ? JSON.parse(saved) : SEED_BOTS;
  });

  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>(() => {
    const saved = localStorage.getItem('rag_repos');
    return saved ? JSON.parse(saved) : SEED_REPOS;
  });

  const [commitEvents, setCommitEvents] = useState<CommitEvent[]>(() => {
    const saved = localStorage.getItem('rag_events');
    return saved ? JSON.parse(saved) : SEED_EVENTS;
  });

  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('rag_chats');
    return saved ? JSON.parse(saved) : SEED_CHATS;
  });

  const [billingTransactions, setBillingTransactions] = useState<BillingTransaction[]>(() => {
    const saved = localStorage.getItem('rag_billing');
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  // State values for verification flow simulation
  const [pendingRegisterUser, setPendingRegisterUser] = useState<{ id: string; email: string; name: string; psw: string } | null>(null);

  // Sync back to local storage on changes
  useEffect(() => {
    localStorage.setItem('rag_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('rag_all_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('rag_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('rag_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('rag_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('rag_bots', JSON.stringify(hostedBots));
  }, [hostedBots]);

  useEffect(() => {
    localStorage.setItem('rag_repos', JSON.stringify(githubRepos));
  }, [githubRepos]);

  useEffect(() => {
    localStorage.setItem('rag_events', JSON.stringify(commitEvents));
  }, [commitEvents]);

  useEffect(() => {
    localStorage.setItem('rag_chats', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('rag_billing', JSON.stringify(billingTransactions));
  }, [billingTransactions]);

  // Derived Limits and Stats based on user plan
  const usageStats: UsageStats = React.useMemo(() => {
    const currentPlan = currentUser?.plan || 'free';
    
    // Limits
    const limitTokens = currentPlan === 'free' ? 100000 : currentPlan === 'pro' ? 5000000 : 50000000;
    const limitBots = currentPlan === 'free' ? 0 : currentPlan === 'pro' ? 3 : 999;
    const limitProjects = currentPlan === 'free' ? 1 : currentPlan === 'pro' ? 5 : 999;
    const limitRepos = currentPlan === 'free' ? 0 : currentPlan === 'pro' ? 3 : 999;
    const limitDocSizeMb = currentPlan === 'free' ? 5 : currentPlan === 'pro' ? 50 : 500;
    
    // Current usage calculations
    // Sum total tokens used in chat history currently
    let monthly_tokens_used = 0;
    (Object.values(chatHistory) as ChatMessage[][]).forEach(msgs => {
      msgs.forEach(m => {
        if (m.tokens_used) {
          monthly_tokens_used += m.tokens_used;
        }
      });
    });

    // In case no token logs exist yet, set a small seed baseline so it looks active
    if (monthly_tokens_used === 0) {
      monthly_tokens_used = currentPlan === 'free' ? 18450 : currentPlan === 'pro' ? 342150 : 4210500;
    }

    let monthly_queries = 0;
    (Object.values(chatHistory) as ChatMessage[][]).forEach(msgs => {
      monthly_queries += msgs.filter(m => m.role === 'user').length;
    });
    if (monthly_queries === 0) {
      monthly_queries = 14;
    }

    return {
      monthly_tokens_used,
      monthly_queries,
      limit_tokens: limitTokens,
      limit_bots: limitBots,
      limit_projects: limitProjects,
      limit_repos: limitRepos,
      limit_doc_size_mb: limitDocSizeMb,
    };
  }, [currentUser, chatHistory]);

  // ================= Auth Methods ===================

  const register = async (name: string, email: string, psw: string) => {
    // Check duplicates
    const mockExist = email.toLowerCase() === DEFAULT_USER.email.toLowerCase();
    if (mockExist) {
      throw new Error('Conflict: A register query for this email already exists (409 Conflict).');
    }

    const userId = 'usr_' + Math.random().toString(36).substr(2, 9);
    setPendingRegisterUser({ id: userId, email, name, psw });
    
    return {
      status: 'verify_needed' as const,
      userId,
      email
    };
  };

  const verifyEmail = async (otp: string) => {
    if (otp !== '123456' && otp !== '654321') {
      throw new Error('Invalid OTP activation code (400 Bad Request / Match against Redis failed).');
    }

    if (!pendingRegisterUser) {
      throw new Error('No pending registration sessions found.');
    }

    const newUser: User = {
      id: pendingRegisterUser.id,
      email: pendingRegisterUser.email,
      name: pendingRegisterUser.name,
      plan: 'free',
      telebirr_phone: null,
      is_verified: true,
      avatar_url: null,
      created_at: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setPendingRegisterUser(null);
    return newUser;
  };

  const resendOTP = async () => {
    // Simulate API limit check: rate-limited to 3/hour
    console.log('Verification OTP re-sent successfully to pending user email via Resend API.');
  };

  const login = async (email: string, psw: string) => {
    if (!email || !psw) {
      throw new Error('Missing input credentials.');
    }

    const lowerEmail = email.toLowerCase();
    if (lowerEmail === 'admin@enawga.com') {
      if (psw !== 'admin123') {
        throw new Error('Authentication failure: Incorrect password for administrator (401 Unauthorized).');
      }
      const adminUser: User = {
        id: 'usr_admin',
        email: 'admin@enawga.com',
        name: 'System Administrator',
        plan: 'enterprise',
        telebirr_phone: '0901234567',
        is_verified: true,
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        created_at: new Date('2026-01-01T00:00:00Z').toISOString()
      };
      
      setUsers(prev => {
        if (!prev.find(u => u.email.toLowerCase() === 'admin@enawga.com')) {
          return [...prev, adminUser];
        }
        return prev;
      });

      setCurrentUser(adminUser);
      return adminUser;
    }

    // Support automatic testing login
    if (email.includes('@') && psw.length >= 6) {
      const user: User = {
        id: email === DEFAULT_USER.email ? DEFAULT_USER.id : 'usr_' + Math.random().toString(36).substr(2, 9),
        email,
        name: email === DEFAULT_USER.email ? DEFAULT_USER.name : email.split('@')[0],
        plan: email === DEFAULT_USER.email ? currentUser?.plan || 'free' : 'free',
        telebirr_phone: email === DEFAULT_USER.email ? currentUser?.telebirr_phone || '0912345678' : null,
        is_verified: true,
        avatar_url: email === DEFAULT_USER.email ? currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' : null,
        created_at: new Date().toISOString()
      };

      setUsers(prev => {
        if (!prev.find(u => u.id === user.id || u.email.toLowerCase() === email.toLowerCase())) {
          return [...prev, user];
        }
        return prev;
      });

      setCurrentUser(user);
      return user;
    }
    throw new Error('Authentication failure: Email/Password match mismatch (401 Unauthorized).');
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('rag_user');
  };

  const updateProfile = async (name: string, phone: string | null, avatarUrl: string | null) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      name,
      telebirr_phone: phone,
      avatar_url: avatarUrl
    };
    setCurrentUser(updated);
  };

  const simulateOAuth = async () => {
    const googleUser: User = {
      id: 'usr_g_' + Math.random().toString(36).substr(2, 9),
      email: 'user.google@gmail.com',
      name: 'Google Federated Identity',
      plan: 'free',
      telebirr_phone: null,
      is_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      created_at: new Date().toISOString()
    };
    setUsers(prev => {
      if (!prev.find(u => u.email === googleUser.email)) {
        return [...prev, googleUser];
      }
      return prev;
    });
    setCurrentUser(googleUser);
    return googleUser;
  };

  // ================= Project & Document Methods ===================

  const createProject = async (name: string, type: ProjectType) => {
    if (!currentUser) throw new Error('Unauthenticated user (401).');
    
    // Plan limits verify
    const existingOfThisType = projects.filter(p => p.type === type);
    if (type === 'hosted' && existingOfThisType.length >= usageStats.limit_bots) {
      throw new Error(`Plan limit reached: Hosted bots capped at ${usageStats.limit_bots} on your ${currentUser.plan} plan.`);
    }
    if (type === 'api' && existingOfThisType.length >= usageStats.limit_projects) {
      throw new Error(`Plan limit reached: API projects capped at ${usageStats.limit_projects} on your ${currentUser.plan} plan.`);
    }

    const id = 'proj_' + Math.random().toString(36).substr(2, 9);
    const suffix = Math.random().toString(36).substr(2, 4);
    const namespace_id = `${type}-${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${suffix}`;
    
    const newProj: Project = {
      id,
      user_id: currentUser.id,
      name,
      type,
      namespace_id,
      status: 'pending',
      expires_at: type === 'instant' ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : null, // 2h TTL
      created_at: new Date().toISOString()
    };

    setProjects(prev => [...prev, newProj]);
    return newProj;
  };

  const deleteProject = async (projectId: string) => {
    // Delete linked items
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setDocuments(prev => prev.filter(d => d.project_id !== projectId));
    setApiKeys(prev => prev.filter(k => k.project_id !== projectId));
    setHostedBots(prev => prev.filter(b => b.project_id !== projectId));
    setGithubRepos(prev => prev.filter(r => r.project_id !== projectId));
  };

  const uploadDocument = async (projectId: string, file: { name: string; size: number; type: string }) => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > usageStats.limit_doc_size_mb) {
      throw new Error(`File size ${sizeMB.toFixed(2)}MB exceeds your plan support limit of ${usageStats.limit_doc_size_mb}MB.`);
    }

    // Check document count limits
    const existingCount = documents.filter(d => d.project_id === projectId).length;
    if (currentUser?.plan === 'free' && existingCount >= 1) {
      throw new Error("Free tier supports 1 document per project. Please upgrade to Pro or Enterprise.");
    } else if (currentUser?.plan === 'pro' && existingCount >= 20) {
      throw new Error("Pro tier supports up to 20 documents per project. Please upgrade to Enterprise.");
    }

    const docId = 'doc_' + Math.random().toString(36).substr(2, 9);
    const format = file.name.split('.').pop() || 'txt';
    const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '');

    const newDoc: Document = {
      id: docId,
      project_id: projectId,
      filename: cleanName,
      storage_path: `${currentUser?.id || 'anonymous'}/${projectId}/${docId}_${cleanName}`,
      file_size: file.size,
      mime_type: file.type || 'text/plain',
      chunk_count: null,
      status: 'pending',
      error_message: null,
      created_at: new Date().toISOString()
    };

    setDocuments(prev => [...prev, newDoc]);
    
    // Set project status to pending / processing as well
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'processing' } : p));

    return newDoc;
  };

  // Simulates the asynchronous 8-stage ingestion pipeline
  const simulateDocumentPipeline = async (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    // Transition doc to processing
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'processing' } : d));

    // Wait slightly, then set to done
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    const chunks = Math.max(5, Math.ceil(doc.file_size / 9000));
    setDocuments(prev => prev.map(d => d.id === docId ? { 
      ...d, 
      status: 'done', 
      chunk_count: chunks 
    } : d));

    // Update project state back to ready
    setProjects(prev => prev.map(p => p.id === doc.project_id ? { ...p, status: 'ready' } : p));
  };

  // ================= Hosted Bots Methods ===================

  const createHostedBot = async (name: string, welcome: string, color: string) => {
    if (!currentUser) throw new Error('Auth Token Required');
    
    // First, verify/create a core project behind it
    const coreProj = await createProject(name, 'hosted');

    const botId = 'bot_' + Math.random().toString(36).substr(2, 9);
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substr(2, 4)}`;

    const newBot: HostedBot = {
      id: botId,
      project_id: coreProj.id,
      slug,
      public_url: `${window.location.origin}/bot/${slug}`,
      name,
      welcome_message: welcome,
      theme_color: color,
      logo_url: null,
      password_hash: null,
      is_active: true,
      created_at: new Date().toISOString()
    };

    setHostedBots(prev => [...prev, newBot]);
    return newBot;
  };

  const updateHostedBot = async (botId: string, updates: Partial<HostedBot>) => {
    let resultBot: HostedBot | null = null;
    setHostedBots(prev => prev.map(b => {
      if (b.id === botId) {
        resultBot = { ...b, ...updates };
        return resultBot;
      }
      return b;
    }));
    if (!resultBot) throw new Error("Bot not found");
    return resultBot;
  };

  // ================= Developer API Keys Methods ===================

  const createAPIKey = async (projectId: string, label: string) => {
    const id = 'key_' + Math.random().toString(36).substr(2, 9);
    const hex = Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('');
    
    // Check key requirements: Secret is sk_live_...
    const rawSecret = `sk_live_${btoa(hex).substr(0, 16)}`;
    const prefix = rawSecret.substr(0, 10);
    const hash = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join(''); // mock SHA256

    const newKey: APIKey = {
      id,
      project_id: projectId,
      key_hash: hash,
      key_prefix: prefix, // First 10 chars, e.g. "sk_live_de"
      label,
      is_public: false,
      last_used_at: null,
      created_at: new Date().toISOString()
    };

    // Keep rawSecret in a volatile return state to show only ONCE in the UI (as documented in API key generation)
    (newKey as any).temporary_raw_secret = rawSecret;

    setApiKeys(prev => [...prev, newKey]);
    return newKey;
  };

  const revokeAPIKey = async (keyId: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== keyId));
  };

  // ================= GitHub Integration Methods ===================

  const connectGitHub = async (projectId: string, repoUrl: string, token: string, mode: 'webhook' | 'polling') => {
    if (usageStats.limit_repos === 0) {
      throw new Error(`Your current plan (${currentUser?.plan}) does not include GitHub automated ingestion sync. Please upgrade.`);
    }
    
    const count = githubRepos.length;
    if (count >= usageStats.limit_repos) {
      throw new Error(`Plan limit checked: GitHub repositories connected are capped at ${usageStats.limit_repos} on your current plan.`);
    }

    const segments = repoUrl.replace('https://github.com/', '').split('/');
    const owner = segments[0] || 'github_member';
    const repo_name = segments[1] || 'repository';

    const id = 'repo_' + Math.random().toString(36).substr(2, 9);
    const newRepo: GitHubRepo = {
      id,
      project_id: projectId,
      repo_url: repoUrl,
      owner,
      repo_name,
      default_branch: 'main',
      tracking_mode: mode,
      poll_interval: 1800,
      last_commit_sha: 'a5b4c3d2e1',
      notification_webhook_url: null,
      created_at: new Date().toISOString()
    };

    setGithubRepos(prev => [...prev, newRepo]);
    return newRepo;
  };

  const disconnectGitHub = async (repoId: string) => {
    setGithubRepos(prev => prev.filter(r => r.id !== repoId));
    setCommitEvents(prev => prev.filter(e => e.repo_id !== repoId));
  };

  const simulateGitHubPushCommit = async (repoId: string, message: string, changedFiles: string[]) => {
    const repo = githubRepos.find(r => r.id !== repoId);
    
    // Classify changes (mimics backend's commit classification in section 10.3)
    let eventType: 'doc_updated' | 'code_changed' | 'mixed' | 'ignored' = 'ignored';
    const docFiles: string[] = [];
    const sourceFiles: string[] = [];

    changedFiles.forEach(file => {
      const lower = file.toLowerCase();
      if (lower.startsWith('docs/') || lower.endsWith('.md') || lower.endsWith('.mdx')) {
        docFiles.push(file);
      } else if (lower.endsWith('.py') || lower.endsWith('.ts') || lower.endsWith('.js') || lower.endsWith('.go')) {
        sourceFiles.push(file);
      }
    });

    if (docFiles.length > 0 && sourceFiles.length > 0) {
      eventType = 'mixed';
    } else if (docFiles.length > 0) {
      eventType = 'doc_updated';
    } else if (sourceFiles.length > 0) {
      eventType = 'code_changed';
    }

    const commitSha = Math.random().toString(16).substr(2, 8);
    
    // Create commit event log
    const newEvent: CommitEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      repo_id: repoId,
      commit_sha: commitSha,
      commit_message: message,
      event_type: eventType,
      files_changed: changedFiles,
      doc_files_updated: docFiles,
      // If code changed but no docs updated -> notify the user with "doc suggest" warning
      notification_sent: eventType === 'code_changed' || eventType === 'mixed',
      processed_at: new Date().toISOString()
    };

    setCommitEvents(prev => [newEvent, ...prev]);

    // If doc files were updated, increase document model chunk counts since RAG parses them.
    if (docFiles.length > 0) {
      // Simulate chunking and embedding trigger
      console.log('Surgical incremental update triggered for documents: ', docFiles);
    }

    // Update repository last commit SHA
    setGithubRepos(prev => prev.map(r => r.id === repoId ? { ...r, last_commit_sha: commitSha } : r));

    return newEvent;
  };

  const triggerManualResync = async (repoId: string) => {
    setGithubRepos(prev => prev.map(r => r.id === repoId ? { ...r, last_commit_sha: 'resynced_' + Math.random().toString(16).substr(2, 6) } : r));
    console.log('Forced full-ingestion resync completed on GitHub doc repository.');
  };

  // ================= Telebirr Billing Methods ===================

  const initiateTelebirrPayment = async (plan: 'pro' | 'enterprise') => {
    if (!currentUser) throw new Error('Authentication is required first.');

    const out_trade_no = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
    
    // Standard mock checkout endpoint return (Section 4.5, step 8)
    const price = plan === 'pro' ? '1100.00' : '4500.00';
    return {
      to_pay_url: `https://h5pay.trade.pay/checkout?tradeNo=${out_trade_no}&amount=${price}&receiveName=RAGSupportService&plan=${plan}`,
      out_trade_no
    };
  };

  const simulateTelebirrCallback = async (outTradeNo: string, success: boolean) => {
    if (!currentUser) return;
    
    if (success) {
      // Get the requested plan from either stored data or assume pro based on some query
      const amount = 1100.00; // default Pro
      const plan: PlanType = 'pro';

      // Insert billing ledger entry
      const newTx: BillingTransaction = {
        id: 'tx_auth_' + Math.random().toString(36).substr(2, 9),
        plan,
        amount_etb: amount,
        out_trade_no: outTradeNo,
        telebirr_trade_no: 'FT' + Math.floor(100000 + Math.random() * 900000) + '-TELEBIRR',
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days active
      };

      setBillingTransactions(prev => [newTx, ...prev]);
      
      // Update User Plan
      setCurrentUser(prev => prev ? { ...prev, plan: plan } : null);
    } else {
      // payment failed
      const failTx: BillingTransaction = {
        id: 'tx_fail_' + Math.random().toString(36).substr(2, 9),
        plan: 'pro',
        amount_etb: 1100.00,
        out_trade_no: outTradeNo,
        telebirr_trade_no: null,
        status: 'failed',
        created_at: new Date().toISOString(),
        expires_at: new Date().toISOString()
      };
      setBillingTransactions(prev => [failTx, ...prev]);
    }
  };

  const cancelSubscription = async () => {
    if (!currentUser) return;
    
    // Section 4.9: Sets subscription cancel flag but stays active until expired.
    setBillingTransactions(prev => prev.map(t => t.status === 'active' ? { ...t, status: 'cancelled' } : t));
    
    // Downgrade user plan to free
    setCurrentUser(prev => prev ? { ...prev, plan: 'free' } : null);
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    // Purge their entities
    setProjects(prev => prev.filter(p => p.user_id !== userId));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
    }
  };

  const updateUserPlan = (userId: string, plan: PlanType) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, plan } : null);
    }
  };

  // ================= Direct RAG Simulation ===================

  const sendRAGMessage = async (namespaceId: string, userMessage: string, customApiKey?: string) => {
    const thread = chatHistory[namespaceId] || [];
    
    // Check key rate if custom API key is passed (60 / min for Pro, 600 / min for Ent)
    if (customApiKey && currentUser?.plan === 'free') {
      throw new Error("Invalid API key rate limit (Upgrade required to use developer API endpoints).");
    }

    const userMessageObj: ChatMessage = {
      id: 'msg_u_' + Math.random().toString(36).substr(2, 9),
      sessionId: namespaceId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };

    // Pre-save user message so it shows in container
    const updatedThreadWithUser = [...thread, userMessageObj];
    setChatHistory(prev => ({
      ...prev,
      [namespaceId]: updatedThreadWithUser
    }));

    // Generate responsive stream response based on document queries
    const lowerMessage = userMessage.toLowerCase();
    let RAGResponse = "";
    let detected_lang = "en";
    let score = 0.89;

    // Support responses matching OCR manual
    if (lowerMessage.includes('telebirr') || lowerMessage.includes('parameter') || lowerMessage.includes('12')) {
      RAGResponse = "Perfect. The Telebirr C2B checkout parameter list consists of exactly **12 items** signed on your backend with an `appKey` and encrypted into a `ussd_detail` payload. The parameters are: appId, appKey, shortCode, nonce, timestamp, outTradeNo, totalAmount (in ETB with two decimals), subject, timeoutExpress, notifyUrl, returnUrl, and receiveName. You can simulate testing callbacks using our sandbox UI tools in the billing panel!";
      score = 0.98;
    } else if (lowerMessage.includes('chunk') || lowerMessage.includes('size') || lowerMessage.includes('overlap')) {
      RAGResponse = "Our RAG support pipeline parses PDF/MD text chunks into **512 tokens** using tiktoken (cl100k) with a fallback overlap of **64 tokens**. It follows standard LangChain RecursiveCharacterTextSplitter patterns with separators sorted as paragraph breaks -> sentence borders -> spaces.";
      score = 0.95;
    } else if (lowerMessage.includes('mcp') || lowerMessage.includes('protocol')) {
      RAGResponse = "Model Context Protocol (MCP) tool exposure is mounted at `/mcp` in our FastAPI monolith. The LLM decides when to invoke tool definitions like `search_documents`, `get_indexed_files`, `check_github_sync`, and `get_recent_changes` dynamically, rather than hardwiring retrieval on every prompt.";
      score = 0.97;
    } else if (lowerMessage.includes('amharic') || lowerMessage.includes('oromifaa') || lowerMessage.includes('bge')) {
      RAGResponse = "Yes! The self-hosted **BAAI/bge-m3** model natively embeds 100+ languages including Ethiopic fonts (Amharic and Oromifaa). It supports massive 1024-dimensional dense vectors with cosine similarity matching in Qdrant collections mapped by the project's UUID namespace.";
      detected_lang = "am_en";
      score = 0.91;
    } else if (lowerMessage.includes('selam') || lowerMessage.includes('helo') || lowerMessage.includes('hi')) {
      RAGResponse = "Selam! How can I assist you with your RAG service modules today? I have access to your uploaded files, Telebirr parameters documentation, and GitHub project states.";
      score = 0.82;
    } else {
      RAGResponse = `Based on your indexed documents, I found relevant matches in the vector indexes for "${userMessage}". The search engine routed through Dense similarity and sparse BM25 fusion ranks this context high. We run OpenAI GPT-4o with streaming SSE responses to answer your question efficiently. Let me know if you would like me to unpack more logs.`;
    }

    // Yield assistant response after a simulated typing latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const assistantMessageObj: ChatMessage = {
      id: 'msg_a_' + Math.random().toString(36).substr(2, 9),
      sessionId: namespaceId,
      role: 'assistant',
      content: RAGResponse,
      detected_language: detected_lang,
      retrieval_score: score,
      tokens_used: Math.floor(100 + Math.random() * 250),
      created_at: new Date().toISOString()
    };

    setChatHistory(prev => ({
      ...prev,
      [namespaceId]: [...updatedThreadWithUser, assistantMessageObj]
    }));
  };

  const clearChatHistory = (namespaceId: string) => {
    setChatHistory(prev => {
      const copy = { ...prev };
      delete copy[namespaceId];
      return copy;
    });
  };

  const resetAllData = () => {
    setCurrentUser(DEFAULT_USER);
    setUsers([
      DEFAULT_USER,
      {
        id: 'usr_abel',
        email: 'abel@enawga.com',
        name: 'Abel Kebede',
        plan: 'pro',
        telebirr_phone: '0911223344',
        is_verified: true,
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        created_at: new Date('2026-05-18T10:00:00Z').toISOString(),
      },
      {
        id: 'usr_tigist',
        email: 'tigist@cyberethiopia.com',
        name: 'Tigist Shiferaw',
        plan: 'enterprise',
        telebirr_phone: '0922889900',
        is_verified: true,
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        created_at: new Date('2026-04-12T09:15:00Z').toISOString(),
      }
    ]);
    setProjects(SEED_PROJECTS);
    setDocuments(SEED_DOCUMENTS);
    setApiKeys(SEED_KEYS);
    setHostedBots(SEED_BOTS);
    setGithubRepos(SEED_REPOS);
    setCommitEvents(SEED_EVENTS);
    setChatHistory(SEED_CHATS);
    setBillingTransactions(SEED_TRANSACTIONS);
    
    localStorage.removeItem('rag_user');
    localStorage.removeItem('rag_all_users');
    localStorage.removeItem('rag_projects');
    localStorage.removeItem('rag_documents');
    localStorage.removeItem('rag_keys');
    localStorage.removeItem('rag_bots');
    localStorage.removeItem('rag_repos');
    localStorage.removeItem('rag_events');
    localStorage.removeItem('rag_chats');
    localStorage.removeItem('rag_billing');
  };

  return (
    <AppContext.Provider value={{
      currentUser, projects, documents, apiKeys, hostedBots, githubRepos, commitEvents,
      chatHistory, usageStats, billingTransactions, users, deleteUser, updateUserPlan,
      register, verifyEmail, resendOTP, login, logout, updateProfile, simulateOAuth,
      createProject, deleteProject, uploadDocument, simulateDocumentPipeline,
      createHostedBot, updateHostedBot,
      createAPIKey, revokeAPIKey,
      connectGitHub, disconnectGitHub, simulateGitHubPushCommit, triggerManualResync,
      initiateTelebirrPayment, simulateTelebirrCallback, cancelSubscription,
      sendRAGMessage, clearChatHistory, resetAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
};
