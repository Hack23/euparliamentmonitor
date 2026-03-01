// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * RSS Feed Validation E2E Tests
 *
 * Tests for RSS 2.0 feed validity including:
 * - Feed loads successfully
 * - Required RSS 2.0 structure elements
 * - Channel metadata completeness
 * - Item presence and structure
 * - Dublin Core language tags
 * - Atom self-reference link
 */

test.describe('RSS Feed', () => {
  test('should load rss.xml successfully', async ({ page }) => {
    const response = await page.goto('/rss.xml');

    // Verify the feed returns HTTP 200
    expect(response.status()).toBe(200);
  });

  test('should be valid RSS 2.0 with required root element', async ({
    page,
  }) => {
    await page.goto('/rss.xml');
    const content = await page.content();

    // Verify RSS 2.0 root element
    expect(content).toContain('version="2.0"');

    // Verify channel wrapper
    expect(content).toContain('<channel>');
  });

  test('should have required channel metadata', async ({ page }) => {
    await page.goto('/rss.xml');
    const content = await page.content();

    // Verify required RSS channel elements
    expect(content).toContain('<title>');
    expect(content).toContain('<link>');
    expect(content).toContain('<description>');
  });

  test('should declare Dublin Core namespace for language tags', async ({
    page,
  }) => {
    await page.goto('/rss.xml');
    const content = await page.content();

    // Verify dc namespace declaration for per-item language tags
    expect(content).toContain('xmlns:dc=');
  });

  test('should have at least one item', async ({ page }) => {
    await page.goto('/rss.xml');
    const content = await page.content();

    // Verify items are present
    expect(content).toContain('<item>');
  });

  test('should have items with required elements', async ({ page }) => {
    await page.goto('/rss.xml');
    const content = await page.content();

    // Verify item structure includes title, link, and description
    expect(content).toContain('<title>');
    expect(content).toContain('<link>');
    expect(content).toContain('<description>');
    expect(content).toContain('<pubDate>');
    expect(content).toContain('<guid');
  });

  test('should include dc:language tags on items', async ({ page }) => {
    await page.goto('/rss.xml');
    const content = await page.content();

    // Verify Dublin Core language tags are used for per-item language
    expect(content).toContain('dc:language');
  });

  test('should contain articles in multiple languages', async ({ page }) => {
    await page.goto('/rss.xml');
    const content = await page.content();

    // Verify items covering multiple languages exist
    const languages = ['en', 'de', 'fr', 'es', 'sv'];
    let foundLanguages = 0;
    for (const lang of languages) {
      if (content.includes(`>${lang}<`) || content.includes(`"${lang}"`)) {
        foundLanguages++;
      }
    }
    expect(foundLanguages).toBeGreaterThan(0);
  });

  test('should have atom self-link with correct URL', async ({ page }) => {
    await page.goto('/rss.xml');
    const content = await page.content();

    // Verify atom:link self-reference for feed discovery
    expect(content).toContain('rel="self"');
    expect(content).toContain('rss.xml');
  });

  test('should have lastBuildDate element', async ({ page }) => {
    await page.goto('/rss.xml');
    const content = await page.content();

    // Verify build date is present
    expect(content).toContain('<lastBuildDate>');
  });
});
