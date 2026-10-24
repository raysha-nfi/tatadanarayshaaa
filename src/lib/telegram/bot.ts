// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA TELEGRAM API HELPER
// Mengelola getMe, setWebhook, dan sendMessage ke Telegram Bot API
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

/**
 * Send text message to Telegram chat
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  token: string = DEFAULT_BOT_TOKEN,
  replyMarkup?: any
): Promise<boolean> {
  const activeToken = token || process.env.TELEGRAM_BOT_TOKEN;
  if (!activeToken) {
    console.warn('TELEGRAM_BOT_TOKEN not configured.');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${activeToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });

    const data = await res.json();
    return data.ok === true;
  } catch (err) {
    console.error('Failed to send telegram message:', err);
    return false;
  }
}

/**
 * Test bot token via getMe (Part 5)
 */
export async function testBotToken(token: string): Promise<{
  ok: boolean;
  botInfo?: { id: number; username: string; first_name: string };
  error?: string;
}> {
  if (!token || token.trim().length === 0) {
    return { ok: false, error: 'Token bot tidak boleh kosong.' };
  }

  try {
    const url = `https://api.telegram.org/bot${token.trim()}/getMe`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();

    if (data.ok && data.result) {
      return {
        ok: true,
        botInfo: {
          id: data.result.id,
          username: data.result.username,
          first_name: data.result.first_name,
        },
      };
    }

    return {
      ok: false,
      error: data.description || 'Token bot tidak valid atau telah dicabut oleh Telegram.',
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || 'Gagal menghubungi Telegram API. Periksa koneksi internet.',
    };
  }
}

/**
 * Set Webhook to Telegram (Part 2 & Part 5)
 */
export async function registerBotWebhook(
  token: string,
  webhookUrl: string
): Promise<{ ok: boolean; description?: string }> {
  try {
    const url = `https://api.telegram.org/bot${token.trim()}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();

    return {
      ok: data.ok === true,
      description: data.description,
    };
  } catch (err: any) {
    return {
      ok: false,
      description: err.message || 'Gagal mengatur webhook Telegram.',
    };
  }
}

/**
 * Get File metadata and CDN download path from Telegram API
 */
export async function getTelegramFileInfo(
  fileId: string,
  token: string = DEFAULT_BOT_TOKEN
): Promise<{
  ok: boolean;
  filePath?: string;
  fileUrl?: string;
  fileSize?: number;
  error?: string;
}> {
  const activeToken = token || process.env.TELEGRAM_BOT_TOKEN;
  if (!activeToken) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN tidak dikonfigurasi.' };
  }

  if (!fileId || typeof fileId !== 'string') {
    return { ok: false, error: 'File ID tidak valid.' };
  }

  try {
    const url = `https://api.telegram.org/bot${activeToken}/getFile?file_id=${encodeURIComponent(fileId)}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();

    if (data.ok && data.result?.file_path) {
      const filePath = data.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${activeToken}/${filePath}`;
      return {
        ok: true,
        filePath,
        fileUrl,
        fileSize: data.result.file_size,
      };
    }

    return {
      ok: false,
      error: data.description || 'Gagal mengambil informasi file dari Telegram API.',
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || 'Gagal menghubungi Telegram API getFile.',
    };
  }
}

/**
 * Download binary file from Telegram CDN and return Buffer with metadata
 */
export async function downloadTelegramFile(
  fileId: string,
  token: string = DEFAULT_BOT_TOKEN
): Promise<{
  ok: boolean;
  buffer?: Buffer;
  base64?: string;
  dataUri?: string;
  mimeType?: string;
  fileUrl?: string;
  error?: string;
}> {
  const activeToken = token || process.env.TELEGRAM_BOT_TOKEN;
  const fileInfo = await getTelegramFileInfo(fileId, activeToken);

  if (!fileInfo.ok || !fileInfo.fileUrl) {
    return {
      ok: false,
      error: fileInfo.error || 'File path Telegram tidak ditemukan.',
    };
  }

  try {
    const response = await fetch(fileInfo.fileUrl);
    if (!response.ok) {
      return {
        ok: false,
        error: `Gagal mengunduh file dari Telegram CDN: HTTP ${response.status} ${response.statusText}`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    // Detect MIME type based on file path extension
    const ext = fileInfo.filePath?.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';
    if (ext === 'oga' || ext === 'ogg') {
      mimeType = 'audio/ogg';
    } else if (ext === 'mp3') {
      mimeType = 'audio/mpeg';
    } else if (ext === 'jpg' || ext === 'jpeg') {
      mimeType = 'image/jpeg';
    } else if (ext === 'png') {
      mimeType = 'image/png';
    } else if (ext === 'webp') {
      mimeType = 'image/webp';
    } else if (ext === 'pdf') {
      mimeType = 'application/pdf';
    }

    const dataUri = `data:${mimeType};base64,${base64}`;

    return {
      ok: true,
      buffer,
      base64,
      dataUri,
      mimeType,
      fileUrl: fileInfo.fileUrl,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || 'Terjadi kesalahan saat mengunduh binary file Telegram.',
    };
  }
}

/**
 * Helper to download Telegram file as Base64 string (useful for Vision AI and Audio STT)
 */
export async function downloadTelegramFileAsBase64(
  fileId: string,
  token: string = DEFAULT_BOT_TOKEN
): Promise<{ ok: boolean; base64?: string; dataUri?: string; mimeType?: string; error?: string }> {
  const result = await downloadTelegramFile(fileId, token);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return {
    ok: true,
    base64: result.base64,
    dataUri: result.dataUri,
    mimeType: result.mimeType,
  };
}

/**
 * Helper to download Telegram file as Buffer
 */
export async function downloadTelegramFileAsBuffer(
  fileId: string,
  token: string = DEFAULT_BOT_TOKEN
): Promise<{ ok: boolean; buffer?: Buffer; mimeType?: string; error?: string }> {
  const result = await downloadTelegramFile(fileId, token);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return {
    ok: true,
    buffer: result.buffer,
    mimeType: result.mimeType,
  };
}

