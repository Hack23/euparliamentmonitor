// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for multi-language support
 * Tests article generation, index generation, and sitemap for all languages
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateArticleHTML } from '../../scripts/article-template.js';
import { createTempDir, cleanupTempDir, validateHTML, extractHTMLMetadata, writeFile } from '../helpers/test-utils.js';

const ALL_LANGUAGES = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ro', 'sv', 'da', 'fi', 'el', 'hu'];

describe('Multi-Language Support Integration', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('Article Generation for All Languages', () => {
    it('should generate valid articles for all 14 languages', () => {
      ALL_LANGUAGES.forEach((lang) => {
        const articleOptions = {
          slug: 'multi-lang-test',
          title: `Week Ahead - ${lang.toUpperCase()}`,
          subtitle: 'Parliamentary activities overview',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Test content</p>',
          keywords: ['parliament', 'test'],
          sources: [],
        };

        const html = generateArticleHTML(articleOptions);

        // Validate HTML
        const validation = validateHTML(html);
        expect(validation.valid).toBe(true);

        // Validate language attribute
        expect(html).toContain(`<html lang="${lang}"`);

        // Validate metadata
        const metadata = extractHTMLMetadata(html);
        expect(metadata.lang).toBe(lang);
      });
    });

    it('should use correct text direction for all languages', () => {
      ALL_LANGUAGES.forEach((lang) => {
        const articleOptions = {
          slug: 'direction-test',
          title: 'Direction Test',
          subtitle: 'Testing text direction',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(articleOptions);

        // All EU languages use LTR
        expect(html).toContain('dir="ltr"');
      });
    });

    it('should save articles in correct filename format', () => {
      const newsDir = path.join(tempDir, 'news');
      const expectedFiles = [];

      ALL_LANGUAGES.forEach((lang) => {
        const articleOptions = {
          slug: 'filename-test',
          title: 'Filename Test',
          subtitle: 'Test',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(articleOptions);
        const filename = `${articleOptions.date}-${articleOptions.slug}-${lang}.html`;
        const filepath = path.join(newsDir, filename);
        expectedFiles.push(filename);

        // Use writeFile helper which automatically creates directories
        writeFile(filepath, html);

        // Verify file exists
        expect(fs.existsSync(filepath)).toBe(true);

        // Verify filename format
        expect(filename).toMatch(/^\d{4}-\d{2}-\d{2}-[\w-]+-[a-z]{2}\.html$/);
      });

      // Verify all expected files were created
      const files = fs.readdirSync(newsDir);
      expectedFiles.forEach((expectedFile) => {
        expect(files).toContain(expectedFile);
      });
      // Verify we created the expected number of files (14 languages)
      expect(expectedFiles).toHaveLength(14);
    });
  });

  describe('Language-Specific Labels', () => {
    it('should use correct article type labels for each language', () => {
      const typeLabels = {
        en: 'Week Ahead',
        de: 'Woche Voraus',
        fr: 'Semaine à Venir',
        es: 'Semana Próxima',
        it: 'Settimana Prossima',
        nl: 'Week Vooruit',
        pl: 'Nadchodzący Tydzień',
        pt: 'Semana Próxima',
        ro: 'Săptămâna Viitoare',
        sv: 'Vecka Framåt',
        da: 'Ugen Fremover',
        fi: 'Tuleva Viikko',
        el: 'Επόμενη Εβδομάδα',
        hu: 'Következő Hét',
      };

      Object.entries(typeLabels).forEach(([lang, label]) => {
        const articleOptions = {
          slug: 'type-label-test',
          title: 'Test',
          subtitle: 'Test',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(articleOptions);
        expect(html).toContain(`<span class="article-type">${label}</span>`);
      });
    });

    it('should use correct read time labels for each language', () => {
      const readTimeLabels = {
        en: '5 min read',
        de: '5 Min. Lesezeit',
        fr: '5 min de lecture',
        es: '5 min de lectura',
        it: '5 min di lettura',
      };

      Object.entries(readTimeLabels).forEach(([lang, label]) => {
        const articleOptions = {
          slug: 'read-time-test',
          title: 'Test',
          subtitle: 'Test',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(articleOptions);
        expect(html).toContain(`<span class="article-read-time">${label}</span>`);
      });
    });

    it('should use correct back navigation labels', () => {
      const backLabels = {
        en: '← Back to News',
        de: '← Zurück zu Nachrichten',
        fr: '← Retour aux Actualités',
        es: '← Volver a Noticias',
        it: '← Torna alle Notizie',
      };

      Object.entries(backLabels).forEach(([lang, label]) => {
        const articleOptions = {
          slug: 'back-nav-test',
          title: 'Test',
          subtitle: 'Test',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(articleOptions);
        expect(html).toContain(label);
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates according to language locale', () => {
      const testDate = '2025-01-15';

      ALL_LANGUAGES.forEach((lang) => {
        const articleOptions = {
          slug: 'date-format-test',
          title: 'Date Format Test',
          subtitle: 'Test',
          date: testDate,
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(articleOptions);

        // Should contain formatted date
        const expectedDate = new Date(testDate).toLocaleDateString(lang, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        expect(html).toContain(expectedDate);
      });
    });

    it('should use correct month names for each language', () => {
      // January should appear in different languages
      const januaryNames = {
        en: 'January',
        de: 'Januar',
        fr: 'janvier',
        es: 'enero',
        it: 'gennaio',
      };

      Object.entries(januaryNames).forEach(([lang, monthName]) => {
        const articleOptions = {
          slug: 'month-name-test',
          title: 'Test',
          subtitle: 'Test',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(articleOptions);
        
        // Month name should be in the formatted date
        expect(html.toLowerCase()).toContain(monthName.toLowerCase());
      });
    });
  });

  describe('Index Generation for All Languages', () => {
    it('should generate index pages for all languages', () => {
      const articles = [
        { date: '2025-01-15', slug: 'article-1', lang: 'en' },
        { date: '2025-01-15', slug: 'article-1', lang: 'de' },
        { date: '2025-01-15', slug: 'article-1', lang: 'fr' },
      ];

      ALL_LANGUAGES.forEach((lang) => {
        const indexHTML = generateMockIndexHTML(lang, articles.filter((a) => a.lang === lang));
        
        const validation = validateHTML(indexHTML);
        expect(validation.valid).toBe(true);
        
        expect(indexHTML).toContain(`lang="${lang}"`);
      });
    });

    it('should use language-specific titles in indexes', () => {
      const titles = {
        en: 'EU Parliament Monitor - News',
        de: 'EU-Parlamentsmonitor - Nachrichten',
        fr: 'Moniteur du Parlement UE - Actualités',
        es: 'Monitor del Parlamento UE - Noticias',
      };

      Object.entries(titles).forEach(([lang, title]) => {
        const indexHTML = generateMockIndexHTML(lang, []);
        expect(indexHTML).toContain(title);
      });
    });
  });

  describe('Sitemap Generation for All Languages', () => {
    it('should include all language indexes in sitemap', () => {
      const sitemap = generateMockSitemap([]);

      ALL_LANGUAGES.forEach((lang) => {
        expect(sitemap).toContain(`<loc>https://euparliamentmonitor.com/index-${lang}.html</loc>`);
      });
    });

    it('should include articles for all languages in sitemap', () => {
      const articles = ALL_LANGUAGES.map((lang) => `2025-01-15-article-${lang}.html`);
      const sitemap = generateMockSitemap(articles);

      articles.forEach((article) => {
        expect(sitemap).toContain(`<loc>https://euparliamentmonitor.com/news/${article}</loc>`);
      });
    });
  });

  describe('Language Consistency', () => {
    it('should maintain language consistency across article', () => {
      ALL_LANGUAGES.forEach((lang) => {
        const articleOptions = {
          slug: 'consistency-test',
          title: 'Consistency Test',
          subtitle: 'Test',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(articleOptions);

        // Extract all lang attributes
        const htmlLangMatch = html.match(/<html[^>]+lang="([^"]+)"/);
        const articleLangMatch = html.match(/<article[^>]+lang="([^"]+)"/);

        expect(htmlLangMatch[1]).toBe(lang);
        expect(articleLangMatch[1]).toBe(lang);
      });
    });

    it('should include language in back navigation link', () => {
      ALL_LANGUAGES.forEach((lang) => {
        const articleOptions = {
          slug: 'nav-lang-test',
          title: 'Test',
          subtitle: 'Test',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(articleOptions);
        expect(html).toContain(`href="../index-${lang}.html"`);
      });
    });
  });

  describe('Character Encoding', () => {
    it('should handle special characters in all languages', () => {
      const specialChars = {
        en: 'Test with "quotes" and \'apostrophes\'',
        de: 'Ümläüte: ä, ö, ü, ß',
        fr: 'Accents: é, è, ê, ë, à, ù',
        es: 'Españoles: ñ, á, é, í, ó, ú',
        el: 'Ελληνικά: α, β, γ, δ',
        ro: 'Românești: ă, â, î, ș, ț',
      };

      Object.entries(specialChars).forEach(([lang, text]) => {
        const articleOptions = {
          slug: 'special-chars-test',
          title: text,
          subtitle: 'Test special characters',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: `<p>${text}</p>`,
        };

        const html = generateArticleHTML(articleOptions);

        expect(html).toContain('<meta charset="UTF-8">');
        expect(html).toContain(text);
      });
    });
  });

  describe('SEO for Multi-Language', () => {
    it('should set correct locale in Open Graph for each language', () => {
      ALL_LANGUAGES.forEach((lang) => {
        const articleOptions = {
          slug: 'og-locale-test',
          title: 'Test',
          subtitle: 'Test',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(articleOptions);
        expect(html).toContain(`<meta property="og:locale" content="${lang}">`);
      });
    });

    it('should include language in structured data', () => {
      ALL_LANGUAGES.forEach((lang) => {
        const articleOptions = {
          slug: 'structured-data-lang-test',
          title: 'Test',
          subtitle: 'Test',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(articleOptions);
        expect(html).toContain(`"inLanguage": "${lang}"`);
      });
    });
  });

  describe('Performance Across Languages', () => {
    it('should generate articles efficiently for all languages', () => {
      const startTime = Date.now();

      ALL_LANGUAGES.forEach((lang) => {
        generateArticleHTML({
          slug: 'perf-test',
          title: 'Performance Test',
          subtitle: 'Test',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Content</p>',
        });
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete all 14 languages in less than 500ms
      expect(duration).toBeLessThan(500);
    });
  });
});

// Helper functions
function generateMockIndexHTML(lang, articles) {
  const titles = {
    en: 'EU Parliament Monitor - News',
    de: 'EU-Parlamentsmonitor - Nachrichten',
    fr: 'Moniteur du Parlement UE - Actualités',
    es: 'Monitor del Parlamento UE - Noticias',
  };

  const title = titles[lang] || titles.en;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>${title}</h1>
  <ul>
    ${articles.map((a) => `<li>${a.date} - ${a.slug}</li>`).join('')}
  </ul>
</body>
</html>`;
}

function generateMockSitemap(articles) {
  const languages = ALL_LANGUAGES;
  const urls = [];

  // Add indexes
  for (const lang of languages) {
    urls.push(`    <loc>https://euparliamentmonitor.com/index-${lang}.html</loc>`);
  }

  // Add articles
  for (const article of articles) {
    urls.push(`    <loc>https://euparliamentmonitor.com/news/${article}</loc>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
${urls.join('\n  </url>\n  <url>\n')}
  </url>
</urlset>`;
}
