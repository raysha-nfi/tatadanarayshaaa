import { NextRequest, NextResponse } from 'next/server';
import { parseTransactionText } from '@/lib/ai/dispatcher';

export async function POST(req: NextRequest) {
  try {
    const { text, userId } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Teks input diperlukan' }, { status: 400 });
    }

    const result = await parseTransactionText(text, userId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
