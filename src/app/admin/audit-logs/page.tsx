'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA ADMIN: AUDIT LOGS PRIVASI DATA (PART 10 & DISPATCH REQUIREMENTS)
// Mencatat setiap akses admin terhadap data transaksi user untuk kepatuhan privasi UU PDP
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { ScrollText, ShieldAlert, Lock, User, Clock, Search } from 'lucide-react';
import { useAdmin } from '../admin-context';
import { formatIndonesianDate, formatIndonesianTime } from '@/lib/date';

export default function AdminAuditLogsPage() {
  const { auditLogs } = useAdmin();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter((a) => {
    const matchesSearch =
      !search ||
      a.target_user.toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase()) ||
      a.admin_name.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || a.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Audit Log Akses & Kepatuhan Privasi Data
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              UU PDP Terintegrasi
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rekaman permanen yang mencatat setiap inspeksi data transaksi pengguna, verifikasi transfer, dan impersonasi oleh pihak admin.
          </p>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer self-start sm:self-auto"
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari admin, pengguna sasaran, atau alasan..."
          className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-500 transition-colors"
        />
      </div>

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
              {filteredLogs.map((a) => (
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
  );
}
