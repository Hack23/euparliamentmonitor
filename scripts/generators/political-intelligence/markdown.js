// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/PoliticalIntelligence/Markdown
 * @description Pure parsing utilities for analysis Markdown files.
 * Lifted out of `political-intelligence.ts` so the parsing logic
 * (emoji-stripping, H1 extraction, stem humanization) can be
 * unit-tested in isolation and reused by future renderers (e.g.
 * sitemap entries, RSS descriptions, news-indexes meta-builders).
 *
 * **No I/O imports** other than `fs`/`path` for the single
 * file-reading helper {@link parseMarkdownMeta}; everything else is
 * pure string manipulation.
 */
import fs from 'fs';
/**
 * Strip a leading emoji token (and trailing whitespace) from a heading
 * line, repeatedly, so headings like `🚀 ⚠️ Risk Scoring` become `Risk
 * Scoring`.
 *
 * The implementation peels the string character-by-character via
 * `String.prototype[Symbol.iterator]` to correctly handle astral-plane
 * pictographics, VS-16 (`\uFE0F`), and ZWJ sequences — without the
 * nested quantifier patterns that would trigger
 * `security/detect-unsafe-regex`.
 *
 * @param text - Heading text (without the leading `# `)
 * @returns Trimmed text with any leading emoji tokens removed
 */
export function stripLeadingEmoji(text) {
    const isPictographic = /\p{Extended_Pictographic}/u;
    const isModifier = /[\uFE0F\u200D]/u;
    const chars = [...text]; // iterates by Unicode code point
    let i = 0;
    for (const ch of chars) {
        if (isPictographic.test(ch) || isModifier.test(ch) || /\s/.test(ch)) {
            i++;
            continue;
        }
        break;
    }
    return chars.slice(i).join('').trim();
}
/**
 * Extract the first `# H1` heading from a list of lines.
 *
 * @param lines - Markdown source split on newlines
 * @param fallback - Value returned when no H1 is found
 * @returns Extracted heading text or the fallback
 */
export function extractH1Title(lines, fallback) {
    for (const line of lines) {
        const h1 = /^#\s+(.+?)\s*$/.exec(line);
        if (h1?.[1]) {
            return stripLeadingEmoji(h1[1]);
        }
    }
    return fallback;
}
/**
 * Humanize a filename stem (e.g. `per-artifact-methodologies` →
 * `Per Artifact Methodologies`).
 *
 * Replaces dashes/underscores with spaces and Title-Cases each word.
 * Used as a fallback when a Markdown file does not provide an H1.
 *
 * @param stem - Filename stem to humanize
 * @returns Title-cased stem with dashes/underscores replaced by spaces
 */
export function humanize(stem) {
    return stem.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
/**
 * Extract a title and short description from the top of a Markdown
 * file. Uses the first H1 (`# …`) line as title (falling back to a
 * humanized stem).
 *
 * The `description` field is intentionally left **empty**: for the
 * political-intelligence index we use a curated per-file, per-language
 * description table (`getCuratedDescription` in
 * `political-intelligence-descriptions.ts`) instead of scraping the
 * first paragraph of each Markdown file. Scraping proved fragile — it
 * leaked document-metadata headers (`📋 Document Owner: CEO | 📄
 * Version…`) and template separators (`---`) into the rendered cards.
 * Leaving it empty here forces the renderer to go through the curated
 * table.
 *
 * @param fullPath - Absolute path to a Markdown file
 * @param stem - Filename stem used as title fallback
 * @returns `{ title, description }` — description is always `''`
 */
export function parseMarkdownMeta(fullPath, stem) {
    const fallbackTitle = humanize(stem);
    let content;
    try {
        content = fs.readFileSync(fullPath, 'utf-8');
    }
    catch {
        return { title: fallbackTitle, description: '' };
    }
    const lines = content.split(/\r?\n/);
    const title = extractH1Title(lines, fallbackTitle);
    return { title, description: '' };
}
//# sourceMappingURL=markdown.js.map