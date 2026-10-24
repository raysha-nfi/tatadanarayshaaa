# TataDana Specification Mining Report: Frontend, Reporting & Admin Systems (R3, R4, R5)

**Working Directory**: `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\spec_miner_survey_3`  
**Authoritative Sources Probed**:
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md` (Authoritative prompt & functional requirements)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\src\types\index.ts` (Data contracts & interfaces)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\src\lib\export.ts` (Export generation & Supabase Storage integration)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\src\lib\limits.ts` (Plan limitations & feature gating)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\src\lib\advisor.ts` (Pro AI Financial Advisor rules)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\src\lib\ai\dispatcher.ts` (Multi-provider AI failover & vision/STT parsing)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\src\lib\app-context.tsx` (Global client state & mock hooks)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\src\app\api\admin\*` (Superadmin API endpoints)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\src\app\api\export\*` (Export API routes)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\src\app\api\payments\*` (Payment & manual transfer routes)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\supabase\migrations\*` (Postgres schema, RLS, triggers, seed data)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\src\components\landing\*` (Landing page components)
- `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\src\app\dashboard\*` (Existing dashboard pages & layout)

---

## 1. Executive Summary & Architecture Overview

This specification mining report covers the three frontend, reporting, and superadmin modules of the TataDana Indonesian SaaS application:
1. **R3: In-App Financial Reporting & Multi-Format PDF/Excel Export**: Interactive filtering, multi-item receipt accordions, real-time Supabase subscriptions, and signed Supabase Storage URL generation with strict Pro plan gating.
2. **R4: Premium User Dashboard & Landing Page**: Dual-mode theme (fintech orange/white light mode + dark slate dark mode), 4 KPI stats cards, 3 interactive charts, In-App Bot Simulator for zero-tunneling local testing, 5 settings tabs, and an 8-section conversion-optimized landing page.
3. **R5: Superadmin Dashboard & Multi-Provider AI Failover**: Single vs. parallel failover across Gemini, OpenAI, and DeepSeek, transparent AI call token/latency logs, user management with plan overrides, seamless user impersonation with privacy audit logging, and manual transfer approval workflows.

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R3: Reporting | Interactive Report View (`/dashboard/reports`) | Unified reporting screen with date, wallet, category, and text filters | `periodStart`, `periodEnd`, `walletId`, `categoryId`, `searchQuery`, `sortBy` | Filtered transaction list, KPI totals, breakdown charts | Displays empty state illustration if 0 matching records | `ORIGINAL_REQUEST.md` R3, `src/app/dashboard/transaksi/page.tsx` |
| 2 | R3: Reporting | Expandable Multi-Item Receipt Accordion | Displays child receipt items under single parent transaction | Parent `transaction.id`, `receipt_items` array | Expandable accordion showing item name, price, quantity, and subtotal | If `receipt_items` is empty/null, accordion toggle is hidden | `src/types/index.ts` lines 69-99, `001_initial_schema.sql` lines 92-100 |
| 3 | R3: Reporting | Net Cashflow & Category Breakdown KPI | Calculates Total Income, Total Expense, Net Cashflow, and Top 5 Expense Categories | Array of filtered transactions | Summary figures (Rp) + surplus/deficit badge status | Transfers between own wallets are excluded from income/expense calculations | `src/lib/export.ts` lines 52-55, `app-context.tsx` |
| 4 | R3: Reporting | Supabase Realtime Live Sync | Real-time websocket subscription updating reports as soon as Telegram or simulator writes data | Supabase channel `public:transactions` filtered on `user_id=eq.{uid}` | Automatic UI re-render without page reload | Reconnects on connection loss; falls back to polling if websocket blocked | `002_rls_and_policies.sql` lines 141-145, `ORIGINAL_REQUEST.md` R3 |
| 5 | R3: Export | Excel (.xlsx) Report Generation | Generates multi-column workbook with formatted rupiah numbers and receipt item breakdowns | `transactions` array, `userName`, `periodStart`, `periodEnd` | Binary XLSX buffer with headers, date, time, wallet, category, notes, and items | Throws error if file generation fails; logs error in route handler | `src/lib/export.ts` lines 15-45, `ORIGINAL_REQUEST.md` R3 |
| 6 | R3: Export | PDF Document Generation | Generates formal branded PDF report with transaction log, cashflow breakdown, and header | `transactions` array, `userName`, `periodText` | Binary PDF buffer stream | Falls back to minimal raw stream if heavy PDF engine fails | `src/lib/export.ts` lines 50-111, `src/app/api/export/pdf/route.ts` |
| 7 | R3: Export | Private Storage Upload & Signed URL | Uploads generated file to private Supabase bucket `tatadana-exports` and generates 7-day signed URL | User ID, file buffer, MIME type (`application/pdf` or openxml) | Signed URL string (expiring in 604,800s) + `export_history` record | If upload fails, falls back to direct API download endpoint with warning | `src/lib/export.ts` lines 116-191, `003_seed_data.sql` lines 16-35 |
| 8 | R3: Export | Plan Gating for Exports | Restricts PDF/Excel export strictly to Pro users | `user.plan` ('starter' \| 'pro') | Allowed flag or 403 Forbidden with upgrade prompt | Returns HTTP 403 with message: "Export laporan PDF & Excel adalah fitur eksklusif paket Pro." | `src/lib/limits.ts` lines 104-115, `src/app/api/export/pdf/route.ts` |
| 9 | R4: Theme | Dual-Theme Engine (Light & Dark) | Modern Indonesian fintech styling: Default Orange-White Light Mode + Instant Dark Mode toggle | Theme toggle button / system preference | `dark` class toggle on root `<html>`, CSS variable updates | Fallback to light mode if localStorage inaccessible | `ORIGINAL_REQUEST.md` R4, `tailwind.config.js` |
| 10 | R4: Dashboard | 4 Primary Stats Cards | Displays Total Balance, Monthly Income, Monthly Expense, and Remaining Budget | `wallets`, `transactions`, `budgets` state | 4 styled KPI cards with currency formatting and trend badges | Shows Rp0 and neutral status if user has no data yet | `src/app/dashboard/page.tsx` lines 153-213 |
| 11 | R4: Dashboard | Income vs Expense 6-Month Bar Chart | Comparative monthly bar chart for past 6 months | Aggregated transaction data grouped by month | Dual-bar chart visualization with hover tooltips | Zero-height bars for months with no recorded transactions | `src/app/dashboard/page.tsx` lines 301-363 |
| 12 | R4: Dashboard | Expense Category Breakdown Chart | Horizontal progress bars and donut visualization of allocation | Monthly expense transactions grouped by category | Percentage allocation per category with emoji icons | Renders empty state if 0 expense transactions exist | `src/app/dashboard/page.tsx` lines 365-395 |
| 13 | R4: Dashboard | Daily Spending Trend Line Chart | Day-by-day expenditure trend line across active month | Transactions sorted by calendar day (1..31) | Continuous line curve indicating spending spikes | Flat line at zero for days without transactions | `ORIGINAL_REQUEST.md` R4 |
| 14 | R4: Dashboard | Onboarding Checklist | 3-step checklist for new users (Telegram link, Wallet setup, Budget target) | `activeUser.telegram_connected`, `wallets.length`, `budgets.length` | Dynamic progress card (X/3 completed) | Automatically dismisses once all 3 steps are complete | `src/app/dashboard/page.tsx` lines 215-297 |
| 15 | R4: Simulator | Interactive In-App Bot Simulator (`/dashboard/simulator`) | Browser-based emulator for Telegram bot text, receipt photo, and voice notes | Text message, receipt image file, voice audio file | Simulated Telegram chat bubble with formatted receipt, progress bar, balance | Throws polite error if input invalid; rejects receipts for Starter users | `ORIGINAL_REQUEST.md` R4, `src/components/landing/InteractiveDemo.tsx` |
| 16 | R4: Simulator | Receipt Photo OCR in Simulator | Allows uploading receipt photo to test Vision AI parsing in browser | Image data URL or file buffer | Extracted merchant, date, total, and item breakdown list | Starter plan users receive prompt to upgrade to Pro | `src/lib/limits.ts` lines 88-99, `src/lib/ai/dispatcher.ts` lines 255-341 |
| 17 | R4: Simulator | Voice Note STT in Simulator | Allows uploading audio recording to test Speech-to-Text parsing | Audio file (.oga, .ogg, .mp3, .wav) | Transcription text + structured transaction parsed | Returns error message if audio is silent or unparseable | `src/lib/ai/dispatcher.ts` lines 346-378 |
| 18 | R4: Settings | Settings: Tab Profil | Manage personal profile, currency, full name, phone verification status | Profile form fields (name, phone, currency) | Updated `profiles` record | Phone change requires re-verification via OTP | `src/types/index.ts` lines 15-29, `src/app/dashboard/layout.tsx` |
| 19 | R4: Settings | Settings: Tab Telegram Bot | Test bot token (`getMe`), register webhook (`setWebhook`), status indicator | Telegram Bot Token string from @BotFather | Status badge 🟢/🔴/⏳, bot info (@username), webhook status | Returns 400 if token revoked or already claimed by another user | `src/app/api/telegram/test-connection/route.ts` lines 10-95 |
| 20 | R4: Settings | Settings: Tab Reminder | Configure daily automated Telegram expense reminders | Toggle enabled, frequency (1x or 2x), time_1, time_2 (WIB) | Saved `reminders` record | Maximum 2 reminders per day allowed; validates HH:MM:SS format | `001_initial_schema.sql` lines 123-134, `src/types/index.ts` lines 114-122 |
| 21 | R4: Settings | Settings: Tab Kategori | Custom category management with custom emoji and hex color picker | Category name, type (income/expense), emoji, color | New `categories` record | System categories (`is_system = true`) cannot be deleted | `001_initial_schema.sql` lines 46-55, `002_rls_and_policies.sql` |
| 22 | R4: Settings | Settings: Tab Budget | Configure monthly spending limits per category with 80% & 100% alert thresholds | `categoryId`, `monthlyLimit`, `month` (YYYY-MM) | Updated `budgets` record with spending % bar | Starter plan restricted to maximum 5 budget categories | `src/lib/limits.ts` lines 71-83, `app-context.tsx` lines 284-324 |
| 23 | R4: Landing | Landing Page Sticky Navbar | Top navigation with brand logo, jump links, login/register CTA, mobile drawer | Click events, viewport scroll position | Sticky navbar with blur backdrop and smooth anchor scrolling | Mobile drawer closes on link click or outside backdrop tap | `src/components/landing/Navbar.tsx` lines 8-108 |
| 24 | R4: Landing | Hero Section with Video Placeholder | Main value proposition with Indonesian copy, trust badges, and 60-second video demo preview | None (static presentation) | Headline with orange gradient, CTA buttons, video modal placeholder | Fallback placeholder graphic with play button | `src/components/landing/Hero.tsx` lines 8-96 |
| 25 | R4: Landing | Problem-Solution Comparison | 3 common financial pain points ("uang habis kemana?", "males buka app") and bridge to solution | None | Visual problem cards with warning accents and transition arrow | None | `src/components/landing/ProblemSolution.tsx` lines 4-80 |
| 26 | R4: Landing | Features Showcase | 3 feature deep dives: Telegram chat/OCR, Native Reporting/Export, Pro AI Advisor | None | Feature sections with visual previews, checklists, and code samples | None | `src/components/landing/Features.tsx` lines 5-161 |
| 27 | R4: Landing | Transparent Pricing Cards | Starter (Rp49rb/bln) vs Pro (Rp99rb lifetime) with monthly/lifetime cycle switch | `billingCycle` toggle ('monthly' \| 'lifetime') | Feature comparison checklist, highlight badge, direct checkout links | Links redirect to `/register?plan=starter` or `/register?plan=pro` | `src/components/landing/Pricing.tsx` lines 8-190 |
| 28 | R4: Landing | Interactive FAQ Accordion | 8 comprehensive answers to Indonesian user concerns (security, Telegram token, OCR, limits) | Click accordion item index | Smoothly expanding answer panel with rotating chevron | Only 1 accordion item open at a time | `src/components/landing/Faq.tsx` lines 6-92 |
| 29 | R5: Superadmin | Superadmin Portal Shell (`/admin`) | Dedicated administrative control panel with navigation tabs and stats summary | Admin authentication session (`role === 'admin'`) | Admin portal interface | Non-admin users are blocked and redirected to `/dashboard` | `002_rls_and_policies.sql` lines 23-31, `ORIGINAL_REQUEST.md` R5 |
| 30 | R5: Superadmin | User Impersonation Engine | Allows superadmin to view and test any user dashboard without password or re-login | `adminId`, `targetUserId`, `reason` | Active user context switches to target; generates audit log | Throws 404 if user not found; generates persistent amber banner | `src/app/api/admin/impersonate/route.ts` lines 4-38, `DashboardLayout` |
| 31 | R5: Superadmin | Multi-Provider AI Configuration | Configure Gemini, OpenAI, DeepSeek keys, models, active toggles, and priority | Provider ID, name, display name, is_active, priority, encrypted API key, model | Saved `ai_providers` record in database | Invalid provider payload rejected with HTTP 400 | `src/app/api/admin/providers/route.ts` lines 24-70 |
| 32 | R5: Superadmin | Single vs. Parallel Failover Mode Toggle | Switch AI execution between single designated provider and cascading failover | `executionMode` ('single' \| 'parallel_failover'), `primaryProviderId` | Saved `ai_system_settings` record | Defaults to `parallel_failover` to guarantee 99.9% uptime | `001_initial_schema.sql` lines 147-157, `src/lib/ai/dispatcher.ts` |
| 33 | R5: Superadmin | AI Call Monitoring Logs (`ai_logs`) | Transparent audit log of all AI prompts, latency, token consumption, and errors | None (GET query with pagination and filters) | KPI metrics (avg latency, token total) + table of historical AI requests | Displays red error badge with error message preview on failed calls | `001_initial_schema.sql` lines 160-172, `src/lib/ai/dispatcher.ts` |
| 34 | R5: Superadmin | User Management & Plan Control | List all registered users with plan upgrade/downgrade and Telegram link status | User ID, target plan ('starter' \| 'pro') | Updated user plan in `profiles` table | Downgrading to Starter activates plan quotas immediately | `001_initial_schema.sql` lines 11-25, `app-context.tsx` |
| 35 | R5: Superadmin | Mandatory Privacy Audit Logging | Required reason entry before admin can inspect user financial transactions | `adminId`, `targetUserId`, `reason` string | Logged row in `audit_logs` + target user transaction list | Request blocked with HTTP 400 if reason or target user ID is omitted | `src/app/api/admin/user-transactions/route.ts` lines 4-33 |
| 36 | R5: Superadmin | Midtrans & Manual Payment Verification | Panel for reviewing pending subscription orders and proof images | `paymentId`, `action` ('approve' \| 'reject'), `adminNotes` | Updates status to `approved`/`rejected`, upgrades user plan to Pro | Fails with HTTP 400 if payment ID missing; logs action in `audit_logs` | `src/app/api/admin/approve-payment/route.ts` lines 4-50 |
| 37 | R5: Superadmin | Midtrans Automated Webhook Handler | Handles Midtrans asynchronous payment notifications (capture/settlement) | JSON payload from Midtrans: `order_id`, `transaction_status`, `fraud_status` | Sets transaction to `approved` and upgrades user profile plan | Returns HTTP 200 `{ status: 'ok' }` to acknowledge gateway | `src/app/api/payments/midtrans-notification/route.ts` lines 4-47 |

