# Changes Record — Worker 3 (M3: In-App Financial Reporting & Multi-Format Export)

## Scope of Work & Ownership
Worker 3 exclusively owns:
- `src/app/dashboard/reports/*`
- `src/app/dashboard/laporan/*`
- `src/app/api/export/*`
- `src/lib/export.ts`

---

## 1. `src/lib/export.ts`
- **Excel Generator (`generateExcelBuffer`)**:
  - Implemented multi-sheet workbook generation via `xlsx` library:
    - Sheet 1: `Laporan Keuangan` — formatted columns (No, Tanggal, Waktu WIB, Jenis, Nominal Rp, Kategori, Dompet, Dompet Tujuan, Sumber, Catatan, Rincian Item Struk) with configured column widths (`!cols`), formatting, and graceful empty state row when 0 transactions exist.
    - Sheet 2: `Rincian Struk Item` — breakdown of multi-item receipts with Transaction ID, Tanggal, Merchant/Notes, Item Name, Qty, Unit Price (Rp), and Subtotal (Rp).
    - Sheet 3: `Ringkasan Cashflow` — executive summary containing User Name, Periode Laporan, Total Transaksi, Total Pemasukan, Total Pengeluaran, Net Cashflow, Status Arus Kas, dan Waktu Cetak.
  - Supports both relational `receipt_items` and JSON `items` field structure.
- **PDF Generator (`generatePdfBuffer`)**:
  - Implemented a valid PDF 1.4 document generator formatted for A4 print and view.
  - Displays header ("TATADANA - LAPORAN KEUANGAN PRIBADI"), user metadata, generation timestamp in WIB, cashflow summary KPI box (Total Pemasukan, Total Pengeluaran, Net Cashflow Surplus/Defisit, Total Catatan), and structured table columns.
  - Multi-page pagination support (splits dynamically at 22 transactions per page) with continuation headers and page numbers ("Halaman X dari Y").
  - Dynamic byte offset calculation for exact PDF cross-reference (`xref`) table.
  - String escaping for ASCII Type1 Helvetica fonts (`(`, `)`, `\\`, and unicode/emoji normalization).
  - Handles 0 transactions gracefully with "(Tidak ada transaksi yang tercatat pada periode ini)".
- **Supabase Storage & 7-Day Signed URLs (`saveExportToStorageAndRecord`)**:
  - Uploads generated buffers to private bucket `tatadana-exports` (or `process.env.SUPABASE_STORAGE_BUCKET`).
  - Creates auto-expiring signed URL valid for 7 days (`604,800` seconds).
  - Records export history in `export_history` with user_id, format, period_start, period_end, file_path, file_name, signed_url, and expires_at.
  - Graceful fallback for offline development mode with streaming fallback endpoint.

---

## 2. API Routes: `src/app/api/export/pdf/route.ts` & `src/app/api/export/excel/route.ts`
- **Plan Enforcement**:
  - Enforces Pro plan requirement using `canExportReports(user.plan)`.
  - Rejects Starter users with HTTP `403 Forbidden` and `{ success: false, error: "Export laporan PDF & Excel adalah fitur eksklusif paket Pro. Dapatkan rekap finansial instan dengan Pro!" }`.
- **POST Handler**:
  - Accepts JSON `{ userId, periodStart, periodEnd }`.
  - Queries `transactions` table filtered by date range and user ID with relations (`wallets`, `categories`, `receipt_items`).
  - Calls `saveExportToStorageAndRecord` and returns `{ success: true, data: exportRecord }`.
- **GET Handler**:
  - Accepts URL search parameters `?userId=...&periodStart=...&periodEnd=...&download=1`.
  - Direct download streaming mode with proper `Content-Type` (`application/pdf` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) and `Content-Disposition: attachment; filename="..."`.

---

## 3. Fallback Streaming Endpoint: `src/app/api/export/download/route.ts`
- Implemented streaming route for file download when Supabase Storage signed URLs redirect through API fallback.
- Validates user Pro plan (403 gating), attempts to retrieve file from `tatadana-exports` bucket, and falls back to generating fresh buffer on-the-fly.

---

## 4. UI Components: `src/app/dashboard/reports/` & `src/app/dashboard/laporan/`
- Created `src/app/dashboard/reports/ReportsView.tsx` with full interactive suite:
  - **Sorting**: Interactive table column headers for date (asc/desc), amount (asc/desc), category (asc/desc), and wallet (asc/desc) with visual directional indicator chevrons.
  - **Date Range Filtering & Pre-sets**: "Hari Ini", "Bulan Ini", "Tahun Ini", "Semua Periode", plus custom date pickers (`dateStart` and `dateEnd`).
  - **Multi-dimension Filters**: Wallet selector, category selector, type selector (Pengeluaran, Pemasukan, Transfer), and text search query matching notes, category, and receipt item names.
  - **Reset Button**: One-click reset to restore default filters.
  - **Net Cashflow Summary Cards**: Total Pemasukan, Total Pengeluaran, Net Cashflow (Surplus/Defisit badge), Top 5 Kategori pengeluaran with percentage allocations. Transfers between user's own wallets are excluded from income/expense calculations.
  - **Expandable Multi-Item Receipt Accordion**: Clean receipt badge ("N item rincian struk") that expands to show itemized breakdown cards (Item Name, Qty, Unit Price, Subtotal).
  - **Supabase Realtime Live Sync**: Realtime channel subscription to `postgres_changes` on `transactions` with status indicator 🟢 and fallback polling heartbeat.
  - **On-Demand Export Actions & Pro Upgrade Modal**: Triggers PDF/Excel download; intercepts Starter users with interactive Pro Upgrade Modal.
  - **Saved Export History**: List of past exports with 7-day signed URL download links and badges.
- `src/app/dashboard/reports/page.tsx`: Route entrypoint rendering `ReportsView`.
- `src/app/dashboard/laporan/page.tsx`: Route entrypoint rendering `ReportsView`.
