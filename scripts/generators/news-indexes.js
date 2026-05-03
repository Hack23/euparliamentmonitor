#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/NewsIndexes
 * @description Generates index.html files for each language listing all news articles.
 * English is the primary homepage (index.html), other languages use index-{lang}.html.
 * Design follows riksdagsmonitor patterns: compact language switcher, Hack23 AB footer.
 */
import path, { resolve } from 'path';
import { pathToFileURL } from 'url';
import { PROJECT_ROOT, APP_VERSION, NEWS_DIR, BASE_URL } from '../constants/config.js';
import { getNewsIndexSeo } from './seo-copy.js';
import { buildHeadFreshnessTags } from '../constants/build-info-meta.js';
import { ALL_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS, PAGE_TITLES, PAGE_DESCRIPTIONS, SECTION_HEADINGS, NO_ARTICLES_MESSAGES, SKIP_LINK_TEXTS, AI_SECTION_CONTENT, FILTER_LABELS, ARTICLE_TYPE_LABELS, HEADER_SUBTITLE_LABELS, UPDATE_AVAILABLE_LABELS, UPDATE_REFRESH_CTA_LABELS, UPDATE_DISMISS_LABELS, getLocalizedString, getTextDirection, } from '../constants/languages.js';
import { buildSiteFooter, buildSiteHeader } from '../templates/section-builders.js';
import { getNewsArticles, groupArticlesByLanguage, formatSlug, parseArticleFilename, extractArticleMeta, escapeHTML, atomicWrite, } from '../utils/file-utils.js';
import { writeMetadataDatabase } from '../utils/news-metadata.js';
import { detectCategory } from '../utils/article-category.js';
/**
 * Get the index filename for a given language code.
 * English uses index.html (the primary homepage), others use index-{lang}.html.
 *
 * @param lang - Language code
 * @returns Filename string
 */
export function getIndexFilename(lang) {
    return lang === 'en' ? 'index.html' : `index-${lang}.html`;
}
const SCHEMA_ORG = 'https://schema.org';
const SITE_NAME = 'EU Parliament Monitor';
/**
 * Build the compact language switcher nav HTML.
 * Uses flag emoji + language code, riksdagsmonitor style.
 *
 * @param currentLang - Active language code
 * @returns HTML string
 */
function buildLangSwitcher(currentLang) {
    return ALL_LANGUAGES.map((code) => {
        const flag = getLocalizedString(LANGUAGE_FLAGS, code);
        const name = getLocalizedString(LANGUAGE_NAMES, code);
        const active = code === currentLang ? ' active' : '';
        const href = getIndexFilename(code);
        const current = code === currentLang ? ' aria-current="page"' : '';
        const safeHref = escapeHTML(href);
        const safeCode = escapeHTML(code);
        const safeName = escapeHTML(name);
        return `<a href="${safeHref}" class="lang-link${active}" hreflang="${safeCode}" lang="${safeCode}" title="${safeName}" aria-label="${safeName}"${current}>${flag} ${code.toUpperCase()}</a>`;
    }).join('\n        ');
}
/**
 * Render a single news card element.
 *
 * @param article - Parsed article data
 * @param meta - Real title and description extracted from the article HTML
 * @param meta.title - Article title
 * @param meta.description - Article description/excerpt
 * @param categoryLabels - Optional localized article category labels
 * @returns HTML string for one card
 */
function renderCard(article, meta, categoryLabels) {
    const category = detectCategory(article.slug);
    // Sanitize the category for safe use in CSS class names (allow only alphanumeric and hyphens)
    const safeCategory = String(category).replace(/[^a-z0-9-]/gi, '');
    const title = escapeHTML(meta.title || formatSlug(article.slug));
    const badgeLabel = categoryLabels?.[category] ?? formatSlug(safeCategory);
    const excerpt = meta.description
        ? `\n            <p class="news-card__excerpt">${escapeHTML(meta.description)}</p>`
        : '';
    return `
      <li class="news-card">
        <a href="news/${escapeHTML(article.filename)}" class="news-card__link" lang="${escapeHTML(article.lang)}" hreflang="${escapeHTML(article.lang)}">
          <div class="news-card__accent news-card__accent--${safeCategory}"></div>
          <div class="news-card__body">
            <div class="news-card__meta">
              <span class="news-card__badge news-card__badge--${safeCategory}">${escapeHTML(badgeLabel)}</span>
              <time class="news-card__date" datetime="${escapeHTML(article.date)}">${escapeHTML(article.date)}</time>
            </div>
            <h3 class="news-card__title">${title}</h3>${excerpt}
          </div>
        </a>
      </li>`;
}
/**
 * Build hreflang alternate link tags for SEO multi-language support.
 *
 * @returns HTML string of link elements
 */