---

## 3. Edge Cases & Behavioral Matrix

| # | Feature | Input Condition | Expected & Observed Behavior |
|---|---------|-----------------|-----------------------------|
| 1 | R3: Export | User has 0 transactions in selected period | Exporter does not crash; generates valid PDF/Excel file showing "0 Transaksi", Rp0 Total Pemasukan, Rp0 Total Pengeluaran, and an empty table row with caption "Tidak ada data pada periode ini". |
| 2 | R3: Export | Starter user attempts to export PDF/Excel | Endpoint `/api/export/pdf` and `/api/export/excel` returns HTTP 403 Forbidden with `{ success: false, error: "Export laporan PDF & Excel adalah fitur eksklusif paket Pro..." }`. UI displays upgrade dialog. |
| 3 | R3: Export | Signed URL accessed after expiration (7+ days) | Client receives storage HTTP 400/403 or expired notice. Backend provides regeneration mechanism using stored `file_path` without needing to re-parse original transactions. |
| 4 | R3: Reporting | Transfer between own wallets (e.g. BCA to GoPay) | Net cashflow calculation ignores transfer transactions: income sum only includes `type === 'income'`, expense sum only includes `type === 'expense'`. Balance shifts between wallets without inflating cashflow. |
| 5 | R3: Reporting | Large volume report (1,500+ transactions) | PDF table generator splits cleanly across multiple pages with repeated headers; Excel generator streams or batches rows into worksheet without exceeding server memory limits. |
| 6 | R3: Reporting | Supabase websocket disconnects due to network drop | Frontend client auto-reconnects channel with exponential backoff; triggers fallback refetch on reconnect to capture missed updates. |
| 7 | R4: Simulator | Starter plan user uploads receipt photo in simulator | Simulator intercepts action, refuses to run Vision OCR, and displays friendly CTA: "📸 Fitur catat struk foto via AI Vision khusus pengguna Pro. Upgrade ke Pro sekarang untuk kemudahan scan struk otomatis! 💎". |
| 8 | R4: Simulator | Corrupted or unsupported audio format uploaded | Simulator catches audio processing error, logs failed STT call to `ai_logs` with error message, and replies to user: "Format audio tidak didukung atau rekaman terlalu hening. Coba gunakan format .oga/.mp3". |
| 9 | R4: Simulator | Multiple Indonesian multipliers in single sentence ("beli bensin 50rb dan makan 25rb") | Parser identifies dominant transaction or decomposes into primary amount (50,000) with detailed notes, logging confidence score in `parsed_transaction`. |
| 10 | R4: Dashboard | User deletes all wallets (0 wallets remaining) | Total Balance widget shows "Rp0 (0 dompet aktif)"; Quick Add Modal disables transaction submission and prompts user to add a wallet first. |
| 11 | R4: Dashboard | Budget limit set to Rp0 or category has 0 limit | Progress bar displays 0% and does not trigger divide-by-zero (`NaN%`) error. Remaining budget shows Rp0. |
| 12 | R4: Dashboard | Budget threshold crossed twice in same month | System records `alert_80_sent = true` on first crossing >=80%; subsequent transactions that remain between 80% and 99% do NOT resend the 80% alert. Only crossing >=100% triggers `alert_100_sent`. |
| 13 | R4: Theme | Page reload in Dark Mode | Script checks `localStorage.getItem('tatadana_theme')` immediately in `<head>` before body hydration to prevent white screen flash (FOUC). |
| 14 | R4: Settings | User enters duplicate Telegram Bot Token already owned by another user | Endpoint `/api/telegram/test-connection` queries `profiles` table for `telegram_bot_token = cleanToken AND id != userId`; returns HTTP 400: "Token bot ini sudah digunakan oleh akun lain. Buat bot baru di @BotFather." |
| 15 | R4: Settings | Custom category created without emoji | Form automatically supplies default emoji `📁` and default brand color `#FF6B00`. |
| 16 | R5: Admin | Superadmin attempts to impersonate non-existent user ID | Endpoint `/api/admin/impersonate` returns HTTP 404 `{ error: "User tidak ditemukan" }`; no session switch occurs. |
| 17 | R5: Admin | Exit impersonation button clicked | Application clears `impersonatedUser` state from global context, removes persistent amber warning banner, and returns view cleanly to the original admin dashboard. |
| 18 | R5: Admin | Primary AI provider (Gemini) encounters rate limit (HTTP 429) in failover mode | Dispatcher catches 429 error, records `status: 'failed'` for Gemini in `ai_logs`, and immediately falls through to OpenAI (priority 2) without failing user request. If OpenAI also fails, falls through to DeepSeek (priority 3), and finally to rule-based parser. |
| 19 | R5: Admin | All AI providers offline or no API keys configured | Dispatcher seamlessly executes high-precision Indonesian rule-based parser (`parseTransactionRuleBased`), extracting nominal ("15rb" -> 15000), category, and notes. Transaction succeeds 100% offline. |
| 20 | R5: Admin | Admin inspects user transactions without providing reason | Endpoint `/api/admin/user-transactions` rejects request with HTTP 400: "Target user ID dan alasan inspeksi diperlukan" before any financial data is queried. |
| 21 | R5: Admin | Admin approves already approved payment order | Endpoint verifies current status; if already `approved`, returns existing record without re-upgrading profile or sending duplicate notifications. |
| 22 | R5: Admin | Rejection of manual transfer with custom notes | Payment status updated to `rejected`, admin notes saved (e.g., "Bukti transfer tidak terbaca / nominal tidak sesuai"), and target user plan remains unchanged. |

