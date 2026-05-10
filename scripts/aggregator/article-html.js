// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/ArticleHtml
 * @description Wrap a rendered article body in the same site chrome that
 * `political-intelligence.html` uses — site header, language switcher, skip
 * link, theme toggle, breadcrumb, and footer. All chrome is reused from
 * existing modules (`constants/config.ts`, `constants/languages.ts`,
 * `templates/section-builders.ts`) so localisation, a11y, and CSP stay
 * consistent with the rest of the site.
 *
 * The output is a complete HTML5 document. No inline `<script>` is emitted
 * in the body. Mermaid is loaded from the same-origin vendored ESM bundle
 * (copied to `js/vendor/mermaid/` by `scripts/copy-vendor.js`) via
 * `<script type="module" src="../js/mermaid-init.js?v=<MERMAID_VERSION>" defer>`
 * so CSP stays `script-src 'self'`. The `?v=` query parameter is sourced
 * from `devDependencies.mermaid` in `package.json` (a fixed pin like
 * `11.14.0`); regenerating articles after a Mermaid bump invalidates
 * browser and CloudFront caches automatically.
 */
import { BASE_URL, BUILD_SHORT, MERMAID_VERSION } from '../constants/config.js';
import { buildHeadFreshnessTags } from '../constants/build-info-meta.js';
import { ALL_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS, PAGE_TITLES, SKIP_LINK_TEXTS, TOC_ARIA_LABELS, ARTICLE_TYPE_LABELS, BACK_TO_NEWS_LABELS, ARTICLE_NAV_LABELS, VIEW_SOURCE_MARKDOWN_LABELS, ARTICLE_TYPE_ICONS, FOOTER_SITEMAP_LABELS, FOOTER_POLITICAL_INTELLIGENCE_LABELS, TRADECRAFT_HEADING_LABELS, TRADECRAFT_INTRO_LABELS, TRADECRAFT_METHODOLOGIES_LABELS, TRADECRAFT_TEMPLATES_LABELS, ANALYSIS_INDEX_HEADING_LABELS, ANALYSIS_INDEX_INTRO_LABELS, ANALYSIS_INDEX_COL_SECTION_LABELS, ANALYSIS_INDEX_COL_ARTIFACT_LABELS, ANALYSIS_INDEX_COL_PATH_LABELS, KEY_TAKEAWAYS_HEADING_LABELS, SUPPLEMENTARY_HEADING_LABELS, SECTION_TITLE_LABELS, getLocalizedString, getTextDirection, } from '../constants/languages.js';
import { ArticleCategory } from '../types/index.js';
import { escapeHTML } from '../utils/file-utils.js';
import { buildSiteFooter, buildSiteHeader, buildPageBanner, } from '../templates/section-builders.js';
import { READER_GUIDE_SECTION_ID } from './reader-guide-constants.js';
import { READER_GUIDE_TITLE_LABELS, getReaderGuideSectionIcon, } from './reader-intelligence-guide.js';
import { TRADECRAFT_SECTION_ID, MANIFEST_SECTION_ID, SUPPLEMENTARY_SECTION_ID, } from './artifact-order.js';
import { humanizeStem } from './analysis-aggregator.js';
import { KEY_TAKEAWAYS_SECTION_ID } from './key-takeaways.js';
import { getPoliticalIntelligenceFilename } from '../generators/political-intelligence.js';
import { getSitemapFilename } from '../generators/sitemap/index.js';
import { getCuratedTitle, getCuratedDescription, getArtifactInfo, } from '../generators/political-intelligence-descriptions.js';
/**
 * Resolve a localized article type label with icon. Falls back to the
 * humanised slug when a translation isn't available.
 *
 * @param slug - Raw article type slug (e.g. "motions", "week-ahead")
 * @param lang - Target language code
 * @returns Localized label with preceding emoji icon (e.g. "🗳️ Plenary Votes & Resolutions")
 */
function getLocalizedArticleType(slug, lang) {
    const labels = getLocalizedString(ARTICLE_TYPE_LABELS, lang);
    const label = labels[slug] ?? slug.replace(/-/g, ' ');
    const categoryValues = Object.values(ArticleCategory);
    const iconEmoji = categoryValues.includes(slug)
        ? ARTICLE_TYPE_ICONS[slug]
        : '📄';
    return `${iconEmoji} ${label}`;
}
/** Publisher organization name used in JSON-LD, meta tags. */
const PUBLISHER_NAME = 'Hack23 AB';
/** Site name used across meta tags and structured data. */
const SITE_NAME = 'EU Parliament Monitor';
/**
 * Build the canonical filename for an article in a given language. English
 * uses the bare stem (`2026-01-15-breaking-en.html`); other languages share
 * the same pattern so every language is a first-class variant. Matches the
 * existing `news/<date>-<slug>-<lang>.html` convention.
 *
 * @param articleSlug - Slug of the form `<date>-<type>` (no extension)
 * @param lang - Target language code
 * @returns Filename string without any directory prefix
 */
export function getArticleFilename(articleSlug, lang) {
    return `${articleSlug}-${lang}.html`;
}
/**
 * Build the hreflang `<link rel="alternate">` block for an article.
 *
 * @param articleSlug - Slug of the form `<date>-<type>` (no extension)
 * @returns Newline-joined `<link>` tags for every supported language plus
 *          an `x-default` fallback pointing at the English variant
 */
export function buildArticleHreflangLinks(articleSlug) {
    const entries = ALL_LANGUAGES.map((code) => `  <link rel="alternate" hreflang="${code}" href="${BASE_URL}/news/${getArticleFilename(articleSlug, code)}">`);
    entries.push(`  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/news/${getArticleFilename(articleSlug, 'en')}">`);
    return entries.join('\n');
}
/**
 * Build the language-switcher nav block for the article header.
 *
 * @param articleSlug - Slug of the form `<date>-<type>` (no extension)
 * @param current - Language currently being rendered (used for active state)
 * @returns HTML fragment containing one `<a class="lang-link">` per language
 */
function buildLanguageSwitcher(articleSlug, current) {
    return ALL_LANGUAGES.map((code) => {
        const flag = getLocalizedString(LANGUAGE_FLAGS, code);
        const name = getLocalizedString(LANGUAGE_NAMES, code);
        const safeName = escapeHTML(name);
        const active = code === current ? ' active' : '';
        const ariaCurrent = code === current ? ' aria-current="page"' : '';
        const href = getArticleFilename(articleSlug, code);
        return `<a href="${href}" class="lang-link${active}" hreflang="${code}" lang="${code}" title="${safeName}" aria-label="${safeName}"${ariaCurrent}>${flag} ${code.toUpperCase()}</a>`;
    }).join('\n        ');
}
/**
 * Resolve a localized title for a TOC entry based on its section ID.
 * Falls back to the original English title if no translation is available.
 *
 * @param sectionId - The fragment identifier of the section
 * @param fallbackTitle - The English title to fall back to
 * @param lang - Target language code
 * @returns Localized title string
 */
