// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for html-lang-patcher.js (TypeScript HTML language metadata patcher).
 *
 * Covers:
 * - patchHtmlContent — all replacement rules (lang, dir, inLanguage,
 *   og:locale, canonical/og:url link tags, JSON-LD @id/url)
 * - patchHtmlLang — file read/write round-trip (injected readFileImpl/writeFileImpl)
 * - runCli — argument validation and invocation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { writeFileSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { patchHtmlContent, patchHtmlLang, runCli } from '../../scripts/mcp/html-lang-patcher.js';

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <link rel="canonical" href="https://example.com/news/2025-01-01-breaking.html">
  <meta property="og:url" content="https://example.com/news/2025-01-01-breaking.html">
  <meta property="og:locale" content="en_US">
  <script type="application/ld+json">{"@type":"NewsArticle","inLanguage":"en","url":"https://example.com/news/2025-01-01-breaking.html","@id":"https://example.com/news/2025-01-01-breaking.html"}</script>
</head>
<body>
  <article lang="en" class="main-article">
    <p>Content here</p>
  </article>
  <nav><a hreflang="en" href="/news/">Home</a></nav>
</body>
</html>`;

const BASE_OPTS = {
  lang: 'de',
  langDir: 'ltr',
  ogLocale: 'de_DE',
  enBasename: '2025-01-01-breaking.html',
  langBasename: '2025-01-01-breaking-de.html',
};

// ─── patchHtmlContent ─────────────────────────────────────────────────────────

describe('patchHtmlContent', () => {
  describe('html lang attribute', () => {
    it('replaces lang="en" on <html> element', () => {
      const result = patchHtmlContent(SAMPLE_HTML, BASE_OPTS);
      expect(result).toContain('<html lang="de"');
      expect(result).not.toContain('<html lang="en"');
    });

    it('does not change hreflang attributes in nav/footer', () => {
      expect(patchHtmlContent(SAMPLE_HTML, BASE_OPTS)).toContain('hreflang="en"');
    });
  });

  describe('html dir attribute', () => {
    it('replaces dir="ltr" with target langDir', () => {
      const result = patchHtmlContent(SAMPLE_HTML, { ...BASE_OPTS, langDir: 'rtl' });
      expect(result).toContain('dir="rtl"');
      expect(result).not.toContain('dir="ltr"');
    });

    it('replaces dir="rtl" when present', () => {
      const rtlHtml = SAMPLE_HTML.replace('dir="ltr"', 'dir="rtl"');
      expect(patchHtmlContent(rtlHtml, { ...BASE_OPTS, langDir: 'ltr' })).toContain('dir="ltr"');
    });
  });

  describe('article lang attribute', () => {
    it('replaces lang="en" on <article> element', () => {
      expect(patchHtmlContent(SAMPLE_HTML, BASE_OPTS)).toContain('<article lang="de"');
    });
  });

  describe('JSON-LD inLanguage', () => {
    it('replaces "inLanguage":"en" with target language', () => {
      const result = patchHtmlContent(SAMPLE_HTML, BASE_OPTS);
      expect(result).toContain('"inLanguage":"de"');
      expect(result).not.toContain('"inLanguage":"en"');
    });

    it('handles inLanguage with spaces around colon', () => {
      const html = SAMPLE_HTML.replace('"inLanguage":"en"', '"inLanguage" : "en"');
      expect(patchHtmlContent(html, BASE_OPTS)).toContain('"de"');
    });
  });

  describe('og:locale meta tag', () => {
    it('replaces og:locale content with ogLocale', () => {
      const result = patchHtmlContent(SAMPLE_HTML, BASE_OPTS);
      expect(result).toContain('content="de_DE"');
      expect(result).not.toContain('content="en_US"');
    });
  });

  describe('canonical and og:url link/meta tags', () => {
    it('replaces the English filename in canonical link href', () => {
      expect(patchHtmlContent(SAMPLE_HTML, BASE_OPTS)).toContain(
        'href="https://example.com/news/2025-01-01-breaking-de.html"',
      );
    });

    it('replaces the English filename in og:url meta content', () => {
      expect(patchHtmlContent(SAMPLE_HTML, BASE_OPTS)).toContain(
        'content="https://example.com/news/2025-01-01-breaking-de.html"',
      );
    });
  });

  describe('JSON-LD url and @id fields', () => {
    it('replaces the English filename in JSON-LD url', () => {
      expect(patchHtmlContent(SAMPLE_HTML, BASE_OPTS)).toContain(
        '"url":"https://example.com/news/2025-01-01-breaking-de.html"',
      );
    });

    it('replaces the English filename in JSON-LD @id', () => {
      expect(patchHtmlContent(SAMPLE_HTML, BASE_OPTS)).toContain(
        '"@id":"https://example.com/news/2025-01-01-breaking-de.html"',
      );
    });
  });

  describe('edge cases', () => {
    it('returns content unchanged when no matches found', () => {
      const minimalHtml = '<html><body>nothing to match</body></html>';
      expect(patchHtmlContent(minimalHtml, BASE_OPTS)).toBe(minimalHtml);
    });

    it('handles RTL language (Arabic)', () => {
      const result = patchHtmlContent(SAMPLE_HTML, {
        lang: 'ar',
        langDir: 'rtl',
        ogLocale: 'ar_AR',
        enBasename: '2025-01-01-breaking.html',
        langBasename: '2025-01-01-breaking-ar.html',
      });
      expect(result).toContain('lang="ar"');
      expect(result).toContain('dir="rtl"');
      expect(result).toContain('"inLanguage":"ar"');
    });

    it('escapes regex special characters in enBasename', () => {
      const htmlWithDots = SAMPLE_HTML.replace(
        /2025-01-01-breaking\.html/g,
        '2025.01.01-breaking.html',
      );
      const result = patchHtmlContent(htmlWithDots, {
        ...BASE_OPTS,
        enBasename: '2025.01.01-breaking.html',
        langBasename: '2025.01.01-breaking-de.html',
      });
      expect(result).toContain('2025.01.01-breaking-de.html');
    });

    it('is idempotent when re-applied with updated basenames', () => {
      const once = patchHtmlContent(SAMPLE_HTML, BASE_OPTS);
      const twice = patchHtmlContent(once, {
        ...BASE_OPTS,
        enBasename: '2025-01-01-breaking-de.html',
        langBasename: '2025-01-01-breaking-de.html',
      });
      expect(twice).toBe(once);
    });
  });
});

// ─── patchHtmlLang — injectable fs functions ──────────────────────────────────

describe('patchHtmlLang', () => {
  it('reads the file, patches it, and writes back in-place', () => {
    const writeCalls = [];
    const readFileImpl = () => SAMPLE_HTML;
    const writeFileImpl = (p, content) => { writeCalls.push([p, content]); };

    patchHtmlLang('/fake/news/2025-01-01-breaking-de.html', BASE_OPTS, readFileImpl, writeFileImpl);

    expect(writeCalls).toHaveLength(1);
    expect(writeCalls[0][0]).toBe('/fake/news/2025-01-01-breaking-de.html');
    expect(writeCalls[0][1]).toContain('lang="de"');
  });

  it('throws when readFileImpl throws', () => {
    const readFileImpl = () => { throw new Error('ENOENT'); };
    const writeFileImpl = () => {};
    expect(() => patchHtmlLang('/nonexistent.html', BASE_OPTS, readFileImpl, writeFileImpl))
      .toThrow('ENOENT');
  });

  it('passes utf8 encoding to both readFileImpl and writeFileImpl', () => {
    const readEncodings = [];
    const writeEncodings = [];
    const readFileImpl = (_p, enc) => { readEncodings.push(enc); return SAMPLE_HTML; };
    const writeFileImpl = (_p, _data, enc) => { writeEncodings.push(enc); };

    patchHtmlLang('/fake/file.html', BASE_OPTS, readFileImpl, writeFileImpl);

    expect(readEncodings[0]).toBe('utf8');
    expect(writeEncodings[0]).toBe('utf8');
  });
});

// ─── runCli ───────────────────────────────────────────────────────────────────

describe('runCli', () => {
  let exitSpy;
  let stderrSpy;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exits with code 1 when arguments are missing', () => {
    runCli(['node', 'html-lang-patcher.js']);
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
  });

  it('exits with code 1 when langDir is invalid', () => {
    runCli([
      'node', 'html-lang-patcher.js',
      '/fake/file.html', 'fr', 'invalid', 'fr_FR',
      'article.html', 'article-fr.html',
    ]);
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('langDir'));
  });

  it('patches the file when given valid arguments', () => {
    const dir = mkdtempSync(join(tmpdir(), 'html-lang-patcher-test-'));
    const filePath = join(dir, '2025-01-01-breaking-fr.html');
    try {
      writeFileSync(filePath, SAMPLE_HTML, 'utf8');
      runCli([
        'node', 'html-lang-patcher.js',
        filePath, 'fr', 'ltr', 'fr_FR',
        '2025-01-01-breaking.html', '2025-01-01-breaking-fr.html',
      ]);
      expect(exitSpy).not.toHaveBeenCalled();
      const result = readFileSync(filePath, 'utf8');
      expect(result).toContain('lang="fr"');
    } finally {
      rmSync(dir, { recursive: true });
    }
  });
});

