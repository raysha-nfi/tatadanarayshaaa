import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/app-context';
import { FloatingThemeToggle } from './theme-toggle';

export const metadata: Metadata = {
  title: 'TataDana — Catat Keuangan Semudah Chat dari Telegram Kamu',
  description:
    'TataDana adalah aplikasi SaaS manajemen keuangan pribadi premium Indonesia yang terintegrasi dengan Telegram Bot (parsing bahasa natural, voice note audio STT, foto struk multimodal OCR).',
  keywords:
    'tatadana, fintech indonesia, telegram bot keuangan, catat keuangan, budget planner, pengatur gaji umk, gemini multimodal',
  authors: [{ name: 'TataDana Indonesia' }],
  metadataBase: new URL('https://tatadana.id'),
  openGraph: {
    title: 'TataDana — Catat Keuangan Semudah Chat dari Telegram Kamu',
    description:
      'Aplikasi manajemen keuangan SaaS Indonesia berbasis bot Telegram dengan AI NLP, Voice Note STT, dan Vision OCR.',
    url: 'https://tatadana.id',
    siteName: 'TataDana',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Anti-FOUC script for instant theme initialization before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('tatadana_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-neutral-900 dark:bg-[#0B0F17] dark:text-neutral-100 font-sans selection:bg-brand-500 selection:text-white transition-colors duration-200">
        <AppProvider>
          {children}
          <FloatingThemeToggle />
        </AppProvider>
      </body>
    </html>
  );
}
