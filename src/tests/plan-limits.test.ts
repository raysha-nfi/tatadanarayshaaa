import {
  checkTransactionLimit,
  checkWalletLimit,
  checkBudgetLimit,
  canUseReceiptPhoto,
  canExportReports,
} from '../lib/limits';
import { evaluateFinancialAdvisorTriggers } from '../lib/advisor';

export function runPlanLimitsAndAdvisorTests() {
  let passed = 0;
  let total = 0;

  // 1. Starter Transaction Limit (max 50)
  total++;
  const starterTxOk = checkTransactionLimit('starter', 49);
  if (starterTxOk.allowed) passed++;

  total++;
  const starterTxBlocked = checkTransactionLimit('starter', 50);
  if (!starterTxBlocked.allowed && starterTxBlocked.message?.includes('Batas transaksi bulanan paket Starter')) {
    passed++;
  }

  total++;
  const proTxAlwaysOk = checkTransactionLimit('pro', 9999);
  if (proTxAlwaysOk.allowed) passed++;

  // 2. Starter Wallet Limit (max 3)
  total++;
  const starterWalletOk = checkWalletLimit('starter', 2);
  if (starterWalletOk.allowed) passed++;

  total++;
  const starterWalletBlocked = checkWalletLimit('starter', 3);
  if (!starterWalletBlocked.allowed) passed++;

  // 3. Receipt OCR Permission
  total++;
  const starterOCRExcluded = canUseReceiptPhoto('starter');
  if (!starterOCRExcluded.allowed) passed++;

  total++;
  const proOCRAllowed = canUseReceiptPhoto('pro');
  if (proOCRAllowed.allowed) passed++;

  // 4. Export Permission
  total++;
  const starterExportBlocked = canExportReports('starter');
  if (!starterExportBlocked.allowed) passed++;

  total++;
  const proExportAllowed = canExportReports('pro');
  if (proExportAllowed.allowed) passed++;

  // 5. Advisor Trigger Tests (Part 4.7)
  // 5.1 Starter user should never trigger advisor
  total++;
  const advStarter = evaluateFinancialAdvisorTriggers({
    userName: 'Raysha',
    isPro: false,
    currentExpenseAmount: 500000,
    categoryName: 'Makanan',
    categoryBudgetLimit: 1000000,
    totalIncomeThisMonth: 10000000,
    totalExpenseThisMonth: 9000000,
  });
  if (!advStarter.triggered) passed++;

  // 5.2 Single expense >20% category budget spike
  total++;
  const advBudgetSpike = evaluateFinancialAdvisorTriggers({
    userName: 'Raysha',
    isPro: true,
    currentExpenseAmount: 300000, // 30% of 1.000.000
    categoryName: 'Makanan',
    categoryBudgetLimit: 1000000,
    totalIncomeThisMonth: 10000000,
    totalExpenseThisMonth: 3000000,
  });
  if (advBudgetSpike.triggered && advBudgetSpike.triggerType === 'budget_spike') {
    passed++;
  }

  // 5.3 Category jump >50% compared to last week
  total++;
  const advJump = evaluateFinancialAdvisorTriggers({
    userName: 'Raysha',
    isPro: true,
    currentExpenseAmount: 50000,
    categoryName: 'Transport',
    categorySpentLastWeek: 100000,
    categorySpentThisWeek: 180000, // +80% jump
    totalIncomeThisMonth: 10000000,
    totalExpenseThisMonth: 3000000,
  });
  if (advJump.triggered && advJump.triggerType === 'category_jump') {
    passed++;
  }

  // 5.4 Total expense >80% total income
  total++;
  const advRatio = evaluateFinancialAdvisorTriggers({
    userName: 'Raysha',
    isPro: true,
    currentExpenseAmount: 50000,
    categoryName: 'Lainnya',
    totalIncomeThisMonth: 5000000,
    totalExpenseThisMonth: 4200000, // 84% ratio
  });
  if (advRatio.triggered && advRatio.triggerType === 'high_expense_ratio') {
    passed++;
  }

  return { total, passed };
}
