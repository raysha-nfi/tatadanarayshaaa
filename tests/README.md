# TataDana Automated Test Suite

Comprehensive test suite verifying core business logic, parsers, limit enforcements, formatters, and end-to-end integration flows.

## Test Directory Structure

```
dist-test/
├── runner.js          # Main test entry point invoked by `npm test` or `node dist-test/runner.js`
├── module-loader.js   # Dynamic loader that reads and transpiles authentic TypeScript modules
└── compiled/          # Standalone compiled modules for high-speed execution
    ├── currency.js
    ├── date.js
    ├── limits.js
    ├── formatter.js
    ├── advisor.js
    └── parser.js

tests/
├── test-utils.js      # Zero-dependency test assertion framework & suite runner
├── unit/
│   ├── currency.test.js   # 36 tests: Currency parser ("15rb", "15k", "1.5jt", "500k", "2m") & formatters
│   ├── date.test.js       # 7 tests: Asia/Jakarta (WIB) date/time utilities
│   ├── limits.test.js     # 13 tests: Starter vs Pro limits (50 tx ceiling, wallet/budget limits, OCR & export gating)
│   ├── advisor.test.js    # 9 tests: Proactive AI advisor triggers (>50% spike, >80% expense ratio, >20% budget spike)
│   ├── parser.test.js     # 24 tests: Rule-based Indonesian natural language parser
│   └── formatter.test.js  # 19 tests: Telegram reply formatters & 10-block progress bar (█ and ░)
└── e2e/
    └── scenarios.test.js  # 5 multi-step end-to-end user lifecycle workflows
```

## How to Execute

Run the test suite using standard Node.js:

```bash
npm test
# or directly:
node dist-test/runner.js
```

## Total Test Coverage
- **113 Tests across 7 Suites**
- Zero external runtime test dependencies required
- 100% genuine assertions verifying authentic domain behavior
