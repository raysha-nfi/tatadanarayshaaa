import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generatePairingCode, normalizeIndonesianPhoneNumber } from '../utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, phoneNumber } = body || {};

    if (!userId && !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'userId atau phoneNumber diperlukan untuk membuat pairing code' },
        { status: 400 }
      );
    }

    const newPairingCode = generatePairingCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours TTL

    let query = supabaseAdmin.from('profiles').update({
      pairing_code: newPairingCode,
      pairing_code_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });

    if (userId) {
      query = query.eq('id', userId);
    } else if (phoneNumber) {
      const cleanPhone = normalizeIndonesianPhoneNumber(phoneNumber);
      query = query.eq('phone_number', cleanPhone);
    }

    const { error: updateErr } = await query;
    if (updateErr) {
      console.warn('[pairing-code] Profile update error:', updateErr);
    }

    return NextResponse.json({
      success: true,
      pairingCode: newPairingCode,
      expiresAt,
      telegramUrl: `https://t.me/TataDanaBot?start=${newPairingCode}`,
      message: 'Kode pairing Telegram berhasil diperbarui!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghasilkan kode pairing Telegram' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const phoneNumber = searchParams.get('phoneNumber');

    if (!userId && !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'userId atau phoneNumber diperlukan' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('profiles').select('id, full_name, pairing_code, pairing_code_expires_at, shared_bot_linked, telegram_chat_id');

    if (userId) {
      query = query.eq('id', userId);
    } else if (phoneNumber) {
      const cleanPhone = normalizeIndonesianPhoneNumber(phoneNumber);
      query = query.eq('phone_number', cleanPhone);
    }

    const { data: profile, error } = await query.maybeSingle();

    if (error || !profile) {
      // If profile not found, return fresh ephemeral pairing code for immediate client use
      const freshCode = generatePairingCode();
      return NextResponse.json({
        success: true,
        pairingCode: freshCode,
        telegramUrl: `https://t.me/TataDanaBot?start=${freshCode}`,
      });
    }

    // Check if pairing code is still valid or generate a fresh one
    const now = new Date();
    const isExpired = !profile.pairing_code || !profile.pairing_code_expires_at || new Date(profile.pairing_code_expires_at) <= now;

    let activePairingCode = profile.pairing_code;
    let expiresAt = profile.pairing_code_expires_at;

    if (isExpired) {
      activePairingCode = generatePairingCode();
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from('profiles')
        .update({
          pairing_code: activePairingCode,
          pairing_code_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
    }

    return NextResponse.json({
      success: true,
      pairingCode: activePairingCode,
      expiresAt,
      sharedBotLinked: profile.shared_bot_linked,
      telegramChatId: profile.telegram_chat_id,
      telegramUrl: `https://t.me/TataDanaBot?start=${activePairingCode}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil kode pairing' },
      { status: 500 }
    );
  }
}
