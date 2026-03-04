// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/DeepAnalysisContent
 * @description Pure functions for building the deep political analysis HTML
 * section using the "5W + Impact" framework. This section is injected into
 * every article type to provide parliament-intelligence-grade analysis.
 *
 * The framework covers:
 * - **What**: Core subject
 * - **Who**: Key actors (political groups, rapporteurs, MEPs, institutions)
 * - **When**: Timeline and key dates
 * - **Why**: Root causes and strategic motivations
 * - **Winners/Losers**: Stakeholder impact assessment
 * - **Impact**: Multi-perspective consequences (political, economic, social, legal, geopolitical)
 * - **Actions → Consequences**: Causal chains from decisions to outcomes
 * - **Mistakes**: Miscalculations and missed opportunities
 * - **Outlook**: Strategic forward look
 */
import { escapeHTML } from '../utils/file-utils.js';
import { getLocalizedString, DEEP_ANALYSIS_STRINGS } from '../constants/languages.js';
// ─── Sub-section builders ────────────────────────────────────────────────────
/**
 * Build the "What" sub-section
 *
 * @param what - Description of what happened
 * @param heading - Localized heading
 * @returns HTML string
 */
function buildWhatSection(what, heading) {
    if (!what)
        return '';
    return `
            <div class="analysis-what">
              <h3>${escapeHTML(heading)}</h3>
              <p>${escapeHTML(what)}</p>
            </div>`;
}
/**
 * Build the "Who" sub-section with key actors list
 *
 * @param who - Array of actor names/descriptions
 * @param heading - Localized heading
 * @returns HTML string
 */
function buildWhoSection(who, heading) {
    if (who.length === 0)
        return '';
    const items = who.map((actor) => `<li>${escapeHTML(actor)}</li>`).join('\n                ');
    return `
            <div class="analysis-who">
              <h3>${escapeHTML(heading)}</h3>
              <ul class="actor-list">
                ${items}
              </ul>
            </div>`;
}
/**
 * Build the "When" sub-section with timeline
 *
 * @param when - Array of date/milestone descriptions
 * @param heading - Localized heading
 * @returns HTML string
 */
function buildWhenSection(when, heading) {
    if (when.length === 0)
        return '';
    const items = when
        .map((milestone) => `<li class="timeline-item">${escapeHTML(milestone)}</li>`)
        .join('\n                ');
    return `
            <div class="analysis-when">
              <h3>${escapeHTML(heading)}</h3>
              <ol class="timeline-list">
                ${items}
              </ol>
            </div>`;
}
/**
 * Build the "Why" sub-section
 *
 * @param why - Root cause analysis text
 * @param heading - Localized heading
 * @returns HTML string
 */
function buildWhySection(why, heading) {
    if (!why)
        return '';
    return `
            <div class="analysis-why">
              <h3>${escapeHTML(heading)}</h3>
              <p>${escapeHTML(why)}</p>
            </div>`;
}
/**
 * Map stakeholder outcome to CSS class
 *
 * @param outcome - Winner/loser/neutral
 * @returns CSS class name
 */
function outcomeClass(outcome) {
    return `stakeholder-${outcome}`;
}
/**
 * Get localized label for stakeholder outcome
 *
 * @param outcome - Winner/loser/neutral
 * @param strings - Localized strings
 * @param strings.winnerLabel
 * @param strings.loserLabel
 * @param strings.neutralLabel
 * @returns Localized label
 */
function outcomeLabel(outcome, strings) {
    switch (outcome) {
        case 'winner':
            return strings.winnerLabel;
        case 'loser':
            return strings.loserLabel;
        default:
            return strings.neutralLabel;
    }
}
/**
 * Build the "Winners & Losers" sub-section
 *
 * @param outcomes - Stakeholder assessments
 * @param heading - Localized heading
 * @param strings - Localized label strings
 * @param strings.winnerLabel
 * @param strings.loserLabel
 * @param strings.neutralLabel
 * @returns HTML string
 */
