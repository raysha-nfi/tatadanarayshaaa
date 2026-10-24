// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA EXPORT ENGINE (PDF & EXCEL .XLSX)
// Menyimpan file sementara ke Supabase Storage dengan signed URL otomatis (7 Hari)
// ═══════════════════════════════════════════════════════════════════════════════

import * as XLSX from 'xlsx';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Transaction, ExportFormat, ExportHistory } from '@/types';
import { formatRupiah } from '@/lib/currency';
import { formatIndonesianDate, formatIndonesianTime } from '@/lib/date';

/**
 * Helper to escape ASCII string for PDF Type1 text stream
 */
function escapePdfText(text: string): string {
  if (!text) return '';
  return text
    // Replace unicode/emojis with ascii equivalents or space
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Generate Excel (.xlsx) workbook buffer from transactions
 * Termasuk lembar transaksi, rincian struk multi-item, dan ringkasan cashflow
 */
export function generateExcelBuffer(
  transactions: Transaction[],
  userName: string,
  periodText?: string
): Buffer {
  const workbook = XLSX.utils.book_new();

  // 1. Sheet 1: Laporan Transaksi
  const txRows = transactions.length > 0
    ? transactions.map((t, idx) => {
        let typeLabel = 'Pengeluaran';
        if (t.type === 'income') typeLabel = 'Pemasukan';
        if (t.type === 'transfer') typeLabel = 'Transfer Antar Dompet';

        const rawItems = (t.receipt_items && t.receipt_items.length > 0)
          ? t.receipt_items
          : (Array.isArray((t as any).items) ? (t as any).items : []);

        const itemsSummary = rawItems.length > 0
          ? rawItems
              .map((i: any) => `${i.item_name || i.name} (${formatRupiah(Number(i.price ?? i.amount ?? 0))})`)
              .join('; ')
          : '-';

        return {
          'No': idx + 1,
          'Tanggal': formatIndonesianDate(t.transaction_time),
          'Waktu (WIB)': formatIndonesianTime(t.transaction_time),
          'Jenis': typeLabel,
          'Nominal (Rp)': Number(t.amount),
          'Kategori': t.category?.name || (t.type === 'income' ? 'Pemasukan' : t.type === 'transfer' ? 'Transfer' : 'Lainnya'),
          'Dompet': t.wallet?.name || 'Dompet Utama',
          'Dompet Tujuan': t.to_wallet?.name || '-',
          'Sumber': t.source,
          'Catatan': t.notes || '-',
          'Rincian Item (Struk)': itemsSummary,
        };
      })
    : [
        {
          'No': '-',
          'Tanggal': '-',
          'Waktu (WIB)': '-',
          'Jenis': 'Tidak ada data pada periode ini',
          'Nominal (Rp)': 0,
          'Kategori': '-',
          'Dompet': '-',
          'Dompet Tujuan': '-',
          'Sumber': '-',
          'Catatan': '-',
          'Rincian Item (Struk)': '-',
        },
      ];

  const txWorksheet = XLSX.utils.json_to_sheet(txRows);
  txWorksheet['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 32 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(workbook, txWorksheet, 'Laporan Keuangan');

  // 2. Sheet 2: Rincian Struk Item (Multi-item breakdown)
  const itemRows: any[] = [];
  transactions.forEach((t) => {
    const rawItems = (t.receipt_items && t.receipt_items.length > 0)
      ? t.receipt_items
      : (Array.isArray((t as any).items) ? (t as any).items : []);

    if (rawItems.length > 0) {
      rawItems.forEach((it: any, iIdx: number) => {
        const itemName = it.item_name || it.name || `Item ${iIdx + 1}`;
        const itemPrice = Number(it.price ?? it.amount ?? 0);
        const itemQty = Number(it.quantity ?? it.qty ?? 1);
        const itemCat = it.category || t.category?.name || 'Belanja';
        itemRows.push({
          'No': itemRows.length + 1,
          'ID Transaksi': t.id,
          'Tanggal': formatIndonesianDate(t.transaction_time),
          'Waktu (WIB)': formatIndonesianTime(t.transaction_time),
          'Kategori': itemCat,
          'Merchant / Catatan': t.notes || '-',
          'Nama Item': itemName,
          'Jumlah (Qty)': itemQty,
          'Harga Satuan (Rp)': itemPrice,
          'Subtotal (Rp)': itemPrice * itemQty,
        });
      });
    }
  });

  const itemsSheet = itemRows.length > 0
    ? XLSX.utils.json_to_sheet(itemRows)
    : XLSX.utils.json_to_sheet([
        {
          'Keterangan': 'Tidak ada rincian item struk pada transaksi periode ini',
        },
      ]);

  if (itemRows.length > 0) {
    itemsSheet['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 18 },
      { wch: 28 },
      { wch: 30 },
      { wch: 14 },
      { wch: 18 },
      { wch: 20 },
    ];
  }
  XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Rincian Struk Item');

  // 3. Sheet 3: Ringkasan Cashflow KPI
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const netCashflow = totalIncome - totalExpense;

  const summaryRows = [
    { 'Parameter Finansial': 'Nama Pengguna', 'Nilai': userName },
    { 'Parameter Finansial': 'Periode Laporan', 'Nilai': periodText || 'Periode Terpilih' },
    { 'Parameter Finansial': 'Jumlah Transaksi', 'Nilai': transactions.length },
    { 'Parameter Finansial': 'Total Pemasukan (Rp)', 'Nilai': totalIncome },
    { 'Parameter Finansial': 'Total Pengeluaran (Rp)', 'Nilai': totalExpense },
    { 'Parameter Finansial': 'Net Cashflow (Rp)', 'Nilai': netCashflow },
    { 'Parameter Finansial': 'Status Arus Kas', 'Nilai': netCashflow >= 0 ? 'Surplus Finansial' : 'Defisit Pengeluaran' },
    { 'Parameter Finansial': 'Waktu Cetak', 'Nilai': `${formatIndonesianDate(new Date())} - ${formatIndonesianTime(new Date())}` },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [
    { wch: 26 },
    { wch: 35 },
  ];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Cashflow');

  // Generate binary XLSX buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}

/**
 * Generate PDF Document representation buffer with headers, cashflow breakdown, and clean styling
 */
export function generatePdfBuffer(
  transactions: Transaction[],
  userName: string,
  periodText: string
): Buffer {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const netCashflow = totalIncome - totalExpense;

  // Split transactions into pages (max 22 transactions per page for clean A4 layout)
  const itemsPerPage = 22;
  const pages: Transaction[][] = [];
  if (transactions.length === 0) {
    pages.push([]);
  } else {
    for (let i = 0; i < transactions.length; i += itemsPerPage) {
      pages.push(transactions.slice(i, i + itemsPerPage));
    }
  }

  // Construct PDF object streams
  const totalPages = pages.length;
  const pageStreamContents: string[] = [];

  pages.forEach((pageTxList, pageIdx) => {
    let streamText = 'BT\n';

    if (pageIdx === 0) {
      // First page Header
      streamText += `/F1 16 Tf\n50 800 Td\n(TATADANA - LAPORAN KEUANGAN PRIBADI) Tj\n`;
      streamText += `/F2 10 Tf\n0 -20 Td\n(Pengguna: ${escapePdfText(userName)}  |  Periode: ${escapePdfText(periodText)}) Tj\n`;
      streamText += `/F2 9 Tf\n0 -16 Td\n(Dicetak otomatis pada: ${escapePdfText(formatIndonesianDate(new Date()))} ${escapePdfText(formatIndonesianTime(new Date()))}) Tj\n`;

      // Summary KPIs
      streamText += `/F1 11 Tf\n0 -28 Td\n(RINGKASAN ARUS KAS / NET CASHFLOW) Tj\n`;
      streamText += `/F2 10 Tf\n0 -18 Td\n(Total Pemasukan   : +${escapePdfText(formatRupiah(totalIncome))}) Tj\n`;
      streamText += `0 -15 Td\n(Total Pengeluaran : -${escapePdfText(formatRupiah(totalExpense))}) Tj\n`;
      streamText += `/F1 10 Tf\n0 -15 Td\n(Net Cashflow     : ${netCashflow >= 0 ? '+' : ''}${escapePdfText(formatRupiah(netCashflow))}  [${netCashflow >= 0 ? 'SURPLUS' : 'DEFISIT'}]) Tj\n`;
      streamText += `/F2 9 Tf\n0 -15 Td\n(Total Catatan     : ${transactions.length} transaksi) Tj\n`;

      // Table Header
      streamText += `/F1 9 Tf\n0 -26 Td\n(DAFTAR TRANSAKSI) Tj\n`;
      streamText += `/F1 8 Tf\n0 -16 Td\n(${escapePdfText(
        'NO   TANGGAL          JENIS          KATEGORI              NOMINAL (RP)         CATATAN / STRUK'
      )}) Tj\n`;
      streamText += `/F2 8 Tf\n0 -12 Td\n(${escapePdfText(
        '------------------------------------------------------------------------------------------------------------------'
      )}) Tj\n`;
    } else {
      // Continuation page header
      streamText += `/F1 12 Tf\n50 800 Td\n(TATADANA - LAPORAN KEUANGAN PRIBADI - Lanjutan Halaman ${pageIdx + 1} dari ${totalPages}) Tj\n`;
      streamText += `/F2 9 Tf\n0 -16 Td\n(Pengguna: ${escapePdfText(userName)}  |  Periode: ${escapePdfText(periodText)}) Tj\n`;
      streamText += `/F1 8 Tf\n0 -22 Td\n(${escapePdfText(
        'NO   TANGGAL          JENIS          KATEGORI              NOMINAL (RP)         CATATAN / STRUK'
      )}) Tj\n`;
      streamText += `/F2 8 Tf\n0 -12 Td\n(${escapePdfText(
        '------------------------------------------------------------------------------------------------------------------'
      )}) Tj\n`;
    }

    if (pageTxList.length === 0 && pageIdx === 0) {
      streamText += `0 -18 Td\n(Tidak ada transaksi yang tercatat pada periode ini.) Tj\n`;
    } else {
      pageTxList.forEach((tx, idx) => {
        const itemNumber = (pageIdx * itemsPerPage) + idx + 1;
        const noStr = String(itemNumber).padEnd(4, ' ');
        const tglStr = formatIndonesianDate(tx.transaction_time, true).padEnd(16, ' ');
        const typeStr = (tx.type === 'income' ? 'Pemasukan' : tx.type === 'transfer' ? 'Transfer' : 'Pengeluaran').padEnd(14, ' ');
        const catName = (tx.category?.name || (tx.type === 'income' ? 'Pemasukan' : 'Lainnya')).slice(0, 18).padEnd(20, ' ');
        const amtStr = ((tx.type === 'income' ? '+' : tx.type === 'transfer' ? ' ' : '-') + formatRupiah(tx.amount)).padEnd(20, ' ');
        const rawNote = (tx.notes || '-').slice(0, 30);

        const line = `${noStr} ${tglStr} ${typeStr} ${catName} ${amtStr} ${rawNote}`;
        streamText += `0 -14 Td\n(${escapePdfText(line)}) Tj\n`;
      });
    }

    // Page footer
    streamText += `0 -25 Td\n(/F2 8 Tf\nHalaman ${pageIdx + 1} dari ${totalPages}  |  TataDana Premium SaaS Export Engine) Tj\n`;
    streamText += 'ET\n';

    pageStreamContents.push(streamText);
  });

  // Construct PDF Body Objects with dynamic offsets
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  function recordObject(objNum: number, content: string) {
    offsets[objNum] = Buffer.byteLength(pdf, 'utf8');
    pdf += `${objNum} 0 obj\n${content}\nendobj\n`;
  }

  // 1: Catalog
  recordObject(1, '<< /Type /Catalog /Pages 2 0 R >>');

  // 2: Pages
  const pageObjIds = pages.map((_, idx) => 5 + (idx * 2));
  const kidsArray = pageObjIds.map((id) => `${id} 0 R`).join(' ');
  recordObject(2, `<< /Type /Pages /Kids [${kidsArray}] /Count ${totalPages} >>`);

  // 3: Font F1 (Helvetica-Bold)
  recordObject(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  // 4: Font F2 (Helvetica)
  recordObject(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  // Generate Page and Content Objects
  pages.forEach((_, idx) => {
    const pageId = 5 + (idx * 2);
    const contentId = pageId + 1;
    const contentStream = pageStreamContents[idx];
    const streamLen = Buffer.byteLength(contentStream, 'utf8');

    // Page Object
    recordObject(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`
    );

    // Content Stream Object
    recordObject(
      contentId,
      `<< /Length ${streamLen} >>\nstream\n${contentStream}endstream`
    );
  });

  // Xref table
  const totalObjects = 4 + (totalPages * 2);
  const startXref = Buffer.byteLength(pdf, 'utf8');

  pdf += `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= totalObjects; i++) {
    const offsetStr = String(offsets[i] || 0).padStart(10, '0');
    pdf += `${offsetStr} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}

/**
 * Save export file to Supabase Storage and create signed URL (7-day validity)
 */
export async function saveExportToStorageAndRecord(params: {
  userId: string;
  userName: string;
  format: ExportFormat;
  periodStart: string;
  periodEnd: string;
  transactions: Transaction[];
}): Promise<ExportHistory> {
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'tatadana-exports';
  const timestamp = Date.now();
  const fileExtension = params.format === 'xlsx' ? 'xlsx' : 'pdf';
  const fileName = `tatadana-laporan-${params.periodStart}_sd_${params.periodEnd}-${timestamp}.${fileExtension}`;
  const filePath = `${params.userId}/${fileName}`;

  let fileBuffer: Buffer;
  let contentType: string;

  if (params.format === 'xlsx') {
    fileBuffer = generateExcelBuffer(
      params.transactions,
      params.userName,
      `${params.periodStart} s/d ${params.periodEnd}`
    );
    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  } else {
    fileBuffer = generatePdfBuffer(
      params.transactions,
      params.userName,
      `${params.periodStart} s/d ${params.periodEnd}`
    );
    contentType = 'application/pdf';
  }

  // Upload to Supabase Storage
  let signedUrl = '';
  try {
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (!uploadError) {
      // Create Signed URL expiring in 7 days (604,800 seconds)
      const { data: signedData } = await supabaseAdmin.storage
        .from(bucketName)
        .createSignedUrl(filePath, 604800);

      if (signedData?.signedUrl) {
        signedUrl = signedData.signedUrl;
      }
    } else {
      console.warn('Storage upload error (fallback):', uploadError.message);
    }
  } catch (err) {
    console.warn('Storage upload warning, fallback to direct download path:', err);
  }

  // Fallback direct URL if storage is unconfigured or in development mock mode
  if (!signedUrl) {
    signedUrl = `/api/export/download?file=${encodeURIComponent(filePath)}&format=${params.format}&userId=${encodeURIComponent(params.userId)}&periodStart=${encodeURIComponent(params.periodStart)}&periodEnd=${encodeURIComponent(params.periodEnd)}`;
  }

  // Record into export_history table (7-day expiration)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const recordPayload = {
    user_id: params.userId,
    format: params.format,
    period_start: params.periodStart,
    period_end: params.periodEnd,
    file_path: filePath,
    file_name: fileName,
    signed_url: signedUrl,
    expires_at: expiresAt,
  };

  let historyRow: ExportHistory | null = null;

  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('export_history')
      .insert(recordPayload)
      .select()
      .single();

    if (!dbError && data) {
      historyRow = data;
    }
  } catch (err) {
    console.warn('DB insert error into export_history, trying fallback:', err);
  }

  if (!historyRow) {
    historyRow = {
      id: `exp-${timestamp}`,
      created_at: new Date().toISOString(),
      ...recordPayload,
    };
  }

  return historyRow;
}
