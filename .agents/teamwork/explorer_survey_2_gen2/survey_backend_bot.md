# TATADANA BACKEND & BOT SPECIFICATION (R1 & R2)
**Document Version:** 1.0.0  
**Author:** Explorer 2 Replacement (`explorer_survey_2_gen2`)  
**Scope:** R1 (Database Schema & Supabase Auth) & R2 (Telegram Bot Engine, Webhook API, NLP, STT, OCR, Commands, Simulator)  
**Project Root:** `C:\Users\lenovo\.gemini\antigravity\scratch\tatadana`  
**Date:** 2026-10-10  

---

## 1. Executive Summary & Architectural Overview

TataDana adalah aplikasi SaaS manajemen keuangan pribadi Indonesia kelas premium yang mengintegrasikan pencatatan instan melalui Telegram Bot secara langsung dengan web dashboard real-time. Inti keunggulan produk ini bergantung pada dua pilar backend:
1. **R1: Supabase Database Schema & Auth System**  
   Fondasi data relasional PostgreSQL dengan keamanan Row Level Security (RLS) ketat, trigger kalkulasi saldo dompet otomatis, hooks onboarding pengguna baru, serta verifikasi nomor telepon OTP yang menjadi kunci integrasi bot.
2. **R2: Telegram Bot Engine & Webhook Processing Pipeline**  
   Mesin bot hibrida (Shared Official Bot & Custom BYO Token) yang memproses pesan pengguna ber-timezone WIB (Asia/Jakarta), menangani idempotency ketat via `update_id`, melakukan NLP bahasa kasual Indonesia ("beli bakso 15rb", "tf bca ke gopay 100k"), transkripsi suara Voice Note (.oga/.ogg), OCR Foto Struk multi-item, peringatan budget visual (█ dan ░), serta pembatasan paket Starter vs Pro.

---

## 2. R1: Supabase Database Schema & Auth Specification

### 2.1 Table-by-Table Field Specification

Berikut adalah spesifikasi lengkap 9 tabel inti sesuai `ORIGINAL_REQUEST.md` beserta tabel-tabel pendukung sistem:

#### Table 1: `profiles` (User Account & Bot Connection Metadata)
Menyimpan profil pengguna, langganan, dan metadata koneksi Telegram.
* `id` : `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
* `full_name` : `TEXT NOT NULL`
* `phone_number` : `TEXT UNIQUE` (Format E.164 Indonesia: `628xxxxxxxxxx`, kunci pairing bot & OTP)
* `phone_verified` : `BOOLEAN NOT NULL DEFAULT FALSE`
* `avatar_url` : `TEXT`
* `currency` : `TEXT NOT NULL DEFAULT 'IDR'`
* `plan` : `TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro'))`
* `subscription_status` : `TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'canceled'))`
* `bot_token` : `TEXT` (Custom BYO bot token dari @BotFather, dienkripsi)
* `shared_bot_linked` : `BOOLEAN NOT NULL DEFAULT FALSE` (Status koneksi ke Official Shared Bot)
* `pairing_code` : `VARCHAR(16) UNIQUE` (Kode unik sementara untuk `/start <pairing_code>`)
* `pairing_code_expires_at` : `TIMESTAMPTZ` (TTL kode pairing, 10-15 menit)
* `telegram_chat_id` : `BIGINT UNIQUE` (Chat ID Telegram aktif pengguna)
* `role` : `TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))`
* `created_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`
* `updated_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`

#### Table 2: `wallets` (Multi-Wallet Management)
Menyimpan dompet-dompet milik pengguna (Tunai, Rekening Bank, E-Wallet).
* `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
* `user_id` : `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
* `name` : `TEXT NOT NULL` (e.g. 'Cash', 'BCA', 'GoPay', 'Mandiri')
* `type` : `TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'ewallet'))`
* `balance` : `NUMERIC(18, 2) NOT NULL DEFAULT 0`
* `color` : `TEXT NOT NULL DEFAULT '#FF6B00'`
* `icon` : `TEXT NOT NULL DEFAULT 'wallet'` (e.g. 'wallet', 'credit-card', 'smartphone')
* `is_default` : `BOOLEAN NOT NULL DEFAULT FALSE`
* `created_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`
* `updated_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`
* *Index:* `CREATE UNIQUE INDEX idx_wallets_user_default ON public.wallets(user_id) WHERE is_default = TRUE;` (Menjamin tepat 1 dompet utama per user).

