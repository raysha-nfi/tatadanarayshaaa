'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA ADMIN: AUDIT DETAIL TRANSAKSI USER (/admin/users/[userId]/transactions)
// Kepatuhan UU PDP: Wajib mencatat alasan audit ke tabel audit_logs
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldAlert,
  ArrowLeft,
  Search,
  Eye,
  CheckCircle2,
  Lock,
  Calendar,
  Receipt,
  Tag,
} from 'lucide-react';
import { useAdmin } from '../../../admin-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah } from '@/lib/currency';
import { formatIndonesianDate } from '@/lib/date';

export default function UserTransactionsAuditPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const { users, addAuditLog } = useAdmin();

  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const targetUser = users.find((u) => u.id === userId) || {
    id: userId,
    full_name: 'Pengguna TataDana',
    phone_number: '081234567890',
    plan: 'starter' as const,
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    addAuditLog({
      admin_name: 'Super Admin TataDana',
      target_user: `${targetUser.full_name} (${userId})`,
      action: 'view_transactions',
      reason,
      ip_address: '127.0.0.1',
    });
    setHasUnlocked(true);
  };

  const txs = [
    {
      id: 'tx-audit-01',
      type: 'expense',
      amount: 45000,
      notes: 'Makan siang Nasi Bebek Sinjay',
      transaction_time: '2026-10-14T12:30:00+07:00',
      category: '🍜 Makanan',
      wallet: 'GoPay Jajan',
    },
    {
      id: 'tx-audit-02',
      type: 'expense',
      amount: 120000,
      notes: 'Bensin Shell V-Power',
      transaction_time: '2026-10-13T08:15:00+07:00',
      category: '🚗 Transport',
      wallet: 'BCA Utama',
    },
    {
      id: 'tx-audit-03',
      type: 'income',
      amount: 7500000,
      notes: 'Gaji Bulanan PT Maju Jaya',
      transaction_time: '2026-10-01T09:00:00+07:00',
      category: '💰 Gaji',
      wallet: 'BCA Utama',
    },
  ];

  const filteredTxs = txs.filter((t: any) =>
    (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Pengguna</span>
        </Link>
        <Badge variant="pro" size="sm" className="bg-purple-900/50 text-purple-300 border-purple-700">
          Superadmin Audit Mode
        </Badge>
      </div>

      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Pengguna</span>
          <h1 className="text-2xl font-black mt-0.5">{targetUser.full_name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            ID: <code className="text-amber-400">{userId}</code> • Telp: {targetUser.phone_number} • Paket: {targetUser.plan.toUpperCase()}
          </p>
        </div>
      </div>

      {!hasUnlocked ? (
        /* Privacy Protection Gate (UU PDP) */
        <Card className="p-8 bg-slate-900 border border-amber-500/30 rounded-2xl text-white text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-black tracking-tight">Kunci Kepatuhan Privasi Data</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Sesuai UU Perlindungan Data Pribadi (UU PDP), melihat data transaksi pribadi pengguna memerlukan otorisasi alasan sah yang akan dicatat di <b>Audit Logs</b>.
          </p>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Alasan Akses Transaksi (Wajib Diisi)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="misal: Tiket investigasi komplain pengguna #CS-821"
                required
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Buka Data & Catat ke Audit Log</span>
            </Button>
          </form>
        </Card>
      ) : (
        /* Unlocked Transactions Audit View */
        <Card className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Akses disetujui (Tercatat di audit log: "{reason}")</span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari transaksi..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {filteredTxs.map((tx: any) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{tx.notes}</span>
                    <span className="text-[10px] text-slate-400">
                      {tx.category} • {tx.wallet} • {formatIndonesianDate(tx.transaction_time.slice(0, 10))}
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
