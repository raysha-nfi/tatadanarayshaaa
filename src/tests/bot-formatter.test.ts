import {
  generateProgressBar,
  formatExpenseReply,
  formatIncomeReply,
  formatDailyReminder,
  formatHariIniReply,
  formatMingguIniReply,
  formatBulanIniReply,
} from '../lib/telegram/formatter';

export function runBotFormatterTests() {
  let passed = 0;
  let total = 0;

  // 1. Progress Bar Generator
  total++;
  const bar0 = generateProgressBar(0);
  if (bar0 === '░░░░░░░░░░ 0%') passed++;
  else console.error(`FAIL: bar0 was "${bar0}"`);

  total++;
  const bar40 = generateProgressBar(40);
  if (bar40 === '████░░░░░░ 40%') passed++;
  else console.error(`FAIL: bar40 was "${bar40}"`);

  total++;
  const bar100 = generateProgressBar(100);
  if (bar100 === '██████████ 100%') passed++;
  else console.error(`FAIL: bar100 was "${bar100}"`);

  // 2. Expense Reply Format
  total++;
  const expenseReply = formatExpenseReply({
    amount: 15000,
    categoryName: 'Makanan',
    categoryEmoji: '🍜',
    walletName: 'Cash',
    notes: 'beli bakso',
    newBalance: 435000,
    budget: {
      limit: 1000000,
      spent: 400000,
      percentage: 40,
      remaining: 600000,
    },
  });

  if (
    expenseReply.includes('💸 Pengeluaran tercatat!') &&
    expenseReply.includes('├ Nominal : Rp15.000') &&
    expenseReply.includes('├ Kategori : 🍜 Makanan') &&
    expenseReply.includes('├ Dompet : 👛 Cash') &&
    expenseReply.includes('└ Saldo : Rp435.000') &&
    expenseReply.includes('████░░░░░░ 40%')
  ) {
    passed++;
  } else {
    console.error('FAIL: expenseReply format did not match specification:\n', expenseReply);
  }

  // 3. Income Reply Format
  total++;
  const incomeReply = formatIncomeReply({
    amount: 5000000,
    categoryName: 'Gaji',
    walletName: 'BCA',
    newBalance: 9750000,
  });

  if (
    incomeReply.includes('💰 Pemasukan tercatat!') &&
    incomeReply.includes('├ Nominal : Rp5.000.000') &&
    incomeReply.includes('├ Dompet : 👛 BCA') &&
    incomeReply.includes('Semangat terus! Jangan lupa sisihkan untuk tabungan ya.')
  ) {
    passed++;
  } else {
    console.error('FAIL: incomeReply format did not match specification:\n', incomeReply);
  }

  // 4. Daily Reminder Format
  total++;
  const reminder = formatDailyReminder();
  if (
    reminder.includes('⏰ Reminder Keuangan!') &&
    reminder.includes('Jangan lupa catat pengeluaran hari ini ya 📝')
  ) {
    passed++;
  } else {
    console.error('FAIL: reminder format did not match specification');
  }

  // 5. Hari Ini Reply Format
  total++;
  const hariIni = formatHariIniReply({
    dateHeader: 'Sabtu, 10 Oktober 2026',
    totalIncome: 5000000,
    totalExpense: 65000,
    transactions: [
      { time: '12:20 WIB', type: 'expense', amount: 15000, notes: 'beli bakso', categoryEmoji: '🍜', categoryName: 'Makanan' },
      { time: '09:00 WIB', type: 'expense', amount: 50000, notes: 'bensin', categoryEmoji: '🚗', categoryName: 'Transport' },
      { time: '08:00 WIB', type: 'income', amount: 5000000, notes: 'gaji', categoryEmoji: '💰', categoryName: 'Gaji' },
    ],
  });
  if (
    hariIni.includes('Rekap Transaksi Hari Ini') &&
    hariIni.includes('Total Pemasukan   : Rp5.000.000') &&
    hariIni.includes('Total Pengeluaran : Rp65.000') &&
    hariIni.includes('Net Hari Ini      : +Rp4.935.000')
  ) {
    passed++;
  } else {
    console.error('FAIL: formatHariIniReply did not match specification:\n', hariIni);
  }

  // 6. Minggu Ini Reply Format
  total++;
  const mingguIni = formatMingguIniReply({
    totalIncome: 5000000,
    totalExpense: 350000,
    transactionCount: 5,
    topCategories: [
      { name: 'Makanan', emoji: '🍜', amount: 200000, percentage: 57 },
      { name: 'Transport', emoji: '🚗', amount: 150000, percentage: 43 },
    ],
  });
  if (
    mingguIni.includes('Rekap Transaksi 7 Hari Terakhir') &&
    mingguIni.includes('Total Pemasukan   : Rp5.000.000') &&
    mingguIni.includes('Total Transaksi   : 5 transaksi') &&
    mingguIni.includes('Top Kategori Pengeluaran:')
  ) {
    passed++;
  } else {
    console.error('FAIL: formatMingguIniReply did not match specification:\n', mingguIni);
  }

  // 7. Bulan Ini Reply Format
  total++;
  const bulanIni = formatBulanIniReply({
    monthName: 'Oktober 2026',
    totalIncome: 10000000,
    totalExpense: 2500000,
    categoryBreakdown: [
      { name: 'Makanan & Minuman', emoji: '🍜', amount: 1500000, percentage: 60 },
      { name: 'Transportasi', emoji: '🚗', amount: 1000000, percentage: 40 },
    ],
  });
  if (
    bulanIni.includes('Rekap Bulan Ini (Oktober 2026)') &&
    bulanIni.includes('Total Pemasukan   : Rp10.000.000') &&
    bulanIni.includes('Total Pengeluaran : Rp2.500.000') &&
    bulanIni.includes('Breakdown Pengeluaran per Kategori:')
  ) {
    passed++;
  } else {
    console.error('FAIL: formatBulanIniReply did not match specification:\n', bulanIni);
  }

  return { total, passed };
}

