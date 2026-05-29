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
import fs from 'fs';
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
import { SEO_CONTEXT_LABELS } from '../../aggregator/metadata/template-fallback.js';
import type { ArticleCategoryLabels, LanguageCode } from '../../types/index.js';

const MIN_ARTICLE_DESCRIPTION_LENGTH = 120;

/** Language labels used only in forced legacy backfill prefixes. */
const LEGACY_LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  sv: 'Svenska',
  da: 'Dansk',
  no: 'Norsk',
  fi: 'Suomi',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  nl: 'Nederlands',
  ar: 'العربية',
  he: 'עברית',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
};

/**
 * Regex pattern that flags internal artefact identifiers
 * (`<slug>-run<N>-<unix-ts>`). Used by
 * {@link descriptionHasLeakyToken} to force backfill of legacy articles
 * whose `<meta description>` was authored before the resolver started
 * stripping run-ids and "analysis run" jargon. Mirrors
 * `FORBIDDEN_PATTERNS` in `scripts/validate-manifest-seo.js`.
 */
const LEAKY_RUNID_RE = /\b[a-z][a-z-]*-run-?\d+-\d{8,}\b/iu;

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
  const body = stripRedundantDateLabel(stripDuplicatedLegacyPrefix(trimmedDescription, prefix), langCode, date) || label;
  const contextual = `${prefix} — ${body}`.replace(/\s+/g, ' ').trim();
  return capDescriptionLength(contextual);
}

/**
 * Compute the localized dateline prefix
 * (`${date} — ${languageLabel} — ${categoryLabel}[ — ${qualifier}]`)
 * prepended to short / placeholder legacy descriptions.
 *
 * @param date - Article date (ISO YYYY-MM-DD)
 * @param slug - Article slug (used to derive the category + qualifier)
 * @param langCode - Article language code
 * @returns Em-dash-joined dateline prefix
 */
function computeLegacyPrefix(date: string, slug: string, langCode: LanguageCode): string {
  const category = detectCategory(slug);
  const categoryLabels = getLocalizedString(ARTICLE_TYPE_LABELS, langCode) as ArticleCategoryLabels;
  const label = categoryLabels[category] ?? formatSlug(slug);
  const qualifier = buildLegacySlugQualifier(slug, label);
  const languageLabel = legacyLanguageLabel(langCode);
  return [date, languageLabel, label, qualifier].filter((part) => part.length > 0).join(' — ');
}

/**
 * Strip the legacy dateline prefix **and** the redundant localized
 * date-label clause from a candidate description, returning the
 * reader-facing body in isolation. Used to clean a previously-backfilled
 * `<meta description>` before it is re-fed to the per-language SEO
 * resolver — without this, the resolver re-clamps the prefixed buffer
 * against the CJK metaDescription budget and truncates the reader label
 * mid-clause (live regression in `news/2026-04-26-week-ahead-ko.html`,
 * a dangling "추적하는." participle).
 *
 * @param date - Article date (ISO YYYY-MM-DD)
 * @param slug - Article slug
 * @param lang - Article language code
 * @param description - Candidate description (possibly already prefixed)
 * @returns Reader-facing body with prefix + date label removed
 */
export function stripLegacyBackfillContext(
  date: string,
  slug: string,
  lang: string,
  description: string
): string {
  const langCode = (lang || 'en').toLowerCase() as LanguageCode;
  const prefix = computeLegacyPrefix(date, slug, langCode);
  return stripTruncatedReaderLabel(
    stripRedundantDateLabel(stripDuplicatedLegacyPrefix(description.trim(), prefix), langCode, date),
    langCode
  );
}

/**
 * Remove a trailing **truncated** copy of the localized reader label
 * (`SEO_CONTEXT_LABELS[lang].reader`) from a candidate description.
 *
 * Earlier backfill passes appended the reader label and then clamped the
 * whole buffer to the per-script `metaDescription` budget, hard-cutting
 * the label mid-word (e.g. zh `…政策后果的读` instead of `…政策后果的读者`,
 * ja `…追跡する読`, ko dangling `…추적하는.`). Those mangled fragments were
 * persisted to `<meta description>` and survive a plain prefix/date-label
 * strip, so re-feeding them to the resolver re-emits the broken tail.
 *
 * A trailing copy that matches the label **in full** is left intact — it
 * is a complete, reader-facing clause we want to preserve. Only a partial
 * (truncated) prefix of the label is dropped, leaving the clean body for
 * the resolver to re-enrich with a budget-aware (whole-label-or-nothing)
 * reader clause.
 *
 * @param description - Candidate description (prefix/date-label removed)
 * @param langCode - Article language code
 * @returns Description with any truncated trailing reader label removed
 */
