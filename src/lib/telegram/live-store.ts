import fs from 'fs';
import path from 'path';
import { Transaction } from '@/types';

// In-memory + persistent file live store for transactions recorded via Telegram bot
declare global {
  var __tatadana_live_transactions: Transaction[] | undefined;
}

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'live-transactions.json');

function loadFromDisk(): Transaction[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[LiveStore] Failed to load from disk:', err);
  }
  return [];
}

let isSaving = false;
let pendingSave = false;

async function saveToDisk(txs: Transaction[]) {
  if (isSaving) {
    pendingSave = true;
    return;
  }
  isSaving = true;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(txs, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[LiveStore] Failed to save to disk:', err);
  } finally {
    isSaving = false;
    if (pendingSave && global.__tatadana_live_transactions) {
      pendingSave = false;
      saveToDisk(global.__tatadana_live_transactions);
    }
  }
}

if (!global.__tatadana_live_transactions) {
  global.__tatadana_live_transactions = loadFromDisk();
}

export function pushLiveTransaction(tx: any) {
  if (!global.__tatadana_live_transactions) {
    global.__tatadana_live_transactions = loadFromDisk();
  }
  
  const formatted: Transaction = {
    id: tx.id || `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    user_id: tx.user_id || 'usr-dimas-001',
    wallet_id: tx.wallet_id || 'wal-01',
    to_wallet_id: tx.to_wallet_id || null,
    category_id: tx.category_id || 'cat-01',
    type: tx.type || 'expense',
    amount: Number(tx.amount) || 0,
    notes: tx.notes || tx.note || 'Transaksi Telegram',
    transaction_time: tx.transaction_time || new Date().toISOString(),
    source: tx.source || 'telegram_text',
    raw_input: tx.raw_input || tx.notes || '',
    receipt_image_url: tx.receipt_image_url || null,
    voice_transcript: tx.voice_transcript || null,
    created_at: tx.created_at || new Date().toISOString(),
  };

  // Avoid duplicates
  const exists = global.__tatadana_live_transactions.some(t => t.id === formatted.id || (t.raw_input === formatted.raw_input && Math.abs(new Date(t.transaction_time).getTime() - new Date(formatted.transaction_time).getTime()) < 3000));
  if (!exists) {
    global.__tatadana_live_transactions.unshift(formatted);
  }
  
  if (global.__tatadana_live_transactions.length > 200) {
    global.__tatadana_live_transactions = global.__tatadana_live_transactions.slice(0, 200);
  }

  saveToDisk(global.__tatadana_live_transactions);
}

export function getLiveTransactions(): Transaction[] {
  if (!global.__tatadana_live_transactions || global.__tatadana_live_transactions.length === 0) {
    global.__tatadana_live_transactions = loadFromDisk();
  }
  return global.__tatadana_live_transactions || [];
}
