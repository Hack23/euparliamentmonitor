// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/ResolveHelpers
 * @description Pure helper functions for the metadata resolver. These
 * have no runtime dependency on any aggregator module outside the
 * `metadata/` bounded context, so they live as a leaf module under
 * `src/aggregator/metadata/`. The `resolveArticleMetadata` orchestrator
 * itself stays in `src/aggregator/article-metadata.ts` (the barrel)
 * because it needs `resolveLocalizedBriefHighlight` from
 * `editorial-brief-resolver.ts`, which is an upward-pointing import
 * forbidden by the `metadata/` leaf-module rule (see
 * `test/unit/cross-context-imports.test.js`).
 */

import { getLocalizedString } from '../../constants/language-core.js';
import { LOCALIZED_KEYWORDS } from '../../constants/language-articles.js';
import type { LanguageCode } from '../../types/index.js';
import { extractArtifactHighlight } from './artifact-highlight.js';
import { extractFirstH1 } from './h1-extractor.js';
import { extractExtendedLedeAfterHeading, extractStrongProseLine } from './lede-extractor.js';
import { isGenericHeading } from './heading-rules.js';
import { humanizeSlug } from './slug.js';
import { SEO_CONTEXT_LABELS } from './template-fallback.js';
import { extractFirstSentence, truncateDescription, truncateTitle } from './text-utils.js';
import type { ResolveMetadataOptions } from './types.js';

/**
 * Extract a manifest override value for a single language. Accepts either
 * a plain string (applied to every language) or a `LanguageMap` object.
 *
 * @param value - Raw manifest value (string or per-lang object)
 * @param lang - Target language code
 * @returns Override string, or empty string when absent
 */
export function manifestOverrideFor(
  value: string | Partial<Record<LanguageCode, string>> | undefined,
  lang: LanguageCode
): string {
  if (typeof value === 'string') return value.trim();
  if (!value) return '';
  const map = new Map<string, string>();
  for (const key of Object.keys(value)) {
    const v = (value as Record<string, unknown>)[key];
    if (typeof v === 'string') map.set(key, v);
  }
  const entry = map.get(lang);
  return typeof entry === 'string' ? entry.trim() : '';
}

/**
 * Internal: best editorial `{headline, summary}` pair available from the
 * aggregator output and artefacts, independent of language. Used for
 * tiers 2–4 of the resolver priority ladder.
 *
 * @param opts - Resolver inputs
 * @returns Editorial content derived from English source
 */
export function resolveEditorialContent(opts: ResolveMetadataOptions): {
  readonly headline: string;
  readonly summary: string;
  readonly extendedSummary: string;
} {
  const { articleType, date, markdown, runDir } = opts;

  let artefactSummary = '';
  if (runDir) {
    const highlight = extractArtifactHighlight(runDir, articleType, date);
    if (highlight?.headline) {
      return {
        headline: highlight.headline,
        summary: highlight.summary,
        extendedSummary: extractExtendedLedeAfterHeading(markdown),
      };
    }
    if (highlight?.summary) {
      artefactSummary = highlight.summary;
    }
  }

  const aggregatedH1 = extractFirstH1(markdown);
  const aggregatedSummary = extractStrongProseLine(markdown);
  const aggregatedExtended = extractExtendedLedeAfterHeading(markdown);
  if (aggregatedH1 && !isGenericHeading(aggregatedH1, articleType, date)) {
    return {
      headline: truncateTitle(aggregatedH1),
      summary: artefactSummary || aggregatedSummary,
      extendedSummary: aggregatedExtended,
    };
  }

  const summary = artefactSummary || aggregatedSummary;
  if (summary) {
    // The H1 is generic (category-noun, bare-institutional, or
    // template-style) so we have to derive `<title>` from the BLUF/
    // lede paragraph. Extract the first complete sentence so the
    // resulting title is grammatically self-contained — falling back
    // to clause-boundary truncation downstream when the sentence
    // itself overruns TITLE_MAX_LENGTH.
    const firstSentence = extractFirstSentence(summary);
    return {
      headline: truncateTitle(firstSentence),
      summary,
      extendedSummary: aggregatedExtended,
    };
  }

  return { headline: '', summary: '', extendedSummary: '' };
}

/**
 * Pick the per-language SEO title from the resolved editorial pair and
 * the localized template fallback.
 *
 * @param fallbackTitle - Localized article-type template title
 * @param editorialHeadline - Editorial headline (localized or English)
 * @param runId - Optional run id used only when no editorial headline exists
 * @returns SEO title candidate
 */
