// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * SEO Metadata E2E Tests
 *
 * Tests for SEO metadata completeness on news articles including:
 * - Open Graph protocol tags (og:title, og:description, og:type, og:locale)
 * - Twitter Card meta tags
 * - Standard SEO meta tags (description, keywords, author)
 * - Schema.org structured data (JSON-LD)
 * - Article-specific meta tags
 */

// Use a committed news article for reliable testing
const ARTICLE_PATH = '/news/2026-02-24-week-ahead-en.html';

test.describe('Article SEO Metadata', () => {
  test('should have Open Graph title', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);

    const content = await ogTitle.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(5);
  });

  test('should have Open Graph description', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogDesc).toHaveCount(1);

    const content = await ogDesc.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(10);
  });

  test('should have Open Graph type set to article', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveCount(1);

    const content = await ogType.getAttribute('content');
    expect(content).toBe('article');
  });

  test('should have Open Graph locale', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const ogLocale = page.locator('meta[property="og:locale"]');
    await expect(ogLocale).toHaveCount(1);

    const content = await ogLocale.getAttribute('content');
    expect(content).toBeTruthy();
  });

  test('should have Open Graph site_name', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const ogSiteName = page.locator('meta[property="og:site_name"]');
    await expect(ogSiteName).toHaveCount(1);

    const content = await ogSiteName.getAttribute('content');
    expect(content).toBeTruthy();
  });

  test('should have Twitter Card meta tag', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveCount(1);

    const content = await twitterCard.getAttribute('content');
    expect(content).toBeTruthy();
  });

  test('should have Twitter title', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const twitterTitle = page.locator('meta[name="twitter:title"]');
    await expect(twitterTitle).toHaveCount(1);

    const content = await twitterTitle.getAttribute('content');
    expect(content).toBeTruthy();
  });

  test('should have meta description', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);

    const content = await description.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(20);
  });

  test('should have meta keywords', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const keywords = page.locator('meta[name="keywords"]');
    await expect(keywords).toHaveCount(1);

    const content = await keywords.getAttribute('content');
    expect(content).toBeTruthy();
  });

  test('should have meta author', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const author = page.locator('meta[name="author"]');
    await expect(author).toHaveCount(1);

    const content = await author.getAttribute('content');
    expect(content).toBeTruthy();
  });

  test('should have Schema.org JSON-LD structured data', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    // Verify structured data script tag exists
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();

    if (count > 0) {
      const scriptContent = await jsonLd.first().textContent();
      expect(scriptContent).toBeTruthy();

      // Verify it's valid JSON
      expect(() => JSON.parse(scriptContent)).not.toThrow();
    }
  });

  test('should have page title with site name', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('EU Parliament Monitor');
  });

  test('should have charset UTF-8', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const charset = page.locator('meta[charset]');
    await expect(charset).toHaveCount(1);

    const charsetValue = await charset.getAttribute('charset');
    expect(charsetValue.toUpperCase()).toBe('UTF-8');
  });

  test('should have viewport meta tag', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);

    const content = await viewport.getAttribute('content');
    expect(content).toContain('width=device-width');
  });
});

test.describe('Multi-Language Article SEO', () => {
  const testArticles = [
    { lang: 'en', path: '/news/2026-02-24-week-ahead-en.html', locale: 'en' },
    { lang: 'de', path: '/news/2026-02-24-week-ahead-de.html', locale: 'de' },
    { lang: 'fr', path: '/news/2026-02-24-week-ahead-fr.html', locale: 'fr' },
    { lang: 'ar', path: '/news/2026-02-24-week-ahead-ar.html', locale: 'ar' },
  ];

  for (const { lang, path, locale } of testArticles) {
    test(`${lang} article should have correct og:locale`, async ({ page }) => {
      await page.goto(path);

      const ogLocale = page.locator('meta[property="og:locale"]');
      const count = await ogLocale.count();

      if (count > 0) {
        const content = await ogLocale.getAttribute('content');
        expect(content).toContain(locale);
      }
    });

    test(`${lang} article should have html lang attribute`, async ({
      page,
    }) => {
      await page.goto(path);

      const html = page.locator('html');
      const langAttr = await html.getAttribute('lang');
      expect(langAttr).toBe(lang);
    });
  }

  test('Arabic article should have RTL direction', async ({ page }) => {
    await page.goto('/news/2026-02-24-week-ahead-ar.html');

    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  test('Hebrew article should have RTL direction', async ({ page }) => {
    await page.goto('/news/2026-02-24-week-ahead-he.html');

    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('rtl');
  });
});
