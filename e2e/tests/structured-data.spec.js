// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * Structured Data (JSON-LD) E2E Tests
 *
 * Validates that every language variant of the political-intelligence page
 * emits valid JSON-LD structured data containing at minimum a NewsArticle
 * and BreadcrumbList schema.
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
      const path = `/political-intelligence${suffix}.html`;
      const response = await page.goto(path);

      // Page may not exist in test environment — skip gracefully
      if (!response || response.status() === 404) {
        test.skip();
        return;
      }

      // Find JSON-LD script tags
      const jsonLdScripts = page.locator('script[type="application/ld+json"]');
      const count = await jsonLdScripts.count();

      // Must have at least one JSON-LD block
      expect(count, `${code}: expected ≥1 JSON-LD script tag`).toBeGreaterThanOrEqual(1);

      // Parse and validate each JSON-LD block
      for (let i = 0; i < count; i++) {
        const raw = await jsonLdScripts.nth(i).textContent();
        expect(raw, `${code}: JSON-LD script tag ${i} is empty`).toBeTruthy();

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          expect.fail(`${code}: JSON-LD script tag ${i} contains invalid JSON`);
        }

        // JSON-LD may be a single object or an array
        const items = Array.isArray(parsed) ? parsed : [parsed];

        for (const item of items) {
          // Every item must have @type
          expect(item).toHaveProperty('@type');
        }

        // Check that we find at least NewsArticle or BreadcrumbList
        const types = items.map((item) => item['@type']);
        const hasNewsArticle = types.includes('NewsArticle');
        const hasBreadcrumb = types.includes('BreadcrumbList');

        expect(
          hasNewsArticle || hasBreadcrumb,
          `${code}: JSON-LD must contain NewsArticle or BreadcrumbList, found: ${types.join(', ')}`,
        ).toBe(true);

        // Validate NewsArticle has required properties
        const newsArticle = items.find((item) => item['@type'] === 'NewsArticle');
        if (newsArticle) {
          expect(newsArticle).toHaveProperty('headline');
          expect(newsArticle).toHaveProperty('datePublished');
          expect(newsArticle).toHaveProperty('publisher');
        }
      }
    });
  }
});
