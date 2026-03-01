// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * Sitemap Validation E2E Tests
 *
 * Tests for sitemap completeness and validity including:
 * - sitemap.xml XML structure and urlset schema
 * - Article URL coverage
 * - HTML sitemap pages for all 14 languages
 * - Sitemap page structure and navigation
 */

const SITEMAP_HTML_LANGUAGES = [
  { code: 'en', file: '/sitemap.html' },
  { code: 'sv', file: '/sitemap_sv.html' },
  { code: 'da', file: '/sitemap_da.html' },
  { code: 'no', file: '/sitemap_no.html' },
  { code: 'fi', file: '/sitemap_fi.html' },
  { code: 'de', file: '/sitemap_de.html' },
  { code: 'fr', file: '/sitemap_fr.html' },
  { code: 'es', file: '/sitemap_es.html' },
  { code: 'nl', file: '/sitemap_nl.html' },
  { code: 'ar', file: '/sitemap_ar.html' },
  { code: 'he', file: '/sitemap_he.html' },
  { code: 'ja', file: '/sitemap_ja.html' },
  { code: 'ko', file: '/sitemap_ko.html' },
  { code: 'zh', file: '/sitemap_zh.html' },
];

test.describe('Sitemap XML', () => {
  test('should load sitemap.xml when available', async ({ request }) => {
    const response = await request.get('/sitemap.xml');

    // sitemap.xml is a generated build artifact; skip if not present
    if (response.status() === 404) {
      test.skip();
      return;
    }

    expect(response.status()).toBe(200);
  });

  test('should have valid urlset structure', async ({ request }) => {
    const response = await request.get('/sitemap.xml');

    if (response.status() === 404) {
      test.skip();
      return;
    }

    const text = await response.text();

    // Verify XML sitemap namespace
    expect(text).toContain('urlset');
    expect(text).toContain('sitemaps.org');
  });

  test('should contain article URLs', async ({ request }) => {
    const response = await request.get('/sitemap.xml');

    if (response.status() === 404) {
      test.skip();
      return;
    }

    const text = await response.text();

    // Verify news article URLs are present
    expect(text).toContain('/news/');
    expect(text).toContain('<url>');
    expect(text).toContain('<loc>');
  });

  test('should contain more than 50 URLs', async ({ request }) => {
    const response = await request.get('/sitemap.xml');

    if (response.status() === 404) {
      test.skip();
      return;
    }

    const text = await response.text();

    // Verify there are many article entries
    const urlMatches = text.match(/<url>/g) || [];
    expect(urlMatches.length).toBeGreaterThan(50);
  });

  test('should include rss.xml in sitemap', async ({ request }) => {
    const response = await request.get('/sitemap.xml');

    if (response.status() === 404) {
      test.skip();
      return;
    }

    const text = await response.text();

    // Verify RSS feed URL is listed in sitemap
    expect(text).toContain('rss.xml');
  });
});

test.describe('Sitemap HTML Pages', () => {
  test('English sitemap HTML should load successfully', async ({ page }) => {
    const response = await page.goto('/sitemap.html');

    expect(response.status()).toBe(200);

    // Verify page has content
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveTitle(/.+/);
  });

  test('English sitemap HTML should have article links', async ({ page }) => {
    await page.goto('/sitemap.html');

    // Verify article links exist
    const newsLinks = page.locator('a[href*="news/"]');
    const count = await newsLinks.count();

    expect(count).toBeGreaterThan(0);
  });

  test('English sitemap HTML should have language navigation', async ({
    page,
  }) => {
    await page.goto('/sitemap.html');

    // Verify language switcher is present
    const langLinks = page.locator(
      '.language-switcher a, [class*="lang"] a, a[href*="sitemap_"]'
    );
    const count = await langLinks.count();

    expect(count).toBeGreaterThan(0);
  });

  test('all 14 language sitemap HTML pages should load', async ({ page }) => {
    for (const { code, file } of SITEMAP_HTML_LANGUAGES) {
      const response = await page.goto(file);

      expect(response.status()).toBe(200, `Sitemap for ${code} should load`);

      // Verify page body is visible
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('language sitemap pages should have correct lang attribute', async ({
    page,
  }) => {
    const testLanguages = SITEMAP_HTML_LANGUAGES.slice(0, 5);

    for (const { code, file } of testLanguages) {
      await page.goto(file);

      const html = page.locator('html');
      const lang = await html.getAttribute('lang');

      expect(lang).toBe(code, `Sitemap for ${code} should have lang="${code}"`);
    }
  });

  test('Arabic sitemap should have RTL direction', async ({ page }) => {
    await page.goto('/sitemap_ar.html');

    const html = page.locator('html');
    const dir = await html.getAttribute('dir');

    expect(dir).toBe('rtl');
  });

  test('Hebrew sitemap should have RTL direction', async ({ page }) => {
    await page.goto('/sitemap_he.html');

    const html = page.locator('html');
    const dir = await html.getAttribute('dir');

    expect(dir).toBe('rtl');
  });
});
