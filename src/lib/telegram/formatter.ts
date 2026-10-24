// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA TELEGRAM BOT MESSAGE FORMATTER
// Format reply bot sesuai spesifikasi Part 4.4, 4.5, 4.6, 4.7, 4.8
// ═══════════════════════════════════════════════════════════════════════════════

import { formatRupiah } from '@/lib/currency';
import { formatBotTimestamp } from '@/lib/date';
import { Wallet, Category, Budget } from '@/types';

/**
 * Generate visual progress bar using █ and ░ (10 blocks)
 */
export function generateProgressBar(percentage: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const filledBlocks = Math.round(clamped / 10);
  const emptyBlocks = 10 - filledBlocks;
  return `${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)} ${clamped}%`;
}

/**
 * Format Expense Reply (Part 4.4)
 */
export function formatExpenseReply(params: {
  amount: number;
  categoryName: string;
  categoryEmoji?: string;
  walletName: string;
  notes: string;
  newBalance: number;
  budget?: {
    limit: number;
    spent: number;
    percentage: number;
    remaining: number;
  } | null;
  voiceTranscript?: string | null;
}): string {
  const timestamp = formatBotTimestamp();
  const emoji = params.categoryEmoji || '💸';

  let text = '';
  if (params.voiceTranscript) {
    text += `🎙️ Transkrip: "${params.voiceTranscript}"\n\n`;
  }

  text += `${timestamp}\n`;
  text += `💸 Pengeluaran tercatat!\n`;
  text += `├ Nominal : ${formatRupiah(params.amount)}\n`;
  text += `├ Kategori : ${emoji} ${params.categoryName}\n`;
  text += `├ Dompet : 👛 ${params.walletName}\n`;
  text += `├ Catatan : ${params.notes}\n`;
  text += `└ Saldo : ${formatRupiah(params.newBalance)}\n`;

  if (params.budget && params.budget.limit > 0) {
    const bar = generateProgressBar(params.budget.percentage);
    text += `\n📊 Budget ${params.categoryName} bulan ini:\n`;
    text += `${bar} — sisa ${formatRupiah(params.budget.remaining)}\n`;

    if (params.budget.percentage >= 100) {
      text += `🚨 AWAS! Budget ${params.categoryName} kamu sudah melebih batas 100%! Rem dulu ya 🛑`;
    } else if (params.budget.percentage >= 80) {
      text += `⚠️ Perhatian! Budget kategori ini sudah mencapai 80%, hemat-hemat ya!`;
    } else {
      text += `🎯 Pengeluaran masih dalam batas aman. Tetap kendalikan!`;
    }
  }

  return text;
}

/**
 * Format Income Reply (Part 4.5)
 */
export function formatIncomeReply(params: {
  amount: number;
  categoryName?: string;
  walletName: string;
  newBalance: number;
  voiceTranscript?: string | null;
}): string {
  const timestamp = formatBotTimestamp();

  let text = '';
  if (params.voiceTranscript) {
    text += `🎙️ Transkrip: "${params.voiceTranscript}"\n\n`;
  }

  text += `${timestamp}\n`;
  text += `💰 Pemasukan tercatat!\n`;
  text += `├ Nominal : ${formatRupiah(params.amount)}\n`;
  text += `├ Kategori : 💼 ${params.categoryName || 'Pemasukan'}\n`;
  text += `├ Dompet : 👛 ${params.walletName}\n`;
  text += `└ Saldo baru : ${formatRupiah(params.newBalance)}\n\n`;
  text += `💪 Semangat terus! Jangan lupa sisihkan untuk tabungan ya.`;

  return text;
}

/**
 * Format Transfer Reply
 */
