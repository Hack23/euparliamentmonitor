// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';
import { getPoliticalIntelligenceFilename } from '../../scripts/generators/political-intelligence.js';
import { getOgLocale } from '../../scripts/constants/seo/index.js';

/**
 * SEO Headers E2E — cross-locale `<head>` invariants on real rendered pages.
 *
 * Complements the unit-level 14-locale × 4-surface matrix in
 * `test/unit/seo-headers-matrix.test.js` (which runs on synthetic minimal
 * input) by asserting the same invariants on the *actually deployed* HTML
 * served by the static-site preview. Catches build-time generator drift
 * that escapes the unit matrix.
 *
 * Per locale, asserts on the political-intelligence landing page:
 *  - `<html lang="…">` matches the locale
 *  - exactly one `og:locale` matching the BCP-47 mapping
 *  - exactly 13 `og:locale:alternate`
 *  - both light and dark `theme-color` pair
 *  - 14 hreflang + 1 x-default
 *  - robots crawler hints present (`max-snippet:-1`, `max-image-preview:large`)
 *  - localized `<meta name="keywords">` (non-en locales must not equal en)
 */

const PI_PAGES = ALL_LANGUAGES.map((lang) => ({
  lang,
  path: `/${getPoliticalIntelligenceFilename(lang)}`,
}));

// Capture en keywords once and assert non-en locales differ.
let enKeywords = null;

test.describe('SEO Headers — per-locale invariants', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const response = await page.goto(`/${getPoliticalIntelligenceFilename('en')}`);
    expect(response.status()).toBe(200);
    enKeywords = await page
      .locator('meta[name="keywords"]')
      .first()
      .getAttribute('content');
    expect(enKeywords, 'en page must declare <meta name="keywords">').toBeTruthy();
    await context.close();
  });

  for (const { lang, path: pagePath } of PI_PAGES) {
    test(`${lang}: html lang + og:locale + theme-color pair + crawler hints`, async ({ page }) => {
      const response = await page.goto(pagePath);
      expect(response.status()).toBe(200);

      // html lang
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe(lang);

      // og:locale — exactly one, BCP-47 mapped
      const primaryLocale = await page
        .locator('meta[property="og:locale"]')
        .first()
        .getAttribute('content');
      expect(primaryLocale).toBe(getOgLocale(lang));

      const altLocales = await page.locator('meta[property="og:locale:alternate"]').count();
      expect(altLocales, `${lang} should have 13 og:locale:alternate`).toBe(13);

      // theme-color light + dark
      const lightTheme = await page
        .locator('meta[name="theme-color"][media*="light"]')
        .count();
      const darkTheme = await page
        .locator('meta[name="theme-color"][media*="dark"]')
        .count();
      expect(lightTheme, `${lang} missing light theme-color`).toBe(1);
      expect(darkTheme, `${lang} missing dark theme-color`).toBe(1);

      // hreflang graph
      const hreflangs = await page.locator('link[rel="alternate"][hreflang]').count();
      // 14 languages + 1 x-default = 15
      expect(hreflangs, `${lang} hreflang graph must be 15 links`).toBe(15);

      // robots crawler hints
      const robots = await page
        .locator('meta[name="robots"]')
        .first()
        .getAttribute('content');
      expect(robots).toContain('index');
      expect(robots).toContain('follow');
      expect(robots).toMatch(/max-snippet:-1/);
      expect(robots).toMatch(/max-image-preview:large/);

      // keywords localization — non-en must differ from en baseline
      const keywords = await page
        .locator('meta[name="keywords"]')
        .first()
        .getAttribute('content');
      expect(keywords, `${lang} missing <meta name="keywords">`).toBeTruthy();
      if (lang !== 'en') {
        expect(
          keywords,
          `${lang} keywords must differ from en baseline (locale-overlay drift)`,
        ).not.toBe(enKeywords);
      }
    });
  }
});
