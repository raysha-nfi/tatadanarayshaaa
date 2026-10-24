# 🍊 TataDana — SaaS Manajemen Keuangan Pribadi Indonesia

> **Catat keuangan semudah chat — langsung dari Telegram kamu**

TataDana adalah aplikasi manajemen keuangan pribadi modern terintegrasi dengan Telegram Bot. Pengguna dapat mencatat pemasukan dan pengeluaran langsung dari chat Telegram dengan bahasa natural atau foto struk, dan setiap transaksi otomatis tersimpan rapi dan dapat dipantau kapan saja lewat dashboard native TataDana.

---

## 🚀 Fitur Utama

1. **Telegram Bot Chat & Voice Note**
   - Natural Language Parser dengan LLM & format nominal Indonesia: `15rb`, `1.5jt`, `500k`, `2m`.
   - Voice Note (maksimal 60 detik) ditranskripsikan ke teks dan diproses dengan format reply identik.
   - Reply bot presisi: rincian nominal, dompet, kategori, saldo sisa, dan visual progress bar budget (`████░░░░░░ 40%`).
   - Perintah bot cepat: `/saldo`, `/hari_ini`, `/minggu_ini`, `/bulan_ini`, `/budget`, `/sheet`, `/bantuan`.

2. **Multi-Item Receipt OCR (Paket Pro)**
   - Scan struk foto via AI Vision.
   - Struk multi-item dicatat sebagai 1 transaksi utama dengan rincian per-item (`receipt_items`) yang dapat di-expand di tabel transaksi.

3. **Multi-Wallet & Antar-Dompet**
   - Mendukung uang tunai (Cash), rekening bank (BCA, Mandiri, BRI), dan e-wallet (GoPay, OVO, DANA).
   - Set 1 wallet sebagai default untuk transaksi bot Telegram.
   - Transfer saldo antar-dompet langsung dari web atau chat Telegram (`tf bca ke gopay 100rb`).

4. **Target Budget & Notifikasi Otomatis**
   - Batas budget bulanan per kategori.
   - Alert otomatis via Telegram saat pengeluaran mencapai 80% dan 100%.

5. **Laporan Native & Export PDF / Excel**
   - Tabel transaksi lengkap dengan pagination dan sorting per kolom.
   - Filter rentang tanggal, kategori, dompet, dan jenis transaksi.
   - Export on-demand ke format PDF dan Excel (`.xlsx`) disimpan privat di Supabase Storage dengan Signed URL 7 hari.
   - Riwayat export tersimpan.

6. **AI Financial Advisor Cerdas (Paket Pro)**
   - Aktif otomatis saat pengeluaran kategori melonjak >50% dari minggu lalu, rasio pengeluaran >80% pemasukan, atau transaksi tunggal >20% budget.

7. **Multi-Provider AI & Failover (Admin Panel)**
   - Mendukung Google Gemini, OpenAI (GPT-4o-mini), dan DeepSeek.
   - Mode Failover otomatis: jika provider utama gagal, sistem langsung beralih ke provider cadangan tanpa downtime.

8. **Superadmin Dashboard**
   - Impersonasi pengguna tanpa perlu relogin.
   - Inspeksi transaksi pengguna dengan Audit Log kepatuhan privasi data.
   - Verifikasi bukti transfer manual dan integrasi Midtrans.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Realtime)
- **Timezone**: Asia/Jakarta (WIB) untuk semua transaksi, reminder, dan reply bot
- **Payment Gateway**: Midtrans Snap & Transfer Manual
- **Storage**: Supabase Storage (`tatadana-exports` bucket privat)

---

## 📁 Struktur Folder

```
tatadana/
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql       # Skema tabel, trigger saldo, WIB timezone
│       ├── 002_rls_and_policies.sql     # Row Level Security & Realtime publication
│       └── 003_seed_data.sql            # Seed provider AI & Supabase storage bucket
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Landing Page (15 section strictly Part 7)
│   │   ├── login/page.tsx               # Login Page (Split 40/60 layout, Phone OTP)
│   │   ├── register/page.tsx            # Register Page & Auto-provisioning data
│   │   ├── dashboard/                   # User Dashboard Pages (Beranda, Transaksi, Laporan, Budget, Wallet, Settings)
│   │   ├── admin/                       # Superadmin Dashboard (AI Providers, Users, Payments, AI Logs, Audit Logs)
│   │   └── api/                         # API Routes (Telegram Webhook, AI Parser, Export, Auth OTP, Midtrans)
│   ├── components/                      # Reusable UI & Layout Components
│   ├── lib/
│   │   ├── currency.ts                  # Parser & Formatter Rupiah Indonesia (15rb, 1.5jt, dll)
│   │   ├── date.ts                      # Asia/Jakarta (WIB) helpers
│   │   ├── limits.ts                    # Penegakan kuota Starter vs Pro
│   │   ├── advisor.ts                   # Trigger engine AI Financial Advisor
│   │   ├── export.ts                    # PDF & Excel (.xlsx) generator
│   │   ├── ai/                          # Multi-provider dispatcher & fallback
│   │   └── telegram/                    # Bot webhook handler & message formatter
│   └── tests/                           # Unit & integration test suites
```

---

## ⚙️ Panduan Setup & Environment

1. Salin template `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Isi variabel konfigurasi:
   - `TELEGRAM_BOT_TOKEN`
   - `WEBHOOK_BASE_URL` (contoh: `https://tatadana.id`)
   - `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`, `OPENAI_API_KEY`, atau `DEEPSEEK_API_KEY`
   - `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY`

3. Jalankan migrasi SQL di Supabase SQL Editor:
   - Jalankan `supabase/migrations/001_initial_schema.sql`
   - Jalankan `supabase/migrations/002_rls_and_policies.sql`
   - Jalankan `supabase/migrations/003_seed_data.sql`

4. Jalankan aplikasi:
   ```bash
   npm install
   npm run dev
   ```

5. Akses website di browser: `http://localhost:3000`