export function formatTransferReply(params: {
  amount: number;
  fromWallet: string;
  toWallet: string;
  fromBalance: number;
  toBalance: number;
}): string {
  const timestamp = formatBotTimestamp();
  return `${timestamp}
🔄 Transfer antar dompet berhasil!
├ Nominal : ${formatRupiah(params.amount)}
├ Dari : 👛 ${params.fromWallet} (Sisa: ${formatRupiah(params.fromBalance)})
└ Ke : 👛 ${params.toWallet} (Saldo baru: ${formatRupiah(params.toBalance)})

Semua dompet tersinkronisasi rapi!`;
}

/**
 * Format Commands Reply (Part 4.6)
 */
export function formatHelpReply(): string {
  return `🤖 Selamat datang di TataDana Bot!
Catat keuangan semudah chat langsung dari Telegram kamu.

📌 Perintah Cepat:
/saldo — Cek saldo semua dompet aktif
/hari_ini — Rekap transaksi hari ini (WIB)
/minggu_ini — Rekap 7 hari terakhir
/bulan_ini — Rekap bulan berjalan & breakdown kategori
/budget — Status budget bulan ini
/budget [harian|mingguan|bulanan|tahunan] — Cek target periode khusus
/kalender — Cek kalender arus kas & agenda tagihan
/tanya [pertanyaan] — Tanya langsung asisten cerdas Tata AI!
/sheet — Akses laporan & spreadsheet TataDana
/bantuan — Panduan penggunaan bot

💡 Tips mencatat langsung:
• Cukup ketik: "beli bakso 15rb"
• Pemasukan: "gajian 5jt"
• Transfer: "tf bca ke gopay 100rb"
• Kirim Foto Struk (Paket Pro) untuk scan otomatis!
• Kirim Voice Note untuk pencatatan via suara!`;
}

/**
 * Format Saldo Reply
 */
export function formatSaldoReply(wallets: Wallet[]): string {
  if (wallets.length === 0) {
    return `👛 Kamu belum memiliki dompet aktif. Buka dashboard TataDana untuk menambahkan dompet.`;
  }

  const total = wallets.reduce((acc, w) => acc + Number(w.balance), 0);
  let text = `👛 Saldo Dompet Kamu:\n\n`;
  wallets.forEach(w => {
    const isDef = w.is_default ? ' (Utama ⭐️)' : '';
    text += `├ ${w.icon || '💳'} ${w.name}${isDef} : ${formatRupiah(w.balance)}\n`;
  });
  text += `\n💰 Total Keseluruhan: ${formatRupiah(total)}`;
  return text;
}

/**
 * Format Daily Reminder (Part 4.8)
 */
export function formatDailyReminder(): string {
  return `⏰ Reminder Keuangan!
Jangan lupa catat pengeluaran hari ini ya 📝
Pencatatan rutin = keuangan lebih terkontrol 💪
Ketik transaksimu sekarang!`;
}

/**
 * Format AI Financial Advisor (Part 4.7)
 */
export function formatAdvisorMessage(params: {
  userName: string;
  analysis: string;
  advice: string;
}): string {
  return `🤖 Financial Advisor
Hei ${params.userName}! ${params.analysis}
💡 Saran: ${params.advice}`;
}

export interface HariIniItem {
  notes?: string | null;
  amount: number;
  walletName?: string;
  categoryEmoji?: string;
  categoryName?: string;
  type: string;
  time?: string;
}

/**
 * Format /hari_ini Command Reply
 */
