// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for utils/content-validator module
 */

import { describe, it, expect } from 'vitest';
import { validateArticleContent, validateTranslationCompleteness } from '../../scripts/utils/content-validator.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal valid article HTML string with the given body text and options */
function buildArticleHtml(bodyText, options = {}) {
  const {
    lang = 'en',
    dir = 'ltr',
    keywords = 'EU Parliament, legislation, committee',
    readTime = '3 min read',
    title = 'Test Article',
    description = 'Test description for the article',
  } = options;
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <title>${title} | EU Parliament Monitor</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
</head>
<body>
  <nav class="skip-link"></nav>
  <div class="reading-progress"></div>
  <header class="site-header"><div class="site-header__inner"><h1>Test</h1><nav class="site-header__langs"><a href="#">EN</a></nav></div></header>
  <nav class="article-top-nav"><a href="#">Back</a></nav>
  <main id="main">
    <article>
      <div class="article-meta">
        <span class="article-read-time">${readTime}</span>
      </div>
      ${bodyText}
    </article>
  </main>
  <footer class="site-footer"></footer>
</body>
</html>`;
}

/** Generate a string with approximately `n` words */
function words(n) {
  return Array(n).fill('word').join(' ');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('utils/content-validator', () => {
  describe('validateArticleContent', () => {
    describe('valid content', () => {
      it('should return valid=true for well-formed article meeting word count', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.metrics.hasPlaceholders).toBe(false);
        expect(result.metrics.htmlValid).toBe(true);
        expect(result.metrics.wordCount).toBeGreaterThanOrEqual(600);
      });

      it('should pass for breaking-news with 300 words', () => {
        const html = buildArticleHtml(`<p>${words(350)}</p>`);
        const result = validateArticleContent(html, 'de', 'breaking');

        expect(result.valid).toBe(true);
      });

      it('should pass for monthly-review with 600 words', () => {
        const html = buildArticleHtml(`<p>${words(650)}</p>`);
        const result = validateArticleContent(html, 'fr', 'month-in-review');

        expect(result.valid).toBe(true);
      });

      it('should pass for unknown article type using default threshold', () => {
        const html = buildArticleHtml(`<p>${words(350)}</p>`);
        const result = validateArticleContent(html, 'en', 'unknown-type');

        expect(result.valid).toBe(true);
      });
    });

    describe('too-short content (warn)', () => {
      it('should warn when week-ahead article has fewer than 500 words', () => {
        const html = buildArticleHtml(`<p>${words(100)}</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(true); // warnings don't make it invalid
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('500');
      });

      it('should warn when committee-reports article has fewer than 400 words', () => {
        const html = buildArticleHtml(`<p>${words(50)}</p>`);
        const result = validateArticleContent(html, 'en', 'committee-reports');

        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('400');
      });

      it('should include word count in warning message', () => {
        const html = buildArticleHtml('<p>short</p>');
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.warnings[0]).toMatch(/\d+ words/);
      });
    });

    describe('placeholder text detection (fail)', () => {
      it('should fail when {{mustache}} placeholders are present', () => {
        const html = buildArticleHtml(`<p>${words(600)} {{TOPIC_NAME}} more text</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.metrics.hasPlaceholders).toBe(true);
      });

      it('should fail when [TODO] markers are present', () => {
        const html = buildArticleHtml(`<p>${words(600)} [TODO: fill this in]</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.metrics.hasPlaceholders).toBe(true);
      });

      it('should fail when PLACEHOLDER word is present', () => {
        const html = buildArticleHtml(`<p>${words(600)} PLACEHOLDER text here</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.metrics.hasPlaceholders).toBe(true);
      });

      it('should fail for case-insensitive [todo] marker', () => {
        const html = buildArticleHtml(`<p>${words(600)} [todo: add content]</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.metrics.hasPlaceholders).toBe(true);
      });
    });

    describe('missing required HTML elements (fail)', () => {
      it('should fail when language switcher is missing', () => {
        const html = `<!DOCTYPE html><html lang="en" dir="ltr"><body>
          <header class="site-header"><div class="site-header__inner"></div></header>
          <nav class="article-top-nav"></nav>
          <main id="main"><p>${words(600)}</p></main>
        </body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.metrics.htmlValid).toBe(false);
        expect(result.errors.join(' ')).toContain('language switcher');
      });

      it('should fail when article-top-nav is missing', () => {
        const html = `<!DOCTYPE html><html lang="en" dir="ltr"><body>
          <header class="site-header"><div class="site-header__inner"><nav class="site-header__langs"></nav></div></header>
          <main id="main"><p>${words(600)}</p></main>
        </body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.errors.join(' ')).toContain('article-top-nav');
      });

      it('should fail when site-header is missing', () => {
        const html = `<!DOCTYPE html><html lang="en" dir="ltr"><body>
          <nav class="site-header__langs"></nav>
          <nav class="article-top-nav"></nav>
          <main id="main"><p>${words(600)}</p></main>
        </body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.errors.join(' ')).toContain('site-header');
      });

      it('should fail when main content wrapper is missing', () => {
        const html = `<!DOCTYPE html><html lang="en" dir="ltr"><body>
          <header class="site-header"><div class="site-header__inner"><nav class="site-header__langs"></nav></div></header>
          <nav class="article-top-nav"></nav>
          <div><p>${words(600)}</p></div>
        </body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.errors.join(' ')).toContain('main content wrapper');
      });

      it('should list all missing elements in the error', () => {
        const html = `<html lang="en" dir="ltr"><body><p>${words(600)}</p></body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.metrics.htmlValid).toBe(false);
        expect(result.errors[0]).toContain('Missing required HTML element');
      });
    });

    describe('language attribute validation', () => {
      it('should pass when lang attribute matches expected language', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, { lang: 'de' });
        const result = validateArticleContent(html, 'de', 'week-ahead');

        expect(result.metrics.langAttributeValid).toBe(true);
      });

      it('should warn when lang attribute does not match expected language', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, { lang: 'en' });
        const result = validateArticleContent(html, 'de', 'week-ahead');

        expect(result.metrics.langAttributeValid).toBe(false);
        expect(result.warnings.some((w) => w.includes('Language attribute mismatch'))).toBe(true);
      });

      it('should warn when lang attribute is missing', () => {
        const html = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <header class="site-header"><div class="site-header__inner"><nav class="site-header__langs"></nav></div></header>
  <nav class="article-top-nav"></nav>
  <main id="main"><p>${words(600)}</p></main>
</body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.warnings.some((w) => w.includes('Missing lang attribute'))).toBe(true);
      });
    });

    describe('RTL direction validation', () => {
      it('should pass for Arabic with dir="rtl"', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, { lang: 'ar', dir: 'rtl' });
        const result = validateArticleContent(html, 'ar', 'week-ahead');

        expect(result.metrics.dirAttributeValid).toBe(true);
      });

      it('should pass for Hebrew with dir="rtl"', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, { lang: 'he', dir: 'rtl' });
        const result = validateArticleContent(html, 'he', 'week-ahead');

        expect(result.metrics.dirAttributeValid).toBe(true);
      });

      it('should warn for Arabic without dir="rtl"', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, { lang: 'ar', dir: 'ltr' });
        const result = validateArticleContent(html, 'ar', 'week-ahead');

        expect(result.metrics.dirAttributeValid).toBe(false);
        expect(result.warnings.some((w) => w.includes('RTL'))).toBe(true);
      });

      it('should pass for LTR language with dir="ltr"', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, { lang: 'de', dir: 'ltr' });
        const result = validateArticleContent(html, 'de', 'week-ahead');

        expect(result.metrics.dirAttributeValid).toBe(true);
      });
    });

    describe('read-time validation', () => {
      it('should compute correct read-time from word count', () => {
        const html = buildArticleHtml(`<p>${words(500)}</p>`, { readTime: '2 min read' });
        const result = validateArticleContent(html, 'en', 'week-ahead');

        // Computed read-time is based on total HTML word count (including markup text)
        expect(result.metrics.computedReadTime).toBeGreaterThanOrEqual(2);
        expect(result.metrics.claimedReadTime).toBe(2);
      });

      it('should warn when claimed read-time is significantly wrong', () => {
        // 1000 words = 4 min, claimed 1 min = 3 min difference > 2 tolerance
        const html = buildArticleHtml(`<p>${words(1000)}</p>`, { readTime: '1 min read' });
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics.computedReadTime).toBeGreaterThanOrEqual(4);
        expect(result.metrics.claimedReadTime).toBe(1);
        expect(result.warnings.some((w) => w.includes('Read-time mismatch'))).toBe(true);
      });

      it('should not warn when claimed read-time is close enough', () => {
        // 500 words = 2 min, claimed 3 min = 1 min difference <= 2 tolerance
        const html = buildArticleHtml(`<p>${words(500)}</p>`, { readTime: '3 min read' });
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.warnings.some((w) => w.includes('Read-time mismatch'))).toBe(false);
      });
    });

    describe('meta tag synchronization', () => {
      it('should pass when all meta tags are synchronized', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, {
          title: 'My Article',
          description: 'Article description',
        });
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics.metaTagsSynced).toBe(true);
      });

      it('should warn when og:title mismatches page title', () => {
        const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <title>Article Title | EU Parliament Monitor</title>
  <meta name="description" content="Matching description">
  <meta property="og:title" content="Different OG Title">
  <meta property="og:description" content="Matching description">
  <meta name="twitter:title" content="Article Title">
  <meta name="twitter:description" content="Matching description">
</head>
<body>
  <header class="site-header"><div class="site-header__inner"><nav class="site-header__langs"></nav></div></header>
  <nav class="article-top-nav"></nav>
  <main id="main"><p>${words(600)}</p></main>
</body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics.metaTagsSynced).toBe(false);
        expect(result.warnings.some((w) => w.includes('Meta tag mismatch'))).toBe(true);
      });

      it('should warn when og:description mismatches description', () => {
        const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <title>Article Title | EU Parliament Monitor</title>
  <meta name="description" content="Original description">
  <meta property="og:title" content="Article Title">
  <meta property="og:description" content="Different OG description">
  <meta name="twitter:title" content="Article Title">
  <meta name="twitter:description" content="Original description">
</head>
<body>
  <header class="site-header"><div class="site-header__inner"><nav class="site-header__langs"></nav></div></header>
  <nav class="article-top-nav"></nav>
  <main id="main"><p>${words(600)}</p></main>
</body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics.metaTagsSynced).toBe(false);
      });
    });

    describe('keyword localization', () => {
      it('should pass for English articles with English keywords', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, {
          keywords: 'EU Parliament, legislation, committee',
        });
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics.keywordsLocalized).toBe(true);
      });

      it('should warn for German article with entirely English keywords', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, {
          lang: 'de',
          keywords: 'EU Parliament, legislation, committee, plenary vote',
        });
        const result = validateArticleContent(html, 'de', 'week-ahead');

        expect(result.metrics.keywordsLocalized).toBe(false);
        expect(result.warnings.some((w) => w.includes('Keywords'))).toBe(true);
      });

      it('should pass for German article with localized keywords', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, {
          lang: 'de',
          keywords: 'EU-Parlament, Gesetzgebung, Ausschuss, Abstimmung',
        });
        const result = validateArticleContent(html, 'de', 'week-ahead');

        expect(result.metrics.keywordsLocalized).toBe(true);
      });

      it('should pass for Japanese article with localized keywords', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, {
          lang: 'ja',
          keywords: 'EU議会, 立法, 委員会, 投票',
        });
        const result = validateArticleContent(html, 'ja', 'week-ahead');

        expect(result.metrics.keywordsLocalized).toBe(true);
      });

      it('should warn for Arabic article with English-only keywords', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`, {
          lang: 'ar',
          dir: 'rtl',
          keywords: 'EU Parliament, legislation, committee',
        });
        const result = validateArticleContent(html, 'ar', 'week-ahead');

        expect(result.metrics.keywordsLocalized).toBe(false);
      });

      it('should pass when no keywords meta tag is present', () => {
        const html = `<!DOCTYPE html>
<html lang="de" dir="ltr">
<head><title>Test | EU Parliament Monitor</title>
  <meta name="description" content="Test">
  <meta property="og:title" content="Test">
  <meta property="og:description" content="Test">
  <meta name="twitter:title" content="Test">
  <meta name="twitter:description" content="Test">
</head>
<body>
  <header class="site-header"><div class="site-header__inner"><nav class="site-header__langs"></nav></div></header>
  <nav class="article-top-nav"></nav>
  <main id="main"><p>${words(600)}</p></main>
</body></html>`;
        const result = validateArticleContent(html, 'de', 'week-ahead');

        expect(result.metrics.keywordsLocalized).toBe(true);
      });
    });

    describe('metrics', () => {
      it('should report word count in metrics', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics.wordCount).toBeGreaterThan(0);
      });

      it('should report htmlValid=true when all elements present', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics.htmlValid).toBe(true);
      });

      it('should report hasPlaceholders=false for clean content', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics.hasPlaceholders).toBe(false);
      });

      it('should include all new metrics fields', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics).toHaveProperty('computedReadTime');
        expect(result.metrics).toHaveProperty('claimedReadTime');
        expect(result.metrics).toHaveProperty('langAttributeValid');
        expect(result.metrics).toHaveProperty('dirAttributeValid');
        expect(result.metrics).toHaveProperty('metaTagsSynced');
        expect(result.metrics).toHaveProperty('keywordsLocalized');
      });
    });
  });

  describe('validateTranslationCompleteness', () => {
    describe('English (source language)', () => {
      it('should return valid=true and skip all checks for English', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`);
        const result = validateTranslationCompleteness(html, 'en');

        expect(result.valid).toBe(true);
        expect(result.warnings).toHaveLength(0);
        expect(result.metrics.asciiRatio).toBe(1);
        expect(result.metrics.cjkCharRatio).toBe(0);
        expect(result.metrics.hasRtlDir).toBe(false);
        expect(result.metrics.hasBidiMarkers).toBe(false);
        expect(result.metrics.untranslatedPhrases).toHaveLength(0);
      });
    });

    describe('RTL validation (ar, he)', () => {
      it('should pass for Arabic article with dir="rtl"', () => {
        const html = buildArticleHtml('<p>البرلمان الأوروبي يناقش التشريعات الجديدة المتعلقة بالسياسة الأوروبية</p>', {
          lang: 'ar',
          dir: 'rtl',
        });
        const result = validateTranslationCompleteness(html, 'ar');

        expect(result.metrics.hasRtlDir).toBe(true);
        expect(result.warnings.every((w) => !w.includes('dir="rtl"'))).toBe(true);
      });

      it('should warn for Arabic article without dir="rtl"', () => {
        const html = buildArticleHtml('<p>البرلمان الأوروبي يناقش التشريعات الجديدة</p>', {
          lang: 'ar',
          dir: 'ltr',
        });
        const result = validateTranslationCompleteness(html, 'ar');

        expect(result.valid).toBe(false);
        expect(result.metrics.hasRtlDir).toBe(false);
        expect(result.warnings.some((w) => w.includes('RTL') && w.includes('dir="rtl"'))).toBe(true);
      });

      it('should pass for Hebrew article with dir="rtl"', () => {
        const html = buildArticleHtml('<p>הפרלמנט האירופי דן בחקיקה חדשה</p>', {
          lang: 'he',
          dir: 'rtl',
        });
        const result = validateTranslationCompleteness(html, 'he');

        expect(result.metrics.hasRtlDir).toBe(true);
      });

      it('should warn for Hebrew article without dir="rtl"', () => {
        const html = buildArticleHtml('<p>הפרלמנט האירופי דן בחקיקה חדשה</p>', {
          lang: 'he',
          dir: 'ltr',
        });
        const result = validateTranslationCompleteness(html, 'he');

        expect(result.valid).toBe(false);
        expect(result.warnings.some((w) => w.includes('RTL'))).toBe(true);
      });
    });

    describe('CJK density detection (ja, ko, zh)', () => {
      it('should pass for Japanese article with actual Japanese content', () => {
        const jaText = '欧州議会は新しい法案について議論しています。委員会は投票の結果を発表しました。規則の改正案が提出されました。';
        const html = buildArticleHtml(`<p>${jaText}</p>`, { lang: 'ja' });
        const result = validateTranslationCompleteness(html, 'ja');

        expect(result.valid).toBe(true);
        expect(result.metrics.cjkCharRatio).toBeGreaterThan(0.05);
        expect(result.warnings).toHaveLength(0);
      });

      it('should warn for Japanese article with mostly ASCII (untranslated)', () => {
        const html = buildArticleHtml(`<p>${words(200)}</p>`, { lang: 'ja' });
        const result = validateTranslationCompleteness(html, 'ja');

        expect(result.metrics.asciiRatio).toBeGreaterThan(0.85);
        expect(result.metrics.cjkCharRatio).toBeLessThan(0.05);
        expect(result.warnings.some((w) => w.includes('ASCII'))).toBe(true);
        expect(result.warnings.some((w) => w.includes('CJK'))).toBe(true);
      });

      it('should pass for Korean article with actual Korean content', () => {
        const koText = '유럽의회는 새로운 법안에 대해 논의하고 있습니다. 위원회는 투표 결과를 발표했습니다.';
        const html = buildArticleHtml(`<p>${koText}</p>`, { lang: 'ko' });
        const result = validateTranslationCompleteness(html, 'ko');

        expect(result.valid).toBe(true);
        expect(result.metrics.cjkCharRatio).toBeGreaterThan(0);
        expect(result.warnings).toHaveLength(0);
      });

      it('should warn for Korean article with only English content', () => {
        const html = buildArticleHtml(`<p>${words(200)}</p>`, { lang: 'ko' });
        const result = validateTranslationCompleteness(html, 'ko');

        expect(result.valid).toBe(false);
        expect(result.warnings.some((w) => w.includes('KO'))).toBe(true);
      });

      it('should pass for Chinese article with actual Chinese content', () => {
        const zhText = '欧洲议会正在讨论新的法案。委员会公布了投票结果。条例修正案已提交。';
        const html = buildArticleHtml(`<p>${zhText}</p>`, { lang: 'zh' });
        const result = validateTranslationCompleteness(html, 'zh');

        expect(result.metrics.cjkCharRatio).toBeGreaterThan(0.05);
      });

      it('should warn for Chinese article with only English content', () => {
        const html = buildArticleHtml(`<p>${words(200)}</p>`, { lang: 'zh' });
        const result = validateTranslationCompleteness(html, 'zh');

        expect(result.valid).toBe(false);
        expect(result.warnings.some((w) => w.includes('ZH'))).toBe(true);
      });

      it('should not false-positive on CJK content with numeric HTML entities', () => {
        const zhWithEntities = '欧洲议会投票结果&#8212;赞成&#43;反对&#8722;弃权&#58;&#160;条例修正案已提交。';
        const html = buildArticleHtml(`<p>${zhWithEntities}</p>`, { lang: 'zh' });
        const result = validateTranslationCompleteness(html, 'zh');

        expect(result.metrics.cjkCharRatio).toBeGreaterThan(0.05);
        expect(result.warnings.every((w) => !w.includes('ASCII'))).toBe(true);
      });
    });

    describe('untranslated English phrase detection', () => {
      it('should warn when "European Parliament" appears in non-English article', () => {
        const html = buildArticleHtml(
          '<p>Der Text enthält European Parliament und andere Informationen über die EU-Politik</p>',
          { lang: 'de' }
        );
        const result = validateTranslationCompleteness(html, 'de');

        expect(result.metrics.untranslatedPhrases).toContain('European Parliament');
        expect(result.warnings.some((w) => w.includes('untranslated'))).toBe(true);
      });

      it('should warn when "Read more" appears in non-English article', () => {
        const html = buildArticleHtml(
          '<p>Texte en français avec Read more et autres informations</p>',
          { lang: 'fr' }
        );
        const result = validateTranslationCompleteness(html, 'fr');

        expect(result.metrics.untranslatedPhrases).toContain('Read more');
      });

      it('should not warn when no English phrases are found', () => {
        const html = buildArticleHtml(
          '<p>Vollständig übersetzter deutscher Text ohne englische Platzhalter</p>',
          { lang: 'de' }
        );
        const result = validateTranslationCompleteness(html, 'de');

        expect(result.metrics.untranslatedPhrases).toHaveLength(0);
      });

      it('should detect multiple untranslated phrases', () => {
        const html = buildArticleHtml(
          '<p>European Parliament discusses. Read more about the Table of Contents here.</p>',
          { lang: 'de' }
        );
        const result = validateTranslationCompleteness(html, 'de');

        expect(result.metrics.untranslatedPhrases.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('edge cases', () => {
      it('should handle empty content gracefully', () => {
        const html = buildArticleHtml('', { lang: 'ja' });
        const result = validateTranslationCompleteness(html, 'ja');

        expect(result.metrics.asciiRatio).toBeGreaterThanOrEqual(0);
        expect(result.metrics.cjkCharRatio).toBeGreaterThanOrEqual(0);
      });

      it('should handle mixed-language articles', () => {
        const mixedText = '議会は新しい regulation について議論した。The committee voted on 条例改正。';
        const html = buildArticleHtml(`<p>${mixedText}</p>`, { lang: 'ja' });
        const result = validateTranslationCompleteness(html, 'ja');

        // Mixed content should have some CJK chars
        expect(result.metrics.cjkCharRatio).toBeGreaterThan(0);
        expect(result.metrics.asciiRatio).toBeGreaterThan(0);
      });

      it('should not flag non-CJK non-RTL languages for script density', () => {
        const html = buildArticleHtml(`<p>${words(200)}</p>`, { lang: 'de' });
        const result = validateTranslationCompleteness(html, 'de');

        // German (Latin script) should not get CJK density warnings
        expect(result.warnings.every((w) => !w.includes('ASCII characters'))).toBe(true);
        expect(result.warnings.every((w) => !w.includes('CJK characters'))).toBe(true);
      });

      it('should include all metrics fields', () => {
        const html = buildArticleHtml(`<p>${words(200)}</p>`, { lang: 'de' });
        const result = validateTranslationCompleteness(html, 'de');

        expect(result).toHaveProperty('valid');
        expect(result).toHaveProperty('warnings');
        expect(result.metrics).toHaveProperty('asciiRatio');
        expect(result.metrics).toHaveProperty('cjkCharRatio');
        expect(result.metrics).toHaveProperty('hasRtlDir');
        expect(result.metrics).toHaveProperty('hasBidiMarkers');
        expect(result.metrics).toHaveProperty('untranslatedPhrases');
      });
    });
  });
});
