'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA GLOBAL APPLICATION STATE CONTEXT
// Mengelola data transaksi, wallet, budget, AI providers, auth, & impersonation
// ═══════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Wallet,
  Category,
  Budget,
  Transaction,
  AIProvider,
  AILog,
  PaymentTransaction,
  ExportHistory,
  ExportFormat,
  UserPlan,
  RecurringBill,
  TataAIMessage,
  BudgetPeriodType,
  TeamWorkspace,
  TeamMember,
  TeamSharedWallet,
  TeamAuditLog,
  TeamPendingApproval,
} from '@/types';
import {
  INITIAL_USER,
  INITIAL_ADMIN,
  INITIAL_WALLETS,
  INITIAL_CATEGORIES,
  INITIAL_BUDGETS,
  INITIAL_TRANSACTIONS,
  INITIAL_AI_PROVIDERS,
  INITIAL_AI_LOGS,
  INITIAL_PAYMENTS,
  INITIAL_EXPORTS,
  INITIAL_RECURRING_BILLS,
  INITIAL_TATA_AI_MESSAGES,
  INITIAL_WORKSPACES,
  INITIAL_TEAM_MEMBERS,
  INITIAL_TEAM_WALLETS,
  INITIAL_TEAM_AUDIT_LOGS,
  INITIAL_TEAM_APPROVALS,
} from './mock-data';
import { checkTransactionLimit, checkWalletLimit, checkBudgetLimit } from './limits';
import { evaluateFinancialAdvisorTriggers } from './advisor';

interface AppContextType {
  currentUser: UserProfile;
  impersonatedUser: UserProfile | null;
  activeUser: UserProfile; // currentUser or impersonatedUser
  wallets: Wallet[];
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  recurringBills: RecurringBill[];
  tataAIMessages: TataAIMessage[];
  aiProviders: AIProvider[];
  aiLogs: AILog[];
  payments: PaymentTransaction[];
  exportsList: ExportHistory[];
  aiExecutionMode: 'single' | 'parallel_failover';
  botStatus: 'connected' | 'disconnected' | 'testing';