function buildStakeholderSection(outcomes, heading, strings) {
    if (outcomes.length === 0)
        return '';
    const items = outcomes
        .map((s) => `<li class="stakeholder-item ${outcomeClass(s.outcome)}">` +
        `<span class="stakeholder-badge">${escapeHTML(outcomeLabel(s.outcome, strings))}</span> ` +
        `<strong>${escapeHTML(s.actor)}</strong>: ${escapeHTML(s.reason)}` +
        `</li>`)
        .join('\n                ');
    return `
            <div class="analysis-stakeholders">
              <h3>${escapeHTML(heading)}</h3>
              <ul class="stakeholder-list">
                ${items}
              </ul>
            </div>`;
}
/**
 * Build the multi-perspective "Impact Assessment" sub-section
 *
 * @param impact - Impact strings per perspective
 * @param heading - Localized heading
 * @param labels - Localized perspective labels
 * @param labels.politicalLabel
 * @param labels.economicLabel
 * @param labels.socialLabel
 * @param labels.legalLabel
 * @param labels.geopoliticalLabel
 * @returns HTML string
 */
function buildImpactSection(impact, heading, labels) {
    const perspectives = [
        { label: labels.politicalLabel, text: impact.political, css: 'impact-political' },
        { label: labels.economicLabel, text: impact.economic, css: 'impact-economic' },
        { label: labels.socialLabel, text: impact.social, css: 'impact-social' },
        { label: labels.legalLabel, text: impact.legal, css: 'impact-legal' },
        { label: labels.geopoliticalLabel, text: impact.geopolitical, css: 'impact-geopolitical' },
    ].filter((p) => p.text);
    if (perspectives.length === 0)
        return '';
    const items = perspectives
        .map((p) => `<div class="impact-perspective ${p.css}">` +
        `<h4>${escapeHTML(p.label)}</h4>` +
        `<p>${escapeHTML(p.text)}</p>` +
        `</div>`)
        .join('\n              ');
    return `
            <div class="analysis-impact">
              <h3>${escapeHTML(heading)}</h3>
              <div class="impact-grid">
              ${items}
              </div>
            </div>`;
}
/**
 * Get localized severity label
 *
 * @param severity - Severity level
 * @param strings - Localized strings
 * @param strings.severityLow
 * @param strings.severityMedium
 * @param strings.severityHigh
 * @param strings.severityCritical
 * @returns Localized label
 */
function severityLabel(severity, strings) {
    switch (severity) {
        case 'low':
            return strings.severityLow;
        case 'medium':
            return strings.severityMedium;
        case 'high':
            return strings.severityHigh;
        case 'critical':
            return strings.severityCritical;
        default:
            return String(severity);
    }
}
/**
 * Build the "Actions → Consequences" sub-section
 *
 * @param items - Action-consequence pairs
 * @param heading - Localized heading
 * @param labels - Localized column labels
 * @param labels.actionLabel
 * @param labels.consequenceLabel
 * @param strings - Localized severity strings
 * @param strings.severityLow
 * @param strings.severityMedium
 * @param strings.severityHigh
 * @param strings.severityCritical
 * @returns HTML string
 */
function buildConsequencesSection(items, heading, labels, strings) {
    if (items.length === 0)
        return '';
    const rows = items
        .map((item) => `<tr class="consequence-row severity-${escapeHTML(item.severity)}">` +
        `<td class="action-cell">${escapeHTML(item.action)}</td>` +
        `<td class="arrow-cell">→</td>` +
        `<td class="consequence-cell">${escapeHTML(item.consequence)}</td>` +
        `<td class="severity-cell"><span class="severity-badge severity-${escapeHTML(item.severity)}">${escapeHTML(severityLabel(item.severity, strings))}</span></td>` +
        `</tr>`)
        .join('\n                ');
    return `
            <div class="analysis-consequences">
              <h3>${escapeHTML(heading)}</h3>
              <table class="consequences-table" role="table">
                <thead>
                  <tr>
                    <th scope="col">${escapeHTML(labels.actionLabel)}</th>
                    <th scope="col" aria-hidden="true"></th>
                    <th scope="col">${escapeHTML(labels.consequenceLabel)}</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                ${rows}
                </tbody>
              </table>
            </div>`;
}
/**
 * Build the "Mistakes" sub-section
 *
 * @param mistakes - Political mistake assessments
 * @param heading - Localized heading
 * @param alternativeLabel - Localized "should have" label
 * @returns HTML string
 */
