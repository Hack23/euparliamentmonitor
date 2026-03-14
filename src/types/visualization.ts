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

// ─── Multi-Dimensional SWOT types ────────────────────────────────────────────

/**
 * Dimension name for multi-dimensional SWOT analysis.
 * Covers political, economic, social, legal, and geopolitical perspectives.
 */
export type SwotDimensionName = 'political' | 'economic' | 'social' | 'legal' | 'geopolitical';

/**
 * Stakeholder type for perspective-based SWOT views.
 */
export type StakeholderType = 'citizen' | 'industry' | 'ngo' | 'mep' | 'government' | 'media';

/**
 * A single analytical dimension within a multi-dimensional SWOT assessment.
 * Each dimension contains its own complete SWOT quadrant data, allowing
 * drill-down analysis from political, economic, social, legal, or geopolitical angles.
 */
export interface SwotDimension {
  /** Dimension identifier */
  readonly name: SwotDimensionName;
  /** Internal strengths relevant to this dimension */
  readonly strengths: readonly SwotItem[];
  /** Internal weaknesses relevant to this dimension */
  readonly weaknesses: readonly SwotItem[];
  /** External opportunities relevant to this dimension */
  readonly opportunities: readonly SwotItem[];
  /** External threats relevant to this dimension */
  readonly threats: readonly SwotItem[];
}

/**
 * Cross-reference linking a SWOT item to a specific EP document or vote.
 * Provides evidence anchoring for AI-generated SWOT assessments.
 */
export interface SwotCrossReference {
  /** Excerpt or key text of the SWOT item being referenced */
  readonly itemText: string;
  /** EP document or vote identifier (e.g. "TA-10-2024-0001") */
  readonly documentId: string;
  /** Human-readable document or vote title */
  readonly documentTitle: string;
  /** Optional URL to the EP document */
  readonly url?: string | undefined;
}

/**
 * Temporal SWOT assessment showing evolution of the analysis
 * across short, medium, and long time horizons.
 */
export interface TemporalSwotAssessment {
  /** Short-term view — covers the current week's agenda and immediate impacts */
  readonly shortTerm: SwotAnalysis;
  /** Medium-term view — covers the current quarter's legislative activity */
  readonly mediumTerm: SwotAnalysis;
  /** Long-term view — covers the current parliamentary term (optional) */
  readonly longTerm?: SwotAnalysis | undefined;
}

/**
 * Multi-dimensional SWOT analysis with political context depth.
 * Extends the basic SWOT framework with dimension-specific drill-downs,
 * stakeholder perspectives, temporal tracking, and evidence cross-references.
 *
 * @example
 * ```typescript
 * const mdSwot: MultiDimensionalSwot = {
 *   title: 'AI Act — Multi-Dimensional Assessment',
 *   dimensions: [
 *     {
 *       name: 'political',
 *       strengths: [{ text: 'Broad cross-party consensus', severity: 'high' }],
 *       weaknesses: [], opportunities: [], threats: [],
 *     },
 *   ],
 *   temporal: {
 *     shortTerm: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
 *     mediumTerm: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
 *   },
 * };
 * ```
 */
export interface MultiDimensionalSwot {
  /** Optional title for the full analysis */
  readonly title?: string | undefined;
  /** Per-dimension SWOT quadrant data */
  readonly dimensions: readonly SwotDimension[];
  /** Temporal assessment (short / medium / long term) */
  readonly temporal?: TemporalSwotAssessment | undefined;
  /** Stakeholder-specific perspectives */
  readonly stakeholderViews?: Readonly<Partial<Record<StakeholderType, SwotAnalysis>>> | undefined;
  /** Links from SWOT items to specific EP documents or votes */
  readonly crossReferences?: readonly SwotCrossReference[] | undefined;
}

/**
 * Localized UI strings for the multi-dimensional SWOT visualization.
 * Covers dimension labels, stakeholder names, temporal headings, and evidence labels.
 */
export interface MultiDimensionalSwotStrings {
  /** Heading for the dimensions drill-down section */
  readonly dimensionsLabel: string;
  /** Heading for the stakeholder perspectives section */
  readonly stakeholderPerspectivesLabel: string;
  /** Heading for the temporal analysis section */
  readonly temporalAnalysisLabel: string;
  /** Label for the short-term temporal period */
  readonly shortTermLabel: string;
  /** Label for the medium-term temporal period */
  readonly mediumTermLabel: string;
  /** Label for the long-term temporal period */
  readonly longTermLabel: string;
  /** Localized name for the political dimension */
  readonly dimensionPolitical: string;
  /** Localized name for the economic dimension */
  readonly dimensionEconomic: string;
  /** Localized name for the social dimension */
  readonly dimensionSocial: string;
  /** Localized name for the legal dimension */
  readonly dimensionLegal: string;
  /** Localized name for the geopolitical dimension */
  readonly dimensionGeopolitical: string;
  /** Localized label for citizen stakeholder */
  readonly stakeholderCitizen: string;
  /** Localized label for industry stakeholder */
  readonly stakeholderIndustry: string;
  /** Localized label for NGO / civil society stakeholder */
  readonly stakeholderNgo: string;
  /** Localized label for MEP stakeholder */
  readonly stakeholderMep: string;
  /** Localized label for government stakeholder */
  readonly stakeholderGovernment: string;
  /** Localized label for media stakeholder */
  readonly stakeholderMedia: string;
  /** Label for evidence items */
  readonly evidenceLabel: string;
  /** Heading for the cross-references section */
  readonly crossReferencesLabel: string;
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
}