#### Table 3: `categories` (Income & Expense Taxonomies)
Kategori transaksi baik bawaan sistem maupun kustom per pengguna.
* `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
* `user_id` : `UUID REFERENCES public.profiles(id) ON DELETE CASCADE` (NULL atau terasosiasi ke user)
* `name` : `TEXT NOT NULL` (e.g. 'Makanan & Minuman', 'Transportasi', 'Gaji')
* `type` : `TEXT NOT NULL CHECK (type IN ('income', 'expense'))`
* `emoji` : `TEXT NOT NULL DEFAULT '📁'`
* `color` : `TEXT NOT NULL DEFAULT '#FF6B00'`
* `is_system` : `BOOLEAN NOT NULL DEFAULT FALSE` (Kategori standar rekomendasi finansial Indonesia)
* `created_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`

#### Table 4: `budgets` (Monthly Limits per Category)
Batas anggaran bulanan untuk mengontrol pengeluaran.
* `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
* `user_id` : `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
* `category_id` : `UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE`
* `monthly_limit` : `NUMERIC(18, 2) NOT NULL CHECK (monthly_limit >= 0)`
* `month_year` : `TEXT NOT NULL` (Format `YYYY-MM`, e.g. `'2026-10'`)
* `alert_80_sent` : `BOOLEAN NOT NULL DEFAULT FALSE`
* `alert_100_sent` : `BOOLEAN NOT NULL DEFAULT FALSE`
* `created_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`
* *Constraint:* `CONSTRAINT uq_user_category_month UNIQUE (user_id, category_id, month_year)`

#### Table 5: `transactions` (Unified Transaction Ledger)
Buku besar transaksi dari seluruh channel (Web, Bot Teks, Bot Suara, Bot Struk).
* `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
* `user_id` : `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
* `wallet_id` : `UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT` (Dompet asal)
* `to_wallet_id` : `UUID REFERENCES public.wallets(id) ON DELETE SET NULL` (Dompet tujuan jika transfer)
* `category_id` : `UUID REFERENCES public.categories(id) ON DELETE SET NULL`
* `type` : `TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer'))`
* `amount` : `NUMERIC(18, 2) NOT NULL CHECK (amount > 0)`
* `date_time` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')` (WIB)
* `note` : `TEXT`
* `source` : `TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'telegram_text', 'telegram_photo', 'telegram_voice'))`
* `receipt_image_url` : `TEXT` (URL foto struk di Supabase Storage jika ada)
* `items` : `JSONB` (Array JSON rincian item jika transaksi multi-item dari struk: `[{"name":"Kopi","price":18000,"quantity":1,"category":"Makanan"}]`)
* `raw_input` : `TEXT` (Kalimat asli yang diinput user di Telegram / Simulator)
* `voice_transcript` : `TEXT` (Hasil transkrip audio jika source adalah voice note)
* `created_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`
* *Index:* `CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date_time DESC);`

#### Table 6: `receipt_items` (Relational Normalization for Multi-Item Receipts)
Menyediakan relasi normalisasi SQL untuk query agregasi produk struk.
* `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
* `transaction_id` : `UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE`
* `item_name` : `TEXT NOT NULL`
* `price` : `NUMERIC(18, 2) NOT NULL CHECK (price >= 0)`
* `quantity` : `INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0)`
* `category_id` : `UUID REFERENCES public.categories(id) ON DELETE SET NULL`
* `created_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`

#### Table 7: `exports_history` (Report File History)
Catatan riwayat unduhan berkas PDF dan Excel.
* `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
* `user_id` : `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
* `file_name` : `TEXT NOT NULL`
* `file_url` : `TEXT NOT NULL` (Signed Supabase Storage URL atau object path)
* `file_type` : `TEXT NOT NULL CHECK (file_type IN ('pdf', 'xlsx'))`
* `period_start` : `DATE NOT NULL`
* `period_end` : `DATE NOT NULL`
* `expires_at` : `TIMESTAMPTZ`
* `created_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`

#### Table 8: `ai_providers` (AI Engine Configuration)
Konfigurasi penyedia model AI (Google Gemini, OpenAI, DeepSeek).
* `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
* `name` : `TEXT NOT NULL UNIQUE` (`'gemini'`, `'openai'`, `'deepseek'`)
* `display_name` : `TEXT NOT NULL`
* `api_key` : `TEXT NOT NULL` (Terenkripsi di database)
* `is_active` : `BOOLEAN NOT NULL DEFAULT TRUE`
* `mode` : `TEXT NOT NULL DEFAULT 'parallel_failover' CHECK (mode IN ('single', 'parallel_failover'))`
* `priority` : `INTEGER NOT NULL DEFAULT 1`
* `model_name` : `TEXT NOT NULL` (e.g. `'gemini-1.5-flash'`, `'gpt-4o-mini'`, `'deepseek-chat'`)
* `created_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`

#### Table 9: `ai_call_logs` (AI Monitoring & Token Consumption)
Pencatatan metrik performa dan konsumsi token AI.
* `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
* `user_id` : `UUID REFERENCES public.profiles(id) ON DELETE SET NULL`
* `provider` : `TEXT NOT NULL`
* `feature` : `TEXT NOT NULL CHECK (feature IN ('text_parse', 'voice_stt', 'receipt_ocr', 'advisor'))`
* `prompt_tokens` : `INTEGER DEFAULT 0`
* `completion_tokens` : `INTEGER DEFAULT 0`
* `status` : `TEXT NOT NULL CHECK (status IN ('success', 'failed'))`
* `latency_ms` : `INTEGER NOT NULL DEFAULT 0`
* `prompt_preview` : `TEXT`
* `response_preview` : `TEXT`
* `error_message` : `TEXT`
* `created_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`

#### Table 10: `admin_audit_logs` (Security & Privacy Audit Trail)
Audit jejak rekam admin saat mengakses atau memodifikasi data pengguna.
* `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
* `admin_id` : `UUID REFERENCES public.profiles(id) ON DELETE SET NULL`
* `target_user_id` : `UUID REFERENCES public.profiles(id) ON DELETE SET NULL`
* `action` : `TEXT NOT NULL` (e.g. `'impersonate_user'`, `'update_ai_key'`, `'verify_payment'`)
* `timestamp` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`
* `ip_address` : `TEXT`
* `reason` : `TEXT`

#### Supporting Tables:
* `processed_telegram_updates`:
  * `update_id` : `BIGINT PRIMARY KEY`
  * `chat_id` : `BIGINT`
  * `processed_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`
* `phone_verifications`:
  * `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  * `phone_number` : `TEXT NOT NULL`
  * `otp_code` : `VARCHAR(6) NOT NULL`
  * `expires_at` : `TIMESTAMPTZ NOT NULL`
  * `is_verified` : `BOOLEAN NOT NULL DEFAULT FALSE`
  * `created_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`
