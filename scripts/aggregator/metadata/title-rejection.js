// SPDX-FileCopyrightText: 2026 James Pether Sörling
// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Title-rejection predicates shared by the metadata resolver and the
 * SEO validation gate.
 *
 * Every English `<title>` and `<meta description>` on the site is
 * resolved from the run's `executive-brief.md` via
 * {@link ./resolve-helpers.ts}. Bold-prose labels inside the brief
 * (`**Strategic significance:** …`, `**Threat Level:** …`,
 * `**Key Assumptions Check:** …`) and trailing ellipsis fragments
 * from over-budget strong-prose paragraphs have leaked into the
 * `<title>` surface (216-article audit, 2026-05-24). This module
 * provides the canonical denylist + structural rejection rules so
 * resolver and validator stay in lock-step.
 *
 * NEVER inline these predicates — duplicating the denylist makes the
 * validator and resolver drift, which is exactly how the bad titles
 * shipped in the first place.
 */
/**
 * Bold-prose labels that appear inside `executive-brief.md` as
 * `**Label:** …` lines. The priority-finding extractor was treating
 * the bold label as a headline; the resolver now rejects these as
 * usable titles.
 *
 * Keep entries lowercase and exact — matching is case-insensitive
 * after trimming and stripping a trailing `:`, `…`, `.`.
 */
const SECTION_HEADER_DENYLIST = Object.freeze([
    'strategic significance',
    'event description',
    'key intelligence',
    'threat level',
    'close to adoption',
    'convergence themes',
    'convergence theme',
    'key assumptions check',
    'risk assessment',
    'stakeholder map',
    'intelligence summary',
    'session overview',
    'situation summary',
    'priority analysis',
    'priority intelligence items',
    'priority intelligence item',
    'lead story',
    'bluf',
    'tl;dr',
    '60-second read',
    'classification',
    'confidence summary',
    'methodological notes',
    'source reliability assessment',
    'corrections and caveats',
    'forward look',
    'top three action items',
    'political landscape summary',
    'external environment summary',
    'coalition & bloc summary',
    'coalition and bloc summary',
    'week ahead',
    'week in review',
    'month ahead',
    'month in review',
    'year ahead',
    'term outlook',
    'quarter ahead',
    'election cycle',
    // single-noun outputs that occasionally surface from H2/H3 walks
    'overview',
    'background',
    'context',
    'analysis',
    'summary',
    'conclusion',
    'recommendations',
]);
const SECTION_HEADER_SET = new Set(SECTION_HEADER_DENYLIST);
/** Ellipsis at end of string (Unicode `…` or ASCII `...`). */
const ELLIPSIS_TAIL_RE = /(?:\u2026|\.\.\.)\s*$/u;
/**
 * Adopted-text doc-ID (`TA-10-2026-0160`) — these are procedure
 * identifiers, never editorial titles.
 */
const DOC_ID_RE = /^TA-\d+-\d{4}-\d{3,4}$/iu;
/**
 * Detect a candidate that is really a complete sentence rather than a
 * headline (e.g. `Routine inter-sessional day, no breaking signal.`,
 * `EP10 enters the second half of its mandate with a structurally
 * constrained but operational grand coalition.`).
 *
 * Gold-standard brief H1s never end with a period — they are
 * noun-phrase headlines (`EU Parliament Year Ahead (May 2026 – May
 * 2027)`, `EP Committee Reports · Week of 2026-05-14–21`). A trailing
 * single `.` (NOT `…` and NOT `...`) on a ≥4-word candidate is the
 * cleanest signal that we are looking at sentence prose leaked from a
 * BLUF / lede paragraph rather than an editorial headline.
 */
function looksLikeFullSentence(value) {
    const trimmed = value.trim();
    // Must end with exactly one period — `…` and `...` are caught by
    // looksLikeEllipsisCut, and other terminal punctuation (`?`, `!`,
    // `:`) is left to lower-priority filters.
    if (!/[^.]\.\s*$/u.test(trimmed))
        return false;
    if (/\.\.\.\s*$|\u2026\s*$/u.test(trimmed))
        return false;
    const wordCount = trimmed.split(/\s+/u).length;
    return wordCount >= 4;
}
/**
 * `true` when the candidate is a bold-prose section header that
 * leaked through the priority-finding extractor (e.g. `Strategic
 * significance`, `Threat Level`).
 *
 * @param value - Title candidate
 */
export function looksLikeSectionHeader(value) {
    if (!value)
        return false;
    const normalised = value
        .toLowerCase()
        .replace(/[\u2026.:!?]+\s*$/u, '')
        .replace(/^[*_\s]+/u, '')
        .replace(/[*_\s]+$/u, '')
        .trim();
    if (!normalised)
        return false;
    return SECTION_HEADER_SET.has(normalised);
}
/**
 * `true` when the candidate ends with `…` or `...` (was truncated
 * over the title budget).
 */
export function looksLikeEllipsisCut(value) {
    return ELLIPSIS_TAIL_RE.test(value);
}
/** `true` when the candidate is a bare adopted-text doc-ID. */
export function looksLikeDocId(value) {
    return DOC_ID_RE.test(value.trim());
}
/**
 * Master rejection predicate. Returns the reason code (one of
 * `section-header`, `ellipsis-cut`, `doc-id`, `sentence-fragment`)
 * when the candidate should be rejected, or `null` when it is
 * usable.
 *
 * @param value - Title candidate
 */
export function findTitleRejectionReason(value) {
    if (!value)
        return null;
    if (looksLikeEllipsisCut(value))
        return 'ellipsis-cut';
    if (looksLikeDocId(value))
        return 'doc-id';
    if (looksLikeSectionHeader(value))
        return 'section-header';
    if (looksLikeFullSentence(value))
        return 'sentence-fragment';
    return null;
}
/** Exposed for unit tests + the SEO validator. */
export const TITLE_REJECTION_DENYLIST = SECTION_HEADER_DENYLIST;
//# sourceMappingURL=title-rejection.js.map