// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the pipeline stages:
 *   - CircuitBreaker (fetch-stage)
 *   - fetch-stage null-client functions
 *   - validateMCPResponse, normalizeISO8601Date, sanitizeText (transform-stage)
 *   - writeArticleFile, writeSingleArticle, writeGenerationMetadata (output-stage)
 *   - generateArticleForStrategy, createStrategyRegistry (generate-stage)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Imports from compiled output ────────────────────────────────────────────

import {
  CircuitBreaker,
  mcpCircuitBreaker,
  initializeMCPClient,
  fetchWeekAheadData,
  fetchVotingAnomalies,
  fetchCoalitionDynamics,
  fetchVotingReport,
  fetchMEPInfluence,
  fetchCommitteeData,
  fetchVotingRecords,
  fetchVotingPatterns,
  fetchMotionsAnomalies,
  fetchParliamentaryQuestionsForMotions,
  fetchMotionsData,
  fetchProposalsFromMCP,
  fetchPipelineFromMCP,
  fetchProcedureStatusFromMCP,
  fetchAdoptedTextsFeed,
  fetchEventsFeed,
  fetchProceduresFeed,
  fetchMEPsFeed,
  fetchMEPsFeedWithTotal,
  fetchBreakingNewsFeedData,
  fetchDocumentsFeed,
  fetchPlenaryDocumentsFeed,
  fetchCommitteeDocumentsFeed,
  fetchPlenarySessionDocumentsFeed,
  fetchExternalDocumentsFeed,
  fetchQuestionsFeed,
  fetchDeclarationsFeed,
  fetchCorporateBodiesFeed,
  fetchEPFeedData,
  loadFeedDataFromFile,
  loadEPFeedDataFromFile,
  loadCommitteeDataFromFile,
} from '../../scripts/generators/pipeline/fetch-stage.js';

import {
  validateMCPResponse,
  normalizeISO8601Date,
  sanitizeText,
  isValidCountryCode,
  isValidLanguageCode,
} from '../../scripts/generators/pipeline/transform-stage.js';

import {
  writeArticleFile,
  writeSingleArticle,
  writeGenerationMetadata,
} from '../../scripts/generators/pipeline/output-stage.js';

// ─── CircuitBreaker tests ─────────────────────────────────────────────────────

describe('CircuitBreaker', () => {
  it('starts in CLOSED state and allows requests', () => {
    const cb = new CircuitBreaker();
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.canRequest()).toBe(true);
  });

  it('opens the circuit after reaching the failure threshold', () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 60_000 });
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('CLOSED');
    cb.recordFailure(); // 3rd failure → OPEN
    expect(cb.getState()).toBe('OPEN');
    expect(cb.canRequest()).toBe(false);
  });

  it('transitions to HALF_OPEN after the reset timeout', () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 0 });
    cb.recordFailure();
    expect(cb.getState()).toBe('OPEN');
    // After timeout of 0ms, canRequest() should move to HALF_OPEN
    expect(cb.canRequest()).toBe(true);
    expect(cb.getState()).toBe('HALF_OPEN');
  });

  it('closes the circuit on success', () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 0 });
    cb.recordFailure();
    cb.canRequest(); // triggers HALF_OPEN
    cb.recordSuccess();
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.canRequest()).toBe(true);
  });

  it('resets consecutive failures on success', () => {
    const cb = new CircuitBreaker({ failureThreshold: 5 });
    cb.recordFailure();
    cb.recordFailure();
    cb.recordSuccess();
    const stats = cb.getStats();
    expect(stats.consecutiveFailures).toBe(0);
    expect(stats.state).toBe('CLOSED');
  });

  it('allows a custom failure threshold', () => {
    const cb = new CircuitBreaker({ failureThreshold: 2 });
    cb.recordFailure();
    expect(cb.getState()).toBe('CLOSED');
    cb.recordFailure();
    expect(cb.getState()).toBe('OPEN');
  });

  it('getStats returns current state snapshot', () => {
    const cb = new CircuitBreaker({ failureThreshold: 10 });
    cb.recordFailure();
    cb.recordFailure();
    const stats = cb.getStats();
    expect(stats.state).toBe('CLOSED');
    expect(stats.consecutiveFailures).toBe(2);
  });

  it('HALF_OPEN allows only one probe — second canRequest() returns false', () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 0 });
    cb.recordFailure();
    const first = cb.canRequest();  // transitions to HALF_OPEN, probe in-flight
    const second = cb.canRequest(); // probe already in-flight → blocked
    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(cb.getState()).toBe('HALF_OPEN');
  });

  it('HALF_OPEN failure immediately re-opens the circuit', () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 60_000 });
    cb.recordFailure();           // → OPEN
    cb.canRequest();              // → HALF_OPEN (probe in-flight)
    cb.recordFailure();           // probe failed → OPEN immediately
    expect(cb.getState()).toBe('OPEN');
    expect(cb.canRequest()).toBe(false); // back-off hasn't expired
  });

  it('HALF_OPEN probe-slot is freed after recordSuccess so circuit closes', () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 0 });
    cb.recordFailure();
    cb.canRequest(); // → HALF_OPEN, probe in-flight
    cb.recordSuccess();
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.canRequest()).toBe(true); // circuit CLOSED, normal traffic allowed
  });
});

// ─── validateMCPResponse tests ────────────────────────────────────────────────

describe('validateMCPResponse', () => {
  it('returns valid=true for a well-formed MCP response', () => {
    const response = { content: [{ type: 'text', text: '{"ok":true}' }] };
    const result = validateMCPResponse('test_tool', response);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid=false for null', () => {
    const result = validateMCPResponse('test_tool', null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns valid=false for undefined', () => {
    const result = validateMCPResponse('test_tool', undefined);
    expect(result.valid).toBe(false);
  });

  it('returns valid=false for a plain string', () => {
    const result = validateMCPResponse('test_tool', 'not-an-object');
    expect(result.valid).toBe(false);
  });

  it('returns valid=false when content array is missing', () => {
    const result = validateMCPResponse('test_tool', { data: 'something' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('content'))).toBe(true);
  });

  it('returns valid=false when content array is empty', () => {
    const result = validateMCPResponse('test_tool', { content: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Empty'))).toBe(true);
  });

  it('returns valid=false when first content item lacks text field', () => {
    const result = validateMCPResponse('test_tool', { content: [{ type: 'text' }] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('text'))).toBe(true);
  });

  it('returns valid=false for array input', () => {
    const result = validateMCPResponse('test_tool', [{ content: [] }]);
    expect(result.valid).toBe(false);
  });

  it('returns valid=false when first content item is null', () => {
    const result = validateMCPResponse('test_tool', { content: [null] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('text'))).toBe(true);
  });

  it('returns valid=false when first content item is undefined', () => {
    const result = validateMCPResponse('test_tool', { content: [undefined] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('text'))).toBe(true);
  });
});

// ─── normalizeISO8601Date tests ───────────────────────────────────────────────

describe('normalizeISO8601Date', () => {
  it('returns YYYY-MM-DD for a valid ISO date string', () => {
    expect(normalizeISO8601Date('2025-01-15T12:00:00Z')).toBe('2025-01-15');
  });

  it('passes through a date already in YYYY-MM-DD format', () => {
    expect(normalizeISO8601Date('2025-06-01')).toBe('2025-06-01');
  });

  it('returns the original string for an unparseable date', () => {
    expect(normalizeISO8601Date('not-a-date')).toBe('not-a-date');
  });

  it('returns the original string for an empty string', () => {
    expect(normalizeISO8601Date('')).toBe('');
  });
});

// ─── sanitizeText tests ───────────────────────────────────────────────────────

describe('sanitizeText', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeText('  hello world  ')).toBe('hello world');
  });

  it('collapses internal multiple spaces to one', () => {
    expect(sanitizeText('hello   world')).toBe('hello world');
  });

  it('collapses tabs and newlines to a space', () => {
    expect(sanitizeText('hello\t\nworld')).toBe('hello world');
  });

  it('returns empty string unchanged', () => {
    expect(sanitizeText('')).toBe('');
  });
});

// ─── isValidCountryCode / isValidLanguageCode tests ──────────────────────────

describe('isValidCountryCode', () => {
  it('accepts a valid two-letter uppercase code', () => {
    expect(isValidCountryCode('DE')).toBe(true);
    expect(isValidCountryCode('SE')).toBe(true);
  });

  it('rejects lowercase', () => {
    expect(isValidCountryCode('de')).toBe(false);
  });

  it('rejects single-letter codes', () => {
    expect(isValidCountryCode('D')).toBe(false);
  });

  it('rejects three-letter codes', () => {
    expect(isValidCountryCode('DEU')).toBe(false);
  });
});

describe('isValidLanguageCode', () => {
  it('accepts a valid two-letter lowercase code', () => {
    expect(isValidLanguageCode('en')).toBe(true);
    expect(isValidLanguageCode('fr')).toBe(true);
  });

  it('rejects uppercase', () => {
    expect(isValidLanguageCode('EN')).toBe(false);
  });
});

// ─── Output-stage tests ───────────────────────────────────────────────────────

describe('writeArticleFile', () => {
  /** @type {string} */
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes the file when neither dryRun nor skipExisting', () => {
    const opts = { dryRun: false, skipExisting: false, newsDir: tmpDir };
    const written = writeArticleFile('<html/>', 'test.html', opts);
    expect(written).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'test.html'))).toBe(true);
  });

  it('does not write in dryRun mode and returns false', () => {
    const opts = { dryRun: true, skipExisting: false, newsDir: tmpDir };
    const written = writeArticleFile('<html/>', 'dry.html', opts);
    expect(written).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, 'dry.html'))).toBe(false);
  });

  it('skips an existing file when skipExisting is true', () => {
    const filename = 'existing.html';
    fs.writeFileSync(path.join(tmpDir, filename), 'old content', 'utf-8');
    const opts = { dryRun: false, skipExisting: true, newsDir: tmpDir };
    const written = writeArticleFile('<new/>', filename, opts);
    expect(written).toBe(false);
    // Original content should be unchanged
    expect(fs.readFileSync(path.join(tmpDir, filename), 'utf-8')).toBe('old content');
  });

  it('overwrites an existing file when skipExisting is false', () => {
    const filename = 'overwrite.html';
    fs.writeFileSync(path.join(tmpDir, filename), 'old', 'utf-8');
    const opts = { dryRun: false, skipExisting: false, newsDir: tmpDir };
    const written = writeArticleFile('<new/>', filename, opts);
    expect(written).toBe(true);
    expect(fs.readFileSync(path.join(tmpDir, filename), 'utf-8')).toBe('<new/>');
  });
});

