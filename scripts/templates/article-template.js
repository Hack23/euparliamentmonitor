// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Templates/ArticleTemplate
 * @description Generates HTML templates for news articles with proper structure and metadata
 */
import { createHash } from 'crypto';
import { ALL_LANGUAGES, LANGUAGE_FLAGS, LANGUAGE_NAMES, ARTICLE_TYPE_LABELS, READ_TIME_LABELS, BACK_TO_NEWS_LABELS, ARTICLE_NAV_LABELS, SKIP_LINK_TEXTS, SOURCES_HEADING_LABELS, HEADER_SUBTITLE_LABELS, THEME_TOGGLE_LABELS, FOOTER_ABOUT_HEADING_LABELS, FOOTER_ABOUT_TEXT_LABELS, FOOTER_QUICK_LINKS_LABELS, FOOTER_BUILT_BY_LABELS, FOOTER_LANGUAGES_LABELS, ANALYSIS_TRANSPARENCY_LABELS, ANALYSIS_SUMMARY_LABELS, METHODOLOGY_LABELS, TRANSPARENCY_DISCLOSURE_LABELS, CLASSIFICATION_ANALYSIS_LABELS, THREAT_ASSESSMENT_LABELS, RISK_SCORING_LABELS, DEEP_ANALYSIS_LABELS, VIEW_SOURCE_LABELS, OPEN_SOURCE_NOTE_LABELS, AI_ANALYSIS_GUIDE_LABELS, SWOT_FRAMEWORK_LABELS, RISK_METHODOLOGY_LABELS, THREAT_FRAMEWORK_LABELS, CLASSIFICATION_GUIDE_LABELS, STYLE_GUIDE_LABELS, SIGNIFICANCE_SCORING_LABELS, ACTOR_MAPPING_LABELS, FORCES_ANALYSIS_LABELS, IMPACT_MATRIX_LABELS, POLITICAL_THREAT_LANDSCAPE_LABELS, ACTOR_THREAT_PROFILING_LABELS, CONSEQUENCE_TREES_LABELS, LEGISLATIVE_DISRUPTION_LABELS, RISK_MATRIX_LABELS, QUANTITATIVE_SWOT_LABELS, POLITICAL_CAPITAL_RISK_LABELS, LEGISLATIVE_VELOCITY_RISK_LABELS, AGENT_RISK_WORKFLOW_LABELS, STAKEHOLDER_IMPACT_LABELS, COALITION_DYNAMICS_LABELS, VOTING_PATTERNS_LABELS, CROSS_SESSION_INTELLIGENCE_LABELS, getLocalizedString, getTextDirection, } from '../constants/languages.js';
import { escapeHTML, isSafeURL } from '../utils/file-utils.js';
import { APP_VERSION, createThemeToggleButton, THEME_TOGGLE_SCRIPT, THEME_TOGGLE_SCRIPT_CONTENT, } from '../constants/config.js';
/** Pattern for valid article dates (YYYY-MM-DD) */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
/** Pattern for valid article slugs (lowercase letters, digits, hyphens) */
const SLUG_PATTERN = /^[a-z0-9-]+$/u;
/** Pattern for valid SRI integrity hashes (sha256/sha384/sha512 + base64) */
const SRI_HASH_PATTERN = /^sha(?:256|384|512)-[A-Za-z0-9+/]+={0,2}$/u;
/** Words per minute for read-time calculation */
const TEMPLATE_WORDS_PER_MINUTE = 250;
/**
 * BCP47 / Open Graph locale mapping for og:locale meta tag.
 * Maps our 2-letter language codes to proper BCP47 locale strings.
 */
const OG_LOCALE_MAP = {
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
};
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
function buildArticleLangSwitcher(date, slug, currentLang, availableLanguages) {
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
 * Build a single footer section with title and content.
 *
 * @param title - Section heading text
 * @param content - Inner HTML content
 * @returns HTML string for one footer section
 */
function buildFooterSection(title, content) {
    return `<div class="footer-section">
        <h3>${title}</h3>
        ${content}
      </div>`;
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
        const safeName = escapeHTML(getLocalizedString(LANGUAGE_NAMES, code));
        const href = code === 'en' ? '../index.html' : `../index-${code}.html`;
        const active = code === currentLang ? ' class="active"' : '';
        return `<a href="${href}"${active} hreflang="${code}">${flag} ${safeName}</a>`;
    }).join('\n            ');
}
/**
 * Generate complete HTML for a news article
 *
 * @param options - Article generation options
 * @returns Complete HTML document string
 */
