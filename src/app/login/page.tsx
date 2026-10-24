'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA LOGIN INTERFACE
// Latar Gelap Mewah dengan Palet #fdcfd4, #afc28a, #ffffff
// Form Kartu Putih Membulat di Tengah Layar dengan Tab Kapsul Role & Chat WA
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { INITIAL_USER, INITIAL_ADMIN } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useApp();

  // State Pilihan Role: 'user' vs 'admin'
  const [role, setRole] = useState<'user' | 'admin'>('user');

  // Form Inputs
  const [username, setUsername] = useState('Raysha');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Ganti Role Tab
  const handleSwitchRole = (newRole: 'user' | 'admin') => {
    setRole(newRole);
    setErrorMsg('');
    setSuccessMsg('');
    if (newRole === 'user') {
      setUsername('Raysha');
      setPassword('password123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  // Submit Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!username.trim()) {
      setErrorMsg('Username / Nama Pengguna wajib diisi');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setErrorMsg('Password / Kata Sandi wajib diisi');
      setIsLoading(false);
      return;
    }

    // Check if user is a pending registration
    if (role === 'user' && username.toLowerCase() !== 'raysha' && username.toLowerCase() !== 'dimas') {
      try {
        const checkRes = await fetch(`/api/admin/registrations?username=${encodeURIComponent(username.trim())}`);
        const checkData = await checkRes.json();
        if (checkData.ok && checkData.registration) {
          if (checkData.registration.status === 'pending') {
            setErrorMsg(
              `⚠️ Akun @${checkData.registration.username} masih menunggu verifikasi dari Admin. Silakan klik tombol hijau "Chat WA (085797805675)" di bawah untuk meminta aktivasi.`
            );
            setIsLoading(false);
            return;
          } else if (checkData.registration.status === 'rejected') {
            setErrorMsg('⚠️ Pendaftaran akun ini telah ditolak oleh Admin. Silakan hubungi Admin untuk informasi.');
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        // Continue fallback
      }
    }

    setTimeout(() => {
      setIsLoading(false);
      if (role === 'admin') {
        setCurrentUser(INITIAL_ADMIN);
        setSuccessMsg('Login Admin Berhasil! Mengalihkan ke Panel Admin...');
        setTimeout(() => {
          router.push('/admin');
        }, 500);
      } else {
        setCurrentUser({
          ...INITIAL_USER,
          full_name: username.trim() || 'Raysha',
          plan: 'pro',
          role: 'user',
        });
        setSuccessMsg(`Selamat Datang, ${username}! Mengalihkan ke Dashboard...`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    }, 600);
  };

  // URL WhatsApp Resmi dengan Template Pesan Otomatis
  const waNumber = '085797805675';
  const waEncodedMsg = encodeURIComponent(
    `Halo Admin TataDana, saya butuh bantuan terkait login akun sebagai ${role === 'user' ? 'User' : 'Admin'} (${username}). Mohon bantuannya.`
  );
  const waLink = `https://wa.me/6285797805675?text=${waEncodedMsg}`;

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-[#0a0f12] font-sans selection:bg-[#afc28a] selection:text-white">
      {/* ══════════════════════════════════════════════════════════════════════════
          LATAR BELAKANG GELAP MEWAH DENGAN AKSEN:
          - 🌸 Soft Blush Pink: #fdcfd4 (Aksen hangat, badge & glow)
          - 🌿 Sage Green: #afc28a (Warna utama, saldo & ornamen)
          - ⚪ Crisp Pure White: #ffffff (Kartu minimalis & kontras)
      ══════════════════════════════════════════════════════════════════════════ */}
      
      {/* Ambient Gradient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#afc28a]/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#fdcfd4]/25 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[45rem] rounded-full bg-[#afc28a]/10 blur-[160px] pointer-events-none" />

      {/* Subtle Fintech Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Decorative Top Branding Pill */}
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
            Fintech
          </span>
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          KARTU LOGIN PUTIH MEMBULAT DI TENGAH LAYAR
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-[460px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.55)] border border-white/80 p-6 sm:p-9 transition-all">
        
        {/* User Identity Accent (Jika username Raysha) */}
        {role === 'user' && username.toLowerCase() === 'raysha' && (
          <div className="mb-4 flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-[#fdcfd4]/40 via-white to-[#afc28a]/20 border border-[#fdcfd4]">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#afc28a] shadow-xs">
                <Image
                  src="/images/raysha.jpg"
                  alt="Raysha"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-black text-neutral-900 leading-tight">Halo, Raysha! 🌸</p>
                <p className="text-[10px] text-neutral-600 font-medium">Akun Pro Aktif • Terhubung ke Bot Telegram</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#afc28a] text-white shadow-xs">
              Verified
            </span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            2. PILIHAN ROLE (TAB SWITCHER BERBENTUK KAPSUL)
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="mb-6">
          <div className="p-1.5 bg-neutral-100/90 rounded-full flex items-center border border-neutral-200/80 shadow-inner">
            {/* Tab 1: Login User */}
            <button
              type="button"
              onClick={() => handleSwitchRole('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                role === 'user'
                  ? 'bg-white text-neutral-900 shadow-md shadow-neutral-900/5 border border-neutral-200/60'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <User className={`w-4 h-4 ${role === 'user' ? 'text-[#afc28a]' : 'text-neutral-400'}`} />
              <span>Login User</span>
            </button>

            {/* Tab 2: Login Admin */}
            <button
              type="button"
              onClick={() => handleSwitchRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                role === 'admin'
                  ? 'bg-white text-neutral-900 shadow-md shadow-neutral-900/5 border border-neutral-200/60'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Shield className={`w-4 h-4 ${role === 'admin' ? 'text-blue-600' : 'text-neutral-400'}`} />
              <span>Login Admin</span>
            </button>
          </div>
        </div>

        {/* Judul & Deskripsi Form Sesuai Role */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl sm:text-[26px] font-black text-neutral-900 tracking-tight">
            {role === 'user' ? 'Masuk sebagai User' : 'Masuk sebagai Admin'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-medium">
            {role === 'user'
              ? 'Kelola transaksi keuangan & integrasi bot Telegram'
              : 'Pusat otorisasi approval, manajemen pengguna & sistem'}
          </p>
        </div>

        {/* Feedback Notifikasi */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-[#afc28a]/20 border border-[#afc28a] text-xs text-[#2a361a] font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#afc28a]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            3. FORM INPUT
        ══════════════════════════════════════════════════════════════════════ */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input 1: Username / Nama Pengguna */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Username / Nama Pengguna <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <User className="w-5 h-5 text-neutral-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username atau nama pengguna"
                required
                className="w-full bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white text-neutral-900 text-sm font-medium rounded-2xl pl-11 pr-4 py-3 outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Input 2: Password / Kata Sandi */}
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
                placeholder="Masukkan password / kata sandi"
                required
                className="w-full bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white text-neutral-900 text-sm font-medium rounded-2xl pl-11 pr-11 py-3 outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder:text-neutral-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Opsi Tambahan: Ingat Saya & Lupa Password */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-neutral-600 select-none font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-neutral-300"
              />
              <span>Ingat saya</span>
            </label>
            <a
              href="#lupa-password"
              onClick={(e) => {
                e.preventDefault();
                alert('Silakan hubungi WhatsApp Admin pada kotak di bawah untuk reset password.');
              }}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Lupa password?
            </a>
          </div>

          {/* Tombol Aksi Utama: Biru Cerah, Lebar Penuh, Panah Kanan */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="flex-1 text-center pl-4">
              {isLoading
                ? 'Memproses...'
                : role === 'user'
                ? 'Masuk sebagai User'
                : 'Masuk sebagai Admin'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        </form>

        {/* Quick Demo Switcher Pills */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] font-semibold text-neutral-500">
          <span>Kredensial Demo:</span>
          <button
            type="button"
            onClick={() => handleSwitchRole('user')}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              role === 'user'
                ? 'bg-[#afc28a]/20 border-[#afc28a] text-[#2a361a] font-bold'
                : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Raysha (User)
          </button>
          <button
            type="button"
            onClick={() => handleSwitchRole('admin')}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Admin (Super Admin)
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            4. BAGIAN PERTANYAAN & BANTUAN WHATSAPP (KOTAK DUA SISI)
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-neutral-50/90 border border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          {/* Sisi Kiri: Ikon WhatsApp & Teks Tanya Admin */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366]/15 flex items-center justify-center shrink-0 border border-[#25D366]/30">
              {/* Official WhatsApp SVG Icon */}
              <svg
                className="w-5 h-5 text-[#25D366] fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.115-.515-1.745-.722-2.87-2.484-2.957-2.6-.087-.116-.708-.942-.708-1.798s.449-1.28.609-1.454c.159-.174.347-.217.463-.217.116 0 .232.001.333.006.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.356.102.174.453.748.972 1.21.67.597 1.233.782 1.407.869.174.087.276.072.377-.044.101-.116.434-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.282 0-7.765 3.483-7.765 7.765 0 1.408.384 2.766 1.109 3.953l-1.177 4.301 4.417-1.159c1.139.664 2.456 1.026 3.805 1.027h.004c4.279 0 7.763-3.484 7.763-7.767 0-2.073-.807-4.023-2.274-5.49-1.467-1.468-3.414-2.276-5.487-2.276z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-black text-neutral-800 leading-tight">
                Ada Pertanyaan? Tanya Admin.
              </p>
              <p className="text-[10px] text-neutral-500 font-medium">
                Pusat bantuan & aktivasi TataDana
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Tombol Hijau Chat WA */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 transition-all text-center whitespace-nowrap cursor-pointer group"
          >
            <span>Chat WA ({waNumber})</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/90 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Footer Link Register */}
        <p className="mt-5 text-center text-xs text-neutral-500">
          Belum punya akun TataDana?{' '}
          <Link href="/register" className="font-extrabold text-blue-600 hover:text-blue-700 hover:underline">
            Daftar gratis di sini
          </Link>
        </p>
      </div>

      {/* Security & Fintech Footer Note */}
      <div className="relative z-10 mt-6 text-center text-xs text-neutral-400 font-medium">
        <span>© 2026 TataDana Indonesia. Dilindungi enkripsi SSL 256-bit & verifikasi bot Telegram.</span>
      </div>
    </div>
  );
}
