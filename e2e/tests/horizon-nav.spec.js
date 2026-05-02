// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Horizon navigation E2E tests — political-intelligence index × 6 new horizons
 *
 * For every political-intelligence page (14 languages — canonical English +
 * 13 localized variants) this suite asserts that:
 *
 *   1. The page loads successfully (HTTP 200)
 *   2. A run card whose slug badge contains "<slug>-test" is present for each
 *      of the 6 new horizons (quarter-ahead, quarter-in-review, year-ahead,
 *      year-in-review, term-outlook, election-cycle)
 *   3. The run card's title text matches the language-specific title from
 *      `RUN_TYPE_TITLES` in `political-intelligence-descriptions.ts`
 *      (resolved via `getRunTypeInfo` from the compiled scripts/ dir)
 *   4. The run card's link element has a non-empty href (i.e. it is
 *      "clickable" — points to the GitHub tree URL for the fixture run)
 *
 * The 6 new horizon analysis stubs live in
 *   `analysis/daily/2026-01-15/<slug>-test/`
 * and were picked up by `npm run generate-sitemap` to regenerate all 15
 * political-intelligence HTML files.  This test ensures that linkage
 * doesn't regress if the registry, generator, or HTML templates drift.
 *
 * Test count: 14 languages × 6 horizons = 84 parameterised cases
 * (plus 14 page-load smoke tests = 98 total).
 */

import { test, expect } from '@playwright/test';
import { getRunTypeInfo } from '../../scripts/generators/political-intelligence-descriptions.js';

// ─── PI page variants ────────────────────────────────────────────────────────
/** Map from language code → local URL path of the PI page. */
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

// ─── New horizons under test ─────────────────────────────────────────────────
/**
 * Each entry identifies one of the 6 new analysis horizons.
 * `runSlug` is the directory name used in analysis/daily/2026-01-15/ — the
 * PI page renders it in a `<code>` badge inside `.pi-run__slug`.
 */
const NEW_HORIZONS = [
  { articleType: 'quarter-ahead',     runSlug: 'quarter-ahead-test' },
  { articleType: 'quarter-in-review', runSlug: 'quarter-in-review-test' },
  { articleType: 'year-ahead',        runSlug: 'year-ahead-test' },
  { articleType: 'year-in-review',    runSlug: 'year-in-review-test' },
  { articleType: 'term-outlook',      runSlug: 'term-outlook-test' },
  { articleType: 'election-cycle',    runSlug: 'election-cycle-test' },
];

// ─── Smoke tests: every PI page loads ────────────────────────────────────────
test.describe('Political-Intelligence page load — all 14 languages', () => {
  for (const { lang, path: pagePath } of PI_PAGES) {
    test(`${lang}: page loads (HTTP 200) and has main content`, async ({ page }) => {
      const response = await page.goto(pagePath);
      expect(response?.status(), `${pagePath} should return HTTP 200`).toBe(200);

      // Main heading must be visible
      const heading = page.locator('#pi-heading');
      await expect(heading, 'PI heading should be visible').toBeVisible();
    });
  }
});

// ─── Parameterised horizon × language navigation tests ───────────────────────
for (const { lang, path: pagePath } of PI_PAGES) {
  test.describe(`PI horizon nav — ${lang} (${pagePath})`, () => {
    for (const { articleType, runSlug } of NEW_HORIZONS) {
      test(`${articleType}: run card present with localized title`, async ({ page }) => {
        await page.goto(pagePath);

        // Resolve expected localized title via the same function the generator uses
        const { title: expectedTitle } = getRunTypeInfo(runSlug, lang);

        // ── 1. Slug badge is present ──────────────────────────────────────────
        // The pi-run__slug <code> element contains the literal run directory name
        const slugBadge = page.locator(`.pi-run__slug code`, { hasText: runSlug });
        await expect(slugBadge, `slug badge "${runSlug}" should be present`).toBeVisible();

        // ── 2. Title matches the localized run-type title ─────────────────────
        // Walk up from slug badge → .pi-run__meta → .pi-run__body → .pi-run__title
        // Playwright can't do `.closest()`, so we locate the run card directly
        // by finding the parent li.pi-run that contains the slug badge.
        const runCard = page.locator('li.pi-run', { has: page.locator(`.pi-run__slug code`, { hasText: runSlug }) });
        await expect(runCard, `run card for "${runSlug}" should be present`).toBeVisible();

        // The title element may contain an inner <span> for the run-id badge;
        // use `locator.textContent()` which concatenates all descendant text.
        const titleEl = runCard.locator('.pi-run__title');
        const titleText = (await titleEl.textContent()) ?? '';

        expect(
          titleText,
          `pi-run__title for "${runSlug}" on ${pagePath} should contain "${expectedTitle}"`
        ).toContain(expectedTitle);

        // ── 3. Link is clickable (has a non-empty href) ───────────────────────
        const runLink = runCard.locator('a.pi-run__link');
        const href = await runLink.getAttribute('href');
        expect(href, `pi-run__link for "${runSlug}" should have an href`).toBeTruthy();
        // Link must point at the expected GitHub tree URL for the analysis stub
        expect(href, 'link should reference the analysis stub on GitHub').toContain(
          `analysis/daily/2026-01-15/${runSlug}`
        );
      });
    }
  });
}
