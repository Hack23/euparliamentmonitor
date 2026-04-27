// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `Generators/PoliticalIntelligence/Data` —
 * `collectPoliticalIntelligenceData` and the underlying filesystem
 * scanners (`collectReferenceDocs`, `collectDocumentList`,
 * `collectDailyGroups`, `collectRunArtifacts`, `walkMarkdownFiles`).
 *
 * These tests use a temporary fixture tree to exercise the scanning
 * logic without depending on the real `analysis/` directory layout.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { collectPoliticalIntelligenceData } from '../../scripts/generators/political-intelligence/data.js';

describe('collectPoliticalIntelligenceData', () => {
  let tmpRoot;

  beforeAll(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-data-'));
    // analysis/methodologies/
    const methodDir = path.join(tmpRoot, 'analysis', 'methodologies');
    fs.mkdirSync(methodDir, { recursive: true });
    fs.writeFileSync(path.join(methodDir, 'README.md'), '# Methodologies Index\n', 'utf-8');
    fs.writeFileSync(path.join(methodDir, 'swot.md'), '# SWOT Analysis\n', 'utf-8');
    fs.writeFileSync(path.join(methodDir, 'pestle.md'), '# PESTLE Analysis\n', 'utf-8');
    fs.writeFileSync(path.join(methodDir, 'not-markdown.txt'), 'ignore me', 'utf-8');

    // analysis/templates/
    const tplDir = path.join(tmpRoot, 'analysis', 'templates');
    fs.mkdirSync(tplDir, { recursive: true });
    fs.writeFileSync(path.join(tplDir, 'risk-matrix.md'), '# Risk Matrix\n', 'utf-8');

    // analysis/reference/, analysis/imf/, analysis/worldbank/
    fs.mkdirSync(path.join(tmpRoot, 'analysis', 'reference'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpRoot, 'analysis', 'reference', 'isms-adaptation.md'),
      '# ISMS Adaptation\n',
      'utf-8'
    );
    fs.mkdirSync(path.join(tmpRoot, 'analysis', 'imf'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpRoot, 'analysis', 'imf', 'indicator-catalog.md'),
      '# IMF Indicators\n',
      'utf-8'
    );
    fs.mkdirSync(path.join(tmpRoot, 'analysis', 'worldbank'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpRoot, 'analysis', 'worldbank', 'indicator-catalog.md'),
      '# World Bank Indicators\n',
      'utf-8'
    );

    // analysis/daily/<date>/<run>/...
    const day1Run = path.join(tmpRoot, 'analysis', 'daily', '2026-04-25', 'breaking-run1');
    fs.mkdirSync(path.join(day1Run, 'intelligence'), { recursive: true });
    fs.writeFileSync(path.join(day1Run, 'manifest.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(day1Run, 'swot.md'), '# SWOT', 'utf-8');
    fs.writeFileSync(path.join(day1Run, 'intelligence', 'brief.md'), '# Brief', 'utf-8');

    const day2Run = path.join(tmpRoot, 'analysis', 'daily', '2026-04-20', 'motions-run2');
    fs.mkdirSync(day2Run, { recursive: true });
    fs.writeFileSync(path.join(day2Run, 'pestle.md'), '# PESTLE', 'utf-8');

    // Empty run directory (no .md) — should be skipped
    fs.mkdirSync(path.join(tmpRoot, 'analysis', 'daily', '2026-04-22', 'empty-run'), {
      recursive: true,
    });

    // Non-date-shaped directory — should be skipped
    fs.mkdirSync(path.join(tmpRoot, 'analysis', 'daily', 'README'), { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('collects methodologies with README first', () => {
    const data = collectPoliticalIntelligenceData(tmpRoot);
    expect(data.methodologies).toHaveLength(3);
    expect(data.methodologies[0].stem).toBe('README');
    expect(data.methodologies[1].stem).toBe('pestle');
    expect(data.methodologies[2].stem).toBe('swot');
    // Non-Markdown files are filtered out
    expect(data.methodologies.every((d) => !d.relPath.endsWith('.txt'))).toBe(true);
  });

  it('collects templates', () => {
    const data = collectPoliticalIntelligenceData(tmpRoot);
    expect(data.templates).toHaveLength(1);
    expect(data.templates[0].title).toBe('Risk Matrix');
  });

  it('collects reference docs from reference/imf/worldbank with source-prefixed stems', () => {
    const data = collectPoliticalIntelligenceData(tmpRoot);
    expect(data.referenceDocs).toHaveLength(3);
    const stems = data.referenceDocs.map((d) => d.stem);
    expect(stems).toContain('reference/isms-adaptation');
    expect(stems).toContain('imf/indicator-catalog');
    expect(stems).toContain('worldbank/indicator-catalog');
  });

  it('groups daily runs by date, newest first', () => {
    const data = collectPoliticalIntelligenceData(tmpRoot);
    expect(data.dailyGroups).toHaveLength(2);
    expect(data.dailyGroups[0].date).toBe('2026-04-25');
    expect(data.dailyGroups[1].date).toBe('2026-04-20');
  });

  it('skips empty run directories (no .md files)', () => {
    const data = collectPoliticalIntelligenceData(tmpRoot);
    const dates = data.dailyGroups.map((g) => g.date);
    // 2026-04-22 has only an empty run — must be filtered out entirely
    expect(dates).not.toContain('2026-04-22');
  });

  it('skips non-date-shaped subdirectories', () => {
    const data = collectPoliticalIntelligenceData(tmpRoot);
    const dates = data.dailyGroups.map((g) => g.date);
    expect(dates.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))).toBe(true);
  });

  it('counts artifacts recursively (includes subdirectories)', () => {
    const data = collectPoliticalIntelligenceData(tmpRoot);
    const day1 = data.dailyGroups.find((g) => g.date === '2026-04-25');
    expect(day1).toBeDefined();
    const run = day1.runs[0];
    expect(run.slug).toBe('breaking-run1');
    // swot.md + intelligence/brief.md = 2 (manifest.json is filtered)
    expect(run.artifactCount).toBe(2);
    expect(run.artifacts).toHaveLength(2);
    // shortPath uses POSIX separators
    const shortPaths = run.artifacts.map((a) => a.shortPath).sort();
    expect(shortPaths).toEqual(['intelligence/brief.md', 'swot.md']);
  });

  it('attaches an icon to every PIDocument and PIDailyRun', () => {
    const data = collectPoliticalIntelligenceData(tmpRoot);
    expect(data.methodologies.every((d) => typeof d.icon === 'string' && d.icon.length > 0)).toBe(
      true
    );
    expect(
      data.dailyGroups.every((g) => g.runs.every((r) => typeof r.icon === 'string' && r.icon.length > 0))
    ).toBe(true);
  });

  it('handles a missing analysis/ tree gracefully (returns empty arrays)', () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-empty-'));
    try {
      const data = collectPoliticalIntelligenceData(empty);
      expect(data.methodologies).toEqual([]);
      expect(data.templates).toEqual([]);
      expect(data.referenceDocs).toEqual([]);
      expect(data.dailyGroups).toEqual([]);
    } finally {
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });

  it('returns POSIX-style relative paths even on path-separator-flexible platforms', () => {
    const data = collectPoliticalIntelligenceData(tmpRoot);
    for (const doc of data.methodologies) {
      expect(doc.relPath).not.toContain('\\');
      expect(doc.relPath.startsWith('analysis/methodologies/')).toBe(true);
    }
  });
});
