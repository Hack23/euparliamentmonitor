// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/HTML
 * @description HTML rendering for the political-intelligence landing
 * page. Lifted out of the monolithic `political-intelligence.ts` so
 * the rendering layer (~400 LOC of card/run templates plus the
 * full-page chrome) can be tested in isolation against the curated-
 * description and copy modules.
 *
 * The page is a static HTML document — no client-side hydration. Every
 * link points at GitHub blob/tree URLs so readers can audit the raw
 * tradecraft behind every published article.
 */

import { BASE_URL, THEME_TOGGLE_SCRIPT } from '../../constants/config.js';
import { buildHeadFreshnessTags } from '../../constants/build-info-meta.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  PAGE_TITLES,
  SKIP_LINK_TEXTS,
  UPDATE_AVAILABLE_LABELS,
  UPDATE_REFRESH_CTA_LABELS,
  UPDATE_DISMISS_LABELS,
  getLocalizedString,
  getTextDirection,
} from '../../constants/languages.js';
import { FOOTER_SITEMAP_LABELS } from '../../constants/language-ui.js';
import {
  buildSiteFooter,
  buildSiteHeader,
  buildPageBanner,
} from '../../templates/section-builders.js';
import { escapeHTML } from '../../utils/file-utils.js';
import { blobUrl, treeUrl } from '../../aggregator/infra/github-urls.js';
import type { LanguageCode } from '../../types/index.js';
import {
  getCuratedDescription,
  getCuratedTitle,
  getRunTypeInfo,
  getArtifactInfo,
} from '../political-intelligence-descriptions.js';
import { pickDocumentIcon } from './icons.js';
import { getPICopy, type PICopy } from './copy.js';
import { getPoliticalIntelligenceSeo } from '../seo-copy.js';
import type { PIDocument, PIDailyDateGroup, PIDailyRun, PIPageData } from './types.js';

/**
 * Build a GitHub blob URL (single file) on the main branch.
 *
 * Thin alias for the canonical `blobUrl` helper in
 * `aggregator/infra/github-urls.ts` so existing call sites in this
 * module keep their concise local naming. The argument is the
 * repository-relative path (e.g. `analysis/methodologies/foo.md`).
 *
 * @param relPath - Path relative to the repository root
 * @returns Fully-qualified GitHub blob URL
 */
function githubBlobUrl(relPath: string): string {
  return blobUrl(relPath);
}

/**
 * Build a GitHub tree URL (folder view) on the main branch.
 *
 * Thin alias for the canonical `treeUrl` helper. Used by the daily-run
 * cards to link to the full run directory on GitHub so readers can
 * inspect every artifact file in one click.
 *
 * @param relPath - Path relative to the repository root
 * @returns Fully-qualified GitHub tree URL
 */
function githubTreeUrl(relPath: string): string {
  return treeUrl(relPath);
}

/**
 * Build the localized political-intelligence filename for the given
 * language. English is published at the canonical
 * `political-intelligence.html`; every other supported locale gets a
 * suffixed variant such as `political-intelligence_sv.html`.
 *
 * @param lang - Language code
 * @returns Bare filename (no path prefix)
 */
export function getPoliticalIntelligenceFilename(lang: string): string {
  return lang === 'en' ? 'political-intelligence.html' : `political-intelligence_${lang}.html`;
}

const SCHEMA_ORG = 'https://schema.org';
const SITE_NAME = 'EU Parliament Monitor';

/**
 * Render a single document card (used for methodologies, templates, references).
 *
 * The description comes from the curated per-file, per-language table
 * ({@link getCuratedDescription}) — not from the Markdown source file —
 * so every language page carries a meaningful, hand-written summary.
 *
 * @param doc - The document to render
 * @param lang - Target language code (drives per-language description lookup)
 * @param viewOnGitHub - Localized call-to-action label
 * @returns HTML string for the card `<li>` element
 */
function renderDocumentCard(doc: PIDocument, lang: LanguageCode, viewOnGitHub: string): string {
  const url = githubBlobUrl(doc.relPath);
  const title = getCuratedTitle(doc.relPath, lang, doc.title);
  const description = getCuratedDescription(doc.relPath, lang, doc.title);
  const desc = description ? `<span class="pi-card__desc">${escapeHTML(description)}</span>` : '';
  return `          <li class="pi-card">
            <a class="pi-card__link" href="${escapeHTML(url)}" rel="noopener external" target="_blank">
              <span class="pi-card__icon" aria-hidden="true">${doc.icon}</span>
              <span class="pi-card__body">
                <span class="pi-card__title">${escapeHTML(title)}</span>
                <span class="pi-card__path"><code>${escapeHTML(doc.relPath)}</code></span>
                ${desc}
                <span class="pi-card__cta">${escapeHTML(viewOnGitHub)} <span aria-hidden="true">↗</span></span>
              </span>
            </a>
          </li>`;
}

