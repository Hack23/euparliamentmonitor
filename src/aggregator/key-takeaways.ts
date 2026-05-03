// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/KeyTakeaways
 * @description Deterministic 3–7 bullet "Key takeaways" synthesiser.
 *
 * Reads the strongest evidence-bearing bullets from
 * `intelligence/synthesis-summary.md` (and, when present, from an
 * `intelligence/intelligence-assessment.md` artifact) and projects them
 * into a single short bullet block placed immediately after the
 * Executive Brief in the aggregated article. The output is a pure
 * function of its inputs — same artifact bytes in → same Markdown out.
 *
 * Selection rules (in priority order):
 *  1. Bullets under a `## Top Findings`, `## Key Judgments`, `## Key
 *     Takeaways`, `## Headline Findings` or `## BLUF` H2 are preferred.
 *  2. Failing that, the first 3–7 bullets from the artifact body are used.
 *  3. Near-duplicate bullets (Jaccard ≥ 0.7 over word sets) are folded so
 *     overlap between synthesis-summary and intelligence-assessment does
 *     not produce stuttering output.
 *  4. The block is capped at {@link MAX_TAKEAWAYS} bullets and floored at
 *     {@link MIN_TAKEAWAYS}; below the floor the synthesiser returns an
 *     empty string so the aggregator simply omits the section.
 */

import fs from 'fs';
import path from 'path';

/** Lower-bound below which the section is suppressed. */
export const MIN_TAKEAWAYS = 3;
/** Upper-bound on the rendered block. */
export const MAX_TAKEAWAYS = 7;

/** Section id used as the HTML anchor for the rendered block. */
export const KEY_TAKEAWAYS_SECTION_ID = 'section-key-takeaways';
/** Display title for the rendered block. */
export const KEY_TAKEAWAYS_SECTION_TITLE = 'Key Takeaways';

/** One synthesised bullet ready to be rendered. */
export interface Takeaway {
  /** Bullet body in Markdown (already trimmed; no leading `- `). */
  readonly body: string;
  /** Run-relative path of the source artifact. */
  readonly source: string;
}

/** Options for {@link buildKeyTakeaways}. */
export interface BuildKeyTakeawaysOptions {
  /** Absolute path to the analysis run directory. */
  readonly runDir: string;
  /**
   * Optional explicit ordered list of run-relative artifact paths to mine.
   * When omitted the default canonical sources are tried in priority order.
   */
  readonly sources?: readonly string[];
}

/** Default canonical sources, in priority order. */
const DEFAULT_SOURCES: readonly string[] = [
  'intelligence/synthesis-summary.md',
  'intelligence/intelligence-assessment.md',
];

/** H2 headings under which "headline" bullets are typically authored. */
const PREFERRED_HEADINGS = [
  'top findings',
  'key judgments',
  'key takeaways',
  'headline findings',
  'bluf',
  'bottom line up front',
];

/**
 * Mutable state used by {@link extractStrongBullets} as it scans a single
 * Markdown body. Extracted so the line-level handlers stay focused.
 */
interface BulletScanState {
  inPreferredSection: boolean;
  inAnyContent: boolean;
  inFence: boolean;
  readonly preferred: string[];
  readonly fallback: string[];
}

/**
 * Update {@link BulletScanState} when a heading is encountered. Returns
 * `true` so the outer loop can `continue`.
 *
 * @param state - Mutable scan state
 * @param headingText - Raw heading text (without the `#` prefix)
 */
function handleHeading(state: BulletScanState, headingText: string): void {
  const normalised = headingText
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  state.inPreferredSection = PREFERRED_HEADINGS.some((h) => normalised.startsWith(h));
  state.inAnyContent = true;
}

/**
 * Append a bullet body to the appropriate accumulator based on the
 * current scan state. Pure helper so {@link extractStrongBullets} stays
 * under the cognitive-complexity budget.
 *
 * @param state - Mutable scan state
 * @param body - Trimmed bullet body
 */
function recordBullet(state: BulletScanState, body: string): void {
  if (state.inPreferredSection) state.preferred.push(body);
  else if (state.inAnyContent) state.fallback.push(body);
}

/**
 * Extract the strongest top-level bullets from one cleaned Markdown body.
 * Pure helper; surfaced for unit testing.
 *
 * @param markdown - Raw artifact Markdown (front-matter and banners may
 *                   be present; the function ignores them via heading-aware
 *                   scanning rather than full cleaning)
 * @returns Ordered list of bullet bodies (trimmed, without leading `- `)
 */