function stripTruncatedReaderLabel(description: string, langCode: LanguageCode): string {
  const text = description.trim();
  const cut = findTruncatedReaderLabelCut(text, langCode);
  if (cut < 0) return text;
  return text
    .replace(/[.。！？!?…]+$/u, '')
    .slice(0, cut)
    .replace(/[\s,;:—\-–·。、]+$/u, '')
    .trim();
}

/**
 * Locate a trailing **truncated** copy of the localized reader label and
 * return the index at which the description body ends (i.e. where the
 * partial label begins). Returns -1 when no partial label is present or
 * when the label is present in full (a complete clause we keep).
 *
 * @param text - Trimmed candidate description
 * @param langCode - Article language code
 * @returns Cut index for the partial label, or -1 when none applies
 */
function findTruncatedReaderLabelCut(text: string, langCode: LanguageCode): number {
  const labels = getLocalizedString(SEO_CONTEXT_LABELS, langCode);
  const reader = (labels.reader ?? '').trim();
  // Require a reasonably long label so we never strip on a coincidental
  // short suffix match; real labels are 40+ chars (Latin) / 11+ (CJK).
  if (reader.length < 8 || text.length < 8) return -1;
  // Tolerate a terminator the resolver/healer appended after the cut.
  const core = text.replace(/[.。！？!?…]+$/u, '');
  const maxK = Math.min(core.length, reader.length);
  for (let k = maxK; k >= 8; k -= 1) {
    if (core.slice(core.length - k) === reader.slice(0, k)) {
      // Full label present at the tail — keep it (not a truncation).
      if (k === reader.length) return -1;
      return core.length - k;
    }
  }
  return -1;
}

/**
 * Detect whether a legacy `<meta description>` ends with a **truncated**
 * reader label once its dateline prefix and redundant date-label clause
 * are removed. Long, unique legacy descriptions otherwise bypass
 * {@link shouldBackfillDescription}, leaving a persisted mid-word cut
 * (e.g. zh `…政策后果的读`, ja `…追跡する読`, ko `…추적하는.`) in place.
 *
 * @param date - Article date (ISO YYYY-MM-DD)
 * @param slug - Article slug
 * @param lang - Article language code
 * @param description - Current `<meta description>` value
 * @returns True when a truncated reader label remains in the body
 */
function hasTruncatedReaderLabel(
  date: string,
  slug: string,
  lang: string,
  description: string
): boolean {
  if (!description) return false;
  const langCode = (lang || 'en').toLowerCase() as LanguageCode;
  const prefix = computeLegacyPrefix(date, slug, langCode);
  const body = stripRedundantDateLabel(
    stripDuplicatedLegacyPrefix(description.trim(), prefix),
    langCode,
    date
  );
  return findTruncatedReaderLabelCut(body, langCode) >= 0;
}

/**
 * Strip one or more leading copies of the legacy backfill prefix from a
 * description candidate to keep {@link buildLegacyBackfillDescription}
 * idempotent. The prefix may be followed by the canonical ` — `
 * separator **or** a bare space — older passes joined a duplicated
 * prefix to the body with a single space (live corruption in
 * `news/2026-04-17-committee-reports-zh.html`), so both separators are
 * tolerated and the strip repeats until the leading prefix is gone.
 *
 * @param trimmedDescription - Trimmed candidate description
 * @param prefix - Prefix that would be prepended by this backfill pass
 * @returns Description with any leading legacy prefix removed
 */
function stripDuplicatedLegacyPrefix(trimmedDescription: string, prefix: string): string {
  if (!trimmedDescription || !prefix) return trimmedDescription;
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const leadingPrefix = new RegExp(`^${escaped}(?:\\s*—\\s*|\\s+)`, 'u');
  let out = trimmedDescription.trim();
  let previous: string | null = null;
  while (out !== previous) {
    previous = out;
    out = out.replace(leadingPrefix, '').trim();
  }
  return out;
}

/**
 * Remove the localized `${labels.date} ${date}[.]` clause emitted by the
 * per-language SEO resolver. In the legacy-backfill path the dateline
 * prefix already carries the date, so leaving the resolver's date label
 * in place produces a redundant "Published / 发布日期 / 게시일 YYYY-MM-DD."
 * suffix.
 *
 * @param description - Candidate description (resolver output)
 * @param langCode - Article language code
 * @param date - Article date (ISO YYYY-MM-DD)
 * @returns Description with the redundant date-label clause removed
 */
