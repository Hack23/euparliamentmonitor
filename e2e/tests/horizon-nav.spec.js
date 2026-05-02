// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Horizon navigation E2E tests — political-intelligence index structure
 *
 * Verifies that every political-intelligence page (14 languages — canonical
 * English + 13 localized variants) has the correct structure to surface
 * analysis-horizon run cards:
 *
 *   1. The page loads successfully (HTTP 200) and `#pi-heading` is visible
 *   2. The daily-runs section (`.pi-date-group`) exists
 *   3. All 14 hreflang alternates are present in the `<head>`
 *   4. The page passes an axe-core WCAG 2.1 AA accessibility scan
 *   5. Every run-card slug rendered on the page resolves to a non-empty
 *      localised title via `getRunTypeInfo` (guards against title lookup
 *      regressions for any horizon type rendered in the PI index)
 *
 * Per-language × per-horizon HTML generation coverage (84 cases) lives in
 * `test/unit/horizon-pi-html.test.js`, which builds a temp analysis tree
 * from `test/fixtures/horizons/` without polluting `analysis/daily/`.
 *
 * Test count: 14 pages × 5 tests = 70
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';
import { getRunTypeInfo } from '../../scripts/generators/political-intelligence-descriptions.js';

// ─── PI page variants (derived from shared ALL_LANGUAGES constant) ────────────
const PI_PAGES = ALL_LANGUAGES.map((lang) => ({
  lang,
  path: lang === 'en' ? '/political-intelligence.html' : `/political-intelligence_${lang}.html`,
}));

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

    test('hreflang alternates cover all 14 language variants', async ({ page }) => {
      await page.goto(pagePath);
      // Every PI page must emit one hreflang alternate for each supported language.
      // A regression that drops alternates would break search-engine language routing.
      for (const code of ALL_LANGUAGES) {
        const link = page.locator(`link[rel="alternate"][hreflang="${code}"]`);
        await expect(
          link,
          `hreflang="${code}" alternate must be present in ${pagePath}`
        ).toHaveCount(1);
      }
    });

    test('passes WCAG 2.1 AA accessibility scan', async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      if (results.violations.length > 0) {
        console.log(
          `[${lang}] Accessibility violations on ${pagePath}:`,
          JSON.stringify(results.violations, null, 2)
        );
      }
      expect(results.violations).toEqual([]);
    });

    test('all rendered run-card slugs resolve to a localised title', async ({ page }) => {
      await page.goto(pagePath);

      // Collect every <code> text inside a .pi-run__slug badge that is actually
      // rendered in the page (guards against PI rendering breaking entirely AND
      // against title lookup regressions for any rendered horizon type).
      const slugElements = page.locator('.pi-run__slug code');
      const count = await slugElements.count();
      expect(count, 'at least one run-card slug should be rendered on the page').toBeGreaterThan(0);

      const slugs = await slugElements.allTextContents();
      for (const slug of slugs) {
        const trimmed = slug.trim();
        const { title } = getRunTypeInfo(trimmed, lang);
        expect(
          title,
          `run slug "${trimmed}" must resolve to a non-empty localised title for lang="${lang}"`
        ).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      }
    });
  });
}
