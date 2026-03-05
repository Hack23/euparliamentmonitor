// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/DashboardContent
 * @description Pure functions for building dashboard HTML sections with
 * metric cards and chart containers. Designed for agentic workflows to
 * extend any article type with data dashboards using data from European
 * Parliament MCP, World Bank API, or other data sources.
 *
 * Dashboard components:
 * - **Metric cards**: Key performance indicators with trends
 * - **Chart containers**: Canvas elements with embedded Chart.js configuration
 *   as data attributes, ready for client-side hydration
 *
 * Chart configurations are embedded as JSON in `data-chart-config` attributes
 * on `<canvas>` elements. A companion initialization script (`dashboard-charts.js`)
 * can hydrate these using Chart.js at runtime.
 */

import { escapeHTML } from '../utils/file-utils.js';
import type {
  DashboardConfig,
  DashboardPanel,
  DashboardMetric,
  ChartConfig,
} from '../types/index.js';

/** Default dashboard section heading */
const DEFAULT_DASHBOARD_HEADING = 'Dashboard';

/** Trend indicator symbols (accessible) */
const TREND_INDICATORS: Readonly<Record<string, string>> = {
  up: '↑',
  down: '↓',
  stable: '→',
};

/** CSS class for trend direction */
const TREND_CLASSES: Readonly<Record<string, string>> = {
  up: 'metric-trend-up',
  down: 'metric-trend-down',
  stable: 'metric-trend-stable',
};

// ─── Sub-section builders ────────────────────────────────────────────────────

/**
 * Build a single metric card HTML.
 *
 * @param metric - Metric data
 * @returns HTML string for one metric card
 */
function buildMetricCard(metric: DashboardMetric): string {
  const trendHtml = buildTrendIndicator(metric);
  const unitHtml = metric.unit ? ` <span class="metric-unit">${escapeHTML(metric.unit)}</span>` : '';

  return `<div class="metric-card">
                <span class="metric-label">${escapeHTML(metric.label)}</span>
                <span class="metric-value">${escapeHTML(metric.value)}${unitHtml}</span>
                ${trendHtml}
              </div>`;
}

/**
 * Build trend indicator HTML for a metric.
 *
 * @param metric - Metric with optional trend and change
 * @returns HTML string for trend indicator or empty string
 */
function buildTrendIndicator(metric: DashboardMetric): string {
  if (!metric.trend && metric.change === undefined) return '';

  const trend = metric.trend ?? (metric.change !== undefined && metric.change > 0 ? 'up' : metric.change !== undefined && metric.change < 0 ? 'down' : 'stable');
  const trendClass = TREND_CLASSES[trend] ?? 'metric-trend-stable';
  const trendSymbol = TREND_INDICATORS[trend] ?? '→';
  const changeText =
    metric.change !== undefined
      ? ` ${metric.change > 0 ? '+' : ''}${metric.change.toFixed(1)}%`
      : '';
  const ariaLabel = `Trend: ${trend}${changeText}`;

  return `<span class="${escapeHTML(trendClass)}" aria-label="${escapeHTML(ariaLabel)}">${trendSymbol}${escapeHTML(changeText)}</span>`;
}

/**
 * Build a metrics grid from an array of metrics.
 *
 * @param metrics - Array of metric data
 * @returns HTML string for the metrics grid
 */
function buildMetricsGrid(metrics: readonly DashboardMetric[]): string {
  if (metrics.length === 0) return '';
  const cards = metrics.map((m) => buildMetricCard(m)).join('\n              ');
  return `<div class="metrics-grid">
              ${cards}
            </div>`;
}

/**
 * Build a chart container with embedded configuration.
 * The chart configuration is serialized as JSON in a `data-chart-config`
 * attribute, ready for client-side hydration by Chart.js.
 *
 * A `<noscript>` fallback provides an accessible data table.
 *
 * @param chart - Chart configuration
 * @param panelIndex - Panel index for unique canvas ID
 * @returns HTML string for chart container
 */
