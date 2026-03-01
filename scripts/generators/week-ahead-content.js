// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/WeekAheadContent
 * @description Pure functions for parsing MCP data and building week-ahead article HTML.
 * No side effects — all functions accept data and return strings.
 */
import { escapeHTML } from '../utils/file-utils.js';
import { getLocalizedString, EDITORIAL_STRINGS, WEEK_AHEAD_STRINGS, } from '../constants/languages.js';
/** Keyword constant for article tagging */
const KEYWORD_EUROPEAN_PARLIAMENT = 'European Parliament';
/** Placeholder events used when MCP is unavailable or returns no sessions */
export const PLACEHOLDER_EVENTS = [
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
function parseSettledMCPResult(settled, key, mapper) {
    if (settled.status !== 'fulfilled')
        return [];
    try {
        const data = JSON.parse(settled.value.content?.[0]?.text ?? '{}');
        if (!Object.hasOwn(data, key))
            return [];
        // eslint-disable-next-line security/detect-object-injection
        const items = data[key];
        if (!Array.isArray(items))
            return [];
        return items.map(mapper);
    }
    catch {
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
export function parsePlenarySessions(settled, fallbackDate) {
    return parseSettledMCPResult(settled, 'sessions', (s) => ({
        date: s.date ?? fallbackDate,
        title: s.title ?? 'Parliamentary Session',
        type: s.type ?? 'Session',
        description: s.description ?? '',
    }));
}
/**
 * Parse EP events (hearings, conferences, seminars) from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @param fallbackDate - Fallback date when event has none
 * @returns Array of parliament events
 */
export function parseEPEvents(settled, fallbackDate) {
    return parseSettledMCPResult(settled, 'events', (e) => ({
        date: e.date ?? fallbackDate,
        title: e.title ?? 'EP Event',
        type: e.type ?? 'Event',
        description: e.description ?? '',
    }));
}
/**
 * Parse committee meetings from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @param fallbackDate - Fallback date when meeting has no date
 * @returns Array of committee meetings
 */
export function parseCommitteeMeetings(settled, fallbackDate) {
    return parseSettledMCPResult(settled, 'committees', (c) => ({
        id: c.id,
        committee: c.committee ?? 'Unknown',
        committeeName: c.committeeName,
        date: c.date ?? fallbackDate ?? '',
        time: c.time,
        location: c.location,
        agenda: c.agenda?.map((a) => ({
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
export function parseLegislativeDocuments(settled) {
    return parseSettledMCPResult(settled, 'documents', (d) => ({
        id: d.id,
        type: d.type,
        title: d.title ?? 'Untitled Document',
        date: d.date,
        status: d.status,
        committee: d.committee,
        rapporteur: d.rapporteur,
    }));
}
/**
 * Parse legislative pipeline from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @returns Array of legislative procedures
 */
export function parseLegislativePipeline(settled) {
    return parseSettledMCPResult(settled, 'procedures', (p) => ({
        id: p.id,
        title: p.title ?? 'Unnamed Procedure',
        stage: p.stage,
        committee: p.committee,
        status: p.status,
        bottleneck: p.bottleneck,
    }));
}
/**
 * Parse parliamentary questions from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @returns Array of parliamentary questions
 */
export function parseParliamentaryQuestions(settled) {
    return parseSettledMCPResult(settled, 'questions', (q) => ({
        id: q.id,
        type: q.type,
        author: q.author,
        subject: q.subject ?? 'No subject',
        date: q.date,
        status: q.status,
    }));
}
// ─── Render helpers ──────────────────────────────────────────────────────────
/**
 * Render a single plenary event as HTML
 *
 * @param event - Parliament event data
 * @returns HTML string
 */
function renderPlenaryEvent(event) {
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
function renderCommitteeMeeting(meeting) {
    const agendaHtml = meeting.agenda && meeting.agenda.length > 0
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
function renderLegislativeDocument(doc) {
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
function renderPipelineProcedure(proc) {
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
function renderQuestion(q) {
    return `
              <li class="qa-item">
                <span class="qa-subject">${escapeHTML(q.subject)}</span>
                ${q.type ? ` <span class="qa-type">(${escapeHTML(q.type)})</span>` : ''}
                ${q.author ? ` — <span class="qa-author">${escapeHTML(q.author)}</span>` : ''}
              </li>`;
}
// ─── Content builders ────────────────────────────────────────────────────────
/**
 * Build the supplementary lede sentence about committee and pipeline counts.
 *
 * @param committeeCount - Number of committee meetings
 * @param pipelineCount - Number of pipeline procedures
 * @returns Sentence fragment or empty string
 */
function buildLedeDetail(committeeCount, pipelineCount) {
    if (committeeCount === 0 && pipelineCount === 0)
        return '';
    const committeePart = committeeCount > 0
        ? `${committeeCount} committee meeting${committeeCount !== 1 ? 's are' : ' is'} scheduled`
        : '';
    const pipelinePart = pipelineCount > 0
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
export function buildWeekAheadContent(weekData, dateRange, lang = 'en') {
    const editorial = getLocalizedString(EDITORIAL_STRINGS, lang);
    const strings = getLocalizedString(WEEK_AHEAD_STRINGS, lang);
    const plenaryHtml = weekData.events.length > 0
        ? weekData.events.map(renderPlenaryEvent).join('')
        : `<p>${escapeHTML(strings.noPlenary)}</p>`;
    const committeeSection = weekData.committees.length > 0
        ? `<section class="committee-calendar">
            <h2>${escapeHTML(strings.committeeMeetings)}</h2>
            ${weekData.committees.map(renderCommitteeMeeting).join('')}
          </section>`
        : '';
    const documentsSection = weekData.documents.length > 0
        ? `<section class="legislative-documents">
            <h2>${escapeHTML(strings.legislativeDocuments)}</h2>
            <ul class="document-list">${weekData.documents.map(renderLegislativeDocument).join('')}</ul>
          </section>`
        : '';
    const pipelineSection = weekData.pipeline.length > 0
        ? `<section class="legislative-pipeline">
            <h2>${escapeHTML(strings.legislativePipeline)}</h2>
            <ul class="pipeline-list">${weekData.pipeline.map(renderPipelineProcedure).join('')}</ul>
          </section>`
        : '';
    const qaSection = weekData.questions.length > 0
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
export function buildKeywords(weekData) {
    const keywords = [KEYWORD_EUROPEAN_PARLIAMENT, 'week ahead', 'plenary', 'committees'];
    for (const c of weekData.committees) {
        if (c.committee && !keywords.includes(c.committee)) {
            keywords.push(c.committee);
        }
    }
    if (weekData.pipeline.length > 0)
        keywords.push('legislative pipeline');
    if (weekData.questions.length > 0)
        keywords.push('parliamentary questions');
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
function buildHighRiskItems(velocities) {
    return velocities
        .filter((v) => v.bottleneckRisk === 'high')
        .map((v) => `<li class="${CSS_WATCH_HIGH}">${escapeHTML(v.title)} — ` +
        `Stage: ${escapeHTML(v.stage)} (bottleneck risk detected)</li>`)
        .join('');
}
/**
 * Build list items for procedures flagged as bottlenecks
 *
 * @param procedures - All legislative procedures
 * @returns HTML list items for bottlenecked procedures
 */
function buildBottleneckProcedureItems(procedures) {
    return procedures
        .filter((p) => p.bottleneck === true)
        .map((p) => `<li class="${CSS_WATCH_PROCEDURE}">${escapeHTML(p.title)} — ` +
        `${escapeHTML(p.stage ?? 'in progress')} stage</li>`)
        .join('');
}
/**
 * Build list items for normal-risk velocities
 *
 * @param velocities - All legislative velocities
 * @returns HTML list items for the top normal-risk velocity items
 */
function buildNormalVelocityItems(velocities) {
    return velocities
        .filter((v) => v.bottleneckRisk !== 'high')
        .slice(0, WATCH_MAX_NORMAL_ITEMS)
        .map((v) => `<li class="${CSS_WATCH_ITEM}">${escapeHTML(v.title)} — ` +
        `predicted completion: ${escapeHTML(v.predictedCompletion)}</li>`)
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
export function buildWhatToWatchSection(procedures, velocities, language) {
    if (procedures.length === 0 && velocities.length === 0)
        return '';
    const allItems = buildHighRiskItems(velocities) +
        buildBottleneckProcedureItems(procedures) +
        buildNormalVelocityItems(velocities);
    if (!allItems)
        return '';
    const strings = getLocalizedString(WEEK_AHEAD_STRINGS, language);
    return `
        <section class="what-to-watch" lang="${escapeHTML(language)}">
          <h2>${escapeHTML(strings.whatToWatch)}</h2>
          <ul>
            ${allItems}
          </ul>
        </section>`;
}
//# sourceMappingURL=week-ahead-content.js.map