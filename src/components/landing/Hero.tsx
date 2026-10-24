'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-[#feedf0]/60 via-white to-white">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#afc28a]/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pre-headline badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fdcfd4]/40 border border-[#fdcfd4] text-[#7a2e38] text-xs sm:text-sm font-bold mb-6 shadow-xs">
          <span>✨</span>
          <span>Catat keuangan semudah chat di Telegram</span>
        </div>

        {/* Headline H1 with Sage & Blush Gradient */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-neutral-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Gaji habis sebelum akhir bulan?{' '}
          <span className="bg-gradient-to-r from-[#5f723b] via-[#afc28a] to-[#d36474] bg-clip-text text-transparent">
            Sudah saatnya kamu tahu ke mana uangmu pergi.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="mt-6 text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
          TataDana mencatat setiap pengeluaranmu langsung dari chat Telegram atau foto struk — sisanya kami yang urus.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-base px-8 py-4 shadow-lg shadow-[#afc28a]/30">
              Mulai Gratis Sekarang
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          <a href="#demo" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-4 bg-white/90 backdrop-blur-sm border-[#afc28a]/50">
              Lihat cara kerjanya →
            </Button>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-600 font-semibold">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#afc28a]" /> Tanpa Kartu Kredit
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#afc28a]" /> Setup 30 Detik
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7a2e38]" /> 100% Data Privat di Supabase
          </span>
        </div>

        {/* Hero Section Video Placeholder */}
        <div className="mt-14 max-w-4xl mx-auto">
          {/* TODO: ganti dengan video asli presentasi produk setelah ada demo footage */}
          <div className="relative rounded-2xl md:rounded-3xl border border-neutral-200/80 bg-neutral-900/5 p-2 sm:p-3 shadow-2xl backdrop-blur-sm">
            <div className="relative aspect-video rounded-xl md:rounded-2xl bg-neutral-900 overflow-hidden flex flex-col items-center justify-center text-white group cursor-pointer border border-neutral-800">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Play Button Icon */}
              <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-500/90 text-white flex items-center justify-center shadow-xl shadow-brand-500/40 group-hover:scale-110 group-hover:bg-brand-500 transition-all duration-300">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 fill-white" />
              </div>

              {/* Video Caption & Note */}
              <div className="relative z-10 mt-4 text-center px-4">
                <p className="text-sm sm:text-base font-semibold text-white tracking-wide">
                  Tonton Cara Kerja TataDana dalam 60 Detik
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  // Placeholder Video: Demo interaktif chat Telegram ke dashboard web
                </p>
              </div>

              {/* Decorative Mock Elements */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
