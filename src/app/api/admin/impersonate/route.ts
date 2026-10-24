import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { adminId, targetUserId, reason } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID diperlukan' }, { status: 400 });
    }

    const { data: targetUser } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Record impersonation in audit log
    await supabaseAdmin.from('audit_logs').insert({
      admin_id: adminId || null,
      target_user_id: targetUserId,
      action: 'impersonate_user',
      reason: reason || 'Support debugging / troubleshooting view',
    });

    return NextResponse.json({
      success: true,
      targetUser,
      impersonationToken: `imp_${targetUserId}_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
