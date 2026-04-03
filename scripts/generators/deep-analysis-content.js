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
import { escapeHTML, isSafeURL } from '../utils/file-utils.js';
import { getLocalizedString, DEEP_ANALYSIS_STRINGS } from '../constants/languages.js';
import { isAiMarker, AI_PENDING_CLASS } from '../constants/analysis-constants.js';
import { ALL_STAKEHOLDER_TYPES } from '../types/index.js';
// ─── AI pending notice helper ────────────────────────────────────────────────
/**
 * Return an inline HTML notice for an AI-pending field.
 *
 * @param message - Short notice text (no HTML)
 * @returns Safe HTML string
 */
function aiPendingNotice(message) {
    return `<em class="${AI_PENDING_CLASS}">${escapeHTML(message)}</em>`;
}
// ─── Sub-section builders ────────────────────────────────────────────────────
/**
 * Build the "What" sub-section
 *
 * @param what - Description of what happened
 * @param heading - Localized heading
 * @param contentLang - Language of the content text (omit when same as display language)
 * @returns HTML string
 */
function buildWhatSection(what, heading, contentLang) {
    if (!what)
        return '';
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    return `
            <div class="analysis-what">
              <h3>${escapeHTML(heading)}</h3>
              <p${langAttr}>${escapeHTML(what)}</p>
            </div>`;
}
/**
 * Build the "Who" sub-section with key actors list
 *
 * @param who - Array of actor names/descriptions
 * @param heading - Localized heading
 * @param contentLang - Language of the content text (omit when same as display language)
 * @returns HTML string
 */
function buildWhoSection(who, heading, contentLang) {
    if (who.length === 0)
        return '';
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    const items = who.map((actor) => `<li>${escapeHTML(actor)}</li>`).join('\n                ');
    return `
            <div class="analysis-who">
              <h3>${escapeHTML(heading)}</h3>
              <ul class="actor-list"${langAttr}>
                ${items}
              </ul>
            </div>`;
}
/**
 * Build the "When" sub-section with timeline
 *
 * @param when - Array of date/milestone descriptions
 * @param heading - Localized heading
 * @param contentLang - Language of the content text (omit when same as display language)
 * @returns HTML string
 */
function buildWhenSection(when, heading, contentLang) {
    if (when.length === 0)
        return '';
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    const items = when
        .map((milestone) => `<li class="timeline-item">${escapeHTML(milestone)}</li>`)
        .join('\n                ');
    return `
            <div class="analysis-when">
              <h3>${escapeHTML(heading)}</h3>
              <ol class="timeline-list"${langAttr}>
                ${items}
              </ol>
            </div>`;
}
/**
 * Build the "Why" sub-section
 *
 * @param why - Root cause analysis text
 * @param heading - Localized heading
 * @param contentLang - Language of the content text (omit when same as display language)
 * @returns HTML string
 */
