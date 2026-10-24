# Summary of Changes — Worker 2 (M2: Telegram Bot Engine & Webhook API)

## Overview
Worker 2 implemented and verified the Telegram Bot Engine and Webhook API for Tatadana according to specifications in `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `survey_backend_bot.md`.

## Files Created / Modified

### 1. `src/lib/telegram/bot.ts`
- **Added `getTelegramFileInfo(fileId, token)`**: Retrieves file path and CDN download URL from Telegram Bot API `getFile` endpoint.
- **Added `downloadTelegramFile(fileId, token)`**: Downloads binary audio/image files from Telegram CDN into `Buffer`, `base64`, and `dataUri` with automatic MIME-type detection (`audio/ogg`, `image/jpeg`, `image/png`, etc.).
- **Added `downloadTelegramFileAsBase64(fileId, token)`**: Helper for Vision OCR and Whisper/Gemini STT APIs.
- **Added `downloadTelegramFileAsBuffer(fileId, token)`**: Helper for direct buffer consumers.
- Maintained `sendTelegramMessage`, `testBotToken`, and `registerBotWebhook`.

### 2. `src/lib/telegram/date-utils.ts` (New File)
- **Implemented `getWIBDate(dateInput)`**: Converts any date or UTC timestamp into Asia/Jakarta (UTC+7) Date object.
- **Implemented `getWIBTodayRange(nowDate)`**: Calculates start (`00:00:00+07:00`) and end (`23:59:59.999+07:00`) of today in WIB.
- **Implemented `getWIB7DaysRange(nowDate)`**: Calculates 7-day rolling window in WIB for `/minggu_ini`.
- **Implemented `getWIBMonthRange(nowDate)`**: Calculates calendar month boundaries and Indonesian month names (`Januari` - `Desember`) for `/bulan_ini` and `/budget`.

### 3. `src/lib/telegram/formatter.ts`
- **Maintained `generateProgressBar(percentage)`**: 10-block progress bar using `█` and `░` (`0%` -> `░░░░░░░░░░ 0%`, `40%` -> `████░░░░░░ 40%`, `100%` -> `██████████ 100%`).
- **Added `formatHariIniReply(params)`**: Formats daily income, expense, net cashflow (`+`/`-`), and up to 10 latest transactions with categories, wallets, and WIB timestamps.
- **Added `formatMingguIniReply(params)`**: Formats 7-day summary, net cashflow, and Top 3 expense categories breakdown.
- **Added `formatBulanIniReply(params)`**: Formats monthly recap, net savings, and complete category breakdown sorted by expenditure.
- **Added `formatBudgetListReply(params)`**: Displays all category budget targets with 10-block progress bars, remaining/over budget calculations, and alerts for >=80% and >=100%.
- **Added `formatQuotaExceededReply(maxLimit, appUrl)`**: Polite notification for Starter plan monthly quota exhaustion (50 tx/month) with upgrade CTA.
- **Added `formatOcrUpgradeRequiredReply(appUrl)`**: Polite decline for Starter plan photo receipts explaining Pro requirement with upgrade CTA.
- Maintained `formatExpenseReply`, `formatIncomeReply`, `formatTransferReply`, `formatHelpReply`, `formatSaldoReply`, and `formatAdvisorMessage`.

### 4. `src/lib/telegram/webhook-handler.ts`
- **Dual Deduplication Pipeline**: Implemented in-memory LRU `Set` cache + PostgreSQL `processed_telegram_updates` table check to strictly guarantee idempotency and avoid duplicate transaction records upon Telegram retries.
- **WIB Period Command Handlers**:
  - Implemented `/hari_ini`: calculates daily income, expense, and net cashflow with Indonesian transaction breakdown.
  - Implemented `/minggu_ini`: calculates 7-day totals and top 3 expense categories.
  - Implemented `/bulan_ini`: calculates monthly totals, net savings, and category breakdown.
  - Enhanced `/budget`: renders visual progress bars (10 blocks of `█` and `░`) and triggers 80% & 100% alerts.
  - Maintained `/saldo`, `/bantuan`, and `/sheet`.
- **Flexible Pairing**:
  - Supported `/start <pairing_code>` (e.g. `TD9482` with TTL expiration check).
  - Supported deep-links `/start link_<userId>`.
  - Supported phone number pairing: `/start 08123456789`, `+628123456789`, or raw phone number input from unlinked chats.
- **Voice Note STT Pipeline**:
  - 60-second duration validation with polite duration warning.
  - Downloads binary voice audio (.oga/.ogg) via `downloadTelegramFile` and feeds data URI to STT dispatcher.
- **Receipt Photo OCR Pipeline**:
  - Starter plan check: politely declines with upgrade CTA.
  - Pro plan: downloads photo via `downloadTelegramFile`, calls multimodal OCR, inserts parent transaction + `receipt_items` breakdown.
- **Starter Plan Quota Check**:
  - Counts transactions in current month; blocks 51st transaction with polite upgrade CTA.
- **Multi-Bot Support**:
  - Dynamically uses custom user bot token (`profile.telegram_bot_token` / `profile.bot_token`) if present, otherwise defaults to official shared bot token.

### 5. `src/app/api/telegram/webhook/route.ts`
- Error isolation: returns HTTP 200 with `{ ok: true, result: { status: 'skipped', reason: '...' } }` for invalid payloads or duplicate updates, preventing Telegram retry storm.
- Health check `GET` endpoint returns active status and Asia/Jakarta WIB timestamp.

### 6. `src/app/api/telegram/test-connection/route.ts`
- Token validation and uniqueness enforcement across user profiles.
- Validates token with `testBotToken` (`getMe`).
- Automatically registers webhook URL with `registerBotWebhook` (`setWebhook`).
- Updates user profile with resilient column support (`telegram_bot_token` and `bot_token`).
