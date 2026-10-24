import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-neutral-800 leading-relaxed">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
        <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-2">
          <FileText className="w-4 h-4" /> Syarat & Ketentuan Layanan
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-8">
          Syarat & Ketentuan TataDana
        </h1>

        <div className="space-y-6 text-sm text-neutral-700">
          <p>
            Selamat datang di TataDana. Dengan mengakses website atau menggunakan Telegram Bot kami, Anda menyetujui ketentuan penggunaan berikut.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 pt-4">1. Layanan Pencatatan Finansial</h2>
          <p>
            TataDana adalah alat bantu manajemen keuangan pribadi dan pencatatan arus kas. TataDana bukan lembaga keuangan perbankan atau pengelola investasi. Seluruh keputusan keuangan sepenuhnya merupakan tanggung jawab Anda sebagai pengguna.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 pt-4">2. Paket Langganan & Pembayaran</h2>
          <p>
            TataDana menyediakan paket Starter (Rp49.000/bulan) dan paket Pro (Rp99.000 Sekali Bayar). Pembayaran dapat diproses melalui payment gateway Midtrans atau transfer manual dengan verifikasi bukti transfer.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 pt-4">3. Batasan Kuota Penggunaan</h2>
          <p>
            Pengguna paket Starter dibatasi maksimal 50 transaksi per bulan kalender, 3 dompet, dan 5 kategori budget. Pengguna paket Pro menikmati akses tanpa batasan kuota.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 pt-4">4. Penghentian Layanan</h2>
          <p>
            Kami berhak menonaktifkan akun yang terindikasi melakukan penyalahgunaan sistem API atau aktivitas penipuan.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
