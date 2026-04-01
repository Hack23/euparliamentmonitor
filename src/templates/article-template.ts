// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Templates/ArticleTemplate
 * @description Generates HTML templates for news articles with proper structure and metadata
 */

import { createHash } from 'crypto';
import type {
  ArticleOptions,
  ArticleSource,
  ArticleCategoryLabels,
  LanguageCode,
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
  SKIP_LINK_TEXTS,
  SOURCES_HEADING_LABELS,
  HEADER_SUBTITLE_LABELS,
  THEME_TOGGLE_LABELS,
  FOOTER_ABOUT_HEADING_LABELS,
  FOOTER_ABOUT_TEXT_LABELS,
  FOOTER_QUICK_LINKS_LABELS,
  FOOTER_BUILT_BY_LABELS,
  FOOTER_LANGUAGES_LABELS,
  getLocalizedString,
  getTextDirection,
} from '../constants/languages.js';
import { escapeHTML, isSafeURL } from '../utils/file-utils.js';
import {
  APP_VERSION,
  createThemeToggleButton,
  THEME_TOGGLE_SCRIPT,
  THEME_TOGGLE_SCRIPT_CONTENT,
} from '../constants/config.js';

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
 * Build a single footer section with title and content.
 *
 * @param title - Section heading text
 * @param content - Inner HTML content
 * @returns HTML string for one footer section
 */
