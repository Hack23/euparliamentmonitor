// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/LedeExtractor
 * @description Markdown lede / prose-paragraph walkers extracted from
 * `article-metadata.ts`. Provides {@link extractStrongProseLine} (first
 * qualifying prose paragraph anywhere in the body) and
 * {@link extractLedeAfterHeading} / {@link extractExtendedLedeAfterHeading}
 * (prose paragraph that follows a `## 60-Second Read`-style heading
 * from the editorial-lede whitelist).
 *
 * Pure module — depends only on text-utils (for description-shaping
 * helpers) and heading-rules (for the editorial-lede whitelist and the
 * heading-text normaliser).
 */

import {
  DESCRIPTION_MAX_LENGTH,
  EXTENDED_DESCRIPTION_MAX_LENGTH,
  shouldSkipDescriptionLine,
  stripInlineMarkdown,
  stripLeadingProseLabel,
  truncateDescription,
  truncateExtendedDescription,
} from './text-utils.js';
import {
  EDITORIAL_LEDE_HEADINGS,
  isLedeHeadingMatch,
  normaliseHeadingText,
} from './heading-rules.js';

/**
 * Internal paragraph-collector state shared between
 * {@link extractStrongProseLine} and {@link extractLedeAfterHeading}.
 * Both walk Markdown line-by-line and concatenate consecutive prose
 * lines into a single description-sized paragraph, terminating on a
 * blank line, a skip-line, or the cap.
 */
interface ParagraphBuffer {
  lines: string[];
  byteCount: number;
}

/**
 * Process one Markdown line against the in-progress paragraph buffer.
 * Returns the desired loop control: `'continue'` (skip silently),
 * `'break'` (paragraph terminated — emit), or `'collected'` (line was
 * pushed into the buffer; caller checks the cap separately).
 *
 * Factored out of the two extractors to reduce cognitive complexity.
 *
 * @param line - Trimmed Markdown line
 * @param buf - In-progress paragraph buffer (mutated on `'collected'`)
 * @returns Loop control directive
 */
function collectProseLine(line: string, buf: ParagraphBuffer): 'continue' | 'break' | 'collected' {
  const hasBuffer = buf.lines.length > 0;
  if (hasBuffer && line === '') return 'break';
  if (line === '') return 'continue';
  if (shouldSkipDescriptionLine(line)) return hasBuffer ? 'break' : 'continue';
  const plain = stripLeadingProseLabel(stripInlineMarkdown(line));
  if (!hasBuffer && plain.length < 40) return 'continue';
  buf.lines.push(plain);
  buf.byteCount += plain.length + 1;
  return 'collected';
}

/**
 * Walk every line of the Markdown source and return the first paragraph
 * that survives {@link shouldSkipDescriptionLine}. Consecutive non-blank
 * prose lines are joined with a single space so hard-wrapped ledes
 * (column-95 conventional wrap) produce a clean 140-180-character
 * description rather than just the first 60-90-char line.
 *
 * Inline Markdown decorations are stripped and the result is truncated
 * to fit `<meta description>`.
 *
 * @param markdown - Markdown source
 * @returns Prose description, or empty string when nothing qualifies
 */
export function extractStrongProseLine(markdown: string): string {
  let inFence = false;
  const buf: ParagraphBuffer = { lines: [], byteCount: 0 };
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const directive = collectProseLine(line, buf);
    if (directive === 'continue') continue;
    if (directive === 'break') break;
    if (buf.byteCount >= DESCRIPTION_MAX_LENGTH) break;
  }
  if (buf.lines.length === 0) return '';
  return truncateDescription(buf.lines.join(' '));
}

/**
 * Loop-state directive emitted by {@link classifyLedeLine} for one
 * line of a `## 60-Second Read`-style block. `'enter'` and `'leave'`
 * adjust the in-lede flag; `'collect'` defers to {@link collectProseLine};
 * `'skip-fence'` toggles the fence flag; `'break-buffer-has-content'`
 * stops the walk because we hit the next heading mid-paragraph.
 */
type LedeDirective =
  | { kind: 'fence' }
  | { kind: 'heading'; inLede: boolean }
  | { kind: 'collect' }
  | { kind: 'pause' };

/**
 * Classify one Markdown line for the {@link extractLedeAfterHeading}
 * walker. The returned directive is then applied to walker state by
 * {@link applyLedeDirective}.
 *
 * @param line - Trimmed Markdown line
 * @param isInFence - True when the previous line opened a fenced block
 * @param inLede - True when the previous line was inside a lede heading block
 * @param hasBuffered - True when at least one prose line has been collected
 * @returns Directive describing how the walker should treat this line
 */
