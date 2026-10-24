## 2026-10-10T05:53:14Z
You are Worker 1 (M1: Database Schema & Supabase Auth).
Your working directory is C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_r1.
Project root is C:\Users\lenovo\.gemini\antigravity\scratch\tatadana.
Authoritative user request: C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md.
Project scope document: C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\PROJECT.md.
Reference survey: C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_survey_2_gen2\survey_backend_bot.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You EXCLUSIVELY own:
- supabase/migrations/004_align_r1_schema.sql
- src/app/api/auth/*
Do NOT write to files owned by other workers.

Tasks:
1. Read ORIGINAL_REQUEST.md and PROJECT.md.
2. Implement C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\supabase\migrations\004_align_r1_schema.sql:
   - Ensure `profiles` has `subscription_status` ('active', 'past_due', 'canceled', 'trialing'), `pairing_code` (TEXT), `shared_bot_linked` (BOOLEAN DEFAULT false).
   - Ensure `wallets` has `type` VARCHAR(20) DEFAULT 'cash' CHECK (type IN ('cash', 'bank', 'ewallet')).
   - Ensure `transactions` has `source` supporting 'telegram_photo' (in addition to existing options) and `items` JSONB DEFAULT '[]'::jsonb.
   - Update `handle_transaction_wallet_balance()` to handle UPDATE operations (adjust balance based on delta: NEW.amount - OLD.amount).
   - Create trigger on `auth.users` to auto-provision default wallets (BCA, Cash, GoPay) and default categories upon registration.
3. Review and ensure `src/app/api/auth/send-otp/route.ts` and `src/app/api/auth/verify-otp/route.ts` handle phone OTP verification, Telegram pairing code generation, and auto-provisioning.
4. Document all changes in C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_r1\changes.md and produce a full handoff report in C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_r1\handoff.md.
5. Send a completion message back to the orchestrator.