function buildMistakesSection(mistakes, heading, alternativeLabel) {
    if (mistakes.length === 0)
        return '';
    const items = mistakes
        .map((m) => `<div class="mistake-item">` +
        `<p class="mistake-actor"><strong>${escapeHTML(m.actor)}</strong></p>` +
        `<p class="mistake-desc">${escapeHTML(m.description)}</p>` +
        `<p class="mistake-alt"><em>${escapeHTML(alternativeLabel)}:</em> ${escapeHTML(m.alternative)}</p>` +
        `</div>`)
        .join('\n              ');
    return `
            <div class="analysis-mistakes">
              <h3>${escapeHTML(heading)}</h3>
              ${items}
            </div>`;
}
/**
 * Build the "Strategic Outlook" sub-section
 *
 * @param outlook - Forward-looking analysis text
 * @param heading - Localized heading
 * @returns HTML string
 */
function buildOutlookSection(outlook, heading) {
    if (!outlook)
        return '';
    return `
            <div class="analysis-outlook">
              <h3>${escapeHTML(heading)}</h3>
              <p>${escapeHTML(outlook)}</p>
            </div>`;
}
// ─── Main builder ────────────────────────────────────────────────────────────
/**
 * Build the complete deep political analysis section HTML.
 *
 * This section provides parliament-intelligence-grade analysis using the
 * "5W + Impact" framework. It is designed for sophisticated readers who
 * want multi-perspective understanding of European Parliament decisions.
 *
 * Returns an empty string if the analysis object is null/undefined or
 * contains no meaningful content.
 *
 * @param analysis - Deep analysis data (null/undefined returns empty string)
 * @param lang - BCP 47 language code for localized headings
 * @returns HTML section string or empty string
 */
export function buildDeepAnalysisSection(analysis, lang) {
    if (!analysis)
        return '';
    const strings = getLocalizedString(DEEP_ANALYSIS_STRINGS, lang);
    const whatHtml = buildWhatSection(analysis.what, strings.whatHeading);
    const whoHtml = buildWhoSection(analysis.who, strings.whoHeading);
    const whenHtml = buildWhenSection(analysis.when, strings.whenHeading);
    const whyHtml = buildWhySection(analysis.why, strings.whyHeading);
    const stakeholderHtml = buildStakeholderSection(analysis.stakeholderOutcomes, strings.stakeholderHeading, strings);
    const impactHtml = buildImpactSection(analysis.impactAssessment, strings.impactHeading, strings);
    const consequencesHtml = buildConsequencesSection(analysis.actionConsequences, strings.consequencesHeading, strings, strings);
    const mistakesHtml = buildMistakesSection(analysis.mistakes, strings.mistakesHeading, strings.alternativeLabel);
    const outlookHtml = buildOutlookSection(analysis.outlook, strings.outlookHeading);
    const innerContent = whatHtml +
        whoHtml +
        whenHtml +
        whyHtml +
        stakeholderHtml +
        impactHtml +
        consequencesHtml +
        mistakesHtml +
        outlookHtml;
    // If all sub-sections are empty, return nothing
    if (!innerContent.trim())
        return '';
    return `
          <section class="deep-analysis" lang="${escapeHTML(lang)}">
            <h2>${escapeHTML(strings.sectionHeading)}</h2>
            ${innerContent}
          </section>`;
}
//# sourceMappingURL=deep-analysis-content.js.map