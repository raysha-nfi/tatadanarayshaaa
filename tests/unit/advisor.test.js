// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA UNIT TESTS: PROACTIVE AI FINANCIAL ADVISOR TRIGGERS
// ═══════════════════════════════════════════════════════════════════════════════

const { createSuite, assert, assertEqual, assertIncludes } = require('../test-utils');
const { getAdvisor } = require('../../dist-test/module-loader');

function createAdvisorSuite() {
  const { test, run } = createSuite('Proactive AI Financial Advisor');
  const advisor = getAdvisor();

  // 1. Starter gating: Starter users never trigger proactive advisor
  test('evaluateFinancialAdvisorTriggers: non-pro user never triggers advisor', () => {
    const result = advisor.evaluateFinancialAdvisorTriggers({
      userName: 'Budi',
      isPro: false,
      currentExpenseAmount: 500000,
      categoryName: 'Makanan',
      categoryBudgetLimit: 1000000,
      categorySpentLastWeek: 100000,
      categorySpentThisWeek: 250000, // +150% jump
      totalIncomeThisMonth: 10000000,
      totalExpenseThisMonth: 9500000, // 95% expense ratio
    });

    assertEqual(result.triggered, false);
  });

  // 2. Trigger 1: Category expense jump > 50% compared to previous week
  test('evaluateFinancialAdvisorTriggers: triggers on >50% category spending increase', () => {
    const result = advisor.evaluateFinancialAdvisorTriggers({
      userName: 'Siti',
      isPro: true,
      currentExpenseAmount: 50000,
      categoryName: 'Transport',
      categorySpentLastWeek: 100000,
      categorySpentThisWeek: 175000, // +75% increase (>50%)
      totalIncomeThisMonth: 10000000,
      totalExpenseThisMonth: 3000000, // ratio 30% (safe)
    });

    assertEqual(result.triggered, true);
    assertEqual(result.triggerType, 'category_jump');
    assert(typeof result.message === 'string');
    assertIncludes(result.message, 'Financial Advisor');
    assertIncludes(result.message, 'Transport');
    assertIncludes(result.message, 'naik 75% dibanding minggu lalu');
    assertIncludes(result.message, 'pembelian impulsif');
  });

  test('evaluateFinancialAdvisorTriggers: does not trigger if category jump <= 50%', () => {
    const result = advisor.evaluateFinancialAdvisorTriggers({
      userName: 'Siti',
      isPro: true,
      currentExpenseAmount: 50000,
      categoryName: 'Transport',
      categorySpentLastWeek: 100000,
      categorySpentThisWeek: 140000, // +40% increase (<=50%)
      totalIncomeThisMonth: 10000000,
      totalExpenseThisMonth: 3000000,
    });

    assertEqual(result.triggered, false);
  });

  // 3. Trigger 2: Total expense > 80% of total income
  test('evaluateFinancialAdvisorTriggers: triggers when expense reaches >80% of income', () => {
    const result = advisor.evaluateFinancialAdvisorTriggers({
      userName: 'Ahmad',
      isPro: true,
      currentExpenseAmount: 100000,
      categoryName: 'Lainnya',
      totalIncomeThisMonth: 10000000,
      totalExpenseThisMonth: 8500000, // 85% expense ratio (>80%)
    });

    assertEqual(result.triggered, true);
    assertEqual(result.triggerType, 'high_expense_ratio');
    assert(typeof result.message === 'string');
    assertIncludes(result.message, '85% dari seluruh pemasukanmu');
    assertIncludes(result.message, 'No-Spend Days');
  });

  test('evaluateFinancialAdvisorTriggers: does not trigger when expense ratio < 80%', () => {
    const result = advisor.evaluateFinancialAdvisorTriggers({
      userName: 'Ahmad',
      isPro: true,
      currentExpenseAmount: 100000,
      categoryName: 'Lainnya',
      totalIncomeThisMonth: 10000000,
      totalExpenseThisMonth: 7500000, // 75% expense ratio (<80%)
    });

    assertEqual(result.triggered, false);
  });

  // 4. Trigger 3: Single transaction > 20% of category monthly budget
  test('evaluateFinancialAdvisorTriggers: triggers on single expense >20% of category budget', () => {
    const result = advisor.evaluateFinancialAdvisorTriggers({
      userName: 'Rian',
      isPro: true,
      currentExpenseAmount: 250000, // 25% of 1,000,000 budget
      categoryName: 'Makanan',
      categoryBudgetLimit: 1000000,
      totalIncomeThisMonth: 10000000,
      totalExpenseThisMonth: 3000000,
    });

    assertEqual(result.triggered, true);
    assertEqual(result.triggerType, 'budget_spike');
    assert(typeof result.message === 'string');
    assertIncludes(result.message, 'menghabiskan 25% dari total budget');
  });

  test('evaluateFinancialAdvisorTriggers: does not trigger single expense under 20% of budget', () => {
    const result = advisor.evaluateFinancialAdvisorTriggers({
      userName: 'Rian',
      isPro: true,
      currentExpenseAmount: 150000, // 15% of 1,000,000 budget (<20%)
      categoryName: 'Makanan',
      categoryBudgetLimit: 1000000,
      totalIncomeThisMonth: 10000000,
      totalExpenseThisMonth: 3000000,
    });

    assertEqual(result.triggered, false);
  });

  // 5. Boundary robustness: 0 income or 0 last week spending
  test('evaluateFinancialAdvisorTriggers: handles 0 total income safely without dividing by zero', () => {
    const result = advisor.evaluateFinancialAdvisorTriggers({
      userName: 'TestUser',
      isPro: true,
      currentExpenseAmount: 50000,
      categoryName: 'Makanan',
      totalIncomeThisMonth: 0,
      totalExpenseThisMonth: 50000,
    });

    assertEqual(result.triggered, false);
  });

  test('evaluateFinancialAdvisorTriggers: handles undefined or zero last week spending safely', () => {
    const result = advisor.evaluateFinancialAdvisorTriggers({
      userName: 'TestUser',
      isPro: true,
      currentExpenseAmount: 50000,
      categoryName: 'Makanan',
      categorySpentLastWeek: 0,
      categorySpentThisWeek: 150000,
      totalIncomeThisMonth: 5000000,
      totalExpenseThisMonth: 1000000,
    });

    assertEqual(result.triggered, false);
  });

  return { run };
}

module.exports = { createAdvisorSuite };
