// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA LOCALHOST TELEGRAM BOT POLLING BRIDGE
// Meneruskan pesan dari bot Telegram (@rayshaa_bot) ke localhost:3000/api/telegram/webhook
// ═══════════════════════════════════════════════════════════════════════════════

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8998313082:AAFCCgZ-JzR1pFEg5g_D1W0atKeE338sUA8';
const LOCAL_WEBHOOK_URL = process.env.LOCAL_WEBHOOK_URL || 'http://127.0.0.1:3000/api/telegram/webhook';

console.log('====================================================');
console.log('🤖 TATADANA TELEGRAM LOCALHOST POLLING BRIDGE');
console.log(`📡 Bot Token : ${BOT_TOKEN.slice(0, 10)}...${BOT_TOKEN.slice(-6)}`);
console.log(`🎯 Forward To : ${LOCAL_WEBHOOK_URL}`);

// Test connection
try {
  const meRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
  const meData = await meRes.json();
  if (meData.ok) {
    console.log(`✅ Terhubung ke Bot: @${meData.result.username} (${meData.result.first_name})`);
    console.log(`🔗 Link Chat Bot : https://t.me/${meData.result.username}`);
  }
} catch (e) {
  console.warn('[Bridge] Gagal getMe:', e.message);
}
console.log('====================================================');

// Test local webhook endpoint reachability
try {
  const localCheck = await fetch(LOCAL_WEBHOOK_URL, { method: 'GET' });
  if (localCheck.ok) {
    const info = await localCheck.json();
    console.log(`✅ Localhost Webhook siap: ${info.name || 'TataDana Webhook'} (${info.status})`);
  } else {
    console.log(`ℹ️ Localhost Webhook status: HTTP ${localCheck.status}`);
  }
} catch (e) {
  console.log(`⚠️ Next.js di ${LOCAL_WEBHOOK_URL} belum merespons. Pastikan "npm run dev" atau "npm start" sedang berjalan.`);
}
console.log('⚡ Long-polling dimulai... Mendengarkan pesan Telegram secara real-time!');
console.log('====================================================');

let offset = 0;
let isRunning = true;

async function pollUpdates() {
  let consecutiveErrors = 0;

  while (isRunning) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=25`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[Bridge] Telegram API error: HTTP ${res.status}`);
        consecutiveErrors++;
        const backoff = Math.min(10000, 1500 * consecutiveErrors);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }

      consecutiveErrors = 0;
      const data = await res.json();
      if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          const msg = update.message;
          const user = msg?.from?.username || msg?.from?.first_name || 'Anonymous';
          const content = msg?.text || (msg?.photo ? '[Foto Struk]' : msg?.voice ? '[Voice Note]' : '[Update]');
          
          console.log(`[Bridge] 📩 Pesan masuk dari @${user}: "${content}"`);

          try {
            const forwardRes = await fetch(LOCAL_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(update),
            });
            let statusText = 'sukses';
            try {
              const forwardData = await forwardRes.json();
              statusText = forwardData?.result?.status || forwardData?.status || `HTTP ${forwardRes.status}`;
            } catch {
              statusText = `HTTP ${forwardRes.status}`;
            }
            console.log(`[Bridge] ✅ Diproses oleh localhost:`, statusText);
          } catch (forwardErr) {
            console.error(`[Bridge] ❌ Gagal meneruskan ke ${LOCAL_WEBHOOK_URL}:`, forwardErr.message);
          }
        }
      }
    } catch (err) {
      consecutiveErrors++;
      if (!err.message?.includes('aborted') && !err.message?.includes('fetch failed')) {
        console.error('[Bridge] Polling error:', err.message);
      }
      const backoff = Math.min(8000, 1000 * consecutiveErrors);
      await new Promise(r => setTimeout(r, backoff));
    }
  }
}

// Start polling
pollUpdates();

process.on('SIGINT', () => {
  isRunning = false;
  console.log('[Bridge] Polling stopped.');
  process.exit(0);
});