function buildWhySection(why, heading, contentLang) {
    if (!why)
        return '';
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    if (isAiMarker(why)) {
        return `
            <div class="analysis-why ${AI_PENDING_CLASS}">
              <h3>${escapeHTML(heading)}</h3>
              <p${langAttr} class="${AI_PENDING_CLASS}">${aiPendingNotice('AI political analysis pending — this section will be completed by the editorial intelligence workflow.')}</p>
            </div>`;
    }
    return `
            <div class="analysis-why">
              <h3>${escapeHTML(heading)}</h3>
              <p${langAttr}>${escapeHTML(why)}</p>
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
 * @param strings.winnerLabel - Label for winning stakeholders
 * @param strings.loserLabel - Label for losing stakeholders
 * @param strings.neutralLabel - Label for neutral stakeholders
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
 * @param strings.winnerLabel - Label for winning stakeholders
 * @param strings.loserLabel - Label for losing stakeholders
 * @param strings.neutralLabel - Label for neutral stakeholders
 * @param contentLang - Language of the actor/reason text (omit when same as display language)
 * @returns HTML string
 */
function buildStakeholderSection(outcomes, heading, strings, contentLang) {
    if (outcomes.length === 0)
        return '';
    const contentLangAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    const items = outcomes
        .map((s) => {
        const reasonText = isAiMarker(s.reason)
            ? aiPendingNotice('AI stakeholder analysis pending.')
            : escapeHTML(s.reason);
        return (`<li class="stakeholder-item ${outcomeClass(s.outcome)}">` +
            `<span class="stakeholder-badge">${escapeHTML(outcomeLabel(s.outcome, strings))}</span> ` +
            `<span${contentLangAttr}><strong>${escapeHTML(s.actor)}</strong>: ${reasonText}</span>` +
            `</li>`);
    })
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
 * @param labels.politicalLabel - Label for political perspective
 * @param labels.economicLabel - Label for economic perspective
 * @param labels.socialLabel - Label for social perspective
 * @param labels.legalLabel - Label for legal perspective
 * @param labels.geopoliticalLabel - Label for geopolitical perspective
 * @param contentLang - Language of the content text (omit when same as display language)
 * @returns HTML string
 */
function buildImpactSection(impact, heading, labels, contentLang) {
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
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
        .map((p) => {
        if (isAiMarker(p.text)) {
            return (`<div class="impact-card ${p.css} ${AI_PENDING_CLASS}">` +
                `<h4>${escapeHTML(p.label)}</h4>` +
                `<p${langAttr} class="${AI_PENDING_CLASS}">${aiPendingNotice('AI impact analysis pending.')}</p>` +
                `</div>`);
        }
        return (`<div class="impact-card ${p.css}">` +
            `<h4>${escapeHTML(p.label)}</h4>` +
            `<p${langAttr}>${escapeHTML(p.text)}</p>` +
            `</div>`);
    })
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
 * @param strings.severityLow - Label for low severity
 * @param strings.severityMedium - Label for medium severity
 * @param strings.severityHigh - Label for high severity
 * @param strings.severityCritical - Label for critical severity
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
 * @param labels.actionLabel - Column header for action
 * @param labels.consequenceLabel - Column header for consequence
 * @param labels.severityColumnLabel - Column header for severity
 * @param strings - Localized severity strings
 * @param strings.severityLow - Label for low severity
 * @param strings.severityMedium - Label for medium severity
 * @param strings.severityHigh - Label for high severity
 * @param strings.severityCritical - Label for critical severity
 * @param contentLang - Language of the content text (omit when same as display language)
 * @returns HTML string
 */
function buildConsequencesSection(items, heading, labels, strings, contentLang) {
    if (items.length === 0)
        return '';
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    const rows = items
        .map((item) => {
        const consequenceText = isAiMarker(item.consequence)
            ? aiPendingNotice('AI consequence analysis pending.')
            : escapeHTML(item.consequence);
        return (`<tr class="consequence-row severity-${escapeHTML(item.severity)}">` +
            `<td class="action-cell"${langAttr}>${escapeHTML(item.action)}</td>` +
            `<td class="arrow-cell">→</td>` +
            `<td class="consequence-cell"${langAttr}>${consequenceText}</td>` +
            `<td class="severity-cell"><span class="severity-badge severity-${escapeHTML(item.severity)}">${escapeHTML(severityLabel(item.severity, strings))}</span></td>` +
            `</tr>`);
    })
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
                    <th scope="col">${escapeHTML(labels.severityColumnLabel)}</th>
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
 * @param contentLang - Language of the description/alternative text (omit when same as display language)
 * @returns HTML string
 */
function buildMistakesSection(mistakes, heading, alternativeLabel, contentLang) {
    if (mistakes.length === 0)
        return '';
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    const items = mistakes
        .map((m) => {
        const altText = isAiMarker(m.alternative)
            ? aiPendingNotice('AI alternative analysis pending.')
            : escapeHTML(m.alternative);
        return (`<div class="mistake-card">` +
            `<p class="mistake-actor"><strong>${escapeHTML(m.actor)}</strong></p>` +
            `<p class="mistake-description"${langAttr}>${escapeHTML(m.description)}</p>` +
            `<p class="mistake-alternative"><em>${escapeHTML(alternativeLabel)}:</em> <span${langAttr}>${altText}</span></p>` +
            `</div>`);
    })
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
 * @param contentLang - Language of the content text (omit when same as display language)
 * @returns HTML string
 */
function buildOutlookSection(outlook, heading, contentLang) {
    if (!outlook)
        return '';
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    if (isAiMarker(outlook)) {
        return `
            <div class="analysis-outlook ${AI_PENDING_CLASS}">
              <h3>${escapeHTML(heading)}</h3>
              <p${langAttr} class="${AI_PENDING_CLASS}">${aiPendingNotice('AI strategic outlook pending — this section will be completed by the editorial intelligence workflow.')}</p>
            </div>`;
    }
    return `
            <div class="analysis-outlook">
              <h3>${escapeHTML(heading)}</h3>
              <p${langAttr}>${escapeHTML(outlook)}</p>
            </div>`;
}
// ─── Enhanced analysis section builders ──────────────────────────────────────
/**
 * Type guard — checks whether an analysis object carries enhanced fields
 *
 * @param a - Base deep analysis to test
 * @returns `true` when the object is an `EnhancedDeepAnalysis`
 */
function isEnhancedDeepAnalysis(a) {
    if (typeof a !== 'object' || a === null)
        return false;
    return ('qualityMetadata' in a ||
        'scenarioPlanning' in a ||
        'reasoningChains' in a ||
        'executiveSummary' in a);
}
/**
 * Build a confidence badge with emoji indicator and text label
 *
 * @param confidence - Confidence level
 * @param strings - Localized strings
 * @returns HTML span element
 */
function buildConfidenceBadge(confidence, strings) {
    let emoji;
    let label;
    switch (confidence) {
        case 'high':
            emoji = '🟢';
            label = strings.confidenceHigh;
            break;
        case 'medium':
            emoji = '🟡';
            label = strings.confidenceMedium;
            break;
        default:
            emoji = '🔴';
            label = strings.confidenceLow;
    }
    return `<span class="confidence-badge confidence-${escapeHTML(confidence)}" aria-label="${escapeHTML(label)}">${emoji} ${escapeHTML(label)}</span>`;
}
/**
 * Build the executive summary section
 *
 * @param summary - Executive summary text
 * @param confidence - Optional overall confidence level
 * @param heading - Localized heading
 * @param strings - Localized strings
 * @param contentLang - Language of the content text
 * @returns HTML string
 */
function buildExecutiveSummarySection(summary, confidence, heading, strings, contentLang) {
    if (!summary)
        return '';
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    const badge = confidence ? buildConfidenceBadge(confidence, strings) : '';
    return `
            <div class="analysis-executive-summary">
              <h3>${escapeHTML(heading)}</h3>
              <div class="summary-header">
                <p${langAttr}>${escapeHTML(summary)}</p>${badge}
              </div>
            </div>`;
}
/**
 * Build the reasoning chains section
 *
 * @param chains - Reasoning chain items
 * @param heading - Localized heading
 * @param strings - Localized strings
 * @param contentLang - Language of the content text
 * @returns HTML string
 */
function buildReasoningChainSection(chains, heading, strings, contentLang) {
    if (chains.length === 0)
        return '';
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    const cards = chains
        .map((chain) => {
        const evidenceItems = chain.evidence
            .map((ref) => {
            const dateText = ref.date ? ` (${escapeHTML(ref.date)})` : '';
            if (ref.url && isSafeURL(ref.url)) {
                return `<li${langAttr}><a href="${escapeHTML(ref.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(ref.title)}${dateText}</a></li>`;
            }
            return `<li${langAttr}>${escapeHTML(ref.title)}${dateText}</li>`;
        })
            .join('\n                  ');
        const evidenceHtml = chain.evidence.length > 0
            ? `<div class="evidence-refs-block">
                  <h4>${escapeHTML(strings.evidenceRefsHeading)}</h4>
                  <ul class="evidence-refs">
                  ${evidenceItems}
                  </ul>
                </div>`
            : '';
        const counterItems = chain.counterArguments
            .map((ca) => `<li${langAttr}>${escapeHTML(ca)}</li>`)
            .join('\n                  ');
        const counterHtml = chain.counterArguments.length > 0
            ? `<div class="counter-args-block">
                  <h4>${escapeHTML(strings.counterArgumentsHeading)}</h4>
                  <ul class="counter-arguments">
                  ${counterItems}
                  </ul>
                </div>`
            : '';
        return `<div class="reasoning-chain-card">
                <p><strong>${escapeHTML(strings.premiseLabel)}</strong> <span${langAttr}>${escapeHTML(chain.premise)}</span></p>
                ${evidenceHtml}
                <p><strong>${escapeHTML(strings.inferenceLabel)}</strong> <span${langAttr}>${escapeHTML(chain.inference)}</span></p>
                ${buildConfidenceBadge(chain.confidence, strings)}
                ${counterHtml}
                <p class="chain-conclusion"><strong>${escapeHTML(strings.conclusionLabel)}</strong> <span${langAttr}>${escapeHTML(chain.conclusion)}</span></p>
              </div>`;
    })
        .join('\n              ');
    return `
            <div class="analysis-reasoning-chains">
              <h3>${escapeHTML(heading)}</h3>
              ${cards}
            </div>`;
}
/**
 * Build the scenario planning section
 *
 * @param scenarios - Scenario planning data
 * @param heading - Localized heading
 * @param strings - Localized strings
 * @param contentLang - Language of the content text
 * @returns HTML string
 */
