// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA API: MIDTRANS NOTIFICATION WEBHOOK ROUTE (/api/payments/midtrans/notification)
// ═══════════════════════════════════════════════════════════════════════════════

import { POST as handler } from '../../midtrans-notification/route';

export const POST = handler;

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok', service: 'midtrans-notification' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
