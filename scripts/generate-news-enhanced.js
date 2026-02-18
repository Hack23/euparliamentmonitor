#!/usr/bin/env node

// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Intelligence Operations/Automated News Generation
 * @category Intelligence Operations - Automated Intelligence Reporting
 *
 * @description
 * Core automated intelligence reporting workflow for European Parliament monitoring.
 * Generates multi-language news articles about EU Parliament activities.
 *
 * @author Hack23 AB - Intelligence Operations Team
 * @license Apache-2.0
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateArticleHTML } from './article-template.js';
import { getEPMCPClient, closeEPMCPClient } from './ep-mcp-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to use MCP client if available
let mcpClient = null;
const useMCP = process.env.USE_EP_MCP !== 'false'; // Enable by default

// Parse command line arguments
const args = process.argv.slice(2);
const ARG_SEPARATOR = '=';
const ARTICLE_TYPE_WEEK_AHEAD = 'week-ahead';
const typesArg = args.find((arg) => arg.startsWith('--types='));
const languagesArg = args.find((arg) => arg.startsWith('--languages='));
const dryRunArg = args.includes('--dry-run');

// Valid article types
const VALID_ARTICLE_TYPES = [
  ARTICLE_TYPE_WEEK_AHEAD,
  'committee-reports',
  'propositions',
  'motions',
  'breaking',
];

const articleTypes = typesArg
  ? typesArg
      .split(ARG_SEPARATOR)[1]
      .split(',')
      .map((t) => t.trim())
  : [ARTICLE_TYPE_WEEK_AHEAD];

// Language preset expansion
const ALL_LANGUAGES = [
  'en',
  'de',
  'fr',
  'es',
  'it',
  'nl',
  'pl',
  'pt',
  'ro',
  'sv',
  'da',
  'fi',
  'el',
  'hu',
];
const LANGUAGE_PRESETS = {
  all: ALL_LANGUAGES,
  'eu-core': ['en', 'de', 'fr', 'es', 'it', 'nl'],
  nordic: ['en', 'sv', 'da', 'fi'],
};

let languagesInput = languagesArg
  ? languagesArg.split(ARG_SEPARATOR)[1].trim().toLowerCase()
  : 'en';

// Expand presets (after trimming and normalizing)
if (LANGUAGE_PRESETS[languagesInput]) {
  languagesInput = LANGUAGE_PRESETS[languagesInput].join(',');
}

const languages = languagesInput
  .split(',')
  .map((l) => l.trim())
  .filter((l) => ALL_LANGUAGES.includes(l));

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

// Configuration
const NEWS_DIR = path.join(__dirname, '..', 'news');
const METADATA_DIR = path.join(NEWS_DIR, 'metadata');

// Ensure directories exist
if (!fs.existsSync(METADATA_DIR)) {
  fs.mkdirSync(METADATA_DIR, { recursive: true });
}

// Generation statistics
const stats = {
  generated: 0,
  errors: 0,
  articles: [],
  timestamp: new Date().toISOString(),
};

/**
 * Get date range for Week Ahead (next 7 days)
 * @returns {object} Date range with start and end dates
 */
function getWeekAheadDateRange() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 1); // Tomorrow

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7); // +7 days

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
}

/**
 * Format date for article slug
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
function formatDateForSlug(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * Write article to file
 * @param {string} html - HTML content
 * @param {string} filename - Output filename
 * @returns {boolean} Success status
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
 * @param {string} html - HTML content
 * @param {string} slug - Article slug
 * @param {string} lang - Language code
 * @returns {Promise<string>} Generated filename
 */
async function writeSingleArticle(html, slug, lang) {
  const filename = `${slug}-${lang}.html`;
  await writeArticle(html, filename);
  stats.generated += 1;
  stats.articles.push(filename);
  return filename;
}

/**
 * Initialize MCP client if available
 * @returns {Promise<object|null>} MCP client instance or null
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
  } catch (error) {
    console.warn('⚠️ Could not connect to MCP server:', error.message);
    console.warn('⚠️ Falling back to placeholder content');
    return null;
  }
}

/**
 * Fetch events from MCP server or use fallback
 * @param {object} dateRange - Date range with start and end dates
 * @returns {Promise<Array>} Array of events
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

      // Parse MCP response
      if (result && result.content && result.content[0]) {
        const data = JSON.parse(result.content[0].text);
        if (data.sessions && data.sessions.length > 0) {
          console.log(`  ✅ Fetched ${data.sessions.length} sessions from MCP`);
          return data.sessions.map((s) => ({
            date: s.date || dateRange.start,
            title: s.title || 'Parliamentary Session',
            type: s.type || 'Session',
            description: s.description || '',
          }));
        }
      }
    } catch (error) {
      console.warn('  ⚠️ MCP fetch failed:', error.message);
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
 * Calculate read time estimate
 * @param {string} content - Article content
 * @returns {number} Estimated read time in minutes
 */
