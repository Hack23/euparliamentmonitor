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
import { NEWS_DIR, BASE_URL, PROJECT_ROOT, createThemeToggleButton, THEME_TOGGLE_SCRIPT, } from '../constants/config.js';
import { ALL_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS, PAGE_TITLES, PAGE_DESCRIPTIONS, SKIP_LINK_TEXTS, HEADER_SUBTITLE_LABELS, THEME_TOGGLE_LABELS, getLocalizedString, getTextDirection, } from '../constants/languages.js';
import { getNewsArticles, getModifiedDate, parseArticleFilename, formatSlug, extractArticleMeta, escapeHTML, } from '../utils/file-utils.js';
import { detectCategory } from '../utils/article-category.js';
import { ARTICLE_TYPE_LABELS, FOOTER_POLITICAL_INTELLIGENCE_LABELS, } from '../constants/language-ui.js';
import { ArticleCategory } from '../types/index.js';
import { getPoliticalIntelligenceFilename, collectPoliticalIntelligenceData, generatePoliticalIntelligenceHTML, } from './political-intelligence.js';
/**
 * Escape a string for safe use as XML text content or attribute value.
 * Replaces the five predefined XML entities (`&`, `<`, `>`, `"`, `'`).
 *
 * @param str - Raw string
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
        }
        else if (entry.isFile() && entry.name.endsWith('.html')) {
            results.push(path.relative(rootDir, fullPath).replace(/\\/g, '/'));
        }
    }
    return results.sort();
}
/**
 * Generate sitemap XML including index pages, news articles, sitemap HTML pages,
 * and documentation files from the docs/ folder.
 *
 * Multilingual pages (the 14 index pages, the 14 sitemap HTML pages, and any
 * article whose base stem exists in multiple languages) are enriched with
 * `xhtml:link rel="alternate" hreflang="…"` entries so that Google and other
 * search engines can discover the full set of language variants.
 *
 * @param articles - List of article filenames
 * @param docsFiles - Relative paths to docs HTML files (e.g. "docs/api/index.html")
 * @returns Complete sitemap XML string
 */
