// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/TextUtils
 * @description Pure text / Markdown utility helpers extracted from
 * `article-metadata.ts` as a leaf module in the `metadata/` bounded
 * context. Every helper here is concerned with **how to massage a
 * string** into a meta-tag-safe shape — strip Markdown decorations,
 * recognise banner / metadata rows that must never reach the
 * description, clamp text to byte budgets without producing broken
 * copy, and identify the first complete sentence in a prose paragraph.
 *
 * Bounded-context rules for this file:
 * - **No upward imports** — pure helpers, no dependencies on other
 *   `src/aggregator/` modules, no I/O, no globals.
 * - **Deterministic** — same input always produces same output; safe to
 *   property-test.
 * - **Locale-agnostic** — every helper works on raw Markdown / prose
 *   in any of the 14 publishing languages. Banner-row detection is
 *   driven by structural shape (double-bold + pipe-separator), not by
 *   a hard-coded English vocabulary.
 *
 * The companion file `article-metadata.ts` re-exports the public surface
 * for back-compat. New code should import directly from this module.
 */
// ────────────────────────────────────────────────────────────────────────
// Length budgets — meta description / title size envelopes
// ────────────────────────────────────────────────────────────────────────
/** Maximum `<meta description>` length we will emit. */
export const DESCRIPTION_MAX_LENGTH = 180;
/**
 * Maximum `og:description` / `twitter:description` length we will
 * emit. Facebook truncates at ~300 characters in the preview card;
 * Twitter at ~200. We aim for the longer cap so LinkedIn / Slack
 * (which use the full OG payload) get the full BLUF context, then
 * let Twitter clip naturally. Below this length the extended
 * description is emitted verbatim; above it we sentence-boundary
 * truncate the same way as {@link truncateDescription}.
 */
export const EXTENDED_DESCRIPTION_MAX_LENGTH = 300;
/** Target minimum extended-description length before we even emit it. */
export const EXTENDED_DESCRIPTION_MIN_LENGTH = 200;
/** Target minimum `<meta description>` length before we append context. */
export const DESCRIPTION_MIN_LENGTH = 140;
/**
 * Length below which a raw description is considered too short to stand
 * on its own and gets enriched with date/context. Independent from
 * {@link DESCRIPTION_MIN_LENGTH} (which controls sentence-boundary
 * truncation behaviour). Set lower than DESCRIPTION_MIN_LENGTH so a
 * clean 100-140 char prose lede is preserved verbatim instead of being
 * padded with date/context boilerplate.
 */
export const ENRICHMENT_TRIGGER_LENGTH = 100;
/** Maximum `<title>` length — anything longer is truncated with an ellipsis. */
export const TITLE_MAX_LENGTH = 140;
/**
 * Soft target for headline-style titles produced as a fallback from
 * BLUF/lede prose. When the candidate exceeds `TITLE_MAX_LENGTH`, the
 * truncator first looks for a natural clause boundary
 * (`.`, `:`, `—`, `;`) inside the `[HEADLINE_SOFT_MIN, TITLE_MAX_LENGTH]`
 * window and breaks there instead of mid-clause-with-ellipsis. This
 * turns a 137-character truncated prose paragraph into a complete
 * journalistic clause, which scans much better in news cards and SERP
 * snippets without sacrificing the keyword-rich opening.
 */
export const HEADLINE_SOFT_MIN = 60;
/**
 * Punctuation marks that signal a natural clause boundary inside a
 * BLUF / lede paragraph. Listed in preferred-break order: a colon or
 * em-dash that introduces a list of consequences is the best break,
 * full stops are next, and semicolons last. Single ASCII space is
 * always a fallback boundary handled separately.
 */
export const HEADLINE_CLAUSE_BOUNDARIES = [': ', ' — ', ' – ', '. ', '; '];
// ────────────────────────────────────────────────────────────────────────
// Banner / metadata-row vocabularies
// ────────────────────────────────────────────────────────────────────────
/**
 * Emoji-banner prefixes that Stage-B agents use to decorate metadata rows
 * (e.g. `📋 Analysis Owner:`). Any line starting with one of these is
 * metadata, never prose.
 */
export const EMOJI_BANNER_CHARS = [
    '📋',
    '📅',
    '🔍',
    '🏛',
    '📰',
    '📊',
    '🏷',
    '📈',
    '📉',
    '⚠',
    '🔔',
    '🎯',
    '🗳',
    '🏢',
    '📄',
];
/**
 * Label prefixes that a prose description must never start with. Every
 * entry matches case-insensitively at the start of a trimmed line, followed
 * by optional space and a colon.
 */
