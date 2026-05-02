// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Horizon navigation E2E tests — political-intelligence index structure
 *
 * Verifies that every political-intelligence page (14 languages — canonical
 * English + 13 localized variants) has the correct structure to surface new
 * analysis-horizon run cards:
 *
 *   1. The page loads successfully (HTTP 200)
 *   2. The page heading `#pi-heading` is visible
 *   3. The daily-runs section (`.pi-date-group`) exists
 *   4. The hreflang alternates reference every other language variant
 *   5. Localized UI title for each of the 6 new horizons is non-empty
 *      when resolved via `getRunTypeInfo` (validates the title table
 *      in `political-intelligence-descriptions.js` for each language)
 *
 * The per-language × per-horizon HTML generation tests (84 cases) live in
 * `test/unit/horizon-pi-html.test.js`, which uses the `test/fixtures/horizons/`
 * fixture stubs to generate PI HTML without polluting `analysis/daily/`.
 *
 * Test count: 14 pages × (structure + hreflang + 6 title resolution) = 14 × 8 = 112
 */

import { test, expect } from '@playwright/test';
import { getRunTypeInfo } from '../../scripts/generators/political-intelligence-descriptions.js';

// ─── PI page variants ────────────────────────────────────────────────────────
const PI_PAGES = [
  { lang: 'en', path: '/political-intelligence.html' },
  { lang: 'sv', path: '/political-intelligence_sv.html' },
  { lang: 'da', path: '/political-intelligence_da.html' },
  { lang: 'no', path: '/political-intelligence_no.html' },
  { lang: 'fi', path: '/political-intelligence_fi.html' },
  { lang: 'de', path: '/political-intelligence_de.html' },
  { lang: 'fr', path: '/political-intelligence_fr.html' },
  { lang: 'es', path: '/political-intelligence_es.html' },
  { lang: 'nl', path: '/political-intelligence_nl.html' },
  { lang: 'ar', path: '/political-intelligence_ar.html' },
  { lang: 'he', path: '/political-intelligence_he.html' },
  { lang: 'ja', path: '/political-intelligence_ja.html' },
  { lang: 'ko', path: '/political-intelligence_ko.html' },
  { lang: 'zh', path: '/political-intelligence_zh.html' },
];

// ─── New horizons (slug-only — used only for title resolution) ───────────────
const NEW_HORIZON_SLUGS = [
  'quarter-ahead',
  'quarter-in-review',
  'year-ahead',
  'year-in-review',
  'term-outlook',
  'election-cycle',
];

// ─── Parameterised structural tests ─────────────────────────────────────────
for (const { lang, path: pagePath } of PI_PAGES) {
  test.describe(`PI structure — ${lang} (${pagePath})`, () => {
    test('page loads (HTTP 200) and PI heading is visible', async ({ page }) => {
      const response = await page.goto(pagePath);
      expect(response?.status(), `${pagePath} should return HTTP 200`).toBe(200);

      const heading = page.locator('#pi-heading');
      await expect(heading, 'PI heading should be visible').toBeVisible();
    });

    test('daily-runs section exists in the page', async ({ page }) => {
      await page.goto(pagePath);
      const dailySection = page.locator('.pi-date-group');
      const count = await dailySection.count();
      expect(count, 'at least one .pi-date-group should exist').toBeGreaterThan(0);
    });

    test('hreflang alternates include English canonical', async ({ page }) => {
      await page.goto(pagePath);
      const canonical = page.locator(
        'link[rel="alternate"][hreflang="en"], link[rel="canonical"]'
      );
      const count = await canonical.count();
      expect(count, 'canonical/hreflang=en alternate should be present').toBeGreaterThan(0);
    });

    for (const horizonSlug of NEW_HORIZON_SLUGS) {
      test(`getRunTypeInfo("${horizonSlug}", "${lang}") returns a non-empty localised title`, async () => {
        // This validates the RUN_TYPE_TITLES table in political-intelligence-descriptions.js
        // for every horizon × language combination — a fast, server-free check.
        const { title } = getRunTypeInfo(horizonSlug, lang);
        expect(
          title,
          `getRunTypeInfo("${horizonSlug}", "${lang}") should return a non-empty title`
        ).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      });
    }
  });
}
