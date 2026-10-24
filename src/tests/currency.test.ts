import { parseIndonesianCurrency, formatRupiah, formatCompactRupiah } from '../lib/currency';

export function runCurrencyTests() {
  const tests = [
    { input: '15rb', expected: 15000 },
    { input: '15ribu', expected: 15000 },
    { input: '15k', expected: 15000 },
    { input: '1.5jt', expected: 1500000 },
    { input: '1,5jt', expected: 1500000 },
    { input: '1.5 juta', expected: 1500000 },
    { input: '500k', expected: 500000 },
    { input: '2m', expected: 2000000000 },
    { input: 'Rp 250.000', expected: 250000 },
    { input: '250000', expected: 250000 },
    { input: 'dua puluh lima ribu', expected: 25000 },
    { input: 'sejuta', expected: 1000000 },
    { input: 'setengah juta', expected: 500000 },
    { input: 'beli 2 kopi seharga Rp 25.000', expected: 25000 },
    { input: 'beli 2 burger 50000', expected: 50000 },
    { input: '', expected: null },
    { input: 'halo apa kabar', expected: null },
  ];

  let passed = 0;
  for (const t of tests) {
    const result = parseIndonesianCurrency(t.input);
    if (result === t.expected) {
      passed++;
    } else {
      console.error(`FAIL: parseIndonesianCurrency("${t.input}") expected ${t.expected}, got ${result}`);
    }
  }

  // Format rupiah test
  if (formatRupiah(15000) !== 'Rp15.000') {
    console.error(`FAIL: formatRupiah(15000) expected "Rp15.000", got "${formatRupiah(15000)}"`);
  } else {
    passed++;
  }

  if (formatCompactRupiah(1500000) !== 'Rp1,5 Jt') {
    console.error(`FAIL: formatCompactRupiah(1500000) expected "Rp1,5 Jt", got "${formatCompactRupiah(1500000)}"`);
  } else {
    passed++;
  }

  return { total: tests.length + 2, passed };
}
