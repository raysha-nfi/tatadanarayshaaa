# Worker 1 (M1: Database Schema & Supabase Auth) Changes Log

## Overview
Worker 1 implemented database schema alignment migration `004_align_r1_schema.sql` and enhanced the Supabase authentication API routes in `src/app/api/auth/*` to fulfill all requirements defined in `ORIGINAL_REQUEST.md` (R1) and `PROJECT.md` (Milestone 1).

---

## 1. Database Schema Alignment (`supabase/migrations/004_align_r1_schema.sql`)

### 1.1 `profiles` Table
- Added `subscription_status` with allowed values `('active', 'past_due', 'canceled', 'trialing', 'trial', 'expired')` and default `'trialing'`.
- Added `pairing_code` (TEXT) for temporary 6-8 digit `/start <pairing_code>` deep-link pairing.
- Added `pairing_code_expires_at` (TIMESTAMPTZ) for pairing code TTL tracking.
- Added `shared_bot_linked` (BOOLEAN DEFAULT FALSE) to indicate pairing with the official shared bot.
- Created indexes on `pairing_code` and `phone_number` for fast webhook lookup.

### 1.2 `wallets` Table
- Added `type VARCHAR(20) DEFAULT 'cash' CHECK (type IN ('cash', 'bank', 'ewallet'))`.
- Backfilled types for existing wallets based on wallet names (e.g. BCA -> bank, GoPay -> ewallet).

### 1.3 `transactions` Table
- Updated `source` check constraint to support `'telegram_photo'` in addition to existing options (`'web'`, `'telegram_text'`, `'telegram_receipt'`, `'telegram_voice'`).
- Added `items JSONB DEFAULT '[]'::jsonb` to hold multi-item product details for receipts directly on the parent transaction.
- Added `date_time TIMESTAMPTZ` alias populated from `transaction_time` for query standardization.

### 1.4 `budgets` Table
- Added `month_year TEXT` column synchronized from `month` for flexible period queries.

### 1.5 Trigger: `handle_transaction_wallet_balance()`
- Updated function and trigger definition to handle `TG_OP = 'UPDATE'` in addition to `INSERT` and `DELETE`.
- Implemented a two-step reversal and application model that cleanly computes deltas (`NEW.amount - OLD.amount` for income/expense, and bidirectional updates for transfers).
- Trigger now fires `AFTER INSERT OR UPDATE OR DELETE ON public.transactions`.

### 1.6 Auth Registration Trigger & Stored Procedure
- Created `handle_new_user_onboarding()` trigger on `auth.users` (`AFTER INSERT`).
- Automatically provisions:
  - User profile in `profiles` with default plan `'starter'`, status `'trialing'`.
  - Default wallets: **Cash** (Rp500.000, type `'cash'`, default), **BCA** (Rp2.500.000, type `'bank'`), **GoPay** (Rp150.000, type `'ewallet'`).
  - 9 standard Indonesian financial categories: Makanan & Minuman, Transportasi, Hiburan, Tagihan & Utilitas, Kesehatan, Belanja, Pendidikan, Gaji Pokok, Freelance & Bonus.
- Created reusable stored procedure `provision_user_defaults(p_user_id, p_full_name)` for manual and programmatic provisioning.

### 1.7 Compatibility Views
- Created `public.exports_history` view mapping to `public.export_history`.
- Created `public.ai_call_logs` view mapping to `public.ai_logs`.
- Created `public.admin_audit_logs` view mapping to `public.audit_logs`.

---

## 2. Supabase Auth API Routes (`src/app/api/auth/*`)

### 2.1 `src/app/api/auth/utils.ts` (New Helper Module)
- `normalizeIndonesianPhoneNumber`: Normalizes 0812... or +62812... or 812... into standard E.164 without leading plus (`62812...`).
- `isValidIndonesianPhoneNumber`: Validates standard Indonesian mobile numbers.
- `generatePairingCode`: Generates 6-character alphanumeric code (e.g. `TD9482`).
- `provisionUserDefaults`: Programmatic fallback to provision default wallets and categories when users register or verify OTP via web application routes.

### 2.2 `src/app/api/auth/send-otp/route.ts`
- Validates and normalizes phone numbers.
- Generates 6-digit random OTP with 5-minute TTL.
- Stores record in `phone_verifications`.
- Returns `{ success: true, phoneNumber, message, expiresInSeconds: 300, devOtp }` for dev/test verification.

### 2.3 `src/app/api/auth/verify-otp/route.ts`
- Validates OTP code against `phone_verifications`.
- Marks verification record as `is_verified = true`.
- Resolves or creates user profile in `profiles`.
- Sets `phone_verified = true`, `phone_number = cleanPhone`.
- Generates unique Telegram `pairing_code` with 24-hour TTL.
- Auto-provisions default wallets (`Cash`, `BCA`, `GoPay` with typed categories) and default categories.
- Returns verified profile, `pairingCode`, and `telegramUrl` (`https://t.me/TataDanaBot?start=...`).

### 2.4 `src/app/api/auth/pairing-code/route.ts` (New Dedicated Route)
- Provides POST endpoint to refresh or generate new pairing code for a user.
- Provides GET endpoint to retrieve active pairing code or generate one on demand.
- Updates `profiles.pairing_code` and `profiles.pairing_code_expires_at`.
