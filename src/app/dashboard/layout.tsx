'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA USER DASHBOARD LAYOUT (PART 9)
// Sidebar: Logo · 🏠 Beranda · 💳 Transaksi · 📊 Laporan · 🎯 Budget · 👛 Wallet · ⚙️ Settings
// Badge plan user + avatar + logout + impersonation banner
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  CreditCard,
  BarChart3,
  Target,
  Wallet as WalletIcon,
  Calendar,
  Bot,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  Shield,
  Eye,
  RefreshCw,
  Users,
  GraduationCap,
  CheckCircle2,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeUser,
    currentUser,
    impersonatedUser,
    impersonate,
    togglePlan,
    toggleRole,
    activeWorkspace,
    teamApprovals,
  } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const pendingApprovals = teamApprovals.filter((a) => a.status === 'pending').length;

  const navItems = [
    { label: 'Beranda', href: '/dashboard', icon: Home, emoji: '🏠' },
    { label: 'Transaksi', href: '/dashboard/transactions', icon: CreditCard, emoji: '💳' },
    { label: 'Laporan', href: '/dashboard/reports', icon: BarChart3, emoji: '📊' },
    { label: 'Budget', href: '/dashboard/budgets', icon: Target, emoji: '🎯' },
    { label: 'Wallet & Dompet', href: '/dashboard/wallets', icon: WalletIcon, emoji: '👛' },
    { label: 'Kolaborasi Tim', href: '/dashboard/team', icon: Users, emoji: '👥' },
    { label: 'Pusat Belajar', href: '/dashboard/learn', icon: GraduationCap, emoji: '📚' },
    { label: 'Kalender Keuangan', href: '/dashboard/calendar', icon: Calendar, emoji: '📅' },
    { label: 'Tata AI Bot', href: '/dashboard/tata-ai', icon: Bot, emoji: '🧠' },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings, emoji: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Impersonation Banner (Part 10) */}
      {impersonatedUser && (
        <div className="bg-[#fdcfd4] text-[#7a2e38] px-4 py-2 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-[#fbaab4]">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 animate-pulse text-[#7a2e38]" />
            <span>Mode Impersonation: Anda sedang melihat dashboard sebagai <b>{impersonatedUser.full_name}</b> ({impersonatedUser.phone_number})</span>
          </div>
          <button
            onClick={() => impersonate(null)}
            className="bg-[#7a2e38] hover:bg-[#5f232b] px-3 py-1 rounded text-white text-[11px] font-bold transition-colors"
          >
            Keluar dari Impersonation
          </button>
        </div>
      )}

      <div className="flex flex-1">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-64 flex-col justify-between bg-white border-r border-[#afc28a]/25 p-5 sticky top-0 h-screen overflow-y-auto">
          <div>
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 px-2">
              <div className="w-9 h-9 rounded-xl bg-[#afc28a] text-white flex items-center justify-center font-black text-lg shadow-sm shadow-[#afc28a]/40">
                TD
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-neutral-900">
                  Tata<span className="text-[#afc28a]">Dana</span>
                </span>
                <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest -mt-1">
                  Fintech Indonesia
                </span>
              </div>
            </Link>

            {/* Navigation Menu */}
            <nav className="mt-8 space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#afc28a]/20 text-[#334020] border-r-4 border-[#afc28a] font-bold shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-[#fdcfd4]/20'
                    }`}
                  >
                    <span className="text-base select-none">{item.emoji}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Role Switcher (Admin Dashboard Link) */}
            <div className="mt-8 pt-6 border-t border-neutral-100 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3">
                Reviewer Controls
              </div>
              <button
                onClick={togglePlan}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-[#afc28a]/15 flex items-center justify-between"
                title="Beralih antara paket Starter dan Pro untuk menguji limitasi"
              >
                <span>Paket: <b className="uppercase text-[#334020]">{activeUser.plan}</b></span>
                <span className="text-[10px] bg-[#afc28a]/30 px-1.5 py-0.5 rounded text-[#334020] font-bold">Toggle</span>
              </button>

              <Link
                href="/admin"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#7a2e38] bg-[#fdcfd4]/40 hover:bg-[#fdcfd4]/70 border border-[#fdcfd4] transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#7a2e38]" /> Super Admin
                </span>
                <span className="text-[10px] bg-[#fdcfd4] text-[#7a2e38] px-1.5 py-0.2 rounded font-bold">Buka</span>
              </Link>
            </div>
          </div>

          {/* User Profile & Plan Badge Footer */}
          <div className="pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-3 px-2">
              <img
                src={activeUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={activeUser.full_name}
                className="w-10 h-10 rounded-full object-cover border border-neutral-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-neutral-900 truncate">{activeUser.full_name}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Badge variant={activeUser.plan === 'pro' ? 'pro' : 'brand'} size="sm">
                    {activeUser.plan === 'pro' ? '👑 PRO' : '⚡️ STARTER'}
                  </Badge>
                </div>
              </div>
              <Link href="/login" title="Logout" className="text-neutral-400 hover:text-red-500 p-1 rounded transition-colors">
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </aside>

        {/* MOBILE TOP BAR */}
        <div className="lg:hidden w-full flex flex-col">
          <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black text-sm">
                TD
              </div>
              <span className="text-lg font-black text-neutral-900">Tata<span className="text-brand-500">Dana</span></span>
            </Link>

            <div className="flex items-center gap-2">
              <Badge variant={activeUser.plan === 'pro' ? 'pro' : 'brand'} size="sm">
                {activeUser.plan.toUpperCase()}
              </Badge>
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
              >
                {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Nav */}
          {mobileSidebarOpen && (
            <div className="bg-white border-b border-neutral-200 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold ${
                      isActive ? 'bg-[#feedf0] text-brand-700' : 'text-neutral-700'
                    }`}
                  >
                    <span className="text-base select-none">{item.emoji}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <Link href="/admin" className="text-xs font-bold text-purple-700">
                  🛡️ Masuk Admin Dashboard
                </Link>
                <button onClick={togglePlan} className="text-xs text-brand-600 font-bold">
                  Toggle Plan ({activeUser.plan})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MAIN DASHBOARD CONTENT AREA WITH TOP NAV BAR */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOP NAVBAR FOR DESKTOP */}
          <header className="hidden lg:flex items-center justify-between bg-white border-b border-[#afc28a]/20 px-8 py-3.5 sticky top-0 z-30 shadow-xs">
            {/* Left: Active Workspace Pill & Learn */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/team"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#fdcfd4]/35 hover:bg-[#fdcfd4]/70 border border-[#fdcfd4] text-xs font-bold text-[#7a2e38] transition-colors"
                title="Buka Kolaborasi Tim & Shared Workspace"
              >
                <Users className="w-3.5 h-3.5 text-[#afc28a]" />
                <span>Workspace: <b>{activeWorkspace.name}</b></span>
              </Link>
              <Link
                href="/dashboard/learn"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#afc28a]/20 hover:bg-[#afc28a]/35 border border-[#afc28a]/40 text-xs font-bold text-[#334020] transition-colors"
                title="Buka Pusat Belajar & Kalkulator Finansial"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#afc28a]" />
                <span>Pusat Belajar</span>
              </Link>
            </div>

            {/* Right: Admin Quick Access & Account Login Menu */}
            <div className="flex items-center gap-3">
              {/* Pusat Approval Shortcut */}
              <Link
                href="/admin/approval"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fdcfd4]/45 hover:bg-[#fdcfd4]/75 border border-[#fdcfd4] text-xs font-bold text-[#7a2e38] transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#afc28a]" />
                <span>Panel Approval</span>
                {pendingApprovals > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#afc28a] animate-pulse" />
                )}
              </Link>

              {/* Pusat Admin Shortcut */}
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#afc28a]/20 hover:bg-[#afc28a]/35 border border-[#afc28a]/40 text-xs font-bold text-[#334020] transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-[#afc28a]" />
                <span>Pusat Admin</span>
              </Link>

              {/* Account Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  <img
                    src={activeUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={activeUser.full_name}
                    className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                  />
                  <div className="text-left text-xs leading-tight">
                    <p className="font-bold text-neutral-900 truncate max-w-[110px]">{activeUser.full_name}</p>
                    <p className="text-[10px] text-neutral-400 font-semibold uppercase">{activeUser.role === 'admin' ? 'Superadmin' : activeUser.plan}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200 p-2 z-50 text-xs space-y-1">
                    <div className="p-3 border-b border-neutral-100">
                      <p className="font-extrabold text-neutral-900 text-sm">{activeUser.full_name}</p>
                      <p className="text-neutral-500 text-[11px] truncate">{activeUser.phone_number || activeUser.id}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Badge variant={activeUser.plan === 'pro' ? 'pro' : 'brand'} size="sm">
                          {activeUser.plan.toUpperCase()} PLAN
                        </Badge>
                        <Badge variant={activeUser.role === 'admin' ? 'danger' : 'neutral'} size="sm">
                          ROLE: {activeUser.role.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard/team"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 font-semibold"
                      >
                        <Users className="w-4 h-4 text-brand-600" />
                        <span>Kolaborasi Tim & Workspace</span>
                      </Link>
                      <Link
                        href="/dashboard/learn"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 font-semibold"
                      >
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <span>Pusat Belajar Finansial</span>
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-purple-700 hover:bg-purple-50 font-semibold"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>Pusat Admin Suite</span>
                      </Link>
                      <Link
                        href="/admin/approval"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-800 hover:bg-amber-50 font-semibold"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span>Panel Approval Transaksi</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-neutral-100">
                      <button
                        onClick={() => {
                          toggleRole();
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-brand-500" />
                          <span>Ganti Mode Role</span>
                        </span>
                        <span className="text-[10px] bg-neutral-200 px-1.5 py-0.5 rounded font-mono">
                          {activeUser.role === 'admin' ? 'Ke User' : 'Ke Admin'}
                        </span>
                      </button>

                      <Link
                        href="/login"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Menu Login / Ganti Akun</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* MAIN DASHBOARD CONTENT */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