export function formatHariIniReply(params: {
  timestamp?: string;
  dateHeader?: string;
  totalIncome: number;
  totalExpense: number;
  netCashflow?: number;
  transactions: HariIniItem[];
}): string {
  const netCashflowVal = params.netCashflow ?? (params.totalIncome - params.totalExpense);
  const netSign = netCashflowVal > 0 ? '+' : netCashflowVal < 0 ? '-' : '';
  const netFormatted = netCashflowVal === 0
    ? 'Rp0'
    : `${netSign}${formatRupiah(Math.abs(netCashflowVal))}`;

  let text = params.dateHeader ? `📅 ${params.dateHeader}\n` : `${params.timestamp || formatBotTimestamp()}\n`;
  text += `📊 Rekap Transaksi Hari Ini:\n\n`;
  text += `├ 💰 Total Pemasukan   : ${formatRupiah(params.totalIncome)}\n`;
  text += `├ 💸 Total Pengeluaran : ${formatRupiah(params.totalExpense)}\n`;
  text += `└ 📈 Net Hari Ini      : ${netFormatted}\n\n`;

  if (params.transactions.length === 0) {
    text += `📝 Belum ada transaksi tercatat hari ini.`;
  } else {
    text += `📝 Rincian Hari Ini (${params.transactions.length} transaksi):\n`;
    params.transactions.slice(0, 10).forEach(t => {
      const emoji = t.categoryEmoji || (t.type === 'income' ? '💰' : '💸');
      const desc = t.notes || t.categoryName || (t.type === 'income' ? 'Pemasukan' : 'Pengeluaran');
      const wName = t.walletName ? ` (${t.walletName})` : '';
      const tTime = t.time ? `[${t.time}] ` : '';
      text += `• ${emoji} ${tTime}${desc} — ${formatRupiah(t.amount)}${wName}\n`;
    });
    if (params.transactions.length > 10) {
      text += `• ...dan ${params.transactions.length - 10} transaksi lainnya\n`;
    }
  }

  return text.trimEnd();
}

export interface CategoryBreakdownItem {
  emoji: string;
  name: string;
  amount: number;
  percentage?: number;
}

/**
 * Format /minggu_ini Command Reply (7 Hari Terakhir)
 */
export function formatMingguIniReply(params: {
  totalIncome: number;
  totalExpense: number;
  netCashflow?: number;
  transactionCount?: number;
  topCategories: CategoryBreakdownItem[];
}): string {
  const netCashflowVal = params.netCashflow ?? (params.totalIncome - params.totalExpense);
  const netSign = netCashflowVal > 0 ? '+' : netCashflowVal < 0 ? '-' : '';
  const netFormatted = netCashflowVal === 0
    ? 'Rp0'
    : `${netSign}${formatRupiah(Math.abs(netCashflowVal))}`;

  let text = `📅 Rekap Transaksi 7 Hari Terakhir:\n`;
  text += `├ 💰 Total Pemasukan   : ${formatRupiah(params.totalIncome)}\n`;
  text += `├ 💸 Total Pengeluaran : ${formatRupiah(params.totalExpense)}\n`;
  if (params.transactionCount !== undefined) {
    text += `├ 🔢 Total Transaksi   : ${params.transactionCount} transaksi\n`;
  }
  text += `└ 📈 Sisa Cashflow     : ${netFormatted}\n\n`;

  if (params.topCategories.length === 0) {
    text += `🔥 Belum ada pengeluaran dalam 7 hari terakhir.`;
  } else {
    text += `🔥 Top Kategori Pengeluaran:\n`;
    params.topCategories.forEach((cat, idx) => {
      const pctStr = cat.percentage ? ` (${cat.percentage}%)` : '';
      text += `${idx + 1}. ${cat.emoji || '📁'} ${cat.name} : ${formatRupiah(cat.amount)}${pctStr}\n`;
    });
  }

  return text.trimEnd();
}

/**
 * Format /bulan_ini Command Reply
 */
