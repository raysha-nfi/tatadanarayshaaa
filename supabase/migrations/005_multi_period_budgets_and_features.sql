-- ═══════════════════════════════════════════════════════════════════════════════
-- TATADANA DATABASE MIGRATION 005: MULTI-PERIOD BUDGETS, CALENDAR, & TATA AI
-- Timezone: Asia/Jakarta (WIB)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Extend Budgets Table to Support Multi-Tier Periods (Daily, Weekly, Monthly, Yearly)
ALTER TABLE public.budgets 
    ADD COLUMN IF NOT EXISTS period_type TEXT NOT NULL DEFAULT 'monthly' 
        CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    ADD COLUMN IF NOT EXISTS period_key TEXT NOT NULL DEFAULT '2026-10';

-- Drop old unique constraint if present and create a unified one
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS uq_user_category_month;
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS uq_user_category_period;
ALTER TABLE public.budgets 
    ADD CONSTRAINT uq_user_category_period 
    UNIQUE (user_id, category_id, period_type, period_key);

-- 2. Recurring Bills & Cashflow Agenda (For Financial Calendar)
CREATE TABLE IF NOT EXISTS public.recurring_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- RLS for recurring_bills
ALTER TABLE public.recurring_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own recurring bills"
    ON public.recurring_bills FOR ALL
    USING (auth.uid() = user_id);

-- 3. Tata AI Interactive Financial Assistant Messages
CREATE TABLE IF NOT EXISTS public.tata_ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'telegram')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- RLS for tata_ai_messages
ALTER TABLE public.tata_ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own Tata AI messages"
    ON public.tata_ai_messages FOR ALL
    USING (auth.uid() = user_id);

-- 4. Manual Payment Verification Queue (Approved Admin)
CREATE TABLE IF NOT EXISTS public.payment_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL UNIQUE,
    amount NUMERIC(18, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'manual_transfer',
    bank_name TEXT NOT NULL DEFAULT 'BCA',
    account_number TEXT,
    account_name TEXT,
    proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- RLS for payment_approvals
ALTER TABLE public.payment_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments"
    ON public.payment_approvals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments"
    ON public.payment_approvals FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
