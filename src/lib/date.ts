// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA DATE & TIME UTILITIES (ASIA/JAKARTA WIB)
// Wajib: Semua timestamp transaksi, reminder, dan reply bot menggunakan WIB
// ═══════════════════════════════════════════════════════════════════════════════

const HARI_INDONESIA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Get current date in WIB (Asia/Jakarta, UTC+7)
 */
export function getNowWIB(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 7));
}

/**
 * Format a Date or ISO string into Asia/Jakarta Date object
 */
export function toWIBDate(dateInput: Date | string | number): Date {
  const d = new Date(dateInput);
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 7));
}

/**
 * Format bot header timestamp:
 * 📅 [Hari], [Tanggal] — [Jam WIB]
 * Contoh: 📅 Sabtu, 10 Oktober 2026 — 12:20 WIB
 */
export function formatBotTimestamp(dateInput?: Date | string): string {
  const wib = dateInput ? toWIBDate(dateInput) : getNowWIB();
  const hari = HARI_INDONESIA[wib.getDay()];
  const tgl = wib.getDate();
  const bln = BULAN_INDONESIA[wib.getMonth()];
  const thn = wib.getFullYear();
  const jam = String(wib.getHours()).padStart(2, '0');
  const menit = String(wib.getMinutes()).padStart(2, '0');

  return `📅 ${hari}, ${tgl} ${bln} ${thn} — ${jam}:${menit} WIB`;
}

/**
 * Format date for UI display: "10 Okt 2026" or "10 Oktober 2026"
 */
export function formatIndonesianDate(dateInput: Date | string, shortMonth: boolean = false): string {
  const wib = toWIBDate(dateInput);
  const tgl = wib.getDate();
  const bln = BULAN_INDONESIA[wib.getMonth()];
  const displayBln = shortMonth ? bln.slice(0, 3) : bln;
  const thn = wib.getFullYear();
  return `${tgl} ${displayBln} ${thn}`;
}

/**
 * Format time in WIB: "14:35 WIB"
 */
export function formatIndonesianTime(dateInput: Date | string): string {
  const wib = toWIBDate(dateInput);
  const jam = String(wib.getHours()).padStart(2, '0');
  const menit = String(wib.getMinutes()).padStart(2, '0');
  return `${jam}:${menit} WIB`;
}

/**
 * Get Current Month String: YYYY-MM
 */
export function getCurrentMonthKey(): string {
  const wib = getNowWIB();
  const year = wib.getFullYear();
  const month = String(wib.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get Current Month Name: e.g. "Oktober 2026"
 */
export function getCurrentMonthWIBName(): string {
  const wib = getNowWIB();
  const bln = BULAN_INDONESIA[wib.getMonth()];
  const thn = wib.getFullYear();
  return `${bln} ${thn}`;
}

/**
 * Get Today's Date Range in ISO string for Supabase queries
 */
export function getTodayWIBRange(): { startISO: string; endISO: string; dateHeader: string } {
  const wib = getNowWIB();
  const y = wib.getFullYear();
  const m = String(wib.getMonth() + 1).padStart(2, '0');
  const d = String(wib.getDate()).padStart(2, '0');

  const hari = HARI_INDONESIA[wib.getDay()];
  const bln = BULAN_INDONESIA[wib.getMonth()];
  const dateHeader = `${hari}, ${wib.getDate()} ${bln} ${y}`;

  // Asia/Jakarta is UTC+7
  const startISO = `${y}-${m}-${d}T00:00:00+07:00`;
  const endISO = `${y}-${m}-${d}T23:59:59+07:00`;

  return { startISO, endISO, dateHeader };
}

/**
 * Get 7 Days Ago ISO timestamp
 */
export function getSevenDaysAgoWIBISO(): string {
  const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

/**
 * Get 14 Days Ago ISO timestamp
 */
export function getFourteenDaysAgoWIBISO(): string {
  const d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

