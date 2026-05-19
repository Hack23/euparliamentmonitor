// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/ArtifactHighlight
 * @description Editorial-artefact highlight resolver extracted from
 * `article-metadata.ts`. Walks the canonical list of editorial artefacts
 * inside a run directory and returns the best `{headline, summary}`
 * pair — either a non-generic H1, a named priority finding, or a
 * stripped category-affix core — for use as the article `<title>` and
 * `<meta description>`.
 *
 * Pure module — depends only on Node `fs`/`path` plus the leaf metadata
 * helpers (h1-extractor, lede-extractor, heading-rules, text-utils) and
 * the language-core constants for the translated-sibling filter.
 */

import fs from 'fs';
import path from 'path';
import { ALL_LANGUAGES } from '../../constants/language-core.js';
import { extractFirstH1 } from './h1-extractor.js';
import { extractLedeAfterHeading, extractStrongProseLine } from './lede-extractor.js';
import {
  isGenericHeading,
  normaliseHeadingText,
  stripArtifactCategoryAffix,
} from './heading-rules.js';
import {
  DESCRIPTION_MAX_LENGTH,
  shouldSkipDescriptionLine,
  stripInlineMarkdown,
  truncateDescription,
  truncateTitle,
} from './text-utils.js';

/** Ordered list of artefact filenames that typically carry the editorial H1. */
const EDITORIAL_ARTEFACT_CANDIDATES: readonly string[] = [
  // `executive-brief.md` is the canonical Riksdagsmonitor-aligned editorial
  // artefact (see `analysis/methodologies/ai-driven-analysis-guide.md`).
  // It always carries the journalist's BLUF and a `## 60-Second Read`
  // paragraph that is the lede — preferring it over `synthesis-summary.md`
  // keeps Stage-B internal vocabulary ("Purpose: This artifact provides …")
  // out of the SEO-critical `<title>` and `<meta description>` surfaces.
  'executive-brief.md',
  'extended/executive-brief.md',
  'intelligence/synthesis-summary.md',
  'intelligence/executive-summary.md',
  'intelligence/intelligence-briefing.md',
  'executive-summary.md',
  'intelligence-briefing.md',
  'synthesis-summary.md',
  'breaking-news-analysis.md',
  'committee-activity-report.md',
  'legislative-pipeline-analysis.md',
  'weekly-outlook.md',
  'monthly-outlook.md',
  'week-in-review.md',
  'month-in-review.md',
  'motions-analysis.md',
  'propositions-analysis.md',
];

/**
 * Attempt to read the first H1 and first prose paragraph from the first
 * existing artefact under `EDITORIAL_ARTEFACT_CANDIDATES`. Returns
 * `null` when no candidate artefact exists.
 *
 * @param runDir - Absolute run directory path
 * @param articleType - Article type slug (used by {@link isGenericHeading})
 * @param date - ISO run date (used by {@link isGenericHeading})
 * @returns `{headline, summary}` where either field may be empty
 */
export function extractArtifactHighlight(
  runDir: string,
  articleType: string,
  date: string
): { readonly headline: string; readonly summary: string } | null {
  if (!runDir || !fs.existsSync(runDir)) return null;

  const direct = scanCandidatesForHighlight(
    runDir,
    EDITORIAL_ARTEFACT_CANDIDATES,
    articleType,
    date
  );
  if (direct.headline) return { headline: direct.headline, summary: direct.summary };

  // Top-level fallback scan — used only when none of the canonical
  // editorial artefacts produced a non-generic H1. We must NOT pick up
  // translated sibling briefs (`executive-brief_<lang>.md`,
  // `synthesis-summary_<lang>.md`, …) here, because their H1s are
  // legitimate localized headlines that the English-only
  // {@link isGenericHeading} detector cannot recognise as boilerplate.
  // Letting them through poisoned the English `<title>` and
  // `<meta description>` for the 2026-05-15 batch with Arabic content
  // from `executive-brief_ar.md`. See {@link isTranslatedSiblingBrief}
  // and the regression test in `test/unit/article-metadata.test.js`.
  const topLevel = safeReaddir(runDir).filter(
    (f) => f.endsWith('.md') && f !== 'manifest.json' && !isTranslatedSiblingBrief(f)
  );
  const fallback = scanCandidatesForHighlight(runDir, topLevel, articleType, date);
  if (fallback.headline) return { headline: fallback.headline, summary: fallback.summary };

  const summaryOnly = direct.summary || fallback.summary;
  if (summaryOnly) {
    return { headline: '', summary: summaryOnly };
  }
  return null;
}

