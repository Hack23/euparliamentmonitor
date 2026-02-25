#!/usr/bin/env node

// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/NewsEnhanced
 * @description CLI orchestrator for European Parliament news generation.
 * Imports content-building pure functions from bounded-context modules and
 * handles MCP data fetching, article writing, and multi-language generation.
 *
 * Bounded-context content modules:
 * - {@link module:Generators/WeekAheadContent}
 * - {@link module:Generators/BreakingContent}
 * - {@link module:Generators/CommitteeHelpers}
 * - {@link module:Generators/MotionsContent}
 * - {@link module:Generators/PropositionsContent}
 */

import fs from 'fs';
import path, { resolve } from 'path';
import { pathToFileURL } from 'url';
import {
  NEWS_DIR,
  METADATA_DIR,
  VALID_ARTICLE_CATEGORIES,
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
  LegislativeDocument,
  VotingAnomalyIntelligence,
  CoalitionIntelligence,
} from '../types/index.js';
import { ArticleCategory } from '../types/index.js';
import type { EuropeanParliamentMCPClient } from '../mcp/ep-mcp-client.js';

// ─── Content-module imports (bounded contexts) ──────────────────────────────

import {
  parsePlenarySessions,
  parseCommitteeMeetings,
  parseLegislativeDocuments,
  parseLegislativePipeline,
  parseParliamentaryQuestions as parseQuestions,
  buildWeekAheadContent,
  buildKeywords,
  PLACEHOLDER_EVENTS,
  buildWhatToWatchSection,
} from './week-ahead-content.js';

import { buildBreakingNewsContent } from './breaking-content.js';

import {
  applyCommitteeInfo,
  applyDocuments,
  applyEffectiveness,
  FEATURED_COMMITTEES,
} from './committee-helpers.js';

import {
  PLACEHOLDER_MARKER,
  getMotionsFallbackData,
  generateMotionsContent,
  buildPoliticalAlignmentSection,
} from './motions-content.js';

import { buildPropositionsContent } from './propositions-content.js';
import type { PipelineData } from './propositions-content.js';

import {
  scoreVotingAnomaly,
  analyzeCoalitionCohesion,
  scoreMEPInfluence,
  calculateLegislativeVelocity,
  rankBySignificance,
  buildIntelligenceSection,
} from '../utils/intelligence-analysis.js';

// ─── Re-exports for backward compatibility (tests import from this module) ───

export {
  parsePlenarySessions,
  parseCommitteeMeetings,
  parseLegislativeDocuments,
  parseLegislativePipeline,
  buildWeekAheadContent,
  buildKeywords,
  PLACEHOLDER_EVENTS,
  buildWhatToWatchSection,
};
export { buildBreakingNewsContent };
export { applyCommitteeInfo, applyDocuments, applyEffectiveness, FEATURED_COMMITTEES };
export {
  PLACEHOLDER_MARKER,
  getMotionsFallbackData,
  generateMotionsContent,
  buildPoliticalAlignmentSection,
};
export { buildPropositionsContent };
export type { PipelineData };
export {
  scoreVotingAnomaly,
  analyzeCoalitionCohesion,
  scoreMEPInfluence,
  calculateLegislativeVelocity,
  rankBySignificance,
  buildIntelligenceSection,
};

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
  (t) => !VALID_ARTICLE_CATEGORIES.includes(t.trim() as ArticleCategory)
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
  dryRun: 0,
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
  const filepath = path.join(NEWS_DIR, filename);

  if (skipExistingArg && fs.existsSync(filepath)) {
    console.log(
      dryRunArg
        ? `  [DRY RUN] Would skip (already exists): ${filename}`
        : `  ⏭️  Skipped (already exists): ${filename}`
    );
    return false;
  }

  if (dryRunArg) {
    console.log(`  [DRY RUN] Would write: ${filename}`);
    return false;
  }

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
 * @returns Whether the article was written successfully
 */
