// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Descriptions/CuratedTitles
 * @description Aggregates the per-category title maps
 * ({@link METHODOLOGY_TITLES}, {@link REFERENCE_TITLES},
 * {@link TEMPLATE_TITLES_A}, {@link TEMPLATE_TITLES_B}) into the single
 * `CURATED_TITLES` keyed by repository-relative Markdown path, preserving
 * the original public API of the monolithic
 * `political-intelligence-descriptions.ts` (Refactor 8/8).
 *
 * Titles are kept short (ideally ≤ 60 characters) and free of emoji —
 * emoji comes from `doc.icon` in the card layout, so keeping titles plain
 * improves SEO (`<title>` tag, og:title, twitter:title, JSON-LD
 * BreadcrumbList entries all consume this string).
 */

import type { TextI18n } from './types.js';
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
export const CURATED_TITLES: Readonly<Record<string, TextI18n>> = {
  ...METHODOLOGY_TITLES,
  ...REFERENCE_TITLES,
  ...TEMPLATE_TITLES_A,
  ...TEMPLATE_TITLES_B,
};
