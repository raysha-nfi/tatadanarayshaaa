// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA UNIT TESTS: RULE-BASED NATURAL LANGUAGE PARSER
// ═══════════════════════════════════════════════════════════════════════════════

const { createSuite, assert, assertEqual, assertNull, assertIncludes } = require('../test-utils');
const { getParser } = require('../../dist-test/module-loader');

function createParserSuite() {
  const { test, run } = createSuite('Rule-Based Indonesian NLP Parser');
  const parser = getParser();

  // 1. Food & Drink expenses
  test('parseTransactionRuleBased: parses "beli bakso 15rb" to Makanan expense', () => {
    const res = parser.parseTransactionRuleBased('beli bakso 15rb');
    assert(res !== null, 'Should parse valid transaction');
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 15000);
    assertEqual(res.kategori, 'Makanan');
    assertEqual(res.catatan, 'beli bakso 15rb');
    assert(res.confidence >= 0.9, 'Confidence should be >= 0.9');
  });

  test('parseTransactionRuleBased: parses "kopi janji jiwa 24k" to Makanan expense', () => {
    const res = parser.parseTransactionRuleBased('kopi janji jiwa 24k');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 24000);
    assertEqual(res.kategori, 'Makanan');
  });

  test('parseTransactionRuleBased: parses "sarapan nasi uduk 12rb"', () => {
    const res = parser.parseTransactionRuleBased('sarapan nasi uduk 12rb');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 12000);
    assertEqual(res.kategori, 'Makanan');
  });

  // 2. Transport expenses
  test('parseTransactionRuleBased: parses "bensin 50rb" to Transport expense', () => {
    const res = parser.parseTransactionRuleBased('bensin 50rb');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 50000);
    assertEqual(res.kategori, 'Transport');
  });

  test('parseTransactionRuleBased: parses "pertamax 100k"', () => {
    const res = parser.parseTransactionRuleBased('pertamax 100k');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 100000);
    assertEqual(res.kategori, 'Transport');
  });

  test('parseTransactionRuleBased: parses "ojol gojek 22rb"', () => {
    const res = parser.parseTransactionRuleBased('ojol gojek 22rb');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 22000);
    assertEqual(res.kategori, 'Transport');
  });

  test('parseTransactionRuleBased: parses "bayar tol 17rb"', () => {
    const res = parser.parseTransactionRuleBased('bayar tol 17rb');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 17000);
    assertEqual(res.kategori, 'Transport');
  });

  // 3. Bills & Utilities expenses
  test('parseTransactionRuleBased: parses "bayar wifi indihome 350k" to Tagihan', () => {
    const res = parser.parseTransactionRuleBased('bayar wifi indihome 350k');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 350000);
    assertEqual(res.kategori, 'Tagihan');
  });

  test('parseTransactionRuleBased: parses "token listrik pln 200rb"', () => {
    const res = parser.parseTransactionRuleBased('token listrik pln 200rb');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 200000);
    assertEqual(res.kategori, 'Tagihan');
  });

  test('parseTransactionRuleBased: parses "pulsa kuota 50rb"', () => {
    const res = parser.parseTransactionRuleBased('pulsa kuota 50rb');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 50000);
    assertEqual(res.kategori, 'Tagihan');
  });

  // 4. Shopping & Health expenses
  test('parseTransactionRuleBased: parses "belanja di indomaret 120rb" to Belanja', () => {
    const res = parser.parseTransactionRuleBased('belanja di indomaret 120rb');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 120000);
    assertEqual(res.kategori, 'Belanja');
  });

  test('parseTransactionRuleBased: parses "beli obat di apotek 75rb" to Kesehatan', () => {
    const res = parser.parseTransactionRuleBased('beli obat di apotek 75rb');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 75000);
    assertEqual(res.kategori, 'Kesehatan');
  });

  test('parseTransactionRuleBased: parses "nonton bioskop 80k" to Hiburan', () => {
    const res = parser.parseTransactionRuleBased('nonton bioskop 80k');
    assert(res !== null);
    assertEqual(res.jenis, 'pengeluaran');
    assertEqual(res.nominal, 80000);
    assertEqual(res.kategori, 'Hiburan');
  });

  // 5. Incomes
  test('parseTransactionRuleBased: parses "gajian 5jt" to Gaji income', () => {
    const res = parser.parseTransactionRuleBased('gajian 5jt');
    assert(res !== null);
    assertEqual(res.jenis, 'pemasukan');
    assertEqual(res.nominal, 5000000);
    assertEqual(res.kategori, 'Gaji');
  });

  test('parseTransactionRuleBased: parses "gaji bulanan 8.5jt"', () => {
    const res = parser.parseTransactionRuleBased('gaji bulanan 8.5jt');
    assert(res !== null);
    assertEqual(res.jenis, 'pemasukan');
    assertEqual(res.nominal, 8500000);
    assertEqual(res.kategori, 'Gaji');
  });

  test('parseTransactionRuleBased: parses "bonus thr 3jt" to Bonus income', () => {
    const res = parser.parseTransactionRuleBased('bonus thr 3jt');
    assert(res !== null);
    assertEqual(res.jenis, 'pemasukan');
    assertEqual(res.nominal, 3000000);
    assertEqual(res.kategori, 'Bonus');
  });

  test('parseTransactionRuleBased: parses "project freelance 2.5jt"', () => {
    const res = parser.parseTransactionRuleBased('project freelance 2.5jt');
    assert(res !== null);
    assertEqual(res.jenis, 'pemasukan');
    assertEqual(res.nominal, 2500000);
    assertEqual(res.kategori, 'Freelance');
  });

  // 6. Transfers
  test('parseTransactionRuleBased: parses "tf bca ke gopay 100rb" to transfer', () => {
    const res = parser.parseTransactionRuleBased('tf bca ke gopay 100rb');
    assert(res !== null);
    assertEqual(res.jenis, 'transfer');
    assertEqual(res.nominal, 100000);
    assertEqual(res.wallet_asal, 'BCA');
    assertEqual(res.wallet_tujuan, 'GOPAY');
    assertEqual(res.kategori, 'Transfer');
  });

  test('parseTransactionRuleBased: parses "transfer mandiri ke dana 50k"', () => {
    const res = parser.parseTransactionRuleBased('transfer mandiri ke dana 50k');
    assert(res !== null);
    assertEqual(res.jenis, 'transfer');
    assertEqual(res.nominal, 50000);
    assertEqual(res.wallet_asal, 'MANDIRI');
    assertEqual(res.wallet_tujuan, 'DANA');
  });

  test('parseTransactionRuleBased: parses "kirim bca ke ovo 250rb"', () => {
    const res = parser.parseTransactionRuleBased('kirim bca ke ovo 250rb');
    assert(res !== null);
    assertEqual(res.jenis, 'transfer');
    assertEqual(res.nominal, 250000);
    assertEqual(res.wallet_asal, 'BCA');
    assertEqual(res.wallet_tujuan, 'OVO');
  });

  // 7. Edge cases & invalid inputs
  test('parseTransactionRuleBased: returns null for empty string', () => {
    assertNull(parser.parseTransactionRuleBased(''));
  });

  test('parseTransactionRuleBased: returns null for whitespace string', () => {
    assertNull(parser.parseTransactionRuleBased('   \t\n  '));
  });

  test('parseTransactionRuleBased: returns null when no nominal is present', () => {
    assertNull(parser.parseTransactionRuleBased('halo apa kabar bot'));
    assertNull(parser.parseTransactionRuleBased('catatkan pengeluaran kemarin'));
  });

  // 8. LLM prompt template integrity
  test('LLM_TRANSACTION_PARSER_PROMPT: contains system instructions for LLM', () => {
    assert(typeof parser.LLM_TRANSACTION_PARSER_PROMPT === 'string');
    assertIncludes(parser.LLM_TRANSACTION_PARSER_PROMPT, 'TataDana');
    assertIncludes(parser.LLM_TRANSACTION_PARSER_PROMPT, '15rb');
    assertIncludes(parser.LLM_TRANSACTION_PARSER_PROMPT, 'pemasukan');
    assertIncludes(parser.LLM_TRANSACTION_PARSER_PROMPT, 'pengeluaran');
  });

  return { run };
}

module.exports = { createParserSuite };
