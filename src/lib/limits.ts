// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA PLAN LIMITS ENFORCEMENT (STARTER vs PRO)
// ═══════════════════════════════════════════════════════════════════════════════

import { UserPlan } from '@/types';

export const PLAN_LIMITS = {
  starter: {
    maxMonthlyTransactions: 50,
    maxWallets: 3,
    maxBudgets: 5,
    allowReceiptOCR: false,
    allowVoiceNote: true, // Voice note allowed on all plans per Part 4.3!
    allowAIAdvisor: false,
    allowAdvancedReports: false,
    allowExport: false,
  },
  pro: {
    maxMonthlyTransactions: Infinity,
    maxWallets: Infinity,
    maxBudgets: Infinity,
    allowReceiptOCR: true,
    allowVoiceNote: true,
    allowAIAdvisor: true,
    allowAdvancedReports: true,
    allowExport: true,
  },
};

/**
 * Check if user can add a transaction this month
 */
export function checkTransactionLimit(plan: UserPlan, currentMonthCount: number): {
  allowed: boolean;
  message?: string;
  currentCount: number;
  maxLimit: number;
} {
  const limit = PLAN_LIMITS[plan].maxMonthlyTransactions;
  if (currentMonthCount >= limit) {
    return {
      allowed: false,
      message: `Batas transaksi bulanan paket Starter (${limit} transaksi) telah tercapai. Upgrade ke paket Pro untuk transaksi tanpa batas! 🚀`,
      currentCount: currentMonthCount,
      maxLimit: limit,
    };
  }
  return { allowed: true, currentCount: currentMonthCount, maxLimit: limit };
}

/**
 * Check if user can create another wallet
 */
export function checkWalletLimit(plan: UserPlan, currentWalletCount: number): {
  allowed: boolean;
  message?: string;
} {
  const limit = PLAN_LIMITS[plan].maxWallets;
  if (currentWalletCount >= limit) {
    return {
      allowed: false,
      message: `Paket Starter dibatasi maksimal ${limit} dompet. Upgrade ke Pro untuk dompet unlimited!`,
    };
  }
  return { allowed: true };
}

/**
 * Check if user can create another budget category
 */
export function checkBudgetLimit(plan: UserPlan, currentBudgetCount: number): {
  allowed: boolean;
  message?: string;
} {
  const limit = PLAN_LIMITS[plan].maxBudgets;
  if (currentBudgetCount >= limit) {
    return {
      allowed: false,
      message: `Paket Starter dibatasi maksimal ${limit} budget kategori. Upgrade ke Pro untuk budget tanpa batas!`,
    };
  }
  return { allowed: true };
}

/**
 * Check if receipt photo OCR is available for plan
 */
export function canUseReceiptPhoto(plan: UserPlan): {
  allowed: boolean;
  message?: string;
} {
  if (!PLAN_LIMITS[plan].allowReceiptOCR) {
    return {
      allowed: false,
      message: `📸 Fitur catat struk foto via AI Vision khusus pengguna Pro. Upgrade ke Pro sekarang untuk kemudahan scan struk otomatis! 💎`,
    };
  }
  return { allowed: true };
}

/**
 * Check if user can export PDF/Excel
 */
export function canExportReports(plan: UserPlan): {
  allowed: boolean;
  message?: string;
} {
  if (!PLAN_LIMITS[plan].allowExport) {
    return {
      allowed: false,
      message: `Export laporan PDF & Excel adalah fitur eksklusif paket Pro. Dapatkan rekap finansial instan dengan Pro!`,
    };
  }
  return { allowed: true };
}
