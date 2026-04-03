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
 *
 * Multi-dimensional extension adds:
 * - **Political, Economic, Social, Legal, Geopolitical** dimension drill-downs
 * - **Stakeholder perspectives** (Citizens, Industry, NGOs, MEPs, Governments, Media)
 * - **Temporal analysis** (short-term, medium-term, long-term)
 * - **Cross-references** linking items to EP documents/votes
 */
import { escapeHTML, isSafeURL } from '../utils/file-utils.js';
import { getLocalizedString, SWOT_STRINGS, MULTI_DIMENSIONAL_SWOT_STRINGS, } from '../constants/languages.js';
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
        ? ` <span class="swot-severity-badge" role="img" aria-label="${escapeHTML(item.severity)}"></span>`
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
        : '<li class="swot-item swot-empty" aria-label="No items available"><em>…</em></li>';
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
 * @param lang - BCP 47 language code for localized headings (defaults to "en")
 * @param heading - Optional custom section heading override
 * @returns HTML section string or empty string
 */
export function buildSwotSection(analysis, lang = 'en', heading) {
    if (!analysis)
        return '';
    const totalItems = analysis.strengths.length +
        analysis.weaknesses.length +
        analysis.opportunities.length +
        analysis.threats.length;
    if (totalItems === 0)
        return '';
    const strings = getLocalizedString(SWOT_STRINGS, lang);
    const sectionHeading = heading ?? analysis.title ?? strings.sectionHeading;
    const strengthsHtml = buildSwotQuadrant('strengths', analysis.strengths, strings.strengthsLabel, strings.strengthsDesc);
    const weaknessesHtml = buildSwotQuadrant('weaknesses', analysis.weaknesses, strings.weaknessesLabel, strings.weaknessesDesc);
    const opportunitiesHtml = buildSwotQuadrant('opportunities', analysis.opportunities, strings.opportunitiesLabel, strings.opportunitiesDesc);
    const threatsHtml = buildSwotQuadrant('threats', analysis.threats, strings.threatsLabel, strings.threatsDesc);
    return `
          <section class="swot-analysis" role="region" aria-label="${escapeHTML(sectionHeading)}">
            <h2>${escapeHTML(sectionHeading)}</h2>
            <div class="swot-matrix">
              <div class="swot-axis-labels">
                <span class="swot-axis-internal">${escapeHTML(strings.internalLabel)}</span>
                <span class="swot-axis-external">${escapeHTML(strings.externalLabel)}</span>
              </div>
              <div class="swot-grid">
                <div class="swot-row swot-row-positive">
                  ${strengthsHtml}
                  ${opportunitiesHtml}
                </div>
                <div class="swot-row swot-row-negative">
                  ${weaknessesHtml}
                  ${threatsHtml}
                </div>
              </div>
            </div>
          </section>`;
}
// ─── Multi-dimensional SWOT helpers ─────────────────────────────────────────
/**
 * Build a compact SWOT matrix grid (without outer section wrapper).
 * Used for embedding inside dimension or temporal detail sections.
 *
 * @param analysis - SWOT analysis data
 * @param strings - Localized SWOT strings
 * @returns HTML string for a compact quadrant grid
 */
function buildSwotMiniGrid(analysis, strings) {
    const sHtml = buildSwotQuadrant('strengths', analysis.strengths, strings.strengthsLabel, strings.strengthsDesc);
    const wHtml = buildSwotQuadrant('weaknesses', analysis.weaknesses, strings.weaknessesLabel, strings.weaknessesDesc);
    const oHtml = buildSwotQuadrant('opportunities', analysis.opportunities, strings.opportunitiesLabel, strings.opportunitiesDesc);
    const tHtml = buildSwotQuadrant('threats', analysis.threats, strings.threatsLabel, strings.threatsDesc);
    return `<div class="swot-grid swot-mini-grid">
              <div class="swot-row swot-row-positive">${sHtml}${oHtml}</div>
              <div class="swot-row swot-row-negative">${wHtml}${tHtml}</div>
            </div>`;
}
/**
 * Map a dimension name to its localized label.
 *
 * @param name - Dimension identifier
 * @param mdStrings - Localized multi-dimensional SWOT strings
 * @returns Localized dimension label
 */
function getDimensionLabel(name, mdStrings) {
    const map = {
        political: mdStrings.dimensionPolitical,
        economic: mdStrings.dimensionEconomic,
        social: mdStrings.dimensionSocial,
        legal: mdStrings.dimensionLegal,
        geopolitical: mdStrings.dimensionGeopolitical,
    };
    return map[name];
}
/**
 * Build the expandable dimension drill-down sections.
 * Each dimension is rendered as an accessible `<details>` disclosure widget.
 *
 * @param dimensions - Array of dimension data
 * @param swotStrings - Localized SWOT strings for quadrant labels
 * @param mdStrings - Localized multi-dimensional SWOT strings
 * @returns HTML string for all dimension sections
 */
