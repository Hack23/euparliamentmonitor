---
applyTo: "test/**/*.test.js"
---

## Vitest Test Requirements

When writing or modifying tests in `test/`, follow these conventions:

### File Header
Every file must start with SPDX headers:
```js
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
```

### Imports
```js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
```

### Fixtures & Helpers
- Use shared fixtures from `test/fixtures/ep-data.js` for EP data mocks
- Use shared helpers from `test/helpers/test-utils.js` (e.g., `validateHTML`)
- Do not create inline mock objects that duplicate fixture data

### Structure
```js
describe('module-name', () => {
  describe('functionName', () => {
    beforeEach(() => { /* setup */ });

    it('should <expected behavior>', () => {
      // Arrange, Act, Assert
    });
  });
});
```

### Assertions
- Prefer specific matchers: `toContain`, `toHaveLength`, `toBeInstanceOf`, `toMatch`
- Use `toThrow` / `toThrowError` for error cases
- Test both happy path and edge cases (empty input, null, invalid data)

### Mocking
- Mock external dependencies (file system, network) using `vi.mock()` or `vi.spyOn()`
- Restore mocks in `afterEach` with `vi.restoreAllMocks()`

### Running Tests
```bash
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:coverage     # With coverage report
```
