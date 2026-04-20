// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { buildStakeholderOutcomeMatrix } from '../../utils/intelligence-analysis.js';
import { AI_MARKER } from '../../constants/analysis-constants.js';
/**
 * Merge a caller-supplied {@link AnalysisOverrides} set into the default
 * `DeepAnalysis` produced by a builder.
 *
 * Undefined, null, and empty array/record overrides are ignored, so callers
 * can pass a single unified overrides object across the five builders without
 * null-guarding every field.
 *
 * @param base - The builder's default `DeepAnalysis` object.
 * @param overrides - Optional AI-authored overrides (see {@link AnalysisOverrides}).
 * @returns The merged `DeepAnalysis`.
 */
export function applyAnalysisOverrides(base, overrides) {
    if (!overrides)
        return base;
    const next = { ...base };
    if (overrides.stakeholderPerspectives && overrides.stakeholderPerspectives.length > 0) {
        next.stakeholderPerspectives = [...overrides.stakeholderPerspectives];
    }
    if (overrides.stakeholderOutcomeMatrix && overrides.stakeholderOutcomeMatrix.length > 0) {
        next.stakeholderOutcomeMatrix = [...overrides.stakeholderOutcomeMatrix];
    }
    if (overrides.impactAssessment) {
        // Only overlay dimensions whose override is non-empty and not the AI_MARKER
        // sentinel, so partial AI-authored impact blocks can coexist with fallback
        // markers for missing dimensions.
        const merged = {
            ...base.impactAssessment,
        };
        for (const key of ['political', 'economic', 'social', 'legal', 'geopolitical']) {
            const val = overrides.impactAssessment[key];
            if (typeof val === 'string' && val.length > 0 && val !== AI_MARKER) {
                merged[key] = val;
            }
        }
        next.impactAssessment = merged;
    }
    return next;
}
// ─── Style constants ─────────────────────────────────────────────────────────
export const EP_BLUE_TRANSPARENT = 'rgba(0,51,153,0.1)';
export const EP_BLUE_BORDER = '#003399';
export const CIVIL_SOCIETY = 'Civil Society';
/**
 * Build the stakeholder outcome matrix for a list of key actions.
 * Used by all 5 analysis builders to populate the outcome matrix.
 *
 * @param actions - Readonly array of (action, scores) pairs to include in the matrix
 * @returns Stakeholder outcome matrix rows
 */
export function buildOutcomeMatrix(actions) {
    return actions.map(({ action, scores, confidence }) => buildStakeholderOutcomeMatrix(action, scores, confidence));
}
/**
 * Build a placeholder impact assessment with every dimension marked `AI_MARKER`.
 *
 * This is the **last-resort fallback** used only when no AI-authored
 * `## Impact Assessment` block was parseable from the run's
 * `synthesis-summary.md` or `deep-analysis.md`.  Agentic workflows should
 * satisfy the Analysis-to-Article Data Contract (see
 * `.github/prompts/SHARED_PROMPT_PATTERNS.md#-analysis-to-article-data-contract`)
 * so this fallback is never rendered.  When it is rendered, the downstream
 * `article-rewriter` step replaces the `AI_MARKER` strings with real analysis
 * content before publication.
 *
 * @returns Impact assessment with `AI_MARKER` placeholders in every dimension.
 */
export function buildFallbackImpactAssessment() {
    return {
        political: AI_MARKER,
        economic: AI_MARKER,
        social: AI_MARKER,
        legal: AI_MARKER,
        geopolitical: AI_MARKER,
    };
}
/**
 * @deprecated Use {@link buildFallbackImpactAssessment} — the name was changed
 * to reflect that this is a last-resort path rather than the AI-integration
 * path.  The alias is retained for backward compatibility with internal
 * callers and will be removed after all builders route through
 * `buildFallbackImpactAssessment`.
 */
export const buildAiMarkerImpactAssessment = buildFallbackImpactAssessment;
/**
 * Build coalition metrics from voting patterns data.
 * Derives alignment scores and shift indicators for the coalition radar chart.
 *
 * @param patterns - Voting pattern data
 * @returns Coalition metrics object or null if no real patterns
 */