function buildHreflangTags() {
    const links = ALL_LANGUAGES.map((code) => {
        const href = getIndexFilename(code);
        return `<link rel="alternate" hreflang="${code}" href="${href}">`;
    });
    links.push('<link rel="alternate" hreflang="x-default" href="index.html">');
    return links.join('\n  ');
}
/**
 * Generate index HTML for a language.
 *
 * Produces a complete, standards-compliant HTML5 page with:
 * - Sticky header with EU branding
 * - Compact language switcher with flag + code
 * - Hero section with page title and description
 * - Responsive card grid for news articles
 * - Accessible empty state when no articles exist
 * - Hack23 AB multi-section footer (About, Quick Links, Built by Hack23, Languages)
 *
 * @param lang - Language code
 * @param articles - Articles for this language
 * @param metaMap - Map of article filename to real title and description
 * @returns Complete HTML document
 */
export function generateIndexHTML(lang, articles, metaMap = new Map()) {
    const title = getLocalizedString(PAGE_TITLES, lang);
    const description = getLocalizedString(PAGE_DESCRIPTIONS, lang);
    const heading = getLocalizedString(SECTION_HEADINGS, lang);
    const noArticlesText = getLocalizedString(NO_ARTICLES_MESSAGES, lang);
    const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, lang);
    const dir = getTextDirection(lang);
    const selfHref = getIndexFilename(lang);
    const heroTitle = title.split(' - ')[0] ?? 'EU Parliament Monitor';
    const filterLabels = getLocalizedString(FILTER_LABELS, lang);
    const categoryLabels = getLocalizedString(ARTICLE_TYPE_LABELS, lang);
    // Collect distinct categories from the current article set
    const usedCategories = new Set();
    for (const a of articles) {
        usedCategories.add(detectCategory(a.slug));
    }
    const content = articles.length === 0
        ? `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">📰</div>
      <p class="empty-state__text">${noArticlesText}</p>
    </div>`
        : `
    <ul class="news-grid" role="list">
      ${articles
            .map((a) => renderCard(a, metaMap.get(a.filename) ?? { title: formatSlug(a.slug), description: '' }, categoryLabels))
            .join('\n')}
    </ul>`;
    const ai = getLocalizedString(AI_SECTION_CONTENT, lang);
    // Build filter buttons from used categories (with article count)
    const categoryCounts = new Map();
    for (const a of articles) {
        const cat = detectCategory(a.slug);
        categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
    }
    const filterButtons = articles.length > 0
        ? Array.from(usedCategories)
            .sort()
            .map((cat) => {
            const safeCat = String(cat).replace(/[^a-z0-9-]/gi, '');
            const label = categoryLabels[cat] ?? formatSlug(safeCat);
            const count = categoryCounts.get(cat) ?? 0;
            return `<button type="button" class="filter-btn" data-category="${safeCat}">${escapeHTML(label)}<span class="filter-btn__count">${count}</span></button>`;
        })
            .join('\n          ')
        : '';
    const seo = getNewsIndexSeo(lang);
    const canonicalUrl = `${BASE_URL}/${selfHref}`;
    const ogImage = `${BASE_URL}/images/og-image.jpg`;
    // Structured data: WebSite + SearchAction, Organization with logo,
    // CollectionPage with BreadcrumbList, and FAQPage. Each block is a
    // separate <script type="application/ld+json"> with literal `<` chars
    // escaped to `\u003c` so the JSON cannot prematurely close the tag.
    const websiteJsonLd = JSON.stringify({
        '@context': SCHEMA_ORG,
        '@type': 'WebSite',
        name: SITE_NAME,
        url: BASE_URL,
        inLanguage: lang,
        publisher: { '@id': `${BASE_URL}/#organization` },
        potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/?q={search_term_string}` },
            'query-input': 'required name=search_term_string',
        },
    }).replace(/</g, '\\u003c');
    const organizationJsonLd = JSON.stringify({
        '@context': SCHEMA_ORG,
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Hack23 AB',
        url: 'https://hack23.com',
        logo: { '@type': 'ImageObject', url: 'https://hack23.com/icon-192.png', width: 192, height: 192 },
        sameAs: ['https://github.com/Hack23', 'https://hack23.com'],
    }).replace(/</g, '\\u003c');
    const collectionPageJsonLd = JSON.stringify({
        '@context': SCHEMA_ORG,
        '@type': 'CollectionPage',
        name: heroTitle,
        description,
        url: canonicalUrl,
        inLanguage: lang,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: BASE_URL },
        publisher: { '@id': `${BASE_URL}/#organization` },
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: seo.breadcrumbHome, item: BASE_URL },
                { '@type': 'ListItem', position: 2, name: seo.breadcrumbCurrent, item: canonicalUrl },
            ],
        },
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: articles.length,
            itemListElement: articles.slice(0, 50).map((a, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                url: `${BASE_URL}/news/${a.filename}`,
                name: metaMap.get(a.filename)?.title ?? formatSlug(a.slug),
            })),
        },
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
    // Visible breadcrumb — string-equal labels with the BreadcrumbList JSON-LD.
    const breadcrumbHtml = `<nav class="breadcrumb" aria-label="${escapeHTML(seo.breadcrumbAriaLabel)}">
    <ol class="breadcrumb__list">
      <li class="breadcrumb__item"><a href="${selfHref}">${escapeHTML(seo.breadcrumbHome)}</a></li>
      <li class="breadcrumb__item breadcrumb__item--current" aria-current="page">${escapeHTML(seo.breadcrumbCurrent)}</li>
    </ol>
  </nav>`;
    // Visible FAQ — Q/A bodies are byte-equivalent to the FAQPage JSON-LD.
    const faqHtml = `<section class="page-faq" aria-labelledby="page-faq-heading">
    <h2 id="page-faq-heading"><span aria-hidden="true">❓</span> ${escapeHTML(seo.faqHeading)}</h2>
    <div class="page-faq__list">
      ${seo.faqs
        .map((f) => `<details class="page-faq__item">
        <summary>${escapeHTML(f.q)}</summary>
        <p>${escapeHTML(f.a)}</p>
      </details>`)
        .join('\n      ')}
    </div>
  </section>`;
    const header = buildSiteHeader({
        lang: lang,
        pathPrefix: '',
        homeHref: selfHref,
        siteTitle: heroTitle,
        languageSwitcherHtml: buildLangSwitcher(lang),
    });
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="no-referrer">
  <meta name="generator" content="EU Parliament Monitor v${escapeHTML(APP_VERSION)}">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${escapeHTML(seo.keywords)}">
  <meta name="author" content="Hack23 AB">
  <meta name="publisher" content="Hack23 AB">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta http-equiv="Content-Language" content="${lang}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${heroTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${lang}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHTML(seo.ogImageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${heroTitle}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="twitter:image:alt" content="${escapeHTML(seo.ogImageAlt)}">
  ${buildHreflangTags()}
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <meta name="theme-color" content="#003399">
  <link rel="alternate" type="application/rss+xml" title="EU Parliament Monitor RSS" href="rss.xml">
  <link rel="stylesheet" href="styles.css">
  <meta name="ep-i18n-update-text" content="${escapeHTML(getLocalizedString(UPDATE_AVAILABLE_LABELS, lang))}">
  <meta name="ep-i18n-update-cta" content="${escapeHTML(getLocalizedString(UPDATE_REFRESH_CTA_LABELS, lang))}">
  <meta name="ep-i18n-dismiss" content="${escapeHTML(getLocalizedString(UPDATE_DISMISS_LABELS, lang))}">
