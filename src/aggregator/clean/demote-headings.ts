// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Clean/DemoteHeadings
 * @description Remove every H1 and demote every other ATX heading by one
 * level so the aggregate has a single H1 owned by the aggregator.
 */

/**
 * Track open/close of a fenced code block. Returns the updated fence state
 * and the original line (unmodified). Centralising the state machine keeps
 * callers simple and makes cognitive complexity linear.
 *
 * @param line - Current line of Markdown
 * @param inFence - Whether the previous line was inside a fenced block
 * @param fenceMarker - Opening marker for the current fence (or `""`)
 * @returns `{ inFence, fenceMarker, matched }` reflecting the state after
 *          processing `line`; `matched` is `true` when the line itself is a
 *          fence boundary (and should therefore be passed through verbatim)
 */
function advanceFenceState(
  line: string,
  inFence: boolean,
  fenceMarker: string
): { inFence: boolean; fenceMarker: string; matched: boolean } {
  const fenceMatch = /^(\s*)(`{3,}|~{3,})[^`~]*$/.exec(line);
  if (!fenceMatch?.[2]) return { inFence, fenceMarker, matched: false };
  const marker = fenceMatch[2];
  if (!inFence) {
    return { inFence: true, fenceMarker: marker, matched: true };
  }
  if (marker.startsWith(fenceMarker.charAt(0)) && marker.length >= fenceMarker.length) {
    return { inFence: false, fenceMarker: '', matched: true };
  }
  return { inFence, fenceMarker, matched: true };
}

/**
 * Transform one non-fence heading line: setext H1, ATX H1, or ATX H2-H6.
 * Returns the processed output plus how many source lines it consumed and
 * whether an H1 was removed.
 *
 * @param lines - All source lines (used to peek at the next line for setext)
 * @param index - Zero-based index of the line under consideration
 * @returns `{ output, consumed, h1Removed }` — `consumed` is how many lines
 *          the caller should advance by (1 for ATX; 2 for setext H1; 0 when
 *          the line is not a heading at all)
 */
function processHeadingLine(
  lines: readonly string[],
  index: number
): { output: string | null; consumed: number; h1Removed: boolean } {
  const line = lines[index] ?? '';
  const nextLine = lines[index + 1] ?? '';
  if (/^\s*=+\s*$/.test(nextLine) && /\S/.test(line)) {
    return { output: null, consumed: 2, h1Removed: true };
  }
  const atx = /^(\s*)(#{1,6})(\s.*)$/.exec(line);
  if (!atx?.[2]) {
    return { output: line, consumed: 1, h1Removed: false };
  }
  const level = atx[2].length;
  if (level === 1) {
    return { output: null, consumed: 1, h1Removed: true };
  }
  const demoted = level === 6 ? '######' : '#'.repeat(level + 1);
  return {
    output: `${atx[1] ?? ''}${demoted}${atx[3] ?? ''}`,
    consumed: 1,
    h1Removed: false,
  };
}

/**
 * Remove every H1 (`^# ` and the setext H1 form) and demote every other
 * ATX heading by one level. Setext H2 (`----` underline) stays as H2 because
 * converting it to H3 would require replacing the underline form.
 *
 * Skips changes inside fenced code blocks.
 *
 * @param md - Raw Markdown source
 * @returns `{ md, h1Count }` — transformed Markdown and number of H1s removed
 */
export function demoteHeadings(md: string): { md: string; h1Count: number } {
  const lines = md.split('\n');
  const out: string[] = [];
  let inFence = false;
  let fenceMarker = '';
  let h1Count = 0;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const fence = advanceFenceState(line, inFence, fenceMarker);
    if (fence.matched || inFence) {
      inFence = fence.inFence;
      fenceMarker = fence.fenceMarker;
      out.push(line);
      i++;
      continue;
    }
    const result = processHeadingLine(lines, i);
    if (result.h1Removed) h1Count++;
    if (result.output !== null) out.push(result.output);
    i += result.consumed;
  }
  return { md: out.join('\n'), h1Count };
}
