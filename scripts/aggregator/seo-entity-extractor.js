// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/SeoEntityExtractor
 * @description Extract real-world organizations named in an analysis run's
 * `intelligence/stakeholder-map.md` and `extended/media-framing-analysis.md`
 * artifacts for emission as JSON-LD `mentions` entries on every language
 * variant of the rendered article.
 *
 * The same English-extracted list is reused across all 14 language variants
 * because the entities are language-independent proper nouns (political
 * groups, EU institutions, media outlets) — search engines and AI overviews
 * benefit from consistent entity grounding regardless of which language
 * the surrounding prose is in.
 */
import fs from 'fs';
import path from 'path';
/**
 * Maximum number of mentions emitted into the JSON-LD `mentions` array.
 * Schema.org accepts arbitrarily many entries, but indexers commonly cap
 * structured-data entity lists at ~30 — staying under this avoids
 * truncation and keeps the rendered JSON-LD blob compact.
 */
const MAX_MENTIONS = 30;
/**
 * Minimum length for an extracted entity name. Below this, the candidate
 * is almost certainly a fragment (single capital letter, lone particle)
 * rather than a real organization.
 */
const MIN_ENTITY_LENGTH = 2;
/**
 * Maximum length for an extracted entity name. Anything longer is almost
 * certainly a misparsed sentence fragment.
 */
const MAX_ENTITY_LENGTH = 80;
/**
 * Read a UTF-8 file relative to `runDir`. Returns `null` when the path is
 * missing or unreadable — the extractor treats absent intelligence
 * artifacts as a soft signal (no mentions to emit) rather than an error.
 *
 * @param runDir - Absolute path to the analysis run directory
 * @param relPath - Forward-slash path under `runDir`
 * @returns File contents or `null`
 */
function readRunFile(runDir, relPath) {
    const abs = path.join(runDir, relPath);
    try {
        if (!fs.existsSync(abs))
            return null;
        return fs.readFileSync(abs, 'utf8');
    }
    catch {
        return null;
    }
}
/**
 * Extract organization names from `intelligence/stakeholder-map.md`'s H3
 * headings. Each tier-1/tier-2 stakeholder appears as a heading shaped like:
 *   `### EPP — Manfred Weber / 185 MEPs (25.73%)`
 *   `### European Commission — Ursula von der Leyen (EPP)`
 *   `### Tech Industry (Big Tech Gatekeepers)`
 *
 * The entity name is everything before the first em-dash, en-dash, slash,
 * parenthesis, or colon — whichever comes first — trimmed and de-duplicated
 * with case-insensitive equality. "Risk N: …" headings are filtered out
 * because they describe risk scenarios rather than organizations.
 *
 * @param markdown - Raw stakeholder-map.md contents
 * @returns Ordered, de-duplicated stakeholder names
 */
export function extractStakeholderNames(markdown) {
    const lines = markdown.split('\n');
    const names = [];
    const seen = new Set();
    for (const rawLine of lines) {
        if (!rawLine.startsWith('### '))
            continue;
        const headingText = rawLine.slice(4).trim();
        if (!headingText)
            continue;
        // Skip risk-scenario headings: `### Risk N: …` / `### Risk 1: PfE Internal Split…`
        if (/^risk\s+\d+\s*:/i.test(headingText))
            continue;
        // Split on the first em-dash, en-dash, slash, opening paren, or colon.
        const splitIdx = findFirstSplitChar(headingText);
        const candidate = splitIdx >= 0 ? headingText.slice(0, splitIdx) : headingText;
        const name = candidate.trim().replace(/\*+$/, '').trim();
        if (!isValidEntityName(name))
            continue;
        const key = name.toLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        names.push(name);
    }
    return names;
}
/**
 * Find the index of the first stakeholder-heading separator character.
 * Uses indexOf in a loop instead of a regex to satisfy CodeQL's
 * regex-injection / catastrophic-backtracking lints (cf.
 * `replaceFirstStringIn` in `html/localize-body.ts`).
 *
 * @param text - Heading text (without the leading `### `)
 * @returns Index of the first separator, or `-1` if none found
 */