export function composeContextualTitle(
  fallbackTitle: string,
  editorialHeadline: string,
  runId: string
): string {
  if (editorialHeadline) return editorialHeadline;
  return withRunQualifier(fallbackTitle, runId);
}

/**
 * Add localized article context to short or duplicate-prone meta
 * descriptions.
 *
 * @param lang - Target language code
 * @param baseDescription - Best description from manifest/editorial/template
 * @param editorial - Artifact-derived headline and summary
 * @param editorial.headline - Artifact-derived headline
 * @param editorial.summary - Artifact-derived summary
 * @param date - ISO article date
 * @param _runId - Reserved (formerly emitted; no longer used)
 * @returns Description in the target language context
 */
export function composeContextualDescription(
  lang: LanguageCode,
  baseDescription: string,
  editorial: { readonly headline: string; readonly summary: string },
  date: string,
  _runId: string
): string {
  const labels = getLocalizedString(SEO_CONTEXT_LABELS, lang);
  const parts = [baseDescription.trim()];
  parts.push(`${labels.date} ${date}.`);
  const context = pickFirstNonEmpty([editorial.summary, editorial.headline]);
  if (context && !containsNormalized(parts[0] ?? '', context)) {
    parts.push(`${labels.context}: ${context}`);
  }
  parts.push(labels.reader);
  return truncateDescription(parts.join(' '));
}

/**
 * Append a short run qualifier to otherwise duplicate-prone fallback
 * titles. Sanitizes the raw `runId` so user-facing `<title>` strings
 * never expose Unix timestamps or the full opaque token.
 *
 * @param title - Base title
 * @param runId - Optional run id (sanitized before use)
 * @returns Title with short run qualifier, or unchanged when sanitization fails
 */
export function withRunQualifier(title: string, runId: string): string {
  if (!runId) return title;
  const segments = runId.split('-');
  for (const seg of segments) {
    const m = /^run(\d+)$/u.exec(seg);
    if (m) return `${title} — Run ${m[1]}`;
    const m2 = /^run$/u.exec(seg);
    if (m2) {
      const idx = segments.indexOf(seg);
      const next = segments[idx + 1];
      if (next && /^\d+$/u.test(next)) return `${title} — Run ${next}`;
    }
  }
  return title;
}

/**
 * Case-insensitive containment check after whitespace normalization.
 *
 * @param haystack - Text to search
 * @param needle - Text to locate
 * @returns True when `needle` is already present in `haystack`
 */
export function containsNormalized(haystack: string, needle: string): boolean {
  const cleanHaystack = haystack.toLowerCase().replace(/\s+/g, ' ');
  const cleanNeedle = needle.toLowerCase().replace(/\s+/g, ' ');
  return cleanNeedle.length > 0 && cleanHaystack.includes(cleanNeedle);
}

/**
 * Build a stable, localized keyword list from the article type plus the
 * resolved title/description context.
 *
 * @param lang - Target language code
 * @param articleType - Article type slug
 * @param date - ISO article date
 * @param runId - Optional run id
 * @param title - Resolved title
 * @param description - Resolved description
 * @returns De-duplicated keywords for `<meta name="keywords">`
 */
export function buildSeoKeywords(
  lang: LanguageCode,
  articleType: string,
  date: string,
  runId: string,
  title: string,
  description: string
): readonly string[] {
  const localized = getLocalizedString(LOCALIZED_KEYWORDS, lang);
  const base = Object.getOwnPropertyDescriptor(localized, articleType)?.value as
    | readonly string[]
    | undefined;
  const fallback = ['EU Parliament', 'European Parliament', 'political intelligence'];
  const candidates = [
    ...(base ?? fallback),
    humanizeSlug(articleType),
    date,
    ...(runId ? [`run ${runId}`] : []),
    ...extractKeywordTerms(`${title} ${description}`),
  ];
  return dedupeKeywords(candidates).slice(0, 16);
}

/**
 * Extract short keyword terms from resolved SEO copy.
 *
 * @param text - Title and description text
 * @returns Candidate terms
 */
function extractKeywordTerms(text: string): string[] {
  return text
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && !/^\d+$/.test(token))
    .slice(0, 18);
}

/**
 * De-duplicate keywords case-insensitively while preserving original order.
 *
 * @param candidates - Raw keyword candidates
 * @returns De-duplicated keyword list
 */
function dedupeKeywords(candidates: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/**
 * Return the first non-empty, trimmed entry from a candidate list, or
 * the empty string when every entry is blank.
 *
 * @param candidates - Ordered list of candidate strings
 * @returns First non-empty entry
 */
export function pickFirstNonEmpty(candidates: readonly string[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c.trim();
  }
  return '';
}