${buildHeadFreshnessTags('')}
  <script type="application/ld+json">${websiteJsonLd}</script>
  <script type="application/ld+json">${organizationJsonLd}</script>
  <script type="application/ld+json">${collectionPageJsonLd}</script>
  <script type="application/ld+json">${faqJsonLd}</script>
</head>
<body>
  <a href="#main" class="skip-link">${skipLinkText}</a>

  ${header}

  ${breadcrumbHtml}

  <section class="hero">
    <div class="hero__inner">
      <div class="hero__content">
        <p class="hero__kicker">${escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, lang))}</p>
        <h1 class="hero__title">${heroTitle}</h1>
        <p class="hero__description">${description}</p>
      </div>
      <picture class="hero__banner">
        <source srcset="images/banner.webp" type="image/webp">
        <img src="images/banner.jpg" alt="EU Parliament Monitor — AI-Disrupted Parliamentary Intelligence" class="hero__banner-img" width="1200" height="400" loading="eager">
      </picture>
    </div>
  </section>

  <main id="main" class="site-main">
    <h2 class="section-heading"><span class="section-heading__icon" aria-hidden="true">📋</span> ${heading}</h2>${articles.length > 0
        ? `
    <div class="filter-toolbar" role="toolbar" aria-label="Filter articles">
      <div class="filter-buttons">
        <button type="button" class="filter-btn active" data-category="all">${escapeHTML(filterLabels.all)}<span class="filter-btn__count">${articles.length}</span></button>
        ${filterButtons}
      </div>
      <div class="filter-search">
        <input type="search" class="filter-search__input" placeholder="${escapeHTML(filterLabels.search)}" aria-label="${escapeHTML(filterLabels.search)}">
      </div>
    </div>`
        : ''}
    ${content}
  </main>

  <section class="ai-intelligence" aria-labelledby="ai-heading">
    <h2 id="ai-heading"><span aria-hidden="true">🤖</span> ${escapeHTML(ai.heading)}</h2>
    <blockquote class="ai-intelligence__quote">${escapeHTML(ai.quote)}</blockquote>
    <p>${escapeHTML(ai.description)}</p>
    <ul class="ai-intelligence__features">
      <li><strong>${escapeHTML(ai.featureAgents)}</strong> &mdash; ${escapeHTML(ai.featureAgentsDesc)}</li>
      <li><strong>${escapeHTML(ai.featureSchedule)}</strong> &mdash; ${escapeHTML(ai.featureScheduleDesc)}</li>
      <li><strong>${escapeHTML(ai.featureHuman)}</strong> &mdash; ${escapeHTML(ai.featureHumanDesc)}</li>
      <li><strong>${escapeHTML(ai.featureData)}</strong> &mdash; ${escapeHTML(ai.featureDataDesc)}</li>
    </ul>
  </section>

  ${faqHtml}

  ${buildSiteFooter({ lang: lang, pathPrefix: '', articleCount: articles.length })}

  <script src="js/index-runtime.js" defer></script>
