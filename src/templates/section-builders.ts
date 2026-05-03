// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Templates/SectionBuilders
 * @description Reusable section builder utilities for article template architecture.
 * Provides quality scoring, table of contents generation, quality badge rendering,
 * timeline sections, comparison tables, and key figures bars.
 */

import { escapeHTML } from '../utils/file-utils.js';
import type { ArticleQualityScore, TOCEntry, LanguageCode } from '../types/index.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  getLocalizedString,
  TOC_ARIA_LABELS,
  TIMELINE_HEADINGS,
  COMPARISON_BEFORE_LABELS,
  COMPARISON_AFTER_LABELS,
  KEY_FIGURES_HEADINGS,
  FOOTER_ABOUT_HEADING_LABELS,
  FOOTER_ABOUT_TEXT_LABELS,
  FOOTER_QUICK_LINKS_LABELS,
  FOOTER_BUILT_BY_LABELS,
  FOOTER_LANGUAGES_LABELS,
  FOOTER_HOME_LABELS,
  FOOTER_SITEMAP_LABELS,
  FOOTER_RSS_LABELS,
  FOOTER_GITHUB_REPO_LABELS,
  FOOTER_LICENSE_LABELS,
  FOOTER_EUROPARL_LABELS,
  FOOTER_LINKEDIN_LABELS,
  FOOTER_SECURITY_POLICY_LABELS,
  FOOTER_CONTACT_LABELS,
  FOOTER_DISCLAIMER_LABELS,
  FOOTER_REPORT_ISSUES_LABELS,
  FOOTER_ARTICLES_AVAILABLE_LABELS,
  FOOTER_POLITICAL_INTELLIGENCE_LABELS,
  HEADER_SUBTITLE_LABELS,
  THEME_TOGGLE_LABELS,
  BUILD_INFO_COMMIT_LABELS,
  BUILD_INFO_DEPLOYED_LABELS,
  HEADER_CTA_SPONSOR_LABELS,
  HEADER_CTA_BECOME_SPONSOR_LABELS,
  HEADER_CTA_SECURITY_LABELS,
  FOOTER_NEWS_LABELS,
  FOOTER_DASHBOARD_LABELS,
  FOOTER_ANALYSIS_REPORTS_LABELS,
  FOOTER_API_DOCS_LABELS,
  FOOTER_COMPANY_TAGLINE_LABELS,
  LANGUAGE_SELECTION_ARIA_LABELS,
  FOOTER_TRUST_BADGES_ARIA_LABELS,
} from '../constants/languages.js';
import {
  APP_VERSION,
  BUILD_ID,
  BUILD_SHORT,
  BUILD_TIME,
  createThemeToggleButton,
} from '../constants/config.js';
import { icon, type IconName } from './icons.js';
import { stripScriptBlocks, stripHtmlTags } from '../utils/html-sanitize.js';

// ─── New section builder interfaces ─────────────────────────────────────────

/**
 * A single item in a legislative or procedural timeline.
 */
export interface TimelineItem {
  /** Date label (e.g. "2026-03-15" or human-readable) */
  date: string;
  /** Short event label */
  label: string;
  /** Optional extended description */
  description?: string | undefined;
}

/**
 * A numeric highlight figure for a key-figures bar.
 */
export interface KeyFigure {
  /** Descriptive label for the figure */
  label: string;
  /** Formatted value string (e.g. "42", "78%") */
  value: string;
  /** Optional unit suffix (e.g. "votes", "days", "%") */
  unit?: string | undefined;
  /** Optional longer description for screen readers / tooltips */
  description?: string | undefined;
}

/**
 * Count occurrences of a regex pattern in a string.
 *
 * @param content - String to search.
 * @param pattern - Global regex pattern to match.
 * @returns Number of matches found.
 */
function countMatches(content: string, pattern: RegExp): number {
  const matches = content.match(pattern);
  return matches !== null ? matches.length : 0;
}

/**
 * Count elements whose `class` attribute contains a given CSS class token.
 *
 * Extracts every `class="…"` attribute, splits the value into tokens, and
 * checks for an exact match — so `"dashboard"` will NOT match nested
 * classes like `"dashboard-grid"` or `"dashboard-panel"`.
 *
 * @param content - HTML string to search.
 * @param token - Exact CSS class name to look for.
 * @returns Number of elements that have the given class token.
 */
