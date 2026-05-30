// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/NewsIndexes/Backfill
 * @description Legacy article HTML SEO repair helpers, factored out of
 * `news-indexes.ts` (Refactor 8/8). All public names (`applyArticleSeoBackfill`,
 * `backfillLegacyArticleSeo`, `healJsonLdDescriptionCorruption`,
 * `backfillArticleHreflang`, `buildLegacyBackfillDescription`) keep their
 * original exported signatures so the regression test suites in
 * `test/unit/news-indexes-*.test.js` keep importing from the barrel.
 */

import path from 'path';
import { NEWS_DIR, BASE_URL } from '../../constants/config.js';
import {
  ALL_LANGUAGES,
  ARTICLE_TYPE_LABELS,
  getLocalizedString,
} from '../../constants/languages.js';
import {
  formatSlug,
  parseArticleFilename,
  extractArticleMeta,
  escapeHTML,
  atomicWrite,
} from '../../utils/file-utils.js';
import { detectCategory } from '../../utils/article-category.js';
import { buildSeoKeywords, resolveArticleMetadata } from '../../aggregator/article-metadata.js';
import {
  computeLegacyPrefix,
  stripLegacyBackfillContext,
  capDescriptionLength,
  stripRedundantDateLabel,
  stripDuplicatedLegacyPrefix,
  readArticleHtml,
  hasTruncatedReaderLabel,
  descriptionHasLeakyToken,
  shouldBackfillDescription,
  buildBackfillManifest,
  MIN_ARTICLE_DESCRIPTION_LENGTH,
} from './backfill-strip.js';
import type { ArticleCategoryLabels, LanguageCode } from '../../types/index.js';
/**
 * Backfill SEO metadata for legacy article HTML files that pre-date the
 * current article generator. This keeps historic pages from carrying short
 * or duplicate descriptions while the canonical generator handles new runs.
 *
 * @param filenames - News article filenames to inspect
 * @returns Number of HTML files updated
 */
export function backfillLegacyArticleSeo(filenames: readonly string[]): number {
  const descriptions = new Map<string, number>();
  for (const filename of filenames) {
    const meta = extractArticleMeta(path.join(NEWS_DIR, filename));
    if (!meta.description) continue;
    descriptions.set(meta.description, (descriptions.get(meta.description) ?? 0) + 1);
  }

  let updated = 0;
  for (const filename of filenames) {
    if (backfillOneLegacyArticleSeo(filename, descriptions)) updated++;
  }
  return updated;
}

/**
 * Heal JSON-LD `description` field corruption left behind by a prior
 * version of {@link applyArticleSeoBackfill}. The old regex
 * `"description":"[^"]*"` terminated at the first JSON-escaped quote
 * (`\"`), so every rebuild prepended a new value in front of the
 * previous description's tail — producing an unparseable JSON-LD
 * block whose `description` value was followed by a run of repeated
 * fragments before `,"datePublished"`.
 *
 * This pass is idempotent: when the JSON-LD is already well-formed,
 * the regex `[^,]*` matches the empty string and the file is left
 * unchanged. It runs unconditionally because the original backfill
 * path skips files whose `<meta name="description">` is already
 * clean, even when their JSON-LD is corrupted.
 *
 * @param filenames - News article filenames to inspect
 * @returns Number of HTML files updated
 */
export function healJsonLdDescriptionCorruption(filenames: readonly string[]): number {
  let updated = 0;
  for (const filename of filenames) {
    const filepath = path.join(NEWS_DIR, filename);
    const html = readArticleHtml(filepath);
    if (!html) continue;
    const next = html.replace(/("description":"(?:\\.|[^"\\])*")[^,]*(,"datePublished")/u, '$1$2');
    if (next === html) continue;
    atomicWrite(filepath, next);
    updated++;
  }
  return updated;
}

/**
 * Backfill one article file when its metadata is missing, short or duplicate.
 *
 * @param filename - News article filename
 * @param descriptions - Description frequency map for duplicate detection
 * @returns True when the file was updated
 */