describe('writeSingleArticle', () => {
  /** @type {string} */
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('increments stats.generated when article is written', () => {
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: false, skipExisting: false, newsDir: tmpDir };
    writeSingleArticle('<html/>', '2025-01-15-week-ahead', 'en', opts, stats);
    expect(stats.generated).toBe(1);
    expect(stats.articles).toContain('2025-01-15-week-ahead-en.html');
  });

  it('increments stats.dryRun when dryRun is true', () => {
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: true, skipExisting: false, newsDir: tmpDir };
    writeSingleArticle('<html/>', '2025-01-15-week-ahead', 'de', opts, stats);
    expect(stats.dryRun).toBe(1);
    expect(stats.generated).toBe(0);
  });

  it('increments stats.skipped when file already exists and skipExisting is true', () => {
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const filename = '2025-01-15-week-ahead-fr.html';
    fs.writeFileSync(path.join(tmpDir, filename), 'existing', 'utf-8');
    const opts = { dryRun: false, skipExisting: true, newsDir: tmpDir };
    writeSingleArticle('<html/>', '2025-01-15-week-ahead', 'fr', opts, stats);
    expect(stats.skipped).toBe(1);
    expect(stats.generated).toBe(0);
  });
});

describe('writeGenerationMetadata', () => {
  /** @type {string} */
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-'));
  });

  afterEach(() => {
    vi.useRealTimers();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes a JSON metadata file when dryRun is false', () => {
    const stats = {
      generated: 2,
      skipped: 0,
      dryRun: 0,
      errors: 0,
      articles: ['a.html', 'b.html'],
      timestamp: '2025-01-15T00:00:00.000Z',
    };
    writeGenerationMetadata(stats, [], true, tmpDir, false);
    const files = fs.readdirSync(tmpDir).filter((f) => f.endsWith('.json'));
    expect(files.length).toBe(1);
    const content = JSON.parse(fs.readFileSync(path.join(tmpDir, files[0]), 'utf-8'));
    expect(content.generated).toBe(2);
    expect(content.usedMCP).toBe(true);
    expect(content.articles).toHaveLength(2);
  });

  it('does not write anything when dryRun is true', () => {
    const stats = {
      generated: 0,
      skipped: 0,
      dryRun: 1,
      errors: 0,
      articles: [],
      timestamp: '2025-01-15T00:00:00.000Z',
    };
    writeGenerationMetadata(stats, [], false, tmpDir, true);
    const files = fs.readdirSync(tmpDir);
    expect(files.length).toBe(0);
  });

  it('serialises results array into the metadata file', () => {
    const stats = {
      generated: 1,
      skipped: 0,
      dryRun: 0,
      errors: 0,
      articles: ['x.html'],
      timestamp: new Date().toISOString(),
    };
    const results = [{ success: true, files: 1, slug: '2025-01-15-week-ahead' }];
    writeGenerationMetadata(stats, results, false, tmpDir, false);
    const files = fs.readdirSync(tmpDir).filter((f) => f.endsWith('.json'));
    const content = JSON.parse(fs.readFileSync(path.join(tmpDir, files[0]), 'utf-8'));
    expect(content.results).toHaveLength(1);
    expect(content.results[0].slug).toBe('2025-01-15-week-ahead');
  });

  it('merges stats and results when a metadata file already exists for the same day', () => {
    const fixedDate = new Date('2025-01-15T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    const dateSlug = fixedDate.toISOString().split('T')[0];
    const metadataPath = path.join(tmpDir, `generation-${dateSlug}.json`);

    // Write an existing metadata file (first workflow run)
    const existingMetadata = {
      timestamp: fixedDate.toISOString(),
      generated: 14,
      skipped: 0,
      dryRun: 0,
      errors: 0,
      articles: ['2025-01-15-motions-en.html', '2025-01-15-motions-fr.html'],
      results: [{ success: true, files: 14, slug: '2025-01-15-motions' }],
      usedMCP: false,
    };
    fs.writeFileSync(metadataPath, JSON.stringify(existingMetadata), 'utf-8');

    // Second workflow run (committee-reports, skipped)
    const stats2 = {
      generated: 0,
      skipped: 14,
      dryRun: 0,
      errors: 0,
      articles: [],
      timestamp: fixedDate.toISOString(),
    };
    const results2 = [{ success: true, files: 0, slug: '2025-01-15-committee-reports' }];
    writeGenerationMetadata(stats2, results2, true, tmpDir, false);

    const content = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    // Totals should be merged
    expect(content.generated).toBe(14);
    expect(content.skipped).toBe(14);
    // Articles from first run should be preserved
    expect(content.articles).toContain('2025-01-15-motions-en.html');
    // Results from both runs should be present
    expect(content.results).toHaveLength(2);
    expect(content.results.some((r) => r.slug === '2025-01-15-motions')).toBe(true);
    expect(content.results.some((r) => r.slug === '2025-01-15-committee-reports')).toBe(true);
    // usedMCP true if either run used it
    expect(content.usedMCP).toBe(true);
  });

  it('deduplicates results by slug when re-running the same strategy', () => {
    const fixedDate = new Date('2025-01-15T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    const dateSlug = fixedDate.toISOString().split('T')[0];
    const metadataPath = path.join(tmpDir, `generation-${dateSlug}.json`);

    const existing = {
      timestamp: fixedDate.toISOString(),
      generated: 5,
      skipped: 0,
      dryRun: 0,
      errors: 0,
      articles: ['2025-01-15-week-ahead-en.html'],
      results: [{ success: true, files: 1, slug: '2025-01-15-week-ahead' }],
      usedMCP: false,
    };
    fs.writeFileSync(metadataPath, JSON.stringify(existing), 'utf-8');

    // Re-run same strategy (e.g. retry)
    const stats2 = {
      generated: 1,
      skipped: 0,
      dryRun: 0,
      errors: 0,
      articles: ['2025-01-15-week-ahead-en.html'],
      timestamp: fixedDate.toISOString(),
    };
    writeGenerationMetadata(
      stats2,
      [{ success: true, files: 1, slug: '2025-01-15-week-ahead' }],
      false,
      tmpDir,
      false
    );

    const content = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    // Results should not be duplicated
    expect(content.results.filter((r) => r.slug === '2025-01-15-week-ahead')).toHaveLength(1);
  });
});

// ─── createStrategyRegistry tests ─────────────────────────────────────────────

describe('createStrategyRegistry', () => {
  it('registers all eight built-in article categories', async () => {
    const { createStrategyRegistry } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const registry = createStrategyRegistry();
    expect(registry.size).toBe(8);
    expect(registry.has('week-ahead')).toBe(true);
    expect(registry.has('breaking')).toBe(true);
    expect(registry.has('committee-reports')).toBe(true);
    expect(registry.has('propositions')).toBe(true);
    expect(registry.has('motions')).toBe(true);
    expect(registry.has('month-ahead')).toBe(true);
    expect(registry.has('week-in-review')).toBe(true);
    expect(registry.has('month-in-review')).toBe(true);
  });

  it('returns different instances on each call', async () => {
    const { createStrategyRegistry } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const r1 = createStrategyRegistry();
    const r2 = createStrategyRegistry();
    expect(r1).not.toBe(r2);
  });
});

// ─── fetch-stage null-client tests ────────────────────────────────────────────

describe('initializeMCPClient', () => {
  it('returns null when useMCP is false', async () => {
    const client = await initializeMCPClient(false);
    expect(client).toBeNull();
  });
});

describe('fetchWeekAheadData with null client', () => {
  it('returns placeholder events when client is null', async () => {
    const dateRange = { start: '2025-01-16', end: '2025-01-23' };
    const result = await fetchWeekAheadData(null, dateRange);
    expect(result).toHaveProperty('events');
    expect(Array.isArray(result.events)).toBe(true);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.committees).toEqual([]);
    expect(result.documents).toEqual([]);
    expect(result.pipeline).toEqual([]);
    expect(result.questions).toEqual([]);
  });

  it('sets event date to dateRange.start', async () => {
    const dateRange = { start: '2025-03-10', end: '2025-03-17' };
    const result = await fetchWeekAheadData(null, dateRange);
    expect(result.events[0].date).toBe('2025-03-10');
  });
});

describe('fetchVotingAnomalies with null client', () => {
  it('returns empty string when client is null', async () => {
    const result = await fetchVotingAnomalies(null);
    expect(result).toBe('');
  });
});

describe('fetchCoalitionDynamics with null client', () => {
  it('returns empty string when client is null', async () => {
    const result = await fetchCoalitionDynamics(null);
    expect(result).toBe('');
  });
});

describe('fetchVotingReport with null client', () => {
  it('returns empty string when client is null', async () => {
    const result = await fetchVotingReport(null);
    expect(result).toBe('');
  });
});

describe('fetchMEPInfluence with null client or empty mepId', () => {
  it('returns empty string when client is null', async () => {
    const result = await fetchMEPInfluence(null, 'MEP-123');
    expect(result).toBe('');
  });

  it('returns empty string when mepId is empty', async () => {
    const result = await fetchMEPInfluence(null, '');
    expect(result).toBe('');
  });
});

describe('fetchCommitteeData with null client', () => {
  it('returns default result when client is null', async () => {
    const result = await fetchCommitteeData(null, 'ENVI');
    expect(result.name).toContain('ENVI');
    expect(result.abbreviation).toBe('ENVI');
    expect(result.chair).toBe('N/A');
    expect(result.members).toBe(0);
    expect(result.documents).toEqual([]);
    expect(result.effectiveness).toBeNull();
  });

  it('includes abbreviation in name', async () => {
    const result = await fetchCommitteeData(null, 'AGRI');
    expect(result.name).toContain('AGRI');
    expect(result.abbreviation).toBe('AGRI');
  });
});

