// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA CURRENCY PARSER & FORMATTER (INDONESIAN RUPIAH)
// Parsing nominal Indonesia: "15rb"/"15ribu" = 15000, "1.5jt"/"1,5jt" = 1500000,
// "500k" = 500000, "2m" = 2000000000, serta format "Rp"
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format number to standard Indonesian Rupiah (e.g. "Rp 15.000")
 */
export function formatRupiah(amount: number | string, withPrefix: boolean = true): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return withPrefix ? `Rp${formatted}` : formatted;
}

export const formatCurrency = formatRupiah;

/**
 * Format number to compact readable string (e.g. "Rp 1,5 Jt", "Rp 500 Rb")
 */
export function formatCompactRupiah(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    const val = (amount / 1_000_000_000).toFixed(1).replace('.0', '').replace('.', ',');
    return `Rp${val} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',');
    return `Rp${val} Jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    const val = (amount / 1_000).toFixed(0);
    return `Rp${val} Rb`;
  }
  return formatRupiah(amount);
}

/**
 * Indonesian number words dictionary for parsing conversational numbers
 */
function parseIndonesianWords(text: string): number | null {
  const words = text.toLowerCase();

  // Common quick phrase matches - LONGEST & MOST SPECIFIC FIRST
  if (/\b(?:sepuluh\s*juta)\b/.test(words)) return 10000000;
  if (/\b(?:lima\s*juta)\b/.test(words)) return 5000000;
  if (/\b(?:tiga\s*juta)\b/.test(words)) return 3000000;
  if (/\b(?:dua\s*juta)\b/.test(words)) return 2000000;
  if (/\b(?:sejuta|satu\s*juta)\b/.test(words)) return 1000000;
  if (/\b(?:setengah|1\/2)\s*(?:jt|juta)\b/.test(words)) return 500000;

  if (/\b(?:dua\s*ratus\s*lima\s*puluh\s*ribu)\b/.test(words)) return 250000;
  if (/\b(?:lima\s*ratus\s*ribu)\b/.test(words)) return 500000;
  if (/\b(?:dua\s*ratus\s*ribu)\b/.test(words)) return 200000;
  if (/\b(?:seratus\s*ribu)\b/.test(words)) return 100000;
  if (/\b(?:tujuh\s*puluh\s*lima\s*ribu)\b/.test(words)) return 75000;
  if (/\b(?:lima\s*puluh\s*ribu)\b/.test(words)) return 50000;
  if (/\b(?:tiga\s*puluh\s*ribu)\b/.test(words)) return 30000;
  if (/\b(?:dua\s*puluh\s*lima\s*ribu)\b/.test(words)) return 25000;
  if (/\b(?:dua\s*puluh\s*ribu)\b/.test(words)) return 20000;
  if (/\b(?:lima\s*belas\s*ribu)\b/.test(words)) return 15000;
  if (/\b(?:sepuluh\s*ribu)\b/.test(words)) return 10000;
  if (/\b(?:lima\s*ribu)\b/.test(words)) return 5000;
  if (/\b(?:dua\s*ribu)\b/.test(words)) return 2000;
  if (/\b(?:seribu|satu\s*ribu)\b/.test(words)) return 1000;

  return null;
}

/**
 * Parse Indonesian natural string containing nominal into numeric value.
 * Handles: "15rb", "15ribu", "15k", "1.5jt", "1,5jt", "1.5 juta", "500k", "200.000", "Rp 250rb", etc.
 */
export function parseIndonesianCurrency(text: string): number | null {
  if (!text || typeof text !== 'string') return null;

  const cleaned = text.trim().toLowerCase();

  // Pattern 1: Number with Indonesian multipliers (jt, juta, rb, ribu, k, m, miliar)
  // Supports comma or dot decimal: 1.5jt or 1,5jt
  const multiplierRegex = /(\d+(?:[.,]\d+)?)\s*(jt|juta|mio|m|miliar|rb|ribu|k)\b/i;
  const match = cleaned.match(multiplierRegex);

  if (match) {
    const rawNumStr = match[1].replace(',', '.');
    const baseNum = parseFloat(rawNumStr);
    const unit = match[2].toLowerCase();

    if (!isNaN(baseNum) && baseNum > 0) {
      if (unit === 'jt' || unit === 'juta' || unit === 'mio') {
        return Math.round(baseNum * 1_000_000);
      }
      if (unit === 'm' || unit === 'miliar') {
        return Math.round(baseNum * 1_000_000_000);
      }
      if (unit === 'rb' || unit === 'ribu' || unit === 'k') {
        return Math.round(baseNum * 1_000);
      }
    }
  }

  // Pattern 2: Explicit "Rp" / "IDR" prefix (e.g. "Rp 250.000", "rp.15000", "idr 50000")
  const explicitRpRegex = /(?:rp\.?|idr)\s*(\d{1,3}(?:\.\d{3})+|\d+)/i;
  const rpMatch = cleaned.match(explicitRpRegex);
  if (rpMatch) {
    const digitsOnly = rpMatch[1].replace(/\./g, '');
    const num = parseInt(digitsOnly, 10);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }

  // Pattern 3: Formatted numbers with dots as thousand separators (e.g. "250.000", "1.500.000")
  const dottedRegex = /\b(\d{1,3}(?:\.\d{3})+)\b/;
  const dottedMatch = cleaned.match(dottedRegex);
  if (dottedMatch) {
    const digitsOnly = dottedMatch[1].replace(/\./g, '');
    const num = parseInt(digitsOnly, 10);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }

  // Pattern 4: Indonesian conversational number words (e.g. "dua puluh lima ribu")
  const wordResult = parseIndonesianWords(cleaned);
  if (wordResult !== null) {
    return wordResult;
  }

  // Pattern 5: Plain digit numbers in text
  // Disambiguate quantity vs nominal: If sentence has multiple numbers (e.g. "beli 2 kopi 25000"),
  // pick the realistic nominal (>= 500) rather than a single-digit item quantity like 2.
  const allNumbers = cleaned.match(/\b\d+\b/g);
  if (allNumbers && allNumbers.length > 0) {
    // If multiple numbers, filter for values >= 100 (Indonesian nominals)
    const candidates = allNumbers.map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n > 0);
    const nominals = candidates.filter(n => n >= 100);
    if (nominals.length > 0) {
      return nominals[nominals.length - 1]; // Pick the last nominal amount
    }

    // Only return small number if explicitly alone in input (e.g. "250000" or "50")
    if (candidates.length === 1 && candidates[0] >= 50) {
      return candidates[0];
    }
  }

  return null;
}

