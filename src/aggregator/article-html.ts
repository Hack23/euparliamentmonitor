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

import { BASE_URL, BUILD_SHORT, MERMAID_VERSION } from '../constants/config.js';
import { buildHeadFreshnessTags } from '../constants/build-info-meta.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  PAGE_TITLES,
  SKIP_LINK_TEXTS,
  TOC_ARIA_LABELS,
  ARTICLE_TYPE_LABELS,
  VIEW_SOURCE_MARKDOWN_LABELS,
  ARTICLE_TYPE_ICONS,
  TRADECRAFT_HEADING_LABELS,
  TRADECRAFT_INTRO_LABELS,
  TRADECRAFT_METHODOLOGIES_LABELS,
  TRADECRAFT_TEMPLATES_LABELS,
  ANALYSIS_INDEX_HEADING_LABELS,
  ANALYSIS_INDEX_INTRO_LABELS,
  ANALYSIS_INDEX_COL_SECTION_LABELS,
  ANALYSIS_INDEX_COL_ARTIFACT_LABELS,
  ANALYSIS_INDEX_COL_PATH_LABELS,
  KEY_TAKEAWAYS_HEADING_LABELS,
  SUPPLEMENTARY_HEADING_LABELS,
  SECTION_TITLE_LABELS,
  getLocalizedString,
  getTextDirection,
} from '../constants/languages.js';
import type { LanguageCode } from '../types/index.js';
import { ArticleCategory } from '../types/index.js';
import { escapeHTML } from '../utils/file-utils.js';
import {
  buildSiteFooter,
  buildSiteHeader,
  buildPageBanner,
} from '../templates/section-builders.js';
import { READER_GUIDE_SECTION_ID } from './reader-guide-constants.js';
import { READER_GUIDE_TITLE_LABELS } from './reader-intelligence-guide.js';
import {
  TRADECRAFT_SECTION_ID,
  MANIFEST_SECTION_ID,
  SUPPLEMENTARY_SECTION_ID,
} from './artifact-order.js';
import { KEY_TAKEAWAYS_SECTION_ID } from './key-takeaways.js';

/**
 * Resolve a localized article type label with icon. Falls back to the
 * humanised slug when a translation isn't available.
 *
 * @param slug - Raw article type slug (e.g. "motions", "week-ahead")
 * @param lang - Target language code
 * @returns Localized label with preceding emoji icon (e.g. "🗳️ Plenary Votes & Resolutions")
 */
function getLocalizedArticleType(slug: string, lang: LanguageCode): string {
  const labels = getLocalizedString(ARTICLE_TYPE_LABELS, lang);
  const label = (labels as Record<string, string>)[slug] ?? slug.replace(/-/g, ' ');
  const categoryValues = Object.values(ArticleCategory) as string[];
  const iconEmoji = categoryValues.includes(slug)
    ? ARTICLE_TYPE_ICONS[slug as ArticleCategory]
    : '📄';
  return `${iconEmoji} ${label}`;
}

/** Publisher organization name used in JSON-LD, meta tags. */
const PUBLISHER_NAME = 'Hack23 AB';

/** Site name used across meta tags and structured data. */
const SITE_NAME = 'EU Parliament Monitor';

/** One entry in the article-level TOC sidebar (mirrors `TocSection`). */
export interface ArticleTocEntry {
  /** Fragment identifier — must match the `id="…"` on the rendered H2. */
  readonly id: string;
  /** Display title shown in the sidebar nav. */
  readonly title: string;
}

