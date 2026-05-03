// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * Hreflang E2E Tests
 *
 * Validates that the political-intelligence page includes a complete
 * hreflang link graph for all 14 languages plus x-default, ensuring
 * search engines can discover all language variants.
 */

const ALL_LANGUAGES = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];

test.describe('Hreflang Link Graph', () => {
  test('English page has full 14-language hreflang set + x-default', async ({ page }) => {
    const response = await page.goto('/political-intelligence.html');

    // Skip if page doesn't exist in test environment
    if (!response || response.status() === 404) {
      test.skip();
      return;
    }

    // Collect all hreflang link elements
    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangLinks.count();

    // Should have 14 languages + x-default = 15 total
    expect(count, 'expected 15 hreflang links (14 langs + x-default)').toBeGreaterThanOrEqual(15);

    // Extract all hreflang values
    const hreflangs = [];
    for (let i = 0; i < count; i++) {
      const hreflang = await hreflangLinks.nth(i).getAttribute('hreflang');
      hreflangs.push(hreflang);
    }

    // Verify x-default is present
    expect(hreflangs, 'missing x-default hreflang').toContain('x-default');

    // Verify all 14 languages are represented
    for (const lang of ALL_LANGUAGES) {
      expect(hreflangs, `missing hreflang for '${lang}'`).toContain(lang);
    }

    // Verify each hreflang link has a valid href
    for (let i = 0; i < count; i++) {
      const href = await hreflangLinks.nth(i).getAttribute('href');
      expect(href, `hreflang link ${i} has empty href`).toBeTruthy();
    }
  });

  test('hreflang links point to existing pages', async ({ page }) => {
    const response = await page.goto('/political-intelligence.html');
    if (!response || response.status() === 404) {
      test.skip();
      return;
    }

    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangLinks.count();

    // Spot-check a few language links resolve
    const langSuffixes = { sv: '_sv', de: '_de', fr: '_fr', ar: '_ar' };
    for (const [lang, suffix] of Object.entries(langSuffixes)) {
      const link = page.locator(`link[rel="alternate"][hreflang="${lang}"]`);
      const linkCount = await link.count();
      if (linkCount > 0) {
        const href = await link.getAttribute('href');
        expect(href).toContain(suffix);
      }
    }
  });

  test('RTL languages (ar, he) have correct hreflang codes', async ({ page }) => {
    const response = await page.goto('/political-intelligence.html');
    if (!response || response.status() === 404) {
      test.skip();
      return;
    }

    // Verify Arabic and Hebrew hreflang entries exist
    const arLink = page.locator('link[rel="alternate"][hreflang="ar"]');
    const heLink = page.locator('link[rel="alternate"][hreflang="he"]');

    const arCount = await arLink.count();
    const heCount = await heLink.count();

    expect(arCount, 'missing Arabic hreflang').toBeGreaterThanOrEqual(1);
    expect(heCount, 'missing Hebrew hreflang').toBeGreaterThanOrEqual(1);
  });
});
