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
  readonly severity?: 'low' | 'medium' | 'high';
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
  readonly title?: string;
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
  readonly change?: number;
  /** Optional trend direction */
  readonly trend?: 'up' | 'down' | 'stable';
  /** Optional unit suffix (e.g. "%", "MEPs", "votes") */
  readonly unit?: string;
}

/**
 * A single dataset within a chart.
 * Maps to Chart.js dataset configuration.
 */
export interface ChartDataset {
  /** Dataset label (shown in legend) */
  readonly label: string;
  /** Numeric data points */
  readonly data: readonly number[];
  /** Background color(s) — single color or array for per-point colors */
  readonly backgroundColor?: string | readonly string[];
  /** Border color(s) — single color or array for per-point colors */
  readonly borderColor?: string | readonly string[];
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
  readonly type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
  /** Chart title displayed above the chart */
  readonly title?: string;
  /** Chart data (labels + datasets) */
  readonly data: ChartData;
  /** Optional Chart.js options override */
  readonly options?: Record<string, unknown>;
}

/**
 * A single panel within a dashboard.
 * Can contain metrics, a chart, or both.
 */
export interface DashboardPanel {
  /** Panel heading */
  readonly title: string;
  /** Optional key metrics displayed as cards */
  readonly metrics?: readonly DashboardMetric[];
  /** Optional chart configuration */
  readonly chart?: ChartConfig;
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
  readonly title?: string;
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
  /** Fallback text when chart has no data */
  readonly noChartData: string;
  /** Default chart aria-label */
  readonly chartLabel: string;
}
