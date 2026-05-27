// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/BriefingHighlight
 * @description Highlight extractor specialised on the executive-brief
 * style guide introduced for the May-2026 EP10 briefing series. Where
 * {@link editorial-highlight.ts} treats every Stage-B artefact uniformly
 * (first non-generic H1 → headline; first prose paragraph → summary),
 * this module knows that an `executive-brief.md` carries two strong
 * editorial sections that should outrank a generic `## Key Findings`
 * walk:
 *
 *   1. `## Strategic Intelligence Summary` — the synthesis paragraph.
 *      The first `### Sub-section` heading underneath it (e.g.
 *      "The Three-Coalition Paradox") makes a clean, journalistic
 *      `<title>`. The first prose paragraph that follows that
 *      sub-heading makes a clean `<meta description>`.
 *
 *   2. `## Reader Briefing` (a.k.a. `Reader Briefing (Plain Language)`)
 *      — the actionable priority list. When the section is structured
 *      as a numbered list (`1. **Immediate priority**: …`), the bold
 *      label + tail of the first item makes a strong `<title>`. When
 *      it is structured as a single prose paragraph (the
 *      term-outlook style), the paragraph is used verbatim as
 *      description and the first sentence becomes the headline.
 *
 * Both extractors are tolerant of missing sections — they return
 * `null` so the resolver can fall back to the existing
 * `extractArtifactHighlight` ladder for the 200+ historical briefs
 * that pre-date this style guide.
 *
 * This file is a thin orchestrator. The section walker primitives live
 * in {@link briefing-highlight-sections.ts} and the headline-derivation
 * helpers in {@link briefing-highlight-headline.ts}, keeping every
 * sibling file under the 600-line drift-guard cap (see
 * `test/unit/source-file-size.test.js`).
 */

import type { LanguageCode } from '../../types/languages.js';
import {
  resolveHeadingNeedles,
  READER_BRIEFING_HEADINGS_BY_LANG,
  STRATEGIC_SECTION_HEADINGS_BY_LANG,
  TOP_FINDINGS_HEADINGS_BY_LANG,
} from './briefing-highlight-i18n.js';
import { deriveHeadlineFromParagraph } from './briefing-highlight-headline.js';
import {
  extractFirstNumberedItemUnderSection,
  extractFirstParagraphUnderSection,
  extractFirstSubsectionUnderSection,
  stripTradecraftLabels,
} from './briefing-highlight-sections.js';
import {
  truncateDescription,
  truncateExtendedDescription,
  truncateTitle,
} from './text-utils.js';
import { looksLikeBoilerplate } from './title-rejection.js';

/**
 * One resolved brief highlight. Both `headline` and `summary` may be
 * empty when the underlying section is absent or too short to publish.
 * `extendedSummary` is only emitted when the BLUF/synthesis paragraph
 * exceeds the regular description budget — see
 * {@link truncateExtendedDescription} for the cutoff.
 */
export interface BriefingHighlight {
  readonly headline: string;
  readonly summary: string;
  readonly extendedSummary: string;
}

/** Heading text that opens the Strategic Intelligence Summary block. */
const STRATEGIC_SECTION_HEADINGS: readonly string[] = [
  'strategic intelligence summary',
  'strategic assessment',
  'intelligence assessment',
  'headline assessment',
  'bluf',
  'bottom line up front',
  'top line assessment',
  'top line',
  'critical findings',
  'key judgements',
  'key judgments',
  'five key judgments',
  'five key judgements',
  'situation assessment',
  'priority intelligence requirements',
  'most significant breaking development',
  'most significant',
  'principal intelligence assessment',
  'summary assessment',
  'strategic synthesis',
  'wep assessment summary',
  'strategic context',
  'conclusion',
];

/** Heading text that opens the Top Findings / Key Findings block. */
const TOP_FINDINGS_HEADINGS: readonly string[] = [
  'top findings',
  '1. top findings',
  'key findings',
  'critical findings',
  'key events',
  'lead story',
  'top items',
  'primary breaking items',
  'three tier-1 breaking items',
  'for immediate action',
];

/** Heading text that opens the Reader Briefing block. */
const READER_BRIEFING_HEADINGS: readonly string[] = [
  'reader briefing',
  'reader briefing (plain language)',
  'reader briefing — plain language',
];

/**
 * Extract the {@link BriefingHighlight} for a `## Strategic
 * Intelligence Summary` (or compatible) section. Prefers the first
 * `### Sub-section` heading as headline; falls back to the section's
 * first prose paragraph when no sub-heading exists.
 *
 * @param markdown - Brief body
 * @param lang - Locale (drives heading whitelist + boilerplate stems)
 * @returns Resolved highlight, or `null` when the section is absent
 */
