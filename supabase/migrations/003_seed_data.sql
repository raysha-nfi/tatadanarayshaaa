-- ═══════════════════════════════════════════════════════════════════════════════
-- TATADANA DATABASE MIGRATION 003: SEED DATA & STORAGE SETUP
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Default Multi-Provider AI Configuration
INSERT INTO public.ai_providers (id, name, display_name, is_active, priority, encrypted_api_key, model_name)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'gemini', 'Google Gemini 1.5 Flash', true, 1, 'ENV_OR_ADMIN_SET', 'gemini-1.5-flash'),
    ('c0000000-0000-0000-0000-000000000002', 'openai', 'OpenAI GPT-4o-mini', true, 2, 'ENV_OR_ADMIN_SET', 'gpt-4o-mini'),
    ('c0000000-0000-0000-0000-000000000003', 'deepseek', 'DeepSeek Chat (V3)', true, 3, 'ENV_OR_ADMIN_SET', 'deepseek-chat')
ON CONFLICT (name) DO UPDATE
SET display_name = EXCLUDED.display_name,
    priority = EXCLUDED.priority,
    model_name = EXCLUDED.model_name;

-- 2. Storage Bucket Creation for Exported Reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'tatadana-exports',
    'tatadana-exports',
    false, -- Private bucket
    52428800, -- 50 MB
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Users can only download their own exported files via signed URL
CREATE POLICY "Users can download own exports"
ON storage.objects FOR SELECT
USING (bucket_id = 'tatadana-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Service role can insert exports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tatadana-exports');
