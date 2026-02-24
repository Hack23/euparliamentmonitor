// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { LANGUAGE_NAMES, ARTICLE_TYPE_LABELS, READ_TIME_LABELS, BACK_TO_NEWS_LABELS, getLocalizedString, getTextDirection, } from '../constants/languages.js';
import { escapeHTML, isSafeURL } from '../utils/file-utils.js';
/**
 * Generate complete HTML for a news article
 *
 * @param options - Article generation options
 * @returns Complete HTML document string
 */
export function generateArticleHTML(options) {
    const { slug: _slug, title, subtitle, date, type, readTime, lang, content, keywords = [], sources = [], } = options;
    const dir = getTextDirection(lang);
    // Format date for display
    const displayDate = new Date(date).toLocaleDateString(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const languageName = getLocalizedString(LANGUAGE_NAMES, lang);
    const typeLabels = getLocalizedString(ARTICLE_TYPE_LABELS, lang);
    const typeLabel = typeLabels[type] ?? type;
    const readTimeFormatter = getLocalizedString(READ_TIME_LABELS, lang);
    const readTimeLabel = readTimeFormatter(readTime);
    const backLabel = getLocalizedString(BACK_TO_NEWS_LABELS, lang);
    // Escape values for safe HTML embedding
    const safeTitle = escapeHTML(title);
    const safeSubtitle = escapeHTML(subtitle);
    const safeKeywords = keywords.map((k) => escapeHTML(k)).join(', ');
    const safeTypeLabel = escapeHTML(typeLabel);
    // Build JSON-LD as object for safe serialization
    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: title,
        description: subtitle,
        datePublished: date,
        inLanguage: lang,
        author: {
            '@type': 'Organization',
            name: 'EU Parliament Monitor',
        },
        publisher: {
            '@type': 'Organization',
            name: 'EU Parliament Monitor',
            url: 'https://euparliamentmonitor.com',
        },
        keywords: keywords.join(', '),
    }, null, 4);
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} | EU Parliament Monitor</title>
  <meta name="description" content="${safeSubtitle}">
  <meta name="keywords" content="${safeKeywords}">
  <meta name="author" content="EU Parliament Monitor">
  <meta name="date" content="${date}">
  <meta name="article:published_time" content="${date}">
  <meta name="article:author" content="EU Parliament Monitor">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeSubtitle}">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${lang}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeSubtitle}">
  
  <link rel="stylesheet" href="../styles.css">
  
  <!-- Schema.org structured data -->
  <script type="application/ld+json">
  ${jsonLd}
  </script>
</head>
<body>
  <article class="news-article" lang="${lang}">
    <header class="article-header">
      <div class="article-meta">
        <span class="article-type">${safeTypeLabel}</span>
        <span class="article-date">${displayDate}</span>
        <span class="article-read-time">${readTimeLabel}</span>
        <span class="article-lang">${languageName}</span>
      </div>
      <h1>${safeTitle}</h1>
      <p class="article-subtitle">${safeSubtitle}</p>
    </header>
    
    ${content}
    
    ${renderSourcesSection(sources)}
    
    <nav class="article-nav">
      <a href="../${lang === 'en' ? 'index.html' : `index-${lang}.html`}" class="back-to-news">${backLabel}</a>
    </nav>
  </article>
</body>
</html>`;
}
/**
 * Render the sources section if sources are provided
 *
 * @param sources - Article source references
 * @returns HTML string for sources section or empty string
 */
function renderSourcesSection(sources) {
    if (sources.length === 0) {
        return '';
    }
    return `
    <footer class="article-footer">
      <section class="article-sources">
        <h2>Sources</h2>
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
    </footer>
    `;
}
//# sourceMappingURL=article-template.js.map