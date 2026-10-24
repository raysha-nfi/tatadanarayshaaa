'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA SUPERADMIN CONTEXT & STATE ENGINE (PART 10)
// Centralized state for user management, AI failover, payment approval, & audit logs
// ═══════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from '@/lib/app-context';
import { UserProfile, AIProvider, AIExecutionMode, PaymentTransaction, AILog, Transaction } from '@/types';

export interface AdminUser extends UserProfile {
  transaction_count?: number;
  bot_username?: string;
}

export type AdminAuditAction =
  | 'impersonate_user'
  | 'view_transactions'
  | 'approve_payment'
  | 'reject_payment'
  | 'change_user_plan'
  | 'update_ai_providers';

export interface AdminAuditEntry {
  id: string;
  admin_name: string;
  target_user: string;
  action: AdminAuditAction;
  reason: string;
  ip_address: string;
  created_at: string;
}

export interface ExtendedAILog extends AILog {
  prompt_tokens?: number;
  completion_tokens?: number;
  feature?: string;
}

const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-dimas-001',
    full_name: 'Dimas Pratama',
    phone_number: '6281234567890',
    phone_verified: true,
    currency: 'IDR',
    plan: 'pro',
    role: 'user',
    telegram_chat_id: 129384756,
    telegram_connected: true,
    bot_username: '@TataDanaOfficialBot',
    created_at: '2026-09-01T08:00:00+07:00',
    updated_at: '2026-10-10T10:00:00+07:00',
    transaction_count: 42,
  },
  {
    id: 'usr-nadia-002',
    full_name: 'Nadia Putri',
    phone_number: '6281399887766',
    phone_verified: true,
    currency: 'IDR',
    plan: 'starter',
    role: 'user',
    telegram_chat_id: 284759102,
    telegram_connected: true,
    bot_username: '@TataDanaOfficialBot',
    created_at: '2026-09-15T10:00:00+07:00',
    updated_at: '2026-10-10T09:00:00+07:00',
    transaction_count: 18,
  },
  {
    id: 'usr-kevin-003',
    full_name: 'Kevin Jonathan',
    phone_number: '6281987654321',
    phone_verified: false,
    currency: 'IDR',
    plan: 'starter',
    role: 'user',
    telegram_connected: false,
    created_at: '2026-10-02T14:00:00+07:00',
    updated_at: '2026-10-02T14:00:00+07:00',
    transaction_count: 4,
  },
  {
    id: 'usr-siti-004',
    full_name: 'Siti Rahma',
    phone_number: '6282112345678',
    phone_verified: true,
    currency: 'IDR',
    plan: 'pro',
    role: 'user',
    telegram_chat_id: 394857201,
    telegram_connected: true,
    bot_username: '@SitiFinansialBot (BYO)',
    created_at: '2026-09-20T11:30:00+07:00',
    updated_at: '2026-10-08T14:10:00+07:00',
    transaction_count: 65,
  },
  {
    id: 'usr-budi-005',
    full_name: 'Budi Santoso',
    phone_number: '6285712349876',
    phone_verified: true,
    currency: 'IDR',
    plan: 'starter',
    role: 'user',
    telegram_chat_id: 485920193,
    telegram_connected: true,
    bot_username: '@TataDanaOfficialBot',
    created_at: '2026-10-05T08:45:00+07:00',
    updated_at: '2026-10-09T17:00:00+07:00',
    transaction_count: 29,
  },
];

const INITIAL_AUDIT_LOGS: AdminAuditEntry[] = [
  {
    id: 'aud-01',
    admin_name: 'Super Admin TataDana',
    target_user: 'Dimas Pratama (usr-dimas-001)',
    action: 'view_transactions',
    reason: 'Pemeriksaan kendala transaksi oleh support teknis',
    ip_address: '103.144.120.45',
    created_at: '2026-10-10T12:00:00+07:00',
  },
  {
    id: 'aud-02',
    admin_name: 'Super Admin TataDana',
    target_user: 'Dimas Pratama (usr-dimas-001)',
    action: 'approve_payment',
    reason: 'Approval pembayaran manual transfer BCA - Upgrade Pro',
    ip_address: '103.144.120.45',
    created_at: '2026-10-10T09:30:00+07:00',
  },
  {
    id: 'aud-03',
    admin_name: 'Super Admin TataDana',
    target_user: 'Nadia Putri (usr-nadia-002)',
    action: 'impersonate_user',
    reason: 'Bantuan setup token bot Telegram custom',
    ip_address: '103.144.120.45',
    created_at: '2026-10-09T16:15:00+07:00',
  },
  {
    id: 'aud-04',
    admin_name: 'Super Admin TataDana',
    target_user: 'Siti Rahma (usr-siti-004)',
    action: 'change_user_plan',
    reason: 'Upgrade paket manual oleh administrator',
    ip_address: '103.144.120.45',
    created_at: '2026-10-08T14:10:00+07:00',
  },
];

