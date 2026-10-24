// ═══════════════════════════════════════════════════════════════════════════════
// TATADANA TEST UTILITIES & ASSERTION ENGINE
// Pure Node.js zero-dependency test runner framework
// ═══════════════════════════════════════════════════════════════════════════════

class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new AssertionError(message, condition, true);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    const msg = message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
    throw new AssertionError(msg, actual, expected);
  }
}

function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const msg = message || `Expected deep equality:\n  Expected: ${expectedStr}\n  Actual:   ${actualStr}`;
    throw new AssertionError(msg, actual, expected);
  }
}

function assertMatches(actual, regex, message) {
  if (typeof actual !== 'string' || !regex.test(actual)) {
    const msg = message || `Expected string to match ${regex}, got: ${JSON.stringify(actual)}`;
    throw new AssertionError(msg, actual, regex);
  }
}

function assertIncludes(haystack, needle, message) {
  if (typeof haystack !== 'string' || !haystack.includes(needle)) {
    const msg = message || `Expected string to include ${JSON.stringify(needle)}, got: ${JSON.stringify(haystack)}`;
    throw new AssertionError(msg, haystack, needle);
  }
}

function assertNull(actual, message) {
  if (actual !== null) {
    const msg = message || `Expected null, got ${JSON.stringify(actual)}`;
    throw new AssertionError(msg, actual, null);
  }
}

function createSuite(suiteName) {
  const tests = [];

  function test(name, fn) {
    tests.push({ name, fn });
  }

  async function run() {
    console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${suiteName}\x1b[0m`);
    let passed = 0;
    let failed = 0;
    const failures = [];
    const startTime = Date.now();

    for (const t of tests) {
      try {
        await t.fn();
        passed++;
        console.log(`  \x1b[32m✔\x1b[0m ${t.name}`);
      } catch (err) {
        failed++;
        failures.push({ name: t.name, error: err });
        console.log(`  \x1b[31m✖\x1b[0m ${t.name}`);
        console.log(`    \x1b[31mError: ${err.message}\x1b[0m`);
        if (err.actual !== undefined && err.expected !== undefined) {
          console.log(`      Actual:   ${JSON.stringify(err.actual)}`);
          console.log(`      Expected: ${JSON.stringify(err.expected)}`);
        }
      }
    }

    const durationMs = Date.now() - startTime;
    return {
      suiteName,
      total: tests.length,
      passed,
      failed,
      failures,
      durationMs,
    };
  }

  return { test, run };
}

module.exports = {
  assert,
  assertEqual,
  assertDeepEqual,
  assertMatches,
  assertIncludes,
  assertNull,
  createSuite,
};