function getLocalizedTocTitle(sectionId, fallbackTitle, lang) {
    // Reader Intelligence Guide
    if (sectionId === READER_GUIDE_SECTION_ID) {
        return getLocalizedString(READER_GUIDE_TITLE_LABELS, lang);
    }
    // Tradecraft References appendix
    if (sectionId === TRADECRAFT_SECTION_ID) {
        return getLocalizedString(TRADECRAFT_HEADING_LABELS, lang);
    }
    // Analysis Index appendix
    if (sectionId === MANIFEST_SECTION_ID) {
        return getLocalizedString(ANALYSIS_INDEX_HEADING_LABELS, lang);
    }
    // Key Takeaways
    if (sectionId === KEY_TAKEAWAYS_SECTION_ID) {
        return getLocalizedString(KEY_TAKEAWAYS_HEADING_LABELS, lang);
    }
    // Supplementary Intelligence
    if (sectionId === SUPPLEMENTARY_SECTION_ID) {
        return getLocalizedString(SUPPLEMENTARY_HEADING_LABELS, lang);
    }
    // Artifact section titles (strip the `section-` prefix to find the key)
    const sectionKey = sectionId.replace(/^section-/, '');
    const sectionLabels = SECTION_TITLE_LABELS[sectionKey];
    if (sectionLabels) {
        return getLocalizedString(sectionLabels, lang);
    }
    return fallbackTitle;
}
/**
 * Resolve the visual icon glyph used as the Table-of-Contents bullet for
 * a given section. Reuses {@link getReaderGuideSectionIcon} for the
 * canonical artifact sections (so the TOC and the Reader Intelligence
 * Guide share the same visual vocabulary), and adds dedicated icons for
 * the aggregator-owned appendix anchors that the guide does not list.
 *
 * @param sectionId - Anchor id of the section (e.g. `section-risk`,
 *                    `aggregator-tradecraft-references`)
 * @returns Single emoji glyph used as the `guide-icon` for that entry
 */
function getTocSectionIcon(sectionId) {
    if (sectionId === READER_GUIDE_SECTION_ID)
        return '🧭';
    if (sectionId === KEY_TAKEAWAYS_SECTION_ID)
        return '🔑';
    if (sectionId === SUPPLEMENTARY_SECTION_ID)
        return '🗂️';
    if (sectionId === TRADECRAFT_SECTION_ID)
        return '🛠️';
    if (sectionId === MANIFEST_SECTION_ID)
        return '📚';
    return getReaderGuideSectionIcon(sectionId);
}
/**
 * Build the article-level Table of Contents nav. Renders a labelled
 * `<nav class="article-toc">` with one `<a>` per H2 section, keyed by the
 * stable fragment ids produced by the aggregator. The containing `<aside>`
 * is styled as a sticky, full-height sidebar on wide viewports and
 * collapses into a `<details>` disclosure on narrow viewports via
 * `styles.css`. Each entry is prefixed with a contextual emoji icon so
 * readers can scan the navigation visually as well as textually.
 *
 * Returns an empty string when `entries` is empty so low-signal
 * `ANALYSIS_ONLY` articles (few sections, no value in a TOC) stay compact.
 *
 * @param entries - Ordered list of emitted H2 sections
 * @param lang - Language code used to localise the nav label
 * @returns HTML fragment for the sidebar, or `""` when no TOC is needed
 */
export function buildArticleToc(entries, lang) {
    if (entries.length === 0)
        return '';
    const label = escapeHTML(getLocalizedString(TOC_ARIA_LABELS, lang));
    const items = entries
        .map((e) => {
        const displayTitle = getLocalizedTocTitle(e.id, e.title, lang);
        const icon = getTocSectionIcon(e.id);
        return `        <li><a href="#${escapeHTML(e.id)}"><span class="article-toc-icon" aria-hidden="true">${icon}</span> <span class="article-toc-text">${escapeHTML(displayTitle)}</span></a></li>`;
    })
        .join('\n');
    return [
        `  <aside class="article-toc-container" aria-labelledby="article-toc-heading">`,
        `    <details class="article-toc-details" open>`,
        `      <summary class="article-toc-summary" id="article-toc-heading"><span class="guide-icon" aria-hidden="true">📑</span> ${label}</summary>`,
        `      <nav class="article-toc" aria-labelledby="article-toc-heading">`,
        `        <ol class="article-toc-list">`,
        items,
        `        </ol>`,
        `      </nav>`,
        `    </details>`,
        `  </aside>`,
        '',
    ].join('\n');
}
/**
 * Localize the Tradecraft References and Analysis Index sections in the
 * rendered article body HTML. Replaces English headings, introductions,
 * sub-headings, and table headers with translated equivalents.
 *
 * @param bodyHtml - The rendered HTML body (from Markdown)
 * @param lang - Target language code
 * @returns HTML body with localized appendix sections
 */
