#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Sitemap
 * @description Generates sitemap.xml and multi-language sitemap HTML pages
 * for all news articles, index pages, and documentation files.
 */
import fs from 'fs';
import path, { resolve } from 'path';
import { pathToFileURL } from 'url';
import {
  NEWS_DIR,
  BASE_URL,
  PROJECT_ROOT,
  createThemeToggleButton,
  THEME_TOGGLE_SCRIPT,
} from '../constants/config.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  PAGE_TITLES,
  PAGE_DESCRIPTIONS,
  SKIP_LINK_TEXTS,
  HEADER_SUBTITLE_LABELS,
  THEME_TOGGLE_LABELS,
  getLocalizedString,
  getTextDirection,
} from '../constants/languages.js';
import {
  getNewsArticles,
  getModifiedDate,
  parseArticleFilename,
  formatSlug,
  extractArticleMeta,
  escapeHTML,
} from '../utils/file-utils.js';
/** Absolute docs directory under project root */
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');
/**
 * Recursively collect all HTML files under a directory, returning paths
 * relative to the project root.
 *
 * @param dir - Directory to scan
 * @param rootDir - Project root for computing relative paths
 * @returns Array of relative paths (e.g. "docs/api/index.html")
 */
export function collectDocsHtmlFiles(dir, rootDir = PROJECT_ROOT) {
  const results = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectDocsHtmlFiles(fullPath, rootDir));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(path.relative(rootDir, fullPath).replace(/\\/g, '/'));
    }
  }
  return results.sort();
}
/**
 * Generate sitemap XML including index pages, news articles, sitemap HTML pages,
 * and documentation files from the docs/ folder.
 *
 * @param articles - List of article filenames
 * @param docsFiles - Relative paths to docs HTML files (e.g. "docs/api/index.html")
 * @returns Complete sitemap XML string
 */
