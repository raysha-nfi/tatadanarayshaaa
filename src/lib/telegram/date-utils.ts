// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA TELEGRAM BOT WIB DATE UTILITIES
// Kalkulasi rentang waktu berzona Asia/Jakarta (WIB, UTC+7) untuk perintah bot
// ═══════════════════════════════════════════════════════════════════════════════

export const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const HARI_INDONESIA = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

/**
 * Convert any Date or timestamp to Asia/Jakarta (UTC+7) Date object
 */
export function getWIBDate(dateInput?: Date | string | number): Date {
  const d = dateInput ? new Date(dateInput) : new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 7));
}

/**
 * Returns ISO strings and components for TODAY in WIB (00:00:00 - 23:59:59.999)
 */
export function getWIBTodayRange(nowDate?: Date) {
  const wib = getWIBDate(nowDate);
  const y = wib.getFullYear();
  const m = String(wib.getMonth() + 1).padStart(2, '0');
  const d = String(wib.getDate()).padStart(2, '0');

  const startIso = `${y}-${m}-${d}T00:00:00+07:00`;
  const endIso = `${y}-${m}-${d}T23:59:59.999+07:00`;

  return {
    startIso,
    endIso,
    year: y,
    month: m,
    day: d,
    dateKey: `${y}-${m}-${d}`,
  };
}

/**
 * Returns ISO strings for LAST 7 DAYS in WIB (from 6 days ago 00:00:00 to today 23:59:59)
 */
export function getWIB7DaysRange(nowDate?: Date) {
  const wib = getWIBDate(nowDate);
  const pastWib = new Date(wib.getTime() - (6 * 24 * 60 * 60 * 1000));
  const y = pastWib.getFullYear();
  const m = String(pastWib.getMonth() + 1).padStart(2, '0');
  const d = String(pastWib.getDate()).padStart(2, '0');

  const today = getWIBTodayRange(nowDate);
  const startIso = `${y}-${m}-${d}T00:00:00+07:00`;
  const endIso = today.endIso;

  return {
    startIso,
    endIso,
  };
}

/**
 * Returns ISO strings and month label for CURRENT MONTH in WIB (YYYY-MM-01 to end of month)
 */
export function getWIBMonthRange(nowDate?: Date) {
  const wib = getWIBDate(nowDate);
  const y = wib.getFullYear();
  const mIdx = wib.getMonth();
  const m = String(mIdx + 1).padStart(2, '0');

  // Days in month
  const lastDay = new Date(y, mIdx + 1, 0).getDate();
  const lastDayStr = String(lastDay).padStart(2, '0');

  const startIso = `${y}-${m}-01T00:00:00+07:00`;
  const endIso = `${y}-${m}-${lastDayStr}T23:59:59.999+07:00`;
  const monthKey = `${y}-${m}`;
  const monthName = `${BULAN_INDONESIA[mIdx]} ${y}`;

  return {
    startIso,
    endIso,
    monthKey,
    monthName,
    year: y,
    monthIndex: mIdx,
  };
}