* `reminders`:
  * `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  * `user_id` : `UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE`
  * `is_enabled` : `BOOLEAN NOT NULL DEFAULT TRUE`
  * `frequency` : `INTEGER NOT NULL DEFAULT 1 CHECK (frequency IN (1, 2))`
  * `time_1` : `TIME NOT NULL DEFAULT '09:00:00'`
  * `time_2` : `TIME DEFAULT '19:00:00'`
* `payment_transactions`:
  * `id` : `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  * `user_id` : `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
  * `plan` : `TEXT NOT NULL CHECK (plan IN ('starter', 'pro'))`
  * `payment_method` : `TEXT NOT NULL CHECK (payment_method IN ('midtrans', 'manual_transfer'))`
  * `amount` : `NUMERIC(18, 2) NOT NULL`
  * `order_id` : `TEXT NOT NULL UNIQUE`
  * `status` : `TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired'))`
  * `proof_image_url` : `TEXT`
  * `admin_notes` : `TEXT`
  * `created_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`
  * `updated_at` : `TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')`

---

### 2.2 Gap Analysis: Existing Migrations vs Original Request

Saat memeriksa `supabase/migrations/001_initial_schema.sql` dan `002_rls_and_policies.sql`, ditemukan perbedaan yang perlu disinkronkan oleh tim implementasi (Worker 1):

| Kebutuhan ORIGINAL_REQUEST.md | Kondisi di 001_initial_schema.sql | Solusi / Penyesuaian |
|-------------------------------|-----------------------------------|----------------------|
| `profiles.subscription_status` | Belum ada kolom ini | Tambahkan `subscription_status TEXT DEFAULT 'trial'` |
| `profiles.shared_bot_linked` | Disebut `telegram_connected` | Tambahkan alias atau kolom `shared_bot_linked` |
| `profiles.pairing_code` | Belum ada kolom khusus pairing code | Tambahkan `pairing_code` & `pairing_code_expires_at` |
| `wallets.type` ('cash', 'bank', 'ewallet') | Tidak ada kolom `type` | Tambahkan kolom `type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'ewallet'))` |
| `budgets.month_year` | Dinamakan `month` | Tambahkan kolom atau alias `month_year` |
| `transactions.date_time` | Dinamakan `transaction_time` | Buat alias atau standarisasi ke `date_time` |
| `transactions.source` | `'telegram_receipt'` | ORIGINAL_REQUEST menggunakan `'telegram_photo'`; perbolehkan keduanya di CHECK constraint |
| `transactions.items` | Disimpan di tabel terpisah `receipt_items` saja | Tambahkan kolom `items JSONB` di `transactions` untuk query instan, sekaligus pertahankan tabel `receipt_items` untuk relasi normal |
| `exports_history` | Tabel dinamakan `export_history` (tunggal) | Buat tabel `exports_history` atau CREATE VIEW `exports_history` AS SELECT * FROM `export_history` |
| `ai_call_logs` | Tabel dinamakan `ai_logs` | Buat tabel `ai_call_logs` atau CREATE VIEW `ai_call_logs` dengan kolom `feature`, `prompt_tokens`, `completion_tokens` |
| `admin_audit_logs` | Tabel dinamakan `audit_logs` | Buat tabel `admin_audit_logs` atau CREATE VIEW `admin_audit_logs` |
| **Trigger Balance UPDATE** | Trigger hanya menghandle INSERT & DELETE! Jika nominal diedit, saldo dompet tidak sinkron | **Kritis:** Tambahkan handling `TG_OP = 'UPDATE'` pada trigger saldo dompet |
| **Auth Onboarding Trigger** | Belum ada trigger otomatis pada `auth.users` | Tambahkan trigger PostgreSQL `handle_new_user_onboarding()` |

---

### 2.3 Row Level Security (RLS) Policies

Semua tabel wajib memiliki RLS aktif. Kebijakan yang harus diterapkan:

1. **Admin Helper Function:**
   ```sql
   CREATE OR REPLACE FUNCTION public.is_admin()
   RETURNS BOOLEAN AS $$
   BEGIN
       RETURN EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = auth.uid() AND role = 'admin'
       );
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

2. **User Data Isolation (`profiles`, `wallets`, `budgets`, `transactions`, `exports_history`):**
   * Pola dasar: `auth.uid() = user_id OR public.is_admin()`
   * Khusus `profiles`: `auth.uid() = id OR public.is_admin()`

3. **Shared Categories:**
   * SELECT: `auth.uid() = user_id OR is_system = TRUE OR public.is_admin()`
   * INSERT/UPDATE/DELETE: `(auth.uid() = user_id AND is_system = FALSE) OR public.is_admin()`

4. **Admin-Only Tables (`ai_providers`, `ai_call_logs`, `admin_audit_logs`):**
   * ALL Operations: `public.is_admin()` (atau `service_role` melalui Next.js server route).

5. **Storage Bucket `tatadana-exports`:**
   * Private bucket.
   * SELECT policy: `bucket_id = 'tatadana-exports' AND auth.uid()::text = (storage.foldername(name))[1]`

6. **Supabase Realtime:**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.exports_history;
   ```

---

### 2.4 Triggers & Stored Procedures

#### 1. Perbaikan Trigger Saldo Dompet (`handle_transaction_wallet_balance`)
Trigger ini harus menangani INSERT, DELETE, dan UPDATE (termasuk transfer antar dompet):
```sql
CREATE OR REPLACE FUNCTION public.handle_transaction_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Tangani Reversal untuk DELETE atau UPDATE
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        IF (OLD.type = 'income') THEN
            UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'expense') THEN
            UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'transfer') THEN
            UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
            UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.to_wallet_id;
        END IF;
    END IF;

    -- 2. Tangani Aplikasi Saldo untuk INSERT atau UPDATE
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF (NEW.type = 'income') THEN
            UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'expense') THEN
            UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'transfer') THEN
            UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
            UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.to_wallet_id;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transaction_wallet_balance ON public.transactions;
CREATE TRIGGER trg_transaction_wallet_balance
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_wallet_balance();
```

#### 2. Auth Onboarding Trigger (`handle_new_user_onboarding`)
Saat pengguna register via Email/Password, Google OAuth, atau OTP:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_onboarding()
RETURNS TRIGGER AS $$
DECLARE
    new_user_id UUID := NEW.id;
    user_name TEXT := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna TataDana');
BEGIN
    -- 1. Buat record di profiles
    INSERT INTO public.profiles (id, full_name, role, plan, subscription_status)
    VALUES (new_user_id, user_name, 'user', 'starter', 'trial')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Buat Default Wallets (BCA, Cash, GoPay)
    INSERT INTO public.wallets (user_id, name, type, balance, color, icon, is_default)
    VALUES
        (new_user_id, 'Cash', 'cash', 500000, '#FF6B00', 'wallet', true),
        (new_user_id, 'BCA', 'bank', 2500000, '#00529C', 'credit-card', false),
        (new_user_id, 'GoPay', 'ewallet', 150000, '#00AED6', 'smartphone', false);

    -- 3. Buat Kategori Rekomendasi Finansial Indonesia
    INSERT INTO public.categories (user_id, name, type, emoji, color, is_system)
    VALUES
        (new_user_id, 'Makanan & Minuman', 'expense', '🍜', '#FF6B00', true),
        (new_user_id, 'Transportasi', 'expense', '🚗', '#3B82F6', true),
        (new_user_id, 'Hiburan', 'expense', '🎮', '#8B5CF6', true),
        (new_user_id, 'Tagihan & Utilitas', 'expense', '🏠', '#EF4444', true),
        (new_user_id, 'Kesehatan', 'expense', '💊', '#10B981', true),
        (new_user_id, 'Belanja', 'expense', '👕', '#EC4899', true),
        (new_user_id, 'Pendidikan', 'expense', '📚', '#F59E0B', true),
        (new_user_id, 'Gaji Pokok', 'income', '💰', '#10B981', true),
        (new_user_id, 'Freelance & Bonus', 'income', '💼', '#6366F1', true);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_onboarding();
```

---

### 2.5 Pairing Code & Phone OTP Authentication Flow

1. **Phone Number OTP:**
   * Endpoint: `POST /api/auth/send-otp`  
     * Payload: `{ phoneNumber: "08123456789" }`
     * Normalisasi nomor telepon: `628123456789`
     * Generate 6-digit random code, masa berlaku 5 menit.
     * Simpan di `phone_verifications`.
   * Endpoint: `POST /api/auth/verify-otp`  
     * Payload: `{ phoneNumber: "08123456789", otpCode: "123456", userId?: "..." }`
     * Validasi kode & expired time. Jika valid, update `phone_verifications.is_verified = true` dan `profiles.phone_verified = true`.

2. **Telegram Bot Pairing via `/start <pairing_code>`:**
   * Di dashboard web (Settings > Telegram Bot): Pengguna mengklik tombol "Hubungkan Telegram".
   * Web memanggil endpoint untuk menghasilkan pairing code unik acak 6-8 digit (misal: `TD9482`), disimpan di `profiles.pairing_code` dengan TTL 15 menit.
   * Web menampilkan tombol tautan Telegram: `https://t.me/TataDanaBot?start=TD9482` atau QR code.
   * Pengguna membuka Telegram dan menekan `Start`. Telegram mengirim update: `message.text = "/start TD9482"`.
   * Webhook mengekstrak kode `TD9482`, mencari user di `profiles` di mana `pairing_code = 'TD9482'` dan `pairing_code_expires_at > now()`.
   * Jika cocok:
     * Update `profiles.telegram_chat_id = message.chat.id`
     * Update `profiles.telegram_connected = true` dan `profiles.shared_bot_linked = true`
     * Hapus `pairing_code = NULL`
     * Balas pesan selamat datang ke chat Telegram.