export function generateSitemap(articles, docsFiles = []) {
  const urls = [];
  const today = new Date().toISOString().split('T')[0];
  // Add home pages for each language
  for (const lang of ALL_LANGUAGES) {
    const filename = lang === 'en' ? 'index.html' : `index-${lang}.html`;
    urls.push({
      loc: `${BASE_URL}/${filename}`,
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0',
    });
  }
  // Add sitemap HTML pages for each language
  for (const lang of ALL_LANGUAGES) {
    const filename = lang === 'en' ? 'sitemap.html' : `sitemap_${lang}.html`;
    urls.push({
      loc: `${BASE_URL}/${filename}`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.5',
    });
  }
  // Add RSS feed
  urls.push({
    loc: `${BASE_URL}/rss.xml`,
    lastmod: today,
    changefreq: 'daily',
    priority: '0.5',
  });
  // Add news articles
  for (const article of articles) {
    const filepath = path.join(NEWS_DIR, article);
    const lastmod = getModifiedDate(filepath);
    urls.push({
      loc: `${BASE_URL}/news/${article}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.8',
    });
  }
  // Add docs HTML files
  for (const relPath of docsFiles) {
    const fullPath = path.join(PROJECT_ROOT, relPath);
    let lastmod = today;
    try {
      lastmod = getModifiedDate(fullPath);
    } catch {
      // Use today if file stat fails
    }
    urls.push({
      loc: `${BASE_URL}/${relPath.replace(/\\/g, '/')}`,
      lastmod,
      changefreq: 'weekly',
      priority: '0.3',
    });
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}
/** Default sitemap title used as English fallback */
const DEFAULT_SITEMAP_TITLE = 'Sitemap';
/** Sitemap page titles per language */
const SITEMAP_TITLES = {
  en: DEFAULT_SITEMAP_TITLE,
  sv: 'Webbplatskarta',
  da: DEFAULT_SITEMAP_TITLE,
  no: 'Nettstedskart',
  fi: 'Sivukartta',
  de: 'Seitenübersicht',
  fr: 'Plan du site',
  es: 'Mapa del sitio',
  nl: DEFAULT_SITEMAP_TITLE,
  ar: 'خريطة الموقع',
  he: 'מפת אתר',
  ja: 'サイトマップ',
  ko: '사이트맵',
  zh: '网站地图',
};
/** Sitemap section headings per language */
const SITEMAP_SECTIONS = {
  en: { news: 'News Articles', docs: 'Documentation', pages: 'Pages' },
  sv: { news: 'Nyhetsartiklar', docs: 'Dokumentation', pages: 'Sidor' },
  da: { news: 'Nyhedsartikler', docs: 'Dokumentation', pages: 'Sider' },
  no: { news: 'Nyhetsartikler', docs: 'Dokumentasjon', pages: 'Sider' },
  fi: { news: 'Uutisartikkelit', docs: 'Dokumentaatio', pages: 'Sivut' },
  de: { news: 'Nachrichtenartikel', docs: 'Dokumentation', pages: 'Seiten' },
  fr: { news: 'Articles de presse', docs: 'Documentation', pages: 'Pages' },
  es: { news: 'Artículos de noticias', docs: 'Documentación', pages: 'Páginas' },
  nl: { news: 'Nieuwsartikelen', docs: 'Documentatie', pages: "Pagina's" },
  ar: { news: 'مقالات إخبارية', docs: 'التوثيق', pages: 'الصفحات' },
  he: { news: 'מאמרי חדשות', docs: 'תיעוד', pages: 'דפים' },
  ja: { news: 'ニュース記事', docs: 'ドキュメント', pages: 'ページ' },
  ko: { news: '뉴스 기사', docs: '문서', pages: '페이지' },
  zh: { news: '新闻文章', docs: '文档', pages: '页面' },
};
/** Documentation section labels per language */
const DOCS_LABELS = {
  en: {
    api: 'API Documentation',
    coverage: 'Code Coverage',
    testResults: 'Test Results',
    docsHome: 'Documentation Home',
  },
  sv: {
    api: 'API-dokumentation',
    coverage: 'Kodtäckning',
    testResults: 'Testresultat',
    docsHome: 'Dokumentationsstart',
  },
  da: {
    api: 'API-dokumentation',
    coverage: 'Kodedækning',
    testResults: 'Testresultater',
    docsHome: 'Dokumentationsstart',
  },
  no: {
    api: 'API-dokumentasjon',
    coverage: 'Kodedekning',
    testResults: 'Testresultater',
    docsHome: 'Dokumentasjonsstart',
  },
  fi: {
    api: 'API-dokumentaatio',
    coverage: 'Koodikattavuus',
    testResults: 'Testitulokset',
    docsHome: 'Dokumentaation etusivu',
  },
  de: {
    api: 'API-Dokumentation',
    coverage: 'Codeabdeckung',
    testResults: 'Testergebnisse',
    docsHome: 'Dokumentationsstart',
  },
  fr: {
    api: 'Documentation API',
    coverage: 'Couverture du code',
    testResults: 'Résultats des tests',
    docsHome: 'Accueil documentation',
  },
  es: {
    api: 'Documentación API',
    coverage: 'Cobertura de código',
    testResults: 'Resultados de pruebas',
    docsHome: 'Inicio de documentación',
  },
  nl: {
    api: 'API-documentatie',
    coverage: 'Codedekking',
    testResults: 'Testresultaten',
    docsHome: 'Documentatiestart',
  },
  ar: {
    api: 'وثائق API',
    coverage: 'تغطية الكود',
    testResults: 'نتائج الاختبار',
    docsHome: 'الصفحة الرئيسية للتوثيق',
  },
  he: {
    api: 'תיעוד API',
    coverage: 'כיסוי קוד',
    testResults: 'תוצאות בדיקות',
    docsHome: 'דף הבית של התיעוד',
  },
  ja: {
    api: 'APIドキュメント',
    coverage: 'コードカバレッジ',
    testResults: 'テスト結果',
    docsHome: 'ドキュメントホーム',
  },
  ko: {
    api: 'API 문서',
    coverage: '코드 커버리지',
    testResults: '테스트 결과',
    docsHome: '문서 홈',
  },
  zh: { api: 'API 文档', coverage: '代码覆盖率', testResults: '测试结果', docsHome: '文档首页' },
};
/**
 * Get the sitemap HTML filename for a given language code.
 *
 * @param lang - Language code
 * @returns Filename string
 */
export function getSitemapFilename(lang) {
  return lang === 'en' ? 'sitemap.html' : `sitemap_${lang}.html`;
}
/**
 * Get the index filename for a given language code.
 *
 * @param lang - Language code
 * @returns Filename string
 */
function getIndexFilename(lang) {
  return lang === 'en' ? 'index.html' : `index-${lang}.html`;
}
/**
 * Build compact language switcher nav HTML for sitemap pages.
 *
 * @param currentLang - Active language code
 * @returns HTML string
 */
function buildSitemapLangSwitcher(currentLang) {
  return ALL_LANGUAGES.map((code) => {
    const flag = getLocalizedString(LANGUAGE_FLAGS, code);
    const name = getLocalizedString(LANGUAGE_NAMES, code);
    const active = code === currentLang ? ' active' : '';
    const ariaCurrent = code === currentLang ? ' aria-current="page"' : '';
    const href = getSitemapFilename(code);
    return `<a href="${href}" class="lang-link${active}" hreflang="${code}" title="${escapeHTML(name)}"${ariaCurrent}>${flag} ${code.toUpperCase()}</a>`;
  }).join('\n        ');
}
/**
 * Build the footer language grid for sitemap pages.
 *
 * @param currentLang - Active language code
 * @returns HTML string
 */
function buildSitemapFooterLanguageGrid(currentLang) {
  return ALL_LANGUAGES.map((code) => {
    const flag = getLocalizedString(LANGUAGE_FLAGS, code);
    const name = getLocalizedString(LANGUAGE_NAMES, code);
    const href = getSitemapFilename(code);
    const active = code === currentLang ? ' class="active"' : '';
    return `<a href="${href}"${active} hreflang="${code}">${flag} ${escapeHTML(name)}</a>`;
  }).join('\n            ');
}
/**
 * Generate a sitemap HTML page for a specific language.
 * Lists all articles for that language with titles and descriptions,
 * plus a high-level documentation section.
 *
 * @param lang - Language code
 * @param articleInfos - Article info (title/description) for this language
 * @param hasDocsDir - Whether the docs directory exists
 * @returns Complete HTML document string
 */
export function generateSitemapHTML(lang, articleInfos, hasDocsDir = false) {
  const sitemapTitle = SITEMAP_TITLES[lang] ?? SITEMAP_TITLES['en'] ?? DEFAULT_SITEMAP_TITLE;
  const pageTitle = `${getLocalizedString(PAGE_TITLES, lang).split(' - ')[0]} - ${sitemapTitle}`;
  const description = getLocalizedString(PAGE_DESCRIPTIONS, lang);
  const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, lang);
  const dir = getTextDirection(lang);
  const year = new Date().getFullYear();
  const sections = SITEMAP_SECTIONS[lang] ?? SITEMAP_SECTIONS['en'];
  const docsLabels = DOCS_LABELS[lang] ?? DOCS_LABELS['en'];
  const heroTitle = getLocalizedString(PAGE_TITLES, lang).split(' - ')[0] ?? '';
  const headerSubtitle = escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, lang));
  const themeToggleLabel = escapeHTML(getLocalizedString(THEME_TOGGLE_LABELS, lang));
  // Pages section
  const pagesSection = ALL_LANGUAGES.map((code) => {
    const name = getLocalizedString(LANGUAGE_NAMES, code);
    const flag = getLocalizedString(LANGUAGE_FLAGS, code);
    const href = getIndexFilename(code);
    return `          <li><a href="${href}">${flag} ${escapeHTML(name)}</a></li>`;
  }).join('\n');
  // News articles section
  const articlesSection =
    articleInfos.length === 0
      ? ''
      : articleInfos
          .map(
            (a) => `          <li>
            <a href="news/${escapeHTML(a.filename)}">${escapeHTML(a.title)}</a>
            <span class="sitemap-date">${escapeHTML(a.date)}</span>${a.description ? `\n            <p class="sitemap-desc">${escapeHTML(a.description)}</p>` : ''}
          </li>`
          )
          .join('\n');
  // Documentation section (high-level links)
  const docsSection = hasDocsDir
    ? `
      <section class="sitemap-section">
        <h2><span aria-hidden="true">📚</span> ${escapeHTML(sections.docs)}</h2>
        <ul class="sitemap-list">
          <li><a href="docs/index.html">${escapeHTML(docsLabels.docsHome)}</a></li>
          <li><a href="docs/api/index.html">${escapeHTML(docsLabels.api)}</a></li>
          <li><a href="docs/coverage/index.html">${escapeHTML(docsLabels.coverage)}</a></li>
          <li><a href="docs/test-results/index.html">${escapeHTML(docsLabels.testResults)}</a></li>
        </ul>
      </section>`
    : '';
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="no-referrer">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(description)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHTML(sitemapTitle)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${lang}">
  <meta property="og:image" content="https://hack23.github.io/euparliamentmonitor/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <meta name="theme-color" content="#003399">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a href="#main" class="skip-link">${escapeHTML(skipLinkText)}</a>

  <header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="${getIndexFilename(lang)}" class="site-header__brand" aria-label="${escapeHTML(heroTitle)}">
        <picture class="site-header__logo-picture">
          <source srcset="images/favicon-96x96.webp" type="image/webp">
          <img class="site-header__logo" src="images/favicon-96x96.png" alt="" width="36" height="36" aria-hidden="true">
        </picture>
        <span>
          <span class="site-header__title">${escapeHTML(heroTitle)}</span>
          <span class="site-header__subtitle">${headerSubtitle}</span>
        </span>
      </a>
      ${createThemeToggleButton(themeToggleLabel)}
    </div>
  </header>

  <nav class="language-switcher" role="navigation" aria-label="Language selection">
    ${buildSitemapLangSwitcher(lang)}
  </nav>

  <main id="main" class="site-main">
    <h1>${escapeHTML(sitemapTitle)}</h1>

    <section class="sitemap-section">
      <h2><span aria-hidden="true">🏠</span> ${escapeHTML(sections.pages)}</h2>
      <ul class="sitemap-list">
${pagesSection}
      </ul>
    </section>
${docsSection}
    <section class="sitemap-section">
      <h2><span aria-hidden="true">📰</span> ${escapeHTML(sections.news)}</h2>
      <ul class="sitemap-list">
${articlesSection}
      </ul>
    </section>
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
          <li><a href="${getIndexFilename(lang)}">Home</a></li>
          <li><a href="rss.xml">RSS Feed</a></li>
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
          ${buildSitemapFooterLanguageGrid(lang)}
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2008-${year} <a href="https://hack23.com">Hack23 AB</a> (Org.nr 5595347807) | Gothenburg, Sweden</p>
    </div>
  </footer>${THEME_TOGGLE_SCRIPT}
</body>
</html>`;
}
/**
 * Escape special XML characters in text content.
 *
 * @param str - Raw string to escape for XML
 * @returns XML-safe string
 */
function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
/**
 * Generate RSS 2.0 XML feed with all news articles across all languages.
 * Articles are sorted newest-first. Each item includes the article language.
 *
 * @param articleInfos - Article metadata sorted newest first
 * @returns Complete RSS 2.0 XML string
 */
export function generateRssFeed(articleInfos) {
  const buildDate = new Date().toUTCString();
  const items = articleInfos
    .map(
      (item) => `    <item>
      <title>${escapeXML(item.title)}</title>
      <link>${escapeXML(item.link)}</link>
      <description>${escapeXML(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXML(item.link)}</guid>
      <dc:language>${escapeXML(item.lang)}</dc:language>
    </item>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>EU Parliament Monitor</title>
    <link>${BASE_URL}</link>
    <description>European Parliament Intelligence Platform — monitoring political activity with systematic transparency.</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}
/**
 * Main execution - generates sitemap.xml, multi-language sitemap HTML pages, and rss.xml.
 */
function main() {
  console.log('🗺️ Generating sitemap...');
  const articles = getNewsArticles();
  console.log(`📊 Found ${articles.length} articles`);
  // Collect docs HTML files
  const docsFiles = collectDocsHtmlFiles(DOCS_DIR);
  console.log(`📚 Found ${docsFiles.length} docs files`);
  const sitemap = generateSitemap(articles, docsFiles);
  const filepath = path.join(PROJECT_ROOT, 'sitemap.xml');
  fs.writeFileSync(filepath, sitemap, 'utf-8');
  const totalUrls =
    articles.length + ALL_LANGUAGES.length + ALL_LANGUAGES.length + docsFiles.length + 1;
  console.log(`✅ Generated sitemap.xml with ${totalUrls} URLs`);
  // Build article metadata map for sitemap HTML pages and RSS,
  // pre-grouped by language for O(N) iteration
  const articlesByLang = new Map();
  const rssItems = [];
  for (const lang of ALL_LANGUAGES) {
    articlesByLang.set(lang, []);
  }
  for (const filename of articles) {
    const parsed = parseArticleFilename(filename);
    if (parsed) {
      const meta = extractArticleMeta(path.join(NEWS_DIR, filename));
      const info = {
        filename: parsed.filename,
        date: parsed.date,
        title: meta.title || formatSlug(parsed.slug),
        description: meta.description,
      };
      const bucket = articlesByLang.get(parsed.lang);
      if (bucket) {
        bucket.push(info);
      }
      rssItems.push({
        title: info.title,
        link: `${BASE_URL}/news/${info.filename}`,
        description: info.description || info.title,
        pubDate: new Date(parsed.date).toUTCString(),
        lang: parsed.lang,
      });
    }
  }
  // Check if docs directory exists
  const hasDocsDir = fs.existsSync(DOCS_DIR);
  // Generate sitemap HTML for each language
  let htmlGenerated = 0;
  for (const lang of ALL_LANGUAGES) {
    const langArticles = articlesByLang.get(lang) || [];
    // Sort newest first
    langArticles.sort((a, b) => b.date.localeCompare(a.date));
    const html = generateSitemapHTML(lang, langArticles, hasDocsDir);
    const sitemapFilename = getSitemapFilename(lang);
    const sitemapPath = path.join(PROJECT_ROOT, sitemapFilename);
    fs.writeFileSync(sitemapPath, html, 'utf-8');
    console.log(`  ✅ Generated ${sitemapFilename} (${langArticles.length} articles)`);
    htmlGenerated++;
  }
  console.log(`✅ Generated ${htmlGenerated} sitemap HTML files`);
  // Sort RSS items newest first using numeric timestamps
  rssItems.sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));
  const rss = generateRssFeed(rssItems);
  const rssPath = path.join(PROJECT_ROOT, 'rss.xml');
  fs.writeFileSync(rssPath, rss, 'utf-8');
  console.log(`✅ Generated rss.xml with ${rssItems.length} items`);
}
// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
//# sourceMappingURL=sitemap.js.map