const INITIAL_ENRICHED_AI_LOGS: ExtendedAILog[] = [
  {
    id: 'log-01',
    user_id: 'usr-dimas-001',
    provider: 'gemini',
    action: 'parse_text',
    feature: 'text_parse',
    prompt_preview: 'beli bakso 25rb pakai bca',
    response_preview: '{"jenis":"pengeluaran","nominal":25000,"kategori":"Makanan","wallet":"BCA"}',
    prompt_tokens: 112,
    completion_tokens: 30,
    tokens_used: 142,
    latency_ms: 380,
    status: 'success',
    created_at: '2026-10-10T12:15:02+07:00',
  },
  {
    id: 'log-02',
    user_id: 'usr-dimas-001',
    provider: 'gemini',
    action: 'parse_receipt',
    feature: 'receipt_ocr',
    prompt_preview: '[Receipt OCR image upload - Struk Indomaret 840KB]',
    response_preview: '{"merchant":"Indomaret Point","totalAmount":145000,"items":4}',
    prompt_tokens: 520,
    completion_tokens: 160,
    tokens_used: 680,
    latency_ms: 1250,
    status: 'success',
    created_at: '2026-10-09T19:40:04+07:00',
  },
  {
    id: 'log-03',
    user_id: 'usr-dimas-001',
    provider: 'openai',
    action: 'transcribe_voice',
    feature: 'voice_stt',
    prompt_preview: '[Audio recording voice note .oga 12s - 145KB]',
    response_preview: 'beli kopi janji jiwa 24 ribu pakai gopay',
    prompt_tokens: 60,
    completion_tokens: 25,
    tokens_used: 85,
    latency_ms: 620,
    status: 'success',
    created_at: '2026-10-10T10:30:03+07:00',
  },
  {
    id: 'log-04',
    user_id: 'usr-siti-004',
    provider: 'deepseek',
    action: 'financial_advisor',
    feature: 'advisor',
    prompt_preview: '[Proactive Financial Advisor: Pengeluaran mingguan naik >50%]',
    response_preview: '{"advice":"Peringatan: Pengeluaran kategori Hiburan melonjak 65% minggu ini."}',
    prompt_tokens: 310,
    completion_tokens: 95,
    tokens_used: 405,
    latency_ms: 780,
    status: 'success',
    created_at: '2026-10-08T16:22:10+07:00',
  },
  {
    id: 'log-05',
    user_id: 'usr-budi-005',
    provider: 'gemini',
    action: 'parse_text',
    feature: 'text_parse',
    prompt_preview: 'transfer 500rb bca ke mandiri',
    response_preview: '{"error":"Rate limit HTTP 429 -> Failover executed to OpenAI"}',
    prompt_tokens: 45,
    completion_tokens: 0,
    tokens_used: 45,
    latency_ms: 2100,
    status: 'failed',
    error_message: 'Rate limit 429 quota exceeded, cascaded to OpenAI GPT-4o-mini',
    created_at: '2026-10-08T11:05:00+07:00',
  },
];