function findFirstSplitChar(text) {
    const separators = ['—', '–', '/', '(', ':'];
    let best = -1;
    for (const sep of separators) {
        const idx = text.indexOf(sep);
        if (idx >= 0 && (best < 0 || idx < best))
            best = idx;
    }
    return best;
}
/**
 * Extract media-outlet names from `extended/media-framing-analysis.md`.
 * Editorial convention is a series of bold "framing buckets":
 *   `**Centre-Left Media (Le Monde, Der Spiegel, Guardian EU section):**`
 *   `**Tech-Beat Media (TechCrunch EU, The Verge, Politico Tech):**`
 *
 * This function pulls every comma-separated outlet from each parenthetical
 * list, trims trailing colons / asterisks, and de-duplicates with
 * case-insensitive equality.
 *
 * @param markdown - Raw media-framing-analysis.md contents
 * @returns Ordered, de-duplicated media-outlet names
 */
export function extractMediaOutletNames(markdown) {
    const lines = markdown.split('\n');
    const names = [];
    const seen = new Set();
    for (const rawLine of lines) {
        // Look for bold prefix followed by parenthesised outlet list.
        // Pattern: `**…Media (X, Y, Z):**` — anchor on `Media (` to avoid
        // matching unrelated parentheticals in surrounding prose.
        const mediaIdx = rawLine.indexOf('Media (');
        if (mediaIdx < 0)
            continue;
        const openParen = rawLine.indexOf('(', mediaIdx);
        if (openParen < 0)
            continue;
        const closeParen = rawLine.indexOf(')', openParen);
        if (closeParen < 0)
            continue;
        const inner = rawLine.slice(openParen + 1, closeParen);
        for (const piece of inner.split(',')) {
            const candidate = piece.trim().replace(/\*+$/, '').trim();
            if (!isValidEntityName(candidate))
                continue;
            const key = candidate.toLowerCase();
            if (seen.has(key))
                continue;
            seen.add(key);
            names.push(candidate);
        }
    }
    return names;
}
/**
 * Guard for extracted-entity sanity: rejects empty strings, single
 * characters, and pathological multi-sentence captures.
 *
 * @param name - Candidate entity name
 * @returns `true` when the name is a plausible organization label
 */
function isValidEntityName(name) {
    if (!name)
        return false;
    if (name.length < MIN_ENTITY_LENGTH)
        return false;
    if (name.length > MAX_ENTITY_LENGTH)
        return false;
    // Reject candidates that are just punctuation / decoration.
    if (!/[A-Za-z]/.test(name))
        return false;
    return true;
}
/**
 * Collect SEO `mentions` entities for an analysis run by combining
 * stakeholder names and media-outlet names from the run's intelligence
 * and extended folders. Returns a single deduplicated, length-capped
 * list ready to feed into JSON-LD `mentions`.
 *
 * Stakeholders are listed first (high-signal political-group / institution
 * entities), media outlets second. The combined list is truncated to
 * {@link MAX_MENTIONS} entries.
 *
 * @param runDir - Absolute analysis run directory path
 * @returns Ordered, de-duplicated mentions list (may be empty)
 */
export function extractRunMentions(runDir) {
    const stakeholderMd = readRunFile(runDir, 'intelligence/stakeholder-map.md');
    const mediaMd = readRunFile(runDir, 'extended/media-framing-analysis.md');
    const stakeholders = stakeholderMd ? extractStakeholderNames(stakeholderMd) : [];
    const mediaOutlets = mediaMd ? extractMediaOutletNames(mediaMd) : [];
    const merged = [];
    const seen = new Set();
    for (const name of [...stakeholders, ...mediaOutlets]) {
        const key = name.toLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        merged.push(name);
        if (merged.length >= MAX_MENTIONS)
            break;
    }
    return merged;
}
//# sourceMappingURL=seo-entity-extractor.js.map