// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for generate-sitemap.js
 * Tests sitemap generation, URL formatting, XML validation,
 * docs inclusion, and multi-language sitemap HTML generation.
 * Note: tests exclude docs folder content validation per requirements.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createTempDir, cleanupTempDir } from '../helpers/test-utils.js';
import { generateSitemap, collectDocsHtmlFiles, generateSitemapHTML, getSitemapFilename, generateRssFeed } from '../../scripts/generators/sitemap.js';

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
      const languages = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
      const sitemap = generateMockSitemap([]);

      languages.forEach((lang) => {
        const filename = lang === 'en' ? 'index.html' : `index-${lang}.html`;
        expect(sitemap).toContain(`<loc>https://euparliamentmonitor.com/${filename}</loc>`);
      });
    });

    it('should include 14 language index URLs', () => {
      const sitemap = generateMockSitemap([]);
      const indexUrls = sitemap.match(/index(?:-[a-z]{2})?\.html/g);

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

    it('should include sitemap HTML page URLs', () => {
      const sitemap = generateMockSitemap([]);

      expect(sitemap).toContain('<loc>https://euparliamentmonitor.com/sitemap.html</loc>');
      expect(sitemap).toContain('<loc>https://euparliamentmonitor.com/sitemap_sv.html</loc>');
      expect(sitemap).toContain('<loc>https://euparliamentmonitor.com/sitemap_zh.html</loc>');
    });

    it('should include docs files when provided', () => {
      const sitemap = generateMockSitemap([], ['docs/index.html', 'docs/api/index.html']);

      expect(sitemap).toContain('<loc>https://euparliamentmonitor.com/docs/index.html</loc>');
      expect(sitemap).toContain('<loc>https://euparliamentmonitor.com/docs/api/index.html</loc>');
    });
  });

  describe('URL Properties', () => {
    it('should set high priority for index pages', () => {
      const sitemap = generateMockSitemap([]);

      // Check that index pages have priority 1.0
      const indexUrlBlock = sitemap.match(/<url>[\s\S]*?index\.html[\s\S]*?<\/url>/);
      expect(indexUrlBlock).toBeTruthy();
      expect(indexUrlBlock[0]).toContain('<priority>1.0</priority>');
    });

    it('should set daily changefreq for index pages', () => {
      const sitemap = generateMockSitemap([]);

      const indexUrlBlock = sitemap.match(/<url>[\s\S]*?index\.html[\s\S]*?<\/url>/);
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

    it('should set priority 0.5 for sitemap HTML pages', () => {
      const sitemap = generateMockSitemap([]);

      const sitemapUrlBlock = sitemap.match(/<url>[\s\S]*?sitemap\.html[\s\S]*?<\/url>/);
      expect(sitemapUrlBlock).toBeTruthy();
      expect(sitemapUrlBlock[0]).toContain('<priority>0.5</priority>');
    });

    it('should set priority 0.3 for docs files', () => {
      const sitemap = generateMockSitemap([], ['docs/index.html']);

      const docsUrlBlock = sitemap.match(/<url>[\s\S]*?docs\/index\.html[\s\S]*?<\/url>/);
      expect(docsUrlBlock).toBeTruthy();
      expect(docsUrlBlock[0]).toContain('<priority>0.3</priority>');
    });

    it('should set weekly changefreq for docs files', () => {
      const sitemap = generateMockSitemap([], ['docs/index.html']);

      const docsUrlBlock = sitemap.match(/<url>[\s\S]*?docs\/index\.html[\s\S]*?<\/url>/);
      expect(docsUrlBlock).toBeTruthy();
      expect(docsUrlBlock[0]).toContain('<changefreq>weekly</changefreq>');
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
    it('should calculate total URLs correctly with articles and docs', () => {
      const articles = ['article1.html', 'article2.html', 'article3.html'];
      const docsFiles = ['docs/index.html'];
      const sitemap = generateMockSitemap(articles, docsFiles);

      const urlCount = (sitemap.match(/<url>/g) || []).length;
      // 14 index + 14 sitemap HTML + 1 rss.xml + 3 articles + 1 docs = 33
      expect(urlCount).toBe(14 + 14 + 1 + articles.length + docsFiles.length);
    });

    it('should handle no articles and no docs', () => {
      const sitemap = generateMockSitemap([]);

      const urlCount = (sitemap.match(/<url>/g) || []).length;
      expect(urlCount).toBe(14 + 14 + 1); // 14 language indexes + 14 sitemap HTML pages + 1 rss.xml
    });

    it('should handle many articles', () => {
      const articles = Array.from({ length: 100 }, (_, i) => `2025-01-15-article-${i}-en.html`);
      const sitemap = generateMockSitemap(articles);

      const urlCount = (sitemap.match(/<url>/g) || []).length;
      expect(urlCount).toBe(14 + 14 + 1 + 100);
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

      const indexUrlBlock = sitemap.match(/<url>[\s\S]*?index\.html[\s\S]*?<\/url>/);
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

  describe('collectDocsHtmlFiles', () => {
    it('should return empty array for non-existent directory', () => {
      const result = collectDocsHtmlFiles(path.join(tempDir, 'nonexistent'), tempDir);
      expect(result).toEqual([]);
    });

    it('should collect HTML files recursively', () => {
      const docsDir = path.join(tempDir, 'docs');
      fs.mkdirSync(docsDir, { recursive: true });
      fs.mkdirSync(path.join(docsDir, 'api'), { recursive: true });

      fs.writeFileSync(path.join(docsDir, 'index.html'), '<html></html>');
      fs.writeFileSync(path.join(docsDir, 'api', 'index.html'), '<html></html>');
      fs.writeFileSync(path.join(docsDir, 'README.md'), '# Docs');

      const result = collectDocsHtmlFiles(docsDir, tempDir);

      expect(result).toContain('docs/index.html');
      expect(result).toContain('docs/api/index.html');
      expect(result).not.toContain('docs/README.md');
    });

    it('should skip non-HTML files', () => {
      const docsDir = path.join(tempDir, 'docs');
      fs.mkdirSync(docsDir, { recursive: true });

      fs.writeFileSync(path.join(docsDir, 'data.json'), '{}');
      fs.writeFileSync(path.join(docsDir, 'style.css'), 'body{}');
      fs.writeFileSync(path.join(docsDir, 'page.html'), '<html></html>');

      const result = collectDocsHtmlFiles(docsDir, tempDir);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('docs/page.html');
    });
  });

  describe('getSitemapFilename', () => {
    it('should return sitemap.html for English', () => {
      expect(getSitemapFilename('en')).toBe('sitemap.html');
    });

    it('should return sitemap_<lang>.html for other languages', () => {
      expect(getSitemapFilename('sv')).toBe('sitemap_sv.html');
      expect(getSitemapFilename('ar')).toBe('sitemap_ar.html');
      expect(getSitemapFilename('zh')).toBe('sitemap_zh.html');
    });
  });

  describe('generateSitemapHTML', () => {
    it('should generate valid HTML5 document', () => {
      const html = generateSitemapHTML('en', []);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en"');
      expect(html).toContain('<meta charset="UTF-8">');
      expect(html).toContain('</html>');
    });

    it('should include sitemap title in target language', () => {
      const htmlEn = generateSitemapHTML('en', []);
      expect(htmlEn).toContain('<h1>Sitemap</h1>');

      const htmlSv = generateSitemapHTML('sv', []);
      expect(htmlSv).toContain('<h1>Webbplatskarta</h1>');

      const htmlDe = generateSitemapHTML('de', []);
      expect(htmlDe).toContain('<h1>Seitenübersicht</h1>');
    });

    it('should include all language index page links', () => {
      const html = generateSitemapHTML('en', []);

      expect(html).toContain('href="index.html"');
      expect(html).toContain('href="index-sv.html"');
      expect(html).toContain('href="index-zh.html"');
    });

    it('should include article titles and dates', () => {
      const articles = [
        { filename: '2025-01-15-week-ahead-en.html', date: '2025-01-15', title: 'Week Ahead Test', description: 'A test article description' },
      ];
      const html = generateSitemapHTML('en', articles);

      expect(html).toContain('Week Ahead Test');
      expect(html).toContain('2025-01-15');
      expect(html).toContain('A test article description');
    });

    it('should include article description when present', () => {
      const articles = [
        { filename: '2025-01-15-article-en.html', date: '2025-01-15', title: 'Test', description: 'Description text here' },
      ];
      const html = generateSitemapHTML('en', articles);

      expect(html).toContain('Description text here');
    });

    it('should handle articles without description', () => {
      const articles = [
        { filename: '2025-01-15-article-en.html', date: '2025-01-15', title: 'Test Article', description: '' },
      ];
      const html = generateSitemapHTML('en', articles);

      expect(html).toContain('Test Article');
      expect(html).not.toContain('sitemap-desc');
    });

    it('should include docs section when hasDocsDir is true', () => {
      const html = generateSitemapHTML('en', [], true);

      expect(html).toContain('Documentation');
      expect(html).toContain('docs/index.html');
      expect(html).toContain('docs/api/index.html');
      expect(html).toContain('docs/coverage/index.html');
      expect(html).toContain('docs/test-results/index.html');
    });

    it('should not include docs section when hasDocsDir is false', () => {
      const html = generateSitemapHTML('en', [], false);

      expect(html).not.toContain('docs/index.html');
      expect(html).not.toContain('docs/api/index.html');
    });

    it('should use localized docs labels', () => {
      const htmlSv = generateSitemapHTML('sv', [], true);

      expect(htmlSv).toContain('Dokumentation');
      expect(htmlSv).toContain('API-dokumentation');
    });

    it('should set correct RTL direction for Arabic', () => {
      const html = generateSitemapHTML('ar', []);

      expect(html).toContain('dir="rtl"');
      expect(html).toContain('lang="ar"');
    });

    it('should set correct LTR direction for English', () => {
      const html = generateSitemapHTML('en', []);

      expect(html).toContain('dir="ltr"');
    });

    it('should include language switcher for sitemap pages', () => {
      const html = generateSitemapHTML('en', []);

      expect(html).toContain('sitemap.html');
      expect(html).toContain('sitemap_sv.html');
      expect(html).toContain('sitemap_zh.html');
    });

    it('should include skip link for accessibility', () => {
      const html = generateSitemapHTML('en', []);

      expect(html).toContain('class="skip-link"');
      expect(html).toContain('Skip to main content');
    });

    it('should include footer with Hack23 info', () => {
      const html = generateSitemapHTML('en', []);

      expect(html).toContain('Hack23 AB');
      expect(html).toContain('hack23.com');
    });

    it('should escape HTML in article titles', () => {
      const articles = [
        { filename: '2025-01-15-article-en.html', date: '2025-01-15', title: 'Test <script>alert(1)</script>', description: '' },
      ];
      const html = generateSitemapHTML('en', articles);

      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should link news articles correctly', () => {
      const articles = [
        { filename: '2025-01-15-week-ahead-en.html', date: '2025-01-15', title: 'Week Ahead', description: '' },
      ];
      const html = generateSitemapHTML('en', articles);

      expect(html).toContain('href="news/2025-01-15-week-ahead-en.html"');
    });

    it('should generate all 14 language variants', () => {
      const languages = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
      
      for (const lang of languages) {
        const html = generateSitemapHTML(lang, []);
        expect(html).toContain(`lang="${lang}"`);
        expect(html).toContain('<!DOCTYPE html>');
      }
    });
  });

  describe('generateSitemap (exported function)', () => {
    it('should include sitemap HTML URLs in generated XML', () => {
      const xml = generateSitemap([]);

      expect(xml).toContain('sitemap.html');
      expect(xml).toContain('sitemap_sv.html');
    });

    it('should include docs files in generated XML', () => {
      const xml = generateSitemap([], ['docs/index.html', 'docs/api/index.html']);

      expect(xml).toContain('docs/index.html');
      expect(xml).toContain('docs/api/index.html');
    });

    it('should set weekly changefreq for docs URLs', () => {
      const xml = generateSitemap([], ['docs/index.html']);
      const docsBlock = xml.match(/<url>[\s\S]*?docs\/index\.html[\s\S]*?<\/url>/);
      
      expect(docsBlock).toBeTruthy();
      expect(docsBlock[0]).toContain('<changefreq>weekly</changefreq>');
    });

    it('should include rss.xml URL in sitemap', () => {
      const xml = generateSitemap([]);

      expect(xml).toContain('<loc>https://euparliamentmonitor.com/rss.xml</loc>');
    });
  });

  describe('generateRssFeed', () => {
    it('should generate valid RSS 2.0 XML', () => {
      const rss = generateRssFeed([]);

      expect(rss).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      // REUSE-IgnoreStart
      expect(rss).toContain('SPDX-FileCopyrightText');
      expect(rss).toContain('SPDX-License-Identifier: Apache-2.0');
      // REUSE-IgnoreEnd
      expect(rss).toContain('<rss version="2.0"');
      expect(rss).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
      expect(rss).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
      expect(rss).toContain('<channel>');
      expect(rss).toContain('</channel>');
      expect(rss).toContain('</rss>');
    });

    it('should include channel metadata', () => {
      const rss = generateRssFeed([]);

      expect(rss).toContain('<title>EU Parliament Monitor</title>');
      expect(rss).toContain('<link>https://euparliamentmonitor.com</link>');
      expect(rss).toContain('<description>');
      expect(rss).toContain('<language>en</language>');
      expect(rss).toContain('<lastBuildDate>');
    });

    it('should include atom self link', () => {
      const rss = generateRssFeed([]);

      expect(rss).toContain('atom:link href="https://euparliamentmonitor.com/rss.xml"');
      expect(rss).toContain('rel="self"');
      expect(rss).toContain('type="application/rss+xml"');
    });

    it('should include article items with correct structure', () => {
      const items = [
        { title: 'Test Article', link: 'https://euparliamentmonitor.com/news/test.html', description: 'A test', pubDate: 'Wed, 15 Jan 2025 00:00:00 GMT', lang: 'en' },
      ];
      const rss = generateRssFeed(items);

      expect(rss).toContain('<item>');
      expect(rss).toContain('<title>Test Article</title>');
      expect(rss).toContain('<link>https://euparliamentmonitor.com/news/test.html</link>');
      expect(rss).toContain('<description>A test</description>');
      expect(rss).toContain('<pubDate>Wed, 15 Jan 2025 00:00:00 GMT</pubDate>');
      expect(rss).toContain('<guid isPermaLink="true">https://euparliamentmonitor.com/news/test.html</guid>');
      expect(rss).toContain('<dc:language>en</dc:language>');
    });

    it('should include multi-language items', () => {
      const items = [
        { title: 'English Article', link: 'https://euparliamentmonitor.com/news/en.html', description: 'English desc', pubDate: 'Wed, 15 Jan 2025 00:00:00 GMT', lang: 'en' },
        { title: 'Svensk Artikel', link: 'https://euparliamentmonitor.com/news/sv.html', description: 'Svensk beskrivning', pubDate: 'Wed, 15 Jan 2025 00:00:00 GMT', lang: 'sv' },
        { title: 'مقال عربي', link: 'https://euparliamentmonitor.com/news/ar.html', description: 'وصف عربي', pubDate: 'Wed, 15 Jan 2025 00:00:00 GMT', lang: 'ar' },
      ];
      const rss = generateRssFeed(items);

      expect(rss).toContain('<dc:language>en</dc:language>');
      expect(rss).toContain('<dc:language>sv</dc:language>');
      expect(rss).toContain('<dc:language>ar</dc:language>');
      const itemCount = (rss.match(/<item>/g) || []).length;
      expect(itemCount).toBe(3);
    });

    it('should escape XML special characters in titles', () => {
      const items = [
        { title: 'Test & <Script> "Article"', link: 'https://euparliamentmonitor.com/news/test.html', description: 'Desc with & chars', pubDate: 'Wed, 15 Jan 2025 00:00:00 GMT', lang: 'en' },
      ];
      const rss = generateRssFeed(items);

      expect(rss).toContain('Test &amp; &lt;Script&gt; &quot;Article&quot;');
      expect(rss).not.toContain('<Script>');
    });

    it('should handle empty items list', () => {
      const rss = generateRssFeed([]);

      expect(rss).toContain('<channel>');
      expect(rss).toContain('</channel>');
      expect(rss).not.toContain('<item>');
    });

    it('should handle large number of items', () => {
      const items = Array.from({ length: 200 }, (_, i) => ({
        title: `Article ${i}`,
        link: `https://euparliamentmonitor.com/news/article-${i}.html`,
        description: `Description ${i}`,
        pubDate: 'Wed, 15 Jan 2025 00:00:00 GMT',
        lang: 'en',
      }));
      const rss = generateRssFeed(items);

      const itemCount = (rss.match(/<item>/g) || []).length;
      expect(itemCount).toBe(200);
    });
  });

  describe('Sitemap Locale Validation', () => {
    const ALL_LANG_CODES = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];

    it('should include index page for every supported language', () => {
      const xml = generateSitemap([]);

      for (const lang of ALL_LANG_CODES) {
        const filename = lang === 'en' ? 'index.html' : `index-${lang}.html`;
        expect(xml).toContain(`<loc>https://euparliamentmonitor.com/${filename}</loc>`);
      }
    });

    it('should include sitemap HTML page for every supported language', () => {
      const xml = generateSitemap([]);

      for (const lang of ALL_LANG_CODES) {
        const filename = lang === 'en' ? 'sitemap.html' : `sitemap_${lang}.html`;
        expect(xml).toContain(`<loc>https://euparliamentmonitor.com/${filename}</loc>`);
      }
    });

    it('should include rss.xml in sitemap', () => {
      const xml = generateSitemap([]);
      expect(xml).toContain('<loc>https://euparliamentmonitor.com/rss.xml</loc>');
    });

    it('should include all article locale variants when provided', () => {
      const articles = ALL_LANG_CODES.map((lang) => `2026-02-24-propositions-${lang}.html`);
      const xml = generateSitemap(articles);

      for (const lang of ALL_LANG_CODES) {
        expect(xml).toContain(`<loc>https://euparliamentmonitor.com/news/2026-02-24-propositions-${lang}.html</loc>`);
      }
    });

    it('should include docs files when present', () => {
      const docsFiles = ['docs/index.html', 'docs/api/index.html', 'docs/coverage/index.html'];
      const xml = generateSitemap([], docsFiles);

      for (const doc of docsFiles) {
        expect(xml).toContain(`<loc>https://euparliamentmonitor.com/${doc}</loc>`);
      }
    });

    it('should have exactly 14 index pages, 14 sitemap pages, 1 rss.xml with no articles', () => {
      const xml = generateSitemap([]);
      const urlCount = (xml.match(/<url>/g) || []).length;

      // 14 index + 14 sitemap HTML + 1 rss.xml = 29
      expect(urlCount).toBe(29);
    });

    it('should have correct total URL count with articles and docs', () => {
      const articles = ['2026-02-24-propositions-en.html', '2026-02-24-propositions-sv.html'];
      const docsFiles = ['docs/index.html'];
      const xml = generateSitemap(articles, docsFiles);
      const urlCount = (xml.match(/<url>/g) || []).length;

      // 14 index + 14 sitemap + 1 rss + 2 articles + 1 docs = 32
      expect(urlCount).toBe(32);
    });

    it('should set correct priorities for all page types', () => {
      const articles = ['2026-02-24-propositions-en.html'];
      const docsFiles = ['docs/index.html'];
      const xml = generateSitemap(articles, docsFiles);

      // Index pages: 1.0
      const indexBlock = xml.match(/<url>[\s\S]*?index\.html[\s\S]*?<\/url>/);
      expect(indexBlock[0]).toContain('<priority>1.0</priority>');

      // News: 0.8
      const newsBlock = xml.match(/<url>[\s\S]*?news\/[\s\S]*?<\/url>/);
      expect(newsBlock[0]).toContain('<priority>0.8</priority>');

      // Sitemap HTML: 0.5
      const sitemapBlock = xml.match(/<url>[\s\S]*?sitemap\.html[\s\S]*?<\/url>/);
      expect(sitemapBlock[0]).toContain('<priority>0.5</priority>');

      // RSS: 0.5
      const rssBlock = xml.match(/<url>[\s\S]*?rss\.xml[\s\S]*?<\/url>/);
      expect(rssBlock[0]).toContain('<priority>0.5</priority>');

      // Docs: 0.3
      const docsBlock = xml.match(/<url>[\s\S]*?docs\/[\s\S]*?<\/url>/);
      expect(docsBlock[0]).toContain('<priority>0.3</priority>');
    });
  });
});

/**
 * Helper function to generate mock sitemap (mirrors the updated generateSitemap behavior)
 */
function generateMockSitemap(articles, docsFiles = []) {
  const BASE_URL = 'https://euparliamentmonitor.com';
  const urls = [];

  // Add home pages for each language
  const languages = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
  
  for (const lang of languages) {
    const filename = lang === 'en' ? 'index.html' : `index-${lang}.html`;
    urls.push({
      loc: `${BASE_URL}/${filename}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '1.0',
    });
  }

  // Add sitemap HTML pages for each language
  for (const lang of languages) {
    const filename = lang === 'en' ? 'sitemap.html' : `sitemap_${lang}.html`;
    urls.push({
      loc: `${BASE_URL}/${filename}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '0.5',
    });
  }

  // Add RSS feed
  urls.push({
    loc: `${BASE_URL}/rss.xml`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '0.5',
  });

  // Add news articles
  for (const article of articles) {
    urls.push({
      loc: `${BASE_URL}/news/${article}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.8',
    });
  }

  // Add docs files
  for (const docFile of docsFiles) {
    urls.push({
      loc: `${BASE_URL}/${docFile}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.3',
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
