import { NextRequest, NextResponse } from 'next/server';
import { parseReceiptImage } from '@/lib/ai/dispatcher';

export async function POST(req: NextRequest) {
  try {
    const { image, userId } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Gambar struk diperlukan' }, { status: 400 });
    }

    const result = await parseReceiptImage(image, userId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
