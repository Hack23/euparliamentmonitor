#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module scripts/scrape-doceo-votes
 * @description DOCEO XML scraper for European Parliament roll-call vote data.
 *
 * The EP MCP `get_latest_votes` tool has a 4–6 week publication lag because
 * the Open Data API feed is populated well after each plenary. This script
 * fetches the DOCEO XML documents directly, which are typically available
 * within 24–48 hours of a plenary sitting.
 *
 * DOCEO XML URL pattern (term 10, 2024–present):
 *   https://www.europarl.europa.eu/doceo/document/PV-10-{YYYY-MM-DD}-RCV_EN.xml
 *
 * Rate limiting: 1 request/second ceiling; each call sleeps 1 s after
 * completion to respect the EP's robots.txt directive.
 *
 * Publication-lag detection: a 404 response is treated as "not yet
 * published" (publication lag), not as a hard error. The output JSON
 * includes a `publicationLag` flag so callers can distinguish missing
 * data from an error condition.
 *
 * Retry policy: up to 3 retries with exponential backoff
 * (1 s / 2 s / 4 s) for transient network failures (non-404).
 *
 * Output: `<outputDir>/roll-call-votes.json` (canonical data file)
 *
 * Invocation:
 *   node scripts/scrape-doceo-votes.js --date 2026-05-14 --slug breaking \
 *     [--output-dir analysis/daily/2026-05-14/breaking/data] \
 *     [--term 10] [--dry-run]
 *
 * Exports (for unit testing):
 *   buildDoceoUrl(date, term)
 *   parseDoceoXml(xmlText)
 *   scrapeDoceoVotes(options)
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

/** Current EP parliamentary term. */
const EP_CURRENT_TERM = 10;

/** Rate-limit inter-request delay (ms). */
const RATE_LIMIT_MS = 1_000;

/** Default retry policy. */
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 1_000;

/** Output filename written to the data directory. */
const OUTPUT_FILENAME = 'roll-call-votes.json';

// ---------------------------------------------------------------------------
// URL construction
// ---------------------------------------------------------------------------

/**
 * Build the canonical DOCEO RCV XML URL for a given plenary date and EP term.
 *
 * @param {string} date  - ISO date string (YYYY-MM-DD)
 * @param {number} [term] - EP parliamentary term number (default: 10)
 * @returns {string} Full DOCEO XML URL
 */
export function buildDoceoUrl(date, term = EP_CURRENT_TERM) {
  return `https://www.europarl.europa.eu/doceo/document/PV-${term}-${date}-RCV_EN.xml`;
}

// ---------------------------------------------------------------------------
// XML parsing
// ---------------------------------------------------------------------------

/**
 * Extract all text occurrences of a simple XML tag from a source string.
 * Only works for non-nested, single-line tag content.
 *
 * @param {string} xml  - Source XML text
 * @param {string} tag  - Tag name (without `<` / `>`)
 * @returns {string[]} Array of matched text content strings
 */
function extractTagContents(xml, tag) {
  const results = [];
  const openTag = `<${tag}`;
  const closeTag = `</${tag}>`;
  let searchFrom = 0;

  while (searchFrom < xml.length) {
    const start = xml.indexOf(openTag, searchFrom);
    if (start === -1) break;

    // Find the end of the opening tag (could have attributes)
    const openEnd = xml.indexOf('>', start);
    if (openEnd === -1) break;

    // Self-closing tag — skip
    if (xml[openEnd - 1] === '/') {
      searchFrom = openEnd + 1;
      continue;
    }

    const contentStart = openEnd + 1;
    const contentEnd = xml.indexOf(closeTag, contentStart);
    if (contentEnd === -1) {
      searchFrom = openEnd + 1;
      continue;
    }

    results.push(xml.slice(contentStart, contentEnd).trim());
    searchFrom = contentEnd + closeTag.length;
  }

  return results;
}

/**
 * Extract the value of a named XML attribute from a tag string.
 *
 * @param {string} tagStr - The full opening tag (e.g. `<Result.For Total="45">`)
 * @param {string} attr   - Attribute name
 * @returns {string} Attribute value, or empty string if not found
 */
function extractAttr(tagStr, attr) {
  const prefix = `${attr}="`;
  const startIdx = tagStr.indexOf(prefix);
  if (startIdx === -1) return '';
  const valueStart = startIdx + prefix.length;
  const valueEnd = tagStr.indexOf('"', valueStart);
  if (valueEnd === -1) return '';
  return tagStr.slice(valueStart, valueEnd);
}

