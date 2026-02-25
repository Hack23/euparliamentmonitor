// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the pipeline stages:
 *   - CircuitBreaker (fetch-stage)
 *   - validateMCPResponse, normalizeISO8601Date, sanitizeText (transform-stage)
 *   - writeArticleFile, writeSingleArticle, writeGenerationMetadata (output-stage)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Imports from compiled output ────────────────────────────────────────────

import {
  CircuitBreaker,
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
  it('registers all five built-in article categories', async () => {
    const { createStrategyRegistry } = await import(
      '../../scripts/generators/pipeline/generate-stage.js'
    );
    const registry = createStrategyRegistry();
    expect(registry.size).toBe(5);
    expect(registry.has('week-ahead')).toBe(true);
    expect(registry.has('breaking')).toBe(true);
    expect(registry.has('committee-reports')).toBe(true);
    expect(registry.has('propositions')).toBe(true);
    expect(registry.has('motions')).toBe(true);
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