function backfillOneLegacyArticleSeo(
  filename: string,
  descriptions: ReadonlyMap<string, number>
): boolean {
  const filepath = path.join(NEWS_DIR, filename);
  const parsed = parseArticleFilename(filename);
  if (!parsed) return false;
  const meta = extractArticleMeta(filepath);
  const html = readArticleHtml(filepath);
  if (!html) return false;
  const hasKeywords = /<meta name="keywords" content="[^"]+"/u.test(html);
  const needsDescription =
    shouldBackfillDescription(meta.description, descriptions) ||
    hasTruncatedReaderLabel(parsed.date, parsed.slug, parsed.lang, meta.description);
  if (hasKeywords && !needsDescription) return false;

  // Suppress leaky tokens (run-ids, "analysis run" jargon) from both
  // the Markdown body we feed the resolver AND the `manifest.description`
  // override, so the resolver derives `<meta description>` from a clean
  // editorial signal rather than echoing the legacy junk back unchanged.
  const titleHasLeaks = descriptionHasLeakyToken(meta.title);
  const descHasLeaks = descriptionHasLeakyToken(meta.description);
  const safeTitle = titleHasLeaks ? formatSlug(parsed.slug) : meta.title;
  // Strip any legacy dateline prefix + redundant date label from a
  // previously-backfilled description before re-feeding it to the
  // resolver. Without this, the resolver re-clamps the prefixed buffer
  // against the per-script metaDescription budget and truncates the
  // reader-facing clause mid-phrase (dangling-participle regression in
  // `news/2026-04-26-week-ahead-ko.html`).
  const safeDescription = descHasLeaks
    ? ''
    : stripLegacyBackfillContext(parsed.date, parsed.slug, parsed.lang, meta.description);

  const articleType = String(detectCategory(parsed.slug));
  const resolved = resolveArticleMetadata({
    articleType,
    date: parsed.date,
    markdown: `# ${safeTitle || formatSlug(parsed.slug)}\n\n${safeDescription}`,
    manifest: buildBackfillManifest(parsed.slug, safeTitle, safeDescription, needsDescription),
  });
  const entry = Object.getOwnPropertyDescriptor(resolved, parsed.lang)?.value as
    | { readonly title: string; readonly description: string; readonly keywords: readonly string[] }
    | undefined;
  const fallbackKeywords = buildSeoKeywords(
    parsed.lang,
    articleType,
    parsed.date,
    parsed.slug,
    safeTitle,
    safeDescription
  );
  // Never echo a leaky description into the rewrite, even as a last-resort
  // fallback. If the resolver produced nothing clean, fall back to a
  // page-specific stub built from the slug.
  const resolverDescription = entry?.description ?? '';
  const baseDescription =
    resolverDescription && !descriptionHasLeakyToken(resolverDescription)
      ? resolverDescription
      : safeDescription || formatSlug(parsed.slug);
  const description = needsDescription
    ? buildLegacyBackfillDescription(parsed.date, parsed.slug, parsed.lang, baseDescription, {
        forceContextPrefix: true,
      })
    : meta.description;
  const keywords = entry?.keywords ?? fallbackKeywords;
  const nextHtml = applyArticleSeoBackfill(html, description, keywords);
  if (nextHtml === html) return false;
  atomicWrite(filepath, nextHtml);
  return true;
}

/**
 * Prefix legacy descriptions with date and **localized** category label
 * so duplicate strings become page-specific before the 180-character
 * snippet cap. Two-tier strategy:
 *
 * 1. **Substantive resolver output** (≥{@link MIN_ARTICLE_DESCRIPTION_LENGTH}
 *    chars) is returned **unchanged** — no prefix is prepended. The
 *    description is already unique per page because it contains
 *    article-specific editorial content (named bills, vote outcomes,
 *    coalition dynamics). Adding a bureaucratic prefix in that case
 *    only steals SERP characters from real content.
 * 2. **Short / placeholder** descriptions get a localized prefix
 *    `${date} — ${ARTICLE_TYPE_LABELS[lang][category]} —` so the
 *    duplicate-deduper still works on legacy articles whose
 *    `<meta description>` is `formatSlug(slug)`-only or a generic stub.
 *    The category noun is **translated** via {@link ARTICLE_TYPE_LABELS}
 *    so Arabic / Hebrew / Swedish cards no longer carry the English
 *    "EN Committee Reports" wart that the prior single-language
 *    `formatSlug(slug)` form produced.
 *
 * @param date - Article date (ISO YYYY-MM-DD)
 * @param slug - Article slug (used to derive the category)
 * @param lang - Article language (ISO 639-1 lower-case code)
 * @param description - Candidate description (resolver output preferred)
 * @param options - Backfill options
 * @param options.forceContextPrefix - Force date/language/category prefix
 *   even when the description is already substantive
 * @returns Page-specific description, prefix-free when description is
 *   already substantive
 */
