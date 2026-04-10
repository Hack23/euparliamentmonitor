// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { buildStakeholderOutcomeMatrix } from '../../utils/intelligence-analysis.js';
import { AI_MARKER } from '../../constants/analysis-constants.js';
export function buildOutcomeMatrix(actions) {
    return actions.map(({ action, scores, confidence }) => buildStakeholderOutcomeMatrix(action, scores, confidence));
}
// ─── Voting analysis text helpers ─────────────────────────────────────────────
/**
 * Build the "what" summary for a voting analysis, including intensity metrics.
 *
 * @param dateFrom - Period start
 * @param dateTo - Period end
 * @param recordCount - Real voting record count
 * @param adoptedCount - Adopted count
 * @param rejectedCount - Rejected count
 * @param anomalyCount - Anomaly count
 * @param patternCount - Pattern count
 * @param questionCount - Question count
 * @param intensity - Voting intensity metrics (may be null)
 * @param polarization - Polarization index (may be null)
 * @returns Summary text
 */
export function buildAiMarkerImpactAssessment() {
    return {
        political: AI_MARKER,
        economic: AI_MARKER,
        social: AI_MARKER,
        legal: AI_MARKER,
        geopolitical: AI_MARKER,
    };
}
/**

export function buildTrendFromCounts(
  counts: readonly number[],
  period: TrendAnalytics['period']
): TrendAnalytics | null {
  if (counts.length === 0 || counts.every((c) => c === 0)) return null;

  const periodLabels = counts.map((_, i) => {
    if (period === 'weekly') return `W${i + 1}`;
    if (period === 'monthly') return `M${i + 1}`;
    return `Q${i + 1}`;
  });

  const metrics = counts.map((value, i) => ({ period: periodLabels[i] ?? `${i + 1}`, value }));

  const last = counts.at(-1) ?? 0;
  const prev = counts.at(-2) ?? last;
  const change = prev > 0 ? ((last - prev) / prev) * 100 : 0;
  const direction: TrendAnalytics['direction'] =
    change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable';

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
// ─── Dashboard chart colours ────────────────────────────────────────────────
export const EP_BLUE_TRANSPARENT = 'rgba(0,51,153,0.1)';
/** EP blue border color used for chart lines */
export const EP_BLUE_BORDER = '#003399';
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
 * Build dashboard for week-ahead / month-ahead articles.
 * Includes pipeline status bars and trend analytics panels.
 *
 * @param weekData - Aggregated week/month data
 * @param _label - "week" or "month" (reserved for future localisation)
 * @param lang - Target language code
 * @returns Dashboard configuration with pipeline and trend intelligence
 */
export function buildProspectiveDashboard(weekData, _label, lang = 'en') {
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const bottleneckCount = weekData.pipeline.filter((p) => p.bottleneck === true).length;
    const scheduledPanel = {
        title: d.scheduledActivity,
        metrics: [
            { label: d.plenaryEvents, value: String(weekData.events.length) },
            { label: d.committeeMeetings, value: String(weekData.committees.length) },
            { label: d.documents, value: String(weekData.documents.length) },
            {
                label: d.pipelineProcedures,
                value: String(weekData.pipeline.length),
                trend: bottleneckCount > 0 ? 'down' : 'stable',
            },
        ],
    };
    const questionsPanel = {
        title: d.parliamentaryQuestions,
        metrics: [
            { label: d.questionsFiled, value: String(weekData.questions.length) },
            {
                label: d.bottleneckProcedures,
                value: String(bottleneckCount),
                trend: bottleneckCount > 0 ? 'down' : 'up',
            },
        ],
    };
    // Pipeline status panel
    const pipeline = buildPipelineFromWeekData(weekData);
    const pipelinePanel = pipeline.total > 0
        ? {
            title: d.pipelineStatus,
            metrics: [
                {
                    label: d.onTrack,
                    value: String(pipeline.onTrack),
                    trend: pipeline.onTrack > pipeline.delayed ? 'up' : 'stable',
                },
                {
                    label: d.delayed,
                    value: String(pipeline.delayed),
                    trend: pipeline.delayed > 0 ? 'down' : 'stable',
                },
                { label: d.healthScore, value: `${pipeline.healthScore}%` },
            ],
            chart: {
                type: 'bar',
                title: d.pipelineStatusChart,
                data: {
                    labels: [d.onTrack, d.delayed],
                    datasets: [
                        {
                            label: d.procedures,
                            data: [pipeline.onTrack, pipeline.delayed],
                            backgroundColor: ['#28a745', '#ffc107'],
                        },
                    ],
                },
            },
        }
        : null;
    // Trend analytics from activity counts
    const activityCounts = [
        weekData.events.length,
        weekData.committees.length,
        weekData.documents.length,
        weekData.questions.length,
    ].filter((c) => c > 0);
    const trend = activityCounts.length >= 2 ? buildTrendFromCounts(activityCounts, 'weekly') : null;
    const trendPanel = buildGenericTrendPanel(d, trend, [d.plenaryEvents, d.committeeMeetings, d.documents, d.questionsFiled], d.scheduledActivity);
    const panels = [
        scheduledPanel,
        questionsPanel,
        ...(pipelinePanel ? [pipelinePanel] : []),
        ...(trendPanel ? [trendPanel] : []),
    ];
    return { panels };
}
/**
 * Build dashboard for breaking news articles.
 * Includes activity trend sparklines for cross-article analysis.
 *
 * @param feedData - EP feed data
 * @param lang - Target language code
 * @returns Dashboard configuration with trend intelligence
 */
