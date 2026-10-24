import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FinalCta() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#6e8349] via-[#afc28a] to-[#db7483] text-white relative overflow-hidden shadow-inner">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-4 h-4" /> Solusi Finansial Generasi Muda
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Mulai kendalikan keuanganmu hari ini.
        </h2>

        <p className="mt-4 text-base sm:text-lg text-white/90 max-w-2xl mx-auto font-normal">
          Bergabunglah dengan ribuan pekerja dan kreator Indonesia yang telah mengubah kebiasaan finansial mereka semudah mengirim chat.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-brand-700 hover:bg-neutral-100 font-bold px-8 py-4 shadow-xl shadow-black/10 text-base"
            >
              Mulai Gratis Sekarang
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 px-8 py-4 text-base"
            >
              Masuk ke Akun
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/80 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-white" /> Akses langsung via Telegram
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-white" /> Garansi kepuasan 100%
          </span>
        </div>
      </div>
    </section>
  );
}