export function localizeArticleBody(bodyHtml, lang) {
    if (lang === 'en')
        return bodyHtml;
    let html = bodyHtml;
    // --- Tradecraft References heading ---
    // Use simple string indexOf to avoid polynomial regex backtracking.
    const tradecraftHeading = getLocalizedString(TRADECRAFT_HEADING_LABELS, lang);
    html = replaceHeadingById(html, TRADECRAFT_SECTION_ID, 'Tradecraft References', tradecraftHeading);
    // --- Tradecraft intro paragraph ---
    // The rendered Markdown produces a <p> containing the intro text with an
    // <a> link to Hack23. Replace only the known English sentence prefix.
    // HTML-escape the localized text to prevent injection, then re-insert the
    // intentional <a> tag via a placeholder split.
    const tradecraftIntroRaw = getLocalizedString(TRADECRAFT_INTRO_LABELS, lang);
    const introSentenceStart = 'This article is produced under the ';
    const introIdx = html.indexOf(introSentenceStart);
    if (introIdx !== -1) {
        // Find the end of the sentence (next '</p>' or period followed by '<')
        const sentenceEnd = html.indexOf('</p>', introIdx);
        if (sentenceEnd !== -1) {
            const escapedIntro = escapeHTML(tradecraftIntroRaw);
            const localizedWithLink = escapedIntro.replace(escapeHTML('Hack23 AB'), '<a href="https://hack23.com">Hack23 AB</a>');
            html = html.slice(0, introIdx) + localizedWithLink + html.slice(sentenceEnd);
        }
    }
    // --- Methodologies sub-heading ---
    // markdown-it's anchor plugin renders sub-headings as
    // `<h3 id="methodologies" tabindex="-1"><a class="header-anchor"
    //   href="#methodologies"><span>Methodologies</span></a></h3>`.
    // Localise the inner `<span>Methodologies</span>` text without using
    // regular expressions to avoid catastrophic backtracking on long
    // inputs. We accept either the anchor-prefixed form above or the
    // bare `<h3>Methodologies</h3>` form some renderers emit.
    const methodsLabel = getLocalizedString(TRADECRAFT_METHODOLOGIES_LABELS, lang);
    html = replaceFirstStringIn(html, '<span>Methodologies</span>', `<span>${escapeHTML(methodsLabel)}</span>`);
    html = replaceFirstStringIn(html, '<h3>Methodologies</h3>', `<h3>${escapeHTML(methodsLabel)}</h3>`);
    // --- Artifact templates sub-heading ---
    const templatesLabel = getLocalizedString(TRADECRAFT_TEMPLATES_LABELS, lang);
    html = replaceFirstStringIn(html, '<span>Artifact templates</span>', `<span>${escapeHTML(templatesLabel)}</span>`);
    html = replaceFirstStringIn(html, '<h3>Artifact templates</h3>', `<h3>${escapeHTML(templatesLabel)}</h3>`);
    // --- Analysis Index heading ---
    const analysisIndexHeading = getLocalizedString(ANALYSIS_INDEX_HEADING_LABELS, lang);
    html = replaceHeadingById(html, MANIFEST_SECTION_ID, 'Analysis Index', analysisIndexHeading);
    // --- Analysis Index intro ---
    const analysisIndexIntroRaw = getLocalizedString(ANALYSIS_INDEX_INTRO_LABELS, lang);
    // Use indexOf to find the manifest.json link URL without polynomial regex
    const manifestLinkPrefix = 'href="';
    const manifestJsonLiteral = 'manifest.json';
    const manifestLinkIdx = html.indexOf(manifestJsonLiteral);
    let manifestUrl = '';
    if (manifestLinkIdx !== -1) {
        // Walk backward to find the preceding href="
        const hrefIdx = html.lastIndexOf(manifestLinkPrefix, manifestLinkIdx);
        if (hrefIdx !== -1 && manifestLinkIdx - hrefIdx < 200) {
            const urlStart = hrefIdx + manifestLinkPrefix.length;
            const urlEnd = html.indexOf('"', urlStart);
            if (urlEnd !== -1) {
                manifestUrl = html.slice(urlStart, urlEnd);
            }
        }
    }
    // HTML-escape the localized intro, then re-insert the <a> link
    const escapedAnalysisIntro = escapeHTML(analysisIndexIntroRaw);
    const localizedIntroWithLink = manifestUrl
        ? escapedAnalysisIntro.replace('manifest.json', `<a href="${escapeHTML(manifestUrl)}">manifest.json</a>`)
        : escapedAnalysisIntro;
    // Replace the known English intro sentence using indexOf
    const analysisIntroStart = 'Every artifact below was read by the aggregator';
    const analysisIntroIdx = html.indexOf(analysisIntroStart);
    if (analysisIntroIdx !== -1) {
        const analysisIntroEnd = html.indexOf('gate-result history.', analysisIntroIdx);
        if (analysisIntroEnd !== -1) {
            const endOffset = analysisIntroEnd + 'gate-result history.'.length;
            html = html.slice(0, analysisIntroIdx) + localizedIntroWithLink + html.slice(endOffset);
        }
    }
    // --- Analysis Index table headers ---
    const colSection = getLocalizedString(ANALYSIS_INDEX_COL_SECTION_LABELS, lang);
    const colArtifact = getLocalizedString(ANALYSIS_INDEX_COL_ARTIFACT_LABELS, lang);
    const colPath = getLocalizedString(ANALYSIS_INDEX_COL_PATH_LABELS, lang);
    html = html.replace('<th>Section</th><th>Artifact</th><th>Path</th>', `<th>${escapeHTML(colSection)}</th><th>${escapeHTML(colArtifact)}</th><th>${escapeHTML(colPath)}</th>`);
    // --- Key Takeaways heading ---
    const keyTakeawaysHeading = getLocalizedString(KEY_TAKEAWAYS_HEADING_LABELS, lang);
    html = replaceHeadingById(html, KEY_TAKEAWAYS_SECTION_ID, 'Key Takeaways', keyTakeawaysHeading);
    // --- Supplementary Intelligence heading ---
    const supplementaryHeading = getLocalizedString(SUPPLEMENTARY_HEADING_LABELS, lang);
    html = replaceHeadingById(html, SUPPLEMENTARY_SECTION_ID, 'Supplementary Intelligence', supplementaryHeading);
    return html;
}
/**
 * Replace the first literal occurrence of `needle` in `haystack` with
 * `replacement`. Uses `indexOf` rather than `String.prototype.replace`
 * with a regex so we don't fall foul of the security/detect-unsafe-regex
 * lint rule, and so we never accidentally interpret regex metacharacters
 * inside `needle` or `$1`-style references inside `replacement`.
 *
 * @param haystack - String to search in
 * @param needle - Literal substring to replace
 * @param replacement - Literal replacement text (no `$` escaping needed)
 * @returns Modified string, or `haystack` unchanged when `needle` is absent
 */
function replaceFirstStringIn(haystack, needle, replacement) {
    const idx = haystack.indexOf(needle);
    if (idx === -1)
        return haystack;
    return haystack.slice(0, idx) + replacement + haystack.slice(idx + needle.length);
}
/**
 * Replace an H2 heading's text content by locating it via its `id` attribute.
 * Uses indexOf-based search to avoid polynomial regex backtracking (CodeQL).
 *
 * @param html - Full HTML string
 * @param sectionId - The id attribute value of the target `<h2>`
 * @param englishTitle - The English title text to replace
 * @param localizedTitle - The localized title to insert
 * @returns Updated HTML string
 */
