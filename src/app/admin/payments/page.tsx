'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA ADMIN: VERIFIKASI PEMBAYARAN & MIDTRANS (PART 10)
// Approve / Reject bukti transfer manual & upgrade paket otomatis ke Pro
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAdmin } from '../admin-context';
import { formatRupiah } from '@/lib/currency';
import { formatIndonesianDate } from '@/lib/date';

export default function AdminPaymentsPage() {
  const { payments, approvePaymentAdmin, rejectPaymentAdmin } = useAdmin();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const handleApprove = (id: string) => {
    approvePaymentAdmin(id, 'Bukti mutasi bank BCA terverifikasi valid');
    setActionNotice('Pembayaran disetujui! Pengguna otomatis di-upgrade ke paket Pro.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleReject = (id: string) => {
    rejectPaymentAdmin(id, 'Bukti transfer tidak valid atau tidak terbaca');
    setActionNotice('Pembayaran ditolak. Catatan penolakan tercatat di audit log.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const filteredPayments = payments.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Verifikasi Pembayaran & Approval Manual
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Daftar invoice Midtrans otomatis dan bukti transfer bank manual yang membutuhkan konfirmasi admin.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st === 'all' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionNotice}
        </div>
      )}

      {/* Payment List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Metode & Paket</th>
                <th className="py-3.5 px-4">Nominal</th>
                <th className="py-3.5 px-4">Bukti Transfer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tanggal Order</th>
                <th className="py-3.5 px-4 text-right">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                    {p.order_id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                    <span className="font-semibold block uppercase">
                      {p.payment_method === 'midtrans' ? 'Midtrans' : 'Transfer Manual BCA'}
                    </span>
                    <span className="text-[10px] text-purple-400 font-bold uppercase">
                      Paket {p.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {formatRupiah(p.amount)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {p.proof_image_url ? (
                      <button
                        onClick={() => setSelectedProof(p.proof_image_url!)}
                        className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 underline underline-offset-2"
                      >
                        <Eye className="w-3.5 h-3.5" /> Lihat Bukti
                      </button>
                    ) : (
                      <span className="text-slate-500 italic">Auto Midtrans</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
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
                          onClick={() => handleApprove(p.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] shadow-sm transition-all hover:scale-105"
                        >
                          Approve (Upgrade Pro)
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] shadow-sm transition-all hover:scale-105"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-500 text-[11px]">
                        {p.admin_notes || 'Selesai'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROOF VIEWER MODAL */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">
                Bukti Transfer Pengguna (Manual BCA)
              </h3>
              <button
                onClick={() => setSelectedProof(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 max-h-96 flex items-center justify-center bg-slate-950">
              <img
                src={selectedProof}
                alt="Bukti Transfer"
                className="max-h-96 object-contain w-full"
              />
            </div>

            <p className="text-xs text-slate-400">
              Pastikan mutasi rekening sesuai sebelum melakukan approve. Akun akan otomatis ter-upgrade ke paket Pro.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProof(null)}
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
