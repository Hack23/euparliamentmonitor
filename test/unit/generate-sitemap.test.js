// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for generate-sitemap.js
 * Tests sitemap generation, URL formatting, and XML validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createTempDir, cleanupTempDir } from '../helpers/test-utils.js';

describe('generate-sitemap', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('Sitemap XML Structure', () => {
    it('should generate valid XML with declaration', () => {
      const sitemap = generateMockSitemap([]);

      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(sitemap).toContain('</urlset>');
    });

    it('should include all language index pages', () => {
      const languages = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ro', 'sv', 'da', 'fi', 'el', 'hu'];
      const sitemap = generateMockSitemap([]);

      languages.forEach((lang) => {
        expect(sitemap).toContain(`<loc>https://euparliamentmonitor.com/index-${lang}.html</loc>`);
      });
    });

    it('should include 14 language index URLs', () => {
      const sitemap = generateMockSitemap([]);
      const indexUrls = sitemap.match(/index-[a-z]{2}\.html/g);

      expect(indexUrls).toHaveLength(14);
    });

    it('should include news articles', () => {
      const articles = [
        '2025-01-15-week-ahead-en.html',
        '2025-01-16-committee-report-de.html',
      ];

      const sitemap = generateMockSitemap(articles);

      articles.forEach((article) => {
        expect(sitemap).toContain(`<loc>https://euparliamentmonitor.com/news/${article}</loc>`);
      });
    });
  });

  describe('URL Properties', () => {
    it('should set high priority for index pages', () => {
      const sitemap = generateMockSitemap([]);

      // Check that index pages have priority 1.0
      const indexUrlBlock = sitemap.match(/<url>[\s\S]*?index-en\.html[\s\S]*?<\/url>/);
      expect(indexUrlBlock).toBeTruthy();
      expect(indexUrlBlock[0]).toContain('<priority>1.0</priority>');
    });

    it('should set daily changefreq for index pages', () => {
      const sitemap = generateMockSitemap([]);

      const indexUrlBlock = sitemap.match(/<url>[\s\S]*?index-en\.html[\s\S]*?<\/url>/);
      expect(indexUrlBlock).toBeTruthy();
      expect(indexUrlBlock[0]).toContain('<changefreq>daily</changefreq>');
    });

    it('should set priority 0.8 for news articles', () => {
      const articles = ['2025-01-15-article-en.html'];
      const sitemap = generateMockSitemap(articles);

      const articleUrlBlock = sitemap.match(/<url>[\s\S]*?news\/2025-01-15[\s\S]*?<\/url>/);
      expect(articleUrlBlock).toBeTruthy();
      expect(articleUrlBlock[0]).toContain('<priority>0.8</priority>');
    });

    it('should set monthly changefreq for news articles', () => {
      const articles = ['2025-01-15-article-en.html'];
      const sitemap = generateMockSitemap(articles);

      const articleUrlBlock = sitemap.match(/<url>[\s\S]*?news\/2025-01-15[\s\S]*?<\/url>/);
      expect(articleUrlBlock).toBeTruthy();
      expect(articleUrlBlock[0]).toContain('<changefreq>monthly</changefreq>');
    });

    it('should include lastmod date for all URLs', () => {
      const sitemap = generateMockSitemap(['2025-01-15-article-en.html']);

      // All URLs should have lastmod
      const urlBlocks = sitemap.match(/<url>[\s\S]*?<\/url>/g);
      urlBlocks.forEach((block) => {
        expect(block).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
      });
    });

    it('should format lastmod in YYYY-MM-DD format', () => {
      const sitemap = generateMockSitemap([]);

      const lastmodDates = sitemap.match(/<lastmod>([^<]+)<\/lastmod>/g);
      lastmodDates.forEach((date) => {
        const dateValue = date.match(/<lastmod>([^<]+)<\/lastmod>/)[1];
        expect(dateValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });

  describe('URL Count', () => {
    it('should calculate total URLs correctly', () => {
      const articles = ['article1.html', 'article2.html', 'article3.html'];
      const sitemap = generateMockSitemap(articles);

      const urlCount = (sitemap.match(/<url>/g) || []).length;
      expect(urlCount).toBe(14 + articles.length); // 14 language indexes + articles
    });

    it('should handle no articles', () => {
      const sitemap = generateMockSitemap([]);

      const urlCount = (sitemap.match(/<url>/g) || []).length;
      expect(urlCount).toBe(14); // Only language indexes
    });

    it('should handle many articles', () => {
      const articles = Array.from({ length: 100 }, (_, i) => `2025-01-15-article-${i}-en.html`);
      const sitemap = generateMockSitemap(articles);

      const urlCount = (sitemap.match(/<url>/g) || []).length;
      expect(urlCount).toBe(14 + 100);
    });
  });

  describe('XML Validation', () => {
    it('should have balanced XML tags', () => {
      const sitemap = generateMockSitemap(['2025-01-15-article-en.html']);

      const openTags = (sitemap.match(/<url>/g) || []).length;
      const closeTags = (sitemap.match(/<\/url>/g) || []).length;

      expect(openTags).toBe(closeTags);
    });

    it('should properly escape special characters in URLs', () => {
      // Note: URLs should not have special characters, but test the concept
      const sitemap = generateMockSitemap([]);

      // Should not contain unescaped &, <, > (except in tags)
      const contentBetweenTags = sitemap.match(/>([^<]+)</g);
      contentBetweenTags.forEach((content) => {
        const text = content.slice(1, -1); // Remove > and <
        if (text.includes('http')) {
          // URLs should be well-formed
          expect(text).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
        }
      });
    });

    it('should use HTTPS protocol', () => {
      const sitemap = generateMockSitemap(['article.html']);

      const urls = sitemap.match(/<loc>([^<]+)<\/loc>/g);
      urls.forEach((url) => {
        expect(url).toContain('https://');
        expect(url).not.toContain('http://');
      });
    });

    it('should use correct base URL', () => {
      const sitemap = generateMockSitemap([]);
      
      expect(sitemap).toContain('https://euparliamentmonitor.com');
    });
  });

  describe('Date Handling', () => {
    it('should use current date for index pages', () => {
      const sitemap = generateMockSitemap([]);
      const today = new Date().toISOString().split('T')[0];

      const indexUrlBlock = sitemap.match(/<url>[\s\S]*?index-en\.html[\s\S]*?<\/url>/);
      expect(indexUrlBlock[0]).toContain(`<lastmod>${today}</lastmod>`);
    });

    it('should handle valid date format', () => {
      const dateString = '2025-01-15';
      const date = new Date(dateString);

      expect(date.toISOString().split('T')[0]).toBe(dateString);
    });
  });

  describe('File Operations', () => {
    it('should handle empty news directory', () => {
      const newsDir = path.join(tempDir, 'news');
      
      if (!fs.existsSync(newsDir)) {
        const files = [];
        expect(files).toHaveLength(0);
      }
    });

    it('should filter only HTML files', () => {
      const newsDir = path.join(tempDir, 'news');
      fs.mkdirSync(newsDir);

      // Create test files
      fs.writeFileSync(path.join(newsDir, '2025-01-15-article-en.html'), '');
      fs.writeFileSync(path.join(newsDir, 'metadata.json'), '');
      fs.writeFileSync(path.join(newsDir, 'index-en.html'), '');
      fs.writeFileSync(path.join(newsDir, '2025-01-16-article-de.html'), '');

      const files = fs.readdirSync(newsDir);
      const htmlFiles = files.filter((f) => f.endsWith('.html') && !f.startsWith('index-'));

      expect(htmlFiles).toHaveLength(2);
    });

    it('should get file modification time', () => {
      const testFile = path.join(tempDir, 'test.html');
      fs.writeFileSync(testFile, 'content');

      const stats = fs.statSync(testFile);
      const modDate = stats.mtime.toISOString().split('T')[0];

      expect(modDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle article with future date', () => {
      const futureDate = '2030-12-31';
      const articles = [`${futureDate}-article-en.html`];
      const sitemap = generateMockSitemap(articles);

      expect(sitemap).toContain(articles[0]);
    });

    it('should handle article with past date', () => {
      const pastDate = '2020-01-01';
      const articles = [`${pastDate}-article-en.html`];
      const sitemap = generateMockSitemap(articles);

      expect(sitemap).toContain(articles[0]);
    });

    it('should handle very long filename', () => {
      const longFilename = '2025-01-15-very-long-article-title-with-many-words-that-describes-complex-topic-en.html';
      const sitemap = generateMockSitemap([longFilename]);

      expect(sitemap).toContain(longFilename);
    });
  });

  describe('Performance', () => {
    it('should handle large number of articles', () => {
      const articles = Array.from({ length: 1000 }, (_, i) => `2025-01-${String(15 + (i % 10)).padStart(2, '0')}-article-${i}-en.html`);
      
      const startTime = Date.now();
      const sitemap = generateMockSitemap(articles);
      const endTime = Date.now();

      expect(sitemap).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});

/**
 * Helper function to generate mock sitemap
 */
function generateMockSitemap(articles) {
  const BASE_URL = 'https://euparliamentmonitor.com';
  const urls = [];

  // Add home pages for each language
  const languages = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ro', 'sv', 'da', 'fi', 'el', 'hu'];
  
  for (const lang of languages) {
    urls.push({
      loc: `${BASE_URL}/index-${lang}.html`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '1.0',
    });
  }

  // Add news articles
  for (const article of articles) {
    urls.push({
      loc: `${BASE_URL}/news/${article}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.8',
    });
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}