function buildDimensionsDrillDown(dimensions, swotStrings, mdStrings) {
    if (dimensions.length === 0)
        return '';
    const sectionsHtml = dimensions
        .map((dim) => {
        const label = getDimensionLabel(dim.name, mdStrings);
        const miniGrid = buildSwotMiniGrid(dim, swotStrings);
        return `<details class="swot-dimension swot-dimension-${escapeHTML(dim.name)}">
                <summary class="swot-dimension-summary">${escapeHTML(label)}</summary>
                <div class="swot-dimension-content">${miniGrid}</div>
              </details>`;
    })
        .join('\n              ');
    return `<div class="swot-dimensions" role="region" aria-label="${escapeHTML(mdStrings.dimensionsLabel)}">
            <h3 class="swot-section-subheading">${escapeHTML(mdStrings.dimensionsLabel)}</h3>
            ${sectionsHtml}
          </div>`;
}
/**
 * Map a stakeholder type to its localized label.
 *
 * @param type - Stakeholder type identifier
 * @param mdStrings - Localized multi-dimensional SWOT strings
 * @returns Localized stakeholder label
 */
function getStakeholderLabel(type, mdStrings) {
    const map = {
        citizen: mdStrings.stakeholderCitizen,
        industry: mdStrings.stakeholderIndustry,
        ngo: mdStrings.stakeholderNgo,
        mep: mdStrings.stakeholderMep,
        government: mdStrings.stakeholderGovernment,
        media: mdStrings.stakeholderMedia,
    };
    return map[type];
}
/**
 * Build the stakeholder perspectives section.
 * Each stakeholder view is a collapsible `<details>` widget.
 *
 * @param stakeholderViews - Map of stakeholder type to SWOT analysis
 * @param swotStrings - Localized SWOT strings for quadrant labels
 * @param mdStrings - Localized multi-dimensional SWOT strings
 * @returns HTML string for the stakeholder section, or empty string if none
 */
function buildStakeholderSection(stakeholderViews, swotStrings, mdStrings) {
    if (!stakeholderViews)
        return '';
    const entries = Object.entries(stakeholderViews);
    const validEntries = entries.filter(([, view]) => {
        const total = view.strengths.length +
            view.weaknesses.length +
            view.opportunities.length +
            view.threats.length;
        return total > 0;
    });
    if (validEntries.length === 0)
        return '';
    const viewsHtml = validEntries
        .map(([type, view]) => {
        const label = getStakeholderLabel(type, mdStrings);
        const miniGrid = buildSwotMiniGrid(view, swotStrings);
        return `<details class="swot-stakeholder swot-stakeholder-${escapeHTML(type)}">
                <summary class="swot-stakeholder-summary">${escapeHTML(label)}</summary>
                <div class="swot-stakeholder-content">${miniGrid}</div>
              </details>`;
    })
        .join('\n              ');
    return `<div class="swot-stakeholders" role="region" aria-label="${escapeHTML(mdStrings.stakeholderPerspectivesLabel)}">
            <h3 class="swot-section-subheading">${escapeHTML(mdStrings.stakeholderPerspectivesLabel)}</h3>
            ${viewsHtml}
          </div>`;
}
/**
 * Build the temporal analysis section.
 * Short-term and medium-term (and optionally long-term) periods are
 * each rendered as a collapsible `<details>` widget.
 *
 * @param temporal - Temporal SWOT assessment data
 * @param swotStrings - Localized SWOT strings for quadrant labels
 * @param mdStrings - Localized multi-dimensional SWOT strings
 * @returns HTML string for the temporal section, or empty string if not provided
 */
function buildTemporalSection(temporal, swotStrings, mdStrings) {
    if (!temporal)
        return '';
    const renderPeriod = (analysis, label) => {
        if (!analysis)
            return '';
        const total = analysis.strengths.length +
            analysis.weaknesses.length +
            analysis.opportunities.length +
            analysis.threats.length;
        if (total === 0)
            return '';
        const miniGrid = buildSwotMiniGrid(analysis, swotStrings);
        return `<details class="swot-temporal-period">
              <summary class="swot-temporal-summary">${escapeHTML(label)}</summary>
              <div class="swot-temporal-content">${miniGrid}</div>
            </details>`;
    };
    const shortHtml = renderPeriod(temporal.shortTerm, mdStrings.shortTermLabel);
    const mediumHtml = renderPeriod(temporal.mediumTerm, mdStrings.mediumTermLabel);
    const longHtml = renderPeriod(temporal.longTerm, mdStrings.longTermLabel);
    const combinedHtml = shortHtml + mediumHtml + longHtml;
    if (!combinedHtml)
        return '';
    return `<div class="swot-temporal" role="region" aria-label="${escapeHTML(mdStrings.temporalAnalysisLabel)}">
            <h3 class="swot-section-subheading">${escapeHTML(mdStrings.temporalAnalysisLabel)}</h3>
            ${combinedHtml}
          </div>`;
}
/**
 * Build the cross-references section linking SWOT items to EP documents.
 *
 * @param crossReferences - Array of cross-reference data
 * @param mdStrings - Localized multi-dimensional SWOT strings
 * @returns HTML string for the cross-references section, or empty string if empty
 */
