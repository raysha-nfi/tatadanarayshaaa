'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA LANDING PAGE (PART 7 & R4)
// Modern, Sage & Blush Pastel / White, Fintech Premium Indonesia
// 8-Section Conversion Journey: Navbar, Hero, ProblemSolution, InteractiveDemo,
// Features, Pricing, Testimonials, Faq, FinalCta, Footer
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { Faq } from '@/components/landing/Faq';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B0F17] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-brand-500 selection:text-white transition-colors duration-200">
      {/* 1. Sticky Navbar with Brand Logo, Links, & CTA */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Section (Pre-headline, H1 with gradient, Video placeholder, CTA) */}
        <Hero />

        {/* 3. Problem Aware & Solution Transition */}
        <ProblemSolution />

        {/* 4. Interactive Demo (Telegram Bot Simulator & Dashboard Preview) */}
        <InteractiveDemo />

        {/* 5. Features Showcase (Telegram chat/OCR, Native Reporting/Export, Pro AI Advisor) */}
        <Features />

        {/* 6. Transparent Pricing (Starter Rp49rb/bln vs Pro Rp99rb lifetime) */}
        <Pricing />

        {/* 7. Testimonials Masonry / Grid */}
        <Testimonials />

        {/* 8. Interactive FAQ Accordion */}
        <Faq />

        {/* 9. Final High-Conversion CTA */}
        <FinalCta />
      </main>

      {/* 10. Comprehensive Footer */}
      <Footer />
    </div>
  );
}