function buildScenarioPlanningSection(scenarios, heading, strings, contentLang) {
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    function renderScenario(scenario, cssClass, label) {
        const rawPct = Number.isFinite(scenario.probability) ? scenario.probability * 100 : 0;
        const pct = Math.max(0, Math.min(100, Math.round(rawPct)));
        const triggerItems = scenario.triggers
            .map((t) => `<li${langAttr}>${escapeHTML(t)}</li>`)
            .join('\n                  ');
        const impactItems = scenario.implications
            .map((imp) => `<li class="scenario-impact scenario-severity-${escapeHTML(imp.severity)}">` +
            `<strong>${escapeHTML(imp.stakeholder)}</strong>: <span${langAttr}>${escapeHTML(imp.impact)}</span>` +
            `</li>`)
            .join('\n                  ');
        return `<div class="scenario-card ${escapeHTML(cssClass)}">
                <h4>${escapeHTML(label)}</h4>
                <p${langAttr}>${escapeHTML(scenario.description)}</p>
                <div class="scenario-probability">
                  <span>${escapeHTML(strings.probabilityLabel)}: ${pct}%</span>
                  <div class="probability-bar" style="width:${pct}%" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHTML(label)} ${pct}%"></div>
                </div>
                ${scenario.triggers.length > 0
            ? `<details class="scenario-triggers">
                  <summary>${escapeHTML(strings.triggersLabel)}</summary>
                  <ul>${triggerItems}</ul>
                </details>`
            : ''}
                ${scenario.implications.length > 0
            ? `<details class="scenario-impacts">
                  <summary>${escapeHTML(strings.impliedImpactsLabel)}</summary>
                  <ul class="scenario-impact-list">${impactItems}</ul>
                </details>`
            : ''}
                <p class="scenario-timeline"><strong>${escapeHTML(strings.timelineLabel)}:</strong> <span${langAttr}>${escapeHTML(scenario.timeline)}</span></p>
              </div>`;
    }
    const wildcardItems = scenarios.wildcards
        .map((w) => `<li${langAttr}>${escapeHTML(w)}</li>`)
        .join('\n              ');
    const wildcardHtml = scenarios.wildcards.length > 0
        ? `<div class="scenario-wildcards">
              <h4>${escapeHTML(strings.wildcardsLabel)}</h4>
              <ul class="wildcard-list">${wildcardItems}</ul>
            </div>`
        : '';
    return `
            <div class="analysis-scenario-planning">
              <h3>${escapeHTML(heading)}</h3>
              <div class="scenario-grid">
                ${renderScenario(scenarios.bestCase, 'scenario-best', strings.bestCaseLabel)}
                ${renderScenario(scenarios.mostLikely, 'scenario-likely', strings.mostLikelyLabel)}
                ${renderScenario(scenarios.worstCase, 'scenario-worst', strings.worstCaseLabel)}
              </div>
              ${wildcardHtml}
            </div>`;
}
/**
 * Map iteration type to localized label
 *
 * @param type - Iteration type
 * @param strings - Localized strings
 * @returns Localized label
 */
