// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA UNIT TESTS: CURRENCY PARSER & FORMATTER
// ═══════════════════════════════════════════════════════════════════════════════

const { createSuite, assertEqual, assertNull } = require('../test-utils');
const { getCurrency } = require('../../dist-test/module-loader');

function createCurrencySuite() {
  const { test, run } = createSuite('Currency Parser & Formatter');
  const currency = getCurrency();

  // 1. Ribu / k multipliers
  test('parseIndonesianCurrency: parses "15rb" to 15,000', () => {
    assertEqual(currency.parseIndonesianCurrency('15rb'), 15000);
  });

  test('parseIndonesianCurrency: parses "15ribu" to 15,000', () => {
    assertEqual(currency.parseIndonesianCurrency('15ribu'), 15000);
  });

  test('parseIndonesianCurrency: parses "15k" to 15,000', () => {
    assertEqual(currency.parseIndonesianCurrency('15k'), 15000);
  });

  test('parseIndonesianCurrency: parses "500k" to 500,000', () => {
    assertEqual(currency.parseIndonesianCurrency('500k'), 500000);
  });

  test('parseIndonesianCurrency: parses "50rb" to 50,000', () => {
    assertEqual(currency.parseIndonesianCurrency('50rb'), 50000);
  });

  test('parseIndonesianCurrency: parses "250ribu" to 250,000', () => {
    assertEqual(currency.parseIndonesianCurrency('250ribu'), 250000);
  });

  // 2. Juta / jt multipliers with decimal dot and comma
  test('parseIndonesianCurrency: parses "1.5jt" to 1,500,000', () => {
    assertEqual(currency.parseIndonesianCurrency('1.5jt'), 1500000);
  });

  test('parseIndonesianCurrency: parses "1,5jt" (comma decimal) to 1,500,000', () => {
    assertEqual(currency.parseIndonesianCurrency('1,5jt'), 1500000);
  });

  test('parseIndonesianCurrency: parses "1.5 juta" to 1,500,000', () => {
    assertEqual(currency.parseIndonesianCurrency('1.5 juta'), 1500000);
  });

  test('parseIndonesianCurrency: parses "8jt" to 8,000,000', () => {
    assertEqual(currency.parseIndonesianCurrency('8jt'), 8000000);
  });

  test('parseIndonesianCurrency: parses "10mio" to 10,000,000', () => {
    assertEqual(currency.parseIndonesianCurrency('10mio'), 10000000);
  });

  // 3. Miliar / m multipliers
  test('parseIndonesianCurrency: parses "2m" to 2,000,000,000 (2 Miliar)', () => {
    assertEqual(currency.parseIndonesianCurrency('2m'), 2000000000);
  });

  test('parseIndonesianCurrency: parses "2 miliar" to 2,000,000,000', () => {
    assertEqual(currency.parseIndonesianCurrency('2 miliar'), 2000000000);
  });

  test('parseIndonesianCurrency: parses "1.2m" to 1,200,000,000', () => {
    assertEqual(currency.parseIndonesianCurrency('1.2m'), 1200000000);
  });

  // 4. Standard rupiah notations
  test('parseIndonesianCurrency: parses "Rp 250.000" to 250,000', () => {
    assertEqual(currency.parseIndonesianCurrency('Rp 250.000'), 250000);
  });

  test('parseIndonesianCurrency: parses "rp 150.000" to 150,000', () => {
    assertEqual(currency.parseIndonesianCurrency('rp 150.000'), 150000);
  });

  test('parseIndonesianCurrency: parses "Rp. 50.000" to 50,000', () => {
    assertEqual(currency.parseIndonesianCurrency('Rp. 50.000'), 50000);
  });

  test('parseIndonesianCurrency: parses plain digits "250000" to 250,000', () => {
    assertEqual(currency.parseIndonesianCurrency('250000'), 250000);
  });

  test('parseIndonesianCurrency: parses "10.000.000" to 10,000,000', () => {
    assertEqual(currency.parseIndonesianCurrency('10.000.000'), 10000000);
  });

  // 5. Case insensitivity and whitespace handling
  test('parseIndonesianCurrency: handles uppercase "15RB"', () => {
    assertEqual(currency.parseIndonesianCurrency('15RB'), 15000);
  });

  test('parseIndonesianCurrency: handles uppercase "1.5JT"', () => {
    assertEqual(currency.parseIndonesianCurrency('1.5JT'), 1500000);
  });

  test('parseIndonesianCurrency: handles uppercase "500K"', () => {
    assertEqual(currency.parseIndonesianCurrency('500K'), 500000);
  });

  test('parseIndonesianCurrency: handles surrounding whitespace "  25rb  "', () => {
    assertEqual(currency.parseIndonesianCurrency('  25rb  '), 25000);
  });

  // 6. Adversarial & Edge cases
  test('parseIndonesianCurrency: returns null for empty string', () => {
    assertNull(currency.parseIndonesianCurrency(''));
  });

  test('parseIndonesianCurrency: returns null for whitespace only', () => {
    assertNull(currency.parseIndonesianCurrency('    '));
  });

  test('parseIndonesianCurrency: returns null for null/undefined/non-string', () => {
    assertNull(currency.parseIndonesianCurrency(null));
    assertNull(currency.parseIndonesianCurrency(undefined));
    assertNull(currency.parseIndonesianCurrency(12345));
    assertNull(currency.parseIndonesianCurrency({}));
  });

  test('parseIndonesianCurrency: returns null for plain conversational text', () => {
    assertNull(currency.parseIndonesianCurrency('halo bot apa kabar'));
    assertNull(currency.parseIndonesianCurrency('tolong bantu saya catat'));
  });

  // 7. Formatters: formatRupiah
  test('formatRupiah: formats standard number with prefix "Rp15.000"', () => {
    assertEqual(currency.formatRupiah(15000), 'Rp15.000');
  });

  test('formatRupiah: formats without prefix "15.000"', () => {
    assertEqual(currency.formatRupiah(15000, false), '15.000');
  });

  test('formatRupiah: formats zero as "Rp0"', () => {
    assertEqual(currency.formatRupiah(0), 'Rp0');
  });

  test('formatRupiah: formats millions "Rp1.500.000"', () => {
    assertEqual(currency.formatRupiah(1500000), 'Rp1.500.000');
  });

  test('formatRupiah: formats string representation "50000" to "Rp50.000"', () => {
    assertEqual(currency.formatRupiah('50000'), 'Rp50.000');
  });

  // 8. Formatters: formatCompactRupiah
  test('formatCompactRupiah: formats millions to "Rp1,5 Jt"', () => {
    assertEqual(currency.formatCompactRupiah(1500000), 'Rp1,5 Jt');
  });

  test('formatCompactRupiah: formats billions to "Rp2 M"', () => {
    assertEqual(currency.formatCompactRupiah(2000000000), 'Rp2 M');
  });

  test('formatCompactRupiah: formats thousands to "Rp500 Rb"', () => {
    assertEqual(currency.formatCompactRupiah(500000), 'Rp500 Rb');
  });

  test('formatCompactRupiah: formats small amount to standard "Rp750"', () => {
    assertEqual(currency.formatCompactRupiah(750), 'Rp750');
  });

  return { run };
}

module.exports = { createCurrencySuite };
