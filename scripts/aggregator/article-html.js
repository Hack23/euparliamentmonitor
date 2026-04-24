// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/ArticleHtml
 * @description Wrap a rendered article body in the same site chrome that
 * `political-intelligence.html` uses — site header, language switcher, skip
 * link, theme toggle, breadcrumb, and footer. All chrome is reused from
 * existing modules (`constants/config.ts`, `constants/languages.ts`,
 * `templates/section-builders.ts`) so localisation, a11y, and CSP stay
 * consistent with the rest of the site.
 *
 * The output is a complete HTML5 document. No inline `<script>` is emitted
 * in the body. Mermaid is loaded from the vendored ESM bundle via
 * `<script type="module" src="js/vendor/mermaid.esm.min.mjs">` so CSP
 * stays `script-src 'self'`.
 */
import { BASE_URL, createThemeToggleButton, THEME_TOGGLE_SCRIPT } from '../constants/config.js';
import { ALL_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS, PAGE_TITLES, SKIP_LINK_TEXTS, HEADER_SUBTITLE_LABELS, THEME_TOGGLE_LABELS, TOC_ARIA_LABELS, getLocalizedString, getTextDirection, } from '../constants/languages.js';
import { escapeHTML } from '../utils/file-utils.js';
import { buildSiteFooter } from '../templates/section-builders.js';
/**
 * Build the canonical filename for an article in a given language. English
 * uses the bare stem (`2026-01-15-breaking-en.html`); other languages share
 * the same pattern so every language is a first-class variant. Matches the
 * existing `news/<date>-<slug>-<lang>.html` convention.
 *
 * @param articleSlug - Slug of the form `<date>-<type>` (no extension)
 * @param lang - Target language code
 * @returns Filename string without any directory prefix
 */
export function getArticleFilename(articleSlug, lang) {
    return `${articleSlug}-${lang}.html`;
}
/**
 * Build the hreflang `<link rel="alternate">` block for an article.
 *
 * @param articleSlug - Slug of the form `<date>-<type>` (no extension)
 * @returns Newline-joined `<link>` tags for every supported language plus
 *          an `x-default` fallback pointing at the English variant
 */
export function buildArticleHreflangLinks(articleSlug) {
    const entries = ALL_LANGUAGES.map((code) => `  <link rel="alternate" hreflang="${code}" href="${BASE_URL}/news/${getArticleFilename(articleSlug, code)}">`);
    entries.push(`  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/news/${getArticleFilename(articleSlug, 'en')}">`);
    return entries.join('\n');
}
/**
 * Build the language-switcher nav block for the article header.
 *
 * @param articleSlug - Slug of the form `<date>-<type>` (no extension)
 * @param current - Language currently being rendered (used for active state)
 * @returns HTML fragment containing one `<a class="lang-link">` per language
 */
function buildLanguageSwitcher(articleSlug, current) {
    return ALL_LANGUAGES.map((code) => {
        const flag = getLocalizedString(LANGUAGE_FLAGS, code);
        const name = getLocalizedString(LANGUAGE_NAMES, code);
        const safeName = escapeHTML(name);
        const active = code === current ? ' active' : '';
        const ariaCurrent = code === current ? ' aria-current="page"' : '';
        const href = getArticleFilename(articleSlug, code);
        return `<a href="${href}" class="lang-link${active}" hreflang="${code}" lang="${code}" title="${safeName}" aria-label="${safeName}"${ariaCurrent}>${flag} ${code.toUpperCase()}</a>`;
    }).join('\n        ');
}
/**
 * Build the article-level Table of Contents nav. Renders a labelled
 * `<nav class="article-toc">` with one `<a>` per H2 section, keyed by the
 * stable fragment ids produced by the aggregator. The containing `<aside>`
 * is styled as a sticky sidebar on wide viewports and collapses into a
 * `<details>` disclosure on narrow viewports via `styles.css`.
 *
 * Returns an empty string when `entries` is empty so low-signal
 * `ANALYSIS_ONLY` articles (few sections, no value in a TOC) stay compact.
 *
 * @param entries - Ordered list of emitted H2 sections
 * @param lang - Language code used to localise the nav label
 * @returns HTML fragment for the sidebar, or `""` when no TOC is needed
 */
export function buildArticleToc(entries, lang) {
    if (entries.length === 0)
        return '';
    const label = escapeHTML(getLocalizedString(TOC_ARIA_LABELS, lang));
    const items = entries
        .map((e) => `        <li><a href="#${escapeHTML(e.id)}">${escapeHTML(e.title)}</a></li>`)
        .join('\n');
    return [
        `  <aside class="article-toc-container" aria-label="${label}">`,
        `    <details class="article-toc-details" open>`,
        `      <summary class="article-toc-summary">${label}</summary>`,
        `      <nav class="article-toc">`,
        `        <ol class="article-toc-list">`,
        items,
        `        </ol>`,
        `      </nav>`,
        `    </details>`,
        `  </aside>`,
        '',
    ].join('\n');
}
/**
 * Render the full article HTML document with the shared chrome.
 *
 * @param options - {@link WrapArticleOptions} describing the article and its
 *                  rendered body content
 * @returns Complete `<!DOCTYPE html>` document ready to be written to disk
 */
