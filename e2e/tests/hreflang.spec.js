// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';
import { SAMPLE_LANGUAGES } from './_sample-languages.js';
import { getPoliticalIntelligenceFilename } from '../../scripts/generators/political-intelligence.js';

/**
 * Hreflang E2E Tests
 *
 * Validates that every language variant of the political-intelligence page
 * includes a complete hreflang link graph for all 14 languages plus
 * x-default, ensuring search engines can discover all language variants.
 *
 * Per-page hreflang-graph + axe checks iterate a representative sample
 * (see `_sample-languages.js`). A cumulative HTTP-200 smoke still walks
 * all 14 PI URLs to guard against any language variant going missing
 * from the deployed corpus.
 */

const ALL_PI_PAGES = ALL_LANGUAGES.map((lang) => ({
  lang,
  path: `/${getPoliticalIntelligenceFilename(lang)}`,
}));

const SAMPLED_PI_PAGES = SAMPLE_LANGUAGES.map((lang) => ({
  lang,
  path: `/${getPoliticalIntelligenceFilename(lang)}`,
}));

function toPathname(href) {
  return new URL(href, 'http://localhost:8080').pathname;
}

test.describe('Hreflang Link Graph', () => {
  test('all political-intelligence hreflang targets resolve', async ({ page }) => {
    test.setTimeout(60_000);
    for (const { lang, path } of ALL_PI_PAGES) {
      const response = await page.goto(path);
      expect(response.status(), `${lang} hreflang target ${path} returned ${response.status()}`).toBe(200);
    }
  });

  for (const { lang, path: pagePath } of SAMPLED_PI_PAGES) {
    test(`${lang}: page has full 14-language hreflang set + x-default`, async ({ page }) => {
      const response = await page.goto(pagePath);

      // A missing page is a regression — fail, don't skip
      expect(response.status(), `${pagePath} returned ${response.status()}`).toBe(200);

      // Collect all hreflang link elements
      const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
      const alternates = await hreflangLinks.evaluateAll((links) =>
        links.map((link) => ({
          hreflang: link.getAttribute('hreflang'),
          href: link.getAttribute('href'),
        })),
      );

      // Should have 14 languages + x-default = 15 total
      expect(alternates, `${lang} page: expected 15 hreflang links (14 langs + x-default)`).toHaveLength(15);

      // Extract all hreflang values
      const hreflangs = alternates.map((link) => link.hreflang);

      // Verify x-default is present
      expect(hreflangs, `${lang} page: missing x-default hreflang`).toContain('x-default');

      // Verify all 14 languages are represented
      for (const expectedLang of ALL_LANGUAGES) {
        expect(hreflangs, `${lang} page: missing hreflang for '${expectedLang}'`).toContain(expectedLang);
      }

      for (const expectedLang of ALL_LANGUAGES) {
        const expectedPath = `/${getPoliticalIntelligenceFilename(expectedLang)}`;
        const alternate = alternates.find((link) => link.hreflang === expectedLang);
        expect(alternate?.href, `${lang} page: hreflang '${expectedLang}' has empty href`).toBeTruthy();
        expect(toPathname(alternate.href), `${lang} page: hreflang '${expectedLang}' has wrong target`).toBe(
          expectedPath,
        );
      }

      const defaultAlternate = alternates.find((link) => link.hreflang === 'x-default');
      expect(defaultAlternate?.href, `${lang} page: x-default has empty href`).toBeTruthy();
      expect(toPathname(defaultAlternate.href), `${lang} page: x-default has wrong target`).toBe(
        '/political-intelligence.html',
      );
    });

    // NOTE: Per-locale WCAG axe scans on PI pages live in `horizon-nav.spec.js`
    // (the canonical PI page suite). Re-scanning the same PI page here added
    // ~50 s per sampled locale × 3 retries and exhausted CI timeouts in
    // run #26050940168 without producing extra signal.
  }
});
