// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/ArtifactCategoryHeading
 * @description Artifact-category and editorial-lede heading helpers
 * extracted from {@link ./heading-rules.ts}. Owns:
 *
 *   - {@link EDITORIAL_LEDE_HEADINGS} — whitelist of `##` headings that
 *     carry the journalist's lede paragraph.
 *   - {@link ARTIFACT_CATEGORY_PREFIXES} — structural-label H1 prefixes
 *     that must not leak into the article `<title>`.
 *   - {@link normaliseHeadingText} / {@link isLedeHeadingMatch} — the
 *     lede whitelist matcher used by `lede-extractor.ts`.
 *   - {@link isArtifactCategoryHeading} / {@link stripArtifactCategoryAffix}
 *     — predicates used by the resolver's generic-heading classifier.
 *
 * Pure leaf module. Re-exported through {@link ./heading-rules.ts} for
 * back-compat with existing call sites. Split out of `heading-rules.ts`
 * in May 2026 to keep both files under the 600-raw-line drift-guard.
 */
import { stripInlineMarkdown } from './text-utils.js';
/**
 * Headings inside an editorial artefact that carry the journalist's lede
 * paragraph (a one-paragraph summary of "what happened, why it matters").
 * When the resolver sees one of these as a `## …` heading inside the
 * editorial artefact, it prefers the first prose paragraph that follows
 * it as the description (and as a title fallback) over a generic line
 * walk. Names are matched case-insensitively against the heading text
 * (after stripping inline Markdown).
 */
export const EDITORIAL_LEDE_HEADINGS = [
    '60-second read',
    '60 second read',
    'sixty-second read',
    'lede',
    'lead',
    'tl;dr',
    'tldr',
    'synopsis',
    'in brief',
    'at a glance',
    'bottom line',
    'bluf',
    'bluf — bottom line up front',
    'bottom line up front',
    'executive summary',
    'executive briefing',
    'master narrative',
    'overview',
    'headline judgement',
    'headline judgment',
    'key findings',
    'key judgements',
    'key judgments',
    'situation summary',
    'situation report',
    'situation update',
    // ── Editorial-brief specific headings introduced in the May-2026
    //    executive-brief style guide. These sections carry the most
    //    publishable journalism in the brief and are the user-visible
    //    source of the title / description after this refactor.
    'reader briefing',
    'strategic intelligence summary',
    'strategic assessment',
    'top-line summary',
    'top line summary',
    'headline intelligence',
    'key intelligence judgment',
    'key intelligence judgement',
    'key intelligence judgments',
    'key intelligence judgements',
    'key intelligence judgements summary',
    'key intelligence judgments summary',
    'intelligence assessment',
    'intelligence assessment summary',
    'priority intelligence items',
    'lead intelligence assessment',
    // ── May-2026 executive-brief "FOR IMMEDIATE ACTION" pattern. Every
    //    14-language brief in `analysis/daily/**/propositions/` opens
    //    the post-banner body with this H2 (translated per locale), and
    //    its first row is the BLUF (`**Issue:** …` / `**Fråga:** …` /
    //    `**主題:** …` / `**الموضوع:** …` …). The English header is
    //    whitelisted here so the extractor catches it directly; the 13
    //    translated equivalents fall through to the generic strong-prose
    //    walker, which now strips the localized bold label via
    //    {@link stripLeadingBoldLabel} so the same BLUF copy lands in
    //    `<meta description>` regardless of locale.
    'for immediate action',
];
/**
 * Artifact-category prefixes that appear inside editorial-artefact H1s as
 * a structural label rather than an editorial headline (e.g. `# Synthesis
 * Summary — Week in Review (3 Apr – 1 May 2026)`). When a candidate H1
 * starts with one of these prefixes followed by a separator (em/en dash,
 * hyphen, or colon), the resolver treats it as **generic** so it does
 * not leak into the article `<title>`. Compared lower-case, with leading
 * punctuation stripped.
 */
export const ARTIFACT_CATEGORY_PREFIXES = [
    'actor mapping',
    'analytical quality',
    'breaking news analysis',
    'coalition dynamics',
    'commission wp alignment',
    'committee activity report',
    'cross run continuity',
    'data availability assessment',
    'deep analysis',
    'economic context',
    'executive brief',
    'executive briefing',
    'executive intelligence brief',
    'executive intelligence briefing',
    'executive summary',
    'forward indicators',
    'historical baseline',
    'impact matrix',
    'intelligence assessment',
    'intelligence briefing',
    'intelligence synthesis summary',
    'legislative output analysis',
    'legislative pipeline analysis',
    'legislative pipeline forecast',
    'mandate fulfilment scorecard',
    'master intelligence synthesis',
    'mcp reliability audit',
    'methodology reflection',
    'monthly outlook',
    'motions analysis',
    'parliamentary calendar projection',
    'pestle analysis',
    'political intelligence brief',
    'political risk',
    'political threat landscape',
    'presidency trio context',
    'propositions analysis',
    'quantitative swot',
    'risk assessment',
    'risk matrix',
    'risk scoring',
    'scenario forecast',
    'seat projection',
    'significance classification',
    'situation report',
    'situation summary',
    'stakeholder analysis',
    'stakeholder impact',
    'stakeholder map',
    'swot analysis',
    'synthesis summary',
    'threat assessment',
    'threat model',
    'voting patterns',
    'weekly outlook',
    'wildcards blackswans',
];
/**
 * Match a single calendar month name (English) with optional `-uary` /
 * `-uary` suffix, used as a building block for the date-stamp parenthetical
 * detector. Split out of the parent regex so the alternation never appears
 * inside an optional / repeated subgroup (which would trigger
 * security/detect-unsafe-regex on the wider pattern).
 */
