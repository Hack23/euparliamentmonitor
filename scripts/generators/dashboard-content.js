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
 * - **Coalition panels**: Radar charts showing political group alignment
 * - **Pipeline panels**: Bar charts showing legislative procedure status
 * - **Trend panels**: Sparkline charts showing activity over time
 * - **Stakeholder scorecards**: Color-coded impact grids
 *
 * Chart configurations are embedded as JSON in `data-chart-config` attributes
 * on `<canvas>` elements. An external client-side initialization script
 * provided by the embedding application can hydrate these using Chart.js
 * at runtime by reading the `data-chart-config` attributes.
 */
import { escapeHTML } from '../utils/file-utils.js';
import { getLocalizedString, DASHBOARD_STRINGS, DASHBOARD_BUILDER_STRINGS, } from '../constants/languages.js';
// ─── Sub-section builders ────────────────────────────────────────────────────
/**
 * Build a single metric card HTML.
 *
 * @param metric - Metric data
 * @param strings - Localized dashboard strings
 * @returns HTML string for one metric card
 */
function buildMetricCard(metric, strings) {
    const trendHtml = buildTrendIndicator(metric, strings);
    const unitHtml = metric.unit
        ? ` <span class="metric-unit">${escapeHTML(metric.unit)}</span>`
        : '';
    return `<div class="metric-card">
                <span class="metric-label">${escapeHTML(metric.label)}</span>
                <span class="metric-value">${escapeHTML(metric.value)}${unitHtml}</span>
                ${trendHtml}
              </div>`;
}
/**
 * Derive trend direction from an explicit trend value or numeric change.
 *
 * @param trend - Explicit trend or undefined
 * @param change - Numeric percentage change or undefined
 * @returns Resolved trend direction
 */
function resolveTrend(trend, change) {
    if (trend)
        return trend;
    if (change !== undefined && change > 0)
        return 'up';
    if (change !== undefined && change < 0)
        return 'down';
    return 'stable';
}
/**
 * Resolve the CSS class and symbol for a trend direction.
 *
 * @param trend - Resolved trend direction
 * @returns Tuple of CSS class and display symbol
 */
function trendPresentation(trend) {
    switch (trend) {
        case 'up':
            return ['metric-trend-up', '↑'];
        case 'down':
            return ['metric-trend-down', '↓'];
        case 'stable':
            return ['metric-trend-stable', '→'];
    }
}
/**
 * Build trend indicator HTML for a metric.
 *
 * @param metric - Metric with optional trend and change
 * @param strings - Localized dashboard strings
 * @returns HTML string for trend indicator or empty string
 */
function buildTrendIndicator(metric, strings) {
    if (!metric.trend && metric.change === undefined)
        return '';
    const trend = resolveTrend(metric.trend, metric.change);
    const [trendClass, trendSymbol] = trendPresentation(trend);
    const changeText = metric.change !== undefined
        ? ` ${metric.change > 0 ? '+' : ''}${metric.change.toFixed(1)}%`
        : '';
    const directionLabel = trend === 'up' ? strings.trendUp : trend === 'down' ? strings.trendDown : strings.trendStable;
    const ariaLabel = `${strings.trendPrefix} ${directionLabel}${changeText}`;
    return `<span class="${escapeHTML(trendClass)}" aria-label="${escapeHTML(ariaLabel)}">${trendSymbol}${escapeHTML(changeText)}</span>`;
}
/**
 * Build a metrics grid from an array of metrics.
 *
 * @param metrics - Array of metric data
 * @param strings - Localized dashboard strings
 * @returns HTML string for the metrics grid
 */
