export type PlanType = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  telebirr_phone: string | null;
  is_verified: boolean;
  avatar_url: string | null;
  created_at: string;
}

export type ProjectType = 'instant' | 'hosted' | 'api';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  type: ProjectType;
  namespace_id: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  expires_at: string | null; // Nullable for permanent, active for instant-chat.
  created_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  filename: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  chunk_count: number | null;
  status: 'pending' | 'processing' | 'done' | 'failed';
  error_message: string | null;
  created_at: string;
}

export interface APIKey {
  id: string;
  project_id: string;
  key_hash: string;
  key_prefix: string;
  label: string;
  is_public: boolean;
  last_used_at: string | null;
  created_at: string;
}

export interface HostedBot {
  id: string;
  project_id: string;
  slug: string;
  public_url: string;
  name: string;
  welcome_message: string;
  theme_color: string;
  logo_url: string | null;
  password_hash: string | null;
  is_active: boolean;
  created_at: string;
}

export interface GitHubRepo {
  id: string;
  project_id: string;
  repo_url: string;
  owner: string;
  repo_name: string;
  default_branch: string;
  tracking_mode: 'webhook' | 'polling';
  poll_interval: number; // in seconds, default 1800
  last_commit_sha: string | null;
  notification_webhook_url: string | null;
  created_at: string;
}

export interface CommitEvent {
  id: string;
  repo_id: string;
  commit_sha: string;
  commit_message: string | null;
  event_type: 'doc_updated' | 'code_changed' | 'mixed' | 'ignored';
  files_changed: string[];
  doc_files_updated: string[];
  notification_sent: boolean;
  processed_at: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  detected_language?: string;
  retrieval_score?: number;
  tokens_used?: number;
  created_at: string;
}

export interface UsageStats {
  monthly_tokens_used: number;
  monthly_queries: number;
  limit_tokens: number;
  limit_bots: number;
  limit_projects: number;
  limit_repos: number;
  limit_doc_size_mb: number;
}

export interface BillingTransaction {
  id: string;
  plan: PlanType;
  amount_etb: number;
  out_trade_no: string;
  telebirr_trade_no: string | null;
  status: 'pending' | 'active' | 'failed' | 'expired' | 'cancelled';
  created_at: string;
  expires_at: string;
}
