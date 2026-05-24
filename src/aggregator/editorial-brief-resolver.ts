// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/EditorialBriefResolver
 * @description Language-aware editorial brief lookup.
 *
 * Companion to `article-metadata.ts`. Where that module's
 * `extractArtifactHighlight` is intentionally language-agnostic (the first
 * canonical editorial artefact wins, regardless of locale), this module
 * answers the **per-language** question:
 *
 *   "Given a run directory and a target language `<lang>`, is there a
 *   sibling `executive-brief_<lang>.md` (or `extended/…` variant) that
 *   the article-metadata resolver should prefer over the English brief?"
 *
 * The answer drives the localized-brief precedence rule documented in
 * [`.github/prompts/04-article-generation.md`](../../.github/prompts/04-article-generation.md) § 6.2:
 *
 *   1. translated `executive-brief_<lang>.md` (this module's job)
 *   2. translated `extended/executive-brief_<lang>.md` (also this module)
 *   3. English `executive-brief.md` — `article-metadata.ts` already
 *      handles this via the canonical candidate list
 *
 * The module is intentionally small and side-effect-free; it composes
 * the existing low-level helpers (`extractFirstH1`,
 * `extractLedeAfterHeading`, `extractStrongProseLine`, `isGenericHeading`,
 * `stripArtifactCategoryAffix`, `truncateTitle`) so the parsing rules
 * stay identical across the English and localized paths.
 */

import fs from 'fs';
import path from 'path';

import type { LanguageCode } from '../types/index.js';
import {
  extractFirstH1,
  extractLedeAfterHeading,
  extractExtendedLedeAfterHeading,
  extractStrongProseLine,
  isGenericHeading,
  stripArtifactCategoryAffix,
  truncateTitle,
} from './article-metadata.js';
import { extractBriefingHighlight } from './metadata/briefing-highlight.js';

/**
 * One resolved per-language brief highlight.
 *
 * `headline` and `summary` follow the same semantics as
 * `extractArtifactHighlight` in `article-metadata.ts` — either may be
 * empty when the localized brief lacks the relevant section.
 *
 * `sourceFile` is the run-relative path to the file that produced the
 * highlight; downstream callers can record this when populating
 * `manifest.metadataFallback` so editors can later audit which locales
 * fell through to English.
 *
 * `sourceLang` matches the language code of the brief that produced the
 * highlight (always equal to the requested language for a successful
 * lookup; the caller infers `"en"` fallback when this module returns
 * `null`).
 */
export interface LocalizedBriefHighlight {
  readonly headline: string;
  readonly summary: string;
  /**
   * Longer (up to ~300 chars) summary lifted from the same brief BLUF
   * paragraph as {@link summary}, used for `og:description` and
   * `twitter:description`. Empty string when the BLUF is short enough
   * that the regular `summary` already captures it — see
   * `truncateExtendedDescription` for the cutoff. The caller should
   * fall back to {@link summary} when this field is empty.
   */
  readonly extendedSummary: string;
  readonly sourceFile: string;
  readonly sourceLang: LanguageCode;
}

/**
 * Run-relative candidate paths for a translated brief, in precedence
 * order. Mirrors the `executive-brief.md` → `extended/executive-brief.md`
 * progression used by the English path so the localized resolution stays
 * symmetric.
 *
 * @param lang - Target language code
 * @returns Ordered run-relative paths to probe
 */
export function localizedBriefCandidates(lang: LanguageCode): readonly string[] {
  if (lang === 'en') return [];
  return [`executive-brief_${lang}.md`, `extended/executive-brief_${lang}.md`];
}

/**
 * Read an editorial artefact body while skipping any SPDX HTML-comment
 * preamble. Kept private here so the localized path doesn't depend on
 * non-exported helpers from `article-metadata.ts`.
 *
 * Both single-line (`<!-- … -->`) and multi-line comment blocks (where
 * `<!--` and `-->` appear on different lines) are stripped, so SPDX
 * headers written as
 *
 *   ```
 *   <!--
 *     SPDX-FileCopyrightText: 2024-2026 Hack23 AB
 *     SPDX-License-Identifier: Apache-2.0
 *   -->
 *   ```
 *
 * are handled symmetrically with the single-line form. An unterminated
 * `<!--` block (no closing `-->`) is treated as malformed and the body
 * is returned starting at that line — downstream `extractFirstH1` will
 * then fail to find a heading and the caller will return `null`, which
 * is the safe behaviour for a broken brief.
 *
 * @param abs - Absolute file path
 * @returns File contents with SPDX comment lines dropped, or `''` on error
 */
function readArtefactBody(abs: string): string {
  let text: string;
  try {
    text = fs.readFileSync(abs, 'utf8');
  } catch {
    return '';
  }
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = (lines[i] ?? '').trim();
    if (line === '') {
      i++;
      continue;
    }
    if (line.startsWith('<!--') && line.endsWith('-->') && line.length >= 7) {
      i++;
      continue;
    }
    if (line.startsWith('<!--')) {
      // Multi-line comment block — scan forward to the closing `-->`.
      const closeIdx = findCommentClose(lines, i);
      if (closeIdx === -1) break; // malformed: bail out, retain content
      i = closeIdx + 1;
      continue;
    }
    break;
  }
  return lines.slice(i).join('\n');
}

