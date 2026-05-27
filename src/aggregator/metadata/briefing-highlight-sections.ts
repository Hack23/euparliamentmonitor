// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/BriefingHighlightSections
 * @description Section walker primitives for {@link briefing-highlight.ts}.
 * Extracted as a sibling leaf module so the public extractor surface stays
 * below the 600-line drift-guard cap (see
 * `test/unit/source-file-size.test.js`). The walkers are pure — every
 * function takes (markdown body, section-needle list, language) and returns
 * a structural fragment with no I/O or upward imports.
 *
 * Three walker shapes are exported:
 *
 *  - {@link extractFirstSubsectionUnderSection} — first `### …` heading +
 *    paragraph inside the first matched `## …` block (used by the
 *    Strategic-synthesis and Top-findings extractors).
 *  - {@link extractFirstParagraphUnderSection} — first prose paragraph
 *    inside the matched `## …` block, ignoring `### …` sub-headings
 *    (used by Reader-Briefing paragraph fallbacks and Strategic-paragraph
 *    derivation).
 *  - {@link extractFirstNumberedItemUnderSection} — first `1. **Label**:
 *    …` list item inside the matched `## …` block (used by the
 *    May-2026 Reader-Briefing priority-list style).
 *
 * The {@link stripTradecraftLabels} helper is exported too — both this
 * module and `briefing-highlight.ts` need it to normalize sub-headings
 * before they reach the headline / description surface.
 */

import type { LanguageCode } from '../../types/languages.js';
import { resolveBoilerplatePatterns } from './briefing-highlight-i18n.js';
import {
  EXTENDED_DESCRIPTION_MAX_LENGTH,
  shouldSkipDescriptionLine,
  stripInlineMarkdown,
  stripLeadingBoldLabel,
  stripLeadingProseLabel,
} from './text-utils.js';

/** Sentinel returned by {@link classifyLine} when the line is benign prose. */
type LineKind = 'fence' | 'h2' | 'h3' | 'blank' | 'structural' | 'numbered' | 'bullet' | 'prose';

/**
 * Classify a trimmed Markdown line into one of the structural buckets
 * the section walker cares about. Extracted from the inline walker
 * loops to keep their cognitive complexity below the 15-point limit.
 *
 * @param line - Trimmed Markdown line
 * @returns Line kind sentinel
 */
function classifyLine(line: string): LineKind {
  if (line.startsWith('```') || line.startsWith('~~~')) return 'fence';
  if (line.startsWith('## ')) return 'h2';
  if (line.startsWith('### ')) return 'h3';
  if (line === '') return 'blank';
  if (line.startsWith('|') || line.startsWith('>') || line.startsWith('<')) return 'structural';
  if (line.startsWith('---') || line.startsWith('===')) return 'structural';
  if (/^\d+\.\s+/u.test(line)) return 'numbered';
  if (line.startsWith('-') || line.startsWith('*')) return 'bullet';
  return 'prose';
}

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
    // Strip leading non-letter / non-digit characters across all
    // Unicode scripts (emoji, ASCII punctuation, fullwidth punctuation
    // such as `（`, `：`). Using `\p{L}\p{N}` keeps Arabic, Hebrew,
    // CJK and other non-Latin headings intact — the previous
    // `[A-Za-z0-9]` form silently stripped the entire heading text
    // for those scripts.
    .replace(/^[^\p{L}\p{N}]+/u, '')
    // Strip leading numeric list prefix (e.g. "1. ", "7. ")
    .replace(/^\d+\.\s+/, '')
    // Normalise fullwidth ASCII variants commonly used in CJK headings
    // so a heading written as `主要判断（要約）` matches the lower-cased
    // ASCII needle `主要判断 (要約)` shape.
    .replace(/[\uFF08]/g, '(')
    .replace(/[\uFF09]/g, ')')
    .replace(/[\uFF1A]/g, ':')
    .replace(/\u3000/g, ' ')
    .trim()
    .toLowerCase();
  for (const needle of needles) {
    if (normalized === needle) return true;
    if (normalized.startsWith(`${needle} `)) return true;
    if (normalized.startsWith(`${needle}:`)) return true;
    if (normalized.startsWith(`${needle}(`)) return true;
    // Em-dash, en-dash, hyphen separators.
    if (normalized.startsWith(`${needle} —`)) return true;
    if (normalized.startsWith(`${needle} –`)) return true;
    if (normalized.startsWith(`${needle} -`)) return true;
  }
  return false;
}

