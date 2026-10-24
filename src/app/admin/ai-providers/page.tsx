'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA ADMIN: AI PROVIDERS & FAILOVER ENGINE (PART 2 & PART 10)
// Mode: Single vs Paralel (Failover), Kelola API Key terenkripsi (Gemini, GPT, DeepSeek)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Cpu, Save, ShieldCheck, CheckCircle2, Zap, Activity } from 'lucide-react';
import { useAdmin } from '../admin-context';
import { AIProvider, AIExecutionMode } from '@/types';

export default function AdminAiProvidersPage() {
  const {
    providers,
    updateProvider,
    executionMode,
    setExecutionMode,
    saveProviderSettings,
  } = useAdmin();

  const [providersState, setProvidersState] = useState<AIProvider[]>(providers);
  const [saveNotice, setSaveNotice] = useState(false);

  const handleToggleActive = (id: string) => {
    setProvidersState((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
  };

  const handleKeyChange = (id: string, key: string) => {
    setProvidersState((prev) =>
      prev.map((p) => (p.id === id ? { ...p, encrypted_api_key: key } : p))
    );
  };

  const handlePriorityChange = (id: string, prio: number) => {
    setProvidersState((prev) =>
      prev.map((p) => (p.id === id ? { ...p, priority: prio } : p))
    );
  };

  const handleSaveChanges = () => {
    providersState.forEach((p) => updateProvider(p));
    saveProviderSettings();
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Multi-Provider AI & Failover Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Konfigurasi arsitektur AI (Gemini, OpenAI, DeepSeek). Kunci API disimpan terenkripsi di database Supabase.
          </p>
        </div>

        <button
          onClick={handleSaveChanges}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105"
        >
          <Save className="w-4 h-4" />
          Simpan Semua Konfigurasi
        </button>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Pengaturan provider dan failover berhasil diperbarui di database!
        </div>
      )}

      {/* Mode Selector Card (Part 2 & Part 10) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
          Mode Eksekusi AI Pipeline
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Pilih apakah sistem hanya menggunakan 1 provider utama (Single) atau mencoba provider lain secara berurutan saat terjadi error (Parallel Failover).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setExecutionMode('parallel_failover')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              executionMode === 'parallel_failover'
                ? 'bg-purple-950/50 border-purple-500 text-purple-200 shadow-md shadow-purple-900/30 ring-1 ring-purple-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Paralel Failover (Rekomendasi 99.9% Uptime)
              </span>
              <span className={`w-3 h-3 rounded-full ${executionMode === 'parallel_failover' ? 'bg-purple-500' : 'border border-slate-600'}`} />
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Jika Provider 1 (misal Gemini) gagal atau kuota habis (HTTP 429), sistem otomatis failover ke Provider 2 (OpenAI), lalu ke Provider 3 (DeepSeek). Bot Telegram tidak akan pernah down.
            </p>
          </div>

          <div
            onClick={() => setExecutionMode('single')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              executionMode === 'single'
                ? 'bg-purple-950/50 border-purple-500 text-purple-200 shadow-md shadow-purple-900/30 ring-1 ring-purple-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                Mode Tunggal (Single Provider)
              </span>
              <span className={`w-3 h-3 rounded-full ${executionMode === 'single' ? 'bg-purple-500' : 'border border-slate-600'}`} />
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Hanya memanggil provider aktif dengan prioritas nomor 1. Jika gagal, langsung kembali ke fallback parser lokal untuk menghemat kuota API.
            </p>
          </div>
        </div>
      </div>

      {/* Provider List */}
      <div className="space-y-4">
        {providersState.map((prov) => (
          <div
            key={prov.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{prov.display_name}</h4>
                  <p className="text-xs text-slate-400">
                    Model: <code className="text-purple-300 font-mono">{prov.model_name}</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prov.is_active}
                    onChange={() => handleToggleActive(prov.id)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-800 border-slate-700"
                  />
                  <span className={prov.is_active ? 'text-emerald-400' : 'text-slate-500'}>
                    {prov.is_active ? '🟢 Provider Aktif' : '⚪ Non-aktif'}
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  API Key (Terenkripsi di Database)
                </label>
                <input
                  type="password"
                  value={prov.encrypted_api_key}
                  onChange={(e) => handleKeyChange(prov.id, e.target.value)}
                  placeholder="Kunci API dari Dashboard Provider"
                  className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Urutan Prioritas Failover
                </label>
                <select
                  value={prov.priority}
                  onChange={(e) => handlePriorityChange(prov.id, Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-purple-500"
                >
                  <option value={1}>Prioritas 1 (Utama)</option>
                  <option value={2}>Prioritas 2 (Cadangan Pertama)</option>
                  <option value={3}>Prioritas 3 (Cadangan Kedua)</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
