// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Visualization
 * @description Type definitions for SWOT analysis and dashboard visualization
 * components. These types enable agentic workflows to extend any article type
 * with structured SWOT diagrams and data dashboards using data from MCP
 * servers or other data sources.
 */

// ─── SWOT Analysis types ─────────────────────────────────────────────────────

/**
 * A single item within a SWOT quadrant.
 * Represents one strength, weakness, opportunity, or threat.
 */
export interface SwotItem {
  /** Description of the SWOT item */
  readonly text: string;
  /** Optional severity/importance level */
  readonly severity?: 'low' | 'medium' | 'high' | undefined;
}

/**
 * Complete SWOT analysis data structure.
 * Used by agentic workflows to generate strategic analysis visualizations
 * for any article type using data from European Parliament MCP or other sources.
 *
 * @example
 * ```typescript
 * const swot: SwotAnalysis = {
 *   title: 'Digital Markets Act — Strategic Assessment',
 *   strengths: [{ text: 'Broad political support', severity: 'high' }],
 *   weaknesses: [{ text: 'Complex enforcement mechanisms', severity: 'medium' }],
 *   opportunities: [{ text: 'Global regulatory leadership', severity: 'high' }],
 *   threats: [{ text: 'Industry lobbying resistance', severity: 'medium' }],
 * };
 * ```
 */
export interface SwotAnalysis {
  /** Optional title for the SWOT analysis */
  readonly title?: string | undefined;
  /** Internal strengths — positive factors within EU Parliament control */
  readonly strengths: readonly SwotItem[];
  /** Internal weaknesses — negative factors within EU Parliament control */
  readonly weaknesses: readonly SwotItem[];
  /** External opportunities — positive external factors */
  readonly opportunities: readonly SwotItem[];
  /** External threats — negative external factors */
  readonly threats: readonly SwotItem[];
}

// ─── SWOT Localization ───────────────────────────────────────────────────────

/**
 * Localized strings for SWOT analysis section headings, quadrant labels,
 * and accessible descriptions. Used by SWOT visualization generators
 * (including `buildSwotSection()`) for multi-language article rendering.
 */
export interface SwotStrings {
  /** Section heading (e.g. "SWOT Analysis") */
  readonly sectionHeading: string;
  /** Quadrant labels */
  readonly strengthsLabel: string;
  readonly weaknessesLabel: string;
  readonly opportunitiesLabel: string;
  readonly threatsLabel: string;
  /** Accessible quadrant descriptions */
  readonly strengthsDesc: string;
  readonly weaknessesDesc: string;
  readonly opportunitiesDesc: string;
  readonly threatsDesc: string;
  /** Axis labels */
  readonly internalLabel: string;
  readonly externalLabel: string;
}

// ─── Dashboard types ─────────────────────────────────────────────────────────

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
 * A single point in a scatter dataset.
 */
export interface ScatterPoint {
  /** X-axis value */
  readonly x: number;
  /** Y-axis value */
  readonly y: number;
}

/**
 * A single point in a bubble dataset.
 */
export interface BubblePoint {
  /** X-axis value */
  readonly x: number;
  /** Y-axis value */
  readonly y: number;
  /** Bubble radius in pixels */
  readonly r: number;
}

/**
 * A single dataset within a chart.
 * For bar/line/pie/doughnut/radar/polarArea charts, `data` is `number[]`.
 * For scatter charts, `data` is `ScatterPoint[]`.
 * For bubble charts, `data` is `BubblePoint[]`.
 * Maps to Chart.js dataset configuration.
 */
export interface ChartDataset {
  /** Dataset label (shown in legend) */
  readonly label: string;
  /** Data points — numbers for most chart types, point objects for scatter/bubble */
  readonly data: readonly number[] | readonly ScatterPoint[] | readonly BubblePoint[];
  /** Background color(s) — single color or array for per-point colors */
  readonly backgroundColor?: string | readonly string[] | undefined;
  /** Border color(s) — single color or array for per-point colors */
  readonly borderColor?: string | readonly string[] | undefined;
}

/**
 * Chart data configuration.
 * Maps to Chart.js data structure.
 */
export interface ChartData {
  /** Category labels for the x-axis or pie segments */
  readonly labels: readonly string[];
  /** One or more datasets to plot */
  readonly datasets: readonly ChartDataset[];
}

/**
 * Chart configuration for dashboard visualizations.
 * Generates a `<canvas>` element with embedded JSON configuration
 * that can be hydrated by Chart.js on the client side.
 */