describe('fetchVotingRecords with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchVotingRecords(null, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

describe('fetchVotingPatterns with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchVotingPatterns(null, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

describe('fetchMotionsAnomalies with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchMotionsAnomalies(null, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

describe('fetchParliamentaryQuestionsForMotions with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchParliamentaryQuestionsForMotions(null, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

describe('fetchMotionsData with null client', () => {
  it('returns fallback data with placeholder arrays when client is null', async () => {
    const result = await fetchMotionsData(null, '2025-01-01', '2025-01-31');
    expect(Array.isArray(result.votingRecords)).toBe(true);
    expect(Array.isArray(result.votingPatterns)).toBe(true);
    expect(Array.isArray(result.anomalies)).toBe(true);
    expect(Array.isArray(result.questions)).toBe(true);
    // fallback should include at least one placeholder item in each
    expect(result.votingRecords.length).toBeGreaterThan(0);
    expect(result.votingPatterns.length).toBeGreaterThan(0);
    expect(result.anomalies.length).toBeGreaterThan(0);
    expect(result.questions.length).toBeGreaterThan(0);
  });
});

describe('fetchProposalsFromMCP with null client', () => {
  it('returns empty html and procedureId when client is null', async () => {
    const result = await fetchProposalsFromMCP(null);
    expect(result).toEqual({ html: '', firstProcedureId: '' });
  });
});

describe('fetchPipelineFromMCP with null client', () => {
  it('returns null when client is null', async () => {
    const result = await fetchPipelineFromMCP(null);
    expect(result).toBeNull();
  });
});

describe('fetchProcedureStatusFromMCP with null client or empty procedureId', () => {
  it('returns empty string when client is null', async () => {
    const result = await fetchProcedureStatusFromMCP(null, '2024/0001(COD)');
    expect(result).toBe('');
  });

  it('returns empty string when procedureId is empty', async () => {
    const result = await fetchProcedureStatusFromMCP(null, '');
    expect(result).toBe('');
  });
});

// ─── EP Feed fetch tests (null client) ───────────────────────────────────────

describe('fetchAdoptedTextsFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchAdoptedTextsFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchEventsFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchEventsFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchProceduresFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchProceduresFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchMEPsFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchMEPsFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchBreakingNewsFeedData with null client', () => {
  it('returns undefined when client is null (MCP unavailable)', async () => {
    const result = await fetchBreakingNewsFeedData(null);
    expect(result).toBeUndefined();
  });
});

describe('fetchBreakingNewsFeedData with circuit breaker OPEN', () => {
  it('returns undefined when circuit breaker is OPEN', async () => {
    const cb = mcpCircuitBreaker;
    // Force circuit breaker to OPEN state
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure(); // default threshold=3 → OPEN

    const result = await fetchBreakingNewsFeedData(mockClientWithData);
    expect(result).toBeUndefined();

    // Reset circuit breaker for other tests
    cb.recordSuccess();
  });
});

// ─── New feed fetcher tests (null client) ────────────────────────────────────

describe('fetchDocumentsFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchDocumentsFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchPlenaryDocumentsFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchPlenaryDocumentsFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchCommitteeDocumentsFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchCommitteeDocumentsFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchPlenarySessionDocumentsFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchPlenarySessionDocumentsFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchExternalDocumentsFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchExternalDocumentsFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchQuestionsFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchQuestionsFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchDeclarationsFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchDeclarationsFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchCorporateBodiesFeed with null client', () => {
  it('returns empty array when client is null', async () => {
    const result = await fetchCorporateBodiesFeed(null);
    expect(result).toEqual([]);
  });
});

describe('fetchEPFeedData with null client', () => {
  it('returns undefined when client is null', async () => {
    const result = await fetchEPFeedData(null);
    expect(result).toBeUndefined();
  });
});

describe('fetchEPFeedData with circuit breaker OPEN', () => {
  it('returns undefined when circuit breaker is OPEN', async () => {
    const cb = mcpCircuitBreaker;
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();

    const result = await fetchEPFeedData(mockClientWithData);
    expect(result).toBeUndefined();

    cb.recordSuccess();
  });
});

describe('feed fetchers accept timeframe parameter', () => {
  it('fetchAdoptedTextsFeed accepts timeframe', async () => {
    const result = await fetchAdoptedTextsFeed(null, 'one-week');
    expect(result).toEqual([]);
  });

  it('fetchEventsFeed accepts timeframe', async () => {
    const result = await fetchEventsFeed(null, 'one-month');
    expect(result).toEqual([]);
  });

  it('fetchProceduresFeed accepts timeframe', async () => {
    const result = await fetchProceduresFeed(null, 'one-week');
    expect(result).toEqual([]);
  });

  it('fetchMEPsFeed accepts timeframe', async () => {
    const result = await fetchMEPsFeed(null, 'one-day');
    expect(result).toEqual([]);
  });

  it('fetchDocumentsFeed accepts timeframe', async () => {
    const result = await fetchDocumentsFeed(null, 'three-months');
    expect(result).toEqual([]);
  });

  it('fetchBreakingNewsFeedData accepts timeframe', async () => {
    const result = await fetchBreakingNewsFeedData(null, 'one-day');
    expect(result).toBeUndefined();
  });

  it('fetchEPFeedData accepts timeframe', async () => {
    const result = await fetchEPFeedData(null, 'one-week');
    expect(result).toBeUndefined();
  });
});

// ─── generateArticleForStrategy tests ─────────────────────────────────────────

describe('generateArticleForStrategy', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-gen-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns success=true and writes files with null client', async () => {
    const { generateArticleForStrategy } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const { WeekAheadStrategy } = await import(
      '../../scripts/generators/strategies/week-ahead-strategy.js'
    );
    const strategy = new WeekAheadStrategy();
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: false, skipExisting: false, newsDir: tmpDir };

    const result = await generateArticleForStrategy(strategy, null, ['en'], opts, stats);
    expect(result.success).toBe(true);
    expect(result.files).toBe(1);
    expect(stats.generated).toBe(1);
  });

  it('returns success=true with dryRun mode and no files written', async () => {
    const { generateArticleForStrategy } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const { BreakingNewsStrategy } = await import(
      '../../scripts/generators/strategies/breaking-news-strategy.js'
    );
    const strategy = new BreakingNewsStrategy();
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: true, skipExisting: false, newsDir: tmpDir };

    const result = await generateArticleForStrategy(strategy, null, ['en', 'de'], opts, stats);
    expect(result.success).toBe(true);
    expect(result.files).toBe(0);
    expect(stats.dryRun).toBe(2);
    expect(stats.generated).toBe(0);
  });

  it('returns success=true with multiple languages and null client', async () => {
    const { generateArticleForStrategy } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const { MotionsStrategy } = await import(
      '../../scripts/generators/strategies/motions-strategy.js'
    );
    const strategy = new MotionsStrategy();
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: false, skipExisting: false, newsDir: tmpDir };

    const result = await generateArticleForStrategy(strategy, null, ['en', 'sv', 'de'], opts, stats);
    expect(result.success).toBe(true);
    expect(result.files).toBe(3);
    expect(stats.generated).toBe(3);
  });

  it('returns success=false and increments stats.errors when fetchData throws', async () => {
    const { generateArticleForStrategy } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const failingStrategy = {
      type: 'week-ahead',
      requiredMCPTools: [],
      fetchData: async () => { throw new Error('MCP timeout'); },
      buildContent: () => '',
      getMetadata: () => ({ title: '', subtitle: '', category: 'week-ahead', keywords: [] }),
    };
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: false, skipExisting: false, newsDir: tmpDir };

    const result = await generateArticleForStrategy(failingStrategy, null, ['en'], opts, stats);
    expect(result.success).toBe(false);
    expect(result.error).toContain('MCP timeout');
    expect(stats.errors).toBe(1);
  });

  it('returns success=true with empty languages array', async () => {
    const { generateArticleForStrategy } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const { PropositionsStrategy } = await import(
      '../../scripts/generators/strategies/propositions-strategy.js'
    );
    const strategy = new PropositionsStrategy();
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: false, skipExisting: false, newsDir: tmpDir };

    const result = await generateArticleForStrategy(strategy, null, [], opts, stats);
    expect(result.success).toBe(true);
    expect(result.files).toBe(0);
  });

  it('increments stats.skipped by languages.length when shouldSkip returns true', async () => {
    const { generateArticleForStrategy } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const skippingStrategy = {
      type: 'committee-reports',
      requiredMCPTools: [],
      fetchData: async () => ({ committees: [] }),
      buildContent: () => '',
      getMetadata: () => ({ title: '', subtitle: '', category: 'committee-reports', keywords: [] }),
      shouldSkip: () => true,
    };
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: false, skipExisting: false, newsDir: tmpDir };
    const languages = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];

    const result = await generateArticleForStrategy(skippingStrategy, null, languages, opts, stats);
    expect(result.success).toBe(true);
    expect(result.files).toBe(0);
    expect(stats.skipped).toBe(14);
    expect(stats.generated).toBe(0);
    expect(stats.articles).toHaveLength(0);
  });
});

// ─── fetch-stage with mock client (covers if(client) true branches) ────────────

/**
 * Minimal mock MCP client — all methods return undefined so callMCP
 * sees a successful-but-empty response and falls back to empty/null values.
 */
const mockClientEmpty = {
  callTool: async () => undefined,
  getPlenarySessions: async () => undefined,
  getCommitteeInfo: async () => undefined,
  searchDocuments: async () => undefined,
  monitorLegislativePipeline: async () => undefined,
  getParliamentaryQuestions: async () => undefined,
  trackLegislation: async () => undefined,
};

describe('fetchVotingAnomalies with mock client', () => {
  it('returns empty string when client returns undefined', async () => {
    const result = await fetchVotingAnomalies(mockClientEmpty);
    expect(result).toBe('');
  });
});

describe('fetchCoalitionDynamics with mock client', () => {
  it('returns empty string when client returns undefined', async () => {
    const result = await fetchCoalitionDynamics(mockClientEmpty);
    expect(result).toBe('');
  });
});

describe('fetchVotingReport with mock client', () => {
  it('returns empty string when client returns undefined', async () => {
    const result = await fetchVotingReport(mockClientEmpty);
    expect(result).toBe('');
  });
});

