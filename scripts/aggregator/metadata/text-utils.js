// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/TextUtils
 * @description Pure text / Markdown classification + label-stripping
 * helpers used by the metadata resolver chain. Constants live in
 * `text-utils-constants.ts`; byte-budget truncators and sentence-
 * extraction live in `text-truncate.ts`. This file re-exports the
 * full public surface so existing call-sites keep working.
 *
 * Bounded-context rules:
 * - **No upward imports** — pure helpers, no I/O, no globals.
 * - **Deterministic** — same input always produces same output.
 * - **Locale-agnostic** — every helper works on raw Markdown / prose
 *   in any of the 14 publishing languages. Banner-row detection is
 *   driven by structural shape (double-bold + pipe-separator), not by
 *   a hard-coded English vocabulary.
 */
export { ABBREVIATION_PREFIXES, DESCRIPTION_MAX_LENGTH, DESCRIPTION_MIN_LENGTH, EMOJI_BANNER_CHARS, ENRICHMENT_TRIGGER_LENGTH, EXTENDED_DESCRIPTION_MAX_LENGTH, EXTENDED_DESCRIPTION_MIN_LENGTH, HEADLINE_CLAUSE_BOUNDARIES, HEADLINE_SOFT_MIN, METADATA_LINE_PREFIXES, TITLE_MAX_LENGTH, TRAILING_PUNCT, TRAILING_STOP_WORDS, } from './text-utils-constants.js';
export { extractFirstSentence, stripTrailingStopWordsAndPunctuation, truncateDescription, truncateExtendedDescription, truncateTitle, } from './text-truncate.js';
import { EMOJI_BANNER_CHARS, METADATA_LINE_PREFIXES, } from './text-utils-constants.js';
const STRUCTURAL_LINE_PREFIXES = ['#', '>', '<', '|'];
const FENCE_LINE_PREFIXES = ['```', '~~~'];
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
    return DESCRIPTION_SKIP_CHECKS.some((check) => check(line));
}
const DESCRIPTION_SKIP_CHECKS = [
    (line) => startsWithAny(line, STRUCTURAL_LINE_PREFIXES),
    (line) => line.startsWith('---') || line.startsWith('==='),
    (line) => startsWithAny(line, FENCE_LINE_PREFIXES),
    (line) => line.startsWith('%%'),
    (line) => /^title\s/i.test(line),
    (line) => EMOJI_BANNER_CHARS.some((char) => line.startsWith(char)),
    startsWithSeparatorFragment,
    isStructuralListLeader,
    startsWithContinuationConjunction,
    hasTrailingEllipsis,
    isPublishedBanner,
    startsWithMetadataLabel,
    (line) => /^[-*_=~.]{3,}$/.test(line),
    isLocalizedBannerRow,
    isPlainPipeBannerRow,
];
function startsWithAny(line, prefixes) {
    return prefixes.some((prefix) => line.startsWith(prefix));
}
function startsWithSeparatorFragment(line) {
    return /^[:;,—–-]\s/u.test(line);
}
function isStructuralListLeader(line) {
    return /^\(?[0-9]{1,2}[.):]\s/u.test(line) || /^\(?[a-z][.)]\s/iu.test(line);
}
function startsWithContinuationConjunction(line) {
    return /^(that|which|while|whereas|and|but|for|yet|so|nor|or)\s/iu.test(line);
}
function hasTrailingEllipsis(line) {
    return line.endsWith('…') || /\.{3,}$/u.test(line);
}
function isPublishedBanner(line) {
    return /^published\s+\d{4}-\d{2}-\d{2}\b/iu.test(line);
}
function startsWithMetadataLabel(line) {
    const labelSource = line.replace(/^\*+/, '').replace(/^\*\*/, '').replace(/^_+/, '').trim();
    const lower = labelSource.toLowerCase();
    return METADATA_LINE_PREFIXES.some((prefix) => {
        const prefixLower = prefix.toLowerCase();
        return (lower.startsWith(`${prefixLower}:`) ||
            lower.startsWith(`${prefixLower} :`) ||
            lower.startsWith(`${prefixLower}**:`) ||
            lower.startsWith(`${prefixLower}*:`));
    });
}
/**
 * Detect a plain (non-bold) pipe-delimited banner row of the shape
 * `Tag: Value | Tag: Value | Tag: Value`. Matches three-or-more
 * `Word: …` segments separated by ` | ` so legitimate prose containing
 * a single colon (`The Commission's view: …`) is preserved.
 *
 * @param line - Trimmed source line
 * @returns `true` when the line is a plain pipe-banner row
 */
function isPlainPipeBannerRow(line) {
    if (!line.includes('|'))
        return false;
    const segments = line.split('|').map((s) => s.trim());
    if (segments.length < 3)
        return false;
    let labeledSegments = 0;
    for (const seg of segments) {
        if (/^[A-Z][\p{L}\p{M}\p{N}\- ]{1,30}[:：]\s+\S/u.test(seg))
            labeledSegments += 1;
    }
    return labeledSegments >= 2;
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
    if (!match) {
        // Defense in depth: even when no `**Label**` decoration is present,
        // strip a residual orphan separator at the line start. Upstream
        // strippers (e.g. {@link stripInlineMarkdown} applied after a
        // partial bold-label removal) can leave `: rest of sentence…`
        // shapes; we never want those leading punctuation glyphs to survive
        // into the description or title.
        return raw.replace(/^[:;—–-]\s+/u, '');
    }
    // After the bold-label match, also strip any *additional* residual
    // separator that may follow (rare, but observed when authors write
    // `**Issue**: : `).
    return raw.slice(match[0].length).replace(/^[:;—–-]\s+/u, '');
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
//# sourceMappingURL=text-utils.js.map