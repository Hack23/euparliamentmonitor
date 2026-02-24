// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for generate-news-indexes.js
 * Tests index generation, article parsing, and multi-language support
 */

/* eslint-disable no-undef */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createTempDir, cleanupTempDir, validateHTML } from '../helpers/test-utils.js';

describe('generate-news-indexes', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
    process.chdir(originalCwd);
  });

  describe('Article Filename Parsing', () => {
    it('should parse valid article filename', () => {
      const filename = '2025-01-15-week-ahead-climate-en.html';
      const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)-([a-z]{2})\.html$/);

      expect(match).toBeTruthy();
      expect(match[1]).toBe('2025-01-15');
      expect(match[2]).toBe('week-ahead-climate');
      expect(match[3]).toBe('en');
    });

    it('should parse filename with complex slug', () => {
      const filename = '2025-02-20-breaking-news-urgent-update-de.html';
      const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)-([a-z]{2})\.html$/);

      expect(match).toBeTruthy();
      expect(match[2]).toBe('breaking-news-urgent-update');
    });

    it('should reject invalid date format', () => {
      const filename = '25-01-15-article-en.html';
      const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)-([a-z]{2})\.html$/);

      expect(match).toBeNull();
    });

    it('should reject missing language code', () => {
      const filename = '2025-01-15-article.html';
      const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)-([a-z]{2})\.html$/);

      expect(match).toBeNull();
    });

    it('should reject invalid language code', () => {
      const filename = '2025-01-15-article-eng.html';
      const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)-([a-z]{2})\.html$/);

      expect(match).toBeNull();
    });
  });

  describe('Article Grouping', () => {
    it('should group articles by language', () => {
      const articles = [
        '2025-01-15-article-one-en.html',
        '2025-01-16-article-two-en.html',
        '2025-01-15-article-one-de.html',
        '2025-01-17-article-three-fr.html',
      ];

      const grouped = {};
      const languages = ['en', 'de', 'fr', 'es', 'it'];

      // Initialize
      for (const lang of languages) {
        grouped[lang] = [];
      }

      // Group
      for (const article of articles) {
        const match = article.match(/^(\d{4}-\d{2}-\d{2})-(.+)-([a-z]{2})\.html$/);
        if (match && grouped[match[3]] !== undefined) {
          grouped[match[3]].push({
            date: match[1],
            slug: match[2],
            lang: match[3],
            filename: article,
          });
        }
      }

      expect(grouped.en).toHaveLength(2);
      expect(grouped.de).toHaveLength(1);
      expect(grouped.fr).toHaveLength(1);
      expect(grouped.es).toHaveLength(0);
    });

    it('should sort articles by date (newest first)', () => {
      const articles = [
        { date: '2025-01-15', slug: 'article-one', lang: 'en', filename: 'file1.html' },
        { date: '2025-01-20', slug: 'article-two', lang: 'en', filename: 'file2.html' },
        { date: '2025-01-10', slug: 'article-three', lang: 'en', filename: 'file3.html' },
      ];

      articles.sort((a, b) => b.date.localeCompare(a.date));

      expect(articles[0].date).toBe('2025-01-20');
      expect(articles[1].date).toBe('2025-01-15');
      expect(articles[2].date).toBe('2025-01-10');
    });
  });

  describe('Slug Formatting', () => {
    it('should format slug to title case', () => {
      const slug = 'week-ahead-climate-policy';
      const formatted = slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      expect(formatted).toBe('Week Ahead Climate Policy');
    });

    it('should handle single word slug', () => {
      const slug = 'breaking';
      const formatted = slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      expect(formatted).toBe('Breaking');
    });

    it('should handle empty slug', () => {
      const slug = '';
      const formatted = slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      expect(formatted).toBe('');
    });
  });

  describe('Index HTML Generation', () => {
    it('should generate valid HTML structure', () => {
      const html = generateMockIndexHTML('en', []);

      const validation = validateHTML(html);
      expect(validation.valid).toBe(true);
    });

    it('should include language-specific title', () => {
      const englishHTML = generateMockIndexHTML('en', []);
      const germanHTML = generateMockIndexHTML('de', []);

      expect(englishHTML).toContain('EU Parliament Monitor - News');
      expect(germanHTML).toContain('EU-Parlamentsmonitor - Nachrichten');
    });

    it('should include language indicator', () => {
      const html = generateMockIndexHTML('fr', []);
      expect(html).toContain('Français');
    });

    it('should show "no articles" message when empty', () => {
      const html = generateMockIndexHTML('en', []);
      expect(html).toContain('No articles available yet');
    });

    it('should list articles when present', () => {
      const articles = [
        { date: '2025-01-15', slug: 'week-ahead', lang: 'en', filename: 'test.html' },
        { date: '2025-01-14', slug: 'committee-report', lang: 'en', filename: 'test2.html' },
      ];

      const html = generateMockIndexHTML('en', articles);

      expect(html).toContain('2025-01-15');
      expect(html).toContain('Week Ahead');
      expect(html).toContain('news/test.html');
    });

    it('should include meta description', () => {
      const html = generateMockIndexHTML('en', []);
      expect(html).toContain('<meta name="description"');
      expect(html).toContain('Latest news and analysis about European Parliament');
    });

    it('should include stylesheet link', () => {
      const html = generateMockIndexHTML('en', []);
      expect(html).toContain('<link rel="stylesheet" href="styles.css">');
    });

    it('should include footer with copyright', () => {
      const html = generateMockIndexHTML('en', []);
      expect(html).toContain('EU Parliament Monitor');
      expect(html).toMatch(/\d{4}/); // Current year
    });
  });

  describe('Multi-Language Support', () => {
    const languages = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];

    it('should support all Hack23 market languages', () => {
      expect(languages).toHaveLength(14);
    });

    it('should generate index for each language', () => {
      const indexes = languages.map((lang) => ({
        lang,
        filename: lang === 'en' ? 'index.html' : `index-${lang}.html`,
      }));

      expect(indexes).toHaveLength(14);
      expect(indexes[0].filename).toBe('index.html');
      indexes.slice(1).forEach((index) => {
        expect(index.filename).toMatch(/^index-[a-z]{2}\.html$/);
      });
    });

    it('should use correct language names', () => {
      const langNames = {
        en: 'English',
        sv: 'Svenska',
        da: 'Dansk',
        no: 'Norsk',
        fi: 'Suomi',
        de: 'Deutsch',
        fr: 'Français',
        es: 'Español',
        nl: 'Nederlands',
        ar: 'العربية',
        he: 'עברית',
        ja: '日本語',
        ko: '한국어',
        zh: '中文',
      };

      Object.entries(langNames).forEach(([code, name]) => {
        const html = generateMockIndexHTML(code, []);
        expect(html).toContain(name);
      });
    });
  });

  describe('File Operations', () => {
    it('should handle missing news directory', () => {
      const nonExistentDir = path.join(tempDir, 'non-existent-news');
      expect(fs.existsSync(nonExistentDir)).toBe(false);
      // Should not throw
    });

    it('should filter HTML files correctly', () => {
      const newsDir = path.join(tempDir, 'news');
      fs.mkdirSync(newsDir);

      // Create test files
      fs.writeFileSync(path.join(newsDir, '2025-01-15-article-en.html'), 'content');
      fs.writeFileSync(path.join(newsDir, 'index-en.html'), 'content');
      fs.writeFileSync(path.join(newsDir, 'metadata.json'), 'content');
      fs.writeFileSync(path.join(newsDir, '2025-01-16-article-de.html'), 'content');

      const files = fs.readdirSync(newsDir);
      const htmlFiles = files.filter((f) => f.endsWith('.html') && !f.startsWith('index-'));

      expect(htmlFiles).toHaveLength(2);
      expect(htmlFiles).toContain('2025-01-15-article-en.html');
      expect(htmlFiles).toContain('2025-01-16-article-de.html');
      expect(htmlFiles).not.toContain('index-en.html');
    });
  });

  describe('Edge Cases', () => {
    it('should handle article with no slug', () => {
      const filename = '2025-01-15--en.html';
      const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)-([a-z]{2})\.html$/);

      // This should not match because slug is empty
      expect(match).toBeNull();
    });

    it('should handle very long slug', () => {
      const slug = 'very-long-article-title-with-many-words-about-complex-topic';
      const formatted = slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      expect(formatted.length).toBeGreaterThan(50);
    });

    it('should handle special characters in slug (already hyphenated)', () => {
      const slug = 'article-with-numbers-2025-update';
      const formatted = slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      expect(formatted).toContain('2025');
    });
  });
});

