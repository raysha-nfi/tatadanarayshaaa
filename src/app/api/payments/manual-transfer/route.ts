import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId, proofImageUrl } = await req.json();

    if (!orderId || !proofImageUrl) {
      return NextResponse.json({ error: 'Order ID dan bukti transfer diperlukan' }, { status: 400 });
    }

    const { data: updatedTx, error } = await supabaseAdmin
      .from('payment_transactions')
      .update({
        proof_image_url: proofImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: updatedTx,
      message: 'Bukti transfer berhasil diunggah. Menunggu approval admin.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
