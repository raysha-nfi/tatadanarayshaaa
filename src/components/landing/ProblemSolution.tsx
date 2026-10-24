import React from 'react';
import { XCircle, ArrowDown, CheckCircle2, MessageSquare, Sparkles, TrendingUp } from 'lucide-react';

export function ProblemSolution() {
  const problems = [
    {
      quote: '“Buka aplikasi keuangan? Nanti dulu deh...”',
      description: 'Aplikasi pencatat konvensional terlalu ribet: banyak klik, form panjang, bikin malas mencatat setiap hari.',
      icon: '😩',
    },
    {
      quote: '“Kok uangnya habis ya? Padahal kayak tidak beli apa-apa.”',
      description: 'Kopi 25rb, jajan 15rb, parkir 5rb. Pengeluaran kecil tak tercatat yang diam-diam menguras gaji kamu.',
      icon: '💸',
    },
    {
      quote: '“Udah niat bikin budget, tapi seminggu lupa.”',
      description: 'Budget yang dibuat tapi tidak dipantau secara real-time sama saja dengan tidak ada budget sama sekali.',
      icon: '📉',
    },
  ];

  return (
    <section className="py-20 bg-neutral-50/60 border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Realita Finansial Kita
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Kenapa mencatat keuangan terasa begitu berat?
          </h2>
          <p className="mt-4 text-base text-neutral-600">
            Bukan karena kamu tidak disiplin, tapi karena metode yang ada selama ini menuntut terlalu banyak usaha.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-7 border border-red-100/80 shadow-sm relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-red-400 to-amber-400" />
              <div>
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="text-lg font-bold text-neutral-900 leading-snug">
                  {p.quote}
                </h3>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  {p.description}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-red-500">
                <XCircle className="w-4 h-4" /> Masalah Klasik
              </div>
            </div>
          ))}
        </div>

        {/* Transition Bridge */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fdcfd4]/40 text-[#5f723b] flex items-center justify-center animate-bounce">
              <ArrowDown className="w-5 h-5" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-neutral-800 tracking-tight">
              Bagaimana kalau mencatat keuangan semudah kirim pesan ke teman?
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-extrabold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-brand-500" /> Introducing TataDana
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
