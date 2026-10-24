// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type UserPlan = 'starter' | 'pro';
export type UserRole = 'user' | 'admin';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionSource = 'web' | 'telegram_text' | 'telegram_receipt' | 'telegram_photo' | 'telegram_voice';
export type ExportFormat = 'pdf' | 'xlsx';
export type AIProviderName = 'gemini' | 'openai' | 'deepseek';
export type AIExecutionMode = 'single' | 'parallel_failover';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type PaymentMethod = 'midtrans' | 'manual_transfer';

export interface UserProfile {
  id: string;
  full_name: string;
  phone_number?: string | null;
  phone_verified: boolean;
  avatar_url?: string | null;
  currency: string;
  plan: UserPlan;
  role: UserRole;
  telegram_chat_id?: number | null;
  telegram_bot_token?: string | null;
  telegram_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  color: string;
  icon: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  emoji: string;
  color: string;
  is_system: boolean;
  created_at: string;
}

export type BudgetPeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number;
  month: string; // YYYY-MM
  period_type?: BudgetPeriodType;
  period_key?: string;
  alert_80_sent: boolean;
  alert_100_sent: boolean;
  created_at: string;
  category?: Category;
  spent?: number;
  remaining?: number;
  percentage?: number;
}

export interface RecurringBill {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category_id?: string | null;
  wallet_id?: string | null;
  due_day: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  is_active: boolean;
  last_paid_at?: string | null;
  notes?: string | null;
  created_at: string;
  category?: Category;
  wallet?: Wallet;
}

export interface TataAIMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  source: 'web' | 'telegram';
  created_at: string;
  metadata?: Record<string, any>;
}

export interface PaymentApproval {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  bank_name: string;
  account_number?: string;
  account_name?: string;
  proof_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  admin_id?: string;
  approved_at?: string;
  created_at: string;
  user_name?: string;
  user_phone?: string;
}

export interface ReceiptItem {
  id: string;
  transaction_id: string;
  item_name: string;
  price: number;
  quantity: number;
  category_id?: string | null;
  category?: Category;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  to_wallet_id?: string | null;
  category_id?: string | null;
  type: TransactionType;
  amount: number;
  notes?: string | null;
  source: TransactionSource;
  raw_input?: string | null;
  receipt_image_url?: string | null;
  voice_transcript?: string | null;
  transaction_time: string;
  created_at: string;
  wallet?: Wallet;
  to_wallet?: Wallet;
  category?: Category;
  receipt_items?: ReceiptItem[];
}

export interface ExportHistory {
  id: string;
  user_id: string;
  format: ExportFormat;
  period_start: string;
  period_end: string;
  file_path: string;
  file_name: string;
  signed_url?: string | null;
  expires_at?: string | null;
  created_at: string;
}

export interface ReminderSetting {
  id: string;
  user_id: string;
  is_enabled: boolean;
  frequency: 1 | 2; // max 2x/day per Part 3
  time_1: string; // HH:MM:SS
  time_2?: string | null;
  created_at: string;
}

export interface AIProvider {
  id: string;
  name: AIProviderName;
  display_name: string;
  is_active: boolean;
  priority: number;
  encrypted_api_key: string;
  model_name: string;
  created_at: string;
}

export interface AISystemSettings {
  id: number;
  execution_mode: AIExecutionMode;
  primary_provider_id?: string | null;
  updated_at: string;
}

export interface AILog {
  id: string;
  user_id?: string | null;
  provider: string;
  action: string;
  prompt_preview?: string | null;
  response_preview?: string | null;
  tokens_used: number;
  latency_ms: number;
  status: 'success' | 'failed';
  error_message?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id?: string | null;
  target_user_id?: string | null;
  action: string;
  ip_address?: string | null;
  reason?: string | null;
  created_at: string;
  admin?: UserProfile;
  target_user?: UserProfile;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  plan: UserPlan;
  payment_method: PaymentMethod;
  amount: number;
  order_id: string;
  status: PaymentStatus;
  proof_image_url?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

// Telegram Bot Interfaces
export interface TelegramFrom {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
  first_name?: string;
  username?: string;
}

export interface TelegramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TelegramVoice {
  file_id: string;
  file_unique_id: string;
  duration: number; // in seconds
  mime_type?: string;
  file_size?: number;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramFrom;
  chat: TelegramChat;
  date: number;
  text?: string;
  caption?: string;
  photo?: TelegramPhotoSize[];
  voice?: TelegramVoice;
  audio?: TelegramVoice;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// AI Parsing Structured Output
export interface ParsedItem {
  item_name: string;
  price: number;
  quantity?: number;
  category_name?: string;
}

export interface ParsedTransactionResult {
  jenis: 'pemasukan' | 'pengeluaran' | 'transfer';
  nominal: number;
  kategori: string;
  catatan: string;
  wallet_asal?: string;
  wallet_tujuan?: string;
  items?: ParsedItem[];
  confidence?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM COLLABORATION & SHARED WORKSPACE TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export type TeamMemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamMember {
  id: string;
  workspace_id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: TeamMemberRole;
  joined_at: string;
  status: 'active' | 'invited';
  telegram_handle?: string;
  monthly_spending_limit?: number;
}

export interface TeamWorkspace {
  id: string;
  name: string;
  type: 'personal' | 'family' | 'business';
  owner_id: string;
  currency: string;
  member_count: number;
  total_balance: number;
  created_at: string;
  description?: string;
}

export interface TeamSharedWallet {
  id: string;
  workspace_id: string;
  wallet_name: string;
  balance: number;
  bank_name: string;
  account_number: string;
  color: string;
  authorized_roles: TeamMemberRole[];
  require_approval_above?: number;
}

export interface TeamAuditLog {
  id: string;
  workspace_id: string;
  user_name: string;
  avatar_url?: string;
  action: string;
  detail: string;
  type: 'transaction' | 'budget' | 'member' | 'approval';
  created_at: string;
}

export interface TeamPendingApproval {
  id: string;
  workspace_id: string;
  requester_name: string;
  requester_avatar?: string;
  amount: number;
  category: string;
  wallet_name: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

