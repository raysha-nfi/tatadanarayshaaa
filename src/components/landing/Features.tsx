import React from 'react';
import { MessageSquare, Camera, FileSpreadsheet, Bot, Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export function Features() {
  return (
    <section id="fitur" className="py-24 bg-neutral-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-[#7a2e38] uppercase tracking-widest bg-[#fdcfd4]/40 px-3 py-1 rounded-full border border-[#fdcfd4]">
            Arsitektur & Fitur
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Dirancang Khusus untuk Gaya Hidup Finansial Indonesia
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Tidak perlu install aplikasi berat. Semua interaksi berjalan cepat lewat Telegram dan tersinkronisasi mulus ke dashboard web.
          </p>
        </div>

        {/* Feature 1: Catat via Telegram (Teks & Foto Struk AI) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#fdcfd4]/40 text-[#7a2e38] text-xs font-bold mb-4">
              <MessageSquare className="w-4 h-4" /> Fitur 01 • Telegram Integration
            </div>
            <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">
              Catat Pengeluaran Semudah Chat Teman, Bisa Teks Maupun Foto Struk
            </h3>
            <p className="mt-4 text-base text-neutral-600 leading-relaxed">
              Ketik dengan bahasa sehari-hari seperti &quot;beli bakso 15rb&quot; atau &quot;gajian 5jt&quot;. AI TataDana otomatis mengenali nominal rupiah, mengelompokkan kategori, dan memotong saldo dompet yang sesuai.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-neutral-700 font-medium">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">✓</div>
                Mendukung teks, audio Voice Note (max 60 detik), dan foto struk kasir
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">✓</div>
                Multi-item receipt OCR memecah struk menjadi rincian produk otomatis
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">✓</div>
                Idempotent webhook mencegah pencatatan ganda akibat jaringan Telegram
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xl relative">
            <div className="bg-neutral-900 rounded-2xl p-5 text-white font-mono text-xs space-y-3">
              <div className="text-neutral-400">// Telegram Bot Response Preview</div>
              <div className="text-brand-400">📅 Sabtu, 10 Okt 2026 — 12:20 WIB</div>
              <div className="text-emerald-400 font-bold">💸 Pengeluaran tercatat!</div>
              <div>├ Nominal : Rp25.000</div>
              <div>├ Kategori : 🍜 Makanan & Minuman</div>
              <div>├ Dompet  : 👛 Cash</div>
              <div>└ Saldo   : Rp450.000</div>
              <div className="pt-2 border-t border-neutral-800 text-neutral-300">
                📊 Budget Makanan bulan ini:<br />
                <span className="text-brand-400">█████░░░░░ 56%</span> — sisa Rp655.000
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Laporan & Export Otomatis di Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
          <div className="lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold mb-4">
              <FileSpreadsheet className="w-4 h-4" /> Fitur 02 • Laporan & Export In-App
            </div>
            <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">
              Dashboard Native Lengkap dengan Export PDF & Excel Instan
            </h3>
            <p className="mt-4 text-base text-neutral-600 leading-relaxed">
              Semua data tersimpan 100% di Supabase (PostgreSQL) — tanpa dependensi pihak ketiga yang lambat. Pantau cashflow 6 bulan terakhir, breakdown kategori, dan download laporan on-demand kapan saja.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-neutral-700 font-medium">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">✓</div>
                Tabel transaksi sortable & filter lengkap (kategori, wallet, tanggal)
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">✓</div>
                Export langsung ke format Excel (.xlsx) dan PDF dengan signed URL
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">✓</div>
                Real-time sync otomatis via Supabase Realtime tanpa refresh manual
              </li>
            </ul>
          </div>
          <div className="lg:order-1 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="font-bold text-sm text-neutral-800">Laporan Keuangan Native</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">Live Realtime</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <div className="text-[11px] text-neutral-500">Pemasukan Bulan Ini</div>
                  <div className="text-base font-bold text-emerald-600 mt-0.5">Rp10.000.000</div>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <div className="text-[11px] text-neutral-500">Pengeluaran Bulan Ini</div>
                  <div className="text-base font-bold text-neutral-900 mt-0.5">Rp2.385.000</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#fdcfd4]/30 border border-[#fdcfd4]/70 text-xs text-[#5f723b] font-medium flex items-center justify-between">
                <span>Net Cashflow: +Rp7.615.000</span>
                <span className="font-bold bg-brand-500 text-white px-2 py-0.5 rounded text-[10px]">Surplus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: AI Financial Advisor Cerdas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold mb-4">
              <Bot className="w-4 h-4" /> Fitur 03 • Pro AI Advisor
            </div>
            <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">
              AI Financial Advisor yang Aktif Otomatis Menjaga Rekeningmu
            </h3>
            <p className="mt-4 text-base text-neutral-600 leading-relaxed">
              Tidak perlu memanggil bot secara manual. Advisor aktif otomatis ketika mendeteksi lonjakan pengeluaran kategori lebih dari 50%, pengeluaran mendadak &gt;20% budget, atau saat rasio belanja melebihi 80% gaji.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-neutral-700 font-medium">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">✓</div>
                Analisa personal berdasarkan riwayat transaksi nyata kamu
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">✓</div>
                Saran spesifik dan actionable seperti strategi &apos;No-Spend Days&apos;
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">✓</div>
                Multi-provider failover: Gemini, GPT, DeepSeek untuk reliabilitas 99.9%
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xl">
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 text-white text-sm space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> AI Financial Advisor Alert
              </div>
              <p className="font-semibold text-neutral-200">
                Hei Raysha! Pengeluaran Makanan kamu minggu ini naik 65% dibanding minggu lalu (Rp845.000 vs Rp510.000).
              </p>
              <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700 text-xs text-neutral-300">
                💡 <span className="font-semibold text-white">Saran:</span> Cek menu Laporan untuk evaluasi jajan harian. Terapkan batas jajan 50rb/hari sampai akhir pekan agar budget aman!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
