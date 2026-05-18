// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles
 * @description Barrel re-export for per-article-type localized string modules.
 *
 * Each module owns one article category — editing one language for one
 * article type touches a single file, eliminating cross-type translator
 * merge contention:
 *
 * - `localized-keywords.ts`  — `LOCALIZED_KEYWORDS` (per-language SEO keywords)
 * - `breaking.ts`            — `BREAKING_NEWS_TITLES`, `BREAKING_STRINGS`
 * - `week-ahead.ts`          — `WEEK_AHEAD_TITLES`, `WEEK_AHEAD_STRINGS`, `WEEK_AHEAD_STAKEHOLDER_STRINGS`
 * - `week-in-review.ts`      — `WEEKLY_REVIEW_TITLES`
 * - `month-ahead.ts`         — `MONTH_AHEAD_TITLES`
 * - `month-in-review.ts`     — `MONTHLY_REVIEW_TITLES`, `MONTH_IN_REVIEW_STRINGS`
 * - `committee-reports.ts`   — `COMMITTEE_REPORTS_TITLES`, `COMMITTEE_ANALYSIS_CONTENT_STRINGS`
 * - `motions.ts`             — `MOTIONS_TITLES`, `MOTIONS_STRINGS`
 * - `propositions.ts`        — `PROPOSITIONS_TITLES`, `PROPOSITIONS_STRINGS`
 * - `editorial.ts`           — `EDITORIAL_STRINGS`
 * - `deep-analysis.ts`       — `DEEP_ANALYSIS_STRINGS`, `ANALYSIS_QUALITY_LABELS`, `ANALYSIS_INSIGHTS_HEADING`
 * - `swot.ts`                — `SWOT_STRINGS`, `SWOT_BUILDER_STRINGS`
 * - `dashboard.ts`           — `DASHBOARD_STRINGS`, `DASHBOARD_BUILDER_STRINGS`
 * - `extended-horizons.ts`   — `QUARTER_AHEAD_TITLES`, `QUARTER_IN_REVIEW_TITLES`, `YEAR_AHEAD_TITLES`, `YEAR_IN_REVIEW_TITLES`, `TERM_OUTLOOK_TITLES`, `ELECTION_CYCLE_TITLES`
 */

export { LOCALIZED_KEYWORDS } from './localized-keywords.js';
export {
  WEEK_AHEAD_TITLES,
  WEEK_AHEAD_STRINGS,
  WEEK_AHEAD_STAKEHOLDER_STRINGS,
} from './week-ahead.js';
export { MONTH_AHEAD_TITLES } from './month-ahead.js';
export { WEEKLY_REVIEW_TITLES } from './week-in-review.js';
export { MONTHLY_REVIEW_TITLES, MONTH_IN_REVIEW_STRINGS } from './month-in-review.js';
export {
  QUARTER_AHEAD_TITLES,
  QUARTER_IN_REVIEW_TITLES,
  YEAR_AHEAD_TITLES,
  YEAR_IN_REVIEW_TITLES,
  TERM_OUTLOOK_TITLES,
  ELECTION_CYCLE_TITLES,
} from './extended-horizons.js';
export { MOTIONS_TITLES, MOTIONS_STRINGS } from './motions.js';
export { BREAKING_NEWS_TITLES, BREAKING_STRINGS } from './breaking.js';
export {
  COMMITTEE_REPORTS_TITLES,
  COMMITTEE_ANALYSIS_CONTENT_STRINGS,
} from './committee-reports.js';
export { PROPOSITIONS_TITLES, PROPOSITIONS_STRINGS } from './propositions.js';
export { EDITORIAL_STRINGS } from './editorial.js';
export {
  DEEP_ANALYSIS_STRINGS,
  ANALYSIS_QUALITY_LABELS,
  ANALYSIS_INSIGHTS_HEADING,
} from './deep-analysis.js';
export { SWOT_STRINGS, SWOT_BUILDER_STRINGS } from './swot.js';
export { DASHBOARD_STRINGS, DASHBOARD_BUILDER_STRINGS } from './dashboard.js';