/** Inputs for {@link wrapArticleHtml}. */
export interface WrapArticleOptions {
  /** Target language (used for `<html lang>`, meta, nav labels). */
  readonly lang: LanguageCode;
  /**
   * Logical article slug (no lang suffix, no extension). Example:
   * `2026-01-15-breaking`. Used to build the `<link rel="alternate">` set.
   */
  readonly articleSlug: string;
  /** Pre-rendered HTML body fragment (from {@link renderMarkdown}). */
  readonly body: string;
  /** Article title — shown in `<title>`, breadcrumb, OG/Twitter meta. */
  readonly title: string;
  /** Article description — shown in `<meta name="description">` and OG. */
  readonly description: string;
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
}

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
export function getArticleFilename(articleSlug: string, lang: LanguageCode): string {
  return `${articleSlug}-${lang}.html`;
}

/**
 * Build the hreflang `<link rel="alternate">` block for an article.
 *
 * @param articleSlug - Slug of the form `<date>-<type>` (no extension)
 * @returns Newline-joined `<link>` tags for every supported language plus
 *          an `x-default` fallback pointing at the English variant
 */
export function buildArticleHreflangLinks(articleSlug: string): string {
  const entries = ALL_LANGUAGES.map(
    (code) =>
      `  <link rel="alternate" hreflang="${code}" href="${BASE_URL}/news/${getArticleFilename(articleSlug, code)}">`
  );
  entries.push(
    `  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/news/${getArticleFilename(articleSlug, 'en')}">`
  );
  return entries.join('\n');
}

/**
 * Build the language-switcher nav block for the article header.
 *
 * @param articleSlug - Slug of the form `<date>-<type>` (no extension)
 * @param current - Language currently being rendered (used for active state)
 * @returns HTML fragment containing one `<a class="lang-link">` per language
 */
