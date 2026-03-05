// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/SwotContent
 * @description Pure functions for building SWOT analysis HTML sections.
 * Generates accessible, CSS-only SWOT matrix visualizations that can be
 * embedded in any article type. Designed for agentic workflows to extend
 * articles with strategic analysis using data from MCP servers or other sources.
 *
 * The SWOT framework covers:
 * - **Strengths**: Internal positive factors
 * - **Weaknesses**: Internal negative factors
 * - **Opportunities**: External positive factors
 * - **Threats**: External negative factors
 */
import { escapeHTML } from '../utils/file-utils.js';
/** Default SWOT section heading */
const DEFAULT_SWOT_HEADING = 'SWOT Analysis';
/** Quadrant labels */
const QUADRANT_LABELS = {
    strengths: 'Strengths',
    weaknesses: 'Weaknesses',
    opportunities: 'Opportunities',
    threats: 'Threats',
};
/** Quadrant accessible descriptions */
const QUADRANT_DESCRIPTIONS = {
    strengths: 'Internal positive factors',
    weaknesses: 'Internal negative factors',
    opportunities: 'External positive factors',
    threats: 'External negative factors',
};
// ─── Sub-section builders ────────────────────────────────────────────────────
/**
 * Build a single SWOT item HTML.
 *
 * @param item - SWOT item with text and optional severity
 * @returns HTML list item string
 */
function buildSwotItem(item) {
    const severityClass = item.severity ? ` swot-severity-${escapeHTML(item.severity)}` : '';
    const severityBadge = item.severity
        ? ` <span class="swot-severity-badge">${escapeHTML(item.severity)}</span>`
        : '';
    return `<li class="swot-item${severityClass}">${escapeHTML(item.text)}${severityBadge}</li>`;
}
/**
 * Build a single SWOT quadrant HTML.
 *
 * @param quadrantKey - Quadrant identifier (strengths/weaknesses/opportunities/threats)
 * @param items - Items in this quadrant
 * @param label - Localized quadrant heading
 * @param description - Accessible description
 * @returns HTML string for one quadrant
 */
function buildSwotQuadrant(quadrantKey, items, label, description) {
    const itemsHtml = items.length > 0
        ? items.map((item) => buildSwotItem(item)).join('\n                ')
        : '<li class="swot-item swot-empty">—</li>';
    return `<div class="swot-quadrant swot-${escapeHTML(quadrantKey)}" role="region" aria-label="${escapeHTML(label)}">
              <h4 class="swot-quadrant-heading">${escapeHTML(label)}</h4>
              <p class="swot-quadrant-desc">${escapeHTML(description)}</p>
              <ul class="swot-list">
                ${itemsHtml}
              </ul>
            </div>`;
}
// ─── Main builder ────────────────────────────────────────────────────────────
/**
 * Build a complete SWOT analysis section HTML.
 *
 * Generates an accessible CSS Grid-based SWOT matrix that can be embedded
 * in any article type. The visualization is pure HTML/CSS with no JavaScript
 * required, ensuring compatibility with strict CSP policies.
 *
 * Returns an empty string if the analysis is null/undefined or contains
 * no items in any quadrant.
 *
 * @param analysis - SWOT analysis data (null/undefined returns empty string)
 * @param heading - Optional custom section heading (defaults to "SWOT Analysis")
 * @returns HTML section string or empty string
 */
export function buildSwotSection(analysis, heading) {
    if (!analysis)
        return '';
    const totalItems = analysis.strengths.length +
        analysis.weaknesses.length +
        analysis.opportunities.length +
        analysis.threats.length;
    if (totalItems === 0)
        return '';
    const sectionHeading = heading ?? analysis.title ?? DEFAULT_SWOT_HEADING;
    const strengthsHtml = buildSwotQuadrant('strengths', analysis.strengths, QUADRANT_LABELS['strengths'] ?? 'Strengths', QUADRANT_DESCRIPTIONS['strengths'] ?? 'Internal positive factors');
    const weaknessesHtml = buildSwotQuadrant('weaknesses', analysis.weaknesses, QUADRANT_LABELS['weaknesses'] ?? 'Weaknesses', QUADRANT_DESCRIPTIONS['weaknesses'] ?? 'Internal negative factors');
    const opportunitiesHtml = buildSwotQuadrant('opportunities', analysis.opportunities, QUADRANT_LABELS['opportunities'] ?? 'Opportunities', QUADRANT_DESCRIPTIONS['opportunities'] ?? 'External positive factors');
    const threatsHtml = buildSwotQuadrant('threats', analysis.threats, QUADRANT_LABELS['threats'] ?? 'Threats', QUADRANT_DESCRIPTIONS['threats'] ?? 'External negative factors');
    return `
          <section class="swot-analysis" role="region" aria-label="${escapeHTML(sectionHeading)}">
            <h2>${escapeHTML(sectionHeading)}</h2>
            <div class="swot-matrix">
              <div class="swot-axis-labels">
                <span class="swot-axis-internal">Internal</span>
                <span class="swot-axis-external">External</span>
              </div>
              <div class="swot-grid" role="table" aria-label="SWOT Matrix">
                <div class="swot-row swot-row-positive" role="row">
                  ${strengthsHtml}
                  ${opportunitiesHtml}
                </div>
                <div class="swot-row swot-row-negative" role="row">
                  ${weaknessesHtml}
                  ${threatsHtml}
                </div>
              </div>
            </div>
          </section>`;
}
//# sourceMappingURL=swot-content.js.map