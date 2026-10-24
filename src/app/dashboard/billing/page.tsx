'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA USER DASHBOARD: BILLING & UPGRADE PLAN (/dashboard/billing)
// Midtrans Integration & Manual Transfer Confirmation Queue
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Crown,
  CheckCircle2,
  Zap,
  CreditCard,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah } from '@/lib/currency';

export default function BillingPage() {
  const { activeUser, togglePlan, payments } = useApp();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'midtrans' | 'manual'>('midtrans');
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [accountName, setAccountName] = useState('');

  const isPro = activeUser.plan === 'pro';

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProofSubmitted(true);
    setTimeout(() => {
      setShowCheckoutModal(false);
      setProofSubmitted(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Langganan & Pembayaran</h1>
          <Badge variant={isPro ? 'pro' : 'brand'} size="sm">
            {isPro ? '👑 AKUN PRO AKTIF' : '⚡️ PAKET STARTER'}
          </Badge>
        </div>
        <p className="text-neutral-500 text-sm mt-1">
          Kelola paket langganan Anda, nikmati fitur OCR Struk AI, AI Financial Advisor, dan Export PDF/Excel tanpa batas.
        </p>
      </div>

      {/* Plan Status Banner */}
      <Card className="p-6 border border-neutral-200/90 shadow-sm bg-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${
            isPro ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-md shadow-yellow-500/20' : 'bg-brand-500 shadow-md shadow-brand-500/20'
          }`}>
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Status Paket Saat Ini</span>
            <h3 className="text-xl font-black text-neutral-900">
              {isPro ? 'Paket Pro (Lifetime Access)' : 'Paket Starter (Free Tier)'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isPro
                ? 'Semua fitur AI multimodal dan export laporan aktif tanpa batas transaksi.'
                : 'Maksimal 50 transaksi per bulan. Upgrade ke Pro untuk membuka seluruh potensi.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isPro ? (
            <Button
              onClick={() => setShowCheckoutModal(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white font-black px-6 py-2.5 shadow-md shadow-brand-500/20"
            >
              Upgrade ke Pro Sekarang
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={togglePlan}
              className="text-xs text-neutral-600"
              title="Khusus mode pengujian: switch ke Starter"
            >
              Simulasikan Mode Starter
            </Button>
          )}
        </div>
      </Card>

      {/* Pricing Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Starter Card */}
        <Card className="p-6 border border-neutral-200 bg-white rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="neutral" size="sm">GRATIS / STARTER</Badge>
              <span className="text-xs text-neutral-400 font-semibold">50 tx/bulan</span>
            </div>
            <h3 className="text-2xl font-black text-neutral-900">Rp49.000 <span className="text-xs text-neutral-400 font-normal">/ bulan</span></h3>
            <p className="text-xs text-neutral-500 mt-1">Cocok untuk pencatatan keuangan personal dasar via chat.</p>

            <ul className="mt-6 space-y-3 text-xs font-medium text-neutral-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Catat transaksi via teks Telegram</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Voice Note STT (hingga 60 detik)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Maksimal 3 Dompet & 5 Target Budget</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-400 line-through">
                <span>Ekstraksi foto struk belanja dengan AI Vision</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-400 line-through">
                <span>AI Financial Advisor proaktif</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-400 line-through">
                <span>Export laporan on-demand ke PDF & Excel</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100">
            <span className="text-xs font-bold text-neutral-400 block text-center">
              {!isPro ? '✓ Paket Aktif Anda' : 'Paket Standar'}
            </span>
          </div>
        </Card>

        {/* Pro Card */}
        <Card className="p-6 border-2 border-brand-500 bg-gradient-to-b from-[#feedf0]/60 to-white rounded-2xl flex flex-col justify-between relative shadow-lg shadow-brand-500/10">
          <div className="absolute -top-3 right-6 bg-brand-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            Paling Populer & Sekali Bayar
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="pro" size="sm">👑 PRO LIFETIME</Badge>
              <span className="text-xs text-brand-600 font-bold">Unlimited Access</span>
            </div>
            <h3 className="text-3xl font-black text-neutral-900">Rp99.000 <span className="text-xs text-brand-600 font-bold">Sekali Bayar</span></h3>
            <p className="text-xs text-neutral-500 mt-1">Bebas catat selamanya tanpa biaya langganan bulanan berulang.</p>

            <ul className="mt-6 space-y-3 text-xs font-medium text-neutral-700">
              <li className="flex items-center gap-2 font-bold text-neutral-900">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Unlimited transaksi, dompet, & kategori</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Foto Struk Belanja OCR (Multi-Item Breakdown)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                <span>AI Financial Advisor cerdas & proaktif</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Export Laporan tanpa batas ke PDF & Excel (.xlsx)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Prioritas proses pipeline AI & Telegram Fast Response</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-[#fdcfd4]/60">
            {isPro ? (
              <Button disabled className="w-full bg-emerald-600 text-white font-bold text-xs py-2.5">
                ✓ Anda Sudah Menikmati Paket Pro
              </Button>
            ) : (
              <Button
                onClick={() => setShowCheckoutModal(true)}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-black text-xs py-3 shadow-md shadow-brand-500/20"
              >
                Beli Paket Pro Sekarang — Rp99.000
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Checkout / Payment Modal */}
      {showCheckoutModal && (
        <Modal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          title="Checkout Upgrade Paket Pro (Rp99.000 Sekali Bayar)"
          maxWidth="max-w-md"
        >
          {proofSubmitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">Konfirmasi Terkirim!</h4>
              <p className="text-xs text-neutral-500">
                Admin akan memverifikasi mutasi pembayaran Anda dalam waktu 5-15 menit. Status Pro akan aktif otomatis.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex rounded-xl bg-neutral-100 p-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('midtrans')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMethod === 'midtrans' ? 'bg-brand-500 text-white shadow-sm' : 'text-neutral-600'
                  }`}
                >
                  Midtrans Snap (QRIS / VA)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('manual')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMethod === 'manual' ? 'bg-brand-500 text-white shadow-sm' : 'text-neutral-600'
                  }`}
                >
                  Transfer Manual BCA
                </button>
              </div>

              {paymentMethod === 'midtrans' ? (
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center space-y-3">
                  <CreditCard className="w-8 h-8 text-brand-500 mx-auto" />
                  <div>
                    <h5 className="text-sm font-bold text-neutral-800">Pembayaran Instan Otomatis</h5>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Mendukung QRIS (GoPay, OVO, ShopeePay, DANA) dan Virtual Account semua bank.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      togglePlan();
                      setShowCheckoutModal(false);
                    }}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5"
                  >
                    Buka Pop-up Midtrans (Simulasi Langsung Aktif)
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                    <p className="font-bold">Rekening Transfer Resmi TataDana:</p>
                    <p>• Bank BCA: <b>872-091-2345</b></p>
                    <p>• Atas Nama: <b>PT Tata Dana Nusantara</b></p>
                    <p>• Nominal Tepat: <b>Rp99.000</b></p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Nama Pengirim Rekening</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="misal: Dimas Prayogo"
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="p-3 border border-dashed border-neutral-300 rounded-xl text-center text-xs text-neutral-500">
                    <span className="block font-semibold">Unggah Bukti Transfer</span>
                    <span className="text-[10px] text-neutral-400">JPG, PNG, atau PDF (maks 5MB)</span>
                  </div>

                  <Button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5">
                    Kirim Bukti untuk Diverifikasi Admin
                  </Button>
                </form>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
