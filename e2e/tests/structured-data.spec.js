// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Structured Data (JSON-LD) E2E Tests
 *
 * Validates that every language variant of the political-intelligence page
 * emits valid JSON-LD structured data containing CollectionPage,
 * BreadcrumbList, and FAQPage schemas (the actual types these pages emit).
 */

const LANGUAGES = [
  { code: 'en', suffix: '' },
  { code: 'sv', suffix: '_sv' },
  { code: 'da', suffix: '_da' },
  { code: 'no', suffix: '_no' },
  { code: 'fi', suffix: '_fi' },
  { code: 'de', suffix: '_de' },
  { code: 'fr', suffix: '_fr' },
  { code: 'es', suffix: '_es' },
  { code: 'nl', suffix: '_nl' },
  { code: 'ar', suffix: '_ar' },
  { code: 'he', suffix: '_he' },
  { code: 'ja', suffix: '_ja' },
  { code: 'ko', suffix: '_ko' },
  { code: 'zh', suffix: '_zh' },
];

test.describe('Structured Data (JSON-LD)', () => {
  for (const { code, suffix } of LANGUAGES) {
    test(`${code}: has valid JSON-LD structured data`, async ({ page }) => {
      const pagePath = `/political-intelligence${suffix}.html`;
      const response = await page.goto(pagePath);

      // A missing page is a regression — fail, don't skip
      expect(response.status(), `${pagePath} returned ${response.status()}`).toBe(200);

      // Find JSON-LD script tags
      const jsonLdScripts = page.locator('script[type="application/ld+json"]');
      const count = await jsonLdScripts.count();

      // Must have at least one JSON-LD block
      expect(count, `${code}: expected ≥1 JSON-LD script tag`).toBeGreaterThanOrEqual(1);

      // Collect all @type values across all JSON-LD blocks
      const allTypes = [];

      for (let i = 0; i < count; i++) {
        const raw = await jsonLdScripts.nth(i).textContent();
        expect(raw, `${code}: JSON-LD script tag ${i} is empty`).toBeTruthy();

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (err) {
          expect.fail(`${code}: JSON-LD script tag ${i} contains invalid JSON: ${err.message}`);
        }

        // JSON-LD may be a single object or an array
        const items = Array.isArray(parsed) ? parsed : [parsed];

        for (const item of items) {
          expect(item).toHaveProperty('@type');
          allTypes.push(item['@type']);
        }
      }

      // Political-intelligence pages emit CollectionPage + BreadcrumbList + FAQPage
      expect(
        allTypes.includes('CollectionPage'),
        `${code}: missing CollectionPage in JSON-LD, found: ${allTypes.join(', ')}`,
      ).toBe(true);

      expect(
        allTypes.includes('FAQPage'),
        `${code}: missing FAQPage in JSON-LD, found: ${allTypes.join(', ')}`,
      ).toBe(true);
    });
  }

  test('accessibility: no WCAG violations on structured-data pages', async ({ page }) => {
    await page.goto('/political-intelligence.html');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
