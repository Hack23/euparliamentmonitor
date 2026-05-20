// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/ArtifactHighlight
 * @description Editorial-artefact highlight resolver extracted from
 * `article-metadata.ts`. Walks the canonical list of editorial artefacts
 * inside a run directory and returns the best `{headline, summary}`
 * pair — either a non-generic H1, a named priority finding, or a
 * stripped category-affix core — for use as the article `<title>` and
 * `<meta description>`.
 *
 * Pure module — depends only on Node `fs`/`path` plus the leaf metadata
 * helpers (h1-extractor, lede-extractor, heading-rules, text-utils) and
 * the language-core constants for the translated-sibling filter.
 */
import fs from 'fs';
import path from 'path';
import { ALL_LANGUAGES } from '../../constants/language-core.js';
import { extractFirstH1 } from './h1-extractor.js';
import { extractLedeAfterHeading, extractStrongProseLine } from './lede-extractor.js';
import { isGenericHeading, stripArtifactCategoryAffix } from './heading-rules.js';
import { truncateTitle } from './text-utils.js';
/** Ordered list of artefact filenames that typically carry the editorial H1. */
const EDITORIAL_ARTEFACT_CANDIDATES = [
    // `executive-brief.md` is the canonical Riksdagsmonitor-aligned editorial
    // artefact (see `analysis/methodologies/ai-driven-analysis-guide.md`).
    // It always carries the journalist's BLUF and a `## 60-Second Read`
    // paragraph that is the lede — preferring it over `synthesis-summary.md`
    // keeps Stage-B internal vocabulary ("Purpose: This artifact provides …")
    // out of the SEO-critical `<title>` and `<meta description>` surfaces.
    'executive-brief.md',
    'extended/executive-brief.md',
    'intelligence/synthesis-summary.md',
    'intelligence/executive-summary.md',
    'intelligence/intelligence-briefing.md',
    'executive-summary.md',
    'intelligence-briefing.md',
    'synthesis-summary.md',
    'breaking-news-analysis.md',
    'committee-activity-report.md',
    'legislative-pipeline-analysis.md',
    'weekly-outlook.md',
    'monthly-outlook.md',
    'week-in-review.md',
    'month-in-review.md',
    'motions-analysis.md',
    'propositions-analysis.md',
];
/**
 * Attempt to read the first H1 and first prose paragraph from the first
 * existing artefact under `EDITORIAL_ARTEFACT_CANDIDATES`. Returns
 * `null` when no candidate artefact exists.
 *
 * @param runDir - Absolute run directory path
 * @param articleType - Article type slug (used by {@link isGenericHeading})
 * @param date - ISO run date (used by {@link isGenericHeading})
 * @returns `{headline, summary}` where either field may be empty
 */
export function extractArtifactHighlight(runDir, articleType, date) {
    if (!runDir || !fs.existsSync(runDir))
        return null;
    const direct = scanCandidatesForHighlight(runDir, EDITORIAL_ARTEFACT_CANDIDATES, articleType, date);
    if (direct.headline)
        return { headline: direct.headline, summary: direct.summary };
    // Top-level fallback scan — used only when none of the canonical
    // editorial artefacts produced a non-generic H1. We must NOT pick up
    // translated sibling briefs (`executive-brief_<lang>.md`,
    // `synthesis-summary_<lang>.md`, …) here, because their H1s are
    // legitimate localized headlines that the English-only
    // {@link isGenericHeading} detector cannot recognise as boilerplate.
    // Letting them through poisoned the English `<title>` and
    // `<meta description>` for the 2026-05-15 batch with Arabic content
    // from `executive-brief_ar.md`. See {@link isTranslatedSiblingBrief}
    // and the regression test in `test/unit/article-metadata.test.js`.
    const topLevel = safeReaddir(runDir).filter((f) => f.endsWith('.md') && f !== 'manifest.json' && !isTranslatedSiblingBrief(f));
    const fallback = scanCandidatesForHighlight(runDir, topLevel, articleType, date);
    if (fallback.headline)
        return { headline: fallback.headline, summary: fallback.summary };
    const summaryOnly = direct.summary || fallback.summary;
    if (summaryOnly) {
        return { headline: '', summary: summaryOnly };
    }
    return null;
}
/**
 * Filename suffix pattern that identifies a translated sibling brief
 * (e.g. `executive-brief_ar.md`, `synthesis-summary_zh.md`). The
 * `_<lang>` token is matched against {@link ALL_LANGUAGES} so we never
 * exclude a legitimate English artefact whose name happens to end in
 * `_<two-letter-suffix>.md`.
 */
const TRANSLATED_SIBLING_SUFFIX_RE = new RegExp(`_(${ALL_LANGUAGES.join('|')})\\.md$`, 'i');
/**
 * Return `true` when a top-level `.md` filename looks like a translated
 * sibling of a canonical editorial artefact (e.g.
 * `executive-brief_ar.md`). These files must be excluded from the
 * top-level fallback scan in {@link extractArtifactHighlight} because
 * their localized H1s evade the English-only generic-heading detector
 * and would otherwise hijack the English SEO surfaces.
 *
 * @param filename - Run-relative `.md` filename (no path separators)
 * @returns `true` when the file is a translated sibling brief
 */
