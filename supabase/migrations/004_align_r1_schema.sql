-- ═══════════════════════════════════════════════════════════════════════════════
-- TATADANA DATABASE MIGRATION 004: ALIGN R1 SCHEMA & TRIGGERS
-- Timezone: Asia/Jakarta (WIB)
-- Description:
--   1. Profiles: subscription_status, pairing_code, shared_bot_linked, pairing_code_expires_at
--   2. Wallets: type ('cash', 'bank', 'ewallet')
--   3. Transactions: source supporting 'telegram_photo', items JSONB default '[]'::jsonb
--   4. Handle transaction wallet balance: UPDATE delta adjustment + transfer handling
--   5. Auth onboarding trigger on auth.users: auto-provision default wallets & categories
--   6. Supporting views & schema alignments (exports_history, ai_call_logs, admin_audit_logs)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. PROFILES TABLE ALIGNMENT
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing';

-- Ensure check constraint on subscription_status ('active', 'past_due', 'canceled', 'trialing')
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_subscription_status_check 
    CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing', 'trial', 'expired'));

ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS pairing_code TEXT;

ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS pairing_code_expires_at TIMESTAMPTZ;

ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS shared_bot_linked BOOLEAN DEFAULT FALSE;

-- Sync existing telegram_connected with shared_bot_linked if needed
UPDATE public.profiles 
SET shared_bot_linked = telegram_connected 
WHERE shared_bot_linked IS FALSE AND telegram_connected IS TRUE;

CREATE INDEX IF NOT EXISTS idx_profiles_pairing_code 
    ON public.profiles(pairing_code);

CREATE INDEX IF NOT EXISTS idx_profiles_phone 
    ON public.profiles(phone_number);

-- 2. WALLETS TABLE ALIGNMENT
ALTER TABLE public.wallets 
    ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'cash';

ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS wallets_type_check;
ALTER TABLE public.wallets ADD CONSTRAINT wallets_type_check 
    CHECK (type IN ('cash', 'bank', 'ewallet'));

-- Set type for existing default wallets if missing
UPDATE public.wallets SET type = 'cash' WHERE type IS NULL;
UPDATE public.wallets SET type = 'bank' WHERE type = 'cash' AND (lower(name) LIKE '%bca%' OR lower(name) LIKE '%bank%' OR lower(name) LIKE '%mandiri%');
UPDATE public.wallets SET type = 'ewallet' WHERE type = 'cash' AND (lower(name) LIKE '%gopay%' OR lower(name) LIKE '%ovo%' OR lower(name) LIKE '%dana%');

-- 3. TRANSACTIONS TABLE ALIGNMENT
-- Ensure source supports 'telegram_photo' (in addition to 'web', 'telegram_text', 'telegram_receipt', 'telegram_voice')
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_source_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_source_check 
    CHECK (source IN ('web', 'telegram_text', 'telegram_photo', 'telegram_receipt', 'telegram_voice'));

-- Add items JSONB for multi-item breakdown
ALTER TABLE public.transactions 
    ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Ensure date_time column alias exists for standardized WIB queries
ALTER TABLE public.transactions 
    ADD COLUMN IF NOT EXISTS date_time TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'Asia/Jakarta');

UPDATE public.transactions 
SET date_time = transaction_time 
WHERE date_time IS NULL AND transaction_time IS NOT NULL;

-- 4. BUDGETS TABLE ALIGNMENT
ALTER TABLE public.budgets 
    ADD COLUMN IF NOT EXISTS month_year TEXT;

UPDATE public.budgets 
SET month_year = month 
WHERE month_year IS NULL AND month IS NOT NULL;