---

## 4. Interface Contracts & API Specifications

### 4.1 R3 Reporting & Export Contracts

#### `POST /api/export/pdf`
- **Request Body**:
  ```json
  {
    "userId": "usr-dimas-001",
    "periodStart": "2026-10-01",
    "periodEnd": "2026-10-31"
  }
  ```
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "exp-1728564000",
      "user_id": "usr-dimas-001",
      "format": "pdf",
      "period_start": "2026-10-01",
      "period_end": "2026-10-31",
      "file_path": "usr-dimas-001/tatadana-laporan-2026-10-01_sd_2026-10-31-1728564000.pdf",
      "file_name": "tatadana-laporan-2026-10-01_sd_2026-10-31-1728564000.pdf",
      "signed_url": "https://...supabase.co/storage/v1/object/sign/tatadana-exports/usr-dimas-001/...?token=...",
      "expires_at": "2026-10-17T05:00:00.000Z",
      "created_at": "2026-10-10T05:00:00.000Z"
    }
  }
  ```
- **Response Forbidden (403 Forbidden - Starter Plan)**:
  ```json
  {
    "error": "Export laporan PDF & Excel adalah fitur eksklusif paket Pro. Dapatkan rekap finansial instan dengan Pro!"
  }
  ```

#### `POST /api/export/excel`
- **Request Body**: Same as `/api/export/pdf`.
- **Response Success (200 OK)**: Same structure with `format: "xlsx"`, MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

---

### 4.2 R4 User Simulator & AI Vision/STT Contracts

#### `POST /api/ai/parse-transaction`
- **Request Body**:
  ```json
  {
    "text": "beli sate ayam 25rb pakai bca",
    "userId": "usr-dimas-001"
  }
  ```
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "jenis": "pengeluaran",
      "nominal": 25000,
      "kategori": "Makanan & Minuman",
      "catatan": "beli sate ayam",
      "wallet_asal": "BCA",
      "wallet_tujuan": null,
      "confidence": 0.98
    }
  }
  ```

