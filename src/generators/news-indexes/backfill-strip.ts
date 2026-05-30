// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/NewsIndexes/BackfillStrip
 * @description Legacy description-strip and backfill-eligibility helpers
 * factored out of `backfill.ts` to stay below the 600-line drift-guard.
 * All public names keep their original signatures.
 */

import path from 'path';
import fs from 'fs';
import { ARTICLE_TYPE_LABELS, getLocalizedString } from '../../constants/languages.js';
import { formatSlug } from '../../utils/file-utils.js';
import { SEO_CONTEXT_LABELS } from '../../constants/seo/context-labels.js';
import { detectCategory } from '../../utils/article-category.js';
import type { ArticleCategoryLabels, LanguageCode } from '../../types/index.js';

export const MIN_ARTICLE_DESCRIPTION_LENGTH = 120;

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
 * Regex pattern that flags internal artefact identifiers.
 */
const LEAKY_RUNID_RE = /\b[a-z][a-z-]*-run-?\d+-\d{8,}\b/iu;

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
export function computeLegacyPrefix(date: string, slug: string, langCode: LanguageCode): string {
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
    stripRedundantDateLabel(
      stripDuplicatedLegacyPrefix(description.trim(), prefix),
      langCode,
      date
    ),
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
export function hasTruncatedReaderLabel(
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
export function stripDuplicatedLegacyPrefix(trimmedDescription: string, prefix: string): string {
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
export function stripRedundantDateLabel(
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
export function capDescriptionLength(text: string): string {
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
export function descriptionHasLeakyToken(description: string): boolean {
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
export function shouldBackfillDescription(
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
export function buildBackfillManifest(
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
export function readArticleHtml(filepath: string): string {
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