export function wrapArticleHtml(options) {
    const safeLang = ALL_LANGUAGES.includes(options.lang) ? options.lang : 'en';
    const dir = getTextDirection(safeLang);
    const siteTitle = getLocalizedString(PAGE_TITLES, safeLang).split(' - ')[0] ?? 'EU Parliament Monitor';
    const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, safeLang);
    const headerSubtitle = escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, safeLang));
    const themeToggleLabel = escapeHTML(getLocalizedString(THEME_TOGGLE_LABELS, safeLang));
    const canonicalUrl = `${BASE_URL}/news/${getArticleFilename(options.articleSlug, safeLang)}`;
    const indexHref = safeLang === 'en' ? '../index.html' : `../index-${safeLang}.html`;
    const hreflangLinks = buildArticleHreflangLinks(options.articleSlug);
    const langSwitcher = buildLanguageSwitcher(options.articleSlug, safeLang);
    const sourceMdLink = options.sourceMarkdownRelPath
        ? `<p class="article-source-md"><a href="${BASE_URL}/${options.sourceMarkdownRelPath}" rel="alternate" type="text/markdown">View source Markdown</a></p>`
        : '';
    const tocHtml = buildArticleToc(options.toc ?? [], safeLang);
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: options.title,
        description: options.description,
        datePublished: options.date,
        inLanguage: safeLang,
        url: canonicalUrl,
        author: { '@type': 'Organization', name: 'Hack23 AB', url: 'https://hack23.com' },
        publisher: { '@type': 'Organization', name: 'Hack23 AB', url: 'https://hack23.com' },
        articleSection: options.articleType,
        isPartOf: {
            '@type': 'WebSite',
            name: 'EU Parliament Monitor',
            url: BASE_URL,
        },
    };
    const jsonLdString = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
    const pageTitle = `${options.title} — ${siteTitle}`;
    return `<!DOCTYPE html>
<html lang="${safeLang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="Content-Language" content="${safeLang}">
  <meta name="referrer" content="no-referrer">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(options.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="author" content="Hack23 AB">
  <meta name="publisher" content="Hack23 AB">
  <meta name="date" content="${options.date}">
  <meta name="article:published_time" content="${options.date}">
  <link rel="canonical" href="${canonicalUrl}">
${hreflangLinks}
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHTML(options.title)}">
  <meta property="og:description" content="${escapeHTML(options.description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${safeLang}">
  <meta property="og:image" content="${BASE_URL}/images/og-image.jpg">
  <meta property="og:image:alt" content="${escapeHTML(options.title)} — EU Parliament Monitor">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHTML(options.title)}">
  <meta name="twitter:description" content="${escapeHTML(options.description)}">
  <meta name="twitter:image" content="${BASE_URL}/images/og-image.jpg">
  <link rel="icon" type="image/x-icon" href="../favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png">
  <link rel="manifest" href="../site.webmanifest">
  <meta name="theme-color" content="#003399">
  <link rel="stylesheet" href="../styles.css">
  <script type="application/ld+json">${jsonLdString}</script>
  <script type="module" src="../js/vendor/mermaid.esm.min.mjs" defer></script>
  <script type="module" src="../js/mermaid-init.js" defer></script>
</head>
<body>
  <a href="#main" class="skip-link">${escapeHTML(skipLinkText)}</a>

  <header class="site-header" role="banner">
    <div class="site-header__inner site-header__inner--stacked">
      <a href="${indexHref}" class="site-header__brand" aria-label="${escapeHTML(siteTitle)}">
        <picture class="site-header__logo-picture">
          <source srcset="../images/header-logo.webp" type="image/webp">
          <img class="site-header__logo site-header__logo--header" src="../images/header-logo.png" alt="" width="72" height="48" aria-hidden="true">
        </picture>
        <span>
          <span class="site-header__title">${escapeHTML(siteTitle)}</span>
          <span class="site-header__subtitle">${headerSubtitle}</span>
        </span>
      </a>
      ${createThemeToggleButton(themeToggleLabel)}
      <nav class="site-header__langs" role="navigation" aria-label="Language selection">
        ${langSwitcher}
      </nav>
    </div>
  </header>

  <main id="main" class="site-main article-main">
${tocHtml}    <article class="article-body" lang="${safeLang}">
      ${sourceMdLink}
      ${options.body}
    </article>
  </main>

  ${buildSiteFooter({ lang: safeLang, pathPrefix: '../', ...(typeof options.articleCount === 'number' ? { articleCount: options.articleCount } : {}) })}${THEME_TOGGLE_SCRIPT}
</body>
</html>`;
}
//# sourceMappingURL=article-html.js.map