function countClassToken(content: string, token: string): number {
  let count = 0;
  for (const m of content.matchAll(/class="([^"]*)"/g)) {
    const value = m[1] ?? '';
    if (value.split(/\s+/).includes(token)) {
      count += 1;
    }
  }
  return count;
}

// stripScriptBlocks is imported from html-sanitize.ts

/**
 * Compute an article quality score by analysing the rendered HTML content.
 *
 * @param content - Full HTML content string of the article body.
 * @returns {@link ArticleQualityScore} with word count, section counts, and overall rating.
 */
export function computeArticleQualityScore(content: string): ArticleQualityScore {
  // Remove script blocks before tag-stripping to avoid inflating word count.
  // Uses iterative scanning instead of regex to avoid CodeQL js/bad-tag-filter.
  const noScripts = stripScriptBlocks(content);
  // Strip HTML tags to get plain text, then count words
  const plainText = stripHtmlTags(noScripts).replace(/\s+/g, ' ').trim();
  const wordCount =
    plainText.length > 0 ? plainText.split(' ').filter((w) => w.length > 0).length : 0;

  // All further counting uses script-stripped HTML to avoid false positives
  // from embedded JSON-LD or interactive script blocks.
  const totalSections = countMatches(noScripts, /<section\b/g);

  // Count data visualizations using exact class-token matching.
  // countClassToken splits the class attribute value into tokens, so nested
  // classes like "dashboard-grid" or "dashboard-panel" are NOT counted.
  const chartCount = countMatches(noScripts, /data-chart-config/g);
  const dashboardCount = countClassToken(noScripts, 'dashboard');
  const mindmapCount = countClassToken(noScripts, 'mindmap-section');
  const swotCount = countClassToken(noScripts, 'swot-analysis');
  const visualizationCount = chartCount + dashboardCount + mindmapCount + swotCount;

  // Exclude visualization sections from analysis section count
  const analysisSections = totalSections - dashboardCount - mindmapCount - swotCount;

  // Count EP document links (with a real path, not just the bare homepage).
  // This excludes the generic footer link `https://www.europarl.europa.eu/`
  // while counting links to specific EP resources like /doceo/, /plenary/, etc.
  const evidenceReferences = countMatches(
    noScripts,
    /href="https:\/\/www\.europarl\.europa\.eu\/\w[^"]*"/g
  );

  // Determine overall quality score
  let overallScore: ArticleQualityScore['overallScore'];
  if (wordCount >= 800 && analysisSections >= 3 && visualizationCount >= 2) {
    overallScore = 'excellent';
  } else if (wordCount >= 500 && analysisSections >= 2) {
    overallScore = 'good';
  } else if (wordCount >= 200 && analysisSections >= 1) {
    overallScore = 'adequate';
  } else {
    overallScore = 'needs-improvement';
  }

  return { wordCount, analysisSections, visualizationCount, evidenceReferences, overallScore };
}

/**
 * Build an HTML table of contents navigation element from a list of entries.
 *
 * @param entries - Ordered list of {@link TOCEntry} items to render.
 * @param lang - Language code used for the localised aria-label.
 * @returns HTML string for the TOC `<nav>` element, or empty string when entries is empty.
 */
