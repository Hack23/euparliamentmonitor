// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Hreflang E2E Tests
 *
 * Validates that every language variant of the political-intelligence page
 * includes a complete hreflang link graph for all 14 languages plus
 * x-default, ensuring search engines can discover all language variants.
 */

const ALL_LANGUAGES = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];

const LANG_SUFFIXES = {
  en: '',
  sv: '_sv',
  da: '_da',
  no: '_no',
  fi: '_fi',
  de: '_de',
  fr: '_fr',
  es: '_es',
  nl: '_nl',
  ar: '_ar',
  he: '_he',
  ja: '_ja',
  ko: '_ko',
  zh: '_zh',
};

test.describe('Hreflang Link Graph', () => {
  for (const lang of ALL_LANGUAGES) {
    test(`${lang}: page has full 14-language hreflang set + x-default`, async ({ page }) => {
      const suffix = LANG_SUFFIXES[lang];
      const pagePath = `/political-intelligence${suffix}.html`;
      const response = await page.goto(pagePath);

      // A missing page is a regression — fail, don't skip
      expect(response.status(), `${pagePath} returned ${response.status()}`).toBe(200);

      // Collect all hreflang link elements
      const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
      const count = await hreflangLinks.count();

      // Should have 14 languages + x-default = 15 total
      expect(count, `${lang} page: expected 15 hreflang links (14 langs + x-default)`).toBeGreaterThanOrEqual(15);

      // Extract all hreflang values
      const hreflangs = [];
      for (let i = 0; i < count; i++) {
        const hreflang = await hreflangLinks.nth(i).getAttribute('hreflang');
        hreflangs.push(hreflang);
      }

      // Verify x-default is present
      expect(hreflangs, `${lang} page: missing x-default hreflang`).toContain('x-default');

      // Verify all 14 languages are represented
      for (const expectedLang of ALL_LANGUAGES) {
        expect(hreflangs, `${lang} page: missing hreflang for '${expectedLang}'`).toContain(expectedLang);
      }

      // Verify each hreflang link has a non-empty href
      for (let i = 0; i < count; i++) {
        const href = await hreflangLinks.nth(i).getAttribute('href');
        expect(href, `${lang} page: hreflang link ${i} has empty href`).toBeTruthy();
      }
    });
  }

  test('hreflang links point to accessible pages', async ({ page }) => {
    const response = await page.goto('/political-intelligence.html');
    expect(response.status()).toBe(200);

    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangLinks.count();

    // Navigate to each alternate link and verify it loads (200)
    for (let i = 0; i < count; i++) {
      const hreflang = await hreflangLinks.nth(i).getAttribute('hreflang');
      const href = await hreflangLinks.nth(i).getAttribute('href');

      if (hreflang === 'x-default') continue;

      // Extract relative path from href (may be absolute URL)
      let relativePath = href;
      if (href.startsWith('http')) {
        const url = new URL(href);
        relativePath = url.pathname;
      }

      const altResponse = await page.goto(relativePath);
      expect(
        altResponse.status(),
        `hreflang '${hreflang}' points to ${relativePath} which returned ${altResponse.status()}`,
      ).toBe(200);
    }
  });

  test('accessibility: no WCAG violations on hreflang pages', async ({ page }) => {
    await page.goto('/political-intelligence.html');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
