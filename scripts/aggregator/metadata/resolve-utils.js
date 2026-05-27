// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/ResolveUtils
 * @description Low-level utility functions extracted from resolve-helpers
 * to keep each leaf module under the 600-line drift guard.
 */
import { extractFirstSentence, shouldSkipDescriptionLine, truncateTitle, } from './text-utils.js';
import { findTitleRejectionReason } from './title-rejection.js';
const LEAKY_RUNID_RE = /\b[a-z][a-z-]*-run-?\d+-\d{8,}\b/iu;
/** Minimum title length below which a title is unusable. */
const SEO_TITLE_FLOOR = 20;
export function hasLeakySeoToken(value) {
    if (!value)
        return false;
    return value.toLowerCase().includes('analysis run') || LEAKY_RUNID_RE.test(value);
}
/**
 * Extract a run number from a runId like `committee-reports-run47`,
 * `breaking-run188`, `committee-reports-run-47`, or a bare numeric
 * string (`"47"`). Returns the run number as a string, or `null` when
 * the runId does not carry a discriminator.
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
    return (clean.length > 0 ? clean : parts).join(' ').trim();
}
export function sanitizeDescriptionCandidate(value) {
    const cleaned = stripLeadingFragmentSeparator(stripLeakySentences(value));
    return cleaned && !shouldSkipDescriptionLine(cleaned) ? cleaned : '';
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
 * Append a short run qualifier to otherwise duplicate-prone fallback
 * titles. Sanitizes the raw `runId` so user-facing `<title>` strings
 * never expose Unix timestamps or the full opaque token.
 */
export function withRunQualifier(title, runId) {
    if (!runId)
        return title;
    if (/^\d+$/u.test(runId))
        return `${title} — Run ${runId}`;
    const segments = runId.split('-');
    for (const seg of segments) {
        const m = /^run(\d+)$/u.exec(seg);
        if (m)
            return `${title} — Run ${m[1]}`;
        const m2 = /^run$/u.exec(seg);
        if (m2) {
            const idx = segments.indexOf(seg);
            const next = segments[idx + 1];
            if (next && /^\d+$/u.test(next))
                return `${title} — Run ${next}`;
        }
    }
    return title;
}
/**
 * Case-insensitive containment check after whitespace normalization.
 */
export function containsNormalized(haystack, needle) {
    const cleanHaystack = haystack.toLowerCase().replace(/\s+/g, ' ');
    const cleanNeedle = needle.toLowerCase().replace(/\s+/g, ' ');
    return cleanNeedle.length > 0 && cleanHaystack.includes(cleanNeedle);
}
/**
 * Return the first non-empty, trimmed entry from a candidate list, or
 * the empty string when every entry is blank.
 */
export function pickFirstNonEmpty(candidates) {
    for (const c of candidates) {
        if (typeof c === 'string' && c.trim().length > 0)
            return c.trim();
    }
    return '';
}
//# sourceMappingURL=resolve-utils.js.map