export function buildBreakingDashboard(feedData, lang = 'en') {
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const adoptedCount = feedData?.adoptedTexts.length ?? 0;
    const eventCount = feedData?.events.length ?? 0;
    const procCount = feedData?.procedures.length ?? 0;
    const mepCount = feedData?.mepUpdates.length ?? 0;
    const totalItems = adoptedCount + eventCount + procCount + mepCount;
    const feedPanel = {
        title: d.feedActivity,
        metrics: [
            {
                label: d.adoptedTexts,
                value: String(adoptedCount),
                trend: adoptedCount > 0 ? 'up' : 'stable',
            },
            { label: d.events, value: String(eventCount) },
            { label: d.procedures, value: String(procCount) },
            { label: d.mepUpdates, value: String(mepCount) },
        ],
    };
    const summaryPanel = {
        title: d.activitySummary,
        metrics: [{ label: d.totalItems, value: String(totalItems) }],
        ...(totalItems > 0
            ? {
                chart: {
                    type: 'doughnut',
                    title: d.feedBreakdown,
                    data: {
                        labels: [d.adoptedTexts, d.events, d.procedures, d.mepUpdates],
                        datasets: [
                            {
                                label: d.items,
                                data: [adoptedCount, eventCount, procCount, mepCount],
                            },
                        ],
                    },
                },
            }
            : {}),
    };
    // Trend analytics from feed counts
    const feedCounts = [adoptedCount, eventCount, procCount, mepCount];
    const trend = buildTrendFromCounts(feedCounts, 'weekly');
    const trendPanel = buildGenericTrendPanel(d, trend, [d.adoptedTexts, d.events, d.procedures, d.mepUpdates], d.feedActivity);
    const panels = [feedPanel, summaryPanel, ...(trendPanel ? [trendPanel] : [])];
    return { panels };
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
 * Build a pipeline status breakdown panel for propositions dashboard.
 *
 * @param d - Localized strings
 * @param pipeline - Legislative pipeline data
 * @returns Panel object or null
 */
// ─── Shared label constants ─────────────────────────────────────────────────
export const CIVIL_SOCIETY = 'Civil Society';
export function makeDimension(name, strengths, weaknesses, opportunities, threats) {
    return { name, strengths, weaknesses, opportunities, threats };
}
/**
 * Build stakeholder views for voting multi-dimensional SWOT.
 *
 * @param adoptedCount - Number of adopted votes
 * @param realAnomalies - Non-placeholder anomalies
 * @param highSeverity - High-severity anomalies
 * @param highCohesion - High-cohesion patterns
 * @param lowCohesion - Low-cohesion patterns
 * @param realPatterns - Non-placeholder patterns
 * @param s - Localized SWOT builder strings
 * @returns Stakeholder views map
 */
//# sourceMappingURL=shared-builders.js.map