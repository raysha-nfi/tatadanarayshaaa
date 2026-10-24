import { NextResponse } from 'next/server';
import { getLiveTransactions } from '@/lib/telegram/live-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const transactions = getLiveTransactions();
  return NextResponse.json({ ok: true, transactions });
}
