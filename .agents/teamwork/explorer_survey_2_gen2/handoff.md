# HANDOFF REPORT: Backend & Telegram Bot Specification (R1 & R2)

**Agent:** Explorer 2 Replacement (`explorer_survey_2_gen2`)  
**Working Directory:** `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_survey_2_gen2`  
**Target Recipient:** Orchestrator (`ef6f25b3-9341-4ca3-bfb2-c41ffac42ee7`)  
**Associated Artifact:** `survey_backend_bot.md`  
**Date:** 2026-10-10  

---

## 1. Observation

1. **Database Schema & Migrations:**
   * Existing SQL migration files:
     - `supabase/migrations/001_initial_schema.sql` (241 lines)
     - `supabase/migrations/002_rls_and_policies.sql` (146 lines)
     - `supabase/migrations/003_seed_data.sql` (35 lines)
   * In `001_initial_schema.sql`:
     - Line 11-25: `profiles` table has `id`, `full_name`, `phone_number`, `phone_verified`, `avatar_url`, `currency`, `plan`, `role`, `telegram_chat_id`, `telegram_bot_token`, `telegram_connected`. Notice `subscription_status`, `shared_bot_linked`, and `pairing_code` are currently missing from the DDL.
     - Line 28-38: `wallets` table has `id`, `user_id`, `name`, `balance`, `color`, `icon`, `is_default`. The required column `type` (`cash`, `bank`, `ewallet`) per `ORIGINAL_REQUEST.md` is missing.
     - Line 71-86: `transactions` table has `source` check constraint `('web', 'telegram_text', 'telegram_receipt', 'telegram_voice')`. `ORIGINAL_REQUEST.md` uses `'telegram_photo'`. Also, `transactions` does not have `items JSONB` directly on the table, though a separate `receipt_items` table is defined at line 92-100.
     - Line 211-236: Function `handle_transaction_wallet_balance()` only checks `IF (TG_OP = 'INSERT')` and `ELSIF (TG_OP = 'DELETE')`. Any `UPDATE` to transactions will not adjust the wallet balances.
     - User onboarding trigger on `auth.users` is not yet defined in SQL migrations.

2. **Telegram Webhook & Bot Processing Pipeline:**
   * File: `src/lib/telegram/webhook-handler.ts` (521 lines):
     - Line 28-45: Idempotency check via table `processed_telegram_updates(update_id)` is implemented.
     - Line 100-168: Bot command dispatch only handles `/bantuan`, `/help`, `/saldo`, `/sheet`, `/budget`. Commands `/hari_ini`, `/minggu_ini`, and `/bulan_ini` specified in `ORIGINAL_REQUEST.md` are missing from the command branch.
     - Line 174-197: Voice note input checks duration `<= 60` seconds and calls `transcribeVoiceNote(audioObj.file_id)`.
     - Line 200-273: Receipt photo input checks `canUseReceiptPhoto(profile.plan)` and returns upgrade message if starter.
     - Line 280-295: Monthly transaction count is checked against `checkTransactionLimit(profile.plan, txCount)` (max 50 for starter).
   * File: `src/lib/telegram/bot.ts`:
     - Line 47-81: `testBotToken` calls `https://api.telegram.org/bot<TOKEN>/getMe`.
     - Line 87-106: `registerBotWebhook` calls `https://api.telegram.org/bot<TOKEN>/setWebhook`.
   * File: `src/lib/telegram/formatter.ts`:
     - Line 13-18: `generateProgressBar(percentage)` renders 10 blocks with `█` and `░`.
     - Line 46-66: Expense reply formats nota with timestamp, category, wallet, balance, and 80%/100% budget alerts.
   * File: `src/lib/date.ts`:
     - Line 15-28: `getNowWIB()` and `toWIBDate()` provide Asia/Jakarta UTC+7 conversion.