/**
 * Mutable iterator state used by the section walkers. The fence-state
 * flag tracks ``` / ~~~ pairs so we never enter a section that lives
 * inside a code block; `inSection` flips on/off as we cross `## …`
 * boundaries; `subHeading` captures the first `### …` we see inside
 * the matched section (only used by the synthesis extractor).
 */
interface WalkerState {
  inFence: boolean;
  inSection: boolean;
  subHeading: string;
  lines: string[];
  byteCount: number;
}

/**
 * Build an empty walker state.
 *
 * @returns Fresh, fence-aware {@link WalkerState} with empty buffers.
 */
function newState(): WalkerState {
  return { inFence: false, inSection: false, subHeading: '', lines: [], byteCount: 0 };
}

/**
 * Push a prose line into the walker's collected buffer.
 *
 * @param state - Walker state (mutated)
 * @param line - Cleaned line to append
 */
function appendLine(state: WalkerState, line: string): void {
  state.lines.push(line);
  state.byteCount += line.length + 1;
}

/**
 * Strip intelligence tradecraft labels (WEP probability bands, KJ-N
 * prefixes, Admiralty grades) from a paragraph so they don't pollute
 * reader-facing headlines. These are analyst-internal markers that
 * readers find confusing.
 *
 * @param text - Raw paragraph text
 * @returns Text with tradecraft labels removed
 */
export function stripTradecraftLabels(text: string): string {
  return text
    // "KJ-1 [WEP: HIGHLY LIKELY, 90–95%]: " prefix
    .replace(/^KJ-?\d+\s*\[.*?\]:\s*/iu, '')
    // "[WEP: LIKELY (60-75%)]" or "(WEP Probable, 60–75% confidence)" inline
    .replace(/\[WEP:?\s*[^\]]+\]\s*/giu, '')
    .replace(/\(WEP\s+[^)]+\)\s*/giu, '')
    // "Admiralty Grade: B2" or similar
    // eslint-disable-next-line security/detect-unsafe-regex
    .replace(/Admiralty\s+(?:Source\s+)?Grade:?\s*[A-Z]\d\s*/giu, '')
    // Leading numbered list prefix "1. ", "2. " etc.
    .replace(/^\d+\.\s+/, '')
    // "(Admiralty B2)" or "*(Admiralty B2)*" trailing references
    .replace(/\*?\(Admiralty\s+[A-Z]\d\)\*?\s*$/giu, '')
    .trim();
}

/**
 * Boilerplate sentence patterns that should never surface as headlines
 * or descriptions. These are self-referential meta-prose that describes
 * the brief itself rather than the substantive intelligence content.
 */