/**
 * Filename suffix pattern that identifies a translated sibling brief
 * (e.g. `executive-brief_ar.md`, `synthesis-summary_zh.md`). The
 * `_<lang>` token is matched against {@link ALL_LANGUAGES} so we never
 * exclude a legitimate English artefact whose name happens to end in
 * `_<two-letter-suffix>.md`.
 */
const TRANSLATED_SIBLING_SUFFIX_RE = new RegExp(`_(${ALL_LANGUAGES.join('|')})\\.md$`, 'i');

/**
 * Return `true` when a top-level `.md` filename looks like a translated
 * sibling of a canonical editorial artefact (e.g.
 * `executive-brief_ar.md`). These files must be excluded from the
 * top-level fallback scan in {@link extractArtifactHighlight} because
 * their localized H1s evade the English-only generic-heading detector
 * and would otherwise hijack the English SEO surfaces.
 *
 * @param filename - Run-relative `.md` filename (no path separators)
 * @returns `true` when the file is a translated sibling brief
 */
export function isTranslatedSiblingBrief(filename: string): boolean {
  return TRANSLATED_SIBLING_SUFFIX_RE.test(filename);
}

/**
 * Walk a list of candidate artefact paths and return the first
 * non-generic headline + summary pair, plus the first usable lede
 * summary seen along the way. Extracted from
 * {@link extractArtifactHighlight} to keep its cognitive complexity
 * within the SonarJS budget.
 *
 * @param runDir - Absolute run directory path
 * @param candidates - Run-relative candidate filenames to probe
 * @param articleType - Article-type slug (used by {@link isGenericHeading})
 * @param date - ISO run date (used by {@link isGenericHeading})
 * @returns `{headline, summary}` where either field may be empty
 */
function scanCandidatesForHighlight(
  runDir: string,
  candidates: readonly string[],
  articleType: string,
  date: string
): { readonly headline: string; readonly summary: string } {
  let bestSummaryOnly = '';
  for (const rel of candidates) {
    const probe = probeCandidateForHighlight(runDir, rel, articleType, date);
    if (probe.cleanHighlight) return probe.cleanHighlight;
    if (probe.strippedHeadline) {
      return { headline: probe.strippedHeadline, summary: probe.summary ?? bestSummaryOnly };
    }
    if (!bestSummaryOnly && probe.summary) {
      bestSummaryOnly = probe.summary;
    }
  }
  return { headline: '', summary: bestSummaryOnly };
}

/**
 * Read a single candidate artefact and classify what it can contribute
 * to the highlight resolver. Extracted from
 * {@link scanCandidatesForHighlight} to keep its cognitive complexity
 * within the SonarJS budget.
 *
 * @param runDir - Absolute run directory
 * @param rel - Run-relative artefact path
 * @param articleType - Article-type slug for {@link isGenericHeading}
 * @param date - ISO run date for {@link isGenericHeading}
 * @returns
 *   - `cleanHighlight` when the artefact has a non-generic H1 (caller may
 *     return it directly)
 *   - `strippedHeadline` when the H1 is generic but yields an editorial
 *     core after {@link stripArtifactCategoryAffix}
 *   - `summary` when the artefact carries a usable lede or strong prose
 *     line (independent of the headline outcome)
 */
