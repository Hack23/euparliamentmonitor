// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Templates/ArticleTemplate
 * @description Generates HTML templates for news articles with proper structure and metadata
 */

import type {
  ArticleOptions,
  ArticleSource,
  ArticleCategoryLabels,
  LanguageCode,
  RelatedArticleLink,
  AnalysisFileEntry,
  LanguageMap,
} from '../types/index.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  ARTICLE_TYPE_LABELS,
  READ_TIME_LABELS,
  BACK_TO_NEWS_LABELS,
  ARTICLE_NAV_LABELS,
  RELATED_ARTICLES_NAV_LABELS,
  BREADCRUMB_HOME_LABELS,
  BREADCRUMB_NEWS_LABELS,
  SKIP_LINK_TEXTS,
  SOURCES_HEADING_LABELS,
  HEADER_SUBTITLE_LABELS,
  THEME_TOGGLE_LABELS,
  ANALYSIS_TRANSPARENCY_LABELS,
  ANALYSIS_SUMMARY_LABELS,
  METHODOLOGY_LABELS,
  TRANSPARENCY_DISCLOSURE_LABELS,
  CLASSIFICATION_ANALYSIS_LABELS,
  THREAT_ASSESSMENT_LABELS,
  RISK_SCORING_LABELS,
  DEEP_ANALYSIS_LABELS,
  VIEW_SOURCE_LABELS,
  OPEN_SOURCE_NOTE_LABELS,
  AI_ANALYSIS_GUIDE_LABELS,
  SWOT_FRAMEWORK_LABELS,
  RISK_METHODOLOGY_LABELS,
  THREAT_FRAMEWORK_LABELS,
  CLASSIFICATION_GUIDE_LABELS,
  STYLE_GUIDE_LABELS,
  SIGNIFICANCE_CLASSIFICATION_LABELS,
  ACTOR_MAPPING_LABELS,
  FORCES_ANALYSIS_LABELS,
  IMPACT_MATRIX_LABELS,
  POLITICAL_THREAT_LANDSCAPE_LABELS,
  ACTOR_THREAT_PROFILING_LABELS,
  CONSEQUENCE_TREES_LABELS,
  LEGISLATIVE_DISRUPTION_LABELS,
  RISK_MATRIX_LABELS,
  QUANTITATIVE_SWOT_LABELS,
  POLITICAL_CAPITAL_RISK_LABELS,
  LEGISLATIVE_VELOCITY_RISK_LABELS,
  AGENT_RISK_WORKFLOW_LABELS,
  STAKEHOLDER_IMPACT_LABELS,
  COALITION_DYNAMICS_LABELS,
  VOTING_PATTERNS_LABELS,
  CROSS_SESSION_INTELLIGENCE_LABELS,
  SYNTHESIS_SUMMARY_LABELS,
  DOCUMENT_ANALYSIS_LABELS,
  SIGNIFICANCE_SCORING_LABELS,
  getLocalizedString,
  getTextDirection,
} from '../constants/languages.js';
import { escapeHTML, isSafeURL } from '../utils/file-utils.js';
import { stripHtmlTags } from '../utils/html-sanitize.js';
import { createThemeToggleButton, APP_VERSION } from '../constants/config.js';
import { buildSiteFooter } from './section-builders.js';

/** Pattern for valid article dates (YYYY-MM-DD) */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

/** Pattern for valid article slugs (lowercase letters, digits, hyphens) */
const SLUG_PATTERN = /^[a-z0-9-]+$/u;

/** Pattern for valid SRI integrity hashes (sha256/sha384/sha512 + base64) */
const SRI_HASH_PATTERN = /^sha(?:256|384|512)-[A-Za-z0-9+/]+={0,2}$/u;

/** Words per minute for read-time calculation */
const TEMPLATE_WORDS_PER_MINUTE = 250;

/**
 * Serialize an object to JSON suitable for embedding inside `<script>` tags.
 *
 * `JSON.stringify` alone does not prevent `</script>` or `<!--` sequences that
 * can terminate a script element and enable XSS. This helper replaces `<` with
 * the Unicode escape `\u003c` in the serialized output, rendering such
 * sequences inert while remaining valid JSON.
 *
 * @param value - The value to serialize (typically a structured data object).
 * @returns Pretty-printed JSON string with `<` characters safely escaped.
 */
function safeJsonLdForHtml(value: unknown): string {
  return JSON.stringify(value, null, 4).replace(/</gu, '\\u003c');
}

/**
 * Base URL for the deployed site, constructed via the URL API so that CodeQL
 * recognises it as a validated URL rather than a potential regex pattern.
 */
const SITE_BASE_URL: string = new URL('/euparliamentmonitor', 'https://hack23.github.io').href;

/**
 * BCP47 / Open Graph locale mapping for og:locale meta tag.
 * Maps our 2-letter language codes to proper BCP47 locale strings.
 */
