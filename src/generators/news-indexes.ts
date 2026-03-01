#!/usr/bin/env node

// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/NewsIndexes
 * @description Generates index.html files for each language listing all news articles.
 * English is the primary homepage (index.html), other languages use index-{lang}.html.
 * Design follows riksdagsmonitor patterns: compact language switcher, Hack23 AB footer.
 */

import fs from 'fs';
import path, { resolve } from 'path';
import { pathToFileURL } from 'url';
import { PROJECT_ROOT, APP_VERSION, NEWS_DIR } from '../constants/config.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  PAGE_TITLES,
  PAGE_DESCRIPTIONS,
  SECTION_HEADINGS,
  NO_ARTICLES_MESSAGES,
  SKIP_LINK_TEXTS,
  getLocalizedString,
  getTextDirection,
} from '../constants/languages.js';
import {
  getNewsArticles,
  groupArticlesByLanguage,
  formatSlug,
  parseArticleFilename,
  extractArticleMeta,
  escapeHTML,
} from '../utils/file-utils.js';
import { writeMetadataDatabase } from '../utils/news-metadata.js';
import type { ParsedArticle } from '../types/index.js';
import { ArticleCategory } from '../types/index.js';

/**
 * Default category for articles that don't match specific patterns.
 */
const DEFAULT_CATEGORY = ArticleCategory.WEEK_AHEAD;

/**
 * Detect the article category from a slug.
 * Returns the matching ArticleCategory value used for badge/accent colours.
 *
 * @param slug - Hyphenated slug string
 * @returns ArticleCategory value string
 */
function detectCategory(slug: string): string {
  const s = slug.toLowerCase();
  if (s.includes('week-ahead')) return ArticleCategory.WEEK_AHEAD;
  if (s.includes('month-ahead')) return ArticleCategory.MONTH_AHEAD;
  if (s.includes('year-ahead')) return ArticleCategory.YEAR_AHEAD;
  if (s.includes('week-in-review')) return ArticleCategory.WEEK_IN_REVIEW;
  if (s.includes('month-in-review')) return ArticleCategory.MONTH_IN_REVIEW;
  if (s.includes('year-in-review')) return ArticleCategory.YEAR_IN_REVIEW;
  if (s.includes('committee')) return ArticleCategory.COMMITTEE_REPORTS;
  if (s.includes('motion') || s.includes('vote') || s.includes('voting'))
    return ArticleCategory.MOTIONS;
  if (s.includes('propos') || s.includes('legislat')) return ArticleCategory.PROPOSITIONS;
  if (s.includes('breaking') || s.includes('urgent')) return ArticleCategory.BREAKING_NEWS;
  if (s.includes('deep-analysis') || s.includes('5-whys')) return ArticleCategory.DEEP_ANALYSIS;
  return DEFAULT_CATEGORY;
}

/**
 * Get the index filename for a given language code.
 * English uses index.html (the primary homepage), others use index-{lang}.html.
 *
 * @param lang - Language code
 * @returns Filename string
 */
export function getIndexFilename(lang: string): string {
  return lang === 'en' ? 'index.html' : `index-${lang}.html`;
}

/**
 * Build the compact language switcher nav HTML.
 * Uses flag emoji + language code, riksdagsmonitor style.
 *
 * @param currentLang - Active language code
 * @returns HTML string
 */
function buildLangSwitcher(currentLang: string): string {
  return ALL_LANGUAGES.map((code) => {
    const flag = getLocalizedString(LANGUAGE_FLAGS, code);
    const name = getLocalizedString(LANGUAGE_NAMES, code);
    const active = code === currentLang ? ' active' : '';
    const href = getIndexFilename(code);
    return `<a href="${href}" class="lang-link${active}" hreflang="${code}" title="${name}">${flag} ${code.toUpperCase()}</a>`;
  }).join('\n        ');
}

/**
 * Build the language grid for the footer.
 *
 * @param currentLang - Active language code
 * @returns HTML string for the language grid
 */