function iterationTypeLabel(type, strings) {
    switch (type) {
        case 'initial':
            return strings.iterationInitial;
        case 'stakeholder_challenge':
            return strings.iterationStakeholderChallenge;
        case 'evidence_validation':
            return strings.iterationEvidenceValidation;
        default:
            return strings.iterationSynthesis;
    }
}
/**
 * Map evidence strength to localized label
 *
 * @param strength - Evidence strength
 * @param strings - Localized strings
 * @returns Localized label
 */
function evidenceStrengthLabel(strength, strings) {
    switch (strength) {
        case 'strong':
            return strings.evidenceStrong;
        case 'moderate':
            return strings.evidenceModerate;
        default:
            return strings.evidenceWeak;
    }
}
/**
 * Build the analysis methodology section
 *
 * @param metadata - Quality metadata
 * @param heading - Localized heading
 * @param strings - Localized strings
 * @param contentLang - Language of the content text
 * @returns HTML string
 */
function buildAnalysisMethodologySection(metadata, heading, strings, contentLang) {
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    const iterationItems = metadata.iterations
        .map((iter) => {
        const findingItems = iter.findings
            .map((f) => `<li${langAttr}>${escapeHTML(f)}</li>`)
            .join('\n                  ');
        const refinementItems = iter.refinements
            .map((r) => `<li${langAttr}>${escapeHTML(r)}</li>`)
            .join('\n                  ');
        return `<div class="iteration-item">
                <div class="iteration-header">
                  <span class="iteration-pass">Pass ${escapeHTML(String(Number.isFinite(iter.pass) ? iter.pass : 0))}</span>
                  <span class="iteration-type">${escapeHTML(iterationTypeLabel(iter.type, strings))}</span>
                  ${buildConfidenceBadge(iter.confidence, strings)}
                </div>
                ${iter.findings.length > 0
            ? `<ul class="iteration-findings">${findingItems}</ul>`
            : ''}
                ${iter.refinements.length > 0
            ? `<ul class="iteration-refinements">${refinementItems}</ul>`
            : ''}
              </div>`;
    })
        .join('\n              ');
    return `
            <div class="analysis-methodology">
              <h3>${escapeHTML(heading)}</h3>
              <dl class="methodology-stats">
                <dt>${escapeHTML(strings.overallConfidenceLabel)}</dt>
                <dd>${buildConfidenceBadge(metadata.overallConfidence, strings)}</dd>
                <dt>${escapeHTML(strings.evidenceStrengthLabel)}</dt>
                <dd>${escapeHTML(evidenceStrengthLabel(metadata.evidenceStrength, strings))}</dd>
                <dt>${escapeHTML(strings.iterationCountLabel)}</dt>
                <dd>${escapeHTML(String(Number.isFinite(metadata.iterationCount) ? metadata.iterationCount : 0))}</dd>
              </dl>
              ${metadata.iterations.length > 0 ? `<div class="iteration-timeline">${iterationItems}</div>` : ''}
            </div>`;
}
// ─── Main builder ────────────────────────────────────────────────────────────
/**
 * Map a StakeholderPerspective impact to a CSS class suffix.
 *
 * @param impact - Stakeholder impact direction
 * @returns CSS class suffix
 */