interface AdminContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  users: AdminUser[];
  toggleUserPlan: (userId: string) => { success: boolean; newPlan: string };
  auditLogs: AdminAuditEntry[];
  addAuditLog: (entry: Omit<AdminAuditEntry, 'id' | 'created_at'>) => void;
  impersonateUserWithReason: (user: UserProfile, reason: string) => { success: boolean; error?: string };
  inspectTransactionsWithReason: (user: UserProfile, reason: string) => { success: boolean; error?: string; transactions: Transaction[] };
  payments: PaymentTransaction[];
  approvePaymentAdmin: (paymentId: string, notes?: string) => void;
  rejectPaymentAdmin: (paymentId: string, notes?: string) => void;
  providers: AIProvider[];
  updateProvider: (provider: AIProvider) => void;
  executionMode: AIExecutionMode;
  setExecutionMode: (mode: AIExecutionMode) => void;
  saveProviderSettings: () => void;
  aiLogs: ExtendedAILog[];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const {
    currentUser,
    activeUser,
    impersonate,
    payments: globalPayments,
    approvePayment: globalApprovePayment,
    rejectPayment: globalRejectPayment,
    aiProviders: globalProviders,
    updateAIProvider: globalUpdateProvider,
    aiExecutionMode: globalExecutionMode,
    setAiExecutionMode: globalSetExecutionMode,
    transactions: globalTransactions,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [providers, setProviders] = useState<AIProvider[]>(globalProviders);
  const [executionMode, setExecutionMode] = useState<AIExecutionMode>(globalExecutionMode);
  const [aiLogs, setAiLogs] = useState<ExtendedAILog[]>(INITIAL_ENRICHED_AI_LOGS);
  const [localPayments, setLocalPayments] = useState<PaymentTransaction[]>(globalPayments);

  // Sync payments if global changes
  useEffect(() => {
    setLocalPayments(globalPayments);
  }, [globalPayments]);

  // Sync providers if global changes
  useEffect(() => {
    setProviders(globalProviders);
  }, [globalProviders]);

  const addAuditLog = (entry: Omit<AdminAuditEntry, 'id' | 'created_at'>) => {
    const newEntry: AdminAuditEntry = {
      ...entry,
      id: `aud-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const toggleUserPlan = (userId: string) => {
    let targetNewPlan = 'pro';
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          targetNewPlan = u.plan === 'pro' ? 'starter' : 'pro';
          return {
            ...u,
            plan: targetNewPlan as 'starter' | 'pro',
            updated_at: new Date().toISOString(),
          };
        }
        return u;
      })
    );

    const targetUser = users.find((u) => u.id === userId);
    const targetName = targetUser?.full_name || userId;

    addAuditLog({
      admin_name: currentUser.full_name || 'Super Admin TataDana',
      target_user: `${targetName} (${userId})`,
      action: 'change_user_plan',
      reason: `Admin mengubah status paket pengguna menjadi ${targetNewPlan.toUpperCase()}`,
      ip_address: '103.144.120.45',
    });

    return { success: true, newPlan: targetNewPlan };
  };

  const impersonateUserWithReason = (user: UserProfile, reason: string) => {
    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Alasan privasi wajib diisi sebelum melakukan impersonasi!' };
    }

    addAuditLog({
      admin_name: currentUser.full_name || 'Super Admin TataDana',
      target_user: `${user.full_name} (${user.id})`,
      action: 'impersonate_user',
      reason: reason.trim(),
      ip_address: '103.144.120.45',
    });

    impersonate(user);
    return { success: true };
  };

  const inspectTransactionsWithReason = (user: UserProfile, reason: string) => {
    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Alasan inspeksi wajib diisi demi kepatuhan audit data!', transactions: [] };
    }

    addAuditLog({
      admin_name: currentUser.full_name || 'Super Admin TataDana',
      target_user: `${user.full_name} (${user.id})`,
      action: 'view_transactions',
      reason: reason.trim(),
      ip_address: '103.144.120.45',
    });

    const userTxs = globalTransactions.filter((t) => t.user_id === user.id);
    const resultTxs = userTxs.length > 0 ? userTxs : globalTransactions.slice(0, 5);

    return { success: true, transactions: resultTxs };
  };

  const approvePaymentAdmin = (paymentId: string, notes?: string) => {
    const payment = localPayments.find((p) => p.id === paymentId);
    const verifiedNote = notes || 'Bukti mutasi rekening terverifikasi valid (Admin Superadmin)';

    globalApprovePayment(paymentId, verifiedNote);

    setLocalPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'approved', admin_notes: verifiedNote } : p))
    );

    if (payment) {
      // Automatically upgrade user to Pro in admin user list
      setUsers((prev) =>
        prev.map((u) => (u.id === payment.user_id ? { ...u, plan: 'pro' } : u))
      );

      addAuditLog({
        admin_name: currentUser.full_name || 'Super Admin TataDana',
        target_user: `${payment.user?.full_name || payment.user_id}`,
        action: 'approve_payment',
        reason: `${verifiedNote} (Order: ${payment.order_id}) - Akun otomatis upgrade ke Pro`,
        ip_address: '103.144.120.45',
      });
    }
  };

  const rejectPaymentAdmin = (paymentId: string, notes?: string) => {
    const payment = localPayments.find((p) => p.id === paymentId);
    const rejectionNote = notes || 'Bukti transfer tidak valid atau nominal tidak sesuai';

    globalRejectPayment(paymentId, rejectionNote);

    setLocalPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'rejected', admin_notes: rejectionNote } : p))
    );

    if (payment) {
      addAuditLog({
        admin_name: currentUser.full_name || 'Super Admin TataDana',
        target_user: `${payment.user?.full_name || payment.user_id}`,
        action: 'reject_payment',
        reason: `${rejectionNote} (Order: ${payment.order_id})`,
        ip_address: '103.144.120.45',
      });
    }
  };

  const updateProvider = (updated: AIProvider) => {
    setProviders((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    globalUpdateProvider(updated);
  };

  const saveProviderSettings = () => {
    providers.forEach((p) => globalUpdateProvider(p));
    globalSetExecutionMode(executionMode);

    addAuditLog({
      admin_name: currentUser.full_name || 'Super Admin TataDana',
      target_user: 'Sistem Infrastruktur Multi-Provider AI TataDana',
      action: 'update_ai_providers',
      reason: `Pembaruan konfigurasi API keys & mode failover: ${executionMode}`,
      ip_address: '103.144.120.45',
    });
  };

  return (
    <AdminContext.Provider
      value={{
        activeTab,
        setActiveTab,
        users,
        toggleUserPlan,
        auditLogs,
        addAuditLog,
        impersonateUserWithReason,
        inspectTransactionsWithReason,
        payments: localPayments,
        approvePaymentAdmin,
        rejectPaymentAdmin,
        providers,
        updateProvider,
        executionMode,
        setExecutionMode,
        saveProviderSettings,
        aiLogs,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
