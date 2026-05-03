// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';
import { getPoliticalIntelligenceFilename } from '../../scripts/generators/political-intelligence.js';

/**
 * Structured Data (JSON-LD) E2E Tests
 *
 * Validates that every language variant of the political-intelligence page
 * emits valid JSON-LD structured data containing CollectionPage,
 * BreadcrumbList, and FAQPage schemas (the actual types these pages emit).
 */

const PI_PAGES = ALL_LANGUAGES.map((lang) => ({
  lang,
  path: `/${getPoliticalIntelligenceFilename(lang)}`,
}));

function collectJsonLdTypes(value, types = []) {
  if (!value || typeof value !== 'object') return types;

  if (Object.prototype.hasOwnProperty.call(value, '@type')) {
    const typeValue = value['@type'];
    if (Array.isArray(typeValue)) {
      types.push(...typeValue);
    } else {
      types.push(typeValue);
    }
  }

  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') {
      collectJsonLdTypes(child, types);
    }
  }

  return types;
}

test.describe('Structured Data (JSON-LD)', () => {
  for (const { lang, path: pagePath } of PI_PAGES) {
    test(`${lang}: has valid JSON-LD structured data`, async ({ page }) => {
      const response = await page.goto(pagePath);

      // A missing page is a regression — fail, don't skip
      expect(response.status(), `${pagePath} returned ${response.status()}`).toBe(200);

      // Find JSON-LD script tags
      const jsonLdScripts = page.locator('script[type="application/ld+json"]');
      const count = await jsonLdScripts.count();

      // Must have at least one JSON-LD block
      expect(count, `${lang}: expected ≥1 JSON-LD script tag`).toBeGreaterThanOrEqual(1);

      // Collect all @type values across all JSON-LD blocks
      const allTypes = [];

      for (let i = 0; i < count; i++) {
        const raw = await jsonLdScripts.nth(i).textContent();
        expect(raw, `${lang}: JSON-LD script tag ${i} is empty`).toBeTruthy();

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (err) {
          expect.fail(`${lang}: JSON-LD script tag ${i} contains invalid JSON: ${err.message}`);
        }

        // JSON-LD may be a single object or an array
        const items = Array.isArray(parsed) ? parsed : [parsed];

        for (const item of items) {
          expect(item).toHaveProperty('@type');
          collectJsonLdTypes(item, allTypes);
        }
      }

      // Political-intelligence pages emit CollectionPage + BreadcrumbList + FAQPage
      expect(
        allTypes.includes('CollectionPage'),
        `${lang}: missing CollectionPage in JSON-LD, found: ${allTypes.join(', ')}`,
      ).toBe(true);

      expect(
        allTypes.includes('BreadcrumbList'),
        `${lang}: missing BreadcrumbList in JSON-LD, found: ${allTypes.join(', ')}`,
      ).toBe(true);

      expect(
        allTypes.includes('FAQPage'),
        `${lang}: missing FAQPage in JSON-LD, found: ${allTypes.join(', ')}`,
      ).toBe(true);
    });

    test(`${lang}: accessibility has no WCAG violations`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
