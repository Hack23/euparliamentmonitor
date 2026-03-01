// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for fix-articles.ts
 * Tests injection of language switcher, article-top-nav, site-header, and reading-progress
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fixArticle, fixAllArticles } from '../../scripts/utils/fix-articles.js';

// Mock fs and path modules
vi.mock('node:fs');

describe('fix-articles', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fixArticle', () => {
    it('should skip files that do not match the article filename pattern', () => {
      const result = fixArticle('/news/not-a-match.html');
      expect(result.changed).toBe(false);
      expect(result.description).toContain('Skipped');
    });

    it('should skip files already containing site-header__langs and article-top-nav', () => {
      const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><title>Test</title></head>
<body>
  <div class="reading-progress" aria-hidden="true"></div>
  <a href="#main" class="skip-link">Skip</a>
  <header class="site-header" role="banner"><div class="site-header__inner"><nav class="site-header__langs" role="navigation"><a href="#">EN</a></nav></div></header>
  <nav class="article-top-nav" aria-label="Nav"><a href="../index.html">Back</a></nav>
  <main id="main">
  <article class="news-article" lang="en"><h1>Test</h1></article>
  </main>
  <footer class="site-footer" role="contentinfo"><p>Footer</p></footer>
</body>
</html>`;
      vi.mocked(fs.readFileSync).mockReturnValue(html);
      const result = fixArticle('/news/2026-02-24-week-ahead-en.html');
      expect(result.changed).toBe(false);
      expect(result.description).toContain('Already complete');
    });

    it('should inject full structure for Type A articles (no site-header)', () => {
      const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><title>Test</title></head>
<body>
  <article class="news-article" lang="en">
    <header class="article-header"><h1>Test</h1></header>
    <div class="article-content"><p>Content</p></div>
  </article>
</body>
</html>`;
      vi.mocked(fs.readFileSync).mockReturnValue(html);
      const result = fixArticle('/news/2026-02-28-month-in-review-en.html', true);

      expect(result.changed).toBe(true);
      expect(result.description).toContain('site-header');
      expect(result.description).toContain('language-switcher');
      expect(result.description).toContain('article-top-nav');
      expect(result.description).toContain('main wrapper');
    });

    it('should inject top-nav for Type B articles (has site-header)', () => {
      const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><title>Test</title></head>
<body>
  <a href="#main" class="skip-link">Skip</a>
  <header class="site-header" role="banner"><div class="site-header__inner"></div></header>

  <main id="main" class="site-main">
  <article class="news-article" lang="en"><h1>Test</h1></article>
  </main>
</body>
</html>`;
      vi.mocked(fs.readFileSync).mockReturnValue(html);
      const result = fixArticle('/news/2026-02-24-propositions-en.html', true);

      expect(result.changed).toBe(true);
      expect(result.description).toContain('article-top-nav');
    });

    it('should inject article-top-nav for Type C articles (has site-header__langs)', () => {
      const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><title>Test</title></head>
<body>
  <div class="reading-progress" aria-hidden="true"></div>
  <a href="#main" class="skip-link">Skip</a>
  <header class="site-header" role="banner"><div class="site-header__inner"><nav class="site-header__langs" role="navigation"><a href="#">EN</a></nav></div></header>

  <main id="main" role="main">
  <article class="news-article" lang="en"><h1>Test</h1></article>
  </main>
</body>
</html>`;
      vi.mocked(fs.readFileSync).mockReturnValue(html);
      const result = fixArticle('/news/2026-02-27-propositions-en.html', true);

      expect(result.changed).toBe(true);
      expect(result.description).toContain('article-top-nav');
      expect(result.description).not.toContain('language-switcher');
    });

    it('should use localized back label for non-English articles', () => {
      const html = `<!DOCTYPE html>
<html lang="de" dir="ltr">
<head><title>Test</title></head>
<body>
  <article class="news-article" lang="de">
    <header class="article-header"><h1>Test</h1></header>
    <div class="article-content"><p>Content</p></div>
  </article>
</body>
</html>`;
      vi.mocked(fs.readFileSync).mockReturnValue(html);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      const result = fixArticle('/news/2026-02-28-month-in-review-de.html', false);

      expect(result.changed).toBe(true);
      const writtenHTML = String(vi.mocked(fs.writeFileSync).mock.calls[0]?.[1] ?? '');
      expect(writtenHTML).toContain('Zurück zu Nachrichten');
      expect(writtenHTML).toContain('../index-de.html');
    });

    it('should use English index link for English articles', () => {
      const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><title>Test</title></head>
<body>
  <article class="news-article" lang="en">
    <header class="article-header"><h1>Test</h1></header>
    <div class="article-content"><p>Content</p></div>
  </article>
</body>
</html>`;
      vi.mocked(fs.readFileSync).mockReturnValue(html);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      fixArticle('/news/2026-02-28-month-in-review-en.html', false);

      const writtenHTML = String(vi.mocked(fs.writeFileSync).mock.calls[0]?.[1] ?? '');
      expect(writtenHTML).toContain('../index.html');
    });

    it('should include all 14 language links in switcher', () => {
      const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><title>Test</title></head>
<body>
  <article class="news-article" lang="en">
    <header class="article-header"><h1>Test</h1></header>
  </article>
</body>
</html>`;
      vi.mocked(fs.readFileSync).mockReturnValue(html);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      fixArticle('/news/2026-02-28-week-in-review-en.html', false);

      const writtenHTML = String(vi.mocked(fs.writeFileSync).mock.calls[0]?.[1] ?? '');
      const langs = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
      for (const lang of langs) {
        expect(writtenHTML).toContain(`hreflang="${lang}"`);
      }
    });

    it('should not write file when dryRun is true', () => {
      const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><title>Test</title></head>
<body>
  <article class="news-article" lang="en"><h1>Test</h1></article>
</body>
</html>`;
      vi.mocked(fs.readFileSync).mockReturnValue(html);
      fixArticle('/news/2026-02-28-month-in-review-en.html', true);

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('fixAllArticles', () => {
    it('should process all HTML files in news directory', () => {
      const files = ['2026-02-28-month-in-review-en.html', '2026-02-28-month-in-review-de.html'];
      vi.mocked(fs.readdirSync).mockReturnValue(/** @type {any} */ (files));
      const completeHTML = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><title>Test</title></head>
<body>
  <header class="site-header" role="banner"><div class="site-header__inner"><nav class="site-header__langs"><a href="#">EN</a></nav></div></header>
  <nav class="article-top-nav"><a href="#">Back</a></nav>
  <main id="main"><article class="news-article" lang="en"><h1>Test</h1></article></main>
</body>
</html>`;
      vi.mocked(fs.readFileSync).mockReturnValue(completeHTML);

      const summary = fixAllArticles(true);

      expect(summary.total).toBe(2);
      expect(summary.results).toHaveLength(2);
    });
  });
});
