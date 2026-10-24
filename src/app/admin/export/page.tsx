'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA ADMIN: GLOBAL DATA EXPORT (/admin/export)
// Ekspor data seluruh pengguna untuk analitik internal & kepatuhan UU PDP
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Users,
  CreditCard,
  ShieldAlert,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAdmin } from '../admin-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminExportPage() {
  const { users, addAuditLog } = useAdmin();
  const [reason, setReason] = useState('');
  const [exportType, setExportType] = useState<'users' | 'transactions' | 'ai_logs'>('users');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Wajib mengisi alasan keperluan ekspor data untuk kepatuhan UU PDP');
      return;
    }

    addAuditLog({
      admin_name: 'Super Admin TataDana',
      target_user: `Global Export: ${exportType}`,
      action: 'view_transactions',
      reason,
      ip_address: '127.0.0.1',
    });
    setErrorMsg('');
    setDownloadSuccess(true);

    setTimeout(() => {
      setDownloadSuccess(false);
      setReason('');
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Ekspor Data Global</h1>
        <p className="text-xs text-slate-400 mt-1">
          Unduh data terpusat seluruh pengguna, riwayat transaksi, atau log audit sistem TataDana.
        </p>
      </div>

      <Card className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-white">
        <form onSubmit={handleExport} className="space-y-5">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-bold block">Peringatan Kepatuhan Privasi Data (UU PDP):</span>
              Seluruh aktivitas ekspor data dicatat permanen dalam audit log keamanan. Admin wajib menyertakan alasan operasional yang sah.
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/20 text-red-300 text-xs font-bold rounded-xl border border-red-500/30">
              {errorMsg}
            </div>
          )}

          {downloadSuccess && (
            <div className="p-3 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>File ekspor (.xlsx) berhasil di-generate dan dicatat ke audit log!</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Pilih Jenis Data Ekspor</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'users', label: 'Data Seluruh Pengguna', desc: `${users.length} akun terdaftar` },
                { id: 'transactions', label: 'Seluruh Transaksi Sistem', desc: 'Riwayat mutasi & struk' },
                { id: 'ai_logs', label: 'Log Token & Latensi AI', desc: 'Monitoring biaya API' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setExportType(opt.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    exportType === opt.id
                      ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-extrabold block">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Alasan Keperluan Ekspor (Wajib Diisi untuk Audit Log)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="misal: Investigasi support tiket #TD-984 atau audit keuangan kuartalan..."
              rows={3}
              required
              className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File Excel Terenkripsi (.xlsx)</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