function replaceHeadingById(html, sectionId, englishTitle, localizedTitle) {
    // Find the id attribute in the HTML — this uniquely identifies the heading
    const idMarker = `id="${sectionId}"`;
    let idIdx = html.indexOf(idMarker);
    if (idIdx === -1) {
        // Try single-quoted variant
        const idMarkerSingle = `id='${sectionId}'`;
        idIdx = html.indexOf(idMarkerSingle);
    }
    if (idIdx === -1)
        return html;
    // Find the closing '>' of the opening tag after the id
    const tagCloseIdx = html.indexOf('>', idIdx);
    if (tagCloseIdx === -1)
        return html;
    // The title text starts immediately after '>'
    const titleStart = tagCloseIdx + 1;
    const titleEnd = html.indexOf('<', titleStart);
    if (titleEnd === -1)
        return html;
    // Verify this is actually the English title we expect
    const existingTitle = html.slice(titleStart, titleEnd);
    if (existingTitle.trim() !== englishTitle)
        return html;
    return html.slice(0, titleStart) + escapeHTML(localizedTitle) + html.slice(titleEnd);
}
/* ─── Tradecraft & Analysis Index card-grid enhancement ─────────── */
/**
 * Default emoji used for cards that do not have a curated icon mapped to
 * their stem. Mirrors the fallback used in
 * {@link political-intelligence/html.buildPiCard}.
 */
const DEFAULT_CARD_ICON = '🧭';
/**
 * Curated icon overrides keyed by the methodology / template stem (the
 * filename without the `.md` extension). Mirrors a subset of the icon
 * map used by `generators/political-intelligence/html.ts` so the cards
 * embedded inside news articles match the icons on the dedicated
 * Political Intelligence index page.
 */
const STEM_ICONS = {
    README: '📘',
    'ai-driven-analysis-guide': '🧭',
    'analytical-supplementary-methodology': '🧭',
    'artifact-catalog': '📚',
    'electoral-cycle-methodology': '🗳️',
    'electoral-domain-methodology': '🗳️',
    'forward-projection-methodology': '🔭',
    'imf-indicator-mapping': '💶',
    'osint-tradecraft-standards': '🛳️',
    'per-artifact-methodologies': '🧭',
    'per-document-methodology': '🧭',
    'political-classification-guide': '🏷️',
    'political-risk-methodology': '⚠️',
    'political-style-guide': '✒️',
    'political-swot-framework': '⚖️',
    'political-threat-framework': '🛡️',
    'strategic-extensions-methodology': '🧭',
    'structural-metadata-methodology': '🧭',
    'synthesis-methodology': '🔗',
    'worldbank-indicator-mapping': '🌍',
    'actor-mapping': '🎭',
    'actor-threat-profiles': '🛡️',
    'analysis-index': '📚',
    'coalition-dynamics': '🤝',
    'coalition-mathematics': '🧮',
    'commission-wp-alignment': '📋',
    'comparative-international': '🌐',
    'consequence-trees': '🌳',
    'cross-reference-map': '🗺️',
    'cross-run-diff': '🔁',
    'cross-session-intelligence': '🔁',
    'data-download-manifest': '📦',
    'deep-analysis': '🔍',
    'devils-advocate-analysis': '🪞',
    'economic-context': '💶',
    'executive-brief': '📋',
    'forces-analysis': '⚙️',
    'forward-indicators': '🔭',
    'forward-projection': '🔭',
    'historical-baseline': '📜',
    'historical-parallels': '📜',
    'imf-vintage-audit': '💶',
    'impact-matrix': '📊',
    'implementation-feasibility': '🔧',
    'intelligence-assessment': '🧠',
    'legislative-disruption': '🛡️',
    'legislative-pipeline-forecast': '🛤️',
    'legislative-velocity-risk': '⏱️',
    'mandate-fulfilment-scorecard': '📋',
    'mcp-reliability-audit': '📡',
    'media-framing-analysis': '📰',
    'methodology-reflection': '🪞',
    'parliamentary-calendar-projection': '📅',
    'per-file-political-intelligence': '🧭',
    'pestle-analysis': '🌍',
    'political-capital-risk': '💼',
    'political-classification': '🏷️',
    'political-threat-landscape': '🛡️',
    'presidency-trio-context': '🇪🇺',
    'quantitative-swot': '⚖️',
    'reference-analysis-quality': '✅',
    'risk-assessment': '⚠️',
    'risk-matrix': '⚠️',
    'scenario-forecast': '🔮',
    'seat-projection': '🪑',
    'session-baseline': '📊',
    'significance-classification': '⚖️',
    'significance-scoring': '⚖️',
    'stakeholder-impact': '👥',
    'stakeholder-map': '👥',
    'swot-analysis': '⚖️',
    'synthesis-summary': '🔗',
    'term-arc': '🗳️',
    'threat-analysis': '🛡️',
    'threat-model': '🛡️',
    'voter-segmentation': '👥',
    'voting-patterns': '🤝',
    'wildcards-blackswans': '⚡',
    'workflow-audit': '🔧',
};
/**
 * Resolve the icon for a tradecraft / artifact card by file stem.
 *
 * @param stem - File stem (filename without `.md`)
 * @returns Single emoji glyph for the card icon
 */
function getStemIcon(stem) {
    return STEM_ICONS[stem] ?? DEFAULT_CARD_ICON;
}
/**
 * Extract `<a href="…">label</a>` link tokens from the slice of HTML
 * between two indices. Used to harvest the methodology / template list
 * the Markdown renderer emitted as `<ul><li><a>…</a></li>…</ul>` so we
 * can re-render it as a card grid.
 *
 * Anchors whose `href` does not point at an `analysis/<methodologies|
 * templates>/<…>.md` blob URL are silently skipped — the tradecraft
 * appendix only contains those, and any stray external link (e.g. the
 * Hack23 URL inside the intro paragraph) must not be promoted to a card.
 *
 * @param html - HTML slice to scan
 * @param expectedPrefix - Path prefix (e.g. `analysis/methodologies/`)
 * @returns List of extracted `{ href, repoRelPath }` tuples
 */
