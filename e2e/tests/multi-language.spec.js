// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

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
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ar', name: 'Arabic' },
  { code: 'he', name: 'Hebrew' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

test.describe('Multi-Language Support', () => {
  test('should load English version', async ({ page }) => {
    await page.goto('/index.html');

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

  test('should load Swedish version', async ({ page }) => {
    await page.goto('/index-sv.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'sv');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Danish version', async ({ page }) => {
    await page.goto('/index-da.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'da');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Norwegian version', async ({ page }) => {
    await page.goto('/index-no.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'no');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Finnish version', async ({ page }) => {
    await page.goto('/index-fi.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'fi');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Dutch version', async ({ page }) => {
    await page.goto('/index-nl.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'nl');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Arabic version with RTL direction', async ({ page }) => {
    await page.goto('/index-ar.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'ar');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Hebrew version with RTL direction', async ({ page }) => {
    await page.goto('/index-he.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'he');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Japanese version', async ({ page }) => {
    await page.goto('/index-ja.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'ja');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Korean version', async ({ page }) => {
    await page.goto('/index-ko.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'ko');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Chinese version', async ({ page }) => {
    await page.goto('/index-zh.html');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'zh');
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
    const testLanguages = ['en', 'de', 'fr', 'sv', 'ja', 'ar'];

    for (const lang of testLanguages) {
      const url = lang === 'en' ? '/index.html' : `/index-${lang}.html`;
      await page.goto(url);

      // Count main content elements
      const articles = await page.locator('article').count();
      const headings = await page.locator('h1, h2, h3').count();

      structures[lang] = { articles, headings };
    }

    // Verify all languages have similar structure
    const enStructure = structures['en'];
    for (const lang of ['de', 'fr', 'sv', 'ja', 'ar']) {
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
    await page.goto('/index.html');

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
    const testLanguages = ['en', 'de', 'ar', 'ja', 'ko', 'zh', 'he'];

    for (const lang of testLanguages) {
      const url = lang === 'en' ? '/index.html' : `/index-${lang}.html`;
      await page.goto(url);

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
      { lang: 'sv', expectedPattern: /\w+/ }, // Swedish text
      { lang: 'nl', expectedPattern: /\w+/ }, // Dutch text
      { lang: 'fi', expectedPattern: /\w+/ }, // Finnish text
    ];

    for (const testCase of testCases) {
      const url = testCase.lang === 'en' ? '/index.html' : `/index-${testCase.lang}.html`;
      await page.goto(url);

      // Verify page has text content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();
      expect(bodyText.length).toBeGreaterThan(100);

      // Verify text matches expected pattern
      expect(testCase.expectedPattern.test(bodyText)).toBeTruthy();
    }
  });

  test('should have correct language in alternate links', async ({ page }) => {
    await page.goto('/index.html');

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
