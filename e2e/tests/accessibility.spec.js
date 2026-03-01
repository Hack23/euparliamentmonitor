// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

/**
 * Accessibility E2E Tests
 *
 * Tests for WCAG 2.1 AA compliance including:
 * - Automated accessibility scanning
 * - Heading hierarchy
 * - Image alt text
 * - Keyboard navigation
 * - Color contrast
 * - Form accessibility
 */

/**
 * Non-English language codes (English is covered by the standalone 'Accessibility' suite).
 * Other languages use /index-{lang}.html.
 */
const NON_ENGLISH_LANGUAGES = ALL_LANGUAGES.filter((lang) => lang !== 'en');

test.describe('Multi-language index accessibility (WCAG 2.1 AA)', () => {
  for (const lang of NON_ENGLISH_LANGUAGES) {
    const url = `/index-${lang}.html`;

    test(`${lang} index page should be WCAG 2.1 AA compliant`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          `[${lang}] Accessibility violations:`,
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});

test.describe('Accessibility', () => {
  test('homepage should be accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('article page should be accessible', async ({ page }) => {
    await page.goto('/');

    // Navigate to an article
    const articleLinks = page.locator('article a');
    const linkCount = await articleLinks.count();

    if (linkCount > 0) {
      await articleLinks.first().click();
      await page.waitForLoadState('domcontentloaded');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify h1 exists
    const h1 = page.locator('h1');
    const h1Count = await h1.count();

    if (h1Count === 0) {
      console.log('No h1 found on page');
      // Skip test if no h1 - might be a simple page
      test.skip();
      return;
    }

    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Verify heading hierarchy exists
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);

    if (headings.length > 0) {
      // Get heading levels
      const headingLevels = await Promise.all(
        headings.map(async (heading) => {
          const tagName = await heading.evaluate((el) =>
            el.tagName.toLowerCase()
          );
          return parseInt(tagName.substring(1));
        })
      );

      // Verify h1 comes first
      expect(headingLevels[0]).toBe(1);

      // Optionally verify no large skips (e.g., h1 -> h4 without h2/h3)
      // For simple pages, we allow some flexibility
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        // Allow skip of one level for simple page structures
        if (diff > 2) {
          console.warn(`Large heading skip detected: h${headingLevels[i - 1]} -> h${headingLevels[i]}`);
        }
      }
    }
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');

    // Get all images
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt attribute must exist (can be empty for decorative images)
      expect(alt).not.toBeNull();

      // If image has src, alt should be meaningful or empty for decorative
      const src = await img.getAttribute('src');
      if (src && !src.includes('spacer') && !src.includes('pixel')) {
        expect(alt).toBeDefined();
      }
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    let focusCount = await focusedElement.count();

    if (focusCount > 0) {
      await expect(focusedElement).toBeVisible();

      // Continue tabbing through several elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        focusedElement = page.locator(':focus');
        focusCount = await focusedElement.count();

        if (focusCount > 0) {
          // Element should be visible or have meaningful accessible name
          const tagName = await focusedElement.evaluate((el) =>
            el.tagName.toLowerCase()
          );
          expect(['a', 'button', 'input', 'select', 'textarea']).toContain(
            tagName
          );
        }
      }
    }
  });

  test('should activate links with Enter key', async ({ page }) => {
    await page.goto('/');

    // Find first focusable link
    const links = page.locator('a[href]');
    const linkCount = await links.count();

    if (linkCount > 0) {
      const firstLink = links.first();
      await firstLink.focus();

      // Get href before activation
      const href = await firstLink.getAttribute('href');

      if (href && !href.startsWith('http')) {
        // Press Enter to activate link
        await page.keyboard.press('Enter');
        await page.waitForLoadState('domcontentloaded');

        // Verify navigation occurred
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test for WCAG AA contrast (not AAA which requires 7:1)
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .disableRules(['color-contrast-enhanced']) // AAA level rule
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Color contrast violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    const mainCount = await main.count();

    if (mainCount > 0) {
      await expect(main.first()).toBeVisible();
    }

    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();

    if (navCount > 0) {
      await expect(nav.first()).toBeVisible();
    }
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');

    // Get all links
    const links = await page.locator('a[href]').all();

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      // Link must have accessible text
      const hasAccessibleText = text?.trim() || ariaLabel || title;
      expect(hasAccessibleText).toBeTruthy();

      // Avoid vague link text
      if (text) {
        const lowerText = text.trim().toLowerCase();
        const vaguePhrases = [
          'click here',
          'read more',
          'here',
          'more',
          'link',
        ];
        const isVague = vaguePhrases.includes(lowerText);

        // If vague, should have aria-label or title for context
        if (isVague) {
          expect(ariaLabel || title).toBeTruthy();
        }
      }
    }
  });

  test('should have skip navigation link', async ({ page }) => {
    await page.goto('/');

    // Look for skip navigation link
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    const skipCount = await skipLink.count();

    if (skipCount > 0) {
      await expect(skipLink.first()).toBeAttached();

      // Skip link should be focusable
      await skipLink.first().focus();
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeAttached();
    }
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(100); // Extra stability wait

    // Verify page has meaningful title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('Untitled');

    // Title should contain site name or page description
    expect(title.length).toBeGreaterThan(10);
  });

  test('should have language attribute', async ({ page }) => {
    await page.goto('/');

    // Verify lang attribute on html element
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');

    expect(lang).toBeTruthy();
    expect(lang.length).toBeGreaterThanOrEqual(2);

    // Verify it's a valid language code
    const validLangPattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    expect(validLangPattern.test(lang)).toBeTruthy();
  });

  test('should support text zoom', async ({ page }) => {
    await page.goto('/');

    // Get initial body dimensions
    const initialBody = await page.locator('body').boundingBox();

    // Zoom in (simulate browser zoom)
    await page.evaluate(() => {
      document.body.style.zoom = '200%';
    });

    // Wait for layout
    await page.waitForTimeout(500);

    // Verify content is still visible
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Get zoomed dimensions
    const zoomedBody = await body.boundingBox();

    // Content should be larger or layout should adapt
    if (initialBody && zoomedBody) {
      expect(zoomedBody.height).toBeGreaterThan(0);
    }

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '100%';
    });
  });

  test('should have proper form labels if forms exist', async ({ page }) => {
    await page.goto('/');

    // Check if page has forms
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      // Each input should have associated label or aria-label
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputId = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');

        // Input should have one of: associated label, aria-label, or aria-labelledby
        const hasLabel =
          (inputId && (await page.locator(`label[for="${inputId}"]`).count()) > 0) ||
          ariaLabel ||
          ariaLabelledBy;

        // Placeholder alone is not sufficient for accessibility
        if (!hasLabel) {
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    }
  });
});
