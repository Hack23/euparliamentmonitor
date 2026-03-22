// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/WeekAheadContent
 * @description Pure functions for parsing MCP data and building week-ahead article HTML.
 * No side effects — all functions accept data and return strings.
 */

import { escapeHTML } from '../utils/file-utils.js';
import {
  getLocalizedString,
  EDITORIAL_STRINGS,
  WEEK_AHEAD_STRINGS,
  WEEK_AHEAD_STAKEHOLDER_STRINGS,
} from '../constants/languages.js';
import type {
  ParliamentEvent,
  CommitteeMeeting,
  LegislativeDocument,
  LegislativeProcedure,
  ParliamentaryQuestion,
  WeekAheadData,
  DateRange,
  MCPToolResult,
  LegislativeVelocity,
  StakeholderImpactSection,
  StakeholderImpactRow,
  PoliticalTemperature,
  PoliticalTemperatureBand,
  WeekAheadStakeholderStrings,
} from '../types/index.js';

/** Keyword constant for article tagging */
const KEYWORD_EUROPEAN_PARLIAMENT = 'European Parliament';

/** Placeholder events used when MCP is unavailable or returns no sessions */
export const PLACEHOLDER_EVENTS: ParliamentEvent[] = [
  {
    date: '',
    title: 'Plenary Session',
    type: 'Plenary',
    description: 'Full parliamentary session',
  },
  {
    date: '',
    title: 'ENVI Committee Meeting',
    type: 'Committee',
    description: 'Environment committee discussion',
  },
];

/**
 * Generic parser for settled MCP results.
 * Extracts an array from the JSON payload at the given key and maps each element.
 *
 * @param settled - Promise.allSettled result
 * @param key - JSON key containing the array of items
 * @param mapper - Function to map raw items to typed objects
 * @returns Array of typed objects, or empty array on failure
 */
function parseSettledMCPResult<T>(
  settled: PromiseSettledResult<MCPToolResult>,
  key: string,
  mapper: (raw: Record<string, unknown>) => T
): T[] {
  if (settled.status !== 'fulfilled') return [];
  try {
    const data = JSON.parse(settled.value.content?.[0]?.text ?? '{}') as Record<string, unknown>;
    if (!Object.hasOwn(data, key)) return [];
    // eslint-disable-next-line security/detect-object-injection
    const items: unknown = data[key];
    if (!Array.isArray(items)) return [];
    return items.map(mapper);
  } catch {
    return [];
  }
}

/**
 * Parse plenary sessions from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @param fallbackDate - Fallback date when session has none
 * @returns Array of parliament events
 */
export function parsePlenarySessions(
  settled: PromiseSettledResult<MCPToolResult>,
  fallbackDate: string
): ParliamentEvent[] {
  return parseSettledMCPResult(settled, 'sessions', (s) => ({
    date: (s.date as string | undefined) ?? fallbackDate,
    title: (s.title as string | undefined) ?? 'Parliamentary Session',
    type: (s.type as string | undefined) ?? 'Session',
    description: (s.description as string | undefined) ?? '',
  }));
}

/**
 * Parse EP events (hearings, conferences, seminars) from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @param fallbackDate - Fallback date when event has none
 * @returns Array of parliament events
 */
export function parseEPEvents(
  settled: PromiseSettledResult<MCPToolResult>,
  fallbackDate: string
): ParliamentEvent[] {
  return parseSettledMCPResult(settled, 'events', (e) => ({
    date: (e.date as string | undefined) ?? fallbackDate,
    title: (e.title as string | undefined) ?? 'EP Event',
    type: (e.type as string | undefined) ?? 'Event',
    description: (e.description as string | undefined) ?? '',
  }));
}

/**
 * Parse committee meetings from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @param fallbackDate - Fallback date when meeting has no date
 * @returns Array of committee meetings
 */
export function parseCommitteeMeetings(
  settled: PromiseSettledResult<MCPToolResult>,
  fallbackDate?: string
): CommitteeMeeting[] {
  return parseSettledMCPResult(settled, 'committees', (c) => ({
    id: c.id as string | undefined,
    committee: (c.committee as string | undefined) ?? 'Unknown',
    committeeName: c.committeeName as string | undefined,
    date: (c.date as string | undefined) ?? fallbackDate ?? '',
    time: c.time as string | undefined,
    location: c.location as string | undefined,
    agenda: (
      c.agenda as
        | Array<{
            item?: number | undefined;
            title?: string | undefined;
            type?: string | undefined;
          }>
        | undefined
    )?.map((a) => ({
      item: a.item,
      title: a.title ?? '',
      type: a.type,
    })),
  }));
}

