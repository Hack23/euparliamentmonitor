// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/manifest/manifest-writer — `horizonProfile`
 * derivation against the canonical article-horizons registry, including the
 * `span` / `point` fallback to `forwardStatementsHorizonDays` and no-op
 * behaviour for legacy / unknown slugs.
 *
 * Also covers the {@link mergeManifestHistory} integration: after a history
 * merge the manifest on disk should carry the registry-derived
 * `horizonProfile` whenever its `articleType` is recognised.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  applyHorizonProfile,
  buildHorizonProfile,
} from '../../scripts/aggregator/manifest/index.js';
import { mergeManifestHistory } from '../../scripts/utils/file-utils.js';

describe('buildHorizonProfile', () => {
  it('derives horizonDays from dataWindow.days for forward horizons', () => {
    expect(buildHorizonProfile('week-ahead')).toEqual({
      horizonDays: 7,
      electoralOverlay: false,
    });
    expect(buildHorizonProfile('month-ahead')).toEqual({
      horizonDays: 30,
      electoralOverlay: false,
    });
    expect(buildHorizonProfile('quarter-ahead')).toEqual({
      horizonDays: 90,
      electoralOverlay: false,
    });
    expect(buildHorizonProfile('year-ahead')).toEqual({
      horizonDays: 365,
      electoralOverlay: false,
    });
  });

  it('derives horizonDays from dataWindow.days for backward horizons', () => {
    // week-in-review uses ADR-006 D-8→D-36 window (28 days backward).
    expect(buildHorizonProfile('week-in-review')).toEqual({
      horizonDays: 28,
      electoralOverlay: false,
    });
  });

  it('falls back to forwardStatementsHorizonDays for span direction', () => {
    // election-cycle: dataWindow.days=365 BUT direction='span' with
    // anchor='next-election' → fall back to forwardStatementsHorizonDays=1825.
    expect(buildHorizonProfile('election-cycle')).toEqual({
      horizonDays: 1825,
      electoralOverlay: true,
    });
  });

  it('marks electoralOverlay=true for term-outlook and election-cycle', () => {
    expect(buildHorizonProfile('term-outlook')?.electoralOverlay).toBe(true);
    expect(buildHorizonProfile('election-cycle')?.electoralOverlay).toBe(true);
  });

  it('falls back to forwardStatementsHorizonDays for point direction (breaking)', () => {
    // breaking: direction='point', no days, forwardStatementsHorizonDays=0.
    expect(buildHorizonProfile('breaking')).toEqual({
      horizonDays: 0,
      electoralOverlay: false,
    });
  });

  it('returns undefined for legacy / unknown slugs', () => {
    expect(buildHorizonProfile('legacy-mystery-type')).toBeUndefined();
    expect(buildHorizonProfile('unknown')).toBeUndefined();
    expect(buildHorizonProfile('')).toBeUndefined();
    expect(buildHorizonProfile(undefined)).toBeUndefined();
  });

  it('returns a frozen object so callers cannot mutate registry-derived state', () => {
    const profile = buildHorizonProfile('month-ahead');
    expect(Object.isFrozen(profile)).toBe(true);
  });
});

describe('applyHorizonProfile', () => {
  it('attaches horizonProfile derived from articleType (canonical schema)', () => {
    const manifest = { articleType: 'month-ahead', date: '2026-04-22' };
    const result = applyHorizonProfile(manifest);
    expect(result.horizonProfile).toEqual({ horizonDays: 30, electoralOverlay: false });
    // input is not mutated
    expect(manifest.horizonProfile).toBeUndefined();
  });

  it('resolves articleType from the historic articleTypes[] schema variant', () => {
    const manifest = { articleTypes: ['election-cycle'] };
    const result = applyHorizonProfile(manifest);
    expect(result.horizonProfile).toEqual({ horizonDays: 1825, electoralOverlay: true });
  });

  it('resolves articleType from the very-legacy runType field', () => {
    const manifest = { runType: 'week-ahead' };
    const result = applyHorizonProfile(manifest);
    expect(result.horizonProfile).toEqual({ horizonDays: 7, electoralOverlay: false });
  });

  it('is a no-op for legacy / unknown slugs', () => {
    const manifest = { articleType: 'legacy-mystery-type' };
    const result = applyHorizonProfile(manifest);
    expect(result.horizonProfile).toBeUndefined();
    expect(result).toBe(manifest);
  });

  it('is a no-op when no articleType variant is present', () => {
    const manifest = { date: '2026-04-22' };
    const result = applyHorizonProfile(manifest);
    expect(result.horizonProfile).toBeUndefined();
    expect(result).toBe(manifest);
  });

  it('preserves an existing horizonProfile by default', () => {
    const existing = { horizonDays: 99, electoralOverlay: false };
    const manifest = { articleType: 'month-ahead', horizonProfile: existing };
    const result = applyHorizonProfile(manifest);
    expect(result.horizonProfile).toBe(existing);
  });

  it('overwrites an existing horizonProfile when overwrite=true', () => {
    const manifest = {
      articleType: 'month-ahead',
      horizonProfile: { horizonDays: 99, electoralOverlay: false },
    };
    const result = applyHorizonProfile(manifest, { overwrite: true });
    expect(result.horizonProfile).toEqual({ horizonDays: 30, electoralOverlay: false });
  });

  it('strips a stale horizonProfile when overwrite=true and slug is unknown', () => {
    const manifest = {
      articleType: 'legacy-removed-slug',
      horizonProfile: { horizonDays: 999, electoralOverlay: true },
    };
    const result = applyHorizonProfile(manifest, { overwrite: true });
    expect(result).not.toBe(manifest);
    expect('horizonProfile' in result).toBe(false);
    // input is not mutated
    expect(manifest.horizonProfile).toEqual({ horizonDays: 999, electoralOverlay: true });
  });

  it('keeps a stale horizonProfile when overwrite=false (default forward-compat)', () => {
    const stale = { horizonDays: 999, electoralOverlay: true };
    const manifest = { articleType: 'legacy-removed-slug', horizonProfile: stale };
    const result = applyHorizonProfile(manifest);
    expect(result).toBe(manifest);
    expect(result.horizonProfile).toBe(stale);
  });
});

