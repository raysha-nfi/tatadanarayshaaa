import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { adminId, targetUserId, reason } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID diperlukan' }, { status: 400 });
    }

    // MANDATORY AUDIT LOG: Record admin access to user transaction data for privacy
    await supabaseAdmin.from('audit_logs').insert({
      admin_id: adminId || null,
      target_user_id: targetUserId,
      action: 'view_transactions',
      reason: reason || 'Support inspection request',
    });

    // Query target user transactions
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('*, wallet:wallets!wallet_id(*), category:categories(*), receipt_items(*)')
      .eq('user_id', targetUserId)
      .order('transaction_time', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
