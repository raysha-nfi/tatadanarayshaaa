// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA E2E INTEGRATION & SCENARIO TESTS
// Verifies full multi-module user lifecycles and business workflows
// ═══════════════════════════════════════════════════════════════════════════════

const { createSuite, assert, assertEqual, assertIncludes } = require('../test-utils');
const {
  getCurrency,
  getDate,
  getLimits,
  getParser,
  getFormatter,
  getAdvisor,
} = require('../../dist-test/module-loader');

function createE2EScenariosSuite() {
  const { test, run } = createSuite('End-to-End User Lifecycle Scenarios');

  const currency = getCurrency();
  const dateUtil = getDate();
  const limits = getLimits();
  const parser = getParser();
  const formatter = getFormatter();
  const advisor = getAdvisor();

  // Scenario 1: Casual text to formatted nota with budget tracking
  test('E2E Flow 1: Natural language text -> parse -> limit check -> formatted nota', () => {
    const userMessage = 'makan sate padang 35rb';

    // 1. Parsing
    const parsed = parser.parseTransactionRuleBased(userMessage);
    assert(parsed !== null, 'Should parse natural language');
    assertEqual(parsed.jenis, 'pengeluaran');
    assertEqual(parsed.nominal, 35000);
    assertEqual(parsed.kategori, 'Makanan');

    // 2. Limit Check (Starter plan, 10th transaction this month)
    const limitCheck = limits.checkTransactionLimit('starter', 10);
    assertEqual(limitCheck.allowed, true);

    // 3. Budget tracking calculation (Budget 1,000,000; already spent 365,000 + 35,000 = 400,000 -> 40%)
    const previousSpent = 365000;
    const newSpent = previousSpent + parsed.nominal;
    const budgetLimit = 1000000;
    const percentage = Math.round((newSpent / budgetLimit) * 100);
    const remaining = budgetLimit - newSpent;

    // 4. Formatting Telegram reply nota
    const nota = formatter.formatExpenseReply({
      amount: parsed.nominal,
      categoryName: parsed.kategori,
      categoryEmoji: '🍢',
      walletName: 'Cash',
      notes: parsed.catatan,
      newBalance: 250000,
      budget: {
        limit: budgetLimit,
        spent: newSpent,
        percentage,
        remaining,
      },
    });

    assertIncludes(nota, '💸 Pengeluaran tercatat!');
    assertIncludes(nota, '├ Nominal : Rp35.000');
    assertIncludes(nota, '├ Kategori : 🍢 Makanan');
    assertIncludes(nota, '├ Dompet : 👛 Cash');
    assertIncludes(nota, '└ Saldo : Rp250.000');
    assertIncludes(nota, '████░░░░░░ 40% — sisa Rp600.000');
    assert(nota.includes('WIB'), 'Timestamp must be in WIB timezone');
  });

  // Scenario 2: Starter plan transaction capping & Pro upgrade lifecycle
  test('E2E Flow 2: Starter 50-tx ceiling block -> user upgrades to Pro -> unblocked', () => {
    let plan = 'starter';
    let txCount = 49;

    // 49th transaction is permitted
    let check = limits.checkTransactionLimit(plan, txCount);
    assertEqual(check.allowed, true);

    // 50th transaction is the ceiling
    txCount = 50;
    check = limits.checkTransactionLimit(plan, txCount);
    assertEqual(check.allowed, false);
    assertIncludes(check.message, 'Batas transaksi bulanan paket Starter (50 transaksi) telah tercapai');
    assertIncludes(check.message, 'Upgrade ke paket Pro');

    // 51st transaction attempt also blocked
    txCount = 51;
    check = limits.checkTransactionLimit(plan, txCount);
    assertEqual(check.allowed, false);

    // User upgrades to Pro!
    plan = 'pro';
    check = limits.checkTransactionLimit(plan, txCount);
    assertEqual(check.allowed, true);
    assertEqual(check.maxLimit, Infinity);
  });

  // Scenario 3: Pro Feature Gating (Receipt Photo OCR & Export)
  test('E2E Flow 3: Feature gating for receipt photo OCR and multi-format exports', () => {
    // Starter user tries receipt photo OCR
    const starterOcr = limits.canUseReceiptPhoto('starter');
    assertEqual(starterOcr.allowed, false);
    assertIncludes(starterOcr.message, '📸');
    assertIncludes(starterOcr.message, 'khusus pengguna Pro');

    // Starter user tries export
    const starterExport = limits.canExportReports('starter');
    assertEqual(starterExport.allowed, false);
    assertIncludes(starterExport.message, 'eksklusif paket Pro');

    // Pro user gets access
    const proOcr = limits.canUseReceiptPhoto('pro');
    assertEqual(proOcr.allowed, true);

    const proExport = limits.canExportReports('pro');
    assertEqual(proExport.allowed, true);
  });

  // Scenario 4: Proactive Financial Advisor Intelligence
  test('E2E Flow 4: Proactive AI Advisor trigger evaluation', () => {
    const userProfile = { name: 'Reza', isPro: false };

    // 1. Starter user spending heavily -> Advisor remains silent
    const starterAdvisor = advisor.evaluateFinancialAdvisorTriggers({
      userName: userProfile.name,
      isPro: userProfile.isPro,
      currentExpenseAmount: 500000,
      categoryName: 'Makanan',
      categoryBudgetLimit: 1000000,
      categorySpentLastWeek: 200000,
      categorySpentThisWeek: 450000, // +125% spike
      totalIncomeThisMonth: 10000000,
      totalExpenseThisMonth: 9000000,
    });
    assertEqual(starterAdvisor.triggered, false);

    // 2. Pro user spending spike >50% weekly jump
    userProfile.isPro = true;
    const jumpAdvisor = advisor.evaluateFinancialAdvisorTriggers({
      userName: userProfile.name,
      isPro: userProfile.isPro,
      currentExpenseAmount: 50000,
      categoryName: 'Transport',
      categorySpentLastWeek: 150000,
      categorySpentThisWeek: 270000, // +80% jump
      totalIncomeThisMonth: 10000000,
      totalExpenseThisMonth: 3000000,
    });
    assertEqual(jumpAdvisor.triggered, true);
    assertEqual(jumpAdvisor.triggerType, 'category_jump');
    assertIncludes(jumpAdvisor.message, 'naik 80% dibanding minggu lalu');

    // 3. Pro user high expense ratio (>80%)
    const ratioAdvisor = advisor.evaluateFinancialAdvisorTriggers({
      userName: userProfile.name,
      isPro: userProfile.isPro,
      currentExpenseAmount: 100000,
      categoryName: 'Belanja',
      totalIncomeThisMonth: 10000000,
      totalExpenseThisMonth: 8800000, // 88% ratio
    });
    assertEqual(ratioAdvisor.triggered, true);
    assertEqual(ratioAdvisor.triggerType, 'high_expense_ratio');
    assertIncludes(ratioAdvisor.message, '88% dari seluruh pemasukanmu');
    assertIncludes(ratioAdvisor.message, 'No-Spend Days');
  });

  // Scenario 5: Multi-Wallet Transfer Simulation
  test('E2E Flow 5: Transfer between wallets and balance synchronization', () => {
    const text = 'transfer bca ke gopay 200rb';
    const parsed = parser.parseTransactionRuleBased(text);

    assert(parsed !== null);
    assertEqual(parsed.jenis, 'transfer');
    assertEqual(parsed.nominal, 200000);
    assertEqual(parsed.wallet_asal, 'BCA');
    assertEqual(parsed.wallet_tujuan, 'GOPAY');

    // Balances before transfer
    const wallets = {
      BCA: 1500000,
      GOPAY: 50000,
    };

    // Apply transfer
    wallets.BCA -= parsed.nominal;
    wallets.GOPAY += parsed.nominal;

    assertEqual(wallets.BCA, 1300000);
    assertEqual(wallets.GOPAY, 250000);

    const reply = formatter.formatTransferReply({
      amount: parsed.nominal,
      fromWallet: parsed.wallet_asal,
      toWallet: parsed.wallet_tujuan,
      fromBalance: wallets.BCA,
      toBalance: wallets.GOPAY,
    });

    assertIncludes(reply, '🔄 Transfer antar dompet berhasil!');
    assertIncludes(reply, '├ Nominal : Rp200.000');
    assertIncludes(reply, '├ Dari : 👛 BCA (Sisa: Rp1.300.000)');
    assertIncludes(reply, '└ Ke : 👛 GOPAY (Saldo baru: Rp250.000)');
  });

  return { run };
}

module.exports = { createE2EScenariosSuite };