export function buildCoalitionMetricsFromPatterns(patterns) {
    const realPatterns = patterns.filter((p) => !/placeholder/i.test(p.group));
    if (realPatterns.length === 0)
        return null;
    const avgCohesion = realPatterns.reduce((sum, p) => sum + p.cohesion, 0) / realPatterns.length;
    const alignmentScore = Math.round(avgCohesion * 100);
    // Detect shift from cohesion spread
    const maxCohesion = Math.max(...realPatterns.map((p) => p.cohesion));
    const minCohesion = Math.min(...realPatterns.map((p) => p.cohesion));
    const spread = maxCohesion - minCohesion;
    const shiftIndicator = spread > 0.3 ? 'weakening' : avgCohesion > 0.7 ? 'strengthening' : 'stable';
    return {
        alignmentScore,
        votingBlocs: realPatterns.slice(0, 6).map((p) => ({
            group: p.group,
            alignmentScore: Math.round(p.cohesion * 100),
        })),
        shiftIndicator,
    };
}
/**
 * Build legislative pipeline data from WeekAheadData.
 *
 * @param weekData - Aggregated week/month data
 * @returns Legislative pipeline object
 */
export function buildPipelineFromWeekData(weekData) {
    const bottlenecked = weekData.pipeline.filter((p) => p.bottleneck === true).length;
    const total = weekData.pipeline.length;
    const onTrack = total - bottlenecked;
    const healthScore = total > 0 ? Math.round((onTrack / total) * 100) : 100;
    return {
        healthScore,
        onTrack,
        delayed: bottlenecked,
        blocked: 0,
        fastTracked: 0,
        total,
    };
}
/**
 * Build trend analytics from feed data counts using the provided periods as-is.
 *
 * @param counts - Array of activity counts per period in chronological order
 * @param period - Trend period label
 * @returns Trend analytics object or null if no data
 */
export function buildTrendFromCounts(counts, period) {
    if (counts.length === 0 || counts.every((c) => c === 0))
        return null;
    const periodLabels = counts.map((_, i) => {
        if (period === 'weekly')
            return `W${i + 1}`;
        if (period === 'monthly')
            return `M${i + 1}`;
        return `Q${i + 1}`;
    });
    const metrics = counts.map((value, i) => ({ period: periodLabels[i] ?? `${i + 1}`, value }));
    const last = counts.at(-1) ?? 0;
    const prev = counts.at(-2) ?? last;
    const change = prev > 0 ? ((last - prev) / prev) * 100 : 0;
    const direction = change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable';
    return {
        period,
        metrics,
        direction,
        weekOverWeekChange: period === 'weekly' ? Math.round(change * 10) / 10 : undefined,
        monthOverMonthChange: period === 'monthly' ? Math.round(change * 10) / 10 : undefined,
    };
}
/**
 * Build stakeholder metrics from voting patterns.
 *
 * @param patterns - Voting patterns
 * @param anomalyCount - Number of anomalies
 * @returns Stakeholder metric array
 */
export function buildStakeholderMetricsFromVoting(patterns, anomalyCount) {
    const realPatterns = patterns.filter((p) => !/placeholder/i.test(p.group));
    const metrics = realPatterns.slice(0, 4).map((p) => ({
        stakeholder: p.group,
        impactScore: Math.round(p.cohesion * 100),
        impactDirection: (p.cohesion > 0.7 ? 'positive' : p.cohesion < 0.4 ? 'negative' : 'neutral'),
    }));
    if (anomalyCount > 0) {
        metrics.push({
            stakeholder: 'Coalition stability',
            impactScore: Math.max(0, 100 - anomalyCount * 15),
            impactDirection: anomalyCount > 3 ? 'negative' : 'neutral',
        });
    }
    return metrics;
}
/**
 * Build stakeholder metrics for legislative pipeline actors.
 *
 * @param pipeline - Legislative pipeline data
 * @returns Stakeholder metric array
 */
