// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Descriptions/Curated
 * @description Aggregates the per-category {@link METHODOLOGY_DESCRIPTIONS},
 * {@link TEMPLATE_DESCRIPTIONS} and {@link REFERENCE_DESCRIPTIONS} maps into
 * the single `CURATED_DESCRIPTIONS` keyed by repository-relative file path,
 * preserving the original public API of the monolithic
 * `political-intelligence-descriptions.ts` (Refactor 8/8).
 *
 * Each entry ships with a canonical English description and an optional
 * per-language overlay. Non-English callers never receive the raw English
 * `description` as a fallback — {@link getCuratedDescription} synthesizes a
 * localized sentence from the localized title and the localized "kind"
 * word so every card on a non-English page reads naturally in that
 * language.
 */

import type { CuratedDescription } from './types.js';
import { METHODOLOGY_DESCRIPTIONS } from './desc-methodologies.js';
import { TEMPLATE_DESCRIPTIONS } from './desc-templates.js';
import { REFERENCE_DESCRIPTIONS } from './desc-references.js';

/**
 * Curated descriptions keyed by the repository-relative file path.
 * Descriptions are concise (≤ ~220 chars), factual, and describe the
 * methodology / template's *purpose* — not its metadata block.
 *
 * Where a per-language translation is not provided, readers see the
 * English canonical description. The localized "source materials are in
 * English" note at the top of the page acknowledges this.
 */
export const CURATED_DESCRIPTIONS: Readonly<Record<string, CuratedDescription>> = {
  ...METHODOLOGY_DESCRIPTIONS,
  ...TEMPLATE_DESCRIPTIONS,
  ...REFERENCE_DESCRIPTIONS,
};
