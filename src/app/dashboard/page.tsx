'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA USER DASHBOARD: OVERVIEW / BERANDA (PART 3 & PART 9)
// 4 Stats Cards, Charts, 10 Transaksi Terbaru, Onboarding Checklist, Periode Filter
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  ArrowRight,
  CheckCircle2,
  Circle,
  Calendar,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { formatRupiah, formatCompactRupiah } from '@/lib/currency';
import { formatIndonesianDate, formatIndonesianTime } from '@/lib/date';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function DashboardOverviewPage() {
  const {
    activeUser,
    wallets,
    categories,
    budgets,
    transactions,
    addTransaction,
  } = useApp();

  const [period, setPeriod] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan'>('bulanan');
  const [showAddModal, setShowAddModal] = useState(false);

  // Quick Transaction Modal Form
  const [txType, setTxType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [modalFeedback, setModalFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  // 1. Calculate Stats
  const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);

  const incomeTxs = transactions.filter((t) => t.type === 'income');
  const expenseTxs = transactions.filter((t) => t.type === 'expense');

  const totalIncome = incomeTxs.reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = expenseTxs.reduce((acc, t) => acc + Number(t.amount), 0);

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + Number(b.monthly_limit), 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0);
  const remainingBudget = Math.max(0, totalBudgetLimit - totalBudgetSpent);

  // 2. Category Expense Breakdown
  const categoryExpenses: Record<string, number> = {};
  expenseTxs.forEach((t) => {
    const catName = t.category?.name || 'Lainnya';
    categoryExpenses[catName] = (categoryExpenses[catName] || 0) + Number(t.amount);
  });

  const categoryPieData = Object.entries(categoryExpenses).map(([name, val]) => ({
    name,
    amount: val,
    percentage: totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0,
  }));

  // Onboarding Checklist progress
  const hasConnectedTelegram = activeUser.telegram_connected;
  const hasWallets = wallets.length > 0;
  const hasBudgets = budgets.length > 0;
  const onboardingComplete = hasConnectedTelegram && hasWallets && hasBudgets;

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setModalFeedback({ msg: 'Nominal tidak valid', isError: true });
      return;
    }

    const res = addTransaction({
      amount: parsedAmount,
      type: txType,
      category_id: txType === 'transfer' ? undefined : categoryId,
      wallet_id: walletId,
      notes,
      source: 'web',
      transaction_time: new Date().toISOString(),
    });

    if (!res.success) {
      setModalFeedback({ msg: res.message || 'Gagal menyimpan transaksi', isError: true });
      return;
    }

    setShowAddModal(false);
    setAmount('');
    setNotes('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Ringkasan Keuangan
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Pantau arus kas dan kendalikan pengeluaran harianmu dalam satu layar.
          </p>
        </div>

        {/* Period Filter & Quick Add Action */}
        <div className="flex items-center gap-3">
          <div className="inline-flex bg-white p-1 rounded-xl border border-neutral-200/90 shadow-sm text-xs font-semibold">
            {(['harian', 'mingguan', 'bulanan', 'tahunan'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  period === p ? 'bg-[#afc28a] text-neutral-900 font-bold shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button onClick={() => setShowAddModal(true)} size="md">
            <Plus className="w-4 h-4 mr-1" />
            Catat Transaksi
          </Button>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Saldo Total */}
        <Card className="flex items-center gap-4 bg-white border border-[#afc28a]/20 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#afc28a]/20 text-[#334020] flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Saldo Total</p>
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mt-0.5">
              {formatRupiah(totalBalance)}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">Dari {wallets.length} dompet aktif</p>
          </div>
        </Card>

        {/* Card 2: Pemasukan Bulan Ini */}
        <Card className="flex items-center gap-4 bg-white border border-[#afc28a]/20 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#afc28a]/25 text-[#334020] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pemasukan Bulan Ini</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#334020] mt-0.5">
              +{formatRupiah(totalIncome)}
            </h3>
            <p className="text-[11px] text-[#334020] font-semibold mt-1">Cashflow Sehat</p>
          </div>
        </Card>

        {/* Card 3: Pengeluaran Bulan Ini */}
        <Card className="flex items-center gap-4 bg-white border border-[#fdcfd4]/40 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#fdcfd4]/50 text-[#7a2e38] flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pengeluaran Bulan Ini</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#7a2e38] mt-0.5">
              -{formatRupiah(totalExpense)}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">{expenseTxs.length} transaksi dicatat</p>
          </div>
        </Card>

        {/* Card 4: Budget Tersisa */}
        <Card className="flex items-center gap-4 bg-white border border-[#afc28a]/20 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#fdcfd4]/35 text-[#7a2e38] flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Budget Tersisa</p>
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mt-0.5">
              {formatRupiah(remainingBudget)}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">
              {totalBudgetLimit > 0
                ? `${Math.round((totalBudgetSpent / totalBudgetLimit) * 100)}% terpakai`
                : 'Belum diatur'}
            </p>
          </div>
        </Card>
      </div>

      {/* ONBOARDING CHECKLIST FOR NEW USERS */}
      {!onboardingComplete && (
        <div className="bg-gradient-to-r from-[#feedf0] via-white to-[#f6f8f2] border border-[#afc28a]/30 rounded-2xl p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#334020] mb-1">
                <Sparkles className="w-4 h-4 text-brand-500" /> Onboarding Checklist
              </div>
              <h3 className="text-lg font-bold text-neutral-900">
                Langkah Cepat Memulai TataDana
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Selesaikan 3 langkah mudah ini untuk pengalaman manajemen finansial maksimal.
              </p>
            </div>
            <span className="text-xs font-bold bg-white text-brand-700 px-3 py-1 rounded-full border border-[#fdcfd4]">
              {[hasConnectedTelegram, hasWallets, hasBudgets].filter(Boolean).length}/3 Selesai
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Telegram */}
            <Link
              href="/dashboard/settings"
              className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
                hasConnectedTelegram
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-white border-neutral-200 hover:border-brand-400 text-neutral-800'
              }`}
            >
              {hasConnectedTelegram ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-neutral-300 shrink-0" />
              )}
              <div className="text-xs">
                <span className="font-bold block">1. Hubungkan Telegram Bot</span>
                <span className="text-neutral-500">Ketik /start di Telegram</span>
              </div>
            </Link>

            {/* Step 2: Set Wallet */}
            <Link
              href="/dashboard/wallet"
              className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
                hasWallets
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-white border-neutral-200 hover:border-brand-400 text-neutral-800'
              }`}
            >
              {hasWallets ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-neutral-300 shrink-0" />
              )}
              <div className="text-xs">
                <span className="font-bold block">2. Atur Dompet Utama</span>
                <span className="text-neutral-500">BCA, Cash, atau GoPay</span>
              </div>
            </Link>

            {/* Step 3: Set Budget */}
            <Link
              href="/dashboard/budget"
              className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
                hasBudgets
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-white border-neutral-200 hover:border-brand-400 text-neutral-800'
              }`}
            >
              {hasBudgets ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-neutral-300 shrink-0" />
              )}
              <div className="text-xs">
                <span className="font-bold block">3. Buat Target Budget</span>
                <span className="text-neutral-500">Pasang alert batas 80%</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Bar Chart Pemasukan vs Pengeluaran 6 Bulan Terakhir */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Arus Kas 6 Bulan Terakhir
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Perbandingan pemasukan vs pengeluaran bulanan
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Pemasukan
              </span>
              <span className="flex items-center gap-1.5 text-neutral-700">
                <span className="w-3 h-3 rounded-sm bg-neutral-800" /> Pengeluaran
              </span>
            </div>
          </div>

          {/* SVG Visual Bar Chart */}
          <div className="mt-6 h-64 flex items-end justify-between gap-4 px-2">
            {[
              { month: 'Mei', inc: 7500000, exp: 4200000 },
              { month: 'Jun', inc: 8000000, exp: 5100000 },
              { month: 'Jul', inc: 8000000, exp: 4900000 },
              { month: 'Agu', inc: 8500000, exp: 6200000 },
              { month: 'Sep', inc: 9000000, exp: 5800000 },
              { month: 'Okt', inc: 10000000, exp: 2385000 },
            ].map((bar, idx) => {
              const maxVal = 10000000;
              const incHeight = (bar.inc / maxVal) * 100;
              const expHeight = (bar.exp / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Income Bar */}
                    <div
                      style={{ height: `${incHeight}%` }}
                      className="w-1/2 max-w-[28px] bg-emerald-500 hover:bg-emerald-600 transition-all rounded-t-md relative group cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {formatCompactRupiah(bar.inc)}
                      </div>
                    </div>
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expHeight}%` }}
                      className="w-1/2 max-w-[28px] bg-neutral-800 hover:bg-neutral-900 transition-all rounded-t-md relative group cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {formatCompactRupiah(bar.exp)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-500">{bar.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Chart 2: Pie / Category Breakdown */}
        <Card>
          <div className="pb-4 border-b border-neutral-100">
            <h3 className="text-base font-bold text-neutral-900">
              Pengeluaran per Kategori
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Alokasi dana bulan ini
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {categoryPieData.length > 0 ? (
              categoryPieData.slice(0, 5).map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800">{cat.name}</span>
                    <span className="font-bold text-neutral-900">
                      {formatRupiah(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <ProgressBar percentage={cat.percentage} size="sm" />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-neutral-400 text-xs">
                Belum ada data pengeluaran bulan ini
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 10 TRANSAKSI TERBARU */}
      <Card>
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              10 Transaksi Terbaru
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tercatat otomatis dari Telegram & web
            </p>
          </div>
          <Link href="/dashboard/transaksi" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
            Lihat Semua Transaksi
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-neutral-100">
          {transactions.slice(0, 10).map((tx) => {
            const isInc = tx.type === 'income';
            const isTf = tx.type === 'transfer';
            return (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-neutral-50/60 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                    isInc ? 'bg-emerald-50 text-emerald-600' : isTf ? 'bg-blue-50 text-blue-600' : 'bg-[#feedf0] text-brand-700'
                  }`}>
                    {tx.category?.emoji || (isInc ? '💼' : isTf ? '🔄' : '💸')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">
                      {tx.notes || tx.category?.name || 'Transaksi'}
                    </h4>
                    <p className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>{formatIndonesianDate(tx.transaction_time)}</span>
                      <span>•</span>
                      <span>{formatIndonesianTime(tx.transaction_time)}</span>
                      <span>•</span>
                      <span className="font-medium text-neutral-600">👛 {tx.wallet?.name || 'Cash'}</span>
                      {tx.source.startsWith('telegram') && (
                        <span className="bg-sky-50 text-sky-600 text-[9px] px-1.5 py-0.2 rounded font-semibold">Bot</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    isInc ? 'text-emerald-600' : isTf ? 'text-blue-600' : 'text-neutral-900'
                  }`}>
                    {isInc ? '+' : isTf ? '•' : '-'}{formatRupiah(tx.amount)}
                  </span>
                  {tx.receipt_items && tx.receipt_items.length > 0 && (
                    <p className="text-[10px] text-brand-600 font-semibold mt-0.5">
                      🧾 {tx.receipt_items.length} item struk
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* QUICK TRANSACTION MODAL */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Catat Transaksi Manual"
        description="Pemasukan, pengeluaran, atau transfer antar dompet"
      >
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          {modalFeedback && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              modalFeedback.isError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {modalFeedback.msg}
            </div>
          )}

          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setTxType('expense')}
              className={`py-2 rounded-lg transition-all ${
                txType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-600'
              }`}
            >
              💸 Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setTxType('income')}
              className={`py-2 rounded-lg transition-all ${
                txType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-600'
              }`}
            >
              💰 Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setTxType('transfer')}
              className={`py-2 rounded-lg transition-all ${
                txType === 'transfer' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-600'
              }`}
            >
              🔄 Transfer
            </button>
          </div>

          <Input
            label="Nominal (Rp)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Contoh: 50000"
            required
          />

          {txType !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Kategori
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white border border-neutral-200 text-neutral-900 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Pilih Dompet
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full bg-white border border-neutral-200 text-neutral-900 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  👛 {w.name} (Saldo: {formatRupiah(w.balance)})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Catatan Transaksi"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Beli bakso pak kumis"
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Transaksi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
