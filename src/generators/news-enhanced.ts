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
  ARG_SEPARATOR,
} from '../constants/config.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_PRESETS,
  WEEK_AHEAD_TITLES,
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
      mcpClient.getPlenarySessions({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 50 }),
      mcpClient.getCommitteeInfo({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
      mcpClient.searchDocuments({
        keyword: 'parliament',
        dateFrom: dateRange.start,
        dateTo: dateRange.end,
        limit: 20,
      }),
      mcpClient.monitorLegislativePipeline({
        dateFrom: dateRange.start,
        dateTo: dateRange.end,
        status: 'ACTIVE',
        limit: 20,
      }),
      mcpClient.getParliamentaryQuestions({
        dateFrom: dateRange.start,
        dateTo: dateRange.end,
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
  const keywords = ['European Parliament', 'week ahead', 'plenary', 'committees'];
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
