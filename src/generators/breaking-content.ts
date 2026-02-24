// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/BreakingContent
 * @description Pure function for building breaking-news article HTML.
 */

import { escapeHTML } from '../utils/file-utils.js';

/**
 * Build breaking news article HTML content
 *
 * @param date - Current date string for the article
 * @param anomalyRaw - Raw anomaly data from MCP
 * @param coalitionRaw - Raw coalition dynamics data from MCP
 * @param reportRaw - Raw analytical report from MCP
 * @param influenceRaw - Raw MEP influence data from MCP
 * @returns Full article HTML content string
 */
export function buildBreakingNewsContent(
  date: string,
  anomalyRaw: string,
  coalitionRaw: string,
  reportRaw: string,
  influenceRaw: string
): string {
  const hasData = anomalyRaw || coalitionRaw || reportRaw || influenceRaw;
  const timestamp = new Date().toISOString();

  const anomalySection = anomalyRaw
    ? `
        <section class="analysis">
          <h2>Voting Anomaly Intelligence</h2>
          <pre class="data-summary">${escapeHTML(anomalyRaw.slice(0, 2000))}</pre>
        </section>`
    : '';

  const coalitionSection = coalitionRaw
    ? `
        <section class="coalition-impact">
          <h2>Coalition Dynamics Assessment</h2>
          <pre class="data-summary">${escapeHTML(coalitionRaw.slice(0, 2000))}</pre>
        </section>`
    : '';

  const reportSection = reportRaw
    ? `
        <section class="context">
          <h2>Analytical Report</h2>
          <pre class="data-summary">${escapeHTML(reportRaw.slice(0, 2000))}</pre>
        </section>`
    : '';

  const keyPlayersSection = influenceRaw
    ? `
        <section class="key-players">
          <h2>Key MEP Influence Analysis</h2>
          <pre class="data-summary">${escapeHTML(influenceRaw.slice(0, 2000))}</pre>
        </section>`
    : '';

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
          ${anomalySection}
          ${coalitionSection}
          ${reportSection}
          ${keyPlayersSection}
        </div>
      `;
}
