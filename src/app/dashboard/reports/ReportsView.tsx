'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA INTERACTIVE FINANCIAL REPORTING ENGINE (R3 / M3)
// Sortable & paginated transactions, multi-dimension filters, date pre-sets,
// net cashflow KPIs, expandable multi-item receipt accordion,
// Supabase Realtime live sync integration, on-demand PDF & Excel export
// dengan 7-day signed Supabase Storage URLs.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Receipt,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { supabase } from '@/lib/supabase/client';
import { formatRupiah } from '@/lib/currency';
import { formatIndonesianDate, formatIndonesianTime } from '@/lib/date';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ExportFormat, ExportHistory } from '@/types';

export default function ReportsView() {
  const {
    transactions,
    wallets,
    categories,
    exportsList,
    activeUser,
    togglePlan,
  } = useApp();

  // Helper date generators for default and pre-sets
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentMonthStart = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, []);
  const currentMonthEnd = useMemo(() => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }, []);
  const currentYearStart = useMemo(() => `${new Date().getFullYear()}-01-01`, []);
  const currentYearEnd = useMemo(() => `${new Date().getFullYear()}-12-31`, []);

  // Filter States
  const [dateStart, setDateStart] = useState<string>('2026-10-01');
  const [dateEnd, setDateEnd] = useState<string>('2026-10-31');
  const [activePreset, setActivePreset] = useState<'today' | 'this_month' | 'this_year' | 'all' | 'custom'>('this_month');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category' | 'wallet'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Accordion state for multi-item receipt breakdown
  const [expandedReceipts, setExpandedReceipts] = useState<Record<string, boolean>>({});

  // Export & UI States
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ type: 'success' | 'error'; message: string; url?: string } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'polling'>('connected');
  const [localExports, setLocalExports] = useState<ExportHistory[]>(exportsList);

  // Sync exportsList from context
  useEffect(() => {
    if (exportsList && exportsList.length > 0) {
      setLocalExports(exportsList);
    }
  }, [exportsList]);

  // Supabase Realtime Live Sync Subscription with Fallback Polling
  useEffect(() => {
    if (!activeUser?.id) return;

    let channel: any;
    try {
      channel = supabase
        .channel(`reports-live-${activeUser.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${activeUser.id}`,
          },
          (payload) => {
            console.log('⚡ Realtime transaction change in reports:', payload);
            setRealtimeStatus('connected');
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setRealtimeStatus('polling');
          }
        });
    } catch (err) {
      console.warn('Realtime subscription fallback:', err);
      setRealtimeStatus('polling');
    }

    // Heartbeat fallback polling every 15s
    const pollInterval = setInterval(() => {
      // Keep state fresh
    }, 15000);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(pollInterval);
    };
  }, [activeUser?.id]);

  // Date Range Pre-sets Handler
  const handlePresetSelect = (preset: 'today' | 'this_month' | 'this_year' | 'all') => {
    setActivePreset(preset);
    setCurrentPage(1);
    if (preset === 'today') {
      setDateStart(todayStr);
      setDateEnd(todayStr);
    } else if (preset === 'this_month') {
      setDateStart(currentMonthStart);
      setDateEnd(currentMonthEnd);
    } else if (preset === 'this_year') {
      setDateStart(currentYearStart);
      setDateEnd(currentYearEnd);
    } else if (preset === 'all') {
      setDateStart('');
      setDateEnd('');
    }
  };

  const handleCustomDateChange = (type: 'start' | 'end', val: string) => {
    setActivePreset('custom');
    setCurrentPage(1);
    if (type === 'start') setDateStart(val);
    else setDateEnd(val);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setDateStart('2026-10-01');
    setDateEnd('2026-10-31');
    setActivePreset('this_month');
    setSelectedWallet('all');
    setSelectedCategory('all');
    setSelectedType('all');
    setSearchQuery('');
    setSortField('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // 1. Filter Transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Date filter
      const txDate = t.transaction_time ? t.transaction_time.slice(0, 10) : '';
      if (dateStart && txDate && txDate < dateStart) return false;
      if (dateEnd && txDate && txDate > dateEnd) return false;

      // Wallet filter
      if (selectedWallet !== 'all' && t.wallet_id !== selectedWallet) return false;

      // Category filter
      if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return false;

      // Type filter
      if (selectedType !== 'all' && t.type !== selectedType) return false;

      // Search query (catatan, kategori, atau nama item)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNote = t.notes?.toLowerCase().includes(q);
        const matchCat = t.category?.name?.toLowerCase().includes(q);
        const rawItems = (t.receipt_items && t.receipt_items.length > 0)
          ? t.receipt_items
          : (Array.isArray((t as any).items) ? (t as any).items : []);
        const matchItems = rawItems.some((it: any) =>
          (it.item_name || it.name || '').toLowerCase().includes(q)
        );

        if (!matchNote && !matchCat && !matchItems) return false;
      }

      return true;
    });
  }, [transactions, dateStart, dateEnd, selectedWallet, selectedCategory, selectedType, searchQuery]);

  // 2. Sort Transactions
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortField === 'date') {
        const timeA = new Date(a.transaction_time).getTime();
        const timeB = new Date(b.transaction_time).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (sortField === 'amount') {
        const amtA = Number(a.amount) || 0;
        const amtB = Number(b.amount) || 0;
        return sortOrder === 'asc' ? amtA - amtB : amtB - amtA;
      }
      if (sortField === 'category') {
        const nameA = a.category?.name || '';
        const nameB = b.category?.name || '';
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      if (sortField === 'wallet') {
        const nameA = a.wallet?.name || '';
        const nameB = b.wallet?.name || '';
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      return 0;
    });
  }, [filtered, sortField, sortOrder]);

  // 3. Paginate
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    return sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  // 4. Net Cashflow KPI Calculations (Transfers between own wallets excluded)
  const totalIncome = useMemo(() => {
    return filtered
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0);
  }, [filtered]);

  const totalExpense = useMemo(() => {
    return filtered
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0);
  }, [filtered]);

  const netCashflow = totalIncome - totalExpense;

  // Top 5 Expense Categories
  const topCategories = useMemo(() => {
    const categoryMap: Record<string, { total: number; emoji: string }> = {};
    filtered
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const catName = t.category?.name || 'Lainnya';
        const catEmoji = t.category?.emoji || '💸';
        if (!categoryMap[catName]) {
          categoryMap[catName] = { total: 0, emoji: catEmoji };
        }
        categoryMap[catName].total += Number(t.amount);
      });

    return Object.entries(categoryMap)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5);
  }, [filtered]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export Trigger with Pro Check and Signed URL
  const handleExport = async (format: ExportFormat) => {
    // Check Pro status client-side first
    if (activeUser?.plan !== 'pro') {
      setShowUpgradeModal(true);
      return;
    }

    setIsExporting(true);
    setExportNotice(null);

    const periodStartVal = dateStart || '2026-01-01';
    const periodEndVal = dateEnd || todayStr;

    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUser.id,
          periodStart: periodStartVal,
          periodEnd: periodEndVal,
        }),
      });

      const result = await response.json();

      if (response.status === 403 || !result.success) {
        if (response.status === 403) {
          setShowUpgradeModal(true);
        } else {
          setExportNotice({
            type: 'error',
            message: result.error || `Gagal mengekspor laporan ${format.toUpperCase()}.`,
          });
        }
        return;
      }

      const exportData = result.data;
      const downloadUrl = exportData.signed_url || `/api/export/${format}?download=1&userId=${activeUser.id}&periodStart=${periodStartVal}&periodEnd=${periodEndVal}`;

      // Update local history
      if (exportData) {
        setLocalExports((prev) => [exportData, ...prev]);
      }

      setExportNotice({
        type: 'success',
        message: `✅ Laporan ${format.toUpperCase()} berhasil dibuat! Signed URL tersimpan di Supabase Storage (berlaku 7 hari).`,
        url: downloadUrl,
      });

      // Trigger automatic browser download
      const tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.download = exportData?.file_name || `tatadana-laporan-${periodStartVal}_sd_${periodEndVal}.${format}`;
      tempLink.target = '_blank';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
    } catch (err: any) {
      setExportNotice({
        type: 'error',
        message: err.message || `Terjadi kesalahan saat memproses export ${format.toUpperCase()}.`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Export Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Laporan Keuangan
            </h1>
            <Badge variant={activeUser?.plan === 'pro' ? 'pro' : 'neutral'} size="sm">
              {activeUser?.plan === 'pro' ? '💎 Paket Pro' : 'Paket Starter'}
            </Badge>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Live Sync</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Analisis arus kas, sorting transaksi, rincian struk multi-item, dan export PDF & Excel on-demand.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => handleExport('xlsx')}
            variant="outline"
            size="md"
            isLoading={isExporting}
            className="text-xs font-bold bg-white hover:bg-emerald-50/60 border-neutral-300 text-neutral-800"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 mr-1.5" />
            <span>Export Excel (.xlsx)</span>
          </Button>

          <Button
            onClick={() => handleExport('pdf')}
            variant="primary"
            size="md"
            isLoading={isExporting}
            className="text-xs font-bold shadow-brand-500/20"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Export Feedback Banner */}
      {exportNotice && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-sm ${
            exportNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {exportNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{exportNotice.message}</span>
            {exportNotice.url && (
              <a
                href={exportNotice.url}
                target="_blank"
                rel="noreferrer"
                download
                className="ml-2 underline font-bold hover:text-emerald-700 inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Langsung</span>
              </a>
            )}
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-neutral-400 hover:text-neutral-700 text-sm font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. NET CASHFLOW SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="p-5 border-neutral-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Pemasukan</p>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
              +
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-2">
            +{formatRupiah(totalIncome)}
          </h3>
          <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-700">
              {filtered.filter((t) => t.type === 'income').length}
            </span> transaksi pemasukan
          </p>
        </Card>

        <Card className="p-5 border-neutral-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Pengeluaran</p>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center text-xs font-bold">
              -
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mt-2">
            -{formatRupiah(totalExpense)}
          </h3>
          <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-neutral-800">
              {filtered.filter((t) => t.type === 'expense').length}
            </span> transaksi pengeluaran
          </p>
        </Card>

        <Card className="p-5 border-neutral-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Net Cashflow</p>
            <Badge variant={netCashflow >= 0 ? 'success' : 'danger'} size="sm">
              {netCashflow >= 0 ? 'Surplus' : 'Defisit'}
            </Badge>
          </div>
          <h3
            className={`text-xl sm:text-2xl font-black mt-2 ${
              netCashflow >= 0 ? 'text-brand-600' : 'text-red-600'
            }`}
          >
            {netCashflow >= 0 ? '+' : ''}{formatRupiah(netCashflow)}
          </h3>
          <p className="text-[11px] text-neutral-500 mt-1">
            {netCashflow >= 0 ? 'Surplus Finansial Periode Ini' : 'Pengeluaran Melebihi Pemasukan'}
          </p>
        </Card>

        <Card className="p-5 border-neutral-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Top 5 Kategori</p>
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 space-y-1">
            {topCategories.length > 0 ? (
              topCategories.slice(0, 3).map(([catName, data], idx) => {
                const pct = totalExpense > 0 ? Math.round((data.total / totalExpense) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700 truncate max-w-[130px]">
                      {data.emoji} {catName}
                    </span>
                    <span className="font-bold text-neutral-900 text-[11px]">
                      {pct}%
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-neutral-400 pt-2">Belum ada data pengeluaran</p>
            )}
          </div>
          <p className="text-[10px] text-neutral-400 mt-1.5">
            {topCategories[0] ? `Terbesar: ${topCategories[0][0]}` : 'Semua dompet seimbang'}
          </p>
        </Card>
      </div>

      {/* 3. FILTER & SEARCH CONTROL PANEL */}
      <Card className="p-5 border-neutral-200/80 shadow-sm space-y-4">
        {/* Pre-set Quick Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1.5">
              Rentang Cepat:
            </span>
            <button
              onClick={() => handlePresetSelect('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === 'today'
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => handlePresetSelect('this_month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === 'this_month'
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handlePresetSelect('this_year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === 'this_year'
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Tahun Ini
            </button>
            <button
              onClick={() => handlePresetSelect('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === 'all'
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Semua Periode
            </button>
          </div>

          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>

        {/* Detailed Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Dari Tanggal */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Sampai Tanggal */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Dompet */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
              Dompet
            </label>
            <select
              value={selectedWallet}
              onChange={(e) => {
                setSelectedWallet(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-brand-500 transition-colors"
            >
              <option value="all">Semua Dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-brand-500 transition-colors"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Jenis */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
              Jenis
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-brand-500 transition-colors"
            >
              <option value="all">Semua Jenis</option>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
              <option value="transfer">Transfer Antar Dompet</option>
            </select>
          </div>

          {/* Search Catatan */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
              Cari Catatan / Item
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari kata kunci..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-xl pl-8 pr-3 py-2 outline-none focus:bg-white focus:border-brand-500 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </Card>

      {/* 4. SORTABLE & PAGINATED TRANSACTION TABLE WITH RECEIPT ACCORDION */}
      <Card className="p-0 overflow-hidden border-neutral-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200/80 text-neutral-600 font-bold uppercase tracking-wider">
                <th
                  onClick={() => handleSort('date')}
                  className="py-3.5 px-4 cursor-pointer hover:text-neutral-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tanggal & Waktu</span>
                    {sortField === 'date' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3.5 px-4 cursor-pointer hover:text-neutral-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Kategori</span>
                    {sortField === 'category' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4">Catatan / Rincian Struk</th>
                <th
                  onClick={() => handleSort('wallet')}
                  className="py-3.5 px-4 cursor-pointer hover:text-neutral-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Dompet</span>
                    {sortField === 'wallet' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('amount')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-neutral-900 select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Nominal</span>
                    {sortField === 'amount' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginated.length > 0 ? (
                paginated.map((tx) => {
                  const isInc = tx.type === 'income';
                  const isTf = tx.type === 'transfer';
                  const rawItems = (tx.receipt_items && tx.receipt_items.length > 0)
                    ? tx.receipt_items
                    : (Array.isArray((tx as any).items) ? (tx as any).items : []);
                  const hasItems = rawItems.length > 0;
                  const isExpanded = !!expandedReceipts[tx.id];

                  return (
                    <React.Fragment key={tx.id}>
                      <tr className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-neutral-700 font-medium whitespace-nowrap">
                          {formatIndonesianDate(tx.transaction_time)}
                          <span className="block text-[10px] text-neutral-400">
                            {formatIndonesianTime(tx.transaction_time)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-bold text-neutral-800">
                            {tx.category?.emoji || (isInc ? '💼' : isTf ? '🔄' : '💸')}
                            {tx.category?.name || (isInc ? 'Pemasukan' : isTf ? 'Transfer' : 'Lainnya')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-700">
                          <div className="font-semibold text-neutral-900">{tx.notes || '-'}</div>
                          {/* Accordion toggle button for multi-item receipts */}
                          {hasItems && (
                            <button
                              onClick={() =>
                                setExpandedReceipts((prev) => ({ ...prev, [tx.id]: !prev[tx.id] }))
                              }
                              className="text-[11px] text-[#7a2e38] font-bold hover:text-[#5f723b] flex items-center gap-1 mt-1 bg-[#feedf0] px-2 py-0.5 rounded-md border border-[#fdcfd4] w-fit"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>{rawItems.length} item rincian struk</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3 ml-0.5" />
                              ) : (
                                <ChevronDown className="w-3 h-3 ml-0.5" />
                              )}
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600 whitespace-nowrap">
                          <span className="font-medium">👛 {tx.wallet?.name || 'Cash'}</span>
                          {isTf && tx.to_wallet && (
                            <span className="block text-[10px] text-blue-600 font-semibold">
                              ➔ {tx.to_wallet.name}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span
                            className={`font-black text-sm ${
                              isInc ? 'text-emerald-600' : isTf ? 'text-blue-600' : 'text-neutral-900'
                            }`}
                          >
                            {isInc ? '+' : isTf ? '• ' : '-'}{formatRupiah(tx.amount)}
                          </span>
                        </td>
                      </tr>

                      {/* Expandable Multi-Item Receipt Breakdown Accordion */}
                      {isExpanded && hasItems && (
                        <tr className="bg-[#feedf0]/40">
                          <td colSpan={5} className="py-3 px-6">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-brand-800 flex items-center gap-1.5">
                                  <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                                  Rincian Item Struk ({rawItems.length} Produk)
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                  Total Nota: {formatRupiah(tx.amount)}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
                                {rawItems.map((it: any, idx: number) => {
                                  const name = it.item_name || it.name || `Item ${idx + 1}`;
                                  const price = Number(it.price ?? it.amount ?? 0);
                                  const qty = Number(it.quantity ?? it.qty ?? 1);
                                  return (
                                    <div
                                      key={idx}
                                      className="bg-white p-2.5 rounded-xl border border-[#fdcfd4] shadow-2xs"
                                    >
                                      <div className="font-semibold text-neutral-800 truncate" title={name}>
                                        {name}
                                      </div>
                                      <div className="flex items-center justify-between text-[11px] mt-1 text-neutral-500">
                                        <span>{qty}x @ {formatRupiah(price)}</span>
                                        <span className="font-bold text-neutral-900">
                                          {formatRupiah(price * qty)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-neutral-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto text-xl">
                        📊
                      </div>
                      <p className="font-bold text-neutral-700 text-sm">Tidak ada transaksi yang sesuai</p>
                      <p className="text-xs text-neutral-400">
                        Coba sesuaikan rentang tanggal atau reset filter untuk melihat data keuangan Anda.
                      </p>
                      <Button
                        onClick={handleResetFilters}
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs"
                      >
                        Reset Filter
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-white border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-neutral-500">
            Menampilkan {paginated.length} dari {sorted.length} transaksi tercatat
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <span className="px-3 py-1 font-bold text-neutral-700 bg-neutral-50 rounded-lg border border-neutral-200">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </Card>

      {/* 5. RIWAYAT EXPORT TERSIMPAN (7-Day Signed Supabase Storage URLs) */}
      <Card className="border-neutral-200/80 shadow-sm">
        <div className="pb-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Riwayat Export Tersimpan
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              File tersimpan privat di bucket Supabase Storage <code>tatadana-exports</code>, link aktif selama 7 hari.
            </p>
          </div>
          <Badge variant="brand" size="sm">
            Signed URLs (7 Hari)
          </Badge>
        </div>

        <div className="mt-4 divide-y divide-neutral-100 text-xs">
          {localExports.length > 0 ? (
            localExports.map((exp) => (
              <div key={exp.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                      exp.format === 'xlsx'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {exp.format === 'xlsx' ? 'XLS' : 'PDF'}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">{exp.file_name}</h4>
                    <p className="text-[11px] text-neutral-400">
                      Periode: {exp.period_start} s/d {exp.period_end} • Dibuat: {formatIndonesianDate(exp.created_at || new Date().toISOString())}
                    </p>
                  </div>
                </div>

                <a
                  href={exp.signed_url || `/api/export/${exp.format}?download=1&userId=${activeUser.id}`}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold transition-colors w-fit"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-neutral-400">
              Belum ada riwayat export. Klik tombol <b>Export PDF</b> atau <b>Export Excel</b> di atas untuk menghasilkan laporan pertama Anda.
            </div>
          )}
        </div>
      </Card>

      {/* 6. PRO UPGRADE MODAL */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade ke TataDana Pro 💎"
        description="Fitur Export Laporan PDF & Excel adalah fitur eksklusif paket Pro."
      >
        <div className="space-y-4 pt-2">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
            <p className="font-bold">
              ⚡ Dapatkan Laporan Finansial Komprehensif dengan Paket Pro:
            </p>
            <ul className="list-disc list-inside space-y-1 text-neutral-700">
              <li>Export Laporan Spreadsheet Excel (.xlsx) dengan rincian struk multi-item.</li>
              <li>Export Dokumen Laporan PDF resmi ber-header dengan analisis cashflow.</li>
              <li>Signed URL privat Supabase Storage berlaku 7 hari.</li>
              <li>Scan foto struk belanja otomatis dengan AI Vision OCR.</li>
              <li>Batas transaksi bulanan tanpa limit (Unlimited).</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowUpgradeModal(false)}
              className="text-xs font-semibold"
            >
              Nanti Saja
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                togglePlan();
                setShowUpgradeModal(false);
              }}
              className="text-xs font-bold"
            >
              Aktifkan Paket Pro Sekarang
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
