import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200/80 pt-16 pb-12 text-sm text-neutral-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 Kolom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Kolom 1: Logo + Tagline + Sosmed */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-lg">
                TD
              </div>
              <span className="text-xl font-extrabold text-neutral-900 tracking-tight">
                Tata<span className="text-brand-500">Dana</span>
              </span>
            </div>
            <p className="mt-3 text-xs text-neutral-500 leading-relaxed font-normal">
              Catat keuangan semudah chat — langsung dari Telegram kamu. Membantu generasi muda Indonesia mengelola gaji dan cashflow lebih bijak.
            </p>
            <div className="mt-5 flex items-center gap-3 text-neutral-400">
              <a href="https://t.me" target="_blank" rel="noreferrer" className="hover:text-brand-500 transition-colors p-2 bg-neutral-100 rounded-lg">
                Telegram
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-brand-500 transition-colors p-2 bg-neutral-100 rounded-lg">
                Instagram
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-brand-500 transition-colors p-2 bg-neutral-100 rounded-lg">
                Twitter/X
              </a>
            </div>
          </div>

          {/* Kolom 2: Produk */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4">
              Produk
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-600">
              <li><a href="#fitur" className="hover:text-brand-500 transition-colors">Telegram Bot Chat</a></li>
              <li><a href="#fitur" className="hover:text-brand-500 transition-colors">OCR Scan Foto Struk</a></li>
              <li><a href="#fitur" className="hover:text-brand-500 transition-colors">Voice Note Transkripsi</a></li>
              <li><a href="#fitur" className="hover:text-brand-500 transition-colors">AI Financial Advisor</a></li>
              <li><a href="#fitur" className="hover:text-brand-500 transition-colors">Export Laporan PDF & Excel</a></li>
              <li><a href="#harga" className="hover:text-brand-500 transition-colors">Harga Paket Pro</a></li>
            </ul>
          </div>

          {/* Kolom 3: Perusahaan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4">
              Perusahaan
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-600">
              <li><a href="#" className="hover:text-brand-500 transition-colors">Tentang TataDana</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Karir & Peluang</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Press Kit & Media</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Partner Bisnis</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Panduan Literasi Finansial</a></li>
            </ul>
          </div>

          {/* Kolom 4: Legal & Kontak */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4">
              Legal & Bantuan
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-600">
              <li><Link href="/privacy" className="hover:text-brand-500 transition-colors">Kebijakan Privasi (/privacy)</Link></li>
              <li><Link href="/terms" className="hover:text-brand-500 transition-colors">Syarat & Ketentuan (/terms)</Link></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Keamanan Data (Supabase RLS)</a></li>
              <li><a href="mailto:support@tatadana.id" className="hover:text-brand-500 transition-colors">Hubungi Kami (support@tatadana.id)</a></li>
              <li><a href="https://t.me/tatadanabot" className="hover:text-brand-500 transition-colors">Bot Telegram Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© 2026 PT TataDana Finansial Teknologi. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-2">
            <span>Dibuat dengan ❤️ di Indonesia</span>
            <span>•</span>
            <span>WIB Timezone (Asia/Jakarta)</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
