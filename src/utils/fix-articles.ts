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
import {
  ALL_LANGUAGES,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  BACK_TO_NEWS_LABELS,
  ARTICLE_NAV_LABELS,
  SKIP_LINK_TEXTS,
  HEADER_SUBTITLE_LABELS,
  FOOTER_ABOUT_HEADING_LABELS,
  FOOTER_ABOUT_TEXT_LABELS,
  FOOTER_QUICK_LINKS_LABELS,
  FOOTER_BUILT_BY_LABELS,
  FOOTER_LANGUAGES_LABELS,
  getLocalizedString,
} from '../constants/languages.js';
import { escapeHTML } from './file-utils.js';

/** CSS class selector for the NEW language switcher nav element (inside header) */
const LANG_SWITCHER_NEW_CLASS = 'class="site-header__langs"';

/** CSS class selector for the LEGACY language switcher nav element (standalone) */
const LANG_SWITCHER_LEGACY_CLASS = 'class="language-switcher"';

/** CSS class selector for the article top navigation element */
const ARTICLE_TOP_NAV_CLASS = 'class="article-top-nav"';

/** CSS class selector for the site header element */
const SITE_HEADER_CLASS = 'class="site-header"';

/** CSS class selector for the reading progress bar element */
const READING_PROGRESS_CLASS = 'class="reading-progress"';

/** CSS class selector for the site footer element */
const SITE_FOOTER_CLASS = 'class="site-footer"';

/** Context for article injection */
interface InjectionContext {
  /** Article date (YYYY-MM-DD) */
  date: string;
  /** Article URL slug */
  slug: string;
  /** Language code */
  lang: string;
  /** Link to the language-specific index page */
  indexHref: string;
  /** Localized skip link text */
  skipLinkText: string;
  /** Localized site header subtitle */
  headerSubtitle: string;
}

/** Result of an injection attempt */
interface InjectionResult {
  /** Updated HTML */
  html: string;
  /** Description of what was changed */
  change: string;
}

/**
 * Build the language switcher nav HTML for an article.
 *
 * @param date - Article date (YYYY-MM-DD)
 * @param slug - Article URL slug
 * @param currentLang - Active language code
 * @returns HTML string for the language switcher
 */
