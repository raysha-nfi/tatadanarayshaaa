# TataDana Supabase Migrations

Folder ini berisi skema database lengkap untuk TataDana.

## Urutan Migrasi:
1. `001_initial_schema.sql` - Skema tabel profiles, wallets, categories, budgets, transactions, receipt_items, export_history, ai_providers, ai_logs, audit_logs, payment_transactions, dll. Disertai trigger kalkulasi saldo otomatis dan timezone Asia/Jakarta (WIB).
2. `002_rls_and_policies.sql` - Pengaturan Row Level Security (RLS) lengkap dan realtime publication.
3. `003_seed_data.sql` - Seed provider AI awal (Gemini, GPT, DeepSeek) dan Supabase Storage bucket privat `tatadana-exports`.

## Cara Menjalankan di Supabase Baru:
```bash
# Menggunakan Supabase CLI:
supabase link --project-ref your-project-ref
supabase db push

# Atau copy-paste SQL ke SQL Editor di Supabase Dashboard secara berurutan (001 -> 002 -> 003).
```
