'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA: ONBOARDING AI KATEGORI (/onboarding)
// Rekomendasi kategori otomatis berbasis AI dari profil gaya hidup user
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2, ArrowRight, Wallet, Target, Bot } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/lib/app-context';

export default function OnboardingPage() {
  const router = useRouter();
  const { categories, addCategory, wallets, activeUser } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [occupation, setOccupation] = useState<'karyawan' | 'freelancer' | 'mahasiswa' | 'bisnis'>('karyawan');
  const [goal, setGoal] = useState<'hemat' | 'investasi' | 'kontrol_utang'>('hemat');
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedCats, setSelectedCats] = useState<string[]>([
    '🍜 Makanan & Minuman',
    '🚗 Transport & Bensin',
    '🏠 Tagihan & Utilitas',
    '🎮 Hiburan & Hobi',
    '💊 Kesehatan',
    '👕 Belanja Personal',
    '💰 Gaji Pokok Bulanan',
  ]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let customPicks = [
        '🍜 Makanan & Minuman',
        '🚗 Transport & Bensin',
        '🏠 Tagihan & Kos',
        '🎮 Hiburan & Nongkrong',
        '💊 Kesehatan',
        '👕 Belanja Bulanan',
        '💰 Gaji Pokok',
      ];

      if (occupation === 'freelancer') {
        customPicks.push('💻 Project Freelance', '☕ Co-working Space');
      } else if (occupation === 'mahasiswa') {
        customPicks.push('📚 Buku & Kuliah', '🍕 Uang Saku');
      } else if (occupation === 'bisnis') {
        customPicks.push('📦 Modal Usaha', '📈 Omzet Penjualan');
      }

      setSelectedCats(customPicks);
      setIsGenerating(false);
      setStep(2);
    }, 700);
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full p-8 border border-neutral-200/90 shadow-xl bg-white rounded-3xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black text-xs">
              TD
            </div>
            <span className="text-sm font-black text-neutral-900">TataDana Onboarding</span>
          </div>
          <Badge variant="brand" size="sm">Langkah {step} dari 2</Badge>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#feedf0] text-brand-700 border border-[#fdcfd4] flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Bot className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                Personalisasi Kategori Finansial Anda
              </h2>
              <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                AI TataDana akan menyusun paket kategori dan target budget awal berdasarkan gaya hidup Anda.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-2">Status / Pekerjaan Utama Anda</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'karyawan', label: '👔 Karyawan Swasta / BUMN', desc: 'Gaji bulanan rutin' },
                    { id: 'freelancer', label: '💻 Freelancer / Kreator', desc: 'Pendapatan tidak tetap' },
                    { id: 'mahasiswa', label: '🎓 Mahasiswa / Pelajar', desc: 'Kelola uang saku' },
                    { id: 'bisnis', label: '🛍️ Pemilik Usaha / UMKM', desc: 'Arus kas bisnis' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOccupation(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        occupation === item.id
                          ? 'border-brand-500 bg-[#feedf0]/80 text-[#5f723b] shadow-sm'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">{item.label}</span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-2">Tujuan Finansial Utama</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'hemat', label: '📉 Stop Boros', desc: 'Gaji awet sebulan' },
                    { id: 'investasi', label: '📈 Rajin Nabung', desc: 'Mulai investasi' },
                    { id: 'kontrol_utang', label: '🎯 Bebas Utang', desc: 'Arus kas rapi' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        goal === item.id
                          ? 'border-brand-500 bg-[#feedf0]/80 text-[#5f723b] shadow-sm'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">{item.label}</span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-xl shadow-md shadow-brand-500/20 text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'AI Sedang Menghitung Rekomendasi...' : 'Rekomendasikan Kategori Saya'}</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                Paket Kategori Siap Digunakan!
              </h2>
              <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                Kategori berikut otomatis aktif saat Anda mencatat pengeluaran di dashboard maupun via bot Telegram.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {selectedCats.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-bold text-neutral-800 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <span>{cat}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#feedf0]/70 rounded-2xl border border-[#fdcfd4] text-xs text-[#3a4925] space-y-1">
              <span className="font-bold block">👛 Dompet Awal Otomatis Dibuat:</span>
              <p>• <b>BCA Utama</b> (Saldo Rp5.200.000)</p>
              <p>• <b>GoPay Jajan</b> (Saldo Rp350.000) — Default Telegram</p>
              <p>• <b>Uang Tunai / Cash</b> (Saldo Rp450.000)</p>
            </div>

            <Button
              onClick={handleFinish}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-xl shadow-md shadow-brand-500/20 text-sm flex items-center justify-center gap-2"
            >
              <span>Masuk ke Dashboard TataDana</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
