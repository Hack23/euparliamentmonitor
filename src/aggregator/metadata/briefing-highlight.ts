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
 *      sub-heading makes a clean `<meta description>` (and
 *      `og:description` when long enough).
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
 * Pure leaf module under `metadata/` — depends only on
 * {@link stripInlineMarkdown}, {@link truncateTitle},
 * {@link truncateDescription}, and {@link truncateExtendedDescription}
 * from `text-utils`. No I/O, no upward imports.
 */

import {
  EXTENDED_DESCRIPTION_MAX_LENGTH,
  stripInlineMarkdown,
  truncateDescription,
  truncateExtendedDescription,
  truncateTitle,
} from './text-utils.js';

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
const STRATEGIC_SECTION_HEADINGS = [
  'strategic intelligence summary',
  'strategic assessment',
  'intelligence assessment',
] as const;

/** Heading text that opens the Reader Briefing block. */
const READER_BRIEFING_HEADINGS = [
  'reader briefing',
  'reader briefing (plain language)',
  'reader briefing — plain language',
] as const;

/**
 * Compare a raw `## …` heading line against a whitelist of expected
 * section names. The comparison strips inline Markdown decorations and
 * leading non-alphanumeric characters (emoji, punctuation) so a brief
 * that writes the heading as `## 🧭 Strategic Intelligence Summary`
 * still matches.
 *
 * @param raw - Heading text without the leading `#`s
 * @param needles - Lower-case whitelist entries
 * @returns `true` when the heading text matches any whitelist entry
 */
