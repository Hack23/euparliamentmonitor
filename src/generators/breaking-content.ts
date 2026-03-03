// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/BreakingContent
 * @description Pure functions for building breaking-news article HTML.
 *
 * **Feed-first approach**: EP feed data (adopted texts, events, procedures,
 * MEP updates) is the primary news content. Analytical intelligence sections
 * (voting anomalies, coalition dynamics) are supplementary context only.
 * Precomputed statistics are NEVER the news itself.
 */

import { escapeHTML } from '../utils/file-utils.js';
import { getLocalizedString, EDITORIAL_STRINGS, BREAKING_STRINGS } from '../constants/languages.js';
import type {
  VotingAnomalyIntelligence,
  CoalitionIntelligence,
  MEPInfluenceScore,
  BreakingNewsFeedData,
  AdoptedTextFeedItem,
  EventFeedItem,
  ProcedureFeedItem,
  MEPFeedItem,
} from '../types/index.js';

/** Maximum characters to display from raw MCP intelligence data */
const MAX_DATA_CHARS = 2000;

/** Maximum feed items to render per section */
const MAX_FEED_ITEMS = 10;

// ─── Feed section builders ───────────────────────────────────────────────────

/**
 * Build adopted texts section HTML from feed items.
 *
 * @param items - Adopted text feed items
 * @param lang - Language code for localized strings
 * @returns HTML section string or empty string
 */
function buildAdoptedTextsSection(items: readonly AdoptedTextFeedItem[], lang: string): string {
  if (items.length === 0) return '';
  const strings = getLocalizedString(BREAKING_STRINGS, lang);
  const listItems = items
    .slice(0, MAX_FEED_ITEMS)
    .map(
      (item) =>
        `<li class="feed-item adopted-text-item">` +
        `<strong>${escapeHTML(item.title)}</strong>` +
        `${item.date ? ` <span class="feed-date">(${escapeHTML(item.date)})</span>` : ''}` +
        `${item.type ? ` <span class="feed-type">[${escapeHTML(item.type)}]</span>` : ''}` +
        `</li>`
    )
    .join('\n            ');
  return `
        <section class="adopted-texts-feed">
          <h2>${escapeHTML(strings.adoptedTextsHeading)}</h2>
          <ul>
            ${listItems}
          </ul>
        </section>`;
}

/**
 * Build recent events section HTML from feed items.
 *
 * @param items - Event feed items
 * @param lang - Language code for localized strings
 * @returns HTML section string or empty string
 */
function buildRecentEventsSection(items: readonly EventFeedItem[], lang: string): string {
  if (items.length === 0) return '';
  const strings = getLocalizedString(BREAKING_STRINGS, lang);
  const listItems = items
    .slice(0, MAX_FEED_ITEMS)
    .map(
      (item) =>
        `<li class="feed-item event-item">` +
        `<strong>${escapeHTML(item.title)}</strong>` +
        `${item.date ? ` <span class="feed-date">(${escapeHTML(item.date)})</span>` : ''}` +
        `${item.location ? ` <span class="feed-location">${escapeHTML(item.location)}</span>` : ''}` +
        `</li>`
    )
    .join('\n            ');
  return `
        <section class="events-feed">
          <h2>${escapeHTML(strings.recentEventsHeading)}</h2>
          <ul>
            ${listItems}
          </ul>
        </section>`;
}

/**
 * Build procedure updates section HTML from feed items.
 *
 * @param items - Procedure feed items
 * @param lang - Language code for localized strings
 * @returns HTML section string or empty string
 */
function buildProcedureUpdatesSection(items: readonly ProcedureFeedItem[], lang: string): string {
  if (items.length === 0) return '';
  const strings = getLocalizedString(BREAKING_STRINGS, lang);
  const listItems = items
    .slice(0, MAX_FEED_ITEMS)
    .map(
      (item) =>
        `<li class="feed-item procedure-item">` +
        `<strong>${escapeHTML(item.title)}</strong>` +
        `${item.stage ? ` <span class="feed-stage">[${escapeHTML(item.stage)}]</span>` : ''}` +
        `${item.date ? ` <span class="feed-date">(${escapeHTML(item.date)})</span>` : ''}` +
        `</li>`
    )
    .join('\n            ');
  return `
        <section class="procedures-feed">
          <h2>${escapeHTML(strings.procedureUpdatesHeading)}</h2>
          <ul>
            ${listItems}
          </ul>
        </section>`;
}

/**
 * Build MEP updates section HTML from feed items.
 *
 * @param items - MEP feed items
 * @param lang - Language code for localized strings
 * @returns HTML section string or empty string
 */