function writeSingleArticle(html: string, slug: string, lang: string): boolean {
  const filename = `${slug}-${lang}.html`;
  const written = writeArticle(html, filename);
  if (written) {
    stats.generated += 1;
    stats.articles.push(filename);
  } else if (skipExistingArg && fs.existsSync(path.join(NEWS_DIR, filename))) {
    stats.skipped += 1;
  } else if (dryRunArg) {
    stats.dryRun += 1;
  }
  return written;
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
    questions: parseQuestions(questions),
  };
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

    let writtenCount = 0;
    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      const watchSection = buildWhatToWatchSection(weekData.pipeline, [], lang);
      const baseContent = buildWeekAheadContent(weekData, dateRange, lang);
      let content = baseContent;
      if (watchSection) {
        const lastDiv = baseContent.lastIndexOf('</div>');
        content =
          lastDiv !== -1
            ? baseContent.slice(0, lastDiv) + watchSection + baseContent.slice(lastDiv)
            : `${baseContent}${watchSection}`;
      }
      const titleGenerator = getLocalizedString(WEEK_AHEAD_TITLES, lang);
      const langTitles = titleGenerator(dateRange.start, dateRange.end);

      const html = generateArticleHTML({
        slug: ARTICLE_TYPE_WEEK_AHEAD,
        title: langTitles.title,
        subtitle: langTitles.subtitle,
        date: today.toISOString().split('T')[0]!,
        category: ArticleCategory.WEEK_AHEAD,
        readTime: calculateReadTime(content),
        lang,
        content,
        keywords,
        sources: [],
      });

      if (writeSingleArticle(html, slug, lang)) {
        writtenCount++;
        console.log(`  ✅ ${lang.toUpperCase()} version generated`);
      }
    }

    console.log(
      writtenCount > 0
        ? `  ✅ Week Ahead article generated: ${writtenCount}/${languages.length} language(s) written`
        : `  ✅ Week Ahead article generation completed: 0 files written (dry-run or all files skipped)`
    );
    return { success: true, files: writtenCount, slug };
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
 * Safely parse a JSON string and extract a named array property.
 *
 * @param raw - Raw JSON string (empty string returns [])
 * @param key - Property name to extract as array
 * @returns Extracted array, or empty array on parse error or missing key
 */