export function buildTableOfContents(entries: TOCEntry[], lang: LanguageCode): string {
  if (entries.length === 0) {
    return '';
  }

  const ariaLabel = escapeHTML(getLocalizedString(TOC_ARIA_LABELS, lang));

  const items = entries
    .map((entry) => {
      const safeLabel = escapeHTML(entry.label);
      // Strip leading # to prevent href="##foo"
      const safeId = escapeHTML(entry.id.replace(/^#/, ''));
      const classAttr = entry.level === 2 ? ' class="toc-sub"' : '';
      return `<li${classAttr}><a href="#${safeId}">${safeLabel}</a></li>`;
    })
    .join('\n      ');

  return `<nav class="article-toc" aria-label="${ariaLabel}">
  <ol>
      ${items}
  </ol>
</nav>`;
}

/**
 * Build an HTML quality score badge element for an article.
 *
 * The badge is `aria-hidden` since it conveys metadata, not primary content.
 * Returns an empty string for articles with a 'needs-improvement' score to avoid
 * surfacing poor-quality signals to readers.
 *
 * @param score - {@link ArticleQualityScore} to render.
 * @returns HTML string for the badge `<div>`, or empty string for needs-improvement.
 */
export function buildQualityScoreBadge(score: ArticleQualityScore): string {
  if (score.overallScore === 'needs-improvement') {
    return '';
  }

  const safeScore = escapeHTML(score.overallScore);
  return `<div class="article-quality-score" data-score="${safeScore}" aria-hidden="true">
  <span class="qs-words">${score.wordCount}</span>
  <span class="qs-sections">${score.analysisSections}</span>
  <span class="qs-visuals">${score.visualizationCount}</span>
  <span class="qs-evidence">${score.evidenceReferences}</span>
</div>`;
}

// ─── New section builders ────────────────────────────────────────────────────

/**
 * Build an HTML timeline section for legislative or procedural events.
 *
 * Renders an ordered list of dated events. Each item includes a date badge
 * and a label. An optional description is included as visible text when
 * provided. Empty items array returns an empty string.
 *
 * @param items - Ordered list of {@link TimelineItem} events to render.
 * @param lang - Language code used for the section heading.
 * @returns HTML string for the timeline `<section>`, or empty string when items is empty.
 */
export function buildTimelineSection(
  items: ReadonlyArray<TimelineItem>,
  lang: LanguageCode
): string {
  if (items.length === 0) return '';

  const heading = escapeHTML(getLocalizedString(TIMELINE_HEADINGS, lang));

  const listItems = items
    .map((item) => {
      const safeDate = escapeHTML(item.date);
      const safeLabel = escapeHTML(item.label);
      const descPart = item.description
        ? `<span class="timeline-description">${escapeHTML(item.description)}</span>`
        : '';
      return (
        `<li class="timeline-item">` +
        `<span class="timeline-date">${safeDate}</span>` +
        `<span class="timeline-label">${safeLabel}</span>` +
        descPart +
        `</li>`
      );
    })
    .join('\n      ');

  return `<section class="timeline-section" aria-label="${heading}">
  <h2>${heading}</h2>
  <ol class="timeline-list" role="list">
      ${listItems}
  </ol>
</section>`;
}

/**
 * Build an HTML before/after comparison table for legislative changes.
 *
 * Renders a two-column table comparing the state of something before and after
 * a legislative action. When the input arrays have different lengths, the
 * table uses the longer length and renders missing cells as empty strings.
 * Returns an empty string when either array is empty.
 *
 * @param before - Array of "before" state descriptions for the first column.
 * @param after - Array of "after" state descriptions for the second column.
 * @param lang - Language code used for column headings.
 * @returns HTML string for the comparison `<table>`, or empty string when either array is empty.
 */
export function buildComparisonTable(
  before: ReadonlyArray<string>,
  after: ReadonlyArray<string>,
  lang: LanguageCode
): string {
  if (before.length === 0 || after.length === 0) return '';

  const beforeLabel = escapeHTML(getLocalizedString(COMPARISON_BEFORE_LABELS, lang));
  const afterLabel = escapeHTML(getLocalizedString(COMPARISON_AFTER_LABELS, lang));
  const maxRows = Math.max(before.length, after.length);

  const rows = Array.from({ length: maxRows }, (_, i) => {
    const beforeCell = escapeHTML(before[i] ?? '');
    const afterCell = escapeHTML(after[i] ?? '');
    return (
      `<tr>` +
      `<td class="comparison-before">${beforeCell}</td>` +
      `<td class="comparison-after">${afterCell}</td>` +
      `</tr>`
    );
  }).join('\n      ');

  return `<div class="comparison-table-wrapper" role="region" aria-label="${beforeLabel} / ${afterLabel}">
  <table class="comparison-table">
    <caption class="sr-only">${beforeLabel} / ${afterLabel}</caption>
    <thead>
      <tr>
        <th scope="col">${beforeLabel}</th>
        <th scope="col">${afterLabel}</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</div>`;
}

/**
 * Build an HTML key figures bar for quick-scan numeric highlights.
 *
 * Renders a horizontal strip of numeric summary cards. Each card shows a
 * value (with optional unit), a label, and an optional screen-reader-only
 * description. Empty figures array returns an empty string.
 *
 * @param figures - Array of {@link KeyFigure} items to render.
 * @param lang - Language code used for the section heading.
 * @returns HTML string for the key figures `<section>`, or empty string when figures is empty.
 */
export function buildKeyFiguresBar(figures: ReadonlyArray<KeyFigure>, lang: LanguageCode): string {
  if (figures.length === 0) return '';

  const heading = escapeHTML(getLocalizedString(KEY_FIGURES_HEADINGS, lang));

  const cards = figures
    .map((fig) => {
      const safeLabel = escapeHTML(fig.label);
      const safeValue = escapeHTML(fig.value);
      const safeUnit = fig.unit ? escapeHTML(fig.unit) : '';
      const unitSpan = safeUnit
        ? ` <span class="kf-unit" aria-hidden="true">${safeUnit}</span>`
        : '';
      const descriptionPart = fig.description
        ? `<span class="sr-only">${escapeHTML(fig.description)}</span>`
        : '';
      return (
        `<div class="key-figure-card" role="listitem" aria-label="${safeLabel}: ${safeValue}${safeUnit ? ' ' + safeUnit : ''}">` +
        `<span class="kf-value">${safeValue}${unitSpan}</span>` +
        `<span class="kf-label">${safeLabel}</span>` +
        descriptionPart +
        `</div>`
      );
    })
    .join('\n      ');

  return `<section class="key-figures-bar" aria-label="${heading}">
  <h2 class="sr-only">${heading}</h2>
  <div class="key-figures-grid" role="list">
      ${cards}
  </div>
</section>`;
}

/* ─── Shared site header/footer builders ─────────────────────────── */

/** Icon name used for security/transparency links across the chrome. */
const ICON_SECURITY: IconName = 'shield-star';

/**
 * Options for building the shared site header.
 */
export interface SiteHeaderOptions {
  /** Language code used for localization. */
  lang: LanguageCode;
  /**
   * URL path prefix prepended to relative asset and page links.
   * Use `''` for root pages and `'../'` for pages inside `news/`.
   */
  pathPrefix: string;
  /** Link target for the brand/logo. */
  homeHref: string;
  /** Accessible site title and visible brand title. */
  siteTitle: string;
  /** Pre-rendered language switcher links for the current page family. */
  languageSwitcherHtml: string;
  /**
   * Optional override for the Political Intelligence destination. When
   * omitted the link points at the language-aware
   * `political-intelligence[_<lang>].html` page using `pathPrefix`.
   * Pass an empty string to suppress the link altogether.
   */
  politicalIntelligenceHref?: string;
}

/**
 * Build the shared responsive site header used by every generated page family.
 *
 * @param options - {@link SiteHeaderOptions} controlling language, assets, and language links.
 * @returns HTML string for `<header class="site-header">…</header>`.
 */
export function buildSiteHeader(options: SiteHeaderOptions): string {
  const { lang, pathPrefix, homeHref, siteTitle, languageSwitcherHtml } = options;
  const headerSubtitle = escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, lang));
  const themeToggleLabel = getLocalizedString(THEME_TOGGLE_LABELS, lang);
  const sponsorLabel = escapeHTML(getLocalizedString(HEADER_CTA_SPONSOR_LABELS, lang));
  const becomeSponsorLabel = escapeHTML(getLocalizedString(HEADER_CTA_BECOME_SPONSOR_LABELS, lang));
  const securityLabel = escapeHTML(getLocalizedString(HEADER_CTA_SECURITY_LABELS, lang));
  const piLabel = escapeHTML(getLocalizedString(FOOTER_POLITICAL_INTELLIGENCE_LABELS, lang));
  const langSelectionLabel = escapeHTML(getLocalizedString(LANGUAGE_SELECTION_ARIA_LABELS, lang));
  const safeTitle = escapeHTML(siteTitle);
  const defaultPiHref = `${pathPrefix}${lang === 'en' ? 'political-intelligence.html' : `political-intelligence_${lang}.html`}`;
  const rawPiHref =
    typeof options.politicalIntelligenceHref === 'string'
      ? options.politicalIntelligenceHref
      : defaultPiHref;
  // Only allow same-origin relative URLs or https: scheme to prevent javascript:/data: injection.
  // Reject protocol-relative URLs (//...) and backslash variants that browsers normalize to external navigation.
  const isSafeHref =
    rawPiHref.length === 0 ||
    (rawPiHref.startsWith('/') && !rawPiHref.startsWith('//') && rawPiHref[1] !== '\\') ||
    rawPiHref.startsWith('./') ||
    rawPiHref.startsWith('../') ||
    rawPiHref.startsWith('https://') ||
    (!rawPiHref.includes(':') && !rawPiHref.startsWith('//') && !rawPiHref.startsWith('\\'));
  const piHref = isSafeHref ? rawPiHref : defaultPiHref;

  const cta = (extraClass: string, href: string, iconName: IconName, label: string): string =>
    `<a class="site-header__cta${extraClass ? ` ${extraClass}` : ''}" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}">${icon(iconName)}<span class="site-header__cta-label">${label}</span></a>`;

  // Internal CTA — same visual style but no target="_blank" since this is a same-site nav entry.
  const piCta =
    piHref.length > 0
      ? `<a class="site-header__cta site-header__cta--pi" href="${escapeHTML(piHref)}" aria-label="${piLabel}" title="${piLabel}">${icon('pi')}<span class="site-header__cta-label">${piLabel}</span></a>\n        `
      : '';

  return `<header class="site-header" role="banner">
    <div class="site-header__inner site-header__inner--stacked">
      <a href="${escapeHTML(homeHref)}" class="site-header__brand" aria-label="${safeTitle}">
        <picture class="site-header__logo-picture">
          <source srcset="${pathPrefix}images/banner.webp" type="image/webp">
          <img class="site-header__logo site-header__logo--banner" src="${pathPrefix}images/banner.jpg" alt="${safeTitle}" width="240" height="80" loading="eager">
        </picture>
        <span class="site-header__brand-text">
          <span class="site-header__title">${safeTitle}</span>
          <span class="site-header__subtitle">${headerSubtitle}</span>
        </span>
      </a>
      <div class="site-header__actions">
        ${piCta}${cta('site-header__cta--sponsor', 'https://github.com/sponsors/Hack23', 'heart', sponsorLabel)}
        ${cta('', 'https://www.hack23.com', 'sponsor', becomeSponsorLabel)}
        ${cta('site-header__cta--security', 'https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY.md', ICON_SECURITY, securityLabel)}
        ${createThemeToggleButton(themeToggleLabel)}
      </div>
      <nav class="site-header__langs" role="navigation" aria-label="${langSelectionLabel}">
        ${languageSwitcherHtml}
      </nav>
    </div>
  </header>`;
}

