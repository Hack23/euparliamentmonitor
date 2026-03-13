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
import type {
  DeepAnalysis,
  DeepAnalysisStrings,
  StakeholderOutcome,
  ActionConsequence,
  PoliticalMistake,
  StakeholderPerspective,
  StakeholderOutcomeMatrix,
} from '../types/index.js';
import { ALL_STAKEHOLDER_TYPES } from '../types/index.js';

// ─── Sub-section builders ────────────────────────────────────────────────────

/**
 * Build the "What" sub-section
 *
 * @param what - Description of what happened
 * @param heading - Localized heading
 * @param contentLang - Language of the content text (omit when same as display language)
 * @returns HTML string
 */
function buildWhatSection(what: string, heading: string, contentLang?: string): string {
  if (!what) return '';
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
function buildWhoSection(who: readonly string[], heading: string, contentLang?: string): string {
  if (who.length === 0) return '';
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
function buildWhenSection(when: readonly string[], heading: string, contentLang?: string): string {
  if (when.length === 0) return '';
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
function buildWhySection(why: string, heading: string, contentLang?: string): string {
  if (!why) return '';
  const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
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
function outcomeClass(outcome: StakeholderOutcome['outcome']): string {
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
function outcomeLabel(
  outcome: StakeholderOutcome['outcome'],
  strings: { winnerLabel: string; loserLabel: string; neutralLabel: string }
): string {
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
function buildStakeholderSection(
  outcomes: readonly StakeholderOutcome[],
  heading: string,
  strings: { winnerLabel: string; loserLabel: string; neutralLabel: string },
  contentLang?: string
): string {
  if (outcomes.length === 0) return '';
  const contentLangAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
  const items = outcomes
    .map(
      (s) =>
        `<li class="stakeholder-item ${outcomeClass(s.outcome)}">` +
        `<span class="stakeholder-badge">${escapeHTML(outcomeLabel(s.outcome, strings))}</span> ` +
        `<span${contentLangAttr}><strong>${escapeHTML(s.actor)}</strong>: ${escapeHTML(s.reason)}</span>` +
        `</li>`
    )
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
function buildImpactSection(
  impact: DeepAnalysis['impactAssessment'],
  heading: string,
  labels: {
    politicalLabel: string;
    economicLabel: string;
    socialLabel: string;
    legalLabel: string;
    geopoliticalLabel: string;
  },
  contentLang?: string
): string {
  const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
  const perspectives = [
    { label: labels.politicalLabel, text: impact.political, css: 'impact-political' },
    { label: labels.economicLabel, text: impact.economic, css: 'impact-economic' },
    { label: labels.socialLabel, text: impact.social, css: 'impact-social' },
    { label: labels.legalLabel, text: impact.legal, css: 'impact-legal' },
    { label: labels.geopoliticalLabel, text: impact.geopolitical, css: 'impact-geopolitical' },
  ].filter((p) => p.text);
  if (perspectives.length === 0) return '';
  const items = perspectives
    .map(
      (p) =>
        `<div class="impact-card ${p.css}">` +
        `<h4>${escapeHTML(p.label)}</h4>` +
        `<p${langAttr}>${escapeHTML(p.text)}</p>` +
        `</div>`
    )
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
function severityLabel(
  severity: ActionConsequence['severity'],
  strings: {
    severityLow: string;
    severityMedium: string;
    severityHigh: string;
    severityCritical: string;
  }
): string {
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
function buildConsequencesSection(
  items: readonly ActionConsequence[],
  heading: string,
  labels: Readonly<
    Pick<DeepAnalysisStrings, 'actionLabel' | 'consequenceLabel' | 'severityColumnLabel'>
  >,
  strings: {
    severityLow: string;
    severityMedium: string;
    severityHigh: string;
    severityCritical: string;
  },
  contentLang?: string
): string {
  if (items.length === 0) return '';
  const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
  const rows = items
    .map(
      (item) =>
        `<tr class="consequence-row severity-${escapeHTML(item.severity)}">` +
        `<td class="action-cell"${langAttr}>${escapeHTML(item.action)}</td>` +
        `<td class="arrow-cell">→</td>` +
        `<td class="consequence-cell"${langAttr}>${escapeHTML(item.consequence)}</td>` +
        `<td class="severity-cell"><span class="severity-badge severity-${escapeHTML(item.severity)}">${escapeHTML(severityLabel(item.severity, strings))}</span></td>` +
        `</tr>`
    )
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
function buildMistakesSection(
  mistakes: readonly PoliticalMistake[],
  heading: string,
  alternativeLabel: string,
  contentLang?: string
): string {
  if (mistakes.length === 0) return '';
  const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
  const items = mistakes
    .map(
      (m) =>
        `<div class="mistake-card">` +
        `<p class="mistake-actor"><strong>${escapeHTML(m.actor)}</strong></p>` +
        `<p class="mistake-description"${langAttr}>${escapeHTML(m.description)}</p>` +
        `<p class="mistake-alternative"><em>${escapeHTML(alternativeLabel)}:</em> <span${langAttr}>${escapeHTML(m.alternative)}</span></p>` +
        `</div>`
    )
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
function buildOutlookSection(outlook: string, heading: string, contentLang?: string): string {
  if (!outlook) return '';
  const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
  return `
            <div class="analysis-outlook">
              <h3>${escapeHTML(heading)}</h3>
              <p${langAttr}>${escapeHTML(outlook)}</p>
            </div>`;
}

// ─── Main builder ────────────────────────────────────────────────────────────

/**
 * Map a StakeholderPerspective impact to a CSS class suffix.
 *
 * @param impact - Stakeholder impact direction
 * @returns CSS class suffix
 */
function perspectiveImpactClass(impact: StakeholderPerspective['impact']): string {
  return `perspective-${impact}`;
}

/**
 * Build the "Multi-Stakeholder Perspectives" sub-section.
 * Renders a card grid with one card per stakeholder group showing
 * impact direction, severity, reasoning, and evidence.
 *
 * @param perspectives - Array of stakeholder perspectives
 * @param heading - Localized section heading
 * @param contentLang - Language of the reasoning/evidence text
 * @returns HTML string, or empty string if no perspectives provided
 */
function buildStakeholderPerspectivesSection(
  perspectives: readonly StakeholderPerspective[] | undefined,
  heading: string,
  contentLang?: string
): string {
  if (!perspectives || perspectives.length === 0) return '';
  const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';
  const cards = perspectives
    .map((p) => {
      const evidenceItems = p.evidence
        .map((e) => `<li>${escapeHTML(e)}</li>`)
        .join('');
      const evidenceHtml =
        evidenceItems
          ? `<ul class="perspective-evidence">${evidenceItems}</ul>`
          : '';
      return (
        `<div class="stakeholder-perspective-card ${escapeHTML(perspectiveImpactClass(p.impact))} severity-${escapeHTML(p.severity)}">` +
        `<div class="perspective-header">` +
        `<span class="perspective-stakeholder">${escapeHTML(p.stakeholder.replace(/_/g, ' '))}</span>` +
        `<span class="perspective-impact-badge perspective-impact-${escapeHTML(p.impact)}">${escapeHTML(p.impact)}</span>` +
        `<span class="perspective-severity-badge severity-${escapeHTML(p.severity)}">${escapeHTML(p.severity)}</span>` +
        `</div>` +
        `<p class="perspective-reasoning"${langAttr}>${escapeHTML(p.reasoning)}</p>` +
        evidenceHtml +
        `</div>`
      );
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
 * @param contentLang - Language of the action text
 * @returns HTML string, or empty string if no matrix rows provided
 */
function buildStakeholderOutcomeMatrixSection(
  matrix: readonly StakeholderOutcomeMatrix[] | undefined,
  heading: string,
  contentLang?: string
): string {
  if (!matrix || matrix.length === 0) return '';
  const langAttr = contentLang ? ` lang="${escapeHTML(contentLang)}"` : '';

  const headerCells = ALL_STAKEHOLDER_TYPES
    .map((s) => `<th scope="col">${escapeHTML(s.replace(/_/g, ' '))}</th>`)
    .join('');

  const rows = matrix
    .map((row) => {
      const cells = ALL_STAKEHOLDER_TYPES
        .map((s) => {
          // eslint-disable-next-line security/detect-object-injection -- key from const array
          const outcome = row.outcomes[s];
          return `<td class="matrix-cell outcome-${escapeHTML(outcome)}">${escapeHTML(outcome)}</td>`;
        })
        .join('');
      return (
        `<tr>` +
        `<td class="matrix-action"${langAttr}>${escapeHTML(row.action)}</td>` +
        `<td class="matrix-confidence confidence-${escapeHTML(row.confidence)}">${escapeHTML(row.confidence)}</td>` +
        cells +
        `</tr>`
      );
    })
    .join('\n                ');

  return `
            <div class="analysis-outcome-matrix">
              <h3>${escapeHTML(heading)}</h3>
              <div class="outcome-matrix-scroll">
              <table class="outcome-matrix-table" role="table">
                <thead>
                  <tr>
                    <th scope="col">Action</th>
                    <th scope="col">Confidence</th>
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
 * "5W + Impact" framework. It is designed for sophisticated readers who
 * want multi-perspective understanding of European Parliament decisions.
 *
 * Returns an empty string if the analysis object is null/undefined or
 * contains no meaningful content.
 *
 * @param analysis - Deep analysis data (null/undefined returns empty string)
 * @param lang - BCP 47 language code for localized headings
 * @param contentLang - BCP 47 language code for the content text; when it
 *   differs from `lang`, each content element gets a `lang` attribute so
 *   screen readers and translation tools handle the language switch correctly.
 *   Defaults to `lang` (no extra attributes added).
 * @returns HTML section string or empty string
 */
export function buildDeepAnalysisSection(
  analysis: DeepAnalysis | null | undefined,
  lang: string,
  contentLang = lang
): string {
  if (!analysis) return '';

  const strings = getLocalizedString(DEEP_ANALYSIS_STRINGS, lang);
  const cl = contentLang !== lang ? contentLang : undefined;

  const whatHtml = buildWhatSection(analysis.what, strings.whatHeading, cl);
  const whoHtml = buildWhoSection(analysis.who, strings.whoHeading, cl);
  const whenHtml = buildWhenSection(analysis.when, strings.whenHeading, cl);
  const whyHtml = buildWhySection(analysis.why, strings.whyHeading, cl);
  const stakeholderHtml = buildStakeholderSection(
    analysis.stakeholderOutcomes,
    strings.stakeholderHeading,
    strings,
    cl
  );
  const impactHtml = buildImpactSection(
    analysis.impactAssessment,
    strings.impactHeading,
    strings,
    cl
  );
  const consequencesHtml = buildConsequencesSection(
    analysis.actionConsequences,
    strings.consequencesHeading,
    strings,
    strings,
    cl
  );
  const mistakesHtml = buildMistakesSection(
    analysis.mistakes,
    strings.mistakesHeading,
    strings.alternativeLabel,
    cl
  );
  const outlookHtml = buildOutlookSection(analysis.outlook, strings.outlookHeading, cl);
  const perspectivesHtml = buildStakeholderPerspectivesSection(
    analysis.stakeholderPerspectives,
    'Multi-Stakeholder Perspectives',
    cl
  );
  const outcomeMatrixHtml = buildStakeholderOutcomeMatrixSection(
    analysis.stakeholderOutcomeMatrix,
    'Stakeholder Outcome Matrix',
    cl
  );

  const innerContent =
    whatHtml +
    whoHtml +
    whenHtml +
    whyHtml +
    stakeholderHtml +
    impactHtml +
    consequencesHtml +
    mistakesHtml +
    outlookHtml +
    perspectivesHtml +
    outcomeMatrixHtml;

  // If all sub-sections are empty, return nothing
  if (!innerContent.trim()) return '';

  return `
          <section class="deep-analysis" lang="${escapeHTML(lang)}">
            <h2>${escapeHTML(strings.sectionHeading)}</h2>
            ${innerContent}
          </section>`;
}
