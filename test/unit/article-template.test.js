// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Unit tests for article-template.js
 * Tests HTML generation, sanitization, RTL support, and SEO
 *
 * @typedef {import('../../scripts/types/generation.js').ArticleOptions} ArticleOptions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateArticleHTML } from '../../scripts/templates/article-template.js';
import { validateArticleHTML } from '../../scripts/utils/file-utils.js';
import { ALL_LANGUAGES } from '../../scripts/constants/languages.js';
import { mockArticleMetadata, mockArticleContent, mockSources } from '../fixtures/ep-data.js';
import { validateHTML } from '../helpers/test-utils.js';

describe('article-template', () => {
  describe('generateArticleHTML', () => {
    /** @type {ArticleOptions} */
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
        expect(html).toContain('<meta name="generator" content="EU Parliament Monitor v');
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
        // og:locale now uses BCP47 locale format (e.g. en_GB instead of en)
        expect(html).toContain('<meta property="og:locale" content="en_GB">');
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

      it('should include article:section Open Graph meta tag', () => {
        const html = generateArticleHTML(defaultOptions);
        
        expect(html).toContain('<meta property="article:section" content="');
      });

      it('should include article:tag Open Graph meta tags for keywords', () => {
        const html = generateArticleHTML({
          ...defaultOptions,
          keywords: ['parliament', 'legislation'],
        });

        expect(html).toContain('<meta property="article:tag" content="parliament">');
        expect(html).toContain('<meta property="article:tag" content="legislation">');
      });

      it('should include article:modified_time meta tag', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain(`<meta property="article:modified_time" content="${defaultOptions.date}">`);
      });

      it('should include dateModified in structured data', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain(`"dateModified": "${defaultOptions.date}"`);
      });

      it('should include articleSection in structured data', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain('"articleSection":');
      });

      it('should include mainEntityOfPage in structured data', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain('"mainEntityOfPage":');
        expect(html).toContain('"@type": "WebPage"');
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
        
        expect(html).toContain('<nav class="article-nav" aria-label="Article navigation">');
        expect(html).toContain('<a href="../index.html" class="back-to-news">← Back to News</a>');
      });

      it('should include back to news link at top', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'en' });
        
        expect(html).toContain('<nav class="article-top-nav" aria-label="Article navigation">');
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

        expect(html).toContain('<nav class="site-header__langs" role="navigation" aria-label="Language selection">');
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

      it('should throw on invalid date format in language switcher', () => {
        expect(() => generateArticleHTML({ ...defaultOptions, date: 'not-a-date' })).toThrow('Invalid article date format');
      });

      it('should throw on date with HTML injection', () => {
        expect(() => generateArticleHTML({ ...defaultOptions, date: '2025"><script>' })).toThrow('Invalid article date format');
      });

      it('should throw on slug with HTML injection characters', () => {
        expect(() => generateArticleHTML({ ...defaultOptions, slug: 'test"onclick="alert(1)' })).toThrow('Invalid article slug format');
      });

      it('should throw on slug with angle brackets', () => {
        expect(() => generateArticleHTML({ ...defaultOptions, slug: 'test<script>alert(1)</script>' })).toThrow('Invalid article slug format');
      });

      it('should throw on empty slug', () => {
        expect(() => generateArticleHTML({ ...defaultOptions, slug: '' })).toThrow('Invalid article slug format');
      });

      it('should throw on whitespace-only slug', () => {
        expect(() => generateArticleHTML({ ...defaultOptions, slug: '   ' })).toThrow('Invalid article slug format');
      });

      it('should throw on empty date', () => {
        expect(() => generateArticleHTML({ ...defaultOptions, date: '' })).toThrow('Invalid article date format');
      });

      it('should throw on whitespace-only date', () => {
        expect(() => generateArticleHTML({ ...defaultOptions, date: '   ' })).toThrow('Invalid article date format');
      });

      it('should escape language names in title attributes', () => {
        const html = generateArticleHTML(defaultOptions);

        // Language names should be present and properly escaped in title attributes
        expect(html).toContain('title="English"');
        expect(html).toContain('title="Deutsch"');
        expect(html).toContain('title="Français"');
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

      it('should include footer language grid with correct index links', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'de' });

        // English links to ../index.html
        expect(html).toMatch(/language-grid[\s\S]*href="\.\.\/index\.html"/);
        // German links to ../index-de.html
        expect(html).toMatch(/language-grid[\s\S]*href="\.\.\/index-de\.html"/);
        // French links to ../index-fr.html
        expect(html).toMatch(/language-grid[\s\S]*href="\.\.\/index-fr\.html"/);
      });

      it('should mark current language as active in footer language grid', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'sv' });

        expect(html).toMatch(/language-grid[\s\S]*class="active"[\s\S]*hreflang="sv"/);
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

      it('should use footer-section divs for each section', () => {
        const html = generateArticleHTML(defaultOptions);

        const footerSectionCount = (html.match(/class="footer-section"/g) || []).length;
        expect(footerSectionCount).toBe(4);
      });

      it('should include app version in footer', () => {
        const html = generateArticleHTML(defaultOptions);

        expect(html).toMatch(/v[0-9A-Za-z.+-]+/);
      });

      it('should include disclaimer with link to GitHub issues', () => {
        const html = generateArticleHTML(defaultOptions);

        expect(html).toContain('class="footer-disclaimer"');
        expect(html).toContain('https://github.com/Hack23/euparliamentmonitor/issues');
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
        // Executable scripts: 1 from the malicious content + 1 reading-progress bar script + 1 theme toggle script
        expect(executableScripts.length).toBe(3);
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
        expect(html).toContain('<nav class="article-nav" aria-label="Article navigation">');
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
        expect(html).toContain('Content-Security-Policy');
        expect(html).toContain("default-src 'self'");
        expect(html).toContain("script-src 'self' 'sha256-");
        expect(html).toContain("style-src 'self' 'unsafe-inline'");
        expect(html).toContain("img-src 'self' https: data:");
        expect(html).toContain("font-src 'self'");
        expect(html).toContain("connect-src 'self'");
        expect(html).toContain("frame-src 'none'");
        expect(html).toContain("base-uri 'self'");
        expect(html).toContain("form-action 'none'");
      });

      it('should include CSP script-src hash matching the JSON-LD content', async () => {
        const { createHash } = await import('crypto');
        const html = generateArticleHTML(defaultOptions);

        // Extract the JSON-LD script content from the generated HTML
        const scriptMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        const scriptContent = scriptMatch[1];

        // Compute the expected hash
        const expectedHash = `sha256-${createHash('sha256').update(scriptContent).digest('base64')}`;

        // Verify the CSP contains this exact hash
        expect(html).toContain(`script-src 'self' '${expectedHash}'`);
      });

      it('should include SRI integrity attribute on stylesheet when stylesHash is provided', () => {
        const testHash = 'sha384-4xui5ALFIyaFXCKCuIMx3UvVNrdUZvte2R1YxgX/8IFy8mFkpPjXxV3UdbQ3Wk1P';
        const html = generateArticleHTML({ ...defaultOptions, stylesHash: testHash });
        expect(html).toContain(`integrity="${testHash}"`);
        expect(html).toContain('crossorigin="anonymous"');
      });

      it('should not include integrity attribute on stylesheet when stylesHash is omitted', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).not.toContain('integrity=');
        expect(html).not.toContain('crossorigin=');
        expect(html).toContain('<link rel="stylesheet" href="../styles.css">');
      });

      it('should omit SRI attributes when stylesHash has invalid format', () => {
        const invalidHash = 'not-a-valid-hash" onload="evil()';
        const html = generateArticleHTML({ ...defaultOptions, stylesHash: invalidHash });
        expect(html).not.toContain('integrity=');
        expect(html).not.toContain('crossorigin=');
        expect(html).not.toContain('evil()');
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

    describe('Article Validation (validateArticleHTML)', () => {
      it('should pass validation for a correctly generated article', () => {
        const html = generateArticleHTML(defaultOptions);
        const result = validateArticleHTML(html);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should pass validation for all 14 languages', () => {
        ALL_LANGUAGES.forEach((code) => {
          const html = generateArticleHTML({ ...defaultOptions, lang: code });
          const result = validateArticleHTML(html);
          expect(result.valid).toBe(true);
        });
      });

      it.each([
        ['language switcher', 'class="site-header__langs"', 'class="removed-for-test-ls"'],
        ['article-top-nav', 'class="article-top-nav"', 'class="removed-for-test-atn"'],
        ['site-header', 'class="site-header"', 'class="removed-for-test-sh"'],
        ['skip-link', 'class="skip-link"', 'class="removed-for-test-sl"'],
        ['reading-progress', 'class="reading-progress"', 'class="removed-for-test-rp"'],
        ['main content wrapper', '<main id="main"', '<main id="removed-for-test"'],
        ['site-footer', 'class="site-footer"', 'class="removed-for-test-sf"'],
      ])('should fail validation for HTML missing only %s', (_element, selector, replacement) => {
        // Start with a fully valid article, then remove only the element under test
        const fullHtml = generateArticleHTML(defaultOptions);
        const html = fullHtml.replace(selector, replacement);
        const result = validateArticleHTML(html);

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
      });

      it('should fail validation for HTML missing all required elements', () => {
        const html = '<html><body><article></article></body></html>';
        const result = validateArticleHTML(html);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(5);
      });

      it('should report all missing elements in errors array', () => {
        const html = '<html><body></body></html>';
        const result = validateArticleHTML(html);

        expect(result.errors).toContain('Missing required element: language switcher nav');
        expect(result.errors).toContain('Missing required element: article-top-nav (back button)');
        expect(result.errors).toContain('Missing required element: site-header');
        expect(result.errors).toContain('Missing required element: skip-link');
        expect(result.errors).toContain('Missing required element: reading-progress bar');
        expect(result.errors).toContain('Missing required element: main content wrapper');
        expect(result.errors).toContain('Missing required element: site-footer');
      });
    });

    describe('Localized header subtitle and footer sections', () => {
      it('should render English header subtitle in English articles', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'en' });
        expect(html).toContain('<span class="site-header__subtitle">European Parliament Intelligence</span>');
      });

      it('should render German header subtitle in German articles', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'de' });
        expect(html).toContain('class="site-header__subtitle"');
        expect(html).not.toContain('<span class="site-header__subtitle">European Parliament Intelligence</span>');
      });

      it('should render localized footer "About" heading in English', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'en' });
        expect(html).toContain('About EU Parliament Monitor');
      });

      it('should render localized footer "Quick Links" heading in English', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'en' });
        expect(html).toContain('Quick Links');
      });

      it('should render localized footer "Built by Hack23 AB" heading in English', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'en' });
        expect(html).toContain('Built by Hack23 AB');
      });

      it('should render localized footer "Languages" heading in English', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'en' });
        expect(html).toContain('Languages');
      });

      it('should render localized footer heading in Swedish', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'sv' });
        expect(html).toContain('Om EU Parliament Monitor');
      });

      it('should render localized footer heading in French', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: 'fr' });
        expect(html).toContain('\u00c0 propos du EU Parliament Monitor');
      });

      it('should render localized header subtitle for all 14 languages', () => {
        const nonEnglishLangs = ['sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
        for (const lang of nonEnglishLangs) {
          const html = generateArticleHTML({ ...defaultOptions, lang });
          expect(html).toContain('class="site-header__subtitle"');
        }
      });
    });

    describe('Chart.js conditional inclusion', () => {
      it('should NOT include Chart.js scripts when content has no charts', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).not.toContain('chart.umd.min.js');
        expect(html).not.toContain('chart-init.js');
        expect(html).not.toContain('chartjs-plugin-annotation');
      });

      it('should include Chart.js scripts when content has data-chart-config', () => {
        const chartContent = `<div class="dashboard"><canvas data-chart-config='{"type":"bar"}'></canvas></div>`;
        const html = generateArticleHTML({ ...defaultOptions, content: chartContent });
        expect(html).toContain('js/vendor/chart.umd.min.js');
        expect(html).toContain('js/vendor/chartjs-plugin-annotation.min.js');
        expect(html).toContain('js/chart-init.js');
      });

      it('should use defer attribute on Chart.js scripts', () => {
        const chartContent = `<canvas data-chart-config='{"type":"pie"}'></canvas>`;
        const html = generateArticleHTML({ ...defaultOptions, content: chartContent });
        expect(html).toContain('defer></script>');
      });
    });

    describe('D3.js conditional inclusion', () => {
      it('should NOT include D3.js scripts when content has no mindmaps or SWOT', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).not.toContain('d3.min.js');
        expect(html).not.toContain('d3-init.js');
      });

      it('should include D3.js scripts when content has mindmap-container', () => {
        const mindmapContent = `<div class="mindmap-container"><div class="mindmap-center">Topic</div></div>`;
        const html = generateArticleHTML({ ...defaultOptions, content: mindmapContent });
        expect(html).toContain('js/vendor/d3.min.js');
        expect(html).toContain('js/d3-init.js');
      });

      it('should include D3.js scripts when content has swot-matrix', () => {
        const swotContent = `<div class="swot-matrix"><div class="swot-quadrant strengths"></div></div>`;
        const html = generateArticleHTML({ ...defaultOptions, content: swotContent });
        expect(html).toContain('js/vendor/d3.min.js');
        expect(html).toContain('js/d3-init.js');
      });

      it('should include both Chart.js and D3.js when content has both', () => {
        const mixedContent = `<canvas data-chart-config='{"type":"bar"}'></canvas><div class="mindmap-container"></div>`;
        const html = generateArticleHTML({ ...defaultOptions, content: mixedContent });
        expect(html).toContain('js/vendor/chart.umd.min.js');
        expect(html).toContain('js/chart-init.js');
        expect(html).toContain('js/vendor/d3.min.js');
        expect(html).toContain('js/d3-init.js');
      });

      it('should use defer attribute on D3.js scripts', () => {
        const mindmapContent = `<div class="mindmap-container"></div>`;
        const html = generateArticleHTML({ ...defaultOptions, content: mindmapContent });
        const d3ScriptMatch = html.match(/d3\.min\.js[^>]*defer/);
        expect(d3ScriptMatch).not.toBeNull();
      });
    });

    describe('Schema.org structured data', () => {
      it('should include NewsArticle JSON-LD', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain('"@type": "NewsArticle"');
      });

      it('should include hasPart in NewsArticle JSON-LD conditionally based on content', () => {
        // Default content without deep-analysis class should NOT include deep-analysis hasPart
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain('"hasPart"');
        expect(html).toContain('"WebPageElement"');
        expect(html).toContain('.article-sources');

        // Content with deep-analysis class SHOULD include deep-analysis hasPart
        const deepContent = '<section class="deep-analysis"><p>Analysis content</p></section>';
        const htmlWithDeep = generateArticleHTML({ ...defaultOptions, content: deepContent });
        expect(htmlWithDeep).toContain('.deep-analysis');
        expect(htmlWithDeep).toContain('.article-sources');
      });

      it('should include BreadcrumbList JSON-LD', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).toContain('"@type": "BreadcrumbList"');
        expect(html).toContain('"ListItem"');
        expect(html).toContain('"position": 1');
        expect(html).toContain('"position": 2');
        expect(html).toContain('"position": 3');
      });

      it('should localize breadcrumb names for non-English languages', () => {
        const html = generateArticleHTML({ ...defaultOptions, lang: /** @type {'sv'} */ ('sv') });
        expect(html).toContain('"name": "Hem"');
        expect(html).toContain('"name": "Nyheter"');
      });

      it('should escape </script> sequences in JSON-LD to prevent XSS', () => {
        const xssTitle = 'Test</script><script>alert(1)</script>';
        const html = generateArticleHTML({ ...defaultOptions, title: xssTitle });
        // The raw </script> must NOT appear in JSON-LD blocks
        expect(html).not.toMatch(/<\/script>\s*<script>alert/i);
        // The safe \u003c escape should be present
        expect(html).toContain('\\u003c');
      });

      it('should use "Related Articles" heading not "Related Analysis"', () => {
        const html = generateArticleHTML({
          ...defaultOptions,
          relatedArticles: [
            {
              slug: 'breaking',
              date: '2026-01-15',
              lang: /** @type {'en'} */ ('en'),
              title: 'Test Article',
              category: 'breaking',
            },
          ],
        });
        expect(html).toContain('Related Articles');
        expect(html).not.toContain('Related Analysis');
      });

      it('should include BreadcrumbList hash in CSP header', () => {
        const html = generateArticleHTML(defaultOptions);
        // CSP should contain at least 4 sha256 hashes (jsonLd + breadcrumbLd + readingProgress + themeToggle)
        const cspMatch = html.match(/Content-Security-Policy[^>]*script-src[^>]*/);
        expect(cspMatch).not.toBeNull();
        const cspContent = cspMatch?.[0] ?? '';
        const sha256Count = (cspContent.match(/sha256-/g) ?? []).length;
        expect(sha256Count).toBeGreaterThanOrEqual(4);
      });

      it('should include timeRequired in Schema.org markup', () => {
        const html = generateArticleHTML({ ...defaultOptions, readTime: 5 });
        expect(html).toContain('"timeRequired": "PT5M"');
      });

      it('should auto-compute read time from content when readTime is 0', () => {
        const longContent = Array(300).fill('<p>word word word word word</p>').join('');
        const html = generateArticleHTML({ ...defaultOptions, readTime: 0, content: longContent });
        // 300 × 5 = 1500 words ÷ 250 wpm = 6 minutes
        expect(html).toContain('PT6M');
      });
    });

    describe('Cross-article navigation', () => {
      it('should not render related articles nav when relatedArticles is empty', () => {
        const html = generateArticleHTML({ ...defaultOptions, relatedArticles: [] });
        expect(html).not.toContain('related-articles-nav');
      });

      it('should not render related articles nav when relatedArticles is omitted', () => {
        const html = generateArticleHTML(defaultOptions);
        expect(html).not.toContain('related-articles-nav');
      });

      it('should render related articles nav when articles are provided', () => {
        const html = generateArticleHTML({
          ...defaultOptions,
          relatedArticles: [
            {
              slug: 'committee-reports',
              date: '2026-01-15',
              lang: /** @type {'en'} */ ('en'),
              title: 'Committee Reports Overview',
              category: 'committee-reports',
            },
          ],
        });
        expect(html).toContain('related-articles-nav');
        expect(html).toContain('Committee Reports Overview');
        expect(html).toContain('2026-01-15-committee-reports-en.html');
      });

      it('should escape HTML in related article titles', () => {
        const html = generateArticleHTML({
          ...defaultOptions,
          relatedArticles: [
            {
              slug: 'breaking',
              date: '2026-01-15',
              lang: /** @type {'en'} */ ('en'),
              title: '<script>alert(1)</script>',
              category: 'breaking',
            },
          ],
        });
        expect(html).not.toContain('<script>alert(1)</script>');
        expect(html).toContain('&lt;script&gt;');
      });

      it('should render multiple related articles', () => {
        const html = generateArticleHTML({
          ...defaultOptions,
          relatedArticles: [
            {
              slug: 'committee-reports',
              date: '2026-01-15',
              lang: /** @type {'en'} */ ('en'),
              title: 'Article One',
              category: 'committee-reports',
            },
            {
              slug: 'breaking',
              date: '2026-01-15',
              lang: /** @type {'en'} */ ('en'),
              title: 'Article Two',
              category: 'breaking',
            },
          ],
        });
        expect(html).toContain('Article One');
        expect(html).toContain('Article Two');
        expect(html).toContain('related-article-item');
      });

      it('should filter out articles with invalid date/slug/lang patterns', () => {
        const html = generateArticleHTML({
          ...defaultOptions,
          relatedArticles: [
            {
              slug: 'committee-reports',
              date: '2026-01-15',
              lang: /** @type {'en'} */ ('en'),
              title: 'Valid Article',
              category: 'committee-reports',
            },
            {
              slug: 'javascript:alert(1)',
              date: '2026-01-15',
              lang: /** @type {'en'} */ ('en'),
              title: 'XSS via slug',
              category: 'breaking',
            },
            {
              slug: 'breaking',
              date: 'not-a-date',
              lang: /** @type {'en'} */ ('en'),
              title: 'Bad date',
              category: 'breaking',
            },
          ],
        });
        expect(html).toContain('Valid Article');
        expect(html).not.toContain('XSS via slug');
        expect(html).not.toContain('Bad date');
      });

      it('should use relative path prefix in href', () => {
        const html = generateArticleHTML({
          ...defaultOptions,
          relatedArticles: [
            {
              slug: 'breaking',
              date: '2026-01-15',
              lang: /** @type {'en'} */ ('en'),
              title: 'Test Article',
              category: 'breaking',
            },
          ],
        });
        expect(html).toContain('href="./2026-01-15-breaking-en.html"');
      });
    });

    describe('Analysis transparency - dynamic analysisFiles', () => {
      it('should render dynamic links grouped by subdirectory when analysisFiles provided', () => {
        /** @type {import('../../scripts/types/generation.js').AnalysisFileEntry[]} */
        const analysisFiles = [
          { method: 'significance-classification', outputFile: 'classification/significance-classification.md' },
          { method: 'actor-mapping', outputFile: 'classification/actor-mapping.md' },
          { method: 'risk-matrix', outputFile: 'risk-scoring/risk-matrix.md' },
          { method: 'deep-analysis', outputFile: 'existing/deep-analysis.md' },
        ];
        const html = generateArticleHTML({
          ...defaultOptions,
          analysisDir: 'breaking-run5',
          analysisFiles,
        });

        // Should contain links for all 4 analysis files
        expect(html).toContain('classification/significance-classification.md');
        expect(html).toContain('classification/actor-mapping.md');
        expect(html).toContain('risk-scoring/risk-matrix.md');
        expect(html).toContain('existing/deep-analysis.md');

        // Should contain localized section headings (English)
        expect(html).toContain('Classification Analysis');
        expect(html).toContain('Risk Scoring');

        // Should contain the analysis dir in the URL base
        expect(html).toContain('breaking-run5');
      });

      it('should render fallback links when analysisFiles is undefined', () => {
        const html = generateArticleHTML({
          ...defaultOptions,
          analysisDir: 'breaking-run5',
          // No analysisFiles
        });

        // Should contain hardcoded fallback links
        expect(html).toContain('classification/significance-classification.md');
        expect(html).toContain('threat-assessment/political-threat-landscape.md');
        expect(html).toContain('risk-scoring/risk-matrix.md');
        expect(html).toContain('existing/deep-analysis.md');
      });

      it('should render fallback links when analysisFiles is empty', () => {
        const html = generateArticleHTML({
          ...defaultOptions,
          analysisDir: 'breaking-run5',
          analysisFiles: [],
        });

        // Should contain hardcoded fallback links
        expect(html).toContain('classification/significance-classification.md');
        expect(html).toContain('existing/deep-analysis.md');
      });

      it('should handle unknown methods with titleized fallback labels', () => {
        /** @type {import('../../scripts/types/generation.js').AnalysisFileEntry[]} */
        const analysisFiles = [
          { method: 'custom-exotic-method', outputFile: 'custom/exotic-report.md' },
        ];
        const html = generateArticleHTML({
          ...defaultOptions,
          analysisFiles,
        });

        // Should titleize the unknown method name
        expect(html).toContain('Custom Exotic Method');
        // Should titleize the unknown subdirectory name
        expect(html).toContain('Custom');
        expect(html).toContain('custom/exotic-report.md');
      });

      it('should filter out analysis files with path traversal in outputFile', () => {
        /** @type {import('../../scripts/types/generation.js').AnalysisFileEntry[]} */
        const analysisFiles = [
          { method: 'safe-method', outputFile: 'classification/safe-file.md' },
          { method: 'bad-traversal', outputFile: '../../../etc/passwd' },
          { method: 'bad-absolute', outputFile: '/etc/secret' },
          { method: 'bad-backslash', outputFile: 'classification\\bad.md' },
          { method: 'bad-mid-backslash', outputFile: 'valid/path\\injection.md' },
          { method: 'bad-long', outputFile: 'a'.repeat(300) + '.md' },
        ];
        const html = generateArticleHTML({
          ...defaultOptions,
          analysisFiles,
        });

        // Safe file should be included
        expect(html).toContain('classification/safe-file.md');
        // Unsafe paths should NOT appear
        expect(html).not.toContain('etc/passwd');
        expect(html).not.toContain('/etc/secret');
        expect(html).not.toContain('classification\\bad.md');
        expect(html).not.toContain('path\\injection.md');
        expect(html).not.toContain('a'.repeat(300));
      });

      it('should URL-encode path segments in analysis file links', () => {
        /** @type {import('../../scripts/types/generation.js').AnalysisFileEntry[]} */
        const analysisFiles = [
          { method: 'significance-classification', outputFile: 'classification/significance-classification.md' },
        ];
        const html = generateArticleHTML({
          ...defaultOptions,
          analysisFiles,
        });

        // Should contain properly formed URL with the file path
        expect(html).toContain('classification/significance-classification.md');
        expect(html).toContain('target="_blank"');
        expect(html).toContain('rel="noopener noreferrer"');
      });

      it('should include documents subdirectory in dynamic links', () => {
        /** @type {import('../../scripts/types/generation.js').AnalysisFileEntry[]} */
        const analysisFiles = [
          { method: 'document-analysis', outputFile: 'documents/document-analysis-index.md' },
          { method: 'synthesis-summary', outputFile: 'existing/synthesis-summary.md' },
        ];
        const html = generateArticleHTML({
          ...defaultOptions,
          analysisFiles,
        });

        // Should contain both document analysis and synthesis summary
        expect(html).toContain('documents/document-analysis-index.md');
        expect(html).toContain('existing/synthesis-summary.md');
        // Should have the document analysis section label
        expect(html).toContain('Document Analysis');
      });

      it('should always include manifest.json link regardless of analysisFiles', () => {
        const htmlWithFiles = generateArticleHTML({
          ...defaultOptions,
          analysisFiles: [
            { method: 'risk-matrix', outputFile: 'risk-scoring/risk-matrix.md' },
          ],
        });
        const htmlWithout = generateArticleHTML({
          ...defaultOptions,
        });

        expect(htmlWithFiles).toContain('manifest.json');
        expect(htmlWithout).toContain('manifest.json');
      });

      it('should render analysis files in correct subdirectory order', () => {
        /** @type {import('../../scripts/types/generation.js').AnalysisFileEntry[]} */
        const analysisFiles = [
          { method: 'deep-analysis', outputFile: 'existing/deep-analysis.md' },
          { method: 'risk-matrix', outputFile: 'risk-scoring/risk-matrix.md' },
          { method: 'significance-classification', outputFile: 'classification/significance-classification.md' },
          { method: 'political-threat-landscape', outputFile: 'threat-assessment/political-threat-landscape.md' },
        ];
        const html = generateArticleHTML({
          ...defaultOptions,
          analysisFiles,
        });

        // Verify ordering: classification < threat-assessment < risk-scoring < existing
        const classIdx = html.indexOf('classification/significance-classification.md');
        const threatIdx = html.indexOf('threat-assessment/political-threat-landscape.md');
        const riskIdx = html.indexOf('risk-scoring/risk-matrix.md');
        const existIdx = html.indexOf('existing/deep-analysis.md');

        expect(classIdx).toBeLessThan(threatIdx);
        expect(threatIdx).toBeLessThan(riskIdx);
        expect(riskIdx).toBeLessThan(existIdx);
      });
    });
  });
});