function parseRawJsonArray(raw: string, key: string): unknown[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return [];
    }
    const data = parsed as Record<string, unknown>;
    const value = data[key];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
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
    const [anomalyRaw, coalitionRaw, reportRaw] = await Promise.all([
      fetchVotingAnomalies(),
      fetchCoalitionDynamics(),
      fetchVotingReport(),
    ]);

    const anomalies = parseRawJsonArray(anomalyRaw, 'anomalies')
      .map((a) => scoreVotingAnomaly(a))
      .filter((a): a is VotingAnomalyIntelligence => a !== null);

    const coalitions = parseRawJsonArray(coalitionRaw, 'coalitions')
      .map((c) => analyzeCoalitionCohesion(c))
      .filter((c): c is CoalitionIntelligence => c !== null);

    let writtenCount = 0;
    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      const content = buildBreakingNewsContent(
        dateStr,
        anomalyRaw,
        coalitionRaw,
        reportRaw,
        '',
        lang,
        anomalies,
        coalitions,
        []
      );

      const titleGenerator = getLocalizedString(BREAKING_NEWS_TITLES, lang);
      const langTitles = titleGenerator(dateStr);

      const readTime = calculateReadTime(content);

      const html = generateArticleHTML({
        slug: ARTICLE_TYPE_BREAKING,
        title: langTitles.title,
        subtitle: langTitles.subtitle,
        date: dateStr,
        category: ArticleCategory.BREAKING_NEWS,
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
        writtenCount++;
        console.log(`  ✅ ${lang.toUpperCase()} version generated`);
      }
    }

    console.log(
      writtenCount > 0
        ? `  ✅ Breaking News article generated: ${writtenCount}/${languages.length} language(s) written`
        : `  ✅ Breaking News article generation completed: 0 files written (dry-run or all files skipped)`
    );
    return { success: true, files: writtenCount, slug };
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

    let writtenCount = 0;
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
        slug: ARTICLE_TYPE_COMMITTEE_REPORTS,
        title: langTitles.title,
        subtitle: langTitles.subtitle,
        date: dateStr,
        category: ArticleCategory.COMMITTEE_REPORTS,
        readTime: calculateReadTime(content),
        lang,
        content,
        keywords: ['committee', 'EU Parliament', 'legislation'],
        sources,
      });

      if (writeSingleArticle(html, slug, lang)) {
        writtenCount++;
        console.log(`  ✅ ${lang.toUpperCase()} version generated`);
      }
    }

    console.log(
      `  ✅ Committee reports generation completed: ${writtenCount}/${languages.length} languages written`
    );
    return { success: true, files: writtenCount, slug };
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

    let writtenCount = 0;
    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      const langTitles = getLocalizedString(PROPOSITIONS_TITLES, lang)();
      const strings = getLocalizedString(PROPOSITIONS_STRINGS, lang);

      const content = buildPropositionsContent(
        proposalsHtml,
        pipelineData,
        procedureHtml,
        strings,
        lang
      );
      const readTime = calculateReadTime(content);

      const html = generateArticleHTML({
        slug: ARTICLE_TYPE_PROPOSITIONS,
        title: langTitles.title,
        subtitle: langTitles.subtitle,
        date: today.toISOString().split('T')[0]!,
        category: ArticleCategory.PROPOSITIONS,
        readTime,
        lang,
        content,
        keywords: [KEYWORD_EUROPEAN_PARLIAMENT, 'legislation', 'proposals', 'procedure', 'OLP'],
        sources: [],
      });

      if (writeSingleArticle(html, slug, lang)) {
        writtenCount++;
        console.log(`  ✅ ${lang.toUpperCase()} version generated`);
      }
    }

    console.log(
      writtenCount > 0
        ? `  ✅ Propositions article generated: ${writtenCount}/${languages.length} language(s) written`
        : `  ✅ Propositions article generation completed: 0 files written (dry-run or all files skipped)`
    );
    return { success: true, files: writtenCount, slug };
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

    let writtenCount = 0;
    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      const titleGenerator = getLocalizedString(MOTIONS_TITLES, lang);
      const langTitles = titleGenerator(dateStr);

      const baseMotionsContent = generateMotionsContent(
        dateFromStr,
        dateStr,
        votingRecords,
        votingPatterns,
        anomalies,
        questions,
        lang
      );
      const alignmentSection = buildPoliticalAlignmentSection(votingRecords, [], lang);
      let content = baseMotionsContent;
      if (alignmentSection) {
        const lastDiv = baseMotionsContent.lastIndexOf('</div>');
        content =
          lastDiv !== -1
            ? baseMotionsContent.slice(0, lastDiv) +
              alignmentSection +
              baseMotionsContent.slice(lastDiv)
            : `${baseMotionsContent}${alignmentSection}`;
      }

      const readTime = calculateReadTime(content);

      const html = generateArticleHTML({
        slug: ARTICLE_TYPE_MOTIONS,
        title: langTitles.title,
        subtitle: langTitles.subtitle,
        date: dateStr,
        category: ArticleCategory.MOTIONS,
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
        writtenCount++;
        console.log(`  ✅ ${lang.toUpperCase()} version generated`);
      }
    }

    console.log(
      writtenCount > 0
        ? `  ✅ Motions article generated: ${writtenCount}/${languages.length} language(s) written`
        : `  ✅ Motions article generation completed: 0 files written (dry-run or all files skipped)`
    );
    return { success: true, files: writtenCount, slug };
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
      if (!VALID_ARTICLE_CATEGORIES.includes(articleType as ArticleCategory)) {
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
    if (dryRunArg) console.log(`  🔍 Dry run: ${stats.dryRun} articles`);
    console.log(`  ❌ Errors: ${stats.errors}`);
    console.log('');

    // Write metadata
    const metadata = {
      timestamp: stats.timestamp,
      generated: stats.generated,
      skipped: stats.skipped,
      dryRun: stats.dryRun,
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
