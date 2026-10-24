# TataDana Codebase Survey & Technical Investigation Report

**Survey Date**: 2026-10-10  
**Surveyor**: Explorer 1 (Survey)  
**Project Root**: `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana`  
**Reference Document**: `ORIGINAL_REQUEST.md`

---

## 1. Executive Summary

TataDana is an Indonesian SaaS personal finance management platform built with Next.js App Router (TypeScript, Tailwind CSS), Supabase (PostgreSQL, Auth, Storage, Realtime), Telegram Bot API, Multi-Provider AI (Google Gemini, OpenAI, DeepSeek), and Midtrans payment gateway.

The codebase currently contains extensive foundation files including database migrations, API routes, library utilities, UI components, and mock application context. However, several critical top-level pages (`src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`), dashboard sub-routes (`/dashboard/reports`, `/dashboard/simulator`, `/dashboard/settings`, `/dashboard/budget`, `/dashboard/wallet`), superadmin portal page (`/admin`), and missing Telegram commands (`/hari_ini`, `/minggu_ini`, `/bulan_ini`) remain to be completed. Additionally, `node_modules` is not yet installed in the workspace.

---

## 2. Directory Tree & File Inventory

```
C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\
├── .env.example                     # Environment template with all required keys
├── next.config.js                   # Next.js config with reactStrictMode & image domains
├── package.json                     # Dependencies & scripts
├── postcss.config.js                # PostCSS with tailwindcss & autoprefixer
├── tailwind.config.js               # Tailwind config with brand #ff6b00 palette
├── tsconfig.json                    # TypeScript compiler options (target es2020, @/* path)
├── supabase/
│   ├── README.md                    # Migration guide
│   └── migrations/
│       ├── 001_initial_schema.sql   # 14 tables, triggers, indexes, WIB timezone
│       ├── 002_rls_and_policies.sql # RLS policies on all tables, Realtime publication
│       └── 003_seed_data.sql        # Seed AI providers & tatadana-exports storage bucket
└── src/
    ├── types/
    │   └── index.ts                 # Type definitions for all models, telegram, AI
    ├── lib/
    │   ├── advisor.ts               # AI financial advisor trigger evaluation
    │   ├── app-context.tsx          # Global React state context with mock fallback & actions
    │   ├── currency.ts              # Indonesian Rupiah parser (rb, jt, k) & formatters
    │   ├── date.ts                  # Asia/Jakarta (WIB) date/time utilities
    │   ├── export.ts                # Excel (.xlsx) & PDF generator + Supabase Storage signed URLs
    │   ├── limits.ts                # Plan limits enforcement (Starter vs Pro)
    │   ├── mock-data.ts             # Rich seed dataset for instant offline rendering
    │   ├── ai/
    │   │   ├── dispatcher.ts        # Gemini, OpenAI, DeepSeek failover dispatcher & vision/audio
    │   │   └── parser.ts            # Indonesian rule-based fallback parser & prompt templates
    │   ├── supabase/
    │   │   ├── client.ts            # Public Supabase client
    │   │   └── server.ts            # Admin Supabase service-role client
    │   └── telegram/
    │       ├── bot.ts               # Telegram API client (sendMessage, getMe, setWebhook)
    │       ├── formatter.ts         # Telegram reply formatters (progress bars, receipts, alerts)
    │       └── webhook-handler.ts   # Webhook update processing engine with idempotency
    ├── components/
    │   ├── ui/
    │   │   ├── Badge.tsx            # Badge component (brand, pro, success, warning, etc.)
    │   │   ├── Button.tsx           # Button with variants (primary, secondary, outline, ghost)
    │   │   ├── Card.tsx             # Surface card container
    │   │   ├── Input.tsx            # Form text input
    │   │   ├── Modal.tsx            # Accessible modal dialog
    │   │   ├── ProgressBar.tsx      # Visual progress bar with threshold color alerts
    │   │   └── Skeleton.tsx         # Loading placeholder skeleton
    │   └── landing/
    │       ├── Faq.tsx              # 8-item accordion FAQ
    │       ├── Features.tsx         # Feature showcase sections
    │       ├── FinalCta.tsx         # Bottom call to action banner
    │       ├── Footer.tsx           # 4-column footer with links & copyright
    │       ├── Hero.tsx             # Hero section with headline & video placeholder
    │       ├── InteractiveDemo.tsx  # In-page interactive chat demo
    │       ├── Navbar.tsx           # Sticky navigation bar with mobile drawer
    │       ├── Pricing.tsx          # Starter vs Pro pricing table with monthly/lifetime toggle
    │       ├── ProblemSolution.tsx  # Problem statement cards
    │       └── Testimonials.tsx     # Indonesian user testimonial cards
    └── app/
        ├── login/
        │   └── page.tsx             # Login page (40/60 split, password + OTP phone)
        ├── register/
        │   └── page.tsx             # Register page (40/60 split, OTP phone verification)
        ├── dashboard/
        │   ├── layout.tsx           # User dashboard sidebar, header, impersonation bar
        │   ├── page.tsx             # Dashboard overview with 4 stats cards & quick tx modal
        │   └── transaksi/
        │       └── page.tsx         # Transactions page with filter, search, expandable receipts
        └── api/
            ├── admin/
            │   ├── approve-payment/route.ts   # Admin approval of manual transfer
            │   ├── impersonate/route.ts       # User impersonation with audit log
            │   ├── providers/route.ts         # AI provider keys & mode configuration
            │   └── user-transactions/route.ts # Admin inspection of user transactions with audit log
            ├── ai/
            │   ├── parse-receipt/route.ts     # Multimodal receipt image parser
            │   ├── parse-transaction/route.ts # Natural text parser endpoint
            │   └── transcribe-voice/route.ts  # Voice note transcription endpoint
            ├── auth/
            │   ├── send-otp/route.ts          # 6-digit OTP phone dispatch
            │   └── verify-otp/route.ts        # OTP verification + auto-provision default wallets/categories
            ├── export/
            │   ├── excel/route.ts             # Generate Excel report endpoint
            │   └── pdf/route.ts               # Generate PDF report endpoint
            ├── payments/
            │   ├── create-transaction/route.ts# Midtrans Snap token & manual transfer generator
            │   ├── manual-transfer/route.ts   # Submit payment proof endpoint
            │   └── midtrans-notification/route.ts # Midtrans webhook callback handler
            └── telegram/
                ├── test-connection/route.ts   # BotFather token tester & webhook binder
                └── webhook/route.ts           # Public Telegram webhook endpoint
```

