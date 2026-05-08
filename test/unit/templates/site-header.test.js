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

  it('should wrap the theme toggle in a dedicated .site-header__theme-toggle-slot', async () => {
    const html = await renderHeader('en');
    // Slot exists and contains the theme-toggle button.
    expect(html).toContain('site-header__theme-toggle-slot');
    expect(html).toMatch(
      /site-header__theme-toggle-slot[\s\S]*?<button[^>]*class="theme-toggle"[\s\S]*?<\/button>[\s\S]*?<\/div>/
    );
  });

  it('should group the four pill CTAs in .site-header__cta-group separate from the theme toggle slot', async () => {
    const html = await renderHeader('en');
    expect(html).toContain('site-header__cta-group');
    // CTA group sits before the theme-toggle slot inside the actions container.
    const ctaGroupIndex = html.indexOf('site-header__cta-group');
    const slotIndex = html.indexOf('site-header__theme-toggle-slot');
    expect(ctaGroupIndex).toBeGreaterThan(-1);
    expect(slotIndex).toBeGreaterThan(ctaGroupIndex);
    // Theme toggle is NOT a sibling of the pill CTAs anymore — it lives
    // in its own slot, never directly inside the cta-group div.
    const ctaGroupBlock = html.slice(
      ctaGroupIndex,
      html.indexOf('</div>', ctaGroupIndex)
    );
    expect(ctaGroupBlock).not.toContain('class="theme-toggle"');
  });

  it('should keep CTAs as icon + label-span pairs so mobile collapse can hide the label only', async () => {
    const html = await renderHeader('en');
    // Every CTA carries a `.site-header__cta-label` span used by the
    // <640px breakpoint to switch to icon-only display. Match each
    // <a class="…site-header__cta…"> opening tag exactly once and
    // assert there is one label span per CTA.
    // Match every anchor whose class attribute contains the `site-header__cta`
    // token. We avoid `\b` word-boundary anchors here because `_` is a word
    // character in regex, so `\b` does not apply at the `__` boundary inside
    // the BEM block name.
    const ctaCount = (html.match(/<a[^>]*class="[^"]*site-header__cta[^"]*"/g) ?? []).length;
    expect(ctaCount).toBeGreaterThanOrEqual(4);
    const labelCount = (html.match(/class="site-header__cta-label"/g) ?? []).length;
    expect(labelCount).toBe(ctaCount);
  });

  it('should not emit extra whitespace when PI CTA is suppressed', async () => {
    const html = await renderHeader('en', { politicalIntelligenceHref: '' });
    // No double-newline or blank line between actions div and sponsor CTA
    expect(html).not.toMatch(/site-header__cta-group[^>]*>\s*\n\s*\n/);
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

  it('should reject protocol-relative URL (//evil.example) and fall back to default', async () => {
    const html = await renderHeader('en', {
      politicalIntelligenceHref: '//evil.example/phish',
    });
    expect(html).not.toContain('//evil.example');
    expect(html).toContain('political-intelligence.html');
  });

  it('should allow a safe single-slash relative path', async () => {
    const html = await renderHeader('en', {
      politicalIntelligenceHref: '/pages/political-intelligence.html',
    });
    expect(html).toContain('href="/pages/political-intelligence.html"');
  });

  it('should reject backslash-prefixed URLs that browsers normalize to protocol-relative', async () => {
    const html = await renderHeader('en', {
      politicalIntelligenceHref: '\\\\evil.example',
    });
    expect(html).not.toContain('evil.example');
    expect(html).toContain('political-intelligence.html');
  });
});