export const METADATA_LINE_PREFIXES = [
    'Admiralty Grade',
    'Analysis Date',
    'Analysis Owner',
    'Article Type',
    'Article Window',
    'Assessment Date',
    'Briefing',
    'Briefing Date',
    'Classification',
    'Classification Date',
    'Confidence',
    'Confidence in Evidence',
    'Data Sources',
    'Date',
    'Document Type',
    'Filing Date',
    'Generated',
    'Horizon',
    'IMF Status',
    'Last Updated',
    'Parliamentary Status',
    'Parliamentary Term',
    'Period',
    'Prepared',
    'Purpose',
    'Region',
    'Reporting',
    'Reporting Period',
    'Reporting Window',
    'Run',
    'Run ID',
    'Series',
    'Series Run',
    'Source',
    'Sources',
    'SPDX-FileCopyrightText',
    'SPDX-License-Identifier',
    'Topic',
    'Type',
    // Bare `WEP:` (Words of Estimative Probability) lines appear in
    // `intelligence/synthesis-summary.md` between a KJ-N heading and its
    // prose body (e.g. `**WEP: ALMOST CERTAINLY (>95%)** | Admiralty: A1`).
    // The line is grade/confidence metadata, not editorial prose — without
    // this prefix it leaked into `<meta description>` as an all-caps shout
    // (run #26223932441, propositions 2026-05-21).
    'WEP',
    'WEP Band',
    'WEP Grade',
    'Window',
];
// ────────────────────────────────────────────────────────────────────────
// Trailing-cleanup vocabularies (used by truncation helpers)
// ────────────────────────────────────────────────────────────────────────
/** Connector / determiner words that read as broken copy when they are
 *  the final token before a truncation ellipsis. */
export const TRAILING_STOP_WORDS = new Set([
    'the',
    'a',
    'an',
    'of',
    'to',
    'for',
    'in',
    'on',
    'at',
    'by',
    'and',
    'or',
    'with',
    'from',
]);
/** Trailing characters we always strip before appending our own ellipsis,
 *  so we never emit double-ellipsis or stray punctuation. */
export const TRAILING_PUNCT = /[.,;:—\-…\s]/u;
/**
 * Abbreviation tokens (lowercase, including the trailing period) that
 * should NOT count as sentence terminators when {@link extractFirstSentence}
 * scans for a `.` boundary. Single-letter all-caps initials
 * (`U.S.`, `E.U.`) are handled by the all-caps-initial check below.
 */
export const ABBREVIATION_PREFIXES = [
    'mr.',
    'mrs.',
    'ms.',
    'dr.',
    'st.',
    'no.',
    'vs.',
    'e.g.',
    'i.e.',
    'etc.',
    'cf.',
    'al.',
    // EP fiscal-year and quarter shorthand: Q1., Q2., Q3., Q4., H1., H2., FY.
    'q1.',
    'q2.',
    'q3.',
    'q4.',
    'h1.',
    'h2.',
    'fy.',
];
// ────────────────────────────────────────────────────────────────────────
// Line-classification helpers
// ────────────────────────────────────────────────────────────────────────
/**
 * Return `true` when a line cannot serve as a prose description. Rejects
 * Markdown structural lines (headings, blockquotes, tables, HTML),
 * mermaid/chart directives, emoji-banner metadata rows, and the known
 * `Key: value` banners that Stage-B agents emit as artefact preamble.
 *
 * @param line - Trimmed line from the aggregated Markdown source
 * @returns `true` when the line is not prose and should be skipped
 */
export function shouldSkipDescriptionLine(line) {
    if (line.length === 0)
        return true;
    if (line.startsWith('#'))
        return true;
    if (line.startsWith('>'))
        return true;
    if (line.startsWith('<'))
        return true;
    if (line.startsWith('|'))
        return true;
    if (line.startsWith('---') || line.startsWith('==='))
        return true;
    if (line.startsWith('```') || line.startsWith('~~~'))
        return true;
    if (line.startsWith('%%'))
        return true;
    if (/^title\s/i.test(line))
        return true;
    if (EMOJI_BANNER_CHARS.some((char) => line.startsWith(char)))
        return true;
    const labelSource = line.replace(/^\*+/, '').replace(/^\*\*/, '').replace(/^_+/, '').trim();
    for (const prefix of METADATA_LINE_PREFIXES) {
        const lower = labelSource.toLowerCase();
        const prefixLower = prefix.toLowerCase();
        if (lower.startsWith(`${prefixLower}:`) ||
            lower.startsWith(`${prefixLower} :`) ||
            lower.startsWith(`${prefixLower}**:`) ||
            lower.startsWith(`${prefixLower}*:`)) {
            return true;
        }
    }
    if (/^[-*_=~.]{3,}$/.test(line))
        return true;
    if (isLocalizedBannerRow(line))
        return true;
    return false;
}
/**
 * Language-agnostic banner-row detector. Stage-B artefacts open with a
 * metadata banner of the shape
 *   `**Date:** 2026-05-15 | **Type:** Breaking | **Run:** breaking-run-001`
 * and its localized siblings — notably Japanese / Chinese / Korean briefs
 * which place the full-width colon `：` **inside** the bold span
 * (`**日付：**`) rather than after it. The `METADATA_LINE_PREFIXES` table
 * only covers the English vocabulary; this helper catches the structural
 * shape directly: a line that starts with `**`, contains at least one
 * `|` separator, and carries two-or-more bold key markers that end with
 * — or are followed by — an ASCII colon `:` or full-width colon `：`.
 * Banner rows look identical in every language we publish, so detecting
 * them here keeps localized briefs from leaking their first banner line
 * into the `<meta description>`.
 *
 * @param line - Trimmed source line
 * @returns `true` when the line is a banner row in any locale
 */