function buildMEPUpdatesSection(items: readonly MEPFeedItem[], lang: string): string {
  if (items.length === 0) return '';
  const strings = getLocalizedString(BREAKING_STRINGS, lang);
  const listItems = items
    .slice(0, MAX_FEED_ITEMS)
    .map(
      (item) =>
        `<li class="feed-item mep-item">` +
        `<strong>${escapeHTML(item.name)}</strong>` +
        `${item.country ? ` <span class="feed-country">(${escapeHTML(item.country)})</span>` : ''}` +
        `${item.group ? ` <span class="feed-group">${escapeHTML(item.group)}</span>` : ''}` +
        `</li>`
    )
    .join('\n            ');
  return `
        <section class="mep-updates-feed">
          <h2>${escapeHTML(strings.mepUpdatesHeading)}</h2>
          <ul>
            ${listItems}
          </ul>
        </section>`;
}

/**
 * Build the combined feed-based news sections (primary content).
 *
 * @param feedData - Aggregated feed data
 * @param lang - Language code
 * @returns HTML string with all feed sections
 */
function buildFeedSections(feedData: BreakingNewsFeedData | undefined, lang: string): string {
  if (!feedData) return '';
  const sections = [
    buildAdoptedTextsSection(feedData.adoptedTexts, lang),
    buildRecentEventsSection(feedData.events, lang),
    buildProcedureUpdatesSection(feedData.procedures, lang),
    buildMEPUpdatesSection(feedData.mepUpdates, lang),
  ];
  return sections.filter(Boolean).join('');
}

// ─── Private intelligence section builders ───────────────────────────────────

/**
 * Build intelligence briefing section HTML from structured anomaly data
 *
 * @param anomalies - Structured voting anomaly intelligence items
 * @param lang - Language code for localized strings
 * @returns HTML section string or empty string
 */
function buildAnomalyAlertSection(anomalies: VotingAnomalyIntelligence[], lang: string): string {
  if (anomalies.length === 0) return '';
  const strings = getLocalizedString(BREAKING_STRINGS, lang);
  const items = anomalies
    .map(
      (a) =>
        `<li class="anomaly-${escapeHTML(a.significance)}">` +
        `<strong>${escapeHTML(a.description)}</strong> — ` +
        `${escapeHTML(a.implication)} ` +
        `(deviation: ${escapeHTML(String(a.deviationPercentage))}%)</li>`
    )
    .join('\n            ');
  return `
        <section class="anomaly-alert">
          <h3>${escapeHTML(strings.votingAnomalyAlert)}</h3>
          <ul>
            ${items}
          </ul>
        </section>`;
}

/**
 * Build coalition dynamics section HTML from structured coalition data
 *
 * @param coalitions - Structured coalition intelligence items
 * @param lang - Language code for localized strings
 * @returns HTML section string or empty string
 */
function buildCoalitionDynamicsSection(coalitions: CoalitionIntelligence[], lang: string): string {
  if (coalitions.length === 0) return '';
  const strings = getLocalizedString(BREAKING_STRINGS, lang);
  const items = coalitions
    .map(
      (c) =>
        `<li class="coalition-${escapeHTML(c.riskLevel)}">` +
        `${escapeHTML(c.groups.join(', '))} — ` +
        `cohesion: ${escapeHTML(String(Math.round(c.cohesionScore * 100)))}% ` +
        `(${escapeHTML(c.alignmentTrend)})</li>`
    )
    .join('\n            ');
  return `
        <section class="coalition-dynamics">
          <h3>${escapeHTML(strings.coalitionDynamicsSection)}</h3>
          <ul>
            ${items}
          </ul>
        </section>`;
}

/**
 * Build key parliamentary players section HTML from structured MEP influence data
 *
 * @param mepScores - Structured MEP influence score items
 * @param lang - Language code for localized strings
 * @returns HTML section string or empty string
 */