/**
 * Render one daily date group (header + run cards).
 *
 * Each run card is a flex row that links to the run folder on GitHub; below
 * it a collapsed `<details>` lists every individual artifact file with a
 * direct blob URL, so readers can deep-link to a single artifact without
 * first navigating the folder tree.
 *
 * @param group - The date group to render
 * @param copy - Localized copy for labels inside the group
 * @param lang - Target language code propagated to each run card
 * @returns HTML string for the `<section>` containing all runs for the date
 */
function renderDailyGroup(group: PIDailyDateGroup, copy: PICopy, lang: LanguageCode): string {
  const runsCountText =
    group.runs.length === 1
      ? copy.runsCountLabelSingular
      : copy.runsCountLabel.replace('{count}', String(group.runs.length));
  const runCards = group.runs.map((run) => renderDailyRun(run, copy, lang)).join('\n');
  return `        <section class="pi-date-group" aria-labelledby="date-${escapeHTML(group.date)}">
          <h3 id="date-${escapeHTML(group.date)}" class="pi-date-group__heading">
            <time datetime="${escapeHTML(group.date)}">${escapeHTML(group.date)}</time>
            <span class="pi-date-group__count">${escapeHTML(runsCountText)}</span>
          </h3>
          <ul class="pi-run-list">
${runCards}
          </ul>
        </section>`;
}

/**
 * Render a single daily-run entry: the run-folder link plus a collapsed
 * `<details>` list of every Markdown artifact inside the run, each linking
 * to its GitHub blob URL.
 *
 * Each run card surfaces a localized run-type title (e.g. "Breaking News
 * Analysis") and description from {@link getRunTypeInfo}, and each artifact
 * row inside the `<details>` is a rich card with:
 *   - icon from {@link pickDocumentIcon}
 *   - localized humanized title + description from {@link getArtifactInfo}
 *   - filename code pill for auditability
 *
 * @param run - Run descriptor produced by {@link collectDailyGroups}
 * @param copy - Localized copy for artifact-count and toggle labels
 * @param lang - Target language code for run/artifact titles & descriptions
 * @returns HTML string for the `<li>` element
 */
function renderDailyRun(run: PIDailyRun, copy: PICopy, lang: LanguageCode): string {
  const url = githubTreeUrl(run.relPath);
  const countLabel =
    run.artifactCount === 1
      ? copy.artifactCountLabelSingular
      : copy.artifactCountLabel.replace('{count}', String(run.artifactCount));
  const toggleLabel =
    run.artifactCount === 1
      ? copy.artifactsToggleLabelSingular
      : copy.artifactsToggleLabel.replace('{count}', String(run.artifactCount));
  const runInfo = getRunTypeInfo(run.slug, lang);
  const runIdBadge = runInfo.runId
    ? `<span class="pi-run__runid" aria-hidden="true">#${escapeHTML(runInfo.runId)}</span>`
    : '';
  const runDescHtml = runInfo.description
    ? `<span class="pi-run__desc">${escapeHTML(runInfo.description)}</span>`
    : '';
  const artifactCards = run.artifacts
    .map((art) => {
      const info = getArtifactInfo(art.shortPath, lang);
      const base = art.shortPath.split('/').pop() ?? art.shortPath;
      // Strip both the final extension (`.md`) and an optional `.analysis`
      // compound suffix so `political-landscape.analysis.md` feeds
      // `political-landscape` into `pickDocumentIcon()` — matching the
      // stem canonicalization done by `getArtifactInfo`.
      const stem = base.replace(/\.[^.]+$/, '').replace(/\.analysis$/, '');
      const icon = pickDocumentIcon(stem);
      const blobUrl = githubBlobUrl(art.relPath);
      return `                  <li class="pi-artifact">
                    <a class="pi-artifact__link" href="${escapeHTML(blobUrl)}" rel="noopener external" target="_blank">
                      <span class="pi-artifact__icon" aria-hidden="true">${icon}</span>
                      <span class="pi-artifact__body">
                        <span class="pi-artifact__title">${escapeHTML(info.title)}</span>
                        <span class="pi-artifact__desc">${escapeHTML(info.description)}</span>
                        <span class="pi-artifact__path"><code>${escapeHTML(art.shortPath)}</code></span>
                      </span>
                      <span class="pi-artifact__cta" aria-hidden="true">↗</span>
                    </a>
                  </li>`;
    })
    .join('\n');
  // The artifact <details> is rendered OUTSIDE the top-level <a> so the
  // disclosure triangle remains independently keyboard-focusable and the
  // run-link click target stays unambiguous.
  return `            <li class="pi-run">
              <a class="pi-run__link" href="${escapeHTML(url)}" rel="noopener external" target="_blank">
                <span class="pi-run__icon" aria-hidden="true">${run.icon}</span>
                <span class="pi-run__body">
                  <span class="pi-run__title">${escapeHTML(runInfo.title)} ${runIdBadge}</span>
                  ${runDescHtml}
                  <span class="pi-run__meta"><span class="pi-run__slug"><code>${escapeHTML(run.slug)}</code></span> · ${escapeHTML(countLabel)}</span>
                </span>
                <span class="pi-run__cta" aria-hidden="true">↗</span>
              </a>
              <details class="pi-run__artifacts">
                <summary class="pi-run__artifacts-toggle">${escapeHTML(toggleLabel)}</summary>
                <ul class="pi-run__artifacts-list">
${artifactCards}
                </ul>
              </details>
            </li>`;
}

