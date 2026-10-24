// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA COMPREHENSIVE TEST SUITE RUNNER
// Menjalankan semua unit & integration test untuk verifikasi kualitas
// ═══════════════════════════════════════════════════════════════════════════════

import { runCurrencyTests } from './currency.test';
import { runTelegramParserTests } from './telegram-parser.test';
import { runBotFormatterTests } from './bot-formatter.test';
import { runPlanLimitsAndAdvisorTests } from './plan-limits.test';

export function runAllTataDanaTests() {
  console.log('==================================================');
  console.log('🧪 RUNNING TATADANA TEST SUITE');
  console.log('==================================================\n');

  let grandTotal = 0;
  let grandPassed = 0;

  // 1. Currency Tests
  const cRes = runCurrencyTests();
  grandTotal += cRes.total;
  grandPassed += cRes.passed;
  console.log(`[1] Indonesian Currency Parser & Formatter: ${cRes.passed}/${cRes.total} PASSED`);

  // 2. Telegram NL Parser Tests
  const pRes = runTelegramParserTests();
  grandTotal += pRes.total;
  grandPassed += pRes.passed;
  console.log(`[2] Telegram NL Intent & Entity Parser:    ${pRes.passed}/${pRes.total} PASSED`);

  // 3. Bot Reply Formatter Tests
  const fRes = runBotFormatterTests();
  grandTotal += fRes.total;
  grandPassed += fRes.passed;
  console.log(`[3] Telegram Bot Reply Format & Progress:  ${fRes.passed}/${fRes.total} PASSED`);

  // 4. Plan Limits & Advisor Tests
  const lRes = runPlanLimitsAndAdvisorTests();
  grandTotal += lRes.total;
  grandPassed += lRes.passed;
  console.log(`[4] Plan Quotas & AI Financial Advisor:    ${lRes.passed}/${lRes.total} PASSED`);

  console.log('\n==================================================');
  if (grandPassed === grandTotal) {
    console.log(`🎉 ALL ${grandTotal}/${grandTotal} TESTS PASSED SUCCESSFULLY!`);
  } else {
    console.error(`❌ SOME TESTS FAILED: ${grandPassed}/${grandTotal} passed`);
  }
  console.log('==================================================\n');

  return { grandTotal, grandPassed, success: grandPassed === grandTotal };
}

// Auto-run if executed directly via CLI
if (typeof process !== 'undefined') {
  const isDirect =
    Boolean(process.argv[1] && (process.argv[1].endsWith('runner.ts') || process.argv[1].endsWith('runner.js'))) ||
    (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module);

  if (isDirect) {
    const res = runAllTataDanaTests();
    if (!res.success) {
      process.exit(1);
    }
  }
}
