// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Config/ArticleHorizons
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
 */

import {
  ArticleCategory,
  ArticlePerspective,
  CATEGORY_PERSPECTIVE,
  CATEGORY_TIME_PERIOD,
} from '../types/index.js';
import type { TimePeriod } from '../types/index.js';

// ─── String constants for artifact paths (deduplicated) ──────────────────────

const A_SIGNIFICANCE = 'classification/significance-classification.md';
const A_ACTOR_MAP = 'classification/actor-mapping.md';
const A_FORCES = 'classification/forces-analysis.md';
const A_IMPACT = 'classification/impact-matrix.md';
const A_RISK_MATRIX = 'risk-scoring/risk-matrix.md';
const A_QUANT_SWOT = 'risk-scoring/quantitative-swot.md';
const A_SYNTHESIS = 'intelligence/synthesis-summary.md';
const A_COALITION = 'intelligence/coalition-dynamics.md';
const A_SCENARIO = 'intelligence/scenario-forecast.md';
const A_PESTLE = 'intelligence/pestle-analysis.md';
const A_STAKEHOLDER = 'intelligence/stakeholder-map.md';
const A_WILDCARDS = 'intelligence/wildcards-blackswans.md';
const A_HISTORICAL = 'intelligence/historical-baseline.md';
const A_ECONOMIC = 'intelligence/economic-context.md';
const A_THREAT = 'intelligence/threat-model.md';
const A_MCP_AUDIT = 'intelligence/mcp-reliability-audit.md';
const A_INDEX = 'intelligence/analysis-index.md';
const A_REFLECTION = 'intelligence/methodology-reflection.md';
const A_VOTING = 'intelligence/voting-patterns.md';
const A_FORWARD_PROJECTION = 'intelligence/forward-projection.md';
const A_PIPELINE_FORECAST = 'intelligence/legislative-pipeline-forecast.md';
const A_CALENDAR_PROJECTION = 'intelligence/parliamentary-calendar-projection.md';
const A_TERM_ARC = 'intelligence/term-arc.md';
const A_SEAT_PROJECTION = 'intelligence/seat-projection.md';
const A_MANDATE_SCORECARD = 'intelligence/mandate-fulfilment-scorecard.md';
const A_PRESIDENCY_TRIO = 'intelligence/presidency-trio-context.md';
const A_COMMISSION_WP = 'intelligence/commission-wp-alignment.md';
const A_FORWARD_INDICATORS = 'extended/forward-indicators.md';
const A_HISTORICAL_PARALLELS = 'extended/historical-parallels.md';
const A_COMPARATIVE_INTL = 'extended/comparative-international.md';
const A_EXEC_BRIEF = 'extended/executive-brief.md';
const A_DEVILS_ADVOCATE = 'extended/devils-advocate-analysis.md';
const A_INTEL_ASSESSMENT = 'extended/intelligence-assessment.md';
const A_DEEP_ANALYSIS_EXISTING = 'existing/deep-analysis.md';

/**
 * Direction of the data-collection window relative to the run date.
 *  - `forward` — future-facing (e.g. week-ahead, year-ahead)
 *  - `backward` — past-facing (e.g. week-in-review, year-in-review)
 *  - `span` — anchored at run date but spanning both directions
 *    (e.g. election-cycle uses ±6 months around the election week)
 *  - `point` — single point in time (e.g. breaking-news at run-time)
 */
export type DataWindowDirection = 'forward' | 'backward' | 'span' | 'point';

/**
 * Anchor a horizon's data window to.
 *  - `today` — the run date
 *  - `next-election` — the next EP-election week (constant: June 2029)
 *  - `commission-wp` — start of the current Commission Work Programme year
 *  - `term-end` — end of the current EP term
 */
export type DataWindowAnchor = 'today' | 'next-election' | 'commission-wp' | 'term-end';

/** Data-collection window for the horizon. */
export interface DataWindowConfig {
  /** Direction relative to the anchor. */
  readonly direction: DataWindowDirection;
  /** Span in days. Omitted for `point` direction. Use the larger of
   *  any spread when `direction='span'` (e.g. election-cycle: 365). */
  readonly days?: number;
  /** Anchor reference. Defaults to `today`. */
  readonly anchor?: DataWindowAnchor;
}

/** Minute budgets for each of the five workflow stages.
 *
 * Sum should be ≤ 50 minutes — the workflow has a 60-minute hard cap
 * (`timeout-minutes: 60`) and is sized so all stages complete by minute ≤ 45,
 * leaving a 15-minute buffer for sandbox setup, MCP gateway boot, the
 * deterministic article render, and the safe-output `create_pull_request`
 * call. The MCP gateway session timeout (`engine.mcp.session-timeout`,
 * gh-aw v0.71.3+) is set to `65m` per workflow so the safeoutputs HTTP
 * session stays alive for the full duration — superseding the previous
 * 28–30 min safeoutputs TTL constraint that gated the 45-min cap. */
