import { parseTransactionRuleBased } from '../lib/ai/parser';

export function runTelegramParserTests() {
  const tests = [
    {
      input: 'beli bakso 15rb',
      expectedJenis: 'pengeluaran',
      expectedNominal: 15000,
      expectedCategory: 'Makanan',
    },
    {
      input: 'gajian 5jt',
      expectedJenis: 'pemasukan',
      expectedNominal: 5000000,
      expectedCategory: 'Gaji',
    },
    {
      input: 'kopi janji jiwa 24k',
      expectedJenis: 'pengeluaran',
      expectedNominal: 24000,
      expectedCategory: 'Makanan',
    },
    {
      input: 'bensin 50rb',
      expectedJenis: 'pengeluaran',
      expectedNominal: 50000,
      expectedCategory: 'Transport',
    },
    {
      input: 'tf bca ke gopay 100rb',
      expectedJenis: 'transfer',
      expectedNominal: 100000,
      expectedFrom: 'BCA',
      expectedTo: 'GOPAY',
    },
    {
      input: 'beli 2 kopi 24k',
      expectedJenis: 'pengeluaran',
      expectedNominal: 24000,
      expectedCategory: 'Makanan',
    },
    {
      input: 'beli pulsa 25000',
      expectedJenis: 'pengeluaran',
      expectedNominal: 25000,
      expectedCategory: 'Tagihan',
    },
    {
      input: 'dapat transferan 500rb',
      expectedJenis: 'pemasukan',
      expectedNominal: 500000,
      expectedCategory: 'Lainnya',
    },
  ];

  let passed = 0;
  for (const t of tests) {
    const result = parseTransactionRuleBased(t.input);
    if (!result) {
      console.error(`FAIL: parseTransactionRuleBased("${t.input}") returned null`);
      continue;
    }

    const jenisOk = result.jenis === t.expectedJenis;
    const nominalOk = result.nominal === t.expectedNominal;
    let extraOk = true;

    if (t.expectedCategory && result.kategori !== t.expectedCategory) {
      extraOk = false;
      console.error(`Category mismatch for "${t.input}": expected ${t.expectedCategory}, got ${result.kategori}`);
    }

    if (t.expectedFrom && result.wallet_asal !== t.expectedFrom) {
      extraOk = false;
    }
    if (t.expectedTo && result.wallet_tujuan !== t.expectedTo) {
      extraOk = false;
    }

    if (jenisOk && nominalOk && extraOk) {
      passed++;
    } else {
      console.error(`FAIL: result for "${t.input}" did not match expectations:`, result);
    }
  }

  // Edge cases: empty and invalid inputs
  const emptyRes = parseTransactionRuleBased('');
  if (emptyRes === null) passed++;

  const noNumberRes = parseTransactionRuleBased('halo bot apa kabar');
  if (noNumberRes === null) passed++;

  return { total: tests.length + 2, passed };
}
