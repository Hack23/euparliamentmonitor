// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/TextTruncate
 * @description Byte-budget truncators and sentence-extraction helpers
 * extracted from `text-utils.ts` to keep both modules under the 600-line
 * drift-guard budget enforced by `test/unit/source-file-size.test.js`.
 *
 * This file is the **clamping layer** of the metadata text pipeline —
 * after `shouldSkipDescriptionLine`/`stripInlineMarkdown` produce a
 * candidate description / title, the helpers here apply the SEO-budget
 * shape rules:
 *
 * - {@link truncateDescription} — clamp to `DESCRIPTION_MAX_LENGTH` on a
 *   sentence/word boundary, appending `…` when truncation occurs.
 * - {@link truncateExtendedDescription} — clamp to the longer
 *   `EXTENDED_DESCRIPTION_MAX_LENGTH` (used by `og:description`).
 * - {@link truncateTitle} — clamp to `TITLE_MAX_LENGTH` on a
 *   **clause** boundary, returning `''` rather than emitting a
 *   mid-sentence ellipsised title.
 * - {@link extractFirstSentence} — return the first complete sentence
 *   from a prose paragraph, or `''` when no clean terminator is
 *   available within the soft-min window.
 *
 * Bounded-context rules match `text-utils.ts`:
 * - **No upward imports** — pure helpers, no I/O, no globals.
 * - **Deterministic** — same input always produces same output.
 * - **Locale-agnostic** — operates on raw prose in any of the 14
 *   publishing languages.
 */
import { ABBREVIATION_PREFIXES, DESCRIPTION_MAX_LENGTH, DESCRIPTION_MIN_LENGTH, EXTENDED_DESCRIPTION_MAX_LENGTH, EXTENDED_DESCRIPTION_MIN_LENGTH, HEADLINE_CLAUSE_BOUNDARIES, HEADLINE_HARD_MIN, HEADLINE_SOFT_MIN, TITLE_MAX_LENGTH, TRAILING_PUNCT, TRAILING_STOP_WORDS, } from './text-utils-constants.js';
/**
 * Remove any trailing whitespace, stop-words (the/a/an/of/…) and
 * trailing punctuation (including any pre-existing ellipsis). Implemented
 * imperatively to avoid super-linear regex backtracking on the
 * `(?:\s+stop-word)+$` pattern flagged by `security/detect-unsafe-regex`.
 *
 * @param input - Pre-clipped string to clean up
 * @returns Cleaned string with no trailing stop-words or punctuation
 */
export function stripTrailingStopWordsAndPunctuation(input) {
    let result = input;
    let changed = true;
    while (changed) {
        changed = false;
        while (result.length > 0 && TRAILING_PUNCT.test(result.charAt(result.length - 1))) {
            result = result.slice(0, -1);
            changed = true;
        }
        const lastSpace = result.lastIndexOf(' ');
        if (lastSpace >= 0) {
            const tail = result.slice(lastSpace + 1).toLowerCase();
            if (TRAILING_STOP_WORDS.has(tail)) {
                result = result.slice(0, lastSpace);
                changed = true;
            }
        }
    }
    return result;
}
/**
 * Clamp a string to `DESCRIPTION_MAX_LENGTH` characters, appending
 * an ellipsis when truncation actually happens. Does not break words if
 * avoidable — a trailing partial word is trimmed back to the previous
 * space first.
 *
 * @param text - Raw description text
 * @returns Truncated description with trailing ellipsis when clipped
 */
export function truncateDescription(text) {
    if (text.length <= DESCRIPTION_MAX_LENGTH)
        return text;
    const cut = text.slice(0, DESCRIPTION_MAX_LENGTH);
    // Prefer the last full sentence terminator within the cut so we don't
    // end on a dangling determiner ("…year. The"). Period/!/? followed by
    // a space marks a clean boundary. Only honour the boundary when it
    // sits past the soft minimum so we keep enough body text to be useful.
    const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    if (sentenceEnd >= DESCRIPTION_MIN_LENGTH) {
        return cut.slice(0, sentenceEnd + 1).replace(/\s+$/, '');
    }
    const earlySentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    if (earlySentenceEnd >= Math.floor(DESCRIPTION_MIN_LENGTH / 3)) {
        return cut.slice(0, earlySentenceEnd + 1).replace(/\s+$/, '');
    }
    const lastSpace = cut.lastIndexOf(' ');
    let safe = lastSpace > DESCRIPTION_MAX_LENGTH - 60 ? cut.slice(0, lastSpace) : cut;
    // Drop dangling stop-words and trailing punctuation/ellipsis so we
    // never emit broken copy ("…year. The" → "…year.") or double-ellipsis
    // ("The……") when the upstream input already carried an ellipsis.
    safe = stripTrailingStopWordsAndPunctuation(safe);
    return safe;
}
/**
 * Clamp an extended description to {@link EXTENDED_DESCRIPTION_MAX_LENGTH}
 * characters using the same sentence-boundary-preserving logic as
 * {@link truncateDescription}. Returns `''` when the input is empty
 * or shorter than the meta-description maximum (no point in emitting
 * an "extended" description that's actually shorter than the regular
 * one).
 *
 * @param text - Raw extended-description text (e.g. full BLUF paragraph)
 * @returns Truncated extended description, or `''` when not worth emitting
 */