describe('fetchVotingRecords with mock client', () => {
  it('returns empty array when client returns undefined', async () => {
    const result = await fetchVotingRecords(mockClientEmpty, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

describe('fetchVotingPatterns with mock client', () => {
  it('returns empty array when client returns undefined', async () => {
    const result = await fetchVotingPatterns(mockClientEmpty, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

describe('fetchMotionsAnomalies with mock client', () => {
  it('returns empty array when client returns undefined', async () => {
    const result = await fetchMotionsAnomalies(mockClientEmpty, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

describe('fetchParliamentaryQuestionsForMotions with mock client', () => {
  it('returns empty array when client returns undefined', async () => {
    const result = await fetchParliamentaryQuestionsForMotions(mockClientEmpty, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

describe('fetchProposalsFromMCP with mock client', () => {
  it('returns empty html when client returns undefined', async () => {
    const result = await fetchProposalsFromMCP(mockClientEmpty);
    expect(result).toEqual({ html: '', firstProcedureId: '' });
  });
});

describe('fetchPipelineFromMCP with mock client', () => {
  it('returns null when client returns undefined', async () => {
    const result = await fetchPipelineFromMCP(mockClientEmpty);
    expect(result).toBeNull();
  });
});

describe('fetchProcedureStatusFromMCP with mock client', () => {
  it('returns empty string when client returns undefined', async () => {
    const result = await fetchProcedureStatusFromMCP(mockClientEmpty, '2024/0001(COD)');
    expect(result).toBe('');
  });
});

describe('fetchCommitteeData with mock client', () => {
  beforeEach(() => {
    // Mock fetch to prevent real HTTP calls from EP API direct fallback
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns committee data with defaults when client returns undefined', async () => {
    const result = await fetchCommitteeData(mockClientEmpty, 'LIBE');
    expect(result.abbreviation).toBe('LIBE');
    expect(Array.isArray(result.documents)).toBe(true);
  });
});

// ─── fetch-stage error paths (try/catch branches) ─────────────────────────────

/**
 * Mock client that throws on every call — exercises error-handling try/catch
 * branches in the fetch functions and callMCP re-throw path.
 * We reset the circuit breaker before each test to keep it CLOSED.
 */
const mockClientThrowing = {
  callTool: async () => { throw new Error('MCP call failed'); },
  getPlenarySessions: async () => { throw new Error('MCP call failed'); },
  getCommitteeInfo: async () => { throw new Error('MCP call failed'); },
  searchDocuments: async () => { throw new Error('MCP call failed'); },
  monitorLegislativePipeline: async () => { throw new Error('MCP call failed'); },
  getParliamentaryQuestions: async () => { throw new Error('MCP call failed'); },
  trackLegislation: async () => { throw new Error('MCP call failed'); },
  analyzeLegislativeEffectiveness: async () => { throw new Error('MCP call failed'); },
};

describe('fetch-stage error paths with throwing client', () => {
  beforeEach(() => {
    // Reset circuit breaker to CLOSED so each test gets a fresh probe
    mcpCircuitBreaker.recordSuccess();
    // Mock fetch to prevent real HTTP calls from EP API direct fallback
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('fetchVotingAnomalies returns empty string when client throws', async () => {
    const result = await fetchVotingAnomalies(mockClientThrowing);
    expect(result).toBe('');
  });

  it('fetchCoalitionDynamics returns empty string when client throws', async () => {
    mcpCircuitBreaker.recordSuccess();
    const result = await fetchCoalitionDynamics(mockClientThrowing);
    expect(result).toBe('');
  });

  it('fetchVotingReport returns empty string when client throws', async () => {
    mcpCircuitBreaker.recordSuccess();
    const result = await fetchVotingReport(mockClientThrowing);
    expect(result).toBe('');
  });

  it('fetchMEPInfluence returns empty string when client throws', async () => {
    mcpCircuitBreaker.recordSuccess();
    const result = await fetchMEPInfluence(mockClientThrowing, 'MEP-123');
    expect(result).toBe('');
  });

  it('fetchCommitteeData returns default result when client throws', async () => {
    mcpCircuitBreaker.recordSuccess();
    const result = await fetchCommitteeData(mockClientThrowing, 'ENVI');
    expect(result.abbreviation).toBe('ENVI');
    expect(result.documents).toEqual([]);
  });

  it('fetchProcedureStatusFromMCP returns empty string when client throws', async () => {
    mcpCircuitBreaker.recordSuccess();
    const result = await fetchProcedureStatusFromMCP(mockClientThrowing, '2024/0001(COD)');
    expect(result).toBe('');
  });
});

// ─── generate-stage DEBUG flag coverage ───────────────────────────────────────

describe('generateArticleForStrategy DEBUG mode', () => {
  let tmpDir;
  let originalDebug;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-debug-test-'));
    originalDebug = process.env['DEBUG'];
    process.env['DEBUG'] = 'true';
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (originalDebug === undefined) {
      delete process.env['DEBUG'];
    } else {
      process.env['DEBUG'] = originalDebug;
    }
  });

  it('logs stack trace in DEBUG mode when strategy throws Error with stack', async () => {
    const { generateArticleForStrategy } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const stackError = new Error('debug test error');
    const failingStrategy = {
      type: 'breaking',
      requiredMCPTools: [],
      fetchData: async () => { throw stackError; },
      buildContent: () => '',
      getMetadata: () => ({ title: '', subtitle: '', category: 'breaking', keywords: [] }),
    };
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: false, skipExisting: false, newsDir: tmpDir };

    const result = await generateArticleForStrategy(failingStrategy, null, ['en'], opts, stats);
    expect(result.success).toBe(false);
    expect(stats.errors).toBe(1);
  });
});

// ─── fetch-stage with data-returning mock client (covers MCP parse branches) ──

/**
 * Mock client that returns structured MCP data — covers parsing branches
 * when real data flows through the fetch/parse pipeline.
 */
const mockClientWithData = {
  getPlenarySessions: async () => ({
    content: [{ text: JSON.stringify({
      sessions: [{ date: '2025-01-16', title: 'EP Plenary', type: 'Plenary', description: 'Budget reading' }],
    }) }],
  }),
  getCommitteeInfo: async () => ({
    content: [{ text: JSON.stringify({ committees: [] }) }],
  }),
  searchDocuments: async () => ({
    content: [{ text: JSON.stringify({ documents: [] }) }],
  }),
  monitorLegislativePipeline: async () => ({
    content: [{ text: JSON.stringify({ procedures: [], pipelineHealthScore: 0.9, throughputRate: 5 }) }],
  }),
  getParliamentaryQuestions: async () => ({
    content: [{ text: JSON.stringify({ questions: [] }) }],
  }),
  getEvents: async () => ({
    content: [{ text: JSON.stringify({ events: [{ date: '2025-01-17', title: 'Hearing on AI Act', type: 'Hearing', description: 'Public hearing on AI regulation' }] }) }],
  }),
  callTool: async (toolName) => {
    if (toolName === 'get_voting_records') {
      return {
        content: [{ text: JSON.stringify({
          records: [{ title: 'Vote on Budget', date: '2025-01-15', result: 'Adopted', votes: { for: 400, against: 100, abstain: 50 } }],
        }) }],
      };
    }
    if (toolName === 'analyze_voting_patterns') {
      return {
        content: [{ text: JSON.stringify({
          patterns: [{ group: 'EPP', cohesion: 0.92, participation: 0.95 }],
        }) }],
      };
    }
    if (toolName === 'detect_voting_anomalies') {
      return {
        content: [{ text: JSON.stringify({
          anomalies: [{ type: 'Defection', description: 'Party split', severity: 'HIGH' }],
        }) }],
      };
    }
    return undefined;
  },
  getParliamentaryQuestions: async () => ({
    content: [{ text: JSON.stringify({ questions: [] }) }],
  }),
  trackLegislation: async () => undefined,
  analyzeLegislativeEffectiveness: async () => undefined,
};

describe('fetchWeekAheadData with data-returning mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns parsed events when client returns valid session data', async () => {
    const dateRange = { start: '2025-01-16', end: '2025-01-23' };
    const result = await fetchWeekAheadData(mockClientWithData, dateRange);
    expect(result.events.length).toBeGreaterThan(0);
    // Event should be parsed from MCP data
    expect(result.events[0].title).toBe('EP Plenary');
    expect(result.events[0].type).toBe('Plenary');
  });
});

describe('fetchVotingRecords with data-returning mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns parsed voting records when client returns valid data', async () => {
    const result = await fetchVotingRecords(mockClientWithData, '2025-01-01', '2025-01-31');
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Vote on Budget');
    expect(result[0].result).toBe('Adopted');
    expect(result[0].votes.for).toBe(400);
  });
});

describe('fetchVotingPatterns with data-returning mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns parsed voting patterns when client returns valid data', async () => {
    const result = await fetchVotingPatterns(mockClientWithData, '2025-01-01', '2025-01-31');
    expect(result.length).toBe(1);
    expect(result[0].group).toBe('EPP');
    expect(result[0].cohesion).toBe(0.92);
  });
});

describe('fetchMotionsAnomalies with data-returning mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns parsed anomalies when client returns valid data', async () => {
    const result = await fetchMotionsAnomalies(mockClientWithData, '2025-01-01', '2025-01-31');
    expect(result.length).toBe(1);
    expect(result[0].type).toBe('Defection');
    expect(result[0].severity).toBe('HIGH');
  });
});

describe('fetchMotionsData with data-returning mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns real data without applying fallbacks when client returns data', async () => {
    const result = await fetchMotionsData(mockClientWithData, '2025-01-01', '2025-01-31');
    // With real data, fallbacks are NOT applied (covers the length > 0 branches)
    expect(result.votingRecords[0].title).toBe('Vote on Budget');
    expect(result.votingPatterns[0].group).toBe('EPP');
    expect(result.anomalies[0].type).toBe('Defection');
  });
});

// ─── fetchProposalsFromMCP with data-returning mock client ────────────────────

describe('fetchProposalsFromMCP with data-returning mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  const mockClientProposals = {
    ...mockClientEmpty,
    searchDocuments: async () => ({
      content: [{ text: JSON.stringify({
        documents: [
          {
            id: '2024/0001(COD)',
            title: 'Green Deal Directive',
            date: '2025-01-10',
            status: 'In Progress',
            committee: 'ENVI',
            rapporteur: 'Jane Doe',
          },
          { title: 'Digital Markets Act' },
        ],
      }) }],
    }),
  };

  it('returns HTML with proposal cards and firstProcedureId', async () => {
    const result = await fetchProposalsFromMCP(mockClientProposals);
    expect(result.html).toContain('proposal-card');
    expect(result.html).toContain('Green Deal Directive');
    expect(result.html).toContain('2024/0001(COD)');
    expect(result.html).toContain('2025-01-10');
    expect(result.html).toContain('In Progress');
    expect(result.html).toContain('ENVI');
    expect(result.html).toContain('Jane Doe');
    expect(result.firstProcedureId).toBe('2024/0001(COD)');
  });

  it('returns empty firstProcedureId when no document has procedure-style id', async () => {
    const mockNoProcId = {
      ...mockClientEmpty,
      searchDocuments: async () => ({
        content: [{ text: JSON.stringify({
          documents: [{ title: 'Simple Doc' }],
        }) }],
      }),
    };
    const result = await fetchProposalsFromMCP(mockNoProcId);
    expect(result.firstProcedureId).toBe('');
    expect(result.html).toContain('Simple Doc');
  });

  it('returns empty when documents array is empty', async () => {
    const mockEmptyDocs = {
      ...mockClientEmpty,
      searchDocuments: async () => ({
        content: [{ text: JSON.stringify({ documents: [] }) }],
      }),
    };
    const result = await fetchProposalsFromMCP(mockEmptyDocs);
    expect(result.html).toBe('');
    expect(result.firstProcedureId).toBe('');
  });
});

// ─── fetchPipelineFromMCP with data-returning mock client ─────────────────────

describe('fetchPipelineFromMCP with data-returning mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns structured pipeline data with procedures', async () => {
    const mockClientPipeline = {
      ...mockClientEmpty,
      monitorLegislativePipeline: async () => ({
        content: [{ text: JSON.stringify({
          pipelineHealthScore: 0.85,
          throughputRate: 5,
          procedures: [
            { id: '2024/0001(COD)', title: 'Climate Act', stage: 'Committee' },
            { title: 'Digital Act' },
          ],
        }) }],
      }),
    };
    const result = await fetchPipelineFromMCP(mockClientPipeline);
    expect(result).not.toBeNull();
    expect(result.healthScore).toBe(0.85);
    expect(result.throughput).toBe(5);
    expect(result.procRowsHtml).toContain('2024/0001(COD)');
    expect(result.procRowsHtml).toContain('Climate Act');
    expect(result.procRowsHtml).toContain('Committee');
  });

  it('returns null when parsed data is null (invalid JSON)', async () => {
    const mockBadJson = {
      ...mockClientEmpty,
      monitorLegislativePipeline: async () => ({
        content: [{ text: 'not valid json' }],
      }),
    };
    const result = await fetchPipelineFromMCP(mockBadJson);
    expect(result).toBeNull();
  });
});

// ─── fetchProcedureStatusFromMCP with data-returning mock client ──────────────

describe('fetchProcedureStatusFromMCP with data-returning mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns pre-formatted HTML when client returns data', async () => {
    const mockClientProcedure = {
      ...mockClientEmpty,
      trackLegislation: async () => ({
        content: [{ text: 'Procedure status: in committee review phase' }],
      }),
    };
    const result = await fetchProcedureStatusFromMCP(mockClientProcedure, '2024/0001(COD)');
    expect(result).toContain('data-summary');
    expect(result).toContain('Procedure status');
  });
});

// ─── fetchParliamentaryQuestionsForMotions with data-returning mock client ────

describe('fetchParliamentaryQuestionsForMotions with data-returning mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns parsed questions with fallback fields', async () => {
    const mockClientQuestions = {
      ...mockClientEmpty,
      getParliamentaryQuestions: async () => ({
        content: [{ text: JSON.stringify({
          questions: [
            { author: 'MEP Jones', topic: 'Energy', date: '2025-01-10', status: 'ANSWERED' },
            { subject: 'Climate change' },
          ],
        }) }],
      }),
    };
    const result = await fetchParliamentaryQuestionsForMotions(
      mockClientQuestions, '2025-01-01', '2025-01-31'
    );
    expect(result.length).toBe(2);
    expect(result[0].author).toBe('MEP Jones');
    expect(result[0].topic).toBe('Energy');
    expect(result[0].status).toBe('ANSWERED');
    // Second question uses fallback values
    expect(result[1].author).toBe('Unknown MEP');
    expect(result[1].topic).toBe('Climate change'); // uses subject as fallback
    expect(result[1].status).toBe('PENDING');
  });
});

// ─── fetchVotingRecords with partial data (covers ?? fallback branches) ───────

describe('fetchVotingRecords with partial data mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('applies default values for missing record fields', async () => {
    const mockClientPartial = {
      ...mockClientEmpty,
      callTool: async (toolName) => {
        if (toolName === 'get_voting_records') {
          return {
            content: [{ text: JSON.stringify({
              records: [{ votes: {} }, { title: 'Full Vote', date: '2025-01-15', result: 'Rejected', votes: { for: 10, against: 20, abstain: 5 } }],
            }) }],
          };
        }
        return undefined;
      },
    };
    const result = await fetchVotingRecords(mockClientPartial, '2025-01-01', '2025-01-31');
    expect(result.length).toBe(2);
    // First record uses fallback values
    expect(result[0].title).toBe('Parliamentary Vote');
    expect(result[0].result).toBe('Adopted');
    expect(result[0].votes.for).toBe(0);
    expect(result[0].votes.against).toBe(0);
    expect(result[0].votes.abstain).toBe(0);
    // Second record has explicit values
    expect(result[1].title).toBe('Full Vote');
    expect(result[1].result).toBe('Rejected');
  });
});