function extractTradecraftLinks(html, expectedPrefix) {
    const out = [];
    // Walk anchor tags one at a time using indexOf to avoid catastrophic
    // backtracking on long inputs (CodeQL js/polynomial-redos).
    let cursor = 0;
    while (cursor < html.length) {
        const aIdx = html.indexOf('<a ', cursor);
        if (aIdx === -1)
            break;
        const hrefIdx = html.indexOf('href="', aIdx);
        if (hrefIdx === -1)
            break;
        const urlStart = hrefIdx + 'href="'.length;
        const urlEnd = html.indexOf('"', urlStart);
        if (urlEnd === -1)
            break;
        const href = html.slice(urlStart, urlEnd);
        const closeIdx = html.indexOf('>', urlEnd);
        if (closeIdx === -1)
            break;
        const endIdx = html.indexOf('</a>', closeIdx);
        if (endIdx === -1)
            break;
        cursor = endIdx + '</a>'.length;
        // Only keep links pointing at the expected analysis/* path under the
        // GitHub blob URL — every other anchor is intro chrome.
        const blobMarker = `/blob/main/${expectedPrefix}`;
        const blobIdx = href.indexOf(blobMarker);
        if (blobIdx === -1)
            continue;
        const repoRelPath = href.slice(blobIdx + '/blob/main/'.length);
        out.push({ href, repoRelPath });
    }
    return out;
}
/**
 * Render a single tradecraft / artifact card. Mirrors the structure
 * used on `political-intelligence.html` so the visual vocabulary stays
 * consistent (same `.pi-card-grid`, `.pi-card`, `.pi-card__icon`,
 * `.pi-card__body`, `.pi-card__title`, `.pi-card__desc`,
 * `.pi-card__cta` class hooks).
 *
 * The `.pi-card__path` filename row that the political-intelligence
 * page emits is intentionally omitted here — inside an article body the
 * curated title plus the curated description already convey the
 * artifact's purpose, and the raw `analysis/.../foo.md` filename adds
 * visual noise without providing reader-relevant context. Readers who
 * need the path can hover the card link or click through.
 *
 * The CTA is kind-aware ("View methodology" for the Methodologies
 * sub-section, "View artifact template" for the Artifact templates
 * sub-section) — the older generic "View on GitHub" leaked workflow
 * jargon into a reader-facing surface and provided no context about
 * what the link targets.
 *
 * @param link - Extracted link with absolute href + repo-relative path
 * @param lang - Target language code for title/description lookup
 * @param ctaLabel - Pre-resolved localised CTA text (kind-aware)
 * @returns HTML fragment for one `<li class="pi-card">…</li>` element
 */
function renderTradecraftCard(link, lang, ctaLabel) {
    const stem = link.repoRelPath.split('/').pop()?.replace(/\.md$/i, '') ?? link.repoRelPath;
    // Use the humanised stem (e.g. "Electoral Cycle Methodology") as the
    // fallback title, matching how the political-intelligence page
    // resolves titles for files without a curated entry. The previous
    // raw-stem fallback ("electoral-cycle-methodology") leaked filename
    // noise into reader-facing card titles.
    const fallbackTitle = humanizeStem(stem);
    const title = getCuratedTitle(link.repoRelPath, lang, fallbackTitle);
    const description = getCuratedDescription(link.repoRelPath, lang, fallbackTitle);
    const icon = getStemIcon(stem);
    return [
        `          <li class="pi-card">`,
        `            <a class="pi-card__link" href="${escapeHTML(link.href)}" rel="noopener external" target="_blank">`,
        `              <span class="pi-card__icon" aria-hidden="true">${icon}</span>`,
        `              <span class="pi-card__body">`,
        `                <span class="pi-card__title">${escapeHTML(title)}</span>`,
        `                <span class="pi-card__desc">${escapeHTML(description)}</span>`,
        `                <span class="pi-card__cta">${escapeHTML(ctaLabel)} <span aria-hidden="true">↗</span></span>`,
        `              </span>`,
        `            </a>`,
        `          </li>`,
    ].join('\n');
}
/**
 * Localised "View methodology" CTA used on every Tradecraft References
 * methodology card. Tells the reader exactly what the link surface
 * targets — a methodology guide — so the call-to-action is informative
 * even when the card is read in isolation.
 *
 * @param lang - Target language code
 * @returns Localised CTA text
 */
function getViewMethodologyLabel(lang) {
    const labels = {
        en: 'View methodology',
        sv: 'Visa metodologi',
        da: 'Se metode',
        no: 'Se metodologi',
        fi: 'Näytä metodologia',
        de: 'Methodologie ansehen',
        fr: 'Voir la méthodologie',
        es: 'Ver metodología',
        nl: 'Methodologie bekijken',
        ar: 'عرض المنهجية',
        he: 'הצג מתודולוגיה',
        ja: '方法論を表示',
        ko: '방법론 보기',
        zh: '查看方法论',
    };
    return labels[lang] ?? labels.en ?? 'View methodology';
}
/**
 * Localised "View artifact template" CTA used on every Tradecraft
 * References artifact-template card. Tells the reader exactly what the
 * link surface targets — a structured template that defines the shape
 * of the artifact behind the article.
 *
 * @param lang - Target language code
 * @returns Localised CTA text
 */
function getViewTemplateLabel(lang) {
    const labels = {
        en: 'View artifact template',
        sv: 'Visa artefaktmall',
        da: 'Se artefaktskabelon',
        no: 'Se artefaktmal',
        fi: 'Näytä artefaktipohja',
        de: 'Artefaktvorlage ansehen',
        fr: 'Voir le modèle d’artefact',
        es: 'Ver plantilla de artefacto',
        nl: 'Artefactsjabloon bekijken',
        ar: 'عرض قالب القطعة',
        he: 'הצג תבנית פריט',
        ja: 'アーティファクト テンプレートを表示',
        ko: '아티팩트 템플릿 보기',
        zh: '查看构件模板',
    };
    return labels[lang] ?? labels.en ?? 'View artifact template';
}
/**
 * Localised "View artifact" CTA used on every Analysis Index card.
 * Tells the reader the link opens a specific committed artifact from
 * this article's analysis run on GitHub, providing audit context that
 * the older generic "View on GitHub" CTA lacked.
 *
 * @param lang - Target language code
 * @returns Localised CTA text
 */
function getViewArtifactLabel(lang) {
    const labels = {
        en: 'View artifact',
        sv: 'Visa artefakt',
        da: 'Se artefakt',
        no: 'Se artefakt',
        fi: 'Näytä artefakti',
        de: 'Artefakt ansehen',
        fr: 'Voir l’artefact',
        es: 'Ver artefacto',
        nl: 'Artefact bekijken',
        ar: 'عرض القطعة',
        he: 'הצג פריט',
        ja: 'アーティファクトを表示',
        ko: '아티팩트 보기',
        zh: '查看构件',
    };
    return labels[lang] ?? labels.en ?? 'View artifact';
}
/**
 * Replace the `<ul>` block that follows a sub-heading with a card-grid
 * `<ul class="pi-card-grid">` rendering. Matching is bounded to the
 * first `<ul>` that appears after `searchFromIdx` and that closes with
 * `</ul>` — so the function is safe to call on partial HTML.
 *
 * @param html - HTML to transform
 * @param searchFromIdx - Index after which the first `<ul>` is located
 * @param cardsHtml - Pre-rendered `<li class="pi-card">…</li>` joined by `\n`
 * @returns `{ html, endIdx }` with the new HTML and the index just after
 *          the inserted card grid (so successive calls can chain)
 */
