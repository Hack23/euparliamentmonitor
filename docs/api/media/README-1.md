# E2E Testing Guide

End-to-end (E2E) testing for EU Parliament Monitor using Playwright.

## Overview

The E2E test suite validates the complete user experience from a browser perspective, ensuring:

- **User Journeys**: Critical user paths work correctly
- **Cross-Browser**: Tests run on Chromium, Firefox, and WebKit
- **Mobile Support**: Tests cover mobile and tablet viewports
- **Accessibility**: WCAG 2.1 AA compliance validation
- **Responsive Design**: Layout adapts to different screen sizes

## Test Suite Structure

```
e2e/
├── tests/
│   ├── homepage.spec.js           # Homepage functionality tests
│   ├── news-browsing.spec.js      # Article browsing and reading
│   ├── navigation.spec.js         # Site navigation tests
│   ├── multi-language.spec.js     # Multi-language support tests (all 14 languages)
│   ├── accessibility.spec.js      # WCAG 2.1 AA compliance tests
│   ├── responsive.spec.js         # Responsive design tests
│   ├── rss-feed.spec.js           # RSS 2.0 feed validation tests
│   ├── sitemap.spec.js            # Sitemap XML and HTML validation tests
│   └── seo-metadata.spec.js       # SEO meta tags and Open Graph validation
├── fixtures/                      # Test data (future)
├── helpers/                       # Test utilities (future)
└── README.md                      # This file
```

## Running E2E Tests

### Prerequisites

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Install Playwright Browsers**:
   ```bash
   npx playwright install --with-deps
   ```

### Run Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/tests/homepage.spec.js

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests in mobile viewports
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari
```

### View Test Reports

```bash
# Open HTML report
npm run test:e2e:report

# Or manually
npx playwright show-report
```

## Test Categories

### 1. Homepage Tests (`homepage.spec.js`)

Tests homepage loading and structure:

- ✅ Page loads successfully
- ✅ Navigation menu displays
- ✅ Recent articles display
- ✅ Sitemap link works
- ✅ Proper HTML structure
- ✅ SEO meta tags present

### 2. News Browsing Tests (`news-browsing.spec.js`)

Tests article browsing experience:

- ✅ Open and display articles
- ✅ Navigate back to homepage
- ✅ Article metadata displays
- ✅ Internal links work
- ✅ Article content displays

### 3. Navigation Tests (`navigation.spec.js`)

Tests site navigation:

- ✅ Navigation menu functions
- ✅ Navigate to different sections
- ✅ Navigation state maintained
- ✅ Home link works
- ✅ Browser back/forward buttons
- ✅ Skip navigation links
- ✅ Keyboard focus states
- ✅ External links security

### 4. Multi-Language Tests (`multi-language.spec.js`)

Tests multi-language functionality:

- ✅ Load language-specific versions (14 languages)
- ✅ Switch between languages
- ✅ Consistent structure across languages
- ✅ Language-specific meta tags
- ✅ Maintain language in navigation
- ✅ Proper charset encoding
- ✅ Alternate language links

**Supported Languages**:

- EN (English), SV (Swedish), DA (Danish), NO (Norwegian)
- FI (Finnish), DE (German), FR (French), ES (Spanish)
- NL (Dutch), AR (Arabic), HE (Hebrew), JA (Japanese)
- KO (Korean), ZH (Chinese)

### 5. Accessibility Tests (`accessibility.spec.js`)

Tests WCAG 2.1 AA compliance:

- ✅ Automated accessibility scanning (axe-core)
- ✅ Proper heading hierarchy
- ✅ Alt text for images
- ✅ Keyboard navigation
- ✅ Link activation with Enter key
- ✅ Sufficient color contrast
- ✅ ARIA landmarks
- ✅ Proper link text
- ✅ Skip navigation link
- ✅ Page title
- ✅ Language attribute
- ✅ Text zoom support
- ✅ Form labels (if forms exist)

### 6. Responsive Design Tests (`responsive.spec.js`)

Tests responsive design:

- ✅ Mobile portrait (375x667)
- ✅ Mobile landscape (667x375)
- ✅ Tablet portrait (768x1024)
- ✅ Tablet landscape (1024x768)
- ✅ Desktop (1920x1080)
- ✅ Viewport meta tag
- ✅ Adaptive layout
- ✅ Touch-friendly tap targets
- ✅ No horizontal scroll on mobile
- ✅ Readable text on mobile
- ✅ Content stacking on mobile
- ✅ Responsive images
- ✅ Text resizing support

### 7. RSS Feed Tests (`rss-feed.spec.js`)

Tests RSS 2.0 feed validity:

- ✅ Feed loads successfully (HTTP 200)
- ✅ Valid RSS 2.0 root element with version attribute
- ✅ Required channel elements (title, link, description)
- ✅ Dublin Core namespace for per-item language tags
- ✅ Items present with required elements (title, pubDate, guid)
- ✅ dc:language tags on items
- ✅ Multi-language article coverage
- ✅ Atom self-link for feed discovery
- ✅ lastBuildDate element

### 8. Sitemap Tests (`sitemap.spec.js`)

Tests sitemap completeness and validity:

- ✅ sitemap.xml loads when available (graceful skip if not generated)
- ✅ Valid XML urlset structure with sitemaps.org namespace
- ✅ Article URLs present in sitemap
- ✅ More than 50 URL entries
- ✅ RSS feed URL listed in sitemap
- ✅ All 14 language HTML sitemap pages load successfully
- ✅ Correct lang attribute on each language sitemap page
- ✅ RTL direction for Arabic and Hebrew sitemap pages
- ✅ Language navigation in HTML sitemaps

### 9. SEO Metadata Tests (`seo-metadata.spec.js`)

Tests SEO metadata completeness on articles:

- ✅ Open Graph title, description, type (article), locale, site_name
- ✅ Twitter Card meta tags (card, title, description)
- ✅ Standard meta tags (description, keywords, author)
- ✅ Schema.org JSON-LD structured data (valid JSON)
- ✅ Page title includes site name
- ✅ Charset UTF-8
- ✅ Viewport meta tag
- ✅ Multi-language og:locale correctness
- ✅ RTL direction for Arabic and Hebrew articles

## Writing E2E Tests

### Test Structure

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Navigate to page
    await page.goto('/');

    // Interact with elements
    const button = page.locator('button');
    await button.click();

    // Assert expectations
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Locators Wisely**:

   ```javascript
   // Good: Specific and stable
   page.locator('[data-testid="submit-button"]');
   page.locator('button:has-text("Submit")');

   // Avoid: Fragile CSS classes
   page.locator('.btn-primary-123');
   ```

2. **Wait for State Changes**:

   ```javascript
   // Good: Wait for navigation
   await page.waitForLoadState('domcontentloaded');

   // Good: Wait for element
   await expect(element).toBeVisible();
   ```

3. **Handle Dynamic Content**:

   ```javascript
   // Check if element exists before interacting
   const count = await page.locator('.article').count();
   if (count > 0) {
     // Interact with element
   }
   ```

4. **Test Independence**:

   ```javascript
   // Each test should be independent
   test.beforeEach(async ({ page }) => {
     await page.goto('/');
   });
   ```

5. **Meaningful Assertions**:
   ```javascript
   // Good: Clear assertion
   await expect(page.locator('h1')).toContainText('EU Parliament Monitor');
   // Avoid: Vague assertion
   await expect(element).toBeTruthy();
   ```

## Debugging Tests

### Visual Debugging

```bash
# UI Mode - Interactive debugging
npm run test:e2e:ui

