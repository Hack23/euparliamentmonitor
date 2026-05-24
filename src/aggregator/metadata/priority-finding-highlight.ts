// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/PriorityFindingHighlight
 * @description Priority-finding headline/summary extractor split out from
 * artifact-highlight.ts to keep individual file sizes under 600 LOC.
 *
 * Public entry point: extractPriorityFindingHighlight(body) — used by
 * artifact-highlight.ts when an artefact has no usable H1.
 */

import { normaliseHeadingText } from './heading-rules.js';
import {
  cleanPriorityHeadline,
  stripPriorityTailMetadata,
} from './priority-finding-cleaning.js';
import {
  DESCRIPTION_MAX_LENGTH,
  shouldSkipDescriptionLine,
  stripInlineMarkdown,
  stripLeadingProseLabel,
  truncateDescription,
} from './text-utils.js';

/**
 * Section headings inside the executive brief that introduce the
 * named-priority-finding block (matched case-insensitively against the
 * decoration-stripped heading text, see {@link normaliseHeadingText}).
 */
const PRIORITY_FINDING_SECTION_HEADINGS: readonly string[] = [
  'key developments',
  'key findings',
  'key intelligence summary',
  'key judgements',
  'key judgments',
  'headline intelligence',
  'headline judgements',
  'headline judgments',
  'lead story',
  'policy intelligence alerts',
  'priority dossiers',
  'priority dossiers under committee scrutiny',
  'priority findings',
  'priority intelligence assessment',
  'priority items',
  'top findings',
  'top developments',
  'top dossiers',
  'top trigger events',
  'top triggers',
  'trigger events',
  'top documents',
  'top procedures',
  'top 3 triggers',
  'wep assessment',
  'high priority',
  'highest priority',
];

/**
 * Mine the FIRST named priority finding from an executive-brief–style
 * artefact body. Looks for a section heading from
 * {@link PRIORITY_FINDING_SECTION_HEADINGS} and returns the first dossier
 * name + descriptive paragraph found inside it. Supports the three
 * canonical Stage-B authoring patterns:
 *
 *   1. **Bold-in-numbered-list** (breaking briefs):
 *      `1. **Digital Markets Act Enforcement** (TA-10-2026-0160, 2026-04-30)`
 *      `   Parliament adopted a resolution …`
 *   2. **Numbered subheading** (committee briefs):
 *      `### 1. Clean Industrial Deal Implementation (ITRE/ENVI)`
 *      `The Clean Industrial Deal framework …`
 *   3. **Bold-leading paragraph** (synthesis variants):
 *      `**Trigger 1: DMA Enforcement Resolution** (TA-10-2026-0160)`
 *      `- Significance: 🟢 HIGH IMPACT …`
 *
 * Trailing parenthesised metadata (`(TA-10-2026-0160, 2026-04-30)`,
 * `(ITRE/ENVI)`) is stripped from the headline so it stays headline-shaped
 * (`Digital Markets Act Enforcement`) rather than boilerplate
 * (`Digital Markets Act Enforcement (TA-10-2026-0160, 2026-04-30)`).
 *
 * @param body - Editorial artefact body
 * @returns `{headline, summary}` when a priority finding was identified;
 *   `null` when the body has no priority section or no usable item inside
 */
export function extractPriorityFindingHighlight(
  body: string
): { readonly headline: string; readonly summary: string } | null {
  if (!body) return null;
  const lines = body.split('\n');
  return scanPrioritySection(lines) ?? scanH2StoryHeadings(lines);
}

/**
 * Strategy 1 — scan inside the first recognised priority-finding
 * section heading for a usable item (Pattern A/B/C/D). Returns `null`
 * when the section is absent or contains no matchable item.
 *
 * @param lines - Body lines (already split on `\n`)
 * @returns `{headline, summary}` when an item was identified
 */
