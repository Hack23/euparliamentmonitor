// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Config/Horizons/Registry
 * @description **Single source of truth** for every article horizon — slug,
 * perspective, data window, cadence, mandatory artifacts, stage budgets,
 * scenario depth, electoral overlay and forward-statement horizon.
 *
 * Adding a new article horizon is a four-step change:
 *   1. New {@link ArticleCategory} enum value.
 *   2. New entry in {@link ARTICLE_HORIZONS} keyed by that category.
 *   3. Per-language title generator in `src/constants/language-articles.ts`.
 *   4. New `news-<slug>.md` workflow under `.github/workflows/`.
 *
 * The aggregator (`src/aggregator/article-metadata.ts`), forward-statements
 * registry (`scripts/aggregator/forward-statements-registry.js`) and the
 * drift-guard tests all consume this registry directly. The validator
 * (`scripts/validate-analysis-completeness.js`) currently still uses its
 * own per-slug map; converging it onto `mandatoryArtifacts[]` from this
 * registry is tracked as deferred work in the slicing plan and will
 * eliminate the remaining drift between the two surfaces.
 *
 * @see analysis/methodologies/forward-projection-methodology.md
 * @see analysis/methodologies/electoral-cycle-methodology.md
 * @see ./types.ts        — interface definitions
 * @see ./artifact-paths.ts — artifact-path constants & shared mandatory lists
 * @see ./stage-budgets.ts  — shared stage-budget shapes
 * @see ./lookup.ts        — helper functions
 */

import { ArticleCategory, CATEGORY_PERSPECTIVE, CATEGORY_TIME_PERIOD } from '../../types/index.js';
import {
  A_ACTOR_MAP,
  A_COALITION,
  A_COMMISSION_WP,
  A_COMPARATIVE_INTL,
  A_DEEP_ANALYSIS_EXISTING,
  A_DEVILS_ADVOCATE,
  A_EXEC_BRIEF,
  A_FORCES,
  A_FORWARD_PROJECTION,
  A_HISTORICAL_PARALLELS,
  A_IMPACT,
  A_INDEX,
  A_INTEL_ASSESSMENT,
  A_MANDATE_SCORECARD,
  A_MCP_AUDIT,
  A_MEDIA_FRAMING,
  A_PESTLE,
  A_PIPELINE_FORECAST,
  A_PRESIDENCY_TRIO,
  A_QUANT_SWOT,
  A_REFLECTION,
  A_RISK_MATRIX,
  A_SCENARIO,
  A_SEAT_PROJECTION,
  A_SIGNIFICANCE,
  A_STAKEHOLDER,
  A_SYNTHESIS,
  A_TERM_ARC,
  A_THREAT,
  ELECTORAL_EXTRA,
  LONG_HORIZON_PROSPECTIVE_EXTRA,
  PROSPECTIVE_MANDATORY,
  RETROSPECTIVE_MANDATORY,
  STANDARD_FEEDS,
} from './artifact-paths.js';
import { ELECTORAL_BUDGETS, PROSPECTIVE_BUDGETS, RETROSPECTIVE_BUDGETS } from './stage-budgets.js';
import type { ArticleHorizonConfig } from './types.js';

/**
 * Master registry — every {@link ArticleCategory} maps to its full
 * horizon config. The TypeScript `Record<ArticleCategory, ...>` type
 * forces this map to stay complete at compile time.
 */
