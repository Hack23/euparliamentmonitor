#!/usr/bin/env node

// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/NewsEnhanced
 * @description Core automated intelligence reporting workflow for European Parliament monitoring.
 * Generates multi-language news articles about EU Parliament activities.
 */

import fs from 'fs';
import path, { resolve } from 'path';
import { pathToFileURL } from 'url';
import {
  NEWS_DIR,
  METADATA_DIR,
  VALID_ARTICLE_TYPES,
  ARTICLE_TYPE_WEEK_AHEAD,
  ARTICLE_TYPE_BREAKING,
  ARTICLE_TYPE_COMMITTEE_REPORTS,
  ARG_SEPARATOR,
} from '../constants/config.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_PRESETS,
  WEEK_AHEAD_TITLES,
  BREAKING_NEWS_TITLES,
  COMMITTEE_REPORTS_TITLES,
  getLocalizedString,
  isSupportedLanguage,
} from '../constants/languages.js';
import { generateArticleHTML } from '../templates/article-template.js';
import { getEPMCPClient, closeEPMCPClient } from '../mcp/ep-mcp-client.js';
import {
  formatDateForSlug,
  calculateReadTime,
  ensureDirectoryExists,
  escapeHTML,
} from '../utils/file-utils.js';
import type {
  LanguageCode,
  LanguagePreset,
  ParliamentEvent,
  CommitteeMeeting,
  LegislativeDocument,
  LegislativeProcedure,
  ParliamentaryQuestion,
  WeekAheadData,
  DateRange,
  GenerationStats,
  GenerationResult,
  CommitteeData,
  MCPToolResult,
} from '../types/index.js';
import type { EuropeanParliamentMCPClient } from '../mcp/ep-mcp-client.js';

// Try to use MCP client if available
let mcpClient: EuropeanParliamentMCPClient | null = null;
const useMCP = process.env['USE_EP_MCP'] !== 'false';

// Parse command line arguments
const args = process.argv.slice(2);
const typesArg = args.find((arg) => arg.startsWith('--types='));
const languagesArg = args.find((arg) => arg.startsWith('--languages='));
const dryRunArg = args.includes('--dry-run');

const articleTypes = typesArg
  ? (typesArg.split(ARG_SEPARATOR)[1] ?? '').split(',').map((t) => t.trim())
  : [ARTICLE_TYPE_WEEK_AHEAD];

let languagesInput = languagesArg
  ? (languagesArg.split(ARG_SEPARATOR)[1] ?? '').trim().toLowerCase()
  : 'en';

// Expand presets
if (LANGUAGE_PRESETS[languagesInput as LanguagePreset]) {
  languagesInput = LANGUAGE_PRESETS[languagesInput as LanguagePreset]!.join(',');
}

const languages: LanguageCode[] = languagesInput
  .split(',')
  .map((l) => l.trim())
  .filter((l): l is LanguageCode => isSupportedLanguage(l));

if (languages.length === 0) {
  console.error('❌ No valid language codes provided. Valid codes:', ALL_LANGUAGES.join(', '));
  process.exit(1);
}

// Validate article types
const invalidTypes = articleTypes.filter(
  (t) => !VALID_ARTICLE_TYPES.includes(t.trim() as (typeof VALID_ARTICLE_TYPES)[number])
);
if (invalidTypes.length > 0) {
  console.warn(`⚠️ Unknown article types ignored: ${invalidTypes.join(', ')}`);
}

console.log('📰 Enhanced News Generation Script');
console.log('Article types:', articleTypes.join(', '));
console.log('Languages:', languages.join(', '));
console.log('Dry run:', dryRunArg ? 'Yes (no files written)' : 'No');

// Ensure directories exist
ensureDirectoryExists(METADATA_DIR);

// Generation statistics
const stats: GenerationStats = {
  generated: 0,
  errors: 0,
  articles: [],
  timestamp: new Date().toISOString(),
};

/**
 * Get date range for Week Ahead (next 7 days)
 *
 * @returns Date range with start and end dates
 */
function getWeekAheadDateRange(): DateRange {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 1);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7);

  return {
    start: startDate.toISOString().split('T')[0]!,
    end: endDate.toISOString().split('T')[0]!,
  };
}