/**
 * Locate the line index of the first line that ends with `-->` at or
 * after `start`. The terminator must appear at end-of-line (after a
 * trim) so an inline `-->` embedded in editorial prose cannot be
 * mis-read as the close of an SPDX preamble block.
 *
 * @param lines - File lines being scanned (read-only)
 * @param start - Line index where the unterminated `<!--` was seen
 * @returns Closing line index, or `-1` when no terminator is found.
 */
function findCommentClose(lines: readonly string[], start: number): number {
  for (let j = start; j < lines.length; j++) {
    if ((lines[j] ?? '').trimEnd().endsWith('-->')) return j;
  }
  return -1;
}

/**
 * Compute the editorial headline from a localized brief body. Returns
 * `''` when the H1 is fully generic and the stripped variant is also
 * generic. Kept private so callers don't need to know about generic-H1
 * stripping rules.
 *
 * @param body - Brief body with the SPDX preamble already stripped
 * @param articleType - Article-type slug (for {@link isGenericHeading})
 * @param date - ISO run date (for {@link isGenericHeading})
 * @returns Editorial headline, possibly empty
 */
function deriveHeadline(body: string, articleType: string, date: string): string {
  const rawHeadline = extractFirstH1(body);
  if (!rawHeadline) return '';
  if (!isGenericHeading(rawHeadline, articleType, date)) {
    return truncateTitle(rawHeadline);
  }
  const stripped = stripArtifactCategoryAffix(rawHeadline);
  if (stripped && !isGenericHeading(stripped, articleType, date)) {
    return truncateTitle(stripped);
  }
  return '';
}

/**
 * Attempt to resolve the localized brief highlight for one language.
 * Returns `null` when no `executive-brief_<lang>.md` (or extended
 * variant) exists in `runDir`. For `lang === 'en'` always returns `null`
 * — the English brief is handled by the canonical
 * `extractArtifactHighlight` resolver.
 *
 * The body of the localized brief is parsed with the same lede/H1
 * extractors used for the English path, so the semantic rules are
 * symmetric. Generic artefact-category headings
 * (e.g. `# Executive Brief — Breaking News (2026-05-15)`) are detected
 * and stripped via {@link stripArtifactCategoryAffix} so they cannot
 * leak into the SEO surfaces.
 *
 * @param runDir - Absolute run directory (the parent of the brief)
 * @param lang - Target language code
 * @param articleType - Article-type slug (for {@link isGenericHeading})
 * @param date - ISO run date (for {@link isGenericHeading})
 * @returns Resolved localized highlight, or `null` when no brief exists
 */
