// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Unit tests for buildSiteHeader chrome integration.
 */

import { describe, it, expect } from 'vitest';

describe('buildSiteHeader', () => {
  /**
   * @param {string} lang
   * @param {object=} extra
   */
  const renderHeader = async (lang, extra) => {
    const mod = await import('../../../scripts/templates/section-builders.js');
    return mod.buildSiteHeader({
      lang,
      pathPrefix: '',
      homeHref: lang === 'en' ? 'index.html' : `index-${lang}.html`,
      siteTitle: 'EU Parliament Monitor',
      languageSwitcherHtml: '<a href="#" lang="en">EN</a>',
      ...(extra || {}),
    });
  };

  it('should render a Political Intelligence CTA in the header', async () => {
    const html = await renderHeader('en');
    expect(html).toContain('site-header__cta--pi');
    expect(html).toContain('political-intelligence.html');
    expect(html).toContain('>Political Intelligence<');
  });

  it('should localize the Political Intelligence CTA label per language', async () => {
    const de = await renderHeader('de');
    expect(de).toContain('Politische Aufklärung');
    const ar = await renderHeader('ar');
    expect(ar).toContain('الاستخبارات السياسية');
  });

  it('should localize the language-switcher aria-label', async () => {
    const en = await renderHeader('en');
    expect(en).toContain('aria-label="Language selection"');
    const sv = await renderHeader('sv');
    expect(sv).toContain('aria-label="Språkval"');
    const ja = await renderHeader('ja');
    expect(ja).toContain('aria-label="言語選択"');
  });

  it('should respect a politicalIntelligenceHref override', async () => {
    const html = await renderHeader('en', {
      politicalIntelligenceHref: '../political-intelligence.html',
    });
    expect(html).toContain('href="../political-intelligence.html"');
  });

  it('should suppress the Political Intelligence CTA when href is empty', async () => {
    const html = await renderHeader('en', { politicalIntelligenceHref: '' });
    expect(html).not.toContain('site-header__cta--pi');
  });

  it('should not emit extra whitespace when PI CTA is suppressed', async () => {
    const html = await renderHeader('en', { politicalIntelligenceHref: '' });
    // No double-newline or blank line between actions div and sponsor CTA
    expect(html).not.toMatch(/site-header__actions">\s*\n\s*\n/);
  });

  it('should reject javascript: scheme in politicalIntelligenceHref and fall back to default', async () => {
    const html = await renderHeader('en', {
      politicalIntelligenceHref: 'javascript:alert(1)',
    });
    // Should fall back to the safe default, not emit the dangerous URL
    expect(html).not.toContain('javascript:');
    expect(html).toContain('political-intelligence.html');
  });

  it('should reject data: scheme in politicalIntelligenceHref and fall back to default', async () => {
    const html = await renderHeader('en', {
      politicalIntelligenceHref: 'data:text/html,<script>alert(1)</script>',
    });
    expect(html).not.toContain('data:');
    expect(html).toContain('political-intelligence.html');
  });
});