function probeCandidateForHighlight(
  runDir: string,
  rel: string,
  articleType: string,
  date: string
): {
  readonly cleanHighlight?: { readonly headline: string; readonly summary: string };
  readonly strippedHeadline?: string;
  readonly summary?: string;
} {
  const abs = path.join(runDir, rel);
  if (!fs.existsSync(abs)) return {};
  const body = readArtefactBody(abs);
  const headline = extractFirstH1(body);
  const lede = extractLedeAfterHeading(body);
  const summary = lede || extractStrongProseLine(body);
  if (headline && !isGenericHeading(headline, articleType, date)) {
    return { cleanHighlight: { headline: truncateTitle(headline), summary } };
  }
  // The artefact H1 is generic boilerplate (`Executive Brief — EU Parliament
  // Breaking News`). Before falling back to a stripped category-core
  // headline, try to surface the FIRST NAMED PRIORITY FINDING from the
  // brief's `## Key Developments` / `## Priority Dossiers` /
  // `## Top Findings` block. This is the canonical Stage-B authoring
  // pattern (see `analysis/templates/executive-brief.md`) — every brief
  // lists its top dossiers as `**Name** (procedure-code, date) — paragraph`
  // or `### N. Name (committee)`. Surfacing that name produces a
  // distinctive editorial headline ("Digital Markets Act Enforcement",
  // "Ukraine War Accountability") instead of a stripped category noun.
  const priority = extractPriorityFindingHighlight(body);
  if (priority?.headline) {
    return {
      cleanHighlight: {
        headline: truncateTitle(priority.headline),
        summary: priority.summary || summary,
      },
    };
  }
  if (headline) {
    const stripped = stripArtifactCategoryAffix(headline);
    if (stripped && !isGenericHeading(stripped, articleType, date)) {
      return { strippedHeadline: truncateTitle(stripped), summary };
    }
  }
  return { summary };
}

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
  'classification',
  'confidence',
  'data sources',
  'data quality',
  'date',
  'generated',
  'lead author',
  'methodology',
  'reporting window',
  'run',
  'session',
  'source',
  'sources',
  'time horizon',
  'wep',
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
    summaryLines.push(stripInlineMarkdown(next));
    if (summaryLines.join(' ').length >= DESCRIPTION_MAX_LENGTH) break;
  }
  return summaryLines;
}

/**
 * Leading priority-label tokens stripped by {@link cleanPriorityHeadline}
 * (`🔴 CRITICAL — Title` → `Title`). Kept as a list to bypass the
 * unsafe-regex lint by avoiding deep alternation in a single pattern.
 */
const PRIORITY_LABEL_TOKENS: readonly string[] = [
  'CRITICAL',
  'HIGH PRIORITY',
  'HIGH',
  'MEDIUM PRIORITY',
  'MEDIUM',
  'LOW PRIORITY',
  'LOW',
  'URGENT',
  'ALERT',
  'PRIORITY',
];

/**
 * Trailing confidence-marker tokens stripped by
 * {@link cleanPriorityHeadline}. Same rationale as
 * {@link PRIORITY_LABEL_TOKENS}.
 */
const PRIORITY_TRAILING_TOKENS: readonly string[] = [
  'CRITICAL',
  'HIGH PRIORITY',
  'HIGH',
  'MEDIUM PRIORITY',
  'MEDIUM',
  'LOW PRIORITY',
  'LOW',
];

/**
 * Leading editorial-prefix tokens stripped by
 * {@link cleanPriorityHeadline} (`Trigger 1: Title` → `Title`).
 */
const PRIORITY_LEADING_PREFIX_TOKENS: readonly string[] = [
  'Trigger',
  'Dossier',
  'Priority',
  'Finding',
  'Item',
  'Highlight',
  'Top',
  'Story',
  'Alert',
  'Judgement',
  'Judgment',
];

/**
 * Strip a leading priority decoration (`🔴 `, `CRITICAL — `) from a
 * candidate headline. Extracted from {@link cleanPriorityHeadline} to
 * keep cognitive complexity within budget.
 *
 * @param text - Candidate headline (already trimmed)
 * @returns Headline with the leading decoration removed
 */
function stripPriorityLeadingDecoration(text: string): string {
  let out = text;
  for (let pass = 0; pass < 2; pass++) {
    out = out.replace(/^[^\p{L}\p{N}]+/u, '').trim();
    for (const token of PRIORITY_LABEL_TOKENS) {
      if (out.toLowerCase().startsWith(token.toLowerCase())) {
        const rest = out.slice(token.length).trim();
        const sep = rest.match(/^[:—–-]\s*(.+)$/u);
        if (sep?.[1]) {
          out = sep[1].trim();
          break;
        }
      }
    }
  }
  return out;
}

