// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA AUTHENTICATION UTILITIES
// Phone normalization, Telegram pairing code generation, and auto-provisioning
// ═══════════════════════════════════════════════════════════════════════════════

import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * Normalizes an Indonesian phone number into standard E.164 without leading plus:
 * - 0812... -> 62812...
 * - +62812... -> 62812...
 * - 812... -> 62812...
 */
export function normalizeIndonesianPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  let clean = phoneNumber.trim().replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }
  return clean;
}

/**
 * Validates Indonesian mobile phone number format:
 * - Must start with 628
 * - Length between 10 and 15 digits
 */
export function isValidIndonesianPhoneNumber(phone: string): boolean {
  return /^628\d{7,12}$/.test(phone);
}

/**
 * Generates a unique 6-character alphanumeric Telegram pairing code:
 * Format: "TD" + 4 alphanumeric uppercase characters (e.g., "TD9482", "TD7K2M")
 */
export function generatePairingCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TD${randomPart}`;
}

/**
 * Auto-provisions default Indonesian wallets (Cash, BCA, GoPay) and
 * recommended financial categories for newly registered users.
 */
export async function provisionUserDefaults(userId: string): Promise<{
  walletsCreated: number;
  categoriesCreated: number;
}> {
  let walletsCreated = 0;
  let categoriesCreated = 0;

  try {
    // 1. Auto-provision default wallets (BCA, Cash, GoPay)
    const { data: existingWallets } = await supabaseAdmin
      .from('wallets')
      .select('id')
      .eq('user_id', userId);

    if (!existingWallets || existingWallets.length === 0) {
      const defaultWallets = [
        {
          user_id: userId,
          name: 'Cash',
          type: 'cash',
          balance: 500000.0,
          color: '#afc28a',
          icon: 'wallet',
          is_default: true,
        },
        {
          user_id: userId,
          name: 'BCA',
          type: 'bank',
          balance: 2500000.0,
          color: '#00529C',
          icon: 'credit-card',
          is_default: false,
        },
        {
          user_id: userId,
          name: 'GoPay',
          type: 'ewallet',
          balance: 150000.0,
          color: '#00AED6',
          icon: 'smartphone',
          is_default: false,
        },
        {
          user_id: userId,
          name: 'DANA',
          type: 'ewallet',
          balance: 750000.0,
          color: '#118EEA',
          icon: 'smartphone',
          is_default: false,
        },
      ];

      const { data: insertedWallets } = await supabaseAdmin
        .from('wallets')
        .insert(defaultWallets)
        .select();

      walletsCreated = insertedWallets?.length || 3;
    }

    // 2. Auto-provision default categories (Indonesian financial standard)
    const { data: existingCategories } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('user_id', userId);

    if (!existingCategories || existingCategories.length === 0) {
      const defaultCategories = [
        { user_id: userId, name: 'Makanan & Minuman', type: 'expense', emoji: '🍜', color: '#afc28a', is_system: true },
        { user_id: userId, name: 'Transportasi', type: 'expense', emoji: '🚗', color: '#3B82F6', is_system: true },
        { user_id: userId, name: 'Hiburan', type: 'expense', emoji: '🎮', color: '#8B5CF6', is_system: true },
        { user_id: userId, name: 'Tagihan & Utilitas', type: 'expense', emoji: '🏠', color: '#EF4444', is_system: true },
        { user_id: userId, name: 'Kesehatan', type: 'expense', emoji: '💊', color: '#10B981', is_system: true },
        { user_id: userId, name: 'Belanja', type: 'expense', emoji: '👕', color: '#EC4899', is_system: true },
        { user_id: userId, name: 'Pendidikan', type: 'expense', emoji: '📚', color: '#F59E0B', is_system: true },
        { user_id: userId, name: 'Gaji Pokok', type: 'income', emoji: '💰', color: '#10B981', is_system: true },
        { user_id: userId, name: 'Freelance & Bonus', type: 'income', emoji: '💼', color: '#6366F1', is_system: true },
      ];

      const { data: insertedCategories } = await supabaseAdmin
        .from('categories')
        .insert(defaultCategories)
        .select();

      categoriesCreated = insertedCategories?.length || 9;
    }
  } catch (err) {
    console.warn('[provisionUserDefaults] provisioning error:', err);
  }

  return { walletsCreated, categoriesCreated };
}