export function extractStrategicSynthesisHighlight(
  markdown: string,
  lang: LanguageCode = 'en'
): BriefingHighlight | null {
  const strategicNeedles = resolveHeadingNeedles(
    STRATEGIC_SECTION_HEADINGS_BY_LANG,
    STRATEGIC_SECTION_HEADINGS,
    lang
  );
  const sub = extractFirstSubsectionUnderSection(markdown, strategicNeedles, lang);
  if (sub) {
    return {
      headline: truncateTitle(stripTradecraftLabels(sub.subHeading)),
      summary: truncateDescription(sub.paragraph),
      extendedSummary: truncateExtendedDescription(sub.paragraph),
    };
  }
  const paragraph = extractFirstParagraphUnderSection(markdown, strategicNeedles, lang);
  if (!paragraph) return null;
  // Derive a headline from the paragraph. Try the first sentence first;
  // if truncateTitle returns '' (sentence too long with no clean clause
  // boundary), try progressively shorter sub-clauses separated by commas
  // or dashes that still clear the HEADLINE_HARD_MIN floor (30 chars).
  const headline = deriveHeadlineFromParagraph(paragraph);
  return {
    headline,
    summary: truncateDescription(paragraph),
    extendedSummary: truncateExtendedDescription(paragraph),
  };
}

/**
 * Extract the {@link BriefingHighlight} for a `## Top Findings` /
 * `## Key Findings` section. The `### …` sub-headings under these
 * sections are crafted as journalistic headlines (e.g. "AI Trade
 * Strategy: A Legislative First with Structural Implications").
 *
 * When the sub-heading has a numeric prefix + em-dash
 * (`### Finding 1 — AI Trade Strategy: ...`), the text after the dash
 * is extracted as the headline.
 *
 * @param markdown - Brief body
 * @param lang - Locale (drives heading whitelist + boilerplate stems)
 * @returns Resolved highlight, or `null` when the section is absent
 */