const MONTH_NAME_SOURCE = 'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?';
/**
 * Single-date stamp inside a trailing parenthetical — ISO date,
 * `<day> <Month> [<year>]`, `<Month> <year>`, or `Week of <ISO>`.
 * Each alternative is a fixed-shape literal sequence so the resulting
 * pattern carries no nested optional/repeated alternation.
 */
const TRAILING_DATE_PAREN_RE = new RegExp('\\s*\\(\\s*(?:' +
    [
        '\\d{4}-\\d{2}-\\d{2}',
        `\\d{1,2}\\s+(?:${MONTH_NAME_SOURCE})\\s+\\d{4}`,
        `\\d{1,2}\\s+(?:${MONTH_NAME_SOURCE})`,
        `(?:${MONTH_NAME_SOURCE})\\s+\\d{4}`,
        'Week\\s+of\\s+\\d{4}-\\d{2}-\\d{2}',
    ].join('|') +
    ')\\s*\\)\\s*$', 'iu');
/**
 * Public-only export used by the resolver to strip a trailing
 * single-date parenthetical from an artefact-category core, retaining
 * substantive parentheticals such as `(May 2026 – May 2027)` or
 * `(2024-2029 Mandate, Mid-Term Review)`. Returns the empty string when
 * the cleaned core falls below the 5-character editorial floor.
 *
 * @param core - Heading with the category label already stripped
 * @returns Cleaned editorial-topic core, or empty string when too short
 */
function cleanupAffixCore(core) {
    // Only strip parenthetical content that is a pure date stamp
    // (e.g. `(2026-05-08)`, `(May 2026)`, `(8 May)`). Substantive
    // parentheticals such as `(May 2026 – May 2027)`, `(2024-2029
    // Mandate, Mid-Term Review)`, or `(2026 → 2031)` carry editorial
    // context and stay in the title.
    const withoutDateParen = core.replace(TRAILING_DATE_PAREN_RE, '').trim();
    const withoutTrailingPunct = withoutDateParen.replace(/[—–:;,.\s-]+$/u, '').trim();
    if (withoutTrailingPunct.length < 5)
        return '';
    return withoutTrailingPunct;
}
/**
 * Lower-case, decoration-stripped form used by the artifact-category
 * matchers. Strips inline Markdown, leading non-alphanumeric runs (emoji,
 * decoration), and collapses whitespace to a single space.
 *
 * @param raw - Raw heading text
 * @returns Lower-case normalised form
 */
function normaliseCategoryHeading(raw) {
    return stripInlineMarkdown(raw)
        .trim()
        .toLowerCase()
        .replace(/^[^a-z0-9]+/, '')
        .replace(/\s+/g, ' ');
}
/**
 * Normalise a Markdown heading's text for comparison against the
 * editorial-lede heading whitelist. Strips inline Markdown decorations
 * (`*`, `_`, `` ` ``, `#`), then strips any leading non-alphanumeric
 * characters (emoji, punctuation, spaces) so a heading like
 * `🎯 Headline Judgement` compares equal to `headline judgement`.
 *
 * @param raw - Raw heading text (no leading hashes)
 * @returns Lower-cased, decoration-stripped heading text
 */
