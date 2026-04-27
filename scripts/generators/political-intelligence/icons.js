// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/PoliticalIntelligence/Icons
 * @description Heuristic emoji icon picking for political-intelligence
 * documents and daily analysis runs.
 *
 * The icons are chosen to visually differentiate the most common
 * artifact types (SWOT, PESTLE, threat matrices, coalition dynamics,
 * etc.) without depending on a heavy icon library. Rules are evaluated
 * in declaration order, so more-specific matches must come before more-
 * general ones (e.g. `intelligence-brief` before `intelligence`).
 *
 * Lifted out of `political-intelligence.ts` so the icon-picking rules
 * can be unit-tested in isolation and so future renderers (e.g.
 * `news-indexes`, sitemap HTML) can reuse them without pulling in the
 * 1500-LOC PI module.
 */
/** Ordered keyword → icon rules for analysis documents. */
const DOCUMENT_ICON_RULES = [
    [['readme'], '📘'],
    [['swot'], '🧭'],
    [['pestle'], '🌍'],
    [['stride'], '🛡️'],
    [['threat'], '⚠️'],
    [['risk'], '📊'],
    [['coalition'], '🤝'],
    [['stakeholder'], '👥'],
    [['actor'], '👤'],
    [['impact'], '💥'],
    [['scenario', 'forecast', 'outlook', 'wildcard', 'blackswan'], '🔮'],
    [['economic', 'imf', 'worldbank', 'fiscal', 'monetary'], '💶'],
    [['trade', 'tariff'], '🛳️'],
    [['timeline', 'historical', 'parallel'], '🕰️'],
    [['methodology', 'guide', 'style'], '🧭'],
    [['classification'], '🏷️'],
    [['intelligence-brief', 'brief'], '🗞️'],
    [['intelligence'], '🔍'],
    [['network'], '🕸️'],
    [['velocity'], '⚡'],
    [['productivity', 'pipeline', 'workflow-audit', 'workflow'], '🔧'],
    [['legislative', 'legislation'], '⚖️'],
    [['motion'], '🗳️'],
    [['proposition', 'proposal'], '📜'],
    [['committee'], '🏛️'],
    [['vote', 'voting'], '🗳️'],
    [['plenary', 'session', 'meeting'], '🏟️'],
    [['procedure'], '📂'],
    [['event', 'schedule', 'agenda'], '📅'],
    [['mep', 'parliamentarian'], '🧑\u200d💼'],
    [['consequence'], '🌿'],
    [['disruption'], '🌀'],
    [['reflection'], '🪞'],
    [['reliability', 'audit', 'quality'], '✅'],
    [['attack-surface', 'attack'], '🛡️'],
    [['diagnostic', 'outage'], '🚑'],
    [['forces', 'influence'], '⚔️'],
    [['osint', 'tradecraft'], '🕵️'],
    [['catalog', 'index'], '📚'],
    [['capital'], '💼'],
    [['synthesis', 'cross-daily', 'summary'], '🧩'],
    [['cross-session', 'cross-run'], '🔁'],
    [['sentiment'], '💬'],
    [['baseline', 'precomputed'], '📐'],
    [['significance'], '🎯'],
    [['devil', 'advocate'], '😈'],
    [['media', 'framing'], '📺'],
    [['reform', 'anti-corruption'], '🧹'],
    [['recess'], '🌴'],
    [['per-file', 'per-artifact'], '🗂️'],
    [['adopted'], '📜'],
    [['document'], '📄'],
    [['artifact'], '📋'],
];
/** Default icon used by {@link pickDocumentIcon} when no rule matches */
export const DEFAULT_DOCUMENT_ICON = '📄';
/**
 * Heuristically pick an icon for an analysis document/slug. The icons
 * are chosen to visually differentiate the most common artifact types
 * without depending on a heavy icon library.
 *
 * Rules are evaluated in declaration order — first match wins. To add
 * a new rule, add a `[hints, icon]` tuple at the **most-specific
 * position**: e.g. `intelligence-brief` is matched before
 * `intelligence` so the brief-specific newspaper icon (🗞️) takes
 * precedence over the generic magnifying-glass (🔍).
 *
 * @param stem - File/directory name stem (will be lowercased internally)
 * @returns A single emoji character (or grapheme cluster for ZWJ-joined emoji)
 */
export function pickDocumentIcon(stem) {
    const s = stem.toLowerCase();
    for (const [hints, icon] of DOCUMENT_ICON_RULES) {
        if (hints.some((h) => s.includes(h))) {
            return icon;
        }
    }
    return DEFAULT_DOCUMENT_ICON;
}
/** Ordered slug-prefix → icon rules for daily runs. */
const RUN_ICON_RULES = [
    [['breaking'], '🚨'],
    [['week-ahead', 'month-ahead', 'year-ahead'], '🔭'],
    [['week-in-review', 'weekly-review'], '📅'],
    [['month-in-review', 'monthly-review'], '🗓️'],
    [['year-in-review'], '📜'],
    [['motions'], '🗳️'],
    [['propositions'], '⚖️'],
    [['committee-reports', 'committee'], '🏛️'],
    [['translate'], '🌐'],
    [['deep'], '🔬'],
];
/** Default icon used by {@link pickRunIcon} when no rule matches */
export const DEFAULT_RUN_ICON = '📂';
/**
 * Pick an icon for a daily run based on its slug prefix.
 *
 * Unlike {@link pickDocumentIcon}, this matches by `startsWith` (not
 * `includes`) — runs are named with a canonical prefix per article
 * type, so prefix-matching is precise enough and avoids false positives
 * from words appearing inside run-id suffixes.
 *
 * @param slug - Run slug such as `breaking-run190` or `motions-run46`
 * @returns A single emoji character (or grapheme cluster for ZWJ-joined emoji)
 */
export function pickRunIcon(slug) {
    const s = slug.toLowerCase();
    for (const [prefixes, icon] of RUN_ICON_RULES) {
        if (prefixes.some((p) => s.startsWith(p))) {
            return icon;
        }
    }
    return DEFAULT_RUN_ICON;
}
//# sourceMappingURL=icons.js.map