function replaceFollowingUlWithCardGrid(html, searchFromIdx, cardsHtml) {
    const ulIdx = html.indexOf('<ul>', searchFromIdx);
    if (ulIdx === -1)
        return { html, endIdx: searchFromIdx };
    const ulEnd = html.indexOf('</ul>', ulIdx);
    if (ulEnd === -1)
        return { html, endIdx: searchFromIdx };
    const replacement = `<ul class="pi-card-grid">\n${cardsHtml}\n        </ul>`;
    const closeIdx = ulEnd + '</ul>'.length;
    const next = html.slice(0, ulIdx) + replacement + html.slice(closeIdx);
    return { html: next, endIdx: ulIdx + replacement.length };
}
/**
 * Replace the rendered Tradecraft References bullet lists with a
 * `pi-card-grid` of richly described cards (icon, curated title,
 * curated description, kind-aware CTA). The cards reuse the exact same
 * class hooks as `political-intelligence.html`, so the site-wide CSS
 * already styles them — no additional CSS is required.
 *
 * After the April-2026 reorder the rendered Markdown emits Artifact
 * templates as the first sub-heading and Methodologies as the second,
 * matching how readers encounter the run (artifacts first, methodology
 * library second). The card upgrade follows the same order so the H3
 * positions stay aligned with the kind-aware CTA labels.
 *
 * Falls back to the original Markdown-rendered list when the expected
 * structure (H2 → intro paragraph → Artifact-templates sub-heading →
 * `<ul>` → Methodologies sub-heading → `<ul>`) is missing, so partially
 * stripped or unusual articles are not silently corrupted.
 *
 * @param bodyHtml - The (already-localised) article body HTML
 * @param lang - Target language code for curated titles/descriptions
 * @returns Body HTML with the tradecraft section upgraded to cards
 */
export function enhanceTradecraftCards(bodyHtml, lang) {
    const anchorIdx = bodyHtml.indexOf(`id="${TRADECRAFT_SECTION_ID}"`);
    if (anchorIdx === -1)
        return bodyHtml;
    // The next H2 marks the end of the tradecraft section.
    const nextH2 = bodyHtml.indexOf('<h2 ', anchorIdx + 1);
    const sectionEnd = nextH2 === -1 ? bodyHtml.length : nextH2;
    const section = bodyHtml.slice(anchorIdx, sectionEnd);
    // Harvest the methodology + template links from the rendered HTML.
    const methodLinks = extractTradecraftLinks(section, 'analysis/methodologies/');
    const templateLinks = extractTradecraftLinks(section, 'analysis/templates/');
    if (methodLinks.length === 0 && templateLinks.length === 0)
        return bodyHtml;
    const methodCta = getViewMethodologyLabel(lang);
    const templateCta = getViewTemplateLabel(lang);
    let next = bodyHtml;
    // Replace Artifact-templates <ul> first, then the Methodologies <ul>.
    // Use the returned end index from the first replacement to seed the
    // search for the second <ul> so we never double-replace.
    // Note: markdown-it adds `id` and `tabindex` attributes to headings
    // (`<h3 id="artifact-templates" tabindex="-1">…`), so we search for
    // `<h3` (no terminator) rather than `<h3>` to match either form.
    const firstHeadingIdx = next.indexOf('<h3', anchorIdx);
    if (firstHeadingIdx !== -1 && templateLinks.length > 0) {
        const templateCards = templateLinks
            .map((l) => renderTradecraftCard(l, lang, templateCta))
            .join('\n');
        const result = replaceFollowingUlWithCardGrid(next, firstHeadingIdx, templateCards);
        next = result.html;
    }
    const secondHeadingSearchStart = next.indexOf(`id="${TRADECRAFT_SECTION_ID}"`);
    if (secondHeadingSearchStart !== -1 && methodLinks.length > 0) {
        // Find the second <h3 after the tradecraft anchor (Artifact templates
        // is the first; Methodologies is the second).
        const firstH3 = next.indexOf('<h3', secondHeadingSearchStart);
        if (firstH3 !== -1) {
            const secondH3 = next.indexOf('<h3', firstH3 + 1);
            if (secondH3 !== -1) {
                const methodCards = methodLinks
                    .map((l) => renderTradecraftCard(l, lang, methodCta))
                    .join('\n');
                const result = replaceFollowingUlWithCardGrid(next, secondH3, methodCards);
                next = result.html;
            }
        }
    }
    return next;
}
/**
 * Replace the Analysis Index `<table>` with a `pi-card-grid` of cards,
 * one per included artifact. Each card renders the artifact's curated
 * localised title + description, the section it contributed to, the
 * run-relative path as inline `<code>`, and a "View on GitHub" CTA.
 *
 * Strategy: parse the rendered table's `<tbody>` rows (each row carries
 * `[sectionId, <a href="…">stem</a>, runRelPath]`) and re-render the
 * region between the table's opening wrapper and `</table>` as a card
 * grid. The wrapping `<div class="table-scroll">` is dropped because
 * the card grid handles its own responsive layout via flex/grid.
 *
 * @param bodyHtml - Article body HTML
 * @param lang - Target language code
 * @returns Body HTML with the Analysis Index upgraded to a card grid
 */
export function enhanceAnalysisIndexCards(bodyHtml, lang) {
    const anchorIdx = bodyHtml.indexOf(`id="${MANIFEST_SECTION_ID}"`);
    if (anchorIdx === -1)
        return bodyHtml;
    // Locate the table and its end.
    const tableIdx = bodyHtml.indexOf('<table>', anchorIdx);
    if (tableIdx === -1)
        return bodyHtml;
    const tableEnd = bodyHtml.indexOf('</table>', tableIdx);
    if (tableEnd === -1)
        return bodyHtml;
    const tableHtml = bodyHtml.slice(tableIdx, tableEnd + '</table>'.length);
    const rows = parseAnalysisIndexRows(tableHtml);
    if (rows.length === 0)
        return bodyHtml;
    const cards = rows.map((row) => renderAnalysisIndexCard(row, lang)).join('\n');
    // Walk back to the start of the wrapping <div class="table-scroll"> if
    // present, so we replace the responsive wrapper too.
    const wrapperOpen = bodyHtml.lastIndexOf('<div class="table-scroll"', tableIdx);
    const replaceFrom = wrapperOpen !== -1 && wrapperOpen > anchorIdx ? wrapperOpen : tableIdx;
    // Walk forward past the matching </div> when we kicked off from the
    // wrapper, otherwise stop right after </table>.
    let replaceTo = tableEnd + '</table>'.length;
    if (wrapperOpen !== -1 && wrapperOpen > anchorIdx) {
        const wrapperClose = bodyHtml.indexOf('</div>', tableEnd);
        if (wrapperClose !== -1)
            replaceTo = wrapperClose + '</div>'.length;
    }
    const replacement = `<ul class="pi-card-grid analysis-index-grid">\n${cards}\n        </ul>`;
    return bodyHtml.slice(0, replaceFrom) + replacement + bodyHtml.slice(replaceTo);
}
/**
 * Parse the `<tbody>` rows of the rendered Analysis Index table. Each
 * row has the shape `<tr><td>section-id</td><td><a href="…">stem</a>
 * </td><td><code>relPath</code></td></tr>`.
 *
 * @param tableHtml - Slice of HTML from `<table>` to `</table>`
 * @returns Parsed rows (skipping malformed ones)
 */
