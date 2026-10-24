import { NextRequest, NextResponse } from 'next/server';
import { transcribeVoiceNote } from '@/lib/ai/dispatcher';

export async function POST(req: NextRequest) {
  try {
    const { audio, userId } = await req.json();

    if (!audio) {
      return NextResponse.json({ error: 'File audio diperlukan' }, { status: 400 });
    }

    const transcript = await transcribeVoiceNote(audio, userId);
    return NextResponse.json({ success: true, transcript });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
