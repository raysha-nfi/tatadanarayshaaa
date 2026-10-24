'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA: TATA AI BOT (IN-APP INTERACTIVE FINANCIAL ASSISTANT)
// Real-time chat assistant connected to user's real transactions, budgets, & wallets
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  TrendingDown,
  Calendar,
  Wallet,
  Zap,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  User,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function TataAIPage() {
  const {
    tataAIMessages,
    sendTataAIMessage,
    activeUser,
    wallets,
    budgets,
    transactions,
    recurringBills,
    aiExecutionMode,
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      title: 'Sisa Uang Makan',
      prompt: 'Berapa sisa uang makan minggu ini dan bagaimana laju pengeluarannya?',
      icon: '🍜',
    },
    {
      title: 'Strategi Hemat',
      prompt: 'Buatkan strategi hemat akhir bulan berdasarkan tren pengeluaran saya.',
      icon: '💡',
    },
    {
      title: 'Analisa Terbesar',
      prompt: 'Analisa pengeluaran terbesarku bulan ini dan berikan saran optimasi.',
      icon: '📊',
    },
    {
      title: 'Jadwal Tagihan',
      prompt: 'Cek daftar tagihan rutin dan agenda jatuh tempo terdekat.',
      icon: '📅',
    },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tataAIMessages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isTyping) return;

    setInputPrompt('');
    setIsTyping(true);

    try {
      await sendTataAIMessage(text);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const totalBalance = wallets.reduce((a, b) => a + b.balance, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#6e8349] via-[#afc28a] to-[#d66b7b] rounded-2xl p-6 text-white shadow-lg shadow-[#afc28a]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">Tata AI Bot</h1>
              <Badge variant="pro" size="sm" className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                Active Context
              </Badge>
            </div>
            <p className="text-white/90 text-sm mt-0.5 font-medium">
              Asisten finansial interaktif yang memahami data transaksi, dompet, dan budget Anda secara langsung.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-semibold text-white/90 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Multi-Provider AI Active ({aiExecutionMode === 'parallel_failover' ? 'Failover Mode' : 'Single Engine'})</span>
        </div>
      </div>

      {/* Main Chat Card */}
      <Card className="border border-neutral-200/90 shadow-sm flex flex-col h-[650px] overflow-hidden p-0 bg-white">
        {/* Chat History Header */}
        <div className="px-6 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-600">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Riwayat Konsultasi Keuangan Anda</span>
          </div>
          <div className="text-xs text-neutral-400 font-medium">
            Tersinkronisasi Real-Time dengan Database Supabase
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
          {tataAIMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-sm ${
                    isUser
                      ? 'bg-neutral-800 text-white'
                      : 'bg-brand-500 text-white shadow-brand-500/20'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-brand-500 text-white rounded-tr-none'
                      : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">Tata AI sedang menganalisis data finansial Anda</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts Container */}
        <div className="px-6 py-3 border-t border-neutral-100 bg-white">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#fdcfd4] bg-[#feedf0] hover:bg-[#fdcfd4]/50 text-[#7a2e38] transition-colors flex items-center gap-1.5"
              >
                <span>{qp.icon}</span>
                <span>{qp.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-neutral-200 bg-white flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan kondisi keuangan, tips hemat, atau analisa budget..."
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-medium transition-all"
            />
          </div>

          <Button
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || isTyping}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2"
          >
            <span>Kirim</span>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Snapshot Context Footer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3 border border-neutral-200">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Total Saldo Terpantau</span>
            <span className="text-base font-extrabold text-neutral-900">Rp{totalBalance.toLocaleString('id-ID')}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 border border-neutral-200">
          <div className="w-10 h-10 rounded-xl bg-[#feedf0] text-[#7a2e38] flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Target Budget Aktif</span>
            <span className="text-base font-extrabold text-neutral-900">{budgets.length} Kategori</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 border border-neutral-200">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Agenda Tagihan Rutin</span>
            <span className="text-base font-extrabold text-neutral-900">{recurringBills.length} Tagihan</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
