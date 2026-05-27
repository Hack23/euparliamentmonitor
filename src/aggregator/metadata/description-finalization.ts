// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/DescriptionFinalization
 * @description Script-aware terminator + ellipsis-scrub helpers extracted
 * from `resolve-helpers.ts` so that module stays below the 600-line
 * drift-guard cap (see `test/unit/source-file-size.test.js`). Pure leaf
 * module — depends only on the script-family classifier from
 * `seo-budgets.ts`.
 *
 * Background. Two SEO-extraction regressions repeatedly hit this code
 * path and motivated extracting it as its own module:
 *
 *  - `clampForBudget` (and `truncateDescription`) emit a trailing `…`
 *    when they have to hard-cut mid-clause — the
 *    `executive-brief-seo-extraction.test.js` description-ellipsis gate
 *    (and `title-rejection.ts::looksLikeEllipsisCut`) flag those as
 *    truncation cuts. We scrub the ellipsis here and either back-scan to
 *    the most recent real terminator within the trailing ~35 chars, or
 *    append a script-appropriate sentence terminator (`.` for Latin /
 *    RTL, `。` for CJK).
 *  - The second clamp in the HTML shell can knock the terminator off
 *    when the description sits exactly at the per-script budget. The
 *    `maxLength` reservation in {@link ensureDescriptionTerminator} fixes
 *    a live 2026-05-26 regression where `news/2026-05-26-breaking-fr.html`
 *    shipped a mid-word cut after the terminator was dropped.
 */

import type { LanguageCode } from '../../types/index.js';
import { classifyScript } from './seo-budgets.js';

/**
 * Per-script sentence terminator regexes. A description that doesn't end
 * with one of these glyphs reads as a truncated fragment on the SERP, so
 * we ensure one is appended after enrichment.
 *
 * **Important**: `…` (and the ASCII `...` triplet) is deliberately *NOT*
 * in this set. The SEO extraction regression suite treats a trailing
 * ellipsis as a truncation cut (see `title-rejection.ts::looksLikeEllipsisCut`
 * and the description gate in `executive-brief-seo-extraction.test.js`),
 * so {@link ensureTerminator} strips trailing ellipses defensively before
 * deciding whether a real terminator must be appended.
 */
const TERMINATOR_RE = {
  latin: /[.!?]$/u,
  cjk: /[。．！？.!?]$/u,
  rtl: /[.!?؟]$/u,
} as const;

/**
 * Trailing ellipsis (Unicode `…` or ASCII `...`) optionally followed by
 * dangling separator punctuation. Used by {@link ensureTerminator} and
 * {@link scrubTrailingEllipsis} to strip truncation markers left behind
 * by upstream truncators (`truncateDescription`, `truncateTitle`, the
 * `clampForBudget` hard-cut path).
 */
const TRAILING_ELLIPSIS_RE = /[\s,;:|—\-–·•]*(?:\u2026|\.{3,})[\s,;:|—\-–·•]*$/u;

/**
 * Per-script terminator-back-scan vocabulary used by
 * {@link findTerminatorCutInTail}. Latin/RTL include trailing-space
 * sequences (punct + trailing space) so we don't over-match mid-word
 * abbreviations like `e.g.`; the trailing space is dropped from the cut
 * index before slicing. CJK uses full-width punctuation only.
 */
const TERMINATOR_CANDIDATES: Record<'latin' | 'cjk' | 'rtl', readonly string[]> = {
  cjk: ['。', '！', '？', '．'],
  rtl: ['. ', '! ', '? ', '؟ '],
  latin: ['. ', '! ', '? '],
};

/**
 * Back-scan a description tail for the right-most sentence terminator
 * that sits inside the in-budget window. Returns -1 when no terminator
 * is found. Extracted from {@link ensureTerminator} to keep its
 * cognitive complexity below the project lint cap.
 *
 * @param tail - Trailing slice of the description being closed
 * @param family - Script family driving the terminator set
 * @returns Cut offset (relative to `tail`), or -1 when none found
 */
function findTerminatorCutInTail(tail: string, family: 'latin' | 'cjk' | 'rtl'): number {
  const terminators = TERMINATOR_CANDIDATES[family];
  let bestRelIdx = -1;
  for (const t of terminators) {
    const idx = tail.lastIndexOf(t);
    if (idx < 0) continue;
    const cutAt = idx + (t.endsWith(' ') ? t.length - 1 : t.length);
    if (cutAt > bestRelIdx) bestRelIdx = cutAt;
  }
  return bestRelIdx;
}

/**
 * Append a script-appropriate terminator to `trimmed`, shrinking the
 * body first when `maxLength` would otherwise be exceeded. The trim
 * preserves whole graphemes (Array.from) so CJK/RTL clusters are never
 * cut mid-codepoint, and trailing dangling separators are scrubbed
 * before stapling the terminator so we don't emit `… —.` artefacts.
 *
 * @param trimmed - Body without trailing whitespace
 * @param family - Script family (drives the terminator glyph)
 * @param maxLength - Optional total grapheme budget the result must fit in
 * @param lang - Optional language code for Korean-specific handling
 * @returns Body + terminator, never longer than `maxLength` when given
 */