export interface StageBudgetConfig {
  /** Stage A — data collection. */
  readonly A: number;
  /** Stage B — analysis (1 + 2 pass). Single largest budget. */
  readonly B: number;
  /** Stage C — completeness gate. */
  readonly C: number;
  /** Stage D — article rendering. */
  readonly D: number;
  /** Stage E — single-PR safe-output. Should fit in ≤ 2 minutes. */
  readonly E: number;
}

/** Triggers that schedule the workflow. */
export interface CadenceConfig {
  /** Cron expression in `* * * * *` form (UTC). `null` for manual-only. */
  readonly cron: string | null;
  /** Free-text description for documentation tables. */
  readonly description: string;
  /** Auxiliary triggering events (e.g. `t-180-election`). */
  readonly triggerEvents?: readonly string[];
}

/** Single horizon configuration entry. */
export interface ArticleHorizonConfig {
  /** Article-type slug — matches `ArticleCategory` value. */
  readonly slug: string;
  /** Inherent perspective — derived from `CATEGORY_PERSPECTIVE`. */
  readonly perspective: ArticlePerspective;
  /** Time period bucket — derived from `CATEGORY_TIME_PERIOD`. May be
   *  absent for categories without a periodic scope (breaking, deep). */
  readonly timePeriod?: TimePeriod | undefined;
  /** Data-collection window relative to the run date. */
  readonly dataWindow: DataWindowConfig;
  /** Scheduling cadence. */
  readonly cadence: CadenceConfig;
  /** EP MCP tool/feed names that *must* be probed in Stage A. */
  readonly primaryFeeds: readonly string[];
  /** Mandatory analysis-artifact relative paths under `analysis/daily/<date>/<slug>/`. */
  readonly mandatoryArtifacts: readonly string[];
  /** Optional artifacts — produced when data supports them. */
  readonly optionalArtifacts: readonly string[];
  /** Stage budget. Sum should be ≤ 50 (60-min `timeout-minutes` cap with
   *  ≥ 10-min buffer for sandbox/render/PR call). */
  readonly stageBudgets: StageBudgetConfig;
  /** Scenario-forecast maximum horizon in months. */
  readonly scenarioMaxHorizonMonths: number;
  /** Number of days into the future that forward-statements registry
   *  carries open items for this horizon (week-ahead = 7, term-outlook =
   *  ~1500). Bounded at 1825 by the registry. */
  readonly forwardStatementsHorizonDays: number;
  /** When `true`, Family-D electoral artifacts are mandatory and the
   *  scenario-forecast must include an EP-election outcome branch. */
  readonly electoralOverlay: boolean;
}

/** Stage budgets shared by the four short/mid prospective horizons.
 *  Sum 35 — completes by minute ~35 within the 60-min cap; Pass 1 ends
 *  at minute ~22 (Stage A end + ~12 min B1), Pass 2 occupies minute
 *  22→32, Stage C at 32→36, Stage D 36→38, Stage E 38→40. */
const PROSPECTIVE_BUDGETS: StageBudgetConfig = { A: 5, B: 22, C: 4, D: 2, E: 2 };

/** Stage budgets shared by retrospective horizons. Sum 34 — same shape
 *  as PROSPECTIVE_BUDGETS but Stage A is one minute lighter (no
 *  forward-statements registry pre-read). */
const RETROSPECTIVE_BUDGETS: StageBudgetConfig = { A: 4, B: 22, C: 4, D: 2, E: 2 };

/** Stage budgets for long-horizon electoral runs. Sum 41 — extended
 *  Stage B (28 min) for the larger Family-D + electoral-overlay
 *  artifact set (mandate-scorecard, seat-projection, term-arc, etc.)
 *  while keeping the same Stage C/D/E budgets. PR-call still lands by
 *  minute ~45 inside the 60-min cap and 65-min MCP session window. */
const ELECTORAL_BUDGETS: StageBudgetConfig = { A: 5, B: 28, C: 4, D: 2, E: 2 };

/** Standard EP MCP feeds reused across horizons. */
const STANDARD_FEEDS = [
  'get_plenary_sessions',
  'get_meeting_foreseen_activities',
  'get_voting_records',
  'get_meps',
  'get_political_groups',
  'get_committee_info',
  'get_procedures',
  'get_external_documents',
] as const;