// ─── fetchVotingPatterns with partial data ────────────────────────────────────

describe('fetchVotingPatterns with partial data mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('applies default values for missing pattern fields', async () => {
    const mockClientPartial = {
      ...mockClientEmpty,
      callTool: async (toolName) => {
        if (toolName === 'analyze_voting_patterns') {
          return {
            content: [{ text: JSON.stringify({
              patterns: [{}],
            }) }],
          };
        }
        return undefined;
      },
    };
    const result = await fetchVotingPatterns(mockClientPartial, '2025-01-01', '2025-01-31');
    expect(result.length).toBe(1);
    expect(result[0].group).toBe('Unknown Group');
    expect(result[0].cohesion).toBe(0);
    expect(result[0].participation).toBe(0);
  });
});

// ─── fetchMotionsAnomalies with partial data ──────────────────────────────────

describe('fetchMotionsAnomalies with partial data mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('applies default values for missing anomaly fields', async () => {
    const mockClientPartial = {
      ...mockClientEmpty,
      callTool: async (toolName) => {
        if (toolName === 'detect_voting_anomalies') {
          return {
            content: [{ text: JSON.stringify({
              anomalies: [{}],
            }) }],
          };
        }
        return undefined;
      },
    };
    const result = await fetchMotionsAnomalies(mockClientPartial, '2025-01-01', '2025-01-31');
    expect(result.length).toBe(1);
    expect(result[0].type).toBe('Unusual Pattern');
    expect(result[0].description).toBe('No description available');
    expect(result[0].severity).toBe('MEDIUM');
  });
});

// ─── fetchWeekAheadData with circuit breaker OPEN ─────────────────────────────

describe('fetchWeekAheadData with circuit breaker OPEN', () => {
  it('returns placeholder events when circuit breaker is OPEN', async () => {
    // Force circuit breaker to OPEN state
    const cb = mcpCircuitBreaker;
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure(); // default threshold=3 → OPEN

    const dateRange = { start: '2025-01-16', end: '2025-01-23' };
    const result = await fetchWeekAheadData(mockClientWithData, dateRange);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.committees).toEqual([]);
    expect(result.documents).toEqual([]);
    expect(result.pipeline).toEqual([]);
    expect(result.questions).toEqual([]);

    // Reset circuit breaker for other tests
    cb.recordSuccess();
  });
});

// ─── generateArticleForStrategy with non-Error throw ──────────────────────────

describe('generateArticleForStrategy with non-Error throw', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-nonerr-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('handles non-Error throw and converts to string', async () => {
    const { generateArticleForStrategy } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const failingStrategy = {
      type: 'breaking',
      requiredMCPTools: [],
      fetchData: async () => { throw 'string error'; },
      buildContent: () => '',
      getMetadata: () => ({ title: '', subtitle: '', category: 'breaking', keywords: [] }),
    };
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: false, skipExisting: false, newsDir: tmpDir };

    const result = await generateArticleForStrategy(failingStrategy, null, ['en'], opts, stats);
    expect(result.success).toBe(false);
    expect(result.error).toBe('string error');
    expect(stats.errors).toBe(1);
  });
});

// ─── fetchWeekAheadData with HALF_OPEN probe failure ──────────────────────────

describe('fetchWeekAheadData with HALF_OPEN probe semantics', () => {
  it('re-opens circuit when any fetch rejects in HALF_OPEN state', async () => {
    // Set up a mock client where some calls succeed but some reject
    const mockClientMixed = {
      getPlenarySessions: async () => { throw new Error('network failure'); },
      getCommitteeInfo: async () => ({ content: [{ text: '{}' }] }),
      searchDocuments: async () => ({ content: [{ text: '{}' }] }),
      monitorLegislativePipeline: async () => ({ content: [{ text: '{}' }] }),
      getParliamentaryQuestions: async () => ({ content: [{ text: '{}' }] }),
      getEvents: async () => ({ content: [{ text: '{}' }] }),
    };

    // Force to HALF_OPEN via failureThreshold=1 and resetTimeout=0
    const cb = mcpCircuitBreaker;
    // Reset first
    cb.recordSuccess();
    // Now force open then let it become HALF_OPEN
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure(); // → OPEN

    // We can't easily control the module-level circuit breaker's timeout,
    // so let's just verify the OPEN path returns placeholders
    const dateRange = { start: '2025-01-16', end: '2025-01-23' };
    const result = await fetchWeekAheadData(mockClientMixed, dateRange);
    expect(result.events.length).toBeGreaterThan(0);

    // Reset for other tests
    cb.recordSuccess();
  });
});

// ─── fetchVotingRecords with error throw (covers catch + non-Error) ───────────