function perspectiveImpactClass(impact) {
    return `perspective-${impact}`;
}
/**
 * Map a stakeholder type to its localized display label.
 *
 * @param stakeholder - Internal stakeholder type identifier
 * @param strings - Localized label strings
 * @returns Localized stakeholder label
 */
function localizedStakeholderLabel(stakeholder, strings) {
    const map = {
        political_groups: strings.politicalGroupsLabel,
        civil_society: strings.civilSocietyLabel,
        industry: strings.industryLabel,
        national_govts: strings.nationalGovtsLabel,
        citizens: strings.citizensLabel,
        eu_institutions: strings.euInstitutionsLabel,
    };
    return map[stakeholder];
}
/**
 * Map a stakeholder impact direction to its localized display label.
 *
 * @param impact - Impact direction value
 * @param strings - Localized label strings
 * @returns Localized impact label
 */
function localizedImpactLabel(impact, strings) {
    const map = {
        positive: strings.positiveLabel,
        negative: strings.negativeLabel,
        neutral: strings.neutralLabel,
        mixed: strings.mixedLabel,
    };
    return map[impact];
}
/**
 * Map a severity level to its localized display label.
 *
 * @param severity - Severity level value
 * @param strings - Localized label strings
 * @returns Localized severity label
 */
function localizedSeverityLabel(severity, strings) {
    const map = {
        high: strings.severityHigh,
        medium: strings.severityMedium,
        low: strings.severityLow,
    };
    return map[severity];
}
/**
 * Map an outcome value to its localized display label.
 *
 * @param outcome - Outcome value (winner/loser/neutral)
 * @param strings - Localized label strings
 * @returns Localized outcome label
 */
