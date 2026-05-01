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
 * The aggregator (`src/aggregator/article-metadata.ts`), validator
 * (`scripts/validate-analysis-completeness.js`), forward-statements
 * registry (`scripts/aggregator/forward-statements-registry.js`) and the
 * drift-guard tests all consume this registry — so once the four steps
 * are done, the new horizon is fully wired end-to-end.
 *
 * The registry replaces the hard-coded `switch` previously hidden inside
 * `templateForType()` (article-metadata.ts) and the per-slug map inside
 * `validate-analysis-completeness.js`. Both are now driven from this one
 * file, eliminating the long-standing drift between them.
 *
 * @see analysis/methodologies/forward-projection-methodology.md
 * @see analysis/methodologies/electoral-cycle-methodology.md
 */
import { ArticleCategory, ArticlePerspective, CATEGORY_PERSPECTIVE, CATEGORY_TIME_PERIOD, } from '../types/index.js';
/** Stage budgets shared by the four short/mid prospective horizons. */
const PROSPECTIVE_BUDGETS = { A: 5, B: 14, C: 3, D: 2, E: 1 };
/** Stage budgets shared by retrospective horizons. */
const RETROSPECTIVE_BUDGETS = { A: 4, B: 14, C: 3, D: 2, E: 1 };
/** Stage budgets for long-horizon electoral runs. */
const ELECTORAL_BUDGETS = { A: 5, B: 18, C: 3, D: 2, E: 1 };
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
];
/** Mandatory artifacts shared by every prospective horizon. Long-horizon
 *  variants additionally require `forward-projection.md`. */
const PROSPECTIVE_MANDATORY = [
    'classification/significance-classification.md',
    'classification/actor-mapping.md',
    'classification/forces-analysis.md',
    'classification/impact-matrix.md',
    'risk-scoring/risk-matrix.md',
    'risk-scoring/quantitative-swot.md',
    'intelligence/synthesis-summary.md',
    'intelligence/coalition-dynamics.md',
    'intelligence/scenario-forecast.md',
    'intelligence/pestle-analysis.md',
    'intelligence/stakeholder-map.md',
    'intelligence/wildcards-blackswans.md',
    'intelligence/historical-baseline.md',
    'intelligence/economic-context.md',
    'intelligence/threat-model.md',
    'intelligence/mcp-reliability-audit.md',
    'intelligence/analysis-index.md',
    'intelligence/methodology-reflection.md',
];
/** Mandatory artifacts shared by every retrospective horizon. */
const RETROSPECTIVE_MANDATORY = [
    'classification/significance-classification.md',
    'classification/actor-mapping.md',
    'classification/forces-analysis.md',
    'classification/impact-matrix.md',
    'risk-scoring/risk-matrix.md',
    'risk-scoring/quantitative-swot.md',
    'intelligence/synthesis-summary.md',
    'intelligence/coalition-dynamics.md',
    'intelligence/voting-patterns.md',
    'intelligence/pestle-analysis.md',
    'intelligence/stakeholder-map.md',
    'intelligence/historical-baseline.md',
    'intelligence/economic-context.md',
    'intelligence/threat-model.md',
    'intelligence/mcp-reliability-audit.md',
    'intelligence/analysis-index.md',
    'intelligence/methodology-reflection.md',
];
/** Mandatory artifacts unique to long-horizon prospective runs. */
const LONG_HORIZON_PROSPECTIVE_EXTRA = [
    'intelligence/forward-projection.md',
    'intelligence/legislative-pipeline-forecast.md',
    'intelligence/parliamentary-calendar-projection.md',
    'extended/forward-indicators.md',
];
/** Mandatory artifacts unique to electoral horizons. */
const ELECTORAL_EXTRA = [
    'intelligence/forward-projection.md',
    'intelligence/term-arc.md',
    'intelligence/seat-projection.md',
    'intelligence/mandate-fulfilment-scorecard.md',
    'intelligence/presidency-trio-context.md',
    'intelligence/commission-wp-alignment.md',
    'extended/forward-indicators.md',
    'extended/comparative-international.md',
    'extended/historical-parallels.md',
];
/**
 * Master registry — every {@link ArticleCategory} maps to its full
 * horizon config. The TypeScript `Record<ArticleCategory, ...>` type
 * forces this map to stay complete at compile time.
 */
