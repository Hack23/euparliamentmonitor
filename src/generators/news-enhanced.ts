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
  MOTIONS_TITLES,
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
  DateRange,
  GenerationStats,
  GenerationResult,
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

/**
 * Fetch events from MCP server or use fallback
 *
 * @param dateRange - Date range with start and end dates
 * @returns Array of events
 */
async function fetchEvents(dateRange: DateRange): Promise<ParliamentEvent[]> {
  if (mcpClient) {
    try {
      console.log('  📡 Fetching events from MCP server...');
      const result: MCPToolResult = await mcpClient.getPlenarySessions({
        startDate: dateRange.start,
        endDate: dateRange.end,
        limit: 50,
      });

      if (result?.content?.[0]) {
        const data = JSON.parse(result.content[0].text) as {
          sessions?: Array<Partial<ParliamentEvent>>;
        };
        if (data.sessions && data.sessions.length > 0) {
          console.log(`  ✅ Fetched ${data.sessions.length} sessions from MCP`);
          return data.sessions.map((s) => ({
            date: s.date ?? dateRange.start,
            title: s.title ?? 'Parliamentary Session',
            type: s.type ?? 'Session',
            description: s.description ?? '',
          }));
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('  ⚠️ MCP fetch failed:', message);
    }
  }

  // Fallback to sample events
  console.log('  ℹ️ Using placeholder events');
  return [
    {
      date: dateRange.start,
      title: 'Plenary Session',
      type: 'Plenary',
      description: 'Full parliamentary session',
    },
    {
      date: dateRange.start,
      title: 'ENVI Committee Meeting',
      type: 'Committee',
      description: 'Environment committee discussion',
    },
  ];
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

    const sampleEvents = await fetchEvents(dateRange);

    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      const titleGenerator = getLocalizedString(WEEK_AHEAD_TITLES, lang);
      const langTitles = titleGenerator(dateRange.start, dateRange.end);

      const content = `
        <div class="article-content">
          <section class="lede">
            <p>The European Parliament prepares for an active week ahead with multiple committee meetings and plenary sessions scheduled from ${dateRange.start} to ${dateRange.end}.</p>
          </section>
          
          <section class="context">
            <h2>What to Watch</h2>
            <ul>
              <li>Plenary sessions on key legislative priorities</li>
              <li>Committee meetings on environment, economy, and foreign affairs</li>
              <li>Expected votes on important resolutions</li>
            </ul>
          </section>
          
          <section class="event-calendar">
            <h2>Key Events</h2>
            ${sampleEvents
              .map(
                (event) => `
              <div class="event-item">
                <div class="event-date">${escapeHTML(event.date)}</div>
                <div class="event-details">
                  <h3>${escapeHTML(event.title)}</h3>
                  <p class="event-type">${escapeHTML(event.type)}</p>
                  <p>${escapeHTML(event.description)}</p>
                </div>
              </div>
            `
              )
              .join('')}
          </section>
        </div>
      `;

      const readTime = calculateReadTime(content);

      const html = generateArticleHTML({
        slug: `${slug}-${lang}.html`,
        title: langTitles.title,
        subtitle: langTitles.subtitle,
        date: today.toISOString().split('T')[0]!,
        type: 'prospective',
        readTime,
        lang,
        content,
        keywords: ['European Parliament', 'week ahead', 'plenary', 'committees'],
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
 * Fetch voting records from MCP
 *
 * @param dateFromStr - Start date
 * @param dateStr - End date
 * @returns Voting records array
 */
async function fetchVotingRecords(
  dateFromStr: string,
  dateStr: string
): Promise<Array<{ title: string; date: string; result: string; votes: { for: number; against: number; abstain: number } }>> {
  if (!mcpClient) return [];

  try {
    console.log('  📡 Fetching voting records from MCP server...');
    const votingResult = await mcpClient.callTool('get_voting_records', {
      dateFrom: dateFromStr,
      dateTo: dateStr,
      limit: 20,
    }) as MCPToolResult;

    if (votingResult?.content?.[0]) {
      const data = JSON.parse(votingResult.content[0].text) as {
        records?: Array<{ title?: string; date?: string; result?: string; votes?: { for?: number; against?: number; abstain?: number } }>;
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
async function fetchVotingPatterns(
  dateFromStr: string,
  dateStr: string
): Promise<Array<{ group: string; cohesion: number; participation: number }>> {
  if (!mcpClient) return [];

  try {
    console.log('  📡 Fetching voting patterns from MCP server...');
    const patternsResult = await mcpClient.callTool('analyze_voting_patterns', {
      dateFrom: dateFromStr,
      dateTo: dateStr,
    }) as MCPToolResult;

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
async function fetchVotingAnomalies(
  dateFromStr: string,
  dateStr: string
): Promise<Array<{ type: string; description: string; severity: string }>> {
  if (!mcpClient) return [];

  try {
    console.log('  📡 Fetching voting anomalies from MCP server...');
    const anomaliesResult = await mcpClient.callTool('detect_voting_anomalies', {
      dateFrom: dateFromStr,
      dateTo: dateStr,
    }) as MCPToolResult;

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
): Promise<Array<{ author: string; topic: string; date: string; status: string }>> {
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
        questions?: Array<{ author?: string; topic?: string; date?: string; status?: string }>;
      };
      if (data.questions && data.questions.length > 0) {
        console.log(`  ✅ Fetched ${data.questions.length} parliamentary questions from MCP`);
        return data.questions.map((q) => ({
          author: q.author ?? 'Unknown MEP',
          topic: q.topic ?? 'General inquiry',
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

/**
 * Get fallback data for motions article
 *
 * @param dateStr - Current date string
 * @param dateFromStr - Start date string
 * @returns Object with all fallback data arrays
 */
function getMotionsFallbackData(dateStr: string, dateFromStr: string): {
  votingRecords: Array<{ title: string; date: string; result: string; votes: { for: number; against: number; abstain: number } }>;
  votingPatterns: Array<{ group: string; cohesion: number; participation: number }>;
  anomalies: Array<{ type: string; description: string; severity: string }>;
  questions: Array<{ author: string; topic: string; date: string; status: string }>;
} {
  return {
    votingRecords: [
      {
        title: 'Resolution on Climate Action',
        date: dateStr,
        result: 'Adopted',
        votes: { for: 450, against: 120, abstain: 30 },
      },
      {
        title: 'Digital Markets Act Amendment',
        date: dateFromStr,
        result: 'Rejected',
        votes: { for: 280, against: 310, abstain: 10 },
      },
    ],
    votingPatterns: [
      { group: 'EPP', cohesion: 0.85, participation: 0.92 },
      { group: 'S&D', cohesion: 0.78, participation: 0.89 },
      { group: 'Greens/EFA', cohesion: 0.82, participation: 0.91 },
    ],
    anomalies: [
      {
        type: 'Cross-Party Defection',
        description: 'Unusual number of EPP members voted with opposition on agricultural policy',
        severity: 'MEDIUM',
      },
    ],
    questions: [
      {
        author: 'Maria Silva (S&D, PT)',
        topic: 'EU energy security measures',
        date: dateStr,
        status: 'ANSWERED',
      },
      {
        author: 'Hans Mueller (EPP, DE)',
        topic: 'Migration policy coordination',
        date: dateFromStr,
        status: 'PENDING',
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
function generateMotionsContent(
  dateFromStr: string,
  dateStr: string,
  votingRecords: Array<{ title: string; date: string; result: string; votes: { for: number; against: number; abstain: number } }>,
  votingPatterns: Array<{ group: string; cohesion: number; participation: number }>,
  anomalies: Array<{ type: string; description: string; severity: string }>,
  questions: Array<{ author: string; topic: string; date: string; status: string }>
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
          .map(
            (anomaly) => `
          <div class="anomaly-item severity-${escapeHTML(anomaly.severity.toLowerCase())}">
            <h3>${escapeHTML(anomaly.type)}</h3>
            <p>${escapeHTML(anomaly.description)}</p>
            <p class="severity">Severity: ${escapeHTML(anomaly.severity)}</p>
          </div>
        `
          )
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
async function fetchMotionsData(dateFromStr: string, dateStr: string): Promise<{
  votingRecords: Array<{ title: string; date: string; result: string; votes: { for: number; against: number; abstain: number } }>;
  votingPatterns: Array<{ group: string; cohesion: number; participation: number }>;
  anomalies: Array<{ type: string; description: string; severity: string }>;
  questions: Array<{ author: string; topic: string; date: string; status: string }>;
}> {
  // Fetch data from MCP
  let votingRecords = await fetchVotingRecords(dateFromStr, dateStr);
  let votingPatterns = await fetchVotingPatterns(dateFromStr, dateStr);
  let anomalies = await fetchVotingAnomalies(dateFromStr, dateStr);
  let questions = await fetchParliamentaryQuestions(dateFromStr, dateStr);

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
    const { votingRecords, votingPatterns, anomalies, questions } = await fetchMotionsData(dateFromStr, dateStr);

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
          'European Parliament',
          'motions',
          'voting records',
          'party cohesion',
          'parliamentary questions',
        ],
        sources: [],
      });

      writeSingleArticle(html, slug, lang);
      console.log(`  ✅ ${lang.toUpperCase()} version generated`);
    }

    console.log('  ✅ Motions article generated successfully in all requested languages');
    return { success: true, files: languages.length, slug };
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
        case 'motions':
          results.push(await generateMotions());
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