/**
 * Parse legislative documents from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @returns Array of legislative documents
 */
export function parseLegislativeDocuments(
  settled: PromiseSettledResult<MCPToolResult>
): LegislativeDocument[] {
  return parseSettledMCPResult(settled, 'documents', (d) => ({
    id: d.id as string | undefined,
    type: d.type as string | undefined,
    title: (d.title as string | undefined) ?? 'Untitled Document',
    date: d.date as string | undefined,
    status: d.status as string | undefined,
    committee: d.committee as string | undefined,
    rapporteur: d.rapporteur as string | undefined,
  }));
}

/**
 * Parse legislative pipeline from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @returns Array of legislative procedures
 */
export function parseLegislativePipeline(
  settled: PromiseSettledResult<MCPToolResult>
): LegislativeProcedure[] {
  return parseSettledMCPResult(settled, 'procedures', (p) => ({
    id: p.id as string | undefined,
    title: (p.title as string | undefined) ?? 'Unnamed Procedure',
    stage: p.stage as string | undefined,
    committee: p.committee as string | undefined,
    status: p.status as string | undefined,
    bottleneck: p.bottleneck as boolean | undefined,
  }));
}

/**
 * Parse parliamentary questions from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @returns Array of parliamentary questions
 */
export function parseParliamentaryQuestions(
  settled: PromiseSettledResult<MCPToolResult>
): ParliamentaryQuestion[] {
  return parseSettledMCPResult(settled, 'questions', (q) => ({
    id: q.id as string | undefined,
    type: q.type as string | undefined,
    author: q.author as string | undefined,
    subject: (q.subject as string | undefined) ?? 'No subject',
    date: q.date as string | undefined,
    status: q.status as string | undefined,
  }));
}

// ─── Render helpers ──────────────────────────────────────────────────────────

/**
 * Render a single plenary event as HTML
 *
 * @param event - Parliament event data
 * @returns HTML string
 */
function renderPlenaryEvent(event: ParliamentEvent): string {
  return `
              <div class="event-item">
                <div class="event-date">${escapeHTML(event.date)}</div>
                <div class="event-details">
                  <h3>${escapeHTML(event.title)}</h3>
                  <p class="event-type">${escapeHTML(event.type)}</p>
                  ${event.description ? `<p>${escapeHTML(event.description)}</p>` : ''}
                </div>
              </div>`;
}

/**
 * Render a single committee meeting as HTML
 *
 * @param meeting - Committee meeting data
 * @returns HTML string
 */
function renderCommitteeMeeting(meeting: CommitteeMeeting): string {
  const agendaHtml =
    meeting.agenda && meeting.agenda.length > 0
      ? `<ul class="agenda-list">${meeting.agenda.map((item) => `<li>${escapeHTML(item.title)}${item.type ? ` <span class="agenda-type">(${escapeHTML(item.type)})</span>` : ''}</li>`).join('')}</ul>`
      : '';
  return `
              <div class="committee-item">
                <div class="committee-date">${escapeHTML(meeting.date)}${meeting.time ? ` ${escapeHTML(meeting.time)}` : ''}</div>
                <div class="committee-details">
                  <h3>${escapeHTML(meeting.committeeName ?? meeting.committee)}</h3>
                  ${meeting.location ? `<p class="committee-location">${escapeHTML(meeting.location)}</p>` : ''}
                  ${agendaHtml}
                </div>
              </div>`;
}

/**
 * Render a single legislative document as HTML
 *
 * @param doc - Legislative document
 * @returns HTML string
 */
function renderLegislativeDocument(doc: LegislativeDocument): string {
  return `
              <li class="document-item">
                <span class="document-title">${escapeHTML(doc.title)}</span>
                ${doc.type ? ` <span class="document-type">(${escapeHTML(doc.type)})</span>` : ''}
                ${doc.committee ? ` — <span class="document-committee">${escapeHTML(doc.committee)}</span>` : ''}
                ${doc.status ? ` <span class="document-status">[${escapeHTML(doc.status)}]</span>` : ''}
              </li>`;
}