function buildFooterLanguageGrid(currentLang: string): string {
  return ALL_LANGUAGES.map((code) => {
    const flag = getLocalizedString(LANGUAGE_FLAGS, code);
    const name = getLocalizedString(LANGUAGE_NAMES, code);
    const href = getIndexFilename(code);
    const active = code === currentLang ? ' class="active"' : '';
    return `<a href="${href}"${active} hreflang="${code}">${flag} ${name}</a>`;
  }).join('\n            ');
}

/**
 * Render a single news card element.
 *
 * @param article - Parsed article data
 * @param meta - Real title and description extracted from the article HTML
 * @param meta.title - Article title
 * @param meta.description - Article description/excerpt
 * @returns HTML string for one card
 */
function renderCard(article: ParsedArticle, meta: { title: string; description: string }): string {
  const category = detectCategory(article.slug);
  // Sanitize the category for safe use in CSS class names (allow only alphanumeric and hyphens)
  const safeCategory = category.replace(/[^a-z0-9-]/gi, '');
  const title = escapeHTML(meta.title || formatSlug(article.slug));
  const excerpt = meta.description
    ? `\n            <p class="news-card__excerpt">${escapeHTML(meta.description)}</p>`
    : '';

  return `
      <li class="news-card">
        <a href="news/${escapeHTML(article.filename)}" class="news-card__link" lang="${escapeHTML(article.lang)}" hreflang="${escapeHTML(article.lang)}">
          <div class="news-card__accent news-card__accent--${safeCategory}"></div>
          <div class="news-card__body">
            <div class="news-card__meta">
              <span class="news-card__badge news-card__badge--${safeCategory}">${formatSlug(safeCategory)}</span>
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
function buildHreflangTags(): string {
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
export function generateIndexHTML(
  lang: string,
  articles: ParsedArticle[],
  metaMap: Map<string, { title: string; description: string }> = new Map()
): string {
  const title = getLocalizedString(PAGE_TITLES, lang);
  const description = getLocalizedString(PAGE_DESCRIPTIONS, lang);
  const heading = getLocalizedString(SECTION_HEADINGS, lang);
  const noArticlesText = getLocalizedString(NO_ARTICLES_MESSAGES, lang);
  const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, lang);
  const dir = getTextDirection(lang);
  const year = new Date().getFullYear();
  const selfHref = getIndexFilename(lang);
  const heroTitle = title.split(' - ')[0];

  const content =
    articles.length === 0
      ? `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">📰</div>
      <p class="empty-state__text">${noArticlesText}</p>
    </div>`
      : `
    <ul class="news-grid" role="list">
      ${articles
        .map((a) =>
          renderCard(a, metaMap.get(a.filename) ?? { title: formatSlug(a.slug), description: '' })
        )
        .join('\n')}
    </ul>`;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="no-referrer">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${heroTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${lang}">
  ${buildHreflangTags()}
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a href="#main" class="skip-link">${skipLinkText}</a>

  <header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="${selfHref}" class="site-header__brand" aria-label="${heroTitle}">
        <span class="site-header__flag" aria-hidden="true">🇪🇺</span>
        <span>
          <span class="site-header__title">${heroTitle}</span>
          <span class="site-header__subtitle">European Parliament Intelligence</span>
        </span>
      </a>
    </div>
  </header>

  <nav class="language-switcher" role="navigation" aria-label="Language selection">
    ${buildLangSwitcher(lang)}
  </nav>

  <section class="hero">
    <h1 class="hero__title">${heroTitle}</h1>
    <p class="hero__description">${description}</p>
  </section>

  <section class="ai-intelligence" aria-labelledby="ai-heading"${lang !== 'en' ? ' lang="en"' : ''}>
    <h2 id="ai-heading"><span aria-hidden="true">🤖</span> AI-Disrupted News Generation &amp; Agentic Intelligence</h2>
    <blockquote class="ai-intelligence__quote">While traditional newsrooms debate whether AI will replace journalists, EU Parliament Monitor quietly deployed 8 autonomous AI agents that generate investigative political intelligence in 14 languages before most reporters have finished their morning coffee. The future of parliamentary journalism didn&rsquo;t send a memo &mdash; it opened a pull request.</blockquote>
    <p>The EU Parliament Monitor doesn&rsquo;t just report on European Parliament activity &mdash; it autonomously generates deep political intelligence at machine speed, with editorial quality that would make legacy news desks nervous. Every article is researched, written, localized, and prepared for publication by AI agents that operate by default on live European Parliament data via the <strong>MCP Server</strong> (46 tools, real-time data), with transparent fallback to placeholder data when live access is unavailable.</p>
    <ul class="ai-intelligence__features">
      <li><strong>8 Autonomous AI Agents</strong> &mdash; specialized for news, data, frontend, quality, security, docs, DevOps, and product</li>
      <li><strong>14 Languages</strong> &mdash; EN, SV, DA, NO, FI, DE, FR, ES, NL, AR, HE, JA, KO, ZH</li>
      <li><strong>Human-in-the-Loop</strong> &mdash; agents open publication-ready pull requests; publication occurs when a human reviews and merges</li>
      <li><strong>Live Parliament Data</strong> &mdash; powered by European Parliament Open Data via MCP Server</li>
    </ul>
  </section>

  <main id="main" class="site-main">
    <h2 class="section-heading"><span class="section-heading__icon" aria-hidden="true">📋</span> ${heading}</h2>
    ${content}
  </main>

  <footer class="site-footer" role="contentinfo">
    <div class="footer-content">
      <div class="footer-section">
        <h3>About EU Parliament Monitor</h3>
        <p>European Parliament Intelligence Platform — monitoring political activity with systematic transparency. Powered by European Parliament open data.</p>
        <p class="footer-stats">${articles.length} articles available</p>
      </div>
      <div class="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="index.html">Home</a></li>
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
      <p>&copy; 2008-${year} <a href="https://hack23.com">Hack23 AB</a> (Org.nr 5595347807) | Gothenburg, Sweden | v${escapeHTML(APP_VERSION)}</p>
      <p class="footer-disclaimer"><span aria-hidden="true">⚠️</span> This platform is under ongoing improvement. Please <a href="https://github.com/Hack23/euparliamentmonitor/issues">report any issues on GitHub</a>.</p>
    </div>
  </footer>
</body>
</html>`;
}