---

## 3. Package & Toolchain Status

### Currently Declared in `package.json`
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "lucide-react": "^0.453.0",
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/node": "^20.16.11",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.3"
  }
}
```

### Installation Status
- `node_modules` directory does not currently exist.
- Dependencies will need to be installed via `npm install` (or `npm i --legacy-peer-deps` / `pnpm install`).

### Package & Dependency Assessment
1. **PDF Generation**: R3 mentions `pdfkit` / `jspdf-autotable`. Currently `src/lib/export.ts` generates PDF using raw buffer assembly and `xlsx` for Excel. To enhance formatted PDF generation, either `jspdf` / `pdfkit` can be added, or the current buffer generator can be standardized.
2. **Excel Generation**: `xlsx` (SheetJS 0.18.5) is installed and functional in `export.ts`.
3. **Animations**: R4 specifies "Framer Motion transitions". `framer-motion` is not yet in `package.json`. If installed, transitions can be enhanced; CSS transitions in Tailwind are currently utilized as lightweight alternatives.
4. **Testing Script**: `package.json` specifies `"test": "node dist-test/runner.js"`, but no test runner script exists yet. A test suite verifying currency parsing, date utilities, plan limits, and advisor triggers needs to be created.

---

## 4. Requirement Verification & Gap Analysis

| Requirement | Current Status | Implemented Files | Missing / Needed Actions |
|---|---|---|---|
| **R1: Database Schema & Auth System** | **90% Complete** | `supabase/migrations/001_initial_schema.sql`<br>`supabase/migrations/002_rls_and_policies.sql`<br>`supabase/migrations/003_seed_data.sql`<br>`src/app/api/auth/verify-otp/route.ts` | Schema and RLS policies are fully written. Auto-provisioning default wallets (Cash, BCA, GoPay) and categories is implemented in OTP verify hook. Verify runtime execution against live Supabase instance or mock client. |
| **R2: Telegram Bot Engine & Webhook API** | **85% Complete** | `src/app/api/telegram/webhook/route.ts`<br>`src/lib/telegram/bot.ts`<br>`src/lib/telegram/formatter.ts`<br>`src/lib/telegram/webhook-handler.ts`<br>`src/lib/ai/dispatcher.ts`<br>`src/lib/currency.ts` | **Missing bot commands**: `/hari_ini`, `/minggu_ini`, `/bulan_ini` need to be added to `webhook-handler.ts` command router. Idempotency, limit check, receipt OCR, voice transcription, progress bar (█ and ░), and advisor trigger are implemented. |
| **R3: In-App Financial Reporting & Multi-Format Export** | **65% Complete** | `src/lib/export.ts`<br>`src/app/api/export/pdf/route.ts`<br>`src/app/api/export/excel/route.ts`<br>`src/app/dashboard/transaksi/page.tsx` | **Missing interactive reports page**: `/dashboard/reports` (or `/dashboard/laporan`) must be created with sorting, date range filter, wallet & category filters, search notes, cashflow summary cards, realtime sync, and on-demand download triggers. |
| **R4: Premium User Dashboard & Landing Page** | **60% Complete** | `src/components/landing/*`<br>`src/components/ui/*`<br>`src/app/dashboard/layout.tsx`<br>`src/app/dashboard/page.tsx`<br>`src/app/dashboard/transaksi/page.tsx`<br>`src/app/login/page.tsx`<br>`src/app/register/page.tsx` | **Missing Root Files**: `src/app/layout.tsx`, `src/app/page.tsx`, and `src/app/globals.css` must be created immediately to make Next.js runnable.<br>**Missing Dashboard Subpages**: `/dashboard/simulator`, `/dashboard/settings`, `/dashboard/budget`, `/dashboard/wallet`.<br>**Dual-Mode Theme**: Dark mode classes and toggle mechanism. |
| **R5: Superadmin Dashboard & Multi-Provider AI Failover** | **70% Complete** | `src/app/api/admin/approve-payment/route.ts`<br>`src/app/api/admin/impersonate/route.ts`<br>`src/app/api/admin/providers/route.ts`<br>`src/app/api/admin/user-transactions/route.ts`<br>`src/lib/ai/dispatcher.ts` | Backend API routes and failover dispatcher are fully written. **Missing Admin Frontend**: Superadmin UI at `/admin` (or `src/app/admin/page.tsx`) with user management, impersonation, provider toggle & keys, AI logs table, payment approvals, and audit log viewer. |

---

## 5. Architectural Conventions & Style Guide

- **Directory Convention**:
  - `src/app/`: Next.js App Router routes (`page.tsx`, `layout.tsx`, `route.ts`).
  - `src/components/ui/`: Reusable atomic UI components (Button, Input, Card, Modal, etc.).
  - `src/components/landing/`: Landing page sections.
  - `src/lib/`: Core domain logic (AI, Telegram, Supabase, Date, Currency, Limits, Advisor).
  - `src/types/`: Centralized TypeScript interfaces.
- **Routing & Navigation Hierarchy**:
  - Landing: `/`
  - Auth: `/login`, `/register`
  - User Dashboard:
    - Overview: `/dashboard`
    - Transactions: `/dashboard/transaksi`
    - Reports: `/dashboard/reports` (or `/dashboard/laporan`)
    - Simulator: `/dashboard/simulator`
    - Budget: `/dashboard/budget`
    - Wallet: `/dashboard/wallet`
    - Settings: `/dashboard/settings`
  - Admin Portal: `/admin`
  - API Routes: `/api/...`
- **Design Tokens**:
  - Primary Brand Color: `#FF6B00` (Tailwind `brand-500`)
  - Neutral Backgrounds: Light `#FAFAF9` / `#FFFFFF`, Dark Slate `#0A0A0A` / `#171717`
  - Typography: `Plus Jakarta Sans`, `Inter`, `sans-serif`
  - Timezone: Asia/Jakarta (`WIB` / UTC+7)

---

## 6. Actionable Implementation Plan for Worker Agents

1. **Phase 1: Root Foundation & Shell (Urgent)**:
   - Create `src/app/globals.css` with Tailwind directives and font imports.
   - Create `src/app/layout.tsx` wrapping all routes in `AppProvider` with responsive layout and meta tags.
   - Create `src/app/page.tsx` assembling the landing components (`Navbar`, `Hero`, `ProblemSolution`, `InteractiveDemo`, `Features`, `Pricing`, `Testimonials`, `Faq`, `FinalCta`, `Footer`).
2. **Phase 2: Missing Dashboard Subpages**:
   - Implement `src/app/dashboard/laporan/page.tsx` (and redirect `/dashboard/reports`) with cashflow summary, filters, and export buttons.
   - Implement `src/app/dashboard/simulator/page.tsx` (In-App Telegram Bot Simulator with text, simulated receipt photo, and voice note).
   - Implement `src/app/dashboard/settings/page.tsx` (Profile, Telegram Bot test/webhook, Reminders, Categories).
   - Implement `src/app/dashboard/budget/page.tsx` (Budget limit editor & progress cards).
   - Implement `src/app/dashboard/wallet/page.tsx` (Multi-wallet manager & transfer antar-dompet).
3. **Phase 3: Superadmin Portal UI**:
   - Implement `src/app/admin/page.tsx` and `src/app/admin/layout.tsx` with tabs: AI Providers & System Mode, AI Logs Monitor, User Management & Impersonation, Payment Verification, and Privacy Audit Logs.
4. **Phase 4: Telegram Webhook Bot Completeness**:
   - Add `/hari_ini`, `/minggu_ini`, and `/bulan_ini` handlers to `src/lib/telegram/webhook-handler.ts`.
5. **Phase 5: Test Suite & Build Verification**:
   - Create unit test suite in `tests/` or `dist-test/runner.js` covering currency parsing, date utilities, plan limits, and AI dispatcher fallback.