export function generateArticleHTML(options) {
    const { slug, title, subtitle, date, category, readTime, lang, content, keywords = [], sources = [], stylesHash, availableLanguages, analysisDir, } = options;
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
    // Auto-compute read-time from content word count if not explicitly set
    const contentWordCount = content
        .replace(/<[^>]+>/gu, ' ')
        .replace(/\s+/gu, ' ')
        .trim()
        .split(' ').length;
    const computedReadTime = Math.max(1, Math.ceil(contentWordCount / TEMPLATE_WORDS_PER_MINUTE));
    const effectiveReadTime = readTime > 0 ? readTime : computedReadTime;
    const readTimeLabel = readTimeFormatter(effectiveReadTime);
    const backLabel = getLocalizedString(BACK_TO_NEWS_LABELS, lang);
    const articleNavLabel = getLocalizedString(ARTICLE_NAV_LABELS, lang);
    const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, lang);
    const headerSubtitle = escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, lang));
    const footerAboutHeading = escapeHTML(getLocalizedString(FOOTER_ABOUT_HEADING_LABELS, lang));
    const footerAboutText = escapeHTML(getLocalizedString(FOOTER_ABOUT_TEXT_LABELS, lang));
    const footerQuickLinksHeading = escapeHTML(getLocalizedString(FOOTER_QUICK_LINKS_LABELS, lang));
    const footerBuiltByHeading = escapeHTML(getLocalizedString(FOOTER_BUILT_BY_LABELS, lang));
    const footerLanguagesHeading = escapeHTML(getLocalizedString(FOOTER_LANGUAGES_LABELS, lang));
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
        dateModified: date,
        inLanguage: lang,
        articleSection: categoryLabel,
        author: {
            '@type': 'Organization',
            name: 'EU Parliament Monitor',
        },
        publisher: {
            '@type': 'Organization',
            name: 'EU Parliament Monitor',
            url: 'https://hack23.github.io/euparliamentmonitor',
        },
        keywords: keywords.join(', '),
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://hack23.github.io/euparliamentmonitor/news/${date}-${slug}-${lang}.html`,
        },
    }, null, 4);
    // Validate and escape stylesHash — only allow valid SRI hash format
    const safeSriAttrs = stylesHash && SRI_HASH_PATTERN.test(stylesHash)
        ? ` integrity="${escapeHTML(stylesHash)}" crossorigin="anonymous"`
        : '';
    // Compute SHA-256 hash of the inline JSON-LD script content for CSP.
    // IMPORTANT: The whitespace here ("\n  " prefix and "\n  " suffix) must exactly
    // match the script tag content in the HTML template below:
    //   <script type="application/ld+json">
    //   ${jsonLd}
    //   </script>
    const jsonLdScriptContent = `\n  ${jsonLd}\n  `;
    const jsonLdHash = `sha256-${createHash('sha256').update(jsonLdScriptContent).digest('base64')}`;
    // Reading-progress script hash — content must exactly match the <script> block.
    const readingProgressScript = `\n  (function(){\n    var bar=document.querySelector('.reading-progress');\n    if(!bar)return;\n    bar.style.display='block';\n    var ticking=false;\n    window.addEventListener('scroll',function(){\n      if(!ticking){\n        window.requestAnimationFrame(function(){\n          var h=document.documentElement;\n          var scrollTop=h.scrollTop||document.body.scrollTop;\n          var scrollHeight=h.scrollHeight-h.clientHeight;\n          bar.style.width=scrollHeight>0?((scrollTop/scrollHeight)*100)+'%':'0%';\n          ticking=false;\n        });\n        ticking=true;\n      }\n    },{passive:true});\n  })();\n  `;
    const readingProgressHash = `sha256-${createHash('sha256').update(readingProgressScript).digest('base64')}`;
    // Theme toggle CSP hash — derived from the shared THEME_TOGGLE_SCRIPT_CONTENT constant
    const themeToggleHash = `sha256-${createHash('sha256').update(THEME_TOGGLE_SCRIPT_CONTENT).digest('base64')}`;
    // Localized theme toggle button
    const themeToggleLabel = escapeHTML(getLocalizedString(THEME_TOGGLE_LABELS, lang));
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' '${jsonLdHash}' '${readingProgressHash}' '${themeToggleHash}'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self'; frame-src 'none'; base-uri 'self'; form-action 'none'">
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
  <meta property="og:url" content="https://hack23.github.io/euparliamentmonitor/news/${date}-${slug}-${lang}.html">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${OG_LOCALE_MAP[lang] ?? lang}">
  <meta property="og:image" content="https://hack23.github.io/euparliamentmonitor/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="EU Parliament Monitor — AI-Disrupted Parliamentary Intelligence">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeSubtitle}">
  <meta name="twitter:image" content="https://hack23.github.io/euparliamentmonitor/images/og-image.jpg">
  <meta name="twitter:image:alt" content="EU Parliament Monitor — AI-Disrupted Parliamentary Intelligence">
  
  <link rel="canonical" href="https://hack23.github.io/euparliamentmonitor/news/${date}-${slug}-${lang}.html">
  <link rel="stylesheet" href="../styles.css"${safeSriAttrs}>
  
  <!-- Schema.org structured data -->
  <script type="application/ld+json">
  ${jsonLd}
  </script>
