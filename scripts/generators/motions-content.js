// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/MotionsContent
 * @description Pure functions for building motions article HTML and
 * generating placeholder/fallback data when MCP is unavailable.
 */
import { escapeHTML } from '../utils/file-utils.js';
import { getLocalizedString, EDITORIAL_STRINGS } from '../constants/languages.js';
/** Marker string used in all fallback/placeholder data to indicate MCP data is unavailable */
export const PLACEHOLDER_MARKER = 'DATA_UNAVAILABLE (placeholder)';
/**
 * Get fallback data for motions article
 *
 * @param dateStr - Current date string
 * @param dateFromStr - Start date string
 * @returns Object with all fallback data arrays
 */
export function getMotionsFallbackData(dateStr, dateFromStr) {
    return {
        votingRecords: [
            {
                title: 'Example motion (placeholder – data unavailable)',
                date: dateStr,
                result: PLACEHOLDER_MARKER,
                votes: { for: 0, against: 0, abstain: 0 },
            },
            {
                title: 'Example amendment (placeholder – data unavailable)',
                date: dateFromStr,
                result: PLACEHOLDER_MARKER,
                votes: { for: 0, against: 0, abstain: 0 },
            },
        ],
        votingPatterns: [
            {
                group: 'Example group A (placeholder)',
                cohesion: 0.0,
                participation: 0.0,
            },
            {
                group: 'Example group B (placeholder)',
                cohesion: 0.0,
                participation: 0.0,
            },
        ],
        anomalies: [
            {
                type: 'Placeholder example',
                description: 'No real anomaly data available from MCP – this is illustrative placeholder content only.',
                severity: 'LOW',
            },
        ],
        questions: [
            {
                author: 'Placeholder MEP 1',
                topic: 'Placeholder parliamentary question on energy security (MCP data unavailable)',
                date: dateStr,
                status: PLACEHOLDER_MARKER,
            },
            {
                author: 'Placeholder MEP 2',
                topic: 'Placeholder parliamentary question on migration policy (MCP data unavailable)',
                date: dateFromStr,
                status: PLACEHOLDER_MARKER,
            },
        ],
    };
}
/**
 * Generate HTML content for motions article
 *
 * @param dateFromStr - Start date
 * @param dateStr - End date
 * @param votingRecords - Voting records data
 * @param votingPatterns - Voting patterns data
 * @param anomalies - Anomalies data
 * @param questions - Questions data
 * @param lang - Language code for editorial strings (default: 'en')
 * @returns HTML content string
 */
export function generateMotionsContent(dateFromStr, dateStr, votingRecords, votingPatterns, anomalies, questions, lang = 'en') {
    const editorial = getLocalizedString(EDITORIAL_STRINGS, lang);
    return `
    <div class="article-content">
      <section class="lede">
        <p>Recent parliamentary activities reveal key voting patterns, party cohesion trends, and notable political dynamics in the European Parliament. ${escapeHTML(editorial.sourceAttribution)}, analysis of voting records from ${escapeHTML(dateFromStr)} to ${escapeHTML(dateStr)} provides insights into legislative decision-making and party discipline.</p>
      </section>
      
      <section class="voting-results">
        <h2>Recent Voting Records</h2>
        ${votingRecords
        .map((record) => `
          <div class="vote-item">
            <h3>${escapeHTML(record.title)}</h3>
            <p class="vote-date">Date: ${escapeHTML(record.date)}</p>
            <p class="vote-result"><strong>Result:</strong> ${escapeHTML(record.result)}</p>
            <div class="vote-breakdown">
              <span class="vote-for">For: ${escapeHTML(String(record.votes.for))}</span>
              <span class="vote-against">Against: ${escapeHTML(String(record.votes.against))}</span>
              <span class="vote-abstain">Abstain: ${escapeHTML(String(record.votes.abstain))}</span>
            </div>
          </div>
        `)
        .join('')}
      </section>
      
      <section class="voting-patterns">
        <h2>Party Cohesion Analysis</h2>
        <p>${escapeHTML(editorial.parliamentaryContext)}: Analysis of voting behavior reveals varying levels of party discipline across political groups:</p>
        ${votingPatterns
        .map((pattern) => `
          <div class="pattern-item">
            <h3>${escapeHTML(pattern.group)}</h3>
            <p><strong>Cohesion:</strong> ${escapeHTML(String((pattern.cohesion * 100).toFixed(1)))}%</p>
            <p><strong>Participation:</strong> ${escapeHTML(String((pattern.participation * 100).toFixed(1)))}%</p>
          </div>
        `)
        .join('')}
      </section>
      
      <section class="anomalies">
        <h2>Detected Voting Anomalies</h2>
        <p>${escapeHTML(editorial.analysisNote)}: Unusual voting patterns that deviate from typical party lines:</p>
        ${anomalies
        .map((anomaly) => {
        const rawSeverity = anomaly.severity ?? 'unknown';
        const severityDisplay = typeof rawSeverity === 'string' ? rawSeverity : String(rawSeverity);
        const severityClass = severityDisplay.toLowerCase();
        return `
          <div class="anomaly-item severity-${escapeHTML(severityClass)}">
            <h3>${escapeHTML(anomaly.type)}</h3>
            <p>${escapeHTML(anomaly.description)}</p>
            <p class="severity">Severity: ${escapeHTML(severityDisplay)}</p>
          </div>
        `;
    })
        .join('')}
      </section>
      
      <section class="questions">
        <h2>Recent Parliamentary Questions</h2>
        ${questions
        .map((question) => `
          <div class="question-item">
            <p class="question-author">${escapeHTML(question.author)}</p>
            <p class="question-topic"><strong>${escapeHTML(question.topic)}</strong></p>
            <p class="question-meta">Date: ${escapeHTML(question.date)} | Status: ${escapeHTML(question.status)}</p>
          </div>
        `)
        .join('')}
      </section>

      <section class="why-this-matters">
        <h2>${escapeHTML(editorial.whyThisMatters)}</h2>
        <p>${escapeHTML(editorial.keyTakeaway)}: Voting records and party cohesion data reveal political alignment across the European Parliament, helping citizens understand how their elected representatives make legislative decisions.</p>
      </section>
    </div>
  `;
}
// ─── Political Alignment section ──────────────────────────────────────────────
/**
 * Build HTML list items for voting record alignment rows
 *
 * @param records - Voting records to render
 * @returns HTML list items string
 */