/**
 * Render a single pipeline procedure as HTML
 *
 * @param proc - Legislative procedure
 * @returns HTML string
 */
function renderPipelineProcedure(proc: LegislativeProcedure): string {
  return `
              <li class="pipeline-item${proc.bottleneck ? ' bottleneck' : ''}">
                <span class="procedure-title">${escapeHTML(proc.title)}</span>
                ${proc.stage ? ` <span class="procedure-stage">${escapeHTML(proc.stage)}</span>` : ''}
                ${proc.committee ? ` — <span class="procedure-committee">${escapeHTML(proc.committee)}</span>` : ''}
                ${proc.bottleneck ? ' <span class="bottleneck-indicator">⚠ Bottleneck</span>' : ''}
              </li>`;
}

/**
 * Render a single parliamentary question as HTML
 *
 * @param q - Parliamentary question
 * @returns HTML string
 */
function renderQuestion(q: ParliamentaryQuestion): string {
  return `
              <li class="qa-item">
                <span class="qa-subject">${escapeHTML(q.subject)}</span>
                ${q.type ? ` <span class="qa-type">(${escapeHTML(q.type)})</span>` : ''}
                ${q.author ? ` — <span class="qa-author">${escapeHTML(q.author)}</span>` : ''}
              </li>`;
}

// ─── Content builders ────────────────────────────────────────────────────────

/**
 * Clamp a number to the 0–100 range.
 *
 * @param n - Number to clamp
 * @returns Clamped value between 0 and 100
 */
function clamp0to100(n: number): number {
  return Math.max(0, Math.min(100, n));
}

/**
 * Map from band key to CSS class suffix used in `temp-*` class names.
 */
const BAND_CSS_CLASS: Record<PoliticalTemperatureBand, string> = {
  low: 'temp-low',
  moderate: 'temp-moderate',
  high: 'temp-high',
  veryHigh: 'temp-very-high',
};

/**
 * Derive a language-agnostic temperature band from a 0–100 score.
 *
 * This is the single source of truth for score → band mapping.
 * Both `computeWeekPoliticalTemperature()` and the renderer use this
 * to avoid duplicated threshold logic.
 *
 * @param score - Clamped score (0–100)
 * @returns Band key
 */
