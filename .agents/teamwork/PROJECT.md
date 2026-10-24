# Project: TataDana SaaS Personal Finance Platform

## Architecture
TataDana is an Indonesian SaaS personal finance management platform built with Next.js App Router (TypeScript, Tailwind CSS), Supabase (PostgreSQL, Auth, Storage, Realtime), Telegram Bot API, Multi-Provider AI (Google Gemini, OpenAI, DeepSeek), and Midtrans payment gateway.

### Data Flow & Module Boundaries
1. **R1 (Database & Auth)**: Supabase PostgreSQL schema with 14 tables, RLS policies, realtime publication, and automated onboarding triggers for default wallets (BCA, Cash, GoPay) and Indonesian category taxonomies.
2. **R2 (Telegram Bot Engine)**: Webhook handler `/api/telegram/webhook` with strict `update_id` idempotency, dual bot mode (Shared Official Bot vs Custom BYO BotToken), Indonesian NLP parser with multiplier resolution ("rb", "jt", "k"), Gemini Multimodal Voice STT, Vision Receipt OCR, and WIB-formatted nota replies with 10-block visual progress bars (`█` and `░`).
3. **R3 (In-App Reporting & Multi-Format Export)**: Interactive reporting interface at `/dashboard/reports` (and `/dashboard/laporan`) with multi-dimension filters, expandable multi-item receipt accordions, Net Cashflow KPIs, Supabase Realtime subscriptions, and on-demand PDF (`jspdf/pdfkit`) and Excel (`xlsx`) exports with 7-day signed URLs.
4. **R4 (Premium User Dashboard & Landing Page)**: Root application shell (`layout.tsx`, `page.tsx`, `globals.css`), Dual-Theme engine (Fintech Orange #FF6B00 / White Light Mode + Dark Slate Dark Mode), In-App Telegram Bot Simulator (`/dashboard/simulator`) for zero-tunnel local testing, 4 stats cards, 3 charts, and 5 settings tabs.
5. **R5 (Superadmin Portal & AI Failover)**: Superadmin dashboard (`/admin`) with User Impersonation, Multi-Provider AI key management and failover mode toggle (`single` vs `parallel_failover`), AI call latency/token monitoring, Midtrans & manual payment verification, and mandatory privacy audit logging.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Database Schema Alignment | 14 tables with RLS, triggers, indexes, and timezone WIB | M1 (R1) | ORIGINAL_REQUEST §R1 |
| 2 | Auth Onboarding Trigger | Auto-create default wallets (BCA, Cash, GoPay) and categories | M1 (R1) | ORIGINAL_REQUEST §R1 |
| 3 | Supabase Auth Integration | Email, OAuth, and Phone OTP verification | M1 (R1) | ORIGINAL_REQUEST §R1 |
| 4 | Webhook Idempotency | Deduplication of incoming updates via `processed_telegram_updates` | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 5 | Dual Telegram Bot Mode | Shared bot pairing via code/phone + BYO Custom BotToken | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 6 | Indonesian NLP Parser | Parse "15rb", "8jt", "100k", category, and notes into structured JSON | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 7 | Voice Note Audio STT | Transcription of .oga/.ogg voice notes via Gemini / Whisper | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 8 | Receipt Photo OCR | Multi-item receipt extraction (merchant, total, items breakdown) | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 9 | Bot Commands Suite | `/saldo`, `/hari_ini`, `/minggu_ini`, `/bulan_ini`, `/budget`, `/bantuan` | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 10 | Visual Nota Reply & Progress Bar | 10-block progress bar (`█` and `░`) with 80% & 100% budget alerts | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 11 | Proactive AI Advisor | Spikes (>50%) and high expense ratio financial alerts | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 12 | Starter Plan Limit | Max 50 tx/month and polite Pro upgrade CTA for OCR | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 13 | Interactive Reports View | `/dashboard/reports` with date, wallet, category, search filters | M3 (R3) | ORIGINAL_REQUEST §R3 |
| 14 | Expandable Receipt Accordion | Parent transaction with expandable child item breakdown | M3 (R3) | ORIGINAL_REQUEST §R3 |
| 15 | Net Cashflow KPI | Total Income, Total Expense, Net Cashflow, Top 5 Categories | M3 (R3) | ORIGINAL_REQUEST §R3 |
| 16 | Supabase Realtime Sync | Live websocket updates on report & transaction views | M3 (R3) | ORIGINAL_REQUEST §R3 |
| 17 | On-Demand Excel Export | Multi-column workbook with formatted rupiah numbers | M3 (R3) | ORIGINAL_REQUEST §R3 |
| 18 | On-Demand PDF Export | Branded PDF financial report with cashflow breakdown | M3 (R3) | ORIGINAL_REQUEST §R3 |
| 19 | Storage Signed URLs | Private Supabase bucket `tatadana-exports` with 7-day auto-expiring links | M3 (R3) | ORIGINAL_REQUEST §R3 |
| 20 | Next.js App Shell | `layout.tsx`, `page.tsx`, `globals.css` with font and metadata | M4 (R4) | ORIGINAL_REQUEST §R4 |
| 21 | Dual-Theme Engine | Orange-white Light mode + dark slate Dark mode toggle | M4 (R4) | ORIGINAL_REQUEST §R4 |
| 22 | 4 Stats Cards & Charts | Overview KPI cards, 6-Month Bar, Category Donut, Trend Line | M4 (R4) | ORIGINAL_REQUEST §R4 |
| 23 | In-App Bot Simulator | `/dashboard/simulator` testing text, photo OCR, and voice audio | M4 (R4) | ORIGINAL_REQUEST §R4 |
| 24 | Dashboard Settings Tabs | Profil, Telegram Bot, Reminder, Kategori, Budget | M4 (R4) | ORIGINAL_REQUEST §R4 |
| 25 | Conversion Landing Page | Sticky Navbar, Problem-Solution, Demo, Features, Pricing, FAQ, Footer | M4 (R4) | ORIGINAL_REQUEST §R4 |
| 26 | Superadmin Portal Shell | `/admin` interface with role validation and summary stats | M5 (R5) | ORIGINAL_REQUEST §R5 |
| 27 | Seamless Impersonation | Admin switch into user context with persistent banner & audit log | M5 (R5) | ORIGINAL_REQUEST §R5 |
| 28 | AI Provider & Mode Toggle | Gemini, OpenAI, DeepSeek keys, priority, single vs parallel failover | M5 (R5) | ORIGINAL_REQUEST §R5 |
| 29 | AI Call Logs Monitoring | Transparent prompt token, completion token, latency, and error logs | M5 (R5) | ORIGINAL_REQUEST §R5 |
| 30 | User Management & Upgrades | User list, plan upgrade/downgrade, telegram connection status | M5 (R5) | ORIGINAL_REQUEST §R5 |
| 31 | Payment Verification Panel | Midtrans webhook handler & manual transfer proof approval | M5 (R5) | ORIGINAL_REQUEST §R5 |
| 32 | Privacy Audit Logging | Enforce reason requirement before viewing user transaction data | M5 (R5) | ORIGINAL_REQUEST §R5 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | R1: Database & Auth | Supabase migrations (`004_align_r1_schema.sql`), triggers, auth OTP | none | DONE |
| M2 | R2: Telegram Bot Engine | `/api/telegram/webhook`, `/hari_ini`, `/minggu_ini`, `/bulan_ini`, STT/OCR, limits | M1 (Contracts defined) | DONE |
| M3 | R3: In-App Reporting & Export | `/dashboard/reports`, `/dashboard/laporan`, accordion, PDF/Excel, signed URLs | M1 (Contracts defined) | DONE |
| M4 | R4: Dashboard & Landing | `layout.tsx`, `page.tsx`, `globals.css`, `/dashboard/simulator`, settings, dual theme | M1 (Contracts defined) | DONE |
| M5 | R5: Superadmin & AI Failover | `/admin` portal, impersonation, AI providers/logs, payment verification | M1 (Contracts misc) | DONE |
| M6 | Test Infrastructure & E2E Gate | Test runner (`dist-test/runner.js`), unit tests, E2E acceptance validation | M1-M5 | DONE |

---

## Code Layout & File Boundaries
To guarantee conflict-free concurrent execution across all 5 workers:
- **Worker 1 (M1 / R1)** owns:
  - `supabase/migrations/004_align_r1_schema.sql`
  - `src/app/api/auth/`
- **Worker 2 (M2 / R2)** owns:
  - `src/lib/telegram/`
  - `src/app/api/telegram/`
- **Worker 3 (M3 / R3)** owns:
  - `src/app/dashboard/reports/`
  - `src/app/dashboard/laporan/`
  - `src/app/api/export/`
- **Worker 4 (M4 / R4)** owns:
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  - `src/app/globals.css`
  - `tailwind.config.js`
  - `src/app/dashboard/simulator/`
  - `src/app/dashboard/settings/`
  - `src/app/dashboard/budget/`
  - `src/app/dashboard/wallet/`
- **Worker 5 (M5 / R5)** owns:
  - `src/app/admin/`
- **Test Writer (M6)** owns:
  - `tests/`
  - `dist-test/`

---

## Interface Contracts
All shared TypeScript interfaces are consolidated in `src/types/index.ts`:
- `UserProfile`: `id`, `full_name`, `phone_number`, `plan` ('starter'|'pro'), `subscription_status`, `role` ('user'|'admin'), `telegram_connected`, `telegram_bot_token`.
- `Transaction`: `id`, `user_id`, `wallet_id`, `category_id`, `type` ('income'|'expense'|'transfer'), `amount`, `date_time`, `note`, `source`, `receipt_items`.
- `ParsedTransactionResult`: `{ jenis, nominal, kategori, catatan, wallet_source, wallet_target, confidence, is_multi_item, items }`.
- `ExportHistory`: `id`, `user_id`, `format`, `file_name`, `signed_url`, `expires_at`.
- `AIProvider`: `id`, `name`, `display_name`, `is_active`, `priority`, `model`.
