// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA AI FINANCIAL ADVISOR (FITUR PRO)
// Trigger otomatis:
// 1. Pengeluaran satu kategori naik >50% dibanding minggu lalu
// 2. Total pengeluaran sudah >80% dari total pemasukan bulan ini
// 3. Pengeluaran besar (>20% budget kategori sekaligus)
// ═══════════════════════════════════════════════════════════════════════════════

import { formatRupiah } from '@/lib/currency';
import { formatAdvisorMessage } from '@/lib/telegram/formatter';

export interface AdvisorTriggerResult {
  triggered: boolean;
  message?: string;
  triggerType?: 'category_jump' | 'high_expense_ratio' | 'budget_spike';
}

export function evaluateFinancialAdvisorTriggers(params: {
  userName: string;
  isPro: boolean;
  currentExpenseAmount: number;
  categoryName: string;
  categoryBudgetLimit?: number;
  categorySpentLastWeek?: number;
  categorySpentThisWeek?: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
}): AdvisorTriggerResult {
  if (!params.isPro) {
    return { triggered: false };
  }

  // Trigger 3: Single transaction >20% of category monthly budget
  if (params.categoryBudgetLimit && params.categoryBudgetLimit > 0) {
    const singleTxRatio = (params.currentExpenseAmount / params.categoryBudgetLimit) * 100;
    if (singleTxRatio >= 20) {
      const msg = formatAdvisorMessage({
        userName: params.userName,
        analysis: `Transaksi ${params.categoryName} sebesar ${formatRupiah(params.currentExpenseAmount)} barusan menghabiskan ${Math.round(singleTxRatio)}% dari total budget bulananmu untuk kategori ini.`,
        advice: `Pertimbangkan untuk membatasi pengeluaran kategori ini hingga minggu depan agar budget tetap bertahan hingga akhir bulan.`,
      });
      return { triggered: true, message: msg, triggerType: 'budget_spike' };
    }
  }

  // Trigger 1: Category expense jumped >50% compared to previous week
  if (
    params.categorySpentLastWeek &&
    params.categorySpentLastWeek > 0 &&
    params.categorySpentThisWeek &&
    params.categorySpentThisWeek > params.categorySpentLastWeek * 1.5
  ) {
    const increasePercent = Math.round(
      ((params.categorySpentThisWeek - params.categorySpentLastWeek) / params.categorySpentLastWeek) * 100
    );
    const msg = formatAdvisorMessage({
      userName: params.userName,
      analysis: `Pengeluaran ${params.categoryName} kamu minggu ini naik ${increasePercent}% dibanding minggu lalu (${formatRupiah(params.categorySpentThisWeek)} vs ${formatRupiah(params.categorySpentLastWeek)}).`,
      advice: `Cek kembali detail transaksi di kategori ini di menu Laporan untuk melihat apakah ada pembelian impulsif yang bisa dikurangi.`,
    });
    return { triggered: true, message: msg, triggerType: 'category_jump' };
  }

  // Trigger 2: Total expense >80% of total income this month
  if (params.totalIncomeThisMonth > 0) {
    const expenseRatio = (params.totalExpenseThisMonth / params.totalIncomeThisMonth) * 100;
    if (expenseRatio >= 80) {
      const msg = formatAdvisorMessage({
        userName: params.userName,
        analysis: `Total pengeluaranmu bulan ini sudah mencapai ${Math.round(expenseRatio)}% dari seluruh pemasukanmu (${formatRupiah(params.totalExpenseThisMonth)} dari ${formatRupiah(params.totalIncomeThisMonth)}).`,
        advice: `Gunakan strategi 'No-Spend Days' untuk 3 hari ke depan untuk menjaga cashflow tetap positif sampai gajian berikutnya.`,
      });
      return { triggered: true, message: msg, triggerType: 'high_expense_ratio' };
    }
  }

  return { triggered: false };
}