function buildVoteAlignmentHtml(records) {
    if (records.length === 0)
        return '';
    const items = records
        .map((r) => {
        const forVotes = escapeHTML(String(r.votes.for));
        const againstVotes = escapeHTML(String(r.votes.against));
        const abstainVotes = escapeHTML(String(r.votes.abstain));
        return (`<li class="alignment-vote">` +
            `<strong>${escapeHTML(r.title)}</strong> — ` +
            `${escapeHTML(r.result)} ` +
            `(${forVotes}&#43; / ${againstVotes}&#8722; / ${abstainVotes} abstain)` +
            `</li>`);
    })
        .join('\n          ');
    return `<ul class="alignment-votes">\n          ${items}\n        </ul>`;
}
/**
 * Build HTML list items for coalition alignment rows
 *
 * @param coalitions - Coalition intelligence items to render
 * @returns HTML list items string
 */
function buildCoalitionAlignmentHtml(coalitions) {
    if (coalitions.length === 0)
        return '';
    const items = coalitions
        .map((c) => `<li class="alignment-coalition alignment-${escapeHTML(c.riskLevel)}">` +
        `${escapeHTML(c.groups.join(', '))} — ` +
        `cohesion: ${escapeHTML(String(Math.round(c.cohesionScore * 100)))}% ` +
        `(${escapeHTML(c.alignmentTrend)})</li>`)
        .join('\n          ');
    return `<ul class="alignment-coalitions">\n          ${items}\n        </ul>`;
}
/**
 * Build political alignment analysis section for motions, showing how
 * voting records map to coalition cohesion and cross-party dynamics.
 * Returns an empty string when both input arrays are empty or yield no items.
 *
 * @param votingRecords - Voting records to analyse
 * @param coalitions - Coalition intelligence data from MCP
 * @param language - BCP 47 language code used as the section lang attribute
 * @returns HTML string for the political alignment section
 */
export function buildPoliticalAlignmentSection(votingRecords, coalitions, language) {
    if (votingRecords.length === 0 && coalitions.length === 0)
        return '';
    const recordsHtml = buildVoteAlignmentHtml(votingRecords);
    const coalitionsHtml = buildCoalitionAlignmentHtml(coalitions);
    if (!recordsHtml && !coalitionsHtml)
        return '';
    return `
        <section class="political-alignment" lang="${escapeHTML(language)}">
          <h2>Political Alignment</h2>
          ${recordsHtml}
          ${coalitionsHtml}
        </section>`;
}
//# sourceMappingURL=motions-content.js.map