function calculateReadTime(content) {
  const wordsPerMinute = 250;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate Week Ahead article in specified languages
 * @returns {Promise<void>}
 */
async function generateWeekAhead() {
  console.log('📅 Generating Week Ahead article...');

  try {
    const dateRange = getWeekAheadDateRange();

    console.log(`  📆 Date range: ${dateRange.start} to ${dateRange.end}`);

    const today = new Date();
    const slug = `${formatDateForSlug(today)}-${ARTICLE_TYPE_WEEK_AHEAD}`;

    // Fetch events from MCP server or use fallback
    const sampleEvents = await fetchEvents(dateRange);

    // Generate for each requested language
    for (const lang of languages) {
      console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

      // Language-specific titles
      const titles = {
        en: {
          title: `Week Ahead: ${dateRange.start} to ${dateRange.end}`,
          subtitle: `European Parliament calendar, committee meetings, and plenary debates for the coming week`,
        },
        de: {
          title: `Woche Voraus: ${dateRange.start} bis ${dateRange.end}`,
          subtitle: `Europäischer Parlamentskalender, Ausschusssitzungen und Plenardebatten für die kommende Woche`,
        },
        fr: {
          title: `Semaine à Venir: ${dateRange.start} au ${dateRange.end}`,
          subtitle: `Calendrier du Parlement européen, réunions de commission et débats pléniers pour la semaine à venir`,
        },
        es: {
          title: `Semana Próxima: ${dateRange.start} a ${dateRange.end}`,
          subtitle: `Calendario del Parlamento Europeo, reuniones de comisión y debates plenarios para la próxima semana`,
        },
        it: {
          title: `Settimana Prossima: ${dateRange.start} a ${dateRange.end}`,
          subtitle: `Calendario del Parlamento europeo, riunioni di commissione e dibattiti plenari per la prossima settimana`,
        },
        nl: {
          title: `Week Vooruit: ${dateRange.start} tot ${dateRange.end}`,
          subtitle: `Europees Parlement kalender, commissievergaderingen en plenaire debatten voor de komende week`,
        },
        pl: {
          title: `Nadchodzący Tydzień: ${dateRange.start} do ${dateRange.end}`,
          subtitle: `Kalendarz Parlamentu Europejskiego, posiedzenia komisji i debaty plenarne na nadchodzący tydzień`,
        },
        pt: {
          title: `Semana Próxima: ${dateRange.start} a ${dateRange.end}`,
          subtitle: `Calendário do Parlamento Europeu, reuniões de comissão e debates plenários para a próxima semana`,
        },
        ro: {
          title: `Săptămâna Viitoare: ${dateRange.start} până ${dateRange.end}`,
          subtitle: `Calendarul Parlamentului European, întâlniri ale comisiilor și dezbateri plenare pentru săptămâna viitoare`,
        },
        sv: {
          title: `Vecka Framåt: ${dateRange.start} till ${dateRange.end}`,
          subtitle: `Europaparlamentets kalender, utskottsmöten och plenardebatter för kommande vecka`,
        },
        da: {
          title: `Ugen Fremover: ${dateRange.start} til ${dateRange.end}`,
          subtitle: `Europa-Parlamentets kalender, udvalgsmøder og plenardebatter for den kommende uge`,
        },
        fi: {
          title: `Tuleva Viikko: ${dateRange.start} - ${dateRange.end}`,
          subtitle: `Euroopan parlamentin kalenteri, valiokuntien kokoukset ja täysistuntokeskustelut tulevalle viikolle`,
        },
        el: {
          title: `Επόμενη Εβδομάδα: ${dateRange.start} έως ${dateRange.end}`,
          subtitle: `Ημερολόγιο Ευρωπαϊκού Κοινοβουλίου, συνεδριάσεις επιτροπών και ολομέλειες για την επόμενη εβδομάδα`,
        },
        hu: {
          title: `Következő Hét: ${dateRange.start} - ${dateRange.end}`,
          subtitle: `Európai Parlament naptár, bizottsági ülések és plenáris viták a jövő hétre`,
        },
      };

      const langTitles = titles[lang] || titles.en;

      // Build content
      // TODO: In production, this content should be properly translated to the target language
      // Currently using placeholder English content for demonstration
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
                <div class="event-date">${event.date}</div>
                <div class="event-details">
                  <h3>${event.title}</h3>
                  <p class="event-type">${event.type}</p>
                  <p>${event.description}</p>
                </div>
              </div>
            `
              )
              .join('')}
          </section>
        </div>
      `;

      const readTime = calculateReadTime(content);

      // Generate HTML for this language
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

      // Write article
      await writeSingleArticle(html, slug, lang);
      console.log(`  ✅ ${lang.toUpperCase()} version generated`);
    }

    console.log('  ✅ Week Ahead article generated successfully in all requested languages');
    return { success: true, files: languages.length, slug };
  } catch (error) {
    console.error('❌ Error generating Week Ahead:', error.message);
    console.error('   Stack:', error.stack);
    stats.errors++;
    return { success: false, error: error.message };
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
    // Initialize MCP client
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
  } finally {
    // Clean up MCP client connection
    if (mcpClient) {
      console.log('🔌 Closing MCP client connection...');
      await closeEPMCPClient();
    }
  }

  process.exit(stats.errors > 0 ? 1 : 0);
}

main();
