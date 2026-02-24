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
import { PROJECT_ROOT } from '../constants/config.js';
import { ALL_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS, PAGE_TITLES, PAGE_DESCRIPTIONS, SECTION_HEADINGS, NO_ARTICLES_MESSAGES, getLocalizedString, getTextDirection, } from '../constants/languages.js';
import { getNewsArticles, groupArticlesByLanguage, formatSlug } from '../utils/file-utils.js';
import { updateMetadataDatabase } from '../utils/news-metadata.js';
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
function detectCategory(slug) {
    const s = slug.toLowerCase();
    if (s.includes('week-ahead'))
        return ArticleCategory.WEEK_AHEAD;
    if (s.includes('month-ahead'))
        return ArticleCategory.MONTH_AHEAD;
    if (s.includes('year-ahead'))
        return ArticleCategory.YEAR_AHEAD;
    if (s.includes('week-in-review'))
        return ArticleCategory.WEEK_IN_REVIEW;
    if (s.includes('month-in-review'))
        return ArticleCategory.MONTH_IN_REVIEW;
    if (s.includes('year-in-review'))
        return ArticleCategory.YEAR_IN_REVIEW;
    if (s.includes('committee'))
        return ArticleCategory.COMMITTEE_REPORTS;
    if (s.includes('motion') || s.includes('vote') || s.includes('voting'))
        return ArticleCategory.MOTIONS;
    if (s.includes('propos') || s.includes('legislat'))
        return ArticleCategory.PROPOSITIONS;
    if (s.includes('breaking') || s.includes('urgent'))
        return ArticleCategory.BREAKING_NEWS;
    if (s.includes('deep-analysis') || s.includes('5-whys'))
        return ArticleCategory.DEEP_ANALYSIS;
    return DEFAULT_CATEGORY;
}
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
        return `<a href="${href}" class="lang-link${active}" hreflang="${code}" title="${name}">${flag} ${code.toUpperCase()}</a>`;
    }).join('\n        ');
}
/**
 * Build the language grid for the footer.
 *
 * @param currentLang - Active language code
 * @returns HTML string for the language grid
 */
function buildFooterLanguageGrid(currentLang) {
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
 * @returns HTML string for one card
 */
function renderCard(article) {
    const category = detectCategory(article.slug);
    const title = formatSlug(article.slug);
    return `
      <li class="news-card">
        <a href="news/${article.filename}" class="news-card__link">
          <div class="news-card__accent news-card__accent--${category}"></div>
          <div class="news-card__body">
            <div class="news-card__meta">
              <span class="news-card__badge news-card__badge--${category}">${category.replace('-', ' ')}</span>
              <time class="news-card__date" datetime="${article.date}">${article.date}</time>
            </div>
            <h3 class="news-card__title">${title}</h3>
          </div>
        </a>
      </li>`;
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
 * @returns Complete HTML document
 */
export function generateIndexHTML(lang, articles) {
    const title = getLocalizedString(PAGE_TITLES, lang);
    const description = getLocalizedString(PAGE_DESCRIPTIONS, lang);
    const heading = getLocalizedString(SECTION_HEADINGS, lang);
    const noArticlesText = getLocalizedString(NO_ARTICLES_MESSAGES, lang);
    const dir = getTextDirection(lang);
    const year = new Date().getFullYear();
    const selfHref = getIndexFilename(lang);
    const content = articles.length === 0
        ? `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">📰</div>
      <p class="empty-state__text">${noArticlesText}</p>
    </div>`
        : `
    <ul class="news-grid" role="list">
      ${articles.map(renderCard).join('\n')}
    </ul>`;
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="${selfHref}" class="site-header__brand" aria-label="EU Parliament Monitor">
        <span class="site-header__flag" aria-hidden="true">🇪🇺</span>
        <span>
          <span class="site-header__title">EU Parliament Monitor</span>
          <span class="site-header__subtitle">European Parliament Intelligence</span>
        </span>
      </a>
    </div>
  </header>

  <nav class="language-switcher" role="navigation" aria-label="Language selection">
    ${buildLangSwitcher(lang)}
  </nav>

  <section class="hero">
    <h1 class="hero__title">${title}</h1>
    <p class="hero__description">${description}</p>
  </section>

  <main class="site-main">
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
      <p>&copy; 2008-${year} <a href="https://hack23.com">Hack23 AB</a> (Org.nr 5595347807) | Gothenburg, Sweden</p>
    </div>
  </footer>
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
    // Also update the metadata database
    updateMetadataDatabase();
    console.log('📝 Updated articles metadata database');
    let generated = 0;
    for (const lang of ALL_LANGUAGES) {
        const langArticles = grouped[lang] ?? [];
        const html = generateIndexHTML(lang, langArticles);
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
//# sourceMappingURL=news-indexes.js.map