export function truncateExtendedDescription(text) {
    const trimmed = text.trim();
    if (!trimmed)
        return '';
    // Don't emit an extended description that is shorter than the
    // short meta-description budget — there's no SEO win and it would
    // make `og:description` shorter than `<meta description>`.
    if (trimmed.length <= DESCRIPTION_MAX_LENGTH)
        return '';
    if (trimmed.length <= EXTENDED_DESCRIPTION_MAX_LENGTH)
        return trimmed;
    const cut = trimmed.slice(0, EXTENDED_DESCRIPTION_MAX_LENGTH);
    const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    if (sentenceEnd >= EXTENDED_DESCRIPTION_MIN_LENGTH) {
        return cut.slice(0, sentenceEnd + 1).replace(/\s+$/, '');
    }
    const earlySentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    if (earlySentenceEnd >= Math.floor(EXTENDED_DESCRIPTION_MIN_LENGTH / 2)) {
        return cut.slice(0, earlySentenceEnd + 1).replace(/\s+$/, '');
    }
    const lastSpace = cut.lastIndexOf(' ');
    let safe = lastSpace > EXTENDED_DESCRIPTION_MAX_LENGTH - 60 ? cut.slice(0, lastSpace) : cut;
    safe = stripTrailingStopWordsAndPunctuation(safe);
    return safe;
}
/**
 * Clamp a title to `TITLE_MAX_LENGTH` characters in the same
 * word-boundary-preserving fashion as {@link truncateDescription}.
 *
 * **No mid-sentence ellipsis.** When the title overruns the budget and
 * no natural clause boundary exists inside the
 * `[HEADLINE_SOFT_MIN, TITLE_MAX_LENGTH]` window, this function returns
 * an empty string instead of a mid-sentence `…` truncation. The empty
 * return tells the caller to fall through to the next tier of the
 * resolver ladder (template-fallback title with category + date),
 * producing a complete, scan-friendly title rather than a clipped
 * editorial fragment. Live-site regression (2026-05): titles such as
 * `AI Trade Strategy: A Legislative First with Structural…` and
 * `The European Parliament's 24 standing committees continued…`
 * were emitted before this guard.
 *
 * @param text - Raw title text
 * @returns Clause-truncated title (no ellipsis), or `''` when no
 *   editorial clause boundary exists in the window
 */
export function truncateTitle(text) {
    if (text.length <= TITLE_MAX_LENGTH)
        return text;
    // Prefer ending at a natural clause boundary inside the
    // `[HEADLINE_SOFT_MIN, TITLE_MAX_LENGTH]` window so the truncated
    // title reads as a complete journalistic clause rather than a
    // mid-sentence prose snippet. Iterate boundaries in priority order;
    // when a candidate falls in the window, break there and drop the
    // ellipsis since the result is grammatically complete.
    const search = text.slice(0, TITLE_MAX_LENGTH);
    for (const boundary of HEADLINE_CLAUSE_BOUNDARIES) {
        const idx = search.lastIndexOf(boundary);
        if (idx >= HEADLINE_SOFT_MIN) {
            const clean = stripTrailingStopWordsAndPunctuation(text.slice(0, idx));
            if (clean.length >= HEADLINE_SOFT_MIN)
                return clean;
        }
    }
    // Second-tier fallback: when nothing landed in the soft window, look
    // for the strongest boundary (`: ` or ` — `) inside the harder
    // `[HEADLINE_HARD_MIN, HEADLINE_SOFT_MIN]` floor. This rescues
    // Reader-Briefing-style ledes like
    // `Immediate priority: DMA enforcement — …` whose clauses cluster in
    // the opening 30-60 chars, while still keeping the soft-min guard
    // active for runaway prose. We restrict the boundary set to `: ` and
    // ` — ` (the two strongest semantic breaks) to avoid emitting trivial
    // comma-split or full-stop-split fragments from short prose.
    const STRONG_BOUNDARIES = [': ', ' — ', ' – '];
    for (const boundary of STRONG_BOUNDARIES) {
        const idx = search.indexOf(boundary);
        if (idx >= HEADLINE_HARD_MIN && idx < HEADLINE_SOFT_MIN) {
            const clean = stripTrailingStopWordsAndPunctuation(text.slice(0, idx));
            if (clean.length >= HEADLINE_HARD_MIN)
                return clean;
        }
    }
    // No clause boundary in either window — refuse to emit a mid-sentence
    // truncation. Caller falls through to template-fallback composition.
    return '';
}
// ────────────────────────────────────────────────────────────────────────
// Sentence extraction
// ────────────────────────────────────────────────────────────────────────
/**
 * Return the first complete sentence from a prose paragraph, suitable
 * for use as a fallback editorial title when the artefact H1 is
 * categorical (e.g. `# EU Parliament Committee Reports`) and the
 * resolver must derive `<title>` from the BLUF / lede summary instead.
 *
 * A "sentence" is the prefix up to the first sentence-terminator
 * (`. `, `! `, `? `, `; `) inside the `[HEADLINE_SOFT_MIN,
 * TITLE_MAX_LENGTH]` window. Common abbreviations (`Q1.`, `Q2.`,
 * `H1.`, `H2.`, `Mr.`, `Mrs.`, `e.g.`, `i.e.`, `vs.`) are skipped
 * so they don't terminate the sentence prematurely. When no
 * acceptable terminator exists in the window, returns `''` so the
 * resolver falls through to the next tier instead of feeding an
 * over-budget paragraph into {@link truncateTitle} (which would also
 * return `''`).
 *
 * @param paragraph - Prose paragraph (post-`stripInlineMarkdown`)
 * @returns First sentence, or `''` when none can be identified within
 *   the soft-min window
 */
