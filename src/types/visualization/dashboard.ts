// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Visualization/Dashboard
 * @description Dashboard panel / metric / config types, supporting
 * trend-analytics, stakeholder-impact, and legislative-pipeline panels,
 * plus localized strings for the Dashboard builder/renderer.
 */

import type { ChartConfig } from './charts.js';

/**
 * A single key metric displayed as a card in a dashboard.
 */
export interface DashboardMetric {
  /** Human-readable label for the metric */
  readonly label: string;
  /** Formatted display value (e.g. "85%", "1,234", "€2.5M") */
  readonly value: string;
  /** Optional percentage change from previous period */
  readonly change?: number | undefined;
  /** Optional trend direction */
  readonly trend?: 'up' | 'down' | 'stable' | undefined;
  /** Optional unit suffix (e.g. "%", "MEPs", "votes") */
  readonly unit?: string | undefined;
}

/**
 * A single panel within a dashboard.
 * Can contain metrics, a chart, or both.
 */
export interface DashboardPanel {
  /** Panel heading */
  readonly title: string;
  /** Optional key metrics displayed as cards */
  readonly metrics?: readonly DashboardMetric[] | undefined;
  /** Optional chart configuration */
  readonly chart?: ChartConfig | undefined;
}

/**
 * Complete dashboard configuration.
 * Used by agentic workflows to generate data dashboards for any article type
 * using data from European Parliament MCP, World Bank API, or other sources.
 *
 * @example
 * ```typescript
 * const dashboard: DashboardConfig = {
 *   title: 'Legislative Activity Overview',
 *   panels: [
 *     {
 *       title: 'Voting Statistics',
 *       metrics: [
 *         { label: 'Total Votes', value: '1,234', trend: 'up', change: 5.2 },
 *         { label: 'Participation Rate', value: '87%', trend: 'stable' },
 *       ],
 *       chart: {
 *         type: 'bar',
 *         data: {
 *           labels: ['EPP', 'S&D', 'Renew', 'Greens/EFA'],
 *           datasets: [{ label: 'Votes Cast', data: [400, 350, 200, 150] }],
 *         },
 *       },
 *     },
 *   ],
 * };
 * ```
 */
export interface DashboardConfig {
  /** Dashboard heading */
  readonly title?: string | undefined;
  /** Dashboard panels — each contains metrics and/or a chart */
  readonly panels: readonly DashboardPanel[];
}

/**
 * Localized strings for dashboard section UI text.
 * Used for multi-language dashboard and article rendering.
 */
export interface DashboardStrings {
  /** Default section heading (e.g. "Dashboard") */
  readonly sectionHeading: string;
  /** Trend aria-label prefix (e.g. "Trend:") */
  readonly trendPrefix: string;
  /** Localized direction label for upward trend (e.g. "increasing") */
  readonly trendUp: string;
  /** Localized direction label for downward trend (e.g. "decreasing") */
  readonly trendDown: string;
  /** Localized direction label for stable trend (e.g. "stable") */
  readonly trendStable: string;
  /** Fallback text when chart has no data */
  readonly noChartData: string;
  /** Default chart aria-label */
  readonly chartLabel: string;
  /** Column header for category column in chart fallback tables (e.g. "Category") */
  readonly categoryLabel: string;
}

/**
 * Legislative pipeline status with color-coded health indicators.
 * Used to build pipeline bar charts and status visualizations.
 */
export interface LegislativePipeline {
  /** Overall pipeline health (0–100) */
  readonly healthScore: number;
  /** Number of on-track procedures */
  readonly onTrack: number;
  /** Number of delayed procedures */
  readonly delayed: number;
  /** Number of blocked procedures */
  readonly blocked: number;
  /** Number of fast-tracked procedures */
  readonly fastTracked: number;
  /** Total procedures in pipeline */
  readonly total: number;
}

/**
 * A single trend metric data point for sparkline charts.
 */
