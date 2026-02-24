---
applyTo: "e2e/**/*.spec.js"
---

## Playwright E2E Test Requirements

When writing or modifying E2E tests in `e2e/`, follow these conventions:

### File Header
Every file must start with SPDX headers:
```js
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
```

### Imports
```js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright'; // for accessibility tests
```

### Locators — Use Stable Selectors
Prefer in this order:
1. `getByRole()` — semantic and robust
2. `getByText()` — visible text
3. `getByTestId()` — `data-testid` attribute
4. CSS selectors — only as last resort

### Conditional Element Checks
Always guard optional elements before asserting:
```js
const nav = page.locator('nav');
const navCount = await nav.count();
if (navCount > 0) {
  await expect(nav).toBeVisible();
}
```

### Accessibility Testing
Include axe-core checks in feature tests:
```js
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();
expect(results.violations).toEqual([]);
```

### Test Isolation
- Each test must be independent (no shared state between tests)
- Use `test.beforeEach` / `test.afterEach` for setup and cleanup

### Multi-Language Testing
When testing language variants, use the correct `index-<lang>.html` path:
- English: `/index.html` or `/`
- French: `/index-fr.html`
- German: `/index-de.html`

### Running Tests
```bash
npm run test:e2e          # All E2E tests (headless)
npm run test:e2e:headed   # With visible browser
npm run test:e2e:debug    # Debug mode
npm run test:e2e:report   # Show Playwright HTML report
```
