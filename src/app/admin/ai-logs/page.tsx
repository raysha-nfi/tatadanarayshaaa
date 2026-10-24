'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA ADMIN: AI INVOCATION LOGS (PART 10 & DISPATCH REQUIREMENTS)
// Debugging, latency tracking, prompt/completion token usage, feature, & status
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { FileCode2, Cpu, CheckCircle2, XCircle, Clock, X } from 'lucide-react';
import { useAdmin, ExtendedAILog } from '../admin-context';
import { formatIndonesianDate, formatIndonesianTime } from '@/lib/date';

export default function AdminAiLogsPage() {
  const { aiLogs } = useAdmin();
  const [providerFilter, setProviderFilter] = useState('all');
  const [featureFilter, setFeatureFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<ExtendedAILog | null>(null);

  const filteredLogs = aiLogs.filter((l) => {
    if (providerFilter !== 'all' && l.provider !== providerFilter) return false;
    if (featureFilter !== 'all' && l.feature !== featureFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Log Pemanggilan AI & Monitoring Biaya Token
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pantau konsumsi tokens (prompt/completion), latency waktu eksekusi, serta status per provider (Gemini, GPT, DeepSeek).
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">Semua Provider</option>
            <option value="gemini">Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
          </select>

          <select
            value={featureFilter}
            onChange={(e) => setFeatureFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">Semua Fitur</option>
            <option value="text_parse">Teks NL Parser</option>
            <option value="receipt_ocr">Struk Vision OCR</option>
            <option value="voice_stt">Audio STT Voice</option>
            <option value="advisor">Financial Advisor</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Waktu (WIB)</th>
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-4">Fitur Pipeline</th>
                <th className="py-3.5 px-4">Prompt / Completion Tokens</th>
                <th className="py-3.5 px-4">Latensi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => {
                const promptTokens = log.prompt_tokens ?? Math.round(log.tokens_used * 0.75);
                const compTokens = log.completion_tokens ?? Math.round(log.tokens_used * 0.25);
                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatIndonesianDate(log.created_at)}
                      <span className="block text-[10px] text-slate-500 font-mono">
                        {formatIndonesianTime(log.created_at)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                          log.provider === 'gemini'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : log.provider === 'openai'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-sky-950 text-sky-300 border border-sky-800'
                        }`}
                      >
                        {log.provider}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-mono">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {log.feature || log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-200 font-bold">{log.tokens_used} tokens</span>
                        <span className="text-[10px] text-slate-500">
                          (P: {promptTokens} | C: {compTokens})
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          log.latency_ms < 500
                            ? 'text-emerald-400 bg-emerald-950/40'
                            : log.latency_ms < 1000
                            ? 'text-sky-400 bg-sky-950/40'
                            : 'text-amber-400 bg-amber-950/40'
                        }`}
                      >
                        {log.latency_ms} ms
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Gagal (429)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] font-bold transition-colors"
                      >
                        Lihat Payload
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Rincian AI Call Payload ({selectedLog.provider.toUpperCase()})
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {selectedLog.id} • Latensi: {selectedLog.latency_ms} ms
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Prompt Input Payload
                </label>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {selectedLog.prompt_preview || 'Tidak ada preview prompt'}
                </pre>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Response Output Payload
                </label>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {selectedLog.response_preview || 'Tidak ada response'}
                </pre>
              </div>

              {selectedLog.error_message && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                  <b>Pesan Error:</b> {selectedLog.error_message}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