export interface TrendMetric {
  /** Period label (e.g., "Week 1", "Jan") */
  readonly period: string;
  /** Numeric value for this period */
  readonly value: number;
}

/**
 * Trend analytics for cross-article activity patterns.
 * Used to build sparkline charts and comparison tables.
 */
export interface TrendAnalytics {
  /** Trend period granularity */
  readonly period: 'weekly' | 'monthly' | 'quarterly';
  /** Trend metrics over time */
  readonly metrics: readonly TrendMetric[];
  /** Overall direction of the trend */
  readonly direction: 'improving' | 'declining' | 'stable';
  /** Week-over-week change percentage */
  readonly weekOverWeekChange?: number | undefined;
  /** Month-over-month change percentage */
  readonly monthOverMonthChange?: number | undefined;
}

/**
 * Stakeholder impact metric for scorecards.
 */
export interface StakeholderMetric {
  /** Stakeholder group name */
  readonly stakeholder: string;
  /** Impact intensity (0–100) */
  readonly impactScore: number;
  /** Impact direction */
  readonly impactDirection: 'positive' | 'negative' | 'neutral';
  /** Brief description of impact */
  readonly description?: string | undefined;
}

/**
 * Localized strings for Dashboard builder panel titles and metric labels
 * across all 5 analysis types.
 */
export interface DashboardBuilderStrings {
  // ── Voting Dashboard ──
  readonly votingOverview: string;
  readonly totalVotes: string;
  readonly adopted: string;
  readonly rejected: string;
  readonly anomalies: string;
  readonly politicalGroupCohesion: string;
  readonly groupCohesionRates: string;
  readonly cohesionPct: string;
  // ── Prospective Dashboard ──
  readonly scheduledActivity: string;
  readonly plenaryEvents: string;
  readonly committeeMeetings: string;
  readonly documents: string;
  readonly pipelineProcedures: string;
  readonly parliamentaryQuestions: string;
  readonly questionsFiled: string;
  readonly bottleneckProcedures: string;
  // ── Breaking Dashboard ──
  readonly feedActivity: string;
  readonly adoptedTexts: string;
  readonly events: string;
  readonly procedures: string;
  readonly mepUpdates: string;
  readonly activitySummary: string;
  readonly totalItems: string;
  readonly feedBreakdown: string;
  readonly items: string;
  // ── Propositions Dashboard ──
  readonly pipelineHealth: string;
  readonly healthScore: string;
  readonly throughput: string;
  readonly status: string;
  readonly pipelineStrong: string;
  readonly pipelineModerate: string;
  readonly pipelineWeak: string;
  // ── Committee Dashboard ──
  readonly committeeOverview: string;
  readonly totalCommittees: string;
  readonly activeCommittees: string;
  readonly activityRate: string;
  readonly documentsProduced: string;
  readonly documentOutputByCommittee: string;
  readonly documentsPerCommittee: string;
  // ── Coalition Dynamics Panel ──
  readonly coalitionAlignment: string;
  readonly alignmentScore: string;
  readonly votingBlocs: string;
  readonly coalitionShift: string;
  readonly coalitionStrengthening: string;
  readonly coalitionWeakening: string;
  readonly coalitionStable: string;
  readonly coalitionRadarChart: string;
  // ── Pipeline Status Panel ──
  readonly pipelineStatus: string;
  readonly onTrack: string;
  readonly delayed: string;
  readonly blocked: string;
  readonly fastTracked: string;
  readonly pipelineStatusChart: string;
  // ── Trend Analytics Panel ──
  readonly trendAnalysis: string;
  readonly weekOverWeek: string;
  readonly monthOverMonth: string;
  readonly trendImproving: string;
  readonly trendDeclining: string;
  readonly trendStableLabel: string;
  readonly activityTrendChart: string;
  // ── Stakeholder Impact Scorecard ──
  readonly stakeholderImpact: string;
  readonly impactScore: string;
  readonly impactPositive: string;
  readonly impactNegative: string;
  readonly impactNeutral: string;
}