function stripRedundantDateLabel(
  description: string,
  langCode: LanguageCode,
  date: string
): string {
  if (!description) return description;
  const labels = getLocalizedString(SEO_CONTEXT_LABELS, langCode);
  const escapedLabel = labels.date.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const dateLabelClause = new RegExp(`\\s*${escapedLabel}\\s*${date}\\.?`, 'gu');
  return description.replace(dateLabelClause, '').replace(/\s+/g, ' ').trim();
}

/**
 * Resolve the human language label used to make otherwise-identical
 * cross-locale legacy descriptions unique.
 *
 * @param lang - Language code
 * @returns Local language name, or the raw code if unknown
 */
function legacyLanguageLabel(lang: LanguageCode): string {
  const descriptor = Object.getOwnPropertyDescriptor(LEGACY_LANGUAGE_LABELS, lang);
  return typeof descriptor?.value === 'string' ? descriptor.value : lang;
}

/**
 * Build an optional slug-derived qualifier for legacy pages that share the
 * same date and article category (for example same-day `*-run2` variants).
 *
 * @param slug - Article slug without date/language suffix
 * @param localizedLabel - Localized category label already present in prefix
 * @returns Human-readable qualifier, or empty when it would duplicate label
 */
function buildLegacySlugQualifier(slug: string, localizedLabel: string): string {
  const formatted = formatSlug(slug).trim();
  if (!formatted) return '';
  const normalizedFormatted = normalizeLegacyQualifier(formatted);
  const normalizedLabel = normalizeLegacyQualifier(localizedLabel);
  if (!normalizedFormatted || normalizedFormatted === normalizedLabel) return '';
  return formatted;
}

/**
 * Normalize a prefix component for duplicate detection.
 *
 * @param value - Candidate text
 * @returns Lower-case alphanumeric text
 */
function normalizeLegacyQualifier(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * Clamp a description to the 180-character SERP-friendly cap with a
 * trailing ellipsis when truncated. Extracted from
 * {@link buildLegacyBackfillDescription} so both the prefix-free and
 * prefixed branches share identical clamping behaviour.
 *
 * @param text - Candidate description
 * @returns Description ≤180 chars, ending with `…` on truncation
 */
function capDescriptionLength(text: string): string {
  if (text.length <= 180) return text;
  return `${text.slice(0, 177).replace(/[.,;:—\s-]+$/u, '')}…`;
}

/**
 * Detect whether a legacy article description contains the run-id or
 * "analysis run" jargon that was prevalent in pre-aggregator brief
 * authorship. These tokens are deemed unfit for `<meta description>`
 * regardless of length and force a backfill rewrite.
 *
 * @param description - Current description value
 * @returns True when the description contains a forbidden internal token
 */
function descriptionHasLeakyToken(description: string): boolean {
  if (!description) return false;
  const lower = description.toLowerCase();
  if (lower.includes('analysis run')) return true;
  return LEAKY_RUNID_RE.test(description);
}

/**
 * Determine whether a meta description needs backfilling.
 *
 * @param description - Current description
 * @param descriptions - Description frequency map
 * @returns True when the description is missing, short, duplicated, or
 *   contains internal run-id tokens that must not appear in SEO surfaces
 */
function shouldBackfillDescription(
  description: string,
  descriptions: ReadonlyMap<string, number>
): boolean {
  return (
    !description ||
    description.length < MIN_ARTICLE_DESCRIPTION_LENGTH ||
    (descriptions.get(description) ?? 0) > 1 ||
    descriptionHasLeakyToken(description)
  );
}

/**
 * Build the manifest projection for legacy SEO backfill.
 *
 * @param runId - Stable slug/run id
 * @param title - Current article title
 * @param description - Current article description
 * @param includeDescription - Whether to use the current description as a manifest override
 * @returns Manifest projection accepted by `resolveArticleMetadata`
 */
function buildBackfillManifest(
  runId: string,
  title: string,
  description: string,
  includeDescription: boolean
): { readonly runId: string; readonly title: string; readonly description?: string } {
  return {
    runId,
    title,
    ...(includeDescription ? { description } : {}),
  };
}

/**
 * Read an article HTML file, returning an empty string when unavailable.
 *
 * @param filepath - Absolute HTML file path
 * @returns File content or empty string
 */
function readArticleHtml(filepath: string): string {
  try {
    return path.isAbsolute(filepath) ? requireFsRead(filepath) : '';
  } catch {
    return '';
  }
}

/**
 * Isolated file read helper to keep try/catch bodies small.
 *
 * @param filepath - Absolute file path
 * @returns File text
 */
function requireFsRead(filepath: string): string {
  return fs.readFileSync(filepath, 'utf8');
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
