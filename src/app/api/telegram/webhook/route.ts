// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA TELEGRAM WEBHOOK ENDPOINT
// Endpoint publik yang menerima POST dari Telegram API (WIB timezone, idempotent)
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { processTelegramWebhookUpdate } from '@/lib/telegram/webhook-handler';
import { formatBotTimestamp } from '@/lib/date';

export async function POST(req: NextRequest) {
  try {
    let update: any;
    try {
      update = await req.json();
    } catch (parseError) {
      // If Telegram or caller sends non-JSON payload, return 200 to prevent retry loop
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON body payload' },
        { status: 200 }
      );
    }

    if (!update || typeof update !== 'object') {
      return NextResponse.json(
        { ok: true, result: { status: 'skipped', reason: 'Payload must be an object' } },
        { status: 200 }
      );
    }

    if (!update.update_id) {
      return NextResponse.json(
        { ok: true, result: { status: 'skipped', reason: 'Missing update_id' } },
        { status: 200 }
      );
    }

    // Process update through idempotency pipeline and command handler
    const result = await processTelegramWebhookUpdate(update);

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (error: any) {
    console.error('Telegram webhook processing error:', error);
    // Return 200 OK so Telegram doesn't aggressively spam retry on fatal payload errors
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal webhook error' },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'TataDana Telegram Webhook Service',
    status: 'active',
    timezone: 'Asia/Jakarta (WIB)',
    timestamp: formatBotTimestamp(),
    serverTimeUtc: new Date().toISOString(),
  });
}
