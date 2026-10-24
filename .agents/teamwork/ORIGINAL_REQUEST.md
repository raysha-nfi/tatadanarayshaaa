# Original User Request

## 2026-10-10T05:27:58Z

# Teamwork Project Prompt — Final Draft

> Status: Launched — delegated to teamwork_preview
> Goal: Launch teamwork_preview with 5 agents concurrently
> Requested team: kerjakan dengan menggunakan 5 agent sekaligus (full multi-agent team)

TataDana adalah aplikasi SaaS manajemen keuangan pribadi premium Indonesia yang terintegrasi secara langsung dengan Telegram Bot (parsing bahasa natural Indonesia, voice note audio STT, foto struk multimodal OCR), backend Supabase (Postgres, Auth, Storage, Realtime), sistem Laporan & Export in-app (PDF/Excel), serta pembayaran Midtrans dengan panel Superadmin.

Working directory: C:\Users\lenovo\.gemini\antigravity\scratch\tatadana
Integrity mode: development

## Requirements

### R1. Database Schema & Auth System (Supabase)
- Implementasi lengkap skema database di `supabase/migrations/` dengan RLS (Row Level Security), triggers, dan indexes:
  - `profiles`: user metadata, phone_number, plan (`starter` | `pro`), subscription_status, bot_token, shared_bot_linked, currency.
  - `wallets`: id, user_id, name, type (cash, bank, ewallet), balance, is_default.
  - `categories`: id, user_id, name, icon/emoji, color, type (income, expense).
  - `budgets`: id, user_id, category_id, monthly_limit, month_year.
  - `transactions`: id, user_id, wallet_id, category_id, type (income, expense, transfer), amount, date_time (WIB), note, source (telegram_text, telegram_photo, telegram_voice, web), receipt_image_url, items (JSON rincian item jika dari struk multi-item).
  - `exports_history`: id, user_id, file_name, file_url (signed Supabase Storage URL), file_type (pdf, xlsx), period_start, period_end.
  - `ai_providers`: id, name, api_key (encrypted), is_active, mode (single, parallel_failover), priority.
  - `ai_call_logs`: id, provider, feature (text_parse, voice_stt, receipt_ocr, advisor), prompt_tokens, completion_tokens, status, latency_ms.
  - `admin_audit_logs`: id, admin_id, target_user_id, action, timestamp.
- Supabase Auth: Email/Password, Google OAuth, dan verifikasi nomor HP (OTP) yang menjadi kunci pairing Telegram Bot.
- User seed / onboarding hook: saat register otomatis create default wallet (BCA, Cash, GoPay) dan kategori rekomendasi finansial Indonesia.

### R2. Telegram Bot Engine & Webhook API
- Endpoint publik `/api/telegram/webhook` yang menangani update POST dari Telegram dengan penanganan idempotency ketat via `update_id` cache/database.
- Mode Hybrid Bot:
  1. Shared TataDana Official Bot: user pairing via command `/start <pairing_code>` atau input nomor HP.
  2. Custom Bot Token (BYO): user input token BotFather di Settings, backend otomatis memanggil `getMe` dan `setWebhook`.
- AI Natural Language Parsing (Google Gemini Flash default + fallback OpenAI/DeepSeek):
  - Teks kasual Indonesia ("beli sate 25rb", "gajian 8jt", "transfer bca ke gopay 100k") diparsing terstruktur ke `{ jenis, nominal, kategori, catatan, wallet_source, wallet_target }`.
  - Penanganan nominal Indonesia eksplisit: "rb/ribu" = 1.000, "jt/juta" = 1.000.000, "k" = 1.000.
  - Audio Voice Note (.oga/.ogg Telegram): transkripsi STT via Gemini Multimodal Audio / Whisper API, diproses dengan parsing yang sama + reply transkrip 🎙️.
  - Foto Struk OCR (Pro feature): ekstraksi merchant, total, dan rincian item multi-produk (1 transaksi utama dengan items breakdown).
