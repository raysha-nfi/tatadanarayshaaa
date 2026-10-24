'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA PUSAT ADMIN PANEL APPROVAL (KHUSUS SUPERADMIN)
// Mengelola persetujuan pembayaran manual Midtrans/Bank, upgrade Pro, request wallet & Telegram
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  Wallet,
  Bot,
  Search,
  Filter,
  Eye,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  Download,
  RefreshCw,
  X,
  MessageSquare,
  MessageCircle,
  UserCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAdmin } from '../admin-context';
import { formatRupiah } from '@/lib/currency';
import { formatIndonesianDate } from '@/lib/date';

interface PendingRegistration {
  id: string;
  full_name: string;
  username: string;
  phone_number: string;
  email: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  verified_at?: string | null;
  verified_by?: string | null;
  notes?: string;
}

interface WalletRequest {
  id: string;
  user_name: string;
  user_phone: string;
  wallet_name: string;
  initial_balance: number;
  bank_channel: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  notes?: string;
}

interface TelegramRebindRequest {
  id: string;
  user_name: string;
  user_phone: string;
  old_bot: string;
  new_bot: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
}

const INITIAL_WALLET_REQUESTS: WalletRequest[] = [
  {
    id: 'req-wal-01',
    user_name: 'Kevin Jonathan',
    user_phone: '081987654321',
    wallet_name: 'Bank Jago Bisnis',
    initial_balance: 1500000,
    bank_channel: 'Bank Jago',
    status: 'pending',
    requested_at: '2026-10-15T14:30:00+07:00',
    notes: 'Untuk pemisahan cashflow toko online',
  },
  {
    id: 'req-wal-02',
    user_name: 'Siti Rahma',
    user_phone: '085711223344',
    wallet_name: 'Bibit Reksadana',
    initial_balance: 5000000,
    bank_channel: 'Bibit / Reksadana',
    status: 'pending',
    requested_at: '2026-10-16T09:15:00+07:00',
    notes: 'Pencatatan portofolio investasi bulanan',
  },
];

const INITIAL_TELEGRAM_REQUESTS: TelegramRebindRequest[] = [
  {
    id: 'req-tg-01',
    user_name: 'Nadia Putri',
    user_phone: '081399887766',
    old_bot: '@nadia_lama_bot',
    new_bot: '@nadia_tatadana_bot',
    reason: 'Token bot lama terhapus di BotFather',
    status: 'pending',
    requested_at: '2026-10-16T11:20:00+07:00',
  },
];

