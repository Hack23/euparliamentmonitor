// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Clean/StripSpdx
 * @description Remove per-artifact SPDX tags before rendering so they
 * don't leak into the aggregated HTML or trip the REUSE compliance scanner.
 */
// REUSE-IgnoreStart
/**
 * Matches an SPDX tag anywhere on a line, whether wrapped in HTML comments
 * (SPDX-License-Identifier line inside `<!-- ... -->`), inline markdown
 * emphasis (italic-wrapped SPDX-License-Identifier / SPDX-FileCopyrightText),
 * or written bare. Used to purge artifact-level SPDX metadata before rendering
 * so it doesn't leak into the aggregated HTML (where the REUSE tool would then
 * parse the surrounding markup as part of the SPDX expression).
 */
// REUSE-IgnoreEnd
const SPDX_TAG_LINE = /SPDX-(?:License-Identifier|FileCopyrightText|PackageName|PackageSupplier|PackageDownloadLocation)\b/;
// REUSE-IgnoreStart
/**
 * Remove every line containing an SPDX tag from the Markdown source. The
 * aggregated article HTML carries its own file-level SPDX header via
 * `REUSE.toml`; per-artifact tags would otherwise surface as visible footer
 * text (italic-wrapped SPDX tags rendered inside `<em>` / `</em></p>`) and
 * trip the REUSE compliance scanner, which would parse the trailing markup
 * as part of the SPDX expression.
 *
 * @param md - Raw Markdown source
 * @returns `{ md, lines }` — stripped Markdown and count of removed lines
 */
// REUSE-IgnoreEnd
export function stripSpdxTags(md) {
    const lines = md.split('\n');
    const kept = [];
    let stripped = 0;
    for (const line of lines) {
        if (SPDX_TAG_LINE.test(line)) {
            stripped++;
            continue;
        }
        kept.push(line);
    }
    return { md: kept.join('\n'), lines: stripped };
}
//# sourceMappingURL=strip-spdx.js.map