function temperatureBand(score: number): PoliticalTemperatureBand {
  if (score >= 75) return 'veryHigh';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

/**
 * Resolve the localized temperature descriptor for a given band.
 *
 * @param band - Language-agnostic band key
 * @param strings - Localized stakeholder strings
 * @returns Localized descriptor (e.g. "Modéré", "高い")
 */
function localizedTempLabel(
  band: PoliticalTemperatureBand,
  strings: WeekAheadStakeholderStrings
): string {
  const map: Record<PoliticalTemperatureBand, string> = {
    low: strings.tempLow,
    moderate: strings.tempModerate,
    high: strings.tempHigh,
    veryHigh: strings.tempVeryHigh,
  };
  return map[band];
}

/**
 * Compute a composite political temperature score (0–100) indicating how
 * contentious or urgent the upcoming parliamentary week is likely to be.
 *
 * The score is derived from the volume and diversity of scheduled events
 * and questions — a pure scoring function with no side effects.
 *
 * @param events - Plenary / parliamentary events for the week
 * @param questions - Parliamentary questions tabled for the week
 * @returns Political temperature score and band
 */
export function computeWeekPoliticalTemperature(
  events: readonly ParliamentEvent[],
  questions: readonly ParliamentaryQuestion[]
): PoliticalTemperature {
  // Base: volume-driven heuristic — more events & questions ⇒ higher temperature
  const eventContribution = Math.min(events.length * 10, 50);
  const questionContribution = Math.min(questions.length * 5, 30);

  // Diversity bonus: distinct event types signal a broader agenda
  const uniqueTypes = new Set(events.map((e) => e.type));
  const diversityBonus = Math.min(uniqueTypes.size * 5, 20);

  const raw = eventContribution + questionContribution + diversityBonus;
  const score = clamp0to100(Math.round(raw));
  return { score, band: temperatureBand(score) };
}

/**
 * Determine impact level based on a count and a threshold for "high".
 *
 * @param count - Item count
 * @param highThreshold - Minimum count for high impact
 * @returns Impact level
 */
function impactFromCount(count: number, highThreshold: number): 'high' | 'medium' | 'low' {
  if (count >= highThreshold) return 'high';
  return count > 0 ? 'medium' : 'low';
}

/**
 * Build a stakeholder impact matrix from scheduled events and legislative
 * documents, assessing which groups are most affected by the agenda.
 *
 * Returns an empty section when no events or documents are available
 * (graceful fallback). This function only constructs raw data; HTML
 * escaping (for example via `escapeHTML()`) must be applied at render
 * time by the caller (e.g. in `renderStakeholderSection()`).
 *
 * @param events - Parliament events for the upcoming week
 * @param docs - Legislative documents expected in the period
 * @returns Stakeholder impact section with rows
 */
export function buildStakeholderImpactMatrix(
  events: readonly ParliamentEvent[],
  docs: readonly LegislativeDocument[]
): StakeholderImpactSection {
  if (events.length === 0 && docs.length === 0) {
    return { rows: [] };
  }

  const rows: StakeholderImpactRow[] = [];
  const eventCount = events.length;
  const docCount = docs.length;
  const totalCount = eventCount + docCount;

  if (eventCount > 0) {
    rows.push({
      stakeholder: 'Political Groups',
      impact: impactFromCount(eventCount, 3),
      reason: `${eventCount} parliamentary event${eventCount !== 1 ? 's' : ''} scheduled`,
    });
  }

  if (docCount > 0) {
    rows.push({
      stakeholder: 'Civil Society',
      impact: impactFromCount(docCount, 3),
      reason: `${docCount} legislative document${docCount !== 1 ? 's' : ''} under review`,
    });
  }

  rows.push({
    stakeholder: 'Industry',
    impact: impactFromCount(totalCount, 5),
    reason: 'Regulatory agenda may affect business environment',
  });

  rows.push({
    stakeholder: 'EU Citizens',
    impact: impactFromCount(eventCount, 3),
    reason: 'Parliamentary decisions shape EU-wide policy',
  });

  if (docCount > 0) {
    rows.push({
      stakeholder: 'National Governments',
      impact: impactFromCount(docCount, 3),
      reason: `${docCount} document${docCount !== 1 ? 's' : ''} may require national transposition`,
    });
  }

  rows.push({
    stakeholder: 'EU Institutions',
    impact: impactFromCount(totalCount, 4),
    reason: 'Cross-institutional coordination required',
  });

  return { rows };
}

/**
 * Render the stakeholder impact section as HTML.
 *
 * @param section - Stakeholder impact data
 * @param temperature - Political temperature score
 * @param lang - Language code for localized headings
 * @returns HTML string, or empty string when section is empty
 */
function renderStakeholderSection(
  section: StakeholderImpactSection,
  temperature: PoliticalTemperature,
  lang: string
): string {
  if (section.rows.length === 0) return '';

  const strings = getLocalizedString(WEEK_AHEAD_STAKEHOLDER_STRINGS, lang);

  const tempClass = BAND_CSS_CLASS[temperature.band];
  const tempDescriptor = localizedTempLabel(temperature.band, strings);

  const tableRows = section.rows
    .map(
      (row) =>
        `<tr>` +
        `<td>${escapeHTML(row.stakeholder)}</td>` +
        `<td class="impact-${escapeHTML(row.impact)}">${escapeHTML(row.impact)}</td>` +
        `<td>${escapeHTML(row.reason)}</td>` +
        `</tr>`
    )
    .join('');

  return `
          <section class="stakeholder-impact" lang="${escapeHTML(lang)}">
            <h2>${escapeHTML(strings.heading)}</h2>
            <div class="political-temperature ${tempClass}">
              <span class="temp-label">${escapeHTML(strings.temperatureLabel)}:</span>
              <span class="temp-score">${temperature.score}/100</span>
              <span class="temp-descriptor">(${escapeHTML(tempDescriptor)})</span>
            </div>
            <table class="stakeholder-matrix">
              <thead>
                <tr>
                  <th scope="col">${escapeHTML(strings.stakeholderHeader)}</th>
                  <th scope="col">${escapeHTML(strings.impactHeader)}</th>
                  <th scope="col">${escapeHTML(strings.reasonHeader)}</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </section>`;
}

/**
 * Build the supplementary lede sentence about committee and pipeline counts.
 *
 * @param committeeCount - Number of committee meetings
 * @param pipelineCount - Number of pipeline procedures
 * @returns Sentence fragment or empty string
 */
function buildLedeDetail(committeeCount: number, pipelineCount: number): string {
  if (committeeCount === 0 && pipelineCount === 0) return '';
  const committeePart =
    committeeCount > 0
      ? `${committeeCount} committee meeting${committeeCount !== 1 ? 's are' : ' is'} scheduled`
      : '';
  const pipelinePart =
    pipelineCount > 0
      ? `${pipelineCount} legislative procedure${pipelineCount !== 1 ? 's are' : ' is'} advancing through the pipeline`
      : '';
  const conjunction = committeePart && pipelinePart ? ' and ' : '';
  return ` Notably, ${committeePart}${conjunction}${pipelinePart}.`;
}

/**
 * Build article content HTML from week-ahead data
 *
 * @param weekData - Aggregated week-ahead data
 * @param dateRange - Date range for the article
 * @param lang - Language code for editorial strings (default: 'en')
 * @returns HTML content string
 */
export function buildWeekAheadContent(
  weekData: WeekAheadData,
  dateRange: DateRange,
  lang = 'en'
): string {
  const editorial = getLocalizedString(EDITORIAL_STRINGS, lang);
  const strings = getLocalizedString(WEEK_AHEAD_STRINGS, lang);
  const plenaryHtml =
    weekData.events.length > 0
      ? weekData.events.map(renderPlenaryEvent).join('')
      : `<p>${escapeHTML(strings.noPlenary)}</p>`;

  const committeeSection =
    weekData.committees.length > 0
      ? `<section class="committee-calendar">
            <h2>${escapeHTML(strings.committeeMeetings)}</h2>
            ${weekData.committees.map(renderCommitteeMeeting).join('')}
          </section>`
      : '';

  const documentsSection =
    weekData.documents.length > 0
      ? `<section class="legislative-documents">
            <h2>${escapeHTML(strings.legislativeDocuments)}</h2>
            <ul class="document-list">${weekData.documents.map(renderLegislativeDocument).join('')}</ul>
          </section>`
      : '';

  const pipelineSection =
    weekData.pipeline.length > 0
      ? `<section class="legislative-pipeline">
            <h2>${escapeHTML(strings.legislativePipeline)}</h2>
            <ul class="pipeline-list">${weekData.pipeline.map(renderPipelineProcedure).join('')}</ul>
          </section>`
      : '';

  const qaSection =
    weekData.questions.length > 0
      ? `<section class="qa-schedule">
            <h2>${escapeHTML(strings.parliamentaryQuestions)}</h2>
            <ul class="qa-list">${weekData.questions.map(renderQuestion).join('')}</ul>
          </section>`
      : '';

  const ledeDetail = buildLedeDetail(weekData.committees.length, weekData.pipeline.length);

  const whyThisMattersSection = `
          <section class="why-this-matters">
            <h2>${escapeHTML(editorial.whyThisMatters)}</h2>
            <p>${escapeHTML(editorial.parliamentaryContext)}: ${escapeHTML(editorial.sourceAttribution)} — parliamentary schedules determine the legislative agenda affecting EU citizens directly.</p>
          </section>`;

  // Stakeholder impact analysis
  const stakeholderData = buildStakeholderImpactMatrix(weekData.events, weekData.documents);
  const temperature = computeWeekPoliticalTemperature(weekData.events, weekData.questions);
  const stakeholderSection = renderStakeholderSection(stakeholderData, temperature, lang);

  return `
        <div class="article-content">
          <section class="lede">
            <p>${escapeHTML(strings.lede)} from ${escapeHTML(dateRange.start)} to ${escapeHTML(dateRange.end)}.${escapeHTML(ledeDetail)}</p>
          </section>
          ${whyThisMattersSection}
          <section class="plenary-schedule">
            <h2>${escapeHTML(strings.plenarySessions)}</h2>
            ${plenaryHtml}
          </section>
          ${committeeSection}
          ${documentsSection}
          ${pipelineSection}
          ${qaSection}
          ${stakeholderSection}
          <!-- /article-content -->
        </div>
      `;
}

/**
 * Build article keywords from week-ahead data
 *
 * @param weekData - Aggregated week-ahead data
 * @returns Array of keyword strings
 */
export function buildKeywords(weekData: WeekAheadData): string[] {
  const keywords = [KEYWORD_EUROPEAN_PARLIAMENT, 'week ahead', 'plenary', 'committees'];
  for (const c of weekData.committees) {
    if (c.committee && !keywords.includes(c.committee)) {
      keywords.push(c.committee);
    }
  }
  if (weekData.pipeline.length > 0) keywords.push('legislative pipeline');
  if (weekData.questions.length > 0) keywords.push('parliamentary questions');
  return keywords;
}

// ─── What-to-Watch section ─────────────────────────────────────────────────

/** CSS class for bottleneck-risk watch items */
const CSS_WATCH_HIGH = 'watch-high';

/** CSS class for bottlenecked procedure watch items */
const CSS_WATCH_PROCEDURE = 'watch-procedure';

/** CSS class for standard velocity watch items */
const CSS_WATCH_ITEM = 'watch-item';

/** Maximum number of non-bottleneck velocity items to include */
const WATCH_MAX_NORMAL_ITEMS = 3;

/**
 * Build list items for high-risk velocities
 *
 * @param velocities - All legislative velocities
 * @returns HTML list items for high bottleneck risk items
 */
function buildHighRiskItems(velocities: LegislativeVelocity[]): string {
  return velocities
    .filter((v) => v.bottleneckRisk === 'high')
    .map(
      (v) =>
        `<li class="${CSS_WATCH_HIGH}">${escapeHTML(v.title)} — ` +
        `Stage: ${escapeHTML(v.stage)} (bottleneck risk detected)</li>`
    )
    .join('');
}

/**
 * Build list items for procedures flagged as bottlenecks
 *
 * @param procedures - All legislative procedures
 * @returns HTML list items for bottlenecked procedures
 */
function buildBottleneckProcedureItems(procedures: LegislativeProcedure[]): string {
  return procedures
    .filter((p) => p.bottleneck === true)
    .map(
      (p) =>
        `<li class="${CSS_WATCH_PROCEDURE}">${escapeHTML(p.title)} — ` +
        `${escapeHTML(p.stage ?? 'in progress')} stage</li>`
    )
    .join('');
}

/**
 * Build list items for normal-risk velocities
 *
 * @param velocities - All legislative velocities
 * @returns HTML list items for the top normal-risk velocity items
 */
function buildNormalVelocityItems(velocities: LegislativeVelocity[]): string {
  return velocities
    .filter((v) => v.bottleneckRisk !== 'high')
    .slice(0, WATCH_MAX_NORMAL_ITEMS)
    .map(
      (v) =>
        `<li class="${CSS_WATCH_ITEM}">${escapeHTML(v.title)} — ` +
        `predicted completion: ${escapeHTML(v.predictedCompletion)}</li>`
    )
    .join('');
}

/**
 * Build predictive "What to Watch" analysis section showing legislative
 * procedures and velocity data ordered by bottleneck risk.
 * Returns an empty string when both input arrays are empty or yield no items.
 *
 * @param procedures - Legislative procedures to analyse
 * @param velocities - Legislative velocity data (for example from a separate velocity analysis feed)
 * @param language - BCP 47 language code used as the section lang attribute
 * @returns HTML string for the "What to Watch" section
 */
export function buildWhatToWatchSection(
  procedures: LegislativeProcedure[],
  velocities: LegislativeVelocity[],
  language: string
): string {
  if (procedures.length === 0 && velocities.length === 0) return '';
  const allItems =
    buildHighRiskItems(velocities) +
    buildBottleneckProcedureItems(procedures) +
    buildNormalVelocityItems(velocities);
  if (!allItems) return '';
  const strings = getLocalizedString(WEEK_AHEAD_STRINGS, language);
  return `
        <section class="what-to-watch" lang="${escapeHTML(language)}">
          <h2>${escapeHTML(strings.whatToWatch)}</h2>
          <ul>
            ${allItems}
          </ul>
        </section>`;
}
