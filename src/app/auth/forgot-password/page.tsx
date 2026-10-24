'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA AUTH: FORGOT PASSWORD ROUTE (/auth/forgot-password)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 border border-neutral-200/90 shadow-xl bg-white rounded-3xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#feedf0] text-brand-700 border border-[#fdcfd4] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Lupa Kata Sandi?</h2>
        <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto">
          Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan reset kata sandi ke inbox Anda.
        </p>

        {isSubmitted ? (
          <div className="mt-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs text-left space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tautan Terkirim!</span>
            </div>
            <p>
              Instruksi reset kata sandi telah dikirim ke <b>{email}</b>. Silakan periksa kotak masuk atau folder spam Anda.
            </p>
            <Link href="/auth/login" className="block text-brand-600 font-bold hover:underline pt-2">
              ← Kembali ke Halaman Masuk
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Email Terdaftar</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3 rounded-xl shadow-md shadow-brand-500/20 text-sm"
            >
              Kirim Tautan Reset
            </Button>

            <div className="text-center pt-2">
              <Link href="/auth/login" className="text-xs font-bold text-neutral-500 hover:text-neutral-800">
                Batal dan kembali ke halaman login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
