'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, Sparkles, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'lifetime'>('lifetime');

  return (
    <section id="harga" className="py-24 bg-neutral-50/60 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-[#7a2e38] uppercase tracking-widest bg-[#fdcfd4]/40 px-3 py-1 rounded-full border border-[#fdcfd4]">
            Harga Transparan
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Pilih Paket yang Sesuai dengan Kebutuhanmu
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Mulai hemat pengeluaran hari ini. Pembayaran instan via Midtrans (QRIS, GoPay, BCA) atau transfer manual bank.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Langganan Bulanan
            </button>
            <button
              onClick={() => setBillingCycle('lifetime')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                billingCycle === 'lifetime'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>Sekali Bayar (Lifetime)</span>
              <span className="bg-amber-300 text-neutral-900 text-[10px] px-1.5 py-0.5 rounded font-extrabold">HEMAT</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Starter Plan */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Starter</h3>
                  <p className="text-xs text-neutral-500 mt-1">Cocok untuk mahasiswa & pemula yang baru mulai mencatat</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-lg">
                  Basic Plan
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">Rp49.000</span>
                <span className="text-sm font-medium text-neutral-500">/ bulan</span>
              </div>

              {/* Feature Checklist */}
              <ul className="mt-8 space-y-3.5 text-sm text-neutral-600">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Catat transaksi via teks Telegram</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Mendukung input Voice Note (max 60 detik)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Dashboard web lengkap & onboarding checklist</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Maksimal <b>50 transaksi / bulan</b></span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Maksimal <b>3 dompet & 5 kategori budget</b></span>
                </li>
                <li className="flex items-center gap-3 text-neutral-400">
                  <X className="w-5 h-5 text-neutral-300 shrink-0" />
                  <span className="line-through">Scan foto struk kasir via AI Vision</span>
                </li>
                <li className="flex items-center gap-3 text-neutral-400">
                  <X className="w-5 h-5 text-neutral-300 shrink-0" />
                  <span className="line-through">AI Financial Advisor otomatis</span>
                </li>
                <li className="flex items-center gap-3 text-neutral-400">
                  <X className="w-5 h-5 text-neutral-300 shrink-0" />
                  <span className="line-through">Export laporan ke PDF & Excel (.xlsx)</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100">
              <Link href="/register?plan=starter" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  Pilih Paket Starter
                </Button>
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-3xl p-8 border-2 border-brand-500 shadow-xl relative flex flex-col justify-between overflow-hidden">
            {/* Top Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#8a9d68] to-[#d66b7b] text-white text-[11px] font-extrabold uppercase px-4 py-1.5 rounded-bl-xl tracking-wider">
              Paling Populer 🔥
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Pro</h3>
                  <p className="text-xs text-brand-600 font-medium mt-1">Akses penuh selamanya tanpa batasan</p>
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-brand-600 tracking-tight">Rp99.000</span>
                <span className="text-sm font-semibold text-[#7a2e38] bg-[#feedf0] px-2 py-0.5 rounded border border-[#fdcfd4]">
                  Sekali Bayar (Lifetime)
                </span>
              </div>

              {/* Feature Checklist */}
              <ul className="mt-8 space-y-3.5 text-sm text-neutral-700 font-medium">
                <li className="flex items-center gap-3 text-neutral-900 font-semibold">
                  <Zap className="w-5 h-5 text-brand-500 shrink-0" />
                  <span>Semua fitur paket Starter, PLUS:</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span><b>Unlimited</b> transaksi, wallet, & kategori</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span><b>Input foto struk kasir</b> dengan AI Vision OCR</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span><b>AI Financial Advisor</b> cerdas aktif otomatis</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Laporan lengkap & <b>Export Unlimited PDF / Excel</b></span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Multi-item struk otomatis tersimpan rapi</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Pengingat (Reminder) harian kustom</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Prioritas dukungan support teknis</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100">
              <Link href="/register?plan=pro" className="block">
                <Button variant="primary" size="lg" className="w-full text-base shadow-lg shadow-brand-500/30">
                  Dapatkan Akses Pro Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