3. **Telegram Bot Pairing via Input Nomor HP:**
   * Alternatif: Pengguna mengetik nomor HP di chat bot: `/start 08123456789` atau mengirim share contact card.
   * Bot membersihkan format menjadi `628123456789`.
   * Mencocokkan dengan `profiles` yang sudah `phone_verified = true`. Jika cocok, bot langsung terhubung!

---

## 3. R2: Telegram Bot Engine & Webhook API Specification

### 3.1 Webhook Endpoint `/api/telegram/webhook` & Idempotency Pipeline

Telegram mengirimkan update via HTTP POST. Struktur penanganan:
1. **Idempotency Guarantee:**
   * Ambil `update.update_id`.
   * Cek di tabel `processed_telegram_updates`.
   * Jika sudah ada, segera hentikan proses dan kirim response HTTP 200 `{ ok: true, status: 'skipped', reason: 'duplicate_update' }`.
   * Jika belum ada, catat `INSERT INTO processed_telegram_updates (update_id, chat_id)`.
2. **Error Isolation:**
   * Endpoint `/api/telegram/webhook` WAJIB mengembalikan HTTP 200 OK bahkan jika terjadi error parsing atau user unlinked, untuk mencegah Telegram melakukan retry loop tak berujung (spamming server).

---

### 3.2 Dual Bot Architecture: Shared Bot vs Custom Bot Token (BYO)

TataDana mendukung dua mode operasional bot Telegram:

#### Mode 1: Shared TataDana Official Bot (`@TataDanaBot`)
* Menggunakan token bot tunggal dari environment: `process.env.TELEGRAM_BOT_TOKEN`.
* Semua pengguna berinteraksi melalui 1 akun bot resmi yang sama.
* Identifikasi profil pengguna dilakukan dengan mencocokkan `update.message.chat.id` ke `profiles.telegram_chat_id`.
* Jika chat ID belum terhubung, bot mengarahkan user untuk melakukan pairing via kode `/start <pairing_code>`.

#### Mode 2: Custom Bot Token (BYO - Bring Your Own Bot)
* Pengguna paket Pro / mandiri dapat membuat bot sendiri melalui `@BotFather` di Telegram.
* Pengguna memasukkan bot token di Web Dashboard: **Settings > Telegram Bot**.
* Endpoint `POST /api/telegram/test-connection`:
  1. **Validasi getMe:** Memanggil `https://api.telegram.org/bot<TOKEN>/getMe`. Memastikan token valid dan mengambil metadata bot (`username`, `first_name`).
  2. **Pemeriksaan Keunikan Token:** Menjalankan query ke `profiles` untuk memastikan token tersebut belum digunakan oleh user lain.
  3. **Pendaftaran setWebhook Otomatis:** Memanggil `https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WEBHOOK_BASE_URL>/api/telegram/webhook`.
  4. Menyimpan token yang dienkripsi ke `profiles.bot_token` dan mengaktifkan status terhubung.
* Saat Webhook menerima pesan dari custom bot, bot membalas menggunakan token bot khusus milik pengguna tersebut.

---

### 3.3 Indonesian Natural Language Parsing Engine

Mesin NLP bertugas membedah kalimat kasual sehari-hari bahasa Indonesia menjadi objek terstruktur:

#### Format Output Terstruktur:
```typescript
interface ParsedTransactionResult {
  jenis: 'pemasukan' | 'pengeluaran' | 'transfer';
  nominal: number;
  kategori: string;
  catatan: string;
  wallet_asal?: string;
  wallet_tujuan?: string;
  items?: Array<{ name: string; price: number; quantity?: number; category?: string }>;
  confidence?: number;
}
```

#### Aturan Parsing Nominal Indonesia:
* `"rb"` / `"ribu"` = `* 1.000` (e.g. `"15rb"` -> `15000`, `"250 ribu"` -> `250000`)
* `"k"` = `* 1.000` (e.g. `"50k"` -> `50000`, `"100K"` -> `100000`)
* `"jt"` / `"juta"` = `* 1.000.000` (e.g. `"8jt"` -> `8000000`, `"7.5jt"` / `"7,5jt"` -> `7500000`)
* `"m"` / `"miliar"` = `* 1.000.000.000` (e.g. `"2m"` -> `2000000000`)
* Standar titik: `"Rp 150.000"` -> `150000`

#### Penanganan Transfer Multi-Dompet:
* Kalimat seperti: `"transfer bca ke gopay 100k"` atau `"tf mandiri ke dana 50rb"`
* Mendeteksi kata kunci: `transfer`, `tf`, `pindah`, `kirim`
* Mengekstrak dompet asal (`wallet_asal`: `"BCA"`) dan dompet tujuan (`wallet_tujuan`: `"GoPay"`).
* Memvalidasi keberadaan dompet tujuan di profil pengguna. Jika tidak ditemukan, bot memberikan opsi daftar dompet yang ada.

