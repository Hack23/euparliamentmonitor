// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Sitemap/Html
 * @description Generates the per-language `sitemap_<lang>.html` pages —
 * the human-friendly index of every news article and documentation
 * page, with category grouping, hreflang alternates, breadcrumb,
 * structured data, and the 14-language language switcher.
 *
 * Lifted out of the monolithic `sitemap.ts` so the HTML renderer can be
 * unit-tested in isolation, so the bounded context "sitemap HTML" is
 * clear, and so the lookup tables in `copy.ts` can be reused by any
 * future renderer (Atom-feed metadata, OG-card builder, etc.) without
 * having to import `sitemap.ts` and pull in the entire CLI surface.
 *
 * Output is byte-identical to the previous in-line implementation that
 * lived in `sitemap.ts` between Apr-2026 and the bounded-context
 * refactor — verified by the regression test in
 * `test/unit/sitemap-byte-equality.test.js` (compares against the
 * golden snapshots taken from `npm run prebuild`).
 */
import { BASE_URL, THEME_TOGGLE_SCRIPT } from '../../constants/config.js';
import { buildHeadFreshnessTags } from '../../constants/build-info-meta.js';
import { getSitemapSeo } from '../seo-copy.js';
import { ALL_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS, PAGE_TITLES, PAGE_DESCRIPTIONS, SKIP_LINK_TEXTS, UPDATE_AVAILABLE_LABELS, UPDATE_REFRESH_CTA_LABELS, UPDATE_DISMISS_LABELS, getLocalizedString, getTextDirection, } from '../../constants/languages.js';
import { escapeHTML } from '../../utils/file-utils.js';
import { detectCategory } from '../../utils/article-category.js';
import { ARTICLE_TYPE_LABELS, FOOTER_POLITICAL_INTELLIGENCE_LABELS, } from '../../constants/language-ui.js';
import { buildSiteFooter, buildSiteHeader, buildPageBanner, } from '../../templates/section-builders.js';
import { getPoliticalIntelligenceFilename } from '../political-intelligence.js';
import { SITEMAP_TITLES, SITEMAP_SECTIONS, DOCS_LABELS, CATEGORY_ORDER, DEFAULT_SITEMAP_TITLE, getSitemapCopy, } from './copy.js';
/**
 * Get the sitemap HTML filename for a given language code.
 *
 * @param lang - Language code (e.g. `en`, `sv`, `de`)
 * @returns `sitemap.html` for English, `sitemap_<lang>.html` for everything else
 */
export function getSitemapFilename(lang) {
    return lang === 'en' ? 'sitemap.html' : `sitemap_${lang}.html`;
}
/**
 * Get the index filename for a given language code. Mirrors the rule
 * used by `getIndexFilename()` in `news-indexes.ts`.
 *
 * @param lang - Language code
 * @returns `index.html` for English, `index-<lang>.html` for everything else
 */
export function getIndexFilename(lang) {
    return lang === 'en' ? 'index.html' : `index-${lang}.html`;
}
const SCHEMA_ORG = 'https://schema.org';
const SITE_NAME = 'EU Parliament Monitor';
/**
 * Build the language switcher nav HTML for the sitemap pages.
 *
 * Each link points at the sibling `sitemap_<lang>.html`; the active
 * language gets `aria-current="page"` and the `active` class so screen
 * readers and CSS can flag it.
 *
 * @param currentLang - Active language code
 * @returns HTML fragment to be embedded inside `<nav class="language-switcher">`
 */
