// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';
import { SAMPLE_LANGUAGES } from './_sample-languages.js';
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
 * E2E samples representative locales (see `_sample-languages.js`); the
 * unit matrix above provides full 14-locale coverage.
 *
 * Per sampled locale, asserts on the political-intelligence landing page:
 *  - `<html lang="…">` matches the locale
 *  - exactly one `og:locale` matching the BCP-47 mapping
 *  - exactly 13 `og:locale:alternate`
 *  - both light and dark `theme-color` pair
 *  - 14 hreflang + 1 x-default
 *  - robots crawler hints present (`max-snippet:-1`, `max-image-preview:large`)
 *  - localized `<meta name="keywords">` (non-en locales must not equal en)
 */

const PI_PAGES = SAMPLE_LANGUAGES.map((lang) => ({
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
      // The political-intelligence page is ~60 k lines and the RTL (ar) /
      // CJK (ja) variants are notably slower to layout in chromium under
      // CI load. Match the horizon-nav budget rather than raising the
      // global default (which would mask genuinely hung tests).
      test.setTimeout(60_000);
      const response = await page.goto(pagePath);
      expect(response.status()).toBe(200);

      // All `<head>` reads below are independent of each other — run them
      // in parallel so cumulative auto-wait latency on heavy pages does
      // not compound into a test-timeout.
      const [
        htmlLang,
        primaryLocale,
        altLocales,
        lightTheme,
        darkTheme,
        hreflangs,
        robots,
        keywords,
      ] = await Promise.all([
        page.locator('html').getAttribute('lang'),
        page.locator('meta[property="og:locale"]').first().getAttribute('content'),
        page.locator('meta[property="og:locale:alternate"]').count(),
        page.locator('meta[name="theme-color"][media*="light"]').count(),
        page.locator('meta[name="theme-color"][media*="dark"]').count(),
        page.locator('link[rel="alternate"][hreflang]').count(),
        page.locator('meta[name="robots"]').first().getAttribute('content'),
        page.locator('meta[name="keywords"]').first().getAttribute('content'),
      ]);

      // html lang
      expect(htmlLang).toBe(lang);

      // og:locale — exactly one, BCP-47 mapped
      expect(primaryLocale).toBe(getOgLocale(lang));
      expect(altLocales, `${lang} should have 13 og:locale:alternate`).toBe(13);

      // theme-color light + dark
      expect(lightTheme, `${lang} missing light theme-color`).toBe(1);
      expect(darkTheme, `${lang} missing dark theme-color`).toBe(1);

      // hreflang graph — 14 languages + 1 x-default = 15
      expect(hreflangs, `${lang} hreflang graph must be 15 links`).toBe(15);

      // robots crawler hints
      expect(robots).toContain('index');
      expect(robots).toContain('follow');
      expect(robots).toMatch(/max-snippet:-1/);
      expect(robots).toMatch(/max-image-preview:large/);

      // keywords localization — non-en must differ from en baseline
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
