// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Generator/ReaderGuideInsertion
 * @description Splice the regenerated Reader Intelligence Guide HTML
 * into the rendered article body at the Executive Brief boundary so
 * the documented section order is preserved (Executive Brief → Reader
 * Intelligence Guide → Key Takeaways → deep sections). Uses
 * `indexOf`-based search to stay clear of polynomial-regex
 * backtracking on pathological input.
 */

/**
 * Insert the regenerated Reader Intelligence Guide HTML immediately after
 * the Executive Brief section so the rendered article body matches the
 * documented order (Executive Brief → Reader Intelligence Guide → Key
 * Takeaways → deep sections). The Executive Brief section ends where the
 * next H2 begins; we splice at that boundary. When the brief is absent
 * (sparse runs) we fall back to prepending so the guide still appears
 * at the top of the body.
 *
 * Implementation uses `indexOf` rather than a regex so the splice point
 * is deterministic and immune to polynomial-regex backtracking on
 * pathological input.
 *
 * @param bodyHtml - Rendered article body
 * @param guideHtml - Reader Intelligence Guide HTML fragment
 * @returns Body HTML with the guide spliced after the Executive Brief
 */
export function insertReaderGuideAfterExecutiveBrief(bodyHtml: string, guideHtml: string): string {
  const execBriefAnchor = 'id="section-executive-brief"';
  const briefIdx = bodyHtml.indexOf(execBriefAnchor);
  if (briefIdx === -1) {
    return guideHtml + '\n' + bodyHtml;
  }
  const afterBrief = briefIdx + execBriefAnchor.length;
  const nextH2Tagged = bodyHtml.indexOf('<h2 ', afterBrief);
  const nextH2Bare = bodyHtml.indexOf('<h2>', afterBrief);
  const nextH2 = pickEarliestIndex(nextH2Tagged, nextH2Bare);
  if (nextH2 === -1) {
    return bodyHtml + '\n' + guideHtml;
  }
  return bodyHtml.slice(0, nextH2) + guideHtml + '\n' + bodyHtml.slice(nextH2);
}

/**
 * Return the smaller of two `indexOf` results, treating `-1` as "not
 * found" so the caller gets `-1` only when both probes failed. Extracted
 * to keep {@link insertReaderGuideAfterExecutiveBrief} under the
 * useless-assignment lint.
 *
 * @param a - First `indexOf` result
 * @param b - Second `indexOf` result
 * @returns Smaller non-negative index, or `-1` when both are `-1`
 */
function pickEarliestIndex(a: number, b: number): number {
  if (a === -1) return b;
  if (b === -1) return a;
  return Math.min(a, b);
}
