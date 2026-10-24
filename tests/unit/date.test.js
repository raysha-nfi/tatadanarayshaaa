// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA UNIT TESTS: DATE & TIMEZONE UTILITIES (ASIA/JAKARTA WIB)
// ═══════════════════════════════════════════════════════════════════════════════

const { createSuite, assert, assertEqual, assertMatches } = require('../test-utils');
const { getDate } = require('../../dist-test/module-loader');

function createDateSuite() {
  const { test, run } = createSuite('Date & Timezone Utilities (Asia/Jakarta WIB)');
  const dateUtil = getDate();

  test('getNowWIB: returns valid Date object', () => {
    const nowWIB = dateUtil.getNowWIB();
    assert(nowWIB instanceof Date, 'Should return Date instance');
    assert(!isNaN(nowWIB.getTime()), 'Timestamp should be valid');
  });

  test('toWIBDate: accurately converts UTC ISO string to WIB (+7)', () => {
    // 2026-10-10 05:30:00 UTC -> 2026-10-10 12:30:00 WIB
    const utcIso = '2026-10-10T05:30:00.000Z';
    const wib = dateUtil.toWIBDate(utcIso);
    assert(wib instanceof Date, 'Should return Date instance');
    assertEqual(wib.getFullYear(), 2026);
    assertEqual(wib.getMonth(), 9); // October is month index 9
    assertEqual(wib.getDate(), 10);
  });

  test('formatBotTimestamp: formats standard header with Indonesian day and month', () => {
    const timestampStr = dateUtil.formatBotTimestamp();
    // Must match: 📅 [Hari], [Tgl] [Bulan] [Tahun] — [Jam]:[Menit] WIB
    const regex = /^📅 (Minggu|Senin|Selasa|Rabu|Kamis|Jumat|Sabtu), \d{1,2} (Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember) \d{4} — \d{2}:\d{2} WIB$/;
    assertMatches(timestampStr, regex, 'Timestamp must match Telegram bot header format');
  });

  test('formatBotTimestamp: handles custom input Date correctly', () => {
    // Saturday, 10 October 2026
    const specificDate = new Date(Date.UTC(2026, 9, 10, 5, 0, 0));
    const formatted = dateUtil.formatBotTimestamp(specificDate);
    assert(formatted.startsWith('📅 '), 'Must start with calendar emoji');
    assert(formatted.endsWith('WIB'), 'Must end with WIB');
    assert(formatted.includes('Oktober 2026'), 'Must include Indonesian month and year');
  });

  test('formatIndonesianDate: formats full and short month variations', () => {
    const specificDate = new Date(Date.UTC(2026, 9, 10, 0, 0, 0));
    const full = dateUtil.formatIndonesianDate(specificDate, false);
    const short = dateUtil.formatIndonesianDate(specificDate, true);

    assert(full.includes('Oktober 2026'), `Full month expected 'Oktober 2026', got '${full}'`);
    assert(short.includes('Okt 2026'), `Short month expected 'Okt 2026', got '${short}'`);
  });

  test('formatIndonesianTime: formats time string with WIB suffix', () => {
    const specificDate = new Date(Date.UTC(2026, 9, 10, 7, 15, 0));
    const timeStr = dateUtil.formatIndonesianTime(specificDate);
    assertMatches(timeStr, /^\d{2}:\d{2} WIB$/, 'Time string must be in HH:mm WIB format');
  });

  test('getCurrentMonthKey: returns YYYY-MM format', () => {
    const monthKey = dateUtil.getCurrentMonthKey();
    assertMatches(monthKey, /^\d{4}-\d{2}$/, 'Month key must match YYYY-MM format');
  });

  return { run };
}

module.exports = { createDateSuite };