-- 5. WALLET BALANCE TRIGGER ENHANCEMENT (INSERT, UPDATE, DELETE)
-- Calculates delta for UPDATE operations:
--   For income: balance += (NEW.amount - OLD.amount)
--   For expense: balance -= (NEW.amount - OLD.amount)
--   For transfer: source -= (NEW.amount - OLD.amount), dest += (NEW.amount - OLD.amount)
-- Reversal of OLD row followed by application of NEW row handles delta as well as wallet/type changes flawlessly.
CREATE OR REPLACE FUNCTION public.handle_transaction_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Reversal Step (for DELETE or UPDATE)
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        IF (OLD.type = 'income') THEN
            UPDATE public.wallets 
            SET balance = balance - OLD.amount,
                updated_at = (now() AT TIME ZONE 'Asia/Jakarta')
            WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'expense') THEN
            UPDATE public.wallets 
            SET balance = balance + OLD.amount,
                updated_at = (now() AT TIME ZONE 'Asia/Jakarta')
            WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'transfer') THEN
            -- Revert deduction from source wallet
            UPDATE public.wallets 
            SET balance = balance + OLD.amount,
                updated_at = (now() AT TIME ZONE 'Asia/Jakarta')
            WHERE id = OLD.wallet_id;
            
            -- Revert addition to destination wallet
            IF OLD.to_wallet_id IS NOT NULL THEN
                UPDATE public.wallets 
                SET balance = balance - OLD.amount,
                    updated_at = (now() AT TIME ZONE 'Asia/Jakarta')
                WHERE id = OLD.to_wallet_id;
            END IF;
        END IF;
    END IF;

    -- 2. Application Step (for INSERT or UPDATE)
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF (NEW.type = 'income') THEN
            UPDATE public.wallets 
            SET balance = balance + NEW.amount,
                updated_at = (now() AT TIME ZONE 'Asia/Jakarta')
            WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'expense') THEN
            UPDATE public.wallets 
            SET balance = balance - NEW.amount,
                updated_at = (now() AT TIME ZONE 'Asia/Jakarta')
            WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'transfer') THEN
            -- Apply deduction to source wallet
            UPDATE public.wallets 
            SET balance = balance - NEW.amount,
                updated_at = (now() AT TIME ZONE 'Asia/Jakarta')
            WHERE id = NEW.wallet_id;
            
            -- Apply addition to destination wallet
            IF NEW.to_wallet_id IS NOT NULL THEN
                UPDATE public.wallets 
                SET balance = balance + NEW.amount,
                    updated_at = (now() AT TIME ZONE 'Asia/Jakarta')
                WHERE id = NEW.to_wallet_id;
            END IF;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on transactions for INSERT, UPDATE, and DELETE
DROP TRIGGER IF EXISTS trg_transaction_wallet_balance ON public.transactions;
CREATE TRIGGER trg_transaction_wallet_balance
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_wallet_balance();

-- 6. AUTH ONBOARDING HOOK: TRIGGER ON auth.users
-- Automatically provisions profile, default wallets (Cash, BCA, GoPay), and default Indonesian financial categories.
CREATE OR REPLACE FUNCTION public.handle_new_user_onboarding()
RETURNS TRIGGER AS $$
DECLARE
    new_user_id UUID := NEW.id;
    user_display_name TEXT;
BEGIN
    user_display_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NULLIF(split_part(NEW.email, '@', 1), ''),
        'Pengguna TataDana'
    );

    -- 1. Create or align profiles entry
    INSERT INTO public.profiles (
        id,
        full_name,
        phone_number,
        phone_verified,
        plan,
        role,
        subscription_status,
        shared_bot_linked,
        currency
    )
    VALUES (
        new_user_id,
        user_display_name,
        NEW.phone,
        (NEW.phone_confirmed_at IS NOT NULL),
        'starter',
        'user',
        'trialing',
        FALSE,
        'IDR'
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
        updated_at = (now() AT TIME ZONE 'Asia/Jakarta');

    -- 2. Auto-provision default wallets (BCA, Cash, GoPay)
    IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE user_id = new_user_id) THEN
        INSERT INTO public.wallets (user_id, name, type, balance, color, icon, is_default)
        VALUES
            (new_user_id, 'Cash', 'cash', 500000.00, '#FF6B00', 'wallet', TRUE),
            (new_user_id, 'BCA', 'bank', 2500000.00, '#00529C', 'credit-card', FALSE),
            (new_user_id, 'GoPay', 'ewallet', 150000.00, '#00AED6', 'smartphone', FALSE);
    END IF;

    -- 3. Auto-provision Indonesian financial recommended categories
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = new_user_id) THEN
        INSERT INTO public.categories (user_id, name, type, emoji, color, is_system)
        VALUES
            (new_user_id, 'Makanan & Minuman', 'expense', '🍜', '#FF6B00', TRUE),
            (new_user_id, 'Transportasi', 'expense', '🚗', '#3B82F6', TRUE),
            (new_user_id, 'Hiburan', 'expense', '🎮', '#8B5CF6', TRUE),
            (new_user_id, 'Tagihan & Utilitas', 'expense', '🏠', '#EF4444', TRUE),
            (new_user_id, 'Kesehatan', 'expense', '💊', '#10B981', TRUE),
            (new_user_id, 'Belanja', 'expense', '👕', '#EC4899', TRUE),
            (new_user_id, 'Pendidikan', 'expense', '📚', '#F59E0B', TRUE),
            (new_user_id, 'Gaji Pokok', 'income', '💰', '#10B981', TRUE),
            (new_user_id, 'Freelance & Bonus', 'income', '💼', '#6366F1', TRUE);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users if auth schema exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_onboarding();
    END IF;
