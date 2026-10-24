import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = payload;

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // 1. Signature Verification (if MIDTRANS_SERVER_KEY is configured)
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (serverKey && signature_key && status_code && gross_amount) {
      const expectedSignature = crypto
        .createHash('sha512')
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest('hex');

      if (signature_key !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature key' }, { status: 403 });
      }
    }

    // 2. Fetch existing transaction record
    const { data: tx } = await supabaseAdmin
      .from('payment_transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // 3. Idempotency check: if already approved, skip re-processing
    if (tx.status === 'approved' && (transaction_status === 'capture' || transaction_status === 'settlement')) {
      return NextResponse.json({ status: 'ok', message: 'Already approved (idempotent)' });
    }

    const now = new Date().toISOString();

    // 4. Determine state based on Midtrans transaction_status
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        // Approve payment
        await supabaseAdmin
          .from('payment_transactions')
          .update({ status: 'approved', updated_at: now })
          .eq('id', tx.id);

        // Upgrade user plan
        await supabaseAdmin
          .from('profiles')
          .update({ plan: tx.plan, updated_at: now })
          .eq('id', tx.user_id);
      }
    } else if (transaction_status === 'deny' || transaction_status === 'cancel') {
      await supabaseAdmin
        .from('payment_transactions')
        .update({ status: 'rejected', updated_at: now })
        .eq('id', tx.id);
    } else if (transaction_status === 'expire') {
      await supabaseAdmin
        .from('payment_transactions')
        .update({ status: 'expired', updated_at: now })
        .eq('id', tx.id);
    }

    return NextResponse.json({ status: 'ok', order_id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

