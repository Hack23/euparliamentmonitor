// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Html/Shell
 * @description Render the full article HTML document with the shared
 * site chrome — site header, language switcher, skip link, theme toggle,
 * breadcrumb, JSON-LD `NewsArticle` + `BreadcrumbList`, and footer. The
 * shell pulls localized labels from `constants/languages.js` and
 * composes the chrome from `templates/section-builders.ts`, so
 * localisation, a11y, and CSP stay consistent with the rest of the
 * site.
 */

import { BASE_URL, BUILD_SHORT, MERMAID_VERSION } from '../../constants/config.js';
import { buildHeadFreshnessTags } from '../../constants/build-info-meta.js';
import {
  ALL_LANGUAGES,
  PAGE_TITLES,
  SKIP_LINK_TEXTS,
  ARTICLE_NAV_LABELS,
  BACK_TO_NEWS_LABELS,
  VIEW_SOURCE_MARKDOWN_LABELS,
  FOOTER_SITEMAP_LABELS,
  FOOTER_POLITICAL_INTELLIGENCE_LABELS,
  getLocalizedString,
  getTextDirection,
} from '../../constants/languages.js';
import { buildOgLocaleTags } from '../../constants/og-locales.js';
import { ORG_SAME_AS, buildTwitterAttributionTags } from '../../constants/social-handles.js';
import type { LanguageCode } from '../../types/index.js';
import { escapeHTML } from '../../utils/file-utils.js';
import { stripHtmlTags } from '../../utils/html-sanitize.js';
import {
  buildResponsiveIconLinks,
  buildResponsiveSocialImageMeta,
  buildSiteFooter,
  buildSiteHeader,
  buildPageBanner,
} from '../../templates/section-builders.js';
import { getPoliticalIntelligenceFilename } from '../../generators/political-intelligence.js';
import { getSitemapFilename } from '../../generators/sitemap/index.js';
import {
  truncateHeadline,
  getTitleSeparator,
  buildPageTitle,
  getLocalizedArticleType,
  getLocalizedArticleTypePlain,
} from './headline.js';
import { clampForBudget } from '../metadata/seo-budgets.js';
import {
  getArticleFilename,
  buildArticleHreflangLinks,
  buildLanguageSwitcher,
} from './hreflang.js';
import { buildArticleToc, type ArticleTocEntry } from './toc.js';
import { blobUrl } from '../infra/github-urls.js';

export type { ArticleTocEntry } from './toc.js';

/** Publisher organization name used in JSON-LD, meta tags. */
export const PUBLISHER_NAME = 'Hack23 AB';

/** Site name used across meta tags and structured data. */
export const SITE_NAME = 'EU Parliament Monitor';

/** Inputs for {@link wrapArticleHtml}. */
export interface WrapArticleOptions {
  /** Target language (used for `<html lang>`, meta, nav labels). */
  readonly lang: LanguageCode;
  /**
   * Logical article slug (no lang suffix, no extension). Example:
   * `2026-01-15-breaking`. Used to build the `<link rel="alternate">` set.
   */
  readonly articleSlug: string;
  /** Pre-rendered HTML body fragment (from `renderMarkdown`). */
  readonly body: string;
  /** Article title — shown in `<title>`, breadcrumb, OG/Twitter meta. */
  readonly title: string;
  /** Article description — shown in `<meta name="description">` and OG. */
  readonly description: string;
  /**
   * Optional: longer (up to ~300 chars) editorial summary lifted from
   * the language-specific executive brief BLUF. When provided, used
   * for `og:description` and `twitter:description`; falls back to
   * `description` when absent. Lets social-card previews show the
   * full BLUF paragraph while the short `<meta description>` stays
   * within Google's ~160-char snippet budget.
   */
  readonly extendedDescription?: string;
  /** SEO keywords — shown in `<meta name="keywords">`. */
  readonly keywords?: readonly string[];
  /** Canonical ISO date of the run (YYYY-MM-DD). */
  readonly date: string;
  /** Article type slug (e.g. `breaking`, `motions`). */
  readonly articleType: string;
  /**
   * Optional: repo-relative path to the aggregated source Markdown file so
   * readers can open the exact input the HTML was rendered from. Rendered
   * as a sidebar link and in the `<link rel="alternate">` set.
   */
  readonly sourceMarkdownRelPath?: string;
  /**
   * Optional: ordered list of top-level H2 sections emitted into the
   * article body. Used to render the article-level table-of-contents
   * sidebar. When omitted (or empty) the sidebar is not rendered.
   */
  readonly toc?: readonly ArticleTocEntry[];
  /**
   * Optional: total number of articles available site-wide. When provided
   * the shared site footer surfaces a `<p class="footer-stats">{n} articles
   * available</p>` line that matches the `index.html` chrome; otherwise
   * the line is omitted.
   */
  readonly articleCount?: number;
  /**
   * Optional: URLs of source artifacts included in the aggregated article.
   * Emitted as `isBasedOn` in the JSON-LD `NewsArticle` schema for provenance.
   */
  readonly isBasedOn?: readonly string[];
  /**
   * Optional: real-world organizations (political groups, media outlets,
   * institutions) named in the article's intelligence and media-framing
   * artifacts. Emitted as JSON-LD `mentions` Organization entries to give
   * search engines and AI overviews high-precision entity grounding.
   * Currently only extractable from the English intelligence corpus; the
   * same list is reused across every language variant because the entities
   * are language-independent proper nouns.
   */
  readonly mentions?: readonly string[];
}

