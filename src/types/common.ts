// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Common
 * @description Thin re-export barrel — preserves the legacy
 * `from '../types/common.js'` import path used by `constants/` and
 * a small number of script-side files while the underlying type
 * definitions live in dedicated bounded-context sub-modules:
 *
 * - {@link ./languages.ts} — language codes
 * - {@link ./article-category.ts} — article enums + category mappings
 * - {@link ./article-strings/propositions.ts}
 * - {@link ./article-strings/motions.ts}
 * - {@link ./article-strings/week-ahead.ts}
 * - {@link ./article-strings/breaking.ts}
 * - {@link ./article-strings/committee.ts}
 *
 * Consumers SHOULD import from `../types/index.js` instead — this file
 * exists for backwards compatibility only and may be removed in a
 * follow-up refactor once all direct importers are migrated.
 */

export type {
  LanguageCode,
  RTLLanguageCode,
  AnyLanguageCode,
  LanguagePreset,
  LanguageMap,
} from './languages.js';

export {
  ArticleCategory,
  ArticlePerspective,
  TimePeriod,
  AnalysisPerspective,
  CATEGORY_PERSPECTIVE,
  CATEGORY_TIME_PERIOD,
} from './article-category.js';

export type { ArticleCategoryLabels, LangTitleSubtitle } from './article-category.js';

export type { PropositionsStrings, EditorialStrings } from './article-strings/propositions.js';

export type { MotionsStrings } from './article-strings/motions.js';

export type {
  WeekAheadStrings,
  WeekAheadStakeholderStrings,
  StakeholderImpactRow,
  StakeholderImpactSection,
  PoliticalTemperatureBand,
  PoliticalTemperature,
} from './article-strings/week-ahead.js';

export type {
  BreakingStrings,
  ActionConsequence,
  StakeholderOutcome,
  PoliticalMistake,
  DeepAnalysis,
  DeepAnalysisStrings,
} from './article-strings/breaking.js';

export type { CommitteeAnalysisContentStrings } from './article-strings/committee.js';

// Legacy convenience re-exports — kept for callers that historically
// reached `StakeholderPerspective` / `StakeholderOutcomeMatrix` via
// `types/common.js` rather than `types/stakeholder.js`.
export type { StakeholderPerspective, StakeholderOutcomeMatrix } from './stakeholder.js';