function buildLanguageSwitcher(articleSlug: string, current: LanguageCode): string {
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
 * Resolve a localized title for a TOC entry based on its section ID.
 * Falls back to the original English title if no translation is available.
 *
 * @param sectionId - The fragment identifier of the section
 * @param fallbackTitle - The English title to fall back to
 * @param lang - Target language code
 * @returns Localized title string
 */
function getLocalizedTocTitle(
  sectionId: string,
  fallbackTitle: string,
  lang: LanguageCode
): string {
  // Reader Intelligence Guide
  if (sectionId === READER_GUIDE_SECTION_ID) {
    return getLocalizedString(READER_GUIDE_TITLE_LABELS, lang);
  }
  // Tradecraft References appendix
  if (sectionId === TRADECRAFT_SECTION_ID) {
    return getLocalizedString(TRADECRAFT_HEADING_LABELS, lang);
  }
  // Analysis Index appendix
  if (sectionId === MANIFEST_SECTION_ID) {
    return getLocalizedString(ANALYSIS_INDEX_HEADING_LABELS, lang);
  }
  // Key Takeaways
  if (sectionId === KEY_TAKEAWAYS_SECTION_ID) {
    return getLocalizedString(KEY_TAKEAWAYS_HEADING_LABELS, lang);
  }
  // Supplementary Intelligence
  if (sectionId === SUPPLEMENTARY_SECTION_ID) {
    return getLocalizedString(SUPPLEMENTARY_HEADING_LABELS, lang);
  }
  // Artifact section titles (strip the `section-` prefix to find the key)
  const sectionKey = sectionId.replace(/^section-/, '');
  const sectionLabels = SECTION_TITLE_LABELS[sectionKey];
  if (sectionLabels) {
    return getLocalizedString(sectionLabels, lang);
  }
  return fallbackTitle;
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
export function buildArticleToc(entries: readonly ArticleTocEntry[], lang: LanguageCode): string {
  if (entries.length === 0) return '';
  const label = escapeHTML(getLocalizedString(TOC_ARIA_LABELS, lang));
  const items = entries
    .map((e) => {
      const displayTitle = getLocalizedTocTitle(e.id, e.title, lang);
      return `        <li><a href="#${escapeHTML(e.id)}">${escapeHTML(displayTitle)}</a></li>`;
    })
    .join('\n');
  return [
    `  <aside class="article-toc-container" aria-label="${label}">`,
    `    <details class="article-toc-details" open>`,
    `      <summary class="article-toc-summary"><span class="guide-icon" aria-hidden="true">📑</span> ${label}</summary>`,
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
 * Localize the Tradecraft References and Analysis Index sections in the
 * rendered article body HTML. Replaces English headings, introductions,
 * sub-headings, and table headers with translated equivalents.
 *
 * @param bodyHtml - The rendered HTML body (from Markdown)
 * @param lang - Target language code
 * @returns HTML body with localized appendix sections
 */
export function localizeArticleBody(bodyHtml: string, lang: LanguageCode): string {
  if (lang === 'en') return bodyHtml;

  let html = bodyHtml;

  // --- Tradecraft References heading ---
  // Use simple string indexOf to avoid polynomial regex backtracking.
  const tradecraftHeading = getLocalizedString(TRADECRAFT_HEADING_LABELS, lang);
  html = replaceHeadingById(
    html,
    TRADECRAFT_SECTION_ID,
    'Tradecraft References',
    tradecraftHeading
  );

  // --- Tradecraft intro paragraph ---
  // The rendered Markdown produces a <p> containing the intro text with an
  // <a> link to Hack23. Replace only the known English sentence prefix.
  const tradecraftIntro = getLocalizedString(TRADECRAFT_INTRO_LABELS, lang);
  const introSentenceStart = 'This article is produced under the ';
  const introIdx = html.indexOf(introSentenceStart);
  if (introIdx !== -1) {
    // Find the end of the sentence (next '</p>' or period followed by '<')
    const sentenceEnd = html.indexOf('</p>', introIdx);
    if (sentenceEnd !== -1) {
      const localizedWithLink = tradecraftIntro.replace(
        'Hack23 AB',
        '<a href="https://hack23.com">Hack23 AB</a>'
      );
      html = html.slice(0, introIdx) + localizedWithLink + html.slice(sentenceEnd);
    }
  }

  // --- Methodologies sub-heading ---
  const methodsLabel = getLocalizedString(TRADECRAFT_METHODOLOGIES_LABELS, lang);
  html = html.replace(/<h3>Methodologies<\/h3>/, `<h3>${escapeHTML(methodsLabel)}</h3>`);

  // --- Artifact templates sub-heading ---
  const templatesLabel = getLocalizedString(TRADECRAFT_TEMPLATES_LABELS, lang);
  html = html.replace(/<h3>Artifact templates<\/h3>/, `<h3>${escapeHTML(templatesLabel)}</h3>`);

  // --- Analysis Index heading ---
  const analysisIndexHeading = getLocalizedString(ANALYSIS_INDEX_HEADING_LABELS, lang);
  html = replaceHeadingById(html, MANIFEST_SECTION_ID, 'Analysis Index', analysisIndexHeading);

  // --- Analysis Index intro ---
  const analysisIndexIntro = getLocalizedString(ANALYSIS_INDEX_INTRO_LABELS, lang);
  // Use indexOf to find the manifest.json link URL without polynomial regex
  const manifestLinkPrefix = 'href="';
  const manifestJsonLiteral = 'manifest.json';
  const manifestLinkIdx = html.indexOf(manifestJsonLiteral);
  let manifestUrl = '';
  if (manifestLinkIdx !== -1) {
    // Walk backward to find the preceding href="
    const hrefIdx = html.lastIndexOf(manifestLinkPrefix, manifestLinkIdx);
    if (hrefIdx !== -1 && manifestLinkIdx - hrefIdx < 200) {
      const urlStart = hrefIdx + manifestLinkPrefix.length;
      const urlEnd = html.indexOf('"', urlStart);
      if (urlEnd !== -1) {
        manifestUrl = html.slice(urlStart, urlEnd);
      }
    }
  }
  const localizedIntroWithLink = manifestUrl
    ? analysisIndexIntro.replace('manifest.json', `<a href="${manifestUrl}">manifest.json</a>`)
    : analysisIndexIntro;
  // Replace the known English intro sentence using indexOf
  const analysisIntroStart = 'Every artifact below was read by the aggregator';
  const analysisIntroIdx = html.indexOf(analysisIntroStart);
  if (analysisIntroIdx !== -1) {
    const analysisIntroEnd = html.indexOf('gate-result history.', analysisIntroIdx);
    if (analysisIntroEnd !== -1) {
      const endOffset = analysisIntroEnd + 'gate-result history.'.length;
      html = html.slice(0, analysisIntroIdx) + localizedIntroWithLink + html.slice(endOffset);
    }
  }

  // --- Analysis Index table headers ---
  const colSection = getLocalizedString(ANALYSIS_INDEX_COL_SECTION_LABELS, lang);
  const colArtifact = getLocalizedString(ANALYSIS_INDEX_COL_ARTIFACT_LABELS, lang);
  const colPath = getLocalizedString(ANALYSIS_INDEX_COL_PATH_LABELS, lang);
  html = html.replace(
    '<th>Section</th><th>Artifact</th><th>Path</th>',
    `<th>${escapeHTML(colSection)}</th><th>${escapeHTML(colArtifact)}</th><th>${escapeHTML(colPath)}</th>`
  );

  // --- Key Takeaways heading ---
  const keyTakeawaysHeading = getLocalizedString(KEY_TAKEAWAYS_HEADING_LABELS, lang);
  html = replaceHeadingById(html, 'section-key-takeaways', 'Key Takeaways', keyTakeawaysHeading);

  // --- Supplementary Intelligence heading ---
  const supplementaryHeading = getLocalizedString(SUPPLEMENTARY_HEADING_LABELS, lang);
  html = replaceHeadingById(
    html,
    'supplementary-intelligence',
    'Supplementary Intelligence',
    supplementaryHeading
  );

  return html;
}

/**
 * Replace an H2 heading's text content by locating it via its `id` attribute.
 * Uses indexOf-based search to avoid polynomial regex backtracking (CodeQL).
 *
 * @param html - Full HTML string
 * @param sectionId - The id attribute value of the target `<h2>`
 * @param englishTitle - The English title text to replace
 * @param localizedTitle - The localized title to insert
 * @returns Updated HTML string
 */
function replaceHeadingById(
  html: string,
  sectionId: string,
  englishTitle: string,
  localizedTitle: string
): string {
  // Find the id attribute in the HTML — this uniquely identifies the heading
  const idMarker = `id="${sectionId}"`;
  let idIdx = html.indexOf(idMarker);
  if (idIdx === -1) {
    // Try single-quoted variant
    const idMarkerSingle = `id='${sectionId}'`;
    idIdx = html.indexOf(idMarkerSingle);
  }
  if (idIdx === -1) return html;

  // Find the closing '>' of the opening tag after the id
  const tagCloseIdx = html.indexOf('>', idIdx);
  if (tagCloseIdx === -1) return html;

  // The title text starts immediately after '>'
  const titleStart = tagCloseIdx + 1;
  const titleEnd = html.indexOf('<', titleStart);
  if (titleEnd === -1) return html;

  // Verify this is actually the English title we expect
  const existingTitle = html.slice(titleStart, titleEnd);
  if (existingTitle.trim() !== englishTitle) return html;

  return html.slice(0, titleStart) + escapeHTML(localizedTitle) + html.slice(titleEnd);
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
  const sourceMdLink = options.sourceMarkdownRelPath
    ? `<p class="article-source-md"><a href="${BASE_URL}/${options.sourceMarkdownRelPath}" rel="alternate" type="text/markdown"><svg class="icon icon-inline" width="16" height="16" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><path d="M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2M12 3h6a2 2 0 0 1 2 2v6M10 14 20 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> ${escapeHTML(sourceMdLabel)}</a></p>`
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
  <link rel="stylesheet" href="../styles.css?v=${BUILD_SHORT}">
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