function buildKeyPlayersIntelSection(mepScores: MEPInfluenceScore[], lang: string): string {
  if (mepScores.length === 0) return '';
  const strings = getLocalizedString(BREAKING_STRINGS, lang);
  const items = mepScores
    .map(
      (m) =>
        `<li class="mep-score">` +
        `<strong>${escapeHTML(m.mepName)}</strong> — ` +
        `score: ${escapeHTML(String(Math.round(m.overallScore)))} ` +
        `${m.rank ? `(${escapeHTML(m.rank)})` : ''}</li>`
    )
    .join('\n            ');
  return `
        <section class="key-players-intel">
          <h3>${escapeHTML(strings.keyPlayers)}</h3>
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
 * @param lang - Language code for localized strings
 * @returns HTML section string or empty string
 */
function buildIntelligenceBriefingSection(
  anomalies: VotingAnomalyIntelligence[],
  coalitions: CoalitionIntelligence[],
  mepScores: MEPInfluenceScore[],
  lang: string
): string {
  const hasIntel = anomalies.length > 0 || coalitions.length > 0 || mepScores.length > 0;
  if (!hasIntel) return '';
  const strings = getLocalizedString(BREAKING_STRINGS, lang);
  return `
        <section class="intelligence-briefing">
          <h2>${escapeHTML(strings.intelligenceBriefing)}</h2>
          ${buildAnomalyAlertSection(anomalies, lang)}
          ${buildCoalitionDynamicsSection(coalitions, lang)}
          ${buildKeyPlayersIntelSection(mepScores, lang)}
        </section>`;
}

// ─── Exported function ────────────────────────────────────────────────────────

/**
 * Build breaking news article HTML content.
 *
 * **Feed-first**: When `feedData` is provided, feed sections are the primary
 * content and appear first. Raw MCP analytical data and structured intelligence
 * sections are rendered as supplementary context below.
 *
 * When no data is provided at all, returns a placeholder notice.
 *
 * @param date - Current date string for the article
 * @param anomalyRaw - Raw anomaly data from MCP (context only)
 * @param coalitionRaw - Raw coalition dynamics data from MCP (context only)
 * @param reportRaw - Raw analytical report from MCP (context only)
 * @param influenceRaw - Raw MEP influence data from MCP (context only)
 * @param lang - Language code for localized editorial strings (default: 'en')
 * @param anomalies - Optional structured voting anomaly intelligence items
 * @param coalitions - Optional structured coalition intelligence items
 * @param mepScores - Optional structured MEP influence score items
 * @param feedData - Optional EP feed data (adopted texts, events, procedures, MEPs)
 * @returns Full article HTML content string
 */
export function buildBreakingNewsContent(
  date: string,
  anomalyRaw: string,
  coalitionRaw: string,
  reportRaw: string,
  influenceRaw: string,
  lang = 'en',
  anomalies: VotingAnomalyIntelligence[] = [],
  coalitions: CoalitionIntelligence[] = [],
  mepScores: MEPInfluenceScore[] = [],
  feedData?: BreakingNewsFeedData
): string {
  const editorial = getLocalizedString(EDITORIAL_STRINGS, lang);
  const strings = getLocalizedString(BREAKING_STRINGS, lang);

  // Feed data is the primary news content
  const hasFeedData =
    feedData &&
    (feedData.adoptedTexts.length > 0 ||
      feedData.events.length > 0 ||
      feedData.procedures.length > 0 ||
      feedData.mepUpdates.length > 0);

  // Analytical data is context only
  const hasAnalyticalData = Boolean(
    anomalyRaw ||
    coalitionRaw ||
    reportRaw ||
    influenceRaw ||
    anomalies.length ||
    coalitions.length ||
    mepScores.length
  );

  const hasData = hasFeedData || hasAnalyticalData;
  const timestamp = new Date().toISOString();

  // ─── Feed sections (PRIMARY news content) ──────────────────────────────
  const feedSections = buildFeedSections(feedData, lang);

  // ─── Analytical context sections (SECONDARY) ──────────────────────────
  const anomalySection = anomalyRaw
    ? `
        <section class="analysis">
          <h2>${escapeHTML(strings.votingAnomalyIntel)}</h2>
          <p class="source-attribution">${escapeHTML(editorial.sourceAttribution)}:</p>
          <p class="data-narrative">${escapeHTML(anomalyRaw.slice(0, MAX_DATA_CHARS))}</p>
        </section>`
    : '';

  const coalitionSection = coalitionRaw
    ? `
        <section class="coalition-impact">
          <h2>${escapeHTML(strings.coalitionDynamics)}</h2>
          <p class="source-attribution">${escapeHTML(editorial.sourceAttribution)}:</p>
          <p class="data-narrative">${escapeHTML(coalitionRaw.slice(0, MAX_DATA_CHARS))}</p>
        </section>`
    : '';

  const reportSection = reportRaw
    ? `
        <section class="context">
          <h2>${escapeHTML(strings.analyticalReport)}</h2>
          <p class="source-attribution">${escapeHTML(editorial.analysisNote)}:</p>
          <p class="data-narrative">${escapeHTML(reportRaw.slice(0, MAX_DATA_CHARS))}</p>
        </section>`
    : '';

  const keyPlayersSection = influenceRaw
    ? `
        <section class="key-players">
          <h2>${escapeHTML(strings.keyMEPInfluence)}</h2>
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

  const intelligenceBriefing = buildIntelligenceBriefingSection(
    anomalies,
    coalitions,
    mepScores,
    lang
  );

  const placeholderNotice = !hasData
    ? `
        <div class="notice">
          <p><strong>Note:</strong> ${escapeHTML(strings.placeholderNotice)}</p>
        </div>
        <section class="lede">
          <p>${escapeHTML(strings.placeholderLede)}</p>
        </section>`
    : `
        <section class="lede">
          <p>${escapeHTML(strings.lede)} as of ${escapeHTML(date)}.</p>
        </section>`;

  return `
        <div class="article-content">
          <section class="breaking-banner">
            <p class="breaking-timestamp">${escapeHTML(strings.breakingBanner)} — ${escapeHTML(timestamp)}</p>
          </section>
          ${placeholderNotice}
          ${feedSections}
          ${intelligenceBriefing}
          ${anomalySection}
          ${coalitionSection}
          ${reportSection}
          ${keyPlayersSection}
          ${whyThisMattersSection}
        </div>
      `;
}