export function buildLegacyBackfillDescription(
  date: string,
  slug: string,
  lang: string,
  description: string,
  options: { readonly forceContextPrefix?: boolean } = {}
): string {
  const trimmedDescription = description.trim();
  if (trimmedDescription.length >= MIN_ARTICLE_DESCRIPTION_LENGTH && !options.forceContextPrefix) {
    return capDescriptionLength(trimmedDescription);
  }
  const langCode = (lang || 'en').toLowerCase() as LanguageCode;
  const category = detectCategory(slug);
  const categoryLabels = getLocalizedString(ARTICLE_TYPE_LABELS, langCode) as ArticleCategoryLabels;
  const label = categoryLabels[category] ?? formatSlug(slug);
  const prefix = computeLegacyPrefix(date, slug, langCode);
  // Idempotency guard: when this helper is called against an HTML that
  // already carries a backfilled description (re-running backfill on
  // a previously-processed file, or a `forceContextPrefix:true` call
  // whose input was the prior pass' output), the trimmed description
  // already starts with `${date} — ${languageLabel} — ${label} — `.
  // Without this strip, the prefix is doubled, producing
  //   "2026-05-26 — 日本語 — Breaking — 2026-05-26 — 日本語 — Breaking — …"
  // (live regression in `news/2026-05-26-breaking-{ja,ko}.html`).
  //
  // We also strip the localized `${labels.date} ${date}.` clause the
  // per-language resolver appends, because the dateline prefix already
  // carries the date — leaving it in would emit a redundant
  // "发布日期 / 게시일 YYYY-MM-DD." suffix (live regression in
  // `news/2026-04-01-breaking-zh.html` / `2026-03-31-breaking-ko.html`).
  const body =
    stripRedundantDateLabel(
      stripDuplicatedLegacyPrefix(trimmedDescription, prefix),
      langCode,
      date
    ) || label;
  const contextual = `${prefix} — ${body}`.replace(/\s+/g, ' ').trim();
  return capDescriptionLength(contextual);
}

/**
 * Apply SEO meta tag replacements to a complete article HTML document.
 *
 * Exported for the regression test in
 * `test/unit/news-indexes-jsonld-description-regex.test.js`, which
 * locks in the JSON-LD description regex against the duplicate-tail
 * bug (the legacy `"description":"[^"]*"` pattern terminated at the
 * first JSON-escaped quote `\"` and left the previous description's
 * tail in place, accumulating duplicates on every prebuild run).
 *
 * @param html - Existing article HTML
 * @param description - Backfilled meta description
 * @param keywords - Backfilled keyword list
 * @returns Updated HTML
 */
export function applyArticleSeoBackfill(
  html: string,
  description: string,
  keywords: readonly string[]
): string {
  const safeDescription = escapeHTML(description);
  const safeKeywords = escapeHTML(keywords.join(', '));
  let next = html
    .replace(
      /<meta name="description" content="[^"]*">/u,
      `<meta name="description" content="${safeDescription}">`
    )
    .replace(
      /<meta property="og:description" content="[^"]*">/u,
      `<meta property="og:description" content="${safeDescription}">`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*">/u,
      `<meta name="twitter:description" content="${safeDescription}">`
    );

  if (/<meta name="keywords" content="[^"]*">/u.test(next)) {
    next = next.replace(
      /<meta name="keywords" content="[^"]*">/u,
      `<meta name="keywords" content="${safeKeywords}">`
    );
  } else {
    next = next.replace(
      /(<meta name="description" content="[^"]*">\n)/u,
      `$1  <meta name="keywords" content="${safeKeywords}">\n`
    );
  }

  const jsonDescription = JSON.stringify(description).slice(1, -1).replace(/</g, '\\u003c');
  // Match a JSON string value safely: every `"` inside the description
  // is JSON-escaped as `\"`, so the inner pattern must accept either an
  // escape sequence (`\\.`) or a non-quote/non-backslash character —
  // otherwise the match terminates at the first `\"` and leaves the
  // tail of the previous description in place, which on subsequent
  // prebuild runs appears to "duplicate" the description fragment.
  next = next.replace(/"description":"(?:\\.|[^"\\])*"/u, `"description":"${jsonDescription}"`);
  // Heal any previously-corrupted JSON-LD where the old buggy regex
  // left an orphan tail between the description's closing quote and
  // the next known field (`,"datePublished"`). The pattern is
  // idempotent: when there is no orphan, `[^,]*` matches the empty
  // string and the file is unchanged.
  next = next.replace(/("description":"(?:\\.|[^"\\])*")[^,]*(,"datePublished")/u, '$1$2');
  return next;
}