/**
 * Parse a DOCEO RCV XML document into a structured votes object.
 *
 * Returns a `{ votes: VoteRecord[], parsedAt: string }` object.
 *
 * Each `VoteRecord` has:
 *   - `id`:          string   — DOCEO vote identifier
 *   - `description`: string   — Vote title / description text
 *   - `date`:        string   — Vote date (YYYY-MM-DD from XML attribute)
 *   - `method`:      string   — Vote method (e.g. "secret", "roll-call")
 *   - `for`:         number   — Total votes For
 *   - `against`:     number   — Total votes Against
 *   - `abstention`:  number   — Total votes Abstention
 *   - `membersFor`:  string[] — MEP names voting For (from RCV XML)
 *   - `membersAgainst`: string[] — MEP names voting Against
 *   - `membersAbstention`: string[] — MEP names Abstaining
 *
 * @param {string} xmlText - Raw XML string from DOCEO
 * @returns {{ votes: object[], parsedAt: string, voteCount: number }}
 */
export function parseDoceoXml(xmlText) {
  const votes = [];
  const parsedAt = new Date().toISOString();

  // Split on RollCallVote.Result blocks (note trailing space to avoid matching RollCallVote.Results)
  const blockOpen = '<RollCallVote.Result ';
  const blockClose = '</RollCallVote.Result>';

  let pos = 0;
  while (pos < xmlText.length) {
    const blockStart = xmlText.indexOf(blockOpen, pos);
    if (blockStart === -1) break;

    const blockEnd = xmlText.indexOf(blockClose, blockStart);
    if (blockEnd === -1) break;

    const block = xmlText.slice(blockStart, blockEnd + blockClose.length);

    // Extract attributes from the opening tag
    const openTagEnd = block.indexOf('>');
    const openTag = block.slice(0, openTagEnd + 1);

    const id = extractAttr(openTag, 'Identifier');
    const date = extractAttr(openTag, 'Date');
    const method = extractAttr(openTag, 'Method');

    // Description text
    const descriptions = extractTagContents(block, 'RollCallVote.Description.Text');
    const description = descriptions.length > 0 ? descriptions[0] : '';

    // For / Against / Abstention totals
    const forTotal = _extractGroupTotal(block, 'Result.For');
    const againstTotal = _extractGroupTotal(block, 'Result.Against');
    const abstentionTotal = _extractGroupTotal(block, 'Result.Abstention');

    // MEP names (for roll-call transparency)
    const membersFor = _extractMemberNames(block, 'Result.For');
    const membersAgainst = _extractMemberNames(block, 'Result.Against');
    const membersAbstention = _extractMemberNames(block, 'Result.Abstention');

    votes.push({
      id,
      description,
      date,
      method,
      for: forTotal,
      against: againstTotal,
      abstention: abstentionTotal,
      membersFor,
      membersAgainst,
      membersAbstention,
    });

    pos = blockEnd + blockClose.length;
  }

  return { votes, parsedAt, voteCount: votes.length };
}

/**
 * Extract the Total attribute from a Result.For/Against/Abstention section.
 *
 * @param {string} block     - The full RollCallVote.Result XML block
 * @param {string} sectionTag - Section tag name (e.g. "Result.For")
 * @returns {number} Parsed integer total, or 0 if not found
 */