function isLocalizedBannerRow(line) {
    if (!line.startsWith('**'))
        return false;
    if (!line.includes('|'))
        return false;
    const inside = (line.match(/\*\*[^*]+[:：]\s*\*\*/g) ?? []).length;
    const after = (line.match(/\*\*[^*]+\*\*\s*[:：]/g) ?? []).length;
    return inside + after >= 2;
}
/**
 * Strip a leading all-caps prose label (e.g. `SITUATION:`, `KEY MOTION:`,
 * `BLUF:`, `BOTTOM LINE:`, `TIER-1:`) from a prose line. These labels
 * are common in BLUF-style editorial writing — they survive
 * {@link stripInlineMarkdown} (which strips the `**bold**` wrapper but
 * keeps the literal text) and would otherwise leak into the SEO
 * description as a confusing all-caps shout.
 *
 * Matches up to 4 hyphenated all-caps tokens, optionally followed by a
 * digit suffix (`TIER-1`), terminating at a colon. Returns the original
 * line when no opener is present.
 *
 * @param line - Plain prose line (post-{@link stripInlineMarkdown})
 * @returns Line with the all-caps opener removed
 */
export function stripLeadingProseLabel(line) {
    const colonIdx = line.indexOf(': ');
    if (colonIdx < 2 || colonIdx > 80)
        return line;
    const label = line.slice(0, colonIdx);
    const rest = line.slice(colonIdx + 2).trim();
    if (rest.length < 20)
        return line;
    if (!/^[A-Z][A-Z0-9 -]{1,79}$/.test(label))
        return line;
    if (label.length < 3)
        return line;
    return rest;
}
/**
 * Strip a leading `**Label:**` / `**Label：**` prefix from a Markdown
 * BLUF line, in any of the 14 publishing languages. Translated
 * executive briefs open the `## FOR IMMEDIATE ACTION` section with
 * patterns such as `**Issue:** …`, `**Fråga:** …`, `**Asunto:** …`,
 * `**主題:** …`, `**الموضوع:** …`, `**Thema:** …`, `**Sujet :** …` —
 * without this stripper the localized label leaked into
 * `<meta description>` for every non-English locale (the English
 * `**Issue:**` line is already filtered by `METADATA_LINE_PREFIXES`).
 *
 * The matcher is *structural*, not vocabulary-driven: it accepts up to
 * 5 word/glyph tokens (letters, marks, digits, spaces, hyphens),
 * followed by either an ASCII colon `:` or full-width colon `：`,
 * followed by `**`, followed by whitespace. Returns the line verbatim
 * when no qualifying opener is present so it is safe to apply
 * unconditionally.
 *
 * @param raw - Raw Markdown line (still carrying `**…**` decorations)
 * @returns Line with the leading `**Label:**` prefix removed, or the
 * original input when no such prefix exists
 */
export function stripLeadingBoldLabel(raw) {
    // Allowed label characters: any Unicode letter, mark, digit, space, hyphen.
    // 1–5 tokens (≤ 40 chars total) to avoid swallowing long inline-bold prose.
    // Both `**Label:**` (colon inside the bold span) and `**Label**:` are
    // observed in translations — match both shapes.
    const pattern = /^\*\*([\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} -]{0,38})[:：]\*\*\s+|^\*\*([\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} -]{0,38})\*\*\s*[:：]\s+/u;
    const match = pattern.exec(raw);
    if (!match)
        return raw;
    return raw.slice(match[0].length);
}
/**
 * Strip inline Markdown decorations so we can use the remaining text as
 * plain-text meta-tag content. Removes link syntax, emphasis, inline code
 * backticks, and HTML-entity fragments that the Markdown source sometimes
 * smuggles in. Keeps the visible text readable.
 *
 * @param raw - Trimmed Markdown line
 * @returns Plain-text variant
 */
