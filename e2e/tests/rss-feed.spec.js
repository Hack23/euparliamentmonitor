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
  test('should load rss.xml successfully', async ({ request }) => {
    const response = await request.get('/rss.xml');

    // Verify the feed returns HTTP 200
    expect(response.status()).toBe(200);
  });

  test('should be valid RSS 2.0 with required root element', async ({
    request,
  }) => {
    const response = await request.get('/rss.xml');
    const text = await response.text();

    // Verify RSS 2.0 root element
    expect(text).toContain('version="2.0"');

    // Verify channel wrapper
    expect(text).toContain('<channel>');
  });

  test('should have required channel metadata', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const text = await response.text();

    // Verify required RSS channel elements
    expect(text).toContain('<title>');
    expect(text).toContain('<link>');
    expect(text).toContain('<description>');
  });

  test('should declare Dublin Core namespace for language tags', async ({
    request,
  }) => {
    const response = await request.get('/rss.xml');
    const text = await response.text();

    // Verify dc namespace declaration for per-item language tags
    expect(text).toContain('xmlns:dc=');
  });

  test('should have at least one item', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const text = await response.text();

    // Verify items are present
    expect(text).toContain('<item>');
  });

  test('should have items with required elements', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const text = await response.text();

    // Verify there is at least one item title in addition to the channel title
    const titleCount = (text.match(/<title>/g) ?? []).length;
    expect(titleCount).toBeGreaterThan(1);

    // Verify item-specific elements (not shared with channel metadata)
    expect(text).toContain('<pubDate>');
    expect(text).toContain('<guid');
  });

  test('should include dc:language tags on items', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const text = await response.text();

    // Verify Dublin Core language tags are used for per-item language
    expect(text).toContain('dc:language');
  });

  test('should contain articles in multiple languages', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const text = await response.text();

    // Verify items covering multiple languages exist
    const languages = ['en', 'de', 'fr', 'es', 'sv'];
    let foundLanguages = 0;
    for (const lang of languages) {
      if (text.includes(`>${lang}<`) || text.includes(`"${lang}"`)) {
        foundLanguages++;
      }
    }
    expect(foundLanguages).toBeGreaterThanOrEqual(3);
  });

  test('should have atom self-link with correct URL', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const text = await response.text();

    // Verify atom:link self-reference for feed discovery
    expect(text).toContain('rel="self"');
    expect(text).toContain('rss.xml');
  });

  test('should have lastBuildDate element', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const text = await response.text();

    // Verify build date is present
    expect(text).toContain('<lastBuildDate>');
  });
});