export const ARTICLE_HORIZONS: Record<ArticleCategory, ArticleHorizonConfig> = {
  [ArticleCategory.WEEK_AHEAD]: {
    slug: 'week-ahead',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.WEEK_AHEAD],
    timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.WEEK_AHEAD],
    dataWindow: { direction: 'forward', days: 7, anchor: 'today' },
    cadence: { cron: '0 7 * * 5', description: 'Weekly — Friday 07:00 UTC' },
    primaryFeeds: [...STANDARD_FEEDS],
    mandatoryArtifacts: [...PROSPECTIVE_MANDATORY, A_FORWARD_PROJECTION],
    optionalArtifacts: [A_EXEC_BRIEF],
    stageBudgets: PROSPECTIVE_BUDGETS,
    scenarioMaxHorizonMonths: 1,
    forwardStatementsHorizonDays: 14,
    electoralOverlay: false,
  },
  [ArticleCategory.MONTH_AHEAD]: {
    slug: 'month-ahead',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.MONTH_AHEAD],
    timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.MONTH_AHEAD],
    dataWindow: { direction: 'forward', days: 30, anchor: 'today' },
    cadence: { cron: '0 8 1 * *', description: 'Monthly — 1st @ 08:00 UTC' },
    primaryFeeds: [...STANDARD_FEEDS],
    mandatoryArtifacts: [...PROSPECTIVE_MANDATORY, A_FORWARD_PROJECTION],
    optionalArtifacts: [A_EXEC_BRIEF],
    stageBudgets: PROSPECTIVE_BUDGETS,
    scenarioMaxHorizonMonths: 3,
    forwardStatementsHorizonDays: 60,
    electoralOverlay: false,
  },
  [ArticleCategory.QUARTER_AHEAD]: {
    slug: 'quarter-ahead',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.QUARTER_AHEAD],
    timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.QUARTER_AHEAD],
    dataWindow: { direction: 'forward', days: 90, anchor: 'today' },
    cadence: { cron: '0 8 1 * *', description: 'Monthly — 1st @ 08:00 UTC' },
    primaryFeeds: [...STANDARD_FEEDS],
    mandatoryArtifacts: [...PROSPECTIVE_MANDATORY, ...LONG_HORIZON_PROSPECTIVE_EXTRA],
    optionalArtifacts: [A_PRESIDENCY_TRIO, A_COMMISSION_WP, A_EXEC_BRIEF],
    stageBudgets: { A: 5, B: 24, C: 4, D: 2, E: 2 },
    scenarioMaxHorizonMonths: 6,
    forwardStatementsHorizonDays: 180,
    electoralOverlay: false,
  },
  [ArticleCategory.YEAR_AHEAD]: {
    slug: 'year-ahead',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.YEAR_AHEAD],
    timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.YEAR_AHEAD],
    dataWindow: { direction: 'forward', days: 365, anchor: 'today' },
    cadence: {
      cron: '0 8 2 1,4,7,10 *',
      description: 'Quarterly — 2nd of Jan/Apr/Jul/Oct @ 08:00 UTC',
    },
    primaryFeeds: [...STANDARD_FEEDS],
    mandatoryArtifacts: [
      ...PROSPECTIVE_MANDATORY,
      ...LONG_HORIZON_PROSPECTIVE_EXTRA,
      A_PRESIDENCY_TRIO,
      A_COMMISSION_WP,
    ],
    optionalArtifacts: [A_SEAT_PROJECTION, A_EXEC_BRIEF, A_HISTORICAL_PARALLELS],
    stageBudgets: { A: 5, B: 25, C: 4, D: 2, E: 2 },
    scenarioMaxHorizonMonths: 18,
    forwardStatementsHorizonDays: 730,
    electoralOverlay: false,
  },
  [ArticleCategory.WEEK_IN_REVIEW]: {
    slug: 'week-in-review',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.WEEK_IN_REVIEW],
    timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.WEEK_IN_REVIEW],
    // ADR-006: D-8 → D-36 reporting window for roll-call publication delay.
    dataWindow: { direction: 'backward', days: 28, anchor: 'today' },
    cadence: { cron: '0 9 * * 6', description: 'Weekly — Saturday 09:00 UTC' },
    primaryFeeds: [...STANDARD_FEEDS, 'get_voting_records'],
    mandatoryArtifacts: [...RETROSPECTIVE_MANDATORY],
    optionalArtifacts: [A_EXEC_BRIEF],
    stageBudgets: RETROSPECTIVE_BUDGETS,
    scenarioMaxHorizonMonths: 1,
    forwardStatementsHorizonDays: 0,
    electoralOverlay: false,
  },
  [ArticleCategory.MONTH_IN_REVIEW]: {
    slug: 'month-in-review',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.MONTH_IN_REVIEW],
    timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.MONTH_IN_REVIEW],
    dataWindow: { direction: 'backward', days: 30, anchor: 'today' },
    cadence: { cron: '0 10 28 * *', description: 'Monthly — 28th @ 10:00 UTC' },
    primaryFeeds: [...STANDARD_FEEDS, 'get_voting_records'],
    mandatoryArtifacts: [...RETROSPECTIVE_MANDATORY],
    optionalArtifacts: [A_EXEC_BRIEF],
    stageBudgets: RETROSPECTIVE_BUDGETS,
    scenarioMaxHorizonMonths: 3,
    forwardStatementsHorizonDays: 0,
    electoralOverlay: false,
  },
  [ArticleCategory.QUARTER_IN_REVIEW]: {
    slug: 'quarter-in-review',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.QUARTER_IN_REVIEW],
    timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.QUARTER_IN_REVIEW],
    dataWindow: { direction: 'backward', days: 90, anchor: 'today' },
    cadence: {
      cron: '0 8 5 * *',
      description: 'Monthly — 5th @ 08:00 UTC (after roll-call publication delay)',
    },
    primaryFeeds: [...STANDARD_FEEDS, 'get_voting_records'],
    mandatoryArtifacts: [...RETROSPECTIVE_MANDATORY, A_PIPELINE_FORECAST],
    optionalArtifacts: [A_PRESIDENCY_TRIO, A_COMMISSION_WP, A_EXEC_BRIEF],
    stageBudgets: { A: 4, B: 24, C: 4, D: 2, E: 2 },
    scenarioMaxHorizonMonths: 6,
    forwardStatementsHorizonDays: 0,
    electoralOverlay: false,
  },
  [ArticleCategory.YEAR_IN_REVIEW]: {
    slug: 'year-in-review',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.YEAR_IN_REVIEW],
    timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.YEAR_IN_REVIEW],
    dataWindow: { direction: 'backward', days: 365, anchor: 'today' },
    cadence: { cron: '0 8 15 1 *', description: 'Annual — 15 Jan @ 08:00 UTC' },
    primaryFeeds: [...STANDARD_FEEDS, 'get_voting_records'],
    mandatoryArtifacts: [
      ...RETROSPECTIVE_MANDATORY,
      A_MANDATE_SCORECARD,
      A_TERM_ARC,
      A_PIPELINE_FORECAST,
      A_PRESIDENCY_TRIO,
      A_COMMISSION_WP,
      A_HISTORICAL_PARALLELS,
    ],
    optionalArtifacts: [A_SEAT_PROJECTION, A_EXEC_BRIEF, A_COMPARATIVE_INTL],
    stageBudgets: { A: 5, B: 25, C: 4, D: 2, E: 2 },
    scenarioMaxHorizonMonths: 12,
    forwardStatementsHorizonDays: 0,
    electoralOverlay: false,
  },
  [ArticleCategory.TERM_OUTLOOK]: {
    slug: 'term-outlook',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.TERM_OUTLOOK],
    timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.TERM_OUTLOOK],
    // From today to next-EP-election (currently June 2029, ≈ 1500 days).
    dataWindow: { direction: 'forward', days: 1500, anchor: 'next-election' },
    cadence: { cron: '0 8 1 1,7 *', description: 'Semi-annual — 1 Jan & 1 Jul @ 08:00 UTC' },
    primaryFeeds: [...STANDARD_FEEDS],
    mandatoryArtifacts: [...PROSPECTIVE_MANDATORY, ...ELECTORAL_EXTRA],
    optionalArtifacts: [A_EXEC_BRIEF],
    stageBudgets: { A: 5, B: 26, C: 4, D: 2, E: 2 },
    scenarioMaxHorizonMonths: 36,
    forwardStatementsHorizonDays: 1500,
    electoralOverlay: true,
  },
  [ArticleCategory.ELECTION_CYCLE]: {
    slug: 'election-cycle',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.ELECTION_CYCLE],
    timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.ELECTION_CYCLE],
    // ±6 months around the election week — anchored on next-election.
    dataWindow: { direction: 'span', days: 365, anchor: 'next-election' },
    cadence: {
      cron: '0 8 1 12 *',
      description:
        'Annual — 1 Dec @ 08:00 UTC, plus T-180 / T-90 / T-30 election-imminent triggers',
      triggerEvents: ['election-imminent-t180', 'election-imminent-t90', 'election-imminent-t30'],
    },
    primaryFeeds: [...STANDARD_FEEDS, 'get_voting_records'],
    mandatoryArtifacts: [
      ...PROSPECTIVE_MANDATORY,
      ...ELECTORAL_EXTRA,
      A_MANDATE_SCORECARD,
      A_HISTORICAL_PARALLELS,
      A_COMPARATIVE_INTL,
    ],
    optionalArtifacts: [A_EXEC_BRIEF, A_DEVILS_ADVOCATE],
    stageBudgets: ELECTORAL_BUDGETS,
    scenarioMaxHorizonMonths: 60,
    forwardStatementsHorizonDays: 1825,
    electoralOverlay: true,
  },
  [ArticleCategory.BREAKING_NEWS]: {
    slug: 'breaking',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.BREAKING_NEWS],
    dataWindow: { direction: 'point', anchor: 'today' },
    cadence: { cron: '0 */6 * * *', description: 'Every 6 hours' },
    primaryFeeds: [...STANDARD_FEEDS],
    mandatoryArtifacts: [
      A_SIGNIFICANCE,
      A_ACTOR_MAP,
      A_FORCES,
      A_IMPACT,
      A_RISK_MATRIX,
      A_QUANT_SWOT,
      A_SYNTHESIS,
      A_COALITION,
      A_SCENARIO,
      A_PESTLE,
      A_STAKEHOLDER,
      A_THREAT,
      A_MCP_AUDIT,
      A_INDEX,
      A_MEDIA_FRAMING,
      A_REFLECTION,
    ],
    optionalArtifacts: [A_EXEC_BRIEF],
    stageBudgets: PROSPECTIVE_BUDGETS,
    scenarioMaxHorizonMonths: 3,
    forwardStatementsHorizonDays: 0,
    electoralOverlay: false,
  },
  [ArticleCategory.COMMITTEE_REPORTS]: {
    slug: 'committee-reports',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.COMMITTEE_REPORTS],
    dataWindow: { direction: 'backward', days: 30, anchor: 'today' },
    cadence: { cron: '0 4 * * 1-5', description: 'Weekdays — Mon–Fri 04:00 UTC' },
    primaryFeeds: [...STANDARD_FEEDS, 'get_committee_documents'],
    mandatoryArtifacts: [...RETROSPECTIVE_MANDATORY],
    optionalArtifacts: [A_EXEC_BRIEF],
    stageBudgets: RETROSPECTIVE_BUDGETS,
    scenarioMaxHorizonMonths: 3,
    forwardStatementsHorizonDays: 0,
    electoralOverlay: false,
  },
  [ArticleCategory.MOTIONS]: {
    slug: 'motions',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.MOTIONS],
    dataWindow: { direction: 'backward', days: 30, anchor: 'today' },
    cadence: { cron: '0 6 * * 1-5', description: 'Weekdays — Mon–Fri 06:00 UTC' },
    primaryFeeds: [...STANDARD_FEEDS, 'get_voting_records'],
    mandatoryArtifacts: [...RETROSPECTIVE_MANDATORY],
    optionalArtifacts: [A_EXEC_BRIEF],
    stageBudgets: RETROSPECTIVE_BUDGETS,
    scenarioMaxHorizonMonths: 3,
    forwardStatementsHorizonDays: 0,
    electoralOverlay: false,
  },
  [ArticleCategory.PROPOSITIONS]: {
    slug: 'propositions',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.PROPOSITIONS],
    dataWindow: { direction: 'forward', days: 90, anchor: 'today' },
    cadence: { cron: '0 5 * * 1-5', description: 'Weekdays — Mon–Fri 05:00 UTC' },
    primaryFeeds: [...STANDARD_FEEDS, 'get_procedures'],
    mandatoryArtifacts: [...PROSPECTIVE_MANDATORY],
    optionalArtifacts: [A_PIPELINE_FORECAST, A_EXEC_BRIEF],
    stageBudgets: PROSPECTIVE_BUDGETS,
    scenarioMaxHorizonMonths: 6,
    forwardStatementsHorizonDays: 180,
    electoralOverlay: false,
  },
  [ArticleCategory.DEEP_ANALYSIS]: {
    slug: 'deep-analysis',
    perspective: CATEGORY_PERSPECTIVE[ArticleCategory.DEEP_ANALYSIS],
    dataWindow: { direction: 'span', days: 365, anchor: 'today' },
    cadence: { cron: null, description: 'Manual / workflow_dispatch only' },
    primaryFeeds: [...STANDARD_FEEDS],
    mandatoryArtifacts: [
      ...PROSPECTIVE_MANDATORY,
      A_DEEP_ANALYSIS_EXISTING,
      A_INTEL_ASSESSMENT,
      A_DEVILS_ADVOCATE,
      A_HISTORICAL_PARALLELS,
    ],
    optionalArtifacts: [A_FORWARD_PROJECTION, A_EXEC_BRIEF, A_COMPARATIVE_INTL],
    stageBudgets: ELECTORAL_BUDGETS,
    scenarioMaxHorizonMonths: 24,
    forwardStatementsHorizonDays: 365,
    electoralOverlay: false,
  },
};