const BOILERPLATE_PATTERNS: readonly RegExp[] = [
  /^this (?:executive )?brief (?:synthesi[sz]es|provides|covers|summariz|presents|contains|offers)/iu,
  /^this (?:report|document|analysis|assessment) (?:synthesi[sz]es|provides|covers|summariz|presents)/iu,
  /^the brief is designed to be read/iu,
  /^all forward-looking assessments are/iu,
  /^confidence:/iu,
  /^admiralty (?:source )?grade/iu,
  /^classification:/iu,
  /^data[\s-]?mode/iu,
  /^key assessments?\s*\(/iu,
  /^overall (?:admiralty|assessment) grade/iu,
  /^sats? applied/iu,
  /^generated by (?:eu parliament|automated)/iu,
  /^subject:/iu,
];

function normalizeBriefingLine(
  line: string,
  preserveLeadingLabel = false,
  lang: LanguageCode = 'en'
): string {
  if (shouldSkipDescriptionLine(line)) return '';
  const withoutMarkdown = stripInlineMarkdown(line);
  const patterns = resolveBoilerplatePatterns(BOILERPLATE_PATTERNS, lang);
  if (patterns.some((re) => re.test(withoutMarkdown.trim()))) return '';
  const stripped = stripTradecraftLabels(withoutMarkdown);
  const normalized = preserveLeadingLabel
    ? stripped
    : stripLeadingProseLabel(stripLeadingBoldLabel(stripped));
  return normalized.replace(/^[:;—–-]\s+/u, '').trim();
}

/**
 * Decide what to do when the walker sees a `## …` heading.
 *
 * @param state - Walker state
 * @param raw - Raw heading line (already trimmed)
 * @param needles - Lower-case section whitelist
 * @returns `'enter'` when the heading opens the target section,
 *          `'leave'` when it closes an already-open target section,
 *          `'skip'` otherwise.
 */
function transitionForH2(
  state: WalkerState,
  raw: string,
  needles: readonly string[]
): 'enter' | 'leave' | 'skip' {
  const headingText = raw.replace(/^##\s+/, '');
  if (headingMatches(headingText, needles)) return 'enter';
  if (state.inSection) return 'leave';
  return 'skip';
}

/**
 * Handle a `## …` line for the sub-section walker. Returns `true`
 * when the caller should stop walking.
 *
 * @param state - Walker state (mutated)
 * @param line - Trimmed `## …` line
 * @param needles - Section whitelist
 * @returns `true` to stop walking
 */
function handleH2ForSubsection(
  state: WalkerState,
  line: string,
  needles: readonly string[]
): boolean {
  const t = transitionForH2(state, line, needles);
  if (t === 'enter') {
    state.inSection = true;
    state.subHeading = '';
    state.lines.length = 0;
    state.byteCount = 0;
    return false;
  }
  if (t === 'leave') {
    if (state.subHeading && state.lines.length > 0) return true;
    state.inSection = false;
  }
  return false;
}

/**
 * Walk the brief body line-by-line and return the first `### …`
 * heading + its first prose paragraph that occur **inside** the
 * matched `## …` block. Returns `null` when the matched block does
 * not contain a `### …` sub-heading.
 *
 * @param markdown - Brief body (SPDX preamble already stripped)
 * @param sectionNeedles - Lower-case `## …` whitelist
 * @param lang - Locale (drives boilerplate stem patterns)
 * @returns First `{subHeading, paragraph}` pair under the matched
 *          section, or `null` when no sub-heading exists
 */
export function extractFirstSubsectionUnderSection(
  markdown: string,
  sectionNeedles: readonly string[],
  lang: LanguageCode = 'en'
): { readonly subHeading: string; readonly paragraph: string } | null {
  const state = newState();
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    const kind = classifyLine(line);
    if (kind === 'fence') {
      state.inFence = !state.inFence;
      continue;
    }
    if (state.inFence) continue;
    if (kind === 'h2') {
      if (handleH2ForSubsection(state, line, sectionNeedles)) break;
      continue;
    }
    if (!state.inSection) continue;
    if (collectSubsectionLine(state, line, kind, lang)) break;
  }
  if (!state.subHeading || state.lines.length === 0) return null;
  return {
    subHeading: state.subHeading.trim(),
    paragraph: state.lines.join(' ').trim(),
  };
}

/**
 * Process one non-heading line inside the matched section for the
 * sub-section extractor. Returns `true` to signal the caller should
 * stop walking (paragraph boundary reached or budget exceeded).
 *
 * @param state - Walker state (mutated)
 * @param line - Trimmed line being processed
 * @param kind - Pre-classified line kind from {@link classifyLine}
 * @param lang - Locale (drives boilerplate stem patterns)
 * @returns `true` to stop walking
 */
function collectSubsectionLine(
  state: WalkerState,
  line: string,
  kind: LineKind,
  lang: LanguageCode = 'en'
): boolean {
  if (kind === 'h3') {
    if (state.subHeading && state.lines.length > 0) return true;
    state.subHeading = stripInlineMarkdown(line.replace(/^###\s+/, ''));
    state.lines.length = 0;
    state.byteCount = 0;
    return false;
  }
  if (!state.subHeading) return false;
  if (kind === 'blank' || kind === 'structural') {
    return state.lines.length > 0;
  }
  const clean = normalizeBriefingLine(line, false, lang);
  if (!clean) return state.lines.length > 0;
  appendLine(state, clean);
  return state.byteCount >= EXTENDED_DESCRIPTION_MAX_LENGTH;
}

/**
 * Walk the brief body and return the first prose paragraph that occurs
 * **inside** the matched `## …` block (ignoring any `### …`
 * sub-headings). Used as the fallback extractor when the section is a
 * single-paragraph block (the term-outlook Reader Briefing style).
 *
 * @param markdown - Brief body (SPDX preamble already stripped)
 * @param sectionNeedles - Lower-case `## …` whitelist
 * @param lang - Locale (drives boilerplate stem patterns)
 * @returns First prose paragraph, or empty string when absent
 */
export function extractFirstParagraphUnderSection(
  markdown: string,
  sectionNeedles: readonly string[],
  lang: LanguageCode = 'en'
): string {
  const state = newState();
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    const kind = classifyLine(line);
    if (kind === 'fence') {
      state.inFence = !state.inFence;
      continue;
    }
    if (state.inFence) continue;
    if (kind === 'h2') {
      if (handleH2ForParagraph(state, line, sectionNeedles)) break;
      continue;
    }
    if (!state.inSection || kind === 'h3') continue;
    if (collectParagraphLine(state, line, kind, lang)) break;
  }
  return state.lines.length === 0 ? '' : state.lines.join(' ').trim();
}

/**
 * Handle a `## …` line for the first-paragraph walker. Returns `true`
 * when the caller should stop walking (a complete paragraph was
 * already captured in a prior matched section).
 *
 * @param state - Walker state (mutated)
 * @param line - Trimmed `## …` line
 * @param needles - Section whitelist
 * @returns `true` to stop walking
 */
function handleH2ForParagraph(
  state: WalkerState,
  line: string,
  needles: readonly string[]
): boolean {
  if (state.inSection && state.lines.length > 0) return true;
  const t = transitionForH2(state, line, needles);
  state.inSection = t === 'enter';
  return false;
}

/**
 * Process one non-heading line inside the matched section for the
 * first-paragraph extractor. Returns `true` when the caller should
 * stop walking.
 *
 * @param state - Walker state (mutated)
 * @param line - Trimmed line being processed
 * @param kind - Pre-classified line kind from {@link classifyLine}
 * @param lang - Locale (drives boilerplate stem patterns)
 * @returns `true` to stop walking
 */
function collectParagraphLine(
  state: WalkerState,
  line: string,
  kind: LineKind,
  lang: LanguageCode = 'en'
): boolean {
  if (kind === 'blank' || kind === 'structural') {
    return state.lines.length > 0;
  }
  const clean = normalizeBriefingLine(line, false, lang);
  if (!clean) return state.lines.length > 0;
  appendLine(state, clean);
  return state.byteCount >= EXTENDED_DESCRIPTION_MAX_LENGTH;
}

/** Mutable accumulator for {@link extractFirstNumberedItemUnderSection}. */
interface NumberedItemState {
  inFence: boolean;
  inSection: boolean;
  item: string[];
}

/**
 * Walk the brief body and return the first numbered-list item that
 * appears **inside** the matched `## …` block. Recognises the
 * `1. **Immediate priority**: …` shape used by the May-2026
 * Reader Briefing style guide. The bold label and tail are joined into
 * a single headline-shaped string.
 *
 * @param markdown - Brief body
 * @param sectionNeedles - `## …` whitelist
 * @param lang - Locale (drives boilerplate stem patterns)
 * @returns Flattened first list item, or empty string when absent
 */
export function extractFirstNumberedItemUnderSection(
  markdown: string,
  sectionNeedles: readonly string[],
  lang: LanguageCode = 'en'
): string {
  const state: NumberedItemState = { inFence: false, inSection: false, item: [] };
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    const kind = classifyLine(line);
    if (kind === 'fence') {
      state.inFence = !state.inFence;
      continue;
    }
    if (state.inFence) continue;
    if (kind === 'h2') {
      if (state.inSection && state.item.length > 0) break;
      const headingText = line.replace(/^##\s+/, '');
      state.inSection = headingMatches(headingText, sectionNeedles);
      continue;
    }
    if (!state.inSection) continue;
    if (handleNumberedLine(state, line, kind, lang)) break;
  }
  return state.item.join(' ').trim();
}

/**
 * Process one line inside the matched section for the numbered-item
 * extractor. Returns `true` when the caller should stop walking.
 *
 * @param state - Numbered-item walker state (mutated)
 * @param line - Trimmed line being processed
 * @param kind - Pre-classified line kind from {@link classifyLine}
 * @param lang - Locale (drives boilerplate stem patterns)
 * @returns `true` to stop walking
 */
function handleNumberedLine(
  state: NumberedItemState,
  line: string,
  kind: LineKind,
  lang: LanguageCode = 'en'
): boolean {
  if (state.item.length === 0) {
    if (kind !== 'numbered') return false;
    const m = /^1\.\s+(.*)$/u.exec(line);
    const clean = m?.[1] ? normalizeBriefingLine(m[1], true, lang) : '';
    if (clean) state.item.push(clean);
    return false;
  }
  if (kind === 'blank' || kind === 'numbered' || kind === 'bullet') return true;
  if (kind === 'h2' || kind === 'h3') return true;
  const clean = normalizeBriefingLine(line, false, lang);
  if (!clean) return state.item.length > 0;
  state.item.push(clean);
  return false;
}