export const ARTICLE_HORIZONS = {
    [ArticleCategory.WEEK_AHEAD]: {
        slug: 'week-ahead',
        perspective: CATEGORY_PERSPECTIVE[ArticleCategory.WEEK_AHEAD],
        timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.WEEK_AHEAD],
        dataWindow: { direction: 'forward', days: 7, anchor: 'today' },
        cadence: { cron: '0 6 * * 0', description: 'Weekly — Sunday 06:00 UTC' },
        primaryFeeds: [...STANDARD_FEEDS],
        mandatoryArtifacts: [...PROSPECTIVE_MANDATORY],
        optionalArtifacts: ['extended/executive-brief.md'],
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
        mandatoryArtifacts: [...PROSPECTIVE_MANDATORY],
        optionalArtifacts: ['extended/executive-brief.md'],
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
        optionalArtifacts: [
            'intelligence/presidency-trio-context.md',
            'intelligence/commission-wp-alignment.md',
            'extended/executive-brief.md',
        ],
        stageBudgets: { A: 5, B: 14, C: 3, D: 2, E: 1 },
        scenarioMaxHorizonMonths: 6,
        forwardStatementsHorizonDays: 180,
        electoralOverlay: false,
    },
    [ArticleCategory.YEAR_AHEAD]: {
        slug: 'year-ahead',
        perspective: CATEGORY_PERSPECTIVE[ArticleCategory.YEAR_AHEAD],
        timePeriod: CATEGORY_TIME_PERIOD[ArticleCategory.YEAR_AHEAD],
        dataWindow: { direction: 'forward', days: 365, anchor: 'today' },
        cadence: { cron: '0 8 2 1,4,7,10 *', description: 'Quarterly — 2nd of Jan/Apr/Jul/Oct @ 08:00 UTC' },
        primaryFeeds: [...STANDARD_FEEDS],
        mandatoryArtifacts: [
            ...PROSPECTIVE_MANDATORY,
            ...LONG_HORIZON_PROSPECTIVE_EXTRA,
            'intelligence/presidency-trio-context.md',
            'intelligence/commission-wp-alignment.md',
        ],
        optionalArtifacts: [
            'intelligence/seat-projection.md',
            'extended/executive-brief.md',
            'extended/historical-parallels.md',
        ],
        stageBudgets: { A: 5, B: 15, C: 3, D: 2, E: 1 },
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
        optionalArtifacts: ['extended/executive-brief.md'],
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
        optionalArtifacts: ['extended/executive-brief.md'],
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
        cadence: { cron: '0 8 5 * *', description: 'Monthly — 5th @ 08:00 UTC (after roll-call publication delay)' },
        primaryFeeds: [...STANDARD_FEEDS, 'get_voting_records'],
        mandatoryArtifacts: [
            ...RETROSPECTIVE_MANDATORY,
            'intelligence/legislative-pipeline-forecast.md',
        ],
        optionalArtifacts: [
            'intelligence/presidency-trio-context.md',
            'intelligence/commission-wp-alignment.md',
            'extended/executive-brief.md',
        ],
        stageBudgets: { A: 4, B: 14, C: 3, D: 2, E: 1 },
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
            'intelligence/mandate-fulfilment-scorecard.md',
            'intelligence/term-arc.md',
            'intelligence/legislative-pipeline-forecast.md',
            'intelligence/presidency-trio-context.md',
            'intelligence/commission-wp-alignment.md',
            'extended/historical-parallels.md',
        ],
        optionalArtifacts: [
            'intelligence/seat-projection.md',
            'extended/executive-brief.md',
            'extended/comparative-international.md',
        ],
        stageBudgets: { A: 5, B: 15, C: 3, D: 2, E: 1 },
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
        mandatoryArtifacts: [
            ...PROSPECTIVE_MANDATORY,
            ...ELECTORAL_EXTRA,
        ],
        optionalArtifacts: ['extended/executive-brief.md'],
        stageBudgets: { A: 5, B: 15, C: 3, D: 2, E: 1 },
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
            description: 'Annual — 1 Dec @ 08:00 UTC, plus T-180 / T-90 / T-30 election-imminent triggers',
            triggerEvents: ['election-imminent-t180', 'election-imminent-t90', 'election-imminent-t30'],
        },
        primaryFeeds: [...STANDARD_FEEDS, 'get_voting_records'],
        mandatoryArtifacts: [
            ...PROSPECTIVE_MANDATORY,
            ...ELECTORAL_EXTRA,
            'intelligence/mandate-fulfilment-scorecard.md',
            'extended/historical-parallels.md',
            'extended/comparative-international.md',
        ],
        optionalArtifacts: ['extended/executive-brief.md', 'extended/devils-advocate-analysis.md'],
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
            'classification/significance-classification.md',
            'classification/actor-mapping.md',
            'classification/forces-analysis.md',
            'classification/impact-matrix.md',
            'risk-scoring/risk-matrix.md',
            'risk-scoring/quantitative-swot.md',
            'intelligence/synthesis-summary.md',
            'intelligence/coalition-dynamics.md',
            'intelligence/scenario-forecast.md',
            'intelligence/pestle-analysis.md',
            'intelligence/stakeholder-map.md',
            'intelligence/threat-model.md',
            'intelligence/mcp-reliability-audit.md',
            'intelligence/analysis-index.md',
            'intelligence/methodology-reflection.md',
        ],
        optionalArtifacts: ['extended/executive-brief.md'],
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
        optionalArtifacts: ['extended/executive-brief.md'],
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
        optionalArtifacts: ['extended/executive-brief.md'],
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
        optionalArtifacts: [
            'intelligence/legislative-pipeline-forecast.md',
            'extended/executive-brief.md',
        ],
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
            'existing/deep-analysis.md',
            'extended/intelligence-assessment.md',
            'extended/devils-advocate-analysis.md',
            'extended/historical-parallels.md',
        ],
        optionalArtifacts: [
            'intelligence/forward-projection.md',
            'extended/executive-brief.md',
            'extended/comparative-international.md',
        ],
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
export function getHorizonConfig(slug) {
    for (const cfg of Object.values(ARTICLE_HORIZONS)) {
        if (cfg.slug === slug)
            return cfg;
    }
    return undefined;
}
/**
 * Slugs of every prospective horizon (forward-looking).
 *
 * @returns Frozen array of slugs whose perspective is `PROSPECTIVE` or `ELECTORAL`
 *          with `direction: 'forward'`.
 */
export function getProspectiveSlugs() {
    return Object.freeze(Object.values(ARTICLE_HORIZONS)
        .filter((h) => h.perspective === ArticlePerspective.PROSPECTIVE ||
        (h.perspective === ArticlePerspective.ELECTORAL && h.dataWindow.direction === 'forward'))
        .map((h) => h.slug));
}
/** Slugs that require electoral-overlay artifacts. */
export function getElectoralOverlaySlugs() {
    return Object.freeze(Object.values(ARTICLE_HORIZONS)
        .filter((h) => h.electoralOverlay)
        .map((h) => h.slug));
}
/** Mandatory artifacts for a given slug, drawn from the registry. */
export function getMandatoryArtifacts(slug) {
    const cfg = getHorizonConfig(slug);
    return cfg ? cfg.mandatoryArtifacts : [];
}
//# sourceMappingURL=article-horizons.js.map