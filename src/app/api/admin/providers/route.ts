import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { data: providers, error } = await supabaseAdmin
      .from('ai_providers')
      .select('*')
      .order('priority', { ascending: true });

    const { data: settings } = await supabaseAdmin
      .from('ai_system_settings')
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, providers, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, provider, executionMode, primaryProviderId } = body;

    if (action === 'update_settings') {
      const { data, error } = await supabaseAdmin
        .from('ai_system_settings')
        .upsert({
          id: 1,
          execution_mode: executionMode,
          primary_provider_id: primaryProviderId || null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, settings: data });
    }

    if (action === 'save_provider') {
      const { id, name, display_name, is_active, priority, encrypted_api_key, model_name } = provider;

      const { data, error } = await supabaseAdmin
        .from('ai_providers')
        .upsert({
          id: id || undefined,
          name,
          display_name,
          is_active,
          priority: Number(priority),
          encrypted_api_key,
          model_name,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, provider: data });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
