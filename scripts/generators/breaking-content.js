// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/BreakingContent
 * @description Pure functions for building breaking-news article HTML,
 * including optional structured intelligence briefing sections derived
 * from typed MCP intelligence data.
 */
import { escapeHTML } from '../utils/file-utils.js';
import { getLocalizedString, EDITORIAL_STRINGS } from '../constants/languages.js';
/** Maximum characters to display from raw MCP intelligence data */
const MAX_DATA_CHARS = 2000;
// ─── Private section builders ────────────────────────────────────────────────
/**
 * Build intelligence briefing section HTML from structured anomaly data
 *
 * @param anomalies - Structured voting anomaly intelligence items
 * @returns HTML section string or empty string
 */
function buildAnomalyAlertSection(anomalies) {
    if (anomalies.length === 0)
        return '';
    const items = anomalies
        .map((a) => `<li class="anomaly-${escapeHTML(a.significance)}">` +
        `<strong>${escapeHTML(a.description)}</strong> — ` +
        `${escapeHTML(a.implication)} ` +
        `(deviation: ${escapeHTML(String(a.deviationPercentage))}%)</li>`)
        .join('\n            ');
    return `
        <section class="anomaly-alert">
          <h3>Voting Anomaly Alert</h3>
          <ul>
            ${items}
          </ul>
        </section>`;
}
/**
 * Build coalition dynamics section HTML from structured coalition data
 *
 * @param coalitions - Structured coalition intelligence items
 * @returns HTML section string or empty string
 */
function buildCoalitionDynamicsSection(coalitions) {
    if (coalitions.length === 0)
        return '';
    const items = coalitions
        .map((c) => `<li class="coalition-${escapeHTML(c.riskLevel)}">` +
        `${escapeHTML(c.groups.join(', '))} — ` +
        `cohesion: ${escapeHTML(String(Math.round(c.cohesionScore * 100)))}% ` +
        `(${escapeHTML(c.alignmentTrend)})</li>`)
        .join('\n            ');
    return `
        <section class="coalition-dynamics">
          <h3>Coalition Dynamics</h3>
          <ul>
            ${items}
          </ul>
        </section>`;
}
/**
 * Build key parliamentary players section HTML from structured MEP influence data
 *
 * @param mepScores - Structured MEP influence score items
 * @returns HTML section string or empty string
 */
function buildKeyPlayersIntelSection(mepScores) {
    if (mepScores.length === 0)
        return '';
    const items = mepScores
        .map((m) => `<li class="mep-score">` +
        `<strong>${escapeHTML(m.mepName)}</strong> — ` +
        `score: ${escapeHTML(String(Math.round(m.overallScore)))} ` +
        `${m.rank ? `(${escapeHTML(m.rank)})` : ''}</li>`)
        .join('\n            ');
    return `
        <section class="key-players-intel">
          <h3>Key Parliamentary Players</h3>
          <ul>
            ${items}
          </ul>
        </section>`;
}
/**
 * Build intelligence briefing section HTML from all structured sources
 *
 * @param anomalies - Structured voting anomaly intelligence items
 * @param coalitions - Structured coalition intelligence items
 * @param mepScores - Structured MEP influence score items
 * @returns HTML section string or empty string
 */
function buildIntelligenceBriefingSection(anomalies, coalitions, mepScores) {
    const hasIntel = anomalies.length > 0 || coalitions.length > 0 || mepScores.length > 0;
    if (!hasIntel)
        return '';
    return `
        <section class="intelligence-briefing">
          <h2>Intelligence Briefing</h2>
          ${buildAnomalyAlertSection(anomalies)}
          ${buildCoalitionDynamicsSection(coalitions)}
          ${buildKeyPlayersIntelSection(mepScores)}
        </section>`;
}
// ─── Exported function ────────────────────────────────────────────────────────
/**
 * Build breaking news article HTML content.
 * Accepts both raw MCP string data (rendered as narrative blocks) and optional
 * structured intelligence data (rendered as formatted HTML sections).
 * When no data is provided, returns a placeholder notice.
 *
 * @param date - Current date string for the article
 * @param anomalyRaw - Raw anomaly data from MCP
 * @param coalitionRaw - Raw coalition dynamics data from MCP
 * @param reportRaw - Raw analytical report from MCP
 * @param influenceRaw - Raw MEP influence data from MCP
 * @param lang - Language code for localized editorial strings (default: 'en')
 * @param anomalies - Optional structured voting anomaly intelligence items
 * @param coalitions - Optional structured coalition intelligence items
 * @param mepScores - Optional structured MEP influence score items
 * @returns Full article HTML content string
 */