/**
 * Write article to file
 *
 * @param html - HTML content
 * @param filename - Output filename
 * @returns Success status
 */
function writeArticle(html: string, filename: string): boolean {
  if (dryRunArg) {
    console.log(`  [DRY RUN] Would write: ${filename}`);
    return true;
  }

  const filepath = path.join(NEWS_DIR, filename);
  fs.writeFileSync(filepath, html, 'utf-8');
  console.log(`  ✅ Wrote: ${filename}`);
  return true;
}

/**
 * Write article in specified language
 *
 * @param html - HTML content
 * @param slug - Article slug
 * @param lang - Language code
 * @returns Generated filename
 */
function writeSingleArticle(html: string, slug: string, lang: string): string {
  const filename = `${slug}-${lang}.html`;
  writeArticle(html, filename);
  stats.generated += 1;
  stats.articles.push(filename);
  return filename;
}

/**
 * Initialize MCP client if available
 *
 * @returns MCP client instance or null
 */
async function initializeMCPClient(): Promise<EuropeanParliamentMCPClient | null> {
  if (!useMCP) {
    console.log('ℹ️ MCP client disabled via USE_EP_MCP=false');
    return null;
  }

  try {
    console.log('🔌 Attempting to connect to European Parliament MCP Server...');
    mcpClient = await getEPMCPClient();
    console.log('✅ MCP client connected successfully');
    return mcpClient;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Could not connect to MCP server:', message);
    console.warn('⚠️ Falling back to placeholder content');
    return null;
  }
}

/** European Parliament keyword for document searches and article metadata */
const KEYWORD_EUROPEAN_PARLIAMENT = 'European Parliament';

