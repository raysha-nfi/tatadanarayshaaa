// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA AI PARSER & NATURAL LANGUAGE ENGINE
// Menerjemahkan kalimat natural Indonesia ke format transaksi terstruktur
// ═══════════════════════════════════════════════════════════════════════════════

import { ParsedTransactionResult } from '@/types';
import { parseIndonesianCurrency } from '@/lib/currency';

// Keyword dictionary for category classification in Indonesian
const CATEGORY_MAP: Record<string, { category: string; type: 'income' | 'expense' }> = {
  // Makanan & Minuman
  bakso: { category: 'Makanan', type: 'expense' },
  mie: { category: 'Makanan', type: 'expense' },
  nasi: { category: 'Makanan', type: 'expense' },
  kopi: { category: 'Makanan', type: 'expense' },
  coffee: { category: 'Makanan', type: 'expense' },
  makan: { category: 'Makanan', type: 'expense' },
  minum: { category: 'Makanan', type: 'expense' },
  sarapan: { category: 'Makanan', type: 'expense' },
  lunch: { category: 'Makanan', type: 'expense' },
  dinner: { category: 'Makanan', type: 'expense' },
  snack: { category: 'Makanan', type: 'expense' },
  jajan: { category: 'Makanan', type: 'expense' },
  ayam: { category: 'Makanan', type: 'expense' },
  sate: { category: 'Makanan', type: 'expense' },
  burger: { category: 'Makanan', type: 'expense' },
  pizza: { category: 'Makanan', type: 'expense' },

  // Transportasi
  bensin: { category: 'Transport', type: 'expense' },
  pertalite: { category: 'Transport', type: 'expense' },
  pertamax: { category: 'Transport', type: 'expense' },
  solar: { category: 'Transport', type: 'expense' },
  parkir: { category: 'Transport', type: 'expense' },
  ojol: { category: 'Transport', type: 'expense' },
  gojek: { category: 'Transport', type: 'expense' },
  grab: { category: 'Transport', type: 'expense' },
  maxim: { category: 'Transport', type: 'expense' },
  toll: { category: 'Transport', type: 'expense' },
  tol: { category: 'Transport', type: 'expense' },
  angkot: { category: 'Transport', type: 'expense' },
  kereta: { category: 'Transport', type: 'expense' },
  krl: { category: 'Transport', type: 'expense' },
  mrt: { category: 'Transport', type: 'expense' },
  busway: { category: 'Transport', type: 'expense' },
  service: { category: 'Transport', type: 'expense' },
  cuci: { category: 'Transport', type: 'expense' },

  // Belanja
  belanja: { category: 'Belanja', type: 'expense' },
  baju: { category: 'Belanja', type: 'expense' },
  celana: { category: 'Belanja', type: 'expense' },
  sepatu: { category: 'Belanja', type: 'expense' },
  indomaret: { category: 'Belanja', type: 'expense' },
  alfamart: { category: 'Belanja', type: 'expense' },
  shopee: { category: 'Belanja', type: 'expense' },
  tokopedia: { category: 'Belanja', type: 'expense' },
  supermarket: { category: 'Belanja', type: 'expense' },
  sembako: { category: 'Belanja', type: 'expense' },
  sabun: { category: 'Belanja', type: 'expense' },

  // Tagihan
  listrik: { category: 'Tagihan', type: 'expense' },
  pln: { category: 'Tagihan', type: 'expense' },
  air: { category: 'Tagihan', type: 'expense' },
  pdam: { category: 'Tagihan', type: 'expense' },
  wifi: { category: 'Tagihan', type: 'expense' },
  indihome: { category: 'Tagihan', type: 'expense' },
  pulsa: { category: 'Tagihan', type: 'expense' },
  kuota: { category: 'Tagihan', type: 'expense' },
  sewa: { category: 'Tagihan', type: 'expense' },
  kos: { category: 'Tagihan', type: 'expense' },
  kontrakan: { category: 'Tagihan', type: 'expense' },
  bpjs: { category: 'Tagihan', type: 'expense' },
  netflix: { category: 'Tagihan', type: 'expense' },
  spotify: { category: 'Tagihan', type: 'expense' },

  // Kesehatan
  obat: { category: 'Kesehatan', type: 'expense' },
  apotek: { category: 'Kesehatan', type: 'expense' },
  dokter: { category: 'Kesehatan', type: 'expense' },
  rs: { category: 'Kesehatan', type: 'expense' },
  vitamin: { category: 'Kesehatan', type: 'expense' },

  // Hiburan
  nonton: { category: 'Hiburan', type: 'expense' },
  bioskop: { category: 'Hiburan', type: 'expense' },
  game: { category: 'Hiburan', type: 'expense' },
  steam: { category: 'Hiburan', type: 'expense' },
  topup: { category: 'Hiburan', type: 'expense' },
  liburan: { category: 'Hiburan', type: 'expense' },

  // Pemasukan
  gaji: { category: 'Gaji', type: 'income' },
  gajian: { category: 'Gaji', type: 'income' },
  salary: { category: 'Gaji', type: 'income' },
  bonus: { category: 'Bonus', type: 'income' },
  thr: { category: 'Bonus', type: 'income' },
  freelance: { category: 'Freelance', type: 'income' },
  project: { category: 'Freelance', type: 'income' },
  dividen: { category: 'Investasi', type: 'income' },
  cuan: { category: 'Investasi', type: 'income' },
  transferan: { category: 'Lainnya', type: 'income' },
};