export function buildBreakingNewsContent(date, anomalyRaw, coalitionRaw, reportRaw, influenceRaw, lang = 'en', anomalies = [], coalitions = [], mepScores = []) {
    const editorial = getLocalizedString(EDITORIAL_STRINGS, lang);
    const hasData = Boolean(anomalyRaw ||
        coalitionRaw ||
        reportRaw ||
        influenceRaw ||
        anomalies.length ||
        coalitions.length ||
        mepScores.length);
    const timestamp = new Date().toISOString();
    const anomalySection = anomalyRaw
        ? `
        <section class="analysis">
          <h2>Voting Anomaly Intelligence</h2>
          <p class="source-attribution">${escapeHTML(editorial.sourceAttribution)}:</p>
          <p class="data-narrative">${escapeHTML(anomalyRaw.slice(0, MAX_DATA_CHARS))}</p>
        </section>`
        : '';
    const coalitionSection = coalitionRaw
        ? `
        <section class="coalition-impact">
          <h2>Coalition Dynamics Assessment</h2>
          <p class="source-attribution">${escapeHTML(editorial.sourceAttribution)}:</p>
          <p class="data-narrative">${escapeHTML(coalitionRaw.slice(0, MAX_DATA_CHARS))}</p>
        </section>`
        : '';
    const reportSection = reportRaw
        ? `
        <section class="context">
          <h2>Analytical Report</h2>
          <p class="source-attribution">${escapeHTML(editorial.analysisNote)}:</p>
          <p class="data-narrative">${escapeHTML(reportRaw.slice(0, MAX_DATA_CHARS))}</p>
        </section>`
        : '';
    const keyPlayersSection = influenceRaw
        ? `
        <section class="key-players">
          <h2>Key MEP Influence Analysis</h2>
          <p class="source-attribution">${escapeHTML(editorial.sourceAttribution)}:</p>
          <p class="data-narrative">${escapeHTML(influenceRaw.slice(0, MAX_DATA_CHARS))}</p>
        </section>`
        : '';
    const context = escapeHTML(editorial.parliamentaryContext);
    const finding = escapeHTML(editorial.keyTakeaway).toLowerCase();
    const attribution = escapeHTML(editorial.sourceAttribution).toLowerCase();
    const whyThisMattersSection = hasData
        ? `
        <section class="why-this-matters">
          <h2>${escapeHTML(editorial.whyThisMatters)}</h2>
          <p>${context}: ${finding} — ${attribution}.</p>
        </section>`
        : '';
    const intelligenceBriefing = buildIntelligenceBriefingSection(anomalies, coalitions, mepScores);
    const placeholderNotice = !hasData
        ? `
        <div class="notice">
          <p><strong>Note:</strong> This is placeholder content generated while the European Parliament MCP Server is unavailable. Live intelligence data will appear here when the server is connected.</p>
        </div>
        <section class="lede">
          <p>Significant parliamentary developments are being monitored. Connect the European Parliament MCP Server to receive real-time intelligence on voting anomalies, coalition shifts, and MEP activities.</p>
        </section>`
        : `
        <section class="lede">
          <p>Intelligence analysis from the European Parliament MCP Server has identified significant parliamentary developments requiring immediate attention as of ${escapeHTML(date)}.</p>
        </section>`;
    return `
        <div class="article-content">
          <section class="breaking-banner">
            <p class="breaking-timestamp">⚡ BREAKING — ${escapeHTML(timestamp)}</p>
          </section>
          ${placeholderNotice}
          ${intelligenceBriefing}
          ${anomalySection}
          ${coalitionSection}
          ${reportSection}
          ${keyPlayersSection}
          ${whyThisMattersSection}
        </div>
      `;
}
//# sourceMappingURL=breaking-content.js.map