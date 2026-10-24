'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana cara kerja pencatatan via Telegram Bot TataDana?',
      a: 'Sangat mudah! Kamu cukup menghubungkan akun Telegram dengan akun TataDana lewat satu klik di menu Settings. Setelah terhubung, cukup kirim chat ke bot kami (misal: "beli kopi 25rb" atau "gajian 8jt"). AI kami secara cerdas memproses jenis transaksi, nominal rupiah, kategori, dan memotong saldo dompetmu secara real-time.',
    },
    {
      q: 'Apakah bisa menggunakan fitur foto struk kasir di paket Starter?',
      a: 'Fitur ekstraksi foto struk menggunakan AI Vision OCR merupakan fitur eksklusif paket Pro. Pengguna paket Starter tetap dapat mencatat transaksi via teks natural dan rekaman suara (Voice Note). Kamu dapat melakukan upgrade kapan saja ke paket Pro untuk menikmati kemudahan scan struk otomatis.',
    },
    {
      q: 'Bagaimana keamanan data transaksi saya di TataDana?',
      a: 'Keamanan data kamu adalah prioritas nomor satu kami. Seluruh database disimpan 100% di infrastruktur Supabase (PostgreSQL) dengan Row Level Security (RLS) berstandar industri. Token bot Telegram dan kredensial API disimpan dalam bentuk terenkripsi. Data transaksimu sepenuhnya privat dan tidak pernah dibagikan atau dijual ke pihak ketiga.',
    },
    {
      q: 'Apakah saya perlu membuat bot Telegram sendiri di @BotFather?',
      a: 'Tidak harus! TataDana menyediakan 1 bot resmi bersama yang dapat langsung digunakan oleh semua pengguna. Namun jika kamu ingin menggunakan bot privat dengan nama atau foto profil kustom milikmu sendiri, TataDana menyediakan panduan step-by-step yang sangat mudah di menu Settings untuk memasukkan token bot pribadimu.',
    },
    {
      q: 'Bagaimana AI mengenali format nominal Indonesia seperti "15rb" atau "1.5jt"?',
      a: 'Sistem kami dilengkapi dengan custom natural language parsing engine yang dirancang khusus untuk istilah finansial sehari-hari di Indonesia. Format seperti 15rb / 15ribu / 15k otomatis terbaca sebagai 15.000, dan format 1.5jt / 1,5 juta otomatis terbaca sebagai 1.500.000. Jika kalimat ambigu, bot akan membalas dengan panduan contoh yang benar.',
    },
    {
      q: 'Apakah TataDana mendukung banyak dompet (BCA, Mandiri, GoPay, Cash, dll)?',
      a: 'Ya, tentu! TataDana mendukung fitur Multi-Wallet. Kamu bisa membuat dompet untuk uang tunai fisik, rekening bank (BCA, Mandiri, BRI, dll), maupun e-wallet (GoPay, OVO, ShopeePay, DANA). Kamu juga bisa memindahkan dana antar-dompet cukup dengan mengetik "tf bca ke gopay 100rb".',
    },
    {
      q: 'Apa yang terjadi jika kuota transaksi di paket Starter sudah habis?',
      a: 'Paket Starter memiliki batas 50 transaksi per bulan. Jika batas ini tercapai, bot Telegram akan memberikan notifikasi ramah bahwa kuota bulan berjalan telah penuh dan mengundangmu untuk upgrade ke paket Pro. Data transaksimu yang sudah ada tetap tersimpan aman dan tidak akan hilang.',
    },
    {
      q: 'Bagaimana cara mengekspor laporan keuangan ke format Excel atau PDF?',
      a: 'Pada menu Laporan di dashboard TataDana, pengguna paket Pro dapat memilih rentang tanggal sesuai keinginan (misal: 1 bulan atau custom range) lalu klik tombol "Export PDF" atau "Export Excel (.xlsx)". File akan digenerate on-demand dan disimpan di private storage dengan signed download link yang aman.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold text-[#7a2e38] uppercase tracking-widest bg-[#fdcfd4]/40 px-3 py-1 rounded-full border border-[#fdcfd4]">
            Pertanyaan Umum
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Punya pertanyaan lain? Tim support kami selalu siap membantu kapan saja.
          </p>
        </div>

        <div className="mt-14 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-neutral-200/90 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 bg-white hover:bg-neutral-50/70 transition-colors"
                >
                  <span className="text-base font-bold text-neutral-900 tracking-tight">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-neutral-600 leading-relaxed bg-white border-t border-neutral-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
