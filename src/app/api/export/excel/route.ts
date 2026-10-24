import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { canExportReports } from '@/lib/limits';
import { saveExportToStorageAndRecord, generateExcelBuffer } from '@/lib/export';
import { INITIAL_USER, INITIAL_ADMIN, INITIAL_TRANSACTIONS } from '@/lib/mock-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, periodStart, periodEnd } = body;

    if (!userId || !periodStart || !periodEnd) {
      return NextResponse.json(
        { success: false, error: 'Parameter userId dan periode diperlukan' },
        { status: 400 }
      );
    }

    // 1. Check user profile & plan
    let user: any = null;
    try {
      const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
      user = data;
    } catch (err) {
      console.warn('DB profile lookup error:', err);
    }

    if (!user) {
      if (userId === INITIAL_USER.id) user = INITIAL_USER;
      else if (userId === INITIAL_ADMIN.id) user = INITIAL_ADMIN;
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    // 2. Plan Check: Starter users are strictly rejected with 403 Forbidden
    const exportCheck = canExportReports(user.plan);
    if (!exportCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: exportCheck.message || 'Export laporan PDF & Excel adalah fitur eksklusif paket Pro. Silakan upgrade ke Pro.',
        },
        { status: 403 }
      );
    }

    // 3. Query transactions in period
    let transactions: any[] = [];
    try {
      const { data: dbTx, error: txError } = await supabaseAdmin
        .from('transactions')
        .select('*, wallet:wallets!wallet_id(*), to_wallet:wallets!to_wallet_id(*), category:categories(*), receipt_items(*)')
        .eq('user_id', userId)
        .gte('transaction_time', `${periodStart}T00:00:00Z`)
        .lte('transaction_time', `${periodEnd}T23:59:59Z`)
        .order('transaction_time', { ascending: false });

      if (!txError && dbTx) {
        transactions = dbTx;
      } else {
        transactions = INITIAL_TRANSACTIONS.filter((t) => {
          const tDate = t.transaction_time.slice(0, 10);
          return t.user_id === userId && tDate >= periodStart && tDate <= periodEnd;
        });
      }
    } catch (err) {
      transactions = INITIAL_TRANSACTIONS.filter((t) => {
        const tDate = t.transaction_time.slice(0, 10);
        return t.user_id === userId && tDate >= periodStart && tDate <= periodEnd;
      });
    }

    // 4. Save to Storage and generate 7-day signed URL
    const exportRecord = await saveExportToStorageAndRecord({
      userId,
      userName: user.full_name || 'Pengguna TataDana',
      format: 'xlsx',
      periodStart,
      periodEnd,
      transactions,
    });

    return NextResponse.json({ success: true, data: exportRecord });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal membuat file export Excel' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || INITIAL_ADMIN.id;
    const periodStart = searchParams.get('periodStart') || '2026-10-01';
    const periodEnd = searchParams.get('periodEnd') || '2026-10-31';
    const isDownload = searchParams.get('download') === '1' || searchParams.get('download') === 'true';

    // 1. Check user profile & plan
    let user: any = null;
    try {
      const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
      user = data;
    } catch (err) {
      console.warn('DB profile lookup error:', err);
    }

    if (!user) {
      if (userId === INITIAL_USER.id) user = INITIAL_USER;
      else if (userId === INITIAL_ADMIN.id) user = INITIAL_ADMIN;
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    // 2. Plan Check: Starter users are strictly rejected with 403 Forbidden
    const exportCheck = canExportReports(user.plan);
    if (!exportCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: exportCheck.message || 'Export laporan PDF & Excel adalah fitur eksklusif paket Pro. Silakan upgrade ke Pro.',
        },
        { status: 403 }
      );
    }

    // 3. Query transactions
    let transactions: any[] = [];
    try {
      const { data: dbTx, error: txError } = await supabaseAdmin
        .from('transactions')
        .select('*, wallet:wallets!wallet_id(*), to_wallet:wallets!to_wallet_id(*), category:categories(*), receipt_items(*)')
        .eq('user_id', userId)
        .gte('transaction_time', `${periodStart}T00:00:00Z`)
        .lte('transaction_time', `${periodEnd}T23:59:59Z`)
        .order('transaction_time', { ascending: false });

      if (!txError && dbTx) {
        transactions = dbTx;
      } else {
        transactions = INITIAL_TRANSACTIONS.filter((t) => {
          const tDate = t.transaction_time.slice(0, 10);
          return t.user_id === userId && tDate >= periodStart && tDate <= periodEnd;
        });
      }
    } catch (err) {
      transactions = INITIAL_TRANSACTIONS.filter((t) => {
        const tDate = t.transaction_time.slice(0, 10);
        return t.user_id === userId && tDate >= periodStart && tDate <= periodEnd;
      });
    }

    // Direct download
    if (isDownload) {
      const excelBuffer = generateExcelBuffer(
        transactions,
        user.full_name || 'Pengguna TataDana',
        `${periodStart} s/d ${periodEnd}`
      );
      const filename = `tatadana-laporan-${periodStart}_sd_${periodEnd}.xlsx`;
      return new NextResponse(new Uint8Array(excelBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': String(excelBuffer.length),
        },
      });
    }

    const exportRecord = await saveExportToStorageAndRecord({
      userId,
      userName: user.full_name || 'Pengguna TataDana',
      format: 'xlsx',
      periodStart,
      periodEnd,
      transactions,
    });

    return NextResponse.json({ success: true, data: exportRecord });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal membuat file export Excel' }, { status: 500 });
  }
}
