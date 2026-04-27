// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Sitemap/Xml
 * @description Generates the `sitemap.xml` document with hreflang
 * alternates per Google guidelines. Wraps the index pages, sitemap HTML
 * pages, political-intelligence pages, RSS feed, news articles, and
 * documentation files with appropriate `<changefreq>` / `<priority>`
 * defaults and `xhtml:link rel="alternate"` blocks for multilingual
 * variants.
 *
 * Lifted out of the monolithic `sitemap.ts` so the XML emission can be
 * unit-tested in isolation, so the bounded context "sitemap XML" is
 * pure (no HTML chrome dependencies), and so future XML output formats
 * (news-sitemap, video-sitemap) can reuse the same URL builders.
 *
 * Output is byte-identical to the legacy in-line implementation that
 * lived in `sitemap.ts`, verified by the byte-equality regression test.
 */
import fs from 'fs';
import path from 'path';
import { BASE_URL, NEWS_DIR, PROJECT_ROOT } from '../../constants/config.js';
import { ALL_LANGUAGES } from '../../constants/languages.js';
import { getModifiedDate, parseArticleFilename } from '../../utils/file-utils.js';
import { getPoliticalIntelligenceFilename } from '../political-intelligence.js';
import { escapeXML } from './xml-utils.js';
import { getSitemapFilename, getIndexFilename } from './html.js';
/** Absolute docs directory under project root */
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');
/**
 * Recursively collect all `.html` files under a directory, returning
 * paths relative to the project root with POSIX separators.
 *
 * Returns an empty array silently when `dir` does not exist — callers
 * (notably the sitemap generator) need not pre-check, and a missing
 * docs directory is a normal "no docs published yet" state.
 *
 * @param dir - Directory to scan
 * @param rootDir - Project root for computing relative paths
 * @returns Sorted array of relative paths (e.g. `docs/api/index.html`)
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
 * Generate sitemap XML including index pages, news articles, sitemap
 * HTML pages, political-intelligence pages, RSS feed, and documentation
 * files from the `docs/` folder.
 *
 * Multilingual pages (the 14 index pages, the 14 sitemap HTML pages,
 * the 14 political-intelligence pages, and any article whose base stem
 * exists in multiple languages) are enriched with `xhtml:link
 * rel="alternate" hreflang="…"` entries so Google and other search
 * engines can discover the full set of language variants.
 *
 * @param articles - List of article filenames (sourced from the `news/` directory)
 * @param docsFiles - Relative paths to docs HTML files (e.g. `docs/api/index.html`)
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
 * `x-default` pointing at the English variant (or, when English is
 * absent, the alphabetically-first available language).
 *
 * @param byLang - Mapping of language code to absolute URL
 * @returns Alternates map including `x-default`
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
 * Build the 14 `<url>` entries for language index pages, each with a
 * shared hreflang-alternates block covering every supported language.
 *
 * @param today - ISO date string for `<lastmod>`
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
 * Build the 14 `<url>` entries for political-intelligence HTML pages
 * with hreflang alternates covering every supported language.
 *
 * @param today - ISO date string for `<lastmod>`
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
 * @param today - ISO date string for `<lastmod>`
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
 * (articles that share the same `YYYY-MM-DD-slug` stem) receive
 * hreflang alternates so search engines can discover every variant.
 *
 * @param articles - Article filenames from the `news/` directory
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
 * Build `<url>` entries for documentation HTML files (no hreflang
 * alternates — docs are single-locale).
 *
 * @param docsFiles - Docs file paths relative to the project root
 * @param today - Fallback ISO date string when `fs.stat` fails
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
/** Absolute path of the docs/ directory used by the sitemap CLI. */
export const SITEMAP_DOCS_DIR = DOCS_DIR;
//# sourceMappingURL=xml.js.map