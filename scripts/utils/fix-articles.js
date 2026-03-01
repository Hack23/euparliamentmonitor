// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/FixArticles
 * @description FALLBACK TOOL — Retroactively adds missing language switcher, article-top-nav
 * (back button), site-header, skip-link, reading-progress bar, and site-footer to existing
 * news articles.
 *
 * The primary mechanism for including these elements is the article template
 * (`generateArticleHTML` in `src/templates/article-template.ts`), which already produces
 * all required structural elements. This script is a last-resort recovery tool for
 * patching legacy articles generated before the template was complete.
 *
 * Usage: npx tsx src/utils/fix-articles.ts [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { NEWS_DIR, ARTICLE_FILENAME_PATTERN } from '../constants/config.js';
import { ALL_LANGUAGES, LANGUAGE_FLAGS, LANGUAGE_NAMES, BACK_TO_NEWS_LABELS, ARTICLE_NAV_LABELS, SKIP_LINK_TEXTS, getLocalizedString, } from '../constants/languages.js';
import { escapeHTML } from './file-utils.js';
/** CSS class selector for the language switcher nav element */
const LANG_SWITCHER_CLASS = 'class="site-header__langs"';
/** CSS class selector for the article top navigation element */
const ARTICLE_TOP_NAV_CLASS = 'class="article-top-nav"';
/** CSS class selector for the site header element */
const SITE_HEADER_CLASS = 'class="site-header"';
/** CSS class selector for the reading progress bar element */
const READING_PROGRESS_CLASS = 'class="reading-progress"';
/** CSS class selector for the site footer element */
const SITE_FOOTER_CLASS = 'class="site-footer"';
/**
 * Build the language switcher nav HTML for an article.
 *
 * @param date - Article date (YYYY-MM-DD)
 * @param slug - Article URL slug
 * @param currentLang - Active language code
 * @returns HTML string for the language switcher
 */
function buildLangSwitcher(date, slug, currentLang) {
    return ALL_LANGUAGES.map((code) => {
        const flag = getLocalizedString(LANGUAGE_FLAGS, code);
        const name = getLocalizedString(LANGUAGE_NAMES, code);
        const active = code === currentLang ? ' active' : '';
        const href = `${date}-${slug}-${code}.html`;
        const safeTitle = escapeHTML(name);
        return `<a href="${href}" class="lang-link${active}" hreflang="${code}" lang="${code}" title="${safeTitle}">${flag} ${code.toUpperCase()}</a>`;
    }).join('\n        ');
}
/**
 * Build the article-top-nav HTML with a localized back button.
 *
 * @param indexHref - Link to the language-specific index page
 * @param lang - Language code for localized labels
 * @returns HTML string for the article top navigation
 */
function buildArticleTopNav(indexHref, lang) {
    const backLabel = getLocalizedString(BACK_TO_NEWS_LABELS, lang);
    const articleNavLabel = escapeHTML(getLocalizedString(ARTICLE_NAV_LABELS, lang));
    return `<nav class="article-top-nav" aria-label="${articleNavLabel}">
    <a href="${indexHref}" class="back-to-news">${backLabel}</a>
  </nav>`;
}
/**
 * Build the language grid for the article footer.
 *
 * @param currentLang - Active language code
 * @returns HTML string for the language grid
 */
function buildFooterLanguageGrid(currentLang) {
    return ALL_LANGUAGES.map((code) => {
        const flag = getLocalizedString(LANGUAGE_FLAGS, code);
        const safeName = escapeHTML(getLocalizedString(LANGUAGE_NAMES, code));
        const href = code === 'en' ? '../index.html' : `../index-${code}.html`;
        const active = code === currentLang ? ' class="active"' : '';
        return `<a href="${href}"${active} hreflang="${code}">${flag} ${safeName}</a>`;
    }).join('\n            ');
}
/**
 * Build the site footer HTML.
 *
 * @param lang - Language code for the language grid active state
 * @returns HTML string for the site footer
 */
function buildSiteFooter(lang) {
    const year = new Date().getFullYear();
    return `<footer class="site-footer" role="contentinfo">
    <div class="footer-content">
      <div class="footer-section">
        <h3>About EU Parliament Monitor</h3>
        <p>European Parliament Intelligence Platform — monitoring political activity with systematic transparency. Powered by European Parliament open data.</p>
      </div>
      <div class="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="../index.html">Home</a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor">GitHub Repository</a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/LICENSE">Apache-2.0 License</a></li>
          <li><a href="https://www.europarl.europa.eu/">European Parliament</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Built by Hack23 AB</h3>
        <ul>
          <li><a href="https://hack23.com">hack23.com</a></li>
          <li><a href="https://www.linkedin.com/company/hack23">LinkedIn</a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC">Security &amp; Privacy Policy</a></li>
          <li><a href="mailto:james@hack23.com">Contact</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Languages</h3>
        <div class="language-grid">
          ${buildFooterLanguageGrid(lang)}
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2008-${year} <a href="https://hack23.com">Hack23 AB</a> (Org.nr 5595347807) | Gothenburg, Sweden</p>
    </div>
  </footer>`;
}
/**
 * Inject full structural elements for articles with no site-header (Type A).
 *
 * @param html - Current article HTML
 * @param ctx - Injection context
 * @returns Updated HTML and change description, or null if not applicable
 */
function injectTypeA(html, ctx) {
    const bodyArticlePattern = /(<body>)\s*\n(\s*<article\s)/;
    if (!bodyArticlePattern.test(html)) {
        return null;
    }
    const injectedBlock = `$1
  <div class="reading-progress" aria-hidden="true"></div>
  <a href="#main" class="skip-link">${ctx.skipLinkText}</a>

  <header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="${ctx.indexHref}" class="site-header__brand" aria-label="EU Parliament Monitor">
        <span class="site-header__flag" aria-hidden="true">🇪🇺</span>
        <span>
          <span class="site-header__title">EU Parliament Monitor</span>
          <span class="site-header__subtitle">European Parliament Intelligence</span>
        </span>
      </a>
      <nav class="site-header__langs" role="navigation" aria-label="Language selection">
        ${buildLangSwitcher(ctx.date, ctx.slug, ctx.lang)}
      </nav>
    </div>
  </header>

  ${buildArticleTopNav(ctx.indexHref, ctx.lang)}

  <main id="main" class="site-main">
  $2`;
    let result = html.replace(bodyArticlePattern, injectedBlock);
    // Close </main> before </body>
    result = result.replace(/(<\/article>)\s*\n(<\/body>)/, '$1\n  </main>\n$2');
    if (!result.includes('</main>')) {
        result = result.replace('</body>', '  </main>\n</body>');
    }
    return {
        html: result,
        change: 'Added reading-progress, skip-link, site-header, language-switcher, article-top-nav, main wrapper',
    };
}
/**
 * Inject language switcher and top nav for articles with site-header but missing both (Type B).
 *
 * @param html - Current article HTML
 * @param ctx - Injection context
 * @returns Updated HTML and change description, or null if not applicable
 */
function injectTypeB(html, ctx) {
    // Try to inject lang switcher inside the header's .site-header__inner
    const innerPattern = /(<\/a>\s*\n\s*<\/div>\s*\n\s*<\/header>)\s*\n(\s*<main\s)/;
    if (!innerPattern.test(html)) {
        // Fallback: inject after header close
        const headerMainPattern = /(<\/header>)\s*\n(\s*<main\s)/;
        if (!headerMainPattern.test(html)) {
            return null;
        }
        const injectedBlock = `$1

  ${buildArticleTopNav(ctx.indexHref, ctx.lang)}

  $2`;
        return {
            html: html.replace(headerMainPattern, injectedBlock),
            change: 'Added article-top-nav after header',
        };
    }
    const injectedBlock = `      <nav class="site-header__langs" role="navigation" aria-label="Language selection">
        ${buildLangSwitcher(ctx.date, ctx.slug, ctx.lang)}
      </nav>
    </div>
  </header>

  ${buildArticleTopNav(ctx.indexHref, ctx.lang)}

  $2`;
    return {
        html: html.replace(/(<\/a>\s*\n\s*)<\/div>\s*\n\s*<\/header>\s*\n(\s*<main\s)/, `$1${injectedBlock}`),
        change: 'Added language switcher and article-top-nav',
    };
}
/**
 * Inject article-top-nav for articles that already have language-switcher (Type C).
 *
 * @param html - Current article HTML
 * @param ctx - Injection context
 * @returns Updated HTML and change description, or null if not applicable
 */
function injectTypeC(html, ctx) {
    if (html.includes(ARTICLE_TOP_NAV_CLASS)) {
        return null;
    }
    // Pattern: closing header tag followed by main element
    const headerMainPattern = /(<\/header>)\s*\n(\s*<main\s)/;
    if (!headerMainPattern.test(html)) {
        return null;
    }
    const injectedBlock = `$1

  ${buildArticleTopNav(ctx.indexHref, ctx.lang)}

  $2`;
    return {
        html: html.replace(headerMainPattern, injectedBlock),
        change: 'Added article-top-nav',
    };
}
/**
 * Inject reading-progress bar if missing.
 *
 * @param html - Current article HTML
 * @returns Updated HTML and change description, or null if already present
 */
function injectReadingProgress(html) {
    if (html.includes(READING_PROGRESS_CLASS)) {
        return null;
    }
    const pattern = /(<body>)\s*\n(\s*<a href="#main")/;
    if (!pattern.test(html)) {
        return null;
    }
    return {
        html: html.replace(pattern, '$1\n  <div class="reading-progress" aria-hidden="true"></div>\n$2'),
        change: 'Added reading-progress',
    };
}
/**
 * Inject site-footer if missing. Inserts before </body>.
 *
 * @param html - Current article HTML
 * @param lang - Language code for the footer language grid
 * @returns Updated HTML and change description, or null if already present
 */
function injectSiteFooter(html, lang) {
    if (html.includes(SITE_FOOTER_CLASS)) {
        return null;
    }
    const pattern = /(\s*)<\/body>/;
    if (!pattern.test(html)) {
        return null;
    }
    return {
        html: html.replace(pattern, `\n\n  ${buildSiteFooter(lang)}\n</body>`),
        change: 'Added site-footer',
    };
}
/**
 * Apply an injection result if present.
 *
 * @param current - Current HTML content
 * @param injector - Function returning an injection result or null
 * @param changes - Array to append change descriptions to
 * @returns Updated HTML content
 */
function applyInjection(current, injector, changes) {
    const result = injector();
    if (result) {
        changes.push(result.change);
        return result.html;
    }
    return current;
}
/**
 * Fix a single article file by injecting missing structural elements.
 *
 * @param filepath - Absolute path to article HTML file
 * @param dryRun - If true, only report what would change
 * @returns Object with changed flag and description
 */
export function fixArticle(filepath, dryRun = false) {
    const filename = path.basename(filepath);
    const match = filename.match(ARTICLE_FILENAME_PATTERN);
    if (!match) {
        return { changed: false, description: `Skipped (not matching pattern): ${filename}` };
    }
    const date = match[1];
    const slug = match[2];
    const lang = match[3];
    const indexHref = lang === 'en' ? '../index.html' : `../index-${lang}.html`;
    const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, lang);
    const ctx = { date, slug, lang, indexHref, skipLinkText };
    let html = fs.readFileSync(filepath, 'utf-8');
    if (html.includes(LANG_SWITCHER_CLASS) &&
        html.includes(ARTICLE_TOP_NAV_CLASS) &&
        html.includes(SITE_FOOTER_CLASS)) {
        return { changed: false, description: `Already complete: ${filename}` };
    }
    const changes = [];
    const hasSiteHeader = html.includes(SITE_HEADER_CLASS);
    const hasLangSwitcher = html.includes(LANG_SWITCHER_CLASS);
    const hasTopNav = html.includes(ARTICLE_TOP_NAV_CLASS);
    // Type A: Missing everything
    if (!hasSiteHeader && !hasLangSwitcher && !hasTopNav) {
        html = applyInjection(html, () => injectTypeA(html, ctx), changes);
    }
    // Type B: Has site-header but no language-switcher or top-nav
    else if (hasSiteHeader && !hasLangSwitcher && !hasTopNav) {
        html = applyInjection(html, () => injectTypeB(html, ctx), changes);
    }
    // Type C: Has language-switcher but no article-top-nav
    else if (hasLangSwitcher && !hasTopNav) {
        html = applyInjection(html, () => injectTypeC(html, ctx), changes);
    }
    // Add reading-progress if missing (for types B and C)
    if (html.includes(SITE_HEADER_CLASS)) {
        html = applyInjection(html, () => injectReadingProgress(html), changes);
    }
    // Add site-footer if missing
    html = applyInjection(html, () => injectSiteFooter(html, lang), changes);
    if (changes.length === 0) {
        return { changed: false, description: `No changes needed: ${filename}` };
    }
    if (!dryRun) {
        fs.writeFileSync(filepath, html, 'utf-8');
    }
    return { changed: true, description: `Fixed ${filename}: ${changes.join(', ')}` };
}
/**
 * Fix all articles in the news directory.
 *
 * @param dryRun - If true, only report what would change
 * @returns Summary of changes
 */
export function fixAllArticles(dryRun = false) {
    const files = fs.readdirSync(NEWS_DIR).filter((f) => f.endsWith('.html'));
    const results = [];
    for (const file of files) {
        const filepath = path.join(NEWS_DIR, file);
        const result = fixArticle(filepath, dryRun);
        results.push(result);
    }
    const fixed = results.filter((r) => r.changed).length;
    const skipped = results.filter((r) => !r.changed).length;
    return { total: files.length, fixed, skipped, results };
}
// CLI entry point
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename ?? '')) {
    const dryRun = process.argv.includes('--dry-run');
    console.log(`🔧 Fix Articles ${dryRun ? '(DRY RUN)' : ''}`);
    console.log(`📁 Scanning: ${NEWS_DIR}\n`);
    const summary = fixAllArticles(dryRun);
    for (const result of summary.results) {
        if (result.changed) {
            console.log(`  ✅ ${result.description}`);
        }
    }
    console.log(`\n📊 Summary: ${summary.fixed} fixed, ${summary.skipped} skipped, ${summary.total} total`);
    if (dryRun) {
        console.log('\n⚠️  Dry run — no files were modified. Remove --dry-run to apply changes.');
    }
}
//# sourceMappingURL=fix-articles.js.map