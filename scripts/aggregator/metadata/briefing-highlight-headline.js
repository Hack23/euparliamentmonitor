// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/BriefingHighlightHeadline
 * @description Headline derivation primitives extracted from
 * {@link briefing-highlight.ts} so that module stays below the 600-line
 * drift-guard cap (see `test/unit/source-file-size.test.js`). Pure leaf
 * module — depends only on {@link truncateTitle} from `text-utils.js`
 * and the {@link stripTradecraftLabels} helper from
 * {@link briefing-highlight-sections.ts}.
 *
 * Headline derivation kicks in when a brief's `## Strategic Intelligence
 * Summary` block has *no* `### Sub-section` heading underneath it — the
 * resolver falls back to the section's first prose paragraph and we
 * mine it for a journalist-quality top-line.
 */
import { truncateTitle } from './text-utils.js';
import { stripTradecraftLabels } from './briefing-highlight-sections.js';
/**
 * Patterns that indicate a "news hook" — the most compelling claim in a
 * paragraph. Journalist editors call this the "nut graf" or "top line."
 * {@link extractNewsHookSentence} returns the first sentence that
 * matches any of these signals.
 */
const NEWS_HOOK_PATTERNS = [
    /\blandmark\b/i,
    /\bmost (?:significant|consequential|ambitious|contentious|comprehensive)\b/i,
    /\bunprecedented\b/i,
    /\bhistoric(?:ally)?\b/i,
    /\bfirst[\s-](?:ever|time)\b/i,
    /\boverhaul\b/i,
    /\breshape[sd]?\b/i,
    /\brecord[\s-]/i,
    /\bsweeping\b/i,
    /\bbreakthrough\b/i,
    /\bparadox\b/i,
    /\bgame[\s-]chang/i,
    /\bturning[\s-]point\b/i,
    /\bcrisis\b/i,
    /\bshowdown\b/i,
    /\bfracture[sd]?\b/i,
];
/**
 * Extract the most newsworthy sentence from a paragraph. Looks for
 * sentences containing strong editorial signals (superlatives, novelty
 * claims, dramatic verbs) rather than always taking the first sentence
 * which is typically bland context-setting.
 *
 * @param paragraph - Cleaned paragraph text
 * @returns The most compelling sentence, or '' if none found
 */
function extractNewsHookSentence(paragraph) {
    // Split into sentences (handles ". ", "! ", "? " boundaries — plus
    // CJK 。！？ and Arabic ؟ which have no trailing space).
    const sentences = paragraph
        .split(/(?<=[.!?])\s+|(?<=[。！？؟])/)
        .filter((s) => s.length > 20);
    // Find the first sentence with a news hook signal
    for (const sentence of sentences) {
        if (NEWS_HOOK_PATTERNS.some((re) => re.test(sentence))) {
            const result = truncateTitle(sentence);
            if (result)
                return result;
        }
    }
    return '';
}
/**
 * Derive a usable headline from a paragraph when no explicit `### …`
 * sub-heading is available. Uses a journalist's editorial hierarchy:
 *
 * 1. Find the sentence with the strongest news hook (superlatives, novelty)
 * 2. Fall back to the first sentence via `truncateTitle`
 * 3. Extract a clause at a natural boundary (comma, semicolon, dash)
 * 4. Hard-cut at word boundary as last resort
 *
 * @param paragraph - Source paragraph (already normalized)
 * @returns Headline string, or `''` when no usable clause can be derived
 */
export function deriveHeadlineFromParagraph(paragraph) {
    // Strip tradecraft labels before headline derivation.
    const cleaned = stripTradecraftLabels(paragraph);
    // Priority 1: Find the most newsworthy sentence (superlatives, drama).
    const newsHook = extractNewsHookSentence(cleaned);
    if (newsHook)
        return newsHook;
    // Priority 2: First sentence via truncateTitle.
    const direct = truncateTitle(cleaned);
    if (direct)
        return direct;
    // Priority 3: Extract the first sentence and try truncateTitle.
    // Recognise CJK 。！？ and Arabic ؟ in addition to Western . ! ?.
    const sentenceMatch = /^(.*?(?:[.!?](?=\s|$)|[。！？؟]))/.exec(cleaned);
    if (sentenceMatch?.[1]) {
        const sentenceResult = truncateTitle(sentenceMatch[1]);
        if (sentenceResult)
            return sentenceResult;
    }
    // Priority 4: Take text up to first significant clause separator.
    const CLAUSE_SEPARATORS = [', ', '; ', ' — ', ' – ', ' - '];
    for (const sep of CLAUSE_SEPARATORS) {
        const idx = cleaned.indexOf(sep, 30);
        if (idx > 0 && idx <= 140) {
            return cleaned.slice(0, idx).trim();
        }
    }
    // Final fallback: hard-cut at 120 chars on a word boundary.
    if (cleaned.length > 120) {
        const slice = cleaned.slice(0, 120);
        const lastSpace = slice.lastIndexOf(' ');
        if (lastSpace > 60)
            return slice.slice(0, lastSpace).trim();
    }
    return cleaned.length <= 140 ? cleaned : '';
}
//# sourceMappingURL=briefing-highlight-headline.js.map