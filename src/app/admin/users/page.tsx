'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA ADMIN: USER MANAGEMENT & IMPERSONATION (PART 10)
// List user, toggle upgrade/downgrade plan, impersonasi dengan alasan wajib audit
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Eye,
  ShieldAlert,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useAdmin, AdminUser } from '../admin-context';
import { useApp } from '@/lib/app-context';
import { formatIndonesianDate } from '@/lib/date';
import { formatRupiah } from '@/lib/currency';
import { Transaction } from '@/types';

export default function AdminUsersPage() {
  const router = useRouter();
  const { currentUser } = useApp();
  const {
    users,
    toggleUserPlan,
    impersonateUserWithReason,
    inspectTransactionsWithReason,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);

  // Impersonation modal state
  const [impersonateModalOpen, setImpersonateModalOpen] = useState(false);
  const [selectedUserForImp, setSelectedUserForImp] = useState<AdminUser | null>(null);
  const [impReason, setImpReason] = useState('');
  const [impError, setImpError] = useState<string | null>(null);

  // Inspect transactions modal state
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedUserForInspect, setSelectedUserForInspect] = useState<AdminUser | null>(null);
  const [inspectReason, setInspectReason] = useState('Pemeriksaan kendala transaksi oleh support');
  const [inspectError, setInspectError] = useState<string | null>(null);
  const [inspectedTransactions, setInspectedTransactions] = useState<Transaction[]>([]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone_number?.includes(search) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = userPlanFilter === 'all' || u.plan === userPlanFilter;
    return matchesSearch && matchesPlan;
  });

  // Handle plan toggle
  const handleTogglePlan = (userId: string, userName: string) => {
    const res = toggleUserPlan(userId);
    setNotice(`Plan pengguna ${userName} berhasil diubah ke ${res.newPlan.toUpperCase()}!`);
    setTimeout(() => setNotice(null), 3000);
  };

  // Open Impersonate modal
  const handleOpenImpersonate = (u: AdminUser) => {
    setSelectedUserForImp(u);
    setImpReason('');
    setImpError(null);
    setImpersonateModalOpen(true);
  };

  // Confirm Impersonation with mandatory reason
  const handleConfirmImpersonate = () => {
    if (!selectedUserForImp) return;
    if (!impReason || impReason.trim().length === 0) {
      setImpError('Alasan privasi wajib diisi untuk memenuhi standar kepatuhan audit data UU PDP!');
      return;
    }

    const res = impersonateUserWithReason(selectedUserForImp, impReason);
    if (!res.success) {
      setImpError(res.error || 'Gagal memulai impersonasi');
      return;
    }

    setImpersonateModalOpen(false);
    router.push('/dashboard');
  };

  // Open Inspect modal
  const handleOpenInspect = (u: AdminUser) => {
    setSelectedUserForInspect(u);
    setInspectReason('Pemeriksaan kendala pencatatan transaksi oleh support teknis');
    setInspectError(null);
    setInspectModalOpen(true);
  };

  // Confirm Inspect with mandatory reason
  const handleConfirmInspect = () => {
    if (!selectedUserForInspect) return;
    if (!inspectReason || inspectReason.trim().length === 0) {
      setInspectError('Alasan inspeksi wajib diisi demi kepatuhan privasi!');
      return;
    }

    const res = inspectTransactionsWithReason(selectedUserForInspect, inspectReason);
    if (!res.success) {
      setInspectError(res.error || 'Gagal memuat transaksi');
      return;
    }

    setInspectedTransactions(res.transactions);
  };

  // Export to CSV
  const handleExportAllUsers = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Nama,Nomor HP,Plan,Telegram Terhubung,Tanggal Bergabung\n' +
      users
        .map(
          (u) =>
            `"${u.id}","${u.full_name}","${u.phone_number || '-'}","${u.plan.toUpperCase()}","${
              u.telegram_connected ? 'Ya' : 'Tidak'
            }","${u.created_at}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tatadana-all-users-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Kelola Pengguna & Impersonasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Lihat daftar akun, toggle paket Starter vs Pro, verifikasi nomor HP/OTP, pairing Telegram, dan audit privasi.
          </p>
        </div>

        <button
          onClick={handleExportAllUsers}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Data Semua User (CSV)
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
          {notice}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau nomor HP pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <select
          value={userPlanFilter}
          onChange={(e) => setUserPlanFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">Semua Paket</option>
          <option value="pro">Paket Pro Saja</option>
          <option value="starter">Paket Starter Saja</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Pengguna</th>
                <th className="py-3.5 px-4">Nomor HP (OTP)</th>
                <th className="py-3.5 px-4">Plan Aktif (Toggle)</th>
                <th className="py-3.5 px-4">Telegram Bot</th>
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
                  <td className="py-3.5 px-4 text-slate-300 font-mono whitespace-nowrap">
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
                        title="Ubah paket pengguna secara instan"
                      >
                        {u.plan === 'starter' ? 'Upgrade Pro ⚡' : 'Downgrade ↺'}
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {u.telegram_connected ? (
                      <div>
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {u.bot_username || `@Bot (${u.telegram_chat_id || 'Aktif'})`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> Belum
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
                      title="Lihat isi transaksi untuk troubleshooting (dengan audit log)"
                    >
                      Inspeksi Data
                    </button>
                    <button
                      onClick={() => handleOpenImpersonate(u)}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black transition-all shadow-sm hover:scale-105"
                      title="Masuk ke aplikasi sebagai user ini tanpa login ulang (wajib alasan audit)"
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

      {/* IMPERSONATION MODAL (MANDATORY PRIVACY REASON STRING) */}
      {impersonateModalOpen && selectedUserForImp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
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
                    Pengguna: <b className="text-white">{selectedUserForImp.full_name}</b> ({selectedUserForImp.id})
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

            <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Kepatuhan Audit Privasi:
              </div>
              <p>
                Sesi ini akan langsung masuk ke tampilan dashboard pengguna. Alasan Anda akan disimpan di Audit Log untuk audit independen.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Alasan Privasi Impersonasi <span className="text-amber-400">*Wajib Diisi</span>
              </label>
              <textarea
                rows={3}
                value={impReason}
                onChange={(e) => {
                  setImpReason(e.target.value);
                  setImpError(null);
                }}
                placeholder="Contoh: Bantuan sinkronisasi bot Telegram pengguna yang gagal terhubung"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors"
              />
              {impError && (
                <p className="text-[11px] text-red-400 mt-1 font-bold">{impError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setImpersonateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmImpersonate}
                className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md"
              >
                Mulai Impersonasi ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT TRANSACTIONS MODAL */}
      {inspectModalOpen && selectedUserForInspect && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Inspeksi Data Transaksi: {selectedUserForInspect.full_name}
                </h3>
                <p className="text-xs text-slate-400">
                  Akses ini dicatat dalam Audit Log privasi data.
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
                Isi alasan inspeksi dan klik "Muat Data" untuk melihat transaksi.
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
    </div>
  );
}