export function extractFirstSentence(paragraph) {
    const trimmed = paragraph.trim();
    if (trimmed.length <= HEADLINE_SOFT_MIN)
        return trimmed;
    // Limit terminator search to TITLE_MAX_LENGTH * 1.5 — beyond that
    // we'd rather let truncateTitle clause-truncate the original
    // paragraph than return a too-long first sentence.
    const window = trimmed.slice(0, Math.floor(TITLE_MAX_LENGTH * 1.5));
    // Skip common abbreviations that contain a period inside a token
    // (Q1., e.g., i.e., vs., Mr., Mrs., No., U.S., E.U.). We walk
    // candidate terminator positions; a position counts only when the
    // char before it is *not* part of a known abbreviation token.
    const terminators = ['. ', '! ', '? ', '; '];
    let bestIdx = -1;
    for (const t of terminators) {
        let from = HEADLINE_SOFT_MIN;
        let idx;
        while ((idx = window.indexOf(t, from)) !== -1) {
            if (!isAbbreviationBoundary(window, idx) && idx < window.length - 1) {
                if (bestIdx === -1 || idx < bestIdx)
                    bestIdx = idx;
                break;
            }
            from = idx + t.length;
        }
    }
    if (bestIdx >= HEADLINE_SOFT_MIN) {
        return trimmed.slice(0, bestIdx + 1).trim();
    }
    // No sentence terminator inside the window — return `''` so the
    // resolver falls through to the next tier instead of feeding a full
    // paragraph into {@link truncateTitle} (which would now return `''`
    // anyway). Being explicit here keeps the tier-1/2 split obvious.
    return '';
}
/**
 * Check whether the character preceding the `.` at `idx` in `text`
 * indicates an abbreviation (so the `.` is not a sentence terminator).
 * Matches the {@link ABBREVIATION_PREFIXES} table and the all-caps
 * single-letter initials pattern (`U.S.`, `E.U.`).
 *
 * @param text - Source text (lowercased segment + original mixed-case)
 * @param idx - Index of the `.` character in `text`
 * @returns `true` when the period at `idx` is part of an abbreviation
 */
function isAbbreviationBoundary(text, idx) {
    // All-caps single-letter initial like `U.S.` or `E.U.` — char at
    // idx-1 is a capital letter, and idx-2 is either start of string,
    // whitespace, or another single-letter+period pair.
    if (idx >= 1) {
        const prev = text.charCodeAt(idx - 1);
        const isUpperLetter = prev >= 65 && prev <= 90;
        if (isUpperLetter && (idx === 1 || text[idx - 2] === ' ' || text[idx - 2] === '.')) {
            return true;
        }
    }
    // ABBREVIATION_PREFIXES lookup — scan backwards from `.` to find the
    // start of the word, then compare lowercased.
    let start = idx;
    while (start > 0 && /[a-zA-Z]/u.test(text[start - 1] ?? ''))
        start--;
    const token = text.slice(start, idx + 1).toLowerCase();
    return ABBREVIATION_PREFIXES.includes(token);
}
//# sourceMappingURL=text-truncate.js.map