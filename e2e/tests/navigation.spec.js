// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * Navigation E2E Tests
 *
 * Tests for site navigation functionality including:
 * - Internal link navigation
 * - Navigation menu functionality
 * - Breadcrumb navigation
 * - Back button functionality
 */

test.describe('Navigation', () => {
  test('should have functional navigation menu', async ({ page }) => {
    await page.goto('/');

    // Find navigation element
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();

    if (navCount > 0) {
      await expect(nav.first()).toBeVisible();

      // Verify navigation has links
      const navLinks = nav.locator('a');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('should navigate to different sections', async ({ page }) => {
    await page.goto('/');

    // Get all navigation links
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const linkCount = await navLinks.count();

    if (linkCount > 1) {
      // Test first two links
      const firstLink = navLinks.first();
      const firstHref = await firstLink.getAttribute('href');

      if (firstHref && !firstHref.startsWith('http')) {
        await firstLink.click();
        await page.waitForLoadState('domcontentloaded');

        // Verify navigation occurred
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();

        // Verify page loaded successfully
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    }
  });

  test('should maintain navigation state across pages', async ({ page }) => {
    await page.goto('/');

    // Check if navigation exists
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();

    if (navCount > 0) {
      // Navigate to an article
      const articleLinks = page.locator('article a');
      const articleCount = await articleLinks.count();

      if (articleCount > 0) {
        await articleLinks.first().click();
        await page.waitForLoadState('domcontentloaded');

        // Verify navigation still exists
        const navAfter = page.locator('nav, [role="navigation"]');
        await expect(navAfter.first()).toBeVisible();
      }
    }
  });

  test('should have working home link', async ({ page }) => {
    await page.goto('/');

    // Navigate to article first
    const articleLinks = page.locator('article a');
    const articleCount = await articleLinks.count();

    if (articleCount > 0) {
      await articleLinks.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Find home link
      const homeLinks = page.locator(
        'a[href="/"], a[href="index.html"], a[href*="index-"], nav a:first-child'
      );
      const homeCount = await homeLinks.count();

      if (homeCount > 0) {
        await homeLinks.first().click();
        await page.waitForLoadState('domcontentloaded');

        // Verify we're on an index page
        const url = page.url();
        expect(url.endsWith('/') || url.includes('index')).toBeTruthy();
      }
    }
  });

  test('should support browser back button', async ({ page }) => {
    await page.goto('/');
    const startUrl = page.url();

    // Navigate to article
    const articleLinks = page.locator('article a');
    const articleCount = await articleLinks.count();

    if (articleCount > 0) {
      await articleLinks.first().click();
      await page.waitForLoadState('domcontentloaded');

      const articleUrl = page.url();
      expect(articleUrl).not.toBe(startUrl);

      // Use browser back button
      await page.goBack();
      await page.waitForLoadState('domcontentloaded');

      // Verify we're back at start
      const backUrl = page.url();
      expect(backUrl).toBe(startUrl);
    }
  });

  test('should support browser forward button', async ({ page }) => {
    await page.goto('/');

    // Navigate to article
    const articleLinks = page.locator('article a');
    const articleCount = await articleLinks.count();

    if (articleCount > 0) {
      await articleLinks.first().click();
      await page.waitForLoadState('domcontentloaded');
      const articleUrl = page.url();

      // Go back
      await page.goBack();
      await page.waitForLoadState('domcontentloaded');

      // Go forward
      await page.goForward();
      await page.waitForLoadState('domcontentloaded');

      // Verify we're at article again
      const forwardUrl = page.url();
      expect(forwardUrl).toBe(articleUrl);
    }
  });

  test('should have accessible skip links', async ({ page }) => {
    await page.goto('/');

    // Check for skip navigation link
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    const skipCount = await skipLink.count();

    if (skipCount > 0) {
      // Skip link should be in DOM (may be visually hidden)
      await expect(skipLink.first()).toBeAttached();
    }
  });

  test('should have proper link focus states', async ({ page }) => {
    await page.goto('/');

    // Tab to first focusable element
    await page.keyboard.press('Tab');

    // Check that an element has focus
    const focusedElement = page.locator(':focus');
    const focusCount = await focusedElement.count();

    if (focusCount > 0) {
      await expect(focusedElement).toBeVisible();

      // Verify it's a focusable element (link, button, etc.)
      const tagName = await focusedElement.evaluate((el) =>
        el.tagName.toLowerCase()
      );
      expect(['a', 'button', 'input', 'select', 'textarea']).toContain(
        tagName
      );
    }
  });

  test('should have working external links', async ({ page, context }) => {
    await page.goto('/');

    // Find external links
    const externalLinks = page.locator('a[href^="http"]');
    const externalCount = await externalLinks.count();

    if (externalCount > 0) {
      const firstExternal = externalLinks.first();

      // Check if link has target="_blank"
      const target = await firstExternal.getAttribute('target');

      if (target === '_blank') {
        // Verify link has rel="noopener" or rel="noreferrer" for security
        const rel = await firstExternal.getAttribute('rel');
        if (rel) {
          expect(
            rel.includes('noopener') || rel.includes('noreferrer')
          ).toBeTruthy();
        }
      }
    }
  });

  test('should not have broken internal links', async ({ page }) => {
    await page.goto('/');

    // Get all internal links
    const internalLinks = page.locator(
      'a[href^="/"], a[href^="index"], a[href^="news"]'
    );
    const linkCount = await internalLinks.count();

    // Test up to 5 internal links
    const testCount = Math.min(linkCount, 5);

    for (let i = 0; i < testCount; i++) {
      await page.goto('/');

      const link = internalLinks.nth(i);
      const href = await link.getAttribute('href');

      if (href && !href.startsWith('http')) {
        await link.click();
        await page.waitForLoadState('domcontentloaded');

        // Verify no 404 error
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).not.toContain('404');
        expect(bodyText).not.toContain('Not Found');
        expect(bodyText).not.toContain('Page not found');
      }
    }
  });
});