export function buildStakeholderMetricsFromPipeline(pipeline) {
    if (!pipeline || pipeline.total === 0)
        return [];
    return [
        {
            stakeholder: 'Legislators',
            impactScore: pipeline.healthScore,
            impactDirection: pipeline.healthScore > 70 ? 'positive' : pipeline.healthScore < 40 ? 'negative' : 'neutral',
        },
        {
            stakeholder: 'Pending proposals',
            impactScore: pipeline.total > 0 ? Math.round((pipeline.blocked / pipeline.total) * 100) : 0,
            impactDirection: pipeline.blocked > 0 ? 'negative' : 'neutral',
            description: pipeline.blocked > 0
                ? `${pipeline.blocked} blocked procedure${pipeline.blocked > 1 ? 's' : ''}`
                : undefined,
        },
    ];
}
/**
 * Build a stakeholder panel from stakeholder metric array.
 *
 * @param d - Localized strings
 * @param stakeholderMetrics - Stakeholder metric data
 * @returns Panel object or null
 */
export function buildStakeholderPanel(d, stakeholderMetrics) {
    if (stakeholderMetrics.length === 0)
        return null;
    return {
        title: d.stakeholderImpact,
        metrics: stakeholderMetrics.map((s) => ({
            label: s.stakeholder,
            value: `${s.impactScore}/100`,
            trend: (s.impactDirection === 'positive'
                ? 'up'
                : s.impactDirection === 'negative'
                    ? 'down'
                    : 'stable'),
        })),
    };
}
/**
 * Resolve a direction label from trend direction.
 *
 * @param d - Localized strings
 * @param direction - Trend direction
 * @returns Localized direction label
 */
export function resolveTrendDirectionLabel(d, direction) {
    if (direction === 'improving')
        return d.trendImproving;
    if (direction === 'declining')
        return d.trendDeclining;
    return d.trendStableLabel;
}
/**
 * Build a generic trend panel from a trend object.
 *
 * @param d - Localized strings
 * @param trend - Trend analytics
 * @param labels - Labels for x-axis
 * @param datasetLabel - Label for the dataset
 * @returns Panel object or null
 */
export function buildGenericTrendPanel(d, trend, labels, datasetLabel) {
    if (!trend)
        return null;
    return {
        title: d.trendAnalysis,
        metrics: [
            {
                label: d.trendAnalysis,
                value: resolveTrendDirectionLabel(d, trend.direction),
            },
        ],
        chart: {
            type: 'line',
            title: d.activityTrendChart,
            data: {
                labels,
                datasets: [
                    {
                        label: datasetLabel,
                        data: trend.metrics.map((m) => m.value),
                        borderColor: EP_BLUE_BORDER,
                        backgroundColor: EP_BLUE_TRANSPARENT,
                    },
                ],
            },
        },
    };
}
/**
 * Build a category distribution panel showing counts per category as a bar chart.
 * Unlike `buildGenericTrendPanel`, this does not compute direction or week-over-week
 * change metrics, which are only meaningful for chronological time-series data.
 *
 * @param d - Localized strings
 * @param labels - Category labels for x-axis
 * @param counts - Counts per category (must align with labels)
 * @param datasetLabel - Label for the dataset
 * @param title - Panel title
 * @returns Panel object or null if all counts are zero
 */
export function buildCategoryDistributionPanel(d, labels, counts, datasetLabel, title) {
    if (counts.length === 0 || counts.every((c) => c === 0))
        return null;
    return {
        title,
        metrics: [
            {
                label: d.trendAnalysis,
                value: `${counts.reduce((a, b) => a + b, 0)} total`,
            },
        ],
        chart: {
            type: 'bar',
            title,
            data: {
                labels: [...labels],
                datasets: [
                    {
                        label: datasetLabel,
                        data: [...counts],
                        borderColor: EP_BLUE_BORDER,
                        backgroundColor: EP_BLUE_TRANSPARENT,
                    },
                ],
            },
        },
    };
}
//# sourceMappingURL=shared-builders.js.map