/**
 * Generate the HTML document for one language version of the
 * political-intelligence page.
 *
 * @param lang - Language code
 * @param data - Page data (see {@link collectPoliticalIntelligenceData})
 * @returns Complete HTML document string
 */
export function generatePoliticalIntelligenceHTML(lang: string, data: PIPageData): string {
  // Validate lang against the supported language list. Unsupported values
  // (including prototype-pollution payloads like `__proto__` or user input)
  // fall back to English so curated-title / description lookups always
  // receive a known-safe key.
  const safeLang: LanguageCode = (ALL_LANGUAGES as readonly string[]).includes(lang)
    ? (lang as LanguageCode)
    : 'en';
  const copy = getPICopy(safeLang);
  const siteTitle =
    getLocalizedString(PAGE_TITLES, safeLang).split(' - ')[0] ?? 'EU Parliament Monitor';
  const pageTitle = `${siteTitle} - ${copy.title}`;
  const description = copy.intro;
  const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, safeLang);
  const dir = getTextDirection(safeLang);
  const canonicalUrl = `${BASE_URL}/${getPoliticalIntelligenceFilename(safeLang)}`;
  const indexHref = safeLang === 'en' ? 'index.html' : `index-${safeLang}.html`;
  const sitemapHref = safeLang === 'en' ? 'sitemap.html' : `sitemap_${safeLang}.html`;

  // Cross-language <link rel="alternate"> block
  const hreflangLinks = [
    ...ALL_LANGUAGES.map(
      (code) =>
        `  <link rel="alternate" hreflang="${code}" href="${BASE_URL}/${getPoliticalIntelligenceFilename(code)}">`
    ),
    `  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/political-intelligence.html">`,
  ].join('\n');

  // Stats (totals)
  const totalRuns = data.dailyGroups.reduce((acc, g) => acc + g.runs.length, 0);
  const totalArtifacts = data.dailyGroups.reduce(
    (acc, g) => acc + g.runs.reduce((a, r) => a + r.artifactCount, 0),
    0
  );

  // Language switcher (mirrors sitemap layout)
  const langSwitcher = ALL_LANGUAGES.map((code) => {
    const flag = getLocalizedString(LANGUAGE_FLAGS, code);
    const name = getLocalizedString(LANGUAGE_NAMES, code);
    const active = code === safeLang ? ' active' : '';
    const ariaCurrent = code === safeLang ? ' aria-current="page"' : '';
    const href = getPoliticalIntelligenceFilename(code);
    return `<a href="${href}" class="lang-link${active}" hreflang="${code}" lang="${code}" title="${escapeHTML(name)}" aria-label="${escapeHTML(name)}"${ariaCurrent}>${flag} ${code.toUpperCase()}</a>`;
  }).join('\n        ');
  const header = buildSiteHeader({
    lang: safeLang,
    pathPrefix: '',
    homeHref: indexHref,
    siteTitle,
    languageSwitcherHtml: langSwitcher,
  });

  // Methodologies, templates & reference cards.
  // Descriptions are sourced from the curated per-file, per-language table
  // ({@link getCuratedDescription}) — every language page renders a
  // meaningful, hand-written summary, not scraped Markdown metadata.
  const methodologiesList = data.methodologies
    .map((d) => renderDocumentCard(d, safeLang, copy.viewOnGitHub))
    .join('\n');
  const templatesList = data.templates
    .map((d) => renderDocumentCard(d, safeLang, copy.viewOnGitHub))
    .join('\n');
  const referenceList = data.referenceDocs
    .map((d) => renderDocumentCard(d, safeLang, copy.viewOnGitHub))
    .join('\n');
  const dailyBody =
    data.dailyGroups.length === 0
      ? ''
      : data.dailyGroups.map((g) => renderDailyGroup(g, copy, safeLang)).join('\n');

  // Localized source-in-English note (non-English pages only)
  const sourceNote = copy.sourceInEnglishNote
    ? `      <p class="pi-source-note" role="note">${escapeHTML(copy.sourceInEnglishNote)}</p>`
    : '';

  // JSON-LD structured data (CollectionPage with BreadcrumbList + publisher)
  const seo = getPoliticalIntelligenceSeo(safeLang);
  const ogImage = `${BASE_URL}/images/og-image.jpg`;
  const publisher = {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Hack23 AB',
    url: 'https://hack23.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://hack23.com/icon-192.png',
      width: 192,
      height: 192,
    },
  };
  const jsonLd = {
    '@context': SCHEMA_ORG,
    '@type': 'CollectionPage',
    name: copy.title,
    url: canonicalUrl,
    description: copy.intro,
    inLanguage: safeLang,
    author: publisher,
    publisher,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: BASE_URL,
      publisher,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: seo.breadcrumbHome,
          item: `${BASE_URL}/${indexHref}`,
        },
        { '@type': 'ListItem', position: 2, name: seo.breadcrumbCurrent, item: canonicalUrl },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      // numberOfItems must match the number of `itemListElement` entries
      // we actually emit (one per top-level page section), not the document
      // total — otherwise structured-data validators flag the mismatch.
      numberOfItems: 4,
      name: copy.title,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: copy.methodologiesHeading,
          item: `${canonicalUrl}#pi-methodologies`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: copy.templatesHeading,
          item: `${canonicalUrl}#pi-templates`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: copy.referenceHeading,
          item: `${canonicalUrl}#pi-reference`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: copy.dailyHeading,
          item: `${canonicalUrl}#pi-daily`,
        },
      ],
    },
  };
  const jsonLdString = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  const websiteJsonLd = JSON.stringify({
    '@context': SCHEMA_ORG,
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    inLanguage: safeLang,
    publisher: { '@id': `${BASE_URL}/#organization` },
  }).replace(/</g, '\\u003c');

  const organizationJsonLd = JSON.stringify({
    '@context': SCHEMA_ORG,
    ...publisher,
    sameAs: ['https://github.com/Hack23', 'https://hack23.com'],
  }).replace(/</g, '\\u003c');

  const faqJsonLd = JSON.stringify({
    '@context': SCHEMA_ORG,
    '@type': 'FAQPage',
    inLanguage: seo.faqLanguage,
    mainEntity: seo.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }).replace(/</g, '\\u003c');

  const faqHtml = `<section class="page-faq" aria-labelledby="pi-faq-heading">
      <h2 id="pi-faq-heading"><span aria-hidden="true">❓</span> ${escapeHTML(seo.faqHeading)}</h2>
      <div class="page-faq__list">
        ${seo.faqs
          .map(
            (f) => `<details class="page-faq__item">
          <summary>${escapeHTML(f.q)}</summary>
          <p>${escapeHTML(f.a)}</p>
        </details>`
          )
          .join('\n        ')}
      </div>
    </section>`;

  return `<!DOCTYPE html>
<html lang="${safeLang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="Content-Language" content="${safeLang}">
  <meta name="referrer" content="no-referrer">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="keywords" content="${escapeHTML(copy.seoKeywords)}">
  <meta name="author" content="Hack23 AB">
  <meta name="publisher" content="Hack23 AB">
  <link rel="canonical" href="${canonicalUrl}">
${hreflangLinks}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHTML(copy.title)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${safeLang}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:alt" content="${escapeHTML(seo.ogImageAlt)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHTML(copy.title)}">
  <meta name="twitter:description" content="${escapeHTML(description)}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="twitter:image:alt" content="${escapeHTML(seo.ogImageAlt)}">
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <meta name="theme-color" content="#003399">
  <link rel="stylesheet" href="styles.css">
  <meta name="ep-i18n-update-text" content="${escapeHTML(getLocalizedString(UPDATE_AVAILABLE_LABELS, lang))}">
  <meta name="ep-i18n-update-cta" content="${escapeHTML(getLocalizedString(UPDATE_REFRESH_CTA_LABELS, lang))}">
  <meta name="ep-i18n-dismiss" content="${escapeHTML(getLocalizedString(UPDATE_DISMISS_LABELS, lang))}">
${buildHeadFreshnessTags('')}
  <script type="application/ld+json">${websiteJsonLd}</script>
  <script type="application/ld+json">${organizationJsonLd}</script>
  <script type="application/ld+json">${jsonLdString}</script>
  <script type="application/ld+json">${faqJsonLd}</script>
</head>
<body>
  <a href="#main" class="skip-link">${escapeHTML(skipLinkText)}</a>

  ${header}

  ${buildPageBanner('')}

  <main id="main" class="site-main">
    <section class="sitemap-hero pi-hero" aria-labelledby="pi-heading">
      <h1 id="pi-heading">🧭 ${escapeHTML(copy.title)}</h1>
      <p class="sitemap-hero__subtitle">${escapeHTML(copy.heroSubtitle)}</p>
      <p class="sitemap-hero__intro">${escapeHTML(copy.intro)}</p>
      <dl class="sitemap-stats" aria-label="${escapeHTML(copy.title)}">
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statMethodologiesLabel)}</dt>
          <dd>${data.methodologies.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statTemplatesLabel)}</dt>
          <dd>${data.templates.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statReferenceLabel)}</dt>
          <dd>${data.referenceDocs.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statRunsLabel)}</dt>
          <dd>${totalRuns}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statArtifactsLabel)}</dt>
          <dd>${totalArtifacts}</dd>
        </div>
      </dl>
    </section>

    <nav class="breadcrumb" aria-label="${escapeHTML(seo.breadcrumbAriaLabel)}">
      <ol>
        <li><a href="${indexHref}">${escapeHTML(seo.breadcrumbHome)}</a></li>
        <li><a href="${sitemapHref}">${escapeHTML(getLocalizedString(FOOTER_SITEMAP_LABELS, safeLang))}</a></li>
        <li aria-current="page">${escapeHTML(seo.breadcrumbCurrent)}</li>
      </ol>
    </nav>
${sourceNote}
    <section class="sitemap-section pi-section" aria-labelledby="pi-methodologies">
      <h2 id="pi-methodologies"><span aria-hidden="true">🧭</span> ${escapeHTML(copy.methodologiesHeading)}</h2>
      <p class="section-description">${escapeHTML(copy.methodologiesDescription)}</p>
      <ul class="pi-card-grid">
${methodologiesList}
      </ul>
    </section>

    <section class="sitemap-section pi-section" aria-labelledby="pi-templates">
      <h2 id="pi-templates"><span aria-hidden="true">📋</span> ${escapeHTML(copy.templatesHeading)}</h2>
      <p class="section-description">${escapeHTML(copy.templatesDescription)}</p>
      <ul class="pi-card-grid">
${templatesList}
      </ul>
    </section>

    <section class="sitemap-section pi-section" aria-labelledby="pi-reference">
      <h2 id="pi-reference"><span aria-hidden="true">📚</span> ${escapeHTML(copy.referenceHeading)}</h2>
      <p class="section-description">${escapeHTML(copy.referenceDescription)}</p>
      <ul class="pi-card-grid">
${referenceList}
      </ul>
    </section>

    <section class="sitemap-section pi-section" aria-labelledby="pi-daily">
      <h2 id="pi-daily"><span aria-hidden="true">📅</span> ${escapeHTML(copy.dailyHeading)}</h2>
      <p class="section-description">${escapeHTML(copy.dailyDescription)}</p>
${dailyBody}
    </section>

    ${faqHtml}
  </main>

  ${buildSiteFooter({ lang: safeLang, pathPrefix: '' })}${THEME_TOGGLE_SCRIPT}
</body>
</html>`;
}
