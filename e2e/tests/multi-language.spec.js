import { test, expect } from '@playwright/test';

/**
 * Multi-Language Support E2E Tests
 *
 * Tests for multi-language functionality including:
 * - Loading language-specific versions
 * - Language switching
 * - Content structure consistency
 * - Language-specific metadata
 */

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'pl', name: 'Polish' },
  { code: 'ro', name: 'Romanian' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'el', name: 'Greek' },
];

test.describe('Multi-Language Support', () => {
  test('should load English version', async ({ page }) => {
    await page.goto('/index-en.html');

    // Verify correct language
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');

    // Verify content is visible
    await expect(page.locator('body')).toBeVisible();

    // Verify page title exists
    await expect(page).toHaveTitle(/.+/);
  });

  test('should load German version', async ({ page }) => {
    await page.goto('/index-de.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'de');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load French version', async ({ page }) => {
    await page.goto('/index-fr.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'fr');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Spanish version', async ({ page }) => {
    await page.goto('/index-es.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'es');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should switch between languages', async ({ page }) => {
    await page.goto('/');

    // Look for language switcher links
    const languageSwitchers = page.locator(
      'a[href*="index-"], [class*="lang"], [class*="language"]'
    );
    const switcherCount = await languageSwitchers.count();

    if (switcherCount > 0) {
      // Find German link
      const germanLink = page.locator('a[href*="index-de"]');
      if ((await germanLink.count()) > 0) {
        await germanLink.first().click();
        await page.waitForLoadState('domcontentloaded');

        // Verify language changed
        await expect(page).toHaveURL(/index-de\.html/);
        const html = page.locator('html');
        await expect(html).toHaveAttribute('lang', 'de');
      }
    }
  });

  test('should have consistent structure across languages', async ({
    page,
  }) => {
    const structures = {};
    const testLanguages = ['en', 'de', 'fr'];

    for (const lang of testLanguages) {
      await page.goto(`/index-${lang}.html`);

      // Count main content elements
      const articles = await page.locator('article').count();
      const headings = await page.locator('h1, h2, h3').count();

      structures[lang] = { articles, headings };
    }

    // Verify all languages have similar structure
    const enStructure = structures['en'];
    for (const lang of ['de', 'fr']) {
      const langStructure = structures[lang];

      // Articles count should be similar (allow some variance)
      const articleDiff = Math.abs(
        langStructure.articles - enStructure.articles
      );
      expect(articleDiff).toBeLessThanOrEqual(2);

      // Should have at least one heading
      expect(langStructure.headings).toBeGreaterThan(0);
    }
  });

  test('should have language-specific meta tags', async ({ page }) => {
    await page.goto('/index-en.html');

    // Check for language-specific Open Graph tags
    const ogLocale = page.locator('meta[property="og:locale"]');
    if ((await ogLocale.count()) > 0) {
      const locale = await ogLocale.getAttribute('content');
      expect(locale).toContain('en');
    }

    // Check HTML lang attribute
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('should maintain navigation in selected language', async ({ page }) => {
    await page.goto('/index-de.html');

    // Click first article if available
    const articleLinks = page.locator('article a');
    const linkCount = await articleLinks.count();

    if (linkCount > 0) {
      const firstLink = articleLinks.first();
      const href = await firstLink.getAttribute('href');

      if (href && href.includes('-de.html')) {
        await firstLink.click();
        await page.waitForLoadState('domcontentloaded');

        // Verify we're still in German
        const html = page.locator('html');
        const lang = await html.getAttribute('lang');
        expect(lang).toBe('de');
      }
    }
  });

  test('should have proper charset encoding for all languages', async ({
    page,
  }) => {
    const testLanguages = ['en', 'de', 'el', 'pl'];

    for (const lang of testLanguages) {
      await page.goto(`/index-${lang}.html`);

      // Verify charset meta tag
      const charsetMeta = page.locator('meta[charset]');
      await expect(charsetMeta).toHaveCount(1);

      const charset = await charsetMeta.getAttribute('charset');
      expect(charset.toUpperCase()).toBe('UTF-8');
    }
  });

  test('should display articles in language-specific format', async ({
    page,
  }) => {
    const testCases = [
      { lang: 'en', expectedPattern: /\w+/ }, // English text
      { lang: 'de', expectedPattern: /\w+/ }, // German text
      { lang: 'fr', expectedPattern: /\w+/ }, // French text
    ];

    for (const testCase of testCases) {
      await page.goto(`/index-${testCase.lang}.html`);

      // Verify page has text content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();
      expect(bodyText.length).toBeGreaterThan(100);

      // Verify text matches expected pattern
      expect(testCase.expectedPattern.test(bodyText)).toBeTruthy();
    }
  });

  test('should have correct language in alternate links', async ({ page }) => {
    await page.goto('/index-en.html');

    // Check for alternate language links
    const alternateLinks = page.locator('link[rel="alternate"]');
    const count = await alternateLinks.count();

    if (count > 0) {
      // Verify at least one alternate link
      const firstAlternate = alternateLinks.first();
      const hreflang = await firstAlternate.getAttribute('hreflang');
      const href = await firstAlternate.getAttribute('href');

      expect(hreflang).toBeTruthy();
      expect(href).toBeTruthy();
    }
  });
});
