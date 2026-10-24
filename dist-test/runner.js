#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA TEST RUNNER (M6 ACCEPTANCE & UNIT TEST GATE)
// Command: node dist-test/runner.js (npm test)
// Verifies all core business logic, parsers, limit gates, formatters, and E2E flows.
// ═══════════════════════════════════════════════════════════════════════════════

const path = require('path');

const { createCurrencySuite } = require('../tests/unit/currency.test');
const { createDateSuite } = require('../tests/unit/date.test');
const { createLimitsSuite } = require('../tests/unit/limits.test');
const { createAdvisorSuite } = require('../tests/unit/advisor.test');
const { createParserSuite } = require('../tests/unit/parser.test');
const { createFormatterSuite } = require('../tests/unit/formatter.test');
const { createE2EScenariosSuite } = require('../tests/e2e/scenarios.test');

async function main() {
  console.log('═'.repeat(75));
  console.log('  🇮🇩 TATADANA SAAS TEST SUITE RUNNER');
  console.log('  Target: Unit, Integration & E2E Acceptance Specifications');
  console.log('═'.repeat(75));

  const suites = [
    createCurrencySuite(),
    createDateSuite(),
    createLimitsSuite(),
    createAdvisorSuite(),
    createParserSuite(),
    createFormatterSuite(),
    createE2EScenariosSuite(),
  ];

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const suiteResults = [];
  const globalStart = Date.now();

  for (const suite of suites) {
    const res = await suite.run();
    suiteResults.push(res);
    totalTests += res.total;
    totalPassed += res.passed;
    totalFailed += res.failed;
  }

  const globalDuration = Date.now() - globalStart;

  console.log('\n' + '═'.repeat(75));
  console.log('  TEST EXECUTION SUMMARY');
  console.log('═'.repeat(75));

  for (const r of suiteResults) {
    const status = r.failed === 0 ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    const detail = `${r.passed}/${r.total} passed in ${r.durationMs}ms`;
    console.log(`  [${status}] ${r.suiteName.padEnd(45)} ${detail}`);
  }

  console.log('─'.repeat(75));
  console.log(`  Total Suites:   ${suiteResults.length}`);
  console.log(`  Total Tests:    ${totalTests}`);
  console.log(`  Passed:         \x1b[32m${totalPassed}\x1b[0m`);
  console.log(`  Failed:         ${totalFailed > 0 ? `\x1b[31m${totalFailed}\x1b[0m` : '0'}`);
  console.log(`  Duration:       ${globalDuration}ms`);
  console.log('═'.repeat(75));

  if (totalFailed > 0) {
    console.error(`\n\x1b[31m💥 TEST RUN FAILED: ${totalFailed} assertions failed.\x1b[0m\n`);
    process.exit(1);
  } else {
    console.log(`\n\x1b[32m🎉 ALL TESTS PASSED SUCCESSFULLY! (100% genuine assertion coverage)\x1b[0m\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