/** Mandatory artifacts shared by every prospective horizon. Long-horizon
 *  variants additionally require `forward-projection.md`. */
const PROSPECTIVE_MANDATORY = [
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
  A_WILDCARDS,
  A_HISTORICAL,
  A_ECONOMIC,
  A_THREAT,
  A_MCP_AUDIT,
  A_INDEX,
  A_REFLECTION,
] as const;

/** Mandatory artifacts shared by every retrospective horizon. */
const RETROSPECTIVE_MANDATORY = [
  A_SIGNIFICANCE,
  A_ACTOR_MAP,
  A_FORCES,
  A_IMPACT,
  A_RISK_MATRIX,
  A_QUANT_SWOT,
  A_SYNTHESIS,
  A_COALITION,
  A_VOTING,
  A_PESTLE,
  A_STAKEHOLDER,
  A_HISTORICAL,
  A_ECONOMIC,
  A_THREAT,
  A_MCP_AUDIT,
  A_INDEX,
  A_REFLECTION,
] as const;

/** Mandatory artifacts unique to long-horizon prospective runs. */
const LONG_HORIZON_PROSPECTIVE_EXTRA = [
  A_FORWARD_PROJECTION,
  A_PIPELINE_FORECAST,
  A_CALENDAR_PROJECTION,
  A_FORWARD_INDICATORS,
] as const;

/** Mandatory artifacts unique to electoral horizons. */
const ELECTORAL_EXTRA = [
  A_FORWARD_PROJECTION,
  A_TERM_ARC,
  A_SEAT_PROJECTION,
  A_MANDATE_SCORECARD,
  A_PRESIDENCY_TRIO,
  A_COMMISSION_WP,
  A_FORWARD_INDICATORS,
  A_COMPARATIVE_INTL,
  A_HISTORICAL_PARALLELS,
] as const;

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
    cadence: { cron: '0 6 * * 0', description: 'Weekly — Sunday 06:00 UTC' },
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
    cadence: { cron: '0 6 1 * *', description: 'Monthly — 1st @ 06:00 UTC' },
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
    cadence: { cron: '0 6 * * 6', description: 'Weekly — Saturday 06:00 UTC' },
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
    cadence: { cron: '0 6 5 * *', description: 'Monthly — 5th @ 06:00 UTC' },
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
    cadence: { cron: '0 */4 * * *', description: 'Every 4 hours' },
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
    cadence: { cron: '0 7 * * 1', description: 'Weekly — Monday 07:00 UTC' },
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
    cadence: { cron: '0 7 * * 2', description: 'Weekly — Tuesday 07:00 UTC' },
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
    cadence: { cron: '0 7 * * 3', description: 'Weekly — Wednesday 07:00 UTC' },
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

/**
 * Look up the horizon config for a slug. Returns `undefined` for unknown
 * slugs — callers should fall back to a generic humanise.
 *
 * @param slug - article-type slug (e.g. `quarter-ahead`)
 * @returns The matching {@link ArticleHorizonConfig} or `undefined`.
 */
export function getHorizonConfig(slug: string): ArticleHorizonConfig | undefined {
  for (const cfg of Object.values(ARTICLE_HORIZONS)) {
    if (cfg.slug === slug) return cfg;
  }
  return undefined;
}

/**
 * Slugs of every prospective horizon (forward-looking).
 *
 * @returns Frozen array of slugs whose perspective is `PROSPECTIVE` or `ELECTORAL`
 *          with `direction: 'forward'`.
 */
export function getProspectiveSlugs(): readonly string[] {
  return Object.freeze(
    Object.values(ARTICLE_HORIZONS)
      .filter(
        (h) =>
          h.perspective === ArticlePerspective.PROSPECTIVE ||
          (h.perspective === ArticlePerspective.ELECTORAL && h.dataWindow.direction === 'forward')
      )
      .map((h) => h.slug)
  );
}

/**
 * Slugs that require electoral-overlay artifacts.
 *
 * @returns Frozen array of slugs whose `electoralOverlay` flag is true.
 */
export function getElectoralOverlaySlugs(): readonly string[] {
  return Object.freeze(
    Object.values(ARTICLE_HORIZONS)
      .filter((h) => h.electoralOverlay)
      .map((h) => h.slug)
  );
}

/**
 * Mandatory artifacts for a given slug, drawn from the registry.
 *
 * @param slug - article-type slug
 * @returns Frozen array of mandatory artifact paths, or empty when slug is unknown.
 */
export function getMandatoryArtifacts(slug: string): readonly string[] {
  const cfg = getHorizonConfig(slug);
  return cfg ? cfg.mandatoryArtifacts : [];
}