# Headed Mode - See browser
npm run test:e2e:headed

# Debug Mode - Step through
npm run test:e2e:debug
```

### Screenshots and Videos

Playwright automatically captures:

- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

Find these in:

- `test-results/` - Screenshots and videos
- `playwright-report/` - HTML report with artifacts

### Console Debugging

```javascript
// Add console.log in tests
test('debug test', async ({ page }) => {
  const text = await page.locator('h1').textContent();
  console.log('Heading text:', text);
});

// Pause execution
await page.pause();
```

### Test Selector

```bash
# Open Playwright Inspector
npx playwright inspector
```

## CI/CD Integration

E2E tests run automatically in GitHub Actions on:

- **Pull Requests**: All tests must pass
- **Push to Main**: Full test suite
- **Daily Schedule**: Regression testing

See `.github/workflows/e2e.yml` for configuration.

## Configuration

### Playwright Config (`playwright.config.js`)

Key settings:

- **Base URL**: `http://localhost:8080`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 retries in CI, 0 locally
- **Timeouts**: 30s test timeout, 120s server startup
- **Web Server**: Auto-starts `npm run serve`

### Modifying Configuration

```javascript
// playwright.config.js
export default defineConfig({
  // Add test timeout
  timeout: 60000, // 60 seconds

  // Add global setup
  globalSetup: './e2e/global-setup.js',

  // Add more browsers
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

## Accessibility Testing

### Using Axe-Core

```javascript
import AxeBuilder from '@axe-core/playwright';

test('accessibility test', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### WCAG Compliance Levels

- **A**: Basic accessibility
- **AA**: Recommended compliance (our target)
- **AAA**: Enhanced accessibility

## Performance Considerations

### Test Speed

- **Unit Tests**: < 1s per test
- **Integration Tests**: < 10s per test
- **E2E Tests**: < 30s per test

### Optimization Tips

1. **Parallel Execution**: Tests run in parallel by default
2. **Reuse Server**: `reuseExistingServer: !process.env.CI`
3. **Selective Testing**: Run specific tests during development
4. **Fast Selectors**: Use data-testid attributes

## Troubleshooting

### Tests Fail Locally

```bash
# Clear Playwright cache
npx playwright install --force

# Update browsers
npx playwright install

# Check server is running
npm run serve
```

### Tests Pass Locally but Fail in CI

- Check if content is generated in CI
- Verify server starts correctly
- Check for race conditions
- Review CI logs and screenshots

### Flaky Tests

```javascript
// Add explicit waits
await page.waitForLoadState('networkidle');

// Increase timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000);
  // test code
});

// Add retry logic
test('flaky test', async ({ page }) => {
  test.retry(2);
  // test code
});
```

### Element Not Found

```javascript
// Wait for element
await page.waitForSelector('.element');

// Use timeout
await expect(page.locator('.element')).toBeVisible({ timeout: 10000 });

// Check if exists first
const count = await page.locator('.element').count();
if (count > 0) {
  // interact with element
}
```

## Contributing

When adding new features:

1. **Write E2E tests** for user-facing changes
2. **Test accessibility** with axe-core
3. **Test responsive design** on multiple viewports
4. **Test cross-browser** (at least Chromium + Firefox)
5. **Update documentation** if adding new test patterns

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Axe-Core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: March 2026  
**Framework**: Playwright 1.58+  
**Test Count**: 90+ E2E tests  
**Coverage**: Homepage, Navigation, Multi-language (14 languages), Accessibility, Responsive, RSS Feed, Sitemap, SEO Metadata