function buildLangSwitcher(date: string, slug: string, currentLang: string): string {
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
function buildArticleTopNav(indexHref: string, lang: string): string {
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
function buildFooterLanguageGrid(currentLang: string): string {
  return ALL_LANGUAGES.map((code) => {
    const flag = getLocalizedString(LANGUAGE_FLAGS, code);
    const safeName = escapeHTML(getLocalizedString(LANGUAGE_NAMES, code));
    const href = code === 'en' ? '../index.html' : `../index-${code}.html`;
    const active = code === currentLang ? ' class="active"' : '';
    return `<a href="${href}"${active} hreflang="${code}">${flag} ${safeName}</a>`;
  }).join('\n            ');
}

/**
 * Build the site footer HTML with localized section headings and text.
 *
 * @param lang - Language code for all localized footer content
 * @returns HTML string for the site footer
 */
function buildSiteFooter(lang: string): string {
  const year = new Date().getFullYear();
  const aboutHeading = getLocalizedString(FOOTER_ABOUT_HEADING_LABELS, lang);
  const aboutText = getLocalizedString(FOOTER_ABOUT_TEXT_LABELS, lang);
  const quickLinksHeading = getLocalizedString(FOOTER_QUICK_LINKS_LABELS, lang);
  const builtByHeading = getLocalizedString(FOOTER_BUILT_BY_LABELS, lang);
  const languagesHeading = getLocalizedString(FOOTER_LANGUAGES_LABELS, lang);
  const aboutHeading = escapeHTML(getLocalizedString(FOOTER_ABOUT_HEADING_LABELS, lang));
  const aboutText = escapeHTML(getLocalizedString(FOOTER_ABOUT_TEXT_LABELS, lang));
  const quickLinksHeading = escapeHTML(getLocalizedString(FOOTER_QUICK_LINKS_LABELS, lang));
  const builtByHeading = escapeHTML(getLocalizedString(FOOTER_BUILT_BY_LABELS, lang));
  const languagesHeading = escapeHTML(getLocalizedString(FOOTER_LANGUAGES_LABELS, lang));
  return `<footer class="site-footer" role="contentinfo">
    <div class="footer-content">
      <div class="footer-section">
        <h3>${aboutHeading}</h3>
        <p>${aboutText}</p>
      </div>
      <div class="footer-section">
        <h3>${quickLinksHeading}</h3>
        <ul>
          <li><a href="../index.html">Home</a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor">GitHub Repository</a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/LICENSE">Apache-2.0 License</a></li>
          <li><a href="https://www.europarl.europa.eu/">European Parliament</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>${builtByHeading}</h3>
        <ul>
          <li><a href="https://hack23.com">hack23.com</a></li>
          <li><a href="https://www.linkedin.com/company/hack23">LinkedIn</a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC">Security &amp; Privacy Policy</a></li>
          <li><a href="mailto:james@hack23.com">Contact</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>${languagesHeading}</h3>
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
function injectTypeA(html: string, ctx: InjectionContext): InjectionResult | null {
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
          <span class="site-header__subtitle">${escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, ctx.lang))}</span>
          <span class="site-header__subtitle">${ctx.headerSubtitle}</span>
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
    change:
      'Added reading-progress, skip-link, site-header, language-switcher, article-top-nav, main wrapper',
  };
}

/**
 * Inject language switcher and top nav for articles with site-header but missing both (Type B).
 *
 * @param html - Current article HTML
 * @param ctx - Injection context
 * @returns Updated HTML and change description, or null if not applicable
 */
function injectTypeB(html: string, ctx: InjectionContext): InjectionResult | null {
  // Try to inject lang switcher inside the header's .site-header__inner
  const innerPattern = /(<\/a>\s*\n\s*<\/div>\s*\n\s*<\/header>)\s*\n(\s*<main\s)/;
  if (!innerPattern.test(html)) {
    // Fallback: inject after header close
    const headerMainPattern = /(<\/header>)\s*\n(\s*<main\s)/;
    if (!headerMainPattern.test(html)) {
      return null;
    }
    const injectedBlock = `$1

  <nav class="site-header__langs" role="navigation" aria-label="Language selection">
    ${buildLangSwitcher(ctx.date, ctx.slug, ctx.lang)}
  </nav>

  ${buildArticleTopNav(ctx.indexHref, ctx.lang)}

  $2`;
    return {
      html: html.replace(headerMainPattern, injectedBlock),
      change: 'Added language switcher and article-top-nav after header',
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
    html: html.replace(
      /(<\/a>\s*\n\s*)<\/div>\s*\n\s*<\/header>\s*\n(\s*<main\s)/,
      `$1${injectedBlock}`
    ),
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
function injectTypeC(html: string, ctx: InjectionContext): InjectionResult | null {
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
function injectReadingProgress(html: string): InjectionResult | null {
  if (html.includes(READING_PROGRESS_CLASS)) {
    return null;
  }
  const pattern = /(<body>)\s*\n(\s*<a href="#main")/;
  if (!pattern.test(html)) {
    return null;
  }
  return {
    html: html.replace(
      pattern,
      '$1\n  <div class="reading-progress" aria-hidden="true"></div>\n$2'
    ),
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
function injectSiteFooter(html: string, lang: string): InjectionResult | null {
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
 * Patch the header subtitle if it contains the English fallback.
 * Safe to call regardless of whether the article was just created or existed before.
 *
 * @param html - Current article HTML
 * @param lang - Language code for the localized subtitle
 * @returns Updated HTML and change description, or null if no change needed
 */
function patchHeaderSubtitle(html: string, lang: string): InjectionResult | null {
  const englishSubtitle =
    '<span class="site-header__subtitle">European Parliament Intelligence</span>';
  if (!html.includes(englishSubtitle)) {
    return null;
  }
  const localizedSubtitle = escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, lang));
  return {
    html: html.replace(
      englishSubtitle,
      `<span class="site-header__subtitle">${localizedSubtitle}</span>`
    ),
    change: 'Localized header subtitle',
  };
}

/** CSS selector fragment used to detect the full footer-content div */
const FOOTER_CONTENT_CLASS = 'class="footer-content"';

/** CSS selector fragment used to detect the legacy footer-bottom div */
const FOOTER_BOTTOM_CLASS = 'class="footer-bottom"';

/**
 * Upgrade a minimal footer (footer-bottom only) to the full localized footer.
 * Only applies when the footer has the legacy footer-bottom pattern but lacks footer-section content.
 *
 * @param html - Current article HTML
 * @param lang - Language code for localized content
 * @returns Updated HTML and change description, or null if not applicable
 */
function upgradeMinimalFooter(html: string, lang: string): InjectionResult | null {
  if (
    !html.includes(SITE_FOOTER_CLASS) ||
    !html.includes(FOOTER_BOTTOM_CLASS) ||
    html.includes(FOOTER_CONTENT_CLASS)
  ) {
    return null;
  }
  const footerPattern = /<footer class="site-footer"[^>]*>[\s\S]*?<\/footer>/;
  if (!footerPattern.test(html)) {
    return null;
  }
  return {
    html: html.replace(footerPattern, buildSiteFooter(lang)),
    change: 'Upgraded minimal footer to full localized footer',
  };
}

/**
 * Patch English footer section headings and body text to localized equivalents.
 * Applied after footer-section elements are confirmed present.
 *
 * @param html - Current article HTML
 * @param lang - Language code for localized content
 * @returns Updated HTML and change description, or null if no change needed
 */
function patchFooterSectionText(html: string, lang: string): InjectionResult | null {
  const englishAboutHeading = '<h3>About EU Parliament Monitor</h3>';
  const englishAboutText =
    'European Parliament Intelligence Platform — monitoring political activity with systematic transparency. Powered by European Parliament open data.';
  const englishQuickLinks = '<h3>Quick Links</h3>';
  const englishBuiltBy = '<h3>Built by Hack23 AB</h3>';
  const englishLanguages = '<h3>Languages</h3>';

  const hasEnglishContent =
    html.includes(englishAboutHeading) ||
    html.includes(englishAboutText) ||
    html.includes(englishQuickLinks) ||
    html.includes(englishBuiltBy) ||
    html.includes(englishLanguages);

  if (!hasEnglishContent) {
    return null;
  }

  const aboutHeading = getLocalizedString(FOOTER_ABOUT_HEADING_LABELS, lang);
  const aboutText = getLocalizedString(FOOTER_ABOUT_TEXT_LABELS, lang);
  const quickLinksHeading = getLocalizedString(FOOTER_QUICK_LINKS_LABELS, lang);
  const builtByHeading = getLocalizedString(FOOTER_BUILT_BY_LABELS, lang);
  const languagesHeading = getLocalizedString(FOOTER_LANGUAGES_LABELS, lang);

  let result = html;
  if (result.includes(englishAboutHeading)) {
    result = result.replace(englishAboutHeading, `<h3>${aboutHeading}</h3>`);
  }
  if (result.includes(englishAboutText)) {
    result = result.replace(englishAboutText, aboutText);
  }
  if (result.includes(englishQuickLinks)) {
    result = result.replace(englishQuickLinks, `<h3>${quickLinksHeading}</h3>`);
  }
  if (result.includes(englishBuiltBy)) {
    result = result.replace(englishBuiltBy, `<h3>${builtByHeading}</h3>`);
  }
  if (result.includes(englishLanguages)) {
    result = result.replace(englishLanguages, `<h3>${languagesHeading}</h3>`);
  }

  return { html: result, change: 'Localized footer section headings and text' };
}

/**
 * Apply an injection result if present.
 *
 * @param current - Current HTML content
 * @param injector - Function returning an injection result or null
 * @param changes - Array to append change descriptions to
 * @returns Updated HTML content
 */
function applyInjection(
  current: string,
  injector: () => InjectionResult | null,
  changes: string[]
): string {
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
export function fixArticle(
  filepath: string,
  dryRun: boolean = false
): { changed: boolean; description: string } {
  const filename = path.basename(filepath);
  const match = filename.match(ARTICLE_FILENAME_PATTERN);
  if (!match) {
    return { changed: false, description: `Skipped (not matching pattern): ${filename}` };
  }

  const date = match[1] as string;
  const slug = match[2] as string;
  const lang = match[3] as string;
  const indexHref = lang === 'en' ? '../index.html' : `../index-${lang}.html`;
  const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, lang);
  const headerSubtitle = escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, lang));
  const ctx: InjectionContext = { date, slug, lang, indexHref, skipLinkText, headerSubtitle };

  let html = fs.readFileSync(filepath, 'utf-8');

  /** True when article already has the NEW header-integrated language nav */
  const hasNewLangSwitcher = html.includes(LANG_SWITCHER_NEW_CLASS);
  /** True when article has any language switcher (new or legacy) */
  const hasAnyLangSwitcher = hasNewLangSwitcher || html.includes(LANG_SWITCHER_LEGACY_CLASS);

  const changes: string[] = [];
  const hasSiteHeader = html.includes(SITE_HEADER_CLASS);
  const hasTopNav = html.includes(ARTICLE_TOP_NAV_CLASS);

  // Type A: Missing everything
  if (!hasSiteHeader && !hasAnyLangSwitcher && !hasTopNav) {
    html = applyInjection(html, () => injectTypeA(html, ctx), changes);
  }
  // Type B: Has site-header but no NEW language-switcher or top-nav
  else if (hasSiteHeader && !hasNewLangSwitcher && !hasTopNav) {
    html = applyInjection(html, () => injectTypeB(html, ctx), changes);
  }
  // Type C: Has NEW language-switcher but no article-top-nav
  else if (hasNewLangSwitcher && !hasTopNav) {
    html = applyInjection(html, () => injectTypeC(html, ctx), changes);
  }

  // Add reading-progress if missing (for types B and C)
  if (html.includes(SITE_HEADER_CLASS)) {
    html = applyInjection(html, () => injectReadingProgress(html), changes);
  }

  // Add site-footer if missing
  html = applyInjection(html, () => injectSiteFooter(html, lang), changes);

  // Upgrade minimal footer (footer-bottom only) to full localized footer
  html = applyInjection(html, () => upgradeMinimalFooter(html, lang), changes);

  // Patch English header subtitle to localized version
  html = applyInjection(html, () => patchHeaderSubtitle(html, lang), changes);

  // Patch English footer section headings and text to localized versions
  html = applyInjection(html, () => patchFooterSectionText(html, lang), changes);

  if (changes.length === 0) {
    return { changed: false, description: `Already complete: ${filename}` };
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
export function fixAllArticles(dryRun: boolean = false): {
  total: number;
  fixed: number;
  skipped: number;
  results: Array<{ changed: boolean; description: string }>;
} {
  const files = fs.readdirSync(NEWS_DIR).filter((f) => f.endsWith('.html'));
  const results: Array<{ changed: boolean; description: string }> = [];

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

  console.log(
    `\n📊 Summary: ${summary.fixed} fixed, ${summary.skipped} skipped, ${summary.total} total`
  );

  if (dryRun) {
    console.log('\n⚠️  Dry run — no files were modified. Remove --dry-run to apply changes.');
  }
}