/**
 * Build hreflang `<link rel="alternate">` tags for an article slug.
 * Produces one tag per supported language plus an `x-default` pointing at
 * the English variant, all using absolute URLs.
 *
 * @param articleSlug - Slug without language suffix (e.g. `2026-02-24-propositions`)
 * @returns Newline-joined `<link>` tags
 */
function buildArticleHreflang(articleSlug: string): string {
  const entries = ALL_LANGUAGES.map(
    (code) =>
      `  <link rel="alternate" hreflang="${code}" href="${BASE_URL}/news/${articleSlug}-${code}.html">`
  );
  entries.push(
    `  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/news/${articleSlug}-en.html">`
  );
  return entries.join('\n');
}

/**
 * Inject hreflang links into an article that has none.
 *
 * @param html - Article HTML content
 * @param hreflangBlock - Pre-built hreflang link block
 * @returns Updated HTML, or original if no change needed
 */
function injectHreflangLinks(html: string, hreflangBlock: string): string {
  return html.replace(/(<\/head>)/u, `${hreflangBlock}\n$1`);
}

/**
 * Replace existing relative hreflang links with absolute URLs.
 *
 * @param html - Article HTML content
 * @param hreflangBlock - Pre-built hreflang link block with absolute URLs
 * @returns Updated HTML, or original if no change needed
 */
function fixRelativeHreflangLinks(html: string, hreflangBlock: string): string {
  const stripped = html.replace(
    /\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*">\n?/gu,
    ''
  );
  return stripped.replace(/(<\/head>)/u, `${hreflangBlock}\n$1`);
}

/**
 * Backfill hreflang alternate links for all article HTML files.
 *
 * Handles three cases:
 * 1. Articles with no hreflang links at all → inject the full block before `</head>`
 * 2. Articles with relative hreflang URLs → replace with absolute URLs
 * 3. Articles already correct → skip
 *
 * @param filenames - News article filenames
 * @returns Number of HTML files updated
 */
export function backfillArticleHreflang(filenames: readonly string[]): number {
  let updated = 0;
  for (const filename of filenames) {
    if (backfillOneArticleHreflang(filename)) updated++;
  }
  return updated;
}

/**
 * Backfill hreflang for a single article file.
 *
 * @param filename - News article filename
 * @returns True when the file was updated
 */
function backfillOneArticleHreflang(filename: string): boolean {
  const parsed = parseArticleFilename(filename);
  if (!parsed) return false;
  const filepath = path.join(NEWS_DIR, filename);
  const html = readArticleHtml(filepath);
  if (!html) return false;

  const articleSlug = `${parsed.date}-${parsed.slug}`;
  const hreflangBlock = buildArticleHreflang(articleSlug);
  const hasHreflang = /<link\s+rel="alternate"\s+hreflang="/u.test(html);

  let next: string;
  if (!hasHreflang) {
    next = injectHreflangLinks(html, hreflangBlock);
  } else {
    const hasRelative = /<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="(?!https?:\/\/)/u.test(
      html
    );
    if (!hasRelative) return false;
    next = fixRelativeHreflangLinks(html, hreflangBlock);
  }

  if (next === html) return false;
  atomicWrite(filepath, next);
  return true;
}