/**
 * Build the full-width page banner shown below the sticky site header on every page.
 *
 * The banner image (`banner.webp` / `banner.jpg`) is 1200×400. CSS renders it with
 * `object-fit: cover; object-position: center` so the middle 80% of the image is
 * always visible and the uninteresting top/bottom 10% may be cropped.
 *
 * @param pathPrefix - Asset path prefix: `''` for root pages, `'../'` for `news/` pages.
 * @returns HTML string for the `.page-banner` element.
 */
export function buildPageBanner(pathPrefix: string): string {
  return `<div class="page-banner" role="img" aria-label="EU Parliament Monitor">
    <picture>
      <source srcset="${pathPrefix}images/banner.webp" type="image/webp">
      <img class="page-banner__img" src="${pathPrefix}images/banner.jpg" alt="" aria-hidden="true" width="1200" height="400" loading="eager">
    </picture>
  </div>`;
}

/**
 * Options for building the shared site footer.
 */
export interface SiteFooterOptions {
  /** Language code used for localization. */
  lang: LanguageCode;
  /**
   * URL path prefix prepended to relative links.
   * Use `''` for root (index) pages and `'../'` for pages inside `news/`.
   */
  pathPrefix: string;
  /**
   * Optional article count shown in the About section.
   * When omitted the articles-available line is hidden.
   */
  articleCount?: number | undefined;
}

