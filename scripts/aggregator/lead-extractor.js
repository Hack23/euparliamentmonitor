// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/LeadExtractor
 * @description Pure helper that extracts the strongest lead sentence from
 * an Executive Brief artifact.
 *
 * The aggregator's Executive Brief section is rendered first; this module
 * is consumed by {@link buildArticleMeta} (and by metadata fall-backs) to
 * surface a single concise lead — the journalistic "nut graf" — that
 * sharpens both the SEO description and the structured data emitted next
 * to `article.md`.
 *
 * The rules are deterministic:
 *  1. Prefer the first non-empty paragraph under a `## BLUF` /
 *     `## Bottom Line Up Front` heading in `executive-brief.md` (or
 *     `extended/executive-brief.md`).
 *  2. Fall back to the first non-empty paragraph under `## Top Findings`
 *     / `## Key Judgments` in `intelligence/synthesis-summary.md`.
 *  3. Fall back to the first non-empty paragraph in any of the canonical
 *     sources.
 *  4. Return the first sentence (split on `. ` / `! ` / `? `), capped at
 *     {@link MAX_LEAD_CHARS} characters with a trailing ellipsis.
 */
import fs from 'fs';
import path from 'path';
/** Hard cap on the returned lead length. */
export const MAX_LEAD_CHARS = 320;
/** Default canonical sources, in priority order. */
const DEFAULT_LEAD_SOURCES = [
    'executive-brief.md',
    'extended/executive-brief.md',
    'intelligence/synthesis-summary.md',
];
/** H2 headings whose first paragraph is preferred as the lead. */
const PREFERRED_HEADINGS = [
    'bluf',
    'bottom line up front',
    'top findings',
    'key judgments',
    'lead',
    'headline',
];
/**
 * Split a Markdown document into headed sections. Fenced code blocks are
 * stripped so prose extraction never picks them up.
 *
 * @param markdown - Raw Markdown
 * @returns Ordered list of `{heading, lines}` sections
 */
function splitSections(markdown) {
    const sections = [];
    let heading = '';
    let buffer = [];
    let inFence = false;
    const flush = () => {
        sections.push({ heading, lines: buffer });
        buffer = [];
    };
    for (const rawLine of markdown.split(/\r?\n/)) {
        const line = rawLine ?? '';
        if (/^```/.test(line)) {
            inFence = !inFence;
            continue;
        }
        if (inFence)
            continue;
        const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
        if (headingMatch) {
            flush();
            heading = (headingMatch[2] ?? '')
                .trim()
                .toLowerCase()
                .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            continue;
        }
        buffer.push(line);
    }
    flush();
    return sections;
}
/**
 * Decide whether a line should terminate the current paragraph (returning
 * what we have so far) or simply be ignored. Pure helper.
 *
 * @param trimmed - Trimmed line content
 * @returns `'flush'` when a paragraph break should be honoured,
 *          `'skip'` when the line is irrelevant content (e.g. a bullet),
 *          `'append'` when the line is prose that extends the paragraph
 */
function classifyParagraphLine(trimmed) {
    if (trimmed === '')
        return 'flush';
    if (/^[-*+]\s+/.test(trimmed))
        return 'skip';
    if (/^\d+\.\s+/.test(trimmed))
        return 'skip';
    if (/^(>|<|!?\[)/.test(trimmed))
        return 'flush';
    return 'append';
}
/**
 * Return the first non-empty prose paragraph from a section's body,
 * skipping bullets, ordered-list items, blockquotes, and inline HTML.
 *
 * @param lines - Body lines of a single section
 * @returns First non-empty paragraph, or `''` when none qualifies
 */
function firstProseParagraph(lines) {
    const paragraph = [];
    for (const rawLine of lines) {
        const trimmed = (rawLine ?? '').trim();
        const action = classifyParagraphLine(trimmed);
        if (action === 'flush' && paragraph.length > 0) {
            return paragraph.join(' ').trim();
        }
        if (action === 'append')
            paragraph.push(trimmed);
    }
    return paragraph.length > 0 ? paragraph.join(' ').trim() : '';
}
/**
 * Extract the strongest lead paragraph from a Markdown body. Pure helper;
 * surfaced for unit testing.
 *
 * @param markdown - Artifact Markdown (front-matter / banners ignored via
 *                   heading-aware scanning rather than full cleaning)
 * @returns First non-empty paragraph under a preferred heading, or the
 *          first non-empty paragraph anywhere in the body, or `''`
 */
export function extractLeadParagraph(markdown) {
    const sections = splitSections(markdown);
    for (const section of sections) {
        const isPreferred = PREFERRED_HEADINGS.some((h) => section.heading.startsWith(h));
        if (!isPreferred)
            continue;
        const paragraph = firstProseParagraph(section.lines);
        if (paragraph)
            return paragraph;
    }
    // Fallback: first prose paragraph in any section that follows a heading.
    for (let i = 1; i < sections.length; i++) {
        const section = sections[i];
        if (!section)
            continue;
        const paragraph = firstProseParagraph(section.lines);
        if (paragraph)
            return paragraph;
    }
    return '';
}
/**
 * Trim a paragraph down to its first sentence and cap the length at
 * {@link MAX_LEAD_CHARS}, appending an ellipsis when truncation occurs.
 *
 * @param paragraph - Raw paragraph (single line, multiple sentences allowed)
 * @returns Trimmed lead, never longer than {@link MAX_LEAD_CHARS}
 */
export function trimToLeadSentence(paragraph) {
    const cleaned = paragraph.replace(/\s+/g, ' ').trim();
    if (cleaned.length === 0)
        return '';
    const sentenceMatch = /^(.*?[.!?])\s/.exec(cleaned);
    const sentence = sentenceMatch?.[1] ?? cleaned;
    if (sentence.length <= MAX_LEAD_CHARS)
        return sentence;
    // Hard cap with ellipsis at a word boundary.
    const slice = sentence.slice(0, MAX_LEAD_CHARS - 1);
    const lastSpace = slice.lastIndexOf(' ');
    const safe = lastSpace > MAX_LEAD_CHARS / 2 ? slice.slice(0, lastSpace) : slice;
    return `${safe.trimEnd()}…`;
}
/**
 * Resolve the executive lead by walking the canonical sources in priority
 * order and returning the first non-empty trimmed sentence.
 *
 * @param runDir - Absolute path to the analysis run directory
 * @param sources - Optional override for the source list
 * @returns Trimmed lead, or `''` when nothing is harvestable
 */
export function extractExecutiveLead(runDir, sources = DEFAULT_LEAD_SOURCES) {
    for (const rel of sources) {
        const abs = path.join(runDir, rel);
        if (!fs.existsSync(abs))
            continue;
        const markdown = fs.readFileSync(abs, 'utf8');
        const paragraph = extractLeadParagraph(markdown);
        const lead = trimToLeadSentence(paragraph);
        if (lead.length > 0)
            return lead;
    }
    return '';
}
//# sourceMappingURL=lead-extractor.js.map