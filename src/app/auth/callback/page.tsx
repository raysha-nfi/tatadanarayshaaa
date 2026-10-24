'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA AUTH: RESET PASSWORD / OAUTH CALLBACK ROUTE (/auth/callback)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-sm w-full p-8 border border-neutral-200/90 shadow-xl bg-white rounded-3xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#feedf0] text-brand-700 border border-[#fdcfd4] flex items-center justify-center mx-auto shadow-sm animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-neutral-900">Mengotentikasi Sesi Anda</h3>
        <p className="text-xs text-neutral-500">
          Sedang menyinkronkan profil dan dompet TataDana... Anda akan dialihkan secara otomatis.
        </p>
      </Card>
    </div>
  );
}