export function generateSitemap(articles, docsFiles = []) {
    const today = new Date().toISOString().slice(0, 10);
    const urls = [
        ...buildIndexUrls(today),
        ...buildSitemapHtmlUrls(today),
        ...buildPoliticalIntelligenceUrls(today),
        {
            loc: `${BASE_URL}/rss.xml`,
            lastmod: today,
            changefreq: 'daily',
            priority: '0.5',
        },
        ...buildArticleUrls(articles),
        ...buildDocsUrls(docsFiles, today),
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(renderSitemapUrl).join('\n')}
</urlset>`;
}
/**
 * Build the absolute URL for a language-specific index page.
 *
 * @param lang - Language code
 * @returns Absolute URL
 */
function indexUrlFor(lang) {
    return `${BASE_URL}/${getIndexFilename(lang)}`;
}
/**
 * Build the absolute URL for a language-specific sitemap HTML page.
 *
 * @param lang - Language code
 * @returns Absolute URL
 */
function sitemapUrlFor(lang) {
    return `${BASE_URL}/${getSitemapFilename(lang)}`;
}
/**
 * Build hreflang alternates for a set of language→URL entries, adding
 * x-default pointing at the English variant (or the first available language).
 *
 * @param byLang - Mapping of language code to absolute URL
 * @returns Alternates map including x-default
 */
function withXDefault(byLang) {
    const result = { ...byLang };
    const enFallback = result['en'];
    if (enFallback) {
        result['x-default'] = enFallback;
    }
    else {
        const firstLang = Object.keys(result).sort()[0];
        if (firstLang) {
            const fallback = result[firstLang];
            if (fallback) {
                result['x-default'] = fallback;
            }
        }
    }
    return result;
}
/**
 * Build the 14 `<url>` entries for language index pages, each with a shared
 * hreflang-alternates block covering every supported language.
 *
 * @param today - ISO date string for lastmod
 * @returns Sitemap URL entries
 */
function buildIndexUrls(today) {
    const alternates = {};
    for (const lang of ALL_LANGUAGES) {
        alternates[lang] = indexUrlFor(lang);
    }
    const full = withXDefault(alternates);
    return ALL_LANGUAGES.map((lang) => ({
        loc: indexUrlFor(lang),
        lastmod: today,
        changefreq: 'daily',
        priority: '1.0',
        alternates: full,
    }));
}
/**
 * Build the absolute URL for a language-specific political-intelligence HTML page.
 *
 * @param lang - Language code
 * @returns Absolute URL
 */
function politicalIntelligenceUrlFor(lang) {
    return `${BASE_URL}/${getPoliticalIntelligenceFilename(lang)}`;
}
/**
 * Build the 14 `<url>` entries for political-intelligence HTML pages with
 * hreflang alternates covering every supported language.
 *
 * @param today - ISO date string for lastmod
 * @returns Sitemap URL entries
 */
function buildPoliticalIntelligenceUrls(today) {
    const alternates = {};
    for (const lang of ALL_LANGUAGES) {
        alternates[lang] = politicalIntelligenceUrlFor(lang);
    }
    const full = withXDefault(alternates);
    return ALL_LANGUAGES.map((lang) => ({
        loc: politicalIntelligenceUrlFor(lang),
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.6',
        alternates: full,
    }));
}
/**
 * Build the 14 `<url>` entries for sitemap HTML pages with hreflang alternates.
 *
 * @param today - ISO date string for lastmod
 * @returns Sitemap URL entries
 */
function buildSitemapHtmlUrls(today) {
    const alternates = {};
    for (const lang of ALL_LANGUAGES) {
        alternates[lang] = sitemapUrlFor(lang);
    }
    const full = withXDefault(alternates);
    return ALL_LANGUAGES.map((lang) => ({
        loc: sitemapUrlFor(lang),
        lastmod: today,
        changefreq: 'daily',
        priority: '0.5',
        alternates: full,
    }));
}
/**
 * Build `<url>` entries for every news article. Multi-language clusters
 * (articles that share the same `YYYY-MM-DD-slug` stem) receive hreflang
 * alternates so search engines can discover every variant.
 *
 * @param articles - Article filenames from the news/ directory
 * @returns Sitemap URL entries
 */
function buildArticleUrls(articles) {
    // Group language variants by stem
    const byStem = new Map();
    for (const article of articles) {
        const parsed = parseArticleFilename(article);
        if (!parsed)
            continue;
        const stem = `${parsed.date}-${parsed.slug}`;
        let bucket = byStem.get(stem);
        if (!bucket) {
            bucket = {};
            byStem.set(stem, bucket);
        }
        bucket[parsed.lang] = `${BASE_URL}/news/${article}`;
    }
    return articles.map((article) => {
        const filepath = path.join(NEWS_DIR, article);
        const lastmod = getModifiedDate(filepath);
        const parsed = parseArticleFilename(article);
        const stem = parsed ? `${parsed.date}-${parsed.slug}` : null;
        const bucket = stem ? byStem.get(stem) : undefined;
        // Only emit alternates when the stem has multiple language variants
        const hasMultipleLocales = bucket && Object.keys(bucket).length > 1;
        const alternates = hasMultipleLocales
            ? withXDefault(bucket)
            : undefined;
        return {
            loc: `${BASE_URL}/news/${article}`,
            lastmod,
            changefreq: 'monthly',
            priority: '0.8',
            ...(alternates ? { alternates } : {}),
        };
    });
}
/**
 * Build `<url>` entries for documentation HTML files (no hreflang alternates —
 * docs are single-locale).
 *
 * @param docsFiles - Docs file paths relative to the project root
 * @param today - Fallback ISO date string when fs.stat fails
 * @returns Sitemap URL entries
 */
function buildDocsUrls(docsFiles, today) {
    return docsFiles.map((relPath) => {
        const fullPath = path.join(PROJECT_ROOT, relPath);
        let lastmod = today;
        try {
            lastmod = getModifiedDate(fullPath);
        }
        catch {
            // Use today if file stat fails
        }
        return {
            loc: `${BASE_URL}/${relPath.replace(/\\/g, '/')}`,
            lastmod,
            changefreq: 'weekly',
            priority: '0.3',
        };
    });
}
/**
 * Render a single `<url>` block, including any `xhtml:link` alternates.
 *
 * @param url - Sitemap URL entry with optional hreflang alternates
 * @returns XML fragment for the `<url>` block
 */
function renderSitemapUrl(url) {
    const altLinks = url.alternates
        ? Object.entries(url.alternates)
            .map(([hreflang, href]) => `    <xhtml:link rel="alternate" hreflang="${escapeXML(hreflang)}" href="${escapeXML(href)}"/>`)
            .join('\n')
        : '';
    return `  <url>
    <loc>${escapeXML(url.loc)}</loc>
    <lastmod>${escapeXML(url.lastmod)}</lastmod>
    <changefreq>${escapeXML(url.changefreq)}</changefreq>
    <priority>${escapeXML(url.priority)}</priority>${altLinks ? `\n${altLinks}` : ''}
  </url>`;
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
/** Per-language copy for the sitemap hero, breadcrumb, and section intros */
const SITEMAP_COPY = {
    en: {
        intro: 'Complete overview of every page on EU Parliament Monitor — index pages, news articles, and technical documentation. Use this page to discover content and navigate directly to any article across all 14 languages.',
        heroSubtitle: 'Complete site navigation',
        home: 'Home',
        breadcrumbCurrent: 'Site Map',
        breadcrumbLabel: 'Breadcrumb',
        pagesDescription: 'Primary landing pages in every supported language — the best starting point for each audience.',
        docsDescription: 'Technical documentation including API reference, code coverage, and test results.',
        newsDescription: 'Every published news article in this language, sorted newest first and grouped by editorial format.',
        statArticlesLabel: 'Articles',
        statLanguagesLabel: 'Languages',
        statLastUpdatedLabel: 'Last updated',
        statCategoriesLabel: 'Categories',
        politicalIntelligenceLinkDescription: 'Index of every methodology, template, and daily analysis run — the transparent tradecraft behind every article.',
    },
    sv: {
        intro: 'Komplett översikt över alla sidor på EU Parliament Monitor — startsidor, nyhetsartiklar och teknisk dokumentation. Använd sidan för att upptäcka innehåll och navigera direkt till valfri artikel på alla 14 språk.',
        heroSubtitle: 'Komplett webbplatsnavigering',
        home: 'Hem',
        breadcrumbCurrent: 'Webbplatskarta',
        breadcrumbLabel: 'Brödsmulor',
        pagesDescription: 'Primära startsidor på varje språk som stöds — bästa utgångspunkten för varje målgrupp.',
        docsDescription: 'Teknisk dokumentation inklusive API-referens, kodtäckning och testresultat.',
        newsDescription: 'Alla publicerade nyhetsartiklar på detta språk, sorterade med nyaste överst och grupperade efter redaktionellt format.',
        statArticlesLabel: 'Artiklar',
        statLanguagesLabel: 'Språk',
        statLastUpdatedLabel: 'Senast uppdaterad',
        statCategoriesLabel: 'Kategorier',
        politicalIntelligenceLinkDescription: 'Index över varje metodik, mall och daglig analyskörning — det transparenta hantverket bakom varje artikel.',
    },
    da: {
        intro: 'Komplet oversigt over alle sider på EU Parliament Monitor — startsider, nyhedsartikler og teknisk dokumentation. Brug siden til at opdage indhold og navigere direkte til enhver artikel på alle 14 sprog.',
        heroSubtitle: 'Komplet webstedsnavigation',
        home: 'Hjem',
        breadcrumbCurrent: 'Sitemap',
        breadcrumbLabel: 'Brødkrummer',
        pagesDescription: 'Primære startsider på hvert understøttet sprog — det bedste udgangspunkt for hver målgruppe.',
        docsDescription: 'Teknisk dokumentation inklusive API-reference, kodedækning og testresultater.',
        newsDescription: 'Alle offentliggjorte nyhedsartikler på dette sprog, sorteret nyeste først og grupperet efter redaktionelt format.',
        statArticlesLabel: 'Artikler',
        statLanguagesLabel: 'Sprog',
        statLastUpdatedLabel: 'Sidst opdateret',
        statCategoriesLabel: 'Kategorier',
        politicalIntelligenceLinkDescription: 'Indeks over hver metode, skabelon og daglig analysekørsel — det gennemsigtige håndværk bag hver artikel.',
    },
    no: {
        intro: 'Komplett oversikt over alle sider på EU Parliament Monitor — startsider, nyhetsartikler og teknisk dokumentasjon. Bruk siden for å oppdage innhold og navigere direkte til enhver artikkel på alle 14 språk.',
        heroSubtitle: 'Komplett nettstedsnavigasjon',
        home: 'Hjem',
        breadcrumbCurrent: 'Nettstedskart',
        breadcrumbLabel: 'Brødsmuler',
        pagesDescription: 'Primære startsider på hvert støttet språk — det beste utgangspunktet for hver målgruppe.',
        docsDescription: 'Teknisk dokumentasjon inkludert API-referanse, kodedekning og testresultater.',
        newsDescription: 'Alle publiserte nyhetsartikler på dette språket, sortert med nyeste først og gruppert etter redaksjonelt format.',
        statArticlesLabel: 'Artikler',
        statLanguagesLabel: 'Språk',
        statLastUpdatedLabel: 'Sist oppdatert',
        statCategoriesLabel: 'Kategorier',
        politicalIntelligenceLinkDescription: 'Indeks over hver metodologi, mal og daglige analysekjøring — det gjennomsiktige håndverket bak hver artikkel.',
    },
    fi: {
        intro: 'Täydellinen yleiskatsaus kaikkiin EU Parliament Monitor -sivuston sivuihin — etusivuihin, uutisartikkeleihin ja tekniseen dokumentaatioon. Käytä tätä sivua löytääksesi sisältöä ja siirtyäksesi suoraan mihin tahansa artikkeliin kaikilla 14 kielellä.',
        heroSubtitle: 'Täydellinen sivustonavigaatio',
        home: 'Etusivu',
        breadcrumbCurrent: 'Sivukartta',
        breadcrumbLabel: 'Navigointipolku',
        pagesDescription: 'Ensisijaiset aloitussivut jokaisella tuetulla kielellä — paras lähtökohta kullekin yleisölle.',
        docsDescription: 'Tekninen dokumentaatio, mukaan lukien API-viite, koodikattavuus ja testitulokset.',
        newsDescription: 'Kaikki julkaistut uutisartikkelit tällä kielellä, uusimmat ensin ja ryhmitellyt toimituksellisen muodon mukaan.',
        statArticlesLabel: 'Artikkelit',
        statLanguagesLabel: 'Kielet',
        statLastUpdatedLabel: 'Viimeksi päivitetty',
        statCategoriesLabel: 'Luokat',
        politicalIntelligenceLinkDescription: 'Hakemisto jokaisesta metodologiasta, pohjasta ja päivittäisestä analyysiajoista — läpinäkyvä käsityötaito jokaisen artikkelin takana.',
    },
    de: {
        intro: 'Vollständige Übersicht über alle Seiten von EU Parliament Monitor — Startseiten, Nachrichtenartikel und technische Dokumentation. Nutzen Sie diese Seite, um Inhalte zu entdecken und direkt zu jedem Artikel in allen 14 Sprachen zu navigieren.',
        heroSubtitle: 'Vollständige Seitennavigation',
        home: 'Startseite',
        breadcrumbCurrent: 'Seitenübersicht',
        breadcrumbLabel: 'Breadcrumb',
        pagesDescription: 'Primäre Startseiten in jeder unterstützten Sprache — der beste Ausgangspunkt für jede Zielgruppe.',
        docsDescription: 'Technische Dokumentation einschließlich API-Referenz, Codeabdeckung und Testergebnissen.',
        newsDescription: 'Alle veröffentlichten Nachrichtenartikel in dieser Sprache, nach Datum absteigend sortiert und nach redaktionellem Format gruppiert.',
        statArticlesLabel: 'Artikel',
        statLanguagesLabel: 'Sprachen',
        statLastUpdatedLabel: 'Zuletzt aktualisiert',
        statCategoriesLabel: 'Kategorien',
        politicalIntelligenceLinkDescription: 'Index jeder Methodologie, Vorlage und täglichen Analysedurchführung — die transparente Handwerkskunst hinter jedem Artikel.',
    },
    fr: {
        intro: 'Vue d\u2019ensemble complète de toutes les pages d\u2019EU Parliament Monitor — pages d\u2019accueil, articles d\u2019actualité et documentation technique. Utilisez cette page pour découvrir du contenu et naviguer directement vers n\u2019importe quel article dans les 14 langues.',
        heroSubtitle: 'Navigation complète du site',
        home: 'Accueil',
        breadcrumbCurrent: 'Plan du site',
        breadcrumbLabel: 'Fil d\u2019Ariane',
        pagesDescription: 'Pages d\u2019accueil principales dans chaque langue prise en charge — le meilleur point de départ pour chaque audience.',
        docsDescription: 'Documentation technique comprenant la référence API, la couverture de code et les résultats des tests.',
        newsDescription: 'Tous les articles d\u2019actualité publiés dans cette langue, triés du plus récent au plus ancien et groupés par format éditorial.',
        statArticlesLabel: 'Articles',
        statLanguagesLabel: 'Langues',
        statLastUpdatedLabel: 'Dernière mise à jour',
        statCategoriesLabel: 'Catégories',
        politicalIntelligenceLinkDescription: "Index de chaque méthodologie, modèle et exécution d'analyse quotidienne — le savoir-faire transparent derrière chaque article.",
    },
    es: {
        intro: 'Vista general completa de todas las páginas de EU Parliament Monitor — páginas principales, artículos de noticias y documentación técnica. Usa esta página para descubrir contenido y navegar directamente a cualquier artículo en los 14 idiomas.',
        heroSubtitle: 'Navegación completa del sitio',
        home: 'Inicio',
        breadcrumbCurrent: 'Mapa del sitio',
        breadcrumbLabel: 'Ruta de navegación',
        pagesDescription: 'Páginas principales en cada idioma soportado — el mejor punto de partida para cada audiencia.',
        docsDescription: 'Documentación técnica, incluyendo referencia de API, cobertura de código y resultados de pruebas.',
        newsDescription: 'Todos los artículos de noticias publicados en este idioma, ordenados del más reciente al más antiguo y agrupados por formato editorial.',
        statArticlesLabel: 'Artículos',
        statLanguagesLabel: 'Idiomas',
        statLastUpdatedLabel: 'Última actualización',
        statCategoriesLabel: 'Categorías',
        politicalIntelligenceLinkDescription: 'Índice de cada metodología, plantilla y ejecución de análisis diario — el oficio transparente detrás de cada artículo.',
    },
    nl: {
        intro: 'Volledig overzicht van elke pagina op EU Parliament Monitor — landingspagina\u2019s, nieuwsartikelen en technische documentatie. Gebruik deze pagina om inhoud te ontdekken en direct naar elk artikel in alle 14 talen te navigeren.',
        heroSubtitle: 'Volledige site-navigatie',
        home: 'Home',
        breadcrumbCurrent: 'Sitemap',
        breadcrumbLabel: 'Broodkruimelpad',
        pagesDescription: 'Primaire landingspagina\u2019s in elke ondersteunde taal — het beste vertrekpunt voor elk publiek.',
        docsDescription: 'Technische documentatie inclusief API-referentie, code-dekking en testresultaten.',
        newsDescription: 'Alle gepubliceerde nieuwsartikelen in deze taal, nieuwste bovenaan en gegroepeerd op redactioneel formaat.',
        statArticlesLabel: 'Artikelen',
        statLanguagesLabel: 'Talen',
        statLastUpdatedLabel: 'Laatst bijgewerkt',
        statCategoriesLabel: 'Categorieën',
        politicalIntelligenceLinkDescription: 'Index van elke methodologie, sjabloon en dagelijkse analyse-uitvoering — het transparante vakmanschap achter elk artikel.',
    },
    ar: {
        intro: 'نظرة عامة كاملة على كل صفحة في EU Parliament Monitor — الصفحات الرئيسية والمقالات الإخبارية والوثائق التقنية. استخدم هذه الصفحة لاكتشاف المحتوى والانتقال مباشرة إلى أي مقال بجميع اللغات الـ14.',
        heroSubtitle: 'التنقل الكامل في الموقع',
        home: 'الرئيسية',
        breadcrumbCurrent: 'خريطة الموقع',
        breadcrumbLabel: 'مسار التنقل',
        pagesDescription: 'الصفحات الرئيسية الأساسية بكل لغة مدعومة — أفضل نقطة انطلاق لكل جمهور.',
        docsDescription: 'وثائق تقنية تشمل مرجع واجهة البرمجة وتغطية الكود ونتائج الاختبارات.',
        newsDescription: 'جميع المقالات الإخبارية المنشورة بهذه اللغة، مرتبة من الأحدث إلى الأقدم ومصنفة حسب الصيغة التحريرية.',
        statArticlesLabel: 'المقالات',
        statLanguagesLabel: 'اللغات',
        statLastUpdatedLabel: 'آخر تحديث',
        statCategoriesLabel: 'الفئات',
        politicalIntelligenceLinkDescription: 'فهرس لكل منهجية وقالب وتشغيل تحليل يومي — الحرفة الشفافة وراء كل مقال.',
    },
    he: {
        intro: 'סקירה מלאה של כל עמוד ב-EU Parliament Monitor — עמודי בית, מאמרי חדשות ותיעוד טכני. השתמשו בעמוד זה כדי לגלות תוכן ולנווט ישירות לכל מאמר בכל 14 השפות.',
        heroSubtitle: 'ניווט מלא באתר',
        home: 'בית',
        breadcrumbCurrent: 'מפת אתר',
        breadcrumbLabel: 'נתיב ניווט',
        pagesDescription: 'עמודי נחיתה ראשיים בכל שפה נתמכת — נקודת ההתחלה הטובה ביותר לכל קהל.',
        docsDescription: 'תיעוד טכני כולל מקור API, כיסוי קוד ותוצאות בדיקות.',
        newsDescription: 'כל מאמרי החדשות שפורסמו בשפה זו, ממוינים מהחדש לישן ומקובצים לפי פורמט מערכת.',
        statArticlesLabel: 'מאמרים',
        statLanguagesLabel: 'שפות',
        statLastUpdatedLabel: 'עודכן לאחרונה',
        statCategoriesLabel: 'קטגוריות',
        politicalIntelligenceLinkDescription: 'אינדקס של כל מתודולוגיה, תבנית וריצת ניתוח יומית — המלאכה השקופה שמאחורי כל מאמר.',
    },
    ja: {
        intro: 'EU Parliament Monitor の全ページの完全な一覧です — トップページ、ニュース記事、技術ドキュメント。このページを使って、14 言語すべての任意の記事を発見・直接閲覧できます。',
        heroSubtitle: 'サイト全体のナビゲーション',
        home: 'ホーム',
        breadcrumbCurrent: 'サイトマップ',
        breadcrumbLabel: 'パンくずリスト',
        pagesDescription: '各対応言語のメインランディングページ — 各読者に最適な入り口。',
        docsDescription: 'API リファレンス、コードカバレッジ、テスト結果を含む技術ドキュメント。',
        newsDescription: 'この言語で公開された全ニュース記事を、新しい順に掲載し編集フォーマット別にグループ化しています。',
        statArticlesLabel: '記事',
        statLanguagesLabel: '言語',
        statLastUpdatedLabel: '最終更新',
        statCategoriesLabel: 'カテゴリ',
        politicalIntelligenceLinkDescription: 'すべての方法論、テンプレート、日次分析実行のインデックス — 各記事の背後にある透明な手法。',
    },
    ko: {
        intro: 'EU Parliament Monitor의 모든 페이지 전체 개요 — 홈 페이지, 뉴스 기사 및 기술 문서를 포함합니다. 이 페이지를 통해 14개 언어 전체의 어떤 기사든 직접 찾아 이동할 수 있습니다.',
        heroSubtitle: '전체 사이트 내비게이션',
        home: '홈',
        breadcrumbCurrent: '사이트맵',
        breadcrumbLabel: '이동 경로',
        pagesDescription: '지원되는 각 언어의 주요 랜딩 페이지 — 각 독자를 위한 최적의 시작점입니다.',
        docsDescription: 'API 레퍼런스, 코드 커버리지, 테스트 결과를 포함한 기술 문서입니다.',
        newsDescription: '이 언어로 게시된 모든 뉴스 기사를 최신순으로 편집 형식별로 정리했습니다.',
        statArticlesLabel: '기사',
        statLanguagesLabel: '언어',
        statLastUpdatedLabel: '마지막 업데이트',
        statCategoriesLabel: '카테고리',
        politicalIntelligenceLinkDescription: '모든 방법론, 템플릿 및 일일 분석 실행의 색인 — 각 기사 뒤에 있는 투명한 기술.',
    },
    zh: {
        intro: '欧洲议会监测(EU Parliament Monitor)所有页面的完整概览 — 包括首页、新闻文章和技术文档。通过此页面可以发现内容并直接访问 14 种语言的任何文章。',
        heroSubtitle: '完整站点导航',
        home: '首页',
        breadcrumbCurrent: '网站地图',
        breadcrumbLabel: '面包屑导航',
        pagesDescription: '每种受支持语言的主要落地页 — 每个受众的最佳起点。',
        docsDescription: '技术文档,包括 API 参考、代码覆盖率和测试结果。',
        newsDescription: '该语言发布的所有新闻文章,按最新优先排序,并按编辑格式分组。',
        statArticlesLabel: '文章',
        statLanguagesLabel: '语言',
        statLastUpdatedLabel: '最近更新',
        statCategoriesLabel: '分类',
        politicalIntelligenceLinkDescription: '所有方法论、模板和每日分析运行的索引 — 每篇文章背后透明的工艺。',
    },
};
/**
 * Ordered list of article categories used for the News Articles section.
 * Matches the hero badge ordering used elsewhere in the site.
 */
const CATEGORY_ORDER = [
    ArticleCategory.BREAKING_NEWS,
    ArticleCategory.WEEK_AHEAD,
    ArticleCategory.WEEK_IN_REVIEW,
    ArticleCategory.MONTH_AHEAD,
    ArticleCategory.MONTH_IN_REVIEW,
    ArticleCategory.YEAR_AHEAD,
    ArticleCategory.YEAR_IN_REVIEW,
    ArticleCategory.MOTIONS,
    ArticleCategory.PROPOSITIONS,
    ArticleCategory.COMMITTEE_REPORTS,
    ArticleCategory.DEEP_ANALYSIS,
];
/**
 * Get localized sitemap copy (hero, breadcrumb, section intros).
 *
 * @param lang - Language code
 * @returns Localized copy object, falling back to English when missing
 */
function getSitemapCopy(lang) {
    return SITEMAP_COPY[lang] ?? SITEMAP_COPY['en'];
}
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
    const today = new Date().toISOString().slice(0, 10);
    const sections = (SITEMAP_SECTIONS[lang] ?? SITEMAP_SECTIONS['en']);
    const docsLabels = (DOCS_LABELS[lang] ?? DOCS_LABELS['en']);
    const copy = getSitemapCopy(lang);
    const heroTitle = getLocalizedString(PAGE_TITLES, lang).split(' - ')[0] ?? '';
    const headerSubtitle = escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, lang));
    const themeToggleLabel = escapeHTML(getLocalizedString(THEME_TOGGLE_LABELS, lang));
    const typeLabels = getLocalizedString(ARTICLE_TYPE_LABELS, lang);
    const canonicalUrl = `${BASE_URL}/${getSitemapFilename(lang)}`;
    // ─── <head> hreflang alternates for all sitemap language variants ───
    const hreflangLinks = [
        ...ALL_LANGUAGES.map((code) => `  <link rel="alternate" hreflang="${code}" href="${BASE_URL}/${getSitemapFilename(code)}">`),
        `  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/sitemap.html">`,
    ].join('\n');
    // ─── Pages section (one per supported language) ─────────────────────
    const pagesSection = ALL_LANGUAGES.map((code) => {
        const name = getLocalizedString(LANGUAGE_NAMES, code);
        const flag = getLocalizedString(LANGUAGE_FLAGS, code);
        const href = getIndexFilename(code);
        const pageDesc = getLocalizedString(PAGE_DESCRIPTIONS, code);
        return `          <li>
            <a href="${href}" hreflang="${code}">${flag} ${escapeHTML(name)}</a>
            <span class="link-description">${escapeHTML(pageDesc)}</span>
          </li>`;
    }).join('\n');
    // ─── News articles grouped by editorial category ────────────────────
    const articlesByCategory = new Map();
    for (const article of articleInfos) {
        const category = detectCategory(article.slug ?? article.filename);
        let bucket = articlesByCategory.get(category);
        if (!bucket) {
            bucket = [];
            articlesByCategory.set(category, bucket);
        }
        bucket.push(article);
    }
    // Render in the canonical category order, then any remaining categories
    const orderedCategories = [
        ...CATEGORY_ORDER.filter((c) => articlesByCategory.has(c)),
        ...[...articlesByCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
    ];
    const articlesSection = articleInfos.length === 0
        ? ''
        : orderedCategories
            .map((category) => {
            const bucket = articlesByCategory.get(category) ?? [];
            // Newest first within each category
            bucket.sort((a, b) => b.date.localeCompare(a.date));
            const label = typeLabels[category] ?? category;
            const items = bucket
                .map((a) => `            <li>
              <a href="news/${escapeHTML(a.filename)}">${escapeHTML(a.title)}</a>
              <span class="sitemap-date">${escapeHTML(a.date)}</span>${a.description ? `\n              <p class="sitemap-desc">${escapeHTML(a.description)}</p>` : ''}
            </li>`)
                .join('\n');
            return `        <section class="sitemap-category" aria-labelledby="cat-${category}">
          <h3 id="cat-${category}" class="sitemap-category__heading">${escapeHTML(label)} <span class="sitemap-category__count" aria-label="${bucket.length} articles">${bucket.length}</span></h3>
          <ul class="sitemap-list">
${items}
          </ul>
        </section>`;
        })
            .join('\n');
    // ─── Documentation section (high-level links) ───────────────────────
    const docsSection = hasDocsDir
        ? `
      <section class="sitemap-section">
        <h2><span aria-hidden="true">📚</span> ${escapeHTML(sections.docs)}</h2>
        <p class="section-description">${escapeHTML(copy.docsDescription)}</p>
        <ul class="sitemap-list">
          <li><a href="docs/index.html">${escapeHTML(docsLabels.docsHome)}</a></li>
          <li><a href="docs/api/index.html">${escapeHTML(docsLabels.api)}</a></li>
          <li><a href="docs/coverage/index.html">${escapeHTML(docsLabels.coverage)}</a></li>
          <li><a href="docs/test-results/index.html">${escapeHTML(docsLabels.testResults)}</a></li>
        </ul>
      </section>`
        : '';
    // ─── JSON-LD CollectionPage structured data for SEO ─────────────────
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: sitemapTitle,
        url: canonicalUrl,
        description: copy.intro,
        inLanguage: lang,
        isPartOf: {
            '@type': 'WebSite',
            name: 'EU Parliament Monitor',
            url: BASE_URL,
        },
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: copy.home,
                    item: `${BASE_URL}/${getIndexFilename(lang)}`,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: copy.breadcrumbCurrent,
                    item: canonicalUrl,
                },
            ],
        },
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: articleInfos.length,
            name: sections.news,
        },
    };
    // Safely embed JSON-LD: escape the `<` that could start `</script>` sequences
    const jsonLdString = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="no-referrer">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(description)}">
  <link rel="canonical" href="${canonicalUrl}">
