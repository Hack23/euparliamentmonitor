// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/manifest — schema-variant resolution,
 * gate-result history, file flattening, and filesystem reader semantics.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  resolveArticleType,
  resolveDate,
  resolveRunId,
  latestGateResult,
  flattenManifestFiles,
  readManifest,
  parseManifest,
  UNKNOWN_ARTICLE_TYPE,
} from '../../scripts/aggregator/manifest/index.js';

describe('resolveArticleType', () => {
  it('prefers canonical articleType when present', () => {
    expect(
      resolveArticleType({ articleType: 'breaking', articleTypes: ['week-ahead'], runType: 'motions' })
    ).toBe('breaking');
  });

  it('falls back to articleTypes[0] when articleType missing', () => {
    expect(resolveArticleType({ articleTypes: ['propositions'] })).toBe('propositions');
  });

  it('falls back to runType for very-legacy manifests', () => {
    expect(resolveArticleType({ runType: 'committee-reports' })).toBe('committee-reports');
  });

  it('returns "unknown" when every variant is missing', () => {
    expect(resolveArticleType({})).toBe(UNKNOWN_ARTICLE_TYPE);
  });

  it('returns "unknown" for empty strings', () => {
    expect(resolveArticleType({ articleType: '', articleTypes: [''], runType: '' })).toBe('unknown');
  });

  it('skips empty articleTypes[0] and falls through', () => {
    expect(resolveArticleType({ articleTypes: [''], runType: 'motions' })).toBe('motions');
  });
});

describe('resolveRunId', () => {
  it('uses string runId when present', () => {
    expect(resolveRunId({ runId: 'run181' }, 'fallback')).toBe('run181');
  });

  it('coerces numeric runId to string', () => {
    expect(resolveRunId({ runId: 42 }, 'fallback')).toBe('42');
  });

  it('uses fallback when runId missing', () => {
    expect(resolveRunId({}, 'breaking-run-test')).toBe('breaking-run-test');
  });

  it('uses fallback when runId is empty string', () => {
    expect(resolveRunId({ runId: '' }, 'fallback')).toBe('fallback');
  });
});

describe('resolveDate', () => {
  it('returns strict YYYY-MM-DD as-is', () => {
    expect(resolveDate({ date: '2026-04-27' })).toBe('2026-04-27');
  });

  it('returns undefined for non-ISO date', () => {
    expect(resolveDate({ date: '04/27/2026' })).toBeUndefined();
  });

  it('returns undefined for missing date', () => {
    expect(resolveDate({})).toBeUndefined();
  });

  it('returns undefined for partial ISO date', () => {
    expect(resolveDate({ date: '2026-04' })).toBeUndefined();
  });
});

describe('latestGateResult', () => {
  it('returns PENDING when history is missing', () => {
    expect(latestGateResult({})).toBe('PENDING');
  });

  it('returns PENDING when history is empty', () => {
    expect(latestGateResult({ history: [] })).toBe('PENDING');
  });

  it('returns the latest non-PENDING gateResult', () => {
    expect(
      latestGateResult({
        history: [{ gateResult: 'PASS' }, { gateResult: 'FAIL' }, { gateResult: 'PENDING' }],
      })
    ).toBe('FAIL');
  });

  it('skips PENDING entries searching from the end', () => {
    expect(
      latestGateResult({
        history: [{ gateResult: 'PASS' }, { gateResult: 'PENDING' }, { gateResult: 'PENDING' }],
      })
    ).toBe('PASS');
  });

  it('returns PENDING when every entry is PENDING', () => {
    expect(
      latestGateResult({
        history: [{ gateResult: 'PENDING' }, { gateResult: 'PENDING' }],
      })
    ).toBe('PENDING');
  });
});

describe('flattenManifestFiles', () => {
  it('returns [] when files is undefined', () => {
    expect(flattenManifestFiles(undefined)).toEqual([]);
  });

  it('flattens nested array values', () => {
    const result = flattenManifestFiles({
      intelligence: ['intelligence/synthesis-summary.md'],
      analysis: ['analysis/scenarios.md', 'analysis/risk.md'],
    });
    expect(result).toContain('intelligence/synthesis-summary.md');
    expect(result).toContain('analysis/scenarios.md');
    expect(result).toContain('analysis/risk.md');
  });

  it('extracts keys from path → description objects', () => {
    const result = flattenManifestFiles({
      'docs': { 'README.md': 'overview', 'CHANGELOG.md': 'history' },
    });
    expect(result).toEqual(expect.arrayContaining(['README.md', 'CHANGELOG.md']));
  });

  it('ignores unknown value shapes', () => {
    // numbers / nulls / strings as the value should not crash and yield no entries
    const files = { weird: 42, alsoWeird: null, stringy: 'oops' };
    expect(flattenManifestFiles(files)).toEqual([]);
  });

  it('filters non-string array entries', () => {
    const result = flattenManifestFiles({ x: [1, 'a.md', null, 'b.md'] });
    expect(result).toEqual(['a.md', 'b.md']);
  });
});

describe('parseManifest', () => {
  it('parses well-formed JSON', () => {
    const m = parseManifest('{"articleType":"breaking","date":"2026-04-27"}');
    expect(m?.articleType).toBe('breaking');
  });

  it('returns null on malformed JSON', () => {
    expect(parseManifest('{not json')).toBeNull();
  });

  it('returns null on empty input', () => {
    expect(parseManifest('')).toBeNull();
  });
});

describe('readManifest', () => {
  let tmp;
  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-test-'));
  });
  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('returns {manifest:null} when manifest.json is missing', () => {
    const result = readManifest(tmp);
    expect(result.manifest).toBeNull();
    expect(result.path).toBe(path.join(tmp, 'manifest.json'));
  });

  it('parses a valid manifest.json', () => {
    fs.writeFileSync(
      path.join(tmp, 'manifest.json'),
      JSON.stringify({ articleType: 'breaking', date: '2026-04-27', runId: 'run1' })
    );
    const result = readManifest(tmp);
    expect(result.manifest?.articleType).toBe('breaking');
  });

  it('returns null on malformed JSON without throwing', () => {
    fs.writeFileSync(path.join(tmp, 'manifest.json'), '{not valid json');
    const result = readManifest(tmp);
    expect(result.manifest).toBeNull();
  });

  it('handles legacy plural-articleTypes schema', () => {
    fs.writeFileSync(
      path.join(tmp, 'manifest.json'),
      JSON.stringify({ articleTypes: ['propositions'], date: '2026-04-06' })
    );
    const result = readManifest(tmp);
    expect(result.manifest).not.toBeNull();
    expect(resolveArticleType(result.manifest)).toBe('propositions');
  });

  it('handles very-legacy runType schema', () => {
    fs.writeFileSync(
      path.join(tmp, 'manifest.json'),
      JSON.stringify({ runType: 'breaking', date: '2026-04-17' })
    );
    const result = readManifest(tmp);
    expect(resolveArticleType(result.manifest)).toBe('breaking');
  });
});