---

### 3.4 Multi-Provider AI Failover Architecture

Sistem AI Dispatcher mengimplementasikan pipeline failover cerdas:
1. **Prioritas 1: Google Gemini 1.5 Flash** (Model default: cepat, murah, token context besar, multimodal native).
2. **Prioritas 2 (Fallback): OpenAI GPT-4o-mini** (Diaktifkan jika Gemini mengembalikan error 5xx, rate limit, atau timeout).
3. **Prioritas 3 (Fallback): DeepSeek Chat (V3)** (Model alternatif berbiaya sangat efisien).
4. **Prioritas 4 (Offline Rule-Based Fallback):** Engine regex berbasis aturan bahasa Indonesia (`parseTransactionRuleBased`). Menjamin bot tetap 100% responsif bahkan jika semua API key eksternal habis kuota atau internet terputus!
5. **AI Logging:** Setiap pemanggilan wajib mencatat log ke tabel `ai_call_logs` (provider, feature, tokens, latency, status).

---

### 3.5 Voice Note Audio STT (.oga/.ogg Telegram)

Fitur pencatatan suara Voice Note dapat diakses oleh **SEMUA PAKET** (Starter & Pro) sesuai Part 4.3:
1. **Deteksi Pesan Suara:** Mendeteksi objek `message.voice` atau `message.audio`.
2. **Validasi Durasi:** Durasi maksimal adalah **60 detik**. Jika melebihi 60 detik, bot menolak dengan pesan ramah:
   `⏱️ Rekaman suara terlalu panjang ([X] detik). Maksimal durasi voice note adalah 60 detik agar pemrosesan optimal.`
3. **Download Audio Telegram:**
   * Ambil file path: `GET https://api.telegram.org/bot<TOKEN>/getFile?file_id=<FILE_ID>`.
   * Unduh buffer binary file audio `.oga` / `.ogg` (Opus).
4. **Transkripsi STT:**
   * Mengirim audio buffer ke Google Gemini Multimodal Audio API (`audio/ogg`) atau OpenAI Whisper API (`whisper-1`, language `id`).
5. **Proses & Reply:**
   * Teks hasil transkripsi diteruskan ke parser transaksi NLP.
   * Transaksi disimpan dengan `source = 'telegram_voice'` dan `voice_transcript = "<TEKS>"`.
   * Format balasan bot menyertakan header transkrip: `🎙️ Transkrip: "<TEKS>"` sebelum detail nota.

---

### 3.6 Foto Struk Multimodal OCR (Pro Only)

Fitur ekstraksi foto struk belanja otomatis:
1. **Pengecekan Paket:**
   * Jika pengguna berstatus **Starter**:  
     Bot menolak foto struk dengan pesan sopan dan CTA upgrade:  
     `📸 Fitur Catat Struk via AI Vision Khusus Paket Pro!`  
     `Pengguna paket Starter hanya dapat mencatat via teks & voice note. Upgrade ke Pro sekarang untuk scan struk otomatis tanpa ribet! 💎`  
     `👉 [Link Upgrade]`
2. **Pemrosesan Paket Pro:**
   * Ambil foto resolusi tertinggi dari array `message.photo`.
   * Unduh file gambar dari Telegram CDN.
   * Kirim ke Gemini 1.5 Flash Vision dengan prompt ekstraksi struk belanja Indonesia terstruktur.
   * Ekstraksi mencakup:
     * `merchantName` (Nama toko/kasir, e.g. "Indomaret", "Starbucks", "Apotek K-24")
     * `totalAmount` (Total nominal pembayaran)
     * `items` (Daftar rincian item: nama produk, harga satuan, kuantitas, kategori)
   * Simpan 1 transaksi induk di `transactions` (`source = 'telegram_photo'`), dan rincian item di `transactions.items` serta tabel relasional `receipt_items`.
   * Kirim balasan nota ringkasan struk belanja dengan daftar item.

---

### 3.7 Bot Commands Lengkap (WIB Timezone)

Semua perintah bot diformat dalam zona waktu **Asia/Jakarta (WIB)**:

#### 1. Header Timestamp Standar Bot:
`📅 [Hari], [Tanggal] [Bulan] [Tahun] — [Jam]:[Menit] WIB`  
Contoh: `📅 Sabtu, 10 Oktober 2026 — 13:45 WIB`

#### 2. `/saldo`
* Menampilkan daftar semua dompet aktif pengguna (`wallets`).
* Menandai dompet default dengan badge `(Utama ⭐️)`.
* Menampilkan total akumulasi saldo seluruh dompet.
* Format:
  ```
  👛 Saldo Dompet Kamu:

  ├ 💳 Cash / Tunai (Utama ⭐️) : Rp500.000
  ├ 🏦 BCA Tahapan : Rp4.750.000
  └ 📱 GoPay : Rp320.000

  💰 Total Keseluruhan: Rp5.570.000
  ```