function parseAnalysisIndexRows(tableHtml) {
    const out = [];
    let cursor = 0;
    while (cursor < tableHtml.length) {
        const trIdx = tableHtml.indexOf('<tr>', cursor);
        if (trIdx === -1)
            break;
        const trEnd = tableHtml.indexOf('</tr>', trIdx);
        if (trEnd === -1)
            break;
        const row = tableHtml.slice(trIdx, trEnd);
        cursor = trEnd + '</tr>'.length;
        // Skip the header row (which only has <th> not <td>).
        if (row.indexOf('<td>') === -1)
            continue;
        const cells = parseRowCells(row);
        if (cells.length < 3)
            continue;
        const anchorMatch = parseAnchor(cells[1] ?? '');
        if (!anchorMatch)
            continue;
        const runRelPath = stripCodeWrapper(cells[2] ?? '');
        out.push({
            sectionId: (cells[0] ?? '').trim(),
            anchorText: anchorMatch.text,
            href: anchorMatch.href,
            runRelPath,
        });
    }
    return out;
}
/**
 * Extract the `<td>…</td>` cell contents from a single `<tr>…</tr>`
 * fragment. Uses `indexOf` to avoid backtracking.
 *
 * @param row - HTML for one row (no `</tr>` terminator required)
 * @returns Array of inner-HTML strings, one per `<td>`
 */
function parseRowCells(row) {
    const cells = [];
    let cursor = 0;
    while (cursor < row.length) {
        const tdIdx = row.indexOf('<td>', cursor);
        if (tdIdx === -1)
            break;
        const tdEnd = row.indexOf('</td>', tdIdx);
        if (tdEnd === -1)
            break;
        cells.push(row.slice(tdIdx + '<td>'.length, tdEnd));
        cursor = tdEnd + '</td>'.length;
    }
    return cells;
}
/**
 * Parse a single `<a href="…">text</a>` token out of a cell. Returns
 * `null` when the cell does not contain an anchor (e.g. a plain string).
 *
 * @param cell - Inner-HTML of the `<td>` cell
 * @returns Parsed anchor or `null`
 */
function parseAnchor(cell) {
    const aIdx = cell.indexOf('<a ');
    if (aIdx === -1)
        return null;
    const hrefIdx = cell.indexOf('href="', aIdx);
    if (hrefIdx === -1)
        return null;
    const urlStart = hrefIdx + 'href="'.length;
    const urlEnd = cell.indexOf('"', urlStart);
    if (urlEnd === -1)
        return null;
    const closeOpenTag = cell.indexOf('>', urlEnd);
    if (closeOpenTag === -1)
        return null;
    const closeIdx = cell.indexOf('</a>', closeOpenTag);
    if (closeIdx === -1)
        return null;
    return {
        href: cell.slice(urlStart, urlEnd),
        text: cell.slice(closeOpenTag + 1, closeIdx),
    };
}
/**
 * Strip the `<code>…</code>` wrapper added by the Markdown renderer
 * around the run-relative path cell.
 *
 * @param cell - Cell inner-HTML (possibly `<code>foo.md</code>`)
 * @returns Plain text without code formatting
 */
function stripCodeWrapper(cell) {
    const start = cell.indexOf('<code>');
    if (start === -1)
        return cell.trim();
    const end = cell.indexOf('</code>', start);
    if (end === -1)
        return cell.trim();
    return cell.slice(start + '<code>'.length, end).trim();
}
/**
 * Render one Analysis Index card. Reuses the `pi-card` class hooks so
 * the card-grid sits naturally next to the methodology / template
 * cards in the same article.
 *
 * @param row - Parsed Analysis Index row
 * @param lang - Target language code
 * @returns HTML fragment for one `<li class="pi-card">…</li>`
 */
function renderAnalysisIndexCard(row, lang) {
    const info = getArtifactInfo(row.runRelPath, lang);
    const stem = row.runRelPath.split('/').pop()?.replace(/\.md$/i, '') ?? row.runRelPath;
    const icon = getStemIcon(stem);
    // Reuse the section-title localisation already used by the TOC so the
    // "Section: …" badge reads naturally in every language.
    const sectionLabel = getLocalizedTocTitle(row.sectionId, row.sectionId, lang);
    // Drop the redundant `<code>analysis/.../foo.md</code>` filename row —
    // the curated title + curated description plus the section badge
    // already convey what the artifact is and where it sits in the
    // article. The kind-aware "View artifact" CTA tells the reader the
    // link opens the underlying committed artifact on GitHub.
    return [
        `          <li class="pi-card">`,
        `            <a class="pi-card__link" href="${escapeHTML(row.href)}" rel="noopener external" target="_blank">`,
        `              <span class="pi-card__icon" aria-hidden="true">${icon}</span>`,
        `              <span class="pi-card__body">`,
        `                <span class="pi-card__title">${escapeHTML(info.title)}</span>`,
        `                <span class="pi-card__desc">${escapeHTML(info.description)}</span>`,
        `                <span class="pi-card__meta"><span class="pi-card__section-badge">${escapeHTML(sectionLabel)}</span></span>`,
        `                <span class="pi-card__cta">${escapeHTML(getViewArtifactLabel(lang))} <span aria-hidden="true">↗</span></span>`,
        `              </span>`,
        `            </a>`,
        `          </li>`,
    ].join('\n');
}
/**
 * Render the full article HTML document with the shared chrome.
 *
 * @param options - {@link WrapArticleOptions} describing the article and its
 *                  rendered body content
 * @returns Complete `<!DOCTYPE html>` document ready to be written to disk
 */