function buildChartContainer(chart: ChartConfig, panelIndex: number): string {
  const canvasId = `dashboard-chart-${panelIndex}`;
  const safeConfig = escapeHTML(JSON.stringify(chart));
  const titleHtml = chart.title
    ? `<h4 class="chart-title">${escapeHTML(chart.title)}</h4>`
    : '';

  const fallbackTable = buildChartFallbackTable(chart);

  return `<div class="chart-container">
              ${titleHtml}
              <canvas id="${canvasId}" class="dashboard-chart" data-chart-config="${safeConfig}" role="img" aria-label="${escapeHTML(chart.title ?? 'Chart')}"></canvas>
              <noscript>
                ${fallbackTable}
              </noscript>
            </div>`;
}

/**
 * Build an accessible fallback data table for a chart.
 * Displayed when JavaScript is disabled.
 *
 * @param chart - Chart configuration
 * @returns HTML table string
 */
function buildChartFallbackTable(chart: ChartConfig): string {
  const labels = chart.data.labels;
  const datasets = chart.data.datasets;

  if (labels.length === 0 || datasets.length === 0) {
    return '<p class="chart-no-data">No chart data available</p>';
  }

  const headerCells = datasets
    .map((ds) => `<th scope="col">${escapeHTML(ds.label)}</th>`)
    .join('');
  const header = `<tr><th scope="col"></th>${headerCells}</tr>`;

  const rows = labels
    .map((label, i) => {
      const cells = datasets
        .map((ds) => {
          const val = ds.data[i];
          return `<td>${val !== undefined ? escapeHTML(String(val)) : '—'}</td>`;
        })
        .join('');
      return `<tr><th scope="row">${escapeHTML(label)}</th>${cells}</tr>`;
    })
    .join('\n                  ');

  return `<table class="chart-fallback-table" role="table">
                <thead>${header}</thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>`;
}

/**
 * Build a single dashboard panel HTML.
 *
 * @param panel - Panel configuration
 * @param index - Panel index for unique IDs
 * @returns HTML string for one panel
 */
function buildDashboardPanel(panel: DashboardPanel, index: number): string {
  const metricsHtml = panel.metrics ? buildMetricsGrid(panel.metrics) : '';
  const chartHtml = panel.chart ? buildChartContainer(panel.chart, index) : '';

  if (!metricsHtml && !chartHtml) return '';

  return `<div class="dashboard-panel" role="region" aria-label="${escapeHTML(panel.title)}">
            <h3 class="panel-title">${escapeHTML(panel.title)}</h3>
            ${metricsHtml}
            ${chartHtml}
          </div>`;
}

// ─── Main builder ────────────────────────────────────────────────────────────

/**
 * Build a complete dashboard section HTML.
 *
 * Generates an accessible dashboard with metric cards and chart containers.
 * Charts are embedded as Canvas elements with `data-chart-config` JSON
 * attributes for client-side Chart.js hydration. A `<noscript>` fallback
 * provides accessible data tables when JavaScript is disabled.
 *
 * Returns an empty string if the config is null/undefined or contains
 * no panels with content.
 *
 * @param config - Dashboard configuration (null/undefined returns empty string)
 * @param heading - Optional custom section heading (defaults to "Dashboard")
 * @returns HTML section string or empty string
 */
export function buildDashboardSection(
  config: DashboardConfig | null | undefined,
  heading?: string
): string {
  if (!config) return '';
  if (config.panels.length === 0) return '';

  const sectionHeading = heading ?? config.title ?? DEFAULT_DASHBOARD_HEADING;

  const panelsHtml = config.panels
    .map((panel, index) => buildDashboardPanel(panel, index))
    .filter((html) => html.length > 0)
    .join('\n            ');

  if (!panelsHtml) return '';

  return `
          <section class="dashboard" role="region" aria-label="${escapeHTML(sectionHeading)}">
            <h2>${escapeHTML(sectionHeading)}</h2>
            <div class="dashboard-grid">
            ${panelsHtml}
            </div>
          </section>`;
}

/**
 * Check whether a dashboard configuration contains any chart containers.
 * Useful for conditionally including Chart.js client-side scripts.
 *
 * @param config - Dashboard configuration
 * @returns True if at least one panel has a chart
 */
export function dashboardHasCharts(config: DashboardConfig | null | undefined): boolean {
  if (!config) return false;
  return config.panels.some((panel) => panel.chart !== undefined);
}