</body>
</html>`;
}
/**
 * Main execution - generates index files for all languages.
 * English generates index.html (primary homepage), others generate index-{lang}.html.
 */
function main() {
    console.log('📰 Generating news indexes...');
    const articles = getNewsArticles();
    console.log(`📊 Found ${articles.length} articles`);
    const grouped = groupArticlesByLanguage(articles, ALL_LANGUAGES);
    // Build metadata map (real titles + descriptions from each article HTML)
    const metaBuildTimerLabel = `⏱️ Built metadata map for ${articles.length} articles`;
    console.time(metaBuildTimerLabel);
    const metaMap = new Map();
    for (const filename of articles) {
        const filepath = path.join(NEWS_DIR, filename);
        metaMap.set(filename, extractArticleMeta(filepath));
    }
    console.timeEnd(metaBuildTimerLabel);
    // Also update the metadata database, reusing the already-extracted meta to avoid re-reading files
    const dbArticles = articles
        .map((filename) => {
        const parsed = parseArticleFilename(filename);
        if (!parsed)
            return null;
        const meta = metaMap.get(filename) ?? { title: '', description: '' };
        return {
            filename: parsed.filename,
            date: parsed.date,
            slug: parsed.slug,
            lang: parsed.lang,
            title: meta.title || formatSlug(parsed.slug),
            description: meta.description,
        };
    })
        .filter((e) => e !== null);
    dbArticles.sort((a, b) => b.date.localeCompare(a.date));
    writeMetadataDatabase({ lastUpdated: new Date().toISOString(), articles: dbArticles });
    console.log('📝 Updated articles metadata database');
    let generated = 0;
    for (const lang of ALL_LANGUAGES) {
        const langArticles = grouped[lang] ?? [];
        const html = generateIndexHTML(lang, langArticles, metaMap);
        const filename = getIndexFilename(lang);
        const filepath = path.join(PROJECT_ROOT, filename);
        atomicWrite(filepath, html);
        console.log(`  ✅ Generated ${filename} (${langArticles.length} articles)`);
        generated++;
    }
    console.log(`✅ Generated ${generated} index files`);
}
// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    main();
}
//# sourceMappingURL=news-indexes.js.map