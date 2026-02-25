// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ALL_LANGUAGES, LANGUAGE_FLAGS, LANGUAGE_NAMES, ARTICLE_TYPE_LABELS, READ_TIME_LABELS, BACK_TO_NEWS_LABELS, SKIP_LINK_TEXTS, getLocalizedString, getTextDirection, } from '../constants/languages.js';
import { escapeHTML, isSafeURL } from '../utils/file-utils.js';
/**
 * Build the article language switcher nav HTML.
 * Links to the same article in all 14 languages using the filename pattern {date}-{slug}-{lang}.html.
 *
 * @param date - Article date (YYYY-MM-DD)
 * @param slug - Article slug
 * @param currentLang - Active language code
 * @returns HTML string
 */
function buildArticleLangSwitcher(date, slug, currentLang) {
    return ALL_LANGUAGES.map((code) => {
        const flag = getLocalizedString(LANGUAGE_FLAGS, code);
        const name = getLocalizedString(LANGUAGE_NAMES, code);
        const active = code === currentLang ? ' active' : '';
        const href = `${date}-${slug}-${code}.html`;
        return `<a href="${href}" class="lang-link${active}" hreflang="${code}" lang="${code}" title="${name}">${flag} ${code.toUpperCase()}</a>`;
    }).join('\n        ');
}
/**
 * Build the language grid for the article footer.
 *
 * @param currentLang - Active language code
 * @returns HTML string for the language grid
 */
function buildArticleFooterLanguageGrid(currentLang) {
    return ALL_LANGUAGES.map((code) => {
        const flag = getLocalizedString(LANGUAGE_FLAGS, code);
        const name = getLocalizedString(LANGUAGE_NAMES, code);
        const href = code === 'en' ? '../index.html' : `../index-${code}.html`;
        const active = code === currentLang ? ' class="active"' : '';
        return `<a href="${href}"${active} hreflang="${code}">${flag} ${name}</a>`;
    }).join('\n            ');
}
/**
 * Generate complete HTML for a news article
 *
 * @param options - Article generation options
 * @returns Complete HTML document string
 */
export function generateArticleHTML(options) {
    const { slug, title, subtitle, date, category, readTime, lang, content, keywords = [], sources = [], } = options;
    const dir = getTextDirection(lang);
    const year = new Date().getFullYear();
    // Format date for display
    const displayDate = new Date(date).toLocaleDateString(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const languageName = getLocalizedString(LANGUAGE_NAMES, lang);
    const categoryLabels = getLocalizedString(ARTICLE_TYPE_LABELS, lang);
    const categoryLabel = categoryLabels[category] ?? category;
    const readTimeFormatter = getLocalizedString(READ_TIME_LABELS, lang);
    const readTimeLabel = readTimeFormatter(readTime);
    const backLabel = getLocalizedString(BACK_TO_NEWS_LABELS, lang);
    const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, lang);
    const indexHref = lang === 'en' ? '../index.html' : `../index-${lang}.html`;
    // Escape values for safe HTML embedding
    const safeTitle = escapeHTML(title);
    const safeSubtitle = escapeHTML(subtitle);
    const safeKeywords = keywords.map((k) => escapeHTML(k)).join(', ');
    const safeCategoryLabel = escapeHTML(categoryLabel);
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
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="no-referrer">
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
  <a href="#main" class="skip-link">${skipLinkText}</a>

  <header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="${indexHref}" class="site-header__brand" aria-label="EU Parliament Monitor">
        <span class="site-header__flag" aria-hidden="true">🇪🇺</span>
        <span>
          <span class="site-header__title">EU Parliament Monitor</span>
          <span class="site-header__subtitle">European Parliament Intelligence</span>
        </span>
      </a>
    </div>
  </header>

  <nav class="language-switcher" role="navigation" aria-label="Language selection">
    ${buildArticleLangSwitcher(date, slug, lang)}
  </nav>

  <nav class="article-top-nav">
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
    
    ${renderSourcesSection(sources)}
    
    <nav class="article-nav">
      <a href="${indexHref}" class="back-to-news">${backLabel}</a>
    </nav>
  </article>
  </main>

  <footer class="site-footer" role="contentinfo">
    <div class="footer-content">
      <div class="footer-section">
        <h3>About EU Parliament Monitor</h3>
        <p>European Parliament Intelligence Platform — monitoring political activity with systematic transparency. Powered by European Parliament open data.</p>
      </div>
      <div class="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="../index.html">Home</a></li>
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
          ${buildArticleFooterLanguageGrid(lang)}
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