// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/PriorityFindingCleaning
 * @description Headline-cleaning helpers extracted from
 * `priority-finding-highlight.ts` to keep that module under the
 * 600-line drift-guard budget enforced by
 * `test/unit/source-file-size.test.js`.
 *
 * Public entry point: {@link cleanPriorityHeadline} — normalises a
 * raw bold-title / heading string by stripping priority decorations
 * (`🔴 CRITICAL — `), editorial prefixes (`Trigger 1: `), trailing
 * confidence markers (`🔴 CRITICAL`), and parenthesised tail metadata
 * (`(TA-10-2026-0160, 2026-04-30)`).
 *
 * Bounded-context rules:
 * - **Pure helpers** — no I/O, no globals.
 * - **Deterministic** — same input always produces same output.
 * - **Reusable** — every helper accepts a plain string and returns a
 *   plain string; suitable for property-tests.
 */
import { stripInlineMarkdown } from './text-utils.js';
/**
 * Leading priority-label tokens stripped by {@link cleanPriorityHeadline}
 * (`🔴 CRITICAL — Title` → `Title`). Kept as a list to bypass the
 * unsafe-regex lint by avoiding deep alternation in a single pattern.
 */
const PRIORITY_LABEL_TOKENS = [
    'CRITICAL',
    'HIGH PRIORITY',
    'HIGH',
    'MEDIUM PRIORITY',
    'MEDIUM',
    'LOW PRIORITY',
    'LOW',
    'URGENT',
    'ALERT',
    'PRIORITY',
];
/**
 * Trailing confidence-marker tokens stripped by
 * {@link cleanPriorityHeadline}. Same rationale as
 * {@link PRIORITY_LABEL_TOKENS}.
 */
const PRIORITY_TRAILING_TOKENS = [
    'CRITICAL',
    'HIGH PRIORITY',
    'HIGH',
    'MEDIUM PRIORITY',
    'MEDIUM',
    'LOW PRIORITY',
    'LOW',
];
/**
 * Leading editorial-prefix tokens stripped by
 * {@link cleanPriorityHeadline} (`Trigger 1: Title` → `Title`).
 */
const PRIORITY_LEADING_PREFIX_TOKENS = [
    'Trigger',
    'Dossier',
    'Priority',
    'Finding',
    'Item',
    'Highlight',
    'Top',
    'Story',
    'Alert',
    'Judgement',
    'Judgment',
];
/**
 * Strip a leading priority decoration (`🔴 `, `CRITICAL — `) from a
 * candidate headline. Extracted from {@link cleanPriorityHeadline} to
 * keep cognitive complexity within budget.
 *
 * @param text - Candidate headline (already trimmed)
 * @returns Headline with the leading decoration removed
 */
function stripPriorityLeadingDecoration(text) {
    let out = text;
    for (let pass = 0; pass < 2; pass++) {
        out = out.replace(/^[^\p{L}\p{N}]+/u, '').trim();
        for (const token of PRIORITY_LABEL_TOKENS) {
            if (out.toLowerCase().startsWith(token.toLowerCase())) {
                const rest = out.slice(token.length).trim();
                const sep = rest.match(/^[:—–-]\s*(.+)$/u);
                if (sep?.[1]) {
                    out = sep[1].trim();
                    break;
                }
            }
        }
    }
    return out;
}
/**
 * Strip a leading editorial prefix (`Trigger 1: `, `Dossier 2: `) and a
 * stray leading ordinal (`1. `, `2.1 `) from a candidate headline.
 *
 * @param text - Candidate headline
 * @returns Headline with the leading editorial decoration removed
 */
function stripPriorityLeadingPrefix(text) {
    let out = text;
    for (const token of PRIORITY_LEADING_PREFIX_TOKENS) {
        if (!out.toLowerCase().startsWith(token.toLowerCase()))
            continue;
        const rest = out.slice(token.length);
        const match = rest.match(/^\s+\d+\s*[:–—-]\s*(.+)$/u);
        if (match?.[1]) {
            out = match[1];
            break;
        }
    }
    // Drop a stray leading "1. " / "2) " ordinal.
    out = out.replace(/^\d+[.):·\s]\s*/u, '');
    return out;
}
/**
 * Strip a trailing confidence marker (`🔴 CRITICAL`, `🟡 MEDIUM`) from a
 * candidate headline. Single pass — caller invokes inside a fixed-point
 * loop.
 *
 * @param text - Candidate headline
 * @returns Headline with the trailing confidence marker removed
 */
function stripPriorityTrailingMarker(text) {
    let out = text;
    for (const token of PRIORITY_TRAILING_TOKENS) {
        const pattern = new RegExp(`\\s+[^\\p{L}\\p{N}\\s]?\\s*${token}\\s*$`, 'iu');
        const next = out.replace(pattern, '');
        if (next !== out) {
            out = next;
            break;
        }
    }
    return out;
}
/**
 * Strip the trailing parenthesised metadata that briefs append to every
 * priority-finding name — procedure codes, dates, committee tags. The
 * regex is intentionally non-greedy so it removes only the LAST
 * parenthesised group on the line.
 *
 * @param text - Headline or paragraph text
 * @returns Text with the trailing `(…)` stripped
 */
export function stripPriorityTailMetadata(text) {
    return text.replace(/\s*\([^()]{3,80}\)\s*$/u, '').trim();
}
/**
 * Normalise a priority-finding headline: drop the
 * `Trigger N:` / `Dossier N:` / leading-numeric prefix, strip trailing
 * parenthesised metadata (`(TA-10-2026-0160, 2026-04-30)`,
 * `(ITRE/ENVI)`), and trim residual punctuation. The result is a
 * headline-shaped string suitable for `<title>` use.
 *
 * @param raw - Raw bold-title or heading text
 * @returns Cleaned headline (may be empty after stripping)
 */
export function cleanPriorityHeadline(raw) {
    let text = stripInlineMarkdown(raw).trim();
    text = stripPriorityLeadingDecoration(text);
    text = stripPriorityLeadingPrefix(text);
    // Trailing cleanup runs in a fixed-point loop so combined patterns
    // like "Title (Confidence, 80%): 🔴" collapse all the way down to
    // "Title".
    let previous = '';
    while (previous !== text) {
        previous = text;
        text = stripPriorityTrailingMarker(text);
        text = stripPriorityTailMetadata(text);
        // Drop a single trailing emoji left after metadata stripping.
        text = text.replace(/\s+[^\p{L}\p{N}\s]+\s*$/u, '');
        // Drop trailing colons / dashes left over.
        text = text.replace(/[\s:—–-]+$/u, '');
        text = text.trim();
    }
    return text;
}
//# sourceMappingURL=priority-finding-cleaning.js.map