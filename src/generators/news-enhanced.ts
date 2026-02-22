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
  PROPOSITIONS_TITLES,
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

/** Placeholder proposals HTML when MCP data is unavailable */
const PLACEHOLDER_PROPOSALS = `
        <div class="proposal-card">
          <h3>Proposal for a Regulation on Sustainable Finance Reporting</h3>
          <div class="proposal-meta">
            <span class="proposal-id">COM(2025)0001</span>
            <span class="proposal-status">Under Review</span>
          </div>
          <p class="proposal-committee">Committee: ECON</p>
        </div>
        <div class="proposal-card">
          <h3>Proposal for a Directive on Corporate Sustainability Due Diligence</h3>
          <div class="proposal-meta">
            <span class="proposal-id">COM(2025)0002</span>
            <span class="proposal-status">First Reading</span>
          </div>
          <p class="proposal-committee">Committee: JURI</p>
        </div>`;

/** Placeholder pipeline HTML when MCP data is unavailable */
const PLACEHOLDER_PIPELINE = `
        <div class="pipeline-metrics">
          <div class="metric">
            <span class="metric-label">Active Procedures</span>
            <span class="metric-value">42</span>
          </div>
          <div class="metric">
            <span class="metric-label">In Trilogue</span>
            <span class="metric-value">8</span>
          </div>
        </div>`;

/**
 * Fetch legislative proposals HTML from MCP server
 *
 * @returns HTML string for proposals list, or empty string if unavailable
 */
async function fetchProposalsFromMCP(): Promise<string> {
  if (!mcpClient) return '';
  const docsResult = await mcpClient.searchDocuments({
    keyword: 'regulation',
    documentType: 'REGULATION',
    limit: 10,
  });
  if (!docsResult?.content?.[0]) return '';
  const data = JSON.parse(docsResult.content[0].text) as {
    documents?: Array<{
      id?: string;
      title?: string;
      date?: string;
      status?: string;
      committee?: string;
      rapporteur?: string;
    }>;
  };
  if (!data.documents || data.documents.length === 0) return '';
  console.log(`  ✅ Fetched ${data.documents.length} proposals from MCP`);
  return data.documents
    .map(
      (doc) => `
      <div class="proposal-card">
        <h3>${escapeHTML(doc.title ?? 'Legislative Proposal')}</h3>
        <div class="proposal-meta">
          ${doc.id ? `<span class="proposal-id">${escapeHTML(doc.id)}</span>` : ''}
          ${doc.date ? `<span class="proposal-date">${escapeHTML(doc.date)}</span>` : ''}
          ${doc.status ? `<span class="proposal-status">${escapeHTML(doc.status)}</span>` : ''}
        </div>
        ${doc.committee ? `<p class="proposal-committee">Committee: ${escapeHTML(doc.committee)}</p>` : ''}
        ${doc.rapporteur ? `<p class="proposal-rapporteur">Rapporteur: ${escapeHTML(doc.rapporteur)}</p>` : ''}
      </div>`
    )
    .join('');
}

/**
 * Fetch legislative pipeline HTML from MCP server
 *
 * @returns HTML string for pipeline overview, or empty string if unavailable
 */
async function fetchPipelineFromMCP(): Promise<string> {
  if (!mcpClient) return '';
  const pipelineResult = await mcpClient.monitorLegislativePipeline({
    status: 'ACTIVE',
    limit: 5,
  });
  if (!pipelineResult?.content?.[0]) return '';
  const pipeData = JSON.parse(pipelineResult.content[0].text) as {
    pipelineHealthScore?: number;
    throughputRate?: number;
    procedures?: Array<{ id?: string; title?: string; stage?: string }>;
  };
  const healthScore = pipeData.pipelineHealthScore ?? 0;
  const throughput = pipeData.throughputRate ?? 0;
  const procRows =
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
  return `
    <div class="pipeline-metrics">
      <div class="metric">
        <span class="metric-label">Pipeline Health</span>
        <span class="metric-value">${escapeHTML(String(Math.round(healthScore * 100)))}%</span>
      </div>
      <div class="metric">
        <span class="metric-label">Throughput Rate</span>
        <span class="metric-value">${escapeHTML(String(throughput))}</span>
      </div>
    </div>
    ${procRows}`;
}

/**
 * Get proposals HTML content, falling back to placeholder when MCP unavailable
 *
 * @returns HTML string for proposals section
 */
async function getProposalsContent(): Promise<string> {
  try {
    console.log('  📡 Fetching legislative proposals from MCP server...');
    const content = await fetchProposalsFromMCP();
    if (content) return content;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('  ⚠️ MCP proposals fetch failed:', message);
  }
  console.log('  ℹ️ Using placeholder proposals content');
  return PLACEHOLDER_PROPOSALS;
}

/**
 * Get pipeline HTML content, falling back to placeholder when MCP unavailable
 *
 * @returns HTML string for pipeline section
 */
async function getPipelineContent(): Promise<string> {
  try {
    const content = await fetchPipelineFromMCP();
    if (content) return content;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('  ⚠️ MCP pipeline fetch failed:', message);
  }
  console.log('  ℹ️ Using placeholder pipeline content');
  return PLACEHOLDER_PIPELINE;
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

    const proposalsContent = await getProposalsContent();
    const pipelineContent = await getPipelineContent();

    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      const langTitles = getLocalizedString(PROPOSITIONS_TITLES, lang)();

      const content = `
        <div class="article-content">
          <section class="lede">
            <p>The European Parliament is actively processing multiple legislative proposals across key policy areas. This report tracks current proposals, their procedure status, and the overall legislative pipeline.</p>
          </section>

          <section class="proposals-list">
            <h2>Recent Legislative Proposals</h2>
            ${proposalsContent}
          </section>

          <section class="pipeline-status">
            <h2>Legislative Pipeline Overview</h2>
            ${pipelineContent}
          </section>

          <section class="analysis">
            <h2>Impact Assessment</h2>
            <p>Current legislative activity reflects Parliament's priorities in sustainable finance, digital governance, and environmental policy. Tracking these proposals helps citizens and stakeholders understand the EU's legislative trajectory.</p>
          </section>
        </div>
      `;

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
        keywords: ['European Parliament', 'legislation', 'proposals', 'procedure', 'OLP'],
        sources: [],
      });

      writeSingleArticle(html, slug, lang);
      console.log(`  ✅ ${lang.toUpperCase()} version generated`);
    }

    console.log('  ✅ Propositions article generated successfully in all requested languages');
    return { success: true, files: languages.length, slug };
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
        case 'propositions':
          results.push(await generatePropositions());
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
