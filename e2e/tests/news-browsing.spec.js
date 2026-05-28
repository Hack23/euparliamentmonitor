// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';
import fs from 'fs';

/**
 * News Browsing E2E Tests
 *
 * Tests for article browsing functionality including:
 * - Opening and displaying articles
 * - Navigation between pages
 * - Filtering by article type
 * - Pagination
 */

test.describe('News Browsing', () => {
  test('should open and display article', async ({ page }) => {
    await page.goto('/');

    // Find first article link
    const articleLinks = page.locator('article a, .article-link');
    const linkCount = await articleLinks.count();

    if (linkCount > 0) {
      // Click first article
      await articleLinks.first().click();

      // Wait for navigation
      await page.waitForLoadState('domcontentloaded');

      // Verify article page loads
      const articleContent = page.locator('article, .article-content, main');
      await expect(articleContent).toBeVisible();

      // Verify article has heading
      const heading = page.locator('h1, h2');
      await expect(heading.first()).toBeVisible();

      // Verify article metadata exists
      const timeElement = page.locator('time');
      if ((await timeElement.count()) > 0) {
        await expect(timeElement.first()).toBeVisible();
      }
    }
  });

  test('should navigate back to homepage', async ({ page }) => {
    await page.goto('/');
    const initialUrl = page.url();

    // Find and click first article
    const articleLinks = page.locator('article a, .article-link');
    const linkCount = await articleLinks.count();

    if (linkCount > 0) {
      await articleLinks.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Find and click home link
      const homeLinks = page.locator(
        'a[href="/"], a[href="index.html"], a[href*="index-"]'
      );
      const homeCount = await homeLinks.count();

      if (homeCount > 0) {
        await homeLinks.first().click();
        await page.waitForLoadState('domcontentloaded');

        // Verify we're back on an index page
        const currentUrl = page.url();
        expect(
          currentUrl.includes('index') || currentUrl.endsWith('/')
        ).toBeTruthy();
      }
    }
  });

  test('should display article metadata', async ({ page }) => {
    await page.goto('/');

    const articleLinks = page.locator('article a, .article-link');
    const linkCount = await articleLinks.count();

    if (linkCount > 0) {
      await articleLinks.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Check for article metadata elements
      const metadataElements = [
        'time',
        '.article-type',
        '.read-time',
        '.article-date',
        '.publication-date',
      ];

      let foundMetadata = false;
      for (const selector of metadataElements) {
        const element = page.locator(selector);
        if ((await element.count()) > 0) {
          await expect(element.first()).toBeVisible();
          foundMetadata = true;
        }
      }

      // At least one metadata element should exist
      if (linkCount > 0) {
        expect(foundMetadata).toBeTruthy();
      }
    }
  });

  test('should have working internal links', async ({ page }) => {
    await page.goto('/');

    // Get all internal links
    const internalLinks = page.locator('a[href^="/"], a[href^="index"]');
    const linkCount = await internalLinks.count();

    if (linkCount > 0) {
      // Click first internal link
      const firstLink = internalLinks.first();
      const href = await firstLink.getAttribute('href');

      if (href) {
        // Navigate directly so we can inspect the HTTP response status.
        // Substring-matching body text for "404" / "Not Found" produces false
        // positives because article content legitimately mentions these terms
        // (e.g. EP API status discussions).
        const response = await page.goto(href);
        expect(response).not.toBeNull();
        expect(response.status(), `Navigation to ${href} returned HTTP ${response.status()}`).toBeLessThan(400);

        // Verify navigation occurred
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      }
    }
  });

  test('should display article content', async ({ page }) => {
    await page.goto('/');

    const articleLinks = page.locator('article a, .article-link');
    const linkCount = await articleLinks.count();

    if (linkCount > 0) {
      await articleLinks.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Verify article has substantial content
      const contentSelectors = [
        'article p',
        '.article-content p',
        'main p',
        '.content p',
      ];

      let foundContent = false;
      for (const selector of contentSelectors) {
        const paragraphs = page.locator(selector);
        const count = await paragraphs.count();
        if (count > 0) {
          const text = await paragraphs.first().textContent();
          if (text && text.length > 50) {
            foundContent = true;
            break;
          }
        }
      }

      expect(foundContent).toBeTruthy();
    }
  });

  test('keyboard navigation expands disclosure layers', async ({ page }) => {
    await page.setContent(`
      <div class="reading-progress" aria-hidden="true"></div>
      <main>
        <aside class="article-toc-container">
          <details class="article-toc-details" open>
            <summary class="article-toc-summary">Contents</summary>
            <ol class="article-toc-list">
              <li><a href="#section-synthesis">Synthesis</a></li>
            </ol>
          </details>
        </aside>
        <article class="article-body">
          <section class="article-layer article-layer--quick">
            <h2 id="section-executive-brief">Executive Brief</h2>
          </section>
          <details class="article-layer article-layer--analysis article-layer-details" data-disclosure-layer="analysis" id="article-layer-analysis">
            <summary class="article-layer-summary"><span class="article-layer-summary__title">Read full analysis ↓</span></summary>
            <section class="article-layer-content">
              <h2 id="section-synthesis">Synthesis</h2>
              <p>Detailed analysis section.</p>
            </section>
          </details>
        </article>
      </main>
    `);
    await page.addScriptTag({ content: fs.readFileSync('js/article-runtime.js', 'utf8') });

    const details = page.locator('#article-layer-analysis');
    await expect(details).not.toHaveAttribute('open');

    await page.locator('.article-toc-list a[href="#section-synthesis"]').focus();
    await page.keyboard.press('Enter');

    await expect(details).toHaveAttribute('open', '');
    await expect(page.locator('#section-synthesis')).toBeVisible();
  });
});