END $$;

-- 7. REUSABLE STORED PROCEDURE FOR MANUAL/TEST ONBOARDING PROVISION
CREATE OR REPLACE FUNCTION public.provision_user_defaults(
    p_user_id UUID,
    p_full_name TEXT DEFAULT 'Pengguna TataDana'
)
RETURNS VOID AS $$
BEGIN
    -- Ensure profile exists
    INSERT INTO public.profiles (
        id,
        full_name,
        plan,
        role,
        subscription_status,
        shared_bot_linked,
        currency
    )
    VALUES (
        p_user_id,
        p_full_name,
        'starter',
        'user',
        'trialing',
        FALSE,
        'IDR'
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(p_full_name, public.profiles.full_name);

    -- Provision default wallets if none exist
    IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE user_id = p_user_id) THEN
        INSERT INTO public.wallets (user_id, name, type, balance, color, icon, is_default)
        VALUES
            (p_user_id, 'Cash', 'cash', 500000.00, '#FF6B00', 'wallet', TRUE),
            (p_user_id, 'BCA', 'bank', 2500000.00, '#00529C', 'credit-card', FALSE),
            (p_user_id, 'GoPay', 'ewallet', 150000.00, '#00AED6', 'smartphone', FALSE);
    END IF;

    -- Provision default categories if none exist
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = p_user_id) THEN
        INSERT INTO public.categories (user_id, name, type, emoji, color, is_system)
        VALUES
            (p_user_id, 'Makanan & Minuman', 'expense', '🍜', '#FF6B00', TRUE),
            (p_user_id, 'Transportasi', 'expense', '🚗', '#3B82F6', TRUE),
            (p_user_id, 'Hiburan', 'expense', '🎮', '#8B5CF6', TRUE),
            (p_user_id, 'Tagihan & Utilitas', 'expense', '🏠', '#EF4444', TRUE),
            (p_user_id, 'Kesehatan', 'expense', '💊', '#10B981', TRUE),
            (p_user_id, 'Belanja', 'expense', '👕', '#EC4899', TRUE),
            (p_user_id, 'Pendidikan', 'expense', '📚', '#F59E0B', TRUE),
            (p_user_id, 'Gaji Pokok', 'income', '💰', '#10B981', TRUE),
            (p_user_id, 'Freelance & Bonus', 'income', '💼', '#6366F1', TRUE);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. COMPATIBILITY VIEWS FOR ORIGINAL REQUEST TABLE NAMES
CREATE OR REPLACE VIEW public.exports_history AS
SELECT 
    id,
    user_id,
    file_name,
    COALESCE(signed_url, file_path) AS file_url,
    format AS file_type,
    period_start,
    period_end,
    expires_at,
    created_at
FROM public.export_history;

CREATE OR REPLACE VIEW public.ai_call_logs AS
SELECT 
    id,
    user_id,
    provider,
    action AS feature,
    tokens_used AS prompt_tokens,
    0 AS completion_tokens,
    status,
    latency_ms,
    prompt_preview,
    response_preview,
    error_message,
    created_at
FROM public.ai_logs;

CREATE OR REPLACE VIEW public.admin_audit_logs AS
SELECT 
    id,
    admin_id,
    target_user_id,
    action,
    ip_address,
    reason,
    created_at AS timestamp
FROM public.audit_logs;