export function extractTopFindingsHighlight(
  markdown: string,
  lang: LanguageCode = 'en'
): BriefingHighlight | null {
  const sub = extractFirstSubsectionUnderSection(
    markdown,
    resolveHeadingNeedles(TOP_FINDINGS_HEADINGS_BY_LANG, TOP_FINDINGS_HEADINGS, lang),
    lang
  );
  if (!sub) return null;
  // Strip numbered/finding prefixes: "Finding 1 — X", "1. X — Y"
  const raw = stripTradecraftLabels(sub.subHeading);
  const cleaned = raw
    .replace(/^(?:finding|item)\s*\d+\s*[—–:\-]\s*/iu, '')
    .replace(/^\d+\.\s*/, '')
    // Strip parenthetical reference codes: (TA-10-2026-0171), (COM(2024)123)
    .replace(/\s*\([A-Z]{1,4}[-/]?\d[\w/()-]*\)\s*/g, ' ')
    // Strip trailing date stamps: "— 19 May 2026", "– 2026-05-19"
    .replace(/\s*[—–\-]\s*\d{1,2}\s+\w+\s+\d{4}\s*$/, '')
    .replace(/\s*[—–\-]\s*\d{4}-\d{2}-\d{2}\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const headline = cleaned ? truncateTitle(cleaned) : '';
  if (!headline) return null;
  return {
    headline,
    summary: truncateDescription(sub.paragraph),
    extendedSummary: truncateExtendedDescription(sub.paragraph),
  };
}

/**
 * Extract the {@link BriefingHighlight} for a `## Reader Briefing` (or
 * compatible) section. Prefers the first numbered-list item as
 * headline when the section is structured as a priority list; falls
 * back to the first prose paragraph when it is written as plain prose
 * (the term-outlook style).
 *
 * @param markdown - Brief body
 * @param lang - Locale (drives heading whitelist + boilerplate stems)
 * @returns Resolved highlight, or `null` when the section is absent
 */
export function extractReaderBriefingHighlight(
  markdown: string,
  lang: LanguageCode = 'en'
): BriefingHighlight | null {
  const readerNeedles = resolveHeadingNeedles(
    READER_BRIEFING_HEADINGS_BY_LANG,
    READER_BRIEFING_HEADINGS,
    lang
  );
  const firstItem = extractFirstNumberedItemUnderSection(markdown, readerNeedles, lang);
  const paragraph = extractFirstParagraphUnderSection(markdown, readerNeedles, lang);
  if (!firstItem && !paragraph) return null;
  // Filter out self-referential boilerplate — "This executive brief
  // synthesizes…" is never a usable headline or summary.
  const usableItem = firstItem && !looksLikeBoilerplate(firstItem, lang) ? firstItem : '';
  const usableParagraph = paragraph && !looksLikeBoilerplate(paragraph, lang) ? paragraph : '';
  const headlineSource = usableItem || usableParagraph;
  const headline = headlineSource ? truncateTitle(headlineSource) : '';
  const summary = usableParagraph
    ? truncateDescription(usableParagraph)
    : usableItem
      ? truncateDescription(usableItem)
      : '';
  const extendedSummary = usableParagraph
    ? truncateExtendedDescription(usableParagraph)
    : truncateExtendedDescription(usableItem);
  if (!headline && !summary) return null;
  return { headline, summary, extendedSummary };
}

/**
 * Combined extractor with a 4-level fallback chain designed to always
 * produce "banger" titles (concise, actor/procedure-led headlines):
 *
 *   **Fallback 1** — `## Strategic Intelligence Summary` → first
 *   `### …` sub-heading (e.g. "The Three-Coalition Paradox").
 *
 *   **Fallback 2** — `## Top Findings` / `## Key Findings` → first
 *   `### …` sub-heading with numeric prefix stripped
 *   (e.g. "AI Trade Strategy: A Legislative First").
 *
 *   **Fallback 3** — `## Reader Briefing` → first numbered-list item
 *   (e.g. "DMA enforcement — Article 265 TFEU threat").
 *
 *   **Fallback 4** — Strategic section paragraph-derived headline
 *   (first newsworthy sentence, truncated to title budget).
 *
 * The chain prefers sub-heading-derived titles because they are
 * crafted as journalistic headlines by the intelligence analyst,
 * whereas paragraph-derived titles require heuristic truncation.
 *
 * @param markdown - Brief body (SPDX preamble already stripped)
 * @param lang - Locale (drives heading whitelist + boilerplate stems)
 * @returns Best `{headline, summary, extendedSummary}`, or `null`
 *          when no usable section exists
 */
export function extractBriefingHighlight(
  markdown: string,
  lang: LanguageCode = 'en'
): BriefingHighlight | null {
  const strategicNeedles = resolveHeadingNeedles(
    STRATEGIC_SECTION_HEADINGS_BY_LANG,
    STRATEGIC_SECTION_HEADINGS,
    lang
  );
  // --- Phase 1: Sub-heading-derived titles (crafted headlines) ---
  // These are the best source because an intelligence analyst wrote them
  // as compact, journalistic headlines.

  // Fallback 1: Strategic section ### sub-heading
  const strategicSub = extractFirstSubsectionUnderSection(markdown, strategicNeedles, lang);
  const strategicSubHeadline = strategicSub
    ? truncateTitle(stripTradecraftLabels(strategicSub.subHeading))
    : '';

  // Fallback 2: Top Findings / Key Events ### sub-heading
  const findings = extractTopFindingsHighlight(markdown, lang);

  // Fallback 3: Reader Briefing numbered item
  const reader = extractReaderBriefingHighlight(markdown, lang);

  // --- Phase 2: Paragraph-derived titles (heuristic extraction) ---
  // These are lower quality — only used when no crafted headline exists.

  // Fallback 4: Strategic section paragraph → newsworthy sentence
  const strategicParagraph = strategicSub
    ? null
    : (() => {
        const paragraph = extractFirstParagraphUnderSection(markdown, strategicNeedles, lang);
        if (!paragraph || looksLikeBoilerplate(paragraph, lang)) return null;
        const headline = deriveHeadlineFromParagraph(paragraph);
        if (!headline) return null;
        return {
          headline,
          summary: truncateDescription(paragraph),
          extendedSummary: truncateExtendedDescription(paragraph),
        } as BriefingHighlight;
      })();

  // Pick headline: sub-heading sources first, then paragraph-derived.
  const headline =
    strategicSubHeadline ||
    findings?.headline ||
    reader?.headline ||
    strategicParagraph?.headline ||
    '';

  // Pick summary/extendedSummary from the richest available source.
  const strategicSubResult: BriefingHighlight | null = strategicSub
    ? {
        headline: strategicSubHeadline,
        summary: truncateDescription(strategicSub.paragraph),
        extendedSummary: truncateExtendedDescription(strategicSub.paragraph),
      }
    : null;

  const summary =
    strategicSubResult?.summary ||
    findings?.summary ||
    reader?.summary ||
    strategicParagraph?.summary ||
    '';
  const extendedSummary =
    strategicSubResult?.extendedSummary ||
    findings?.extendedSummary ||
    reader?.extendedSummary ||
    strategicParagraph?.extendedSummary ||
    '';

  if (!headline && !summary) return null;
  return { headline, summary, extendedSummary };
}