#### 3. `/hari_ini`
* Menghitung total pemasukan dan pengeluaran hari ini (00:00:00 - 23:59:59 WIB).
* Menampilkan ringkasan cashflow harian dan 5 transaksi terakhir hari ini.
* Format:
  ```
  📅 Sabtu, 10 Oktober 2026 — 13:45 WIB
  📊 Rekap Transaksi Hari Ini:

  ├ 💰 Pemasukan : Rp0
  ├ 💸 Pengeluaran : Rp45.000
  └ 📈 Net Cashflow : -Rp45.000

  📝 Rincian Hari Ini (2 transaksi):
  • 🍜 Bakso Pak Min — Rp25.000 (Cash)
  • ☕ Kopi Kenangan — Rp20.000 (GoPay)
  ```

#### 4. `/minggu_ini`
* Menghitung transaksi 7 hari terakhir (WIB).
* Menampilkan total masuk, total keluar, dan Top 3 kategori pengeluaran terbanyak minggu ini.
* Format:
  ```
  📅 Rekap 7 Hari Terakhir:
  ├ 💰 Total Pemasukan : Rp2.500.000
  ├ 💸 Total Pengeluaran : Rp850.000
  └ 📈 Sisa Cashflow : +Rp1.650.000

  🔥 Top 3 Pengeluaran:
  1. 🍜 Makanan & Minuman : Rp450.000
  2. 🚗 Transportasi : Rp220.000
  3. 🏠 Tagihan : Rp180.000
  ```

#### 5. `/bulan_ini`
* Menghitung transaksi bulan berjalan (`YYYY-MM` WIB).
* Menampilkan rekap total pemasukan, pengeluaran, tabungan bersih, dan pengeluaran per kategori.
* Format:
  ```
  📅 Rekap Bulan Oktober 2026:
  ├ 💰 Total Pemasukan : Rp8.000.000
  ├ 💸 Total Pengeluaran : Rp3.250.000
  └ 🛡️ Net Tabungan : +Rp4.750.000

  📁 Pengeluaran per Kategori:
  • 🍜 Makanan & Minuman : Rp1.250.000
  • 🏠 Tagihan & Utilitas : Rp950.000
  • 🚗 Transportasi : Rp600.000
  • 👕 Belanja : Rp450.000
  ```

#### 6. `/budget`
* Menampilkan status seluruh target budget kategori bulan berjalan.
* Disertai visual progress bar 10 blok (█ dan ░) dan sisa nominal.
* Menampilkan badge peringatan jika terpakai >= 80% atau >= 100%.
* Format:
  ```
  🎯 Status Budget Bulan Ini (Oktober 2026):

  🍜 Makanan & Minuman
  ███████░░░ 70% — Terpakai: Rp1.050.000 / Rp1.500.000 (Sisa: Rp450.000)

  🚗 Transportasi
  █████████░ 88% — Terpakai: Rp440.000 / Rp500.000 (Sisa: Rp60.000)
  ⚠️ Perhatian! Budget mendekati batas 80%.

  🎮 Hiburan
  ██████████ 105% — Terpakai: Rp315.000 / Rp300.000 (Over: -Rp15.000)
  🚨 AWAS! Budget sudah melewati batas 100%!
  ```

#### 7. `/bantuan`
* Panduan lengkap perintah bot, format pengetikan cepat, tips voice note, dan scan struk.

---

### 3.8 Visual Budget Progress Bar & Alert Logic

Fungsi generator progress bar:
```typescript
export function generateProgressBar(percentage: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const filledBlocks = Math.round(clamped / 10);
  const emptyBlocks = 10 - filledBlocks;
  return `${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)} ${clamped}%`;
}
```

#### Alert Trigger:
* **Ambang 80%:** Jika `percentage >= 80` dan `alert_80_sent == false`:
  * Kirim notifikasi peringatan di pesan nota: `⚠️ Perhatian! Budget kategori ini sudah mencapai 80%, hemat-hemat ya!`
  * Update `budgets.alert_80_sent = true`.
* **Ambang 100%:** Jika `percentage >= 100` dan `alert_100_sent == false`:
  * Kirim notifikasi peringatan darurat: `🚨 AWAS! Budget [Kategori] kamu sudah melebihi batas 100%! Rem dulu ya 🛑`
  * Update `budgets.alert_100_sent = true`.

---

### 3.9 Interactive In-App Bot Simulator

Untuk menjamin kelancaran testing di localhost tanpa membutuhkan tunnel eksternal (seperti ngrok):
1. **Halaman Khusus:** `/dashboard/simulator` dan floating interactive modal simulator di dashboard.
2. **Tampilan UI:** Tampilan replika obrolan Telegram mobile otentik (chat bubble hijau/abu, timestamp WIB, avatar TataDana Bot).
3. **Fitur Pengujian:**
   * **Chat Teks Kasual:** Uji kalimat Indonesia langsung ("beli seblak 15rb", "/saldo", "/budget").
   * **Upload Foto Struk:** Uji ekstraksi struk gambar (drag and drop atau file picker).
   * **Upload / Record Voice Note:** Uji transkripsi suara via perekam mikrofon browser langsung.
   * **Realtime Sync:** Transaksi yang dicatat di simulator langsung tersimpan ke Supabase / AppContext dan seketika meng-update stats card dashboard tanpa refresh browser!

---

### 3.10 Starter vs Pro Limits Matrix