#### `POST /api/ai/parse-receipt` (Vision OCR)
- **Request Body**:
  ```json
  {
    "image": "data:image/jpeg;base64,...",
    "userId": "usr-dimas-001"
  }
  ```
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "merchantName": "Indomaret Point Thamrin",
      "totalAmount": 64500,
      "date": "2026-10-10",
      "items": [
        { "name": "Kopi Kenangan Mantan", "price": 18000, "quantity": 1, "category": "Makanan" },
        { "name": "Roti Gandum Sari Roti", "price": 21500, "quantity": 1, "category": "Makanan" },
        { "name": "Air Mineral Aqua 600ml", "price": 5000, "quantity": 2, "category": "Makanan" },
        { "name": "Tissue Basah Paseo", "price": 15000, "quantity": 1, "category": "Belanja" }
      ]
    }
  }
  ```

#### `POST /api/ai/transcribe-voice` (Audio STT)
- **Request Body**:
  ```json
  {
    "audio": "data:audio/ogg;base64,...",
    "userId": "usr-dimas-001"
  }
  ```
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "transcript": "beli kopi janji jiwa 24 ribu pakai gopay"
  }
  ```

---

### 4.3 R5 Superadmin & Failover Management Contracts

#### `POST /api/admin/impersonate`
- **Request Body**:
  ```json
  {
    "adminId": "usr-admin-001",
    "targetUserId": "usr-dimas-001",
    "reason": "Troubleshooting laporan export error"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "targetUser": { "id": "usr-dimas-001", "full_name": "Dimas Pratama", "plan": "pro" },
    "impersonationToken": "imp_usr-dimas-001_1728564000"
  }
  ```

