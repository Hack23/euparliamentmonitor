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
 * in the body. Mermaid is loaded from the same-origin vendored ESM bundle
 * (copied to `js/vendor/mermaid/` by `scripts/copy-vendor.js`) via
 * `<script type="module" src="../js/mermaid-init.js?v=<MERMAID_VERSION>" defer>`
 * so CSP stays `script-src 'self'`. The `?v=` query parameter is sourced
 * from `devDependencies.mermaid` in `package.json` (a fixed pin like
 * `11.14.0`); regenerating articles after a Mermaid bump invalidates
 * browser and CloudFront caches automatically.
 */
import { BASE_URL, MERMAID_VERSION } from '../constants/config.js';
import { buildHeadFreshnessTags } from '../constants/build-info-meta.js';
import { ALL_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS, PAGE_TITLES, SKIP_LINK_TEXTS, TOC_ARIA_LABELS, UPDATE_AVAILABLE_LABELS, UPDATE_REFRESH_CTA_LABELS, UPDATE_DISMISS_LABELS, getLocalizedString, getTextDirection, } from '../constants/languages.js';
import { escapeHTML } from '../utils/file-utils.js';
import { buildSiteFooter, buildSiteHeader, buildPageBanner, } from '../templates/section-builders.js';
import { READER_GUIDE_SECTION_ID } from './reader-guide-constants.js';
import { READER_GUIDE_TITLE_LABELS } from './reader-intelligence-guide.js';
/** Publisher organization name used in JSON-LD, meta tags. */
const PUBLISHER_NAME = 'Hack23 AB';
/** Site name used across meta tags and structured data. */
const SITE_NAME = 'EU Parliament Monitor';
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
        .map((e) => {
        // Translate the Reader Intelligence Guide title into the target language
        const displayTitle = e.id === READER_GUIDE_SECTION_ID
            ? getLocalizedString(READER_GUIDE_TITLE_LABELS, lang)
            : e.title;
        return `        <li><a href="#${escapeHTML(e.id)}">${escapeHTML(displayTitle)}</a></li>`;
    })
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
    const siteTitle = getLocalizedString(PAGE_TITLES, safeLang).split(' - ')[0] ?? SITE_NAME;
    const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, safeLang);
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
        dateModified: options.date,
        inLanguage: safeLang,
        url: canonicalUrl,
        image: `${BASE_URL}/images/og-image.jpg`,
        author: { '@type': 'Organization', name: PUBLISHER_NAME, url: 'https://hack23.com' },
        publisher: {
            '@type': 'Organization',
            name: PUBLISHER_NAME,
            url: 'https://hack23.com',
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/images/apple-touch-icon.png` },
        },
        articleSection: options.articleType,
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: BASE_URL,
        },
        ...(options.isBasedOn && options.isBasedOn.length > 0
            ? {
                isBasedOn: options.isBasedOn.map((url) => ({ '@type': 'CreativeWork', url })),
            }
            : {}),
    };
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: SITE_NAME,
                item: BASE_URL,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: options.articleType.replace(/-/g, ' '),
                item: `${BASE_URL}/news/`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: options.title,
                item: canonicalUrl,
            },
        ],
    };
    const structuredData = [jsonLd, breadcrumbLd];
    const jsonLdString = JSON.stringify(structuredData).replace(/</g, '\\u003c');
    const pageTitle = `${options.title} — ${siteTitle}`;
    const header = buildSiteHeader({
        lang: safeLang,
        pathPrefix: '../',
        homeHref: indexHref,
        siteTitle,
        languageSwitcherHtml: langSwitcher,
    });
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
  <meta name="author" content="${PUBLISHER_NAME}">
  <meta name="publisher" content="${PUBLISHER_NAME}">
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
  <meta name="ep-i18n-update-text" content="${escapeHTML(getLocalizedString(UPDATE_AVAILABLE_LABELS, safeLang))}">
  <meta name="ep-i18n-update-cta" content="${escapeHTML(getLocalizedString(UPDATE_REFRESH_CTA_LABELS, safeLang))}">
  <meta name="ep-i18n-dismiss" content="${escapeHTML(getLocalizedString(UPDATE_DISMISS_LABELS, safeLang))}">
${buildHeadFreshnessTags('../')}
  <script type="application/ld+json">${jsonLdString}</script>
  <script type="module" src="../js/mermaid-init.js?v=${MERMAID_VERSION}" defer></script>
  <script src="../js/article-runtime.js" defer></script>
</head>
<body>
  <a href="#main" class="skip-link">${escapeHTML(skipLinkText)}</a>

  ${header}

  ${buildPageBanner('../')}

  <main id="main" class="site-main article-main">
${tocHtml}    <article class="article-body" lang="${safeLang}">
      <header class="article-hero">
        <p class="article-kicker">${escapeHTML(options.articleType.replace(/-/g, ' '))}</p>
        <h1>${escapeHTML(options.title)}</h1>
        <p class="article-dek">${escapeHTML(options.description)}</p>
        <p class="article-meta"><time datetime="${options.date}">${options.date}</time> · EU Parliament Monitor</p>
      </header>
      ${sourceMdLink}
      ${options.body}
    </article>
  </main>

  ${buildSiteFooter({ lang: safeLang, pathPrefix: '../', ...(typeof options.articleCount === 'number' ? { articleCount: options.articleCount } : {}) })}
</body>
</html>`;
}
//# sourceMappingURL=article-html.js.map