/**
 * Build the language grid links used inside the footer Languages section.
 *
 * @param currentLang - The currently active language code.
 * @param pathPrefix - Path prefix for index page hrefs ('' or '../').
 * @returns HTML string of anchor elements.
 */
function buildFooterLangGrid(currentLang: LanguageCode, pathPrefix: string): string {
  return ALL_LANGUAGES.map((code) => {
    const flag = getLocalizedString(LANGUAGE_FLAGS, code);
    const safeName = escapeHTML(getLocalizedString(LANGUAGE_NAMES, code));
    const href = code === 'en' ? `${pathPrefix}index.html` : `${pathPrefix}index-${code}.html`;
    const active = code === currentLang ? ' class="active"' : '';
    const current = code === currentLang ? ' aria-current="page"' : '';
    return `<a href="${escapeHTML(href)}"${active} hreflang="${code}" lang="${code}" title="${safeName}" aria-label="${safeName}"${current}>${flag} ${code.toUpperCase()}</a>`;
  }).join('\n            ');
}

/**
 * Build the shared site footer HTML used by both article pages and index pages.
 *
 * Renders four sections (About, Quick Links, Built by Hack23, Languages) plus a
 * footer-bottom bar with copyright, version, and a localized disclaimer.
 *
 * @param options - {@link SiteFooterOptions} controlling lang, pathPrefix, and articleCount.
 * @returns HTML string for `<footer class="site-footer">…</footer>`.
 */