/**
 * Per-surface SEO clamps for one article render. Each field is the
 * exact string emitted into the corresponding HTML/JSON-LD surface,
 * pre-clamped to the budget in
 * `src/aggregator/metadata/seo-budgets.ts`.
 *
 * Extracted from {@link wrapArticleHtml} to keep that function's
 * cognitive complexity within limits while still funnelling every
 * SEO surface through a single source of truth.
 */
interface SeoClampedSurfaces {
  readonly pageTitle: string;
  readonly ogTitleClamped: string;
  readonly twitterTitleClamped: string;
  readonly metaDescriptionClamped: string;
  readonly ogDescriptionClamped: string;
  readonly twitterDescriptionClamped: string;
  readonly imageAltClamped: string;
  readonly jsonLdHeadline: string;
  readonly alternativeHeadline?: string;
}

/**
 * Compute the per-surface SEO-budget-clamped variants of the article
 * title and description for a single render. See
 * `analysis/methodologies/seo-headers-policy.md` § 1.1 for the
 * documented sources of every cap.
 *
 * @param options - The {@link WrapArticleOptions} carrying title /
 *                  description / extendedDescription
 * @param lang - Validated publishing locale (already coerced to a
 *               supported `LanguageCode`)
 * @param siteTitle - Resolved localized site title used as the brand
 *                    suffix
 * @returns One {@link SeoClampedSurfaces} record per article render
 */
function computeSeoClamps(
  options: WrapArticleOptions,
  lang: LanguageCode,
  siteTitle: string
): SeoClampedSurfaces {
  const pageTitle = buildPageTitle(options.title, lang, siteTitle);
  const ogTitleClamped = clampForBudget(options.title, lang, 'ogTitle');
  const twitterTitleClamped = clampForBudget(options.title, lang, 'twitterTitle');
  const metaDescriptionClamped = clampForBudget(options.description, lang, 'metaDescription');
  // og:description and twitter:description prefer the longer BLUF
  // paragraph (extendedDescription) so social-card previews show the
  // full lede; fall back to the short meta description when the
  // extended one is empty.
  const socialSource =
    options.extendedDescription && options.extendedDescription.length > 0
      ? options.extendedDescription
      : options.description;
  const ogDescriptionClamped = clampForBudget(socialSource, lang, 'ogDescription');
  const twitterDescriptionClamped = clampForBudget(socialSource, lang, 'twitterDescription');
  const imageAltClamped = clampForBudget(
    `${options.title}${getTitleSeparator(lang)}${siteTitle}`,
    lang,
    'imageAlt'
  );

  const jsonLdHeadline = truncateHeadline(options.title);
  // Emit an `alternativeHeadline` whenever the headline truncator
  // dropped more than a handful of characters from the full title.
  // Schema.org's `NewsArticle.alternativeHeadline` field is exactly
  // for the long-form variant of `headline` and lets Google's
  // Knowledge Graph keep both versions for retrieval. The 5-char
  // threshold avoids emitting trivially redundant pairs when the
  // truncator only trimmed trailing whitespace or punctuation.
  const fullTitleTrimmed = options.title.trim();
  const altCandidate =
    fullTitleTrimmed.length - jsonLdHeadline.length > 5 ? fullTitleTrimmed : undefined;

  return {
    pageTitle,
    ogTitleClamped,
    twitterTitleClamped,
    metaDescriptionClamped,
    ogDescriptionClamped,
    twitterDescriptionClamped,
    imageAltClamped,
    jsonLdHeadline,
    ...(altCandidate ? { alternativeHeadline: altCandidate } : {}),
  };
}