export interface ChartConfig {
  /** Chart type — matches Chart.js chart types */
  readonly type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble';
  /** Chart title displayed above the chart */
  readonly title?: string | undefined;
  /** Chart data (labels + datasets) */
  readonly data: ChartData;
  /** Optional Chart.js options override (scales, plugins, annotation, etc.) */
  readonly options?: Record<string, unknown> | undefined;
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

// ─── Dashboard Localization ──────────────────────────────────────────────────

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

// ─── SWOT Builder Localization ───────────────────────────────────────────────

/**
 * Localized strings for SWOT builder item text across all 5 analysis types.
 * Template functions accept dynamic counts; plain strings are static prose.
 */
export interface SwotBuilderStrings {
  // ── Voting SWOT ──
  readonly votingHighCohesion: (count: number) => string;
  readonly votingAdopted: (count: number) => string;
  readonly votingActiveVotes: (count: number) => string;
  readonly votingLowCohesion: (count: number) => string;
  readonly votingAnomalies: (count: number) => string;
  readonly votingCrossParty: string;
  readonly votingDiverseGroups: (count: number) => string;
  readonly votingHighSeverity: (count: number) => string;
  readonly votingShiftingAlliances: string;
  // ── Prospective SWOT ──
  readonly prospectiveEvents: (count: number) => string;
  readonly prospectiveCommittees: (count: number) => string;
  readonly prospectiveBottlenecks: (count: number) => string;
  readonly prospectiveHighDensity: (count: number) => string;
  readonly prospectiveDocuments: (count: number) => string;
  readonly prospectiveQuestions: (count: number) => string;
  readonly prospectiveBottleneckRisk: string;
  readonly prospectiveSchedulingRisk: string;
  // ── Breaking SWOT ──
  readonly breakingAdopted: (count: number) => string;
  readonly breakingEvents: (count: number) => string;
  readonly breakingAnomalyWeakness: string;
  readonly breakingNoProcedures: string;
  readonly breakingProceduresActive: (count: number) => string;
  readonly breakingCoalitionOpportunity: string;
  readonly breakingAnomalyThreat: string;
  readonly breakingRapidEvents: string;
  // ── Propositions SWOT ──
  readonly propositionsHealthStrong: (pct: string) => string;
  readonly propositionsThroughputGood: (rate: number) => string;
  readonly propositionsHealthWeak: (pct: string) => string;
  readonly propositionsThroughputLow: (rate: number) => string;
  readonly propositionsPrioritisation: string;
  readonly propositionsTrilogueAcceleration: string;
  readonly propositionsCriticalCongestion: string;
  readonly propositionsOverlapping: string;
  // ── Committee SWOT ──
  readonly committeeActive: (active: number, total: number) => string;
  readonly committeeDocuments: (count: number) => string;
  readonly committeeInactive: (count: number) => string;
  readonly committeeCrossCollaboration: string;
  readonly committeeHearings: string;
  readonly committeeLowActivity: string;
  readonly committeeCompetingPriorities: string;
}

// ─── Political Intelligence Dashboard types ───────────────────────────────────

/**
 * A single voting bloc within a coalition.
 */
export interface VotingBloc {
  /** Name of the political group */
  readonly group: string;
  /** Alignment score with the coalition (0–100) */
  readonly alignmentScore: number;
  /** Optional seat count */
  readonly seats?: number | undefined;
}

/**
 * A defining vote that shaped coalition dynamics.
 */
export interface VoteHighlight {
  /** Vote title or description */
  readonly title: string;
  /** Outcome of the vote */
  readonly outcome: 'adopted' | 'rejected' | 'split';
  /** Votes in favour */
  readonly votesFor: number;
  /** Votes against */
  readonly votesAgainst: number;
}

/**
 * Coalition dynamics metrics for a parliamentary period.
 * Used to build coalition radar charts and alignment visualizations.
 */
export interface CoalitionMetrics {
  /** Overall alignment score (0–100) */
  readonly alignmentScore: number;
  /** Identified voting blocs and their cohesion */
  readonly votingBlocs: readonly VotingBloc[];
  /** Overall trend direction */
  readonly shiftIndicator: 'strengthening' | 'weakening' | 'stable';
  /** Defining votes that illustrate coalition dynamics */
  readonly keyVotes?: readonly VoteHighlight[] | undefined;
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

// ─── Dashboard Builder Localization ──────────────────────────────────────────

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
