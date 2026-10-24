## 2026-10-10T05:53:15Z
You are Worker 4 (M4: Premium User Dashboard & Landing Page).
Your working directory is C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_r4.
Project root is C:\Users\lenovo\.gemini\antigravity\scratch\tatadana.
Authoritative user request: C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md.
Project scope document: C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\PROJECT.md.
Reference survey: C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\spec_miner_survey_3\survey_frontend_admin.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You EXCLUSIVELY own:
- src/app/layout.tsx
- src/app/page.tsx
- src/app/globals.css
- tailwind.config.js
- src/app/dashboard/simulator/*
- src/app/dashboard/settings/*
- src/app/dashboard/budget/*
- src/app/dashboard/wallet/*
Do NOT write to files owned by other workers.

Tasks:
1. Read ORIGINAL_REQUEST.md and PROJECT.md.
2. Build root shell:
   - `src/app/globals.css` with `@tailwind base; @tailwind components; @tailwind utilities;` and custom scrollbars/brand theme.
   - `tailwind.config.js` updated to include `darkMode: 'class'`.
   - `src/app/layout.tsx` with Plus Jakarta Sans/Inter font, metadata, `AppProvider`, dark mode class support, and theme toggle.
   - `src/app/page.tsx` rendering the full 8-section conversion landing page (`Navbar`, `Hero`, `ProblemSolution`, `InteractiveDemo`, `Features`, `Pricing`, `Testimonials`, `Faq`, `FinalCta`, `Footer`).
3. Build missing user dashboard subpages:
   - `src/app/dashboard/simulator/page.tsx`: Interactive In-App Bot Simulator with text input, simulated receipt photo upload, and voice note upload for zero-tunnel localhost testing.
   - `src/app/dashboard/settings/page.tsx`: 5 tabs (Profil, Telegram Bot with getMe & setWebhook test buttons + status badge 🟢/🔴/⏳, Reminder, Kategori, Budget).
   - `src/app/dashboard/budget/page.tsx`: monthly budget limits manager with progress bars and alert thresholds.
   - `src/app/dashboard/wallet/page.tsx`: multi-wallet manager (BCA, Cash, GoPay) and transfer antar-dompet modal.
4. Ensure dual-theme toggle works seamlessly across dashboard and landing page (fintech orange #FF6B00 / clean white Light Mode and dark slate Dark Mode).
5. Document all changes in C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_r4\changes.md and produce a full handoff report in C:\Users\lenovo\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_r4\handoff.md.
6. Send a completion message back to the orchestrator.
