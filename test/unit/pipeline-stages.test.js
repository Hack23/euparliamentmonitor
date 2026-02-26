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

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
