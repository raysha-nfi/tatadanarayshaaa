// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA UNIT TESTS: PLAN LIMITS & FEATURE GATING (STARTER vs PRO)
// ═══════════════════════════════════════════════════════════════════════════════

const { createSuite, assert, assertEqual, assertIncludes } = require('../test-utils');
const { getLimits } = require('../../dist-test/module-loader');

function createLimitsSuite() {
  const { test, run } = createSuite('Plan Limits & Feature Gating');
  const limits = getLimits();

  // 1. Transaction limit checks
  test('checkTransactionLimit: Starter allows transactions under 50', () => {
    const res0 = limits.checkTransactionLimit('starter', 0);
    assertEqual(res0.allowed, true);
    assertEqual(res0.maxLimit, 50);

    const res49 = limits.checkTransactionLimit('starter', 49);
    assertEqual(res49.allowed, true);
    assertEqual(res49.currentCount, 49);
  });

  test('checkTransactionLimit: Starter rejects 50th transaction with upgrade message', () => {
    const res50 = limits.checkTransactionLimit('starter', 50);
    assertEqual(res50.allowed, false);
    assertEqual(res50.maxLimit, 50);
    assert(typeof res50.message === 'string', 'Must provide user notification message');
    assertIncludes(res50.message, '50 transaksi');
    assertIncludes(res50.message, 'Upgrade ke paket Pro');
  });

  test('checkTransactionLimit: Starter rejects transactions beyond 50', () => {
    const res55 = limits.checkTransactionLimit('starter', 55);
    assertEqual(res55.allowed, false);
  });

  test('checkTransactionLimit: Pro allows unlimited transactions', () => {
    const pro50 = limits.checkTransactionLimit('pro', 50);
    assertEqual(pro50.allowed, true);

    const pro1000 = limits.checkTransactionLimit('pro', 1000);
    assertEqual(pro1000.allowed, true);
    assertEqual(pro1000.maxLimit, Infinity);
  });

  // 2. Wallet limit checks
  test('checkWalletLimit: Starter allows up to 2 wallets, rejects 3rd wallet', () => {
    const ok = limits.checkWalletLimit('starter', 2);
    assertEqual(ok.allowed, true);

    const blocked = limits.checkWalletLimit('starter', 3);
    assertEqual(blocked.allowed, false);
    assertIncludes(blocked.message, 'maksimal 3 dompet');
    assertIncludes(blocked.message, 'Upgrade ke Pro');
  });

  test('checkWalletLimit: Pro allows unlimited wallets', () => {
    const proWallets = limits.checkWalletLimit('pro', 10);
    assertEqual(proWallets.allowed, true);
  });

  // 3. Budget limit checks
  test('checkBudgetLimit: Starter allows up to 4 budgets, rejects 5th budget', () => {
    const ok = limits.checkBudgetLimit('starter', 4);
    assertEqual(ok.allowed, true);

    const blocked = limits.checkBudgetLimit('starter', 5);
    assertEqual(blocked.allowed, false);
    assertIncludes(blocked.message, 'maksimal 5 budget kategori');
    assertIncludes(blocked.message, 'Upgrade ke Pro');
  });

  test('checkBudgetLimit: Pro allows unlimited budget categories', () => {
    const proBudgets = limits.checkBudgetLimit('pro', 25);
    assertEqual(proBudgets.allowed, true);
  });

  // 4. Receipt photo OCR feature gating
  test('canUseReceiptPhoto: Starter is blocked with camera emoji & upgrade CTA', () => {
    const starterOCR = limits.canUseReceiptPhoto('starter');
    assertEqual(starterOCR.allowed, false);
    assert(typeof starterOCR.message === 'string');
    assertIncludes(starterOCR.message, '📸');
    assertIncludes(starterOCR.message, 'khusus pengguna Pro');
    assertIncludes(starterOCR.message, 'Upgrade ke Pro sekarang');
  });

  test('canUseReceiptPhoto: Pro is allowed to use receipt photo OCR', () => {
    const proOCR = limits.canUseReceiptPhoto('pro');
    assertEqual(proOCR.allowed, true);
  });

  // 5. Export reports feature gating
  test('canExportReports / canExportReport: Starter is blocked with Pro CTA', () => {
    const starterExport1 = limits.canExportReports('starter');
    assertEqual(starterExport1.allowed, false);
    assertIncludes(starterExport1.message, 'fitur eksklusif paket Pro');

    // Alias compatibility check
    const starterExport2 = limits.canExportReport('starter');
    assertEqual(starterExport2.allowed, false);
  });

  test('canExportReports / canExportReport: Pro is allowed to export PDF/Excel', () => {
    const proExport1 = limits.canExportReports('pro');
    assertEqual(proExport1.allowed, true);

    const proExport2 = limits.canExportReport('pro');
    assertEqual(proExport2.allowed, true);
  });

  // 6. Voice note feature availability (Voice notes allowed for all users per specs)
  test('PLAN_LIMITS: voice note transcription allowed on both Starter and Pro', () => {
    assertEqual(limits.PLAN_LIMITS.starter.allowVoiceNote, true);
    assertEqual(limits.PLAN_LIMITS.pro.allowVoiceNote, true);
  });

  return { run };
}

module.exports = { createLimitsSuite };