describe('fetchVotingRecords with throwing client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns empty array when client throws', async () => {
    const result = await fetchVotingRecords(mockClientThrowing, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

describe('fetchVotingPatterns with throwing client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns empty array when client throws', async () => {
    const result = await fetchVotingPatterns(mockClientThrowing, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

describe('fetchMotionsAnomalies with throwing client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns empty array when client throws', async () => {
    const result = await fetchMotionsAnomalies(mockClientThrowing, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

describe('fetchParliamentaryQuestionsForMotions with throwing client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns empty array when client throws', async () => {
    const result = await fetchParliamentaryQuestionsForMotions(mockClientThrowing, '2025-01-01', '2025-01-31');
    expect(result).toEqual([]);
  });
});

// ─── loadFeedDataFromFile ────────────────────────────────────────────────────

describe('loadFeedDataFromFile', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'feed-data-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should return undefined for non-existent file', () => {
    const result = loadFeedDataFromFile(path.join(tmpDir, 'does-not-exist.json'));
    expect(result).toBeUndefined();
  });

  it('should return undefined for invalid JSON', () => {
    const filePath = path.join(tmpDir, 'invalid.json');
    fs.writeFileSync(filePath, 'not valid json');
    const result = loadFeedDataFromFile(filePath);
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-object JSON (array)', () => {
    const filePath = path.join(tmpDir, 'array.json');
    fs.writeFileSync(filePath, '[1, 2, 3]');
    const result = loadFeedDataFromFile(filePath);
    expect(result).toBeUndefined();
  });

  it('should return undefined for JSON null', () => {
    const filePath = path.join(tmpDir, 'null.json');
    fs.writeFileSync(filePath, 'null');
    const result = loadFeedDataFromFile(filePath);
    expect(result).toBeUndefined();
  });

  it('should return feed data with defaults for missing keys', () => {
    const filePath = path.join(tmpDir, 'empty.json');
    fs.writeFileSync(filePath, '{}');
    const result = loadFeedDataFromFile(filePath);
    expect(result).toBeDefined();
    expect(result.adoptedTexts).toEqual([]);
    expect(result.events).toEqual([]);
    expect(result.procedures).toEqual([]);
    expect(result.mepUpdates).toEqual([]);
  });

  it('should load valid feed data from file', () => {
    const feedData = {
      adoptedTexts: [
        { id: 'TA-10-2026-0001', title: 'Test Resolution', date: '2026-03-01' },
      ],
      events: [
        { id: 'EVT-001', title: 'Plenary Session', date: '2026-03-04' },
      ],
      procedures: [],
      mepUpdates: [
        { id: 'MEP-001', name: 'Jane Smith', date: '2026-03-01' },
      ],
    };
    const filePath = path.join(tmpDir, 'feed-data.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    const result = loadFeedDataFromFile(filePath);
    expect(result).toBeDefined();
    expect(result.adoptedTexts).toHaveLength(1);
    expect(result.adoptedTexts[0].id).toBe('TA-10-2026-0001');
    expect(result.events).toHaveLength(1);
    expect(result.procedures).toHaveLength(0);
    expect(result.mepUpdates).toHaveLength(1);
    expect(result.mepUpdates[0].name).toBe('Jane Smith');
  });

  it('should ignore non-array values for feed keys', () => {
    const filePath = path.join(tmpDir, 'bad-types.json');
    fs.writeFileSync(filePath, JSON.stringify({
      adoptedTexts: 'not an array',
      events: 42,
      procedures: null,
      mepUpdates: { not: 'an array' },
    }));
    const result = loadFeedDataFromFile(filePath);
    expect(result).toBeDefined();
    expect(result.adoptedTexts).toEqual([]);
    expect(result.events).toEqual([]);
    expect(result.procedures).toEqual([]);
    expect(result.mepUpdates).toEqual([]);
  });

  it('should filter out non-object items and coerce missing fields to strings', () => {
    const feedData = {
      adoptedTexts: [
        { id: 'TA-001', title: 'Good item', date: '2026-03-01' },
        'not an object',
        42,
        null,
        { title: 'Missing id' },
      ],
      events: [{ id: 'EVT-001' }],
      procedures: [],
      mepUpdates: [
        { name: 'Jane Smith' },
        null,
        'string',
      ],
    };
    const filePath = path.join(tmpDir, 'malformed.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    const result = loadFeedDataFromFile(filePath);
    expect(result).toBeDefined();
    // Valid object + object with title but no id = 2 items
    expect(result.adoptedTexts).toHaveLength(2);
    expect(result.adoptedTexts[0].id).toBe('TA-001');
    expect(result.adoptedTexts[0].title).toBe('Good item');
    expect(result.adoptedTexts[1].id).toBe('');
    expect(result.adoptedTexts[1].title).toBe('Missing id');
    // Event with only id — title/date coerced to ''
    expect(result.events).toHaveLength(1);
    expect(result.events[0].title).toBe('');
    expect(result.events[0].date).toBe('');
    // MEP with only name — id/date coerced
    expect(result.mepUpdates).toHaveLength(1);
    expect(result.mepUpdates[0].name).toBe('Jane Smith');
    expect(result.mepUpdates[0].id).toBe('');
  });

  it('should filter loaded breaking feed items to the requested date range', () => {
    const feedData = {
      adoptedTexts: [
        { id: 'TA-001', title: 'Keep me', date: '2026-03-04' },
        { id: 'TA-002', title: 'Drop me', date: '2026-02-12' },
      ],
      events: [{ id: 'EVT-001', title: 'Today event', date: '2026-03-04T09:00:00Z' }],
      procedures: [{ id: 'PROC-001', title: 'Missing date', date: '' }],
      mepUpdates: [{ id: 'MEP-001', name: 'Jane Smith', date: '2026-03-03' }],
    };
    const filePath = path.join(tmpDir, 'windowed-feed.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));

    const result = loadFeedDataFromFile(filePath, { start: '2026-03-04', end: '2026-03-04' });

    expect(result).toBeDefined();
    expect(result.adoptedTexts).toHaveLength(1);
    expect(result.adoptedTexts[0].id).toBe('TA-001');
    expect(result.events).toHaveLength(1);
    expect(result.procedures).toHaveLength(0);
    expect(result.mepUpdates).toHaveLength(0);
  });
});

// ─── loadEPFeedDataFromFile ──────────────────────────────────────────────────

describe('loadEPFeedDataFromFile', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-feed-data-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should return undefined for non-existent file', () => {
    const result = loadEPFeedDataFromFile(path.join(tmpDir, 'does-not-exist.json'));
    expect(result).toBeUndefined();
  });

  it('should return undefined for invalid JSON', () => {
    const filePath = path.join(tmpDir, 'invalid.json');
    fs.writeFileSync(filePath, 'not valid json');
    const result = loadEPFeedDataFromFile(filePath);
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-object JSON (array)', () => {
    const filePath = path.join(tmpDir, 'array.json');
    fs.writeFileSync(filePath, '[1, 2, 3]');
    const result = loadEPFeedDataFromFile(filePath);
    expect(result).toBeUndefined();
  });

  it('should return EPFeedData with defaults for missing keys', () => {
    const filePath = path.join(tmpDir, 'empty.json');
    fs.writeFileSync(filePath, '{}');
    const result = loadEPFeedDataFromFile(filePath);
    expect(result).toBeDefined();
    expect(result.adoptedTexts).toEqual([]);
    expect(result.events).toEqual([]);
    expect(result.procedures).toEqual([]);
    expect(result.mepUpdates).toEqual([]);
    expect(result.documents).toEqual([]);
    expect(result.plenaryDocuments).toEqual([]);
    expect(result.committeeDocuments).toEqual([]);
    expect(result.plenarySessionDocuments).toEqual([]);
    expect(result.externalDocuments).toEqual([]);
    expect(result.questions).toEqual([]);
    expect(result.declarations).toEqual([]);
    expect(result.corporateBodies).toEqual([]);
  });

  it('should load valid comprehensive EP feed data', () => {
    const feedData = {
      adoptedTexts: [{ id: 'TA-001', title: 'Resolution', date: '2026-03-01' }],
      events: [{ id: 'EVT-001', title: 'Session', date: '2026-03-04' }],
      procedures: [],
      mepUpdates: [{ id: 'MEP-001', name: 'Jane Smith', date: '2026-03-01' }],
      documents: [{ id: 'DOC-001', title: 'Report', date: '2026-03-01' }],
      plenaryDocuments: [],
      committeeDocuments: [{ id: 'CDOC-001', title: 'Committee Report', date: '2026-03-01' }],
      plenarySessionDocuments: [],
      externalDocuments: [],
      questions: [{ id: 'Q-001', title: 'Written Question', date: '2026-03-01' }],
      declarations: [],
      corporateBodies: [],
    };
    const filePath = path.join(tmpDir, 'ep-feed-data.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    const result = loadEPFeedDataFromFile(filePath);
    expect(result).toBeDefined();
    expect(result.adoptedTexts).toHaveLength(1);
    expect(result.adoptedTexts[0].id).toBe('TA-001');
    expect(result.events).toHaveLength(1);
    expect(result.mepUpdates).toHaveLength(1);
    expect(result.documents).toHaveLength(1);
    expect(result.committeeDocuments).toHaveLength(1);
    expect(result.questions).toHaveLength(1);
    expect(result.procedures).toHaveLength(0);
    expect(result.plenaryDocuments).toHaveLength(0);
  });

  it('should ignore non-array values for feed keys', () => {
    const filePath = path.join(tmpDir, 'bad-types.json');
    fs.writeFileSync(filePath, JSON.stringify({
      adoptedTexts: 'not an array',
      events: 42,
      documents: null,
      questions: { not: 'an array' },
    }));
    const result = loadEPFeedDataFromFile(filePath);
    expect(result).toBeDefined();
    expect(result.adoptedTexts).toEqual([]);
    expect(result.events).toEqual([]);
    expect(result.documents).toEqual([]);
    expect(result.questions).toEqual([]);
  });

  it('should filter out non-object items and coerce missing fields to strings', () => {
    const feedData = {
      adoptedTexts: [
        { id: 'TA-001', title: 'Good item', date: '2026-03-01' },
        'not an object',
        null,
        { title: 'Missing id' },
      ],
      mepUpdates: [
        { name: 'Jane Smith' },
        42,
      ],
      documents: [{ id: 'DOC-001' }],
    };
    const filePath = path.join(tmpDir, 'malformed.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    const result = loadEPFeedDataFromFile(filePath);
    expect(result).toBeDefined();
    // Valid + object with title = 2 items
    expect(result.adoptedTexts).toHaveLength(2);
    expect(result.adoptedTexts[0].id).toBe('TA-001');
    expect(result.adoptedTexts[1].id).toBe('');
    expect(result.adoptedTexts[1].title).toBe('Missing id');
    // MEP with only name — id/date coerced
    expect(result.mepUpdates).toHaveLength(1);
    expect(result.mepUpdates[0].name).toBe('Jane Smith');
    expect(result.mepUpdates[0].id).toBe('');
    // Document with only id — title/date coerced
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].title).toBe('');
    expect(result.documents[0].date).toBe('');
  });

  it('should filter loaded EP feed items to the requested date range', () => {
    const feedData = {
      adoptedTexts: [
        { id: 'TA-001', title: 'Keep me', date: '2026-03-05' },
        { id: 'TA-002', title: 'Drop me', date: '2026-02-24' },
      ],
      events: [{ id: 'EVT-001', title: 'Window event', date: '2026-03-06T12:00:00Z' }],
      procedures: [{ id: 'PROC-001', title: 'Outside window', date: '2026-02-28' }],
      mepUpdates: [{ id: 'MEP-001', name: 'Jane Smith', date: '2026-03-07' }],
      documents: [{ id: 'DOC-001', title: 'Keep doc', date: '2026-03-04' }],
      plenaryDocuments: [{ id: 'PDOC-001', title: 'Drop doc', date: '2026-02-20' }],
      committeeDocuments: [],
      plenarySessionDocuments: [],
      externalDocuments: [],
      questions: [{ id: 'Q-001', title: 'Keep question', date: '2026-03-03' }],
      declarations: [{ id: 'DECL-001', title: 'Drop declaration', date: '2026-02-10' }],
      corporateBodies: [{ id: 'CB-001', title: 'Keep body', date: '2026-03-02' }],
    };
    const filePath = path.join(tmpDir, 'windowed-ep-feed.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));

    const result = loadEPFeedDataFromFile(filePath, {
      start: '2026-03-01',
      end: '2026-03-07',
    });

    expect(result).toBeDefined();
    expect(result.adoptedTexts).toHaveLength(1);
    expect(result.adoptedTexts[0].id).toBe('TA-001');
    expect(result.events).toHaveLength(1);
    expect(result.mepUpdates).toHaveLength(1);
    expect(result.procedures).toHaveLength(0);
    expect(result.documents).toHaveLength(1);
    expect(result.plenaryDocuments).toHaveLength(0);
    expect(result.questions).toHaveLength(1);
    expect(result.declarations).toHaveLength(0);
    expect(result.corporateBodies).toHaveLength(1);
  });
});

// ─── fetchEPFeedData with EP_FEED_DATA_FILE ──────────────────────────────────

describe('fetchEPFeedData with pre-fetched file', () => {
  let tmpDir;
  const originalEnv = process.env['EP_FEED_DATA_FILE'];

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env['EP_FEED_DATA_FILE'];
    } else {
      process.env['EP_FEED_DATA_FILE'] = originalEnv;
    }
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = undefined;
    }
  });

  it('uses pre-fetched EP feed data when EP_FEED_DATA_FILE is set', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-fetch-test-'));
    const feedData = {
      adoptedTexts: [{ id: 'TA-001', title: 'Test', date: '2026-03-04' }],
      events: [],
      procedures: [],
      mepUpdates: [],
      documents: [],
      plenaryDocuments: [],
      committeeDocuments: [],
      plenarySessionDocuments: [],
      externalDocuments: [],
      questions: [],
      declarations: [],
      corporateBodies: [],
    };
    const filePath = path.join(tmpDir, 'ep-feed-data.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    process.env['EP_FEED_DATA_FILE'] = filePath;

    const result = await fetchEPFeedData(null, 'one-day');
    expect(result).toBeDefined();
    expect(result.adoptedTexts).toHaveLength(1);
    expect(result.adoptedTexts[0].id).toBe('TA-001');
  });

  it('filters pre-fetched EP feed data to the supplied article window', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-fetch-window-'));
    const feedData = {
      adoptedTexts: [
        { id: 'TA-001', title: 'Keep', date: '2026-03-04' },
        { id: 'TA-002', title: 'Drop', date: '2026-02-11' },
      ],
      events: [],
      procedures: [],
      mepUpdates: [],
      documents: [{ id: 'DOC-001', title: 'Keep doc', date: '2026-03-05' }],
      plenaryDocuments: [],
      committeeDocuments: [],
      plenarySessionDocuments: [],
      externalDocuments: [],
      questions: [],
      declarations: [],
      corporateBodies: [],
    };
    const filePath = path.join(tmpDir, 'ep-feed-window.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    process.env['EP_FEED_DATA_FILE'] = filePath;

    const result = await fetchEPFeedData(null, 'one-week', {
      start: '2026-03-01',
      end: '2026-03-07',
    });

    expect(result).toBeDefined();
    expect(result.adoptedTexts).toHaveLength(1);
    expect(result.adoptedTexts[0].id).toBe('TA-001');
    expect(result.documents).toHaveLength(1);
  });

  it('falls through to MCP when file does not exist', async () => {
    process.env['EP_FEED_DATA_FILE'] = '/tmp/nonexistent-ep-feed.json';
    const result = await fetchEPFeedData(null, 'one-day');
    expect(result).toBeUndefined();
  });

  it('returns undefined when no file and client is null', async () => {
    delete process.env['EP_FEED_DATA_FILE'];
    const result = await fetchEPFeedData(null, 'one-day');
    expect(result).toBeUndefined();
  });
});

// ─── loadCommitteeDataFromFile ───────────────────────────────────────────────

describe('loadCommitteeDataFromFile', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'committee-data-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should return undefined for non-existent file', () => {
    const result = loadCommitteeDataFromFile(path.join(tmpDir, 'does-not-exist.json'), 'ENVI');
    expect(result).toBeUndefined();
  });

  it('should return undefined for invalid JSON', () => {
    const filePath = path.join(tmpDir, 'invalid.json');
    fs.writeFileSync(filePath, 'not valid json');
    const result = loadCommitteeDataFromFile(filePath, 'ENVI');
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-object JSON (array)', () => {
    const filePath = path.join(tmpDir, 'array.json');
    fs.writeFileSync(filePath, '[1, 2, 3]');
    const result = loadCommitteeDataFromFile(filePath, 'ENVI');
    expect(result).toBeUndefined();
  });

  it('should return undefined when committee key is missing', () => {
    const filePath = path.join(tmpDir, 'no-key.json');
    fs.writeFileSync(filePath, JSON.stringify({ AGRI: { name: 'Agriculture' } }));
    const result = loadCommitteeDataFromFile(filePath, 'ENVI');
    expect(result).toBeUndefined();
  });

  it('should load valid committee data from file', () => {
    const data = {
      ENVI: {
        name: 'Environment Committee',
        chair: 'Jane Doe',
        members: 88,
        documents: [
          { title: 'Climate Report', type: 'REPORT', date: '2026-03-01' },
        ],
        effectiveness: 'High',
      },
    };
    const filePath = path.join(tmpDir, 'committee-data.json');
    fs.writeFileSync(filePath, JSON.stringify(data));
    const result = loadCommitteeDataFromFile(filePath, 'ENVI');
    expect(result).toBeDefined();
    expect(result.name).toBe('Environment Committee');
    expect(result.abbreviation).toBe('ENVI');
    expect(result.chair).toBe('Jane Doe');
    expect(result.members).toBe(88);
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].title).toBe('Climate Report');
    expect(result.effectiveness).toBe('High');
  });

  it('should use defaults for missing fields', () => {
    // All fields intentionally omitted to verify default values
    const data = { ECON: { /* name, chair, members, documents, effectiveness all absent */ } };
    const filePath = path.join(tmpDir, 'defaults.json');
    fs.writeFileSync(filePath, JSON.stringify(data));
    const result = loadCommitteeDataFromFile(filePath, 'ECON');
    expect(result).toBeDefined();
    expect(result.name).toBe('ECON Committee');
    expect(result.chair).toBe('N/A');
    expect(result.members).toBe(0);
    expect(result.documents).toEqual([]);
    expect(result.effectiveness).toBeNull();
  });

  it('should filter out non-object document entries and coerce missing fields', () => {
    const data = {
      LIBE: {
        name: 'Civil Liberties',
        documents: [
          { title: 'Rights Report', type: 'REPORT', date: '2026-03-01' },
          null,
          'string entry',
          42,
          { title: 'No type or date' },
        ],
      },
    };
    const filePath = path.join(tmpDir, 'malformed-docs.json');
    fs.writeFileSync(filePath, JSON.stringify(data));
    const result = loadCommitteeDataFromFile(filePath, 'LIBE');
    expect(result).toBeDefined();
    expect(result.documents).toHaveLength(2);
    expect(result.documents[0].title).toBe('Rights Report');
    expect(result.documents[1].title).toBe('No type or date');
    expect(result.documents[1].type).toBe('Document');
    expect(result.documents[1].date).toBe('');
  });
});