function localizedOutcomeLabel(outcome, strings) {
    const map = {
        winner: strings.winnerLabel,
        loser: strings.loserLabel,
        neutral: strings.neutralLabel,
    };
    return map[outcome] ?? outcome;
}
/**
 * Build the "Multi-Stakeholder Perspectives" sub-section.
 * Renders a card grid with one card per stakeholder group showing
 * impact direction, severity, reasoning, and evidence.
 *
 * @param perspectives - Array of stakeholder perspectives
 * @param heading - Localized section heading
 * @param strings - Localized label strings for stakeholder names, impact, and severity
 * @param contentLang - Language of the reasoning/evidence text
 * @returns HTML string, or empty string if no perspectives provided
 */
function buildStakeholderPerspectivesSection(perspectives, heading, strings, contentLang) {
    if (!perspectives || perspectives.length === 0)
        return '';
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    const cards = perspectives
        .map((p) => {
        const evidenceItems = p.evidence.map((e) => `<li>${escapeHTML(e)}</li>`).join('');
        const evidenceHtml = evidenceItems
            ? `<ul class="perspective-evidence">${evidenceItems}</ul>`
            : '';
        return (`<div class="stakeholder-perspective-card ${escapeHTML(perspectiveImpactClass(p.impact))} severity-${escapeHTML(p.severity)}">` +
            `<div class="perspective-header">` +
            `<span class="perspective-stakeholder">${escapeHTML(localizedStakeholderLabel(p.stakeholder, strings))}</span>` +
            `<span class="perspective-impact-badge perspective-impact-${escapeHTML(p.impact)}">${escapeHTML(localizedImpactLabel(p.impact, strings))}</span>` +
            `<span class="perspective-severity-badge severity-${escapeHTML(p.severity)}">${escapeHTML(localizedSeverityLabel(p.severity, strings))}</span>` +
            `</div>` +
            `<p class="perspective-reasoning"${langAttr}>${isAiMarker(p.reasoning) ? aiPendingNotice('AI stakeholder perspective analysis pending.') : escapeHTML(p.reasoning)}</p>` +
            evidenceHtml +
            `</div>`);
    })
        .join('\n              ');
    return `
            <div class="analysis-stakeholder-perspectives">
              <h3>${escapeHTML(heading)}</h3>
              <div class="stakeholder-perspectives-grid">
              ${cards}
              </div>
            </div>`;
}
/**
 * Build the "Stakeholder Outcome Matrix" sub-section.
 * Renders an accessible table mapping each action to winner/loser/neutral
 * outcomes per stakeholder group.
 *
 * @param matrix - Array of stakeholder outcome matrix rows
 * @param heading - Localized section heading
 * @param strings - Localized label strings for columns and stakeholder groups
 * @param contentLang - Language of the action text
 * @returns HTML string, or empty string if no matrix rows provided
 */
function buildStakeholderOutcomeMatrixSection(matrix, heading, strings, contentLang) {
    if (!matrix || matrix.length === 0)
        return '';
    const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
    const headerCells = ALL_STAKEHOLDER_TYPES.map((s) => `<th scope="col">${escapeHTML(localizedStakeholderLabel(s, strings))}</th>`).join('');
    const rows = matrix
        .map((row) => {
        const cells = ALL_STAKEHOLDER_TYPES.map((s) => {
            // eslint-disable-next-line security/detect-object-injection -- key from const array
            const outcome = row.outcomes[s];
            return `<td class="matrix-cell outcome-${escapeHTML(outcome)}">${escapeHTML(localizedOutcomeLabel(outcome, strings))}</td>`;
        }).join('');
        return (`<tr>` +
            `<th scope="row" class="matrix-action"${langAttr}>${escapeHTML(row.action)}</th>` +
            `<td class="matrix-confidence confidence-${escapeHTML(row.confidence)}">${escapeHTML(localizedSeverityLabel(row.confidence, strings))}</td>` +
            cells +
            `</tr>`);
    })
        .join('\n                ');
    return `
            <div class="analysis-outcome-matrix">
              <h3>${escapeHTML(heading)}</h3>
              <div class="outcome-matrix-scroll">
              <table class="outcome-matrix-table" role="table">
                <thead>
                  <tr>
                    <th scope="col">${escapeHTML(strings.actionLabel)}</th>
                    <th scope="col">${escapeHTML(strings.confidenceLabel)}</th>
                    ${headerCells}
                  </tr>
                </thead>
                <tbody>
                ${rows}
                </tbody>
              </table>
              </div>
            </div>`;
}
/**
 * Build the complete deep political analysis section HTML.
 *
 * This section provides parliament-intelligence-grade analysis using the
 * "5W + Impact" framework. When the input is an `EnhancedDeepAnalysis` it
 * additionally renders an executive summary, reasoning chains, scenario
 * planning, and analysis methodology.
 *
 * Returns an empty string if the analysis object is null/undefined or
 * contains no meaningful content.
 *
 * @param analysis - Deep analysis data (null/undefined returns empty string).
 *   Accepts both `DeepAnalysis` and `EnhancedDeepAnalysis`.
 * @param lang - BCP 47 language code for localized headings
 * @param contentLang - BCP 47 language code for the content text; when it
 *   differs from `lang`, each content element gets a `lang` attribute so
 *   screen readers and translation tools handle the language switch correctly.
 *   Defaults to `lang` (no extra attributes added).
 * @returns HTML section string or empty string
 */