/**
 * Render the full article HTML document with the shared chrome.
 *
 * @param options - {@link WrapArticleOptions} describing the article and its
 *                  rendered body content
 * @returns Complete `<!DOCTYPE html>` document ready to be written to disk
 */
export function wrapArticleHtml(options: WrapArticleOptions): string {
  const safeLang = ALL_LANGUAGES.includes(options.lang) ? options.lang : ('en' as LanguageCode);
  const dir = getTextDirection(safeLang);
  const siteTitle = getLocalizedString(PAGE_TITLES, safeLang).split(' - ')[0] ?? SITE_NAME;
  const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, safeLang);
  const canonicalUrl = `${BASE_URL}/news/${getArticleFilename(options.articleSlug, safeLang)}`;
  const indexHref = safeLang === 'en' ? '../index.html' : `../index-${safeLang}.html`;
  const hreflangLinks = buildArticleHreflangLinks(options.articleSlug);
  const langSwitcher = buildLanguageSwitcher(options.articleSlug, safeLang);
  const sourceMdLabel = getLocalizedString(VIEW_SOURCE_MARKDOWN_LABELS, safeLang);
  const articleNavLabel = getLocalizedString(ARTICLE_NAV_LABELS, safeLang);
  const backToNewsLabel = getLocalizedString(BACK_TO_NEWS_LABELS, safeLang);
  const politicalIntelligenceLabel = getLocalizedString(
    FOOTER_POLITICAL_INTELLIGENCE_LABELS,
    safeLang
  );
  const sitemapLabel = getLocalizedString(FOOTER_SITEMAP_LABELS, safeLang);
  const politicalIntelligenceHref = `../${getPoliticalIntelligenceFilename(safeLang)}`;
  const sitemapHref = `../${getSitemapFilename(safeLang)}`;
  const sourceMdHref = options.sourceMarkdownRelPath ? blobUrl(options.sourceMarkdownRelPath) : '';
  const sourceMdLink = options.sourceMarkdownRelPath
    ? `<p class="article-source-md"><a href="${escapeHTML(sourceMdHref)}" rel="alternate" type="text/markdown"><svg class="icon icon-inline" width="16" height="16" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><path d="M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2M12 3h6a2 2 0 0 1 2 2v6M10 14 20 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> ${escapeHTML(sourceMdLabel)}</a></p>`
    : '';
  const tocHtml = buildArticleToc(options.toc ?? [], safeLang);
  const articleMainClass = tocHtml.length > 0 ? 'article-main--with-toc' : 'article-main--no-toc';

  const articleSectionLabel = getLocalizedArticleTypePlain(options.articleType, safeLang);

  // Count words from the rendered body for the JSON-LD `wordCount`
  // field (Google's NewsArticle structured-data validator emits a
  // warning when this is missing). Done by stripping HTML tags from
  // the rendered body then splitting on whitespace — fast and
  // CodeQL-safe.
  const bodyText = stripHtmlTags(options.body);
  const wordCount = bodyText.split(/\s+/u).filter((w) => w.length > 0).length;

  // Pre-compute the per-surface SEO-budget-clamped variants of title
  // and description. Each surface gets its own clamp tuned to the
  // documented platform envelope (Google/Bing SERP, Facebook/LinkedIn
  // OG, Twitter card) and the script family (Latin / CJK / RTL —
  // CJK glyphs render at ~2× Latin pixel width, so the same byte
  // count occupies twice the SERP width). See
  // `src/aggregator/metadata/seo-budgets.ts` for the budget table and
  // `analysis/methodologies/seo-headers-policy.md` § 1.1 for the
  // documented sources of every cap.
  const seoClamps = computeSeoClamps(options, safeLang, siteTitle);
  const {
    pageTitle,
    ogTitleClamped,
    twitterTitleClamped,
    metaDescriptionClamped,
    ogDescriptionClamped,
    twitterDescriptionClamped,
    imageAltClamped,
    jsonLdHeadline,
    alternativeHeadline,
  } = seoClamps;

  // Build the JSON-LD image graph. Google requires NewsArticle.image
  // to be an array (or single ImageObject) with explicit width/height
  // covering at least one of the 1:1, 4:3, 16:9 aspect ratios for
  // Top Stories carousel eligibility.
  const jsonLdImages = [
    {
      '@type': 'ImageObject',
      url: `${BASE_URL}/images/og-image-1200.jpg`,
      width: 1200,
      height: 630,
    },
    {
      '@type': 'ImageObject',
      url: `${BASE_URL}/images/og-image-1200.webp`,
      width: 1200,
      height: 630,
    },
    {
      '@type': 'ImageObject',
      url: `${BASE_URL}/images/og-image-1200.avif`,
      width: 1200,
      height: 630,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: jsonLdHeadline,
    ...(alternativeHeadline ? { alternativeHeadline } : {}),
    description: metaDescriptionClamped,
    datePublished: options.date,
    dateModified: options.date,
    inLanguage: safeLang,
    url: canonicalUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    image: jsonLdImages,
    author: {
      '@type': 'NewsMediaOrganization',
      name: PUBLISHER_NAME,
      url: 'https://hack23.com',
      sameAs: [...ORG_SAME_AS],
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: PUBLISHER_NAME,
      url: 'https://hack23.com',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/images/apple-touch-icon.png` },
      sameAs: [...ORG_SAME_AS],
    },
    articleSection: articleSectionLabel,
    wordCount,
    keywords: (options.keywords ?? []).join(', '),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.article-dek', '.article-body > p:first-of-type'],
    },
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
    ...(options.mentions && options.mentions.length > 0
      ? {
          mentions: options.mentions.map((name) => ({
            '@type': 'Organization',
            name,
          })),
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
        name: articleSectionLabel,
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

  const keywords = (options.keywords ?? []).map((keyword) => keyword.trim()).filter(Boolean);
  const keywordsMeta =
    keywords.length > 0
      ? `  <meta name="keywords" content="${escapeHTML(keywords.join(', '))}">\n`
      : '';
  const ogLocaleTags = buildOgLocaleTags(safeLang);
  const twitterAttribution = buildTwitterAttributionTags();
  const twitterAttributionBlock = twitterAttribution ? `\n${twitterAttribution}` : '';

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
  <meta name="description" content="${escapeHTML(metaDescriptionClamped)}">
${keywordsMeta}  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta name="author" content="${PUBLISHER_NAME}">
  <meta name="publisher" content="${PUBLISHER_NAME}">
  <meta name="date" content="${options.date}">
  <meta property="article:published_time" content="${options.date}">
  <meta property="article:modified_time" content="${options.date}">
  <meta property="article:section" content="${escapeHTML(articleSectionLabel)}">
  <meta property="article:author" content="${PUBLISHER_NAME}">
  <meta property="article:publisher" content="https://hack23.com">
  <link rel="canonical" href="${canonicalUrl}">
${hreflangLinks}
  <link rel="alternate" type="application/rss+xml" title="EU Parliament Monitor RSS" href="${BASE_URL}/rss.xml">
  <link rel="preconnect" href="https://hack23.com" crossorigin>
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHTML(ogTitleClamped)}">
  <meta property="og:description" content="${escapeHTML(ogDescriptionClamped)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="EU Parliament Monitor">
${ogLocaleTags}
${buildResponsiveSocialImageMeta(imageAltClamped)}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHTML(twitterTitleClamped)}">
  <meta name="twitter:description" content="${escapeHTML(twitterDescriptionClamped)}">${twitterAttributionBlock}
${buildResponsiveIconLinks('../')}
  <link rel="manifest" href="../site.webmanifest">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#003399" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0a1a38" media="(prefers-color-scheme: dark)">
  <link rel="stylesheet" href="../styles.css?v=${BUILD_SHORT}">
${buildHeadFreshnessTags('../')}
  <script type="application/ld+json">${jsonLdString}</script>
  <script type="module" src="../js/mermaid-init.js?v=${MERMAID_VERSION}" defer></script>
  <script src="../js/article-runtime.js" defer></script>
</head>
<body>
  <a href="#main" class="skip-link">${escapeHTML(skipLinkText)}</a>
  <div class="reading-progress" aria-hidden="true"></div>

  ${header}

  ${buildPageBanner('../')}

  <main id="main" class="site-main article-main ${articleMainClass}">
    <nav class="article-top-nav" aria-label="${escapeHTML(articleNavLabel)}">
      <a class="article-top-nav__link article-top-nav__link--primary" href="${indexHref}">${escapeHTML(backToNewsLabel)}</a>
      <a class="article-top-nav__link" href="${politicalIntelligenceHref}">🧠 ${escapeHTML(politicalIntelligenceLabel)}</a>
      <a class="article-top-nav__link" href="${sitemapHref}">🗺️ ${escapeHTML(sitemapLabel)}</a>
    </nav>
${tocHtml}    <article class="article-body" lang="${safeLang}">
      <header class="article-hero">
        <p class="article-kicker">${escapeHTML(getLocalizedArticleType(options.articleType, safeLang))}</p>
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