</head>
<body>
  <div class="reading-progress" aria-hidden="true"></div>
  <a href="#main" class="skip-link">${skipLinkText}</a>

  <header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="${indexHref}" class="site-header__brand" aria-label="EU Parliament Monitor">
        <picture class="site-header__logo-picture">
          <source srcset="../images/favicon-96x96.webp" type="image/webp">
          <img class="site-header__logo" src="../images/favicon-96x96.png" alt="" width="36" height="36" aria-hidden="true">
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
    
    ${renderAnalysisTransparencySection(date, slug, lang, analysisDir)}
    
    <nav class="article-nav" aria-label="${escapeHTML(articleNavLabel)}">
      <a href="${indexHref}" class="back-to-news">${backLabel}</a>
    </nav>
  </article>
  </main>

  <footer class="site-footer" role="contentinfo">
    <div class="footer-content">
      ${buildFooterSection(footerAboutHeading, `<p>${footerAboutText}</p>`)}
      ${buildFooterSection(footerQuickLinksHeading, `<ul>
          <li><a href="../index.html">Home</a></li>
          <li><a href="../sitemap.html">Sitemap</a></li>
          <li><a href="../rss.xml">RSS Feed</a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor">GitHub Repository</a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/LICENSE">Apache-2.0 License</a></li>
          <li><a href="https://www.europarl.europa.eu/">European Parliament</a></li>
        </ul>`)}
      ${buildFooterSection(footerBuiltByHeading, `<ul>
          <li><a href="https://hack23.com">hack23.com</a></li>
          <li><a href="https://www.linkedin.com/company/hack23">LinkedIn</a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC">Security &amp; Privacy Policy</a></li>
          <li><a href="mailto:james@hack23.com">Contact</a></li>
        </ul>`)}
      ${buildFooterSection(footerLanguagesHeading, `<div class="language-grid">
          ${buildArticleFooterLanguageGrid(lang)}
        </div>`)}
    </div>
    <div class="footer-bottom">
      <p>&copy; 2008-${year} <a href="https://hack23.com">Hack23 AB</a> (Org.nr 5595347807) | Gothenburg, Sweden | v${escapeHTML(APP_VERSION)}</p>
      <p class="footer-disclaimer"><span aria-hidden="true">⚠️</span> This platform is under ongoing improvement. Please <a href="https://github.com/Hack23/euparliamentmonitor/issues">report any issues on GitHub</a>.</p>
    </div>
  </footer>

  <script>
  (function(){
    var bar=document.querySelector('.reading-progress');
    if(!bar)return;
    bar.style.display='block';
    var ticking=false;
    window.addEventListener('scroll',function(){
      if(!ticking){
        window.requestAnimationFrame(function(){
          var h=document.documentElement;
          var scrollTop=h.scrollTop||document.body.scrollTop;
          var scrollHeight=h.scrollHeight-h.clientHeight;
          bar.style.width=scrollHeight>0?((scrollTop/scrollHeight)*100)+'%':'0%';
          ticking=false;
        });
        ticking=true;
      }
    },{passive:true});
  })();
  </script>${content.includes('data-chart-config')
        ? `
  <script src="../js/vendor/chart.umd.min.js" defer></script>
  <script src="../js/vendor/chartjs-plugin-annotation.min.js" defer></script>
  <script src="../js/chart-init.js" defer></script>`
        : ''}${content.includes('mindmap-container') || content.includes('swot-matrix')
        ? `
  <script src="../js/vendor/d3.min.js" defer></script>
  <script src="../js/d3-init.js" defer></script>`
        : ''}${THEME_TOGGLE_SCRIPT}
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
function renderSourcesSection(sources, lang) {
    if (sources.length === 0) {
        return '';
    }
    const sourcesHeading = escapeHTML(getLocalizedString(SOURCES_HEADING_LABELS, lang));
    return `
    <footer class="article-footer">
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
    </footer>
    `;
}
/**
 * Render the analysis transparency section with links to analysis artifacts and methodology
 *
 * @param date - Article date (YYYY-MM-DD)
 * @param slug - Article type slug (e.g., 'committee-reports', 'breaking')
 * @param lang - Language code
 * @param analysisDir - Optional override for analysis directory name (e.g. 'breaking-2' after deduplication)
 * @returns HTML string for analysis transparency section
 */