export function wrapArticleHtml(options) {
    const safeLang = ALL_LANGUAGES.includes(options.lang) ? options.lang : 'en';
    const dir = getTextDirection(safeLang);
    const siteTitle = getLocalizedString(PAGE_TITLES, safeLang).split(' - ')[0] ?? SITE_NAME;
    const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, safeLang);
    const canonicalUrl = `${BASE_URL}/news/${getArticleFilename(options.articleSlug, safeLang)}`;
    const indexHref = safeLang === 'en' ? '../index.html' : `../index-${safeLang}.html`;
    const hreflangLinks = buildArticleHreflangLinks(options.articleSlug);
    const langSwitcher = buildLanguageSwitcher(options.articleSlug, safeLang);
    const sourceMdLabel = getLocalizedString(VIEW_SOURCE_MARKDOWN_LABELS, safeLang);
    const articleNavLabel = getLocalizedString(ARTICLE_NAV_LABELS, safeLang);
    const backToNewsLabel = getLocalizedString(BACK_TO_NEWS_LABELS, safeLang);
    const politicalIntelligenceLabel = getLocalizedString(FOOTER_POLITICAL_INTELLIGENCE_LABELS, safeLang);
    const sitemapLabel = getLocalizedString(FOOTER_SITEMAP_LABELS, safeLang);
    const politicalIntelligenceHref = `../${getPoliticalIntelligenceFilename(safeLang)}`;
    const sitemapHref = `../${getSitemapFilename(safeLang)}`;
    const sourceMdLink = options.sourceMarkdownRelPath
        ? `<p class="article-source-md"><a href="${BASE_URL}/${options.sourceMarkdownRelPath}" rel="alternate" type="text/markdown"><svg class="icon icon-inline" width="16" height="16" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><path d="M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2M12 3h6a2 2 0 0 1 2 2v6M10 14 20 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> ${escapeHTML(sourceMdLabel)}</a></p>`
        : '';
    const tocHtml = buildArticleToc(options.toc ?? [], safeLang);
    const articleMainClass = tocHtml.length > 0 ? 'article-main--with-toc' : 'article-main--no-toc';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: options.title,
        description: options.description,
        datePublished: options.date,
        dateModified: options.date,
        inLanguage: safeLang,
        url: canonicalUrl,
        image: `${BASE_URL}/images/og-image.jpg`,
        author: { '@type': 'Organization', name: PUBLISHER_NAME, url: 'https://hack23.com' },
        publisher: {
            '@type': 'Organization',
            name: PUBLISHER_NAME,
            url: 'https://hack23.com',
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/images/apple-touch-icon.png` },
        },
        articleSection: options.articleType,
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: BASE_URL,
        },
        ...(options.isBasedOn && options.isBasedOn.length > 0
            ? {
                isBasedOn: options.isBasedOn.map((url) => ({ '@type': 'CreativeWork', url })),
            }
            : {}),
    };
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: SITE_NAME,
                item: BASE_URL,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: options.articleType.replace(/-/g, ' '),
                item: `${BASE_URL}/news/`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: options.title,
                item: canonicalUrl,
            },
        ],
    };
    const structuredData = [jsonLd, breadcrumbLd];
    const jsonLdString = JSON.stringify(structuredData).replace(/</g, '\\u003c');
    const pageTitle = `${options.title} — ${siteTitle}`;
    const header = buildSiteHeader({
        lang: safeLang,
        pathPrefix: '../',
        homeHref: indexHref,
        siteTitle,
        languageSwitcherHtml: langSwitcher,
    });
    return `<!DOCTYPE html>
<html lang="${safeLang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="Content-Language" content="${safeLang}">
  <meta name="referrer" content="no-referrer">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(options.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="author" content="${PUBLISHER_NAME}">
  <meta name="publisher" content="${PUBLISHER_NAME}">
  <meta name="date" content="${options.date}">
  <meta name="article:published_time" content="${options.date}">
  <link rel="canonical" href="${canonicalUrl}">
${hreflangLinks}
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHTML(options.title)}">
  <meta property="og:description" content="${escapeHTML(options.description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${safeLang}">
  <meta property="og:image" content="${BASE_URL}/images/og-image.jpg">
  <meta property="og:image:alt" content="${escapeHTML(options.title)} — EU Parliament Monitor">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHTML(options.title)}">
  <meta name="twitter:description" content="${escapeHTML(options.description)}">
  <meta name="twitter:image" content="${BASE_URL}/images/og-image.jpg">
  <link rel="icon" type="image/x-icon" href="../favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png">
  <link rel="manifest" href="../site.webmanifest">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#003399" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0a1a38" media="(prefers-color-scheme: dark)">
  <link rel="stylesheet" href="../styles.css?v=${BUILD_SHORT}">
${buildHeadFreshnessTags('../')}
  <script type="application/ld+json">${jsonLdString}</script>
  <script type="module" src="../js/mermaid-init.js?v=${MERMAID_VERSION}" defer></script>
  <script src="../js/article-runtime.js" defer></script>
</head>
<body>
  <a href="#main" class="skip-link">${escapeHTML(skipLinkText)}</a>
  <div class="reading-progress" aria-hidden="true"></div>

  ${header}

  ${buildPageBanner('../')}

  <main id="main" class="site-main article-main ${articleMainClass}">
    <nav class="article-top-nav" aria-label="${escapeHTML(articleNavLabel)}">
      <a class="article-top-nav__link article-top-nav__link--primary" href="${indexHref}">${escapeHTML(backToNewsLabel)}</a>
      <a class="article-top-nav__link" href="${politicalIntelligenceHref}">🧠 ${escapeHTML(politicalIntelligenceLabel)}</a>
      <a class="article-top-nav__link" href="${sitemapHref}">🗺️ ${escapeHTML(sitemapLabel)}</a>
    </nav>
${tocHtml}    <article class="article-body" lang="${safeLang}">
      <header class="article-hero">
        <p class="article-kicker">${escapeHTML(getLocalizedArticleType(options.articleType, safeLang))}</p>
        <h1>${escapeHTML(options.title)}</h1>
        <p class="article-dek">${escapeHTML(options.description)}</p>
        <p class="article-meta"><time datetime="${options.date}">${options.date}</time> · EU Parliament Monitor</p>
      </header>
      ${sourceMdLink}
      ${options.body}
    </article>
  </main>

  ${buildSiteFooter({ lang: safeLang, pathPrefix: '../', ...(typeof options.articleCount === 'number' ? { articleCount: options.articleCount } : {}) })}
</body>
</html>`;
}
//# sourceMappingURL=article-html.js.map