function buildSitemapLangSwitcher(currentLang) {
    return ALL_LANGUAGES.map((code) => {
        const flag = getLocalizedString(LANGUAGE_FLAGS, code);
        const name = getLocalizedString(LANGUAGE_NAMES, code);
        const active = code === currentLang ? ' active' : '';
        const ariaCurrent = code === currentLang ? ' aria-current="page"' : '';
        const href = getSitemapFilename(code);
        return `<a href="${href}" class="lang-link${active}" hreflang="${code}" lang="${code}" title="${escapeHTML(name)}" aria-label="${escapeHTML(name)}"${ariaCurrent}>${flag} ${code.toUpperCase()}</a>`;
    }).join('\n        ');
}
/**
 * Generate a sitemap HTML page for a specific language.
 *
 * Lists all articles for that language with titles and descriptions,
 * grouped by editorial category in {@link CATEGORY_ORDER}, plus a
 * high-level documentation section (only when `hasDocsDir` is true) and
 * a Pages section with one entry per supported language.
 *
 * The output document includes:
 * - `<head>` `<link rel="alternate">` hreflang block covering every
 *   supported language plus `x-default` → English
 * - JSON-LD `CollectionPage` structured data (with `<` escaped as
 *   `\u003c` to avoid breaking out of the `<script>` element)
 * - Skip link, header brand, theme toggle, language switcher
 * - Hero section with localized stats (article count, language count,
 *   category count, last-updated date)
 * - Breadcrumb nav
 * - Pages / Documentation / News sections
 * - Shared site footer via {@link buildSiteFooter}
 *
 * @param lang - Language code
 * @param articleInfos - Article info (title/description) for this language
 * @param hasDocsDir - Whether the docs/ directory exists (controls the Documentation section)
 * @returns Complete HTML document string
 */
