// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `Generators/Shared` — branded types, escape utilities,
 * and template helpers.
 *
 * Validates:
 * - `toSafeHtml` escapes HTML entities and returns a branded SafeHtmlString
 * - `toSafeXml` escapes XML entities and returns a branded SafeXmlString
 * - `toAbsoluteUrl` validates HTTPS URLs and rejects non-HTTPS
 * - `toRelativeFilePath` normalizes path separators and strips leading slashes
 * - `cacheBustUrl` appends the build hash query parameter
 * - `buildHtmlOpenTag` emits correct lang/dir attributes including RTL
 * - `buildMetaTag` / `buildOgMetaTag` produce valid meta elements
 * - `buildHreflangLink` produces valid hreflang alternate link elements
 * - `getDirection` returns rtl for Arabic/Hebrew, ltr for others
 */

import { describe, it, expect } from 'vitest';
import {
  toSafeHtml,
  toSafeXml,
  toAbsoluteUrl,
  toRelativeFilePath,
  cacheBustUrl,
  buildHtmlOpenTag,
  buildMetaTag,
  buildOgMetaTag,
  getDirection,
  buildHreflangLink,
} from '../../scripts/generators/shared/index.js';

describe('toSafeHtml', () => {
  it('escapes the five HTML-sensitive characters', () => {
    const result = toSafeHtml('a < b & "c" \'d\'');
    expect(result).toContain('&lt;');
    expect(result).toContain('&amp;');
    expect(result).toContain('&quot;');
    expect(result).not.toContain('<');
  });

  it('passes safe alphanumeric strings through unchanged', () => {
    expect(toSafeHtml('Hello World 123')).toBe('Hello World 123');
  });

  it('returns empty string unchanged', () => {
    expect(toSafeHtml('')).toBe('');
  });

  it('handles strings with only special characters', () => {
    const result = toSafeHtml('<>&"\'');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).toContain('&amp;');
  });
});

describe('toSafeXml', () => {
  it('escapes the five predefined XML entities', () => {
    const result = toSafeXml('a < b & "c" \'d\'');
    expect(result).toContain('&lt;');
    expect(result).toContain('&amp;');
    expect(result).toContain('&quot;');
    expect(result).toContain('&apos;');
  });

  it('passes safe alphanumeric strings through unchanged', () => {
    expect(toSafeXml('Hello World 123')).toBe('Hello World 123');
  });

  it('returns empty string unchanged', () => {
    expect(toSafeXml('')).toBe('');
  });
});

describe('toAbsoluteUrl', () => {
  it('accepts valid HTTPS URLs', () => {
    const url = toAbsoluteUrl('https://example.com/page');
    expect(url).toBe('https://example.com/page');
  });

  it('throws for HTTP URLs', () => {
    expect(() => toAbsoluteUrl('http://example.com')).toThrow('Expected absolute HTTPS URL');
  });

  it('throws for relative paths', () => {
    expect(() => toAbsoluteUrl('/news/article.html')).toThrow('Expected absolute HTTPS URL');
  });

  it('throws for javascript: protocol', () => {
    expect(() => toAbsoluteUrl('javascript:alert(1)')).toThrow('Expected absolute HTTPS URL');
  });

  it('throws for empty strings', () => {
    expect(() => toAbsoluteUrl('')).toThrow('Expected absolute HTTPS URL');
  });
});

describe('toRelativeFilePath', () => {
  it('strips leading slashes', () => {
    expect(toRelativeFilePath('/news/article.html')).toBe('news/article.html');
  });

  it('converts backslashes to forward slashes', () => {
    expect(toRelativeFilePath('news\\article.html')).toBe('news/article.html');
  });

  it('strips multiple leading slashes', () => {
    expect(toRelativeFilePath('///path/to/file')).toBe('path/to/file');
  });

  it('passes already-relative POSIX paths through unchanged', () => {
    expect(toRelativeFilePath('news/2026-01-15-breaking-en.html')).toBe(
      'news/2026-01-15-breaking-en.html'
    );
  });

  it('handles Windows-style paths', () => {
    expect(toRelativeFilePath('\\news\\subdir\\article.html')).toBe('news/subdir/article.html');
  });
});

describe('cacheBustUrl', () => {
  const config = { buildShort: 'abc1234', appVersion: '0.8.59' };

  it('appends ?v=<buildShort> to asset path', () => {
    expect(cacheBustUrl('css/styles.css', config)).toBe('css/styles.css?v=abc1234');
  });

  it('works with deeply nested paths', () => {
    expect(cacheBustUrl('js/vendor/mermaid/mermaid.esm.min.mjs', config)).toBe(
      'js/vendor/mermaid/mermaid.esm.min.mjs?v=abc1234'
    );
  });

  it('handles empty build hash gracefully', () => {
    expect(cacheBustUrl('file.js', { buildShort: '', appVersion: '' })).toBe('file.js?v=');
  });
});

describe('buildHtmlOpenTag', () => {
  it('emits ltr for English', () => {
    expect(buildHtmlOpenTag('en')).toBe('<html lang="en" dir="ltr">');
  });

  it('emits rtl for Arabic', () => {
    expect(buildHtmlOpenTag('ar')).toBe('<html lang="ar" dir="rtl">');
  });

  it('emits rtl for Hebrew', () => {
    expect(buildHtmlOpenTag('he')).toBe('<html lang="he" dir="rtl">');
  });

  it('emits ltr for Swedish', () => {
    expect(buildHtmlOpenTag('sv')).toBe('<html lang="sv" dir="ltr">');
  });

  it('emits ltr for Japanese', () => {
    expect(buildHtmlOpenTag('ja')).toBe('<html lang="ja" dir="ltr">');
  });
});

describe('buildMetaTag', () => {
  it('produces a valid <meta> element', () => {
    expect(buildMetaTag('description', 'EU Parliament news')).toBe(
      '  <meta name="description" content="EU Parliament news">'
    );
  });

  it('handles empty content', () => {
    expect(buildMetaTag('robots', '')).toBe('  <meta name="robots" content="">');
  });
});

describe('buildOgMetaTag', () => {
  it('produces a valid OG <meta> element', () => {
    expect(buildOgMetaTag('og:title', 'Breaking News')).toBe(
      '  <meta property="og:title" content="Breaking News">'
    );
  });

  it('handles og:type', () => {
    expect(buildOgMetaTag('og:type', 'article')).toBe(
      '  <meta property="og:type" content="article">'
    );
  });
});

describe('getDirection', () => {
  it('returns rtl for Arabic', () => {
    expect(getDirection('ar')).toBe('rtl');
  });

  it('returns rtl for Hebrew', () => {
    expect(getDirection('he')).toBe('rtl');
  });

  it('returns ltr for English', () => {
    expect(getDirection('en')).toBe('ltr');
  });

  it('returns ltr for Chinese', () => {
    expect(getDirection('zh')).toBe('ltr');
  });

  it('returns ltr for Korean', () => {
    expect(getDirection('ko')).toBe('ltr');
  });
});

describe('buildHreflangLink', () => {
  it('produces a valid hreflang link element', () => {
    expect(buildHreflangLink('en', 'https://euparliamentmonitor.com/index.html')).toBe(
      '  <link rel="alternate" hreflang="en" href="https://euparliamentmonitor.com/index.html">'
    );
  });

  it('handles x-default', () => {
    expect(buildHreflangLink('x-default', 'https://euparliamentmonitor.com/index.html')).toBe(
      '  <link rel="alternate" hreflang="x-default" href="https://euparliamentmonitor.com/index.html">'
    );
  });
});