export function isTranslatedSiblingBrief(filename) {
    return TRANSLATED_SIBLING_SUFFIX_RE.test(filename);
}
/**
 * Walk a list of candidate artefact paths and return the first
 * non-generic headline + summary pair, plus the first usable lede
 * summary seen along the way. Extracted from
 * {@link extractArtifactHighlight} to keep its cognitive complexity
 * within the SonarJS budget.
 *
 * @param runDir - Absolute run directory path
 * @param candidates - Run-relative candidate filenames to probe
 * @param articleType - Article-type slug (used by {@link isGenericHeading})
 * @param date - ISO run date (used by {@link isGenericHeading})
 * @returns `{headline, summary}` where either field may be empty
 */
function scanCandidatesForHighlight(runDir, candidates, articleType, date) {
    let bestSummaryOnly = '';
    for (const rel of candidates) {
        const probe = probeCandidateForHighlight(runDir, rel, articleType, date);
        if (probe.cleanHighlight)
            return probe.cleanHighlight;
        if (probe.strippedHeadline) {
            return { headline: probe.strippedHeadline, summary: probe.summary ?? bestSummaryOnly };
        }
        if (!bestSummaryOnly && probe.summary) {
            bestSummaryOnly = probe.summary;
        }
    }
    return { headline: '', summary: bestSummaryOnly };
}
/**
 * Read a single candidate artefact and classify what it can contribute
 * to the highlight resolver. Extracted from
 * {@link scanCandidatesForHighlight} to keep its cognitive complexity
 * within the SonarJS budget.
 *
 * @param runDir - Absolute run directory
 * @param rel - Run-relative artefact path
 * @param articleType - Article-type slug for {@link isGenericHeading}
 * @param date - ISO run date for {@link isGenericHeading}
 * @returns
 *   - `cleanHighlight` when the artefact has a non-generic H1 (caller may
 *     return it directly)
 *   - `strippedHeadline` when the H1 is generic but yields an editorial
 *     core after {@link stripArtifactCategoryAffix}
 *   - `summary` when the artefact carries a usable lede or strong prose
 *     line (independent of the headline outcome)
 */
function probeCandidateForHighlight(runDir, rel, articleType, date) {
    const abs = path.join(runDir, rel);
    if (!fs.existsSync(abs))
        return {};
    const body = readArtefactBody(abs);
    const headline = extractFirstH1(body);
    const lede = extractLedeAfterHeading(body);
    const summary = lede || extractStrongProseLine(body);
    if (headline && !isGenericHeading(headline, articleType, date)) {
        return { cleanHighlight: { headline: truncateTitle(headline), summary } };
    }
    // The artefact H1 is generic boilerplate (`Executive Brief — EU Parliament
    // Breaking News`). Before falling back to a stripped category-core
    // headline, try to surface the FIRST NAMED PRIORITY FINDING from the
    // brief's `## Key Developments` / `## Priority Dossiers` /
    // `## Top Findings` block. This is the canonical Stage-B authoring
    // pattern (see `analysis/templates/executive-brief.md`) — every brief
    // lists its top dossiers as `**Name** (procedure-code, date) — paragraph`
    // or `### N. Name (committee)`. Surfacing that name produces a
    // distinctive editorial headline ("Digital Markets Act Enforcement",
    // "Ukraine War Accountability") instead of a stripped category noun.
    const priority = extractPriorityFindingHighlight(body);
    if (priority?.headline) {
        return {
            cleanHighlight: {
                headline: truncateTitle(priority.headline),
                summary: priority.summary || summary,
            },
        };
    }
    if (headline) {
        const stripped = stripArtifactCategoryAffix(headline);
        if (stripped && !isGenericHeading(stripped, articleType, date)) {
            return { strippedHeadline: truncateTitle(stripped), summary };
        }
    }
    return { summary };
}
export { extractPriorityFindingHighlight } from './priority-finding-highlight.js';
import { extractPriorityFindingHighlight } from './priority-finding-highlight.js';
/**
 * Read an artefact file, skipping any SPDX HTML-comment header rows so the
 * first-H1 / first-prose logic is never derailed by the REUSE preamble.
 *
 * @param abs - Absolute file path
 * @returns File contents with SPDX comment lines dropped
 */
function readArtefactBody(abs) {
    let text;
    try {
        text = fs.readFileSync(abs, 'utf8');
    }
    catch {
        return '';
    }
    const lines = text.split('\n');
    let i = 0;
    while (i < lines.length) {
        const line = (lines[i] ?? '').trim();
        if (line === '') {
            i++;
            continue;
        }
        if (line.startsWith('<!--') && line.endsWith('-->')) {
            i++;
            continue;
        }
        break;
    }
    return lines.slice(i).join('\n');
}
/**
 * `fs.readdirSync` wrapped to never throw for missing or unreadable
 * directories.
 *
 * @param dir - Absolute directory path
 * @returns Entries in {@link dir} or `[]` when unreadable
 */
function safeReaddir(dir) {
    try {
        return fs.readdirSync(dir);
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=artifact-highlight.js.map