| Fitur / Parameter | Paket Starter | Paket Pro | Logika Penegakan |
|-------------------|---------------|-----------|------------------|
| Transaksi per Bulan | Maksimal 50 transaksi | Unlimited (Tanpa Batas) | Cek count `transactions` bulan berjalan; tolak transaksi ke-51 dengan pesan sopan |
| Jumlah Dompet (`wallets`) | Maksimal 3 dompet | Unlimited | Validasi di endpoint/context saat pembuatan dompet |
| Kategori Budget (`budgets`) | Maksimal 5 kategori | Unlimited | Validasi saat menetapkan budget |
| Input Chat Teks Kasual | ✅ Diizinkan | ✅ Diizinkan | Menggunakan Google Gemini Flash + Fallback |
| Input Voice Note (.oga/.ogg) | ✅ Diizinkan (Maks 60s) | ✅ Diizinkan (Maks 60s) | Tersedia untuk semua paket sesuai Part 4.3 |
| Foto Struk AI OCR | ❌ Ditolak (CTA Upgrade) | ✅ Diizinkan | Cek `profile.plan == 'pro'` |
| AI Financial Advisor | ❌ Tidak aktif | ✅ Peringatan Proaktif | Analisis lonjakan pengeluaran >50% atau rasio >80% |
| Export Laporan (PDF/Excel) | ❌ Tidak aktif | ✅ Diizinkan | Cek `profile.plan == 'pro'` saat trigger ekspor |

---

## 4. Interface Contracts & API Schemas

### 4.1 Webhook Update Payload (Telegram -> TataDana)
```typescript
export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; first_name: string; username?: string };
    chat: { id: number; type: string };
    date: number;
    text?: string;
    caption?: string;
    photo?: Array<{ file_id: string; file_unique_id: string; width: number; height: number; file_size?: number }>;
    voice?: { file_id: string; file_unique_id: string; duration: number; mime_type?: string };
    audio?: { file_id: string; file_unique_id: string; duration: number; mime_type?: string };
  };
}
```

### 4.2 Webhook Response Contract (TataDana -> Telegram)
HTTP 200 OK:
```json
{
  "ok": true,
  "result": {
    "status": "success" | "command_executed" | "skipped" | "limit_exceeded" | "ocr_upgrade_required",
    "reason": "Update already processed (idempotent)"
  }
}
```

### 4.3 Test Bot Token & Set Webhook Payload
`POST /api/telegram/test-connection`
```json
// Request
{
  "token": "1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ",
  "userId": "usr-dimas-001"
}

// Response Success
{
  "ok": true,
  "botInfo": {
    "id": 1234567890,
    "username": "MyTataDanaBot",
    "first_name": "TataDana Keuangan"
  },
  "webhookRegistered": true,
  "message": "Bot @MyTataDanaBot berhasil terhubung dan siap menerima pesan!"
}
```

---

## 5. Actionable Implementation Checklist for Workers

### Worker 1 (R1 - Database & Supabase Auth):
- [ ] Buat file migrasi sinkronisasi `004_align_r1_schema.sql` untuk:
  - Menambahkan kolom `subscription_status` (`'trial'`), `shared_bot_linked`, `pairing_code`, `pairing_code_expires_at` pada `profiles`.
  - Menambahkan kolom `type` (`'cash' | 'bank' | 'ewallet'`) pada tabel `wallets`.
  - Memperbaiki trigger `handle_transaction_wallet_balance()` agar menangani `TG_OP = 'UPDATE'`.
  - Membuat trigger onboarding `handle_new_user_onboarding()` pada `auth.users`.
  - Menambahkan kolom `items JSONB` pada `transactions` dan memastikan relasi `receipt_items`.
  - Membuat views atau menyelaraskan nama tabel `exports_history`, `ai_call_logs`, `admin_audit_logs`.
- [ ] Pastikan seluruh RLS policies aktif dan valid untuk semua tabel.
- [ ] Implementasikan endpoint OTP pairing code di `/api/auth/send-otp` dan `/api/auth/verify-otp`.

### Worker 2 (R2 - Telegram Bot Engine & Webhook API):
- [ ] Lengkapi handler perintah bot di `src/lib/telegram/webhook-handler.ts`:
  - Tambahkan implementasi `/hari_ini` (rekap hari ini WIB).
  - Tambahkan implementasi `/minggu_ini` (rekap 7 hari terakhir WIB).
  - Tambahkan implementasi `/bulan_ini` (rekap bulan berjalan WIB).
- [ ] Perbaiki /start pairing handler agar mendukung pairing code acak 6-8 digit (`/start <pairing_code>`) dan nomor HP.
- [ ] Pastikan downloader audio Telegram (`getFile` -> fetch arrayBuffer) terhubung dengan multimodal Gemini / Whisper STT tanpa fallback dummy.
- [ ] Pastikan downloader foto struk terhubung dengan Gemini Vision OCR dengan format items breakdown JSON.
- [ ] Pastikan penegakan limit 50 transaksi/bulan untuk Starter dan penolakan foto struk dengan CTA upgrade berfungsi konsisten.
- [ ] Pastikan In-App Bot Simulator di `/dashboard/simulator` terhubung penuh dengan webhook pipeline.