export function buildSiteFooter(options: SiteFooterOptions): string {
  const { lang, pathPrefix, articleCount } = options;
  const year = new Date().getFullYear();

  const aboutHeading = escapeHTML(getLocalizedString(FOOTER_ABOUT_HEADING_LABELS, lang));
  const aboutText = escapeHTML(getLocalizedString(FOOTER_ABOUT_TEXT_LABELS, lang));
  const quickLinksHeading = escapeHTML(getLocalizedString(FOOTER_QUICK_LINKS_LABELS, lang));
  const builtByHeading = escapeHTML(getLocalizedString(FOOTER_BUILT_BY_LABELS, lang));
  const languagesHeading = escapeHTML(getLocalizedString(FOOTER_LANGUAGES_LABELS, lang));

  const homeLabel = escapeHTML(getLocalizedString(FOOTER_HOME_LABELS, lang));
  const sitemapLabel = escapeHTML(getLocalizedString(FOOTER_SITEMAP_LABELS, lang));
  const rssLabel = escapeHTML(getLocalizedString(FOOTER_RSS_LABELS, lang));
  const politicalIntelligenceLabel = escapeHTML(
    getLocalizedString(FOOTER_POLITICAL_INTELLIGENCE_LABELS, lang)
  );
  const githubLabel = escapeHTML(getLocalizedString(FOOTER_GITHUB_REPO_LABELS, lang));
  const licenseLabel = escapeHTML(getLocalizedString(FOOTER_LICENSE_LABELS, lang));
  const europarlLabel = escapeHTML(getLocalizedString(FOOTER_EUROPARL_LABELS, lang));
  const linkedinLabel = escapeHTML(getLocalizedString(FOOTER_LINKEDIN_LABELS, lang));
  // Security & Privacy Policy label already contains safe &amp; entities — do not double-escape
  const securityLabel = getLocalizedString(FOOTER_SECURITY_POLICY_LABELS, lang);
  const contactLabel = escapeHTML(getLocalizedString(FOOTER_CONTACT_LABELS, lang));
  const disclaimerText = escapeHTML(getLocalizedString(FOOTER_DISCLAIMER_LABELS, lang));
  const reportIssuesLabel = escapeHTML(getLocalizedString(FOOTER_REPORT_ISSUES_LABELS, lang));
  const newsLabel = escapeHTML(getLocalizedString(FOOTER_NEWS_LABELS, lang));
  const dashboardLabel = escapeHTML(getLocalizedString(FOOTER_DASHBOARD_LABELS, lang));
  const analysisReportsLabel = escapeHTML(getLocalizedString(FOOTER_ANALYSIS_REPORTS_LABELS, lang));
  const apiDocsLabel = escapeHTML(getLocalizedString(FOOTER_API_DOCS_LABELS, lang));
  const companyTagline = escapeHTML(getLocalizedString(FOOTER_COMPANY_TAGLINE_LABELS, lang));
  const homeHref = `${pathPrefix}${lang === 'en' ? 'index.html' : `index-${lang}.html`}`;
  const sitemapHref = `${pathPrefix}${lang === 'en' ? 'sitemap.html' : `sitemap_${lang}.html`}`;
  const politicalIntelligenceHref = `${pathPrefix}${lang === 'en' ? 'political-intelligence.html' : `political-intelligence_${lang}.html`}`;
  const apiDocsHref = `${pathPrefix}docs/api/`;
  const analysisDocsHref = `${pathPrefix}docs/`;

  const articlesLine =
    typeof articleCount === 'number'
      ? `\n        <p class="footer-stats">${escapeHTML(getLocalizedString(FOOTER_ARTICLES_AVAILABLE_LABELS, lang).replace('{count}', String(articleCount)))}</p>`
      : '';

  const langGrid = buildFooterLangGrid(lang, pathPrefix);

  const buildLabel = escapeHTML(getLocalizedString(BUILD_INFO_COMMIT_LABELS, lang));
  const deployedLabel = escapeHTML(getLocalizedString(BUILD_INFO_DEPLOYED_LABELS, lang));
  const safeBuildId = escapeHTML(BUILD_ID);
  const safeBuildShort = escapeHTML(BUILD_SHORT);
  const safeBuildTime = escapeHTML(BUILD_TIME);
  const buildLine =
    `v${escapeHTML(APP_VERSION)} · ` +
    `<a href="https://github.com/Hack23/euparliamentmonitor/commit/${safeBuildId}" ` +
    `class="footer-build" title="${buildLabel} ${safeBuildShort}" target="_blank" rel="noopener noreferrer">` +
    `<code>${safeBuildShort}</code></a> · ` +
    `<span class="footer-build-deployed">${deployedLabel}</span> ` +
    `<time class="footer-build-time" datetime="${safeBuildTime}" data-relative-time>${safeBuildTime}</time>`;

  return `<footer class="site-footer" role="contentinfo">
    <div class="footer-content">
      <div class="footer-section">
        <h3>${aboutHeading}</h3>
        <p>${aboutText}</p>${articlesLine}
        <p class="footer-company-summary">${companyTagline}</p>
      </div>
      <div class="footer-section">
        <h3>${quickLinksHeading}</h3>
        <ul>
          <li><a href="${homeHref}">${icon('home')}<span>${homeLabel}</span></a></li>
          <li><a href="${homeHref}#main">${icon('news')}<span>${newsLabel}</span></a></li>
          <li><a href="${analysisDocsHref}">${icon('analysis')}<span>${analysisReportsLabel}</span></a></li>
          <li><a href="${pathPrefix}docs/index.html">${icon('dashboard')}<span>${dashboardLabel}</span></a></li>
          <li><a href="${politicalIntelligenceHref}">${icon('pi')}<span>${politicalIntelligenceLabel}</span></a></li>
          <li><a href="${sitemapHref}">${icon('sitemap')}<span>${sitemapLabel}</span></a></li>
          <li><a href="${apiDocsHref}">${icon('book')}<span>${apiDocsLabel}</span></a></li>
          <li><a href="${pathPrefix}rss.xml">${icon('rss')}<span>${rssLabel}</span></a></li>
          <li><a href="https://hack23.com/euparliamentmonitor.html" target="_blank" rel="noopener noreferrer">${icon('external')}<span>EU Parliament Monitor by Hack23</span></a></li>
          <li><a href="https://hack23.com/euparliamentmonitor-features.html" target="_blank" rel="noopener noreferrer">${icon('external')}<span>EU Parliament Monitor Features</span></a></li>
          <li><a href="https://hack23.com/cia-features.html" target="_blank" rel="noopener noreferrer">${icon('external')}<span>CIA Platform</span></a></li>
          <li><a href="https://www.riksdagen.se/" target="_blank" rel="noopener noreferrer">${icon('external')}<span>Sveriges Riksdag</span></a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor" target="_blank" rel="noopener noreferrer">${icon('github')}<span>${githubLabel}</span></a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor/issues" target="_blank" rel="noopener noreferrer">${icon('external')}<span>${reportIssuesLabel}</span></a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">${icon('book')}<span>${licenseLabel}</span></a></li>
          <li><a href="https://www.europarl.europa.eu/" target="_blank" rel="noopener noreferrer">${icon('external')}<span>${europarlLabel}</span></a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>${builtByHeading}</h3>
        <div class="footer-badges" aria-label="${escapeHTML(getLocalizedString(FOOTER_TRUST_BADGES_ARIA_LABELS, lang))}">
          <a href="https://www.npmjs.com/package/euparliamentmonitor" aria-label="npm package version"><img src="https://img.shields.io/npm/v/euparliamentmonitor.svg" alt="npm package version"></a>
          <a href="https://scorecard.dev/viewer/?uri=github.com/Hack23/euparliamentmonitor" aria-label="OpenSSF Scorecard"><img src="https://api.securityscorecards.dev/projects/github.com/Hack23/euparliamentmonitor/badge" alt="OpenSSF Scorecard"></a>
          <a href="https://www.bestpractices.dev/projects/12068" aria-label="OpenSSF Best Practices"><img src="https://www.bestpractices.dev/projects/12068/badge" alt="OpenSSF Best Practices"></a>
          <a href="https://github.com/Hack23/euparliamentmonitor/attestations" aria-label="SLSA Level 3"><img src="https://slsa.dev/images/gh-badge-level3.svg" alt="SLSA Level 3"></a>
        </div>
        <ul>
          <li><a href="https://hack23.com" target="_blank" rel="noopener noreferrer">${icon('external')}<span>Hack23.com</span></a></li>
          <li><a href="https://github.com/sponsors/Hack23" target="_blank" rel="noopener noreferrer">${icon('heart')}<span>Sponsor Hack23 on GitHub</span></a></li>
          <li><a href="https://www.linkedin.com/company/hack23" target="_blank" rel="noopener noreferrer">${icon('linkedin')}<span>${linkedinLabel}</span></a></li>
          <li><a href="https://github.com/Hack23/cia" target="_blank" rel="noopener noreferrer">${icon('github')}<span>Citizen Intelligence Agency</span></a></li>
          <li><a href="https://github.com/Hack23/riksdagsmonitor" target="_blank" rel="noopener noreferrer">${icon('github')}<span>Riksdagsmonitor</span></a></li>
          <li><a href="https://github.com/Hack23/European-Parliament-MCP-Server" target="_blank" rel="noopener noreferrer">${icon('github')}<span>European Parliament MCP Server</span></a></li>
          <li><a href="https://github.com/Hack23/cia-compliance-manager" target="_blank" rel="noopener noreferrer">${icon('github')}<span>CIA Compliance Manager</span></a></li>
          <li><a href="https://github.com/Hack23/homepage" target="_blank" rel="noopener noreferrer">${icon('github')}<span>Hack23 Homepage</span></a></li>
          <li><a href="https://github.com/Hack23/blacktrigram" target="_blank" rel="noopener noreferrer">${icon('github')}<span>Black Trigram</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Public ISMS</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>${securityLabel}</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Secure Development Policy</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md" target="_blank" rel="noopener noreferrer">${icon('book')}<span>Open Source Policy</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md" target="_blank" rel="noopener noreferrer">${icon('book')}<span>AI Policy</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Access Control Policy</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Cryptography Policy</span></a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Security Policy</span></a></li>
          <li><a href="https://hack23.com/privacy.html" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Privacy Policy</span></a></li>
          <li><a href="mailto:james@hack23.com">${icon('mail')}<span>${contactLabel}</span></a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>${icon('lang')} ${languagesHeading}</h3>
        <div class="language-grid">
          ${langGrid}
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2008-${year} <a href="https://hack23.com" target="_blank" rel="noopener noreferrer">Hack23 AB</a> (Org.nr 5595347807) | Gothenburg, Sweden | ${buildLine}</p>
      <p class="footer-disclaimer"><span aria-hidden="true">⚠️</span> ${disclaimerText} <a href="https://github.com/Hack23/euparliamentmonitor/issues" target="_blank" rel="noopener noreferrer">${reportIssuesLabel}</a>.</p>
    </div>
  </footer>`;
}