function _extractGroupTotal(block, sectionTag) {
  const openTag = `<${sectionTag}`;
  const startIdx = block.indexOf(openTag);
  if (startIdx === -1) return 0;
  const tagEnd = block.indexOf('>', startIdx);
  if (tagEnd === -1) return 0;
  const tagContent = block.slice(startIdx, tagEnd + 1);
  const totalStr = extractAttr(tagContent, 'Total');
  const parsed = parseInt(totalStr, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Extract Member.Name text nodes from a vote result section.
 *
 * @param {string} block     - The full RollCallVote.Result XML block
 * @param {string} sectionTag - Section tag name (e.g. "Result.For")
 * @returns {string[]} Array of MEP display names
 */
function _extractMemberNames(block, sectionTag) {
  const openTag = `<${sectionTag}`;
  const closeTag = `</${sectionTag}>`;

  const startIdx = block.indexOf(openTag);
  if (startIdx === -1) return [];
  const endIdx = block.indexOf(closeTag, startIdx);
  if (endIdx === -1) return [];

  const section = block.slice(startIdx, endIdx + closeTag.length);
  return extractTagContents(section, 'Member.Name');
}

// ---------------------------------------------------------------------------
// HTTP fetch with retry
// ---------------------------------------------------------------------------

/**
 * Sleep for `ms` milliseconds.
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a URL with exponential-backoff retry.
 *
 * A 404 response is NOT retried — it signals publication lag and is returned
 * as a distinct non-error result so callers can branch on `publicationLag`.
 *
 * @param {string} url
 * @param {{ maxRetries?: number, baseDelayMs?: number, fetchImpl?: Function }} [options]
 * @returns {Promise<{ ok: boolean, status: number, text: string|null, publicationLag: boolean }>}
 */
export async function fetchWithRetry(url, options = {}) {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const fetchFn = options.fetchImpl ?? fetch;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await sleep(delay);
    }

    try {
      const resp = await fetchFn(url, {
        headers: {
          'User-Agent': 'euparliamentmonitor/0.9.0 (+https://github.com/Hack23/euparliamentmonitor)',
          'Accept': 'application/xml, text/xml, */*;q=0.8',
        },
      });

      // 404 = publication lag — do not retry
      if (resp.status === 404) {
        return { ok: false, status: 404, text: null, publicationLag: true };
      }

      if (resp.ok) {
        const text = await resp.text();
        return { ok: true, status: resp.status, text, publicationLag: false };
      }

      // Non-404 error — fall through to retry
      lastError = new Error(`HTTP ${resp.status} from ${url}`);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url} after ${maxRetries + 1} attempts`);
}

// ---------------------------------------------------------------------------
// Main scraper
// ---------------------------------------------------------------------------

/**
 * Scrape DOCEO roll-call vote XML for one plenary date and write the result.
 *
 * @param {{
 *   date: string,
 *   outputDir: string,
 *   term?: number,
 *   dryRun?: boolean,
 *   fetchImpl?: Function,
 *   rateLimitMs?: number
 * }} options
 * @returns {Promise<{
 *   success: boolean,
 *   publicationLag: boolean,
 *   outputFile: string|null,
 *   voteCount: number,
 *   url: string,
 *   error?: string
 * }>}
 */
export async function scrapeDoceoVotes(options) {
  const {
    date,
    outputDir,
    term = EP_CURRENT_TERM,
    dryRun = false,
    fetchImpl,
    rateLimitMs = RATE_LIMIT_MS,
    retryBaseDelayMs,
  } = options;

  const url = buildDoceoUrl(date, term);

  const retryOptions = { fetchImpl };
  if (retryBaseDelayMs !== undefined) {
    retryOptions.baseDelayMs = retryBaseDelayMs;
  }

  let fetchResult;
  try {
    fetchResult = await fetchWithRetry(url, retryOptions);
  } catch (err) {
    return {
      success: false,
      publicationLag: false,
      outputFile: null,
      voteCount: 0,
      url,
      error: String(err),
    };
  }

  if (fetchResult.publicationLag) {
    return {
      success: false,
      publicationLag: true,
      outputFile: null,
      voteCount: 0,
      url,
      error: 'Publication lag — DOCEO XML not yet available for this date (HTTP 404)',
    };
  }

  const parsed = parseDoceoXml(fetchResult.text ?? '');

  const outputFile = path.join(outputDir, OUTPUT_FILENAME);

  const outputPayload = {
    date,
    term,
    url,
    scrapedAt: parsed.parsedAt,
    voteCount: parsed.voteCount,
    publicationLag: false,
    votes: parsed.votes,
  };

  if (!dryRun) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(outputPayload, null, 2), 'utf8');
  }

  // Rate-limit: sleep after write before returning
  await sleep(rateLimitMs);

  return {
    success: true,
    publicationLag: false,
    outputFile: dryRun ? null : outputFile,
    voteCount: parsed.voteCount,
    url,
  };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

/**
 * Parse minimalist `--key value` CLI args from argv.
 *
 * @param {string[]} argv
 * @returns {Record<string, string|boolean>}
 */
/* c8 ignore start */
function parseArgs(argv) {
  const out = {};
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out[key] = true;
        i += 1;
      } else {
        out[key] = next;
        i += 2;
      }
    } else {
      i += 1;
    }
  }
  return out;
}

/**
 * CLI main entry point.
 *
 * @param {string[]} [argv]
 * @returns {Promise<void>}
 */
export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  if (!args.date || typeof args.date !== 'string') {
    process.stderr.write('Usage: node scripts/scrape-doceo-votes.js --date YYYY-MM-DD [--slug <slug>] [--output-dir <dir>] [--term <N>] [--dry-run]\n');
    process.exit(2);
  }

  const date = String(args.date);
  const slug = args.slug ? String(args.slug) : 'unknown';
  const term = args.term ? parseInt(String(args.term), 10) : EP_CURRENT_TERM;
  const dryRun = args['dry-run'] === true;
  const outputDir = args['output-dir']
    ? String(args['output-dir'])
    : path.join(process.cwd(), 'analysis', 'daily', date, slug, 'data');

  const result = await scrapeDoceoVotes({ date, outputDir, term, dryRun });

  if (result.publicationLag) {
    process.stdout.write(
      JSON.stringify({ status: 'publication-lag', url: result.url, date, term }) + '\n',
    );
    process.exit(0);
  }

  if (!result.success) {
    process.stderr.write(`Error: ${result.error ?? 'unknown'}\n`);
    process.exit(1);
  }

  process.stdout.write(
    JSON.stringify({
      status: 'ok',
      voteCount: result.voteCount,
      outputFile: result.outputFile,
      url: result.url,
    }) + '\n',
  );
}

// Standard ESM CLI guard — only run main() when this file is the entry point.
const isMain =
  typeof process !== 'undefined' &&
  process.argv[1] !== undefined &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/scrape-doceo-votes.js'));

if (isMain) {
  main().catch((err) => {
    process.stderr.write(`Fatal: ${err}\n`);
    process.exit(1);
  });
}
/* c8 ignore stop */