export function generateSitemapHTML(lang, articleInfos, hasDocsDir = false) {
    const sitemapTitle = SITEMAP_TITLES[lang] ?? SITEMAP_TITLES['en'] ?? DEFAULT_SITEMAP_TITLE;
    const pageTitle = `${getLocalizedString(PAGE_TITLES, lang).split(' - ')[0]} - ${sitemapTitle}`;
    const description = getLocalizedString(PAGE_DESCRIPTIONS, lang);
    const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, lang);
    const dir = getTextDirection(lang);
    const today = new Date().toISOString().slice(0, 10);
    const sections = (SITEMAP_SECTIONS[lang] ?? SITEMAP_SECTIONS['en']);
    const docsLabels = (DOCS_LABELS[lang] ?? DOCS_LABELS['en']);
    const copy = getSitemapCopy(lang);
    const heroTitle = getLocalizedString(PAGE_TITLES, lang).split(' - ')[0] ?? '';
    const typeLabels = getLocalizedString(ARTICLE_TYPE_LABELS, lang);
    const canonicalUrl = `${BASE_URL}/${getSitemapFilename(lang)}`;
    const header = buildSiteHeader({
        lang: lang,
        pathPrefix: '',
        homeHref: getIndexFilename(lang),
        siteTitle: heroTitle,
        languageSwitcherHtml: buildSitemapLangSwitcher(lang),
    });
    // ─── <head> hreflang alternates for all sitemap language variants ───
    const hreflangLinks = [
        ...ALL_LANGUAGES.map((code) => `  <link rel="alternate" hreflang="${code}" href="${BASE_URL}/${getSitemapFilename(code)}">`),
        `  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/sitemap.html">`,
    ].join('\n');
    // ─── Pages section (one per supported language) ─────────────────────
    const pagesSection = ALL_LANGUAGES.map((code) => {
        const name = getLocalizedString(LANGUAGE_NAMES, code);
        const flag = getLocalizedString(LANGUAGE_FLAGS, code);
        const href = getIndexFilename(code);
        const pageDesc = getLocalizedString(PAGE_DESCRIPTIONS, code);
        return `          <li>
            <a href="${href}" hreflang="${code}">${flag} ${escapeHTML(name)}</a>
            <span class="link-description">${escapeHTML(pageDesc)}</span>
          </li>`;
    }).join('\n');
    // ─── News articles grouped by editorial category ────────────────────
    const articlesByCategory = new Map();
    for (const article of articleInfos) {
        const category = detectCategory(article.slug ?? article.filename);
        let bucket = articlesByCategory.get(category);
        if (!bucket) {
            bucket = [];
            articlesByCategory.set(category, bucket);
        }
        bucket.push(article);
    }
    // Render in the canonical category order, then any remaining categories
    const orderedCategories = [
        ...CATEGORY_ORDER.filter((c) => articlesByCategory.has(c)),
        ...[...articlesByCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
    ];
    const articlesSection = articleInfos.length === 0
        ? ''
        : orderedCategories
            .map((category) => {
            const bucket = articlesByCategory.get(category) ?? [];
            // Newest first within each category
            bucket.sort((a, b) => b.date.localeCompare(a.date));
            const label = typeLabels[category] ?? category;
            const items = bucket
                .map((a) => `            <li>
              <a href="news/${escapeHTML(a.filename)}">${escapeHTML(a.title)}</a>
              <span class="sitemap-date">${escapeHTML(a.date)}</span>${a.description ? `\n              <p class="sitemap-desc">${escapeHTML(a.description)}</p>` : ''}
            </li>`)
                .join('\n');
            return `        <section class="sitemap-category" aria-labelledby="cat-${category}">
          <h3 id="cat-${category}" class="sitemap-category__heading">${escapeHTML(label)} <span class="sitemap-category__count" aria-label="${bucket.length} ${escapeHTML(copy.statArticlesLabel)}">${bucket.length}</span></h3>
          <ul class="sitemap-list">
${items}
          </ul>
        </section>`;
        })
            .join('\n');
    // ─── Documentation section (high-level links) ───────────────────────
    const docsSection = hasDocsDir
        ? `
      <section class="sitemap-section">
        <h2><span aria-hidden="true">📚</span> ${escapeHTML(sections.docs)}</h2>
        <p class="section-description">${escapeHTML(copy.docsDescription)}</p>
        <ul class="sitemap-list">
          <li><a href="docs/">${escapeHTML(docsLabels.docsHome)}</a></li>
          <li><a href="docs/api/">${escapeHTML(docsLabels.api)}</a></li>
          <li><a href="docs/coverage/index.html">${escapeHTML(docsLabels.coverage)}</a></li>
          <li><a href="docs/test-results/index.html">${escapeHTML(docsLabels.testResults)}</a></li>
        </ul>
      </section>`
        : '';
    // ─── JSON-LD CollectionPage structured data for SEO ─────────────────
    const seo = getSitemapSeo(lang);
    const ogImage = `${BASE_URL}/images/og-image.jpg`;
    const jsonLd = {
        '@context': SCHEMA_ORG,
        '@type': 'CollectionPage',
        name: sitemapTitle,
        url: canonicalUrl,
        description: copy.intro,
        inLanguage: lang,
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: BASE_URL,
        },
        publisher: { '@id': `${BASE_URL}/#organization` },
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: copy.home,
                    item: `${BASE_URL}/${getIndexFilename(lang)}`,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: copy.breadcrumbCurrent,
                    item: canonicalUrl,
                },
            ],
        },
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: Math.min(articleInfos.length, 50),
            name: sections.news,
            itemListElement: articleInfos.slice(0, 50).map((info, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                url: `${BASE_URL}/news/${info.filename}`,
                name: info.title,
            })),
        },
    };
    // Safely embed JSON-LD: escape the `<` that could start `</script>` sequences
    const jsonLdString = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
    const websiteJsonLd = JSON.stringify({
        '@context': SCHEMA_ORG,
        '@type': 'WebSite',
        name: SITE_NAME,
        url: BASE_URL,
        inLanguage: lang,
        publisher: { '@id': `${BASE_URL}/#organization` },
    }).replace(/</g, '\\u003c');
    const organizationJsonLd = JSON.stringify({
        '@context': SCHEMA_ORG,
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Hack23 AB',
        url: 'https://hack23.com',
        logo: {
            '@type': 'ImageObject',
            url: 'https://hack23.com/icon-192.png',
            width: 192,
            height: 192,
        },
        sameAs: ['https://github.com/Hack23', 'https://hack23.com'],
    }).replace(/</g, '\\u003c');
    const faqJsonLd = JSON.stringify({
        '@context': SCHEMA_ORG,
        '@type': 'FAQPage',
        inLanguage: lang,
        mainEntity: seo.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    }).replace(/</g, '\\u003c');
    const faqHtml = `<section class="page-faq" aria-labelledby="sitemap-faq-heading">
      <h2 id="sitemap-faq-heading"><span aria-hidden="true">❓</span> ${escapeHTML(seo.faqHeading)}</h2>
      <div class="page-faq__list">
        ${seo.faqs
        .map((f) => `<details class="page-faq__item">
          <summary>${escapeHTML(f.q)}</summary>
          <p>${escapeHTML(f.a)}</p>
        </details>`)
        .join('\n        ')}
      </div>
    </section>`;
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="no-referrer">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(description)}">
  <meta name="keywords" content="${escapeHTML(seo.keywords)}">
  <meta name="author" content="Hack23 AB">
  <meta name="publisher" content="Hack23 AB">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta http-equiv="Content-Language" content="${lang}">
  <link rel="canonical" href="${canonicalUrl}">
