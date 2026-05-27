// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/ResolveUtils
 * @description Low-level utility functions extracted from resolve-helpers
 * to keep each leaf module under the 600-line drift guard.
 */
import { extractFirstSentence, shouldSkipDescriptionLine, truncateTitle } from './text-utils.js';
import { findTitleRejectionReason } from './title-rejection.js';
const LEAKY_RUNID_RE = /\b[a-z][a-z-]*-run-?\d+-\d{8,}\b/iu;
/** Matches workflow run-number patterns like "Run 271" or "— Run 42" in titles.
 *  Includes opening parenthesis and common list separators so patterns like
 *  "(Run 179, T+3)" and ", Run 180," are also caught.
 */
const RUN_NUMBER_RE = /(?:^|[\s—–\-(,;:|/])Run\s+\d+/u;
/** Word-level strip pattern for "Run N" or "Run N-of-Day" style tokens —
 *  removes the leaky token plus an optional `-suffix` modifier and any
 *  trailing list separator (`, `, `; `, `/ `) so the surrounding prose
 *  remains readable. Used by {@link stripLeakyRunTokens} when
 *  sentence-level removal would erase the entire candidate.
 */
const RUN_TOKEN_STRIP_RE = /\bRun\s+\d+(?:-[A-Za-z][\w-]*)*[\s,;:|/]*/giu;
/** Internal run-id slug strip (e.g. `breaking-run180-1779846371`). */
const RUNID_TOKEN_STRIP_RE = /\b[a-z][a-z-]*-run-?\d+-\d{8,}[\s,;:|/]*/giu;
/** "analysis run" phrase strip. */
const ANALYSIS_RUN_STRIP_RE = /\banalysis\s+run\s*\d*[\s,;:|/]*/giu;
/** Minimum title length below which a title is unusable. */
const SEO_TITLE_FLOOR = 20;
export function hasLeakySeoToken(value) {
    if (!value)
        return false;
    return value.toLowerCase().includes('analysis run') || LEAKY_RUNID_RE.test(value) || RUN_NUMBER_RE.test(value);
}
/**
 * Word-level strip of leaky workflow tokens (`Run N`, `Run 4-of-Day`,
 * `analysis run`, internal run-id slugs) from a single line of text.
 * Used when sentence-level filtering in {@link stripLeakySentences}
 * would erase the whole candidate — by removing just the leaky tokens
 * and tidying the resulting punctuation/whitespace we recover a
 * readable headline / description fragment from briefs whose BLUF
 * starts with "Run 180 (T+3 recess probe) is a DEGRADED-mode run …".
 *
 * @param value - Raw text containing one or more leaky tokens
 * @returns Cleaned text with leaky tokens and dangling separators removed
 */
export function stripLeakyRunTokens(value) {
    if (!value)
        return '';
    let cleaned = value
        .replace(RUNID_TOKEN_STRIP_RE, '')
        .replace(RUN_TOKEN_STRIP_RE, '')
        .replace(ANALYSIS_RUN_STRIP_RE, '');
    // Collapse separator runs left behind by the strip (e.g. "(, T+3)" → "(T+3)").
    cleaned = cleaned
        .replace(/\(\s*[,;:|/\-—–]+\s*/gu, '(')
        .replace(/\s*[,;:|/\-—–]+\s*\)/gu, ')')
        .replace(/\(\s*\)/gu, '')
        .replace(/\s*[,;:|/]\s*[,;:|/]+\s*/gu, ', ')
        .replace(/^[\s,;:|/\-—–]+/u, '')
        .replace(/[\s,;:|/\-—–]+$/u, '')
        .replace(/\s{2,}/gu, ' ')
        .trim();
    return cleaned;
}
/**
 * Extract a run number from a runId like `committee-reports-run47`,
 * `breaking-run188`, `committee-reports-run-47`, or a bare numeric
 * string (`"47"`). Returns the run number as a string, or `null` when
 * the runId does not carry a discriminator.
 *
 * @param runId - Raw run identifier token
 * @returns Extracted numeric portion, or `null` when absent
 */
export function extractRunNumber(runId) {
    if (!runId)
        return null;
    if (/^\d+$/u.test(runId))
        return runId;
    const segments = runId.split('-');
    for (let i = 0; i < segments.length; i += 1) {
        const seg = segments[i] ?? '';
        const m = /^run(\d+)$/u.exec(seg);
        if (m)
            return m[1] ?? null;
        if (seg === 'run') {
            const next = segments[i + 1];
            if (next && /^\d+$/u.test(next))
                return next;
        }
    }
    return null;
}
/**
 * Extract a `HH:MM UTC` publication-time qualifier from the trailing
 * unix-seconds timestamp embedded in run ids like
 * `breaking-run188-1779846371`. The time-of-day is editorial publication
 * metadata (not a workflow run number) — it tells readers and SEO
 * crawlers exactly when a piece was published and is the only locale-
 * neutral content qualifier available to disambiguate multiple briefs
 * filed on the same date when no editorial headline survives the
 * locale-script gate (e.g. non-Latin locales with no localized brief).
 *
 * Returns `null` when the run id has no trailing 10-digit timestamp,
 * when the timestamp is implausibly old (< 2020-01-01), or when the
 * Date parse fails — callers fall back to the unqualified title.
 *
 * @param runId - Raw run identifier token
 * @returns `HH:MM UTC` string, or `null` when no timestamp is available
 */
export function extractRunPublicationTime(runId) {
    if (!runId || typeof runId !== 'string')
        return null;
    const segments = runId.split('-');
    const tail = segments[segments.length - 1] ?? '';
    if (!/^\d{10}$/u.test(tail))
        return null;
    const seconds = Number(tail);
    // Sanity floor: only accept timestamps from 2020-01-01 onwards so a
    // 10-digit run-number does not get mis-interpreted as epoch seconds.
    if (!Number.isFinite(seconds) || seconds < 1577836800)
        return null;
    const date = new Date(seconds * 1000);
    if (Number.isNaN(date.getTime()))
        return null;
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm} UTC`;
}
function stripLeadingFragmentSeparator(value) {
    return value.replace(/^[:;—–-]\s+/u, '').trim();
}
function stripLeakySentences(value) {
    if (!value)
        return '';
    const parts = value
        .split(/(?<=[.!?])\s+/u)
        .map((part) => part.trim())
        .filter(Boolean);
    const clean = parts.filter((part) => !hasLeakySeoToken(part));
    if (clean.length > 0)
        return clean.join(' ').trim();
    // All sentences contained leaky tokens — recover by stripping the
    // tokens word-level so the surrounding prose survives. Keeps brief
    // BLUF paragraphs that start with "Run 180 (T+3 …) is a DEGRADED-mode
    // run …" usable as a description / headline source rather than
    // returning the leaky original.
    const wordStripped = parts
        .map((part) => stripLeakyRunTokens(part))
        .filter((part) => part.length > 0);
    return wordStripped.length > 0 ? wordStripped.join(' ').trim() : '';
}
export function sanitizeDescriptionCandidate(value) {
    const cleaned = stripLeadingFragmentSeparator(stripLeakySentences(value));
    return cleaned && !shouldSkipDescriptionLine(cleaned) ? cleaned : '';
}
/**
 * Sanitize a single-line title candidate by word-level stripping any
 * leaky workflow tokens (`Run N`, internal run-ids, `analysis run`).
 * Unlike {@link sanitizeDescriptionCandidate}, which operates at the
 * sentence level, headlines are typically a single noun phrase — so
 * token-level cleanup preserves the editorial substance instead of
 * discarding the whole line.
 *
 * @param value - Raw headline candidate
 * @returns Cleaned headline, or empty string when nothing survives
 */
export function sanitizeTitleCandidate(value) {
    if (!value)
        return '';
    const cleaned = stripLeadingFragmentSeparator(stripLeakyRunTokens(value));
    return cleaned;
}
export function isUsableResolvedTitle(value, options) {
    const cleaned = stripLeadingFragmentSeparator(value);
    if (cleaned.length < SEO_TITLE_FLOOR)
        return false;
    if (hasLeakySeoToken(cleaned))
        return false;
    const reason = findTitleRejectionReason(cleaned);
    if (reason && !(options?.allowFullSentence && reason === 'sentence-fragment')) {
        return false;
    }
    return true;
}
export function deriveHeadlineFromSummary(summary) {
    const cleaned = sanitizeDescriptionCandidate(summary);
    if (!cleaned)
        return '';
    return truncateTitle(extractFirstSentence(cleaned) || cleaned);
}
/**
 * Previously appended a short run qualifier to fallback titles for
 * disambiguation. Now a no-op: run numbers must never appear in
 * user-facing article titles. Titles should always be readable
 * article headlines without workflow identifiers.
 *
 * @param title - Base title (returned unchanged)
 * @param _runId - Raw run identifier token (ignored)
 * @returns Title unchanged
 */
export function withRunQualifier(title, _runId) {
    return title;
}
/**
 * Case-insensitive containment check after whitespace normalization.
 *
 * @param haystack - Text to search within
 * @param needle - Substring to look for
 * @returns `true` when `needle` is found within `haystack`
 */
export function containsNormalized(haystack, needle) {
    const cleanHaystack = haystack.toLowerCase().replace(/\s+/g, ' ');
    const cleanNeedle = needle.toLowerCase().replace(/\s+/g, ' ');
    return cleanNeedle.length > 0 && cleanHaystack.includes(cleanNeedle);
}
/**
 * Return the first non-empty, trimmed entry from a candidate list, or
 * the empty string when every entry is blank.
 *
 * @param candidates - Ordered list of candidate strings
 * @returns First non-blank candidate, or empty string
 */
export function pickFirstNonEmpty(candidates) {
    for (const c of candidates) {
        if (typeof c === 'string' && c.trim().length > 0)
            return c.trim();
    }
    return '';
}
//# sourceMappingURL=resolve-utils.js.map