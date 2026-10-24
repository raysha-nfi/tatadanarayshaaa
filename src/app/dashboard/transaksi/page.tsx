'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA USER DASHBOARD: TRANSAKSI (PART 3 & PART 9)
// Pencatatan, Filter, Multi-Item Receipt Expander, Real-time update
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Receipt,
  Trash2,
  Calendar,
  Wallet as WalletIcon,
  Tag,
  ArrowRightLeft,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { formatRupiah } from '@/lib/currency';
import { formatIndonesianDate, formatIndonesianTime } from '@/lib/date';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function TransaksiPage() {
  const {
    transactions,
    wallets,
    categories,
    addTransaction,
    deleteTransaction,
    activeUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [expandedReceipts, setExpandedReceipts] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [txType, setTxType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || '');
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState('');

  const toggleReceiptExpand = (txId: string) => {
    setExpandedReceipts((prev) => ({ ...prev, [txId]: !prev[txId] }));
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchNotes = tx.notes?.toLowerCase().includes(term);
      const matchCat = tx.category?.name.toLowerCase().includes(term);
      const matchWallet = tx.wallet?.name.toLowerCase().includes(term);
      if (!matchNotes && !matchCat && !matchWallet) return false;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    const num = Number(amount);
    if (!num || num <= 0) {
      setModalError('Nominal transaksi harus lebih dari 0');
      return;
    }

    const res = addTransaction({
      amount: num,
      type: txType,
      wallet_id: walletId,
      to_wallet_id: txType === 'transfer' ? toWalletId : undefined,
      category_id: txType === 'transfer' ? undefined : categoryId,
      notes,
      source: 'web',
      transaction_time: new Date().toISOString(),
    });

    if (!res.success) {
      setModalError(res.message || 'Gagal menyimpan transaksi');
      return;
    }

    setShowAddModal(false);
    setAmount('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Daftar Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Total {transactions.length} transaksi tercatat secara otomatis dan manual.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="md" className="shadow-brand-500/20">
          <Plus className="w-4 h-4 mr-1" />
          Tambah Transaksi
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari catatan, kategori, dompet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 text-sm rounded-xl pl-10 pr-4 py-2 outline-none focus:bg-white focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: 'expense', label: '💸 Pengeluaran' },
                { id: 'income', label: '💰 Pemasukan' },
                { id: 'transfer', label: '🔄 Transfer' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  typeFilter === f.id
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      <Card className="p-0 overflow-hidden divide-y divide-neutral-100">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => {
            const isExpanded = !!expandedReceipts[tx.id];
            const hasItems = tx.receipt_items && tx.receipt_items.length > 0;
            const isInc = tx.type === 'income';
            const isTf = tx.type === 'transfer';

            return (
              <div key={tx.id} className="p-4 sm:p-5 hover:bg-neutral-50/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                        isInc
                          ? 'bg-emerald-50 text-emerald-600'
                          : isTf
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-[#feedf0] text-brand-700'
                      }`}
                    >
                      {tx.category?.emoji || (isInc ? '💼' : isTf ? '🔄' : '💸')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                          {tx.notes || tx.category?.name || 'Transaksi'}
                        </h4>
                        {tx.source.startsWith('telegram') && (
                          <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            Telegram {tx.source === 'telegram_receipt' ? 'Struk' : tx.source === 'telegram_voice' ? 'VN' : 'Chat'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-1">
                        <span>{formatIndonesianDate(tx.transaction_time)}</span>
                        <span>•</span>
                        <span>{formatIndonesianTime(tx.transaction_time)}</span>
                        <span>•</span>
                        <span className="text-neutral-600 font-medium">👛 {tx.wallet?.name || 'Cash'}</span>
                        {isTf && tx.to_wallet && (
                          <span className="text-blue-600 font-semibold">➔ {tx.to_wallet.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-base font-extrabold block ${
                          isInc ? 'text-emerald-600' : isTf ? 'text-blue-600' : 'text-neutral-900'
                        }`}
                      >
                        {isInc ? '+' : isTf ? '•' : '-'}{formatRupiah(tx.amount)}
                      </span>
                      {hasItems && (
                        <button
                          onClick={() => toggleReceiptExpand(tx.id)}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#7a2e38] hover:text-[#5f723b] bg-[#feedf0] border border-[#fdcfd4] px-2 py-0.5 rounded-md"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>{tx.receipt_items!.length} Item Struk</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      title="Hapus Transaksi"
                      className="text-neutral-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* EXPANDABLE MULTI-ITEM RECEIPT (PART 3 & 4.2) */}
                {isExpanded && hasItems && (
                  <div className="mt-4 pt-3 border-t border-neutral-100 bg-neutral-50 rounded-xl p-4 text-xs space-y-2">
                    <div className="font-bold text-neutral-700 flex items-center justify-between pb-1 border-b border-neutral-200">
                      <span>Rincian Item Pembelian (Hasil OCR AI Vision)</span>
                      <span>Total: {formatRupiah(tx.amount)}</span>
                    </div>
                    {tx.receipt_items!.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center justify-between text-neutral-600 py-0.5">
                        <span className="font-medium">• {item.item_name} {item.quantity > 1 ? `(${item.quantity}x)` : ''}</span>
                        <span className="font-semibold text-neutral-800">{formatRupiah(item.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4 text-2xl">
              📂
            </div>
            <h3 className="text-base font-bold text-neutral-800">Belum Ada Transaksi</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Mulai mencatat pengeluaranmu dari form atau kirim pesan ke bot Telegram sekarang.
            </p>
            <Button onClick={() => setShowAddModal(true)} size="sm" className="mt-4">
              Catat Transaksi Pertama
            </Button>
          </div>
        )}
      </Card>

      {/* CREATE TRANSACTION MODAL */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Catat Transaksi Baru"
        description="Pencatatan langsung tersimpan di Supabase database"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
              {modalError}
            </div>
          )}

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
            label="Nominal Transaksi (Rp)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Contoh: 35000"
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
              {txType === 'transfer' ? 'Dari Dompet Asal' : 'Pilih Dompet'}
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

          {txType === 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Ke Dompet Tujuan
              </label>
              <select
                value={toWalletId}
                onChange={(e) => setToWalletId(e.target.value)}
                className="w-full bg-white border border-neutral-200 text-neutral-900 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              >
                {wallets.filter(w => w.id !== walletId).map((w) => (
                  <option key={w.id} value={w.id}>
                    👛 {w.name} (Saldo: {formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Catatan Transaksi"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Kopi susu janji jiwa"
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