${hreflangLinks}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHTML(sitemapTitle)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${lang}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHTML(seo.ogImageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHTML(sitemapTitle)}">
  <meta name="twitter:description" content="${escapeHTML(description)}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="twitter:image:alt" content="${escapeHTML(seo.ogImageAlt)}">
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <meta name="theme-color" content="#003399">
  <link rel="stylesheet" href="styles.css">
  <meta name="ep-i18n-update-text" content="${escapeHTML(getLocalizedString(UPDATE_AVAILABLE_LABELS, lang))}">
  <meta name="ep-i18n-update-cta" content="${escapeHTML(getLocalizedString(UPDATE_REFRESH_CTA_LABELS, lang))}">
  <meta name="ep-i18n-dismiss" content="${escapeHTML(getLocalizedString(UPDATE_DISMISS_LABELS, lang))}">
${buildHeadFreshnessTags('')}
  <script type="application/ld+json">${websiteJsonLd}</script>
  <script type="application/ld+json">${organizationJsonLd}</script>
  <script type="application/ld+json">${jsonLdString}</script>
  <script type="application/ld+json">${faqJsonLd}</script>
</head>
<body>
  <a href="#main" class="skip-link">${escapeHTML(skipLinkText)}</a>

  ${header}

  ${buildPageBanner('')}

  <main id="main" class="site-main">
    <section class="sitemap-hero" aria-labelledby="sitemap-heading">
      <h1 id="sitemap-heading">🗺️ ${escapeHTML(sitemapTitle)}</h1>
      <p class="sitemap-hero__subtitle">${escapeHTML(copy.heroSubtitle)}</p>
      <p class="sitemap-hero__intro">${escapeHTML(copy.intro)}</p>
      <dl class="sitemap-stats" aria-label="${escapeHTML(sitemapTitle)}">
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statArticlesLabel)}</dt>
          <dd>${articleInfos.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statLanguagesLabel)}</dt>
          <dd>${ALL_LANGUAGES.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statCategoriesLabel)}</dt>
          <dd>${orderedCategories.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statLastUpdatedLabel)}</dt>
          <dd><time datetime="${today}">${today}</time></dd>
        </div>
      </dl>
    </section>

    <nav class="breadcrumb" aria-label="${escapeHTML(copy.breadcrumbLabel)}">
      <ol>
        <li><a href="${getIndexFilename(lang)}">${escapeHTML(copy.home)}</a></li>
        <li aria-current="page">${escapeHTML(copy.breadcrumbCurrent)}</li>
      </ol>
    </nav>

    <div class="sitemap-grid">
      <section class="sitemap-section">
        <h2><span aria-hidden="true">🏠</span> ${escapeHTML(sections.pages)}</h2>
        <p class="section-description">${escapeHTML(copy.pagesDescription)}</p>
        <ul class="sitemap-list">
${pagesSection}
          <li>
            <a href="${getPoliticalIntelligenceFilename(lang)}" hreflang="${lang}">🧭 ${escapeHTML(getLocalizedString(FOOTER_POLITICAL_INTELLIGENCE_LABELS, lang))}</a>
            <span class="link-description">${escapeHTML(copy.politicalIntelligenceLinkDescription)}</span>
          </li>
        </ul>
      </section>
${docsSection}
      <section class="sitemap-section sitemap-section--news">
        <h2><span aria-hidden="true">📰</span> ${escapeHTML(sections.news)}</h2>
        <p class="section-description">${escapeHTML(copy.newsDescription)}</p>
${articlesSection}
      </section>
    </div>

    ${faqHtml}
  </main>

  ${buildSiteFooter({ lang: lang, pathPrefix: '', articleCount: articleInfos.length })}${THEME_TOGGLE_SCRIPT}
</body>
</html>`;
}
//# sourceMappingURL=html.js.map