${hreflangLinks}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHTML(sitemapTitle)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:url" content="${canonicalUrl}">
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
  <script type="application/ld+json">${jsonLdString}</script>
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
    <section class="sitemap-hero" aria-labelledby="sitemap-heading">
      <h1 id="sitemap-heading">🗺️ ${escapeHTML(sitemapTitle)}</h1>
      <p class="sitemap-hero__subtitle">${escapeHTML(copy.heroSubtitle)}</p>
      <p class="sitemap-hero__intro">${escapeHTML(copy.intro)}</p>
      <dl class="sitemap-stats" aria-label="${escapeHTML(sitemapTitle)}">
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statArticlesLabel)}</dt>
          <dd>${articleInfos.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statLanguagesLabel)}</dt>
          <dd>${ALL_LANGUAGES.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statCategoriesLabel)}</dt>
          <dd>${orderedCategories.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statLastUpdatedLabel)}</dt>
          <dd><time datetime="${today}">${today}</time></dd>
        </div>
      </dl>
    </section>

    <nav class="breadcrumb" aria-label="${escapeHTML(copy.breadcrumbLabel)}">
      <ol>
        <li><a href="${getIndexFilename(lang)}">${escapeHTML(copy.home)}</a></li>
        <li aria-current="page">${escapeHTML(copy.breadcrumbCurrent)}</li>
      </ol>
    </nav>

    <div class="sitemap-grid">
      <section class="sitemap-section">
        <h2><span aria-hidden="true">🏠</span> ${escapeHTML(sections.pages)}</h2>
        <p class="section-description">${escapeHTML(copy.pagesDescription)}</p>
        <ul class="sitemap-list">