export function normaliseHeadingText(raw) {
    return stripInlineMarkdown(raw)
        .replace(/[*_`#]+/g, '')
        .replace(/^[^A-Za-z0-9]+/, '')
        .trim()
        .toLowerCase();
}
/**
 * Word-boundary match against an editorial-lede whitelist entry. Matches
 * when the normalised heading equals the whitelist entry exactly, or when
 * the entry is followed by any non-alphanumeric character — covering
 * localized parenthetical glosses written with ASCII or full-width
 * punctuation (e.g. `bluf (bottom line up front)`, `bluf（結論先出し）`,
 * `bluf — 핵심 결론`, `60-second read — what happened`).
 *
 * @param headingText - Normalised heading text (lower-case, decoration-stripped)
 * @param whitelistEntry - Lower-case whitelist entry from
 *                        {@link EDITORIAL_LEDE_HEADINGS}
 * @returns `true` when `headingText` begins with `whitelistEntry` at a
 *          word boundary
 */
export function isLedeHeadingMatch(headingText, whitelistEntry) {
    if (headingText === whitelistEntry)
        return true;
    if (!headingText.startsWith(whitelistEntry))
        return false;
    const next = headingText.charAt(whitelistEntry.length);
    // Word boundary — anything that is not an ASCII letter/digit is a
    // separator we accept. This works uniformly across ASCII parentheses,
    // CJK full-width brackets `（`, dashes `— – -`, colons `:`, and the
    // ideographic full-width colon `：`.
    return next === '' || !/[a-z0-9]/.test(next);
}
/**
 * Return `true` when an artefact-H1 begins with one of the
 * `ARTIFACT_CATEGORY_PREFIXES` followed by a separator. Such H1s
 * carry the artefact's structural label rather than a journalist's
 * headline (e.g. `# Synthesis Summary — Week in Review (3 Apr – 1 May
 * 2026)`) and must not leak into the article `<title>`.
 *
 * @param heading - Plain-text H1 (after `stripInlineMarkdown`)
 * @returns `true` when the heading is an artefact-category label
 */
export function isArtifactCategoryHeading(heading) {
    const normalized = normaliseCategoryHeading(heading);
    if (normalized === '')
        return false;
    for (const prefix of ARTIFACT_CATEGORY_PREFIXES) {
        if (normalized === prefix)
            return true;
        if (normalized.startsWith(`${prefix} —`) ||
            normalized.startsWith(`${prefix} –`) ||
            normalized.startsWith(`${prefix} -`) ||
            normalized.startsWith(`${prefix}:`)) {
            return true;
        }
        if (normalized.endsWith(` — ${prefix}`) ||
            normalized.endsWith(` – ${prefix}`) ||
            normalized.endsWith(` - ${prefix}`) ||
            normalized.endsWith(`: ${prefix}`)) {
            return true;
        }
    }
    return false;
}
/**
 * Strip a leading or trailing artifact-category label from a heading and
 * return the editorial-topic core. When neither end carries a category
 * label, the heading is returned unchanged. When the category label is
 * the **entire** heading (e.g. `# Executive Brief`) the result is the
 * empty string.
 *
 * Examples:
 * - `Executive Brief — EU Parliament Motions` → `EU Parliament Motions`
 * - `EU Parliament Propositions — Executive Brief` → `EU Parliament Propositions`
 * - `EP10 Term Outlook — Executive Brief` → `EP10 Term Outlook`
 * - `Key Legislative Developments — Deep Analysis (2026-05-08)` → `Key Legislative Developments`
 * - `Synthesis Summary — EP Motions & Adopted Texts` → `EP Motions & Adopted Texts`
 *
 * Trailing parenthesised metadata (`(2026-05-08)`, `(May 2026)`) is also
 * stripped because it functions as a date stamp rather than editorial
 * copy. The returned core is trimmed of whitespace and trailing
 * punctuation.
 *
 * @param heading - Raw heading text (post-{@link stripInlineMarkdown})
 * @returns Editorial-topic core, or empty string when only the category survived
 */
export function stripArtifactCategoryAffix(heading) {
    const trimmed = heading.trim();
    if (trimmed === '')
        return '';
    const sortedPrefixes = [...ARTIFACT_CATEGORY_PREFIXES].sort((a, b) => b.length - a.length);
    const normalized = normaliseCategoryHeading(trimmed);
    const skip = trimmed.length - normalized.length;
    const visible = trimmed.slice(skip < 0 ? 0 : skip);
    // For trailing-prefix detection (e.g. `Topic — Deep Analysis (date)`),
    // we strip ANY trailing parenthetical because both the prefix and its
    // date stamp are noise to remove. For leading-prefix detection (e.g.
    // `Executive Brief — Year Ahead (May 2026 – May 2027)`), we keep the
    // trailing parenthetical so substantive context survives into
    // `cleanupAffixCore`, which only strips pure date stamps.
    const visibleParenStripped = visible.replace(/\s*\([^)]{1,80}\)\s*$/u, '').trim();
    const normalizedVisible = normaliseCategoryHeading(visible);
    const normalizedParenStripped = normaliseCategoryHeading(visibleParenStripped);
    for (const prefix of sortedPrefixes) {
        for (const sep of [' — ', ' – ', ' - ', ': ']) {
            const candidate = `${prefix}${sep}`;
            if (normalizedVisible.startsWith(candidate)) {
                const core = visible.slice(candidate.length).trim();
                return cleanupAffixCore(core);
            }
        }
        for (const sep of [' — ', ' – ', ' - ', ': ']) {
            const candidate = `${sep}${prefix}`;
            if (normalizedParenStripped.endsWith(candidate)) {
                const core = visibleParenStripped.slice(0, visibleParenStripped.length - candidate.length).trim();
                return cleanupAffixCore(core);
            }
        }
        if (normalizedParenStripped === prefix)
            return '';
    }
    return trimmed;
}
//# sourceMappingURL=artifact-category-heading.js.map