export function extractStrongBullets(markdown: string): string[] {
  const state: BulletScanState = {
    inPreferredSection: false,
    inAnyContent: false,
    inFence: false,
    preferred: [],
    fallback: [],
  };
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine ?? '';
    if (/^```/.test(line)) {
      state.inFence = !state.inFence;
      continue;
    }
    if (state.inFence) continue;
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      handleHeading(state, headingMatch[2] ?? '');
      continue;
    }
    const bulletMatch = /^\s*[-*]\s+(.*)$/.exec(line);
    if (!bulletMatch) continue;
    if (/^\s{2,}[-*]/.test(line)) continue; // skip nested bullets
    const body = (bulletMatch[1] ?? '').trim();
    if (body.length === 0) continue;
    recordBullet(state, body);
  }
  return state.preferred.length > 0 ? state.preferred : state.fallback;
}

/**
 * Compute Jaccard similarity over the word sets of two bullet bodies.
 * Used to detect near-duplicate bullets across overlapping artifacts.
 *
 * @param a - First bullet body
 * @param b - Second bullet body
 * @returns Similarity in `[0, 1]` (1 = identical word sets)
 */
export function jaccardSimilarity(a: string, b: string): number {
  const tokenise = (s: string): Set<string> =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 4)
    );
  const left = tokenise(a);
  const right = tokenise(b);
  if (left.size === 0 || right.size === 0) return 0;
  let intersect = 0;
  for (const t of left) if (right.has(t)) intersect += 1;
  const union = left.size + right.size - intersect;
  return union === 0 ? 0 : intersect / union;
}

/** Threshold above which two bullets are considered near-duplicates. */
const DEDUPE_THRESHOLD = 0.7;

/**
 * Combine bullets harvested from multiple sources, dropping near-duplicates
 * (Jaccard ≥ {@link DEDUPE_THRESHOLD}). Order is preserved: earlier sources
 * win, so the canonical synthesis-summary always anchors the block.
 *
 * @param candidates - Ordered list of `{body, source}` pairs
 * @returns De-duplicated list, capped at {@link MAX_TAKEAWAYS}
 */
export function dedupeTakeaways(candidates: readonly Takeaway[]): Takeaway[] {
  const out: Takeaway[] = [];
  for (const candidate of candidates) {
    if (out.length >= MAX_TAKEAWAYS) break;
    const isDuplicate = out.some(
      (existing) => jaccardSimilarity(existing.body, candidate.body) >= DEDUPE_THRESHOLD
    );
    if (!isDuplicate) out.push(candidate);
  }
  return out;
}

/**
 * Read each candidate source, harvest its strongest bullets, and return
 * them flattened in priority order with their originating run-relative path.
 *
 * @param runDir - Absolute path to the analysis run directory
 * @param sources - Ordered list of run-relative artifact paths to mine
 * @returns Ordered candidate list (may exceed {@link MAX_TAKEAWAYS}; caller
 *          should call {@link dedupeTakeaways} before rendering)
 */
export function harvestCandidates(runDir: string, sources: readonly string[]): Takeaway[] {
  const candidates: Takeaway[] = [];
  for (const rel of sources) {
    const abs = path.join(runDir, rel);
    if (!fs.existsSync(abs)) continue;
    const markdown = fs.readFileSync(abs, 'utf8');
    for (const body of extractStrongBullets(markdown)) {
      candidates.push({ body, source: rel });
    }
  }
  return candidates;
}

/**
 * Build the rendered Markdown block for the Key Takeaways section, or
 * an empty string when not enough content is available.
 *
 * @param options - Build options
 * @returns Markdown block (with H2) or `''` when below {@link MIN_TAKEAWAYS}
 */
export function buildKeyTakeaways(options: BuildKeyTakeawaysOptions): string {
  const sources = options.sources ?? DEFAULT_SOURCES;
  const candidates = harvestCandidates(options.runDir, sources);
  const selected = dedupeTakeaways(candidates);
  if (selected.length < MIN_TAKEAWAYS) return '';
  const bullets = selected.map((t) => `- ${t.body}`);
  return [
    `<h2 id="${KEY_TAKEAWAYS_SECTION_ID}">${KEY_TAKEAWAYS_SECTION_TITLE}</h2>`,
    '',
    'A deterministic 3–7 bullet synthesis of the strongest evidence-bearing findings, harvested from the synthesis-summary and intelligence-assessment artifacts. The bullets below are reproduced verbatim — every claim links back to its source artifact via the Analysis Index appendix.',
    '',
    ...bullets,
    '',
  ].join('\n');
}
