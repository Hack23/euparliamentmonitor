// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PropositionsContent
 * @description Pure function for building propositions article HTML with
 * localized strings and pre-sanitized MCP data.
 */

import { escapeHTML } from '../utils/file-utils.js';
import type { PropositionsStrings } from '../types/index.js';

/** Structured pipeline data returned from MCP before language-specific rendering */
export interface PipelineData {
  healthScore: number;
  throughput: number;
  procRowsHtml: string;
}

/**
 * Build propositions article HTML content with localized strings.
 *
 * **Security contract**: `proposalsHtml`, `procedureHtml`, and
 * `pipelineData.procRowsHtml` MUST be pre-sanitized HTML — all external
 * (MCP-sourced) values must have been passed through `escapeHTML()` before
 * being interpolated into these strings.  The fetch helpers
 * (`fetchProposalsFromMCP`, `fetchPipelineFromMCP`,
 * `fetchProcedureStatusFromMCP`) fulfil this contract; callers must do the
 * same if they construct these arguments independently.
 *
 * @param proposalsHtml - Pre-sanitized HTML for proposals list section
 * @param pipelineData - Structured pipeline data from MCP (null when unavailable);
 *   `pipelineData.procRowsHtml` must be pre-sanitized HTML
 * @param procedureHtml - Pre-sanitized HTML for tracked procedure status section (may be empty)
 * @param strings - Localized string set for the target language
 * @returns Full article HTML content string
 */
export function buildPropositionsContent(
  proposalsHtml: string,
  pipelineData: PipelineData | null,
  procedureHtml: string,
  strings: PropositionsStrings
): string {
  const pipelineHtml = pipelineData
    ? `
    <div class="pipeline-metrics">
      <div class="metric" aria-label="${escapeHTML(strings.pipelineHealthLabel)}">
        <span class="metric-label">${escapeHTML(strings.pipelineHealthLabel)}</span>
        <span class="metric-value">${escapeHTML(String(Math.round(pipelineData.healthScore * 100)))}%</span>
      </div>
      <div class="metric" aria-label="${escapeHTML(strings.throughputRateLabel)}">
        <span class="metric-label">${escapeHTML(strings.throughputRateLabel)}</span>
        <span class="metric-value">${escapeHTML(String(pipelineData.throughput))}</span>
      </div>
    </div>
    ${pipelineData.procRowsHtml}`
    : '';
  const procedureSection = procedureHtml
    ? `
          <section class="procedure-status">
            <h2>${escapeHTML(strings.procedureHeading)}</h2>
            ${procedureHtml}
          </section>`
    : '';
  return `
        <div class="article-content">
          <section class="lede">
            <p>${escapeHTML(strings.lede)}</p>
          </section>

          <section class="proposals-list">
            <h2>${escapeHTML(strings.proposalsHeading)}</h2>
            ${proposalsHtml}
          </section>

          <section class="pipeline-status">
            <h2>${escapeHTML(strings.pipelineHeading)}</h2>
            ${pipelineHtml}
          </section>
          ${procedureSection}
          <section class="analysis">
            <h2>${escapeHTML(strings.analysisHeading)}</h2>
            <p>${escapeHTML(strings.analysis)}</p>
          </section>
        </div>
      `;
}