/**
 * Deterministic rule-based parser as high-speed analyzer and backup validator
 */
export function parseTransactionRuleBased(text: string): ParsedTransactionResult | null {
  if (!text || text.trim().length === 0) return null;

  const input = text.trim();
  const lower = input.toLowerCase();

  // Check transfer pattern (e.g. "transfer bca ke gopay 100rb" or "tf mandiri ke dana 50k")
  const transferRegex = /(?:transfer|tf|pindah|kirim)\s+([a-zA-Z0-9]+)\s+(?:ke|to)\s+([a-zA-Z0-9]+)/i;
  const transferMatch = lower.match(transferRegex);
  if (transferMatch) {
    const amount = parseIndonesianCurrency(lower);
    if (amount) {
      return {
        jenis: 'transfer',
        nominal: amount,
        kategori: 'Transfer',
        wallet_asal: transferMatch[1].toUpperCase(),
        wallet_tujuan: transferMatch[2].toUpperCase(),
        catatan: input,
        confidence: 0.95,
      };
    }
  }

  // Parse Nominal
  const nominal = parseIndonesianCurrency(lower);
  if (!nominal || nominal <= 0) {
    return null; // Cannot parse without a valid nominal
  }

  // Detect Type (Pemasukan vs Pengeluaran)
  let jenis: 'pemasukan' | 'pengeluaran' = 'pengeluaran';
  let matchedCategory = 'Pengeluaran';

  const incomeTriggers = ['gaji', 'gajian', 'salary', 'bonus', 'thr', 'dapat uang', 'masuk', 'dapet uang', 'terima', 'freelance', 'cuan'];
  for (const trigger of incomeTriggers) {
    if (lower.includes(trigger)) {
      jenis = 'pemasukan';
      matchedCategory = 'Gaji';
      break;
    }
  }

  // Find Category from dictionary
  const words = lower.split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z0-9]/g, '');
    if (CATEGORY_MAP[cleanWord]) {
      const match = CATEGORY_MAP[cleanWord];
      matchedCategory = match.category;
      if (jenis !== 'pemasukan') {
        jenis = match.type === 'income' ? 'pemasukan' : 'pengeluaran';
      }
      break;
    }
  }

  if (jenis === 'pemasukan' && matchedCategory === 'Pengeluaran') {
    matchedCategory = 'Pemasukan';
  }

  return {
    jenis,
    nominal,
    kategori: matchedCategory,
    catatan: input,
    confidence: 0.9,
  };
}

/**
 * System prompt template for structured LLM parsing
 */
export const LLM_TRANSACTION_PARSER_PROMPT = `
Anda adalah asisten AI parser keuangan untuk aplikasi TataDana (Indonesia).
Tugas Anda adalah mengubah input pengguna (teks chat atau transkrip suara) menjadi JSON terstruktur yang valid.

Aturan Penting:
1. Jenis transaksi hanya boleh: "pemasukan", "pengeluaran", atau "transfer".
2. Parsing nominal harus tepat mengonversi format Indonesia:
   - "15rb" / "15ribu" / "15k" = 15000
   - "1.5jt" / "1,5jt" / "1.5 juta" = 1500000
   - "500k" = 500000
   - "2m" = 2000000000
3. Pilih kategori yang paling masuk akal:
   - Makanan (bakso, kopi, warteg, lunch, dinner)
   - Transport (bensin, ojol, tol, parkir, kereta)
   - Belanja (baju, skincare, indomaret, shopee)
   - Tagihan (listrik, wifi, pulsa, kos, netflix)
   - Kesehatan (obat, apotek, dokter)
   - Hiburan (nonton, game, karaoke)
   - Gaji / Bonus / Freelance (untuk pemasukan)
4. Jika kalimat ambigu atau tidak menyebut nominal sama sekali, kembalikan:
   { "error": "Nominal transaksi tidak ditemukan. Mohon sertakan nominal, contoh: 'beli bakso 15rb' atau 'gajian 5jt'." }
5. Format output WAJIB HANYA JSON tanpa markdown backtick:
{
  "jenis": "pengeluaran" | "pemasukan" | "transfer",
  "nominal": 15000,
  "kategori": "Makanan",
  "catatan": "beli bakso",
  "wallet_asal": "BCA",
  "wallet_tujuan": "GoPay"
}
`;
