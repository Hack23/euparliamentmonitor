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

// ─── Intelligence Mindmap types ──────────────────────────────────────────────

/**
 * Category of a node within an intelligence mindmap.
 * - `policy_domain` — top-level EU policy area (e.g. ENVI, ECON, AFET)
 * - `sub_topic` — sub-issue within a policy domain
 * - `actor` — MEP, political group, committee, or external stakeholder
 * - `action` — a specific legislative act or parliamentary action
 * - `outcome` — the result or consequence of an action
 */
export type MindmapNodeCategory = 'policy_domain' | 'sub_topic' | 'actor' | 'action' | 'outcome';

/**
 * Type of connection between two nodes in an intelligence mindmap.
 * - `legislative` — formal procedural/legal link between nodes
 * - `political` — alliance, coalition, or adversarial political relationship
 * - `procedural` — committee-stage or plenary procedural link
 * - `thematic` — shared policy theme or topic overlap
 */
export type PolicyConnectionType = 'legislative' | 'political' | 'procedural' | 'thematic';

/**
 * Strength of a policy connection.
 * - `strong` — clearly evidenced, high-confidence link
 * - `moderate` — supported by indirect evidence
 * - `weak` — emerging or low-confidence relationship
 */
export type PolicyConnectionStrength = 'strong' | 'moderate' | 'weak';

/**
 * Type of actor in the actor-network.
 * - `mep` — individual Member of European Parliament
 * - `group` — political group (EPP, S&D, Renew, etc.)
 * - `committee` — EP standing committee (ENVI, ECON, etc.)
 * - `external` — non-EP stakeholder (Commission, Council, NGO, etc.)
 */
export type ActorType = 'mep' | 'group' | 'committee' | 'external';

/**
 * A single node in the intelligence mindmap.
 * Nodes are arranged in depth layers: domain → sub-topic → actor → action → outcome.
 */
export interface MindmapNode {
  /** Unique node identifier (used for connection references). */
  readonly id: string;
  /** Human-readable label rendered inside the node. */
  readonly label: string;
  /** Node category determining visual styling. */
  readonly category: MindmapNodeCategory;
  /** Normalized influence weight 0–1 (drives `--node-influence` CSS var). */
  readonly influence: number;
  /** Semantic color key from the 8-color branch palette. */
  readonly color: string;
  /** Child nodes one layer deeper in the hierarchy. */
  readonly children: readonly MindmapNode[];
  /** Optional EP-specific metadata for hover/detail rendering. */
  readonly metadata?:
    | {
        readonly committee?: string | undefined;
        readonly politicalGroup?: string | undefined;
        readonly documentRef?: string | undefined;
      }
    | undefined;
}

/**
 * A single depth layer in the intelligence mindmap hierarchy.
 * Layer 0 is the central topic; higher depths are progressively detailed.
 */
export interface MindmapLayer {
  /** Layer depth (0 = center, 1 = domains, 2 = sub-topics, 3 = actors, 4 = actions/outcomes). */
  readonly depth: number;
  /** Nodes belonging to this layer. */
  readonly nodes: readonly MindmapNode[];
}

/**
 * A directed connection between two mindmap nodes revealing policy linkages.
 */
export interface PolicyConnection {
  /** ID of the source node. */
  readonly from: string;
  /** ID of the target node. */
  readonly to: string;
  /** Confidence level of the relationship. */
  readonly strength: PolicyConnectionStrength;
  /** Nature of the relationship. */
  readonly type: PolicyConnectionType;
  /** EP document reference or description serving as evidence. */
  readonly evidence: string;
}

/**
 * A parliamentary or external actor node in the network.
 * Used to represent MEPs, political groups, committees, or external stakeholders.
 */
export interface ActorNode {
  /** Unique actor identifier. */
  readonly id: string;
  /** Display name of the actor. */
  readonly name: string;
  /** Category of actor. */
  readonly type: ActorType;
  /** Normalized influence score 0–1. */
  readonly influence: number;
  /** IDs of connected nodes in the network. */
  readonly connections: readonly string[];
}

/**
 * Influence weight entry for a mindmap node.
 * Provides justification for a node's computed influence score.
 */
export interface InfluenceWeight {
  /** Node being scored. */
  readonly nodeId: string;
  /** Normalized weight 0–1. */
  readonly weight: number;
  /** Human-readable factors explaining the score. */
  readonly factors: readonly string[];
}

/**
 * Complete intelligence mindmap data structure.
 * Combines layered policy domain nodes, actor-network relationships,
 * policy connections, and optional stakeholder perspective overlays.
 *
 * @example
 * ```typescript
 * const imap: IntelligenceMindmap = {
 *   centralTopic: 'EU Climate Policy Intelligence',
 *   layers: [{ depth: 1, nodes: [{ id: 'envi', label: 'Environment', category: 'policy_domain', ... }] }],
 *   connections: [{ from: 'envi', to: 'econ', strength: 'strong', type: 'legislative', evidence: 'Green Deal' }],
 *   actorNetwork: [{ id: 'envi-cmt', name: 'ENVI Committee', type: 'committee', influence: 0.9, connections: [] }],
 *   stakeholderGroups: ['Industry', 'Civil Society', 'Member States'],
 * };
 * ```
 */
export interface IntelligenceMindmap {
  /** Central topic label for the root node. */
  readonly centralTopic: string;
  /** Ordered depth layers from domains (1) to outcomes (4). */
  readonly layers: readonly MindmapLayer[];
  /** Cross-cutting connections between nodes in different branches. */
  readonly connections: readonly PolicyConnection[];
  /** Actor-network nodes (MEPs, groups, committees, external). */
  readonly actorNetwork: readonly ActorNode[];
  /** Optional stakeholder group labels for `<details>` overlay sections. */
  readonly stakeholderGroups?: readonly string[] | undefined;
  /** Optional summary rendered above the mindmap. */
  readonly summary?: string | undefined;
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