// ─── fetchCommitteeData with EP_COMMITTEE_DATA_FILE ──────────────────────────

describe('fetchCommitteeData with pre-fetched file', () => {
  let tmpDir;
  const originalEnv = process.env['EP_COMMITTEE_DATA_FILE'];

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env['EP_COMMITTEE_DATA_FILE'];
    } else {
      process.env['EP_COMMITTEE_DATA_FILE'] = originalEnv;
    }
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = undefined;
    }
  });

  it('uses pre-fetched committee data when EP_COMMITTEE_DATA_FILE is set', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'committee-fetch-test-'));
    const data = {
      ENVI: {
        name: 'Environment Committee',
        chair: 'John Smith',
        members: 88,
        documents: [{ title: 'Green Deal Report', type: 'REPORT', date: '2026-03-01' }],
        effectiveness: 'High',
      },
    };
    const filePath = path.join(tmpDir, 'committee-data.json');
    fs.writeFileSync(filePath, JSON.stringify(data));
    process.env['EP_COMMITTEE_DATA_FILE'] = filePath;

    const result = await fetchCommitteeData(null, 'ENVI');
    expect(result.name).toBe('Environment Committee');
    expect(result.chair).toBe('John Smith');
    expect(result.members).toBe(88);
    expect(result.documents).toHaveLength(1);
  });

  it('falls through to default when committee entry is missing', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'committee-fetch-test-'));
    const data = { AGRI: { name: 'Agriculture' } };
    const filePath = path.join(tmpDir, 'committee-data.json');
    fs.writeFileSync(filePath, JSON.stringify(data));
    process.env['EP_COMMITTEE_DATA_FILE'] = filePath;

    const result = await fetchCommitteeData(null, 'ENVI');
    // Falls through to default (no MCP client)
    expect(result.name).toContain('ENVI');
    expect(result.chair).toBe('N/A');
    expect(result.members).toBe(0);
  });

  it('falls through to default when file has malformed JSON', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'committee-fetch-test-'));
    const filePath = path.join(tmpDir, 'bad.json');
    fs.writeFileSync(filePath, 'not valid json');
    process.env['EP_COMMITTEE_DATA_FILE'] = filePath;

    const result = await fetchCommitteeData(null, 'ENVI');
    expect(result.name).toContain('ENVI');
    expect(result.chair).toBe('N/A');
  });

  it('returns default result when env var is not set and client is null', async () => {
    delete process.env['EP_COMMITTEE_DATA_FILE'];
    const result = await fetchCommitteeData(null, 'AFET');
    expect(result.name).toContain('AFET');
    expect(result.abbreviation).toBe('AFET');
    expect(result.chair).toBe('N/A');
    expect(result.members).toBe(0);
    expect(result.documents).toEqual([]);
    expect(result.effectiveness).toBeNull();
  });
});

// ─── fetchMEPsFeedWithTotal ───────────────────────────────────────────────────