export function resolveLocalizedBriefHighlight(
  runDir: string,
  lang: LanguageCode,
  articleType: string,
  date: string
): LocalizedBriefHighlight | null {
  if (lang === 'en') return null;
  if (!runDir || !fs.existsSync(runDir)) return null;

  for (const rel of localizedBriefCandidates(lang)) {
    const abs = path.join(runDir, rel);
    if (!fs.existsSync(abs)) continue;

    const body = readArtefactBody(abs);
    if (!body) continue;

    // Tier 1 (NEW, May-2026): structural extraction of `## Strategic
    // Intelligence Summary` / `## Reader Briefing` sections. The
    // briefing extractor is language-agnostic — it matches on the
    // English section headings, which the translation pipeline
    // preserves verbatim under the localized brief contract — so a
    // Swedish brief whose synthesis section is still written as
    // `## Strategic Intelligence Summary` (with translated body
    // prose) will resolve correctly here. When the translator has
    // additionally localized the section heading the matcher falls
    // back to the legacy lede/H1 path below, producing the
    // localized H1 as headline.
    const briefing = extractBriefingHighlight(body);
    if (briefing && (briefing.headline || briefing.summary)) {
      const fallbackHeadline = deriveHeadline(body, articleType, date);
      return {
        headline: briefing.headline || fallbackHeadline,
        summary: briefing.summary,
        extendedSummary:
          briefing.extendedSummary || extractExtendedLedeAfterHeading(body),
        sourceFile: rel,
        sourceLang: lang,
      };
    }

    const headline = deriveHeadline(body, articleType, date);
    const lede = extractLedeAfterHeading(body);
    const summary = lede || extractStrongProseLine(body);
    const extendedSummary = extractExtendedLedeAfterHeading(body);

    if (headline || summary) {
      return {
        headline,
        summary,
        extendedSummary,
        sourceFile: rel,
        sourceLang: lang,
      };
    }
  }

  return null;
}

/**
 * Return the set of language codes for which a translated brief is
 * present in `runDir`. Useful for telemetry and for the `metadataFallback`
 * accounting that records which locales fall back to English.
 *
 * @param runDir - Absolute run directory
 * @param languages - Ordered list of language codes to probe
 * @returns Subset of {@link languages} for which at least one localized
 * brief candidate file exists
 */
export function discoverLocalizedBriefs(
  runDir: string,
  languages: readonly LanguageCode[]
): readonly LanguageCode[] {
  if (!runDir || !fs.existsSync(runDir)) return [];
  const out: LanguageCode[] = [];
  for (const lang of languages) {
    if (lang === 'en') continue;
    for (const rel of localizedBriefCandidates(lang)) {
      const abs = path.join(runDir, rel);
      if (fs.existsSync(abs)) {
        out.push(lang);
        break;
      }
    }
  }
  return out;
}

/**
 * Localized brief body suitable for HTML rendering.
 *
 * Unlike {@link resolveLocalizedBriefHighlight} — which extracts a few
 * short SEO/metadata fields (headline, summary) for `<meta>` tags and
 * JSON-LD — this helper returns the **full body** of the translated
 * executive brief, with the SPDX preamble stripped, so the caller can
 * render it through {@link renderMarkdown} and splice the resulting
 * HTML into the per-language article variant.
 *
 * Used by the article-generator HTML pipeline (`render-one.ts`) to
 * upgrade non-English variants from the English aggregated body to a
 * truly localized one whenever a translated `executive-brief_<lang>.md`
 * exists in the run directory.
 */
export interface LocalizedBriefBody {
  /** Markdown body of the localized brief (post-SPDX strip). */
  readonly markdown: string;
  /** Run-relative path of the file that produced {@link markdown}. */
  readonly sourceFile: string;
}

/**
 * Read the **full markdown body** of a translated executive brief for
 * `lang` from `runDir`, searching the standard candidate paths
 * (`executive-brief_<lang>.md` → `extended/executive-brief_<lang>.md`).
 * SPDX HTML-comment preambles are stripped using the same logic as the
 * SEO-metadata path, so the returned markdown starts at the first real
 * content line (`# Headline` or similar).
 *
 * Returns `null` when `runDir` is missing, the language is English, or
 * no candidate file exists. The caller is expected to fall back to the
 * English aggregated body in that case — see `render-one.ts`.
 *
 * @param runDir - Absolute run directory
 * @param lang - Target language code (omitted when `lang === 'en'`)
 * @returns Localized brief body + source file, or `null` when absent
 */
export function readLocalizedBriefBody(
  runDir: string,
  lang: LanguageCode
): LocalizedBriefBody | null {
  if (!runDir || lang === 'en') return null;
  if (!fs.existsSync(runDir)) return null;
  for (const rel of localizedBriefCandidates(lang)) {
    const abs = path.join(runDir, rel);
    if (!fs.existsSync(abs)) continue;
    const body = readArtefactBody(abs);
    if (body.trim().length === 0) continue;
    return { markdown: body, sourceFile: rel };
  }
  return null;
}