function buildCrossReferencesSection(crossReferences, mdStrings) {
    if (!crossReferences || crossReferences.length === 0)
        return '';
    const refsHtml = crossReferences
        .map((ref) => {
        const urlPart = ref.url && isSafeURL(ref.url)
            ? `<a href="${escapeHTML(ref.url)}" class="swot-ref-link" rel="noopener noreferrer">${escapeHTML(ref.documentId)}</a>`
            : `<span class="swot-ref-id">${escapeHTML(ref.documentId)}</span>`;
        return `<li class="swot-ref-item">
                <span class="swot-ref-evidence">${escapeHTML(mdStrings.evidenceLabel)}: ${escapeHTML(ref.itemText)}</span>
                — ${urlPart}: <cite class="swot-ref-title">${escapeHTML(ref.documentTitle)}</cite>
              </li>`;
    })
        .join('\n              ');
    return `<div class="swot-cross-references" role="region" aria-label="${escapeHTML(mdStrings.crossReferencesLabel)}">
            <h3 class="swot-section-subheading">${escapeHTML(mdStrings.crossReferencesLabel)}</h3>
            <ul class="swot-ref-list">${refsHtml}</ul>
          </div>`;
}
/**
 * Aggregate all dimension items into a single SwotAnalysis for the primary view.
 *
 * @param dimensions - Array of dimension data
 * @returns Aggregated SwotAnalysis or null if all dimensions are empty
 */
function aggregateDimensions(dimensions) {
    const strengths = dimensions.flatMap((d) => d.strengths);
    const weaknesses = dimensions.flatMap((d) => d.weaknesses);
    const opportunities = dimensions.flatMap((d) => d.opportunities);
    const threats = dimensions.flatMap((d) => d.threats);
    const total = strengths.length + weaknesses.length + opportunities.length + threats.length;
    if (total === 0)
        return null;
    return { strengths, weaknesses, opportunities, threats };
}
// ─── Multi-dimensional SWOT main builder ─────────────────────────────────────
/**
 * Build a complete multi-dimensional SWOT analysis section HTML.
 *
 * Renders a primary aggregated 4-quadrant SWOT matrix followed by optional:
 * - **Dimension drill-downs** (Political, Economic, Social, Legal, Geopolitical)
 *   as CSS-only `<details>` disclosure widgets
 * - **Stakeholder perspectives** (Citizens, Industry, NGOs, MEPs, etc.)
 *   as collapsible `<details>` widgets
 * - **Temporal analysis** (short-term, medium-term, long-term)
 *   as collapsible `<details>` widgets
 * - **Cross-references** linking SWOT items to specific EP documents/votes
 *
 * All interactivity is CSS-only (no JavaScript), ensuring compatibility
 * with strict CSP policies and WCAG 2.1 AA accessibility requirements.
 *
 * Returns an empty string if the analysis has no dimensions or all
 * dimensions are empty.
 *
 * @param analysis - Multi-dimensional SWOT data (null/undefined returns empty string)
 * @param lang - BCP 47 language code for localized headings (defaults to "en")
 * @param heading - Optional custom section heading override
 * @returns HTML section string or empty string
 */
export function buildMultiDimensionalSwotSection(analysis, lang = 'en', heading) {
    if (!analysis)
        return '';
    if (analysis.dimensions.length === 0)
        return '';
    const swotStrings = getLocalizedString(SWOT_STRINGS, lang);
    const mdStrings = getLocalizedString(MULTI_DIMENSIONAL_SWOT_STRINGS, lang);
    const sectionHeading = heading ?? analysis.title ?? swotStrings.sectionHeading;
    const aggregated = aggregateDimensions(analysis.dimensions);
    if (!aggregated)
        return '';
    const primaryMatrix = buildSwotMiniGrid(aggregated, swotStrings);
    const dimensionsHtml = buildDimensionsDrillDown(analysis.dimensions, swotStrings, mdStrings);
    const stakeholderHtml = buildStakeholderSection(analysis.stakeholderViews, swotStrings, mdStrings);
    const temporalHtml = buildTemporalSection(analysis.temporal, swotStrings, mdStrings);
    const refsHtml = buildCrossReferencesSection(analysis.crossReferences, mdStrings);
    return `
          <section class="swot-analysis swot-multidimensional" role="region" aria-label="${escapeHTML(sectionHeading)}">
            <h2>${escapeHTML(sectionHeading)}</h2>
            <div class="swot-matrix">
              <div class="swot-axis-labels">
                <span class="swot-axis-internal">${escapeHTML(swotStrings.internalLabel)}</span>
                <span class="swot-axis-external">${escapeHTML(swotStrings.externalLabel)}</span>
              </div>
              ${primaryMatrix}
            </div>
            ${dimensionsHtml}
            ${stakeholderHtml}
            ${temporalHtml}
            ${refsHtml}
          </section>`;
}
//# sourceMappingURL=swot-content.js.map