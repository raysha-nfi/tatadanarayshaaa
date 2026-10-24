// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA UNIT TESTS: TELEGRAM BOT MESSAGE FORMATTER
// ═══════════════════════════════════════════════════════════════════════════════

const { createSuite, assert, assertEqual, assertIncludes } = require('../test-utils');
const { getFormatter } = require('../../dist-test/module-loader');

function createFormatterSuite() {
  const { test, run } = createSuite('Telegram Bot Message Formatter');
  const formatter = getFormatter();

  // 1. Visual Progress Bar (10 blocks: █ and ░)
  test('generateProgressBar: formats 0% as 10 empty blocks', () => {
    const bar = formatter.generateProgressBar(0);
    assertEqual(bar, '░░░░░░░░░░ 0%');
  });

  test('generateProgressBar: formats 10% with 1 filled block', () => {
    const bar = formatter.generateProgressBar(10);
    assertEqual(bar, '█░░░░░░░░░ 10%');
  });

  test('generateProgressBar: formats 40% with 4 filled blocks', () => {
    const bar = formatter.generateProgressBar(40);
    assertEqual(bar, '████░░░░░░ 40%');
  });

  test('generateProgressBar: formats 50% with 5 filled blocks', () => {
    const bar = formatter.generateProgressBar(50);
    assertEqual(bar, '█████░░░░░ 50%');
  });

  test('generateProgressBar: formats 80% with 8 filled blocks', () => {
    const bar = formatter.generateProgressBar(80);
    assertEqual(bar, '████████░░ 80%');
  });

  test('generateProgressBar: formats 100% with 10 filled blocks', () => {
    const bar = formatter.generateProgressBar(100);
    assertEqual(bar, '██████████ 100%');
  });

  test('generateProgressBar: clamps negative percentages to 0%', () => {
    const bar = formatter.generateProgressBar(-25);
    assertEqual(bar, '░░░░░░░░░░ 0%');
  });

  test('generateProgressBar: clamps percentages over 100% to 100%', () => {
    const bar = formatter.generateProgressBar(150);
    assertEqual(bar, '██████████ 100%');
  });

  // 2. formatExpenseReply / formatExpenseNota (Part 4.4 Nota specification)
  test('formatExpenseReply / formatExpenseNota: formats complete expense nota', () => {
    const params = {
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
    };

    const reply = formatter.formatExpenseReply(params);
    assertIncludes(reply, '💸 Pengeluaran tercatat!');
    assertIncludes(reply, '├ Nominal : Rp15.000');
    assertIncludes(reply, '├ Kategori : 🍜 Makanan');
    assertIncludes(reply, '├ Dompet : 👛 Cash');
    assertIncludes(reply, '├ Catatan : beli bakso');
    assertIncludes(reply, '└ Saldo : Rp435.000');
    assertIncludes(reply, '📊 Budget Makanan bulan ini:');
    assertIncludes(reply, '████░░░░░░ 40% — sisa Rp600.000');
    assertIncludes(reply, 'Pengeluaran masih dalam batas aman');

    // Test alias formatExpenseNota
    const notaReply = formatter.formatExpenseNota(params);
    assertEqual(notaReply, reply, 'formatExpenseNota should produce identical result to formatExpenseReply');
  });

  test('formatExpenseReply: shows 80% budget warning', () => {
    const reply = formatter.formatExpenseReply({
      amount: 50000,
      categoryName: 'Makanan',
      walletName: 'Cash',
      notes: 'lunch',
      newBalance: 150000,
      budget: {
        limit: 1000000,
        spent: 850000,
        percentage: 85,
        remaining: 150000,
      },
    });

    assertIncludes(reply, '█████████░ 85%');
    assertIncludes(reply, '⚠️ Perhatian! Budget kategori ini sudah mencapai 80%');
  });

  test('formatExpenseReply: shows 100% budget breach alert', () => {
    const reply = formatter.formatExpenseReply({
      amount: 50000,
      categoryName: 'Hiburan',
      walletName: 'GoPay',
      notes: 'nonton bioskop',
      newBalance: 50000,
      budget: {
        limit: 500000,
        spent: 550000,
        percentage: 110,
        remaining: 0,
      },
    });

    assertIncludes(reply, '🚨 AWAS! Budget Hiburan kamu sudah melebih batas 100%! Rem dulu ya 🛑');
  });

  test('formatExpenseReply: includes voice transcript header when provided', () => {
    const reply = formatter.formatExpenseReply({
      amount: 25000,
      categoryName: 'Transport',
      walletName: 'BCA',
      notes: 'bensin pertalite',
      newBalance: 1000000,
      voiceTranscript: 'isi bensin dua puluh lima ribu rupiah',
    });

    assertIncludes(reply, '🎙️ Transkrip: "isi bensin dua puluh lima ribu rupiah"');
  });

  // 3. formatIncomeReply (Part 4.5)
  test('formatIncomeReply: formats structured income reply', () => {
    const reply = formatter.formatIncomeReply({
      amount: 5000000,
      categoryName: 'Gaji',
      walletName: 'BCA',
      newBalance: 12500000,
    });

    assertIncludes(reply, '💰 Pemasukan tercatat!');
    assertIncludes(reply, '├ Nominal : Rp5.000.000');
    assertIncludes(reply, '├ Kategori : 💼 Gaji');
    assertIncludes(reply, '├ Dompet : 👛 BCA');
    assertIncludes(reply, '└ Saldo baru : Rp12.500.000');
    assertIncludes(reply, 'Semangat terus! Jangan lupa sisihkan untuk tabungan ya.');
  });

  // 4. formatTransferReply
  test('formatTransferReply: formats inter-wallet transfer reply', () => {
    const reply = formatter.formatTransferReply({
      amount: 100000,
      fromWallet: 'BCA',
      toWallet: 'GoPay',
      fromBalance: 900000,
      toBalance: 250000,
    });

    assertIncludes(reply, '🔄 Transfer antar dompet berhasil!');
    assertIncludes(reply, '├ Nominal : Rp100.000');
    assertIncludes(reply, '├ Dari : 👛 BCA (Sisa: Rp900.000)');
    assertIncludes(reply, '└ Ke : 👛 GoPay (Saldo baru: Rp250.000)');
  });

  // 5. formatHelpReply
  test('formatHelpReply: lists all core commands and tips', () => {
    const reply = formatter.formatHelpReply();
    assertIncludes(reply, '/saldo');
    assertIncludes(reply, '/hari_ini');
    assertIncludes(reply, '/minggu_ini');
    assertIncludes(reply, '/bulan_ini');
    assertIncludes(reply, '/budget');
    assertIncludes(reply, '/sheet');
    assertIncludes(reply, '/bantuan');
    assertIncludes(reply, 'beli bakso 15rb');
  });

  // 6. formatSaldoReply
  test('formatSaldoReply: formats list of wallets with individual and total balances', () => {
    const wallets = [
      { id: '1', name: 'BCA', balance: 5000000, is_default: true, icon: '🏦' },
      { id: '2', name: 'Cash', balance: 350000, is_default: false, icon: '💵' },
      { id: '3', name: 'GoPay', balance: 150000, is_default: false, icon: '📱' },
    ];

    const reply = formatter.formatSaldoReply(wallets);
    assertIncludes(reply, '👛 Saldo Dompet Kamu:');
    assertIncludes(reply, 'BCA (Utama ⭐️) : Rp5.000.000');
    assertIncludes(reply, 'Cash : Rp350.000');
    assertIncludes(reply, 'GoPay : Rp150.000');
    assertIncludes(reply, '💰 Total Keseluruhan: Rp5.500.000');
  });

  test('formatSaldoReply: handles empty wallets gracefully', () => {
    const reply = formatter.formatSaldoReply([]);
    assertIncludes(reply, 'Kamu belum memiliki dompet aktif');
  });

  // 7. formatDailyReminder
  test('formatDailyReminder: formats daily reminder text', () => {
    const reminder = formatter.formatDailyReminder();
    assertIncludes(reminder, '⏰ Reminder Keuangan!');
    assertIncludes(reminder, 'Jangan lupa catat pengeluaran hari ini ya 📝');
  });

  // 8. formatAdvisorMessage
  test('formatAdvisorMessage: formats advisor recommendation card', () => {
    const msg = formatter.formatAdvisorMessage({
      userName: 'Fajar',
      analysis: 'Pengeluaran kopi kamu minggu ini naik 80%.',
      advice: 'Coba buat kopi sendiri di rumah untuk hemat 100rb per minggu.',
    });

    assertIncludes(msg, '🤖 Financial Advisor');
    assertIncludes(msg, 'Hei Fajar!');
    assertIncludes(msg, 'Pengeluaran kopi kamu');
    assertIncludes(msg, '💡 Saran: Coba buat kopi sendiri');
  });

  return { run };
}

module.exports = { createFormatterSuite };
