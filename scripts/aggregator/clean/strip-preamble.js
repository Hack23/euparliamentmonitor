// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Clean/StripPreamble
 * @description Strip the operational metadata preamble (e.g.
 * `**Run:**` / `**Window:**` lines) that agent pipelines prepend to
 * artifacts before rendering.
 */
/**
 * Pattern matching an operational metadata line at the start of an artifact.
 * Examples: `**Run:** breaking-run-123`, `**Window:** 2026-04-24 00:00Z — 05:49Z`.
 * The pattern requires the line to start with `**<Word>**` followed by a colon
 * or whitespace so ordinary bold prose is not mistakenly treated as metadata.
 */
const METADATA_LINE_PATTERN = /^\*\*[A-Za-z][^*\n]*\*\*[:\s]/;
/**
 * Strip the operational metadata preamble that agent pipelines prepend to
 * artifacts. These are lines of the form `**Run:** …`, `**Window:** …`,
 * `**Methodology:** …`, etc., followed optionally by a standalone `---`
 * horizontal rule. They are agent-operational metadata that should not appear
 * in the published article.
 *
 * Algorithm:
 *  1. Skip leading blank lines (they don't count as metadata).
 *  2. If the first non-blank line does NOT match the metadata pattern, return
 *     the document unchanged (`lines: 0`).
 *  3. Otherwise consume all metadata lines and interspersed blank lines.
 *  4. If the next non-blank line is a standalone `---`, consume that too.
 *  5. Return the stripped Markdown and the count of lines removed.
 *
 * @param md - Markdown source (after banner/heading passes)
 * @returns `{ md, lines }` — stripped Markdown and number of lines removed
 */
export function stripArtifactMetadataPreamble(md) {
    const lines = md.split('\n');
    let i = 0;
    while (i < lines.length && (lines[i] ?? '').trim() === '')
        i++;
    if (i >= lines.length || !METADATA_LINE_PATTERN.test(lines[i] ?? '')) {
        return { md, lines: 0 };
    }
    let metaEnd = i;
    while (metaEnd < lines.length) {
        const line = lines[metaEnd] ?? '';
        if (METADATA_LINE_PATTERN.test(line) || line.trim() === '') {
            metaEnd++;
        }
        else {
            break;
        }
    }
    let scanAhead = metaEnd;
    while (scanAhead < lines.length && (lines[scanAhead] ?? '').trim() === '')
        scanAhead++;
    if (scanAhead < lines.length && /^\s*---\s*$/.test(lines[scanAhead] ?? '')) {
        metaEnd = scanAhead + 1;
    }
    const removed = metaEnd;
    const stripped = lines.slice(removed).join('\n').replace(/^\n+/, '');
    return { md: stripped, lines: removed };
}
//# sourceMappingURL=strip-preamble.js.map