export function stripInlineMarkdown(raw) {
    return raw
        .replace(/!\[([^\]\n]{0,500})\]\(([^)\n]{0,500})\)/g, '$1')
        .replace(/\[([^\]\n]{1,500})\]\(([^)\n]{0,500})\)/g, '$1')
        .replace(/`([^`\n]{1,500})`/g, '$1')
        .replace(/\*\*([^*\n]{1,500})\*\*/g, '$1')
        .replace(/__([^_\n]{1,500})__/g, '$1')
        .replace(/\*([^*\n]{1,500})\*/g, '$1')
        .replace(/_([^_\n]{1,500})_/g, '$1')
        .replace(/~~([^~\n]{1,500})~~/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
}
// ────────────────────────────────────────────────────────────────────────
// Truncation helpers
// ────────────────────────────────────────────────────────────────────────
/**
 * Repeatedly strip trailing stop-words (separated by a single space) and
 * trailing punctuation (including any pre-existing ellipsis). Implemented
 * imperatively to avoid super-linear regex backtracking on the
 * `(?:\s+stop-word)+$` pattern flagged by `security/detect-unsafe-regex`.
 *
 * @param input - Pre-clipped string to clean up
 * @returns Cleaned string with no trailing stop-words or punctuation
 */
function stripTrailingStopWordsAndPunctuation(input) {
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
    const cut = text.slice(0, DESCRIPTION_MAX_LENGTH - 1);
    // Prefer the last full sentence terminator within the cut so we don't
    // end on a dangling determiner ("…year. The"). Period/!/? followed by
    // a space marks a clean boundary. Only honour the boundary when it
    // sits past the soft minimum so we keep enough body text to be useful.
    const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    if (sentenceEnd >= DESCRIPTION_MIN_LENGTH) {
        return cut.slice(0, sentenceEnd + 1).replace(/\s+$/, '');
    }
    const lastSpace = cut.lastIndexOf(' ');
    let safe = lastSpace > DESCRIPTION_MAX_LENGTH - 60 ? cut.slice(0, lastSpace) : cut;
    // Drop dangling stop-words and trailing punctuation/ellipsis so we
    // never emit broken copy ("…year. The" → "…year.") or double-ellipsis
    // ("The……") when the upstream input already carried an ellipsis.
    safe = stripTrailingStopWordsAndPunctuation(safe);
    return `${safe}…`;
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
    const cut = trimmed.slice(0, EXTENDED_DESCRIPTION_MAX_LENGTH - 1);
    const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    if (sentenceEnd >= EXTENDED_DESCRIPTION_MIN_LENGTH) {
        return cut.slice(0, sentenceEnd + 1).replace(/\s+$/, '');
    }
    const lastSpace = cut.lastIndexOf(' ');
    let safe = lastSpace > EXTENDED_DESCRIPTION_MAX_LENGTH - 60 ? cut.slice(0, lastSpace) : cut;
    safe = stripTrailingStopWordsAndPunctuation(safe);
    return `${safe}…`;
}
/**
 * Clamp a title to `TITLE_MAX_LENGTH` characters in the same
 * word-boundary-preserving fashion as {@link truncateDescription}.
 *
 * @param text - Raw title text
 * @returns Truncated title with trailing ellipsis when clipped
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
    const cut = text.slice(0, TITLE_MAX_LENGTH - 1);
    const lastSpace = cut.lastIndexOf(' ');
    let safe = lastSpace > TITLE_MAX_LENGTH - 40 ? cut.slice(0, lastSpace) : cut;
    safe = stripTrailingStopWordsAndPunctuation(safe);
    return `${safe}…`;
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
 * acceptable terminator exists in the window, returns the entire
 * input unchanged so {@link truncateTitle} can handle clause-boundary
 * truncation downstream.
 *
 * This produces journalistically clean titles even for the
 * propositions / committee-reports cases where the BLUF paragraph
 * opens with a single long sentence that exceeds 140 chars —
 * `truncateTitle` then breaks on a clause boundary, and the result is
 * still grammatical because the input was a sentence prefix rather
 * than an arbitrary paragraph slice.
 *
 * @param paragraph - Prose paragraph (post-{@link stripInlineMarkdown})
 * @returns First sentence, or the original paragraph when none can be
 *   identified within the soft-min window
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
    return trimmed;
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
//# sourceMappingURL=text-utils.js.map