const OG_LOCALE_MAP: Readonly<Record<string, string>> = {
  en: 'en_GB',
  sv: 'sv_SE',
  da: 'da_DK',
  no: 'nb_NO',
  fi: 'fi_FI',
  de: 'de_DE',
  fr: 'fr_FR',
  es: 'es_ES',
  nl: 'nl_NL',
  ar: 'ar_SA',
  he: 'he_IL',
  ja: 'ja_JP',
  ko: 'ko_KR',
  zh: 'zh_CN',
} as const;

/**
 * Build the article language switcher nav HTML.
 * Links to the same article in all available languages using the filename pattern {date}-{slug}-{lang}.html.
 *
 * @param date - Article date (YYYY-MM-DD)
 * @param slug - Article slug
 * @param currentLang - Active language code
 * @param availableLanguages - Languages for which the article exists; defaults to all supported languages
 * @returns HTML string
 */
function buildArticleLangSwitcher(
  date: string,
  slug: string,
  currentLang: LanguageCode,
  availableLanguages?: ReadonlyArray<LanguageCode>
): string {
  if (!DATE_PATTERN.test(date)) {
    throw new Error(`Invalid article date format: "${date}"`);
  }

  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`Invalid article slug format: "${slug}"`);
  }

  const safeDate = escapeHTML(date);
  const safeSlug = escapeHTML(slug);

  const langs = availableLanguages ?? ALL_LANGUAGES;
  return langs
    .map((code) => {
      const flag = getLocalizedString(LANGUAGE_FLAGS, code);
      const name = getLocalizedString(LANGUAGE_NAMES, code);
      const active = code === currentLang ? ' active' : '';
      const href = `${safeDate}-${safeSlug}-${code}.html`;
      const safeTitle = escapeHTML(name);
      return `<a href="${href}" class="lang-link${active}" hreflang="${code}" lang="${code}" title="${safeTitle}">${flag} ${code.toUpperCase()}</a>`;
    })
    .join('\n        ');
}

/**
 * Build the related articles navigation section at the bottom of an article.
 *
 * Renders a `<nav>` element with links to same-day articles of different types.
 * Returns an empty string when the array is empty.
 *
 * @param articles - Related article links to render
 * @param lang - Language code for the localized section heading
 * @returns HTML string for the related articles `<nav>`, or empty string when empty
 */
function buildRelatedArticlesNav(
  articles: ReadonlyArray<RelatedArticleLink>,
  lang: LanguageCode
): string {
  if (articles.length === 0) return '';

  const safeHeading = escapeHTML(getLocalizedString(RELATED_ARTICLES_NAV_LABELS, lang));

  // Filter articles to only those with valid date, slug, and lang to prevent XSS via URL schemes
  const validArticles = articles.filter(
    (a) => DATE_PATTERN.test(a.date) && SLUG_PATTERN.test(a.slug) && ALL_LANGUAGES.includes(a.lang)
  );

  if (validArticles.length === 0) return '';

  // Localized category labels for display (fall back to raw key)
  const categoryLabels = getLocalizedString(ARTICLE_TYPE_LABELS, lang) as ArticleCategoryLabels;

  const items = validArticles
    .map((a) => {
      const safeTitle = escapeHTML(a.title);
      const safeCategory = escapeHTML(categoryLabels[a.category] ?? a.category);
      // Safe: date/slug/lang are validated above, so href is always a relative filename
      // escapeHTML applied for defense-in-depth within HTML attribute context
      const href = escapeHTML(`./${a.date}-${a.slug}-${a.lang}.html`);
      return (
        `<li class="related-article-item">` +
        `<span class="related-article-type">${safeCategory}</span> ` +
        `<a href="${href}" hreflang="${escapeHTML(a.lang)}">${safeTitle}</a>` +
        `</li>`
      );
    })
    .join('\n        ');

  return `
    <nav class="related-articles-nav" aria-label="${safeHeading}">
      <h2>${safeHeading}</h2>
      <ul class="related-articles-list">
        ${items}
      </ul>
    </nav>`;
}

/**
 * Generate complete HTML for a news article
 *
 * @param options - Article generation options
 * @returns Complete HTML document string
 */
