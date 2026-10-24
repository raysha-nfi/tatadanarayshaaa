import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-neutral-800 leading-relaxed">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
        <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" /> Privasi & Kepatuhan Data
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-8">
          Kebijakan Privasi TataDana
        </h1>

        <div className="space-y-6 text-sm text-neutral-700">
          <p>
            Terakhir diperbarui: 10 Oktober 2026. Di TataDana (PT TataDana Finansial Teknologi), kami sangat menghargai privasi dan keamanan data finansial Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 pt-4">1. Data yang Kami Kumpulkan</h2>
          <p>
            Kami mengumpulkan nomor telepon Anda (untuk verifikasi OTP dan penghubung akun ke bot Telegram), riwayat transaksi keuangan yang Anda kirimkan, serta kredensial akun. Kami TIDAK PERNAH meminta PIN kartu ATM atau password internet banking Anda.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 pt-4">2. Penyimpanan dan Keamanan Data (Supabase)</h2>
          <p>
            Seluruh data transaksi dan profil disimpan 100% pada database PostgreSQL di infrastruktur Supabase dengan Row Level Security (RLS) berstandar internasional. API tokens dan data sensitif dienkripsi di level basis data.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 pt-4">3. Penggunaan Integrasi Telegram</h2>
          <p>
            Pesan yang dikirimkan ke bot Telegram TataDana diproses secara aman menggunakan Webhook dengan enkripsi TLS. Webhook kami mengimplementasikan idempotency untuk mencegah duplikasi data transaksi.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 pt-4">4. Hak Pengguna</h2>
          <p>
            Anda berhak mengunduh seluruh data transaksi Anda kapan saja melalui fitur Export PDF / Excel, atau meminta penghapusan akun secara permanen melalui email <code>support@tatadana.id</code>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
