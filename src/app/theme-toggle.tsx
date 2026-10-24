'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA DUAL-THEME ENGINE (PART 4 & R4)
// Light Mode (Sage #afc28a / Blush #fdcfd4 / Clean White #ffffff) & Dark Mode (Dark Slate #182014)
// Synchronized with localStorage ('tatadana_theme') & system preference
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasDark = document.documentElement.classList.contains('dark');
    setIsDark(hasDark);

    const handleThemeChange = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    window.addEventListener('tatadana-theme-change', handleThemeChange);
    return () => window.removeEventListener('tatadana-theme-change', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('tatadana_theme', 'dark');
      } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('tatadana_theme', 'light');
      } catch (e) {}
    }

    window.dispatchEvent(new Event('tatadana-theme-change'));
  };

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      title={isDark ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 border ${
        isDark
          ? 'bg-neutral-800/90 text-amber-400 border-neutral-700 hover:bg-neutral-700/80 shadow-md shadow-black/20'
          : 'bg-white/90 text-neutral-700 border-neutral-200/80 hover:bg-[#feedf0] hover:text-[#5f723b] hover:border-[#afc28a]/40 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle Mode {isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}

/**
 * Floating Theme Switcher placed at bottom-right corner for global accessibility
 */
export function FloatingThemeToggle() {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-200/90 dark:border-neutral-800 shadow-lg shadow-black/10">
      <span className="text-[11px] font-bold tracking-tight text-neutral-500 dark:text-neutral-400 hidden sm:inline">
        Tema:
      </span>
      <ThemeToggle />
    </div>
  );
}
