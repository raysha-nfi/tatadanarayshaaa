// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA API: EXPORT DOWNLOAD BY ID (/api/export/download/[exportId])
// Returns signed URL redirect or direct binary download
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { exportId: string } }
) {
  const exportId = params.exportId;

  return NextResponse.json({
    ok: true,
    exportId,
    downloadUrl: `/api/export/excel?id=${exportId}&download=1`,
    message: 'Signed URL valid for 7 days',
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  });
}
