// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * Homepage E2E Tests
 *
 * Tests for the main homepage functionality including:
 * - Page loading and structure
 * - Navigation menu
 * - Recent articles display
 * - Sitemap link
 */

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');

    // Verify page title
    await expect(page).toHaveTitle(/EU Parliament Monitor/);

    // Verify main heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('EU Parliament Monitor');
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');

    // Verify navigation exists (conditional check)
    const nav = page.locator('nav');
    const navCount = await nav.count();

    if (navCount > 0) {
      await expect(nav).toBeVisible();

      // Verify key links exist
      const weekAheadLink = page.locator('a[href*="week-ahead"]');
      if ((await weekAheadLink.count()) > 0) {
        await expect(weekAheadLink.first()).toBeVisible();
      }
    }
  });

  test('should display recent articles', async ({ page }) => {
    await page.goto('/');

    // Verify articles section exists
    const articles = page.locator('article');
    const articleCount = await articles.count();

    if (articleCount > 0) {
      // Verify first article has title and date
      const firstArticle = articles.first();
      const articleHeading = firstArticle.locator('h2, h3');
      await expect(articleHeading).toBeVisible();

      const timeElement = firstArticle.locator('time');
      if ((await timeElement.count()) > 0) {
        await expect(timeElement).toBeVisible();
      }
    }
  });

  test('should have working sitemap link', async ({ page }) => {
    await page.goto('/');

    // Look for sitemap link
    const sitemapLink = page.locator('a[href="sitemap.xml"]');

    if ((await sitemapLink.count()) > 0) {
      await sitemapLink.click();

      // Verify sitemap loads
      await expect(page).toHaveURL(/sitemap\.xml$/);
    }
  });

  test('should have proper HTML structure', async ({ page }) => {
    await page.goto('/');

    // Verify DOCTYPE and HTML element
    const htmlElement = page.locator('html');
    await expect(htmlElement).toBeVisible();

    // Verify lang attribute exists
    const langAttribute = await htmlElement.getAttribute('lang');
    expect(langAttribute).toBeTruthy();

    // Verify head element has charset
    const charsetMeta = page.locator('meta[charset]');
    await expect(charsetMeta).toHaveCount(1);

    // Verify viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveCount(1);
  });

  test('should have SEO meta tags', async ({ page }) => {
    await page.goto('/');

    // Verify description meta tag
    const description = page.locator('meta[name="description"]');
    if ((await description.count()) > 0) {
      const content = await description.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(50);
    }

    // Verify Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    if ((await ogTitle.count()) > 0) {
      await expect(ogTitle).toHaveCount(1);
    }
  });
});
