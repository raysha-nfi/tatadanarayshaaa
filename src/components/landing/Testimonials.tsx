import React from 'react';
import { Star, Quote } from 'lucide-react';

export function Testimonials() {
  // TODO: ganti dengan testimoni asli setelah fase beta user selesai
  const dummyTestimonials = [
    {
      name: 'Rian Saputra',
      role: 'Software Engineer (26 thn), Jakarta',
      content: 'Dulu selalu bingung gaji 12 juta habis ke mana sebelum tanggal 20. Sekarang tiap jajan tinggal chat di Telegram, langsung kelihatan sisa budget makan. Gila sih praktisnya!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    },
    {
      name: 'Nadia Putri',
      role: 'Freelance Graphic Designer (24 thn), Bandung',
      content: 'Penghasilan freelance gak menentu, jadi gampang stres atur uang. Fitur multi-wallet TataDana bikin saya bisa pisahin rekening operasional sama tabungan darurat dengan rapi.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    },
    {
      name: 'Ahmad Faiz',
      role: 'Staff Marketing (29 thn), Surabaya',
      content: 'Paling suka fitur scan struk Indomaret. Sekali foto, itemnya langsung dipecah rapi tanpa perlu input manual satu-satu. Hemat waktu banget!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
    },
    {
      name: 'Siti Rahmawati',
      role: 'Mahasiswi Tingkat Akhir (22 thn), Yogyakarta',
      content: 'Uang bulanan dari ortu sering tiris di minggu ketiga. Berkat bot TataDana yang ngingetin pas budget udah 80%, sekarang bisa nabung 300rb tiap bulan.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
    },
    {
      name: 'Kevin Jonathan',
      role: 'Product Manager (31 thn), Tangerang',
      content: 'Desainnya clean banget, gak silau kayak aplikasi lain. UI pastel sage & blush-nya modern dan adem di mata. Plus AI Advisor-nya beneran ngasih insight cerdas.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100',
    },
    {
      name: 'Dina Kusuma',
      role: 'Account Executive (27 thn), Jakarta Selatan',
      content: 'Sangat recommended buat yang malas buka app finansial biasa. Tinggal kirim voice note sambil jalan ke kantor, langsung kecatat otomatis!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-[#7a2e38] uppercase tracking-widest bg-[#fdcfd4]/40 px-3 py-1 rounded-full border border-[#fdcfd4]">
            Kata Pengguna Pertama
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Cerita Mereka yang Sudah Bebas dari Jebakan Gaji UMK
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            // Placeholder Beta Testimonials: Masukan dari early adopters TataDana
          </p>
        </div>

        {/* Masonry Grid Layout */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyTestimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-neutral-50/80 rounded-2xl p-6 border border-neutral-200/80 hover:shadow-md hover:border-brand-200 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed italic">
                  &quot;{t.content}&quot;
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-neutral-200/60">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-brand-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">{t.name}</h4>
                  <p className="text-[11px] text-neutral-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
