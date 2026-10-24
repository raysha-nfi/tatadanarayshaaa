'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA PUSAT BELAJAR & LITERASI KEUANGAN INDONESIA
// Modul Edukasi UMK, Kalkulator 50/30/20, Dana Darurat, Bocor Alus, & Kuis
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calculator,
  Award,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Coffee,
  Coins,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Sliders,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { LEARNING_MODULES, FINANCIAL_QUIZ_QUESTIONS, LearningModule } from '@/lib/mock-data';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/currency';

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'modules' | 'calculators' | 'quiz'>('modules');
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);

  // -------------------------------------------------------------
  // CALCULATOR 1: 50/30/20
  // -------------------------------------------------------------
  const [salaryInput, setSalaryInput] = useState<number>(5500000); // Rp 5.5 jt default (UMK Jakarta)
  const needsAmount = Math.round(salaryInput * 0.5);
  const wantsAmount = Math.round(salaryInput * 0.3);
  const savingsAmount = Math.round(salaryInput * 0.2);

  // -------------------------------------------------------------
  // CALCULATOR 2: DANA DARURAT
  // -------------------------------------------------------------
  const [monthlyExpense, setMonthlyExpense] = useState<number>(3500000);
  const [familyStatus, setFamilyStatus] = useState<number>(3); // 3x, 6x, 9x, 12x
  const [monthlySavingsCapacity, setMonthlySavingsCapacity] = useState<number>(500000);

  const emergencyGoal = monthlyExpense * familyStatus;
  const monthsToGoal = monthlySavingsCapacity > 0 ? Math.ceil(emergencyGoal / monthlySavingsCapacity) : 0;

  // -------------------------------------------------------------
  // CALCULATOR 3: BOCOR ALUS COMPOUNDING
  // -------------------------------------------------------------
  const [dailyLeak, setDailyLeak] = useState<number>(25000); // 25rb kopi kekinian
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);

  const leakPerMonth = dailyLeak * daysPerWeek * 4.33;
  const leakPerYear = leakPerMonth * 12;

  // Future value formula: FV = P * [((1 + r/n)^(nt) - 1) / (r/n)]
  const calcCompound = (monthly: number, years: number, rate: number = 0.065) => {
    const r = rate / 12;
    const n = years * 12;
    return Math.round(monthly * ((Math.pow(1 + r, n) - 1) / r));
  };

  const fv5Years = calcCompound(leakPerMonth, 5);
  const fv10Years = calcCompound(leakPerMonth, 10);

  // -------------------------------------------------------------
  // QUIZ STATE
  // -------------------------------------------------------------
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleSelectQuizAnswer = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    FINANCIAL_QUIZ_QUESTIONS.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: FINANCIAL_QUIZ_QUESTIONS.length,
      percentage: Math.round((correct / FINANCIAL_QUIZ_QUESTIONS.length) * 100),
    };
  };

  const quizResult = quizSubmitted ? calculateScore() : null;

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-blue-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> Akademi Finansial TataDana
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Pusat Belajar Literasi Keuangan Indonesia
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            Bukan teori rumit. Pelajari cara mengelola gaji UMK, menghentikan kebocoran uang kecil, membangun dana darurat, dan uji pemahamanmu dengan kuis interaktif berhadiah badge digital.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'modules'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" /> 5 Modul Praktis
            </button>
            <button
              onClick={() => setActiveTab('calculators')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'calculators'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Calculator className="w-4 h-4" /> 3 Kalkulator Finansial
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'quiz'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Award className="w-4 h-4" /> Kuis & Sertifikat Digital
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: MODULES LIST */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-neutral-900 tracking-tight">Modul Edukasi Terstruktur</h2>
              <p className="text-xs text-neutral-500">
                Pilih topik di bawah untuk membaca panduan praktis dan aksi nyata di aplikasi TataDana.
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-400">5 Panduan Tersedia</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LEARNING_MODULES.map((mod) => (
              <div
                key={mod.id}
                onClick={() => setSelectedModule(mod)}
                className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{mod.icon}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                        {mod.category}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                        {mod.level}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-4 font-black text-base text-neutral-900 group-hover:text-brand-600 transition-colors leading-snug">
                    {mod.title}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {mod.subtitle}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400 font-semibold">⏱️ Waktu baca: {mod.read_time}</span>
                  <span className="text-xs font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Baca <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE CALCULATORS */}
      {activeTab === 'calculators' && (
        <div className="space-y-6">
          {/* CALCULATOR 1: 50/30/20 */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Sliders className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-neutral-900">
                  Kalkulator Formula 50/30/20 (Gaji Bersih)
                </h3>
                <p className="text-xs text-neutral-500">
                  Ketahui nominal pasti berapa yang boleh dipakai untuk makan harian, jalan-jalan, dan tabungan wajib.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls */}
              <div className="lg:col-span-1 space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-1">
                    Gaji Bersih Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    value={salaryInput}
                    onChange={(e) => setSalaryInput(Number(e.target.value) || 0)}
                    step={250000}
                    className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-base font-bold rounded-xl px-4 py-2.5 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase w-full">Shortcut Cepat:</span>
                  {[3000000, 5500000, 8000000, 12000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSalaryInput(val)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    >
                      {formatCurrency(val)}
                    </button>
                  ))}
                </div>

                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                  💡 <b>Tips TataDana:</b> Jika biaya kosan di kota Anda mahal, ubah sementara menjadi formula 60/20/20. Jangan korbankan pos tabungan 20%!
                </div>
              </div>

              {/* Result Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#feedf0]/80 border border-[#fdcfd4] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase text-[#7a2e38] tracking-wider">
                      50% Kebutuhan Pokok
                    </span>
                    <p className="text-xl font-black text-neutral-900 mt-1">
                      {formatCurrency(needsAmount)}
                    </p>
                    <p className="text-[11px] text-neutral-600 mt-2 leading-relaxed">
                      Sewa Kost/Kontrakan, Makan Pokok Warteg, Listrik PLN, Air, Kuota Internet Kerja, Transportasi Bensin/KRL.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#7a2e38] bg-[#fdcfd4]/50 px-2 py-1 rounded mt-3 text-center">
                    Maks. Pengeluaran Wajib
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase text-purple-700 tracking-wider">
                      30% Keinginan (Wants)
                    </span>
                    <p className="text-xl font-black text-neutral-900 mt-1">
                      {formatCurrency(wantsAmount)}
                    </p>
                    <p className="text-[11px] text-neutral-600 mt-2 leading-relaxed">
                      Nongkrong di Cafe, Beli Baju/Skincare, Langganan Netflix/Spotify, Hobi, Makan Enak Akhir Pekan.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-100/70 px-2 py-1 rounded mt-3 text-center">
                    Bebas Dipakai Tanpa Rasa Bersalah
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase text-emerald-700 tracking-wider">
                      20% Tabungan / Masa Depan
                    </span>
                    <p className="text-xl font-black text-neutral-900 mt-1">
                      {formatCurrency(savingsAmount)}
                    </p>
                    <p className="text-[11px] text-neutral-600 mt-2 leading-relaxed">
                      Dana Darurat, RDPU/SBN Ritel, Asuransi Tambahan, Cicilan Pelunasan Utang Pokok.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded mt-3 text-center">
                    Potong Langsung Hari Pertama Gajian
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CALCULATOR 2 & 3 IN 2 COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CALCULATOR 2: DANA DARURAT */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900">
                    Kalkulator Target Dana Darurat
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Berapa bantalan uang tunai aman yang harus kamu miliki?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Pengeluaran Wajib per Bulan (Rp)
                  </label>
                  <input
                    type="number"
                    value={monthlyExpense}
                    onChange={(e) => setMonthlyExpense(Number(e.target.value) || 0)}
                    step={100000}
                    className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm font-bold rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Profil Status Kamu
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setFamilyStatus(3)}
                      className={`p-2 rounded-xl border font-bold text-left ${
                        familyStatus === 3
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                          : 'bg-white text-neutral-600 border-neutral-200'
                      }`}
                    >
                      Single (3x Pengeluaran)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFamilyStatus(6)}
                      className={`p-2 rounded-xl border font-bold text-left ${
                        familyStatus === 6
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                          : 'bg-white text-neutral-600 border-neutral-200'
                      }`}
                    >
                      Menikah (6x Pengeluaran)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFamilyStatus(9)}
                      className={`p-2 rounded-xl border font-bold text-left ${
                        familyStatus === 9
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                          : 'bg-white text-neutral-600 border-neutral-200'
                      }`}
                    >
                      Punya Anak (9x Pengeluaran)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFamilyStatus(12)}
                      className={`p-2 rounded-xl border font-bold text-left ${
                        familyStatus === 12
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                          : 'bg-white text-neutral-600 border-neutral-200'
                      }`}
                    >
                      Freelancer (12x Pengeluaran)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Kemampuan Menabung / Bulan (Rp)
                  </label>
                  <input
                    type="number"
                    value={monthlySavingsCapacity}
                    onChange={(e) => setMonthlySavingsCapacity(Number(e.target.value) || 0)}
                    step={50000}
                    className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm font-bold rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase">Target Total Dana Darurat</span>
                  <p className="text-xl font-black text-neutral-900 mt-0.5">
                    {formatCurrency(emergencyGoal)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase">Waktu Pencapaian</span>
                  <p className="text-base font-black text-emerald-600 mt-0.5">
                    ~ {monthsToGoal} Bulan ({Math.round(monthsToGoal / 12 * 10) / 10} Tahun)
                  </p>
                </div>
              </div>
            </div>

            {/* CALCULATOR 3: BOCOR ALUS */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Coffee className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900">
                    Kalkulator Efek "Bocor Alus" & Bunga Majemuk
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Berapa nilai uang jajan harian kecilmu jika diinvestasikan?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Biaya Jajan Kecil Harian (Kopi, Rokok, Boba, Snack)
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[15000, 25000, 40000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setDailyLeak(v)}
                        className={`p-2 rounded-xl border font-bold text-center ${
                          dailyLeak === v
                            ? 'bg-amber-50 text-amber-900 border-amber-400'
                            : 'bg-white text-neutral-600 border-neutral-200'
                        }`}
                      >
                        {formatCurrency(v)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Frekuensi per Minggu
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDaysPerWeek(5)}
                      className={`p-2 rounded-xl border font-bold text-center ${
                        daysPerWeek === 5
                          ? 'bg-amber-50 text-amber-900 border-amber-400'
                          : 'bg-white text-neutral-600 border-neutral-200'
                      }`}
                    >
                      5 Hari (Hari Kerja Saja)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysPerWeek(7)}
                      className={`p-2 rounded-xl border font-bold text-center ${
                        daysPerWeek === 7
                          ? 'bg-amber-50 text-amber-900 border-amber-400'
                          : 'bg-white text-neutral-600 border-neutral-200'
                      }`}
                    >
                      7 Hari (Setiap Hari)
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 text-white space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Total Uang Bocor per Tahun:</span>
                  <span className="font-bold text-amber-400">
                    {formatCurrency(leakPerYear)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Jika diinvestasikan 5 Tahun (RDPU 6.5%):</span>
                  <span className="font-extrabold text-emerald-400">
                    {formatCurrency(fv5Years)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Jika diinvestasikan 10 Tahun:</span>
                  <span className="font-black text-emerald-300 text-sm">
                    {formatCurrency(fv10Years)} 🚀
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUIZ & CERTIFICATE */}
      {activeTab === 'quiz' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-neutral-900">Kuis Evaluasi Literasi Finansial</h2>
              <p className="text-xs text-neutral-500">
                Jawab 5 pertanyaan studi kasus Indonesia untuk menguji pemahaman manajemen uangmu.
              </p>
            </div>
            {quizSubmitted && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                }}
                className="gap-1.5 shrink-0"
              >
                <RotateCcw className="w-4 h-4" /> Ulangi Kuis
              </Button>
            )}
          </div>

          {/* Quiz Score Banner (if submitted) */}
          {quizResult && (
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                quizResult.percentage >= 80
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-xl shadow-sm border border-neutral-200">
                  {quizResult.percentage >= 80 ? '🏆' : '📚'}
                </div>
                <div>
                  <h3 className="font-black text-base">
                    Skor Kamu: {quizResult.percentage}% ({quizResult.correct} dari {quizResult.total} Benar)
                  </h3>
                  <p className="text-xs mt-0.5 opacity-90">
                    {quizResult.percentage >= 80
                      ? 'Luar biasa! Pemahaman finansialmu sangat matang dan siap mencapai kebebasan finansial.'
                      : 'Bagus! Pelajari kembali modul di atas untuk memperkuat fondasi keuanganmu.'}
                  </p>
                </div>
              </div>

              {quizResult.percentage >= 80 && (
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-emerald-300 text-xs font-black text-emerald-800 flex items-center gap-2 self-start sm:self-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>BADGE "PAHAM FINANSIAL TATADANA" DIAKTIFKAN</span>
                </div>
              )}
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {FINANCIAL_QUIZ_QUESTIONS.map((q, idx) => {
              const selectedOpt = quizAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctAnswer;

              return (
                <div key={q.id} className="p-4 sm:p-5 rounded-xl border border-neutral-200/90 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h4 className="font-extrabold text-sm text-neutral-900 leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      let buttonStyle = 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50';

                      if (quizSubmitted) {
                        if (optIdx === q.correctAnswer) {
                          buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                        } else if (selectedOpt === optIdx) {
                          buttonStyle = 'bg-red-50 border-red-400 text-red-900';
                        }
                      } else if (selectedOpt === optIdx) {
                        buttonStyle = 'bg-brand-50 border-brand-500 text-brand-700 font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectQuizAnswer(q.id, optIdx)}
                          className={`text-left p-3 rounded-xl border text-xs transition-all ${buttonStyle}`}
                        >
                          <span className="font-bold mr-2 text-neutral-400">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-700 border border-neutral-200">
                      <span className="font-bold text-neutral-900">Penjelasan: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted && (
            <div className="pt-2 flex justify-end">
              <Button
                size="lg"
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(quizAnswers).length < FINANCIAL_QUIZ_QUESTIONS.length}
                className="gap-2"
              >
                Kirim & Lihat Skor <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MODAL: READ MODULE DETAILS */}
      <Modal
        isOpen={!!selectedModule}
        onClose={() => setSelectedModule(null)}
        title={selectedModule?.title || 'Panduan Finansial'}
        maxWidth="max-w-2xl"
      >
        {selectedModule && (
          <div className="space-y-5 text-sm">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ringkasan Materi</p>
              <p className="text-neutral-800 font-medium leading-relaxed">{selectedModule.summary}</p>
            </div>

            <div>
              <h4 className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider mb-2">
                📌 Poin Kunci Penting
              </h4>
              <ul className="space-y-1.5">
                {selectedModule.key_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#feedf0]/80 border border-[#fdcfd4]">
              <h4 className="font-extrabold text-[#7a2e38] text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-brand-600" /> Realita & Konteks Indonesia
              </h4>
              <p className="text-xs text-[#4a1c22] leading-relaxed font-medium">
                {selectedModule.indonesia_context}
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider mb-2">
                🚀 Langkah Aksi Nyata di TataDana
              </h4>
              <div className="space-y-2">
                {selectedModule.action_steps.map((st, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-100/70 text-xs font-semibold text-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <Button onClick={() => setSelectedModule(null)}>
                Saya Sudah Paham
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
