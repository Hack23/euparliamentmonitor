#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/NewsIndexes
 * @description Generates index.html files for each language listing all news articles
 */
import fs from 'fs';
import path, { resolve } from 'path';
import { pathToFileURL } from 'url';
import { PROJECT_ROOT } from '../constants/config.js';
import { ALL_LANGUAGES, LANGUAGE_NAMES, PAGE_TITLES, PAGE_DESCRIPTIONS, SECTION_HEADINGS, NO_ARTICLES_MESSAGES, getLocalizedString, getTextDirection, } from '../constants/languages.js';
import { getNewsArticles, groupArticlesByLanguage, formatSlug } from '../utils/file-utils.js';
import { updateMetadataDatabase } from '../utils/news-metadata.js';
/**
 * Generate index HTML for a language
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
    const languageName = getLocalizedString(LANGUAGE_NAMES, lang);
    const dir = getTextDirection(lang);
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
  <header>
    <h1>${title}</h1>
    <p class="language-indicator">${languageName}</p>
  </header>
  
  <main>
    <section class="news-list">
      <h2>${heading}</h2>
      ${articles.length === 0
        ? `<p>${noArticlesText}</p>`
        : `
      <ul class="article-list">
        ${articles
            .map((article) => `
        <li class="article-item">
          <a href="news/${article.filename}">
            <span class="article-date">${article.date}</span>
            <span class="article-title">${formatSlug(article.slug)}</span>
          </a>
        </li>
        `)
            .join('\n        ')}
      </ul>
      `}
    </section>
  </main>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} EU Parliament Monitor</p>
  </footer>
</body>
</html>`;
}
/**
 * Main execution - generates index files for all languages
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
        const filename = `index-${lang}.html`;
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