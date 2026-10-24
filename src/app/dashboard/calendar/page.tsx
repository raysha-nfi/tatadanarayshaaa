'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA: FINANCIAL CALENDAR (KALENDER KEUANGAN & AGENDA ARUS KAS)
// Month/Week interactive grid, daily net cashflow badges, transaction drill-down,
// and recurring bills mapper.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Wallet,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah } from '@/lib/currency';
import { formatIndonesianDate } from '@/lib/date';
import { Transaction } from '@/types';

export default function CalendarPage() {
  const { transactions, categories, wallets, recurringBills, addTransaction } = useApp();

  // Current view state (Month navigation)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed, 9 = October
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Selected date modal state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Transaction Form state
  const [newType, setNewType] = useState<'expense' | 'income'>('expense');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]?.id || '');
  const [newWallet, setNewWallet] = useState(wallets[0]?.id || '');
  const [newNotes, setNewNotes] = useState('');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Calculate days in month and starting day offset
  const { daysInMonth, firstDayOffset } = useMemo(() => {
    const days = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    return { daysInMonth: days, firstDayOffset: firstDay };
  }, [currentYear, currentMonth]);

  // Map transactions by YYYY-MM-DD
  const dailyCashflow = useMemo(() => {
    const map: Record<string, { income: number; expense: number; txs: Transaction[] }> = {};

    transactions.forEach((tx) => {
      const dateKey = tx.transaction_time.slice(0, 10);
      if (!map[dateKey]) {
        map[dateKey] = { income: 0, expense: 0, txs: [] };
      }
      if (tx.type === 'income') {
        map[dateKey].income += tx.amount;
      } else if (tx.type === 'expense') {
        map[dateKey].expense += tx.amount;
      }
      map[dateKey].txs.push(tx);
    });

    return map;
  }, [transactions]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleOpenDate = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || isNaN(Number(newAmount))) return;

    addTransaction({
      amount: Number(newAmount),
      type: newType,
      category_id: newCategory,
      wallet_id: newWallet,
      notes: newNotes || 'Transaksi Kalender',
      transaction_time: `${selectedDate}T12:00:00+07:00`,
      source: 'web',
    });

    setNewAmount('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const selectedDateData = selectedDate ? dailyCashflow[selectedDate] : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Kalender Keuangan</h1>
            <Badge variant="brand" size="sm">Realtime Flow</Badge>
          </div>
          <p className="text-neutral-500 text-sm mt-1">
            Pantau arus kas harian, deteksi pola pengeluaran, dan jadwalkan tagihan rutin mendatang.
          </p>
        </div>

        {/* Month Navigation & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-neutral-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'month' ? 'bg-brand-500 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Grid Bulanan
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'agenda' ? 'bg-brand-500 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Daftar Tagihan
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-xl px-2 py-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-neutral-800 px-2 min-w-[110px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        <Card className="p-6 border border-neutral-200/90 shadow-sm bg-white overflow-hidden">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {daysOfWeek.map((day, idx) => (
              <div
                key={day}
                className={`text-xs font-bold py-1.5 uppercase tracking-wider ${
                  idx === 0 ? 'text-red-500' : 'text-neutral-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOffset }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-28 rounded-xl bg-neutral-50/50 border border-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayData = dailyCashflow[dateStr];
              const netCash = (dayData?.income || 0) - (dayData?.expense || 0);

              const hasIncome = (dayData?.income || 0) > 0;
              const hasExpense = (dayData?.expense || 0) > 0;

              // Check if any recurring bills fall on this day
              const billsToday = recurringBills.filter((b) => b.due_day === dayNum);

              return (
                <div
                  key={dateStr}
                  onClick={() => handleOpenDate(dateStr)}
                  className="h-28 p-2 rounded-xl border border-neutral-200/80 bg-white hover:border-brand-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-neutral-700 group-hover:text-brand-600">
                      {dayNum}
                    </span>
                    {billsToday.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-purple-500" title={`${billsToday.length} tagihan jatuh tempo`} />
                    )}
                  </div>

                  {/* Cashflow Indicators */}
                  <div className="space-y-1">
                    {hasIncome && (
                      <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded truncate flex items-center gap-1">
                        <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
                        <span>+{formatRupiah(dayData?.income || 0)}</span>
                      </div>
                    )}
                    {hasExpense && (
                      <div className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded truncate flex items-center gap-1">
                        <ArrowDownRight className="w-2.5 h-2.5 shrink-0" />
                        <span>-{formatRupiah(dayData?.expense || 0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Daily Net indicator bar */}
                  <div className="pt-1 border-t border-neutral-100 flex items-center justify-between text-[9px] font-semibold text-neutral-400">
                    <span>{dayData?.txs.length || 0} tx</span>
                    {netCash !== 0 && (
                      <span className={netCash > 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {netCash > 0 ? '+' : ''}{formatRupiah(netCash)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* Agenda & Recurring Bills View */
        <div className="space-y-4">
          <Card className="p-6 border border-neutral-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-extrabold text-neutral-900">Agenda Tagihan Rutin & Jatuh Tempo</h3>
              </div>
              <span className="text-xs text-neutral-400 font-medium">Bulan {monthNames[currentMonth]} {currentYear}</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {recurringBills.map((bill) => {
                const cat = categories.find((c) => c.id === bill.category_id);
                const wal = wallets.find((w) => w.id === bill.wallet_id);
                return (
                  <div key={bill.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                        {bill.due_day}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900">{bill.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                          <span>{cat?.emoji} {cat?.name || 'Tagihan'}</span>
                          <span>•</span>
                          <span>Auto: {wal?.name || 'BCA'}</span>
                          <span>•</span>
                          <span className="text-purple-600 font-semibold">{bill.frequency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-neutral-900 block">{formatRupiah(bill.amount)}</span>
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Jatuh Tempo: Tgl {bill.due_day}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Date Detail Drill-down Modal */}
      {selectedDate && (
        <Modal
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          title={`Transaksi: ${formatIndonesianDate(selectedDate)}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            {/* Daily Summary Header */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Total Pemasukan</span>
                <span className="text-base font-black text-emerald-700">+{formatRupiah(selectedDateData?.income || 0)}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">Total Pengeluaran</span>
                <span className="text-base font-black text-rose-700">-{formatRupiah(selectedDateData?.expense || 0)}</span>
              </div>
            </div>

            {/* List of transactions for this date */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {!selectedDateData || selectedDateData.txs.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-sm">
                  Belum ada transaksi tercatat pada tanggal ini.
                </div>
              ) : (
                selectedDateData.txs.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.category_id);
                  const wal = wallets.find((w) => w.id === tx.wallet_id);
                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl border border-neutral-100 bg-white flex items-center justify-between hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat?.emoji || '💳'}</span>
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{tx.notes || cat?.name || 'Transaksi'}</p>
                          <p className="text-[10px] text-neutral-400">{wal?.name} • {tx.source}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-black ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(null)}
              >
                Tutup
              </Button>
              <Button
                size="sm"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold flex items-center gap-1.5"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4" />
                <span>+ Catat Transaksi di Tanggal Ini</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Add Transaction Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={`Catat Transaksi Baru (${selectedDate})`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateTransaction} className="space-y-4">
            <div className="flex rounded-xl bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => setNewType('expense')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  newType === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-neutral-600'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setNewType('income')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  newType === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-600'
                }`}
              >
                Pemasukan
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Nominal (Rp)</label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="misal: 25000"
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Kategori</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Dompet</label>
              <select
                value={newWallet}
                onChange={(e) => setNewWallet(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Rp{w.balance.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Catatan</label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Catatan transaksi..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-brand-500 text-white font-bold">
                Simpan Transaksi
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