export function formatBulanIniReply(params: {
  monthName: string;
  totalIncome: number;
  totalExpense: number;
  netSavings?: number;
  categoriesBreakdown?: CategoryBreakdownItem[];
  categoryBreakdown?: CategoryBreakdownItem[];
}): string {
  const breakdown = params.categoriesBreakdown || params.categoryBreakdown || [];
  const netSavingsVal = params.netSavings ?? (params.totalIncome - params.totalExpense);
  const netSign = netSavingsVal > 0 ? '+' : netSavingsVal < 0 ? '-' : '';
  const netFormatted = netSavingsVal === 0
    ? 'Rp0'
    : `${netSign}${formatRupiah(Math.abs(netSavingsVal))}`;

  let text = `📅 Rekap Bulan Ini (${params.monthName}):\n`;
  text += `├ 💰 Total Pemasukan   : ${formatRupiah(params.totalIncome)}\n`;
  text += `├ 💸 Total Pengeluaran : ${formatRupiah(params.totalExpense)}\n`;
  text += `└ 🛡️ Net Tabungan      : ${netFormatted}\n\n`;

  if (breakdown.length === 0) {
    text += `📁 Belum ada pengeluaran tercatat bulan ini.`;
  } else {
    text += `📁 Breakdown Pengeluaran per Kategori:\n`;
    breakdown.forEach(cat => {
      const pctStr = cat.percentage ? ` (${cat.percentage}%)` : '';
      text += `• ${cat.emoji || '📁'} ${cat.name} : ${formatRupiah(cat.amount)}${pctStr}\n`;
    });
  }

  return text.trimEnd();
}

export interface BudgetStatusItem {
  categoryName: string;
  categoryEmoji?: string;
  limit: number;
  spent: number;
  percentage: number;
  remaining: number;
}

/**
 * Format /budget Command Reply
 */
export function formatBudgetListReply(params: {
  monthName: string;
  budgets: BudgetStatusItem[];
}): string {
  if (params.budgets.length === 0) {
    return `🎯 Kamu belum mengatur budget untuk bulan ini (${params.monthName}).\nBuka dashboard TataDana menu <b>Budget</b> untuk menetapkan target pengeluaran.`;
  }

  let text = `🎯 Status Budget Bulan Ini (${params.monthName}):\n\n`;

  params.budgets.forEach(b => {
    const emoji = b.categoryEmoji || '📁';
    const bar = generateProgressBar(b.percentage);
    text += `${emoji} ${b.categoryName}\n`;
    if (b.spent > b.limit) {
      const over = b.spent - b.limit;
      text += `${bar} — Terpakai: ${formatRupiah(b.spent)} / ${formatRupiah(b.limit)} (Over: -${formatRupiah(over)})\n`;
      text += `🚨 AWAS! Budget sudah melewati batas 100%!\n\n`;
    } else {
      text += `${bar} — Terpakai: ${formatRupiah(b.spent)} / ${formatRupiah(b.limit)} (Sisa: ${formatRupiah(b.remaining)})\n`;
      if (b.percentage >= 100) {
        text += `🚨 AWAS! Budget sudah melewati batas 100%!\n\n`;
      } else if (b.percentage >= 80) {
        text += `⚠️ Perhatian! Budget mendekati batas 80%.\n\n`;
      } else {
        text += `\n`;
      }
    }
  });

  return text.trimEnd();
}

/**
 * Format Starter Plan Quota Exceeded Polite Decline
 */
export function formatQuotaExceededReply(
  maxLimit: number = 50,
  appUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://tatadana.id'
): string {
  return `⚠️ <b>Batas Transaksi Tercapai!</b>\n\nBatas transaksi bulanan paket Starter (${maxLimit} transaksi) telah tercapai. Upgrade ke paket Pro untuk transaksi tanpa batas! 🚀\n\n💎 <a href="${appUrl}/dashboard/settings">Upgrade ke Paket Pro Sekarang</a>`;
}

/**
 * Format Starter Plan Receipt OCR Polite Decline
 */
export function formatOcrUpgradeRequiredReply(
  appUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://tatadana.id'
): string {
  return `📸 <b>Fitur Catat Struk via AI Vision Khusus Paket Pro!</b>\n\nPengguna paket Starter hanya dapat mencatat via teks & voice note. Upgrade ke Pro sekarang untuk scan struk otomatis tanpa ribet! 💎\n\n👉 <a href="${appUrl}/dashboard/settings">Upgrade ke Pro di sini</a>`;
}

