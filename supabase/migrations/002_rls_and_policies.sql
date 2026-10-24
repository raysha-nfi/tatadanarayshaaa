-- ═══════════════════════════════════════════════════════════════════════════════
-- TATADANA DATABASE MIGRATION 002: ROW LEVEL SECURITY & POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_telegram_updates ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Enable insert for authenticated users" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- 2. Wallets Policies
CREATE POLICY "Users can manage own wallets" 
    ON public.wallets FOR ALL 
    USING (auth.uid() = user_id OR public.is_admin());

-- 3. Categories Policies
CREATE POLICY "Users can view own and system categories" 
    ON public.categories FOR SELECT 
    USING (auth.uid() = user_id OR is_system = TRUE OR public.is_admin());

CREATE POLICY "Users can insert own categories" 
    ON public.categories FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own categories" 
    ON public.categories FOR UPDATE 
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own categories" 
    ON public.categories FOR DELETE 
    USING (auth.uid() = user_id OR public.is_admin());

-- 4. Budgets Policies
CREATE POLICY "Users can manage own budgets" 
    ON public.budgets FOR ALL 
    USING (auth.uid() = user_id OR public.is_admin());

-- 5. Transactions Policies
CREATE POLICY "Users can manage own transactions" 
    ON public.transactions FOR ALL 
    USING (auth.uid() = user_id OR public.is_admin());

-- 6. Receipt Items Policies
CREATE POLICY "Users can view receipt items through transaction" 
    ON public.receipt_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.transactions 
            WHERE transactions.id = receipt_items.transaction_id 
            AND (transactions.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Users can manage receipt items through transaction" 
    ON public.receipt_items FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.transactions 
            WHERE transactions.id = receipt_items.transaction_id 
            AND (transactions.user_id = auth.uid() OR public.is_admin())
        )
    );

-- 7. Export History Policies
CREATE POLICY "Users can manage own export history" 
    ON public.export_history FOR ALL 
    USING (auth.uid() = user_id OR public.is_admin());

-- 8. Reminders Policies
CREATE POLICY "Users can manage own reminders" 
    ON public.reminders FOR ALL 
    USING (auth.uid() = user_id OR public.is_admin());

-- 9. AI Providers & System Settings (Admin only)
CREATE POLICY "Admin full access to AI Providers" 
    ON public.ai_providers FOR ALL 
    USING (public.is_admin());

CREATE POLICY "Admin full access to AI System Settings" 
    ON public.ai_system_settings FOR ALL 
    USING (public.is_admin());

-- 10. AI Logs Policies
CREATE POLICY "Admin full access to AI logs" 
    ON public.ai_logs FOR ALL 
    USING (public.is_admin());

-- 11. Audit Logs Policies
CREATE POLICY "Admin full access to Audit logs" 
    ON public.audit_logs FOR ALL 
    USING (public.is_admin());

-- 12. Payment Transactions Policies
CREATE POLICY "Users can view own payments or admin" 
    ON public.payment_transactions FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own payments" 
    ON public.payment_transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admin can update payments" 
    ON public.payment_transactions FOR UPDATE 
    USING (public.is_admin());

-- Enable Realtime on tables for live UI sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.export_history;
