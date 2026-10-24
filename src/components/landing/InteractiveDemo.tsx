'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Check, ArrowRight, Sparkles, TrendingUp, Wallet, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatExpenseReply, formatIncomeReply, formatTransferReply } from '@/lib/telegram/formatter';
import { parseIndonesianCurrency, formatRupiah } from '@/lib/currency';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export function InteractiveDemo() {
  const [input, setInput] = useState('beli bakso 15rb');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'beli bakso 15rb',
      time: '12:20 WIB',
    },
    {
      id: 'm2',
      sender: 'bot',
      text: formatExpenseReply({
        amount: 15000,
        categoryName: 'Makanan & Minuman',
        categoryEmoji: '🍜',
        walletName: 'Cash',
        notes: 'beli bakso',
        newBalance: 435000,
        budget: {
          limit: 1500000,
          spent: 860000,
          percentage: 57,
          remaining: 640000,
        },
      }),
      time: '12:20 WIB',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text,
      time: 'Baru saja',
    };

    let reply = '';
    const lower = text.toLowerCase();
    const nominal = parseIndonesianCurrency(lower) || 25000;

    if (lower.includes('gaji') || lower.includes('masuk') || lower.includes('income')) {
      reply = formatIncomeReply({
        amount: nominal,
        categoryName: 'Gaji Pokok',
        walletName: 'BCA',
        newBalance: 4750000 + nominal,
      });
    } else if (lower.includes('tf') || lower.includes('transfer')) {
      reply = formatTransferReply({
        amount: nominal,
        fromWallet: 'BCA',
        toWallet: 'GoPay',
        fromBalance: 4650000,
        toBalance: 420000,
      });
    } else {
      reply = formatExpenseReply({
        amount: nominal,
        categoryName: 'Makanan & Minuman',
        categoryEmoji: '🍜',
        walletName: 'Cash',
        notes: text,
        newBalance: 420000,
        budget: {
          limit: 1500000,
          spent: 875000,
          percentage: 58,
          remaining: 625000,
        },
      });
    }

    const botMsg: ChatMessage = {
      id: `b-${Date.now()}`,
      sender: 'bot',
      text: reply,
      time: 'Baru saja',
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <section id="demo" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-[#7a2e38] uppercase tracking-widest bg-[#fdcfd4]/40 px-3 py-1 rounded-full border border-[#fdcfd4]">
            Interactive Experience
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Coba Langsung Simulasi Chat Telegram
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Ketik pengeluaranmu dalam bahasa sehari-hari. AI TataDana otomatis mengenali nominal, dompet, dan budget.
          </p>
        </div>

        {/* Simulator Box */}
        <div className="mt-12 max-w-4xl mx-auto rounded-3xl border border-neutral-200 bg-neutral-50 shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-2">
                  TataDana Telegram Bot
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-xs text-neutral-400">@TataDanaBot • Online</div>
              </div>
            </div>

            {/* Quick Pills */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-neutral-400">Coba klik:</span>
              <button
                onClick={() => handleSend('beli bakso 15rb')}
                className="bg-neutral-800 hover:bg-neutral-700 text-[#fdcfd4] px-2.5 py-1 rounded-lg transition-colors"
              >
                beli bakso 15rb
              </button>
              <button
                onClick={() => handleSend('gajian 5jt')}
                className="bg-neutral-800 hover:bg-neutral-700 text-emerald-300 px-2.5 py-1 rounded-lg transition-colors"
              >
                gajian 5jt
              </button>
              <button
                onClick={() => handleSend('tf bca ke gopay 100rb')}
                className="bg-neutral-800 hover:bg-neutral-700 text-[#afc28a] px-2.5 py-1 rounded-lg transition-colors"
              >
                tf bca ke gopay 100rb
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 sm:p-6 h-[420px] overflow-y-auto space-y-4 bg-[#f8fafc]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm text-sm whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-brand-500 text-white rounded-br-none font-medium'
                      : 'bg-white text-neutral-800 rounded-bl-none border border-neutral-200/80 font-mono leading-relaxed'
                  }`}
                >
                  {m.text}
                  <div
                    className={`text-[10px] mt-2 text-right ${
                      m.sender === 'user' ? 'text-white/70' : 'text-neutral-400'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-white border-t border-neutral-200 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ketik transaksi... (contoh: kopi 24k, bensin 50rb)"
              className="flex-1 bg-neutral-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
            />
            <Button onClick={() => handleSend()} size="md" className="px-5">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