${pagesSection}
          <li>
            <a href="${getPoliticalIntelligenceFilename(lang)}" hreflang="${lang}">🧭 ${escapeHTML(getLocalizedString(FOOTER_POLITICAL_INTELLIGENCE_LABELS, lang))}</a>
            <span class="link-description">${escapeHTML(copy.politicalIntelligenceLinkDescription)}</span>
          </li>
        </ul>
      </section>
${docsSection}
      <section class="sitemap-section sitemap-section--news">
        <h2><span aria-hidden="true">📰</span> ${escapeHTML(sections.news)}</h2>
        <p class="section-description">${escapeHTML(copy.newsDescription)}</p>
${articlesSection}
      </section>
    </div>
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
          <li><a href="${getPoliticalIntelligenceFilename(lang)}">Political Intelligence</a></li>
          <li><a href="rss.xml">RSS Feed</a></li>
          <li><a href="sitemap.xml">XML Sitemap</a></li>
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
 * Generate RSS 2.0 XML feed with all news articles across all languages.
 * Articles are sorted newest-first. Each item includes the article language.
 *
 * @param articleInfos - Article metadata sorted newest first
 * @returns Complete RSS 2.0 XML string
 */
export function generateRssFeed(articleInfos) {
    const buildDate = new Date().toUTCString();
    const items = articleInfos
        .map((item) => `    <item>
      <title>${escapeXML(item.title)}</title>
      <link>${escapeXML(item.link)}</link>
      <description>${escapeXML(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXML(item.link)}</guid>
      <dc:language>${escapeXML(item.lang)}</dc:language>
    </item>`)
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
    const totalUrls = articles.length +
        ALL_LANGUAGES.length * 3 + // index pages + sitemap HTML + political-intelligence HTML
        docsFiles.length +
        1; // rss.xml
    console.log(`✅ Generated sitemap.xml with ${totalUrls} URLs`);
    // Generate political-intelligence pages (one per language)
    const piData = collectPoliticalIntelligenceData(PROJECT_ROOT);
    console.log(`🧭 Scanned analysis tradecraft: ${piData.methodologies.length} methodologies, ${piData.templates.length} templates, ${piData.dailyGroups.length} daily groups`);
    let piGenerated = 0;
    for (const lang of ALL_LANGUAGES) {
        const piHtml = generatePoliticalIntelligenceHTML(lang, piData);
        const piFilename = getPoliticalIntelligenceFilename(lang);
        const piPath = path.join(PROJECT_ROOT, piFilename);
        fs.writeFileSync(piPath, piHtml, 'utf-8');
        console.log(`  ✅ Generated ${piFilename}`);
        piGenerated++;
    }
    console.log(`✅ Generated ${piGenerated} political-intelligence HTML files`);
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
                slug: parsed.slug,
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
        const langArticles = articlesByLang.get(lang) ?? [];
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