export function generateArticleHTML(options: ArticleOptions): string {
  const {
    slug,
    title,
    subtitle,
    date,
    category,
    readTime,
    lang,
    content,
    keywords = [],
    sources = [],
    stylesHash,
    availableLanguages,
    analysisDir,
    relatedArticles = [],
    analysisFiles,
  } = options;

  const dir = getTextDirection(lang);

  // Format date for display
  const displayDate = new Date(date).toLocaleDateString(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const languageName = getLocalizedString(LANGUAGE_NAMES, lang);
  const categoryLabels = getLocalizedString(ARTICLE_TYPE_LABELS, lang) as ArticleCategoryLabels;
  const categoryLabel = categoryLabels[category] ?? category;
  const readTimeFormatter = getLocalizedString(READ_TIME_LABELS, lang);

  // Auto-compute read-time from content word count if not explicitly set
  const contentWordCount = stripHtmlTags(content).replace(/\s+/gu, ' ').trim().split(' ').length;
  const computedReadTime = Math.max(1, Math.ceil(contentWordCount / TEMPLATE_WORDS_PER_MINUTE));
  const effectiveReadTime = readTime > 0 ? readTime : computedReadTime;
  const readTimeLabel = readTimeFormatter(effectiveReadTime);
  const backLabel = getLocalizedString(BACK_TO_NEWS_LABELS, lang);
  const articleNavLabel = getLocalizedString(ARTICLE_NAV_LABELS, lang);
  const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, lang);
  const headerSubtitle = escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, lang));
  const indexHref = lang === 'en' ? '../index.html' : `../index-${lang}.html`;

  // Escape values for safe HTML embedding
  const safeTitle = escapeHTML(title);
  const safeSubtitle = escapeHTML(subtitle);
  const safeKeywords = keywords.map((k) => escapeHTML(k)).join(', ');
  const safeCategoryLabel = escapeHTML(categoryLabel);

  // Build JSON-LD as object for safe serialization
  const jsonLd = safeJsonLdForHtml({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: subtitle,
    datePublished: date,
    dateModified: date,
    inLanguage: lang,
    articleSection: categoryLabel,
    timeRequired: `PT${effectiveReadTime}M`,
    author: {
      '@type': 'Organization',
      name: 'EU Parliament Monitor',
    },
    publisher: {
      '@type': 'Organization',
      name: 'EU Parliament Monitor',
      url: SITE_BASE_URL,
    },
    keywords: keywords.join(', '),
    about: {
      '@type': 'GovernmentOrganization',
      name: 'European Parliament',
      url: 'https://www.europarl.europa.eu',
    },
    hasPart: [
      ...(content.includes('deep-analysis')
        ? [
            {
              '@type': 'WebPageElement',
              cssSelector: '.deep-analysis',
              name: 'Deep Political Analysis',
            },
          ]
        : []),
      ...(sources.length > 0
        ? [
            {
              '@type': 'WebPageElement',
              cssSelector: '.article-sources',
              name: 'Sources',
            },
          ]
        : []),
    ],
    isBasedOn:
      sources.length > 0
        ? sources
            .filter((s) => typeof s.url === 'string' && /^https?:\/\//i.test(s.url))
            .slice(0, 5)
            .map((s) => ({
              '@type': 'Dataset',
              name: s.title,
              url: s.url,
            }))
        : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_BASE_URL}/news/${date}-${slug}-${lang}.html`,
    },
  });

  // BreadcrumbList structured data for SEO (localized names)
  const breadcrumbHome = getLocalizedString(BREADCRUMB_HOME_LABELS, lang);
  const breadcrumbNews = getLocalizedString(BREADCRUMB_NEWS_LABELS, lang);
  const breadcrumbLd = safeJsonLdForHtml({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: breadcrumbHome,
        item: `${SITE_BASE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: breadcrumbNews,
        item: `${SITE_BASE_URL}/news/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${SITE_BASE_URL}/news/${date}-${slug}-${lang}.html`,
      },
    ],
  });

  // Validate and escape stylesHash — only allow valid SRI hash format
  const safeSriAttrs =
    stylesHash && SRI_HASH_PATTERN.test(stylesHash)
      ? ` integrity="${escapeHTML(stylesHash)}" crossorigin="anonymous"`
      : '';

  // Compute SHA-256 hashes were previously required for inline <script>
  // blocks (JSON-LD, reading progress, theme toggle). All executable inline
  // scripts have been externalised to `js/article-runtime.js`, so the CSP
  // reduces to `script-src 'self'`. JSON-LD blocks use
  // `type="application/ld+json"` which is non-executable and not governed
  // by `script-src`.

  // Localized theme toggle button
  const themeToggleLabel = escapeHTML(getLocalizedString(THEME_TOGGLE_LABELS, lang));

  // Related articles navigation HTML (optional)
  const relatedArticlesHtml = buildRelatedArticlesNav(relatedArticles, lang);

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self'; frame-src 'none'; base-uri 'self'; form-action 'none'">
  <title>${safeTitle} | EU Parliament Monitor</title>
  <meta name="description" content="${safeSubtitle}">
  <meta name="keywords" content="${safeKeywords}">
  <meta name="author" content="EU Parliament Monitor">
  <meta name="generator" content="EU Parliament Monitor v${escapeHTML(APP_VERSION)}">
  <meta name="date" content="${date}">
  <meta property="article:published_time" content="${date}">
  <meta property="article:modified_time" content="${date}">
  <meta property="article:author" content="EU Parliament Monitor">
  <meta property="article:section" content="${safeCategoryLabel}">
  <meta name="article-type" content="${escapeHTML(category)}">
  ${keywords
    .slice(0, 10)
    .map((k) => `<meta property="article:tag" content="${escapeHTML(k)}">`)
    .join('\n  ')}
  
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="../favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png">
  <link rel="manifest" href="../site.webmanifest">
  <meta name="theme-color" content="#003399">
  <link rel="alternate" type="application/rss+xml" title="EU Parliament Monitor RSS" href="../rss.xml">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeSubtitle}">
  <meta property="og:url" content="${SITE_BASE_URL}/news/${date}-${slug}-${lang}.html">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${OG_LOCALE_MAP[lang] ?? lang}">
  <meta property="og:image" content="${SITE_BASE_URL}/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="EU Parliament Monitor — AI-Disrupted Parliamentary Intelligence">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeSubtitle}">
  <meta name="twitter:image" content="${SITE_BASE_URL}/images/og-image.jpg">
  <meta name="twitter:image:alt" content="EU Parliament Monitor — AI-Disrupted Parliamentary Intelligence">
  
  <!-- Hreflang alternates for SEO multi-language support -->
  ${(availableLanguages ?? ALL_LANGUAGES)
    .map((code) => `<link rel="alternate" hreflang="${code}" href="${escapeHTML(`${date}-${slug}-${code}.html`)}">`)
    .join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${escapeHTML(`${date}-${slug}-en.html`)}">
  <link rel="canonical" href="${SITE_BASE_URL}/news/${date}-${slug}-${lang}.html">
  <link rel="stylesheet" href="../styles.css"${safeSriAttrs}>
  
  <!-- Schema.org structured data -->
  <script type="application/ld+json">
  ${jsonLd}
  </script>
  <!-- BreadcrumbList structured data -->
  <script type="application/ld+json">
  ${breadcrumbLd}
  </script>
</head>
<body>
  <div class="reading-progress" aria-hidden="true"></div>
  <a href="#main" class="skip-link">${skipLinkText}</a>

  <header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="${indexHref}" class="site-header__brand" aria-label="EU Parliament Monitor">
        <picture class="site-header__logo-picture">
          <source srcset="../images/header-logo.webp" type="image/webp">
          <img class="site-header__logo site-header__logo--header" src="../images/header-logo.png" alt="" width="72" height="48" aria-hidden="true">
        </picture>
        <span>
          <span class="site-header__title">EU Parliament Monitor</span>
          <span class="site-header__subtitle">${headerSubtitle}</span>
        </span>
      </a>
      ${createThemeToggleButton(themeToggleLabel)}
      <nav class="site-header__langs" role="navigation" aria-label="Language selection">
        ${buildArticleLangSwitcher(date, slug, lang, availableLanguages)}
      </nav>
    </div>
  </header>

  <nav class="article-top-nav" aria-label="${escapeHTML(articleNavLabel)}">
    <a href="${indexHref}" class="back-to-news">${backLabel}</a>
  </nav>

  <main id="main" class="site-main">
  <article class="news-article" lang="${lang}">
    <header class="article-header">
      <div class="article-meta">
        <span class="article-type">${safeCategoryLabel}</span>
        <span class="article-date">${displayDate}</span>
        <span class="article-read-time">${readTimeLabel}</span>
        <span class="article-lang">${languageName}</span>
      </div>
      <h1>${safeTitle}</h1>
      <p class="article-subtitle">${safeSubtitle}</p>
    </header>
    
    ${content}
    
    ${renderSourcesSection(sources, lang)}
    
    ${renderAnalysisTransparencySection(date, slug, lang, analysisDir, analysisFiles)}
    
    ${relatedArticlesHtml}
    
    <nav class="article-nav" aria-label="${escapeHTML(articleNavLabel)}">
      <a href="${indexHref}" class="back-to-news">${backLabel}</a>
    </nav>
  </article>
  </main>

  ${buildSiteFooter({ lang, pathPrefix: '../' })}

  <script src="../js/article-runtime.js" defer></script>${
    content.includes('data-chart-config')
      ? `
  <script src="../js/vendor/chart.umd.min.js" defer></script>
  <script src="../js/vendor/chartjs-plugin-annotation.min.js" defer></script>
  <script src="../js/chart-init.js" defer></script>`
      : ''
  }${
    content.includes('mindmap-container') || content.includes('swot-matrix')
      ? `
  <script src="../js/vendor/d3.min.js" defer></script>
  <script src="../js/d3-init.js" defer></script>`
      : ''
  }
</body>
</html>`;
}

/**
 * Render the sources section if sources are provided
 *
 * @param sources - Article source references
 * @param lang - Language code for localized heading
 * @returns HTML string for sources section or empty string
 */
function renderSourcesSection(sources: ArticleSource[], lang: LanguageCode): string {
  if (sources.length === 0) {
    return '';
  }

  const sourcesHeading = escapeHTML(getLocalizedString(SOURCES_HEADING_LABELS, lang));
  return `
    <section class="article-sources">
      <h2>${sourcesHeading}</h2>
      <ul>
        ${sources
          .map((source) => {
            const safeSourceTitle = escapeHTML(source.title);
            const href = isSafeURL(source.url) ? escapeHTML(source.url) : '#';
            return `<li><a href="${href}" target="_blank" rel="noopener noreferrer">${safeSourceTitle}</a></li>`;
          })
          .join('\n          ')}
      </ul>
    </section>
    `;
}

/**
 * Map of analysis method names to their localized label constants.
 * Used by renderAnalysisTransparencySection to resolve display names.
 */
const METHOD_LABEL_MAP: Readonly<Record<string, LanguageMap>> = {
  'significance-classification': SIGNIFICANCE_CLASSIFICATION_LABELS,
  'significance-scoring': SIGNIFICANCE_SCORING_LABELS,
  'actor-mapping': ACTOR_MAPPING_LABELS,
  'forces-analysis': FORCES_ANALYSIS_LABELS,
  'impact-matrix': IMPACT_MATRIX_LABELS,
  'political-threat-landscape': POLITICAL_THREAT_LANDSCAPE_LABELS,
  'actor-threat-profiling': ACTOR_THREAT_PROFILING_LABELS,
  'consequence-trees': CONSEQUENCE_TREES_LABELS,
  'legislative-disruption': LEGISLATIVE_DISRUPTION_LABELS,
  'risk-matrix': RISK_MATRIX_LABELS,
  'quantitative-swot': QUANTITATIVE_SWOT_LABELS,
  'political-capital-risk': POLITICAL_CAPITAL_RISK_LABELS,
  'legislative-velocity-risk': LEGISLATIVE_VELOCITY_RISK_LABELS,
  'agent-risk-workflow': AGENT_RISK_WORKFLOW_LABELS,
  'deep-analysis': DEEP_ANALYSIS_LABELS,
  'stakeholder-analysis': STAKEHOLDER_IMPACT_LABELS,
  'coalition-analysis': COALITION_DYNAMICS_LABELS,
  'voting-patterns': VOTING_PATTERNS_LABELS,
  'cross-session-intelligence': CROSS_SESSION_INTELLIGENCE_LABELS,
  'synthesis-summary': SYNTHESIS_SUMMARY_LABELS,
  'document-analysis': DOCUMENT_ANALYSIS_LABELS,
};

/**
 * Map of analysis subdirectory names to their section heading label constants
 * and display emoji.
 */
const SUBDIR_SECTION_MAP: Readonly<Record<string, { labels: LanguageMap; emoji: string }>> = {
  classification: { labels: CLASSIFICATION_ANALYSIS_LABELS, emoji: '🏷️' },
  'threat-assessment': { labels: THREAT_ASSESSMENT_LABELS, emoji: '🛡️' },
  'risk-scoring': { labels: RISK_SCORING_LABELS, emoji: '⚖️' },
  existing: { labels: DEEP_ANALYSIS_LABELS, emoji: '🔍' },
  documents: { labels: DOCUMENT_ANALYSIS_LABELS, emoji: '📄' },
};

/**
 * Resolve the localized display label for an analysis method.
 *
 * @param method - Canonical method name
 * @param lang - Language code
 * @returns Localized and HTML-escaped label, or titleized method name as fallback
 */
function getMethodLabel(method: string, lang: LanguageCode): string {
  const labelMap = METHOD_LABEL_MAP[method];
  if (labelMap) {
    return escapeHTML(getLocalizedString(labelMap, lang));
  }
  // Fallback: titleize the method name (e.g. 'political-stride' → 'Political Stride')
  return escapeHTML(method.replace(/-/gu, ' ').replace(/\b\w/gu, (c) => c.toUpperCase()));
}

/**
 * Render the analysis transparency section with links to analysis artifacts and methodology.
 *
 * When `analysisFiles` is provided (from manifest.json), links are generated dynamically
 * for ALL analysis files produced during the run — including document-analysis per-document
 * files, synthesis summaries, and any additional methods. This ensures every article links
 * to the exact analysis that produced it.
 *
 * When `analysisFiles` is not available (legacy/fallback), a hardcoded set of standard
 * analysis file links is rendered.
 *
 * @param date - Article date (YYYY-MM-DD)
 * @param slug - Article type slug (e.g., 'committee-reports', 'breaking')
 * @param lang - Language code
 * @param analysisDir - Optional override for analysis directory name (e.g. 'breaking-2' after deduplication)
 * @param analysisFiles - Optional manifest-derived file entries for dynamic link generation
 * @returns HTML string for analysis transparency section
 */
export function renderAnalysisTransparencySection(
  date: string,
  slug: string,
  lang: LanguageCode,
  analysisDir?: string | undefined,
  analysisFiles?: ReadonlyArray<AnalysisFileEntry> | undefined
): string {
  const safeDate = escapeHTML(date);
  const safeAnalysisDirName = escapeHTML(analysisDir ?? slug);
  const heading = escapeHTML(getLocalizedString(ANALYSIS_TRANSPARENCY_LABELS, lang));
  const analysisSummaryLabel = escapeHTML(getLocalizedString(ANALYSIS_SUMMARY_LABELS, lang));
  const methodologyLabel = escapeHTML(getLocalizedString(METHODOLOGY_LABELS, lang));
  const disclosure = escapeHTML(getLocalizedString(TRANSPARENCY_DISCLOSURE_LABELS, lang));
  const viewSourceLabel = escapeHTML(getLocalizedString(VIEW_SOURCE_LABELS, lang));
  const openSourceNote = escapeHTML(getLocalizedString(OPEN_SOURCE_NOTE_LABELS, lang));
  const aiGuideLabel = escapeHTML(getLocalizedString(AI_ANALYSIS_GUIDE_LABELS, lang));
  const swotLabel = escapeHTML(getLocalizedString(SWOT_FRAMEWORK_LABELS, lang));
  const riskMethodLabel = escapeHTML(getLocalizedString(RISK_METHODOLOGY_LABELS, lang));
  const threatFrameworkLabel = escapeHTML(getLocalizedString(THREAT_FRAMEWORK_LABELS, lang));
  const classGuideLabel = escapeHTML(getLocalizedString(CLASSIFICATION_GUIDE_LABELS, lang));
  const styleGuideLabel = escapeHTML(getLocalizedString(STYLE_GUIDE_LABELS, lang));

  const repoBase = 'https://github.com/Hack23/euparliamentmonitor/blob/main';
  const treeDirBase = 'https://github.com/Hack23/euparliamentmonitor/tree/main';
  const analysisDirUrl = `${treeDirBase}/analysis/daily/${safeDate}/${safeAnalysisDirName}`;
  const analysisFileBase = `${repoBase}/analysis/daily/${safeDate}/${safeAnalysisDirName}`;
  const methodologyDir = `${repoBase}/analysis/methodologies`;

  // Build the analysis links section — dynamic from manifest or hardcoded fallback
  const analysisLinksHtml =
    analysisFiles && analysisFiles.length > 0
      ? renderDynamicAnalysisLinks(analysisFiles, analysisFileBase, lang)
      : renderFallbackAnalysisLinks(analysisFileBase, lang);

  return `
    <section class="analysis-transparency" aria-label="${heading}">
      <h2 id="analysis-transparency-heading">${heading}</h2>
      <p>${disclosure}</p>
      <nav class="analysis-links" aria-labelledby="analysis-transparency-heading">
        <h3><span aria-hidden="true">📊</span> ${analysisSummaryLabel}</h3>
        <ul>
          <li><a href="${analysisDirUrl}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">📁</span> ${analysisSummaryLabel}</a></li>
          <li><a href="${analysisFileBase}/manifest.json" target="_blank" rel="noopener noreferrer">manifest.json</a></li>
        </ul>
${analysisLinksHtml}
      </nav>
      <nav class="methodology-links" aria-label="${methodologyLabel}">
        <h3>${methodologyLabel}</h3>
        <ul>
          <li><a href="${methodologyDir}/ai-driven-analysis-guide.md" target="_blank" rel="noopener noreferrer">${aiGuideLabel}</a></li>
          <li><a href="${methodologyDir}/political-swot-framework.md" target="_blank" rel="noopener noreferrer">${swotLabel}</a></li>
          <li><a href="${methodologyDir}/political-risk-methodology.md" target="_blank" rel="noopener noreferrer">${riskMethodLabel}</a></li>
          <li><a href="${methodologyDir}/political-threat-framework.md" target="_blank" rel="noopener noreferrer">${threatFrameworkLabel}</a></li>
          <li><a href="${methodologyDir}/political-classification-guide.md" target="_blank" rel="noopener noreferrer">${classGuideLabel}</a></li>
          <li><a href="${methodologyDir}/political-style-guide.md" target="_blank" rel="noopener noreferrer">${styleGuideLabel}</a></li>
        </ul>
      </nav>
      <p class="transparency-note"><a href="https://github.com/Hack23/euparliamentmonitor" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🔓</span> ${viewSourceLabel}</a> — ${openSourceNote}</p>
    </section>
    `;
}

/**
 * Validate that an analysis output file path is safe for use in URLs.
 *
 * Rejects absolute paths, path traversal (`..`), backslashes, and any
 * characters outside the expected alphanumeric + hyphen + slash + dot + underscore set.
 *
 * @param outputFile - Relative path from manifest (e.g. 'classification/significance-classification.md')
 * @returns true if the path is safe to interpolate into a URL
 */
function isSafeAnalysisPath(outputFile: string): boolean {
  if (!outputFile || outputFile.length === 0 || outputFile.length > 256) return false;
  // Reject path traversal, absolute paths, backslashes, and consecutive slashes
  if (/\.\.|[\\]|^[/]|\/\//u.test(outputFile)) return false;
  // Only allow safe characters: alphanumeric, hyphens, underscores, dots, forward slashes
  return /^[\da-zA-Z][\da-zA-Z._/-]*$/u.test(outputFile);
}

/**
 * Render dynamic analysis links from manifest entries, grouped by subdirectory.
 *
 * @param files - Analysis file entries from the manifest
 * @param analysisFileBase - Base URL for analysis file links
 * @param lang - Language code for localized labels
 * @returns HTML string for the grouped analysis links
 */
function renderDynamicAnalysisLinks(
  files: ReadonlyArray<AnalysisFileEntry>,
  analysisFileBase: string,
  lang: LanguageCode
): string {
  // Filter out entries with unsafe paths (path traversal, absolute, backslashes)
  const safeFiles = files.filter((f) => isSafeAnalysisPath(f.outputFile));

  // Group files by their subdirectory (first path segment)
  const groups = new Map<string, AnalysisFileEntry[]>();
  for (const file of safeFiles) {
    const slashIdx = file.outputFile.indexOf('/');
    const subdir = slashIdx > 0 ? file.outputFile.slice(0, slashIdx) : '';
    const key = subdir || '_root';
    const group = groups.get(key);
    if (group) {
      group.push(file);
    } else {
      groups.set(key, [file]);
    }
  }

  // Known ordering for subdirectories
  const orderedSubdirs = [
    'classification',
    'threat-assessment',
    'risk-scoring',
    'existing',
    'documents',
  ];
  const sortedKeys = [
    ...orderedSubdirs.filter((k) => groups.has(k)),
    ...[...groups.keys()].filter((k) => k !== '_root' && !orderedSubdirs.includes(k)),
    ...(groups.has('_root') ? ['_root'] : []),
  ];

  const sections: string[] = [];

  for (const key of sortedKeys) {
    const groupFiles = groups.get(key);
    if (!groupFiles || groupFiles.length === 0) continue;

    const sectionInfo = SUBDIR_SECTION_MAP[key];
    const sectionHeading = sectionInfo
      ? escapeHTML(getLocalizedString(sectionInfo.labels, lang))
      : escapeHTML(key.replace(/-/gu, ' ').replace(/\b\w/gu, (c) => c.toUpperCase()));
    const emoji = sectionInfo?.emoji ?? '📋';

    const items = groupFiles.map((f) => {
      const label = getMethodLabel(f.method, lang);
      // URL-encode each path segment to prevent URL injection
      const encodedFile = f.outputFile
        .split('/')
        .map((seg) => encodeURIComponent(seg))
        .join('/');
      return `          <li><a href="${analysisFileBase}/${encodedFile}" target="_blank" rel="noopener noreferrer">${label}</a></li>`;
    });

    sections.push(`        <h3><span aria-hidden="true">${emoji}</span> ${sectionHeading}</h3>
        <ul>
${items.join('\n')}
        </ul>`);
  }

  return sections.join('\n');
}

/**
 * Render the legacy hardcoded analysis links for when no manifest data is available.
 *
 * @param analysisFileBase - Base URL for analysis file links
 * @param lang - Language code for localized labels
 * @returns HTML string for the hardcoded analysis links
 */
function renderFallbackAnalysisLinks(analysisFileBase: string, lang: LanguageCode): string {
  const classificationLabel = escapeHTML(getLocalizedString(CLASSIFICATION_ANALYSIS_LABELS, lang));
  const threatLabel = escapeHTML(getLocalizedString(THREAT_ASSESSMENT_LABELS, lang));
  const riskLabel = escapeHTML(getLocalizedString(RISK_SCORING_LABELS, lang));
  const deepLabel = escapeHTML(getLocalizedString(DEEP_ANALYSIS_LABELS, lang));
  const documentLabel = escapeHTML(getLocalizedString(DOCUMENT_ANALYSIS_LABELS, lang));

  const significanceLabel = escapeHTML(
    getLocalizedString(SIGNIFICANCE_CLASSIFICATION_LABELS, lang)
  );
  const significanceScoringLabel = escapeHTML(
    getLocalizedString(SIGNIFICANCE_SCORING_LABELS, lang)
  );
  const actorMappingLabel = escapeHTML(getLocalizedString(ACTOR_MAPPING_LABELS, lang));
  const forcesLabel = escapeHTML(getLocalizedString(FORCES_ANALYSIS_LABELS, lang));
  const impactMatrixLabel = escapeHTML(getLocalizedString(IMPACT_MATRIX_LABELS, lang));
  const threatLandscapeLabel = escapeHTML(
    getLocalizedString(POLITICAL_THREAT_LANDSCAPE_LABELS, lang)
  );
  const actorThreatProfilingLabel = escapeHTML(
    getLocalizedString(ACTOR_THREAT_PROFILING_LABELS, lang)
  );
  const consequenceLabel = escapeHTML(getLocalizedString(CONSEQUENCE_TREES_LABELS, lang));
  const disruptionLabel = escapeHTML(getLocalizedString(LEGISLATIVE_DISRUPTION_LABELS, lang));
  const riskMatrixLabel = escapeHTML(getLocalizedString(RISK_MATRIX_LABELS, lang));
  const quantSwotLabel = escapeHTML(getLocalizedString(QUANTITATIVE_SWOT_LABELS, lang));
  const politicalCapitalLabel = escapeHTML(getLocalizedString(POLITICAL_CAPITAL_RISK_LABELS, lang));
  const legVelocityLabel = escapeHTML(getLocalizedString(LEGISLATIVE_VELOCITY_RISK_LABELS, lang));
  const agentRiskLabel = escapeHTML(getLocalizedString(AGENT_RISK_WORKFLOW_LABELS, lang));
  const deepAnalysisFileLabel = escapeHTML(getLocalizedString(DEEP_ANALYSIS_LABELS, lang));
  const stakeholderLabel = escapeHTML(getLocalizedString(STAKEHOLDER_IMPACT_LABELS, lang));
  const coalitionLabel = escapeHTML(getLocalizedString(COALITION_DYNAMICS_LABELS, lang));
  const votingPatternsLabel = escapeHTML(getLocalizedString(VOTING_PATTERNS_LABELS, lang));
  const crossSessionLabel = escapeHTML(getLocalizedString(CROSS_SESSION_INTELLIGENCE_LABELS, lang));
  const synthesisSummaryLabel = escapeHTML(getLocalizedString(SYNTHESIS_SUMMARY_LABELS, lang));

  return `        <h3><span aria-hidden="true">🏷️</span> ${classificationLabel}</h3>
        <ul>
          <li><a href="${analysisFileBase}/classification/significance-classification.md" target="_blank" rel="noopener noreferrer">${significanceLabel}</a></li>
          <li><a href="${analysisFileBase}/classification/significance-scoring.md" target="_blank" rel="noopener noreferrer">${significanceScoringLabel}</a></li>
          <li><a href="${analysisFileBase}/classification/actor-mapping.md" target="_blank" rel="noopener noreferrer">${actorMappingLabel}</a></li>
          <li><a href="${analysisFileBase}/classification/forces-analysis.md" target="_blank" rel="noopener noreferrer">${forcesLabel}</a></li>
          <li><a href="${analysisFileBase}/classification/impact-matrix.md" target="_blank" rel="noopener noreferrer">${impactMatrixLabel}</a></li>
        </ul>
        <h3><span aria-hidden="true">🛡️</span> ${threatLabel}</h3>
        <ul>
          <li><a href="${analysisFileBase}/threat-assessment/political-threat-landscape.md" target="_blank" rel="noopener noreferrer">${threatLandscapeLabel}</a></li>
          <li><a href="${analysisFileBase}/threat-assessment/actor-threat-profiling.md" target="_blank" rel="noopener noreferrer">${actorThreatProfilingLabel}</a></li>
          <li><a href="${analysisFileBase}/threat-assessment/consequence-trees.md" target="_blank" rel="noopener noreferrer">${consequenceLabel}</a></li>
          <li><a href="${analysisFileBase}/threat-assessment/legislative-disruption.md" target="_blank" rel="noopener noreferrer">${disruptionLabel}</a></li>
        </ul>
        <h3><span aria-hidden="true">⚖️</span> ${riskLabel}</h3>
        <ul>
          <li><a href="${analysisFileBase}/risk-scoring/risk-matrix.md" target="_blank" rel="noopener noreferrer">${riskMatrixLabel}</a></li>
          <li><a href="${analysisFileBase}/risk-scoring/quantitative-swot.md" target="_blank" rel="noopener noreferrer">${quantSwotLabel}</a></li>
          <li><a href="${analysisFileBase}/risk-scoring/political-capital-risk.md" target="_blank" rel="noopener noreferrer">${politicalCapitalLabel}</a></li>
          <li><a href="${analysisFileBase}/risk-scoring/legislative-velocity-risk.md" target="_blank" rel="noopener noreferrer">${legVelocityLabel}</a></li>
          <li><a href="${analysisFileBase}/risk-scoring/agent-risk-workflow.md" target="_blank" rel="noopener noreferrer">${agentRiskLabel}</a></li>
        </ul>
        <h3><span aria-hidden="true">🔍</span> ${deepLabel}</h3>
        <ul>
          <li><a href="${analysisFileBase}/existing/deep-analysis.md" target="_blank" rel="noopener noreferrer">${deepAnalysisFileLabel}</a></li>
          <li><a href="${analysisFileBase}/existing/stakeholder-impact.md" target="_blank" rel="noopener noreferrer">${stakeholderLabel}</a></li>
          <li><a href="${analysisFileBase}/existing/coalition-dynamics.md" target="_blank" rel="noopener noreferrer">${coalitionLabel}</a></li>
          <li><a href="${analysisFileBase}/existing/voting-patterns.md" target="_blank" rel="noopener noreferrer">${votingPatternsLabel}</a></li>
          <li><a href="${analysisFileBase}/existing/cross-session-intelligence.md" target="_blank" rel="noopener noreferrer">${crossSessionLabel}</a></li>
          <li><a href="${analysisFileBase}/synthesis-summary.md" target="_blank" rel="noopener noreferrer">${synthesisSummaryLabel}</a></li>
        </ul>
        <h3><span aria-hidden="true">📄</span> ${documentLabel}</h3>
        <ul>
          <li><a href="${analysisFileBase}/documents/document-analysis-index.md" target="_blank" rel="noopener noreferrer">${documentLabel}</a></li>
        </ul>`;
}