function classifyLedeLine(
  line: string,
  isInFence: boolean,
  inLede: boolean,
  hasBuffered: boolean
): LedeDirective {
  if (line.startsWith('```') || line.startsWith('~~~')) return { kind: 'fence' };
  if (isInFence) return { kind: 'pause' };
  if (/^#{2,3}\s+/.test(line)) {
    if (hasBuffered) return { kind: 'pause' };
    const headingText = normaliseHeadingText(line.replace(/^#{2,3}\s+/, ''));
    const match = EDITORIAL_LEDE_HEADINGS.some((h) => isLedeHeadingMatch(headingText, h));
    return { kind: 'heading', inLede: match };
  }
  return inLede ? { kind: 'collect' } : { kind: 'pause' };
}

/**
 * Apply one directive emitted by {@link classifyLedeLine} to the walk
 * state. Returns `'break'` to stop the walk, `'continue'` to skip to
 * the next line, or `'collect'` when the caller should now run
 * {@link collectProseLine}. Mutates `state` for fence/in-lede toggles.
 *
 * @param directive - Classification of the current line
 * @param state - Walk state (mutated in place)
 * @param state.inFence - True when the current line is inside a fenced block
 * @param state.inLede - True when the current line is inside a lede heading block
 * @param hasBuffered - Whether any prose has already been collected
 * @returns Loop control directive
 */
function applyLedeDirective(
  directive: LedeDirective,
  state: { inFence: boolean; inLede: boolean },
  hasBuffered: boolean
): 'break' | 'continue' | 'collect' {
  if (directive.kind === 'fence') {
    state.inFence = !state.inFence;
    return 'continue';
  }
  if (directive.kind === 'heading') {
    if (hasBuffered) return 'break';
    state.inLede = directive.inLede;
    return 'continue';
  }
  if (directive.kind === 'pause') return 'continue';
  return 'collect';
}

/**
 * Walk the body of an editorial artefact and, when it contains a `## …`
 * heading whose text matches one of `EDITORIAL_LEDE_HEADINGS`,
 * return the first prose paragraph that follows that heading. Consecutive
 * non-blank lines are paragraph-joined (see {@link extractStrongProseLine}).
 *
 * Returns the empty string when no lede heading is found or no qualifying
 * prose follows it. Inline Markdown is stripped and the result is
 * truncated to fit `<meta description>`.
 *
 * @param markdown - Editorial artefact source
 * @returns Lede paragraph, or empty string when none matched
 */
export function extractLedeAfterHeading(markdown: string): string {
  const state = { inFence: false, inLede: false };
  const buf: ParagraphBuffer = { lines: [], byteCount: 0 };
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    const directive = classifyLedeLine(line, state.inFence, state.inLede, buf.lines.length > 0);
    const action = applyLedeDirective(directive, state, buf.lines.length > 0);
    if (action === 'break') break;
    if (action === 'continue') continue;
    const collect = collectProseLine(line, buf);
    if (collect === 'continue') continue;
    if (collect === 'break') break;
    if (buf.byteCount >= DESCRIPTION_MAX_LENGTH) break;
  }
  if (buf.lines.length === 0) return '';
  return truncateDescription(buf.lines.join(' '));
}

/**
 * Same parsing rules as {@link extractLedeAfterHeading} but with a
 * larger byte budget so the full BLUF paragraph (typically 200-300
 * characters in the editorial style guide) is captured for use as
 * `og:description` / `twitter:description`. Returns the joined
 * paragraph clamped via {@link truncateExtendedDescription} (which
 * returns `''` when the result wouldn't be longer than the regular
 * meta description).
 *
 * @param markdown - Brief body (SPDX preamble already stripped)
 * @returns Extended lede paragraph, or `''` when not worth emitting
 */
export function extractExtendedLedeAfterHeading(markdown: string): string {
  const state = { inFence: false, inLede: false };
  const buf: ParagraphBuffer = { lines: [], byteCount: 0 };
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    const directive = classifyLedeLine(line, state.inFence, state.inLede, buf.lines.length > 0);
    const action = applyLedeDirective(directive, state, buf.lines.length > 0);
    if (action === 'break') break;
    if (action === 'continue') continue;
    const collect = collectProseLine(line, buf);
    if (collect === 'continue') continue;
    if (collect === 'break') break;
    if (buf.byteCount >= EXTENDED_DESCRIPTION_MAX_LENGTH) break;
  }
  if (buf.lines.length === 0) return '';
  return truncateExtendedDescription(buf.lines.join(' '));
}
