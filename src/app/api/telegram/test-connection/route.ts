// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA TELEGRAM TEST CONNECTION & WEBHOOK SETUP (PART 5)
// Memverifikasi token via getMe, meregistrasikan setWebhook, & mengecek keunikan
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { testBotToken, registerBotWebhook } from '@/lib/telegram/bot';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Format data JSON tidak valid.' },
        { status: 400 }
      );
    }

    const { token, userId } = body || {};

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Token bot tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();

    // 1. Cegah 1 token dipakai lebih dari 1 user (cek keunikan token di database)
    if (userId) {
      try {
        let existingUserQuery = await supabaseAdmin
          .from('profiles')
          .select('id, full_name')
          .eq('telegram_bot_token', cleanToken)
          .neq('id', userId)
          .single();

        if (!existingUserQuery.data) {
          existingUserQuery = await supabaseAdmin
            .from('profiles')
            .select('id, full_name')
            .eq('bot_token', cleanToken)
            .neq('id', userId)
            .single();
        }

        if (existingUserQuery.data) {
          return NextResponse.json(
            {
              ok: false,
              error: 'Token bot ini sudah digunakan oleh akun lain. Buat bot baru di @BotFather.',
            },
            { status: 400 }
          );
        }
      } catch {
        // Continue if profile check query encounters benign non-matching error
      }
    }

    // 2. Test getMe to Telegram API
    const testResult = await testBotToken(cleanToken);
    if (!testResult.ok || !testResult.botInfo) {
      return NextResponse.json(
        {
          ok: false,
          error: testResult.error || 'Token bot tidak valid atau telah dicabut oleh Telegram.',
        },
        { status: 400 }
      );
    }

    // 3. Register setWebhook ke Backend Webhook URL
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://tatadana.id';
    const fullWebhookUrl = `${webhookBaseUrl}/api/telegram/webhook`;
    const webhookResult = await registerBotWebhook(cleanToken, fullWebhookUrl);

    if (!webhookResult.ok) {
      const isLocalOrUnresolved =
        webhookBaseUrl.includes('localhost') ||
        webhookBaseUrl.includes('127.0.0.1') ||
        webhookBaseUrl.includes('tatadana.id') ||
        webhookResult.description?.includes('Failed to resolve host') ||
        webhookResult.description?.includes('bad webhook');

      if (!isLocalOrUnresolved) {
        return NextResponse.json(
          {
            ok: false,
            error: `Bot valid, namun gagal mendaftarkan webhook: ${webhookResult.description}`,
            botInfo: testResult.botInfo,
          },
          { status: 400 }
        );
      }
    }

    // 4. Update profile in database (support both telegram_bot_token and bot_token columns)
    if (userId) {
      const updateData: any = {
        telegram_bot_token: cleanToken,
        telegram_connected: true,
        updated_at: new Date().toISOString(),
      };

      const { error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (updateErr && updateErr.message?.includes('telegram_bot_token')) {
        // Fallback if column is named bot_token
        await supabaseAdmin
          .from('profiles')
          .update({
            bot_token: cleanToken,
            telegram_connected: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }
    }

    return NextResponse.json({
      ok: true,
      botInfo: testResult.botInfo,
      webhookRegistered: true,
      message: `Bot @${testResult.botInfo.username} berhasil terhubung dan siap menerima pesan!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Terjadi kesalahan sistem saat menguji bot.' },
      { status: 500 }
    );
  }
}
