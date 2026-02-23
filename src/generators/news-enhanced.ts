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
  ARTICLE_TYPE_PROPOSITIONS,
  ARTICLE_TYPE_MOTIONS,
  ARG_SEPARATOR,
} from '../constants/config.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_PRESETS,
  WEEK_AHEAD_TITLES,
  MOTIONS_TITLES,
  PROPOSITIONS_TITLES,
  PROPOSITIONS_STRINGS,
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
  VotingRecord,
  VotingPattern,
  VotingAnomaly,
  MotionsQuestion,
  PropositionsStrings,
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
const skipExistingArg = args.includes('--skip-existing');

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
console.log('Skip existing:', skipExistingArg ? 'Yes' : 'No');

// Ensure directories exist
ensureDirectoryExists(METADATA_DIR);

// Generation statistics
const stats: GenerationStats = {
  generated: 0,
  skipped: 0,
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
 * @returns True if the file was written, false if it was skipped
 */
function writeSingleArticle(html: string, slug: string, lang: string): boolean {
  const filename = `${slug}-${lang}.html`;
  if (skipExistingArg && fs.existsSync(path.join(NEWS_DIR, filename))) {
    console.log(`  ⏭️ Skipping existing: ${filename}`);
    stats.skipped += 1;
    return false;
  }
  writeArticle(html, filename);
  stats.generated += 1;
  stats.articles.push(filename);
  return true;
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
      mcpClient.getPlenarySessions({
        startDate: dateRange.start,
        endDate: dateRange.end,
        limit: 50,
      }),
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

    let filesWritten = 0;
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

      if (writeSingleArticle(html, slug, lang)) {
        filesWritten += 1;
        console.log(`  ✅ ${lang.toUpperCase()} version generated`);
      }
    }

    console.log('  ✅ Week Ahead article generated successfully in all requested languages');
    return { success: true, files: filesWritten, slug };
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
      const result = await mcpClient.callTool('detect_voting_anomalies', {
        sensitivityThreshold: 0.3,
      });
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
      const result = await mcpClient.callTool('analyze_coalition_dynamics', {});
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
      const result = await mcpClient.callTool('generate_report', {
        reportType: 'VOTING_STATISTICS',
      });
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
    const result = await mcpClient.callTool('assess_mep_influence', {
      mepId,
      includeDetails: true,
    });
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

    let filesWritten = 0;
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

      if (writeSingleArticle(html, slug, lang)) {
        filesWritten += 1;
        console.log(`  ✅ ${lang.toUpperCase()} version generated`);
      }
    }

    console.log('  ✅ Breaking News article generated successfully in all requested languages');
    return { success: true, files: filesWritten, slug };
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
export function applyCommitteeInfo(
  result: MCPToolResult,
  data: CommitteeData,
  abbreviation: string
): void {
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

    let filesWritten = 0;
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

      const sources = [
        { title: KEYWORD_EUROPEAN_PARLIAMENT, url: 'https://www.europarl.europa.eu' },
      ];
      const dateStr = today.toISOString().split('T')[0]!;
      const html = generateArticleHTML({
        slug: `${slug}-${lang}.html`,
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

      if (writeSingleArticle(html, slug, lang)) {
        filesWritten += 1;
      }
    }

    return { success: true, files: filesWritten, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Committee reports generation failed:', message);
    stats.errors++;
    return { success: false, error: message };
  }
}

/**
 * Fetches recent voting records from the MCP server for the given date range.
 *
 * @param dateFromStr - Start date in YYYY-MM-DD format
 * @param dateStr - End date in YYYY-MM-DD format
 * @returns Array of VotingRecord objects, or empty array if MCP is unavailable
 */
async function fetchVotingRecords(dateFromStr: string, dateStr: string): Promise<VotingRecord[]> {
  if (!mcpClient) return [];

  try {
    console.log('  📡 Fetching voting records from MCP server...');
    const votingResult = (await mcpClient.callTool('get_voting_records', {
      dateFrom: dateFromStr,
      dateTo: dateStr,
      limit: 20,
    })) as MCPToolResult;

    if (votingResult?.content?.[0]) {
      const data = JSON.parse(votingResult.content[0].text) as {
        records?: Array<{
          title?: string;
          date?: string;
          result?: string;
          votes?: { for?: number; against?: number; abstain?: number };
        }>;
      };
      if (data.records && data.records.length > 0) {
        console.log(`  ✅ Fetched ${data.records.length} voting records from MCP`);
        return data.records.map((r) => ({
          title: r.title ?? 'Parliamentary Vote',
          date: r.date ?? dateStr,
          result: r.result ?? 'Adopted',
          votes: {
            for: r.votes?.for ?? 0,
            against: r.votes?.against ?? 0,
            abstain: r.votes?.abstain ?? 0,
          },
        }));
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('  ⚠️ MCP voting records fetch failed:', message);
  }

  return [];
}

/**
 * Fetch voting patterns from MCP
 *
 * @param dateFromStr - Start date
 * @param dateStr - End date
 * @returns Voting patterns array
 */
async function fetchVotingPatterns(dateFromStr: string, dateStr: string): Promise<VotingPattern[]> {
  if (!mcpClient) return [];

  try {
    console.log('  📡 Fetching voting patterns from MCP server...');
    const patternsResult = (await mcpClient.callTool('analyze_voting_patterns', {
      dateFrom: dateFromStr,
      dateTo: dateStr,
    })) as MCPToolResult;

    if (patternsResult?.content?.[0]) {
      const data = JSON.parse(patternsResult.content[0].text) as {
        patterns?: Array<{ group?: string; cohesion?: number; participation?: number }>;
      };
      if (data.patterns && data.patterns.length > 0) {
        console.log(`  ✅ Fetched ${data.patterns.length} voting patterns from MCP`);
        return data.patterns.map((p) => ({
          group: p.group ?? 'Unknown Group',
          cohesion: p.cohesion ?? 0,
          participation: p.participation ?? 0,
        }));
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('  ⚠️ MCP voting patterns fetch failed:', message);
  }

  return [];
}

/**
 * Fetch voting anomalies from MCP
 *
 * @param dateFromStr - Start date
 * @param dateStr - End date
 * @returns Voting anomalies array
 */
async function fetchMotionsAnomalies(
  dateFromStr: string,
  dateStr: string
): Promise<VotingAnomaly[]> {
  if (!mcpClient) return [];

  try {
    console.log('  📡 Fetching voting anomalies from MCP server...');
    const anomaliesResult = (await mcpClient.callTool('detect_voting_anomalies', {
      dateFrom: dateFromStr,
      dateTo: dateStr,
    })) as MCPToolResult;

    if (anomaliesResult?.content?.[0]) {
      const data = JSON.parse(anomaliesResult.content[0].text) as {
        anomalies?: Array<{ type?: string; description?: string; severity?: string }>;
      };
      if (data.anomalies && data.anomalies.length > 0) {
        console.log(`  ✅ Fetched ${data.anomalies.length} voting anomalies from MCP`);
        return data.anomalies.map((a) => ({
          type: a.type ?? 'Unusual Pattern',
          description: a.description ?? 'No description available',
          severity: a.severity ?? 'MEDIUM',
        }));
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('  ⚠️ MCP voting anomalies fetch failed:', message);
  }

  return [];
}

/**
 * Fetch parliamentary questions from MCP
 *
 * @param dateFromStr - Start date
 * @param dateStr - End date
 * @returns Parliamentary questions array
 */
async function fetchParliamentaryQuestions(
  dateFromStr: string,
  dateStr: string
): Promise<MotionsQuestion[]> {
  if (!mcpClient) return [];

  try {
    console.log('  📡 Fetching parliamentary questions from MCP server...');
    const questionsResult = await mcpClient.getParliamentaryQuestions({
      dateFrom: dateFromStr,
      dateTo: dateStr,
      limit: 10,
    });

    if (questionsResult?.content?.[0]) {
      const data = JSON.parse(questionsResult.content[0].text) as {
        questions?: Array<{
          author?: string;
          topic?: string;
          subject?: string;
          date?: string;
          status?: string;
        }>;
      };
      if (data.questions && data.questions.length > 0) {
        console.log(`  ✅ Fetched ${data.questions.length} parliamentary questions from MCP`);
        return data.questions.map((q) => ({
          author: q.author ?? 'Unknown MEP',
          topic: q.topic ?? q.subject ?? 'General inquiry',
          date: q.date ?? dateStr,
          status: q.status ?? 'PENDING',
        }));
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('  ⚠️ MCP parliamentary questions fetch failed:', message);
  }

  return [];
}

/** Marker string used in all fallback/placeholder data to indicate MCP data is unavailable */
export const PLACEHOLDER_MARKER = 'DATA_UNAVAILABLE (placeholder)';

/**
 * Get fallback data for motions article
 *
 * @param dateStr - Current date string
 * @param dateFromStr - Start date string
 * @returns Object with all fallback data arrays
 */
export function getMotionsFallbackData(
  dateStr: string,
  dateFromStr: string
): {
  votingRecords: VotingRecord[];
  votingPatterns: VotingPattern[];
  anomalies: VotingAnomaly[];
  questions: MotionsQuestion[];
} {
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
        description:
          'No real anomaly data available from MCP – this is illustrative placeholder content only.',
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
 * @returns HTML content string
 */
export function generateMotionsContent(
  dateFromStr: string,
  dateStr: string,
  votingRecords: VotingRecord[],
  votingPatterns: VotingPattern[],
  anomalies: VotingAnomaly[],
  questions: MotionsQuestion[]
): string {
  return `
    <div class="article-content">
      <section class="lede">
        <p>Recent parliamentary activities reveal key voting patterns, party cohesion trends, and notable political dynamics in the European Parliament. Analysis of voting records from ${dateFromStr} to ${dateStr} provides insights into legislative decision-making and party discipline.</p>
      </section>
      
      <section class="voting-results">
        <h2>Recent Voting Records</h2>
        ${votingRecords
          .map(
            (record) => `
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
        `
          )
          .join('')}
      </section>
      
      <section class="voting-patterns">
        <h2>Party Cohesion Analysis</h2>
        <p>Analysis of voting behavior reveals varying levels of party discipline across political groups:</p>
        ${votingPatterns
          .map(
            (pattern) => `
          <div class="pattern-item">
            <h3>${escapeHTML(pattern.group)}</h3>
            <p><strong>Cohesion:</strong> ${escapeHTML(String((pattern.cohesion * 100).toFixed(1)))}%</p>
            <p><strong>Participation:</strong> ${escapeHTML(String((pattern.participation * 100).toFixed(1)))}%</p>
          </div>
        `
          )
          .join('')}
      </section>
      
      <section class="anomalies">
        <h2>Detected Voting Anomalies</h2>
        <p>Unusual voting patterns that deviate from typical party lines:</p>
        ${anomalies
          .map((anomaly) => {
            const rawSeverity = anomaly.severity ?? 'unknown';
            const severityDisplay =
              typeof rawSeverity === 'string' ? rawSeverity : String(rawSeverity);
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
          .map(
            (question) => `
          <div class="question-item">
            <p class="question-author">${escapeHTML(question.author)}</p>
            <p class="question-topic"><strong>${escapeHTML(question.topic)}</strong></p>
            <p class="question-meta">Date: ${escapeHTML(question.date)} | Status: ${escapeHTML(question.status)}</p>
          </div>
        `
          )
          .join('')}
      </section>
    </div>
  `;
}

/**
 * Fetch all motions data from MCP or use fallback
 *
 * @param dateFromStr - Start date
 * @param dateStr - End date
 * @returns Object with all motions data
 */
async function fetchMotionsData(
  dateFromStr: string,
  dateStr: string
): Promise<{
  votingRecords: VotingRecord[];
  votingPatterns: VotingPattern[];
  anomalies: VotingAnomaly[];
  questions: MotionsQuestion[];
}> {
  // Fetch data from MCP in parallel
  const [votingRecordsResult, votingPatternsResult, anomaliesResult, questionsResult] =
    await Promise.allSettled([
      fetchVotingRecords(dateFromStr, dateStr),
      fetchVotingPatterns(dateFromStr, dateStr),
      fetchMotionsAnomalies(dateFromStr, dateStr),
      fetchParliamentaryQuestions(dateFromStr, dateStr),
    ]);

  let votingRecords: VotingRecord[] =
    votingRecordsResult.status === 'fulfilled' ? votingRecordsResult.value : [];
  if (votingRecordsResult.status === 'rejected') {
    console.warn('  ⚠️ Failed to fetch voting records from MCP');
  }

  let votingPatterns: VotingPattern[] =
    votingPatternsResult.status === 'fulfilled' ? votingPatternsResult.value : [];
  if (votingPatternsResult.status === 'rejected') {
    console.warn('  ⚠️ Failed to fetch voting patterns from MCP');
  }

  let anomalies: VotingAnomaly[] =
    anomaliesResult.status === 'fulfilled' ? anomaliesResult.value : [];
  if (anomaliesResult.status === 'rejected') {
    console.warn('  ⚠️ Failed to fetch voting anomalies from MCP');
  }

  let questions: MotionsQuestion[] =
    questionsResult.status === 'fulfilled' ? questionsResult.value : [];
  if (questionsResult.status === 'rejected') {
    console.warn('  ⚠️ Failed to fetch parliamentary questions from MCP');
  }

  // Use fallback data per section if MCP returned no data
  const fallback = getMotionsFallbackData(dateStr, dateFromStr);
  if (votingRecords.length === 0) {
    console.log('  ℹ️ Using placeholder voting records');
    votingRecords = fallback.votingRecords;
  }
  if (votingPatterns.length === 0) {
    console.log('  ℹ️ Using placeholder voting patterns');
    votingPatterns = fallback.votingPatterns;
  }
  if (anomalies.length === 0) {
    console.log('  ℹ️ Using placeholder voting anomalies');
    anomalies = fallback.anomalies;
  }
  if (questions.length === 0) {
    console.log('  ℹ️ Using placeholder parliamentary questions');
    questions = fallback.questions;
  }

  return { votingRecords, votingPatterns, anomalies, questions };
}

/**
 * Generate Motions article in specified languages
 *
 * @returns Generation result
 */
/**
 * Fetch legislative proposals from MCP and return HTML + first procedure ID.
 * Uses a broad keyword search (no document-type filter) to cover all proposal types.
 *
 * @returns Object with HTML string and optional first procedure ID found
 */
async function fetchProposalsFromMCP(): Promise<{ html: string; firstProcedureId: string }> {
  if (!mcpClient) return { html: '', firstProcedureId: '' };
  const docsResult = await mcpClient.searchDocuments({
    keyword: 'legislative proposal',
    limit: 10,
  });
  if (!docsResult?.content?.[0]) return { html: '', firstProcedureId: '' };
  let data: { documents?: Array<Partial<LegislativeDocument>> };
  try {
    data = JSON.parse(docsResult.content[0].text) as {
      documents?: Array<Partial<LegislativeDocument>>;
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('  ⚠️ Failed to parse proposals JSON:', message);
    return { html: '', firstProcedureId: '' };
  }
  if (!data.documents?.length) return { html: '', firstProcedureId: '' };
  console.log(`  ✅ Fetched ${data.documents.length} proposals from MCP`);
  const firstProcedureId =
    data.documents.find((d) => /\d{4}\/\d+\(.+\)/.test(d.id ?? ''))?.id ?? '';
  const html = data.documents
    .map(
      (doc) => `
      <div class="proposal-card">
        <h3>${escapeHTML(doc.title ?? 'Legislative Proposal')}</h3>
        <div class="proposal-meta">
          ${doc.id ? `<span class="proposal-id">${escapeHTML(doc.id)}</span>` : ''}
          ${doc.date ? `<span class="proposal-date">${escapeHTML(doc.date)}</span>` : ''}
          ${doc.status ? `<span class="proposal-status">${escapeHTML(doc.status)}</span>` : ''}
        </div>
        ${doc.committee ? `<p class="proposal-committee">${escapeHTML(doc.committee)}</p>` : ''}
        ${doc.rapporteur ? `<p class="proposal-rapporteur">${escapeHTML(doc.rapporteur)}</p>` : ''}
      </div>`
    )
    .join('');
  return { html, firstProcedureId };
}

/** Structured pipeline data returned from MCP before language-specific rendering */
interface PipelineData {
  healthScore: number;
  throughput: number;
  procRowsHtml: string;
}

/**
 * Fetch legislative pipeline data from MCP server.
 *
 * @returns Structured pipeline data, or null if unavailable
 */
async function fetchPipelineFromMCP(): Promise<PipelineData | null> {
  if (!mcpClient) return null;
  const pipelineResult = await mcpClient.monitorLegislativePipeline({ status: 'ACTIVE', limit: 5 });
  if (!pipelineResult?.content?.[0]) return null;
  let pipeData: {
    pipelineHealthScore?: number;
    throughputRate?: number;
    procedures?: Array<{ id?: string; title?: string; stage?: string }>;
  };
  try {
    pipeData = JSON.parse(pipelineResult.content[0].text) as typeof pipeData;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('  ⚠️ Failed to parse pipeline JSON:', message);
    return null;
  }
  const healthScore = pipeData.pipelineHealthScore ?? 0;
  const throughput = pipeData.throughputRate ?? 0;
  const procRowsHtml =
    pipeData.procedures
      ?.map(
        (proc) => `
      <div class="procedure-item">
        ${proc.id ? `<span class="procedure-id">${escapeHTML(proc.id)}</span>` : ''}
        ${proc.title ? `<span class="procedure-title">${escapeHTML(proc.title)}</span>` : ''}
        ${proc.stage ? `<span class="procedure-stage">${escapeHTML(proc.stage)}</span>` : ''}
      </div>`
      )
      .join('') ?? '';
  return { healthScore, throughput, procRowsHtml };
}

/**
 * Fetch a specific procedure's tracked status HTML from MCP.
 * Returns empty string if procedureId is empty or MCP unavailable.
 *
 * @param procedureId - Procedure identifier e.g. "2024/0001(COD)"
 * @returns HTML string for procedure status section, or empty string
 */
async function fetchProcedureStatusFromMCP(procedureId: string): Promise<string> {
  if (!procedureId || !mcpClient) return '';
  try {
    const result = await mcpClient.trackLegislation(procedureId);
    if (!result?.content?.[0]) return '';
    const raw = result.content[0].text;
    return `<pre class="data-summary">${escapeHTML(raw.slice(0, 2000))}</pre>`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('  ⚠️ track_legislation failed:', message);
    return '';
  }
}

/**
 * Build propositions article HTML content with localized strings.
 *
 * **Security contract**: `proposalsHtml`, `procedureHtml`, and
 * `pipelineData.procRowsHtml` MUST be pre-sanitized HTML — all external
 * (MCP-sourced) values must have been passed through `escapeHTML()` before
 * being interpolated into these strings.  The fetch helpers
 * (`fetchProposalsFromMCP`, `fetchPipelineFromMCP`,
 * `fetchProcedureStatusFromMCP`) fulfil this contract; callers must do the
 * same if they construct these arguments independently.
 *
 * @param proposalsHtml - Pre-sanitized HTML for proposals list section
 * @param pipelineData - Structured pipeline data from MCP (null when unavailable);
 *   `pipelineData.procRowsHtml` must be pre-sanitized HTML
 * @param procedureHtml - Pre-sanitized HTML for tracked procedure status section (may be empty)
 * @param strings - Localized string set for the target language
 * @returns Full article HTML content string
 */
export function buildPropositionsContent(
  proposalsHtml: string,
  pipelineData: PipelineData | null,
  procedureHtml: string,
  strings: PropositionsStrings
): string {
  const pipelineHtml = pipelineData
    ? `
    <div class="pipeline-metrics">
      <div class="metric" aria-label="${escapeHTML(strings.pipelineHealthLabel)}">
        <span class="metric-label">${escapeHTML(strings.pipelineHealthLabel)}</span>
        <span class="metric-value">${escapeHTML(String(Math.round(pipelineData.healthScore * 100)))}%</span>
      </div>
      <div class="metric" aria-label="${escapeHTML(strings.throughputRateLabel)}">
        <span class="metric-label">${escapeHTML(strings.throughputRateLabel)}</span>
        <span class="metric-value">${escapeHTML(String(pipelineData.throughput))}</span>
      </div>
    </div>
    ${pipelineData.procRowsHtml}`
    : '';
  const procedureSection = procedureHtml
    ? `
          <section class="procedure-status">
            <h2>${escapeHTML(strings.procedureHeading)}</h2>
            ${procedureHtml}
          </section>`
    : '';
  return `
        <div class="article-content">
          <section class="lede">
            <p>${escapeHTML(strings.lede)}</p>
          </section>

          <section class="proposals-list">
            <h2>${escapeHTML(strings.proposalsHeading)}</h2>
            ${proposalsHtml}
          </section>

          <section class="pipeline-status">
            <h2>${escapeHTML(strings.pipelineHeading)}</h2>
            ${pipelineHtml}
          </section>
          ${procedureSection}
          <section class="analysis">
            <h2>${escapeHTML(strings.analysisHeading)}</h2>
            <p>${escapeHTML(strings.analysis)}</p>
          </section>
        </div>
      `;
}

/**
 * Generate Propositions article in specified languages
 *
 * @returns Generation result
 */
async function generatePropositions(): Promise<GenerationResult> {
  console.log('📜 Generating Propositions article...');

  try {
    const today = new Date();
    const slug = `${formatDateForSlug(today)}-propositions`;

    // Fetch proposals and pipeline in parallel
    console.log('  📡 Fetching legislative data from MCP server...');
    const [proposalsResult, pipelineResult] = await Promise.allSettled([
      fetchProposalsFromMCP(),
      fetchPipelineFromMCP(),
    ]);

    const { html: proposalsHtml, firstProcedureId } =
      proposalsResult.status === 'fulfilled'
        ? proposalsResult.value
        : { html: '', firstProcedureId: '' };

    const pipelineData = pipelineResult.status === 'fulfilled' ? pipelineResult.value : null;

    // Track the first identified procedure for additional detail
    const procedureHtml = await fetchProcedureStatusFromMCP(firstProcedureId);

    if (!proposalsHtml)
      console.log('  ℹ️ No proposals from MCP — pipeline article will be data-free');

    let filesWritten = 0;
    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      const langTitles = getLocalizedString(PROPOSITIONS_TITLES, lang)();
      const strings = getLocalizedString(PROPOSITIONS_STRINGS, lang);

      const content = buildPropositionsContent(proposalsHtml, pipelineData, procedureHtml, strings);
      const readTime = calculateReadTime(content);

      const html = generateArticleHTML({
        slug: `${slug}-${lang}.html`,
        title: langTitles.title,
        subtitle: langTitles.subtitle,
        date: today.toISOString().split('T')[0]!,
        type: 'propositions',
        readTime,
        lang,
        content,
        keywords: [KEYWORD_EUROPEAN_PARLIAMENT, 'legislation', 'proposals', 'procedure', 'OLP'],
        sources: [],
      });

      if (writeSingleArticle(html, slug, lang)) {
        filesWritten += 1;
        console.log(`  ✅ ${lang.toUpperCase()} version generated`);
      }
    }

    console.log('  ✅ Propositions article generated successfully in all requested languages');
    return { success: true, files: filesWritten, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('❌ Error generating Propositions:', message);
    if (stack) {
      console.error('   Stack:', stack);
    }
    stats.errors++;
    return { success: false, error: message };
  }
}

async function generateMotions(): Promise<GenerationResult> {
  console.log('🗳️ Generating Motions article...');

  try {
    const today = new Date();
    const slug = `${formatDateForSlug(today)}-motions`;
    const dateStr = today.toISOString().split('T')[0]!;

    // Calculate date range for last 30 days
    const dateFrom = new Date(today);
    dateFrom.setDate(today.getDate() - 30);
    const dateFromStr = dateFrom.toISOString().split('T')[0]!;

    // Fetch all data
    const { votingRecords, votingPatterns, anomalies, questions } = await fetchMotionsData(
      dateFromStr,
      dateStr
    );

    let filesWritten = 0;
    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      const titleGenerator = getLocalizedString(MOTIONS_TITLES, lang);
      const langTitles = titleGenerator(dateStr);

      const content = generateMotionsContent(
        dateFromStr,
        dateStr,
        votingRecords,
        votingPatterns,
        anomalies,
        questions
      );

      const readTime = calculateReadTime(content);

      const html = generateArticleHTML({
        slug: `${slug}-${lang}.html`,
        title: langTitles.title,
        subtitle: langTitles.subtitle,
        date: dateStr,
        type: 'retrospective',
        readTime,
        lang,
        content,
        keywords: [
          KEYWORD_EUROPEAN_PARLIAMENT,
          'motions',
          'voting records',
          'party cohesion',
          'parliamentary questions',
        ],
        sources: [],
      });

      if (writeSingleArticle(html, slug, lang)) {
        filesWritten += 1;
        console.log(`  ✅ ${lang.toUpperCase()} version generated`);
      }
    }

    console.log('  ✅ Motions article generated successfully in all requested languages');
    return { success: true, files: filesWritten, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('❌ Error generating Motions:', message);
    if (stack) {
      console.error('   Stack:', stack);
    }
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
        case ARTICLE_TYPE_PROPOSITIONS:
          results.push(await generatePropositions());
          break;
        case ARTICLE_TYPE_MOTIONS:
          results.push(await generateMotions());
          break;
        default:
          console.log(`⏭️ Article type "${articleType}" not yet implemented`);
      }
    }

    console.log('');
    console.log('📊 Generation Summary:');
    console.log(`  ✅ Generated: ${stats.generated} articles`);
    console.log(`  ⏭️ Skipped: ${stats.skipped} articles`);
    console.log(`  ❌ Errors: ${stats.errors}`);
    console.log('');

    // Write metadata
    const metadata = {
      timestamp: stats.timestamp,
      generated: stats.generated,
      skipped: stats.skipped,
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