/**
 * Strip a leading editorial prefix (`Trigger 1: `, `Dossier 2: `) and a
 * stray leading ordinal (`1. `, `2.1 `) from a candidate headline.
 *
 * @param text - Candidate headline
 * @returns Headline with the leading editorial decoration removed
 */
function stripPriorityLeadingPrefix(text: string): string {
  let out = text;
  for (const token of PRIORITY_LEADING_PREFIX_TOKENS) {
    if (!out.toLowerCase().startsWith(token.toLowerCase())) continue;
    const rest = out.slice(token.length);
    const match = rest.match(/^\s+\d+\s*[:–—-]\s*(.+)$/u);
    if (match?.[1]) {
      out = match[1];
      break;
    }
  }
  // Drop a stray leading "1. " / "2) " ordinal.
  out = out.replace(/^\d+[.):·\s]\s*/u, '');
  return out;
}

/**
 * Strip a trailing confidence marker (`🔴 CRITICAL`, `🟡 MEDIUM`) from a
 * candidate headline. Single pass — caller invokes inside a fixed-point
 * loop.
 *
 * @param text - Candidate headline
 * @returns Headline with the trailing confidence marker removed
 */
function stripPriorityTrailingMarker(text: string): string {
  let out = text;
  for (const token of PRIORITY_TRAILING_TOKENS) {
    const pattern = new RegExp(`\\s+[^\\p{L}\\p{N}\\s]?\\s*${token}\\s*$`, 'iu');
    const next = out.replace(pattern, '');
    if (next !== out) {
      out = next;
      break;
    }
  }
  return out;
}

/**
 * Normalise a priority-finding headline: drop the
 * `Trigger N:` / `Dossier N:` / leading-numeric prefix, strip trailing
 * parenthesised metadata (`(TA-10-2026-0160, 2026-04-30)`,
 * `(ITRE/ENVI)`), and trim residual punctuation. The result is a
 * headline-shaped string suitable for `<title>` use.
 *
 * @param raw - Raw bold-title or heading text
 * @returns Cleaned headline (may be empty after stripping)
 */
function cleanPriorityHeadline(raw: string): string {
  let text = stripInlineMarkdown(raw).trim();
  text = stripPriorityLeadingDecoration(text);
  text = stripPriorityLeadingPrefix(text);
  // Trailing cleanup runs in a fixed-point loop so combined patterns
  // like "Title (Confidence, 80%): 🔴" collapse all the way down to
  // "Title".
  let previous = '';
  while (previous !== text) {
    previous = text;
    text = stripPriorityTrailingMarker(text);
    text = stripPriorityTailMetadata(text);
    // Drop a single trailing emoji left after metadata stripping.
    text = text.replace(/\s+[^\p{L}\p{N}\s]+\s*$/u, '');
    // Drop trailing colons / dashes left over.
    text = text.replace(/[\s:—–-]+$/u, '');
    text = text.trim();
  }
  return text;
}

/**
 * Strip the trailing parenthesised metadata that briefs append to every
 * priority-finding name — procedure codes, dates, committee tags. The
 * regex is intentionally non-greedy so it removes only the LAST
 * parenthesised group on the line.
 *
 * @param text - Headline or paragraph text
 * @returns Text with the trailing `(…)` stripped
 */
function stripPriorityTailMetadata(text: string): string {
  return text.replace(/\s*\([^()]{3,80}\)\s*$/u, '').trim();
}

/**
 * Read an artefact file, skipping any SPDX HTML-comment header rows so the
 * first-H1 / first-prose logic is never derailed by the REUSE preamble.
 *
 * @param abs - Absolute file path
 * @returns File contents with SPDX comment lines dropped
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
    if (line.startsWith('<!--') && line.endsWith('-->')) {
      i++;
      continue;
    }
    break;
  }
  return lines.slice(i).join('\n');
}

/**
 * `fs.readdirSync` wrapped to never throw for missing or unreadable
 * directories.
 *
 * @param dir - Absolute directory path
 * @returns Entries in {@link dir} or `[]` when unreadable
 */
function safeReaddir(dir: string): string[] {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}
