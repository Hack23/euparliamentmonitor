// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { METHODOLOGY_TITLES } from './titles-methodologies.js';
import { REFERENCE_TITLES } from './titles-references.js';
import { TEMPLATE_TITLES_A } from './titles-templates-a.js';
import { TEMPLATE_TITLES_B } from './titles-templates-b.js';
/**
 * Curated per-language **titles** keyed by the repository-relative Markdown
 * path. This table is layered *on top* of `CURATED_DESCRIPTIONS` so the
 * main description table stays compact; adding a title for a file does not
 * require touching that entry's description block.
 *
 * Each entry provides a canonical English title (`en`) plus optional
 * overlays in the other 13 supported languages. When a language is
 * missing, `getCuratedTitle` falls back to the English entry, and when the
 * entire path is missing from this table it falls back to the H1 extracted
 * from the source Markdown by the generator.
 */
export const CURATED_TITLES = {
    ...METHODOLOGY_TITLES,
    ...REFERENCE_TITLES,
    ...TEMPLATE_TITLES_A,
    ...TEMPLATE_TITLES_B,
};
//# sourceMappingURL=curated-titles.js.map