function scanPrioritySection(
  lines: readonly string[]
): { readonly headline: string; readonly summary: string } | null {
  const sectionStart = findPrioritySectionStart(lines);
  if (sectionStart < 0) return null;
  for (let i = sectionStart + 1; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    if (!line) continue;
    // Stop at the next H2 (sibling section) but allow `### …` and
    // `#### …` subheadings inside (e.g. `### 🔴 HIGH PRIORITY` between
    // the section header and the first list item).
    if (/^##(?!#)/.test(line)) return null;
    const candidate = extractPriorityFindingItem(lines, i);
    if (candidate) return candidate;
  }
  return null;
}

/**
 * Story-keyword tokens used by `## Lead Story:` / `## Story N:` /
 * `## Trigger N:` H2 heading detection. Kept as a runtime list so the
 * regex stays bounded and bypasses the unsafe-regex lint by avoiding
 * deep alternation.
 */
const H2_STORY_TOKENS: readonly string[] = [
  'Lead Story',
  'Story',
  'Trigger',
  'Alert',
  'Judgement',
  'Judgment',
];

/**
 * Strategy 2 — walk every `## …` H2 heading and try to recognise a
 * story-style heading (`## 📌 Lead Story: Russia Accountability`,
 * `## Story 1 — DMA Enforcement`). Used as a fallback when no priority
 * section was found, because motions briefs publish each lead story as
 * its own H2 without a parent section.
 *
 * @param lines - Body lines (already split on `\n`)
 * @returns `{headline, summary}` when a story heading was identified
 */
function scanH2StoryHeadings(
  lines: readonly string[]
): { readonly headline: string; readonly summary: string } | null {
  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    if (!line.startsWith('## ')) continue;
    const headingText = line.replace(/^##\s+/u, '');
    const storyHeadline = extractH2StoryHeadline(headingText);
    if (!storyHeadline) continue;
    const result = buildPriorityResult(storyHeadline, '', lines, i);
    if (result?.headline) return result;
  }
  return null;
}

/**
 * Recognise the H2-story shape (`📌 Lead Story: Title`, `Story 1 —
 * Title`, `Trigger 2: Title`) and return the residual headline portion.
 * Returns an empty string when the heading does not match a story
 * keyword. Implemented as discrete string operations (rather than one
 * dense regex) to keep the function under the unsafe-regex linter and
 * cognitive-complexity budgets.
 *
 * @param headingText - Heading text with the leading `## ` already removed
 * @returns Residual headline or empty string
 */
function extractH2StoryHeadline(headingText: string): string {
  // Strip a short leading decoration / emoji block (up to 4 non-alphanumerics).
  const stripped = headingText.replace(/^[^A-Za-z0-9]{0,4}\s*/u, '');
  for (const token of H2_STORY_TOKENS) {
    if (!stripped.toLowerCase().startsWith(token.toLowerCase())) continue;
    let rest = stripped.slice(token.length).trim();
    // `Story 1` / `Trigger 2` — accept and consume the trailing digit.
    if (token !== 'Lead Story') {
      const digit = rest.match(/^\d+\b/u);
      if (!digit) continue;
      rest = rest.slice(digit[0].length).trim();
    }
    // Require an explicit `:` / `—` / `–` / `-` / `.` separator before
    // the residual headline so plain prose H2s never match.
    const sep = rest.match(/^[:—–\-.]\s+(.+)$/u);
    if (sep?.[1]) return sep[1].trim();
  }
  return '';
}

/**
 * Locate the line index of the first priority-finding section heading
 * inside an artefact body. Returns `-1` when no such heading exists.
 *
 * @param lines - Body lines (already split on `\n`)
 * @returns Line index of the `## …` heading, or `-1`
 */
function findPrioritySectionStart(lines: readonly string[]): number {
  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    const match = line.match(/^#{2,4}\s+(.+)$/u);
    if (!match) continue;
    const text = normaliseHeadingText(match[1] ?? '');
    if (!text) continue;
    if (headingMatchesPriorityProbe(text)) return i;
  }
  return -1;
}

/**
 * Word-boundary substring matcher for the priority-finding section
 * detector. Extracted from {@link findPrioritySectionStart} to keep its
 * cognitive complexity within budget.
 *
 * @param text - Heading text already normalised by {@link normaliseHeadingText}
 * @returns `true` when one of {@link PRIORITY_FINDING_SECTION_HEADINGS}
 *   appears as a word-bounded substring of {@link text}
 */
function headingMatchesPriorityProbe(text: string): boolean {
  for (const probe of PRIORITY_FINDING_SECTION_HEADINGS) {
    if (text === probe) return true;
    const idx = text.indexOf(probe);
    if (idx < 0) continue;
    const before = idx === 0 ? ' ' : (text[idx - 1] ?? ' ');
    const after = text[idx + probe.length] ?? ' ';
    if (!/[A-Za-z0-9]/.test(before) && !/[A-Za-z0-9]/.test(after)) return true;
  }
  return false;
}

/**
 * Try to recognise a priority-finding item starting at {@link i}. Returns
 * the resolved `{headline, summary}` pair when the item matches one of the
 * three authoring patterns; returns `null` otherwise so the caller can
 * advance to the next line.
 *
 * @param lines - Body lines (already split on `\n`)
 * @param i - Index of the candidate line
 * @returns Priority-finding pair when matched, `null` otherwise
 */
function extractPriorityFindingItem(
  lines: readonly string[],
  i: number
): { readonly headline: string; readonly summary: string } | null {
  const line = (lines[i] ?? '').trim();
  // Pattern A — numbered list item with bold title:
  //   `1. **Digital Markets Act Enforcement** (TA-10-2026-0160, 2026-04-30)`
  const numberedBold = line.match(/^\d+\.\s+\*\*([^*]+?)\*\*\s*(.*)$/u);
  if (numberedBold) {
    return buildPriorityResult(numberedBold[1] ?? '', numberedBold[2] ?? '', lines, i);
  }
  // Pattern B — numbered subheading. Requires an explicit separator
  // (`:` / `.` / `)` / `·` / `–` / `—` / `-`) after the number so
  // dotted decimal section labels like `### 2.1 Close to Adoption`
  // do NOT leak into the headline. Examples:
  //   `### 1. Clean Industrial Deal Implementation (ITRE/ENVI)`
  //   `### 1 · Headline Judgements` (middle dot)
  //   `### KJ-1: Digital Regulation Enforcement …`
  //   `### KF-3: Banking Union Completion`
  //   `### T-2: DMA Enforcement Resolution`
  // Two narrow patterns instead of one wide alternation to keep the
  // pattern within the unsafe-regex linter's complexity budget.
  const numericHeading = line.match(/^#{3,4}\s+\d+[:.)·–—\s-]\s*(.+)$/u);
  if (numericHeading) {
    return buildPriorityResult(numericHeading[1] ?? '', '', lines, i);
  }
  const tagHeading = line.match(/^#{3,4}\s+[A-Z]{1,3}-?\d+[:.)·–—\s-]\s*(.+)$/u);
  if (tagHeading) {
    return buildPriorityResult(tagHeading[1] ?? '', '', lines, i);
  }
  // Pattern D — word-prefixed subheading (`### Alert 1 — Title 🔴`,
  // `### Judgement 1 — Title`, `### Trigger 1: DMA Enforcement`):
  const wordTaggedHeading = line.match(
    /^#{3,4}\s+(?:Alert|Judgement|Judgment|Finding|Story|Item|Trigger|Highlight|Dossier|Priority|Top)\s+\d+\s*[:.)·–—\s-]+(.+)$/iu
  );
  if (wordTaggedHeading) {
    return buildPriorityResult(wordTaggedHeading[1] ?? '', '', lines, i);
  }
  // Pattern C — bold-leading paragraph trigger:
  //   `**Trigger 1: DMA Enforcement Resolution** (TA-10-2026-0160)`
  //   `**Digital Markets Act Enforcement**`
  // Rejected when:
  //   - the bold body is longer than a plausible headline (>110 chars) —
  //     that's a bold paragraph lede masquerading as a headline (e.g.
  //     `**This period captures the April 2026 Strasbourg …**`)
  //   - the bold body is a metadata key (`**Admiralty Grade: B/2**`,
  //     `**Reporting Window:** …`, `**Date:** …`) — these are banner
  //     rows, not editorial headlines
  const boldOnly = line.match(/^\*\*([^*]+?)\*\*\s*(.*)$/u);
  if (boldOnly && !line.startsWith('**Confidence') && !isMetadataBoldLine(line)) {
    const candidate = (boldOnly[1] ?? '').trim();
    if (candidate.length > 0 && candidate.length <= 110) {
      return buildPriorityResult(candidate, boldOnly[2] ?? '', lines, i);
    }
  }
  return null;
}

/**
 * Bold prefix tokens that indicate a metadata banner row rather than an
 * editorial headline. The Stage-B brief template uses these consistently
 * as the lede block (`**Reporting Window:** 3 Apr – 1 May 2026`,
 * `**Admiralty Grade:** B/2`, `**Date:** 2026-05-15`); they must never
 * leak into `<title>`.
 */
const PRIORITY_METADATA_BOLD_PREFIXES: readonly string[] = [
  'admiralty',
  'admiralty scale',
  'admiralty scale used',
  'analysis owner',
  'analyst note',
  'analytical quality',
  'bluf',
  'bottom line up front',
  'caveats and gaps',
  'classification',
  'composition layer',
  'confidence',
  'confidence summary',
  'data quality',
  'data sources',
  'date',
  'emerging patterns',
  'forward indicators',
  'gate target',
  'generated',
  'headline judgement',
  'headline judgment',
  'horizon',
  'imf status',
  'issue',
  'key assumptions',
  'key assumptions check',
  'key intelligence',
  'key risk indicators',
  'lead author',
  'master assumptions',
  'master narrative',
  'methodology',
  'parliamentary status',
  'period',
  'prepared',
  'purpose',
  'quality of information check',
  'reporting',
  'reporting window',
  'run',
  'sat documentation',
  'sat documentation below',
  'scope',
  'session',
  'signal assessment',
  'source',
  'sources',
  'threat level',
  'tier 1 priority issues',
  'tier 2 priority issues',
  'tier 3 priority issues',
  'tier 1 priority',
  'tier 2 priority',
  'tier 3 priority',
  'time horizon',
  'top line',
  'top-line judgement',
  'top-line judgment',
  'wep',
  'wep band',
  'wep bands',
  'wep bands applied',
  'window',
];

/**
 * Recognise a metadata-banner bold line (`**Admiralty Grade: B/2**`,
 * `**Reporting Window:** 3 Apr – 1 May 2026`). The check is
 * deliberately case-insensitive and tolerant of trailing colons inside
 * or outside the bold delimiters.
 *
 * @param line - Trimmed source line (already known to start with `**`)
 * @returns `true` when the line is a metadata banner that must be
 *   skipped by Pattern C
 */
function isMetadataBoldLine(line: string): boolean {
  const inner = line
    .replace(/^\*\*([^*]+?)\*\*.*$/u, '$1')
    .trim()
    .toLowerCase();
  for (const prefix of PRIORITY_METADATA_BOLD_PREFIXES) {
    if (inner === prefix) return true;
    if (inner.startsWith(`${prefix}:`)) return true;
    if (inner.startsWith(`${prefix} `) && inner.includes(':')) return true;
    if (inner.startsWith(`${prefix}—`) || inner.startsWith(`${prefix} —`)) return true;
  }
  // Pipe-banner shape: two or more `|`-separated segments inside the
  // bold body indicate a methodology / SAT-tag banner row, never an
  // editorial headline (e.g.
  // `**WEP Bands Applied | Admiralty Scale Used | SAT Documentation**`).
  // Single `|` is allowed because it occurs in legitimate headlines
  // ("Brexit | A Decade On"). Three or more delimiters is the threshold.
  const pipeSegments = inner.split('|').map((s) => s.trim()).filter((s) => s.length > 0);
  if (pipeSegments.length >= 3) return true;
  // Trailing-ellipsis bold: `**Some long banner line…**` was clipped by
  // the brief author and is not a usable editorial headline.
  if (inner.endsWith('…') || inner.endsWith('...')) return true;
  return false;
}

/**
 * Compose the `{headline, summary}` pair for one matched priority-finding
 * item. Cleans `Trigger N:` / `N.` prefixes off the headline, strips the
 * trailing `(TA-10-…, …)` / `(ITRE/ENVI)` metadata, and gathers the
 * following prose lines as the summary.
 *
 * @param rawHeadline - Raw bold title or numbered-heading text
 * @param tail - Same-line trailing text (after the bold close / heading)
 * @param lines - Body lines (already split on `\n`)
 * @param i - Index of the matched line
 * @returns Cleaned `{headline, summary}` — headline may be empty when
 *   cleaning collapses it below a minimum length, in which case the
 *   caller falls through
 */
function buildPriorityResult(
  rawHeadline: string,
  tail: string,
  lines: readonly string[],
  i: number
): { readonly headline: string; readonly summary: string } | null {
  const cleaned = cleanPriorityHeadline(rawHeadline);
  if (cleaned.length < 5) return null;
  const summaryLines = collectPrioritySummaryLines(tail, lines, i);
  const summary = truncateDescription(summaryLines.join(' '));
  return { headline: cleaned, summary };
}

/**
 * Decide whether a follow-up line is a hard stop for priority-finding
 * summary gathering (next heading / next list item) — collapses three
 * boolean checks out of {@link buildPriorityResult}'s main loop.
 *
 * @param line - Trimmed follow-up line
 * @returns `true` when the gathering loop must break
 */
function isPrioritySummaryStopper(line: string): boolean {
  if (/^#{1,6}\s/.test(line)) return true;
  if (/^\d+\.\s/.test(line)) return true;
  if (/^[-*]\s/.test(line)) return true;
  return false;
}

/**
 * Gather the summary prose for a priority-finding item — the same-line
 * tail (with leading procedure-code parens stripped) plus subsequent
 * prose lines until a blank line / new heading / new bullet is hit.
 *
 * @param tail - Same-line text that trails the bold/heading
 * @param lines - Full body lines
 * @param i - Index of the matched headline line
 * @returns Ordered list of summary segments (already clean)
 */
function collectPrioritySummaryLines(
  tail: string,
  lines: readonly string[],
  i: number
): readonly string[] {
  const summaryLines: string[] = [];
  // Strip leading parens-metadata (`(TA-10-2026-0160, 2026-04-30)`) and
  // trailing parens-metadata from the tail so the summary starts with
  // editorial prose, not a procedure-code citation.
  let tailText = stripInlineMarkdown(tail).trim();
  tailText = tailText.replace(/^\([^()]{3,80}\)\s*/u, '');
  tailText = stripPriorityTailMetadata(tailText).trim();
  // Strip leading all-caps prose labels (`BLUF:`, `SITUATION:`, `WEP:`,
  // `KEY MOTION:`) that the lede-extractor walker already removes —
  // priority-finding summaries flow into the same `<meta description>`
  // surface and the HTML pipeline test forbids the all-caps opener.
  tailText = stripLeadingProseLabel(tailText);
  if (tailText) summaryLines.push(tailText);
  for (let j = i + 1; j < lines.length; j++) {
    const next = (lines[j] ?? '').trim();
    if (!next) {
      if (summaryLines.length > 0) break;
      continue;
    }
    if (isPrioritySummaryStopper(next)) break;
    if (next.startsWith('**Confidence') || next.startsWith('- **Confidence')) continue;
    if (shouldSkipDescriptionLine(next)) continue;
    summaryLines.push(stripLeadingProseLabel(stripInlineMarkdown(next)));
    if (summaryLines.join(' ').length >= DESCRIPTION_MAX_LENGTH) break;
  }
  return summaryLines;
}