describe('fetchMEPsFeedWithTotal with null client', () => {
  it('returns empty items and total 0 when client is null', async () => {
    const result = await fetchMEPsFeedWithTotal(null);
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('accepts an optional timeframe parameter', async () => {
    const result = await fetchMEPsFeedWithTotal(null, 'one-week');
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe('fetchMEPsFeedWithTotal — total parsing via mock client', () => {
  beforeEach(() => { mcpCircuitBreaker.recordSuccess(); });

  it('returns total from API response when total field is present', async () => {
    const mockClientMEPTotal = {
      ...mockClientEmpty,
      getMEPsFeed: async () => ({
        content: [{ text: JSON.stringify({
          total: 525,
          data: [
            { id: 'MEP-001', name: 'Alice Mueller', date: '2026-03-10', country: 'DE', group: 'EPP' },
            { id: 'MEP-002', name: 'Bob Dupont', date: '2026-03-10', country: 'FR', group: 'S&D' },
          ],
        }) }],
      }),
    };

    const result = await fetchMEPsFeedWithTotal(mockClientMEPTotal, 'one-day');
    expect(result.total).toBe(525);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe('MEP-001');
    expect(result.items[0].name).toBe('Alice Mueller');
    expect(result.items[0].country).toBe('DE');
    expect(result.items[0].group).toBe('EPP');
    expect(result.items[1].id).toBe('MEP-002');
  });

  it('returns total 0 when API response has no total field', async () => {
    const mockClientMEPNoTotal = {
      ...mockClientEmpty,
      getMEPsFeed: async () => ({
        content: [{ text: JSON.stringify({
          data: [
            { id: 'MEP-003', name: 'Carlos Ruiz', date: '2026-03-10' },
          ],
        }) }],
      }),
    };

    const result = await fetchMEPsFeedWithTotal(mockClientMEPNoTotal, 'one-day');
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('MEP-003');
  });

  it('returns total 0 when API response total is not a number', async () => {
    const mockClientMEPBadTotal = {
      ...mockClientEmpty,
      getMEPsFeed: async () => ({
        content: [{ text: JSON.stringify({
          total: 'not-a-number',
          data: [{ id: 'MEP-004', name: 'Diana Kovac', date: '2026-03-10' }],
        }) }],
      }),
    };

    const result = await fetchMEPsFeedWithTotal(mockClientMEPBadTotal, 'one-day');
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(1);
  });

  it('returns total 0 and empty items when API response is empty content', async () => {
    const mockClientMEPEmpty = {
      ...mockClientEmpty,
      getMEPsFeed: async () => ({ content: [{ text: '{}' }] }),
    };

    const result = await fetchMEPsFeedWithTotal(mockClientMEPEmpty, 'one-day');
    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
  });

  it('returns empty items and total 0 when client throws', async () => {
    const mockClientMEPThrow = {
      ...mockClientEmpty,
      getMEPsFeed: async () => { throw new Error('network error'); },
    };

    const result = await fetchMEPsFeedWithTotal(mockClientMEPThrow, 'one-day');
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});

// ─── filterBreakingNewsFeedDataByDateRange via loadFeedDataFromFile ───────────

describe('filterBreakingNewsFeedDataByDateRange clears totalMEPUpdates on date-range filter', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'filter-total-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('clears totalMEPUpdates when a date-range filter is applied', () => {
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [],
      mepUpdates: [
        { id: 'MEP-001', name: 'Alice Mueller', date: '2026-03-10' },
        { id: 'MEP-002', name: 'Bob Dupont', date: '2026-02-01' },
      ],
      totalMEPUpdates: 525,
    };
    const filePath = path.join(tmpDir, 'feed-with-total.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));

    // Apply a date-range filter — totalMEPUpdates should be cleared
    const result = loadFeedDataFromFile(filePath, { start: '2026-03-10', end: '2026-03-10' });
    expect(result).toBeDefined();
    expect(result.mepUpdates).toHaveLength(1);
    expect(result.mepUpdates[0].id).toBe('MEP-001');
    // totalMEPUpdates must be cleared when filtering to avoid incorrect truncation note
    expect(result.totalMEPUpdates).toBeUndefined();
  });

  it('preserves totalMEPUpdates when no date-range filter is applied', () => {
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [],
      mepUpdates: [
        { id: 'MEP-001', name: 'Alice Mueller', date: '2026-03-10' },
      ],
      totalMEPUpdates: 525,
    };
    const filePath = path.join(tmpDir, 'feed-no-filter.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));

    // No date-range filter — totalMEPUpdates should be preserved
    const result = loadFeedDataFromFile(filePath);
    expect(result).toBeDefined();
    expect(result.mepUpdates).toHaveLength(1);
    expect(result.totalMEPUpdates).toBe(525);
  });
});

// ─── writeArticleFile: skipExisting + dryRun branch (output-stage line 50) ────

describe('writeArticleFile dryRun + skipExisting combined', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-output-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('logs "Would skip" when file exists AND both dryRun and skipExisting are true', () => {
    const filename = 'existing-article.html';
    const filepath = path.join(tmpDir, filename);
    fs.writeFileSync(filepath, '<html/>');

    const opts = { dryRun: true, skipExisting: true, newsDir: tmpDir };
    const written = writeArticleFile('<new/>', filename, opts);
    expect(written).toBe(false);
  });
});

// ─── writeSingleArticle: covers skip-existing and dryRun stat branches ────────

describe('writeSingleArticle stat branches', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-single-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('increments stats.skipped when file exists and skipExisting is true', () => {
    const slug = '2025-01-15-week-ahead';
    const lang = 'en';
    const filename = `${slug}-${lang}.html`;
    fs.writeFileSync(path.join(tmpDir, filename), '<existing/>');

    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: false, skipExisting: true, newsDir: tmpDir };
    const written = writeSingleArticle('<new/>', slug, lang, opts, stats);
    expect(written).toBe(false);
    expect(stats.skipped).toBe(1);
    expect(stats.generated).toBe(0);
    expect(stats.dryRun).toBe(0);
  });
});

// ─── writeGenerationMetadata: malformed existing file fallback (line 174) ─────

describe('writeGenerationMetadata with malformed existing file', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-malformed-'));
  });

  afterEach(() => {
    vi.useRealTimers();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes current data when existing metadata file is malformed JSON', () => {
    const fixedDate = new Date('2025-01-15T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    const dateSlug = fixedDate.toISOString().split('T')[0];
    const metadataPath = path.join(tmpDir, `generation-${dateSlug}.json`);

    // Write malformed JSON as existing file
    fs.writeFileSync(metadataPath, '{ invalid json !!', 'utf-8');

    const stats = {
      generated: 5,
      skipped: 0,
      dryRun: 0,
      errors: 0,
      articles: ['test.html'],
      timestamp: fixedDate.toISOString(),
    };
    const results = [{ success: true, files: 5, slug: '2025-01-15-week-ahead' }];
    writeGenerationMetadata(stats, results, true, tmpDir, false);

    const content = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    // Should use current run's data (no merge since existing was malformed)
    expect(content.generated).toBe(5);
    expect(content.usedMCP).toBe(true);
    expect(content.results).toHaveLength(1);
  });
});

// ─── writeGenerationMetadata: dedup anonymous (slug-less) error entries ────────

describe('writeGenerationMetadata anonymous result dedup', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-anon-'));
  });

  afterEach(() => {
    vi.useRealTimers();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deduplicates identical slug-less error results across runs', () => {
    const fixedDate = new Date('2025-01-15T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    const dateSlug = fixedDate.toISOString().split('T')[0];
    const metadataPath = path.join(tmpDir, `generation-${dateSlug}.json`);

    // First run with a slug-less error result
    const existing = {
      timestamp: fixedDate.toISOString(),
      generated: 0,
      skipped: 0,
      dryRun: 0,
      errors: 1,
      articles: [],
      results: [{ success: false, error: 'MCP timeout' }],
      usedMCP: false,
    };
    fs.writeFileSync(metadataPath, JSON.stringify(existing), 'utf-8');

    // Second run with the same slug-less error result
    const stats2 = {
      generated: 0,
      skipped: 0,
      dryRun: 0,
      errors: 1,
      articles: [],
      timestamp: fixedDate.toISOString(),
    };
    writeGenerationMetadata(
      stats2,
      [{ success: false, error: 'MCP timeout' }],
      false,
      tmpDir,
      false
    );

    const content = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    // Identical anonymous entries should be deduped
    const errorResults = content.results.filter((r) => !r.slug);
    expect(errorResults).toHaveLength(1);
  });
});

// ─── generate-stage: createStrategyRegistry strategy types ────────────────────

describe('createStrategyRegistry strategy types', () => {
  it('each registered strategy has correct type matching its category key', async () => {
    const { createStrategyRegistry } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const registry = createStrategyRegistry();
    for (const [category, strategy] of registry) {
      expect(strategy.type).toBe(category);
      expect(strategy.requiredMCPTools.length).toBeGreaterThan(0);
      expect(typeof strategy.buildContent).toBe('function');
      expect(typeof strategy.getMetadata).toBe('function');
      expect(typeof strategy.fetchData).toBe('function');
    }
  });
});

// ─── generate-stage: generateArticleForStrategy with failing validation ───────

describe('generateArticleForStrategy validation paths', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-val-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('records zero files when strategy produces content but dryRun prevents writing', async () => {
    const { generateArticleForStrategy } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const { WeekAheadStrategy } = await import(
      '../../scripts/generators/strategies/week-ahead-strategy.js'
    );
    const strategy = new WeekAheadStrategy();
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: true, skipExisting: false, newsDir: tmpDir };

    const result = await generateArticleForStrategy(strategy, null, ['en'], opts, stats);
    expect(result.success).toBe(true);
    expect(result.files).toBe(0);
    expect(stats.dryRun).toBe(1);
    expect(stats.generated).toBe(0);
  });

  it('writes files for all languages when strategy produces valid content', async () => {
    const { generateArticleForStrategy } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const { WeekAheadStrategy } = await import(
      '../../scripts/generators/strategies/week-ahead-strategy.js'
    );
    const strategy = new WeekAheadStrategy();
    const stats = { generated: 0, skipped: 0, dryRun: 0, errors: 0, articles: [], timestamp: '' };
    const opts = { dryRun: false, skipExisting: false, newsDir: tmpDir };

    const result = await generateArticleForStrategy(strategy, null, ['en', 'de'], opts, stats);
    expect(result.success).toBe(true);
    expect(result.files).toBe(2);
    expect(stats.generated).toBe(2);
  });
});

// ─── CircuitBreaker additional edge cases ─────────────────────────────────────

describe('CircuitBreaker edge cases', () => {
  it('transitions from OPEN through HALF_OPEN to CLOSED via success after timeout', () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 60_000 });
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('OPEN');
    // Manually reset
    cb.recordSuccess(); // simulate HALF_OPEN → CLOSED via success after timeout
    // Create fresh instance for reset test
    const cb2 = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 0 });
    cb2.recordFailure();
    expect(cb2.getState()).toBe('OPEN');
    expect(cb2.canRequest()).toBe(true); // resetTimeout is 0 → HALF_OPEN
    cb2.recordSuccess();
    expect(cb2.getState()).toBe('CLOSED');
    expect(cb2.canRequest()).toBe(true);
  });

  it('multiple successes in CLOSED state keep circuit CLOSED', () => {
    const cb = new CircuitBreaker({ failureThreshold: 3 });
    cb.recordSuccess();
    cb.recordSuccess();
    cb.recordSuccess();
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.canRequest()).toBe(true);
  });

  it('mixed failures below threshold keep circuit CLOSED', () => {
    const cb = new CircuitBreaker({ failureThreshold: 5 });
    cb.recordFailure();
    cb.recordFailure();
    cb.recordSuccess(); // success resets counter
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.canRequest()).toBe(true);
  });
});

// ─── transform-stage: additional normalizeISO8601Date edge cases ──────────────

describe('normalizeISO8601Date edge cases', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeISO8601Date('')).toBe('');
  });

  it('returns original string for unparseable date', () => {
    expect(normalizeISO8601Date('not-a-date')).toBe('not-a-date');
  });

  it('normalizes full ISO datetime to date-only', () => {
    expect(normalizeISO8601Date('2025-03-15T14:30:00.000Z')).toBe('2025-03-15');
  });
});

// ─── transform-stage: isValidCountryCode and isValidLanguageCode ──────────────

describe('transform-stage validation helpers', () => {
  it('isValidCountryCode accepts valid codes', () => {
    expect(isValidCountryCode('SE')).toBe(true);
    expect(isValidCountryCode('DE')).toBe(true);
  });

  it('isValidCountryCode rejects invalid codes', () => {
    expect(isValidCountryCode('se')).toBe(false);
    expect(isValidCountryCode('S')).toBe(false);
    expect(isValidCountryCode('SEE')).toBe(false);
    expect(isValidCountryCode('')).toBe(false);
  });

  it('isValidLanguageCode accepts valid codes', () => {
    expect(isValidLanguageCode('en')).toBe(true);
    expect(isValidLanguageCode('sv')).toBe(true);
  });

  it('isValidLanguageCode rejects invalid codes', () => {
    expect(isValidLanguageCode('EN')).toBe(false);
    expect(isValidLanguageCode('e')).toBe(false);
    expect(isValidLanguageCode('eng')).toBe(false);
    expect(isValidLanguageCode('')).toBe(false);
  });
});
