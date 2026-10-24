import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, paymentMethod } = await req.json();

    if (!userId || !plan || !paymentMethod) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 });
    }

    const amount = plan === 'pro' ? 99000 : 49000;
    const orderId = `TATADANA-${plan.toUpperCase()}-${Date.now()}`;

    // Record pending transaction
    const { data: tx, error } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: userId,
        plan: plan,
        payment_method: paymentMethod,
        amount: amount,
        order_id: orderId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    let snapToken = null;
    let redirectUrl = null;

    if (paymentMethod === 'midtrans') {
      const serverKey = process.env.MIDTRANS_SERVER_KEY;
      if (serverKey) {
        // Encode server key for Midtrans Basic Auth
        const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;
        const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true';
        const midtransUrl = isProd
          ? 'https://app.midtrans.com/snap/v1/transactions'
          : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        const midtransRes = await fetch(midtransUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: orderId,
              gross_amount: amount,
            },
            credit_card: { secure: true },
            customer_details: {
              first_name: 'TataDana Subscriber',
            },
          }),
        });

        if (midtransRes.ok) {
          const snapData = await midtransRes.json();
          snapToken = snapData.token;
          redirectUrl = snapData.redirect_url;
        }
      }
    }

    return NextResponse.json({
      success: true,
      transaction: tx,
      snapToken,
      redirectUrl,
      manualTransferDetails: paymentMethod === 'manual_transfer' ? {
        bank: 'BCA (Bank Central Asia)',
        accountNumber: '8830-192-881',
        accountHolder: 'PT TATADANA FINANSIAL TEKNOLOGI',
        amount: amount,
        orderId: orderId,
      } : null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
