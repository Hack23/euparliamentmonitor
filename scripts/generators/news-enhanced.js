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
import { NEWS_DIR, METADATA_DIR, VALID_ARTICLE_TYPES, ARTICLE_TYPE_WEEK_AHEAD, ARG_SEPARATOR, } from '../constants/config.js';
import { ALL_LANGUAGES, LANGUAGE_PRESETS, WEEK_AHEAD_TITLES, getLocalizedString, isSupportedLanguage, } from '../constants/languages.js';
import { generateArticleHTML } from '../templates/article-template.js';
import { getEPMCPClient, closeEPMCPClient } from '../mcp/ep-mcp-client.js';
import { formatDateForSlug, calculateReadTime, ensureDirectoryExists, escapeHTML, } from '../utils/file-utils.js';
// Try to use MCP client if available
let mcpClient = null;
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
if (LANGUAGE_PRESETS[languagesInput]) {
    languagesInput = LANGUAGE_PRESETS[languagesInput].join(',');
}
const languages = languagesInput
    .split(',')
    .map((l) => l.trim())
    .filter((l) => isSupportedLanguage(l));
if (languages.length === 0) {
    console.error('❌ No valid language codes provided. Valid codes:', ALL_LANGUAGES.join(', '));
    process.exit(1);
}
// Validate article types
const invalidTypes = articleTypes.filter((t) => !VALID_ARTICLE_TYPES.includes(t.trim()));
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
const stats = {
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
function getWeekAheadDateRange() {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
    };
}
/**
 * Write article to file
 *
 * @param html - HTML content
 * @param filename - Output filename
 * @returns Success status
 */
function writeArticle(html, filename) {
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
function writeSingleArticle(html, slug, lang) {
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
async function initializeMCPClient() {
    if (!useMCP) {
        console.log('ℹ️ MCP client disabled via USE_EP_MCP=false');
        return null;
    }
    try {
        console.log('🔌 Attempting to connect to European Parliament MCP Server...');
        mcpClient = await getEPMCPClient();
        console.log('✅ MCP client connected successfully');
        return mcpClient;
    }
    catch (error) {
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
async function fetchEvents(dateRange) {
    if (mcpClient) {
        try {
            console.log('  📡 Fetching events from MCP server...');
            const result = await mcpClient.getPlenarySessions({
                startDate: dateRange.start,
                endDate: dateRange.end,
                limit: 50,
            });
            if (result?.content?.[0]) {
                const data = JSON.parse(result.content[0].text);
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
        }
        catch (error) {
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
async function generateWeekAhead() {
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
                .map((event) => `
              <div class="event-item">
                <div class="event-date">${escapeHTML(event.date)}</div>
                <div class="event-details">
                  <h3>${escapeHTML(event.title)}</h3>
                  <p class="event-type">${escapeHTML(event.type)}</p>
                  <p>${escapeHTML(event.description)}</p>
                </div>
              </div>
            `)
                .join('')}
          </section>
        </div>
      `;
            const readTime = calculateReadTime(content);
            const html = generateArticleHTML({
                slug: `${slug}-${lang}.html`,
                title: langTitles.title,
                subtitle: langTitles.subtitle,
                date: today.toISOString().split('T')[0],
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
    }
    catch (error) {
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
async function main() {
    console.log('');
    console.log('🚀 Starting news generation...');
    console.log('');
    try {
        await initializeMCPClient();
        const results = [];
        for (const articleType of articleTypes) {
            if (!VALID_ARTICLE_TYPES.includes(articleType)) {
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
    }
    finally {
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
//# sourceMappingURL=news-enhanced.js.map