function buildFooterSection(title: string, content: string): string {
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
function buildArticleFooterLanguageGrid(currentLang: string): string {
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
  } = options;

  const dir = getTextDirection(lang);
  const year = new Date().getFullYear();

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
  const jsonLd = JSON.stringify(
    {
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
    },
    null,
    4
  );

  // Validate and escape stylesHash — only allow valid SRI hash format
  const safeSriAttrs =
    stylesHash && SRI_HASH_PATTERN.test(stylesHash)
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
    
    ${renderAnalysisTransparencySection(date, slug, lang)}
    
    <nav class="article-nav" aria-label="${escapeHTML(articleNavLabel)}">
      <a href="${indexHref}" class="back-to-news">${backLabel}</a>
    </nav>
  </article>
  </main>

  <footer class="site-footer" role="contentinfo">
    <div class="footer-content">
      ${buildFooterSection(footerAboutHeading, `<p>${footerAboutText}</p>`)}
      ${buildFooterSection(
        footerQuickLinksHeading,
        `<ul>
          <li><a href="../index.html">Home</a></li>
          <li><a href="../sitemap.html">Sitemap</a></li>
          <li><a href="../rss.xml">RSS Feed</a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor">GitHub Repository</a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/LICENSE">Apache-2.0 License</a></li>
          <li><a href="https://www.europarl.europa.eu/">European Parliament</a></li>
        </ul>`
      )}
      ${buildFooterSection(
        footerBuiltByHeading,
        `<ul>
          <li><a href="https://hack23.com">hack23.com</a></li>
          <li><a href="https://www.linkedin.com/company/hack23">LinkedIn</a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC">Security &amp; Privacy Policy</a></li>
          <li><a href="mailto:james@hack23.com">Contact</a></li>
        </ul>`
      )}
      ${buildFooterSection(
        footerLanguagesHeading,
        `<div class="language-grid">
          ${buildArticleFooterLanguageGrid(lang)}
        </div>`
      )}
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
  </script>${
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
  }${THEME_TOGGLE_SCRIPT}
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

/** Labels for the "Analysis & Transparency" section heading */
const ANALYSIS_TRANSPARENCY_LABELS: LanguageMap = {
  en: 'Analysis & Transparency',
  sv: 'Analys & transparens',
  da: 'Analyse & gennemsigtighed',
  no: 'Analyse & åpenhet',
  fi: 'Analyysi & avoimuus',
  de: 'Analyse & Transparenz',
  fr: 'Analyse & transparence',
  es: 'Análisis y transparencia',
  nl: 'Analyse & transparantie',
  ar: 'التحليل والشفافية',
  he: 'ניתוח ושקיפות',
  ja: '分析と透明性',
  ko: '분석 및 투명성',
  zh: '分析与透明度',
};

/** Labels for analysis summary link */
const ANALYSIS_SUMMARY_LABELS: LanguageMap = {
  en: 'Analysis Summary',
  sv: 'Analyssammanfattning',
  da: 'Analyseoversigt',
  no: 'Analyseoppsummering',
  fi: 'Analyysiyhteenveto',
  de: 'Analyseübersicht',
  fr: "Résumé de l'analyse",
  es: 'Resumen del análisis',
  nl: 'Analyseoverzicht',
  ar: 'ملخص التحليل',
  he: 'סיכום ניתוח',
  ja: '分析概要',
  ko: '분석 요약',
  zh: '分析摘要',
};

/** Labels for methodology link */
const METHODOLOGY_LABELS: LanguageMap = {
  en: 'Methodology',
  sv: 'Metodik',
  da: 'Metodik',
  no: 'Metodikk',
  fi: 'Menetelmä',
  de: 'Methodik',
  fr: 'Méthodologie',
  es: 'Metodología',
  nl: 'Methodologie',
  ar: 'المنهجية',
  he: 'מתודולוגיה',
  ja: '方法論',
  ko: '방법론',
  zh: '方法论',
};

/** Localized transparency disclosure text */
const TRANSPARENCY_DISCLOSURE_LABELS: LanguageMap = {
  en: 'This article was generated using AI-driven political intelligence analysis. All analytical content is produced by AI following structured methodologies, while scripts handle only data formatting and HTML rendering.',
  sv: 'Denna artikel genererades med AI-driven politisk underrättelseanalys. Allt analytiskt innehåll produceras av AI enligt strukturerade metoder, medan skript bara hanterar dataformatering och HTML-rendering.',
  da: 'Denne artikel blev genereret ved hjælp af AI-drevet politisk efterretningsanalyse. Alt analytisk indhold produceres af AI efter strukturerede metoder, mens scripts kun håndterer dataformatering og HTML-rendering.',
  no: 'Denne artikkelen ble generert ved hjelp av AI-drevet politisk etterretningsanalyse. Alt analytisk innhold produseres av AI etter strukturerte metoder, mens skript bare håndterer dataformatering og HTML-rendering.',
  fi: 'Tämä artikkeli luotiin tekoälypohjaisella poliittisella tiedusteluanalyysillä. Kaikki analyyttinen sisältö tuotetaan tekoälyllä strukturoituja menetelmiä noudattaen, kun taas skriptit hoitavat vain datan muotoilun ja HTML-renderöinnin.',
  de: 'Dieser Artikel wurde mithilfe KI-gestützter politischer Geheimdienstanalyse erstellt. Alle analytischen Inhalte werden von KI nach strukturierten Methoden erstellt, während Skripte nur die Datenformatierung und HTML-Darstellung übernehmen.',
  fr: "Cet article a été généré à l'aide d'une analyse de renseignement politique pilotée par l'IA. Tout le contenu analytique est produit par l'IA selon des méthodologies structurées, tandis que les scripts ne gèrent que le formatage des données et le rendu HTML.",
  es: 'Este artículo fue generado utilizando análisis de inteligencia política impulsado por IA. Todo el contenido analítico es producido por IA siguiendo metodologías estructuradas, mientras que los scripts solo manejan el formateo de datos y la representación HTML.',
  nl: 'Dit artikel is gegenereerd met behulp van AI-gestuurde politieke inlichtingenanalyse. Alle analytische inhoud wordt geproduceerd door AI volgens gestructureerde methodologieën, terwijl scripts alleen gegevensopmaak en HTML-weergave afhandelen.',
  ar: 'تم إنشاء هذه المقالة باستخدام تحليل استخباراتي سياسي مدعوم بالذكاء الاصطناعي. يتم إنتاج جميع المحتويات التحليلية بواسطة الذكاء الاصطناعي وفقاً لمنهجيات منظمة، بينما تتولى البرامج النصية فقط تنسيق البيانات وعرض HTML.',
  he: 'מאמר זה נוצר באמצעות ניתוח מודיעין פוליטי מונע בינה מלאכותית. כל התוכן האנליטי מיוצר על ידי בינה מלאכותית בהתאם למתודולוגיות מובנות, בעוד שסקריפטים מטפלים רק בעיצוב נתונים ורינדור HTML.',
  ja: 'この記事はAI駆動の政治インテリジェンス分析を使用して生成されました。すべての分析コンテンツは構造化された方法論に従ってAIによって作成され、スクリプトはデータフォーマットとHTMLレンダリングのみを処理します。',
  ko: '이 기사는 AI 기반 정치 인텔리전스 분석을 사용하여 생성되었습니다. 모든 분석 콘텐츠는 구조화된 방법론에 따라 AI가 생산하며, 스크립트는 데이터 포맷팅과 HTML 렌더링만 처리합니다.',
  zh: '本文使用人工智能驱动的政治情报分析生成。所有分析内容均由人工智能按照结构化方法论产生，而脚本仅处理数据格式化和HTML渲染。',
};

/** Localized analysis category labels */
const CLASSIFICATION_ANALYSIS_LABELS: LanguageMap = {
  en: 'Classification Analysis', sv: 'Klassificeringsanalys', da: 'Klassifikationsanalyse',
  no: 'Klassifiseringsanalyse', fi: 'Luokitteluanalyysi', de: 'Klassifizierungsanalyse',
  fr: 'Analyse de classification', es: 'Análisis de clasificación', nl: 'Classificatieanalyse',
  ar: 'تحليل التصنيف', he: 'ניתוח סיווג', ja: '分類分析', ko: '분류 분석', zh: '分类分析',
};

const THREAT_ASSESSMENT_LABELS: LanguageMap = {
  en: 'Threat Assessment', sv: 'Hotbedömning', da: 'Trusselsvurdering',
  no: 'Trusselvurdering', fi: 'Uhka-arviointi', de: 'Bedrohungsbewertung',
  fr: 'Évaluation des menaces', es: 'Evaluación de amenazas', nl: 'Dreigingsbeoordeling',
  ar: 'تقييم التهديدات', he: 'הערכת איומים', ja: '脅威評価', ko: '위협 평가', zh: '威胁评估',
};

const RISK_SCORING_LABELS: LanguageMap = {
  en: 'Risk Scoring', sv: 'Riskbedömning', da: 'Risikovurdering',
  no: 'Risikovurdering', fi: 'Riskinarviointi', de: 'Risikobewertung',
  fr: 'Évaluation des risques', es: 'Evaluación de riesgos', nl: 'Risicobeoordeling',
  ar: 'تقييم المخاطر', he: 'דירוג סיכונים', ja: 'リスク評価', ko: '위험 평가', zh: '风险评分',
};

const DEEP_ANALYSIS_LABELS: LanguageMap = {
  en: 'Deep Analysis', sv: 'Djupanalys', da: 'Dybdeanalyse',
  no: 'Dybdeanalyse', fi: 'Syväanalyysi', de: 'Tiefenanalyse',
  fr: 'Analyse approfondie', es: 'Análisis profundo', nl: 'Diepgaande analyse',
  ar: 'التحليل المعمق', he: 'ניתוח מעמיק', ja: '深層分析', ko: '심층 분석', zh: '深度分析',
};

const VIEW_SOURCE_LABELS: LanguageMap = {
  en: 'View source code on GitHub', sv: 'Visa källkod på GitHub', da: 'Se kildekode på GitHub',
  no: 'Se kildekode på GitHub', fi: 'Näytä lähdekoodi GitHubissa', de: 'Quellcode auf GitHub anzeigen',
  fr: 'Voir le code source sur GitHub', es: 'Ver código fuente en GitHub', nl: 'Broncode bekijken op GitHub',
  ar: 'عرض الكود المصدري على GitHub', he: 'הצג קוד מקור ב-GitHub', ja: 'GitHubでソースコードを表示',
  ko: 'GitHub에서 소스 코드 보기', zh: '在GitHub上查看源代码',
};

const OPEN_SOURCE_NOTE_LABELS: LanguageMap = {
  en: 'Apache-2.0 licensed open-source project', sv: 'Apache-2.0-licensierat projekt med öppen källkod',
  da: 'Apache-2.0-licenseret open source-projekt', no: 'Apache-2.0-lisensiert åpen kildekode-prosjekt',
  fi: 'Apache-2.0-lisensoitu avoimen lähdekoodin projekti', de: 'Apache-2.0-lizenziertes Open-Source-Projekt',
  fr: 'Projet open source sous licence Apache-2.0', es: 'Proyecto de código abierto con licencia Apache-2.0',
  nl: 'Apache-2.0-gelicenseerd open-sourceproject', ar: 'مشروع مفتوح المصدر بترخيص Apache-2.0',
  he: 'פרויקט קוד פתוח ברישיון Apache-2.0', ja: 'Apache-2.0ライセンスのオープンソースプロジェクト',
  ko: 'Apache-2.0 라이센스 오픈 소스 프로젝트', zh: 'Apache-2.0 许可的开源项目',
};

/**
 * Render the analysis transparency section with links to analysis artifacts and methodology
 *
 * @param date - Article date (YYYY-MM-DD)
 * @param slug - Article type slug (e.g., 'committee-reports', 'breaking')
 * @param lang - Language code
 * @returns HTML string for analysis transparency section
 */
function renderAnalysisTransparencySection(date: string, slug: string, lang: LanguageCode): string {
  const safeDate = escapeHTML(date);
  const safeSlug = escapeHTML(slug);
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

  const repoBase = 'https://github.com/Hack23/euparliamentmonitor/blob/main';
  const analysisDir = `${repoBase}/analysis/${safeDate}/${safeSlug}`;
  const methodologyDir = `${repoBase}/analysis/methodologies`;

  return `
    <section class="analysis-transparency" aria-label="${heading}">
      <h2>${heading}</h2>
      <p>${disclosure}</p>
      <nav class="analysis-links" aria-label="${analysisSummaryLabel}">
        <ul>
          <li><a href="${analysisDir}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">📊</span> ${analysisSummaryLabel}</a></li>
          <li><a href="${analysisDir}/classification" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🏷️</span> ${classificationLabel}</a></li>
          <li><a href="${analysisDir}/threat-assessment" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🛡️</span> ${threatLabel}</a></li>
          <li><a href="${analysisDir}/risk-scoring" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">⚖️</span> ${riskLabel}</a></li>
          <li><a href="${analysisDir}/existing" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🔍</span> ${deepLabel}</a></li>
        </ul>
      </nav>
      <nav class="methodology-links" aria-label="${methodologyLabel}">
        <h3>${methodologyLabel}</h3>
        <ul>
          <li><a href="${methodologyDir}/ai-driven-analysis-guide.md" target="_blank" rel="noopener noreferrer">AI-Driven Analysis Guide</a></li>
          <li><a href="${methodologyDir}/political-swot-framework.md" target="_blank" rel="noopener noreferrer">Political SWOT Framework</a></li>
          <li><a href="${methodologyDir}/political-risk-methodology.md" target="_blank" rel="noopener noreferrer">Political Risk Methodology</a></li>
          <li><a href="${methodologyDir}/political-threat-framework.md" target="_blank" rel="noopener noreferrer">Political Threat Framework</a></li>
          <li><a href="${methodologyDir}/political-classification-guide.md" target="_blank" rel="noopener noreferrer">Political Classification Guide</a></li>
          <li><a href="${methodologyDir}/political-style-guide.md" target="_blank" rel="noopener noreferrer">Political Style Guide</a></li>
        </ul>
      </nav>
      <p class="transparency-note"><a href="https://github.com/Hack23/euparliamentmonitor" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🔓</span> ${viewSourceLabel}</a> — ${openSourceNote}</p>
    </section>
    `;
}