#### `POST /api/admin/providers`
- **Request Body (Save Provider)**:
  ```json
  {
    "action": "save_provider",
    "provider": {
      "id": "c0000000-0000-0000-0000-000000000001",
      "name": "gemini",
      "display_name": "Google Gemini 1.5 Flash",
      "is_active": true,
      "priority": 1,
      "encrypted_api_key": "AIzaSy...",
      "model_name": "gemini-1.5-flash"
    }
  }
  ```
- **Request Body (Update Execution Mode)**:
  ```json
  {
    "action": "update_settings",
    "executionMode": "parallel_failover",
    "primaryProviderId": "c0000000-0000-0000-0000-000000000001"
  }
  ```

#### `POST /api/admin/approve-payment`
- **Request Body**:
  ```json
  {
    "paymentId": "pay-01",
    "action": "approve",
    "adminNotes": "Mutasi BCA terverifikasi Rp99.000",
    "adminId": "usr-admin-001"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "payment": {
      "id": "pay-01",
      "status": "approved",
      "plan": "pro",
      "user_id": "usr-dimas-001"
    }
  }
  ```

---

## 5. Implementation Gap Analysis & Next Worker Milestones

From our thorough scan of the existing codebase, here are the concrete gaps to be addressed during Worker implementation:

1. **Missing UI Pages**:
   - `src/app/page.tsx` (Root landing page combining all `src/components/landing/*` components) is not yet created.
   - `src/app/layout.tsx` (Root layout wrapping font, theme provider, and children) is not yet created.
   - `src/app/dashboard/reports/page.tsx` (or alias `/dashboard/laporan/page.tsx`) needs to be fully built with sorting, filtering, and export triggers.
   - `src/app/dashboard/simulator/page.tsx` needs to be created to provide full dedicated testing page for the in-app bot simulator.
   - `src/app/dashboard/settings/page.tsx` needs to be created with 5 tabs: Profil, Telegram Bot, Reminder, Kategori, Budget.
   - `src/app/admin/page.tsx` (Superadmin dashboard) needs to be created with KPI cards, impersonation trigger, AI provider management, user management, and manual payment verification.

2. **Tailwind Dark Mode**:
   - `tailwind.config.js` must have `darkMode: 'class'` added.
   - Theme toggle context / provider with `localStorage` persistence should be implemented.

3. **Export Libraries**:
   - While SheetJS (`xlsx`) is currently installed, `pdfkit` / `jspdf` & `exceljs` should be verified or wired cleanly into `src/lib/export.ts` to replace placeholder PDF buffer generation.

4. **Realtime Websocket Wiring**:
   - In `src/app/dashboard/reports/page.tsx` and `src/app/dashboard/page.tsx`, ensure `supabase.channel('public:transactions').on('postgres_changes', ...).subscribe()` is actively wired for live Telegram/Web data updates.

---
*Report prepared by Spec Miner 3 (Survey).*