export default function AdminApprovalCenterPage() {
  const { payments, approvePaymentAdmin, rejectPaymentAdmin, users } = useAdmin();

  // Active Tab: 'registrations' | 'payments' | 'wallets' | 'telegram' | 'history'
  const [activeTab, setActiveTab] = useState<'registrations' | 'payments' | 'wallets' | 'telegram' | 'history'>('registrations');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State for Preview & Approve
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedProofImg, setSelectedProofImg] = useState<string | null>(null);

  // Local state for extra request categories
  const [walletRequests, setWalletRequests] = useState<WalletRequest[]>(INITIAL_WALLET_REQUESTS);
  const [telegramRequests, setTelegramRequests] = useState<TelegramRebindRequest[]>(INITIAL_TELEGRAM_REQUESTS);
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setActionToast({ type, message });
    setTimeout(() => setActionToast(null), 3500);
  };

  // Fetch pending registrations from API
  const fetchRegistrations = async () => {
    setIsLoadingRegistrations(true);
    try {
      const res = await fetch('/api/admin/registrations');
      const data = await res.json();
      if (data.ok && Array.isArray(data.registrations)) {
        setRegistrations(data.registrations);
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  React.useEffect(() => {
    fetchRegistrations();
  }, []);

  // Handlers for Registration Verification
  const handleApproveRegistration = async (id: string, customNotes?: string) => {
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'verify',
          notes: customNotes || 'Diverifikasi langsung oleh Superadmin via WhatsApp',
          adminName: 'Super Admin',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: 'verified', verified_at: new Date().toISOString() } : r
          )
        );
        showToast('success', `Akun ${data.registration.full_name} (@${data.registration.username}) BERHASIL DIVERIFIKASI!`);
      }
    } catch {
      showToast('error', 'Gagal memverifikasi pendaftar.');
    }
  };

  const handleRejectRegistration = async (id: string, reason?: string) => {
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'reject',
          notes: reason || 'Data pendaftaran tidak valid',
          adminName: 'Super Admin',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
        );
        showToast('error', `Pendaftaran ${data.registration.full_name} ditolak.`);
      }
    } catch {
      showToast('error', 'Gagal menolak pendaftar.');
    }
  };

  const getSendVerifiedWaLink = (reg: PendingRegistration) => {
    const cleanPhone = reg.phone_number.startsWith('0')
      ? '62' + reg.phone_number.slice(1)
      : reg.phone_number.replace('+', '');
    const msg = `Halo ${reg.full_name}! 👋\n\nKabar gembira! Akun TataDana Anda (@${reg.username}) telah BERHASIL DIVERIFIKASI oleh Admin TataDana.\n\nSekarang Anda dapat langsung login di:\n👉 http://localhost:3000/login\n\ndan menghubungkan bot Telegram @rayshaa_bot untuk mencatat transaksi keuangan otomatis.\n\nSelamat mengelola keuangan! 🚀`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const getChatDirectWaLink = (reg: PendingRegistration) => {
    const cleanPhone = reg.phone_number.startsWith('0')
      ? '62' + reg.phone_number.slice(1)
      : reg.phone_number.replace('+', '');
    const msg = `Halo ${reg.full_name}, kami dari Admin TataDana ingin mengonfirmasi pendaftaran akun Anda (@${reg.username}).`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Stats Counters
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const pendingWallets = walletRequests.filter((w) => w.status === 'pending');
  const pendingTelegrams = telegramRequests.filter((t) => t.status === 'pending');
  const pendingRegs = registrations.filter((r) => r.status === 'pending');
  const totalPending = pendingPayments.length + pendingWallets.length + pendingTelegrams.length + pendingRegs.length;

  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const approvedCount = payments.filter((p) => p.status === 'approved').length + registrations.filter((r) => r.status === 'verified').length;
  const rejectedCount = payments.filter((p) => p.status === 'rejected').length + registrations.filter((r) => r.status === 'rejected').length;

  // Handlers for Payment Approval
  const handleApprovePayment = (id: string, notes?: string) => {
    approvePaymentAdmin(id, notes || 'Disetujui dari Pusat Approval Superadmin');
    setSelectedPayment(null);
    setAdminNotes('');
    showToast('success', 'Pembayaran berhasil disetujui! Akun pengguna otomatis upgrade ke Pro.');
  };

  const handleRejectPayment = (id: string, notes?: string) => {
    rejectPaymentAdmin(id, notes || 'Bukti transfer tidak valid atau belum masuk mutasi');
    setSelectedPayment(null);
    setAdminNotes('');
    showToast('error', 'Pembayaran ditolak. Catatan tersimpan di audit trail.');
  };

  // Handlers for Wallet Requests
  const handleApproveWallet = (id: string) => {
    setWalletRequests((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'approved' } : w))
    );
    showToast('success', 'Permintaan penambahan dompet baru berhasil disetujui.');
  };

  const handleRejectWallet = (id: string) => {
    setWalletRequests((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'rejected' } : w))
    );
    showToast('error', 'Permintaan penambahan dompet ditolak.');
  };

  // Handlers for Telegram Rebind Requests
  const handleApproveTelegram = (id: string) => {
    setTelegramRequests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t))
    );
    showToast('success', 'Permintaan rebind bot Telegram disetujui.');
  };

  const handleRejectTelegram = (id: string) => {
    setTelegramRequests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'rejected' } : t))
    );
    showToast('error', 'Permintaan rebind bot Telegram ditolak.');
  };

  // Batch Approval
  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      if (activeTab === 'registrations') {
        handleApproveRegistration(id);
      } else if (activeTab === 'payments') {
        approvePaymentAdmin(id, 'Batch Approval Superadmin');
      } else if (activeTab === 'wallets') {
        handleApproveWallet(id);
      } else if (activeTab === 'telegram') {
        handleApproveTelegram(id);
      }
    });
    setSelectedIds([]);
    showToast('success', `${selectedIds.length} permintaan berhasil disetujui sekaligus.`);
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      p.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.user?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Registrations
  const filteredRegistrations = registrations.filter((r) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'approved'
        ? r.status === 'verified'
        : r.status === statusFilter;
    const matchesSearch =
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone_number.includes(searchQuery) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {actionToast && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
            actionToast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80'
              : 'bg-rose-950/90 text-rose-300 border-rose-700/80'
          }`}
        >
          {actionToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{actionToast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Restricted Area • Level 1 Approval Access
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Realtime Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pusat Approval Panel Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pusat kendali persetujuan transaksi pembayaran, upgrade paket Pro, otorisasi dompet, dan reset bot Telegram.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBatchApprove}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Setujui ({selectedIds.length}) Item Terpilih
            </button>
          )}
          <button
            onClick={() => showToast('success', 'Data antrean approval berhasil disegarkan.')}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="Refresh Antrean"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Menunggu Approval</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalPending}</span>
            <span className="text-xs text-amber-400 font-bold">permintaan</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total nominal: <span className="font-bold text-white">{formatRupiah(totalPendingAmount)}</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Disetujui</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{approvedCount}</span>
            <span className="text-xs text-emerald-400 font-bold">transaksi</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Status aktif & berbayar</p>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Ditolak</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{rejectedCount}</span>
            <span className="text-xs text-rose-400 font-bold">transaksi</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Alasan penolakan terarsip</p>
        </div>

        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">SLA Approval</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">&lt; 5 mnt</span>
            <span className="text-xs text-blue-400 font-bold">rata-rata</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Notifikasi instan via webhook</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => { setActiveTab('registrations'); setSelectedIds([]); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'registrations'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Verifikasi Pendaftar Baru</span>
            {pendingRegs.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 animate-pulse">
                {pendingRegs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('payments'); setSelectedIds([]); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'payments'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pembayaran & Upgrade Pro</span>
            {pendingPayments.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'wallets'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Otorisasi Dompet Baru</span>
            {pendingWallets.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                {pendingWallets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'telegram'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Rebind Token Telegram</span>
            {pendingTelegrams.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                {pendingTelegrams.length}
              </span>
            )}
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Cari user, order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-3 py-2 outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'all' ? 'Semua' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB: VERIFIKASI PENDAFTAR BARU VIA WHATSAPP */}
      {activeTab === 'registrations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-200">
          <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-bold">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                WhatsApp Admin: 085797805675
              </span>
              <span className="text-slate-400">
                Pendaftar yang sudah chat WA dapat langsung diverifikasi di bawah untuk mengaktifkan akun.
              </span>
            </div>
            <button
              onClick={fetchRegistrations}
              disabled={isLoadingRegistrations}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRegistrations ? 'animate-spin' : ''}`} />
              <span>Segarkan Data</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredRegistrations.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredRegistrations.map((r) => r.id));
                        else setSelectedIds([]);
                      }}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                    />
                  </th>
                  <th className="py-4 px-4">Nama Lengkap & Username</th>
                  <th className="py-4 px-4">Kontak WhatsApp & Email</th>
                  <th className="py-4 px-4">Waktu Mendaftar</th>
                  <th className="py-4 px-4">Status Akun</th>
                  <th className="py-4 px-4">Catatan Verifikasi</th>
                  <th className="py-4 px-4 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Tidak ada antrean pendaftar yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((r) => {
                    const isPending = r.status === 'pending';
                    const isVerified = r.status === 'verified';
                    const isSelected = selectedIds.includes(r.id);

                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-emerald-950/20' : ''
                        }`}
                      >
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds((prev) => [...prev, r.id]);
                              else setSelectedIds((prev) => prev.filter((id) => id !== r.id));
                            }}
                            className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-white text-xs">{r.full_name}</div>
                          <div className="text-emerald-400 font-mono text-[11px] font-semibold mt-0.5">
                            @{r.username}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-slate-200">
                            <span>{r.phone_number}</span>
                            <a
                              href={getChatDirectWaLink(r)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat WA pendaftar"
                              className="text-[#25D366] hover:text-emerald-300 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">{r.email}</div>
                        </td>
                        <td className="py-4 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                          {formatIndonesianDate(r.created_at)}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isVerified
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : r.status === 'rejected'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            }`}
                          >
                            {isVerified ? '✓ Terverifikasi' : r.status === 'rejected' ? '✕ Ditolak' : '⏳ Menunggu WA'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-400 italic text-[11px] max-w-xs truncate">
                          {r.notes || (isPending ? 'Menunggu chat WhatsApp dari pemohon' : '-')}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleApproveRegistration(r.id)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                                  title="Verifikasi akun pendaftar"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verifikasi</span>
                                </button>
                                <button
                                  onClick={() => handleRejectRegistration(r.id)}
                                  className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                  title="Tolak pendaftaran"
                                >
                                  Tolak
                                </button>
                                <a
                                  href={getChatDirectWaLink(r)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/40 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
                                  title="Buka chat WhatsApp ke nomor pendaftar"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>Chat WA</span>
                                </a>
                              </>
                            ) : isVerified ? (
                              <a
                                href={getSendVerifiedWaLink(r)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                                title="Kirim pesan WhatsApp bahwa akun telah diverifikasi"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Kirim Konfirmasi WA</span>
                              </a>
                            ) : (
                              <span className="text-slate-500 text-[11px] italic">Ditolak</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 1: PEMBAYARAN & UPGRADE PRO */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredPayments.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredPayments.map((p) => p.id));
                        else setSelectedIds([]);
                      }}
                      className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                    />
                  </th>
                  <th className="py-4 px-4">Order ID & Pengguna</th>
                  <th className="py-4 px-4">Metode & Paket</th>
                  <th className="py-4 px-4">Nominal</th>
                  <th className="py-4 px-4">Bukti Mutasi</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Tanggal Order</th>
                  <th className="py-4 px-4 text-right">Aksi Superadmin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Tidak ada antrean pembayaran yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const isPending = p.status === 'pending';
                    const isApproved = p.status === 'approved';
                    const isSelected = selectedIds.includes(p.id);

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-purple-950/20' : ''
                        }`}
                      >
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds((prev) => [...prev, p.id]);
                              else setSelectedIds((prev) => prev.filter((id) => id !== p.id));
                            }}
                            className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-white text-xs">{p.order_id}</div>
                          <div className="text-slate-400 text-[11px] font-medium mt-0.5">
                            {p.user?.full_name || 'Dimas Pratama'} • {p.user?.phone_number || '081234567890'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-purple-300">
                            {p.plan === 'pro' ? '👑 Pro Lifetime' : 'Starter'}
                          </span>
                          <span className="block text-[11px] text-slate-400 capitalize">
                            {p.payment_method.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-white text-sm">
                          {formatRupiah(p.amount)}
                        </td>
                        <td className="py-4 px-4">
                          {p.proof_image_url ? (
                            <button
                              onClick={() => setSelectedProofImg(p.proof_image_url || null)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-[11px] font-bold transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Lihat Bukti
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Auto Midtrans</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isApproved
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : p.status === 'rejected'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                          {formatIndonesianDate(p.created_at)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {isPending ? (
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => setSelectedPayment(p)}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition-all"
                              >
                                Review & Putuskan
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">
                              Selesai diproses
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: OTORISASI DOMPET BARU */}
      {activeTab === 'wallets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-4">Pemohon</th>
                  <th className="py-4 px-4">Nama Dompet</th>
                  <th className="py-4 px-4">Saldo Awal</th>
                  <th className="py-4 px-4">Channel Finansial</th>
                  <th className="py-4 px-4">Catatan Kebutuhan</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Aksi Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {walletRequests.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-xs">{w.user_name}</div>
                      <div className="text-slate-400 text-[11px]">{w.user_phone}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-purple-300">{w.wallet_name}</td>
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {formatRupiah(w.initial_balance)}
                    </td>
                    <td className="py-4 px-4 text-slate-300">{w.bank_channel}</td>
                    <td className="py-4 px-4 text-slate-400 italic max-w-xs">{w.notes}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          w.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : w.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {w.status === 'pending' ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleApproveWallet(w.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleRejectWallet(w.id)}
                            className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] px-3 py-1.5 rounded-lg border border-rose-500/30 transition-all"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REBIND TOKEN TELEGRAM */}
      {activeTab === 'telegram' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-4">Pengguna</th>
                  <th className="py-4 px-4">Bot Lama</th>
                  <th className="py-4 px-4">Bot Baru yang Diminta</th>
                  <th className="py-4 px-4">Alasan Perubahan</th>
                  <th className="py-4 px-4">Waktu Request</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Aksi Superadmin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {telegramRequests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-xs">{t.user_name}</div>
                      <div className="text-slate-400 text-[11px]">{t.user_phone}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">{t.old_bot}</td>
                    <td className="py-4 px-4 font-mono font-bold text-purple-300">{t.new_bot}</td>
                    <td className="py-4 px-4 text-slate-300 italic">{t.reason}</td>
                    <td className="py-4 px-4 text-slate-400">{formatIndonesianDate(t.requested_at)}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          t.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : t.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {t.status === 'pending' ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleApproveTelegram(t.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all"
                          >
                            Otorisasi Rebind
                          </button>
                          <button
                            onClick={() => handleRejectTelegram(t.id)}
                            className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] px-3 py-1.5 rounded-lg border border-rose-500/30 transition-all"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL REVIEW PEMBAYARAN & APPROVAL PUTUSAN */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Detail Verifikasi Pembayaran</h3>
                <p className="text-xs text-slate-400">Order ID: {selectedPayment.order_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 font-bold block mb-1">Nama Pemohon:</span>
                <span className="text-white font-bold text-sm">
                  {selectedPayment.user?.full_name || 'Dimas Pratama'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block mb-1">Nomor WhatsApp/HP:</span>
                <span className="text-white font-bold text-sm">
                  {selectedPayment.user?.phone_number || '081234567890'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block mb-1">Paket yang Dibeli:</span>
                <span className="text-purple-300 font-black">
                  {selectedPayment.plan === 'pro' ? '👑 PRO LIFETIME ACCESS' : 'Starter'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block mb-1">Nominal Transfer:</span>
                <span className="text-emerald-400 font-black text-base">
                  {formatRupiah(selectedPayment.amount)}
                </span>
              </div>
            </div>

            {selectedPayment.proof_image_url && (
              <div className="mb-6">
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  Pratinjau Bukti Mutasi Struk Bank:
                </span>
                <div
                  onClick={() => setSelectedProofImg(selectedPayment.proof_image_url)}
                  className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-48 cursor-pointer relative group flex items-center justify-center"
                >
                  <img
                    src={selectedPayment.proof_image_url}
                    alt="Bukti Transfer"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 flex items-center justify-center transition-colors">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold shadow-lg border border-slate-700 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Klik untuk Perbesar
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Catatan Verifikasi Admin (Audit Trail):
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Contoh: Bukti mutasi BCA Rp99.000 atas nama pemohon telah sesuai dan terverifikasi di m-Banking..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-3 outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => handleRejectPayment(selectedPayment.id, adminNotes)}
                className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Tolak Pembayaran
              </button>
              <button
                onClick={() => handleApprovePayment(selectedPayment.id, adminNotes)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Setujui & Upgrade Akun Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FULLSCREEN BUKTI TRANSFER PREVIEW */}
      {selectedProofImg && (
        <div
          onClick={() => setSelectedProofImg(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
            <button
              onClick={() => setSelectedProofImg(null)}
              className="absolute top-3 right-3 p-2 bg-slate-900/90 text-white rounded-full hover:bg-slate-800 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedProofImg}
              alt="Bukti Transfer Full"
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
