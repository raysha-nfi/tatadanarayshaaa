'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA: MULTI-PERIOD BUDGET MANAGER (/dashboard/budgets)
// Supports Harian (Daily), Mingguan (Weekly), Bulanan (Monthly), & Tahunan (Yearly)
// Visual progress bars, Telegram threshold alerts (80% & 100%), and active period controls.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Target,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Sparkles,
  TrendingDown,
  Calendar,
  Layers,
  ArrowRight,
  Sun,
  Flame,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah } from '@/lib/currency';
import { BudgetPeriodType } from '@/types';

export default function BudgetsPage() {
  const { budgets, categories, setBudgetMultiPeriod, activeUser } = useApp();

  const [activeTab, setActiveTab] = useState<BudgetPeriodType>('monthly');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [limitAmount, setLimitAmount] = useState('');
  const [formPeriod, setFormPeriod] = useState<BudgetPeriodType>('monthly');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const periods: { id: BudgetPeriodType; label: string; icon: string; desc: string }[] = [
    { id: 'daily', label: '☀️ Harian', icon: '☀️', desc: 'Uang jajan & makan harian' },
    { id: 'weekly', label: '🗓️ Mingguan', icon: '🗓️', desc: 'Kontrol ketat per minggu' },
    { id: 'monthly', label: '🌙 Bulanan', icon: '🌙', desc: 'Alokasi rutin gaji bulanan' },
    { id: 'yearly', label: '🎆 Tahunan', icon: '🎆', desc: 'Liburan, servis, qurban, asuransi' },
  ];

  // Filter budgets by activeTab (fallback to 'monthly' if period_type is undefined)
  const filteredBudgets = budgets.filter((b) => (b.period_type || 'monthly') === activeTab);

  const totalLimit = filteredBudgets.reduce((a, b) => a + b.monthly_limit, 0);
  const totalSpent = filteredBudgets.reduce((a, b) => a + (b.spent || 0), 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const overallPercentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitAmount || isNaN(Number(limitAmount))) return;

    const res = setBudgetMultiPeriod(selectedCategory, Number(limitAmount), formPeriod);
    if (res.success) {
      setLimitAmount('');
      setShowAddModal(false);
      setActiveTab(formPeriod);
    } else {
      setFeedbackMsg(res.message || 'Gagal menyimpan budget');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Sistem Budgeting Multi-Periode</h1>
            <Badge variant="brand" size="sm">Smart Tracking</Badge>
          </div>
          <p className="text-neutral-500 text-sm mt-1">
            Fleksibel mengatur batas pengeluaran secara harian, mingguan, bulanan, maupun tahunan dengan alert Telegram otomatis.
          </p>
        </div>

        <Button
          onClick={() => {
            setFormPeriod(activeTab);
            setShowAddModal(true);
          }}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold flex items-center gap-2 shadow-sm shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Target Budget</span>
        </Button>
      </div>

      {/* Period Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {periods.map((p) => {
          const isActive = activeTab === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-[#feedf0]/90 border-brand-500 shadow-md shadow-brand-500/10'
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{p.icon}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-brand-500" />}
              </div>
              <h3 className={`text-sm font-black ${isActive ? 'text-brand-600' : 'text-neutral-800'}`}>
                {p.label}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">{p.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Overview Metric Banner for Selected Period */}
      <Card className="p-6 border border-neutral-200/90 shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Total Target ({activeTab.toUpperCase()})
            </span>
            <span className="text-xl font-black text-neutral-900 mt-1 block">
              {formatRupiah(totalLimit)}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Total Terpakai
            </span>
            <span className="text-xl font-black text-rose-600 mt-1 block">
              {formatRupiah(totalSpent)}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Sisa Kuota Tersedia
            </span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">
              {formatRupiah(totalRemaining)}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-neutral-600">Rasio Penggunaan</span>
              <span className={overallPercentage >= 80 ? 'text-rose-600' : 'text-brand-600'}>
                {overallPercentage}%
              </span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercentage >= 100
                    ? 'bg-rose-600'
                    : overallPercentage >= 80
                    ? 'bg-amber-500'
                    : 'bg-brand-500'
                }`}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Budget Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
            <span>Daftar Kategori Budget {periods.find((p) => p.id === activeTab)?.label}</span>
            <Badge variant="neutral" size="sm">{filteredBudgets.length} Kategori</Badge>
          </h3>
        </div>

        {filteredBudgets.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-neutral-200">
            <Target className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-neutral-800">Belum ada target budget {activeTab}</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Pasang batas pengeluaran untuk periode ini agar Anda menerima peringatan otomatis lewat bot Telegram saat mendekati batas.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setFormPeriod(activeTab);
                setShowAddModal(true);
              }}
              className="mt-4 bg-brand-500 text-white font-bold"
            >
              + Pasang Budget {periods.find((p) => p.id === activeTab)?.label}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBudgets.map((b) => {
              const cat = categories.find((c) => c.id === b.category_id);
              const percentage = b.percentage || 0;
              const isOver = percentage >= 100;
              const isNear = percentage >= 80 && !isOver;

              return (
                <Card
                  key={b.id}
                  className={`p-5 border transition-all ${
                    isOver
                      ? 'border-rose-300 bg-rose-50/20'
                      : isNear
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-neutral-200/90 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-neutral-100 flex items-center justify-center text-2xl shadow-inner">
                        {cat?.emoji || '🎯'}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-neutral-900">{cat?.name || 'Kategori'}</h4>
                        <span className="text-[11px] font-semibold text-neutral-400 capitalize">
                          Periode: {b.period_type || 'monthly'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-neutral-900 block">
                        {formatRupiah(b.monthly_limit)}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-medium">Target Limit</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-neutral-500">
                        Terpakai: <b className="text-neutral-900">{formatRupiah(b.spent || 0)}</b>
                      </span>
                      <span
                        className={`font-black ${
                          isOver ? 'text-rose-600' : isNear ? 'text-amber-600' : 'text-brand-600'
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-600' : isNear ? 'bg-amber-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 pt-0.5">
                      <span>Sisa: {formatRupiah(b.remaining || 0)}</span>
                      {isOver ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Melebihi Batas!
                        </span>
                      ) : isNear ? (
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                          <Bell className="w-3 h-3" /> Alert 80% Telegram
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Terkendali
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setFeedbackMsg(null);
          }}
          title="Pasang Target Budget Finansial"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveBudget} className="space-y-4">
            {feedbackMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                {feedbackMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Pilih Periode Budget</label>
              <div className="grid grid-cols-2 gap-2">
                {periods.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormPeriod(p.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      formPeriod === p.id
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Kategori Pengeluaran</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Batas Nominal ({formPeriod.toUpperCase()})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">Rp</span>
                <input
                  type="number"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  placeholder="misal: 1500000"
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-500 space-y-1">
              <p className="font-bold text-neutral-700">🔔 Fitur Otomasi Bot Telegram:</p>
              <p>• Notifikasi peringatan dikirim saat transaksi mencapai <b>80%</b> kuota.</p>
              <p>• Peringatan kritis otomatis dikirim saat budget mencapai <b>100%</b>.</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddModal(false);
                  setFeedbackMsg(null);
                }}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-brand-500 text-white font-bold">
                Simpan Target Budget
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
