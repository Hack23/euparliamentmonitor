# 🧪 Testing Strategy Skill

## Purpose

Ensure comprehensive testing coverage across unit, integration, and E2E layers for the EU Parliament Monitor platform using Vitest and Playwright.

## Rules

### MUST (Critical)
1. MUST maintain minimum 80% overall test coverage
2. MUST write unit tests for all new functionality
3. MUST run `npm run test` before committing
4. MUST not skip tests without justification
5. MUST test error handling paths

### Testing Stack
- **Unit Tests**: Vitest (fast, ESM-native)
- **E2E Tests**: Playwright (cross-browser)
- **Coverage**: Vitest coverage with Istanbul
- **Linting**: ESLint + HTMLHint

### Testing Pyramid

```
        /\
       /E2E\         ← Playwright (critical user journeys)
      /------\
     / Integ. \      ← Vitest (module interactions)
    /----------\
   /    Unit    \    ← Vitest (fast, isolated)
  /--------------\
```

### Unit Testing Patterns (Vitest)

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('NewsGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate article with valid data', () => {
    // Arrange
    const sessionData = { id: '1', title: 'Plenary Session', date: '2026-01-15' };
    
    // Act
    const article = generateArticle(sessionData, 'en');
    
    // Assert
    expect(article).toContain('Plenary Session');
    expect(article).toMatch(/<html lang="en">/);
  });

  it('should handle missing MCP data gracefully', () => {
    const article = generateArticle(null, 'en');
    expect(article).toContain('placeholder');
  });
});
```

### E2E Testing Patterns (Playwright)

```javascript
import { test, expect } from '@playwright/test';

test('homepage loads with correct structure', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('nav')).toBeVisible();
  // Verify accessibility
  const title = await page.title();
  expect(title).toBeTruthy();
});

test('multi-language navigation works', async ({ page }) => {
  await page.goto('/index-fr.html');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});
```

### Integration Testing

```javascript
describe('MCP Client Integration', () => {
  it('should fetch and cache plenary sessions', async () => {
    const client = new EPMCPClient();
    const sessions = await client.getPlenarySessions();
    expect(Array.isArray(sessions)).toBe(true);
    
    // Verify caching works
    const cached = await client.getPlenarySessions();
    expect(cached).toEqual(sessions);
  });
});
```

### Test Commands

```bash
npm run test              # Run all unit tests
npm run test:coverage     # Tests with coverage report
npm run test:e2e          # Playwright E2E tests
npm run lint              # ESLint + HTMLHint validation
```

### Coverage Requirements
- Lines: ≥80%
- Functions: ≥80%
- Branches: ≥70%
- Security-critical paths: 100%

## Related Resources
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
