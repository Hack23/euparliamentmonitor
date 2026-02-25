// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/WeekAheadContent
 * @description Pure functions for parsing MCP data and building week-ahead article HTML.
 * No side effects — all functions accept data and return strings.
 */
import { escapeHTML } from '../utils/file-utils.js';
import { getLocalizedString, EDITORIAL_STRINGS } from '../constants/languages.js';
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
 * Parse plenary sessions from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @param fallbackDate - Fallback date when session has none
 * @returns Array of parliament events
 */
export function parsePlenarySessions(settled, fallbackDate) {
    if (settled.status !== 'fulfilled')
        return [];
    try {
        const text = settled.value.content?.[0]?.text ?? '{}';
        const data = JSON.parse(text);
        if (!data.sessions || data.sessions.length === 0)
            return [];
        return data.sessions.map((s) => ({
            date: s.date ?? fallbackDate,
            title: s.title ?? 'Parliamentary Session',
            type: s.type ?? 'Session',
            description: s.description ?? '',
        }));
    }
    catch {
        return [];
    }
}
/**
 * Parse committee meetings from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @param fallbackDate - Fallback date when meeting has no date
 * @returns Array of committee meetings
 */
export function parseCommitteeMeetings(settled, fallbackDate) {
    if (settled.status !== 'fulfilled')
        return [];
    try {
        const text = settled.value.content?.[0]?.text ?? '{}';
        const data = JSON.parse(text);
        if (!data.committees || data.committees.length === 0)
            return [];
        return data.committees.map((c) => ({
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
    catch {
        return [];
    }
}
/**
 * Parse legislative documents from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @returns Array of legislative documents
 */
export function parseLegislativeDocuments(settled) {
    if (settled.status !== 'fulfilled')
        return [];
    try {
        const text = settled.value.content?.[0]?.text ?? '{}';
        const data = JSON.parse(text);
        if (!data.documents || data.documents.length === 0)
            return [];
        return data.documents.map((d) => ({
            id: d.id,
            type: d.type,
            title: d.title ?? 'Untitled Document',
            date: d.date,
            status: d.status,
            committee: d.committee,
            rapporteur: d.rapporteur,
        }));
    }
    catch {
        return [];
    }
}
/**
 * Parse legislative pipeline from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @returns Array of legislative procedures
 */
export function parseLegislativePipeline(settled) {
    if (settled.status !== 'fulfilled')
        return [];
    try {
        const text = settled.value.content?.[0]?.text ?? '{}';
        const data = JSON.parse(text);
        if (!data.procedures || data.procedures.length === 0)
            return [];
        return data.procedures.map((p) => ({
            id: p.id,
            title: p.title ?? 'Unnamed Procedure',
            stage: p.stage,
            committee: p.committee,
            status: p.status,
            bottleneck: p.bottleneck,
        }));
    }
    catch {
        return [];
    }
}
/**
 * Parse parliamentary questions from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @returns Array of parliamentary questions
 */
export function parseParliamentaryQuestions(settled) {
    if (settled.status !== 'fulfilled')
        return [];
    try {
        const text = settled.value.content?.[0]?.text ?? '{}';
        const data = JSON.parse(text);
        if (!data.questions || data.questions.length === 0)
            return [];
        return data.questions.map((q) => ({
            id: q.id,
            type: q.type,
            author: q.author,
            subject: q.subject ?? 'No subject',
            date: q.date,
            status: q.status,
        }));
    }
    catch {
        return [];
    }
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
    const plenaryHtml = weekData.events.length > 0
        ? weekData.events.map(renderPlenaryEvent).join('')
        : '<p>No plenary sessions scheduled for this period.</p>';
    const committeeSection = weekData.committees.length > 0
        ? `<section class="committee-calendar">
            <h2>Committee Meetings</h2>
            ${weekData.committees.map(renderCommitteeMeeting).join('')}
          </section>`
        : '';
    const documentsSection = weekData.documents.length > 0
        ? `<section class="legislative-documents">
            <h2>Upcoming Legislative Documents</h2>
            <ul class="document-list">${weekData.documents.map(renderLegislativeDocument).join('')}</ul>
          </section>`
        : '';
    const pipelineSection = weekData.pipeline.length > 0
        ? `<section class="legislative-pipeline">
            <h2>Legislative Pipeline</h2>
            <ul class="pipeline-list">${weekData.pipeline.map(renderPipelineProcedure).join('')}</ul>
          </section>`
        : '';
    const qaSection = weekData.questions.length > 0
        ? `<section class="qa-schedule">
            <h2>Parliamentary Questions</h2>
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
            <p>The European Parliament prepares for an active week ahead with multiple committee meetings and plenary sessions scheduled from ${escapeHTML(dateRange.start)} to ${escapeHTML(dateRange.end)}.${escapeHTML(ledeDetail)}</p>
          </section>
          ${whyThisMattersSection}
          <section class="plenary-schedule">
            <h2>Plenary Sessions</h2>
            ${plenaryHtml}
          </section>
          ${committeeSection}
          ${documentsSection}
          ${pipelineSection}
          ${qaSection}
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
//# sourceMappingURL=week-ahead-content.js.map