function headingMatches(raw: string, needles: readonly string[]): boolean {
  const normalized = stripInlineMarkdown(raw)
    .replace(/[*_`#]+/g, '')
    .replace(/^[^A-Za-z0-9]+/, '')
    .trim()
    .toLowerCase();
  for (const needle of needles) {
    if (normalized === needle) return true;
    if (normalized.startsWith(`${needle} `) || normalized.startsWith(`${needle}:`)) return true;
    if (normalized.startsWith(`${needle} —`) || normalized.startsWith(`${needle} –`)) return true;
    if (normalized.startsWith(`${needle} -`) || normalized.startsWith(`${needle}(`)) return true;
  }
  return false;
}

/**
 * Iterator state for a Markdown walk through the brief body. We scan
 * line-by-line, toggling fence state, tracking whether we have entered
 * the target `## …` block, and collecting prose paragraphs.
 */
interface BlockBuffer {
  readonly lines: string[];
  byteCount: number;
}

/** Push a prose line into a block buffer (joining with a space). */
function pushLine(buf: BlockBuffer, line: string): void {
  buf.lines.push(line);
  buf.byteCount += line.length + 1;
}

/**
 * Walk the brief body line-by-line and return the first `### …`
 * heading + its first prose paragraph that occur **inside** the
 * matched `## …` block. Returns `null` when the matched block does
 * not contain a `### …` sub-heading (so the caller can fall back to
 * its prose-only extractor).
 *
 * @param markdown - Brief body (SPDX preamble already stripped)
 * @param sectionNeedles - Lower-case `## …` whitelist
 * @returns First `{subHeading, paragraph}` pair under the matched
 *          section, or `null` when no sub-heading exists
 */
function extractFirstSubsectionUnderSection(
  markdown: string,
  sectionNeedles: readonly string[]
): { readonly subHeading: string; readonly paragraph: string } | null {
  let inSection = false;
  let subHeading = '';
  const buf: BlockBuffer = { lines: [], byteCount: 0 };
  let inFence = false;

  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (line.startsWith('## ')) {
      // Crossed into (or out of) the target section.
      const headingText = line.replace(/^##\s+/, '');
      if (headingMatches(headingText, sectionNeedles)) {
        inSection = true;
        subHeading = '';
        buf.lines.length = 0;
        buf.byteCount = 0;
        continue;
      }
      if (inSection) {
        // We've left the target section without finding a sub-heading
        // with prose — stop walking.
        if (subHeading && buf.lines.length > 0) break;
        inSection = false;
        continue;
      }
      continue;
    }

    if (!inSection) continue;

    if (line.startsWith('### ')) {
      if (subHeading && buf.lines.length > 0) break;
      subHeading = stripInlineMarkdown(line.replace(/^###\s+/, ''));
      buf.lines.length = 0;
      buf.byteCount = 0;
      continue;
    }

    if (!subHeading) continue;

    if (line === '') {
      if (buf.lines.length > 0) break;
      continue;
    }

    // Stop on structural lines we never publish (tables, blockquotes,
    // metadata bullets that start with bold `**Label**:`, HTML).
    if (line.startsWith('|') || line.startsWith('>') || line.startsWith('<')) {
      if (buf.lines.length > 0) break;
      continue;
    }
    if (line.startsWith('---') || line.startsWith('===')) {
      if (buf.lines.length > 0) break;
      continue;
    }

    pushLine(buf, stripInlineMarkdown(line));
    if (buf.byteCount >= EXTENDED_DESCRIPTION_MAX_LENGTH) break;
  }

  if (!subHeading || buf.lines.length === 0) return null;
  return { subHeading: subHeading.trim(), paragraph: buf.lines.join(' ').trim() };
}

/**
 * Walk the brief body and return the first prose paragraph that occurs
 * **inside** the matched `## …` block (ignoring any `### …`
 * sub-headings). Used as the fallback extractor when the section is a
 * single-paragraph block (the term-outlook Reader Briefing style).
 *
 * Skips metadata-style bullets that begin with `**Confidence**:` etc.
 *
 * @param markdown - Brief body (SPDX preamble already stripped)
 * @param sectionNeedles - Lower-case `## …` whitelist
 * @returns First prose paragraph, or empty string when absent
 */
function extractFirstParagraphUnderSection(
  markdown: string,
  sectionNeedles: readonly string[]
): string {
  let inSection = false;
  const buf: BlockBuffer = { lines: [], byteCount: 0 };
  let inFence = false;

  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (line.startsWith('## ')) {
      if (inSection && buf.lines.length > 0) break;
      const headingText = line.replace(/^##\s+/, '');
      inSection = headingMatches(headingText, sectionNeedles);
      continue;
    }

    if (!inSection) continue;
    if (line.startsWith('### ')) continue;

    if (line === '') {
      if (buf.lines.length > 0) break;
      continue;
    }

    if (line.startsWith('|') || line.startsWith('>') || line.startsWith('<')) {
      if (buf.lines.length > 0) break;
      continue;
    }
    if (line.startsWith('---') || line.startsWith('===')) {
      if (buf.lines.length > 0) break;
      continue;
    }

    pushLine(buf, stripInlineMarkdown(line));
    if (buf.byteCount >= EXTENDED_DESCRIPTION_MAX_LENGTH) break;
  }

  return buf.lines.length === 0 ? '' : buf.lines.join(' ').trim();
}

/**
 * Walk the brief body and return the first numbered-list item that
 * appears **inside** the matched `## …` block. Recognises the
 * `1. **Immediate priority**: …` shape used by the May-2026
 * Reader Briefing style guide. The bold label and tail are joined into
 * a single headline-shaped string. Returns the empty string when no
 * numbered list is present.
 *
 * @param markdown - Brief body
 * @param sectionNeedles - `## …` whitelist
 * @returns Flattened first list item, or empty string when absent
 */
function extractFirstNumberedItemUnderSection(
  markdown: string,
  sectionNeedles: readonly string[]
): string {
  let inSection = false;
  let inFence = false;
  const item: string[] = [];

  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (line.startsWith('## ')) {
      if (inSection && item.length > 0) break;
      const headingText = line.replace(/^##\s+/, '');
      inSection = headingMatches(headingText, sectionNeedles);
      continue;
    }

    if (!inSection) continue;

    // Look for `1.` numbered-list opener.
    if (item.length === 0) {
      const m = /^1\.\s+(.*)$/u.exec(line);
      if (m && m[1]) {
        item.push(stripInlineMarkdown(m[1]).trim());
      }
      continue;
    }

    // Continuation line (indented or non-empty without another list marker).
    if (line === '') break;
    if (/^\d+\.\s+/u.test(line)) break;
    if (line.startsWith('-') || line.startsWith('*')) break;
    if (line.startsWith('##') || line.startsWith('### ')) break;
    item.push(stripInlineMarkdown(line).trim());
  }

  return item.join(' ').trim();
}

/**
 * Extract the {@link BriefingHighlight} for a `## Strategic
 * Intelligence Summary` (or compatible) section. Prefers the first
 * `### Sub-section` heading as headline; falls back to the section's
 * first prose paragraph when no sub-heading exists.
 *
 * @param markdown - Brief body
 * @returns Resolved highlight, or `null` when the section is absent
 */
export function extractStrategicSynthesisHighlight(markdown: string): BriefingHighlight | null {
  const sub = extractFirstSubsectionUnderSection(markdown, STRATEGIC_SECTION_HEADINGS);
  if (sub) {
    return {
      headline: truncateTitle(sub.subHeading),
      summary: truncateDescription(sub.paragraph),
      extendedSummary: truncateExtendedDescription(sub.paragraph),
    };
  }
  const paragraph = extractFirstParagraphUnderSection(markdown, STRATEGIC_SECTION_HEADINGS);
  if (!paragraph) return null;
  return {
    headline: '',
    summary: truncateDescription(paragraph),
    extendedSummary: truncateExtendedDescription(paragraph),
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
 * @returns Resolved highlight, or `null` when the section is absent
 */
export function extractReaderBriefingHighlight(markdown: string): BriefingHighlight | null {
  const firstItem = extractFirstNumberedItemUnderSection(markdown, READER_BRIEFING_HEADINGS);
  const paragraph = extractFirstParagraphUnderSection(markdown, READER_BRIEFING_HEADINGS);
  if (!firstItem && !paragraph) return null;
  const headlineSource = firstItem || paragraph;
  const headline = headlineSource ? truncateTitle(headlineSource) : '';
  const summary = paragraph
    ? truncateDescription(paragraph)
    : firstItem
      ? truncateDescription(firstItem)
      : '';
  const extendedSummary = paragraph
    ? truncateExtendedDescription(paragraph)
    : truncateExtendedDescription(firstItem);
  if (!headline && !summary) return null;
  return { headline, summary, extendedSummary };
}

/**
 * Combined extractor that runs the Strategic Intelligence Summary path
 * first (highest editorial value) and falls back to Reader Briefing
 * when Strategic Intelligence Summary is absent. Merges the two so a
 * brief that contains **both** sections can use the strategic
 * sub-heading as headline and the reader-briefing prose as the
 * extended description.
 *
 * @param markdown - Brief body (SPDX preamble already stripped)
 * @returns Best `{headline, summary, extendedSummary}`, or `null`
 *          when neither section exists
 */
export function extractBriefingHighlight(markdown: string): BriefingHighlight | null {
  const strategic = extractStrategicSynthesisHighlight(markdown);
  const reader = extractReaderBriefingHighlight(markdown);
  if (!strategic && !reader) return null;
  if (strategic && reader) {
    return {
      headline: strategic.headline || reader.headline,
      summary: strategic.summary || reader.summary,
      extendedSummary: strategic.extendedSummary || reader.extendedSummary,
    };
  }
  return strategic ?? reader;
}
