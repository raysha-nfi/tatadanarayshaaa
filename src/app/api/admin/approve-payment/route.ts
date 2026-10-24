import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { paymentId, action, adminNotes, adminId } = await req.json();

    if (!paymentId || !action) {
      return NextResponse.json({ error: 'ID Pembayaran dan tindakan diperlukan' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: payment, error } = await supabaseAdmin
      .from('payment_transactions')
      .update({
        status: newStatus,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select('*, user:profiles!user_id(*)')
      .single();

    if (error) throw error;

    // If approved, update user plan
    if (newStatus === 'approved') {
      await supabaseAdmin
        .from('profiles')
        .update({
          plan: payment.plan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.user_id);
    }

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      admin_id: adminId || null,
      target_user_id: payment.user_id,
      action: `${action}_payment`,
      reason: adminNotes || `Payment order ${payment.order_id} ${newStatus}`,
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
