import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { canExportReports } from '@/lib/limits';
import { generatePdfBuffer, generateExcelBuffer } from '@/lib/export';
import { INITIAL_USER, INITIAL_ADMIN, INITIAL_TRANSACTIONS } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('file') || '';
    const format = (searchParams.get('format') || (filePath.endsWith('.xlsx') ? 'xlsx' : 'pdf')) as 'pdf' | 'xlsx';
    const userId = searchParams.get('userId') || INITIAL_ADMIN.id;
    const periodStart = searchParams.get('periodStart') || '2026-10-01';
    const periodEnd = searchParams.get('periodEnd') || '2026-10-31';

    // 1. Verify user profile and plan
    let user: any = null;
    try {
      const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
      user = data;
    } catch (err) {
      console.warn('DB user lookup error:', err);
    }

    if (!user) {
      if (userId === INITIAL_USER.id) user = INITIAL_USER;
      else if (userId === INITIAL_ADMIN.id) user = INITIAL_ADMIN;
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    // Plan check
    const exportCheck = canExportReports(user.plan);
    if (!exportCheck.allowed) {
      return NextResponse.json(
        { success: false, error: exportCheck.message || 'Fitur ini eksklusif untuk paket Pro.' },
        { status: 403 }
      );
    }

    // 2. Try download from Supabase storage if file path provided
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'tatadana-exports';
    if (filePath) {
      try {
        const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
          .from(bucketName)
          .download(filePath);

        if (!downloadError && fileBlob) {
          const buffer = Buffer.from(await fileBlob.arrayBuffer());
          const contentType = format === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf';
          const filename = filePath.split('/').pop() || `tatadana-laporan.${format}`;

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Length': String(buffer.length),
            },
          });
        }
      } catch (err) {
        console.warn('Storage download fallback triggered:', err);
      }
    }

    // 3. Fallback: on-the-fly generation if not found in bucket
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

    let buffer: Buffer;
    let contentType: string;
    const filename = `tatadana-laporan-${periodStart}_sd_${periodEnd}.${format}`;

    if (format === 'xlsx') {
      buffer = generateExcelBuffer(transactions, user.full_name, `${periodStart} s/d ${periodEnd}`);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      buffer = generatePdfBuffer(transactions, user.full_name, `${periodStart} s/d ${periodEnd}`);
      contentType = 'application/pdf';
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengunduh file' }, { status: 500 });
  }
}
