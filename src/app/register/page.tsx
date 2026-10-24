'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA REGISTER PAGE
// Alur Pendaftaran User Baru dengan Verifikasi Wajib via WhatsApp Admin
// No. Admin: 085797805675
// Latar Gelap Mewah dengan Palet #fdcfd4, #afc28a, #ffffff
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  RefreshCw,
  MessageCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { INITIAL_USER } from '@/lib/mock-data';

interface RegistrationData {
  id: string;
  full_name: string;
  username: string;
  phone_number: string;
  email: string;
  status: 'pending' | 'verified' | 'rejected';
}

export default function RegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useApp();

  // Step: 'form' (isi data) | 'guide_wa' (tuntunan chat WA admin) | 'verified_success'
  const [step, setStep] = useState<'form' | 'guide_wa' | 'verified_success'>('form');

  // Input states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Registration result
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredData, setRegisteredData] = useState<RegistrationData | null>(null);
  const [statusCheckMsg, setStatusCheckMsg] = useState<string | null>(null);

  // Format link WhatsApp Admin dengan pesan otomatis
  const adminWaNumber = '085797805675';
  const getWaLink = () => {
    const rawMsg = `Halo Admin TataDana, saya baru saja mendaftar akun baru dengan data berikut:
• Nama Lengkap: ${fullName || registeredData?.full_name}
• Username: ${username || registeredData?.username}
• No WhatsApp: ${phoneNumber || registeredData?.phone_number}

Mohon bantuannya untuk memverifikasi akun saya agar bisa segera login dan menghubungkan ke bot Telegram. Terima kasih!`;
    return `https://wa.me/6285797805675?text=${encodeURIComponent(rawMsg)}`;
  };

  // Submit Pendaftaran Baru
  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !username.trim() || !phoneNumber.trim()) {
      setErrorMsg('Nama Lengkap, Username, dan Nomor WhatsApp wajib diisi');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          username: username.trim().toLowerCase().replace(/\s+/g, '_'),
          phone_number: phoneNumber.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || 'Gagal menyimpan pendaftaran');
        setIsLoading(false);
        return;
      }

      setRegisteredData(data.registration);
      setStep('guide_wa');
    } catch {
      // Fallback local registration
      const fallbackData: RegistrationData = {
        id: `reg-${Date.now()}`,
        full_name: fullName.trim(),
        username: username.trim().toLowerCase().replace(/\s+/g, '_'),
        phone_number: phoneNumber.trim(),
        email: email.trim(),
        status: 'pending',
      };
      setRegisteredData(fallbackData);
      setStep('guide_wa');
    } finally {
      setIsLoading(false);
    }
  };

  // Cek Status Verifikasi Realtime
  const handleCheckVerificationStatus = async () => {
    if (!registeredData?.username) return;
    setIsCheckingStatus(true);
    setStatusCheckMsg(null);

    try {
      const res = await fetch(`/api/admin/registrations?username=${registeredData.username}`);
      const data = await res.json();

      if (data.ok && data.registration) {
        if (data.registration.status === 'verified') {
          setRegisteredData(data.registration);
          setStep('verified_success');
          // Auto-login into app context
          setCurrentUser({
            ...INITIAL_USER,
            full_name: data.registration.full_name,
            phone_number: data.registration.phone_number,
            role: 'user',
          });
        } else if (data.registration.status === 'rejected') {
          setStatusCheckMsg('Pendaftaran ditolak oleh Admin. Silakan hubungi WA Admin untuk informasi.');
        } else {
          setStatusCheckMsg('Akun masih dalam antrean verifikasi Admin. Pastikan Anda sudah chat WA Admin.');
        }
      } else {
        setStatusCheckMsg('Status belum berubah. Silakan kirim pesan ke Admin via WhatsApp.');
      }
    } catch {
      setStatusCheckMsg('Gagal memeriksa status. Coba beberapa saat lagi.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-[#0a0f12] font-sans selection:bg-[#afc28a] selection:text-white">
      {/* ══════════════════════════════════════════════════════════════════════════
          LATAR GELAP MEWAH DENGAN AKSEN:
          - 🌸 Soft Blush Pink: #fdcfd4
          - 🌿 Sage Green: #afc28a
          - ⚪ Crisp Pure White: #ffffff
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#afc28a]/20 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-[#fdcfd4]/25 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-[#afc28a]/10 blur-[160px] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top Branding Pill */}
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="group flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-white transition-all shadow-lg"
        >
          <div className="w-7 h-7 rounded-lg bg-[#afc28a] text-white flex items-center justify-center font-black text-xs shadow-inner">
            TD
          </div>
          <span className="font-extrabold tracking-tight text-sm text-white">
            Tata<span className="text-[#afc28a]">Dana</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#fdcfd4]/30 text-[#fdcfd4] border border-[#fdcfd4]/40 ml-1">
            Pendaftaran User
          </span>
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          KARTU FORM / TUNTUNAN DI TENGAH LAYAR
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-[500px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.55)] border border-white/80 p-6 sm:p-9 transition-all">

        {/* ──────────────────────────────────────────────────────────────────────
            STEP 1: FORMULIR PENDAFTARAN USER BARU
        ────────────────────────────────────────────────────────────────────── */}
        {step === 'form' && (
          <div>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#afc28a]/20 text-[#2a361a] text-xs font-bold mb-3 border border-[#afc28a]/40">
                <Sparkles className="w-3.5 h-3.5 text-[#afc28a]" /> Akun Baru Gratis
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Daftar Akun Baru
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 font-medium">
                Setelah mengisi data, akun akan diverifikasi oleh Admin via WhatsApp untuk keamanan.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRegister} className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-5 h-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    required
                    className="w-full bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white text-neutral-900 text-sm font-medium rounded-2xl pl-11 pr-4 py-3 outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Username / ID Pengguna <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 text-sm font-bold">
                    @
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="contoh: budi_santoso"
                    required
                    className="w-full bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white text-neutral-900 text-sm font-medium rounded-2xl pl-11 pr-4 py-3 outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder:text-neutral-400 font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Username dipakai untuk login dan identifikasi di bot Telegram.</p>
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Phone className="w-5 h-5 text-neutral-400" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    required
                    className="w-full bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white text-neutral-900 text-sm font-medium rounded-2xl pl-11 pr-4 py-3 outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder:text-neutral-400"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Nomor ini yang akan dihubungi Admin untuk verifikasi.</p>
              </div>

              {/* Email (Opsional) */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Email (Opsional)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-5 h-5 text-neutral-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="budi@example.com"
                    className="w-full bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white text-neutral-900 text-sm font-medium rounded-2xl pl-11 pr-4 py-3 outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Password / Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-5 h-5 text-neutral-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white text-neutral-900 text-sm font-medium rounded-2xl pl-11 pr-11 py-3 outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder:text-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Notice Verifikasi WA */}
              <div className="p-3.5 rounded-2xl bg-[#fdcfd4]/30 border border-[#fdcfd4] text-xs text-neutral-700 flex items-start gap-2.5">
                <span className="text-lg leading-none">💬</span>
                <div>
                  <span className="font-bold text-neutral-900 block">Verifikasi WhatsApp Admin Wajib:</span>
                  Setelah mendaftar, Anda akan dituntun untuk langsung mengirim chat konfirmasi ke WhatsApp Admin (085797805675).
                </div>
              </div>

              {/* Tombol Daftar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="flex-1 text-center pl-4">
                  {isLoading ? 'Menyimpan Pendaftaran...' : 'Daftar & Minta Verifikasi Admin'}
                </span>
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </button>
            </form>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────────
            STEP 2: LAYAR TUNTUNAN CHAT WA KE ADMIN (085797805675)
        ────────────────────────────────────────────────────────────────────── */}
        {step === 'guide_wa' && (
          <div className="text-center">
            {/* Status Animation / Icon */}
            <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 mb-4 shadow-md relative">
              <Clock className="w-8 h-8 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#25D366] border-2 border-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Status: Menunggu Verifikasi Admin
            </div>

            <h2 className="text-2xl sm:text-[26px] font-black text-neutral-900 tracking-tight">
              Pendaftaran Disimpan!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto">
              Tinggal 1 langkah lagi: Silakan chat WhatsApp Admin untuk verifikasi akun Anda.
            </p>

            {/* Kotak Rincian Pendaftar */}
            <div className="mt-5 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-medium">Nama:</span>
                <span className="font-bold text-neutral-900">{fullName || registeredData?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-medium">Username:</span>
                <span className="font-mono font-bold text-blue-600">@{username || registeredData?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-medium">No. WhatsApp:</span>
                <span className="font-bold text-neutral-900">{phoneNumber || registeredData?.phone_number}</span>
              </div>
            </div>

            {/* Tuntunan Langkah Demi Langkah */}
            <div className="mt-5 text-left p-4 rounded-2xl bg-gradient-to-br from-[#afc28a]/15 via-white to-[#fdcfd4]/20 border border-[#afc28a]/40 space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-[#2a361a] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#afc28a]" /> Tuntunan Verifikasi Akun:
              </p>

              <div className="space-y-2.5 text-xs text-neutral-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#afc28a] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Klik tombol hijau <b>"Chat WA Admin (085797805675)"</b> di bawah ini.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#afc28a] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Kirim draf pesan verifikasi otomatis yang telah disiapkan ke WhatsApp Admin.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#afc28a] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Admin akan langsung mengaktifkan akun Anda. Setelah aktif, Anda bisa langsung masuk ke dashboard dan Telegram.
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol Utama: Chat WA Admin (085797805675) */}
            <div className="mt-6 space-y-3">
              <a
                href={getWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-500/30 transition-all cursor-pointer group"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Chat WA Admin ({adminWaNumber})</span>
                <ExternalLink className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Tombol Cek Status Realtime */}
              <button
                type="button"
                onClick={handleCheckVerificationStatus}
                disabled={isCheckingStatus}
                className="w-full py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>{isCheckingStatus ? 'Memeriksa status ke sistem...' : 'Cek Status Verifikasi Saya'}</span>
              </button>

              {statusCheckMsg && (
                <div className="p-2.5 rounded-xl bg-neutral-100 text-[11px] text-neutral-700 font-medium">
                  {statusCheckMsg}
                </div>
              )}
            </div>

            {/* Kembali ke Formulir / Halaman Login */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-neutral-500 hover:text-neutral-900 font-semibold cursor-pointer"
              >
                ← Ubah Data Pendaftaran
              </button>

              <Link href="/login" className="font-bold text-blue-600 hover:underline">
                Ke Halaman Login →
              </Link>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────────
            STEP 3: SUKSES TERVERIFIKASI
        ────────────────────────────────────────────────────────────────────── */}
        {step === 'verified_success' && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-[#afc28a]/20 border-2 border-[#afc28a] flex items-center justify-center text-[#2a361a] mb-4 shadow-lg">
              <CheckCircle2 className="w-9 h-9 text-[#afc28a]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#afc28a]/20 text-[#2a361a] text-xs font-bold mb-2">
              Status: Terverifikasi Aktif 🎉
            </div>

            <h2 className="text-2xl sm:text-[26px] font-black text-neutral-900 tracking-tight">
              Selamat, Akun Anda Aktif!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto">
              Admin telah memverifikasi akun Anda. Anda sekarang dapat mengakses dashboard TataDana dan bot Telegram.
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full py-4 px-6 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk ke Dashboard Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer Link */}
        {step === 'form' && (
          <p className="mt-6 text-center text-xs text-neutral-500">
            Sudah memiliki akun terverifikasi?{' '}
            <Link href="/login" className="font-extrabold text-blue-600 hover:text-blue-700 hover:underline">
              Masuk di sini
            </Link>
          </p>
        )}
      </div>

      {/* Security Note */}
      <div className="relative z-10 mt-6 text-center text-xs text-neutral-400 font-medium">
        <span>© 2026 TataDana Indonesia • Verifikasi WhatsApp Resmi Admin 085797805675</span>
      </div>
    </div>
  );
}
