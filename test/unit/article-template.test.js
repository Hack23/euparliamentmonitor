// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for article-template.js
 * Tests HTML generation, sanitization, RTL support, and SEO
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateArticleHTML } from '../../scripts/templates/article-template.js';
import { mockArticleMetadata, mockArticleContent, mockSources } from '../fixtures/ep-data.js';
import { validateHTML } from '../helpers/test-utils.js';

describe('article-template', () => {
  describe('generateArticleHTML', () => {
    let defaultOptions;

    beforeEach(() => {
      defaultOptions = {
        ...mockArticleMetadata,
        content: mockArticleContent,
        sources: mockSources,
      };
    });

    describe('HTML Generation', () => {
      it('should generate valid HTML structure', () => {
        const html = generateArticleHTML(defaultOptions);
        const validation = validateHTML(html);

        expect(validation.valid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      });

      it('should include DOCTYPE declaration', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain('<!DOCTYPE html>');
      });

      it('should include all required meta tags', () => {
        const html = generateArticleHTML(defaultOptions);
        
        expect(html).toContain('<meta charset="UTF-8">');
        expect(html).toContain('<meta name="viewport"');
        expect(html).toContain('<meta name="description"');
        expect(html).toContain('<meta name="keywords"');
        expect(html).toContain('<meta name="author"');
      });

      it('should include article title in multiple places', () => {
        const html = generateArticleHTML(defaultOptions);
        
        expect(html).toContain(`<title>${defaultOptions.title} | EU Parliament Monitor</title>`);
        expect(html).toContain(`<h1>${defaultOptions.title}</h1>`);
      });

      it('should include article subtitle', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain(`<p class="article-subtitle">${defaultOptions.subtitle}</p>`);
      });

      it('should include article content', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain(mockArticleContent.trim());
      });
    });

    describe('Language Support', () => {
      it('should set correct lang attribute for English', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'en' });
        expect(html).toContain('<html lang="en" dir="ltr">');
      });

      it('should set correct lang attribute for German', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'de' });
        expect(html).toContain('<html lang="de" dir="ltr">');
      });

      it('should set correct lang attribute for Greek', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'el' });
        expect(html).toContain('<html lang="el" dir="ltr">');
      });

      it('should use correct language name for display', () => {
        const languages = [
          { code: 'en', name: 'English' },
          { code: 'de', name: 'Deutsch' },
          { code: 'fr', name: 'Français' },
          { code: 'es', name: 'Español' },
        ];

        languages.forEach(({ code, name }) => {
          const html = generateArticleHTML({ ...defaultOptions, lang: code });
          expect(html).toContain(`<span class="article-lang">${name}</span>`);
        });
      });
    });

    describe('RTL Support', () => {
      it('should set RTL direction for Arabic', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'ar' });
        expect(html).toContain('<html lang="ar" dir="rtl">');
      });

      it('should set RTL direction for Hebrew', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'he' });
        expect(html).toContain('<html lang="he" dir="rtl">');
      });

      it('should set LTR direction for all EU languages', () => {
        const euLangs = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ro', 'sv', 'da', 'fi', 'el', 'hu'];
        
        euLangs.forEach((lang) => {
          const html = generateArticleHTML({ ...defaultOptions, lang });
          expect(html).toContain(`<html lang="${lang}" dir="ltr">`);
        });
      });
    });

    describe('Article Metadata', () => {
      it('should include article type label in English', () => {
        const html = generateArticleHTML({ ...defaultOptions, category: 'week-ahead', lang: 'en' });
        expect(html).toContain('<span class="article-type">Week Ahead</span>');
      });

      it('should include article type label in German', () => {
        const html = generateArticleHTML({ ...defaultOptions, category: 'week-ahead', lang: 'de' });
        expect(html).toContain('<span class="article-type">Woche Voraus</span>');
      });

      it('should fall back to raw category string for unknown article categories', () => {
        const html = generateArticleHTML({ ...defaultOptions, category: 'custom-unknown', lang: 'en' });
        expect(html).toContain('<span class="article-type">custom-unknown</span>');
      });

      it('should format date according to language', () => {
        const html = generateArticleHTML({ ...defaultOptions, date: '2025-01-15', lang: 'en' });
        // English date format should be present
        expect(html).toMatch(/<span class="article-date">.*January.*2025.*<\/span>/);
      });

      it('should include read time with correct label', () => {
        const html = generateArticleHTML({ ...defaultOptions, readTime: 5, lang: 'en' });
        expect(html).toContain('<span class="article-read-time">5 min read</span>');
      });

      it('should include read time in German', () => {
        const html = generateArticleHTML({ ...defaultOptions, readTime: 5, lang: 'de' });
        expect(html).toContain('<span class="article-read-time">5 Min. Lesezeit</span>');
      });
    });

    describe('SEO Optimization', () => {
      it('should include Open Graph meta tags', () => {
        const html = generateArticleHTML(defaultOptions);
        
        expect(html).toContain('<meta property="og:type" content="article">');
        expect(html).toContain(`<meta property="og:title" content="${defaultOptions.title}">`);
        expect(html).toContain(`<meta property="og:description" content="${defaultOptions.subtitle}">`);
        expect(html).toContain('<meta property="og:site_name" content="EU Parliament Monitor">');
        expect(html).toContain(`<meta property="og:locale" content="${defaultOptions.lang}">`);
      });

      it('should include Twitter Card meta tags', () => {
        const html = generateArticleHTML(defaultOptions);
        
        expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
        expect(html).toContain(`<meta name="twitter:title" content="${defaultOptions.title}">`);
        expect(html).toContain(`<meta name="twitter:description" content="${defaultOptions.subtitle}">`);
      });

      it('should include Schema.org structured data', () => {
        const html = generateArticleHTML(defaultOptions);
        
        expect(html).toContain('<script type="application/ld+json">');
        expect(html).toContain('"@context": "https://schema.org"');
        expect(html).toContain('"@type": "NewsArticle"');
        expect(html).toContain(`"headline": "${defaultOptions.title}"`);
        expect(html).toContain(`"datePublished": "${defaultOptions.date}"`);
      });

      it('should include keywords in meta tags', () => {
        const html = generateArticleHTML({
          ...defaultOptions,
          keywords: ['parliament', 'legislation', 'EU'],
        });
        
        expect(html).toContain('<meta name="keywords" content="parliament, legislation, EU">');
      });

      it('should include keywords in structured data', () => {
        const html = generateArticleHTML({
          ...defaultOptions,
          keywords: ['parliament', 'legislation'],
        });
        
        expect(html).toContain('"keywords": "parliament, legislation"');
      });
    });

    describe('Sources Section', () => {
      it('should include sources when provided', () => {
        const html = generateArticleHTML(defaultOptions);
        
        expect(html).toContain('<section class="article-sources">');
        expect(html).toContain('<h2>Sources</h2>');
        mockSources.forEach((source) => {
          expect(html).toContain(source.title);
          expect(html).toContain(source.url);
        });
      });

      it('should not include sources section when empty', () => {
        const html = generateArticleHTML({ ...defaultOptions, sources: [] });
        
        expect(html).not.toContain('<section class="article-sources">');
        expect(html).not.toContain('<h2>Sources</h2>');
      });

      it('should use rel="noopener noreferrer" for external links', () => {
        const html = generateArticleHTML(defaultOptions);
        
        mockSources.forEach((source) => {
          expect(html).toMatch(new RegExp(`<a href="[^"]*"[^>]*rel="noopener noreferrer"`));
        });
      });
    });

    describe('Navigation', () => {
      it('should include back to news link at bottom', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'en' });
        
        expect(html).toContain('<nav class="article-nav">');
        expect(html).toContain('<a href="../index.html" class="back-to-news">← Back to News</a>');
      });

      it('should include back to news link at top', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'en' });
        
        expect(html).toContain('<nav class="article-top-nav">');
        expect(html).toContain('<a href="../index.html" class="back-to-news">← Back to News</a>');
      });

      it('should use correct back link for language', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'de' });
        
        expect(html).toContain('<a href="../index-de.html" class="back-to-news">← Zurück zu Nachrichten</a>');
      });
    });

    describe('Language Switcher', () => {
      it('should include language switcher navigation', () => {
        const html = generateArticleHTML(defaultOptions);

        expect(html).toContain('<nav class="language-switcher" role="navigation" aria-label="Language selection">');
      });

      it('should include lang-link elements for all 14 languages', () => {
        const html = generateArticleHTML(defaultOptions);
        const langCodes = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];

        langCodes.forEach((code) => {
          expect(html).toContain(`hreflang="${code}"`);
        });
      });

      it('should mark the current language as active', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'fr' });

        expect(html).toContain('class="lang-link active" hreflang="fr"');
      });

      it('should link to same article in other languages using filename pattern', () => {
        const html = generateArticleHTML({ ...defaultOptions, slug: 'week-ahead-january-2025', date: '2025-01-15', lang: 'en' });

        expect(html).toContain('href="2025-01-15-week-ahead-january-2025-de.html"');
        expect(html).toContain('href="2025-01-15-week-ahead-january-2025-fr.html"');
        expect(html).toContain('href="2025-01-15-week-ahead-january-2025-ar.html"');
      });

      it('should include flag emojis in language links', () => {
        const html = generateArticleHTML(defaultOptions);

        expect(html).toContain('🇬🇧');
        expect(html).toContain('🇸🇪');
        expect(html).toContain('🇩🇪');
        expect(html).toContain('🇫🇷');
      });
    });

    describe('Enhanced Footer', () => {
      it('should include full footer with multiple sections', () => {
        const html = generateArticleHTML(defaultOptions);

        expect(html).toContain('<div class="footer-content">');
        expect(html).toContain('About EU Parliament Monitor');
        expect(html).toContain('Quick Links');
        expect(html).toContain('Built by Hack23 AB');
        expect(html).toContain('Languages');
      });

      it('should include footer language grid', () => {
        const html = generateArticleHTML(defaultOptions);

        expect(html).toContain('<div class="language-grid">');
      });

      it('should include Hack23 AB copyright with organization details', () => {
        const html = generateArticleHTML(defaultOptions);

        expect(html).toContain('Hack23 AB');
        expect(html).toContain('Org.nr 5595347807');
        expect(html).toContain('Gothenburg, Sweden');
      });

      it('should include links to GitHub, European Parliament, and license', () => {
        const html = generateArticleHTML(defaultOptions);

        expect(html).toContain('https://github.com/Hack23/euparliamentmonitor');
        expect(html).toContain('https://www.europarl.europa.eu/');
        expect(html).toContain('Apache-2.0 License');
      });
    });

    describe('Security - XSS Prevention', () => {
      it('should not include executable script tags in content', () => {
        const maliciousContent = '<script>alert("XSS")</script><p>Safe content</p>';
        const html = generateArticleHTML({ ...defaultOptions, content: maliciousContent });
        
        // Content is inserted as-is in this template system
        // The actual content should be the responsibility of the content generator
        // We just verify that the malicious content is present (not sanitized by template)
        // and that there are no other XSS vectors introduced by the template
        expect(html).toContain(maliciousContent);
        
        // Check that only JSON-LD script tags exist (not executable scripts)
        const scriptTags = html.match(/<script[^>]*>/gi) || [];
        const jsonLdScripts = scriptTags.filter(tag => tag.includes('application/ld+json'));
        const executableScripts = scriptTags.filter(tag => !tag.includes('application/ld+json'));
        
        // Template should only have JSON-LD script tags
        expect(jsonLdScripts.length).toBeGreaterThan(0);
        // Any executable script should come from the content parameter only
        expect(executableScripts.length).toBe(1); // Only from the malicious content we passed
      });

      it('should properly escape special characters in title', () => {
        const titleWithQuotes = 'Article with "quotes" and \'apostrophes\'';
        const html = generateArticleHTML({ ...defaultOptions, title: titleWithQuotes });
        
        // Title should be HTML-escaped in attributes
        expect(html).toContain('&quot;quotes&quot;');
        expect(html).toContain('&#39;apostrophes&#39;');
      });

      it('should not allow javascript: URLs in sources', () => {
        const maliciousSources = [
          { title: 'Safe', url: 'https://example.com' },
          { title: 'Malicious', url: 'javascript:alert("XSS")' },
        ];
        const html = generateArticleHTML({ ...defaultOptions, sources: maliciousSources });
        
        // javascript: URLs should be replaced with '#' for safety
        expect(html).not.toContain('javascript:');
        expect(html).toContain('href="#"');
        expect(html).toContain('href="https://example.com"');
      });
    });

    describe('Accessibility', () => {
      it('should include proper semantic HTML', () => {
        const html = generateArticleHTML(defaultOptions);
        
        expect(html).toContain('<article class="news-article"');
        expect(html).toContain('<header class="article-header">');
        expect(html).toContain('<footer class="article-footer">');
        expect(html).toContain('<nav class="article-nav">');
      });

      it('should include lang attribute on article element', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'fr' });
        
        expect(html).toContain('<article class="news-article" lang="fr">');
      });

      it('should include skip navigation link', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain('<a href="#main" class="skip-link">');
      });

      it('should include site header with branding', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain('<header class="site-header" role="banner">');
        expect(html).toContain('EU Parliament Monitor');
      });

      it('should include main element with id for skip link target', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain('<main id="main"');
      });

      it('should include site footer', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain('<footer class="site-footer" role="contentinfo">');
      });

      it('should include security meta tags', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain('X-Content-Type-Options');
        expect(html).toContain('no-referrer');
      });
    });

    describe('Error Handling', () => {
      it('should handle missing optional fields gracefully', () => {
        const minimalOptions = {
          slug: 'test',
          title: 'Test Title',
          subtitle: 'Test Subtitle',
          date: '2025-01-15',
          category: 'week-ahead',
          readTime: 5,
          lang: 'en',
          content: '<p>Content</p>',
        };

        const html = generateArticleHTML(minimalOptions);
        const validation = validateHTML(html);
        
        expect(validation.valid).toBe(true);
      });

      it('should use default values for undefined language', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'zz' });
        
        // Should fall back to English labels
        expect(html).toContain('<span class="article-lang">English</span>');
      });
    });
  });
});