- Bot Commands lengkap ber-timezone WIB: `/saldo`, `/hari_ini`, `/minggu_ini`, `/bulan_ini`, `/budget`, `/bantuan`.
- Format reply nota rapi sesuai spesifikasi Part 4.4 & 4.5 dengan budget visual progress bar (█ dan ░) serta peringatan batas 80% & 100%.
- AI Financial Advisor proaktif (peringatan pengeluaran naik >50% atau mendekati batas pemasukan).
- Batasan paket Starter (maksimal 50 transaksi/bulan, tolak foto struk dengan pesan sopan & CTA upgrade).

### R3. In-App Financial Reporting & Multi-Format Export
- Halaman Laporan interaktif (`/dashboard/reports`) dengan sorting, filter tanggal, wallet, kategori, search catatan.
- Tampilan transaksi struk multi-item expandable (1 transaksi induk dengan accordion rincian item).
- Ringkasan cashflow: Total Pemasukan, Total Pengeluaran, Net Cashflow, Top 5 Kategori.
- Supabase Realtime subscription: transaksi baru dari Telegram/Web langsung muncul tanpa refresh browser.
- Exporter PDF (menggunakan pdfkit/jspdf-autotable) dan Excel (.xlsx menggunakan exceljs) on-demand, disimpan ke bucket Supabase Storage dengan auto-expiring signed URL.

### R4. Premium User Dashboard & Landing Page (Dual Theme)
- Full-stack Next.js App Router (TypeScript, Tailwind CSS, Lucide Icons, Framer Motion transitions).
- Tema Dual-Mode: Default Light Mode fintech oranye-putih modern yang bersih + Instant toggle ke Dark Mode (latar hitam pekat/dark slate fintech).
- 4 Stats Cards, Expense Category Pie Chart, Income vs Expense 6-Month Bar Chart, Daily Trend Line Chart.
- Interactive In-App Bot Simulator di Web Dashboard (`/dashboard/simulator` & modal) untuk testing pesan teks, upload foto struk, dan upload voice note langsung di browser tanpa perlu tunnel lokal.
- Settings: Profil, Tab Telegram Bot (getMe & setWebhook test button + status badge 🟢/🔴/⏳), Tab Reminder, Tab Kategori.
- Landing Page premium sesuai struktur Part 7: Sticky Navbar, Problem-Solution, Interactive Demo, Features Showcase, Pricing (Starter Rp49rb/bln, Pro Rp99rb lifetime), FAQ 7+ items, Footer.

### R5. Superadmin Dashboard & Multi-Provider AI Failover
- Superadmin Portal (`/admin`):
  - User Impersonation (masuk ke tampilan user tanpa re-login).
  - Manajemen API Provider AI: kelola keys (Gemini, OpenAI, DeepSeek), toggle provider aktif, mode single vs parallel failover.
  - Kelola Pengguna: list user, plan upgrade status, status telegram link.
  - Monitoring AI logs (token usage, latency, status pemanggilan).
  - Verifikasi manual pembayaran Midtrans / approval konfirmasi transfer.
  - Audit logs akses data user demi privasi.

## Acceptance Criteria

### Functional & Bot Criteria
- [ ] Parser teks memetakan format Indonesia "beli seblak 15rb", "isi bensin 50k", "gaji 7.5jt" menjadi nominal yang 100% akurat.
- [ ] Voice note dan foto struk berhasil diproses dan dicatat ke Supabase.
- [ ] Webhook Telegram idempotent dan membalas dengan format nota rapi bertimezone WIB.
- [ ] Limit paket Starter (50 transaksi/bln) dan proteksi fitur Pro berjalan sempurna.
- [ ] Interactive In-App Bot Simulator berfungsi penuh untuk pengujian instan di localhost.

### Dashboard & UI/UX Criteria
- [ ] Tampilan ultra-premium, bersih, bebas dari kesan template murahan, dengan warna primer oranye fintech dan dukungan toggle Dark Mode latar hitam.
- [ ] Realtime sync: transaksi dari Telegram/Simulator langsung ter-update di stats card dan tabel transaksi dashboard.
- [ ] Export PDF & Excel berjalan on-demand dan file tersimpan rapi di Supabase Storage.
- [ ] Admin panel dapat mengelola API provider dan melakukan impersonation secara mulus.
