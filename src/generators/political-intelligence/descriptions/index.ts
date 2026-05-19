// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Descriptions
 * @description Barrel re-export for the curated political-intelligence
 * description / title library. Split out of the monolithic
 * `political-intelligence-descriptions.ts` (Refactor 8/8) into per-category
 * data files (methodologies / templates / references) and per-concern
 * helper modules (fallback / lookup / run-types / artifact-info). The
 * top-level `political-intelligence-descriptions.ts` re-exports from this
 * barrel to preserve every existing import site.
 */

export type { TextI18n, DescriptionI18n, CuratedDescription } from './types.js';

export { CURATED_DESCRIPTIONS } from './curated-descriptions.js';
export { CURATED_TITLES } from './curated-titles.js';
export { METHODOLOGY_DESCRIPTIONS } from './desc-methodologies.js';
export { TEMPLATE_DESCRIPTIONS } from './desc-templates.js';
export { REFERENCE_DESCRIPTIONS } from './desc-references.js';
export { METHODOLOGY_TITLES } from './titles-methodologies.js';
export { REFERENCE_TITLES } from './titles-references.js';
export { TEMPLATE_TITLES_A } from './titles-templates-a.js';
export { TEMPLATE_TITLES_B } from './titles-templates-b.js';

export {
  getCuratedDescription,
  getCuratedTitle,
  hasCuratedDescription,
  hasCuratedTitle,
} from './lookup.js';

export { parseRunSlug, getRunTypeInfo, canonicalizeArtifactStem } from './run-types.js';

export { RUN_TYPE_TITLES } from './run-types-titles.js';
export { RUN_TYPE_DESCRIPTIONS } from './run-types-descriptions.js';

export { getArtifactInfo } from './artifact-info.js';