export function buildDeepAnalysisSection(analysis, lang, contentLang = lang) {
    if (!analysis)
        return '';
    const strings = getLocalizedString(DEEP_ANALYSIS_STRINGS, lang);
    const cl = contentLang !== lang ? contentLang : undefined;
    // ─── Enhanced sections (before/after base sections) ────────────────────
    let executiveSummaryHtml = '';
    let reasoningChainsHtml = '';
    let scenarioPlanningHtml = '';
    let methodologyHtml = '';
    if (isEnhancedDeepAnalysis(analysis)) {
        if (analysis.executiveSummary) {
            executiveSummaryHtml = buildExecutiveSummarySection(analysis.executiveSummary, analysis.qualityMetadata?.overallConfidence, strings.executiveSummaryHeading, strings, cl);
        }
        if (analysis.reasoningChains && analysis.reasoningChains.length > 0) {
            reasoningChainsHtml = buildReasoningChainSection(analysis.reasoningChains, strings.reasoningChainsHeading, strings, cl);
        }
        if (analysis.scenarioPlanning) {
            scenarioPlanningHtml = buildScenarioPlanningSection(analysis.scenarioPlanning, strings.scenarioPlanningHeading, strings, cl);
        }
        if (analysis.qualityMetadata) {
            methodologyHtml = buildAnalysisMethodologySection(analysis.qualityMetadata, strings.analysisMethodologyHeading, strings, cl);
        }
    }
    // ─── Base "5W + Impact" sections ───────────────────────────────────────
    const whatHtml = buildWhatSection(analysis.what, strings.whatHeading, cl);
    const whoHtml = buildWhoSection(analysis.who, strings.whoHeading, cl);
    const whenHtml = buildWhenSection(analysis.when, strings.whenHeading, cl);
    const whyHtml = buildWhySection(analysis.why, strings.whyHeading, cl);
    const stakeholderHtml = buildStakeholderSection(analysis.stakeholderOutcomes, strings.stakeholderHeading, strings, cl);
    const impactHtml = buildImpactSection(analysis.impactAssessment, strings.impactHeading, strings, cl);
    const consequencesHtml = buildConsequencesSection(analysis.actionConsequences, strings.consequencesHeading, strings, strings, cl);
    const mistakesHtml = buildMistakesSection(analysis.mistakes, strings.mistakesHeading, strings.alternativeLabel, cl);
    const outlookHtml = buildOutlookSection(analysis.outlook, strings.outlookHeading, cl);
    const perspectivesHtml = buildStakeholderPerspectivesSection(analysis.stakeholderPerspectives, strings.perspectivesHeading, strings, cl);
    const outcomeMatrixHtml = buildStakeholderOutcomeMatrixSection(analysis.stakeholderOutcomeMatrix, strings.outcomeMatrixHeading, strings, cl);
    const innerContent = executiveSummaryHtml +
        whatHtml +
        whoHtml +
        whenHtml +
        whyHtml +
        reasoningChainsHtml +
        stakeholderHtml +
        impactHtml +
        consequencesHtml +
        mistakesHtml +
        outlookHtml +
        scenarioPlanningHtml +
        perspectivesHtml +
        outcomeMatrixHtml +
        methodologyHtml;
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