/** Placeholder events used when MCP is unavailable or returns no sessions */
const PLACEHOLDER_EVENTS: ParliamentEvent[] = [
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
function parsePlenarySessions(
  settled: PromiseSettledResult<{ content?: Array<{ text: string }> }>,
  fallbackDate: string
): ParliamentEvent[] {
  if (settled.status === 'rejected') {
    console.warn('  ⚠️ Plenary sessions fetch failed:', settled.reason);
    return [];
  }
  const text = settled.value?.content?.[0]?.text;
  if (!text) return [];
  try {
    const data = JSON.parse(text) as { sessions?: Array<Partial<ParliamentEvent>> };
    if (!data.sessions?.length) return [];
    console.log(`  ✅ Plenary: ${data.sessions.length} sessions`);
    return data.sessions.map((s) => ({
      date: s.date ?? fallbackDate,
      title: s.title ?? 'Parliamentary Session',
      type: s.type ?? 'Session',
      description: s.description ?? '',
    }));
  } catch {
    console.warn('  ⚠️ Failed to parse plenary sessions');
    return [];
  }
}

/**
 * Parse committee meetings from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @param fallbackDate - Fallback date when meeting has none
 * @returns Array of committee meetings
 */
function parseCommitteeMeetings(
  settled: PromiseSettledResult<{ content?: Array<{ text: string }> }>,
  fallbackDate: string
): CommitteeMeeting[] {
  if (settled.status === 'rejected') {
    console.warn('  ⚠️ Committee info fetch failed:', settled.reason);
    return [];
  }
  const text = settled.value?.content?.[0]?.text;
  if (!text) return [];
  try {
    const data = JSON.parse(text) as { committees?: Array<Partial<CommitteeMeeting>> };
    if (!data.committees?.length) return [];
    console.log(`  ✅ Committees: ${data.committees.length} meetings`);
    return data.committees.map((c) => ({
      id: c.id,
      committee: c.committee ?? 'Unknown',
      committeeName: c.committeeName,
      date: c.date ?? fallbackDate,
      time: c.time,
      location: c.location,
      agenda: c.agenda,
    }));
  } catch {
    console.warn('  ⚠️ Failed to parse committee info');
    return [];
  }
}

/**
 * Parse legislative documents from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @returns Array of legislative documents
 */
function parseLegislativeDocuments(
  settled: PromiseSettledResult<{ content?: Array<{ text: string }> }>
): LegislativeDocument[] {
  if (settled.status === 'rejected') {
    console.warn('  ⚠️ Documents fetch failed:', settled.reason);
    return [];
  }
  const text = settled.value?.content?.[0]?.text;
  if (!text) return [];
  try {
    const data = JSON.parse(text) as { documents?: Array<Partial<LegislativeDocument>> };
    if (!data.documents?.length) return [];
    console.log(`  ✅ Documents: ${data.documents.length} documents`);
    return data.documents.map((d) => ({
      id: d.id,
      type: d.type,
      title: d.title ?? 'Untitled Document',
      date: d.date,
      status: d.status,
      committee: d.committee,
      rapporteur: d.rapporteur,
    }));
  } catch {
    console.warn('  ⚠️ Failed to parse documents');
    return [];
  }
}

/**
 * Parse legislative pipeline from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @returns Array of legislative procedures
 */
function parseLegislativePipeline(
  settled: PromiseSettledResult<{ content?: Array<{ text: string }> }>
): LegislativeProcedure[] {
  if (settled.status === 'rejected') {
    console.warn('  ⚠️ Legislative pipeline fetch failed:', settled.reason);
    return [];
  }
  const text = settled.value?.content?.[0]?.text;
  if (!text) return [];
  try {
    const data = JSON.parse(text) as { procedures?: Array<Partial<LegislativeProcedure>> };
    if (!data.procedures?.length) return [];
    console.log(`  ✅ Pipeline: ${data.procedures.length} procedures`);
    return data.procedures.map((p) => ({
      id: p.id,
      title: p.title ?? 'Unnamed Procedure',
      stage: p.stage,
      committee: p.committee,
      status: p.status,
      bottleneck: p.bottleneck,
    }));
  } catch {
    console.warn('  ⚠️ Failed to parse legislative pipeline');
    return [];
  }
}

/**
 * Parse parliamentary questions from a settled MCP result
 *
 * @param settled - Promise.allSettled result
 * @returns Array of parliamentary questions
 */
function parseParliamentaryQuestions(
  settled: PromiseSettledResult<{ content?: Array<{ text: string }> }>
): ParliamentaryQuestion[] {
  if (settled.status === 'rejected') {
    console.warn('  ⚠️ Parliamentary questions fetch failed:', settled.reason);
    return [];
  }
  const text = settled.value?.content?.[0]?.text;
  if (!text) return [];
  try {
    const data = JSON.parse(text) as { questions?: Array<Partial<ParliamentaryQuestion>> };
    if (!data.questions?.length) return [];
    console.log(`  ✅ Questions: ${data.questions.length} questions`);
    return data.questions.map((q) => ({
      id: q.id,
      type: q.type,
      author: q.author,
      subject: q.subject ?? 'Unknown Subject',
      date: q.date,
      status: q.status,
    }));
  } catch {
    console.warn('  ⚠️ Failed to parse parliamentary questions');
    return [];
  }
}

/**
 * Fetch week-ahead data from multiple MCP sources in parallel
 *
 * @param dateRange - Date range with start and end dates
 * @returns Aggregated week-ahead data
 */
async function fetchWeekAheadData(dateRange: DateRange): Promise<WeekAheadData> {
  if (!mcpClient) {
    console.log('  ℹ️ MCP unavailable — using placeholder events');
    return {
      events: PLACEHOLDER_EVENTS.map((e) => ({ ...e, date: dateRange.start })),
      committees: [],
      documents: [],
      pipeline: [],
      questions: [],
    };
  }

  console.log('  📡 Fetching week-ahead data from MCP (parallel)...');

  const [plenarySessions, committeeInfo, documents, pipeline, questions] = await Promise.allSettled(
    [
      mcpClient.getPlenarySessions({ startDate: dateRange.start, endDate: dateRange.end, limit: 50 }),
      mcpClient.getCommitteeInfo({ limit: 20 }),
      mcpClient.searchDocuments({
        query: 'parliament',
        limit: 20,
      }),
      mcpClient.monitorLegislativePipeline({
        dateFrom: dateRange.start,
        dateTo: dateRange.end,
        status: 'ACTIVE',
        limit: 20,
      }),
      mcpClient.getParliamentaryQuestions({
        startDate: dateRange.start,
        limit: 20,
      }),
    ]
  );

  const events = parsePlenarySessions(plenarySessions, dateRange.start);

  return {
    events: events.length > 0 ? events : [{ ...PLACEHOLDER_EVENTS[0]!, date: dateRange.start }],
    committees: parseCommitteeMeetings(committeeInfo, dateRange.start),
    documents: parseLegislativeDocuments(documents),
    pipeline: parseLegislativePipeline(pipeline),
    questions: parseParliamentaryQuestions(questions),
  };
}

/**
 * Render a single plenary event as HTML
 *
 * @param event - Parliament event
 * @returns HTML string for the event
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
 * @returns HTML string for the meeting
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
 * @returns HTML string for the document
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
 * @returns HTML string for the procedure
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
 * @returns HTML string for the question
 */
function renderQuestion(q: ParliamentaryQuestion): string {
  return `
              <li class="qa-item">
                <span class="qa-subject">${escapeHTML(q.subject)}</span>
                ${q.type ? ` <span class="qa-type">(${escapeHTML(q.type)})</span>` : ''}
                ${q.author ? ` — <span class="qa-author">${escapeHTML(q.author)}</span>` : ''}
              </li>`;
}

/**
 * Build article content HTML from week-ahead data
 *
 * @param weekData - Aggregated week-ahead data
 * @param dateRange - Date range for the article
 * @returns HTML content string
 */
function buildWeekAheadContent(weekData: WeekAheadData, dateRange: DateRange): string {
  const plenaryHtml =
    weekData.events.length > 0
      ? weekData.events.map(renderPlenaryEvent).join('')
      : '<p>No plenary sessions scheduled for this period.</p>';

  const committeeSection =
    weekData.committees.length > 0
      ? `<section class="committee-calendar">
            <h2>Committee Meetings</h2>
            ${weekData.committees.map(renderCommitteeMeeting).join('')}
          </section>`
      : '';

  const documentsSection =
    weekData.documents.length > 0
      ? `<section class="legislative-documents">
            <h2>Upcoming Legislative Documents</h2>
            <ul class="document-list">${weekData.documents.map(renderLegislativeDocument).join('')}</ul>
          </section>`
      : '';

  const pipelineSection =
    weekData.pipeline.length > 0
      ? `<section class="legislative-pipeline">
            <h2>Legislative Pipeline</h2>
            <ul class="pipeline-list">${weekData.pipeline.map(renderPipelineProcedure).join('')}</ul>
          </section>`
      : '';

  const qaSection =
    weekData.questions.length > 0
      ? `<section class="qa-schedule">
            <h2>Parliamentary Questions</h2>
            <ul class="qa-list">${weekData.questions.map(renderQuestion).join('')}</ul>
          </section>`
      : '';

  return `
        <div class="article-content">
          <section class="lede">
            <p>The European Parliament prepares for an active week ahead with multiple committee meetings and plenary sessions scheduled from ${escapeHTML(dateRange.start)} to ${escapeHTML(dateRange.end)}.</p>
          </section>
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
function buildKeywords(weekData: WeekAheadData): string[] {
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

/**
 * Generate Week Ahead article in specified languages
 *
 * @returns Generation result
 */
async function generateWeekAhead(): Promise<GenerationResult> {
  console.log('📅 Generating Week Ahead article...');

  try {
    const dateRange = getWeekAheadDateRange();
    console.log(`  📆 Date range: ${dateRange.start} to ${dateRange.end}`);

    const today = new Date();
    const slug = `${formatDateForSlug(today)}-${ARTICLE_TYPE_WEEK_AHEAD}`;

    const weekData = await fetchWeekAheadData(dateRange);
    const keywords = buildKeywords(weekData);
    const content = buildWeekAheadContent(weekData, dateRange);

    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      const titleGenerator = getLocalizedString(WEEK_AHEAD_TITLES, lang);
      const langTitles = titleGenerator(dateRange.start, dateRange.end);

      const html = generateArticleHTML({
        slug: `${slug}-${lang}.html`,
        title: langTitles.title,
        subtitle: langTitles.subtitle,
        date: today.toISOString().split('T')[0]!,
        type: 'prospective',
        readTime: calculateReadTime(content),
        lang,
        content,
        keywords,
        sources: [],
      });

      writeSingleArticle(html, slug, lang);
      console.log(`  ✅ ${lang.toUpperCase()} version generated`);
    }

    console.log('  ✅ Week Ahead article generated successfully in all requested languages');
    return { success: true, files: languages.length, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('❌ Error generating Week Ahead:', message);
    if (stack) {
      console.error('   Stack:', stack);
    }
    stats.errors++;
    return { success: false, error: message };
  }
}

/**
 * Fetch voting anomalies from MCP server or return empty fallback
 *
 * @returns Anomaly data string or empty fallback
 */
async function fetchVotingAnomalies(): Promise<string> {
  if (mcpClient) {
    try {
      const result = (await mcpClient.callTool('detect_voting_anomalies', {
        sensitivityThreshold: 0.3,
      })) as MCPToolResult;
      if (result?.content?.[0]) {
        return result.content[0].text;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('  ⚠️ detect_voting_anomalies failed:', message);
    }
  }
  return '';
}

/**
 * Fetch coalition dynamics from MCP server or return empty fallback
 *
 * @returns Coalition data string or empty fallback
 */
async function fetchCoalitionDynamics(): Promise<string> {
  if (mcpClient) {
    try {
      const result = (await mcpClient.callTool('analyze_coalition_dynamics', {})) as MCPToolResult;
      if (result?.content?.[0]) {
        return result.content[0].text;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('  ⚠️ analyze_coalition_dynamics failed:', message);
    }
  }
  return '';
}

/**
 * Fetch voting statistics report from MCP server or return empty fallback
 *
 * @returns Report data string or empty fallback
 */
async function fetchVotingReport(): Promise<string> {
  if (mcpClient) {
    try {
      const result = (await mcpClient.callTool('generate_report', {
        reportType: 'VOTING_STATISTICS',
      })) as MCPToolResult;
      if (result?.content?.[0]) {
        return result.content[0].text;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('  ⚠️ generate_report failed:', message);
    }
  }
  return '';
}

/**
 * Fetch MEP influence assessment from MCP server or return empty fallback.
 * Returns empty string immediately if no mepId is provided.
 *
 * @param mepId - MEP identifier (skips call when empty)
 * @returns Influence data string or empty fallback
 */
async function fetchMEPInfluence(mepId: string): Promise<string> {
  if (!mepId || !mcpClient) {
    return '';
  }
  try {
    const result = (await mcpClient.callTool('assess_mep_influence', {
      mepId,
      includeDetails: true,
    })) as MCPToolResult;
    if (result?.content?.[0]) {
      return result.content[0].text;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('  ⚠️ assess_mep_influence failed:', message);
  }
  return '';
}

/**
 * Build breaking news HTML content from OSINT data
 *
 * @param date - Article date string
 * @param anomalyRaw - Raw anomaly data from MCP
 * @param coalitionRaw - Raw coalition data from MCP
 * @param reportRaw - Raw report data from MCP
 * @param influenceRaw - Raw MEP influence data from MCP
 * @returns HTML content string
 */
export function buildBreakingNewsContent(
  date: string,
  anomalyRaw: string,
  coalitionRaw: string,
  reportRaw: string,
  influenceRaw: string
): string {
  const hasData = anomalyRaw || coalitionRaw || reportRaw || influenceRaw;
  const timestamp = new Date().toISOString();

  const anomalySection = anomalyRaw
    ? `
        <section class="analysis">
          <h2>Voting Anomaly Intelligence</h2>
          <pre class="data-summary">${escapeHTML(anomalyRaw.slice(0, 2000))}</pre>
        </section>`
    : '';

  const coalitionSection = coalitionRaw
    ? `
        <section class="coalition-impact">
          <h2>Coalition Dynamics Assessment</h2>
          <pre class="data-summary">${escapeHTML(coalitionRaw.slice(0, 2000))}</pre>
        </section>`
    : '';

  const reportSection = reportRaw
    ? `
        <section class="context">
          <h2>Analytical Report</h2>
          <pre class="data-summary">${escapeHTML(reportRaw.slice(0, 2000))}</pre>
        </section>`
    : '';

  const keyPlayersSection = influenceRaw
    ? `
        <section class="key-players">
          <h2>Key MEP Influence Analysis</h2>
          <pre class="data-summary">${escapeHTML(influenceRaw.slice(0, 2000))}</pre>
        </section>`
    : '';

  const placeholderNotice = !hasData
    ? `
        <div class="notice">
          <p><strong>Note:</strong> This is placeholder content generated while the European Parliament MCP Server is unavailable. Live intelligence data will appear here when the server is connected.</p>
        </div>
        <section class="lede">
          <p>Significant parliamentary developments are being monitored. Connect the European Parliament MCP Server to receive real-time intelligence on voting anomalies, coalition shifts, and MEP activities.</p>
        </section>`
    : `
        <section class="lede">
          <p>Intelligence analysis from the European Parliament MCP Server has identified significant parliamentary developments requiring immediate attention as of ${escapeHTML(date)}.</p>
        </section>`;

  return `
        <div class="article-content">
          <section class="breaking-banner">
            <p class="breaking-timestamp">⚡ BREAKING — ${escapeHTML(timestamp)}</p>
          </section>
          ${placeholderNotice}
          ${anomalySection}
          ${coalitionSection}
          ${reportSection}
          ${keyPlayersSection}
        </div>
      `;
}

/**
 * Generate Breaking News article in specified languages
 *
 * @returns Generation result
 */
async function generateBreakingNews(): Promise<GenerationResult> {
  console.log('🚨 Generating Breaking News article...');

  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]!;
    const slug = `${formatDateForSlug(today)}-${ARTICLE_TYPE_BREAKING}`;

    console.log('  📡 Fetching OSINT intelligence data from MCP...');
    const [anomalyRaw, coalitionRaw, reportRaw, influenceRaw] = await Promise.all([
      fetchVotingAnomalies(),
      fetchCoalitionDynamics(),
      fetchVotingReport(),
      fetchMEPInfluence(''),
    ]);

    const content = buildBreakingNewsContent(
      dateStr,
      anomalyRaw,
      coalitionRaw,
      reportRaw,
      influenceRaw
    );

    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      const titleGenerator = getLocalizedString(BREAKING_NEWS_TITLES, lang);
      const langTitles = titleGenerator(dateStr);

      const readTime = calculateReadTime(content);

      const html = generateArticleHTML({
        slug: `${slug}-${lang}.html`,
        title: langTitles.title,
        subtitle: langTitles.subtitle,
        date: dateStr,
        type: 'breaking',
        readTime,
        lang,
        content,
        keywords: [
          KEYWORD_EUROPEAN_PARLIAMENT,
          'breaking news',
          'voting anomalies',
          'coalition dynamics',
        ],
        sources: [],
      });

      writeSingleArticle(html, slug, lang);
      console.log(`  ✅ ${lang.toUpperCase()} version generated`);
    }

    console.log('  ✅ Breaking News article generated successfully in all requested languages');
    return { success: true, files: languages.length, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('❌ Error generating Breaking News:', message);
    if (stack) {
      console.error('   Stack:', stack);
    }
    stats.errors++;
    return { success: false, error: message };
  }
}

/** Featured committees to include in committee reports */
const FEATURED_COMMITTEES = ['ENVI', 'ECON', 'AFET', 'LIBE', 'AGRI'] as const;

/**
 * Apply committee info from MCP result to the data object
 *
 * @param result - MCP tool result
 * @param data - Committee data to populate
 * @param abbreviation - Fallback abbreviation
 */
export function applyCommitteeInfo(result: MCPToolResult, data: CommitteeData, abbreviation: string): void {
  try {
    if (!result?.content?.[0]) return;
    const parsed = JSON.parse(result.content[0].text) as {
      committee?: { name?: string; abbreviation?: string; chair?: string; memberCount?: unknown };
    };
    if (!parsed.committee) return;
    data.name = parsed.committee.name ?? data.name;
    data.abbreviation = parsed.committee.abbreviation ?? abbreviation;
    data.chair = parsed.committee.chair ?? 'N/A';
    const memberCountRaw = parsed.committee.memberCount;
    let memberCount = 0;
    if (typeof memberCountRaw === 'number' && Number.isFinite(memberCountRaw)) {
      memberCount = memberCountRaw;
    } else if (typeof memberCountRaw === 'string') {
      const parsedNumber = Number(memberCountRaw);
      if (Number.isFinite(parsedNumber)) {
        memberCount = parsedNumber;
      }
    }
    data.members = memberCount;
    console.log(`  ✅ Committee info: ${data.name} (${data.members} members)`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('  ⚠️ Failed to parse committee info:', message);
  }
}

/**
 * Apply documents from MCP result to the data object
 *
 * @param result - MCP tool result
 * @param data - Committee data to populate
 */
export function applyDocuments(result: MCPToolResult, data: CommitteeData): void {
  try {
    if (!result?.content?.[0]) return;
    const parsed = JSON.parse(result.content[0].text) as {
      documents?: Array<{ title?: string; type?: string; documentType?: string; date?: string }>;
    };
    if (!parsed.documents || parsed.documents.length === 0) return;
    data.documents = parsed.documents.map((d) => ({
      title: d.title ?? 'Untitled Document',
      type: d.type ?? d.documentType ?? 'Document',
      date: d.date ?? '',
    }));
    console.log(`  ✅ Fetched ${data.documents.length} documents from MCP`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('  ⚠️ Failed to parse documents:', message);
  }
}

/**
 * Apply effectiveness metrics from MCP result to the data object
 *
 * @param result - MCP tool result
 * @param data - Committee data to populate
 */
export function applyEffectiveness(result: MCPToolResult, data: CommitteeData): void {
  try {
    if (!result?.content?.[0]) return;
    const parsed = JSON.parse(result.content[0].text) as {
      effectiveness?: { overallScore?: unknown; rank?: string };
    };
    if (!parsed.effectiveness) return;
    const score = parsed.effectiveness.overallScore;
    const rank = parsed.effectiveness.rank ?? '';
    data.effectiveness =
      typeof score === 'number' && Number.isFinite(score)
        ? `Score: ${score.toFixed(1)} ${rank}`.trim()
        : null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('  ⚠️ Failed to parse effectiveness:', message);
  }
}

/**
 * Fetch committee data from MCP sources for a given abbreviation
 *
 * @param abbreviation - Committee abbreviation (e.g. "ENVI")
 * @returns Committee data populated from MCP sources
 */
async function fetchCommitteeData(abbreviation: string): Promise<CommitteeData> {
  const defaultResult: CommitteeData = {
    name: `${abbreviation} Committee`,
    abbreviation,
    chair: 'N/A',
    members: 0,
    documents: [],
    effectiveness: null,
  };

  if (!mcpClient) return defaultResult;

  try {
    console.log(`  📡 Fetching committee info for ${abbreviation}...`);
    const committeeResult = await mcpClient.getCommitteeInfo({ committeeId: abbreviation });
    applyCommitteeInfo(committeeResult, defaultResult, abbreviation);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`  ⚠️ getCommitteeInfo failed for ${abbreviation}:`, message);
  }

  try {
    console.log(`  📡 Fetching documents for ${abbreviation}...`);
    const docsResult = await mcpClient.searchDocuments({ query: abbreviation, limit: 5 });
    applyDocuments(docsResult, defaultResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`  ⚠️ searchDocuments failed for ${abbreviation}:`, message);
  }

  try {
    const effectivenessResult = await mcpClient.analyzeLegislativeEffectiveness({
      subjectType: 'COMMITTEE',
      subjectId: abbreviation,
    });
    applyEffectiveness(effectivenessResult, defaultResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`  ⚠️ analyzeLegislativeEffectiveness failed for ${abbreviation}:`, message);
  }

  return defaultResult;
}

/**
 * Generate Committee Reports article in specified languages
 *
 * @returns Generation result
 */
async function generateCommitteeReports(): Promise<GenerationResult> {
  console.log('🏛️ Generating Committee Reports article...');

  try {
    const today = new Date();
    const slug = `${formatDateForSlug(today)}-${ARTICLE_TYPE_COMMITTEE_REPORTS}`;

    const committeeDataRaw = await Promise.all(
      FEATURED_COMMITTEES.map((abbr) =>
        fetchCommitteeData(abbr).catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`  ⚠️ Failed to fetch data for committee ${abbr}:`, message);
          return null;
        })
      )
    );

    const committeeDataList = committeeDataRaw.filter(
      (committee): committee is CommitteeData => committee !== null
    );

    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      const titleGenerator = getLocalizedString(COMMITTEE_REPORTS_TITLES, lang);
      const committeeLabel = FEATURED_COMMITTEES.join(', ');
      const langTitles = titleGenerator(committeeLabel);

      const committeeSections = committeeDataList
        .map((committee) => {
          const docItems =
            committee.documents.length > 0
              ? committee.documents
                  .map(
                    (doc) => `
                <li class="document-item">
                  <span class="document-type">${escapeHTML(doc.type)}</span>
                  <span class="document-title">${escapeHTML(doc.title)}</span>
                  ${doc.date ? `<span class="document-date">${escapeHTML(doc.date)}</span>` : ''}
                </li>`
                  )
                  .join('')
              : '<li>No recent documents available</li>';

          const effectivenessHtml = committee.effectiveness
            ? `<p class="effectiveness-score">${escapeHTML(committee.effectiveness)}</p>`
            : '';

          return `
      <section class="committee-card">
        <h3 class="committee-name">${escapeHTML(committee.name)} (${escapeHTML(committee.abbreviation)})</h3>
        <div class="committee-meta">
          <span class="committee-chair">Chair: ${escapeHTML(committee.chair)}</span>
          <span class="committee-members">Members: ${committee.members}</span>
        </div>
        <section class="recent-activity">
          <ul class="document-list">${docItems}</ul>
        </section>
        <section class="effectiveness-metrics">${effectivenessHtml}</section>
      </section>`;
        })
        .join('');

      const content = `
    <section class="committee-overview">
      <p class="lede">${escapeHTML(KEYWORD_EUROPEAN_PARLIAMENT)} committee activity and legislative effectiveness analysis.</p>
    </section>
    <section class="committee-reports">${committeeSections}</section>`;

      const sources = [{ title: KEYWORD_EUROPEAN_PARLIAMENT, url: 'https://www.europarl.europa.eu' }];
      const dateStr = today.toISOString().split('T')[0]!;
      const html = generateArticleHTML({
        slug,
        title: langTitles.title,
        subtitle: langTitles.subtitle,
        date: dateStr,
        type: 'prospective',
        readTime: calculateReadTime(content),
        lang,
        content,
        keywords: ['committee', 'EU Parliament', 'legislation'],
        sources,
      });

      const newsDir = path.join(NEWS_DIR, lang);
      ensureDirectoryExists(newsDir);
      const filename = `${dateStr}-${slug}-${lang}.html`;
      const filepath = path.join(newsDir, filename);
      fs.writeFileSync(filepath, html, 'utf-8');
      console.log(`  ✅ Written: ${filepath}`);
      stats.generated++;
    }

    return { success: true, files: languages.length, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Committee reports generation failed:', message);
    stats.errors++;
    return { success: false, error: message };
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('');
  console.log('🚀 Starting news generation...');
  console.log('');

  try {
    await initializeMCPClient();

    const results: GenerationResult[] = [];

    for (const articleType of articleTypes) {
      if (!VALID_ARTICLE_TYPES.includes(articleType as (typeof VALID_ARTICLE_TYPES)[number])) {
        console.log(`⏭️ Skipping unknown article type: ${articleType}`);
        continue;
      }

      switch (articleType) {
        case ARTICLE_TYPE_WEEK_AHEAD:
          results.push(await generateWeekAhead());
          break;
        case ARTICLE_TYPE_BREAKING:
          results.push(await generateBreakingNews());
          break;
        case ARTICLE_TYPE_COMMITTEE_REPORTS:
          results.push(await generateCommitteeReports());
          break;
        default:
          console.log(`⏭️ Article type "${articleType}" not yet implemented`);
      }
    }

    console.log('');
    console.log('📊 Generation Summary:');
    console.log(`  ✅ Generated: ${stats.generated} articles`);
    console.log(`  ❌ Errors: ${stats.errors}`);
    console.log('');

    // Write metadata
    const metadata = {
      timestamp: stats.timestamp,
      generated: stats.generated,
      errors: stats.errors,
      articles: stats.articles,
      results,
      usedMCP: mcpClient !== null,
    };

    if (!dryRunArg) {
      const metadataPath = path.join(METADATA_DIR, `generation-${formatDateForSlug()}.json`);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
      console.log(`📝 Metadata written to: ${metadataPath}`);
    }
  } finally {
    if (mcpClient) {
      console.log('🔌 Closing MCP client connection...');
      await closeEPMCPClient();
    }
  }

  process.exit(stats.errors > 0 ? 1 : 0);
}

// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
