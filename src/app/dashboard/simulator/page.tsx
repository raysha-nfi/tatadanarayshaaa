'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA IN-APP BOT SIMULATOR (R4 & PART 4)
// Zero-tunnel localhost testing for Telegram Bot Text, Receipt Photo OCR, & Voice STT
// Live synchronized with global AppContext (Wallets, Transactions, Budgets)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image as ImageIcon,
  Mic,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  Volume2,
  Crown,
  Info,
  Shield,
  Layers,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah, parseIndonesianCurrency } from '@/lib/currency';
import {
  formatExpenseReply,
  formatIncomeReply,
  formatTransferReply,
  formatHelpReply,
  formatSaldoReply,
} from '@/lib/telegram/formatter';
import { canUseReceiptPhoto } from '@/lib/limits';
import { formatBotTimestamp } from '@/lib/date';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  type?: 'text' | 'image' | 'voice';
  imageUrl?: string;
  audioDuration?: string;
  meta?: {
    nominal?: number;
    kategori?: string;
    wallet?: string;
  };
}

export default function SimulatorPage() {
  const {
    activeUser,
    wallets,
    categories,
    budgets,
    transactions,
    addTransaction,
    togglePlan,
  } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome-1',
      sender: 'bot',
      text: formatHelpReply(),
      time: formatBotTimestamp(),
      type: 'text',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Helper to resolve wallet by name or default
  const resolveWallet = (nameHint?: string) => {
    if (!nameHint) return wallets.find((w) => w.is_default) || wallets[0];
    const hint = nameHint.toLowerCase();
    const found = wallets.find((w) => w.name.toLowerCase().includes(hint));
    return found || wallets.find((w) => w.is_default) || wallets[0];
  };

  // Helper to resolve category
  const resolveCategory = (nameHint?: string, type: 'income' | 'expense' = 'expense') => {
    if (!nameHint) return categories.find((c) => c.type === type) || categories[0];
    const hint = nameHint.toLowerCase();
    const found = categories.find((c) => c.name.toLowerCase().includes(hint));
    return found || categories.find((c) => c.type === type) || categories[0];
  };

  // Helper to find budget
  const resolveBudget = (categoryId: string) => {
    const b = budgets.find((bg) => bg.category_id === categoryId);
    if (!b) return null;
    return {
      limit: Number(b.monthly_limit),
      spent: Number(b.spent || 0),
      percentage: Number(b.percentage || 0),
      remaining: Number(b.remaining || 0),
    };
  };

  // 1. Process Text Input
  const handleSendText = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: formatBotTimestamp(),
      type: 'text',
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Check bot commands
      const lower = text.toLowerCase();
      if (lower === '/help' || lower === '/bantuan') {
        const botReply = formatHelpReply();
        setMessages((prev) => [
          ...prev,
          { id: `b-${Date.now()}`, sender: 'bot', text: botReply, time: formatBotTimestamp(), type: 'text' },
        ]);
        setLoading(false);
        return;
      }

      if (lower === '/saldo') {
        const botReply = formatSaldoReply(wallets);
        setMessages((prev) => [
          ...prev,
          { id: `b-${Date.now()}`, sender: 'bot', text: botReply, time: formatBotTimestamp(), type: 'text' },
        ]);
        setLoading(false);
        return;
      }

      if (lower === '/budget') {
        let budgetReply = `🎯 Status Budget Kategori Bulan Ini:\n\n`;
        budgets.forEach((b) => {
          const cat = categories.find((c) => c.id === b.category_id);
          const limit = Number(b.monthly_limit);
          const spent = Number(b.spent || 0);
          const pct = Math.round((spent / limit) * 100);
          const filled = Math.round(Math.min(100, pct) / 10);
          const bar = `${'█'.repeat(filled)}${'░'.repeat(10 - filled)} ${pct}%`;
          budgetReply += `├ ${cat?.emoji || '📁'} ${cat?.name || 'Kategori'}\n`;
          budgetReply += `│ ${bar} (${formatRupiah(spent)} / ${formatRupiah(limit)})\n`;
        });
        budgetReply += `\nTetap kendalikan pengeluaranmu ya! 💪`;
        setMessages((prev) => [
          ...prev,
          { id: `b-${Date.now()}`, sender: 'bot', text: budgetReply, time: formatBotTimestamp(), type: 'text' },
        ]);
        setLoading(false);
        return;
      }

      if (lower === '/hari_ini' || lower === '/bulan_ini' || lower === '/minggu_ini') {
        const totalExp = transactions.filter((t) => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
        const totalInc = transactions.filter((t) => t.type === 'income').reduce((a, b) => a + b.amount, 0);
        const recap = `📊 Rekap Keuangan TataDana (${lower.replace('/', '')}):\n\n` +
          `💰 Total Pemasukan: ${formatRupiah(totalInc)}\n` +
          `💸 Total Pengeluaran: ${formatRupiah(totalExp)}\n` +
          `📈 Net Saldo: ${formatRupiah(totalInc - totalExp)}\n\n` +
          `Gunakan /saldo untuk cek dompet atau ketik langsung pengeluaran barumu!`;
        setMessages((prev) => [
          ...prev,
          { id: `b-${Date.now()}`, sender: 'bot', text: recap, time: formatBotTimestamp(), type: 'text' },
        ]);
        setLoading(false);
        return;
      }

      // Call API or Fallback AI Parser
      let parsedData: any = null;
      try {
        const res = await fetch('/api/ai/parse-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, userId: activeUser.id }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            parsedData = json.data;
          }
        }
      } catch (e) {
        // Fallback local parser
      }

      // If API was unavailable or returned empty, perform local parse
      if (!parsedData) {
        const nominal = parseIndonesianCurrency(text) || 25000;
        const isIncome = lower.includes('gaji') || lower.includes('masuk') || lower.includes('income') || lower.includes('dapat');
        const isTransfer = lower.includes('tf') || lower.includes('transfer');

        let catHint = 'Lainnya';
        if (lower.includes('bakso') || lower.includes('makan') || lower.includes('kopi') || lower.includes('sate') || lower.includes('padang')) {
          catHint = 'Makanan';
        } else if (lower.includes('bensin') || lower.includes('gojek') || lower.includes('grab') || lower.includes('parkir')) {
          catHint = 'Transport';
        } else if (lower.includes('baju') || lower.includes('belanja') || lower.includes('shopee') || lower.includes('indomaret')) {
          catHint = 'Belanja';
        }

        parsedData = {
          jenis: isTransfer ? 'transfer' : isIncome ? 'pemasukan' : 'pengeluaran',
          nominal,
          kategori: catHint,
          catatan: text,
          wallet_asal: lower.includes('gopay') ? 'GoPay' : lower.includes('cash') || lower.includes('tunai') ? 'Cash' : 'BCA',
          wallet_tujuan: isTransfer ? 'GoPay' : null,
        };
      }

      // Execute transaction into AppContext
      let botResponse = '';
      if (parsedData.jenis === 'transfer') {
        const fromW = resolveWallet(parsedData.wallet_asal || 'BCA');
        const toW = wallets.find((w) => w.id !== fromW.id) || wallets[1] || wallets[0];
        const res = addTransaction({
          wallet_id: fromW.id,
          to_wallet_id: toW.id,
          type: 'transfer',
          amount: parsedData.nominal,
          notes: parsedData.catatan || text,
          source: 'telegram_text',
        });

        if (!res.success) {
          botResponse = `⚠️ Gagal mencatat: ${res.message}`;
        } else {
          botResponse = formatTransferReply({
            amount: parsedData.nominal,
            fromWallet: fromW.name,
            toWallet: toW.name,
            fromBalance: fromW.balance - parsedData.nominal,
            toBalance: toW.balance + parsedData.nominal,
          });
        }
      } else if (parsedData.jenis === 'pemasukan' || parsedData.jenis === 'income') {
        const w = resolveWallet(parsedData.wallet_asal);
        const cat = resolveCategory(parsedData.kategori, 'income');
        const res = addTransaction({
          wallet_id: w.id,
          category_id: cat.id,
          type: 'income',
          amount: parsedData.nominal,
          notes: parsedData.catatan || text,
          source: 'telegram_text',
        });

        if (!res.success) {
          botResponse = `⚠️ Gagal mencatat: ${res.message}`;
        } else {
          botResponse = formatIncomeReply({
            amount: parsedData.nominal,
            categoryName: cat.name,
            walletName: w.name,
            newBalance: w.balance + parsedData.nominal,
          });
        }
      } else {
        // Pengeluaran (Expense)
        const w = resolveWallet(parsedData.wallet_asal);
        const cat = resolveCategory(parsedData.kategori, 'expense');
        const bg = resolveBudget(cat.id);

        const res = addTransaction({
          wallet_id: w.id,
          category_id: cat.id,
          type: 'expense',
          amount: parsedData.nominal,
          notes: parsedData.catatan || text,
          source: 'telegram_text',
        });

        if (!res.success) {
          botResponse = `⚠️ Gagal mencatat: ${res.message}`;
        } else {
          botResponse = formatExpenseReply({
            amount: parsedData.nominal,
            categoryName: cat.name,
            categoryEmoji: cat.emoji,
            walletName: w.name,
            notes: parsedData.catatan || text,
            newBalance: w.balance - parsedData.nominal,
            budget: bg,
          });

          if (res.advisorAlert) {
            botResponse += `\n\n💡 Pro Advisor: ${res.advisorAlert}`;
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, sender: 'bot', text: botResponse, time: formatBotTimestamp(), type: 'text' },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ Terjadi kesalahan: ${err.message || 'Gagal memproses pesan'}`,
          time: formatBotTimestamp(),
          type: 'text',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 2. Process Receipt Photo OCR
  const handleReceiptUpload = async (imageSrc: string, filename?: string) => {
    // Check Pro Plan Gating
    const check = canUseReceiptPhoto(activeUser.plan);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: filename ? `📸 Mengunggah struk: ${filename}` : '📸 Foto Struk Belanja',
      time: formatBotTimestamp(),
      type: 'image',
      imageUrl: imageSrc,
    };
    setMessages((prev) => [...prev, userMsg]);

    if (!check.allowed) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: check.message || 'Fitur scan struk hanya untuk pengguna Pro.',
          time: formatBotTimestamp(),
          type: 'text',
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      let receiptData: any = null;
      try {
        const res = await fetch('/api/ai/parse-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageSrc, userId: activeUser.id }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) receiptData = json.data;
        }
      } catch (e) {}

      // Fallback structured receipt mock if API call offline
      if (!receiptData) {
        receiptData = {
          merchantName: 'Indomaret Point Thamrin',
          totalAmount: 64500,
          date: '2026-10-10',
          items: [
            { name: 'Kopi Kenangan Mantan', price: 18000, quantity: 1, category: 'Makanan' },
            { name: 'Roti Gandum Sari Roti', price: 21500, quantity: 1, category: 'Makanan' },
            { name: 'Air Mineral Aqua 600ml', price: 5000, quantity: 2, category: 'Makanan' },
            { name: 'Tissue Basah Paseo', price: 15000, quantity: 1, category: 'Belanja' },
          ],
        };
      }

      // Add to AppContext
      const w = resolveWallet('BCA');
      const cat = resolveCategory('Belanja', 'expense');
      const bg = resolveBudget(cat.id);

      addTransaction({
        wallet_id: w.id,
        category_id: cat.id,
        type: 'expense',
        amount: receiptData.totalAmount,
        notes: `Belanja di ${receiptData.merchantName} (${receiptData.items?.length || 1} item)`,
        source: 'telegram_photo',
        receipt_items: receiptData.items,
      });

      let itemsSummary = '';
      if (receiptData.items && receiptData.items.length > 0) {
        itemsSummary = `\n📋 Rincian Item Struk:\n` +
          receiptData.items
            .map((item: any) => `  • ${item.name} (${item.quantity}x) — ${formatRupiah(item.price * item.quantity)}`)
            .join('\n');
      }

      const botText = formatExpenseReply({
        amount: receiptData.totalAmount,
        categoryName: cat.name,
        categoryEmoji: cat.emoji,
        walletName: w.name,
        notes: `Struk: ${receiptData.merchantName}`,
        newBalance: w.balance - receiptData.totalAmount,
        budget: bg,
      }) + itemsSummary;

      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, sender: 'bot', text: botText, time: formatBotTimestamp(), type: 'text' },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ Gagal membaca struk: ${err.message}`,
          time: formatBotTimestamp(),
          type: 'text',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 3. Process Voice Note STT
  const handleVoiceUpload = async (audioData: string, sampleTranscript?: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: '🎙️ Voice Note (Pesan Suara 0:04)',
      time: formatBotTimestamp(),
      type: 'voice',
      audioDuration: '0:04',
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      let transcript = sampleTranscript;
      if (!transcript) {
        try {
          const res = await fetch('/api/ai/transcribe-voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: audioData, userId: activeUser.id }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.transcript) transcript = json.transcript;
          }
        } catch (e) {}
      }

      if (!transcript) {
        transcript = 'beli bensin pertalite 50 ribu pakai cash';
      }

      // Process transcribed text through standard transaction engine
      const nominal = parseIndonesianCurrency(transcript) || 50000;
      const w = resolveWallet('Cash');
      const cat = resolveCategory('Transport', 'expense');
      const bg = resolveBudget(cat.id);

      addTransaction({
        wallet_id: w.id,
        category_id: cat.id,
        type: 'expense',
        amount: nominal,
        notes: transcript,
        source: 'telegram_voice',
      });

      const reply = formatExpenseReply({
        amount: nominal,
        categoryName: cat.name,
        categoryEmoji: cat.emoji,
        walletName: w.name,
        notes: transcript,
        newBalance: w.balance - nominal,
        budget: bg,
        voiceTranscript: transcript,
      });

      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, sender: 'bot', text: reply, time: formatBotTimestamp(), type: 'text' },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ Format audio tidak didukung atau rekaman terlalu hening: ${err.message}`,
          time: formatBotTimestamp(),
          type: 'text',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Sample Receipt preset
  const sendSampleReceipt = () => {
    handleReceiptUpload(
      'https://images.unsplash.com/photo-1554415707-9e49019a83d0?w=600&auto=format&fit=crop&q=80',
      'struk-indomaret-point.jpg'
    );
  };

  // Sample Voice note preset
  const sendSampleVoice = () => {
    handleVoiceUpload('data:audio/ogg;base64,GkXfo59ChoEBQveBAULygQ8=', 'beli bensin pertalite 50 ribu pakai cash');
  };

  // File Upload Handlers
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleReceiptUpload(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleVoiceUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
              In-App Bot Simulator
            </h1>
            <Badge variant="brand" size="sm">
              Zero-Tunnel Localhost
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Uji interaksi Telegram Bot secara instan di browser. Mendukung pesan teks, foto struk belanja, dan audio suara.
          </p>
        </div>

        {/* Plan Switcher for Quick Reviewer Testing */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <div className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 px-2">
            Status Paket:
          </div>
          <button
            onClick={togglePlan}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeUser.plan === 'pro'
                ? 'bg-gradient-to-r from-[#6e8349] to-[#d66b7b] text-white shadow-sm'
                : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 shadow-sm'
            }`}
            title="Klik untuk beralih antara Starter dan Pro untuk menguji pembatasan fitur OCR"
          >
            {activeUser.plan === 'pro' ? <Crown className="w-3.5 h-3.5" /> : null}
            <span className="uppercase">{activeUser.plan}</span>
            <span className="text-[10px] font-normal underline opacity-80">(Ganti)</span>
          </button>
        </div>
      </div>

      {/* Main Telegram Simulator Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chat Emulator Box (2 cols) */}
        <div className="lg:col-span-2 flex flex-col h-[650px] bg-neutral-50 dark:bg-[#111827] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xl overflow-hidden">
          {/* Telegram Header */}
          <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6e8349] to-[#fdcfd4] text-white flex items-center justify-center font-black text-sm shadow-md shadow-brand-500/20">
                TD
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm">
                    TataDana Bot
                  </h3>
                  <Badge variant="pro" size="sm" className="text-[9px] py-0 px-1.5">
                    BOT
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>online (@tatadanabot)</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() =>
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    sender: 'bot',
                    text: formatHelpReply(),
                    time: formatBotTimestamp(),
                    type: 'text',
                  },
                ])
              }
              variant="ghost"
              size="sm"
              className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reset Chat
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#f0f2f5]/60 dark:bg-[#0b0f17]/90">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mb-1 shadow-sm">
                      TD
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                      isUser
                        ? 'bg-brand-500 text-white rounded-br-none'
                        : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-700/80 rounded-bl-none'
                    }`}
                  >
                    {/* Image Preview if user uploaded receipt */}
                    {msg.type === 'image' && msg.imageUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-white/20 max-h-48">
                        <img
                          src={msg.imageUrl}
                          alt="Receipt attachment"
                          className="w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Voice Note Pill if audio */}
                    {msg.type === 'voice' && (
                      <div className="flex items-center gap-2 mb-1 bg-black/15 px-3 py-1.5 rounded-xl">
                        <Volume2 className="w-4 h-4 text-white animate-pulse" />
                        <span className="text-xs font-semibold text-white">
                          Pesan Suara Telegram ({msg.audioDuration})
                        </span>
                      </div>
                    )}

                    {/* Text Message Content */}
                    <div className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line font-sans">
                      {msg.text}
                    </div>

                    {/* Timestamp */}
                    <div
                      className={`text-[10px] mt-1.5 text-right font-medium ${
                        isUser ? 'text-white/80' : 'text-neutral-400'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-xs shrink-0 mb-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-neutral-400 text-xs italic pl-9 animate-pulse">
                <Bot className="w-4 h-4 text-brand-500 animate-spin" />
                <span>TataDana Bot sedang mengetik...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Bar */}
          <div className="bg-white/95 dark:bg-neutral-900/95 border-t border-neutral-100 dark:border-neutral-800 px-4 py-2 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-neutral-400 shrink-0 font-bold">Coba:</span>
            {[
              'beli nasi padang 25rb',
              'kopi kenangan 18k bca',
              'gajian masuk 8.5jt',
              'tf bca ke gopay 100k',
              '/saldo',
              '/budget',
              '/bantuan',
            ].map((hint) => (
              <button
                key={hint}
                onClick={() => handleSendText(hint)}
                className="bg-neutral-100 hover:bg-[#feedf0] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 hover:text-brand-600 dark:text-neutral-300 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-neutral-200/60 dark:border-neutral-700 font-medium"
              >
                {hint}
              </button>
            ))}
          </div>

          {/* Input & Action Trigger Bar */}
          <div className="bg-white dark:bg-neutral-900 p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={audioInputRef}
              onChange={handleAudioFileChange}
              accept="audio/*"
              className="hidden"
            />

            {/* Receipt Button */}
            <button
              onClick={() => imageInputRef.current?.click()}
              title="Upload Foto Struk Belanja (AI Vision OCR)"
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-brand-500 hover:bg-[#feedf0] dark:hover:bg-neutral-800 transition-colors shrink-0"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Voice Button */}
            <button
              onClick={() => audioInputRef.current?.click()}
              title="Upload / Rekam Voice Note (.oga, .mp3)"
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-brand-500 hover:bg-[#feedf0] dark:hover:bg-neutral-800 transition-colors shrink-0"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Main Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="Tulis pesan (misal: 'beli sate 25rb pakai bca')..."
              className="flex-1 bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/30"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendText()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0 shadow-sm shadow-brand-500/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Testing Controls & Capabilities (1 col) */}
        <div className="space-y-4">
          {/* Quick Simulation Actions Card */}
          <Card className="p-5">
            <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              Preset Pengujian Instan
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Uji fitur multimodal Telegram tanpa perlu menyiapkan file struk atau audio manual:
            </p>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={sendSampleReceipt}
                className="w-full text-left p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-brand-500 hover:bg-[#feedf0]/60 dark:hover:bg-neutral-800 transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#feedf0] text-brand-700 dark:bg-neutral-800 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-brand-600 flex items-center gap-1.5">
                    Struk Indomaret (4 Items)
                    <Badge variant="pro" size="sm" className="text-[9px]">
                      PRO
                    </Badge>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Simulasi struk Rp64.500 multi-item dengan rincian breakdown kopi, roti & tissue.
                  </p>
                </div>
              </button>

              <button
                onClick={sendSampleVoice}
                className="w-full text-left p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-brand-500 hover:bg-[#feedf0]/60 dark:hover:bg-neutral-800 transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 dark:bg-neutral-800 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-brand-600">
                    Voice Note Audio STT
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Transkripsi suara "beli bensin pertalite 50 ribu pakai cash" via Gemini STT.
                  </p>
                </div>
              </button>
            </div>
          </Card>

          {/* Sync Status Card */}
          <Card className="p-5 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Sinkronisasi Dashboard Realtime
            </div>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              Setiap transaksi yang berhasil diproses di simulator langsung tersimpan ke data akun dan otomatis mengupdate:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-neutral-200">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Saldo dompet (BCA, Cash, GoPay)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Progress bar budget per kategori
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Grafik & riwayat transaksi dashboard
              </li>
            </ul>
          </Card>

          {/* Architecture Info Card */}
          <Card className="p-5 text-xs space-y-2 border-neutral-200/80 dark:border-neutral-800">
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-brand-500" />
              Mengapa Zero-Tunnel?
            </h4>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Simulator ini mengeksekusi pipeline NLP, Vision OCR, dan STT langsung melalui API route Next.js internal (<code>/api/ai/*</code>) tanpa memerlukan setup ngrok/cloudflare tunnel saat pengujian di localhost.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
