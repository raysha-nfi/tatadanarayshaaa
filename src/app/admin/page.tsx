'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA SUPERADMIN PORTAL (PART 10 & DISPATCH REQUIREMENTS)
// Navigation Tabs: Overview, AI Providers, AI Call Logs, User Management,
// Payment Verifications, Privacy Audit Logs.
// User Impersonation with mandatory reason & persistent amber banner.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Cpu,
  CreditCard,
  FileCode2,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Save,
  Search,
  Download,
  Lock,
  ExternalLink,
  ChevronRight,
  Activity,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Filter,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useAdmin, AdminUser, ExtendedAILog } from './admin-context';
import { formatRupiah } from '@/lib/currency';
import { formatIndonesianDate, formatIndonesianTime } from '@/lib/date';
import { AIProvider, AIExecutionMode, UserProfile, Transaction } from '@/types';

export default function AdminPortalPage() {
  const router = useRouter();
  const { currentUser, transactions: allTransactions, impersonatedUser, impersonate } = useApp();
  const {
    activeTab,
    setActiveTab,
    users,
    toggleUserPlan,
    auditLogs,
    impersonateUserWithReason,
    inspectTransactionsWithReason,
    payments,
    approvePaymentAdmin,
    rejectPaymentAdmin,
    providers,
    updateProvider,
    executionMode,
    setExecutionMode,
    saveProviderSettings,
    aiLogs,
  } = useAdmin();

  // ─────────────────────────────────────────────────────────────────────────
  // LOCAL STATES FOR MODALS & FORMS
  // ─────────────────────────────────────────────────────────────────────────
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Impersonation modal state
  const [impersonateModalOpen, setImpersonateModalOpen] = useState(false);
  const [targetImpersonateUser, setTargetImpersonateUser] = useState<AdminUser | null>(null);
  const [impersonateReason, setImpersonateReason] = useState('');
  const [impersonateError, setImpersonateError] = useState<string | null>(null);

  // Transaction Inspection modal state
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [targetInspectUser, setTargetInspectUser] = useState<AdminUser | null>(null);
  const [inspectReason, setInspectReason] = useState('Pemeriksaan kendala transaksi oleh support teknis');
  const [inspectError, setInspectError] = useState<string | null>(null);
  const [inspectedTransactions, setInspectedTransactions] = useState<Transaction[]>([]);

  // Payment Proof modal state
  const [proofModalUrl, setProofModalUrl] = useState<string | null>(null);
  const [paymentActionNotice, setPaymentActionNotice] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // AI Logs Filters & Detail Modal
  const [logProviderFilter, setLogProviderFilter] = useState<string>('all');
  const [logFeatureFilter, setLogFeatureFilter] = useState<string>('all');
  const [selectedLogDetail, setSelectedLogDetail] = useState<ExtendedAILog | null>(null);

  // User list search & filter
  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<string>('all');
  const [userPlanNotice, setUserPlanNotice] = useState<string | null>(null);

  // Audit search & filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');

  // Provider state editing
  const [localProviders, setLocalProviders] = useState<AIProvider[]>(providers);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const handleToggleProviderActive = (id: string) => {
    setLocalProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
  };

  const handleProviderKeyChange = (id: string, key: string) => {
    setLocalProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, encrypted_api_key: key } : p))
    );
  };

  const handleProviderPriorityChange = (id: string, prio: number) => {
    setLocalProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, priority: prio } : p))
    );
  };

  const handleSaveProviders = () => {
    localProviders.forEach((p) => updateProvider(p));
    saveProviderSettings();
    setSaveNotice('Konfigurasi AI Provider & mode failover berhasil diperbarui di sistem!');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  // Open Impersonation Modal
  const handleOpenImpersonate = (u: AdminUser) => {
    setTargetImpersonateUser(u);
    setImpersonateReason('');
    setImpersonateError(null);
    setImpersonateModalOpen(true);
  };

  // Confirm Impersonation with Mandatory Reason
  const handleConfirmImpersonate = () => {
    if (!targetImpersonateUser) return;
    if (!impersonateReason || impersonateReason.trim().length === 0) {
      setImpersonateError('Alasan privasi wajib diisi untuk memenuhi standar kepatuhan audit data UU PDP!');
      return;
    }

    const res = impersonateUserWithReason(targetImpersonateUser, impersonateReason);
    if (!res.success) {
      setImpersonateError(res.error || 'Gagal memulai impersonasi');
      return;
    }

    setImpersonateModalOpen(false);
    router.push('/dashboard');
  };

  // Open Inspect Modal
  const handleOpenInspect = (u: AdminUser) => {
    setTargetInspectUser(u);
    setInspectReason('Pemeriksaan kendala pencatatan transaksi oleh support teknis');
    setInspectError(null);
    setInspectModalOpen(true);
  };

  // Confirm Inspect with Mandatory Reason
  const handleConfirmInspect = () => {
    if (!targetInspectUser) return;
    if (!inspectReason || inspectReason.trim().length === 0) {
      setInspectError('Alasan inspeksi wajib diisi demi kepatuhan audit privasi!');
      return;
    }

    const res = inspectTransactionsWithReason(targetInspectUser, inspectReason);
    if (!res.success) {
      setInspectError(res.error || 'Gagal melakukan inspeksi data');
      return;
    }

    setInspectedTransactions(res.transactions);
  };

  // Toggle user plan
  const handleTogglePlan = (userId: string, userName: string) => {
    const res = toggleUserPlan(userId);
    setUserPlanNotice(`Plan untuk pengguna ${userName} berhasil diubah ke ${res.newPlan.toUpperCase()}!`);
    setTimeout(() => setUserPlanNotice(null), 3000);
  };

  // Payment approval
  const handleApprovePayment = (id: string) => {
    approvePaymentAdmin(id, 'Bukti mutasi rekening terverifikasi valid oleh Admin TataDana');
    setPaymentActionNotice('Pembayaran berhasil disetujui! Akun pengguna otomatis di-upgrade ke paket Pro.');
    setTimeout(() => setPaymentActionNotice(null), 3500);
  };

  const handleRejectPayment = (id: string) => {
    rejectPaymentAdmin(id, 'Bukti transfer tidak valid atau nominal tidak sesuai');
    setPaymentActionNotice('Pembayaran ditolak. Catatan penolakan tersimpan di audit log.');
    setTimeout(() => setPaymentActionNotice(null), 3500);
  };

  // Export Users to CSV
  const handleExportUsers = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Nama,Nomor HP,OTP Terverifikasi,Plan,Telegram Terhubung,Tanggal Bergabung\n' +
      users
        .map(
          (u) =>
            `"${u.id}","${u.full_name}","${u.phone_number || '-'}","${
              u.phone_verified ? 'Ya' : 'Belum'
            }","${u.plan.toUpperCase()}","${u.telegram_connected ? 'Ya' : 'Tidak'}","${
              u.created_at
            }"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tatadana-user-management-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED STATS
  // ─────────────────────────────────────────────────────────────────────────
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const successAICalls = aiLogs.filter((l) => l.status === 'success');
  const avgLatency =
    aiLogs.length > 0
      ? Math.round(aiLogs.reduce((acc, l) => acc + l.latency_ms, 0) / aiLogs.length)
      : 450;
  const activeProvidersCount = providers.filter((p) => p.is_active).length;

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    if (paymentFilter === 'all') return true;
    return p.status === paymentFilter;
  });

  // Filtered AI Logs
  const filteredAiLogs = aiLogs.filter((log) => {
    if (logProviderFilter !== 'all' && log.provider !== logProviderFilter) return false;
    if (logFeatureFilter !== 'all' && log.feature !== logFeatureFilter) return false;
    return true;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      !userSearch ||
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone_number?.includes(userSearch) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase());
    const matchesPlan = userPlanFilter === 'all' || u.plan === userPlanFilter;
    return matchesQuery && matchesPlan;
  });

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((a) => {
    const matchesQuery =
      !auditSearch ||
      a.target_user.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.reason.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.admin_name.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesAction = auditActionFilter === 'all' || a.action === auditActionFilter;
    return matchesQuery && matchesAction;
  });

  // Navigation tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'providers', label: 'AI Providers & Failover', icon: Cpu, badge: `${activeProvidersCount}/3` },
    { id: 'logs', label: 'AI Call Logs', icon: FileCode2, badge: `${aiLogs.length}` },
    { id: 'users', label: 'Kelola Pengguna', icon: Users, badge: `${users.length}` },
    { id: 'payments', label: 'Verifikasi Pembayaran', icon: CreditCard, badge: pendingPayments.length > 0 ? `${pendingPayments.length} Pending` : undefined, badgeColor: 'amber' },
    { id: 'audit', label: 'Audit Log Privasi', icon: Lock, badge: `${auditLogs.length}` },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Superadmin Portal & Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Live Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pusat manajemen AI failover, verifikasi transaksi Midtrans, otorisasi impersonasi pengguna, dan audit UU PDP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/approval"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Pusat Approval Panel</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold text-[11px]">System: Fully Operational</span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL TAB NAVIGATION (MANDATORY REQUIREMENT) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-thin">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{t.label}</span>
              {t.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ml-0.5 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : t.badgeColor === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: OVERVIEW & SYSTEM METRICS */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('logs')}
              className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total AI Calls</span>
                <Cpu className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-3xl font-black text-white mt-2">{aiLogs.length}</h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {successAICalls.length} berhasil ({Math.round((successAICalls.length / (aiLogs.length || 1)) * 100)}%)
              </p>
            </div>

            <div
              onClick={() => setActiveTab('providers')}
              className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Rata-Rata Latensi AI</span>
                <Clock className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-3xl font-black text-white mt-2">{avgLatency} ms</h3>
              <p className="text-[11px] text-purple-400 mt-1 font-semibold">
                Mode: {executionMode === 'parallel_failover' ? 'Paralel Failover' : 'Single Provider'}
              </p>
            </div>

            <div
              onClick={() => setActiveTab('users')}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pengguna Terdaftar</span>
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black text-white mt-2">{users.length}</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {users.filter((u) => u.plan === 'pro').length} Pro • {users.filter((u) => u.telegram_connected).length} Telegram Linked
              </p>
            </div>

            <Link
              href="/admin/approval"
              className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-amber-950/20 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] block group"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Pusat Approval Admin</span>
                <CheckCircle2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-3xl font-black text-amber-400 mt-2">{pendingPayments.length} Antrean</h3>
              <p className="text-[11px] text-amber-300/80 mt-1 flex items-center gap-1 font-bold">
                Buka Pusat Approval Khusus Admin →
              </p>
            </Link>
          </div>

          {/* Infrastructure Health Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Status Infrastruktur AI & Failover Pipeline
              </h3>
              <span className="text-xs font-bold text-purple-400">Cascading Fallback Siap</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">1. Google Gemini 1.5 Flash</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Prioritas 1 (Utama)
                  </span>
                </div>
                <p className="text-xs text-slate-400">Default engine untuk teks & audio voice note STT.</p>
                <div className="text-[11px] text-slate-500 font-mono">Status: 200 OK • Latency: ~380ms</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">2. OpenAI GPT-4o-mini</span>
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                    Prioritas 2 (Cadangan 1)
                  </span>
                </div>
                <p className="text-xs text-slate-400">Failover otomatis jika Gemini terkena rate limit 429.</p>
                <div className="text-[11px] text-slate-500 font-mono">Status: Siaga Standby • Latency: ~620ms</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">3. DeepSeek Chat V3</span>
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                    Prioritas 3 (Cadangan 2)
                  </span>
                </div>
                <p className="text-xs text-slate-400">Fallback terakhir sebelum rule-based parser lokal.</p>
                <div className="text-[11px] text-slate-500 font-mono">Status: Siaga Standby • Latency: ~780ms</div>
              </div>
            </div>
          </div>

          {/* Quick Jump Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('providers')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500 cursor-pointer transition-all group"
            >
              <Cpu className="w-7 h-7 text-purple-400 group-hover:scale-110 transition-transform mb-3" />
              <h4 className="text-sm font-bold text-white">AI Providers & Failover</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Kelola API Keys (Gemini, OpenAI, DeepSeek), urutan prioritas, dan mode failover.
              </p>
              <div className="mt-4 text-xs font-bold text-purple-400 flex items-center gap-1">
                Kelola Provider <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('users')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500 cursor-pointer transition-all group"
            >
              <Users className="w-7 h-7 text-sky-400 group-hover:scale-110 transition-transform mb-3" />
              <h4 className="text-sm font-bold text-white">Kelola Pengguna & Impersonasi</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ubah plan Starter/Pro, pairing status Telegram, dan masuk ke akun pengguna dengan alasan audit.
              </p>
              <div className="mt-4 text-xs font-bold text-sky-400 flex items-center gap-1">
                Buka Pengguna <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('payments')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 cursor-pointer transition-all group"
            >
              <CreditCard className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform mb-3" />
              <h4 className="text-sm font-bold text-white">Verifikasi Pembayaran</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Review pesanan Midtrans dan bukti mutasi BCA dengan approval instan upgrade ke Pro.
              </p>
              <div className="mt-4 text-xs font-bold text-amber-400 flex items-center gap-1">
                Periksa Pembayaran <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: AI PROVIDERS & FAILOVER ENGINE */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'providers' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Multi-Provider AI & Failover Management
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Konfigurasi API Keys (Gemini, OpenAI, DeepSeek), prioritas eksekusi, dan mode failover otomatis.
              </p>
            </div>

            <button
              onClick={handleSaveProviders}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              Simpan Semua Konfigurasi
            </button>
          </div>

          {saveNotice && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {saveNotice}
            </div>
          )}

          {/* Mode Selector (Single vs Parallel Failover) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Mode Eksekusi AI Pipeline (Failover Strategy)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Pilih apakah sistem hanya menggunakan 1 provider utama atau melakukan rotasi failover bertingkat saat terjadi error HTTP 429 atau API timeout.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setExecutionMode('parallel_failover')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  executionMode === 'parallel_failover'
                    ? 'bg-purple-950/50 border-purple-500 text-purple-200 shadow-md shadow-purple-900/30 ring-1 ring-purple-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Paralel Failover (Rekomendasi 99.9% Uptime)
                  </span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                      executionMode === 'parallel_failover' ? 'bg-purple-500' : 'border border-slate-600'
                    }`}
                  >
                    {executionMode === 'parallel_failover' && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Cascading otomatis: Jika Gemini gagal / rate limit 429, otomatis dialihkan ke OpenAI GPT-4o-mini, lalu DeepSeek Chat. Bot Telegram tidak akan pernah mengalami downtime.
                </p>
              </div>

              <div
                onClick={() => setExecutionMode('single')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  executionMode === 'single'
                    ? 'bg-purple-950/50 border-purple-500 text-purple-200 shadow-md shadow-purple-900/30 ring-1 ring-purple-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    Mode Tunggal (Single Designated Provider)
                  </span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                      executionMode === 'single' ? 'bg-purple-500' : 'border border-slate-600'
                    }`}
                  >
                    {executionMode === 'single' && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Hanya mengeksekusi provider aktif dengan Prioritas 1. Menghemat panggilan API eksternal dan langsung menggunakan parser aturan lokal Indonesia jika provider utama offline.
                </p>
              </div>
            </div>
          </div>

          {/* Provider List */}
          <div className="space-y-4">
            {localProviders.map((prov) => (
              <div
                key={prov.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{prov.display_name}</h4>
                      <p className="text-xs text-slate-400">
                        Identifier: <code className="text-purple-300 font-mono">{prov.name}</code> • Model:{' '}
                        <code className="text-sky-300 font-mono">{prov.model_name}</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prov.is_active}
                        onChange={() => handleToggleProviderActive(prov.id)}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-800 border-slate-700 cursor-pointer"
                      />
                      <span className={prov.is_active ? 'text-emerald-400' : 'text-slate-500'}>
                        {prov.is_active ? '🟢 Provider Aktif' : '⚪ Non-aktif'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      API Key (Terenkripsi AES-256 di Supabase)
                    </label>
                    <input
                      type="password"
                      value={prov.encrypted_api_key}
                      onChange={(e) => handleProviderKeyChange(prov.id, e.target.value)}
                      placeholder="Masukkan Kunci API dari Provider..."
                      className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 font-mono transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Urutan Prioritas Failover
                    </label>
                    <select
                      value={prov.priority}
                      onChange={(e) => handleProviderPriorityChange(prov.id, Number(e.target.value))}
                      className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 cursor-pointer transition-colors"
                    >
                      <option value={1}>Prioritas 1 (Utama)</option>
                      <option value={2}>Prioritas 2 (Cadangan Pertama)</option>
                      <option value={3}>Prioritas 3 (Cadangan Kedua)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: AI CALL LOGS MONITOR */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'logs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Log Pemanggilan AI & Monitoring Biaya Token
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Transparansi prompt/completion tokens, response payload preview, waktu latensi, dan status failover.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={logProviderFilter}
                onChange={(e) => setLogProviderFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">Semua Provider</option>
                <option value="gemini">Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="deepseek">DeepSeek</option>
              </select>

              <select
                value={logFeatureFilter}
                onChange={(e) => setLogFeatureFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">Semua Fitur</option>
                <option value="text_parse">Teks NL Parser</option>
                <option value="receipt_ocr">Struk Vision OCR</option>
                <option value="voice_stt">Audio STT Voice</option>
                <option value="advisor">Financial Advisor</option>
              </select>
            </div>
          </div>

          {/* AI Logs Table (MANDATORY REQUIREMENT: timestamp, provider, feature, prompt/completion tokens, latency_ms, status badge) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Waktu (WIB)</th>
                    <th className="py-3.5 px-4">Provider</th>
                    <th className="py-3.5 px-4">Fitur Pipeline</th>
                    <th className="py-3.5 px-4">Prompt / Completion Tokens</th>
                    <th className="py-3.5 px-4">Latensi</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredAiLogs.map((log) => {
                    const promptTokens = log.prompt_tokens ?? Math.round(log.tokens_used * 0.75);
                    const compTokens = log.completion_tokens ?? Math.round(log.tokens_used * 0.25);
                    return (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {formatIndonesianDate(log.created_at)}
                          <span className="block text-[10px] text-slate-500 font-mono">
                            {formatIndonesianTime(log.created_at)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                              log.provider === 'gemini'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : log.provider === 'openai'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-sky-950 text-sky-300 border border-sky-800'
                            }`}
                          >
                            {log.provider}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {log.feature || log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-200 font-bold">{log.tokens_used} tokens</span>
                            <span className="text-[10px] text-slate-500">
                              (P: {promptTokens} | C: {compTokens})
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              log.latency_ms < 500
                                ? 'text-emerald-400 bg-emerald-950/40'
                                : log.latency_ms < 1000
                                ? 'text-sky-400 bg-sky-950/40'
                                : 'text-amber-400 bg-amber-950/40'
                            }`}
                          >
                            {log.latency_ms} ms
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {log.status === 'success' ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1 font-bold text-[11px]">
                              <XCircle className="w-3.5 h-3.5" /> Gagal (429)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedLogDetail(log)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] font-bold transition-colors"
                          >
                            Lihat Payload
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: USER MANAGEMENT & IMPERSONATION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Kelola Pengguna & Sesi Impersonasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Daftar akun terdaftar, toggle upgrade/downgrade Starter vs Pro, status pairing bot Telegram, dan audit impersonasi.
              </p>
            </div>

            <button
              onClick={handleExportUsers}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              Export Semua User (CSV)
            </button>
          </div>

          {userPlanNotice && (
            <div className="p-4 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              {userPlanNotice}
            </div>
          )}

          {/* Search & Plan Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari nama pengguna, nomor HP, atau user ID..."
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <select
              value={userPlanFilter}
              onChange={(e) => setUserPlanFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">Semua Paket</option>
              <option value="pro">Khusus Paket Pro</option>
              <option value="starter">Khusus Paket Starter</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Nama & ID Pengguna</th>
                    <th className="py-3.5 px-4">Nomor HP (OTP)</th>
                    <th className="py-3.5 px-4">Plan Aktif (Toggle)</th>
                    <th className="py-3.5 px-4">Pairing Bot Telegram</th>
                    <th className="py-3.5 px-4">Bergabung</th>
                    <th className="py-3.5 px-4 text-right">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-white text-sm">{u.full_name}</div>
                        <div className="font-mono text-[10px] text-slate-500">{u.id}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                        {u.phone_number || '-'}
                        {u.phone_verified ? (
                          <span className="block text-[10px] text-emerald-400 font-sans font-bold">
                            ✓ Terverifikasi OTP
                          </span>
                        ) : (
                          <span className="block text-[10px] text-slate-500 font-sans">
                            Belum Verifikasi
                          </span>
                        )}
                      </td>

                      {/* PLAN TOGGLE (MANDATORY REQUIREMENT: plan upgrade/downgrade toggle 'starter' vs 'pro') */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              u.plan === 'pro'
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {u.plan}
                          </span>

                          <button
                            onClick={() => handleTogglePlan(u.id, u.full_name)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              u.plan === 'starter'
                                ? 'bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/40'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                            }`}
                            title={`Klik untuk mengubah paket ke ${u.plan === 'starter' ? 'PRO' : 'STARTER'}`}
                          >
                            {u.plan === 'starter' ? 'Upgrade ke Pro ⚡' : 'Downgrade ↺'}
                          </button>
                        </div>
                      </td>

                      {/* TELEGRAM PAIRING STATUS */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {u.telegram_connected ? (
                          <div>
                            <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {u.bot_username || `@Bot (${u.telegram_chat_id || 'Active'})`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Belum Dipasangkan
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatIndonesianDate(u.created_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenInspect(u)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors"
                          title="Inspeksi transaksi keuangan dengan kewajiban alasan audit"
                        >
                          Inspeksi Data
                        </button>
                        <button
                          onClick={() => handleOpenImpersonate(u)}
                          className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black transition-all shadow-sm hover:scale-105"
                          title="Masuk ke dashboard user tanpa relogin (wajib alasan audit)"
                        >
                          Impersonate ➔
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: PAYMENT VERIFICATIONS (MIDTRANS & MANUAL TRANSFER) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Verifikasi Pembayaran & Approval Paket Pro
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Tinjau pesanan Midtrans otomatis dan bukti transfer bank BCA manual. Tombol approve otomatis meng-upgrade akun ke Pro.
              </p>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setPaymentFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    paymentFilter === st
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st === 'all' ? 'Semua' : st}
                </button>
              ))}
            </div>
          </div>

          {paymentActionNotice && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {paymentActionNotice}
            </div>
          )}

          {/* Payments Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Pengguna & Paket</th>
                    <th className="py-3.5 px-4">Metode Bayar</th>
                    <th className="py-3.5 px-4">Nominal</th>
                    <th className="py-3.5 px-4">Bukti Struk Transfer</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Tanggal Order</th>
                    <th className="py-3.5 px-4 text-right">Tindakan Otorisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {p.order_id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        <span className="font-bold text-white block">
                          {p.user?.full_name || p.user_id}
                        </span>
                        <span className="text-[10px] text-purple-400 font-bold uppercase">
                          Target: Paket {p.plan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-300 block uppercase">
                          {p.payment_method === 'midtrans' ? 'Midtrans Gateway' : 'Transfer BCA Manual'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {formatRupiah(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.proof_image_url ? (
                          <button
                            onClick={() => setProofModalUrl(p.proof_image_url!)}
                            className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 underline underline-offset-2"
                          >
                            <Eye className="w-3.5 h-3.5" /> Lihat Bukti Struk
                          </button>
                        ) : (
                          <span className="text-slate-500 italic">Auto Midtrans (No Struk)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            p.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : p.status === 'rejected'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatIndonesianDate(p.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        {p.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprovePayment(p.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] shadow-sm transition-all hover:scale-105"
                            >
                              Approve (Upgrade Pro)
                            </button>
                            <button
                              onClick={() => handleRejectPayment(p.id)}
                              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] shadow-sm transition-all hover:scale-105"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-500 text-[11px]">
                            {p.admin_notes || 'Telah Diproses'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 6: PRIVACY AUDIT LOGS */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Audit Log Akses & Kepatuhan Privasi Data
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  UU PDP Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Rekaman audit permanen yang mencatat setiap inspeksi data keuangan, verifikasi transfer, dan impersonasi oleh pihak admin.
              </p>
            </div>

            <select
              value={auditActionFilter}
              onChange={(e) => setAuditActionFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">Semua Jenis Aksi</option>
              <option value="impersonate_user">Impersonasi Sesi</option>
              <option value="view_transactions">Inspeksi Transaksi</option>
              <option value="approve_payment">Approval Pembayaran</option>
              <option value="reject_payment">Penolakan Pembayaran</option>
              <option value="change_user_plan">Perubahan Paket</option>
              <option value="update_ai_providers">Update AI Providers</option>
            </select>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Cari admin, pengguna sasaran, atau alasan..."
              className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Waktu Akses (WIB)</th>
                    <th className="py-3.5 px-4">Admin Penanggung Jawab</th>
                    <th className="py-3.5 px-4">Pengguna Sasaran</th>
                    <th className="py-3.5 px-4">Tindakan / Aksi</th>
                    <th className="py-3.5 px-4">Alasan Akses (Mandatory Reason)</th>
                    <th className="py-3.5 px-4">Alamat IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredAuditLogs.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatIndonesianDate(a.created_at)}
                        <span className="block text-[10px] text-slate-500 font-mono">
                          {formatIndonesianTime(a.created_at)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {a.admin_name}
                      </td>
                      <td className="py-3.5 px-4 text-purple-300 whitespace-nowrap font-medium">
                        {a.target_user}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                            a.action === 'impersonate_user'
                              ? 'text-amber-400 bg-amber-950 border-amber-800'
                              : a.action === 'approve_payment'
                              ? 'text-emerald-400 bg-emerald-950 border-emerald-800'
                              : a.action === 'reject_payment'
                              ? 'text-red-400 bg-red-950 border-red-800'
                              : a.action === 'view_transactions'
                              ? 'text-sky-400 bg-sky-950 border-sky-800'
                              : 'text-purple-400 bg-purple-950 border-purple-800'
                          }`}
                        >
                          {a.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 max-w-sm">
                        {a.reason}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono whitespace-nowrap">
                        {a.ip_address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: IMPERSONATION WITH MANDATORY PRIVACY REASON STRING */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {impersonateModalOpen && targetImpersonateUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Masuk Sesi Impersonasi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Target: <b className="text-white">{targetImpersonateUser.full_name}</b> ({targetImpersonateUser.phone_number || targetImpersonateUser.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImpersonateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Perhatian Kepatuhan Privasi Data:
              </div>
              <p>
                Anda akan mengakses dashboard TataDana sebagai pengguna ini tanpa re-login. Banner amber persisten akan muncul di seluruh halaman, dan tindakan ini dicatat ke dalam audit log.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Alasan Privasi / Investigasi <span className="text-amber-400">*Wajib Diisi</span>
              </label>
              <textarea
                rows={3}
                value={impersonateReason}
                onChange={(e) => {
                  setImpersonateReason(e.target.value);
                  setImpersonateError(null);
                }}
                placeholder="Contoh: Investigasi komplain gagal simpan struk OCR Indomaret (Tiket Support #TD-492)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors"
              />
              {impersonateError && (
                <p className="text-[11px] text-red-400 mt-1 font-bold">{impersonateError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setImpersonateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmImpersonate}
                className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
              >
                Mulai Impersonasi ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: INSPECT USER TRANSACTIONS WITH MANDATORY REASON */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {inspectModalOpen && targetInspectUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Inspeksi Data Transaksi Pengguna
                </h3>
                <p className="text-xs text-slate-400">
                  Pengguna: <b className="text-white">{targetInspectUser.full_name}</b> ({targetInspectUser.id})
                </p>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Alasan Inspeksi Transaksi <span className="text-purple-400">*Wajib Diisi</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inspectReason}
                  onChange={(e) => {
                    setInspectReason(e.target.value);
                    setInspectError(null);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleConfirmInspect}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0"
                >
                  Muat Data
                </button>
              </div>
              {inspectError && (
                <p className="text-[11px] text-red-400 mt-1 font-bold">{inspectError}</p>
              )}
            </div>

            {inspectedTransactions.length > 0 ? (
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 text-xs border border-slate-800 rounded-xl p-2 bg-slate-950/60">
                {inspectedTransactions.map((tx) => (
                  <div key={tx.id} className="py-2 px-1 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{tx.notes || tx.raw_input || 'Transaksi Finansial'}</div>
                      <div className="text-[10px] text-slate-500">
                        {formatIndonesianDate(tx.transaction_time)} • Sumber: {tx.source}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-200">
                      {formatRupiah(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl">
                Masukkan alasan inspeksi dan klik "Muat Data" untuk membuka log transaksi.
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Tutup Inspeksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL 3: PAYMENT PROOF IMAGE VIEWER */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {proofModalUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">
                Bukti Struk Transfer Bank (Manual BCA)
              </h3>
              <button
                onClick={() => setProofModalUrl(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 max-h-96 flex items-center justify-center bg-slate-950">
              <img
                src={proofModalUrl}
                alt="Bukti Transfer"
                className="max-h-96 object-contain w-full"
              />
            </div>

            <p className="text-xs text-slate-400">
              Pastikan nominal dan nomor rekening tujuan sesuai dengan mutasi bank sebelum melakukan approval paket Pro.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setProofModalUrl(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL 4: AI LOG PAYLOAD DETAIL */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Rincian AI Call Payload ({selectedLogDetail.provider.toUpperCase()})
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {selectedLogDetail.id} • Latency: {selectedLogDetail.latency_ms} ms
                </p>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Prompt Input Payload
                </label>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {selectedLogDetail.prompt_preview || 'Tidak ada preview prompt'}
                </pre>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Response Output Payload
                </label>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {selectedLogDetail.response_preview || 'Tidak ada response'}
                </pre>
              </div>

              {selectedLogDetail.error_message && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                  <b>Pesan Error:</b> {selectedLogDetail.error_message}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
