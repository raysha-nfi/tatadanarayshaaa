'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-neutral-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8a9d68] to-[#fdcfd4] flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            TD
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-neutral-900 group-hover:text-brand-600 transition-colors">
              Tata<span className="text-brand-500">Dana</span>
            </span>
            <span className="hidden sm:block text-[10px] font-medium text-neutral-400 tracking-wider uppercase -mt-1">
              Fintech Indonesia
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <a href="#fitur" className="hover:text-brand-500 transition-colors">Fitur Unggulan</a>
          <a href="#demo" className="hover:text-brand-500 transition-colors">Demo Chat</a>
          <a href="#harga" className="hover:text-brand-500 transition-colors">Harga Paket</a>
          <a href="#faq" className="hover:text-brand-500 transition-colors">FAQ</a>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm" className="shadow-brand-500/20">
              Coba Gratis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-100 bg-white px-4 pt-2 pb-6 space-y-3">
          <a
            href="#fitur"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-700"
          >
            Fitur Unggulan
          </a>
          <a
            href="#demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-700"
          >
            Demo Chat
          </a>
          <a
            href="#harga"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-700"
          >
            Harga Paket
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-700"
          >
            FAQ
          </a>
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/login" className="w-full">
              <Button variant="outline" size="md" className="w-full">
                Masuk
              </Button>
            </Link>
            <Link href="/register" className="w-full">
              <Button variant="primary" size="md" className="w-full">
                Coba Gratis Sekarang
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