function buildMetricsGrid(metrics, strings) {
    if (metrics.length === 0)
        return '';
    const cards = metrics.map((m) => buildMetricCard(m, strings)).join('\n              ');
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
 * @param strings - Localized strings
 * @returns HTML string for chart container
 */
function buildChartContainer(chart, panelIndex, strings) {
    const canvasId = `dashboard-chart-${panelIndex}`;
    const safeConfig = escapeHTML(JSON.stringify(chart));
    const titleHtml = chart.title ? `<h4 class="chart-title">${escapeHTML(chart.title)}</h4>` : '';
    const fallbackTable = buildChartFallbackTable(chart, strings);
    return `<div class="chart-container">
              ${titleHtml}
              <canvas id="${canvasId}" class="dashboard-chart" data-chart-config="${safeConfig}" role="img" aria-label="${escapeHTML(chart.title ?? strings.chartLabel)}"></canvas>
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
 * @param strings - Localized strings
 * @returns HTML table string
 */
function buildChartFallbackTable(chart, strings) {
    const labels = chart.data.labels;
    const datasets = chart.data.datasets;
    if (labels.length === 0 || datasets.length === 0) {
        return `<p class="chart-no-data">${escapeHTML(strings.noChartData)}</p>`;
    }
    const headerCells = datasets.map((ds) => `<th scope="col">${escapeHTML(ds.label)}</th>`).join('');
    const header = `<tr><th scope="col">${escapeHTML(strings.categoryLabel)}</th>${headerCells}</tr>`;
    const rows = labels
        .map((label, i) => {
        const cells = datasets
            .map((ds) => {
            const val = ds.data.at(i);
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
 * @param strings - Localized strings
 * @returns HTML string for one panel
 */
function buildDashboardPanel(panel, index, strings) {
    const metricsHtml = panel.metrics ? buildMetricsGrid(panel.metrics, strings) : '';
    const chartHtml = panel.chart ? buildChartContainer(panel.chart, index, strings) : '';
    if (!metricsHtml && !chartHtml)
        return '';
    return `<div class="dashboard-panel" role="region" aria-label="${escapeHTML(panel.title)}">
            <h3 class="panel-title">${escapeHTML(panel.title)}</h3>
            ${metricsHtml}
            ${chartHtml}
          </div>`;
}
// ─── Political intelligence panel builders ───────────────────────────────────
/**
 * Map a coalition shift indicator to its CSS class.
 *
 * @param shift - Shift direction
 * @returns CSS class string
 */
function coalitionShiftClass(shift) {
    switch (shift) {
        case 'strengthening':
            return 'coalition-strengthening';
        case 'weakening':
            return 'coalition-weakening';
        case 'stable':
            return 'coalition-stable';
    }
}
/**
 * Build a coalition dynamics panel as a self-contained HTML section.
 * Renders a radar chart configuration (Chart.js) embedded as a data attribute,
 * with a `<noscript>` fallback table listing each bloc's alignment score.
 *
 * Returns an empty string when `coalition` is null/undefined or has no voting
 * blocs.
 *
 * @param coalition - Coalition metrics data
 * @param panelIndex - Index used for unique canvas IDs
 * @param lang - BCP 47 language code for localized labels
 * @returns HTML string for the coalition panel or empty string
 */
export function buildCoalitionPanel(coalition, panelIndex, lang = 'en') {
    if (!coalition || coalition.votingBlocs.length === 0)
        return '';
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const shiftLabel = coalition.shiftIndicator === 'strengthening'
        ? d.coalitionStrengthening
        : coalition.shiftIndicator === 'weakening'
            ? d.coalitionWeakening
            : d.coalitionStable;
    const alignmentPct = `${coalition.alignmentScore}%`;
    const shiftClass = coalitionShiftClass(coalition.shiftIndicator);
    const radarChart = {
        type: 'radar',
        title: d.coalitionRadarChart,
        data: {
            labels: coalition.votingBlocs.map((b) => b.group),
            datasets: [
                {
                    label: d.alignmentScore,
                    data: coalition.votingBlocs.map((b) => b.alignmentScore),
                    backgroundColor: 'rgba(0,51,153,0.2)',
                    borderColor: '#003399',
                },
            ],
        },
    };
    const canvasId = `coalition-chart-${panelIndex}`;
    const safeConfig = escapeHTML(JSON.stringify(radarChart));
    const noscriptRows = coalition.votingBlocs
        .map((b) => `<tr><th scope="row">${escapeHTML(b.group)}</th><td>${escapeHTML(String(b.alignmentScore))}%</td></tr>`)
        .join('\n              ');
    return `<div class="dashboard-panel coalition-panel" role="region" aria-label="${escapeHTML(d.coalitionAlignment)}">
            <h3 class="panel-title">${escapeHTML(d.coalitionAlignment)}</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <span class="metric-label">${escapeHTML(d.alignmentScore)}</span>
                <span class="metric-value">${escapeHTML(alignmentPct)}</span>
              </div>
              <div class="metric-card">
                <span class="metric-label">${escapeHTML(d.votingBlocs)}</span>
                <span class="metric-value">${escapeHTML(String(coalition.votingBlocs.length))}</span>
              </div>
              <div class="metric-card coalition-shift ${escapeHTML(shiftClass)}">
                <span class="metric-label">${escapeHTML(d.coalitionShift)}</span>
                <span class="metric-value">${escapeHTML(shiftLabel)}</span>
              </div>
            </div>
            <div class="chart-container">
              <h4 class="chart-title">${escapeHTML(d.coalitionRadarChart)}</h4>
              <canvas id="${canvasId}" class="dashboard-chart" data-chart-config="${safeConfig}" role="img" aria-label="${escapeHTML(d.coalitionRadarChart)}"></canvas>
              <noscript>
                <table class="chart-fallback-table" role="table">
                  <thead><tr><th scope="col">${escapeHTML(d.votingBlocs)}</th><th scope="col">${escapeHTML(d.alignmentScore)}</th></tr></thead>
                  <tbody>
              ${noscriptRows}
                  </tbody>
                </table>
              </noscript>
            </div>
          </div>`;
}
/**
 * Map a pipeline health score to its CSS status class.
 *
 * @param healthScore - Health score 0–100
 * @returns CSS class string
 */
function pipelineStatusClass(healthScore) {
    if (healthScore >= 70)
        return 'pipeline-healthy';
    if (healthScore >= 40)
        return 'pipeline-moderate';
    return 'pipeline-critical';
}
/**
 * Build a legislative pipeline status panel as a self-contained HTML section.
 * Renders a horizontal bar chart (Chart.js) for on-track / delayed / blocked /
 * fast-tracked counts with color-coded status classes and a `<noscript>`
 * fallback list.
 *
 * Returns an empty string when `pipeline` is null/undefined or has zero total
 * procedures.
 *
 * @param pipeline - Legislative pipeline data
 * @param panelIndex - Index used for unique canvas IDs
 * @param lang - BCP 47 language code for localized labels
 * @returns HTML string for the pipeline panel or empty string
 */
export function buildPipelinePanel(pipeline, panelIndex, lang = 'en') {
    if (!pipeline || pipeline.total === 0)
        return '';
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const healthPct = `${pipeline.healthScore}%`;
    const statusClass = pipelineStatusClass(pipeline.healthScore);
    const barChart = {
        type: 'bar',
        title: d.pipelineStatusChart,
        data: {
            labels: [d.onTrack, d.delayed, d.blocked, d.fastTracked],
            datasets: [
                {
                    label: d.procedures,
                    data: [pipeline.onTrack, pipeline.delayed, pipeline.blocked, pipeline.fastTracked],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#007bff'],
                },
            ],
        },
        options: {
            indexAxis: 'y',
        },
    };
    const canvasId = `pipeline-chart-${panelIndex}`;
    const safeConfig = escapeHTML(JSON.stringify(barChart));
    return `<div class="dashboard-panel pipeline-panel ${escapeHTML(statusClass)}" role="region" aria-label="${escapeHTML(d.pipelineStatus)}">
            <h3 class="panel-title">${escapeHTML(d.pipelineStatus)}</h3>
            <div class="metrics-grid">
              <div class="metric-card pipeline-on-track">
                <span class="metric-label">${escapeHTML(d.onTrack)}</span>
                <span class="metric-value">${escapeHTML(String(pipeline.onTrack))}</span>
              </div>
              <div class="metric-card pipeline-delayed">
                <span class="metric-label">${escapeHTML(d.delayed)}</span>
                <span class="metric-value">${escapeHTML(String(pipeline.delayed))}</span>
              </div>
              <div class="metric-card pipeline-blocked">
                <span class="metric-label">${escapeHTML(d.blocked)}</span>
                <span class="metric-value">${escapeHTML(String(pipeline.blocked))}</span>
              </div>
              <div class="metric-card pipeline-fast-tracked">
                <span class="metric-label">${escapeHTML(d.fastTracked)}</span>
                <span class="metric-value">${escapeHTML(String(pipeline.fastTracked))}</span>
              </div>
            </div>
            <div class="pipeline-health-indicator ${escapeHTML(statusClass)}">
              <span class="metric-label">${escapeHTML(d.healthScore)}</span>
              <span class="metric-value">${escapeHTML(healthPct)}</span>
            </div>
            <div class="chart-container">
              <h4 class="chart-title">${escapeHTML(d.pipelineStatusChart)}</h4>
              <canvas id="${canvasId}" class="dashboard-chart" data-chart-config="${safeConfig}" role="img" aria-label="${escapeHTML(d.pipelineStatusChart)}"></canvas>
              <noscript>
                <ul class="pipeline-fallback-list">
                  <li>${escapeHTML(d.onTrack)}: ${escapeHTML(String(pipeline.onTrack))}</li>
                  <li>${escapeHTML(d.delayed)}: ${escapeHTML(String(pipeline.delayed))}</li>
                  <li>${escapeHTML(d.blocked)}: ${escapeHTML(String(pipeline.blocked))}</li>
                  <li>${escapeHTML(d.fastTracked)}: ${escapeHTML(String(pipeline.fastTracked))}</li>
                </ul>
              </noscript>
            </div>
          </div>`;
}
/**
 * Build a trend analytics panel as a self-contained HTML section.
 * Renders a line (sparkline) chart (Chart.js) for activity levels over time
 * with week-over-week / month-over-month change indicators and a `<noscript>`
 * comparison table.
 *
 * Returns an empty string when `trend` is null/undefined or has no metric
 * data points.
 *
 * @param trend - Trend analytics data
 * @param panelIndex - Index used for unique canvas IDs
 * @param lang - BCP 47 language code for localized labels
 * @returns HTML string for the trend panel or empty string
 */
export function buildTrendPanel(trend, panelIndex, lang = 'en') {
    if (!trend || trend.metrics.length === 0)
        return '';
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const directionLabel = trend.direction === 'improving'
        ? d.trendImproving
        : trend.direction === 'declining'
            ? d.trendDeclining
            : d.trendStableLabel;
    const sparklineChart = {
        type: 'line',
        title: d.activityTrendChart,
        data: {
            labels: trend.metrics.map((m) => m.period),
            datasets: [
                {
                    label: d.trendAnalysis,
                    data: trend.metrics.map((m) => m.value),
                    borderColor: '#003399',
                    backgroundColor: 'rgba(0,51,153,0.1)',
                },
            ],
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
        },
    };
    const canvasId = `trend-chart-${panelIndex}`;
    const safeConfig = escapeHTML(JSON.stringify(sparklineChart));
    const wowHtml = trend.weekOverWeekChange !== undefined
        ? `<div class="metric-card">
                <span class="metric-label">${escapeHTML(d.weekOverWeek)}</span>
                <span class="metric-value">${escapeHTML(trend.weekOverWeekChange > 0 ? '+' : '')}${escapeHTML(String(trend.weekOverWeekChange))}%</span>
              </div>`
        : '';
    const momHtml = trend.monthOverMonthChange !== undefined
        ? `<div class="metric-card">
                <span class="metric-label">${escapeHTML(d.monthOverMonth)}</span>
                <span class="metric-value">${escapeHTML(trend.monthOverMonthChange > 0 ? '+' : '')}${escapeHTML(String(trend.monthOverMonthChange))}%</span>
              </div>`
        : '';
    const noscriptRows = trend.metrics
        .map((m) => `<tr><th scope="row">${escapeHTML(m.period)}</th><td>${escapeHTML(String(m.value))}</td></tr>`)
        .join('\n              ');
    return `<div class="dashboard-panel trend-panel" role="region" aria-label="${escapeHTML(d.trendAnalysis)}">
            <h3 class="panel-title">${escapeHTML(d.trendAnalysis)}</h3>
            <div class="metrics-grid">
              <div class="metric-card trend-direction">
                <span class="metric-label">${escapeHTML(d.trendAnalysis)}</span>
                <span class="metric-value">${escapeHTML(directionLabel)}</span>
              </div>
              ${wowHtml}
              ${momHtml}
            </div>
            <div class="chart-container">
              <h4 class="chart-title">${escapeHTML(d.activityTrendChart)}</h4>
              <canvas id="${canvasId}" class="dashboard-chart" data-chart-config="${safeConfig}" role="img" aria-label="${escapeHTML(d.activityTrendChart)}"></canvas>
              <noscript>
                <table class="chart-fallback-table" role="table">
                  <thead><tr><th scope="col">${escapeHTML(d.trendAnalysis)}</th><th scope="col">${escapeHTML(d.status)}</th></tr></thead>
                  <tbody>
              ${noscriptRows}
                  </tbody>
                </table>
              </noscript>
            </div>
          </div>`;
}
/**
 * Map an impact direction to its CSS class for color-coded scorecards.
 *
 * @param direction - Impact direction
 * @returns CSS class string
 */
function impactDirectionClass(direction) {
    switch (direction) {
        case 'positive':
            return 'impact-positive';
        case 'negative':
            return 'impact-negative';
        case 'neutral':
            return 'impact-neutral';
    }
}
/**
 * Build a stakeholder impact scorecard panel as a self-contained HTML section.
 * Renders a color-coded grid where each cell shows a stakeholder's impact score
 * and direction, with a `<noscript>` fallback table.
 *
 * Returns an empty string when `stakeholders` is null/undefined or empty.
 *
 * @param stakeholders - Stakeholder metric data
 * @param panelIndex - Index used for unique IDs
 * @param lang - BCP 47 language code for localized labels
 * @returns HTML string for the scorecard panel or empty string
 */
export function buildStakeholderScorecardPanel(stakeholders, panelIndex, lang = 'en') {
    if (!stakeholders || stakeholders.length === 0)
        return '';
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const cards = stakeholders
        .map((s) => {
        const dirClass = impactDirectionClass(s.impactDirection);
        const dirLabel = s.impactDirection === 'positive'
            ? d.impactPositive
            : s.impactDirection === 'negative'
                ? d.impactNegative
                : d.impactNeutral;
        const descHtml = s.description
            ? `<span class="stakeholder-description">${escapeHTML(s.description)}</span>`
            : '';
        return `<div class="stakeholder-card ${escapeHTML(dirClass)}" role="listitem">
                <span class="stakeholder-name">${escapeHTML(s.stakeholder)}</span>
                <span class="stakeholder-score">${escapeHTML(String(s.impactScore))}/100</span>
                <span class="stakeholder-direction">${escapeHTML(dirLabel)}</span>
                ${descHtml}
              </div>`;
    })
        .join('\n              ');
    const noscriptRows = stakeholders
        .map((s) => {
        const dirLabel = s.impactDirection === 'positive'
            ? d.impactPositive
            : s.impactDirection === 'negative'
                ? d.impactNegative
                : d.impactNeutral;
        return `<tr><th scope="row">${escapeHTML(s.stakeholder)}</th><td>${escapeHTML(String(s.impactScore))}</td><td>${escapeHTML(dirLabel)}</td></tr>`;
    })
        .join('\n              ');
    return `<div class="dashboard-panel stakeholder-scorecard" role="region" aria-label="${escapeHTML(d.stakeholderImpact)}" id="stakeholder-scorecard-${panelIndex}">
            <h3 class="panel-title">${escapeHTML(d.stakeholderImpact)}</h3>
            <div class="stakeholder-grid" role="list">
              ${cards}
            </div>
            <noscript>
              <table class="chart-fallback-table" role="table">
                <thead><tr><th scope="col">${escapeHTML(d.stakeholderImpact)}</th><th scope="col">${escapeHTML(d.impactScore)}</th><th scope="col">${escapeHTML(d.status)}</th></tr></thead>
                <tbody>
              ${noscriptRows}
                </tbody>
              </table>
            </noscript>
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
 * @param lang - BCP 47 language code for localized UI text (defaults to "en")
 * @param heading - Optional custom section heading override
 * @returns HTML section string or empty string
 */
export function buildDashboardSection(config, lang = 'en', heading) {
    if (!config)
        return '';
    if (config.panels.length === 0)
        return '';
    const strings = getLocalizedString(DASHBOARD_STRINGS, lang);
    const sectionHeading = heading ?? config.title ?? strings.sectionHeading;
    const panelsHtml = config.panels
        .map((panel, index) => buildDashboardPanel(panel, index, strings))
        .filter((html) => html.length > 0)
        .join('\n            ');
    if (!panelsHtml)
        return '';
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
export function dashboardHasCharts(config) {
    if (!config)
        return false;
    return config.panels.some((panel) => panel.chart !== undefined);
}
//# sourceMappingURL=dashboard-content.js.map