export function appendTerminator(
  trimmed: string,
  family: 'latin' | 'cjk' | 'rtl',
  maxLength: number | undefined,
  lang?: string
): string {
  // Korean uses Western-style period `.` not ideographic `。`
  const terminator = family === 'cjk' && lang !== 'ko' ? '。' : '.';
  if (maxLength === undefined) return `${trimmed}${terminator}`;
  const graphemes = Array.from(trimmed);
  if (graphemes.length < maxLength) return `${trimmed}${terminator}`;
  // No room for the terminator inside `maxLength` — drop trailing
  // graphemes plus any dangling separator residue before stapling.
  const headroom = Math.max(0, maxLength - 1);
  const head = graphemes
    .slice(0, headroom)
    .join('')
    .replace(/[\s|,;:—\-–]+$/u, '')
    .trim();
  return head ? `${head}${terminator}` : trimmed;
}

/**
 * Script-aware terminator finalizer. Exported for use by helpers inside
 * `resolve-helpers.ts` (e.g. `padDescriptionToFloor`) that already know
 * the script family of their working text.
 *
 * @param text - Body (already clamped to the caller's budget)
 * @param family - Script family
 * @param maxLength - Optional grapheme budget the result must fit in
 * @param lang - Optional language code for Korean-specific terminator
 * @returns Body closed with a sentence terminator, or '' when input is blank
 */
export function ensureTerminator(
  text: string,
  family: 'latin' | 'cjk' | 'rtl',
  maxLength?: number,
  lang?: string
): string {
  let trimmed = text.trim();
  if (!trimmed) return trimmed;
  // Defensive scrub: upstream truncators (text-truncate.ts and the
  // `clampForBudget` hard-cut fallback in `seo-budgets.ts`) emit a
  // trailing `…` when they have to cut mid-clause. The SEO extraction
  // regression suite rejects those snippets as truncation cuts, so we
  // strip the ellipsis here and re-close on a real sentence boundary.
  trimmed = trimmed.replace(TRAILING_ELLIPSIS_RE, '').trim();
  if (!trimmed) return trimmed;
  if (TERMINATOR_RE[family].test(trimmed)) return trimmed;
  // Back-scan for the most recent in-budget sentence terminator. If
  // one sits within the trailing ~35 chars (CJK: ~20), cut there so we
  // recover a clean close instead of stapling a period onto a
  // mid-clause word fragment. This turns
  //   "...영향을 추적하는 독자를 위" → "...영향을 추적합니다."
  // when the prior sentence already ended in a terminator.
  const scanLen = family === 'cjk' ? 20 : 35;
  const scanStart = Math.max(0, trimmed.length - scanLen);
  const tail = trimmed.slice(scanStart);
  const bestRelIdx = findTerminatorCutInTail(tail, family);
  if (bestRelIdx > 0 && scanStart + bestRelIdx >= Math.floor(trimmed.length * 0.55)) {
    return trimmed.slice(0, scanStart + bestRelIdx).trim();
  }
  return appendTerminator(trimmed, family, maxLength, lang);
}

/**
 * Strip a trailing ellipsis (Unicode `…` or ASCII `...`) plus any
 * dangling separator punctuation left over by {@link clampForBudget}'s
 * hard-cut fallback. Titles must never end in `…`: the SEO extraction
 * regression suite (`looksLikeEllipsisCut`) rejects those as truncation
 * cuts. Unlike {@link ensureTerminator}, this helper does NOT append a
 * sentence terminator — titles read better as noun-phrase headlines
 * without a trailing period.
 *
 * Example:
 *   `"활동 개요 — 1분기 입법 파이프라인 (속보) | 2…"` →
 *   `"활동 개요 — 1분기 입법 파이프라인 (속보)"`
 *
 * @param value - Already-clamped title
 * @returns Title with trailing ellipsis and dangling separators removed
 */
export function scrubTrailingEllipsis(value: string): string {
  const stripped = value.replace(TRAILING_ELLIPSIS_RE, '').trim();
  // Remove residual dangling separators (em-dash, colon, pipe) that
  // were leading into the truncated fragment.
  return stripped.replace(/[\s|,;:—\-–]+$/u, '').trim();
}

/**
 * Public finalizer for SEO meta-descriptions: strips trailing ellipses
 * emitted by {@link clampForBudget}'s hard-cut path, then guarantees the
 * snippet closes with a script-appropriate sentence terminator (`.` for
 * Latin/RTL, `。` for CJK). Wraps the module-private {@link ensureTerminator}
 * with language-to-script classification so callers in `article-metadata.ts`
 * don't need to know about the per-script terminator tables.
 *
 * When `maxLength` is supplied, the finalizer reserves space for the
 * terminator before stapling it — never returning a string longer than
 * the caller's budget. Without this, `clampForBudget(_, lang,
 * 'metaDescription')` returns a string at exactly the budget, the
 * stapled terminator pushes it 1 grapheme over, and the second clamp in
 * the HTML shell drops the terminator and cuts mid-word (live
 * regression in `news/2026-05-26-breaking-fr.html`).
 *
 * @param lang - Language code (drives Latin/CJK/RTL classification)
 * @param value - Already-clamped meta-description
 * @param maxLength - Optional grapheme budget the result must fit in
 * @returns Description with trailing ellipsis stripped and a real
 *   terminator guaranteed
 */
export function ensureDescriptionTerminator(
  lang: LanguageCode,
  value: string,
  maxLength?: number
): string {
  return ensureTerminator(value, classifyScript(lang), maxLength, lang);
}