/**
 * Main execution - generates index files for all languages.
 * English generates index.html (primary homepage), others generate index-{lang}.html.
 */
function main(): void {
  console.log('📰 Generating news indexes...');

  const articles = getNewsArticles();
  console.log(`📊 Found ${articles.length} articles`);

  const grouped = groupArticlesByLanguage(articles, ALL_LANGUAGES);

  // Build metadata map (real titles + descriptions from each article HTML)
  const metaBuildTimerLabel = `⏱️ Built metadata map for ${articles.length} articles`;
  console.time(metaBuildTimerLabel);
  const metaMap = new Map<string, { title: string; description: string }>();
  for (const filename of articles) {
    const filepath = path.join(NEWS_DIR, filename);
    metaMap.set(filename, extractArticleMeta(filepath));
  }
  console.timeEnd(metaBuildTimerLabel);

  // Also update the metadata database, reusing the already-extracted meta to avoid re-reading files
  const dbArticles = articles
    .map((filename) => {
      const parsed = parseArticleFilename(filename);
      if (!parsed) return null;
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
    .filter((e): e is NonNullable<typeof e> => e !== null);
  dbArticles.sort((a, b) => b.date.localeCompare(a.date));
  writeMetadataDatabase({ lastUpdated: new Date().toISOString(), articles: dbArticles });
  console.log('📝 Updated articles metadata database');

  let generated = 0;
  for (const lang of ALL_LANGUAGES) {
    const langArticles = grouped[lang] ?? [];
    const html = generateIndexHTML(lang, langArticles, metaMap);
    const filename = getIndexFilename(lang);
    const filepath = path.join(PROJECT_ROOT, filename);

    fs.writeFileSync(filepath, html, 'utf-8');
    console.log(`  ✅ Generated ${filename} (${langArticles.length} articles)`);
    generated++;
  }

  console.log(`✅ Generated ${generated} index files`);
}

// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