function renderAnalysisTransparencySection(date, slug, lang, analysisDir) {
    const safeDate = escapeHTML(date);
    // Use the resolved analysis directory name when provided (suffix deduplication),
    // otherwise fall back to the original slug.
    const safeAnalysisDirName = escapeHTML(analysisDir ?? slug);
    const heading = escapeHTML(getLocalizedString(ANALYSIS_TRANSPARENCY_LABELS, lang));
    const analysisSummaryLabel = escapeHTML(getLocalizedString(ANALYSIS_SUMMARY_LABELS, lang));
    const methodologyLabel = escapeHTML(getLocalizedString(METHODOLOGY_LABELS, lang));
    const disclosure = escapeHTML(getLocalizedString(TRANSPARENCY_DISCLOSURE_LABELS, lang));
    const classificationLabel = escapeHTML(getLocalizedString(CLASSIFICATION_ANALYSIS_LABELS, lang));
    const threatLabel = escapeHTML(getLocalizedString(THREAT_ASSESSMENT_LABELS, lang));
    const riskLabel = escapeHTML(getLocalizedString(RISK_SCORING_LABELS, lang));
    const deepLabel = escapeHTML(getLocalizedString(DEEP_ANALYSIS_LABELS, lang));
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
    const analysisDirUrl = `${treeDirBase}/analysis/${safeDate}/${safeAnalysisDirName}`;
    const analysisFileBase = `${repoBase}/analysis/${safeDate}/${safeAnalysisDirName}`;
    const methodologyDir = `${repoBase}/analysis/methodologies`;
    // Per-file localized link labels
    const significanceLabel = escapeHTML(getLocalizedString(SIGNIFICANCE_SCORING_LABELS, lang));
    const actorMappingLabel = escapeHTML(getLocalizedString(ACTOR_MAPPING_LABELS, lang));
    const forcesLabel = escapeHTML(getLocalizedString(FORCES_ANALYSIS_LABELS, lang));
    const impactMatrixLabel = escapeHTML(getLocalizedString(IMPACT_MATRIX_LABELS, lang));
    const threatLandscapeLabel = escapeHTML(getLocalizedString(POLITICAL_THREAT_LANDSCAPE_LABELS, lang));
    const threatProfilesLabel = escapeHTML(getLocalizedString(ACTOR_THREAT_PROFILING_LABELS, lang));
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
        <h3><span aria-hidden="true">🏷️</span> ${classificationLabel}</h3>
        <ul>
          <li><a href="${analysisFileBase}/classification/significance-scoring.md" target="_blank" rel="noopener noreferrer">${significanceLabel}</a></li>
          <li><a href="${analysisFileBase}/classification/actor-mapping.md" target="_blank" rel="noopener noreferrer">${actorMappingLabel}</a></li>
          <li><a href="${analysisFileBase}/classification/forces-analysis.md" target="_blank" rel="noopener noreferrer">${forcesLabel}</a></li>
          <li><a href="${analysisFileBase}/classification/impact-matrix.md" target="_blank" rel="noopener noreferrer">${impactMatrixLabel}</a></li>
        </ul>
        <h3><span aria-hidden="true">🛡️</span> ${threatLabel}</h3>
        <ul>
          <li><a href="${analysisFileBase}/threat-assessment/political-threat-landscape.md" target="_blank" rel="noopener noreferrer">${threatLandscapeLabel}</a></li>
          <li><a href="${analysisFileBase}/threat-assessment/actor-threat-profiling.md" target="_blank" rel="noopener noreferrer">${threatProfilesLabel}</a></li>
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
        </ul>
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
//# sourceMappingURL=article-template.js.map