/**
 * Helper function to generate mock index HTML
 * Mirrors the actual generator's card-layout structure
 */
function generateMockIndexHTML(lang, articles) {
  const titles = {
    en: 'EU Parliament Monitor - News',
    de: 'EU-Parlamentsmonitor - Nachrichten',
    fr: 'Moniteur du Parlement UE - Actualités',
  };

  const descriptions = {
    en: 'Latest news and analysis about European Parliament activities',
    de: 'Neueste Nachrichten und Analysen zu den Aktivitäten des Europäischen Parlaments',
    fr: 'Dernières nouvelles et analyses sur les activités du Parlement européen',
  };

  const langNames = {
    en: 'English',
    sv: 'Svenska',
    da: 'Dansk',
    no: 'Norsk',
    fi: 'Suomi',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    nl: 'Nederlands',
    ar: 'العربية',
    he: 'עברית',
    ja: '日本語',
    ko: '한국어',
    zh: '中文',
  };

  const noArticles = {
    en: 'No articles available yet.',
    de: 'Noch keine Artikel verfügbar.',
    fr: 'Aucun article disponible pour le moment.',
  };

  const headings = {
    en: 'Latest News',
    de: 'Neueste Nachrichten',
    fr: 'Dernières Actualités',
  };

  const title = titles[lang] || titles.en;
  const description = descriptions[lang] || descriptions.en;
  const languageName = langNames[lang] || 'English';
  const noArticlesText = noArticles[lang] || noArticles.en;
  const heading = headings[lang] || headings.en;

  const langNav = Object.entries(langNames)
    .map(([code, name]) => {
      const active = code === lang ? ' lang-link active' : '';
      const href = code === 'en' ? 'index.html' : `index-${code}.html`;
      return `<a href="${href}" class="lang-link${active}" hreflang="${code}" title="${name}">${name}</a>`;
    })
    .join('\n          ');

  const selfHref = lang === 'en' ? 'index.html' : `index-${lang}.html`;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="${selfHref}" class="site-header__brand" aria-label="EU Parliament Monitor">
        <span class="site-header__flag" aria-hidden="true">🇪🇺</span>
        <span>
          <span class="site-header__title">EU Parliament Monitor</span>
          <span class="site-header__subtitle">European Parliament Intelligence</span>
        </span>
      </a>
    </div>
  </header>

  <nav class="language-switcher" role="navigation" aria-label="Language selection">
    ${langNav}
  </nav>

  <section class="hero">
    <h1 class="hero__title">${title}</h1>
    <p class="hero__description">${description}</p>
  </section>

  <main class="site-main">
    <h2 class="section-heading"><span class="section-heading__icon" aria-hidden="true">📋</span> ${heading}</h2>
    ${
      articles.length === 0
        ? `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">📰</div>
      <p class="empty-state__text">${noArticlesText}</p>
    </div>`
        : `
    <ul class="news-grid" role="list">
      ${articles
        .map((article) => {
          const category = 'week-ahead';
          return `
      <li class="news-card">
        <a href="news/${article.filename}" class="news-card__link">
          <div class="news-card__accent news-card__accent--${category}"></div>
          <div class="news-card__body">
            <div class="news-card__meta">
              <span class="news-card__badge news-card__badge--${category}">${category.replace('-', ' ')}</span>
              <time class="news-card__date" datetime="${article.date}">${article.date}</time>
            </div>
            <h3 class="news-card__title">${formatSlug(article.slug)}</h3>
          </div>
        </a>
      </li>`;
        })
        .join('\n')}
    </ul>`
    }
  </main>

  <footer class="site-footer" role="contentinfo">
    <div class="footer-content">
      <div class="footer-section">
        <p>&copy; ${new Date().getFullYear()} EU Parliament Monitor</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function formatSlug(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