describe('mergeManifestHistory — horizonProfile enrichment', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-writer-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('populates horizonProfile for month-ahead (horizonDays=30, electoralOverlay=false)', () => {
    const manifestPath = path.join(tempDir, 'manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ articleType: 'month-ahead', date: '2026-04-22' })
    );
    mergeManifestHistory(manifestPath, {
      runId: 'run-1',
      startedAt: '2026-04-22T10:00:00Z',
      finishedAt: '2026-04-22T10:30:00Z',
      gateResult: 'GREEN',
      filesWritten: [],
    });
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(parsed.horizonProfile).toEqual({ horizonDays: 30, electoralOverlay: false });
  });

  it('populates horizonProfile for election-cycle with electoralOverlay=true', () => {
    const manifestPath = path.join(tempDir, 'manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ articleType: 'election-cycle', date: '2029-06-01' })
    );
    mergeManifestHistory(manifestPath, {
      runId: 'run-1',
      startedAt: '2029-06-01T08:00:00Z',
      finishedAt: '2029-06-01T08:45:00Z',
      gateResult: 'GREEN',
      filesWritten: [],
    });
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(parsed.horizonProfile.electoralOverlay).toBe(true);
    expect(parsed.horizonProfile.horizonDays).toBe(1825);
  });

  it('omits horizonProfile for legacy / unknown slugs', () => {
    const manifestPath = path.join(tempDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify({ articleType: 'legacy-mystery' }));
    mergeManifestHistory(manifestPath, {
      runId: 'run-1',
      startedAt: '2026-04-22T10:00:00Z',
      finishedAt: '2026-04-22T10:30:00Z',
      gateResult: 'PENDING',
      filesWritten: [],
    });
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(parsed.horizonProfile).toBeUndefined();
    // top-level fields preserved
    expect(parsed.articleType).toBe('legacy-mystery');
    expect(parsed.history).toHaveLength(1);
  });

  it('strips a stale horizonProfile when the slug becomes unknown', () => {
    const manifestPath = path.join(tempDir, 'manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        articleType: 'legacy-removed-slug',
        // Stale value from before the slug was removed from the registry.
        horizonProfile: { horizonDays: 999, electoralOverlay: true },
      })
    );
    mergeManifestHistory(manifestPath, {
      runId: 'run-1',
      startedAt: '2026-04-22T10:00:00Z',
      finishedAt: '2026-04-22T10:30:00Z',
      gateResult: 'PENDING',
      filesWritten: [],
    });
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    // Stale profile must be gone — invariant: absent for unknown slugs.
    expect('horizonProfile' in parsed).toBe(false);
    expect(parsed.articleType).toBe('legacy-removed-slug');
  });

  it('refreshes a stale horizonProfile on subsequent merges (overwrite semantics)', () => {
    const manifestPath = path.join(tempDir, 'manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        articleType: 'week-ahead',
        // Stale value from a previous registry version.
        horizonProfile: { horizonDays: 999, electoralOverlay: true },
      })
    );
    mergeManifestHistory(manifestPath, {
      runId: 'run-1',
      startedAt: '2026-04-22T10:00:00Z',
      finishedAt: '2026-04-22T10:30:00Z',
      gateResult: 'GREEN',
      filesWritten: [],
    });
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(parsed.horizonProfile).toEqual({ horizonDays: 7, electoralOverlay: false });
  });
});
