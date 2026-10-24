'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA: MULTI-WALLET MANAGER & TAMBAH DOMPET BARU (/dashboard/wallets)
// Bank, E-Wallet, Cash, Deposito, Kartu Kredit.
// Initial balance, custom card color, primary Telegram wallet toggle, & inter-wallet transfer.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  Building2,
  Smartphone,
  Banknote,
  Landmark,
  CreditCard,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah } from '@/lib/currency';
import { Wallet } from '@/types';

export default function WalletsPage() {
  const {
    wallets,
    addWallet,
    setDefaultWallet,
    transferWallet,
    activeUser,
    transactions,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Wallet form
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<'bank' | 'ewallet' | 'cash' | 'deposit' | 'credit'>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [cardColor, setCardColor] = useState('#afc28a');
  const [isTelegramDefault, setIsTelegramDefault] = useState(false);

  // Transfer form
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');

  const walletTypes = [
    { id: 'bank', label: 'Bank Transfer', icon: Building2, desc: 'BCA, Mandiri, BRI, BNI' },
    { id: 'ewallet', label: 'E-Wallet', icon: Smartphone, desc: 'GoPay, OVO, ShopeePay, DANA' },
    { id: 'cash', label: 'Uang Tunai / Cash', icon: Banknote, desc: 'Dompet fisik harian' },
    { id: 'deposit', label: 'Deposito / Tabungan', icon: Landmark, desc: 'Rekening simpanan khusus' },
    { id: 'credit', label: 'Kartu Kredit', icon: CreditCard, desc: 'Limit & cicilan' },
  ];

  const colorPresets = [
    { label: 'Sage Green', hex: '#afc28a' },
    { label: 'Soft Blush', hex: '#fdcfd4' },
    { label: 'BCA Blue', hex: '#005baa' },
    { label: 'Mandiri Gold', hex: '#002d62' },
    { label: 'GoPay Cyan', hex: '#00aed6' },
    { label: 'DANA Blue', hex: '#118eea' },
    { label: 'OVO Purple', hex: '#4c3494' },
    { label: 'Shopee Red', hex: '#ee4d2d' },
    { label: 'Forest Green', hex: '#059669' },
    { label: 'Dark Slate', hex: '#1e293b' },
  ];

  const totalBalance = wallets.reduce((a, b) => a + b.balance, 0);

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName.trim()) return;

    const res = addWallet({
      name: walletName.trim(),
      balance: Number(initialBalance) || 0,
      color: cardColor,
      icon: walletType,
      is_default: isTelegramDefault || wallets.length === 0,
    });

    if (res.success) {
      setWalletName('');
      setInitialBalance('');
      setIsTelegramDefault(false);
      setShowAddModal(false);
      setErrorMsg(null);
    } else {
      setErrorMsg(res.message || 'Gagal menambahkan dompet');
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || isNaN(Number(transferAmount))) return;
    if (fromWalletId === toWalletId) {
      setErrorMsg('Dompet asal dan tujuan tidak boleh sama');
      return;
    }

    const res = transferWallet(fromWalletId, toWalletId, Number(transferAmount));
    if (res.success) {
      setTransferAmount('');
      setShowTransferModal(false);
      setErrorMsg(null);
    } else {
      setErrorMsg(res.message || 'Gagal melakukan transfer');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Manajemen Wallet & Dompet</h1>
            <Badge variant="brand" size="sm">Multi-Account</Badge>
          </div>
          <p className="text-neutral-500 text-sm mt-1">
            Kelola seluruh rekening bank, e-wallet, dan uang tunai Anda. Pilih 1 dompet default untuk pencatatan otomatis dari Telegram.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setShowTransferModal(true)}
            className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4 text-brand-500" />
            <span>Transfer Antar-Dompet</span>
          </Button>

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold flex items-center gap-2 shadow-sm shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Dompet Baru</span>
          </Button>
        </div>
      </div>

      {/* Summary Banner */}
      <Card className="p-6 border border-neutral-200/90 shadow-sm bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">Total Saldo Terkonsolidasi</span>
            <span className="text-3xl font-black text-white mt-1 block">
              {formatRupiah(totalBalance)}
            </span>
            <div className="flex items-center gap-2 mt-2 text-xs text-neutral-300">
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> {wallets.length} Akun Dompet Aktif
              </span>
              <span>•</span>
              <span>Default Telegram: <b>{wallets.find((w) => w.is_default)?.name || 'Belum dipilih'}</b></span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-xs text-neutral-200">
            <span className="font-bold text-white block mb-0.5">💡 Tips Bot Telegram:</span>
            Pesan seperti <code className="bg-white/20 px-1.5 py-0.5 rounded text-amber-300">"beli bakso 15rb"</code> otomatis memotong saldo dompet utama Telegram Anda.
          </div>
        </div>
      </Card>

      {/* Wallets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {wallets.map((wallet) => {
          const txCount = transactions.filter((t) => t.wallet_id === wallet.id || t.to_wallet_id === wallet.id).length;
          return (
            <Card
              key={wallet.id}
              className={`p-6 border transition-all rounded-2xl relative overflow-hidden flex flex-col justify-between ${
                wallet.is_default
                  ? 'border-brand-500 shadow-md shadow-brand-500/10 ring-2 ring-brand-500/20'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              {/* Card Color Strip */}
              <div
                className="h-2 w-full absolute top-0 left-0"
                style={{ backgroundColor: wallet.color }}
              />

              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: wallet.color }}
                    >
                      <WalletIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-neutral-900">{wallet.name}</h3>
                      <span className="text-[11px] font-semibold text-neutral-400 block">
                        {txCount} transaksi tercatat
                      </span>
                    </div>
                  </div>

                  {wallet.is_default && (
                    <Badge variant="brand" size="sm" className="bg-[#feedf0] text-brand-700 font-bold border-[#fdcfd4]">
                      ★ Utama Telegram
                    </Badge>
                  )}
                </div>

                <div className="my-4">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Saldo Saat Ini</span>
                  <span className="text-2xl font-black text-neutral-900 mt-0.5 block">
                    {formatRupiah(wallet.balance)}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                {!wallet.is_default ? (
                  <button
                    onClick={() => setDefaultWallet(wallet.id)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                  >
                    Jadikan Utama Telegram
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dompet Aktif Bot
                  </span>
                )}

                <button
                  onClick={() => {
                    setFromWalletId(wallet.id);
                    setShowTransferModal(true);
                  }}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Transfer
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tambah Dompet Baru Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setErrorMsg(null);
          }}
          title="+ Tambah Dompet / Akun Baru"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateWallet} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Tipe Akun Keuangan</label>
              <div className="grid grid-cols-2 gap-2">
                {walletTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = walletType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setWalletType(t.id as any)}
                      className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-[#feedf0]/80 border-brand-500 text-brand-700 shadow-sm'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-brand-500' : 'text-neutral-400'}`} />
                      <div>
                        <span className="text-xs font-bold block">{t.label}</span>
                        <span className="text-[10px] text-neutral-400 block">{t.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Nama Dompet / Rekening</label>
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="misal: Rekening BCA Utama / GoPay Jajan"
                required
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Saldo Awal (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">Rp</span>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1.5">Pilih Warna Kartu</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {colorPresets.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setCardColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full shrink-0 transition-transform ${
                      cardColor === c.hex ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110' : ''
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <input
                  type="checkbox"
                  checked={isTelegramDefault}
                  onChange={(e) => setIsTelegramDefault(e.target.checked)}
                  className="w-4 h-4 text-brand-500 rounded border-neutral-300 focus:ring-brand-500"
                />
                <span className="text-xs font-bold text-neutral-800">
                  Jadikan Dompet Utama Telegram (dipakai untuk transaksi bot)
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddModal(false);
                  setErrorMsg(null);
                }}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-brand-500 text-white font-bold">
                Simpan Dompet
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Transfer Antar-Dompet Modal */}
      {showTransferModal && (
        <Modal
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            setErrorMsg(null);
          }}
          title="Transfer Antar-Dompet"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleTransfer} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Dari Dompet Asal</label>
              <select
                value={fromWalletId}
                onChange={(e) => setFromWalletId(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Saldo: {formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Ke Dompet Tujuan</label>
              <select
                value={toWalletId}
                onChange={(e) => setToWalletId(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Saldo: {formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Nominal Transfer (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">Rp</span>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="misal: 100000"
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowTransferModal(false);
                  setErrorMsg(null);
                }}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-brand-500 text-white font-bold">
                Kirim Transfer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