3. **AI Multi-Provider Dispatcher & Parsing:**
   * File: `src/lib/ai/dispatcher.ts` (379 lines):
     - Implements failover: `callGemini` -> `callOpenAI` -> `callDeepSeek` -> `parseTransactionRuleBased`.
     - Line 366: `transcribeVoiceNote` contains a fallback string `"beli kopi janji jiwa 24 ribu pakai gopay"`. Telegram binary audio downloading needs explicit wiring for live tokens.
     - Line 318-329: `parseReceiptImage` falls back to simulated Indomaret Point receipt when no API key is provided.
   * File: `src/lib/currency.ts`:
     - Line 39-79: `parseIndonesianCurrency` successfully parses `"15rb"`, `"15ribu"`, `"15k"`, `"1.5jt"`, `"1,5jt"`, `"500k"`, `"2m"`.

4. **In-App Simulator:**
   * Found `src/components/landing/InteractiveDemo.tsx` for landing page simulator.
   * Dedicated `/dashboard/simulator` page and interactive modal requested in `ORIGINAL_REQUEST.md` needs to be confirmed/specified for developer zero-tunnel testing.

---

## 2. Logic Chain

1. From Observation 1, the database schema already has an 80% foundation in `supabase/migrations/001_initial_schema.sql` and `002_rls_and_policies.sql`. However, specific columns (`profiles.subscription_status`, `profiles.pairing_code`, `profiles.shared_bot_linked`, `wallets.type`, `transactions.items JSONB`) and missing update triggers (`handle_transaction_wallet_balance` UPDATE handling) must be aligned in a clean migration (`004_align_r1_schema.sql`) to satisfy R1.
2. From Observation 1, onboarding currently relies on a client/API route call in `src/app/api/auth/verify-otp/route.ts`. A PostgreSQL trigger `AFTER INSERT ON auth.users` is necessary to guarantee seed wallets (BCA, Cash, GoPay) and default categories are created automatically regardless of authentication method (Email, Google, or OTP).
3. From Observation 2, `src/lib/telegram/webhook-handler.ts` correctly handles idempotency via `update_id` and formats nota replies with WIB timestamp and visual progress bars (█ and ░). However, the missing commands `/hari_ini`, `/minggu_ini`, and `/bulan_ini` must be added directly into `webhook-handler.ts` to fulfill R2 acceptance criteria.
4. From Observation 2 & 3, the hybrid bot architecture (Shared Bot vs BYO Token) is already supported via `testBotToken` and `registerBotWebhook`. The Voice Note STT and Receipt OCR pipelines are functionally structured, but require direct Telegram file buffer download helpers (`getFile` -> fetch binary) to avoid falling back to static strings.
5. All findings and detailed specifications have been synthesized and documented in `survey_backend_bot.md`.

---

## 3. Caveats

1. **Supabase Live Instance:** Local environment does not run a live Supabase Postgres daemon during survey; SQL migrations were inspected statically from files.
2. **Telegram API Secrets:** Production `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`, etc. are stored in `.env.example`; live external network calls to Telegram / Gemini rely on provided environment variables or safe local fallbacks during development.
3. No other caveats.

---

## 4. Conclusion

Requirements for R1 (Database Schema & Supabase Auth) and R2 (Telegram Bot Engine, Webhook API, NLP, Voice STT, Receipt OCR, Commands, and Limits) have been completely investigated and specified in `survey_backend_bot.md`. Clear actionable gap fixes have been mapped for Worker 1 (R1) and Worker 2 (R2), including schema alignment (`004_align_r1_schema.sql`), balance trigger update fix, auth onboarding trigger, missing bot commands (`/hari_ini`, `/minggu_ini`, `/bulan_ini`), and simulator integration.

---

## 5. Verification Method

To verify the investigation and artifacts:
1. **Inspect Documentation Artifacts:**
   * `view_file` on `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_survey_2_gen2\survey_backend_bot.md`
   * Confirm all 9 tables, fields, triggers, RLS policies, pairing flows, webhook idempotency, commands, and limits are detailed.
2. **Inspect Migration & Code Gaps:**
   * Check `supabase/migrations/001_initial_schema.sql` lines 211-236 (confirm UPDATE absence).
   * Check `src/lib/telegram/webhook-handler.ts` lines 100-168 (confirm absence of `/hari_ini`, `/minggu_ini`, `/bulan_ini`).
   * Check `src/lib/limits.ts` lines 7-28 (confirm Starter 50 tx/month limit and Pro features).
3. **Run TypeScript Build / Typecheck:**
   * In project directory: `npx tsc --noEmit` to confirm type contracts.