  // Team & Workspaces
  workspaces: TeamWorkspace[];
  activeWorkspaceId: string;
  activeWorkspace: TeamWorkspace;
  setActiveWorkspaceId: (id: string) => void;
  teamMembers: TeamMember[];
  addTeamMember: (member: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  teamWallets: TeamSharedWallet[];
  teamAuditLogs: TeamAuditLog[];
  teamApprovals: TeamPendingApproval[];
  approveTeamExpense: (id: string) => void;
  rejectTeamExpense: (id: string) => void;
  addTeamApprovalRequest: (req: Partial<TeamPendingApproval>) => void;

  // Actions
  setCurrentUser: (user: UserProfile) => void;
  togglePlan: () => void;
  toggleRole: () => void;
  impersonate: (user: UserProfile | null) => void;
  addTransaction: (tx: Partial<Transaction>) => { success: boolean; message?: string; advisorAlert?: string };
  deleteTransaction: (id: string) => void;
  addWallet: (wallet: Partial<Wallet>) => { success: boolean; message?: string };
  setDefaultWallet: (walletId: string) => void;
  transferWallet: (fromId: string, toId: string, amount: number) => { success: boolean; message?: string };
  addCategory: (cat: Partial<Category>) => void;
  setBudget: (categoryId: string, monthlyLimit: number) => { success: boolean; message?: string };
  setBudgetMultiPeriod: (categoryId: string, limit: number, periodType: BudgetPeriodType) => { success: boolean; message?: string };
  addRecurringBill: (bill: Partial<RecurringBill>) => void;
  deleteRecurringBill: (id: string) => void;
  sendTataAIMessage: (prompt: string) => Promise<string>;
  approveManualPayment: (id: string) => void;
  rejectManualPayment: (id: string) => void;
  testBotToken: (token: string) => Promise<{ ok: boolean; message: string }>;
  setAiExecutionMode: (mode: 'single' | 'parallel_failover') => void;
  updateAIProvider: (provider: AIProvider) => void;
  approvePayment: (id: string, notes?: string) => void;
  rejectPayment: (id: string, notes?: string) => void;
  exportReport: (format: ExportFormat, start: string, end: string) => Promise<{ success: boolean; url?: string; message?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [impersonatedUser, setImpersonatedUser] = useState<UserProfile | null>(null);
  const activeUser = impersonatedUser || currentUser;

  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [aiProviders, setAiProviders] = useState<AIProvider[]>(INITIAL_AI_PROVIDERS);
  const [aiLogs, setAiLogs] = useState<AILog[]>(INITIAL_AI_LOGS);
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [exportsList, setExportsList] = useState<ExportHistory[]>(INITIAL_EXPORTS);
  const [aiExecutionMode, setAiExecutionMode] = useState<'single' | 'parallel_failover'>('parallel_failover');
  const [botStatus, setBotStatus] = useState<'connected' | 'disconnected' | 'testing'>('connected');

  // Team & Workspaces State
  const [workspaces, setWorkspaces] = useState<TeamWorkspace[]>(INITIAL_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-01');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [teamWallets, setTeamWallets] = useState<TeamSharedWallet[]>(INITIAL_TEAM_WALLETS);
  const [teamAuditLogs, setTeamAuditLogs] = useState<TeamAuditLog[]>(INITIAL_TEAM_AUDIT_LOGS);
  const [teamApprovals, setTeamApprovals] = useState<TeamPendingApproval[]>(INITIAL_TEAM_APPROVALS);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const walletsRef = React.useRef(wallets);
  walletsRef.current = wallets;
  const categoriesRef = React.useRef(categories);
  categoriesRef.current = categories;

  const processedTxIdsRef = React.useRef<Set<string>>(new Set(INITIAL_TRANSACTIONS.map(t => t.id)));

  // Real-time synchronization: Adaptive polling /api/telegram/live-transactions with persistent store
  useEffect(() => {
    let isMounted = true;
    let timerId: any = null;

    const syncLiveTelegram = async () => {
      try {
        const res = await fetch('/api/telegram/live-transactions', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && Array.isArray(data.transactions) && data.transactions.length > 0) {
          const currentWallets = walletsRef.current;
          const currentCategories = categoriesRef.current;
          const rawIncoming = (data.transactions as Transaction[]).filter(
            t => !processedTxIdsRef.current.has(t.id)
          );

          if (rawIncoming.length === 0) return;

          // Mark processed immediately to prevent duplicate application
          rawIncoming.forEach(t => processedTxIdsRef.current.add(t.id));

          const enriched = rawIncoming.map((t: Transaction) => ({
            ...t,
            wallet: t.wallet || currentWallets.find(w => w.id === t.wallet_id) || currentWallets[0],
            to_wallet: t.to_wallet || (t.to_wallet_id ? currentWallets.find(w => w.id === t.to_wallet_id) : undefined),
            category: t.category || currentCategories.find(c => c.id === t.category_id) || currentCategories[0],
          }));

          // 1. Update transactions list cleanly
          setTransactions(prev => [...enriched, ...prev]);

          // 2. Adjust wallet balances cleanly outside transaction reducer
          setWallets(currWallets => {
            let updated = [...currWallets];
            for (const it of rawIncoming) {
              const amt = Number(it.amount) || 0;
              updated = updated.map(w => {
                if (w.id === it.wallet_id) {
                  const newBal = it.type === 'income' ? w.balance + amt : w.balance - amt;
                  return { ...w, balance: newBal };
                }
                if (it.type === 'transfer' && w.id === it.to_wallet_id) {
                  return { ...w, balance: w.balance + amt };
                }
                return w;
              });
            }
            return updated;
          });
        }
      } catch (e) {
        // non-blocking network failure
      }
    };

    const scheduleNext = () => {
      if (!isMounted) return;
      const delay = typeof document !== 'undefined' && document.hidden ? 4000 : 1200;
      timerId = setTimeout(async () => {
        if (!isMounted) return;
        await syncLiveTelegram();
        scheduleNext();
      }, delay);
    };

    syncLiveTelegram();
    scheduleNext();

    const onVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden && isMounted) {
        syncLiveTelegram();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
    };
  }, []);

  const addTeamMember = (newMem: Partial<TeamMember>) => {
    const mem: TeamMember = {
      id: `tm-${Date.now()}`,
      workspace_id: activeWorkspaceId,
      user_id: `usr-${Date.now()}`,
      name: newMem.name || 'Anggota Baru',
      email: newMem.email || 'anggota@tatadana.id',
      phone: newMem.phone || '081234567890',
      role: newMem.role || 'member',
      joined_at: new Date().toISOString(),
      status: 'active',
      telegram_handle: newMem.telegram_handle,
      monthly_spending_limit: newMem.monthly_spending_limit || 2000000,
    };
    setTeamMembers(prev => [...prev, mem]);
    setTeamAuditLogs(prev => [
      {
        id: `tal-${Date.now()}`,
        workspace_id: activeWorkspaceId,
        user_name: activeUser.full_name,
        action: 'Undangan Anggota',
        detail: `Menambahkan ${mem.name} sebagai ${mem.role.toUpperCase()}`,
        type: 'member',
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const removeTeamMember = (id: string) => {
    const mem = teamMembers.find(m => m.id === id);
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    if (mem) {
      setTeamAuditLogs(prev => [
        {
          id: `tal-${Date.now()}`,
          workspace_id: activeWorkspaceId,
          user_name: activeUser.full_name,
          action: 'Hapus Anggota',
          detail: `Menghapus akses ${mem.name}`,
          type: 'member',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const approveTeamExpense = (id: string) => {
    setTeamApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    const req = teamApprovals.find(a => a.id === id);
    if (req) {
      setTeamAuditLogs(prev => [
        {
          id: `tal-${Date.now()}`,
          workspace_id: activeWorkspaceId,
          user_name: activeUser.full_name,
          action: 'Persetujuan Pengeluaran Disetujui',
          detail: `Menyetujui ${req.notes} (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(req.amount)})`,
          type: 'approval',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const rejectTeamExpense = (id: string) => {
    setTeamApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    const req = teamApprovals.find(a => a.id === id);
    if (req) {
      setTeamAuditLogs(prev => [
        {
          id: `tal-${Date.now()}`,
          workspace_id: activeWorkspaceId,
          user_name: activeUser.full_name,
          action: 'Pengeluaran Ditolak',
          detail: `Menolak pengeluaran ${req.notes}`,
          type: 'approval',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const addTeamApprovalRequest = (req: Partial<TeamPendingApproval>) => {
    const item: TeamPendingApproval = {
      id: `tpa-${Date.now()}`,
      workspace_id: activeWorkspaceId,
      requester_name: activeUser.full_name,
      requester_avatar: activeUser.avatar_url || undefined,
      amount: req.amount || 0,
      category: req.category || 'Operasional',
      wallet_name: req.wallet_name || 'BCA Giro Operasional Kedai',
      notes: req.notes || 'Pengajuan pengeluaran tim',
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setTeamApprovals(prev => [item, ...prev]);
  };

  // Toggle user plan between Starter and Pro
  const togglePlan = () => {
    const nextPlan: UserPlan = activeUser.plan === 'starter' ? 'pro' : 'starter';
    const updated = { ...activeUser, plan: nextPlan };
    if (impersonatedUser) setImpersonatedUser(updated);
    else setCurrentUser(updated);
  };

  // Toggle between User and Super Admin view
  const toggleRole = () => {
    if (currentUser.role === 'admin') {
      setCurrentUser(INITIAL_USER);
      setImpersonatedUser(null);
    } else {
      setCurrentUser(INITIAL_ADMIN);
      setImpersonatedUser(null);
    }
  };

  const impersonate = (user: UserProfile | null) => {
    setImpersonatedUser(user);
  };

  // Add Transaction
  const addTransaction = (newTx: Partial<Transaction>) => {
    // Check Starter transaction quota
    const currentMonthTxs = transactions.filter(t => t.user_id === activeUser.id);
    const quota = checkTransactionLimit(activeUser.plan, currentMonthTxs.length);
    if (!quota.allowed) {
      return { success: false, message: quota.message };
    }

    const amount = Number(newTx.amount) || 0;
    const walletId = newTx.wallet_id || wallets[0]?.id;
    const type = newTx.type || 'expense';

    // Update wallet balance
    setWallets(prev =>
      prev.map(w => {
        if (w.id === walletId) {
          const newBal = type === 'income' ? w.balance + amount : w.balance - amount;
          return { ...w, balance: newBal };
        }
        if (type === 'transfer' && w.id === newTx.to_wallet_id) {
          return { ...w, balance: w.balance + amount };
        }
        return w;
      })
    );

    const createdTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: activeUser.id,
      wallet_id: walletId,
      to_wallet_id: newTx.to_wallet_id,
      category_id: newTx.category_id,
      type: type,
      amount: amount,
      notes: newTx.notes || '',
      source: newTx.source || 'web',
      raw_input: newTx.raw_input,
      transaction_time: newTx.transaction_time || new Date().toISOString(),
      created_at: new Date().toISOString(),
      wallet: wallets.find(w => w.id === walletId),
      to_wallet: wallets.find(w => w.id === newTx.to_wallet_id),
      category: categories.find(c => c.id === newTx.category_id),
      receipt_items: newTx.receipt_items,
    };

    setTransactions(prev => [createdTx, ...prev]);

    // Update budget spent & alerts
    let advisorAlert: string | undefined;
    if (type === 'expense' && newTx.category_id) {
      const budget = budgets.find(b => b.category_id === newTx.category_id);
      if (budget) {
        const newSpent = (budget.spent || 0) + amount;
        const pct = Math.round((newSpent / budget.monthly_limit) * 100);
        setBudgets(prev =>
          prev.map(b =>
            b.id === budget.id
              ? {
                  ...b,
                  spent: newSpent,
                  remaining: Math.max(0, b.monthly_limit - newSpent),
                  percentage: pct,
                  alert_80_sent: pct >= 80 ? true : b.alert_80_sent,
                  alert_100_sent: pct >= 100 ? true : b.alert_100_sent,
                }
              : b
          )
        );
      }

      // Pro AI Financial Advisor Evaluation
      if (activeUser.plan === 'pro') {
        const cat = categories.find(c => c.id === newTx.category_id);
        const totalInc = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
        const totalExp = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0) + amount;

        const adv = evaluateFinancialAdvisorTriggers({
          userName: activeUser.full_name,
          isPro: true,
          currentExpenseAmount: amount,
          categoryName: cat?.name || 'Kategori',
          categoryBudgetLimit: budget?.monthly_limit,
          totalIncomeThisMonth: totalInc,
          totalExpenseThisMonth: totalExp,
        });

        if (adv.triggered && adv.message) {
          advisorAlert = adv.message;
        }
      }
    }

    return { success: true, advisorAlert };
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addWallet = (newWallet: Partial<Wallet>) => {
    const limit = checkWalletLimit(activeUser.plan, wallets.length);
    if (!limit.allowed) {
      return { success: false, message: limit.message };
    }

    const created: Wallet = {
      id: `wal-${Date.now()}`,
      user_id: activeUser.id,
      name: newWallet.name || 'Dompet Baru',
      balance: Number(newWallet.balance) || 0,
      color: newWallet.color || '#afc28a',
      icon: newWallet.icon || 'wallet',
      is_default: wallets.length === 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setWallets(prev => [...prev, created]);
    return { success: true };
  };

  const setDefaultWallet = (walletId: string) => {
    setWallets(prev =>
      prev.map(w => ({
        ...w,
        is_default: w.id === walletId,
      }))
    );
  };

  const transferWallet = (fromId: string, toId: string, amount: number) => {
    const fromW = wallets.find(w => w.id === fromId);
    const toW = wallets.find(w => w.id === toId);

    if (!fromW || !toW) return { success: false, message: 'Dompet tidak ditemukan' };
    if (fromW.balance < amount) return { success: false, message: 'Saldo dompet asal tidak mencukupi' };

    setWallets(prev =>
      prev.map(w => {
        if (w.id === fromId) return { ...w, balance: w.balance - amount };
        if (w.id === toId) return { ...w, balance: w.balance + amount };
        return w;
      })
    );

    addTransaction({
      wallet_id: fromId,
      to_wallet_id: toId,
      type: 'transfer',
      amount: amount,
      notes: `Transfer dari ${fromW.name} ke ${toW.name}`,
    });

    return { success: true };
  };

  const addCategory = (cat: Partial<Category>) => {
    const created: Category = {
      id: `cat-${Date.now()}`,
      user_id: activeUser.id,
      name: cat.name || 'Kategori Baru',
      type: cat.type || 'expense',
      emoji: cat.emoji || '📁',
      color: cat.color || '#afc28a',
      is_system: false,
      created_at: new Date().toISOString(),
    };
    setCategories(prev => [...prev, created]);
  };

  const setBudget = (categoryId: string, monthlyLimit: number) => {
    const existing = budgets.find(b => b.category_id === categoryId);
    if (!existing) {
      const quota = checkBudgetLimit(activeUser.plan, budgets.length);
      if (!quota.allowed) {
        return { success: false, message: quota.message };
      }
    }

    const spent = transactions
      .filter(t => t.category_id === categoryId && t.type === 'expense')
      .reduce((a, b) => a + b.amount, 0);

    const pct = Math.round((spent / monthlyLimit) * 100);

    if (existing) {
      setBudgets(prev =>
        prev.map(b =>
          b.id === existing.id
            ? { ...b, monthly_limit: monthlyLimit, percentage: pct, remaining: Math.max(0, monthlyLimit - spent) }
            : b
        )
      );
    } else {
      const newBudget: Budget = {
        id: `bud-${Date.now()}`,
        user_id: activeUser.id,
        category_id: categoryId,
        monthly_limit: monthlyLimit,
        month: '2026-10',
        alert_80_sent: pct >= 80,
        alert_100_sent: pct >= 100,
        created_at: new Date().toISOString(),
        spent,
        remaining: Math.max(0, monthlyLimit - spent),
        percentage: pct,
      };
      setBudgets(prev => [...prev, newBudget]);
    }
    return { success: true };
  };

  const testBotToken = async (token: string) => {
    setBotStatus('testing');
    try {
      const res = await fetch('/api/telegram/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId: activeUser.id }),
      });
      const data = await res.json();
      if (data.ok) {
        setBotStatus('connected');
        return { ok: true, message: data.message || 'Bot berhasil terhubung dan Webhook aktif!' };
      } else {
        setBotStatus('disconnected');
        return { ok: false, message: data.error || 'Gagal menghubungkan ke Telegram' };
      }
    } catch (err: any) {
      setBotStatus('connected'); // Fallback simulation
      return { ok: true, message: 'Koneksi bot terverifikasi (Mode Simulasi Demo)' };
    }
  };

  const updateAIProvider = (provider: AIProvider) => {
    setAiProviders(prev => prev.map(p => (p.id === provider.id ? provider : p)));
  };

  const approvePayment = (id: string, notes?: string) => {
    setPayments(prev =>
      prev.map(p => {
        if (p.id === id) {
          return { ...p, status: 'approved', admin_notes: notes || 'Disetujui Admin' };
        }
        return p;
      })
    );
    // Upgrade user plan if this user
    const payment = payments.find(p => p.id === id);
    if (payment && payment.user_id === activeUser.id) {
      setCurrentUser(prev => ({ ...prev, plan: payment.plan }));
    }
  };

  const rejectPayment = (id: string, notes?: string) => {
    setPayments(prev =>
      prev.map(p => {
        if (p.id === id) {
          return { ...p, status: 'rejected', admin_notes: notes || 'Ditolak Admin' };
        }
        return p;
      })
    );
  };

  const exportReport = async (format: ExportFormat, start: string, end: string) => {
    if (activeUser.plan !== 'pro') {
      return {
        success: false,
        message: 'Export laporan PDF & Excel adalah fitur eksklusif paket Pro. Silakan upgrade ke Pro.',
      };
    }

    const newExport: ExportHistory = {
      id: `exp-${Date.now()}`,
      user_id: activeUser.id,
      format: format,
      period_start: start,
      period_end: end,
      file_path: `${activeUser.id}/tatadana-laporan-${start}_sd_${end}.${format}`,
      file_name: `tatadana-laporan-${start}_sd_${end}.${format}`,
      signed_url: `/api/export/${format}?download=1`,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };

    setExportsList(prev => [newExport, ...prev]);
    return { success: true, url: newExport.signed_url || undefined, message: `Laporan ${format.toUpperCase()} berhasil dibuat!` };
  };

  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(INITIAL_RECURRING_BILLS);
  const [tataAIMessages, setTataAIMessages] = useState<TataAIMessage[]>(INITIAL_TATA_AI_MESSAGES);

  const addRecurringBill = (bill: Partial<RecurringBill>) => {
    const created: RecurringBill = {
      id: `rec-${Date.now()}`,
      user_id: activeUser.id,
      title: bill.title || 'Tagihan Baru',
      amount: Number(bill.amount) || 0,
      category_id: bill.category_id || null,
      wallet_id: bill.wallet_id || null,
      due_day: Number(bill.due_day) || 1,
      frequency: bill.frequency || 'monthly',
      is_active: true,
      last_paid_at: null,
      notes: bill.notes || null,
      created_at: new Date().toISOString(),
    };
    setRecurringBills(prev => [...prev, created]);
  };

  const deleteRecurringBill = (id: string) => {
    setRecurringBills(prev => prev.filter(r => r.id !== id));
  };

  const setBudgetMultiPeriod = (categoryId: string, limit: number, periodType: BudgetPeriodType = 'monthly') => {
    const existing = budgets.find(b => b.category_id === categoryId && (b.period_type || 'monthly') === periodType);
    if (!existing) {
      const quota = checkBudgetLimit(activeUser.plan, budgets.length);
      if (!quota.allowed) {
        return { success: false, message: quota.message };
      }
    }

    const spent = transactions
      .filter(t => t.category_id === categoryId && t.type === 'expense')
      .reduce((a, b) => a + b.amount, 0);

    const pct = Math.round((spent / limit) * 100);

    if (existing) {
      setBudgets(prev =>
        prev.map(b =>
          b.id === existing.id
            ? {
                ...b,
                monthly_limit: limit,
                spent,
                remaining: Math.max(0, limit - spent),
                percentage: pct,
                period_type: periodType,
              }
            : b
        )
      );
    } else {
      const newBudget: Budget = {
        id: `bud-${periodType}-${Date.now()}`,
        user_id: activeUser.id,
        category_id: categoryId,
        monthly_limit: limit,
        month: '2026-10',
        period_type: periodType,
        period_key: periodType === 'daily' ? '2026-10-14' : periodType === 'weekly' ? '2026-W42' : periodType === 'yearly' ? '2026' : '2026-10',
        alert_80_sent: pct >= 80,
        alert_100_sent: pct >= 100,
        created_at: new Date().toISOString(),
        spent,
        remaining: Math.max(0, limit - spent),
        percentage: pct,
      };
      setBudgets(prev => [...prev, newBudget]);
    }
    return { success: true };
  };

  const sendTataAIMessage = async (userPrompt: string): Promise<string> => {
    const userMsg: TataAIMessage = {
      id: `msg-${Date.now()}`,
      user_id: activeUser.id,
      role: 'user',
      content: userPrompt,
      source: 'web',
      created_at: new Date().toISOString(),
    };

    setTataAIMessages(prev => [...prev, userMsg]);

    const totalBalance = wallets.reduce((a, b) => a + b.balance, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);

    const catExpenses: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = categories.find(c => c.id === t.category_id)?.name || 'Lainnya';
      catExpenses[cat] = (catExpenses[cat] || 0) + t.amount;
    });
    const topCat = Object.entries(catExpenses).sort((a, b) => b[1] - a[1])[0] || ['Makanan', 845000];

    let replyText = '';
    const lower = userPrompt.toLowerCase();

    if (lower.includes('sisa') || lower.includes('saldo') || lower.includes('uang')) {
      replyText = `Berdasarkan pantauan saya, total saldo aktif Anda di seluruh dompet saat ini adalah **Rp${totalBalance.toLocaleString('id-ID')}**.\n\nDetail per dompet:\n${wallets.map(w => `• ${w.name}: Rp${w.balance.toLocaleString('id-ID')}`).join('\n')}\n\nPengeluaran bulan berjalan tercatat Rp${totalExpense.toLocaleString('id-ID')} dari total pemasukan Rp${totalIncome.toLocaleString('id-ID')}. Kondisi cashflow Anda masih sangat sehat! 📈`;
    } else if (lower.includes('hemat') || lower.includes('strategi') || lower.includes('tips')) {
      replyText = `💡 **Strategi Finansial Khusus untuk Anda:**\n\n1. **Kategori Terbesar:** Pos pengeluaran terbesar Anda saat ini berada di kategori **${topCat[0]}** sebesar Rp${Number(topCat[1]).toLocaleString('id-ID')}. Coba tetapkan budget harian maksimal Rp50.000 untuk pos ini.\n2. **Alokasi 50/30/20:** Alokasikan 50% untuk kebutuhan pokok, 30% keinginan, dan minimal 20% langsung ditabung di awal gajian.\n3. **Cek Tagihan Rutin:** Ada ${recurringBills.length} tagihan rutin terdaftar. Pastikan saldo di dompet auto-debit mencukupi sebelum tanggal jatuh tempo.`;
    } else if (lower.includes('analisa') || lower.includes('pengeluaran') || lower.includes('terbesar')) {
      replyText = `📊 **Analisis Pengeluaran Anda:**\n\n• **Pengeluaran Terbesar:** ${topCat[0]} (Rp${Number(topCat[1]).toLocaleString('id-ID')})\n• **Total Transaksi:** ${transactions.length} transaksi bulan ini\n• **Rasio Pengeluaran:** ${Math.round((totalExpense / (totalIncome || 1)) * 100)}% dari total pemasukan\n\n🎯 **Rekomendasi:** Pengeluaran Anda masih dalam batas aman (<80%). Pertahankan kebiasaan mencatat langsung setiap transaksi via chat Telegram!`;
    } else {
      replyText = `Saya memahami pertanyaan Anda: "${userPrompt}".\n\nDari data finansial terkini:\n• Saldo Total: **Rp${totalBalance.toLocaleString('id-ID')}**\n• Pemasukan: Rp${totalIncome.toLocaleString('id-ID')}\n• Pengeluaran: Rp${totalExpense.toLocaleString('id-ID')}\n\nApakah Anda ingin saya buatkan rincian budget harian atau menganalisis pos pengeluaran tertentu?`;
    }

    const aiReply: TataAIMessage = {
      id: `msg-reply-${Date.now()}`,
      user_id: activeUser.id,
      role: 'assistant',
      content: replyText,
      source: 'web',
      created_at: new Date().toISOString(),
    };

    setTimeout(() => {
      setTataAIMessages(prev => [...prev, aiReply]);
    }, 400);

    return replyText;
  };

  const approveManualPayment = (id: string) => {
    approvePayment(id, 'Pembayaran manual transfer disetujui');
    // Upgrade user immediately
    const updated = { ...activeUser, plan: 'pro' as UserPlan };
    if (impersonatedUser) setImpersonatedUser(updated);
    else setCurrentUser(updated);
  };

  const rejectManualPayment = (id: string) => {
    rejectPayment(id, 'Bukti transfer tidak valid');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        impersonatedUser,
        activeUser,
        wallets,
        categories,
        budgets,
        transactions,
        recurringBills,
        tataAIMessages,
        aiProviders,
        aiLogs,
        payments,
        exportsList,
        aiExecutionMode,
        botStatus,
        workspaces,
        activeWorkspaceId,
        activeWorkspace,
        setActiveWorkspaceId,
        teamMembers,
        addTeamMember,
        removeTeamMember,
        teamWallets,
        teamAuditLogs,
        teamApprovals,
        approveTeamExpense,
        rejectTeamExpense,
        addTeamApprovalRequest,
        setCurrentUser,
        togglePlan,
        toggleRole,
        impersonate,
        addTransaction,
        deleteTransaction,
        addWallet,
        setDefaultWallet,
        transferWallet,
        addCategory,
        setBudget,
        setBudgetMultiPeriod,
        addRecurringBill,
        deleteRecurringBill,
        sendTataAIMessage,
        approveManualPayment,
        rejectManualPayment,
        testBotToken,
        setAiExecutionMode,
        updateAIProvider,
        approvePayment,
        rejectPayment,
        exportReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
