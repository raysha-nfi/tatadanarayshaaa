'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA ADMIN DASHBOARD LAYOUT (PART 10)
// Superadmin navigation: AI Providers, User Impersonation, Payments, AI Logs, Audit Logs
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  Cpu,
  Users,
  CreditCard,
  FileCode2,
  ScrollText,
  LayoutDashboard,
  ArrowLeft,
  Activity,
  Eye,
  X,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { AdminProvider } from './admin-context';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { impersonatedUser, impersonate } = useApp();

  const adminNav = [
    { label: 'Admin Overview', href: '/admin', tab: 'overview', icon: LayoutDashboard },
    { label: 'Pusat Approval Panel', href: '/admin/approval', tab: 'approval', icon: CheckCircle2 },
    { label: 'AI Providers & Failover', href: '/admin/ai-providers', tab: 'providers', icon: Cpu },
    { label: 'Kelola Pengguna', href: '/admin/users', tab: 'users', icon: Users },
    { label: 'Verifikasi Pembayaran', href: '/admin/payments', tab: 'payments', icon: CreditCard },
    { label: 'Log AI Monitoring', href: '/admin/ai-logs', tab: 'logs', icon: FileCode2 },
    { label: 'Audit Log Privasi', href: '/admin/audit-logs', tab: 'audit', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* PERSISTENT AMBER IMPERSONATION BANNER (PART 10 & DISPATCH REQUIREMENTS) */}
      {impersonatedUser && (
        <div className="bg-amber-500 text-slate-950 px-4 sm:px-6 py-2.5 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-lg border-b border-amber-600 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-slate-950 animate-pulse shrink-0" />
            <span className="leading-tight">
              Mode Impersonation Aktif: Anda sedang mengakses sistem sebagai{' '}
              <span className="underline decoration-slate-950 decoration-2 font-black">
                {impersonatedUser.full_name}
              </span>{' '}
              ({impersonatedUser.phone_number || impersonatedUser.id}) •{' '}
              <span className="opacity-90">Sesi terhubung langsung ke dashboard pengguna tanpa relogin</span>
            </span>
          </div>
          <button
            onClick={() => impersonate(null)}
            className="bg-slate-950 text-amber-400 hover:bg-slate-900 px-3 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 shadow-md shrink-0 ml-4 hover:scale-105 active:scale-95"
            title="Keluar dari sesi impersonasi dan kembali ke mode Superadmin penuh"
          >
            <X className="w-3.5 h-3.5" />
            Hentikan Impersonasi
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-purple-800/40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span className="tracking-wide">TATA DANA SUPERADMIN CONTROL PANEL • Restricted Area (Role: Superadmin)</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/team"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors"
          >
            👥 Tim
          </Link>
          <Link
            href="/dashboard/learn"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors"
          >
            📚 Belajar
          </Link>
          <Link
            href="/dashboard"
            className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard User
          </Link>
          <Link
            href="/login"
            className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors"
          >
            Menu Login
          </Link>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0 hidden md:flex">
          <div>
            <div className="flex items-center gap-2.5 px-2 pb-6 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-purple-600/30">
                TD
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-tight">TataDana</span>
                <span className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider -mt-0.5">
                  Superadmin Suite
                </span>
              </div>
            </div>

            <nav className="mt-6 space-y-1.5">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Multi-Provider AI Active</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Gemini 1.5 Flash • GPT-4o-mini • DeepSeek Chat V3 (Parallel Failover Mode)
              </p>
            </div>

            <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-900/40 text-[10px] text-purple-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Audit Logging Privasi Aktif (UU PDP)</span>
            </div>
          </div>
        </aside>

        {/* Admin Main Body */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
