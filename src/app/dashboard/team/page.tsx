'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA TEAM COLLABORATION & MULTI-USER WORKSPACE
// Mengelola Kas UMKM, Shared Wallet Keluarga, Approval Pengeluaran, & Audit Trail
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Users,
  Building2,
  Wallet,
  CheckCircle2,
  XCircle,
  Plus,
  Shield,
  Clock,
  Send,
  UserPlus,
  Trash2,
  DollarSign,
  AlertCircle,
  Check,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/currency';
import { TeamMemberRole } from '@/types';

export default function TeamCollaborationPage() {
  const {
    activeUser,
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    setActiveWorkspaceId,
    teamMembers,
    addTeamMember,
    removeTeamMember,
    teamWallets,
    teamAuditLogs,
    teamApprovals,
    approveTeamExpense,
    rejectTeamExpense,
    addTeamApprovalRequest,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'members' | 'wallets' | 'approvals' | 'audit'>('members');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for invite
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTelegram, setInviteTelegram] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>('member');
  const [inviteLimit, setInviteLimit] = useState('2500000');

  // Form states for approval request
  const [reqAmount, setReqAmount] = useState('');
  const [reqCategory, setReqCategory] = useState('Operasional Kedai');
  const [reqWallet, setReqWallet] = useState('BCA Giro Operasional Kedai');
  const [reqNotes, setReqNotes] = useState('');

  const currentMembers = teamMembers.filter((m) => m.workspace_id === activeWorkspaceId);
  const currentWallets = teamWallets.filter((w) => w.workspace_id === activeWorkspaceId);
  const currentApprovals = teamApprovals.filter((a) => a.workspace_id === activeWorkspaceId);
  const currentLogs = teamAuditLogs.filter((l) => l.workspace_id === activeWorkspaceId);

  const pendingApprovalsCount = currentApprovals.filter((a) => a.status === 'pending').length;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      setNotificationMsg({ type: 'error', text: 'Nama dan email anggota wajib diisi.' });
      return;
    }

    addTeamMember({
      name: inviteName,
      email: inviteEmail,
      telegram_handle: inviteTelegram.startsWith('@') ? inviteTelegram : `@${inviteTelegram}`,
      role: inviteRole,
      monthly_spending_limit: Number(inviteLimit) || 0,
    });

    setInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInviteTelegram('');
    setNotificationMsg({
      type: 'success',
      text: `Undangan berhasil dikirim ke ${inviteName}! Tautan otentikasi bot Telegram siap digunakan.`,
    });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(reqAmount.replace(/[^0-9]/g, ''));
    if (!amountNum || amountNum <= 0) {
      setNotificationMsg({ type: 'error', text: 'Masukkan nominal pengeluaran yang valid.' });
      return;
    }

    addTeamApprovalRequest({
      amount: amountNum,
      category: reqCategory,
      wallet_name: reqWallet,
      notes: reqNotes || 'Pengajuan kebutuhan operasional tim',
    });

    setRequestModalOpen(false);
    setReqAmount('');
    setReqNotes('');
    setNotificationMsg({
      type: 'success',
      text: 'Pengajuan pengeluaran berhasil dibuat dan menunggu persetujuan Owner / Admin.',
    });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const roleBadgeStyle = (role: TeamMemberRole) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'member':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'viewer':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between border shadow-sm ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificationMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-xs opacity-70 hover:opacity-100">
            Tutup
          </button>
        </div>
      )}

      {/* HEADER & WORKSPACE PICKER */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Users className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Kolaborasi Tim</h1>
                <Badge variant="brand" size="sm">
                  FITUR PRO / TEAMS
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Kelola kas bersama, delegasikan wewenang pencatatan Telegram, dan setujui transaksi anggota.
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-neutral-500 hidden sm:block">Workspace Aktif:</label>
          <select
            value={activeWorkspaceId}
            onChange={(e) => setActiveWorkspaceId(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm font-bold rounded-xl px-3 py-2 focus:ring-brand-500 focus:border-brand-500"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.type === 'business' ? '🏢' : ws.type === 'family' ? '👨‍👩‍👦' : '💼'} {ws.name}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={() => setInviteModalOpen(true)} className="gap-1.5 shrink-0">
            <UserPlus className="w-4 h-4" />
            Undang Anggota
          </Button>
        </div>
      </div>

      {/* WORKSPACE OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Kas Bersama</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">
              {formatCurrency(activeWorkspace.total_balance)}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Tersebar di {currentWallets.length} dompet tim
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Anggota Aktif</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{currentMembers.length} Orang</p>
            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
              1 Owner, 1 Admin, {currentMembers.length - 2} Anggota & Viewer
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Persetujuan Pending</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{pendingApprovalsCount} Pengajuan</p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              {pendingApprovalsCount > 0 ? 'Menunggu review otorisasi' : 'Semua transaksi aman terkendali'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Tipe Workspace</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900 capitalize">{activeWorkspace.type}</p>
            <p className="text-[11px] text-neutral-500 font-medium mt-0.5 truncate">
              {activeWorkspace.description || 'Pengelolaan keuangan kolaboratif'}
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'members'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Anggota & Peran</span>
          <span className="bg-neutral-700 text-white text-[10px] px-1.5 py-0.2 rounded-full">
            {currentMembers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('wallets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'wallets'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Dompet Bersama</span>
          <span className="bg-neutral-200 text-neutral-800 text-[10px] px-1.5 py-0.2 rounded-full">
            {currentWallets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'approvals'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Panel Persetujuan</span>
          {pendingApprovalsCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Log Aktivitas</span>
        </button>
      </div>

      {/* TAB 1: MEMBERS & ROLES */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-neutral-900">Daftar Anggota Workspace</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Setiap anggota dapat menautkan akun Telegram pribadi untuk mencatat pengeluaran ke kas bersama.
              </p>
            </div>
            <Button size="sm" onClick={() => setInviteModalOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" /> Tambah Anggota
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Nama & Kontak</th>
                  <th className="py-3 px-5">Peran (Role)</th>
                  <th className="py-3 px-5">Telegram Connected</th>
                  <th className="py-3 px-5">Limit Belanja / Bulan</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {currentMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            member.avatar_url ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                        />
                        <div>
                          <p className="font-bold text-neutral-900 leading-tight">{member.name}</p>
                          <p className="text-xs text-neutral-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${roleBadgeStyle(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {member.telegram_handle ? (
                        <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                          {member.telegram_handle}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Belum terhubung</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-neutral-800">
                      {member.monthly_spending_limit && member.monthly_spending_limit > 0
                        ? formatCurrency(member.monthly_spending_limit)
                        : member.role === 'owner'
                        ? 'Unlimited'
                        : 'Hanya Lihat (Rp 0)'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Aktif
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {member.role !== 'owner' ? (
                        <button
                          onClick={() => removeTeamMember(member.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus akses anggota"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400 italic font-normal">Workspace Owner</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SHARED WALLETS */}
      {activeTab === 'wallets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-neutral-900">Dompet Bersama Tim & Rekening Operasional</h2>
              <p className="text-xs text-neutral-500">
                Pencatatan pengeluaran dari bot Telegram anggota akan langsung memotong saldo dompet ini.
              </p>
            </div>
            <Button size="sm" onClick={() => setRequestModalOpen(true)} className="gap-1.5">
              <DollarSign className="w-4 h-4" /> Ajukan Pengeluaran
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentWallets.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: wallet.color }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    {wallet.bank_name}
                  </span>
                  <Badge variant="brand" size="sm">
                    SHARED
                  </Badge>
                </div>
                <h3 className="mt-2 text-base font-extrabold text-neutral-900">{wallet.wallet_name}</h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">{wallet.account_number}</p>

                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <p className="text-xs text-neutral-500">Saldo Saat Ini</p>
                  <p className="text-2xl font-black text-neutral-900 mt-0.5">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>

                <div className="mt-4 bg-neutral-50 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Otorisasi Langsung:</span>
                    <span className="font-bold text-neutral-900 uppercase">
                      {wallet.authorized_roles.join(', ')}
                    </span>
                  </div>
                  {wallet.require_approval_above && (
                    <div className="flex items-center justify-between text-amber-700">
                      <span>Wajib Approval Di Atas:</span>
                      <span className="font-bold">
                        {formatCurrency(wallet.require_approval_above)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-neutral-900">Persetujuan Transaksi Anggota</h2>
              <p className="text-xs text-neutral-500">
                Pengeluaran di atas batas otorisasi harus disetujui Owner atau Admin sebelum dipotong dari kas.
              </p>
            </div>
            <Button size="sm" onClick={() => setRequestModalOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" /> Ajukan Transaksi Baru
            </Button>
          </div>

          {currentApprovals.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-neutral-200/80 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-neutral-800">Tidak ada pengajuan yang tertunda</p>
              <p className="text-xs text-neutral-500 mt-1">
                Semua pengeluaran tim tercatat dan disetujui secara otomatis.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentApprovals.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={
                        req.requester_avatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
                      }
                      alt={req.requester_name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-neutral-900 text-sm">
                          {req.requester_name}
                        </span>
                        <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-medium">
                          {req.category}
                        </span>
                        <Badge
                          variant={
                            req.status === 'approved'
                              ? 'success'
                              : req.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {req.status === 'approved'
                            ? 'DISETUJUI'
                            : req.status === 'rejected'
                            ? 'DITOLAK'
                            : 'MENUNGGU APPROVAL'}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-700 font-semibold mt-1">"{req.notes}"</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Dompet Tujuan: <span className="font-bold text-neutral-600">{req.wallet_name}</span> • Diajukan:{' '}
                        {new Date(req.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <p className="text-xs text-neutral-400 font-semibold uppercase">Nominal</p>
                      <p className="text-xl font-black text-neutral-900">
                        {formatCurrency(req.amount)}
                      </p>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => approveTeamExpense(req.id)}
                          className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-4 h-4" /> Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => rejectTeamExpense(req.id)}
                          className="gap-1 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" /> Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-extrabold text-neutral-900">Jejak Audit & Aktivitas Tim</h2>
              <p className="text-xs text-neutral-500">
                Catatan immutable aktivitas pencatatan, perubahan anggaran, dan persetujuan di workspace ini.
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-400">Total {currentLogs.length} Entri</span>
          </div>

          <div className="mt-4 divide-y divide-neutral-100">
            {currentLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {log.user_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-neutral-900">{log.user_name}</span>
                    <span className="text-xs font-bold px-2 py-0.2 rounded bg-neutral-100 text-neutral-700">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5 font-medium">{log.detail}</p>
                </div>
                <span className="text-[11px] text-neutral-400 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: INVITE MEMBER */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Undang Anggota ke Workspace Tim"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label="Nama Lengkap"
            placeholder="Contoh: Budi Santoso"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            required
          />

          <Input
            label="Email Anggota"
            type="email"
            placeholder="budi@kedai.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <Input
            label="Username Telegram (Opsional)"
            placeholder="@budibarista"
            value={inviteTelegram}
            onChange={(e) => setInviteTelegram(e.target.value)}
            helperText="Anggota dapat langsung mencatat transaksi ke kas tim via chat bot @rayshaa_bot"
          />

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Peran (Role)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'member', 'viewer'] as TeamMemberRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setInviteRole(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    inviteRole === r
                      ? 'bg-brand-50 text-brand-600 border-brand-500 shadow-sm'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5">
              {inviteRole === 'admin' && 'Akses penuh mengelola anggota, budget, dan menyetujui pengeluaran.'}
              {inviteRole === 'member' && 'Dapat mencatat pengeluaran harian via web atau bot Telegram.'}
              {inviteRole === 'viewer' && 'Hanya dapat melihat laporan dan ringkasan kas (cocok untuk akuntan/investor).'}
            </p>
          </div>

          <Input
            label="Batas Maksimal Pengeluaran per Bulan"
            type="number"
            placeholder="2500000"
            value={inviteLimit}
            onChange={(e) => setInviteLimit(e.target.value)}
            helperText="Pengeluaran melebihi nominal ini akan meminta otorisasi approval Owner/Admin."
          />

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setInviteModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="gap-1.5">
              <Send className="w-4 h-4" /> Kirim Undangan
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SUBMIT EXPENSE APPROVAL */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Ajukan Pengeluaran Kas Tim"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <Input
            label="Nominal Pengeluaran (Rp)"
            placeholder="Contoh: 1250000"
            value={reqAmount}
            onChange={(e) => setReqAmount(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Kategori Kebutuhan
            </label>
            <select
              value={reqCategory}
              onChange={(e) => setReqCategory(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm font-semibold rounded-xl px-3 py-2.5 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="Bahan Baku & Biji Kopi">🍜 Bahan Baku & Biji Kopi</option>
              <option value="Peralatan & Servis Mesin">⚙️ Peralatan & Servis Mesin</option>
              <option value="Kemasan & Cup Sablon">📦 Kemasan & Cup Sablon</option>
              <option value="Utilitas & Listrik PLN">⚡ Utilitas & Listrik PLN</option>
              <option value="Operasional Kasir">💼 Operasional Kasir</option>
              <option value="Lainnya">📝 Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Sumber Dompet Tim
            </label>
            <select
              value={reqWallet}
              onChange={(e) => setReqWallet(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm font-semibold rounded-xl px-3 py-2.5 focus:ring-brand-500 focus:border-brand-500"
            >
              {currentWallets.map((w) => (
                <option key={w.id} value={w.wallet_name}>
                  {w.wallet_name} ({formatCurrency(w.balance)})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Keterangan / Alasan Pengeluaran"
            placeholder="Contoh: Servis tahunan boiler espresso + beli filter"
            value={reqNotes}
            onChange={(e) => setReqNotes(e.target.value)}
            required
          />

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setRequestModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="gap-1.5">
              <Check className="w-4 h-4" /> Ajukan Pengeluaran
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
